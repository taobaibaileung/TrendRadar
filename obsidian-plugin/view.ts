import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { getThemeDetails, updateThemeStatus, deleteTheme, triggerFetch, getFetchStatus, getErrorSummary, type ThemeSummary, type ThemeDetail, type ErrorSummary } from "./api";
import ThemeList from "./ThemeList.svelte";
import type TrendRadarPlugin from "./main";
import { ThemeDetailModal } from "./ThemeDetailModal";
import { ErrorListModal } from "./ErrorListModal";

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

        // 创建主题列表容器
        const listContainer = this.contentEl.createDiv({ cls: 'trendradar-list-container' });

        this.component = new ThemeList({
            target: listContainer,
            props: {
                themes: [],
                newThemeAgeDays: 1,
                errorCount: 0,
            },
        });

        // 绑定事件
        this.component.$on("theme-click", this.onThemeClick.bind(this));
        this.component.$on("theme-archive", this.onThemeArchive.bind(this));
        this.component.$on("theme-unarchive", this.onThemeUnarchive.bind(this));
        this.component.$on("theme-delete", this.onThemeDelete.bind(this));
        this.component.$on("theme-mark-read", this.onThemeMarkRead.bind(this));
        this.component.$on("theme-export", this.onThemeExport.bind(this));
        this.component.$on("refresh", this.onRefresh.bind(this));
        this.component.$on("show-errors", this.onShowErrors.bind(this));
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
            }
        }
    }

    async onThemeArchive(event: any) {
        const themeId = event.detail.themeId;
        await this.archiveTheme(themeId);
    }

    async onThemeUnarchive(event: any) {
        const themeId = event.detail.themeId;
        const success = await updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'unread');

        if (success) {
            new Notice('已取消归档');
            const theme = this.currentThemes.find(t => t.id === themeId);
            if (theme) {
                theme.status = 'unread';
                this.component.$set({ themes: this.currentThemes });
            }
        } else {
            new Notice('取消归档失败');
        }
    }

    async archiveTheme(themeId: number) {
        const success = await updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'archived');

        if (success) {
            new Notice('已归档');
            const theme = this.currentThemes.find(t => t.id === themeId);
            if (theme) {
                theme.status = 'archived';
                this.component.$set({ themes: this.currentThemes });
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
        } else {
            new Notice('删除失败');
        }
    }

    async onThemeExport(event: any) {
        const themeId = event.detail.themeId;

        // 获取主题详情
        const themeDetails = await getThemeDetails(this.plugin.settings.apiUrl, themeId);
        if (!themeDetails) {
            new Notice("获取详情失败");
            return;
        }

        // 导入 formatThemeToMarkdown
        const { formatThemeToMarkdown } = await import("./formatter");
        const exportPath = this.plugin.settings.exportPath;

        if (!exportPath) {
            new Notice("请先在设置中配置导出路径");
            return;
        }

        const { filename, content } = formatThemeToMarkdown(themeDetails);
        const fullPath = `${exportPath}/${filename}`;

        try {
            // 检查文件夹是否存在，不存在则创建
            if (!await this.app.vault.adapter.exists(exportPath)) {
                await this.app.vault.createFolder(exportPath);
            }

            // 创建笔记
            const newFile = await this.app.vault.create(fullPath, content);
            new Notice(`已导出笔记: ${newFile.basename}`);

            // 导出后删除卡片
            await this.deleteThemeById(themeId);

            // 打开新笔记
            this.app.workspace.openLinkText(newFile.path, '', false);

        } catch (error) {
            console.error("TrendRadar - 导出笔记失败:", error);
            new Notice("导出失败，请查看控制台获取详情");
        }
    }

    async onRefresh() {
        const success = await triggerFetch(this.plugin.settings.apiUrl);
        if (success) {
            new Notice('已触发抓取任务，正在后台处理...');
            // 延迟3秒后刷新数据，给抓取任务一些时间
            setTimeout(() => {
                this.plugin.activateView();
            }, 3000);
        } else {
            new Notice('触发抓取失败');
        }
    }

    async onShowErrors() {
        const summary = await getErrorSummary(this.plugin.settings.apiUrl);
        if (summary) {
            new ErrorListModal(this.app, summary, this.plugin).open();
        }
    }

    // 更新视图数据
    async update(themes: ThemeSummary[], newThemeAgeDays: number = 1) {
        this.currentThemes = themes;
        this.newThemeAgeDays = newThemeAgeDays;

        // 获取错误统计
        let errorCount = 0;
        try {
            const summary = await getErrorSummary(this.plugin.settings.apiUrl);
            if (summary) {
                errorCount = summary.total_unresolved || 0;
            }
        } catch (error) {
            console.error('[TrendRadar] 获取错误统计失败:', error);
        }

        this.component.$set({ themes, newThemeAgeDays, errorCount });
    }
}
