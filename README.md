# TrendRadar v2.0 - 智能信息雷达 (Obsidian 插件版)

TrendRadar 现已全面升级，为您带来更强大、更智能、更易用的信息追踪与分析体验。新版完全聚焦于 Obsidian 生态，通过一个功能完善的插件，将多源信息获取、AI 智能分析、个性化内容过滤与无缝的笔记体验融为一体。

## ✨ 核心功能

1.  **多源信息聚合**
    *   **图形化配置**：告别复杂的配置文件，直接在 Obsidian 设置中添加、编辑和管理您的信息源。
    *   **多种数据源**：支持 RSS 订阅、网站内容抓取 (Web Scrape) 和 Twitter/X 账号追踪。
    *   **高度自定义**：为每个数据源独立设置更新频率 (Cron 表达式)、数据保留时长、抓取数量等高级选项。

2.  **智能内容处理**
    *   **AI 驱动分析**：自动提取每条信息的关键词、分类、标签，并评估其**重要性**和**影响力**。
    *   **大模型配置**：支持在插件设置中直接配置 OpenAI、DeepSeek、Gemini 等大模型服务，自定义模型参数。
    *   **智能内容过滤**：通过关键词和分类黑名单，自动屏蔽您不感兴趣的内容（如娱乐、八卦新闻）。
    *   **AI 预过滤**：开启后，AI 会在分析前进行一轮智能判断，进一步过滤无关信息，提升内容质量。

3.  **优化的信息流体验**
    *   **两级内容展示**：
        *   **简报卡片**：以时间线（今天、昨天、更早）分批展示 AI 分析后的内容摘要卡片，一目了然。
        *   **详细视图**：点击卡片即可在弹窗中查看完整的 AI 分析、核心要点以及所有信息来源链接。
    *   **状态管理**：卡片会清晰地显示“未读”、“已读”、“新”等状态，帮助您高效处理信息。
    *   **快捷操作**：在卡片上即可完成**标记已读**、**归档**和**删除**等操作。
    *   **任务控制**：支持在插件设置中一键触发后台抓取任务，无需等待定时周期。

4.  **无缝 Obsidian 集成**
    *   **一键导出**：在详细视图中，一键将 AI 分析结果和原文链接保存为格式精美的 Markdown 笔记。
    *   **轻量化设计**：后端服务独立运行，插件本身轻巧，确保不影响 Obsidian 的性能和响应速度。
    *   **数据本地化**：所有配置和抓取的数据都存储在您的本地设备上，保障数据隐私和安全。

## 🚀 如何使用

### 1. 启动后端服务

后端服务是整个系统的大脑，负责数据抓取和 AI 分析。

```bash
# 1. 进入项目根目录
cd /path/to/TrendRadar

# 2. 安装依赖
# 如果遇到权限问题，请使用 sudo pip3 install ...
pip3 install -r requirements.txt
sudo pip3 install apscheduler croniter feedparser

# 3. 启动 API 服务
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 3334
```

服务启动后，您可以通过访问 `http://127.0.0.1:3334` 来确认其是否正常运行。

### 2. 安装并配置 Obsidian 插件

1.  将 `obsidian-plugin` 文件夹下的 `main.js`, `manifest.json`, `styles.css` 三个文件复制到您的 Obsidian 仓库的 `.obsidian/plugins/trendradar` 目录下（如果目录不存在，请创建它）。
2.  在 Obsidian 的“第三方插件”设置中，刷新并启用 “TrendRadar AI Assistant” 插件。
3.  进入 TrendRadar 插件的设置页面，这里您可以：
    *   **配置大模型**：选择 AI 提供商（如 DeepSeek），输入 API Key 和模型名称。
    *   **配置数据源**：点击“+ 添加”按钮，选择类型（RSS, Web, Twitter），并填写相关信息。
    *   **任务控制**：点击“🚀 开始抓取”按钮，立即启动一次数据抓取和分析。
    *   **配置过滤器**：设置您不感兴趣的关键词和分类，让信息流更清爽。

### 3. 开始使用

*   点击 Obsidian 左侧工具栏的“雷达”图标，即可打开 TrendRadar 面板。
*   面板会自动加载最新的信息卡片。
*   点击卡片查看详情，或使用卡片上的按钮进行管理。

## 🛠️ 技术架构

*   **后端**：Python, FastAPI, Uvicorn
*   **数据抓取**：`feedparser` (RSS), `BeautifulSoup` (Web), `snscrape` (Twitter)
*   **任务调度**：`apscheduler`
*   **数据存储**：SQLite (通过 `LocalStorageBackend` 实现，无需额外数据库)
*   **前端 (Obsidian 插件)**：TypeScript, Svelte

## 🙏 致谢

- 感谢原项目作者 [sansan0/TrendRadar](https://github.com/sansan0/TrendRadar) 提供了优秀的初始框架。

## 📄 许可

本项目基于 [GPL-3.0](LICENSE) 许可证开源。
