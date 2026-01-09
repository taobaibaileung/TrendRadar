# coding=utf-8
"""
TrendRadar REST API Server

使用 FastAPI 为前端（如 Obsidian 插件）提供数据接口。
"""

import os
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# 假设我们的存储和数据模型可以从 trendradar 包中导入
# 注意：这需要项目根目录在 PYTHONPATH 中
from trendradar.storage.local import LocalStorageBackend
from trendradar.utils.time import format_date_folder
from trendradar.core.config import load_config

# --- FastAPI 应用初始化 ---

app = FastAPI(
    title="TrendRadar API",
    description="为 TrendRadar 数据提供 RESTful API 接口",
    version="1.0.0"
)

# --- CORS 中间件 ---
# 允许所有来源，这在开发中很方便。
# 在生产环境中，您可能希望限制为特定的来源。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# --- 依赖 & 辅助函数 ---

# 全局存储后端实例
_storage_backend: Optional[LocalStorageBackend] = None

def get_storage() -> LocalStorageBackend:
    """
    获取本地存储后端的单例实例。
    """
    global _storage_backend
    if _storage_backend is None:
        # 假设项目在 TrendRadar 目录的父目录中运行
        # 通常，我们会通过更健壮的配置来管理路径
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        output_dir = os.path.join(project_root, "output")
        _storage_backend = LocalStorageBackend(data_dir=output_dir)
        print(f"LocalStorageBackend initialized with data_dir: {output_dir}")
    return _storage_backend

# --- API 端点 ---

@app.get("/", tags=["Status"])
def read_root():
    """
    根端点，返回服务器状态。
    """
    return {"status": "ok", "message": "TrendRadar API is running."}

@app.get("/api/themes", tags=["Themes"], response_model=Dict[str, Any])
def get_themes(date: Optional[str] = None):
    """
    获取指定日期的所有分析主题列表，并返回前端配置。

    - **date**: YYYY-MM-DD格式的日期。如果未提供，则默认为今天。
    """
    storage = get_storage()
    config = load_config() # 加载配置
    target_date = format_date_folder(date, storage.timezone)
    
    # 获取 frontend.new_theme_age_days 配置
    new_theme_age_days = config.get("frontend", {}).get("new_theme_age_days", 1)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(analysis_themes)")
        columns = {row["name"] for row in cursor.fetchall()}

        select_cols = ["id", "title", "summary", "category", "importance", "impact", "created_at"]
        if "tags" in columns:
            select_cols.append("tags")

        cursor.execute(
            f"SELECT {', '.join(select_cols)} FROM analysis_themes "
            "ORDER BY importance DESC, created_at DESC"
        )
        themes = cursor.fetchall()
        
        # 返回包含主题列表和配置的字典
        return {
            "themes": [dict(row) for row in themes],
            "new_theme_age_days": new_theme_age_days
        }

    except Exception as e:
        # 在生产环境中，应该记录这个错误
        print(f"Error fetching themes for date {target_date}: {e}")
        # 如果数据库或表不存在，sqlite3会抛出 OperationalError
        # 在这种情况下，返回空列表是合理的
        return {
            "themes": [],
            "new_theme_age_days": new_theme_age_days # 即使出错也返回配置
        }


@app.get("/api/themes/{theme_id}", tags=["Themes"], response_model=Dict[str, Any])
def get_theme_details(theme_id: int, date: Optional[str] = None):
    """
    获取单个分析主题的详细信息，包括其关联的所有文章。

    - **theme_id**: 要查询的主题ID。
    - **date**: 主题所在的日期 (YYYY-MM-DD)。如果未提供，则默认为今天。
    """
    storage = get_storage()
    target_date = format_date_folder(date, storage.timezone)

    try:
        conn = storage._get_connection(target_date, db_type="rss")
        cursor = conn.cursor()

        # 1. 获取主题详情
        cursor.execute("SELECT * FROM analysis_themes WHERE id = ?", (theme_id,))
        theme = cursor.fetchone()
        if not theme:
            raise HTTPException(status_code=404, detail="Theme not found")

        theme_details = dict(theme)

        # 2. 获取关联的文章
        cursor.execute("""
            SELECT id, title, url, published_at, feed_id, summary, author
            FROM rss_items
            WHERE theme_id = ?
            ORDER BY published_at DESC
        """, (theme_id,))
        
        articles = cursor.fetchall()
        theme_details["articles"] = [dict(row) for row in articles]
        
        return theme_details

    except HTTPException:
        raise # 重新抛出 HTTP 异常
    except Exception as e:
        print(f"Error fetching details for theme_id {theme_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# --- 启动命令 ---
# 要运行此服务器, 在项目根目录执行:
# uvicorn api.main:app --host 0.0.0.0 --port 3334 --reload
