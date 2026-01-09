# coding=utf-8
"""
TrendRadar REST API Server

使用 FastAPI 为前端（如 Obsidian 插件）提供数据接口。

新增功能：
- 数据源管理 API (CRUD)
- 主题状态管理 API (已读/归档/删除)
- 内容过滤配置 API
"""

import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# TrendRadar 模块导入
from trendradar.storage.local import LocalStorageBackend
from trendradar.utils.time import format_date_folder
from trendradar.core.loader import load_config
from trendradar.sources.manager import SourceManager
from trendradar.sources.base import SourceConfig, SourceType
from trendradar.core.content_filter import ContentFilter, FilterConfig

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


# --- FastAPI 应用初始化 ---

app = FastAPI(
    title="TrendRadar API",
    description="为 TrendRadar 数据提供 RESTful API 接口",
    version="2.0.0"
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


# ========================================
# 状态检查 API
# ========================================

@app.get("/", tags=["Status"])
def read_root():
    """根端点，返回服务器状态"""
    return {"status": "ok", "message": "TrendRadar API is running.", "version": "2.0.0"}


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
def get_themes(date: Optional[str] = None, status: Optional[str] = None):
    """
    获取指定日期的所有分析主题列表
    
    - **date**: YYYY-MM-DD格式的日期，默认为今天
    - **status**: 过滤状态 (unread, read, archived)，默认返回所有
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

        select_cols = ["id", "title", "summary", "category", "importance", "impact", "created_at", "status"]
        if "tags" in columns:
            select_cols.append("tags")
        if "read_at" in columns:
            select_cols.append("read_at")

        # 构建查询
        query = f"SELECT {', '.join(select_cols)} FROM analysis_themes"
        params = []
        
        if status:
            query += " WHERE status = ?"
            params.append(status)
        
        query += " ORDER BY importance DESC, created_at DESC"
        
        cursor.execute(query, params)
        themes = cursor.fetchall()
        
        return {
            "themes": [dict(row) for row in themes],
            "new_theme_age_days": new_theme_age_days,
            "date": target_date
        }

    except Exception as e:
        print(f"Error fetching themes for date {target_date}: {e}")
        return {
            "themes": [],
            "new_theme_age_days": new_theme_age_days,
            "date": target_date
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
        
        # 检查主题是否存在
        cursor.execute("SELECT id FROM analysis_themes WHERE id = ?", (theme_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Theme not found")
        
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
    
    - **theme_id**: 要删除的主题ID
    - **date**: 主题所在的日期
    """
    storage = get_storage()
    target_date = format_date_folder(date, storage.timezone)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()
        
        # 检查主题是否存在
        cursor.execute("SELECT id FROM analysis_themes WHERE id = ?", (theme_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Theme not found")
        
        # 解除关联的文章
        cursor.execute("UPDATE rss_items SET theme_id = NULL WHERE theme_id = ?", (theme_id,))
        
        # 删除主题
        cursor.execute("DELETE FROM analysis_themes WHERE id = ?", (theme_id,))
        
        conn.commit()
        
        return {"success": True, "theme_id": theme_id, "message": "Theme deleted"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting theme: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ========================================
# 数据源管理 API (Sources)
# ========================================

@app.get("/api/sources", tags=["Sources"], response_model=List[Dict[str, Any]])
def list_sources():
    """获取所有数据源配置列表"""
    manager = get_source_manager()
    sources = manager.list_sources()
    return [s.to_dict() for s in sources]


@app.get("/api/sources/{source_id}", tags=["Sources"], response_model=Dict[str, Any])
def get_source(source_id: str):
    """获取指定数据源配置"""
    manager = get_source_manager()
    source = manager.get_source(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source.to_dict()


@app.post("/api/sources", tags=["Sources"])
def create_source(source: SourceConfigModel):
    """创建新数据源"""
    manager = get_source_manager()
    
    # 检查 ID 是否已存在
    if manager.get_source(source.id):
        raise HTTPException(status_code=400, detail="Source ID already exists")
    
    # 验证类型
    try:
        source_type = SourceType(source.type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid source type: {source.type}")
    
    # 创建配置
    config = SourceConfig(
        id=source.id,
        name=source.name,
        type=source_type,
        enabled=source.enabled,
        url=source.url,
        username=source.username,
        selector=source.selector,
        schedule=source.schedule,
        retention_days=source.retention_days,
        max_items=source.max_items,
        use_proxy=source.use_proxy,
        extra=source.extra,
    )
    
    if manager.add_source(config):
        return {"success": True, "source_id": source.id, "message": "Source created"}
    else:
        raise HTTPException(status_code=500, detail="Failed to create source")


@app.put("/api/sources/{source_id}", tags=["Sources"])
def update_source(source_id: str, source: SourceConfigModel):
    """更新数据源配置"""
    manager = get_source_manager()
    
    # 检查是否存在
    if not manager.get_source(source_id):
        raise HTTPException(status_code=404, detail="Source not found")
    
    # 验证类型
    try:
        source_type = SourceType(source.type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid source type: {source.type}")
    
    # 创建新配置
    config = SourceConfig(
        id=source.id,
        name=source.name,
        type=source_type,
        enabled=source.enabled,
        url=source.url,
        username=source.username,
        selector=source.selector,
        schedule=source.schedule,
        retention_days=source.retention_days,
        max_items=source.max_items,
        use_proxy=source.use_proxy,
        extra=source.extra,
    )
    
    if manager.update_source(source_id, config):
        return {"success": True, "source_id": source.id, "message": "Source updated"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update source")


@app.delete("/api/sources/{source_id}", tags=["Sources"])
def delete_source(source_id: str):
    """删除数据源"""
    manager = get_source_manager()
    
    if not manager.get_source(source_id):
        raise HTTPException(status_code=404, detail="Source not found")
    
    if manager.delete_source(source_id):
        return {"success": True, "source_id": source_id, "message": "Source deleted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete source")


@app.put("/api/sources/{source_id}/toggle", tags=["Sources"])
def toggle_source(source_id: str, enabled: bool = Body(..., embed=True)):
    """启用/禁用数据源"""
    manager = get_source_manager()
    
    if not manager.get_source(source_id):
        raise HTTPException(status_code=404, detail="Source not found")
    
    if manager.toggle_source(source_id, enabled):
        return {"success": True, "source_id": source_id, "enabled": enabled}
    else:
        raise HTTPException(status_code=500, detail="Failed to toggle source")


# ========================================
# 内容过滤配置 API (Filter)
# ========================================

@app.get("/api/filter", tags=["Filter"], response_model=Dict[str, Any])
def get_filter_config():
    """获取当前过滤器配置"""
    filter_instance = get_content_filter()
    return filter_instance.config.to_dict()


@app.put("/api/filter", tags=["Filter"])
def update_filter_config(config: FilterConfigModel):
    """更新过滤器配置"""
    filter_instance = get_content_filter()
    
    new_config = FilterConfig(
        keyword_blacklist=config.keyword_blacklist,
        category_blacklist=config.category_blacklist,
        source_blacklist=config.source_blacklist,
        min_content_length=config.min_content_length,
        min_importance=config.min_importance,
        enable_ai_prefilter=config.enable_ai_prefilter,
    )
    
    filter_instance.update_config(new_config)
    
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


# --- 启动命令 ---
# 要运行此服务器, 在项目根目录执行:
# uvicorn api.main:app --host 0.0.0.0 --port 3334 --reload
