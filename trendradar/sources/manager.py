# coding=utf-8
"""
数据源管理器

负责数据源配置的加载、保存和动态管理。
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Type
from datetime import datetime

from .base import DataSource, SourceConfig, SourceType, Article
from .rss_source import RSSSource
from .web_source import WebSource
from .twitter_source import TwitterSource


class SourceManager:
    """
    数据源管理器
    
    负责：
    - 加载和保存数据源配置
    - 创建和管理数据源实例
    - 提供 CRUD 操作接口
    """
    
    # 数据源类型到实现类的映射
    SOURCE_CLASSES: Dict[SourceType, Type[DataSource]] = {
        SourceType.RSS: RSSSource,
        SourceType.WEB: WebSource,
        SourceType.TWITTER: TwitterSource,
    }
    
    def __init__(self, config_path: str = None, proxy_url: str = ""):
        """
        初始化数据源管理器
        
        Args:
            config_path: 配置文件路径，默认为 config/sources.json
            proxy_url: 全局代理 URL
        """
        if config_path is None:
            # 默认配置文件路径
            project_root = Path(__file__).parent.parent.parent
            config_path = project_root / "config" / "sources.json"
        
        self.config_path = Path(config_path)
        self.proxy_url = proxy_url
        self._sources: Dict[str, SourceConfig] = {}
        self._instances: Dict[str, DataSource] = {}
        
        # 加载配置
        self._load_config()
    
    def _load_config(self) -> None:
        """从文件加载数据源配置"""
        if not self.config_path.exists():
            print(f"[SourceManager] 配置文件不存在，将创建默认配置: {self.config_path}")
            self._create_default_config()
            return
        
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            sources_data = data.get("sources", [])
            for source_data in sources_data:
                try:
                    config = SourceConfig.from_dict(source_data)
                    self._sources[config.id] = config
                except Exception as e:
                    print(f"[SourceManager] 加载数据源配置失败: {e}")
            
            print(f"[SourceManager] 已加载 {len(self._sources)} 个数据源配置")
            
        except json.JSONDecodeError as e:
            print(f"[SourceManager] 配置文件格式错误: {e}")
        except Exception as e:
            print(f"[SourceManager] 加载配置失败: {e}")
    
    def _create_default_config(self) -> None:
        """创建默认配置文件"""
        default_sources = [
            {
                "id": "hacker-news",
                "name": "Hacker News",
                "type": "rss",
                "enabled": True,
                "url": "https://hnrss.org/frontpage",
                "schedule": "0 * * * *",
                "retention_days": 7,
                "max_items": 30,
            },
            {
                "id": "ruanyifeng",
                "name": "阮一峰的网络日志",
                "type": "rss",
                "enabled": True,
                "url": "http://www.ruanyifeng.com/blog/atom.xml",
                "schedule": "0 */6 * * *",
                "retention_days": 30,
                "max_items": 20,
            },
        ]
        
        # 确保目录存在
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 保存默认配置
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump({"sources": default_sources}, f, ensure_ascii=False, indent=2)
        
        # 加载默认配置
        for source_data in default_sources:
            config = SourceConfig.from_dict(source_data)
            self._sources[config.id] = config
        
        print(f"[SourceManager] 已创建默认配置文件: {self.config_path}")
    
    def _save_config(self) -> bool:
        """保存配置到文件"""
        try:
            sources_data = [config.to_dict() for config in self._sources.values()]
            
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump({"sources": sources_data}, f, ensure_ascii=False, indent=2)
            
            print(f"[SourceManager] 配置已保存: {self.config_path}")
            return True
            
        except Exception as e:
            print(f"[SourceManager] 保存配置失败: {e}")
            return False
    
    def _create_instance(self, config: SourceConfig) -> Optional[DataSource]:
        """
        根据配置创建数据源实例
        
        Args:
            config: 数据源配置
            
        Returns:
            DataSource 实例，失败返回 None
        """
        source_class = self.SOURCE_CLASSES.get(config.type)
        if not source_class:
            print(f"[SourceManager] 不支持的数据源类型: {config.type}")
            return None
        
        try:
            instance = source_class(config, proxy_url=self.proxy_url)
            return instance
        except Exception as e:
            print(f"[SourceManager] 创建数据源实例失败 [{config.id}]: {e}")
            return None
    
    # ========== CRUD 操作 ==========
    
    def list_sources(self) -> List[SourceConfig]:
        """获取所有数据源配置列表"""
        return list(self._sources.values())
    
    def get_source(self, source_id: str) -> Optional[SourceConfig]:
        """
        获取指定数据源配置
        
        Args:
            source_id: 数据源 ID
            
        Returns:
            SourceConfig 对象，不存在返回 None
        """
        return self._sources.get(source_id)
    
    def add_source(self, config: SourceConfig) -> bool:
        """
        添加新数据源
        
        Args:
            config: 数据源配置
            
        Returns:
            是否添加成功
        """
        if config.id in self._sources:
            print(f"[SourceManager] 数据源已存在: {config.id}")
            return False
        
        self._sources[config.id] = config
        
        # 清除可能存在的旧实例
        if config.id in self._instances:
            del self._instances[config.id]
        
        return self._save_config()
    
    def update_source(self, source_id: str, config: SourceConfig) -> bool:
        """
        更新数据源配置
        
        Args:
            source_id: 要更新的数据源 ID
            config: 新的配置
            
        Returns:
            是否更新成功
        """
        if source_id not in self._sources:
            print(f"[SourceManager] 数据源不存在: {source_id}")
            return False
        
        # 如果 ID 变化，需要删除旧的
        if config.id != source_id:
            del self._sources[source_id]
            if source_id in self._instances:
                del self._instances[source_id]
        
        self._sources[config.id] = config
        
        # 清除旧实例
        if config.id in self._instances:
            del self._instances[config.id]
        
        return self._save_config()
    
    def delete_source(self, source_id: str) -> bool:
        """
        删除数据源
        
        Args:
            source_id: 数据源 ID
            
        Returns:
            是否删除成功
        """
        if source_id not in self._sources:
            print(f"[SourceManager] 数据源不存在: {source_id}")
            return False
        
        del self._sources[source_id]
        
        if source_id in self._instances:
            del self._instances[source_id]
        
        return self._save_config()
    
    def toggle_source(self, source_id: str, enabled: bool) -> bool:
        """
        启用/禁用数据源
        
        Args:
            source_id: 数据源 ID
            enabled: 是否启用
            
        Returns:
            是否操作成功
        """
        config = self._sources.get(source_id)
        if not config:
            return False
        
        config.enabled = enabled
        return self._save_config()
    
    # ========== 数据抓取 ==========
    
    def get_instance(self, source_id: str) -> Optional[DataSource]:
        """
        获取数据源实例（带缓存）
        
        Args:
            source_id: 数据源 ID
            
        Returns:
            DataSource 实例
        """
        if source_id not in self._instances:
            config = self._sources.get(source_id)
            if not config:
                return None
            instance = self._create_instance(config)
            if instance:
                self._instances[source_id] = instance
        
        return self._instances.get(source_id)
    
    def fetch_source(self, source_id: str) -> List[Article]:
        """
        抓取指定数据源
        
        Args:
            source_id: 数据源 ID
            
        Returns:
            Article 列表
        """
        instance = self.get_instance(source_id)
        if not instance:
            return []
        
        if not instance.is_enabled:
            print(f"[SourceManager] 数据源已禁用: {source_id}")
            return []
        
        return instance.fetch()
    
    def fetch_all_enabled(self) -> Dict[str, List[Article]]:
        """
        抓取所有启用的数据源
        
        Returns:
            {source_id: [Article, ...]} 字典
        """
        results = {}
        
        for source_id, config in self._sources.items():
            if not config.enabled:
                continue
            
            articles = self.fetch_source(source_id)
            if articles:
                results[source_id] = articles
        
        return results
    
    def get_enabled_sources(self) -> List[SourceConfig]:
        """获取所有启用的数据源配置"""
        return [c for c in self._sources.values() if c.enabled]
    
    def get_sources_by_type(self, source_type: SourceType) -> List[SourceConfig]:
        """
        按类型获取数据源
        
        Args:
            source_type: 数据源类型
            
        Returns:
            SourceConfig 列表
        """
        return [c for c in self._sources.values() if c.type == source_type]
