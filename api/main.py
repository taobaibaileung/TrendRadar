# coding=utf-8
"""
TrendRadar REST API Server

使用 FastAPI 为前端（如 Obsidian 插件）提供数据接口。

新增功能：
- 数据源管理 API (CRUD)
- 主题状态管理 API (已读/归档/删除)
- 内容过滤配置 API
- AI 配置管理 API
- 立即抓取 API
"""

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# TrendRadar 模块导入
from trendradar.storage.local import LocalStorageBackend
from trendradar.utils.time import format_date_folder
from trendradar.core.loader import load_config
from trendradar.sources.manager import SourceManager
from trendradar.sources.base import SourceConfig, SourceType
from trendradar.sources.group_manager import SourceGroupManager, SourceGroup, AIConfig
from trendradar.sources.ai_service_manager import AIServiceManager, AIService
from trendradar.core.content_filter import ContentFilter, FilterConfig
from trendradar.trendradar import TrendRadar

# 错误追踪
import sys
sys.path.append(os.path.dirname(__file__))
from errors import get_error_tracker

# --- Pydantic 模型定义 ---

class SourceConfigModel(BaseModel):
    """数据源配置模型"""
    id: str = Field(..., description="唯一标识符")
    name: str = Field(..., description="显示名称")
    type: str = Field(..., description="数据源类型: rss, web, twitter")
    enabled: bool = Field(True, description="是否启用")
    url: str = Field("", description="URL (RSS/Web)")
    username: str = Field("", description="用户名 (Twitter)")
    selector: str = Field("", description="CSS 选择器 (Web)")
    schedule: str = Field("0 * * * *", description="Cron 表达式")
    retention_days: int = Field(30, description="数据保留天数")
    max_items: int = Field(50, description="单次最大抓取数量")
    use_proxy: bool = Field(False, description="是否使用代理")
    extra: Dict[str, Any] = Field(default_factory=dict, description="额外配置")


class ThemeStatusUpdate(BaseModel):
    """主题状态更新模型"""
    status: str = Field(..., description="状态: unread, read, archived")


class FilterConfigModel(BaseModel):
    """过滤器配置模型"""
    keyword_blacklist: List[str] = Field(default_factory=list, description="关键词黑名单")
    category_blacklist: List[str] = Field(
        default_factory=lambda: ["娱乐", "八卦", "明星", "综艺", "体育", "游戏", "irrelevant"],
        description="分类黑名单"
    )
    source_blacklist: List[str] = Field(default_factory=list, description="来源黑名单")
    min_content_length: int = Field(100, description="最小内容长度")
    min_importance: int = Field(0, description="最低重要性评分")
    enable_ai_prefilter: bool = Field(True, description="是否启用 AI 预过滤")


class AIConfigModel(BaseModel):
    """AI 配置模型"""
    provider: str = Field("openai", description="AI 提供商: openai, deepseek, gemini")
    api_key: str = Field(..., description="API Key")
    base_url: str = Field("", description="API Base URL (可选)")
    model_name: str = Field("", description="模型名称 (可选)")
    temperature: float = Field(0.7, description="温度参数")


class AIServiceModel(BaseModel):
    """AI服务模型"""
    id: str = Field(..., description="唯一标识符")
    name: str = Field(..., description="服务显示名称")
    provider: str = Field("openai", description="AI提供商: openai, deepseek, gemini, openai-compatible")
    api_key: str = Field("", description="API Key")
    base_url: str = Field("", description="API Base URL")
    model_name: str = Field("", description="模型名称")
    temperature: float = Field(0.7, description="温度参数")
    description: str = Field("", description="服务描述")


# --- FastAPI 应用初始化 ---

app = FastAPI(
    title="TrendRadar API",
    description="为 TrendRadar 数据提供 RESTful API 接口",
    version="2.1.0"
)

# --- CORS 中间件 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 全局实例 ---

_storage_backend: Optional[LocalStorageBackend] = None
_source_manager: Optional[SourceManager] = None
_content_filter: Optional[ContentFilter] = None
_trendradar_instance: Optional[TrendRadar] = None

# 抓取状态跟踪
_last_fetch_status = {
    "last_fetch_time": None,
    "new_items_count": 0,
    "status": "idle"  # idle, running, completed, error
}


def get_storage() -> LocalStorageBackend:
    """获取本地存储后端的单例实例"""
    global _storage_backend
    if _storage_backend is None:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        output_dir = os.path.join(project_root, "output")
        _storage_backend = LocalStorageBackend(data_dir=output_dir)
        print(f"LocalStorageBackend initialized with data_dir: {output_dir}")
    return _storage_backend


def get_source_manager() -> SourceManager:
    """获取数据源管理器的单例实例"""
    global _source_manager
    if _source_manager is None:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        config_path = os.path.join(project_root, "config", "sources.json")
        _source_manager = SourceManager(config_path=config_path)
        print(f"SourceManager initialized with config: {config_path}")
    return _source_manager


def get_content_filter() -> ContentFilter:
    """获取内容过滤器的单例实例"""
    global _content_filter
    if _content_filter is None:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        config_path = os.path.join(project_root, "config", "filter.json")
        _content_filter = ContentFilter(config_path=config_path)
        print(f"ContentFilter initialized")
    return _content_filter


def get_trendradar() -> TrendRadar:
    """获取 TrendRadar 主程序实例"""
    global _trendradar_instance
    if _trendradar_instance is None:
        _trendradar_instance = TrendRadar()
    return _trendradar_instance


# ========================================
# 状态检查 API
# ========================================

@app.get("/", tags=["Status"])
def read_root():
    """根端点，返回服务器状态"""
    return {"status": "ok", "message": "TrendRadar API is running.", "version": "2.1.0"}


@app.get("/api/health", tags=["Status"])
def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "storage": "ok",
            "source_manager": "ok",
            "content_filter": "ok"
        }
    }


# ========================================
# 主题 API (Themes)
# ========================================

@app.get("/api/themes", tags=["Themes"], response_model=Dict[str, Any])
def get_themes(date: Optional[str] = None, status: Optional[str] = None, group_id: Optional[str] = None):
    """
    获取指定日期的所有分析主题列表

    - **date**: YYYY-MM-DD格式的日期，默认为今天
    - **status**: 过滤状态 (unread, read, archived)，默认返回所有
    - **group_id**: 过滤分组ID，默认返回所有分组
    """
    storage = get_storage()
    config = load_config()
    target_date = format_date_folder(date, storage.timezone)
    new_theme_age_days = config.get("frontend", {}).get("new_theme_age_days", 1)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()

        # 检查表结构，确保有 status 字段
        cursor.execute("PRAGMA table_info(analysis_themes)")
        columns = {row["name"] for row in cursor.fetchall()}

        # 如果没有 status 字段，添加它
        if "status" not in columns:
            cursor.execute("ALTER TABLE analysis_themes ADD COLUMN status TEXT DEFAULT 'unread'")
            conn.commit()
            columns.add("status")

        if "read_at" not in columns:
            cursor.execute("ALTER TABLE analysis_themes ADD COLUMN read_at TIMESTAMP")
            conn.commit()
            columns.add("read_at")

        # 添加重复标记字段
        if "is_duplicate" not in columns:
            cursor.execute("ALTER TABLE analysis_themes ADD COLUMN is_duplicate INTEGER DEFAULT 0")
            conn.commit()
            columns.add("is_duplicate")

        if "duplicate_similarity" not in columns:
            cursor.execute("ALTER TABLE analysis_themes ADD COLUMN duplicate_similarity REAL")
            conn.commit()
            columns.add("duplicate_similarity")

        # 添加分组字段
        if "group_id" not in columns:
            cursor.execute("ALTER TABLE analysis_themes ADD COLUMN group_id TEXT")
            conn.commit()
            columns.add("group_id")

        if "group_name" not in columns:
            cursor.execute("ALTER TABLE analysis_themes ADD COLUMN group_name TEXT")
            conn.commit()
            columns.add("group_name")

        select_cols = ["id", "title", "summary", "category", "importance", "impact", "created_at", "status"]
        if "tags" in columns:
            select_cols.append("tags")
        if "read_at" in columns:
            select_cols.append("read_at")
        if "is_duplicate" in columns:
            select_cols.append("is_duplicate")
        if "duplicate_similarity" in columns:
            select_cols.append("duplicate_similarity")
        if "group_id" in columns:
            select_cols.append("group_id")
        if "group_name" in columns:
            select_cols.append("group_name")

        # 构建查询
        query = f"SELECT {', '.join(select_cols)} FROM analysis_themes"
        params = []

        conditions = []
        if status:
            conditions.append("status = ?")
            params.append(status)

        if group_id:
            conditions.append("group_id = ?")
            params.append(group_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY importance DESC, created_at DESC"

        cursor.execute(query, params)
        themes = cursor.fetchall()

        return {
            "themes": [dict(row) for row in themes],
            "new_theme_age_days": new_theme_age_days,
            "date": target_date,
            "group_id": group_id
        }

    except Exception as e:
        print(f"Error fetching themes for date {target_date}: {e}")
        return {
            "themes": [],
            "new_theme_age_days": new_theme_age_days,
            "date": target_date,
            "group_id": group_id
        }


@app.get("/api/themes/{theme_id}", tags=["Themes"], response_model=Dict[str, Any])
def get_theme_details(theme_id: int, date: Optional[str] = None):
    """
    获取单个分析主题的详细信息，包括其关联的所有文章
    
    - **theme_id**: 要查询的主题ID
    - **date**: 主题所在的日期 (YYYY-MM-DD)，默认为今天
    """
    storage = get_storage()
    target_date = format_date_folder(date, storage.timezone)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()

        # 获取主题详情
        cursor.execute("SELECT * FROM analysis_themes WHERE id = ?", (theme_id,))
        theme = cursor.fetchone()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")

        theme_details = dict(theme)

        # 获取关联的文章，包含来源信息
        cursor.execute("""
            SELECT 
                ri.id, ri.title, ri.url, ri.published_at, ri.feed_id, 
                ri.summary, ri.author,
                rf.name as source_name
            FROM rss_items ri
            LEFT JOIN rss_feeds rf ON ri.feed_id = rf.id
            WHERE ri.theme_id = ?
            ORDER BY ri.published_at DESC
        """, (theme_id,))
        
        articles = cursor.fetchall()
        theme_details["articles"] = [dict(row) for row in articles]
        
        return theme_details

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching details for theme_id {theme_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.put("/api/themes/{theme_id}/status", tags=["Themes"])
def update_theme_status(theme_id: int, update: ThemeStatusUpdate, date: Optional[str] = None):
    """
    更新主题状态

    - **theme_id**: 主题ID
    - **status**: 新状态 (unread, read, archived)
    - **date**: 主题所在的日期
    """
    if update.status not in ["unread", "read", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be: unread, read, archived")

    storage = get_storage()
    target_date = format_date_folder(date, storage.timezone)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()

        # 检查主题是否存在，并获取主题详情
        cursor.execute("SELECT id, title, summary, category, tags, status FROM analysis_themes WHERE id = ?", (theme_id,))
        theme_row = cursor.fetchone()
        if not theme_row:
            raise HTTPException(status_code=404, detail="Theme not found")

        # 转换为字典以便使用 .get() 方法
        theme_data = dict(theme_row)
        old_status = theme_data["status"]

        # 更新状态
        now = datetime.now().isoformat()
        if update.status == "read":
            cursor.execute(
                "UPDATE analysis_themes SET status = ?, read_at = ? WHERE id = ?",
                (update.status, now, theme_id)
            )
        else:
            cursor.execute(
                "UPDATE analysis_themes SET status = ? WHERE id = ?",
                (update.status, theme_id)
            )

        # 如果状态变为 archived，记录到已处理历史（用于去重）
        if update.status == "archived" and old_status != "archived":
            try:
                tags = json.loads(theme_data["tags"]) if theme_data.get("tags") else []
                storage.add_to_processed_history(
                    theme_id=theme_id,
                    title=theme_data["title"],
                    summary=theme_data["summary"],
                    category=theme_data.get("category") or "其他",
                    tags=tags,
                    status="archived"
                )
                print(f"[API] 主题 {theme_id} 已归档并记录到已处理历史")
            except Exception as e:
                print(f"[API] 记录归档到已处理历史失败: {e}")
                import traceback
                traceback.print_exc()

        conn.commit()

        return {"success": True, "theme_id": theme_id, "status": update.status}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating theme status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/themes/{theme_id}", tags=["Themes"])
def delete_theme(theme_id: int, date: Optional[str] = None):
    """
    删除主题

    - **theme_id**: 主题ID
    - **date**: 主题所在的日期
    """
    storage = get_storage()
    target_date = format_date_folder(date, storage.timezone)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()

        # 检查主题是否存在，并获取主题详情
        cursor.execute("SELECT id, title, summary, category, tags FROM analysis_themes WHERE id = ?", (theme_id,))
        theme_row = cursor.fetchone()
        if not theme_row:
            raise HTTPException(status_code=404, detail="Theme not found")

        # 转换为字典以便使用 .get() 方法
        theme_data = dict(theme_row)

        # 记录到已处理历史（用于去重）
        try:
            tags = json.loads(theme_data["tags"]) if theme_data.get("tags") else []
            storage.add_to_processed_history(
                theme_id=theme_id,
                title=theme_data["title"],
                summary=theme_data["summary"],
                category=theme_data.get("category") or "其他",
                tags=tags,
                status="deleted"
            )
            print(f"[API] 主题 {theme_id} 已记录到已处理历史")
        except Exception as e:
            print(f"[API] 记录到已处理历史失败: {e}")
            import traceback
            traceback.print_exc()

        # 删除主题
        cursor.execute("DELETE FROM analysis_themes WHERE id = ?", (theme_id,))

        # 同时更新关联的 rss_items，将其 theme_id 设为 NULL
        cursor.execute("UPDATE rss_items SET theme_id = NULL WHERE theme_id = ?", (theme_id,))

        conn.commit()

        return {"success": True, "theme_id": theme_id, "message": f"Theme {theme_id} deleted"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting theme: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ========================================
# 数据源管理 API (Sources)
# ========================================

@app.get("/api/sources", tags=["Sources"], response_model=List[SourceConfigModel])
def get_sources():
    """获取所有数据源配置"""
    manager = get_source_manager()
    return [config.to_dict() for config in manager.get_all_sources()]


@app.post("/api/sources", tags=["Sources"], response_model=SourceConfigModel)
def create_source(source: SourceConfigModel):
    """创建新数据源"""
    manager = get_source_manager()
    
    # 检查 ID 是否已存在
    if manager.get_source(source.id):
        raise HTTPException(status_code=400, detail=f"Source ID '{source.id}' already exists")
    
    config = SourceConfig.from_dict(source.dict())
    manager.add_source(config)
    return config.to_dict()


@app.get("/api/sources/{source_id}", tags=["Sources"], response_model=SourceConfigModel)
def get_source(source_id: str):
    """获取指定数据源配置"""
    manager = get_source_manager()
    config = manager.get_source(source_id)
    if not config:
        raise HTTPException(status_code=404, detail="Source not found")
    return config.to_dict()


@app.put("/api/sources/{source_id}", tags=["Sources"], response_model=SourceConfigModel)
def update_source(source_id: str, source: SourceConfigModel):
    """更新数据源配置"""
    manager = get_source_manager()

    if source_id != source.id:
        raise HTTPException(status_code=400, detail="Source ID mismatch")

    if not manager.get_source(source_id):
        raise HTTPException(status_code=404, detail="Source not found")

    # 获取旧数据源名称
    old_source = manager.get_source(source_id)

    config = SourceConfig.from_dict(source.dict())
    manager.update_source(source_id, config)

    # 如果数据源名称改变，清除旧的错误日志
    if old_source and old_source.name != source.name:
        error_tracker = get_error_tracker()
        error_tracker.resolve_errors(error_type="source", source=old_source.name)

    return config.to_dict()


@app.delete("/api/sources/{source_id}", tags=["Sources"])
def delete_source(source_id: str):
    """删除数据源"""
    manager = get_source_manager()
    source = manager.get_source(source_id)

    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    # 清除该数据源的错误日志
    error_tracker = get_error_tracker()
    error_tracker.resolve_errors(error_type="source", source=source.name)

    manager.remove_source(source_id)
    return {"success": True, "message": f"Source '{source_id}' deleted"}


# ========================================
# 过滤器配置 API (Filter)
# ========================================

@app.get("/api/filter", tags=["Filter"], response_model=FilterConfigModel)
def get_filter_config():
    """获取当前过滤器配置"""
    filter_instance = get_content_filter()
    return filter_instance.config.to_dict()


@app.put("/api/filter", tags=["Filter"])
def update_filter_config(config: FilterConfigModel):
    """更新过滤器配置"""
    filter_instance = get_content_filter()
    new_config = FilterConfig.from_dict(config.dict())
    filter_instance.config = new_config
    
    # 保存到文件
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    config_path = os.path.join(project_root, "config", "filter.json")
    
    try:
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump({"filter": new_config.to_dict()}, f, ensure_ascii=False, indent=2)
        return {"success": True, "message": "Filter config updated"}
    except Exception as e:
        print(f"Error saving filter config: {e}")
        raise HTTPException(status_code=500, detail="Failed to save filter config")


@app.post("/api/filter/keywords", tags=["Filter"])
def add_filter_keyword(keyword: str = Body(..., embed=True)):
    """添加黑名单关键词"""
    filter_instance = get_content_filter()
    filter_instance.add_keyword(keyword)
    return {"success": True, "keyword": keyword, "message": "Keyword added"}


@app.delete("/api/filter/keywords/{keyword}", tags=["Filter"])
def remove_filter_keyword(keyword: str):
    """移除黑名单关键词"""
    filter_instance = get_content_filter()
    filter_instance.remove_keyword(keyword)
    return {"success": True, "keyword": keyword, "message": "Keyword removed"}


# ========================================
# AI 配置 API (AI Config)
# ========================================

@app.get("/api/ai/config", tags=["AI"], response_model=AIConfigModel)
def get_ai_config():
    """获取 AI 配置"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    config_path = os.path.join(project_root, "config", "ai_config.json")
    
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return AIConfigModel(**data)
        except Exception as e:
            print(f"Error reading AI config: {e}")
    
    # 默认配置
    return AIConfigModel(
        provider="openai",
        api_key="",
        base_url="",
        model_name="gpt-3.5-turbo",
        temperature=0.7
    )


@app.put("/api/ai/config", tags=["AI"])
def update_ai_config(config: AIConfigModel):
    """更新 AI 配置"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    config_path = os.path.join(project_root, "config", "ai_config.json")
    
    try:
        os.makedirs(os.path.dirname(config_path), exist_ok=True)
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config.dict(), f, ensure_ascii=False, indent=2)
        return {"success": True, "message": "AI config updated"}
    except Exception as e:
        print(f"Error saving AI config: {e}")
        raise HTTPException(status_code=500, detail="Failed to save AI config")


# ========================================
# AI 服务管理 API (AI Services)
# ========================================

@app.get("/api/ai-services", tags=["AI Services"], response_model=List[AIServiceModel])
def get_ai_services():
    """获取所有AI服务列表"""
    manager = get_ai_service_manager()
    services = manager.get_all()
    return [AIServiceModel(**service.to_dict()) for service in services]


@app.get("/api/ai-services/{service_id}", tags=["AI Services"], response_model=AIServiceModel)
def get_ai_service(service_id: str):
    """获取单个AI服务"""
    manager = get_ai_service_manager()
    service = manager.get(service_id)
    if service is None:
        raise HTTPException(status_code=404, detail=f"AI service '{service_id}' not found")
    return AIServiceModel(**service.to_dict())


@app.post("/api/ai-services", tags=["AI Services"], response_model=AIServiceModel)
def create_ai_service(service: AIServiceModel):
    """创建新的AI服务"""
    manager = get_ai_service_manager()
    ai_service = AIService(
        id=service.id,
        name=service.name,
        provider=service.provider,
        api_key=service.api_key,
        base_url=service.base_url,
        model_name=service.model_name,
        temperature=service.temperature,
        description=service.description
    )
    success = manager.add(ai_service)
    if not success:
        raise HTTPException(status_code=400, detail=f"AI service with id '{service.id}' already exists")
    return AIServiceModel(**ai_service.to_dict())


@app.put("/api/ai-services/{service_id}", tags=["AI Services"], response_model=AIServiceModel)
def update_ai_service(service_id: str, service: AIServiceModel):
    """更新AI服务"""
    manager = get_ai_service_manager()
    ai_service = AIService(
        id=service.id,
        name=service.name,
        provider=service.provider,
        api_key=service.api_key,
        base_url=service.base_url,
        model_name=service.model_name,
        temperature=service.temperature,
        description=service.description
    )
    success = manager.update(service_id, ai_service)
    if not success:
        raise HTTPException(status_code=404, detail=f"AI service '{service_id}' not found")
    return AIServiceModel(**ai_service.to_dict())


@app.delete("/api/ai-services/{service_id}", tags=["AI Services"])
def delete_ai_service(service_id: str):
    """删除AI服务"""
    manager = get_ai_service_manager()
    success = manager.delete(service_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"AI service '{service_id}' not found")
    return {"success": True, "message": f"AI service '{service_id}' deleted"}


# ========================================
# 系统设置 API (Settings)
# ========================================

class SettingsModel(BaseModel):
    """系统设置模型"""
    app: Dict[str, Any] = Field(default_factory=dict, description="应用配置")
    frontend: Dict[str, Any] = Field(default_factory=dict, description="前端配置")
    report: Dict[str, Any] = Field(default_factory=dict, description="报告配置")
    notification: Dict[str, Any] = Field(default_factory=dict, description="通知配置")
    integrations: Dict[str, Any] = Field(default_factory=dict, description="集成配置")
    storage: Dict[str, Any] = Field(default_factory=dict, description="存储配置")
    advanced: Dict[str, Any] = Field(default_factory=dict, description="高级配置")


@app.get("/api/settings", tags=["Settings"], response_model=Dict[str, Any])
def get_settings():
    """获取系统设置"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    config_path = os.path.join(project_root, "config", "settings.json")

    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading settings: {e}")
            raise HTTPException(status_code=500, detail="Failed to read settings")

    # 返回默认配置
    from trendradar.core.json_loader import get_default_config
    default_config = get_default_config()

    # 转换为前端格式
    return {
        "app": {
            "timezone": default_config.get("TIMEZONE", "Asia/Shanghai"),
            "show_version_update": default_config.get("SHOW_VERSION_UPDATE", True)
        },
        "frontend": {
            "new_theme_age_days": default_config.get("NEW_THEME_AGE_DAYS", 1)
        },
        "report": {
            "mode": default_config.get("REPORT_MODE", "current"),
            "display_mode": default_config.get("DISPLAY_MODE", "keyword"),
            "rank_threshold": default_config.get("RANK_THRESHOLD", 5),
            "sort_by_position_first": default_config.get("SORT_BY_POSITION_FIRST", False),
            "max_news_per_keyword": default_config.get("MAX_NEWS_PER_KEYWORD", 0),
            "reverse_content_order": default_config.get("REVERSE_CONTENT_ORDER", False)
        },
        "notification": {
            "enabled": default_config.get("ENABLE_NOTIFICATION", True),
            "push_window": default_config.get("PUSH_WINDOW", {}),
            "channels": {
                "feishu": {"webhook_url": default_config.get("FEISHU_WEBHOOK_URL", "")},
                "dingtalk": {"webhook_url": default_config.get("DINGTALK_WEBHOOK_URL", "")},
                "wework": {
                    "webhook_url": default_config.get("WEWORK_WEBHOOK_URL", ""),
                    "msg_type": default_config.get("WEWORK_MSG_TYPE", "markdown")
                },
                "telegram": {
                    "bot_token": default_config.get("TELEGRAM_BOT_TOKEN", ""),
                    "chat_id": default_config.get("TELEGRAM_CHAT_ID", "")
                },
                "email": {
                    "from": default_config.get("EMAIL_FROM", ""),
                    "password": default_config.get("EMAIL_PASSWORD", ""),
                    "to": default_config.get("EMAIL_TO", ""),
                    "smtp_server": default_config.get("EMAIL_SMTP_SERVER", ""),
                    "smtp_port": default_config.get("EMAIL_SMTP_PORT", "")
                },
                "ntfy": {
                    "server_url": default_config.get("NTFY_SERVER_URL", "https://ntfy.sh"),
                    "topic": default_config.get("NTFY_TOPIC", ""),
                    "token": default_config.get("NTFY_TOKEN", "")
                },
                "bark": {"url": default_config.get("BARK_URL", "")},
                "slack": {"webhook_url": default_config.get("SLACK_WEBHOOK_URL", "")}
            }
        },
        "integrations": {
            "obsidian": {
                "export_path": default_config.get("OBSIDIAN_EXPORT_PATH", "")
            }
        },
        "storage": default_config.get("STORAGE", {}),
        "advanced": {
            "version_check_url": default_config.get("VERSION_CHECK_URL", ""),
            "crawler": {
                "enabled": default_config.get("ENABLE_CRAWLER", True),
                "request_interval": default_config.get("REQUEST_INTERVAL", 1000),
                "use_proxy": default_config.get("USE_PROXY", False),
                "default_proxy": default_config.get("DEFAULT_PROXY", "")
            },
            "rss": default_config.get("RSS", {}),
            "api_server": {
                "host": "0.0.0.0",
                "port": 3334
            },
            "weight": default_config.get("WEIGHT_CONFIG", {}),
            "max_accounts_per_channel": default_config.get("MAX_ACCOUNTS_PER_CHANNEL", 3),
            "batch_size": {
                "default": default_config.get("MESSAGE_BATCH_SIZE", 4000),
                "dingtalk": default_config.get("DINGTALK_BATCH_SIZE", 20000),
                "feishu": default_config.get("FEISHU_BATCH_SIZE", 30000),
                "bark": default_config.get("BARK_BATCH_SIZE", 4000),
                "slack": default_config.get("SLACK_BATCH_SIZE", 4000)
            },
            "batch_send_interval": default_config.get("BATCH_SEND_INTERVAL", 3),
            "feishu_message_separator": default_config.get("FEISHU_MESSAGE_SEPARATOR", "━━━━━━━━━━━━━━━━━━━")
        }
    }


@app.put("/api/settings", tags=["Settings"])
def update_settings(settings: Dict[str, Any]):
    """更新系统设置"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    config_path = os.path.join(project_root, "config", "settings.json")

    try:
        os.makedirs(os.path.dirname(config_path), exist_ok=True)

        # 读取现有配置（如果存在）
        if os.path.exists(config_path):
            with open(config_path, "r", encoding="utf-8") as f:
                existing_settings = json.load(f)
        else:
            existing_settings = {}

        # 合并配置
        existing_settings.update(settings)

        # 保存到文件
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(existing_settings, f, ensure_ascii=False, indent=2)

        return {"success": True, "message": "Settings updated"}
    except Exception as e:
        print(f"Error saving settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to save settings")


# ========================================
# 去重配置 API (Deduplication)
# ========================================

class DeduplicationConfigModel(BaseModel):
    """去重配置模型"""
    enabled: bool = True
    similarity_threshold: float = 0.8
    check_window_days: int = 30
    max_history_records: int = 3000
    filter_deleted: bool = True
    filter_archived: bool = False
    filter_exported: bool = False
    duplicate_action: str = "keep"  # "keep" or "discard"
    method: str = "hybrid"  # "title_only" or "hybrid"
    history_retention_days: int = 90


@app.get("/api/deduplication/config", tags=["Deduplication"])
def get_deduplication_config():
    """获取去重配置"""
    try:
        from trendradar.core.loader import load_config
        config = load_config()

        dedup_config = config.get("DEDUPLICATION", {})

        # 返回配置，填充默认值
        return {
            "enabled": dedup_config.get("enabled", True),
            "similarity_threshold": dedup_config.get("similarity_threshold", 0.8),
            "check_window_days": dedup_config.get("check_window_days", 30),
            "max_history_records": dedup_config.get("max_history_records", 3000),
            "filter_deleted": dedup_config.get("filter_deleted", True),
            "filter_archived": dedup_config.get("filter_archived", False),
            "filter_exported": dedup_config.get("filter_exported", False),
            "duplicate_action": dedup_config.get("duplicate_action", "keep"),
            "method": dedup_config.get("method", "hybrid"),
            "history_retention_days": dedup_config.get("history_retention_days", 90)
        }
    except Exception as e:
        print(f"Error loading deduplication config: {e}")
        raise HTTPException(status_code=500, detail="Failed to load deduplication config")


@app.put("/api/deduplication/config", tags=["Deduplication"])
def update_deduplication_config(config: DeduplicationConfigModel):
    """更新去重配置"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    config_file = os.path.join(project_root, "config", "config.yaml")

    try:
        import yaml
        from trendradar.core.loader import load_config

        # 读取现有配置
        with open(config_file, "r", encoding="utf-8") as f:
            yaml_content = f.read()
            existing_config = yaml.safe_load(yaml_content)

        # 更新去重配置
        if "DEDUPLICATION" not in existing_config:
            existing_config["DEDUPLICATION"] = {}

        dedup_config = existing_config["DEDUPLICATION"]
        dedup_config["enabled"] = config.enabled
        dedup_config["similarity_threshold"] = config.similarity_threshold
        dedup_config["check_window_days"] = config.check_window_days
        dedup_config["max_history_records"] = config.max_history_records
        dedup_config["filter_deleted"] = config.filter_deleted
        dedup_config["filter_archived"] = config.filter_archived
        dedup_config["filter_exported"] = config.filter_exported
        dedup_config["duplicate_action"] = config.duplicate_action
        dedup_config["method"] = config.method
        dedup_config["history_retention_days"] = config.history_retention_days

        # 保存到文件
        with open(config_file, "w", encoding="utf-8") as f:
            yaml.dump(existing_config, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

        return {"success": True, "message": "Deduplication config updated"}
    except Exception as e:
        print(f"Error saving deduplication config: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save deduplication config: {str(e)}")


@app.get("/api/deduplication/history", tags=["Deduplication"])
def get_deduplication_history(
    status: Optional[str] = None,
    days: Optional[int] = None,
    limit: Optional[int] = None
):
    """获取已处理内容历史"""
    try:
        storage = get_storage()

        history = storage.get_processed_history(
            status=status,
            days=days,
            limit=limit
        )

        return {
            "total": len(history),
            "records": history
        }
    except Exception as e:
        print(f"Error getting deduplication history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get deduplication history")


@app.delete("/api/deduplication/history", tags=["Deduplication"])
def cleanup_deduplication_history(retention_days: int = 90):
    """清理旧的已处理历史记录"""
    try:
        storage = get_storage()

        deleted_count = storage.cleanup_old_history(retention_days)

        return {
            "success": True,
            "deleted_count": deleted_count,
            "message": f"Cleaned up {deleted_count} old records"
        }
    except Exception as e:
        print(f"Error cleaning up deduplication history: {e}")
        raise HTTPException(status_code=500, detail="Failed to cleanup deduplication history")


# ========================================
# 任务控制 API (Tasks)
# ========================================

async def run_fetch_task():
    """后台运行抓取任务"""
    global _last_fetch_status

    print("Starting manual fetch task...")
    _last_fetch_status["status"] = "running"
    _last_fetch_status["last_fetch_time"] = datetime.now().isoformat()

    try:
        trendradar = get_trendradar()
        # 重新加载配置以确保使用最新的 AI 设置
        trendradar.reload_config()

        # 记录抓取前的主题数量
        storage = get_storage()
        before_count = len(storage.get_ai_themes())

        # 执行抓取
        trendradar.run_once()

        # 计算新增条目数
        after_count = len(storage.get_ai_themes())
        new_items = max(0, after_count - before_count)

        _last_fetch_status["new_items_count"] = new_items
        _last_fetch_status["status"] = "completed"
        print(f"Manual fetch task completed. New items: {new_items}")
    except Exception as e:
        _last_fetch_status["status"] = "error"
        print(f"Error in manual fetch task: {e}")


@app.post("/api/tasks/fetch", tags=["Tasks"])
def trigger_fetch(background_tasks: BackgroundTasks):
    """
    触发立即抓取任务

    此操作会在后台异步执行抓取和分析流程。
    """
    background_tasks.add_task(run_fetch_task)
    return {"success": True, "message": "Fetch task started in background"}


@app.get("/api/tasks/status", tags=["Tasks"])
def get_fetch_status():
    """
    获取上次抓取的状态

    返回上次抓取的时间、新增条目数和状态。
    """
    return _last_fetch_status


# ========================================
# 错误追踪 API (Error Tracking)
# ========================================

@app.get("/api/errors/summary", tags=["Errors"])
def get_error_summary():
    """
    获取错误统计摘要

    返回未解决错误的数量、按类型和严重程度的统计，以及最近的5条错误。
    """
    error_tracker = get_error_tracker()
    return error_tracker.get_summary()


@app.get("/api/errors", tags=["Errors"])
def get_errors(
    unresolved_only: bool = True,
    limit: Optional[int] = None
):
    """
    获取错误列表

    Args:
        unresolved_only: 是否只返回未解决的错误
        limit: 返回数量限制
    """
    error_tracker = get_error_tracker()
    return error_tracker.get_errors(unresolved_only=unresolved_only, limit=limit)


@app.put("/api/errors/resolve", tags=["Errors"])
def resolve_errors(
    error_type: Optional[str] = None,
    source: Optional[str] = None
):
    """
    标记错误已解决

    Args:
        error_type: 错误类型（可选）
        source: 错误来源（可选）
    """
    error_tracker = get_error_tracker()
    error_tracker.resolve_errors(error_type=error_type, source=source)
    return {"success": True}


# ========================================
# 数据源分组管理 API (Source Groups)
# ========================================

# 全局分组管理器实例
_source_group_manager: Optional[SourceGroupManager] = None


def get_source_group_manager() -> SourceGroupManager:
    """获取数据源分组管理器的单例实例"""
    global _source_group_manager
    if _source_group_manager is None:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        # 定义配置文件路径（优先使用 JSON）
        config_dir = os.path.join(project_root, "config")
        config_path = os.path.join(config_dir, "source_groups.json")

        # 如果配置文件不存在，创建空配置
        if not os.path.exists(config_path):
            os.makedirs(config_dir, exist_ok=True)
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump({"source_groups": []}, f, ensure_ascii=False, indent=2)
            print(f"[SourceGroupManager] 创建新的配置文件: {config_path}")

        _source_group_manager = SourceGroupManager(config_path)
        print(f"[SourceGroupManager] initialized with config: {config_path}")

    return _source_group_manager


# 全局AI服务管理器实例
_ai_service_manager: Optional[AIServiceManager] = None


def get_ai_service_manager() -> AIServiceManager:
    """获取AI服务管理器的单例实例"""
    global _ai_service_manager
    if _ai_service_manager is None:
        _ai_service_manager = AIServiceManager()
        print("AIServiceManager initialized")
    return _ai_service_manager


class AIConfigModel(BaseModel):
    """AI配置模型

    使用引用方式指定AI服务，而不是直接嵌入配置。
    """
    mode: str = Field("two-stage", description="AI处理模式: two-stage (分阶段) 或 single (整体处理)")
    analysis_service_id: str = Field("", description="分析服务ID (two-stage模式必填，single模式使用)")
    aggregation_service_id: str = Field("", description="聚合服务ID (仅two-stage模式使用)")


class SourceGroupModel(BaseModel):
    """数据源分组模型"""
    id: str = Field(..., description="唯一标识符")
    name: str = Field(..., description="显示名称")
    enabled: bool = Field(True, description="是否启用")
    description: str = Field("", description="分组描述")
    ai_config: Optional[AIConfigModel] = Field(None, description="AI配置")
    sources: List[SourceConfigModel] = Field(default_factory=list, description="数据源列表")


@app.get("/api/source-groups", tags=["Source Groups"])
def get_source_groups():
    """获取所有数据源分组"""
    manager = get_source_group_manager()
    groups = manager.get_all_groups()
    return {"groups": [g.to_dict() for g in groups]}


@app.get("/api/source-groups/{group_id}", tags=["Source Groups"])
def get_source_group(group_id: str):
    """获取指定数据源分组"""
    manager = get_source_group_manager()
    group = manager.get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Source group not found")
    return group.to_dict()


@app.post("/api/source-groups", tags=["Source Groups"], response_model=SourceGroupModel)
def create_source_group(group: SourceGroupModel):
    """创建新的数据源分组"""
    manager = get_source_group_manager()

    # 检查ID是否已存在
    if manager.get_group(group.id):
        raise HTTPException(status_code=400, detail=f"Source group ID '{group.id}' already exists")

    # 转换为内部模型
    ai_config = None
    if group.ai_config:
        # 验证模式和服务ID的一致性
        mode = group.ai_config.mode or "two-stage"
        analysis_id = group.ai_config.analysis_service_id or ""
        aggregation_id = group.ai_config.aggregation_service_id or ""

        # Single 模式下，清空 aggregation_service_id
        if mode == "single":
            aggregation_id = ""

        # 验证必填字段
        if mode == "two-stage":
            if not analysis_id or not aggregation_id:
                raise HTTPException(
                    status_code=400,
                    detail="Two-stage mode requires both analysis_service_id and aggregation_service_id"
                )
        elif mode == "single":
            if not analysis_id:
                raise HTTPException(
                    status_code=400,
                    detail="Single mode requires analysis_service_id"
                )

        ai_config = AIConfig(
            mode=mode,
            analysis_service_id=analysis_id,
            aggregation_service_id=aggregation_id
        )

    sources = [SourceConfig.from_dict(s.dict()) for s in group.sources]

    new_group = SourceGroup(
        id=group.id,
        name=group.name,
        enabled=group.enabled,
        ai_config=ai_config,
        sources=sources
    )

    if manager.add_group(new_group):
        # 保存配置
        manager.save_config()
        # 返回创建的分组（包含修改后的 ai_config）
        return new_group.to_dict()
    else:
        raise HTTPException(status_code=400, detail="Failed to add source group")


@app.put("/api/source-groups/{group_id}", tags=["Source Groups"])
def update_source_group(group_id: str, group: SourceGroupModel):
    """更新数据源分组"""
    manager = get_source_group_manager()

    if group_id != group.id:
        raise HTTPException(status_code=400, detail="Group ID mismatch")

    if not manager.get_group(group_id):
        raise HTTPException(status_code=404, detail="Source group not found")

    # 获取旧分组配置
    old_group = manager.get_group(group_id)

    # 转换为内部模型
    ai_config = None
    if group.ai_config:
        # 验证模式和服务ID的一致性
        mode = group.ai_config.mode or "two-stage"
        analysis_id = group.ai_config.analysis_service_id or ""
        aggregation_id = group.ai_config.aggregation_service_id or ""

        # Single 模式下，清空 aggregation_service_id
        if mode == "single":
            aggregation_id = ""

        # 验证必填字段
        if mode == "two-stage":
            if not analysis_id or not aggregation_id:
                raise HTTPException(
                    status_code=400,
                    detail="Two-stage mode requires both analysis_service_id and aggregation_service_id"
                )
        elif mode == "single":
            if not analysis_id:
                raise HTTPException(
                    status_code=400,
                    detail="Single mode requires analysis_service_id"
                )

        ai_config = AIConfig(
            mode=mode,
            analysis_service_id=analysis_id,
            aggregation_service_id=aggregation_id
        )

    sources = [SourceConfig.from_dict(s.dict()) for s in group.sources]

    updated_group = SourceGroup(
        id=group.id,
        name=group.name,
        enabled=group.enabled,
        ai_config=ai_config,
        sources=sources
    )

    if manager.update_group(group_id, updated_group):
        # 保存配置
        manager.save_config()

        # 如果分组被禁用，清除该分组下所有数据源的错误日志
        if group.enabled == False and old_group and old_group.enabled == True:
            error_tracker = get_error_tracker()
            for source in sources:
                error_tracker.resolve_errors(error_type="source", source=source.name)

        return {"success": True, "message": "Source group updated"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update source group")


@app.delete("/api/source-groups/{group_id}", tags=["Source Groups"])
def delete_source_group(group_id: str):
    """删除数据源分组"""
    manager = get_source_group_manager()
    group = manager.get_group(group_id)

    if not group:
        raise HTTPException(status_code=404, detail="Source group not found")

    # 清除该分组下所有数据源的错误日志
    error_tracker = get_error_tracker()
    for source in group.sources:
        error_tracker.resolve_errors(error_type="source", source=source.name)

    if manager.remove_group(group_id):
        # 保存配置
        manager.save_config()
        return {"success": True, "message": f"Source group '{group_id}' deleted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete source group")



# --- 启动命令 ---
# 要运行此服务器, 在项目根目录执行:
# uvicorn api.main:app --host 0.0.0.0 --port 3334 --reload
