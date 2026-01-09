# coding=utf-8
"""
网站爬取数据源实现

从指定网站页面抓取文章链接和内容。
"""

import time
import random
from typing import List, Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from .base import DataSource, SourceConfig, Article, SourceType


class WebSource(DataSource):
    """
    网站爬取数据源
    
    通过 CSS 选择器从网页中提取文章链接，并抓取内容。
    """
    
    def __init__(self, config: SourceConfig, timeout: int = 15, proxy_url: str = ""):
        """
        初始化网站数据源
        
        Args:
            config: 数据源配置
            timeout: 请求超时时间（秒）
            proxy_url: 代理服务器 URL
        """
        super().__init__(config)
        self.timeout = timeout
        self.proxy_url = proxy_url
        self._session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """创建 HTTP 会话"""
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        })
        
        if self.config.use_proxy and self.proxy_url:
            session.proxies = {
                "http": self.proxy_url,
                "https": self.proxy_url,
            }
        
        return session
    
    def validate_config(self) -> bool:
        """验证网站配置"""
        if not super().validate_config():
            return False
        return bool(self.config.url and self.config.selector)
    
    def _extract_links(self, html: str, base_url: str) -> List[dict]:
        """
        从 HTML 中提取文章链接
        
        Args:
            html: HTML 内容
            base_url: 基础 URL，用于处理相对链接
            
        Returns:
            包含 title 和 url 的字典列表
        """
        soup = BeautifulSoup(html, "html.parser")
        links = []
        seen_urls = set()
        
        # 使用配置的 CSS 选择器查找元素
        elements = soup.select(self.config.selector)
        
        for element in elements:
            # 尝试获取链接
            link = None
            title = None
            
            # 如果元素本身是 <a> 标签
            if element.name == "a":
                link = element.get("href")
                title = element.get_text(strip=True)
            else:
                # 尝试在元素内部查找 <a> 标签
                a_tag = element.find("a")
                if a_tag:
                    link = a_tag.get("href")
                    title = a_tag.get_text(strip=True)
                else:
                    # 尝试从元素本身获取文本作为标题
                    title = element.get_text(strip=True)
            
            if not link or not title:
                continue
            
            # 处理相对链接
            full_url = urljoin(base_url, link)
            
            # 去重
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)
            
            links.append({
                "title": title,
                "url": full_url,
            })
        
        return links
    
    def _fetch_article_content(self, url: str) -> Optional[str]:
        """
        抓取单篇文章的内容
        
        Args:
            url: 文章 URL
            
        Returns:
            文章正文内容，失败返回 None
        """
        try:
            response = self._session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # 移除脚本和样式
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # 尝试常见的正文选择器
            content_selectors = [
                "article",
                ".article-content",
                ".post-content",
                ".entry-content",
                ".content",
                "main",
                "#content",
            ]
            
            for selector in content_selectors:
                content_element = soup.select_one(selector)
                if content_element:
                    text = content_element.get_text(separator="\n", strip=True)
                    if len(text) > 100:  # 确保内容足够长
                        return text
            
            # 如果没有找到，返回 body 内容
            body = soup.find("body")
            if body:
                return body.get_text(separator="\n", strip=True)[:5000]
            
            return None
            
        except Exception as e:
            print(f"[Web] 抓取文章内容失败 {url}: {e}")
            return None
    
    def fetch(self) -> List[Article]:
        """
        抓取网站文章
        
        Returns:
            Article 对象列表
        """
        if not self.validate_config():
            print(f"[Web] {self.source_name}: 配置无效（需要 url 和 selector），跳过")
            return []
        
        try:
            # 首先获取列表页
            response = self._session.get(self.config.url, timeout=self.timeout)
            response.raise_for_status()
            
            # 提取文章链接
            links = self._extract_links(response.text, self.config.url)
            
            # 限制数量
            if self.config.max_items > 0:
                links = links[:self.config.max_items]
            
            print(f"[Web] {self.source_name}: 发现 {len(links)} 个链接")
            
            # 转换为 Article 对象
            articles = []
            for link_info in links:
                # 添加随机延迟，避免请求过快
                time.sleep(random.uniform(0.5, 1.5))
                
                # 尝试获取文章内容
                content = self._fetch_article_content(link_info["url"])
                
                article = Article(
                    title=link_info["title"],
                    url=link_info["url"],
                    source_id=self.source_id,
                    source_name=self.source_name,
                    source_type=SourceType.WEB,
                    content=content,
                )
                articles.append(article)
            
            print(f"[Web] {self.source_name}: 成功获取 {len(articles)} 篇文章")
            return articles
            
        except requests.Timeout:
            print(f"[Web] {self.source_name}: 请求超时 ({self.timeout}s)")
            return []
        except requests.RequestException as e:
            print(f"[Web] {self.source_name}: 请求失败 - {e}")
            return []
        except Exception as e:
            print(f"[Web] {self.source_name}: 未知错误 - {e}")
            return []
