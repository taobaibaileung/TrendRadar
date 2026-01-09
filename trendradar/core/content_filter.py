# coding=utf-8
"""
内容过滤器

提供多层内容过滤机制，确保信息流的精准性。
"""

import re
import json
from pathlib import Path
from typing import List, Set, Optional, Dict, Any
from dataclasses import dataclass, field


@dataclass
class FilterConfig:
    """
    过滤器配置
    """
    # 关键词黑名单
    keyword_blacklist: List[str] = field(default_factory=list)
    
    # 分类黑名单（AI 分析后的分类）
    category_blacklist: List[str] = field(default_factory=lambda: [
        "娱乐", "八卦", "明星", "综艺", "体育", "游戏", "irrelevant"
    ])
    
    # 来源黑名单（数据源 ID）
    source_blacklist: List[str] = field(default_factory=list)
    
    # 最小内容长度
    min_content_length: int = 100
    
    # 最低重要性评分（1-10）
    min_importance: int = 0
    
    # 是否启用 AI 预过滤
    enable_ai_prefilter: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "keyword_blacklist": self.keyword_blacklist,
            "category_blacklist": self.category_blacklist,
            "source_blacklist": self.source_blacklist,
            "min_content_length": self.min_content_length,
            "min_importance": self.min_importance,
            "enable_ai_prefilter": self.enable_ai_prefilter,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FilterConfig":
        """从字典创建配置"""
        return cls(
            keyword_blacklist=data.get("keyword_blacklist", []),
            category_blacklist=data.get("category_blacklist", [
                "娱乐", "八卦", "明星", "综艺", "体育", "游戏", "irrelevant"
            ]),
            source_blacklist=data.get("source_blacklist", []),
            min_content_length=data.get("min_content_length", 100),
            min_importance=data.get("min_importance", 0),
            enable_ai_prefilter=data.get("enable_ai_prefilter", True),
        )


class ContentFilter:
    """
    内容过滤器
    
    提供多层过滤：
    1. 关键词黑名单过滤（标题/摘要）
    2. 分类过滤（AI 分析后）
    3. 来源过滤
    4. 内容长度过滤
    5. 重要性评分过滤
    """
    
    def __init__(self, config: FilterConfig = None, config_path: str = None):
        """
        初始化内容过滤器
        
        Args:
            config: 过滤器配置
            config_path: 配置文件路径
        """
        if config:
            self.config = config
        elif config_path:
            self.config = self._load_config(config_path)
        else:
            self.config = FilterConfig()
        
        # 编译关键词正则表达式（提高匹配效率）
        self._keyword_patterns: List[re.Pattern] = []
        self._compile_patterns()
    
    def _load_config(self, config_path: str) -> FilterConfig:
        """从文件加载配置"""
        path = Path(config_path)
        if not path.exists():
            return FilterConfig()
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return FilterConfig.from_dict(data.get("filter", {}))
        except Exception as e:
            print(f"[ContentFilter] 加载配置失败: {e}")
            return FilterConfig()
    
    def _compile_patterns(self) -> None:
        """编译关键词正则表达式"""
        self._keyword_patterns = []
        for keyword in self.config.keyword_blacklist:
            try:
                # 使用词边界匹配，避免误匹配
                pattern = re.compile(re.escape(keyword), re.IGNORECASE)
                self._keyword_patterns.append(pattern)
            except re.error:
                print(f"[ContentFilter] 无效的关键词模式: {keyword}")
    
    def update_config(self, config: FilterConfig) -> None:
        """更新配置"""
        self.config = config
        self._compile_patterns()
    
    def add_keyword(self, keyword: str) -> None:
        """添加黑名单关键词"""
        if keyword and keyword not in self.config.keyword_blacklist:
            self.config.keyword_blacklist.append(keyword)
            self._compile_patterns()
    
    def remove_keyword(self, keyword: str) -> None:
        """移除黑名单关键词"""
        if keyword in self.config.keyword_blacklist:
            self.config.keyword_blacklist.remove(keyword)
            self._compile_patterns()
    
    def check_keywords(self, text: str) -> bool:
        """
        检查文本是否包含黑名单关键词
        
        Args:
            text: 要检查的文本
            
        Returns:
            True 表示通过（不包含黑名单词），False 表示应过滤
        """
        if not text or not self._keyword_patterns:
            return True
        
        for pattern in self._keyword_patterns:
            if pattern.search(text):
                return False
        
        return True
    
    def check_category(self, category: str) -> bool:
        """
        检查分类是否在黑名单中
        
        Args:
            category: 文章分类
            
        Returns:
            True 表示通过，False 表示应过滤
        """
        if not category:
            return True
        
        category_lower = category.lower().strip()
        for blacklisted in self.config.category_blacklist:
            if blacklisted.lower() in category_lower:
                return False
        
        return True
    
    def check_source(self, source_id: str) -> bool:
        """
        检查来源是否在黑名单中
        
        Args:
            source_id: 数据源 ID
            
        Returns:
            True 表示通过，False 表示应过滤
        """
        return source_id not in self.config.source_blacklist
    
    def check_content_length(self, content: str) -> bool:
        """
        检查内容长度是否满足要求
        
        Args:
            content: 文章内容
            
        Returns:
            True 表示通过，False 表示应过滤
        """
        if not content:
            return self.config.min_content_length == 0
        return len(content) >= self.config.min_content_length
    
    def check_importance(self, importance: int) -> bool:
        """
        检查重要性评分是否满足要求
        
        Args:
            importance: 重要性评分 (1-10)
            
        Returns:
            True 表示通过，False 表示应过滤
        """
        return importance >= self.config.min_importance
    
    def filter_article_pre_analysis(
        self,
        title: str,
        summary: str = "",
        source_id: str = "",
        content: str = ""
    ) -> bool:
        """
        AI 分析前的预过滤
        
        在调用 AI 之前进行快速过滤，节省 API 调用。
        
        Args:
            title: 文章标题
            summary: 文章摘要
            source_id: 数据源 ID
            content: 文章内容
            
        Returns:
            True 表示通过，可以进行 AI 分析；False 表示应过滤
        """
        # 1. 检查来源
        if not self.check_source(source_id):
            return False
        
        # 2. 检查标题关键词
        if not self.check_keywords(title):
            return False
        
        # 3. 检查摘要关键词
        if summary and not self.check_keywords(summary):
            return False
        
        # 4. 检查内容长度
        if not self.check_content_length(content):
            return False
        
        return True
    
    def filter_article_post_analysis(
        self,
        category: str,
        importance: int,
        tags: List[str] = None
    ) -> bool:
        """
        AI 分析后的过滤
        
        根据 AI 分析结果进行过滤。
        
        Args:
            category: AI 分析的分类
            importance: AI 分析的重要性评分
            tags: AI 分析的标签列表
            
        Returns:
            True 表示通过，False 表示应过滤
        """
        # 1. 检查分类
        if not self.check_category(category):
            return False
        
        # 2. 检查重要性
        if not self.check_importance(importance):
            return False
        
        # 3. 检查标签中是否有黑名单关键词
        if tags:
            for tag in tags:
                if not self.check_keywords(tag):
                    return False
        
        return True
    
    def get_ai_filter_prompt(self) -> str:
        """
        获取用于 AI 分析的过滤指令
        
        这段文本会被添加到 AI 分析的 Prompt 中。
        
        Returns:
            过滤指令字符串
        """
        categories = ", ".join(self.config.category_blacklist[:5])
        
        prompt = f"""
**内容过滤要求:**
请首先判断本文是否属于财经、科技、商业、国际关系、地缘政治或其他严肃新闻范畴。
如果文章内容主要涉及以下类别：{categories}，或者是名人轶事、社会八卦等娱乐性内容，
请直接在返回的 JSON 中将 `category` 字段设为 `irrelevant`，其他字段可以简化处理。
只有当文章具有实质性的信息价值时，才进行详细分析。
"""
        return prompt.strip()


# 全局过滤器实例（可选）
_global_filter: Optional[ContentFilter] = None


def get_content_filter(config_path: str = None) -> ContentFilter:
    """
    获取内容过滤器实例
    
    Args:
        config_path: 配置文件路径
        
    Returns:
        ContentFilter 实例
    """
    global _global_filter
    
    if _global_filter is None:
        _global_filter = ContentFilter(config_path=config_path)
    
    return _global_filter
