# TrendRadar 改造方案

## 1. 概述

本文档旨在对现有的 TrendRadar 项目进行分析，并根据用户提出的新需求，设计一套完整的改造方案。目标是将项目从一个以 RSS 为核心的信息聚合工具，升级为一个支持多源、可配置、具备深度分析和灵活展示能力的智能化信息处理平台。

## 2. 现状分析

在深入设计之前，我们首先对 TrendRadar 项目的当前架构和功能进行总结。

| 组件 | 技术栈 | 功能描述 |
| :--- | :--- | :--- |
| **后端** | Python, FastAPI | 提供 REST API，负责数据获取、AI 分析和存储管理。 |
| **数据源** | RSS, 热榜 | 主要通过 `config.yaml` 配置的 RSS 源抓取信息。热榜功能在新架构中已弱化。 |
| **AI 分析** | Python, 可配置大模型 | 调用大模型（如 DeepSeek, Gemini）对文章进行单篇分析（摘要、标签、分类等），并基于标签进行初步的主题聚合。 |
| **数据存储** | SQLite | 按日期和类型（`news`, `rss`）管理数据。数据库 Schema 定义了文章、内容、分析主题等核心表。 |
| **前端** | TypeScript, Svelte (Obsidian 插件) | 作为 Obsidian 的一部分，提供一个工作区，用于展示 AI 分析后的主题卡片，并可查看详情和导出笔记。 |
| **配置** | YAML | 通过 `config.yaml` 文件管理项目的绝大部分设置，包括数据源、AI 提供商、API 密钥等。 |

**核心优势**: 项目已具备一个扎实的“抓取-分析-存储-展示”闭环，AI 分析模块的 Prompt 设计较为完善，数据库结构清晰，前后端分离的架构也为扩展提供了便利。

**待办事项**: 当前功能与用户需求的差距主要体现在数据源的扩展性、任务调度的灵活性以及前端交互的丰富性上。

## 3. 改造目标与设计方案

针对用户提出的需求，我们将从数据源、后端处理、数据库和前端展示四个层面进行改造。

### 3.1. 数据源模块 (Data Source)

**目标**: 实现对网站爬取、RSS 订阅和 X (Twitter) 账号内容的支持，并允许用户对每个订阅进行独立的更新频率和保留时长配置。

**设计方案**:

1.  **统一数据源接口**: 定义一个抽象基类 `DataSource`，所有具体的数据源（RSS, Web, Twitter）都继承自该类，并实现 `fetch()` 方法。该方法将返回一个标准化的 `Article` 对象列表。

2.  **扩展 `config.yaml`**: 重新设计 `sources` 配置节，使其能够清晰地定义不同类型的数据源及其特定参数。

    ```yaml
    sources:
      - id: "tech_blogs_rss"
        name: "科技博客RSS"
        type: "rss"
        enabled: true
        url: "http://example.com/rss.xml"
        schedule: "*/15 * * * *"  # Cron 表达式，每15分钟
        retention_days: 30

      - id: "official_news_web"
        name: "官方新闻网站"
        type: "web"
        enabled: true
        url: "http://example.com/news"
        selector: ".news-list > .news-item a" # 用于发现文章链接的CSS选择器
        schedule: "0 * * * *"       # 每小时
        retention_days: 90

      - id: "key_opinion_leader_x"
        name: "KOL的X账号"
        type: "twitter"
        enabled: true
        username: "some_user"
        schedule: "*/30 * * * *"  # 每30分钟
        retention_days: 7
    ```

3.  **实现新的 Fetcher**: 
    *   `WebFetcher`: 利用 `requests` 和 `BeautifulSoup4` 库，根据配置的 `url` 和 `selector` 抓取页面，提取文章链接并获取内容。
    *   `TwitterFetcher`: 需要研究并集成一个可靠的 X/Twitter API 客户端或第三方库（如 `ntwitter` 或 `tweepy` 的兼容版本）来获取指定账号的推文。

4.  **动态调度**: 修改主程序逻辑，不再是单一的定时任务。程序启动后，会加载所有 `sources` 配置，并为每个 `enabled` 的源启动一个独立的调度器（例如使用 `apscheduler` 库），根据各自的 `schedule` Cron 表达式来触发 `fetch()` 操作。

### 3.2. 后端处理与数据库

**目标**: 优化 AI 分析流程，支持更智能的分析，并扩展数据库以支持新的交互功能。

**设计方案**:

1.  **数据库 Schema 扩展**: 
    *   在 `analysis_themes` 表中增加 `status` (TEXT, e.g., 'unread', 'read', 'archived') 和 `read_at` (TIMESTAMP) 字段，用于跟踪卡片状态。
    *   在 `rss_items` 表中增加 `source_id` 字段，用于反向追溯其来源配置。

2.  **AI 分析提示词增强**: 修改 `ai/processor.py` 中的 `_build_prompt` 方法。在调用 AI 分析时，可以根据文章的来源（例如，从 `source_id` 追溯到其配置）或初步分类，动态地在 Prompt 中加入不同的分析侧重点指令。例如：“如果文章分类为‘金融’，请重点分析其对市场情绪和特定板块的影响。”

3.  **新增 API 端点**:
    *   `POST /api/themes/{theme_id}/status`: 用于更新卡片状态（已读、归档）。请求体包含 `{"status": "read"}` 或 `{"status": "archived"}`。
    *   `DELETE /api/themes/{theme_id}`: 用于删除卡片（逻辑删除或物理删除）。
    *   `GET /api/sources`: 返回当前所有配置的数据源列表及其状态。
    *   `POST /api/sources`: 用于动态添加或修改数据源配置（高级功能，可选）。

### 3.3. 前端展示与交互 (Web UI)

**目标**: 放弃原有的 Obsidian 插件，构建一个独立的、功能完善的 Web 应用作为新的前端。这个 Web 应用将提供更好的用户体验和更强的交互性。

**设计方案**:

1.  **技术选型**: 使用 `Vite + React + TypeScript + TailwindCSS` (`web-static` 脚手架) 作为前端技术栈。这是一个现代化、高效且社区支持广泛的组合。

2.  **页面布局**: 
    *   **主界面**: 采用看板式（Kanban-like）布局，每个 `analysis_themes` 记录渲染为一个简要信息卡片。
    *   **卡片设计**: 卡片上应显示标题、摘要、分类、标签、重要性/影响度评分，以及一个清晰的“未读/已读”状态标记。
    *   **批次归总**: 卡片应按抓取批次（可以通过 `created_at` 时间戳近似）进行分组，并提供折叠/展开功能。
    *   **详情展示**: 点击卡片后，通过弹框（Modal）或侧边栏（Side Panel）展示详细信息，包括完整的 AI 分析内容和关联的原始文章列表（包含来源链接）。

3.  **交互功能**: 
    *   **状态切换**: 在卡片上提供按钮，允许用户将卡片标记为“已读”或“归档”。点击卡片查看详情时，自动将其标记为“已读”。
    *   **过滤与排序**: 提供按状态（未读/已读/归档）、分类、重要性等条件过滤卡片的功能。
    *   **删除与归档**: 在卡片上提供明确的删除和归档按钮，调用后端相应的 API。

## 4. 实施计划

项目改造将分阶段进行，以确保平稳过渡和持续交付。

1.  **第一阶段：后端基础改造**
    *   搭建新的数据源框架，实现 `WebFetcher` 和 `TwitterFetcher`。
    *   修改 `config.yaml` 结构并更新加载逻辑。
    *   引入 `apscheduler` 实现动态任务调度。
    *   更新数据库 Schema。

2.  **第二阶段：前端应用初始化与核心功能**
    *   使用 `webdev_init_project` 初始化新的 React 前端项目。
    *   实现主界面的卡片列表展示，从 `/api/themes` 获取数据。
    *   实现卡片点击后的详情展示功能。

3.  **第三阶段：完善前后端交互**
    *   实现卡片的状态管理（已读、归档、删除）功能，并完成前后端联调。
    *   在前端实现筛选和排序功能。

4.  **第四阶段：测试、优化与文档更新**
    *   进行全面的功能测试和性能优化。
    *   更新 `README.md` 和相关文档，提供详细的安装和使用指南。

通过以上方案，TrendRadar 将转变为一个更加强大和灵活的个人信息情报中心，能够更好地满足用户在信息获取和知识转化方面的深度需求。
