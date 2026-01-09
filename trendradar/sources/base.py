# coding=utf-8
"""
数据源基类定义

定义所有数据源的统一接口和数据模型。
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum


class SourceType(str, Enum):
    """数据源类型枚举"""
    RSS = "rss"
    WEB = "web"
    TWITTER = "twitter"


@dataclass
class SourceConfig:
    """
    数据源配置
    
    统一的配置模型，适用于所有类型的数据源。
    """
    id: str                          # 唯一标识符
    name: str                        # 显示名称
    type: SourceType                 # 数据源类型
    enabled: bool = True             # 是否启用
    url: str = ""                    # URL (RSS/Web)
    username: str = ""               # 用户名 (Twitter)
    selector: str = ""               # CSS 选择器 (Web)
    schedule: str = "0 * * * *"      # Cron 表达式，默认每小时
    retention_days: int = 30         # 数据保留天数
    max_items: int = 50              # 单次最大抓取数量
    use_proxy: bool = False          # 是否使用代理
    extra: Dict[str, Any] = field(default_factory=dict)  # 额外配置
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['type'] = self.type.value
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SourceConfig":
        """从字典创建配置"""
        data = data.copy()
        if isinstance(data.get('type'), str):
            data['type'] = SourceType(data['type'])
        return cls(**data)


@dataclass
class Article:
    """
    文章数据模型
    
    所有数据源抓取的内容都会转换为此统一格式。
    """
    title: str                       # 标题
    url: str                         # 原始链接
    source_id: str                   # 数据源 ID
    source_name: str                 # 数据源名称
    source_type: SourceType          # 数据源类型
    published_at: Optional[str] = None  # 发布时间
    author: Optional[str] = None     # 作者
    summary: Optional[str] = None    # 摘要/简介
    content: Optional[str] = None    # 全文内容
    image_url: Optional[str] = None  # 封面图片
    extra: Dict[str, Any] = field(default_factory=dict)  # 额外数据
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        data = asdict(self)
        data['source_type'] = self.source_type.value
        return data


class DataSource(ABC):
    """
    数据源抽象基类
    
    所有具体的数据源实现都必须继承此类并实现 fetch() 方法。
    """
    
    def __init__(self, config: SourceConfig):
        """
        初始化数据源
        
        Args:
            config: 数据源配置
        """
        self.config = config
        self._session = None
    
    @property
    def source_id(self) -> str:
        """获取数据源 ID"""
        return self.config.id
    
    @property
    def source_name(self) -> str:
        """获取数据源名称"""
        return self.config.name
    
    @property
    def source_type(self) -> SourceType:
        """获取数据源类型"""
        return self.config.type
    
    @property
    def is_enabled(self) -> bool:
        """检查数据源是否启用"""
        return self.config.enabled
    
    @abstractmethod
    def fetch(self) -> List[Article]:
        """
        抓取数据
        
        子类必须实现此方法，从数据源获取文章列表。
        
        Returns:
            Article 对象列表
        """
        pass
    
    def validate_config(self) -> bool:
        """
        验证配置是否有效
        
        子类可以重写此方法以添加特定的验证逻辑。
        
        Returns:
            配置是否有效
        """
        return bool(self.config.id and self.config.name)
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.source_id}, name={self.source_name})>"
