<script lang="ts">
  import type { ThemeSummary } from "./api";
  import { createEventDispatcher } from "svelte";

  export let themes: ThemeSummary[] = [];
  export let newThemeAgeDays: number = 1;
  
  const dispatch = createEventDispatcher();

  // 按时间批次分组
  interface ThemeBatch {
    label: string;
    themes: ThemeSummary[];
    collapsed: boolean;
  }

  $: batches = groupThemesByBatch(themes);

  function groupThemesByBatch(themes: ThemeSummary[]): ThemeBatch[] {
    if (!themes || themes.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const groups: { [key: string]: ThemeSummary[] } = {
      '今天': [],
      '昨天': [],
      '更早': []
    };

    for (const theme of themes) {
      const createdAt = new Date(theme.created_at);
      const themeDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
      
      if (themeDate.getTime() >= today.getTime()) {
        groups['今天'].push(theme);
      } else if (themeDate.getTime() >= yesterday.getTime()) {
        groups['昨天'].push(theme);
      } else {
        groups['更早'].push(theme);
      }
    }

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([label, items]) => ({
        label,
        themes: items.sort((a, b) => b.importance - a.importance),
        collapsed: false
      }));
  }

  function toggleBatch(index: number) {
    batches[index].collapsed = !batches[index].collapsed;
    batches = batches; // 触发更新
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

  function handleDelete(e: Event, themeId: number) {
    e.stopPropagation();
    if (confirm('确定要删除这条信息吗？')) {
      dispatch('theme-delete', { themeId });
    }
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
</script>

<div class="trendradar-theme-list-container">
  {#if themes.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>暂无主题数据</p>
      <p class="hint">点击刷新按钮获取最新信息</p>
    </div>
  {:else}
    {#each batches as batch, batchIndex}
      <div class="batch-group">
        <div class="batch-header" on:click={() => toggleBatch(batchIndex)} role="button" tabindex="0">
          <span class="batch-toggle">{batch.collapsed ? '▶' : '▼'}</span>
          <span class="batch-label">{batch.label}</span>
          <span class="batch-count">{batch.themes.length} 条</span>
        </div>
        
        {#if !batch.collapsed}
          <div class="theme-list">
            {#each batch.themes as theme (theme.id)}
              <div 
                class="theme-card {theme.status === 'read' ? 'read' : ''} {theme.status === 'archived' ? 'archived' : ''}"
                on:click={() => handleThemeClick(theme.id)} 
                role="button" 
                tabindex="0"
              >
                <!-- 卡片头部 -->
                <div class="card-header">
                  <div class="card-meta">
                    <span class="category">{theme.category}</span>
                    {#if isNew(theme) && theme.status !== 'read'}
                      <span class="new-badge">NEW</span>
                    {/if}
                    {#if theme.status === 'archived'}
                      <span class="archived-badge">已归档</span>
                    {/if}
                  </div>
                  <div class="importance-badge {getImportanceClass(theme.importance)}">
                    ⭐ {theme.importance}
                  </div>
                </div>
                
                <!-- 标题 -->
                <h2 class="title">{theme.title}</h2>
                
                <!-- 摘要 -->
                <p class="summary">{theme.summary}</p>
                
                <!-- 标签 -->
                {#if theme.tags}
                  <div class="tags">
                    {#each parseTags(theme.tags).slice(0, 4) as tag}
                      <span class="tag">{tag}</span>
                    {/each}
                  </div>
                {/if}
                
                <!-- 卡片底部 -->
                <div class="card-footer">
                  <div class="footer-info">
                    <span class="impact">影响力: {theme.impact}/10</span>
                    <span class="time">{new Date(theme.created_at).toLocaleString('zh-CN', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                  <div class="card-actions">
                    {#if theme.status !== 'read' && theme.status !== 'archived'}
                      <button class="action-btn" on:click={(e) => handleMarkRead(e, theme.id)} title="标记已读">
                        ✓
                      </button>
                    {/if}
                    {#if theme.status !== 'archived'}
                      <button class="action-btn" on:click={(e) => handleArchive(e, theme.id)} title="归档">
                        📥
                      </button>
                    {/if}
                    <button class="action-btn delete" on:click={(e) => handleDelete(e, theme.id)} title="删除">
                      🗑
                    </button>
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
    padding: var(--size-4-2);
    height: 100%;
    overflow-y: auto;
  }

  .empty-state {
    text-align: center;
    margin-top: 60px;
    color: var(--text-muted);
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-state .hint {
    font-size: var(--font-ui-smaller);
    color: var(--text-faint);
  }

  /* 批次分组 */
  .batch-group {
    margin-bottom: var(--size-4-4);
  }

  .batch-header {
    display: flex;
    align-items: center;
    padding: var(--size-4-2) var(--size-4-3);
    background-color: var(--background-secondary);
    border-radius: var(--radius-s);
    cursor: pointer;
    user-select: none;
    margin-bottom: var(--size-4-2);
  }

  .batch-header:hover {
    background-color: var(--background-secondary-alt);
  }

  .batch-toggle {
    margin-right: var(--size-4-2);
    font-size: 10px;
    color: var(--text-muted);
  }

  .batch-label {
    font-weight: 600;
    flex: 1;
  }

  .batch-count {
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
  }

  /* 主题列表 */
  .theme-list {
    display: grid;
    gap: var(--size-4-3);
  }

  /* 主题卡片 */
  .theme-card {
    background-color: var(--background-secondary);
    border-radius: var(--radius-m);
    padding: var(--size-4-3);
    border-left: 3px solid var(--interactive-accent);
    transition: all 0.15s ease;
    cursor: pointer;
  }

  .theme-card:hover {
    background-color: var(--background-secondary-alt);
    transform: translateX(2px);
  }

  .theme-card.read {
    opacity: 0.7;
    border-left-color: var(--text-muted);
  }

  .theme-card.archived {
    opacity: 0.5;
    border-left-color: var(--text-faint);
  }

  /* 卡片头部 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-4-2);
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: var(--size-4-2);
  }

  .category {
    background-color: var(--background-modifier-accent);
    color: var(--text-accent);
    padding: 2px 8px;
    border-radius: var(--radius-s);
    font-size: var(--font-ui-smaller);
    font-weight: 500;
  }

  .new-badge {
    background-color: var(--color-red);
    color: white;
    padding: 1px 6px;
    border-radius: var(--radius-s);
    font-size: 10px;
    font-weight: 600;
  }

  .archived-badge {
    background-color: var(--text-faint);
    color: var(--background-primary);
    padding: 1px 6px;
    border-radius: var(--radius-s);
    font-size: 10px;
  }

  .importance-badge {
    font-size: var(--font-ui-smaller);
    padding: 2px 8px;
    border-radius: var(--radius-s);
    font-weight: 500;
  }

  .importance-badge.high {
    background-color: rgba(255, 100, 100, 0.2);
    color: var(--color-red);
  }

  .importance-badge.medium {
    background-color: rgba(255, 200, 100, 0.2);
    color: var(--color-yellow);
  }

  .importance-badge.low {
    background-color: rgba(100, 200, 100, 0.2);
    color: var(--color-green);
  }

  /* 标题 */
  .title {
    font-size: var(--font-ui-medium);
    font-weight: 600;
    margin-bottom: var(--size-4-2);
    line-height: 1.4;
  }

  /* 摘要 */
  .summary {
    color: var(--text-muted);
    font-size: var(--font-ui-small);
    margin-bottom: var(--size-4-2);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 标签 */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-4-1);
    margin-bottom: var(--size-4-2);
  }

  .tag {
    background-color: var(--background-modifier-border);
    color: var(--text-muted);
    padding: 1px 6px;
    border-radius: var(--radius-s);
    font-size: 11px;
  }

  /* 卡片底部 */
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-ui-smaller);
    color: var(--text-faint);
    padding-top: var(--size-4-2);
    border-top: 1px solid var(--background-modifier-border);
  }

  .footer-info {
    display: flex;
    gap: var(--size-4-3);
  }

  .card-actions {
    display: flex;
    gap: var(--size-4-1);
    opacity: 0;
    transition: opacity 0.15s;
  }

  .theme-card:hover .card-actions {
    opacity: 1;
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-s);
    font-size: 14px;
    transition: background-color 0.15s;
  }

  .action-btn:hover {
    background-color: var(--background-modifier-hover);
  }

  .action-btn.delete:hover {
    background-color: rgba(255, 100, 100, 0.2);
  }
</style>
