<script lang="ts">
  import type { ThemeSummary } from "./api";
  import { createEventDispatcher } from "svelte";

  export let themes: ThemeSummary[] = [];
  export let newThemeAgeDays: number = 1;
  export let errorCount: number = 0;

  const dispatch = createEventDispatcher();

  // Tab 过滤
  export let filterTab: 'all' | 'unread' | 'read' | 'archived' = 'unread';
  export let selectedThemes: Set<number> = new Set();
  export let sortBy: 'time' | 'importance' | 'impact' = 'time';

  // 按时间批次分组
  interface ThemeBatch {
    label: string;
    themes: ThemeSummary[];
    collapsed: boolean;
  }

  // 独立存储折叠状态，避免每次重新创建时重置
  let batchCollapsedStates: { [key: string]: boolean } = {};

  $: filteredThemes = filterThemes(themes, filterTab);
  $: batchGroups = groupThemesByBatch(filteredThemes, sortBy);
  $: batches = batchGroups.map(group => ({
    ...group,
    collapsed: batchCollapsedStates[group.label] || false
  }));
  $: allSelected = filteredThemes.length > 0 && selectedThemes.size === filteredThemes.length;
  $: someSelected = selectedThemes.size > 0 && selectedThemes.size < filteredThemes.length;

  function filterThemes(themes: ThemeSummary[], tab: string): ThemeSummary[] {
    switch (tab) {
      case 'unread':
        return themes.filter(t => t.status !== 'read' && t.status !== 'archived');
      case 'read':
        return themes.filter(t => t.status === 'read');
      case 'archived':
        return themes.filter(t => t.status === 'archived');
      default:
        return themes;
    }
  }

  function groupThemesByBatch(
    themes: ThemeSummary[],
    sortBy: 'time' | 'importance' | 'impact'
  ): ThemeBatch[] {
    if (!themes || themes.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const groups: { [key: string]: ThemeSummary[] } = {
      '刚刚': [],
      '今天': [],
      '昨天': [],
      '更早': []
    };

    for (const theme of themes) {
      const createdAt = new Date(theme.created_at);
      const themeDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        groups['刚刚'].push(theme);
      } else if (themeDate.getTime() >= today.getTime()) {
        groups['今天'].push(theme);
      } else if (themeDate.getTime() >= yesterday.getTime()) {
        groups['昨天'].push(theme);
      } else {
        groups['更早'].push(theme);
      }
    }

    // 排序
    const sortFn = getSortFn(sortBy);

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([label, items]) => ({
        label,
        themes: items.sort(sortFn),
        collapsed: false
      }));
  }

  function getSortFn(sortBy: string) {
    switch (sortBy) {
      case 'time':
        return (a: ThemeSummary, b: ThemeSummary) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'importance':
        return (a: ThemeSummary, b: ThemeSummary) => b.importance - a.importance;
      case 'impact':
        return (a: ThemeSummary, b: ThemeSummary) => (b.impact || 0) - (a.impact || 0);
      default:
        return (a: ThemeSummary, b: ThemeSummary) => b.importance - a.importance;
    }
  }

  function toggleBatch(index: number) {
    const label = batches[index].label;
    batchCollapsedStates[label] = !batchCollapsedStates[label];
    batchCollapsedStates = { ...batchCollapsedStates }; // 触发更新
  }

  function toggleThemeSelection(themeId: number) {
    if (selectedThemes.has(themeId)) {
      selectedThemes.delete(themeId);
    } else {
      selectedThemes.add(themeId);
    }
    selectedThemes = new Set(selectedThemes); // 触发更新
  }

  function toggleSelectAll() {
    if (allSelected || someSelected) {
      selectedThemes.clear();
    } else {
      filteredThemes.forEach(t => selectedThemes.add(t.id));
    }
    selectedThemes = new Set(selectedThemes);
  }

  async function batchMarkRead() {
    for (const themeId of selectedThemes) {
      dispatch('theme-mark-read', { themeId });
    }
    selectedThemes.clear();
    selectedThemes = new Set();
  }

  async function batchArchive() {
    for (const themeId of selectedThemes) {
      dispatch('theme-archive', { themeId });
    }
    selectedThemes.clear();
    selectedThemes = new Set();
  }

  async function batchDelete() {
    const count = selectedThemes.size;
    if (count > 1) {
      if (!confirm(`确定要删除选中的 ${count} 条信息吗？`)) {
        return;
      }
    }

    for (const themeId of selectedThemes) {
      dispatch('theme-delete', { themeId });
    }
    selectedThemes.clear();
    selectedThemes = new Set();
  }

  function handleThemeClick(themeId: number) {
    dispatch('theme-click', { themeId });
  }

  function handleMarkRead(e: Event, themeId: number) {
    e.stopPropagation();
    dispatch('theme-mark-read', { themeId });
  }

  function handleArchive(e: Event, themeId: number) {
    e.stopPropagation();
    dispatch('theme-archive', { themeId });
  }

  function handleUnarchive(e: Event, themeId: number) {
    e.stopPropagation();
    dispatch('theme-unarchive', { themeId });
  }

  function handleDelete(e: Event, themeId: number) {
    e.stopPropagation();
    // 单个删除直接执行，不提示
    dispatch('theme-delete', { themeId });
  }

  async function handleExport(e: Event, themeId: number) {
    e.stopPropagation();
    dispatch('theme-export', { themeId });
  }

  async function handleRefresh() {
    dispatch('refresh');
  }

  function showErrorLog() {
    dispatch('show-errors');
  }

  function isNew(theme: ThemeSummary): boolean {
    const createdAt = new Date(theme.created_at);
    const ageMs = Date.now() - createdAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays <= newThemeAgeDays;
  }

  function getImportanceClass(importance: number): string {
    if (importance >= 8) return 'high';
    if (importance >= 5) return 'medium';
    return 'low';
  }

  function parseTags(tagsStr: string | undefined): string[] {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return tagsStr.split(',').map(t => t.trim()).filter(t => t);
    }
  }

  function parseKeywords(keywordsStr: string | undefined): string[] {
    if (!keywordsStr) return [];
    try {
      return JSON.parse(keywordsStr);
    } catch {
      return keywordsStr.split(',').map(t => t.trim()).filter(t => t);
    }
  }
</script>

<div class="trendradar-theme-list-container">
  {#if themes.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>暂无主题数据</p>
      <p class="hint">点击刷新按钮获取最新信息</p>
    </div>
  {:else}
    <!-- Tab 过滤器 + 刷新 -->
    <div class="tab-filter-bar">
      <!-- 刷新按钮（放在最前面） -->
      <button class="icon-btn refresh-btn" on:click={handleRefresh} title="刷新">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>

      <!-- 错误统计按钮（始终显示） -->
      <button class="icon-btn error-badge" on:click={showErrorLog} title="查看错误">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.16L12 17.58l8.47-4.29a2 2 0 0 0 1.71-3.16l-8.47-14.12a2 2 0 0 0-3.42 0z"></path>
        </svg>
      </button>

      <div class="tab-filter">
        <button
          class="tab-btn {filterTab === 'unread' ? 'active' : ''}"
          on:click={() => filterTab = 'unread'}
        >
          待阅
        </button>
        <button
          class="tab-btn {filterTab === 'read' ? 'active' : ''}"
          on:click={() => filterTab = 'read'}
        >
          已读
        </button>
        <button
          class="tab-btn {filterTab === 'archived' ? 'active' : ''}"
          on:click={() => filterTab = 'archived'}
        >
          归档
        </button>
        <button
          class="tab-btn {filterTab === 'all' ? 'active' : ''}"
          on:click={() => filterTab = 'all'}
        >
          All
        </button>
      </div>
    </div>

    <!-- 控制栏：全选 + 批量操作 + 排序 -->
    <div class="control-bar">
      <!-- 全选 -->
      {#if filteredThemes.length > 0}
      <label class="select-all-compact">
        <input
          type="checkbox"
          checked={allSelected}
          indeterminate={someSelected}
          on:change={toggleSelectAll}
        />
        <span>全选</span>
      </label>
      {/if}

      <!-- 批量操作 -->
      <div class="batch-actions-compact">
        <div class="batch-actions-buttons">
          <button
            class="batch-btn compact"
            on:click={batchMarkRead}
            title="标记已读"
            disabled={selectedThemes.size === 0}
          >
            已读
          </button>
          <button
            class="batch-btn compact"
            on:click={batchArchive}
            title="归档"
            disabled={selectedThemes.size === 0}
          >
            归档
          </button>
          <button
            class="batch-btn compact"
            on:click={batchDelete}
            title="删除"
            disabled={selectedThemes.size === 0}
          >
            删除
          </button>
        </div>
      </div>

      <!-- 排序 -->
      <div class="sort-controls-compact">
        <select class="sort-select-compact" bind:value={sortBy} on:change>
          <option value="importance">重要性</option>
          <option value="time">时间</option>
          <option value="impact">影响力</option>
        </select>
      </div>
    </div>

    {#each batches as batch, batchIndex}
      <div class="batch-group">
        <div class="batch-header" on:click={() => toggleBatch(batchIndex)} role="button" tabindex="0">
          <span class="batch-toggle">{batch.collapsed ? '▶' : '▼'}</span>
          <span class="batch-label">{batch.label}</span>
          <span class="batch-count">{batch.themes.length}</span>
        </div>

        {#if !batch.collapsed}
          <div class="theme-list">
            {#each batch.themes as theme (theme.id)}
              <div
                class="theme-card {theme.status === 'read' ? 'read' : ''} {theme.status === 'archived' ? 'archived' : ''} {selectedThemes.has(theme.id) ? 'selected' : ''}"
                on:click={() => handleThemeClick(theme.id)}
                role="button"
                tabindex="0"
              >
                <!-- 选择框 -->
                <div class="checkbox-wrapper" on:click|stopPropagation>
                  <input
                    type="checkbox"
                    checked={selectedThemes.has(theme.id)}
                    on:change|stopPropagation={() => toggleThemeSelection(theme.id)}
                  />
                </div>

                <!-- 卡片头部：标题与状态 -->
                <div class="card-header">
                  <div class="title-row">
                    {#if isNew(theme) && theme.status !== 'read'}
                      <span class="new-dot" title="新内容"></span>
                    {/if}
                    {#if theme.is_duplicate && theme.is_duplicate === 1}
                      <span class="duplicate-badge" title="重复内容 (相似度: {(theme.duplicate_similarity || 0) * 100}%})">🔄</span>
                    {/if}
                    <h2 class="title">{theme.title}</h2>
                  </div>
                  <div class="importance-badge {getImportanceClass(theme.importance)}">
                    {theme.importance}
                  </div>
                </div>

                <!-- 摘要 (紧凑模式) -->
                <p class="summary">{theme.summary}</p>

                <!-- 关键词与标签 -->
                <div class="meta-row">
                  {#if theme.keywords}
                    <div class="keywords">
                      {#each parseKeywords(theme.keywords).slice(0, 3) as kw}
                        <span class="keyword">#{kw}</span>
                      {/each}
                    </div>
                  {/if}
                  <span class="category-tag">{theme.category}</span>
                </div>

                <!-- 卡片底部：时间与操作 -->
                <div class="card-footer">
                  <span class="time">{new Date(theme.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>

                  <div class="card-actions">
                    {#if theme.status === 'archived'}
                      <button class="action-btn unarchive" on:click={(e) => handleUnarchive(e, theme.id)} title="取消归档">↑</button>
                    {:else}
                      {#if theme.status !== 'read'}
                        <button class="action-btn read" on:click={(e) => handleMarkRead(e, theme.id)} title="标记已读">✓</button>
                      {/if}
                      <button class="action-btn archive" on:click={(e) => handleArchive(e, theme.id)} title="归档">📦</button>
                    {/if}
                    <button class="action-btn export" on:click={(e) => handleExport(e, theme.id)} title="导出并删除">📤</button>
                    <button class="action-btn delete" on:click={(e) => handleDelete(e, theme.id)} title="删除">🗑️</button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .trendradar-theme-list-container {
    padding: 8px;
    height: 100%;
    overflow-y: auto;
  }

  .empty-state {
    text-align: center;
    margin-top: 60px;
    color: var(--text-muted);
  }

  .empty-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }

  /* Tab 过滤器栏 */
  .tab-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px;
    margin-bottom: 8px;
    background: var(--background-secondary);
    border-radius: 8px;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .tab-filter {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  .tab-btn {
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    background: var(--background-modifier-hover);
    color: var(--text-normal);
  }

  .tab-btn.active {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    font-weight: 600;
  }

  /* 图标按钮（刷新、错误统计） */
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 8px;
    font-size: 16px;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 32px;
  }

  .icon-btn:hover {
    background: var(--background-modifier-hover);
  }

  /* 刷新按钮 */
  .refresh-btn {
    color: var(--interactive-accent);
  }

  /* 错误徽章 */
  .error-badge {
    color: var(--color-orange);
    font-weight: 600;
    font-size: 14px;
    padding: 6px 10px;
  }

  .error-badge:hover {
    background: rgba(255, 165, 0, 0.1);
  }

  /* 批量操作栏 */
  .batch-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: var(--background-modifier-form-field);
    border: 2px solid var(--interactive-accent);
    border-radius: 6px;
  }

  .selected-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--interactive-accent);
  }

  .batch-actions {
    display: flex;
    gap: 6px;
  }

  /* 控制栏：批量操作 + 排序 + 全选 */
  .control-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    margin-bottom: 8px;
    background: var(--background-secondary);
    border-radius: 8px;
    flex-wrap: wrap;
  }

  /* 紧凑批量操作 */
  .batch-actions-compact {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .batch-actions-buttons {
    display: flex;
    gap: 2px;
  }

  .batch-btn.compact {
    padding: 4px 10px;
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-normal);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .batch-btn.compact:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .batch-btn.compact:hover:not(:disabled) {
    background: var(--background-modifier-hover);
  }

  /* 紧凑排序控件 */
  .sort-controls-compact {
    flex: 0;
  }

  .sort-select-compact {
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 500;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    color: var(--text-normal);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  /* 紧凑全选 */
  .select-all-compact {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-normal);
    cursor: pointer;
    user-select: none;
  }

  .select-all-compact input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--interactive-accent);
  }

  /* 原有批量操作按钮样式 */
  .batch-btn {
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    background: var(--interactive-normal);
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    color: var(--text-normal);
    cursor: pointer;
    transition: all 0.2s;
  }

  .batch-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .batch-btn:hover:not(:disabled) {
    background: var(--interactive-hover);
    transform: translateY(-1px);
  }

  .batch-btn.read:hover {
    border-color: var(--color-green);
  }

  .batch-btn.archive:hover {
    border-color: var(--color-orange);
  }

  .batch-btn.delete:hover {
    border-color: var(--color-red);
    background: var(--color-error);
    color: var(--text-on-accent);
  }

  .batch-btn.compact:hover:not(:disabled) {
    background: var(--interactive-hover);
  }

  .batch-btn.compact.read:hover {
    border-color: var(--color-green);
  }

  .batch-btn.compact.archive:hover {
    border-color: var(--color-orange);
  }

  .batch-btn.compact.delete:hover {
    border-color: var(--color-red);
  }

  .sort-select-compact:hover {
    border-color: var(--interactive-accent);
  }

  .sort-select-compact:focus {
    outline: none;
    border-color: var(--interactive-accent);
    box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2);
  }

  /* 批次分组 */
  .batch-group {
    margin-bottom: 12px;
  }

  .batch-group.archived-group {
    opacity: 0.9;
    margin-top: 20px;
    padding-top: 12px;
    border-top: 2px solid var(--background-modifier-border);
  }

  .batch-group.archived-group .batch-header {
    color: var(--text-faint);
    font-style: italic;
  }

  .batch-group.archived-group .theme-card {
    background-color: var(--background-secondary);
    border-color: var(--background-modifier-border-hover);
  }

  .batch-header {
    display: flex;
    align-items: center;
    padding: 6px 8px;
    font-size: 13px;
    color: var(--text-normal);
    cursor: pointer;
    user-select: none;
    margin-bottom: 6px;
    border-radius: 4px;
    background: var(--background-modifier-form-field);
    font-weight: 600;
  }

  .batch-header:hover {
    background-color: var(--background-modifier-hover);
  }

  .batch-group.archived-group .batch-header {
    background: var(--background-secondary);
    color: var(--text-muted);
  }

  .batch-toggle {
    margin-right: 6px;
    font-size: 10px;
  }

  .batch-label {
    font-weight: 600;
    flex: 1;
  }

  .batch-count {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }

  .batch-group.archived-group .batch-count {
    background-color: var(--background-modifier-border);
    color: var(--text-muted);
  }

  /* 主题列表 */
  .theme-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 紧凑主题卡片 */
  .theme-card {
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    padding: 10px 10px 10px 36px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
  }

  .theme-card:hover {
    border-color: var(--interactive-accent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .theme-card.read {
    opacity: 0.6;
    background-color: var(--background-secondary);
  }

  /* 头部 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .title-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .new-dot {
    width: 6px;
    height: 6px;
    background-color: var(--color-red);
    border-radius: 50%;
    flex-shrink: 0;
    transform: translateY(-2px);
  }

  .duplicate-badge {
    font-size: 12px;
    flex-shrink: 0;
    margin-right: 4px;
    opacity: 0.8;
    filter: grayscale(0.3);
  }

  .duplicate-badge:hover {
    opacity: 1;
    filter: grayscale(0);
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    color: var(--text-normal);
  }

  .importance-badge {
    font-size: 10px;
    font-weight: bold;
    padding: 1px 5px;
    border-radius: 4px;
    margin-left: 8px;
    flex-shrink: 0;
    background-color: var(--background-modifier-border);
    color: var(--text-muted);
  }

  .importance-badge.high {
    color: var(--color-red);
    background-color: rgba(var(--color-red-rgb), 0.1);
  }

  /* 摘要 */
  .summary {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0 0 8px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 元数据行 */
  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 11px;
  }

  .keywords {
    display: flex;
    gap: 6px;
    overflow: hidden;
  }

  .keyword {
    color: var(--interactive-accent);
  }

  .category-tag {
    background-color: var(--background-modifier-border);
    color: var(--text-muted);
    padding: 1px 5px;
    border-radius: 3px;
    white-space: nowrap;
  }

  /* 底部 */
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 6px;
    border-top: 1px dashed var(--background-modifier-border);
  }

  .time {
    font-size: 10px;
    color: var(--text-faint);
  }

  .card-actions {
    display: flex;
    gap: 4px;
  }

  /* 复选框容器 */
  .checkbox-wrapper {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 18px;
    height: 18px;
    z-index: 10;
    cursor: pointer;
  }

  .checkbox-wrapper input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--interactive-accent);
  }

  /* 选中状态 */
  .theme-card.selected {
    border-color: var(--interactive-accent) !important;
    background-color: var(--background-modifier-form-field) !important;
    box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2);
  }

  .theme-card.read {
    opacity: 0.6;
    background-color: var(--background-secondary);
  }

  .action-btn {
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    padding: 3px 8px;
    font-size: 12px;
    color: var(--text-normal);
    cursor: pointer;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .action-btn.read:hover {
    color: var(--color-green);
    border-color: var(--color-green);
    background-color: rgba(var(--color-green-rgb), 0.1);
  }

  .action-btn.archive:hover {
    color: var(--color-orange);
    border-color: var(--color-orange);
    background-color: rgba(var(--color-orange-rgb), 0.1);
  }

  .action-btn.unarchive:hover {
    color: var(--interactive-accent);
    border-color: var(--interactive-accent);
    background-color: rgba(var(--interactive-accent-rgb), 0.1);
  }

  .action-btn.delete:hover {
    color: var(--color-red);
    border-color: var(--color-red);
    background-color: rgba(var(--color-red-rgb), 0.15);
  }

  .action-btn.export:hover {
    color: var(--interactive-accent);
    border-color: var(--interactive-accent);
    background-color: rgba(var(--interactive-accent-rgb), 0.1);
  }
</style>
