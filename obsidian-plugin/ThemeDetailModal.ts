import { App, Modal, Notice } from "obsidian";
import type { ThemeDetail } from "./api";
import ThemeDetailComponent from "./ThemeDetail.svelte";
import { formatThemeToMarkdown } from "./formatter";
import type TrendRadarPlugin from "./main";

export class ThemeDetailModal extends Modal {
    private component: ThemeDetailComponent;
    private theme: ThemeDetail;
    private plugin: TrendRadarPlugin;
    private onAction: (action: string) => void;

    constructor(
        app: App, 
        theme: ThemeDetail, 
        plugin: TrendRadarPlugin,
        onAction?: (action: string) => void
    ) {
        super(app);
        this.theme = theme;
        this.plugin = plugin;
        this.onAction = onAction || (() => {});
        this.modalEl.addClass('trendradar-detail-modal');
    }

    onOpen() {
        // 设置模态框标题
        this.titleEl.setText(this.theme.title);

        // 创建 Svelte 组件
        this.component = new ThemeDetailComponent({
            target: this.contentEl,
            props: {
                theme: this.theme,
            },
        });

        // 绑定事件
        this.component.$on('export-note', this.handleExport.bind(this));
        this.component.$on('archive', this.handleArchive.bind(this));
        this.component.$on('delete', this.handleDelete.bind(this));
    }

    onClose() {
        if (this.component) {
            this.component.$destroy();
        }
        this.contentEl.empty();
    }

    async handleExport() {
        const exportPath = this.plugin.settings.exportPath;
        if (!exportPath) {
            new Notice("请先在设置中配置导出路径");
            return;
        }

        const { filename, content } = formatThemeToMarkdown(this.theme);
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
            this.onAction('delete');

            // 关闭模态框
            this.close();

            // 打开新笔记
            this.app.workspace.openLinkText(newFile.path, '', false);

        } catch (error) {
            console.error("TrendRadar - 导出笔记失败:", error);
            new Notice("导出失败，请查看控制台获取详情");
        }
    }

    handleArchive() {
        this.onAction('archive');
        this.close();
    }

    handleDelete() {
        // 直接删除，无需确认
        this.onAction('delete');
        this.close();
    }
}
