# coding=utf-8
"""
数据源模块

提供统一的数据源接口，支持 RSS、网站爬取和 Twitter 等多种数据源类型。
"""

from .base import DataSource, SourceConfig, Article
from .rss_source import RSSSource
from .web_source import WebSource
from .twitter_source import TwitterSource
from .manager import SourceManager

__all__ = [
    "DataSource",
    "SourceConfig",
    "Article",
    "RSSSource",
    "WebSource",
    "TwitterSource",
    "SourceManager",
]
