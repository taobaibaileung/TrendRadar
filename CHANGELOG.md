# TrendRadar 变更日志

All notable changes to TrendRadar will be documented in this file.

## [Unreleased] - 2026-01-11

### UI Improvements - 按钮图标和间距优化
**文件**: `obsidian-plugin/ThemeList.svelte`
- **图标优化**: 将 emoji 图标替换为 SVG 图标，提升视觉效果
  - 刷新按钮：🔄 → SVG 圆形箭头图标 (line 243-249)
  - 错误按钮：⚠️ → SVG 警告三角形图标 (line 251-257)
- **按钮间距**: 为 `.tab-filter-bar` 添加 `gap: 8px` (line 446)
  - 确保刷新、错误、待阅等按钮之间有适当间隔

### UI Simplification - 界面简化
**文件**: `obsidian-plugin/ThemeList.svelte`, `obsidian-plugin/view.ts`
- **移除统计显示**:
  - 移除"未读数/总数"的统计显示，保持界面简洁
  - 从 `view.ts` 中移除 `createToolbar()` 和 `updateStats()` 方法
- **错误按钮简化**: 移除错误统计按钮后的数字显示，仅保留图标
- **按钮文本简化** (`ThemeList.svelte` line 257-280):
  - "未处理" → "待阅"
  - "已归档" → "归档"
  - "全部" → "All"
- **默认排序**: 将默认排序从重要性改为时间排序 (`ThemeList.svelte` line 14)

### Error Statistics Modal Redesign - 错误统计弹框重新设计
**文件**: `obsidian-plugin/ErrorListModal.ts`, `api/errors.py`, `obsidian-plugin/api.ts`, `obsidian-plugin/styles.css`
- **前端完全重写** (`ErrorListModal.ts`):
  - 从详细错误列表改为统计卡片展示
  - 移除关闭按钮（点击空白区域关闭）
  - 使用卡片式布局展示统计数据

- **显示内容**:
  - 统计周期（最近3天）
  - 报错总数
  - 按环节分类（抓取、处理、存储、面板）
  - 按数据源分类
  - 按日期分类

- **移除内容**:
  - 具体错误发生时间
  - 错误消息详情
  - 错误详情列表

- **后端 API 改进** (`api/errors.py`):
  - `_get_source_statistics()` → `_get_source_statistics_simple()`: 仅返回计数
  - 新增 `_get_date_statistics()`: 按日期分组统计

- **类型定义更新** (`obsidian-plugin/api.ts`):
  - `ErrorSummary.by_source`: 从 `SourceStats[]` 改为 `Record<string, number>`
  - 新增 `ErrorSummary.by_date?: Record<string, number>`

- **样式文件** (`obsidian-plugin/styles.css`):
  - 添加 `.error-overview-card` 样式
  - 添加 `.error-stat-card` 样式
  - 添加 `.stat-row` 相关样式

### 🔄 Refactoring - AI 配置架构重构

**背景**：
- 之前每个数据源分组都嵌入完整的 AI 配置（provider, api_key, base_url, model_name, temperature）
- 导致配置重复，难以维护，无法在多个分组间共享 AI 服务
- "整体处理" (single) 模式的需求不明确

**变更**：
- 将 AI 配置从嵌入模式改为服务引用模式
- 新增 `AIServiceManager` 管理可复用的 AI 服务列表
- 数据源分组通过 ID 引用 AI 服务，而不是直接嵌入配置

**新增文件**：
- `trendradar/sources/ai_service_manager.py` - AI 服务管理器

**新增 API 端点**：
- `GET /api/ai-services` - 获取所有 AI 服务
- `GET /api/ai-services/{service_id}` - 获取单个 AI 服务
- `POST /api/ai-services` - 创建新 AI 服务
- `PUT /api/ai-services/{service_id}` - 更新 AI 服务
- `DELETE /api/ai-services/{service_id}` - 删除 AI 服务

**AI 配置模式**：
1. **Single 模式** (`single`) - 整体处理
   - 使用一个 AI 服务处理整个流程
   - 只需配置 `analysis_service_id`
2. **Two-stage 模式** (`two-stage`) - 分阶段处理
   - 使用两个不同的 AI 服务
   - 必须同时配置 `analysis_service_id` 和 `aggregation_service_id`

**前端改进** (`obsidian-plugin/main.ts`):
- 调整 Tab 顺序：常规 → **AI 服务** → 数据源 → 数据源分组
- 新增独立的 AI 服务配置 Tab
- 数据源分组编辑界面根据 AI 模式动态显示服务选择器

**向后兼容性**：
- 自动从旧格式的 `ai_config` 迁移到新的 AI 服务列表
- 检测 `config/ai_config.json` 或 `~/.trendradar/ai_config.json`
- 打印警告信息提示用户重新配置

**迁移指南**：
1. 启动 API 服务，`AIServiceManager` 会自动检测并迁移旧的 AI 配置
2. 在 Obsidian 插件设置中重新配置每个数据源分组的 AI 服务
3. 验证 `~/.trendradar/ai_services.json` 确认服务列表

**影响范围**：
- `trendradar/sources/group_manager.py` - AIConfig 数据结构变更
- `trendradar/sources/ai_service_manager.py` - 新增文件
- `trendradar/core/group_analyzer.py` - AI 处理逻辑重构
- `api/main.py` - 新增 AI 服务 API 端点，更新分组 API 验证
- `obsidian-plugin/main.ts` - UI 优化和 Tab 顺序调整
- `obsidian-plugin/api.ts` - 新增 AI 服务 API 函数

### Bug Fixes - Bug 修复
**文件**: `trendradar/crawler/rss/fetcher.py`
- **Import 路径错误** (line 205, 261):
  - 错误: `from trendradar.api.errors import get_error_tracker`
  - 修正: `from api.errors import get_error_tracker`
  - **根本原因**: `api` 模块在项目根目录，不在 `trendradar` 包下

### Documentation - 文档
- 创建 `DEVELOPMENT_MISTAKES.md`: 记录开发过程中的错误和经验教训
  - 错误 001: 导入路径错误
  - 错误 002: 未遵循既定工作流程
  - 错误 003: API 服务器未重启
  - 错误 004: 未及时创建和更新 CHANGELOG

---

## [1.1.0] - 2026-01-10

### 新增功能 - 数据源分组管理
**文件**: `obsidian-plugin/main.ts`, `obsidian-plugin/api.ts`, `api/main.py`

#### 1. 数据源分组管理
- **新增Tab**：在设置页面添加"数据源分组"Tab
- **分组列表**：显示所有分组，包括名称、状态、数据源数量、AI配置
- **分组CRUD**：支持创建、编辑、删除分组
- **分组AI配置**：每个分组可以配置独立的AI模型和参数

#### 2. 本地数据源支持
- **本地目录类型**：支持从本地目录读取Markdown和TXT文件
- **文件过滤**：支持文件模式匹配（如 `*.md, *.txt`）
- **递归扫描**：支持递归子目录
- **自动标题提取**：从文件内容自动提取标题

#### 3. 分组-数据源关联
- **在分组中管理数据源**：可以在分组编辑界面直接管理数据源
- **添加现有数据源**：选择已创建的数据源添加到分组
- **在分组中创建数据源**：直接在分组中创建新数据源
- **移除数据源**：从分组中移除不需要的数据源

### 修改功能
#### 1. API扩展
- 新增分组管理API（5个端点）
- 扩展主题查询API（支持按分组过滤）
- 扩展任务API（支持按分组触发）

#### 2. 类型系统
- 扩展 `SourceConfig` 类型，添加 `'local'` 选项
- 新增 `SourceGroupModel` 接口
- 新增 `AIConfigModel` 接口

### 修复问题
#### 1. 严重问题修复
**问题**：分组与数据源无法关联
- **影响**：用户无法将数据源添加到分组
- **修复**：在分组编辑界面添加数据源管理功能

#### 2. TypeScript警告修复
- 修复 `config.type` 类型定义缺少 `'local'`
- 修复 `config.ai_config` 可能为 `undefined` 的警告

### 技术债务
1. **后端集成**：分组分析器(`GroupAnalyzer`)的AI分析部分还未完全实现
2. **命令行支持**：命令行参数还未添加分组支持
3. **文档同步**：需要更新用户文档

### 配置变更
#### 数据库表结构
```sql
-- analysis_themes 表新增字段
ALTER TABLE analysis_themes ADD COLUMN group_id TEXT;
ALTER TABLE analysis_themes ADD COLUMN group_name TEXT;

-- local_items 表（新建）
CREATE TABLE IF NOT EXISTS local_items (...);
```

### 升级指南
1. **无需配置迁移**：新功能向后兼容，不影响现有配置
2. **可选启用**：分组功能是可选的，不使用分组时行为与之前相同
3. **建议使用**：建议使用分组功能来组织数据源和管理AI配置

### 测试状态
- ✅ 后端单元测试通过
- ⚠️ 前端集成测试待验证
- ❌ 端到端测试待进行

---

## [1.0.1] - 2025-01-11

### Fixed - 错误追踪系统完善
**文件**: `api/errors.py`, `trendradar/crawler/rss/fetcher.py`, `obsidian-plugin/ErrorListModal.ts`, `obsidian-plugin/api.ts`

- **后端错误追踪器增强**：
  - 添加周期错误去重功能：同一周期内的重试不计入失败统计
  - 修改自动禁用逻辑：基于3天内的实际失败次数（≥5次禁用）
  - 添加按数据源分组的统计：返回每个数据源的失败次数和时间范围
  - 优化错误统计：排除重复错误（is_duplicate=True）

- **数据源变更时的错误清除**：
  - 删除数据源时：自动清除该数据源的所有错误
  - 更新数据源时：如果名称改变，清除旧名称的错误
  - 删除分组时：清除该分组下所有数据源的错误
  - 禁用分组时：清除该分组下所有数据源的错误

- **RSS 抓取器集成错误追踪**：
  - 在 fetch_feed 中添加错误记录逻辑
  - 在 fetch_all 中生成周期 ID（cycle_<timestamp>)
  - 抓取结束后自动清理周期缓存

- **前端错误统计界面增强**：
  - 修改模态框标题："错误日志" → "不可用数据源报错统计"
  - 添加统计周期显示："📊 统计周期：最近3天"
  - 添加按数据源分组的失败统计：
    - 显示每个数据源的失败次数
    - 显示失败时间范围（首次 ~ 最近）
    - 显示最近3条错误记录
  - 错误按钮始终可见（即使错误数为0，显示"0"）

- **API 类型定义更新** (`obsidian-plugin/api.ts`):
  - 添加 SourceStats 接口
  - ErrorSummary 接口添加 by_source 字段

### Technical Details
- **需求背景**：用户反馈错误统计不准确、按钮显示问题、模态框信息不清晰
- **设计原则**：
  - 周期重试不计入：同一周期内同一数据源的重复错误标记为 is_duplicate
  - 数据变更时清理：保持错误数据与数据源配置的一致性
  - 简化 UI：不自动检查，错误统计随数据更新一起刷新
- **性能优化**：
  - 使用缓存统计，避免重复计算
  - 周期缓存在抓取结束后清理，不占用内存
  - 错误数量限制：最多1000条，保留3天

---

## [1.0.0] - 2025-01-10

### Added - 错误追踪系统
**文件**: `api/errors.py`, `api/main.py`, `obsidian-plugin/main.ts`, `obsidian-plugin/view.ts`

- **后端错误追踪器**：轻量级错误记录和统计系统
  - 支持错误分类：数据源抓取失败、AI分析失败、存储失败、面板刷新失败
  - 错误严重程度：warning、error、critical
  - 自动清理：保留最近3天的错误，最多1000条
  - 数据源失败追踪：连续失败≥5次且在3天内自动禁用数据源

- **错误API**：
  - `GET /api/errors/summary` - 获取错误统计摘要
  - `GET /api/errors` - 获取错误列表
  - `PUT /api/errors/resolve` - 标记错误已解决

- **前端错误展示**：
  - 主面板右上角显示错误徽章（仅在有错误时显示）
  - 点击徽章打开错误列表模态框
  - 显示最近5条错误，包含时间、类型、严重程度和详细信息
  - 每30秒自动检查错误状态

### Added - 用户界面优化
**文件**: `obsidian-plugin/ThemeList.svelte`, `obsidian-plugin/view.ts`

- **Tab 过滤器**：
  - 未处理、已读、已归档、全部 四个标签页
  - 纯文本按钮风格（Apple UI风格）
  - 与刷新按钮同行显示

- **批量操作栏**：
  - 批量标记已读、归档、删除
  - 按钮在无选中项时自动禁用
  - 移除冗余的"批量"提示文字
  - 全选复选框移到左侧

- **排序控件**：
  - 改为下拉菜单，节省空间
  - 简化选项文字：重要性、时间、影响力
  - 移除冗余提示

- **导出功能**：
  - 卡片列表添加导出按钮（📤图标）
  - 详情页导出后自动删除卡片
  - 详情页删除操作无需确认

- **刷新功能**：
  - 点击刷新按钮触发所有数据源抓取
  - 不影响周期性抓取的循环周期
  - 显示提示"已触发抓取任务，正在后台处理..."

- **主动推送**：
  - 周期性抓取完成后自动显示通知
  - 新增内容时显示"✨ 新增 N 条信息"
  - 无新增内容时显示"📭 抓取完成，无新增内容"

### Fixed
- 修复点击批次标题（如"今天"）无法折叠的问题
  - 独立存储折叠状态到 `batchCollapsedStates` 对象
  - 避免每次数据更新时重置折叠状态

- 修复数据源更新 API 参数错误
  - 修正 `update_source()` 调用，添加必需的 `source_id` 参数

### Improved
- **Apple 风格 UI 设计**：
  - 纯文本按钮，无边框，透明背景
  - 激活状态：蓝色背景 + 白色文字
  - 悬停效果：浅灰色背景
  - 统一字体大小：13px，字重：500-600
  - 圆角：6-8px

- **性能优化**：
  - 错误追踪使用内存队列，避免频繁数据库写入
  - 每10分钟或队列变化时持久化到 JSON 文件
  - 前端30秒轮询错误状态，避免实时连接开销

- **响应式布局**：
  - 小屏幕自动换行
  - 紧凑布局，节省垂直空间

### Technical Details
- **数据持久化**：
  - 错误日志存储在 `data/error_logs.json`
  - 启动时自动加载未解决的错误
  - 自动清理3天前的已解决错误

- **API 响应**：
  - 用户主动触发的操作：立即返回简单提示
  - 周期性错误：在推送数据时顺带告知，如"📭 抓取完成，新增3条（2个数据源失败）"
  - 严重错误（如存储失败）：立即 Notice 通知

### Known Issues
- 无

### Migration Notes
- 无需数据迁移
- 错误日志系统向后兼容，自动创建数据文件

---

## 版本说明

- **当前版本**：开发中 (Unreleased)
- **最低 Obsidian 版本**：1.5.0
- **Python 要求**：Python 3.8+
- **依赖**：FastAPI, Obsidian API

---

## 格式说明

### 版本标记
- **[Unreleased]**: 尚未发布的更改
- **[Released]**: 已发布的版本号

### 更改类型
- **Added**: 新增功能
- **Changed**: 功能变更
- **Deprecated**: 即将废弃的功能
- **Removed**: 移除的功能
- **Fixed**: Bug 修复
- **Security**: 安全相关修复
- **Refactoring**: 重构
- **Improved**: 优化改进

### 格式要求
每次更新必须包含：
- 日期
- 修改的文件和具体位置（行号）
- 修改内容的详细描述
- 影响范围说明
