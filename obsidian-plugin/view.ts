import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { getThemeDetails, updateThemeStatus, deleteTheme, type ThemeSummary, type ThemeDetail } from "./api";
import ThemeList from "./ThemeList.svelte";
import type TrendRadarPlugin from "./main";
import { ThemeDetailModal } from "./ThemeDetailModal";

export const TRENDRADAR_VIEW_TYPE = "trendradar-view";

export class TrendRadarView extends ItemView {
    component: ThemeList;
    plugin: TrendRadarPlugin;
    private currentThemes: ThemeSummary[] = [];
    private newThemeAgeDays: number = 1;

    constructor(leaf: WorkspaceLeaf, plugin: TrendRadarPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return TRENDRADAR_VIEW_TYPE;
    }

    getDisplayText() {
        return "TrendRadar";
    }

    getIcon() {
        return "radar";
    }

    async onOpen() {
        // 添加容器样式类
        this.contentEl.addClass('trendradar-container');
        
        // 创建工具栏
        this.createToolbar();
        
        // 创建主题列表容器
        const listContainer = this.contentEl.createDiv({ cls: 'trendradar-list-container' });
        
        this.component = new ThemeList({
            target: listContainer,
            props: {
                themes: [],
                newThemeAgeDays: 1,
            },
        });

        // 绑定事件
        this.component.$on("theme-click", this.onThemeClick.bind(this));
        this.component.$on("theme-archive", this.onThemeArchive.bind(this));
        this.component.$on("theme-delete", this.onThemeDelete.bind(this));
        this.component.$on("theme-mark-read", this.onThemeMarkRead.bind(this));
    }

    createToolbar() {
        const toolbar = this.contentEl.createDiv({ cls: 'trendradar-toolbar' });
        
        // 刷新按钮
        const refreshBtn = toolbar.createEl('button', { 
            text: '🔄 刷新',
            cls: 'trendradar-toolbar-btn'
        });
        refreshBtn.onclick = () => this.plugin.activateView();
        
        // 过滤下拉菜单
        const filterSelect = toolbar.createEl('select', { cls: 'trendradar-filter-select' });
        filterSelect.createEl('option', { text: '全部', value: 'all' });
        filterSelect.createEl('option', { text: '未读', value: 'unread' });
        filterSelect.createEl('option', { text: '已读', value: 'read' });
        filterSelect.createEl('option', { text: '已归档', value: 'archived' });
        
        filterSelect.onchange = () => {
            const status = filterSelect.value;
            this.filterThemes(status === 'all' ? null : status);
        };
        
        // 统计信息
        const statsEl = toolbar.createDiv({ cls: 'trendradar-stats' });
        statsEl.id = 'trendradar-stats';
    }

    updateStats() {
        const statsEl = document.getElementById('trendradar-stats');
        if (statsEl && this.currentThemes) {
            const total = this.currentThemes.length;
            const unread = this.currentThemes.filter(t => t.status !== 'read' && t.status !== 'archived').length;
            statsEl.textContent = `共 ${total} 条，${unread} 条未读`;
        }
    }

    filterThemes(status: string | null) {
        if (!this.currentThemes) return;
        
        let filtered = this.currentThemes;
        if (status) {
            if (status === 'unread') {
                filtered = this.currentThemes.filter(t => t.status !== 'read' && t.status !== 'archived');
            } else {
                filtered = this.currentThemes.filter(t => t.status === status);
            }
        }
        
        this.component.$set({ themes: filtered, newThemeAgeDays: this.newThemeAgeDays });
    }

    async onClose() {
        if (this.component) {
            this.component.$destroy();
        }
    }

    async onThemeClick(event: any) {
        const themeId = event.detail.themeId;
        
        const themeDetails = await getThemeDetails(this.plugin.settings.apiUrl, themeId);

        if (themeDetails) {
            // 自动标记为已读
            if (themeDetails.status !== 'read' && themeDetails.status !== 'archived') {
                await updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'read');
                // 更新本地状态
                const theme = this.currentThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.status = 'read';
                    this.component.$set({ themes: this.currentThemes });
                    this.updateStats();
                }
            }
            
            new ThemeDetailModal(this.app, themeDetails, this.plugin, async (action: string) => {
                if (action === 'archive') {
                    await this.archiveTheme(themeId);
                } else if (action === 'delete') {
                    await this.deleteThemeById(themeId);
                }
            }).open();
        } else {
            new Notice("获取详情失败");
        }
    }

    async onThemeMarkRead(event: any) {
        const themeId = event.detail.themeId;
        const success = await updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'read');
        
        if (success) {
            const theme = this.currentThemes.find(t => t.id === themeId);
            if (theme) {
                theme.status = 'read';
                this.component.$set({ themes: this.currentThemes });
                this.updateStats();
            }
        }
    }

    async onThemeArchive(event: any) {
        const themeId = event.detail.themeId;
        await this.archiveTheme(themeId);
    }

    async archiveTheme(themeId: number) {
        const success = await updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'archived');
        
        if (success) {
            new Notice('已归档');
            const theme = this.currentThemes.find(t => t.id === themeId);
            if (theme) {
                theme.status = 'archived';
                this.component.$set({ themes: this.currentThemes });
                this.updateStats();
            }
        } else {
            new Notice('归档失败');
        }
    }

    async onThemeDelete(event: any) {
        const themeId = event.detail.themeId;
        await this.deleteThemeById(themeId);
    }

    async deleteThemeById(themeId: number) {
        const success = await deleteTheme(this.plugin.settings.apiUrl, themeId);
        
        if (success) {
            new Notice('已删除');
            this.currentThemes = this.currentThemes.filter(t => t.id !== themeId);
            this.component.$set({ themes: this.currentThemes });
            this.updateStats();
        } else {
            new Notice('删除失败');
        }
    }

    // 更新视图数据
    async update(themes: ThemeSummary[], newThemeAgeDays: number = 1) {
        this.currentThemes = themes;
        this.newThemeAgeDays = newThemeAgeDays;
        this.component.$set({ themes, newThemeAgeDays });
        this.updateStats();
    }
}
