import { App, Modal } from "obsidian";
import type { ErrorSummary } from "./api";
import type TrendRadarPlugin from "./main";

export class ErrorListModal extends Modal {
    private errorSummary: ErrorSummary;
    private plugin: TrendRadarPlugin;

    constructor(
        app: App,
        errorSummary: ErrorSummary,
        plugin: TrendRadarPlugin
    ) {
        super(app);
        this.errorSummary = errorSummary;
        this.plugin = plugin;
        this.modalEl.addClass('trendradar-error-modal');
    }

    onOpen() {
        this.titleEl.setText('不可用数据源报错统计');

        const contentEl = this.contentEl;
        contentEl.empty();
        contentEl.addClass('trendradar-error-content');

        // 总览卡片
        const overviewCard = contentEl.createDiv({ cls: 'error-overview-card' });
        overviewCard.innerHTML = `
            <div class="overview-item">
                <span class="overview-label">📊 统计周期</span>
                <span class="overview-value">最近3天</span>
            </div>
            <div class="overview-item">
                <span class="overview-label">⚠️ 报错总数</span>
                <span class="overview-value">${this.errorSummary.total_unresolved}</span>
            </div>
        `;

        // 按环节分类
        if (Object.keys(this.errorSummary.by_type).length > 0) {
            const typeCard = this.createStatCard('按环节分类');
            const typeLabels: Record<string, string> = {
                'source': '抓取',
                'ai': '处理',
                'storage': '存储',
                'display': '面板'
            };

            for (const [type, count] of Object.entries(this.errorSummary.by_type)) {
                const label = typeLabels[type] || type;
                const row = typeCard.createDiv({ cls: 'stat-row' });
                row.innerHTML = `
                    <span class="stat-row-label">${label}</span>
                    <span class="stat-row-value">${count}</span>
                `;
            }
            contentEl.appendChild(typeCard);
        }

        // 按数据源分类
        if (this.errorSummary.by_source && Object.keys(this.errorSummary.by_source).length > 0) {
            const sourceCard = this.createStatCard('按数据源分类');
            for (const [source, count] of Object.entries(this.errorSummary.by_source)) {
                const row = sourceCard.createDiv({ cls: 'stat-row' });
                row.innerHTML = `
                    <span class="stat-row-label">${source}</span>
                    <span class="stat-row-value">${count}次</span>
                `;
            }
            contentEl.appendChild(sourceCard);
        }

        // 按日期分类
        if (this.errorSummary.by_date && Object.keys(this.errorSummary.by_date).length > 0) {
            const dateCard = this.createStatCard('按日期分类');
            for (const [date, count] of Object.entries(this.errorSummary.by_date)) {
                const row = dateCard.createDiv({ cls: 'stat-row' });
                row.innerHTML = `
                    <span class="stat-row-label">${date}</span>
                    <span class="stat-row-value">${count}次</span>
                `;
            }
            contentEl.appendChild(dateCard);
        }

        // 暂无错误提示
        if (this.errorSummary.total_unresolved === 0) {
            const emptyCard = contentEl.createDiv({ cls: 'error-empty-card' });
            emptyCard.innerHTML = '<div class="empty-text">🎉 暂无报错</div>';
        }
    }

    createStatCard(title: string): HTMLElement {
        const card = document.createElement('div');
        card.addClass('error-stat-card');
        card.innerHTML = `<div class="stat-card-title">${title}</div>`;
        return card;
    }

    onClose() {
        // Modal 会自动处理关闭，点击空白区域即可关闭
    }
}
