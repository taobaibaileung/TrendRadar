-- TrendRadar RSS 数据库表结构

-- ============================================
-- AI 分析主题表
-- 存储 AI 对多个 rss_items 聚合分析后的结果
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    tags TEXT,
    key_points TEXT, -- 存储要点，格式为 JSON 或 换行分隔的文本
    category TEXT,
    importance INTEGER,
    impact INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RSS 源信息表
-- ============================================
CREATE TABLE IF NOT EXISTS rss_feeds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RSS 条目表
-- 以 URL + feed_id 为唯一标识
-- ============================================
CREATE TABLE IF NOT EXISTS rss_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    feed_id TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TEXT,
    summary TEXT,
    author TEXT,
    theme_id INTEGER, -- 关联到分析主题 (新)
    first_crawl_time TEXT NOT NULL,
    last_crawl_time TEXT NOT NULL,
    crawl_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES rss_feeds(id),
    FOREIGN KEY (theme_id) REFERENCES analysis_themes(id)
);

-- ============================================
-- 文章全文内容表
-- 一对一存储 rss_items 的全文
-- ============================================
CREATE TABLE IF NOT EXISTS article_contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rss_item_id INTEGER NOT NULL UNIQUE,
    content TEXT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rss_item_id) REFERENCES rss_items(id)
);

-- ============================================
-- RSS 抓取记录表
-- ============================================
CREATE TABLE IF NOT EXISTS rss_crawl_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crawl_time TEXT NOT NULL UNIQUE,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RSS 抓取来源状态表
-- ============================================
CREATE TABLE IF NOT EXISTS rss_crawl_status (
    crawl_record_id INTEGER NOT NULL,
    feed_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
    PRIMARY KEY (crawl_record_id, feed_id),
    FOREIGN KEY (crawl_record_id) REFERENCES rss_crawl_records(id),
    FOREIGN KEY (feed_id) REFERENCES rss_feeds(id)
);


-- ============================================
-- 索引定义
-- ============================================

-- RSS 源索引
CREATE INDEX IF NOT EXISTS idx_rss_feed ON rss_items(feed_id);

-- 发布时间索引
CREATE INDEX IF NOT EXISTS idx_rss_published_at ON rss_items(published_at);

-- URL + feed_id 唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_rss_url_feed
    ON rss_items(url, feed_id);

-- 分析主题ID索引
CREATE INDEX IF NOT EXISTS idx_rss_theme_id ON rss_items(theme_id);

-- 全文内容关联索引
CREATE INDEX IF NOT EXISTS idx_article_contents_rss_item_id ON article_contents(rss_item_id);
