# coding=utf-8
"""
TrendRadar 主程序包装器

提供给 API 使用的 TrendRadar 实例封装，支持配置重载和单次运行。
"""

import os
from typing import Optional

from trendradar.context import AppContext
from trendradar.core import load_config
from trendradar.core.ai_analyzer import run_ai_analysis
from trendradar.ai.processor import AIProcessor
from trendradar.crawler import DataFetcher
from trendradar.storage import convert_crawl_results_to_news_data
from trendradar.__main__ import NewsAnalyzer

class TrendRadar(NewsAnalyzer):
    """TrendRadar 主程序封装类"""
    
    def __init__(self):
        super().__init__()
        
    def reload_config(self):
        """重新加载配置"""
        print("正在重新加载配置...")
        # 重新加载配置文件
        config = load_config()
        
        # 更新上下文配置
        self.ctx.config = config
        self.ctx._init_platforms()
        self.ctx._init_rss()
        
        # 更新实例属性
        self.request_interval = self.ctx.config["REQUEST_INTERVAL"]
        self.report_mode = self.ctx.config["REPORT_MODE"]
        self.rank_threshold = self.ctx.rank_threshold
        
        # 重新初始化存储管理器
        self._init_storage_manager()
        
        print("配置重新加载完成")
        
    def run_once(self):
        """执行一次完整的抓取和分析流程"""
        self.run()
