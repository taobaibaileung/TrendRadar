<script lang="ts">
  import type { ThemeDetail } from "./api";
  import { createEventDispatcher } from "svelte";

  export let theme: ThemeDetail;
  const dispatch = createEventDispatcher();

  function handleExport() {
    dispatch('export-note');
  }

  function handleArchive() {
    dispatch('archive');
  }

  function handleDelete() {
    dispatch('delete');
  }

  function parseTags(tagsStr: string | undefined): string[] {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return tagsStr.split(',').map(t => t.trim()).filter(t => t);
    }
  }

  function parseKeyPoints(keyPoints: string[] | string | undefined): string[] {
    if (!keyPoints) return [];
    if (Array.isArray(keyPoints)) return keyPoints;
    try {
      return JSON.parse(keyPoints);
    } catch {
      return [];
    }
  }

  $: tags = parseTags(theme.tags);
  $: keyPoints = parseKeyPoints(theme.key_points);
  $: isLinkSummary = theme.category === "链接汇总";
</script>

<div class="trendradar-theme-detail-container">
  <!-- 头部信息 -->
  <div class="header" class:link-summary-header={isLinkSummary}>
    <div class="header-top">
      <div class="meta-left">
        {#if !isLinkSummary}
          <span class="category">{theme.category}</span>
        {/if}
        {#if theme.status === 'archived'}
          <span class="status-badge archived">已归档</span>
        {:else if theme.status === 'read'}
          <span class="status-badge read">已读</span>
        {/if}
      </div>
      <div class="action-buttons">
        {#if !isLinkSummary}
          <button class="action-btn export" on:click={handleExport} title="导出为笔记">
            📝 导出笔记
          </button>
        {/if}
        {#if theme.status !== 'archived'}
          <button class="action-btn archive" on:click={handleArchive} title="归档">
            📥 归档
          </button>
        {/if}
        <button class="action-btn delete" on:click={handleDelete} title="删除">
          🗑 删除
        </button>
      </div>
    </div>

    <!-- 链接汇总类型不显示重要性、影响力、创建时间 -->
    {#if !isLinkSummary}
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">重要性</span>
          <span class="metric-value importance">{theme.importance}/10</span>
        </div>
        <div class="metric">
          <span class="metric-label">影响力</span>
          <span class="metric-value impact">{theme.impact}/10</span>
        </div>
        <div class="metric">
          <span class="metric-label">创建时间</span>
          <span class="metric-value">{new Date(theme.created_at).toLocaleString('zh-CN')}</span>
        </div>
      </div>
    {/if}

    <!-- 标签 -->
    {#if !isLinkSummary && tags.length > 0}
      <div class="tags">
        {#each tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- AI 摘要 -->
  {#if !isLinkSummary}
    <div class="section summary-section">
      <h2>📊 AI 分析摘要</h2>
      <p class="summary-text">{theme.summary}</p>
    </div>
  {/if}

  <!-- 链接汇总类型不显示核心要点 -->
  {#if !isLinkSummary && keyPoints.length > 0}
    <div class="section">
      <h2>💡 核心要点</h2>
      <ul class="key-points">
        {#each keyPoints as point}
          <li>{point}</li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- 原始文章来源 -->
  <div class="section">
    {#if !isLinkSummary}
      <h2>📰 信息来源 ({theme.articles.length})</h2>
    {/if}
    <div class="articles-list" class:link-summary-list={isLinkSummary}>
      {#each theme.articles as article}
        <div class="article-item">
          <div class="article-header">
            <a href={article.url} target="_blank" rel="noopener noreferrer" class="article-title">
              {article.title}
            </a>
            <span class="external-link">↗</span>
          </div>
          <div class="article-meta">
            <span class="source">
              {#if article.source_name}
                📡 {article.source_name}
              {:else}
                📄 {article.feed_id || '未知来源'}
              {/if}
            </span>
            <span class="author">
              {#if article.author}
                👤 {article.author}
              {/if}
            </span>
            <span class="time">
              🕐 {new Date(article.published_at).toLocaleString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <!-- 链接汇总类型不显示摘要 -->
          {#if !isLinkSummary && article.summary}
            <p class="article-summary">{article.summary}</p>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .trendradar-theme-detail-container {
    padding: 0 var(--size-4-2);
    max-height: 70vh;
    overflow-y: auto;
  }

  /* 头部 */
  .header {
    margin-bottom: var(--size-4-4);
    padding-bottom: var(--size-4-4);
    border-bottom: 2px solid var(--background-modifier-border);
  }

  /* 链接汇总类型：不显示分割线 */
  .link-summary-header {
    border-bottom: none;
    padding-bottom: 0;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-4-3);
    flex-wrap: wrap;
    gap: var(--size-4-2);
  }

  .meta-left {
    display: flex;
    align-items: center;
    gap: var(--size-4-2);
  }

  .category {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    padding: 4px 12px;
    border-radius: var(--radius-m);
    font-weight: 600;
    font-size: var(--font-ui-small);
  }

  .status-badge {
    padding: 2px 8px;
    border-radius: var(--radius-s);
    font-size: var(--font-ui-smaller);
  }

  .status-badge.archived {
    background-color: var(--text-faint);
    color: var(--background-primary);
  }

  .status-badge.read {
    background-color: var(--background-modifier-border);
    color: var(--text-muted);
  }

  .action-buttons {
    display: flex;
    gap: var(--size-4-2);
  }

  .action-btn {
    padding: 6px 12px;
    border-radius: var(--radius-s);
    border: 1px solid var(--background-modifier-border);
    background-color: var(--background-secondary);
    cursor: pointer;
    font-size: var(--font-ui-small);
    transition: all 0.15s;
  }

  .action-btn:hover {
    background-color: var(--background-secondary-alt);
  }

  .action-btn.export {
    border-color: var(--interactive-accent);
    color: var(--interactive-accent);
  }

  .action-btn.delete:hover {
    background-color: rgba(255, 100, 100, 0.2);
    border-color: var(--color-red);
  }

  .title {
    font-size: var(--font-ui-large);
    font-weight: 700;
    margin: var(--size-4-2) 0;
    line-height: 1.3;
  }

  .metrics {
    display: flex;
    gap: var(--size-4-4);
    margin-bottom: var(--size-4-3);
    flex-wrap: wrap;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .metric-label {
    font-size: var(--font-ui-smaller);
    color: var(--text-faint);
  }

  .metric-value {
    font-weight: 600;
    font-size: var(--font-ui-small);
  }

  .metric-value.importance {
    color: var(--color-red);
  }

  .metric-value.impact {
    color: var(--color-orange);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-4-2);
  }

  .tag {
    background-color: var(--background-modifier-border);
    color: var(--text-muted);
    padding: 3px 10px;
    border-radius: var(--radius-m);
    font-size: var(--font-ui-smaller);
  }

  /* 区块 */
  .section {
    margin-bottom: var(--size-4-4);
  }

  .section h2 {
    font-size: var(--font-ui-medium);
    font-weight: 600;
    margin-bottom: var(--size-4-3);
    padding-bottom: var(--size-4-2);
    border-bottom: 1px solid var(--background-modifier-border);
    color: var(--text-normal);
  }

  .summary-text {
    line-height: 1.7;
    color: var(--text-normal);
    background-color: var(--background-secondary);
    padding: var(--size-4-3);
    border-radius: var(--radius-m);
    border-left: 3px solid var(--interactive-accent);
  }

  .key-points {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .key-points li {
    position: relative;
    padding-left: var(--size-4-4);
    margin-bottom: var(--size-4-2);
    line-height: 1.6;
  }

  .key-points li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--interactive-accent);
    font-weight: bold;
  }

  /* 文章列表 */
  .articles-list {
    display: flex;
    flex-direction: column;
    gap: var(--size-4-3);
    max-height: 300px;
    overflow-y: auto;
    padding-right: var(--size-4-2);
  }

  /* 链接汇总类型：无边距，更紧凑 */
  .link-summary-list {
    gap: var(--size-4-2);
    max-height: 400px;
  }

  .article-item {
    padding: var(--size-4-3);
    border-radius: var(--radius-m);
    background-color: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    transition: all 0.15s;
  }

  .article-item:hover {
    border-color: var(--background-modifier-border-hover);
    background-color: var(--background-secondary-alt);
  }

  .article-header {
    display: flex;
    align-items: flex-start;
    gap: var(--size-4-2);
  }

  .article-title {
    font-weight: 500;
    text-decoration: none;
    color: var(--text-normal);
    flex: 1;
    line-height: 1.4;
  }

  .article-title:hover {
    color: var(--interactive-accent);
    text-decoration: underline;
  }

  .external-link {
    color: var(--text-faint);
    font-size: 12px;
  }

  .article-meta {
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
    margin-top: var(--size-4-2);
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-4-3);
  }

  .article-summary {
    font-size: var(--font-ui-small);
    color: var(--text-muted);
    margin-top: var(--size-4-2);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
