# coding=utf-8
"""
Twitter/X 数据源实现

从 X (原 Twitter) 获取指定账号的推文。

注意：由于 Twitter API 的限制和变化，此实现提供了多种获取方式：
1. 官方 API v2（需要 Bearer Token）
2. Nitter 实例（开源的 Twitter 前端，无需认证）
3. RSSHub 实例（将 Twitter 转换为 RSS）
"""

import time
import random
from typing import List, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from .base import DataSource, SourceConfig, Article, SourceType


class TwitterSource(DataSource):
    """
    Twitter/X 数据源
    
    支持多种获取方式，优先使用 Nitter 或 RSSHub 以避免 API 限制。
    """
    
    # 公开的 Nitter 实例列表（可能会变化）
    NITTER_INSTANCES = [
        "https://nitter.net",
        "https://nitter.privacydev.net",
        "https://nitter.poast.org",
    ]
    
    # RSSHub 实例
    RSSHUB_INSTANCES = [
        "https://rsshub.app",
    ]
    
    def __init__(self, config: SourceConfig, timeout: int = 15, proxy_url: str = ""):
        """
        初始化 Twitter 数据源
        
        Args:
            config: 数据源配置
            timeout: 请求超时时间（秒）
            proxy_url: 代理服务器 URL
        """
        super().__init__(config)
        self.timeout = timeout
        self.proxy_url = proxy_url
        self._session = self._create_session()
        
        # 从 extra 配置中获取特定设置
        self.bearer_token = config.extra.get("bearer_token", "")
        self.nitter_instance = config.extra.get("nitter_instance", "")
        self.rsshub_instance = config.extra.get("rsshub_instance", "")
        self.fetch_method = config.extra.get("fetch_method", "auto")  # auto, nitter, rsshub, api
    
    def _create_session(self) -> requests.Session:
        """创建 HTTP 会话"""
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        })
        
        if self.config.use_proxy and self.proxy_url:
            session.proxies = {
                "http": self.proxy_url,
                "https": self.proxy_url,
            }
        
        return session
    
    def validate_config(self) -> bool:
        """验证 Twitter 配置"""
        if not super().validate_config():
            return False
        return bool(self.config.username)
    
    def _fetch_via_nitter(self, instance: str) -> List[Article]:
        """
        通过 Nitter 实例获取推文
        
        Args:
            instance: Nitter 实例 URL
            
        Returns:
            Article 对象列表
        """
        url = f"{instance}/{self.config.username}"
        
        try:
            response = self._session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            articles = []
            
            # Nitter 的推文容器
            tweets = soup.select(".timeline-item")
            
            for tweet in tweets[:self.config.max_items]:
                # 获取推文内容
                content_elem = tweet.select_one(".tweet-content")
                if not content_elem:
                    continue
                
                content = content_elem.get_text(strip=True)
                
                # 获取推文链接
                link_elem = tweet.select_one(".tweet-link")
                tweet_url = ""
                if link_elem:
                    tweet_path = link_elem.get("href", "")
                    # 转换为 Twitter 原始链接
                    tweet_url = f"https://twitter.com{tweet_path}"
                
                # 获取时间
                time_elem = tweet.select_one(".tweet-date a")
                published_at = ""
                if time_elem:
                    published_at = time_elem.get("title", "")
                
                # 使用内容的前50个字符作为标题
                title = content[:50] + "..." if len(content) > 50 else content
                
                article = Article(
                    title=title,
                    url=tweet_url,
                    source_id=self.source_id,
                    source_name=self.source_name,
                    source_type=SourceType.TWITTER,
                    published_at=published_at,
                    author=self.config.username,
                    content=content,
                )
                articles.append(article)
            
            return articles
            
        except Exception as e:
            print(f"[Twitter] Nitter 获取失败 ({instance}): {e}")
            return []
    
    def _fetch_via_rsshub(self, instance: str) -> List[Article]:
        """
        通过 RSSHub 获取推文（转换为 RSS 格式）
        
        Args:
            instance: RSSHub 实例 URL
            
        Returns:
            Article 对象列表
        """
        url = f"{instance}/twitter/user/{self.config.username}"
        
        try:
            response = self._session.get(url, timeout=self.timeout)
            response.raise_for_status()
            
            # 使用 RSS 解析器
            from trendradar.crawler.rss.parser import RSSParser
            parser = RSSParser()
            parsed_items = parser.parse(response.text, url)
            
            articles = []
            for item in parsed_items[:self.config.max_items]:
                article = Article(
                    title=item.title,
                    url=item.url,
                    source_id=self.source_id,
                    source_name=self.source_name,
                    source_type=SourceType.TWITTER,
                    published_at=item.published_at or "",
                    author=self.config.username,
                    summary=item.summary or "",
                    content=item.summary,  # RSS 中的 summary 通常包含完整内容
                )
                articles.append(article)
            
            return articles
            
        except Exception as e:
            print(f"[Twitter] RSSHub 获取失败 ({instance}): {e}")
            return []
    
    def _fetch_via_api(self) -> List[Article]:
        """
        通过 Twitter API v2 获取推文
        
        需要配置 bearer_token。
        
        Returns:
            Article 对象列表
        """
        if not self.bearer_token:
            print(f"[Twitter] {self.source_name}: 未配置 Bearer Token，无法使用 API")
            return []
        
        # Twitter API v2 端点
        # 首先需要获取用户 ID
        user_url = f"https://api.twitter.com/2/users/by/username/{self.config.username}"
        
        headers = {
            "Authorization": f"Bearer {self.bearer_token}",
        }
        
        try:
            # 获取用户 ID
            user_response = self._session.get(user_url, headers=headers, timeout=self.timeout)
            user_response.raise_for_status()
            user_data = user_response.json()
            user_id = user_data.get("data", {}).get("id")
            
            if not user_id:
                print(f"[Twitter] {self.source_name}: 无法获取用户 ID")
                return []
            
            # 获取推文
            tweets_url = f"https://api.twitter.com/2/users/{user_id}/tweets"
            params = {
                "max_results": min(self.config.max_items, 100),
                "tweet.fields": "created_at,text,author_id",
            }
            
            tweets_response = self._session.get(
                tweets_url, headers=headers, params=params, timeout=self.timeout
            )
            tweets_response.raise_for_status()
            tweets_data = tweets_response.json()
            
            articles = []
            for tweet in tweets_data.get("data", []):
                content = tweet.get("text", "")
                title = content[:50] + "..." if len(content) > 50 else content
                tweet_id = tweet.get("id", "")
                
                article = Article(
                    title=title,
                    url=f"https://twitter.com/{self.config.username}/status/{tweet_id}",
                    source_id=self.source_id,
                    source_name=self.source_name,
                    source_type=SourceType.TWITTER,
                    published_at=tweet.get("created_at", ""),
                    author=self.config.username,
                    content=content,
                )
                articles.append(article)
            
            return articles
            
        except Exception as e:
            print(f"[Twitter] API 获取失败: {e}")
            return []
    
    def fetch(self) -> List[Article]:
        """
        抓取 Twitter 推文
        
        根据配置的 fetch_method 选择获取方式。
        
        Returns:
            Article 对象列表
        """
        if not self.validate_config():
            print(f"[Twitter] {self.source_name}: 配置无效（需要 username），跳过")
            return []
        
        articles = []
        
        # 根据配置选择获取方式
        if self.fetch_method == "api" and self.bearer_token:
            articles = self._fetch_via_api()
        elif self.fetch_method == "nitter":
            instance = self.nitter_instance or self.NITTER_INSTANCES[0]
            articles = self._fetch_via_nitter(instance)
        elif self.fetch_method == "rsshub":
            instance = self.rsshub_instance or self.RSSHUB_INSTANCES[0]
            articles = self._fetch_via_rsshub(instance)
        else:
            # auto 模式：依次尝试各种方式
            # 1. 首先尝试 RSSHub（最稳定）
            for instance in self.RSSHUB_INSTANCES:
                articles = self._fetch_via_rsshub(instance)
                if articles:
                    break
            
            # 2. 如果 RSSHub 失败，尝试 Nitter
            if not articles:
                for instance in self.NITTER_INSTANCES:
                    articles = self._fetch_via_nitter(instance)
                    if articles:
                        break
            
            # 3. 最后尝试官方 API
            if not articles and self.bearer_token:
                articles = self._fetch_via_api()
        
        if articles:
            print(f"[Twitter] {self.source_name} (@{self.config.username}): 获取 {len(articles)} 条推文")
        else:
            print(f"[Twitter] {self.source_name} (@{self.config.username}): 获取失败")
        
        return articles
