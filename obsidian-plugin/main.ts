import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, TextComponent, DropdownComponent, ToggleComponent, ButtonComponent, SliderComponent } from 'obsidian';
import {
	getThemes,
	getSources,
	createSource,
	updateSource,
	deleteSource,
	getSourceGroups,
	createSourceGroup,
	updateSourceGroup,
	deleteSourceGroup,
	type SourceGroupModel,
	getFilterConfig,
	updateFilterConfig,
	getAIConfig,
	updateAIConfig,
	getAIServices,
	createAIService,
	updateAIService,
	deleteAIService,
	type AIService,
	triggerFetch,
	getFetchStatus,
	type FetchStatus,
	type SourceConfig as ApiSourceConfig
} from './api';
import { TrendRadarView, TRENDRADAR_VIEW_TYPE } from './view';

// --- AI Model Presets ---
// AI模型预设配置
interface ModelPreset {
	name: string;
	value: string;
	provider: string;
	base_url?: string;
	description?: string;
}

const MODEL_PRESETS: Record<string, ModelPreset[]> = {
	openai: [
		{ name: 'GPT-4o (推荐)', value: 'gpt-4o', provider: 'openai', description: '最新最强模型，适合复杂任务' },
		{ name: 'GPT-4o-mini (快速)', value: 'gpt-4o-mini', provider: 'openai', description: '快速轻量，适合简单分析' },
		{ name: 'GPT-4 Turbo', value: 'gpt-4-turbo', provider: 'openai', description: '高性能模型' },
		{ name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', provider: 'openai', description: '经济实惠' }
	],
	deepseek: [
		{ name: 'DeepSeek-V3 (推荐)', value: 'deepseek-chat', provider: 'deepseek', base_url: 'https://api.deepseek.com', description: '最新旗舰模型' },
		{ name: 'DeepSeek-V2', value: 'deepseek-coder', provider: 'deepseek', base_url: 'https://api.deepseek.com', description: '代码优化' }
	],
	gemini: [
		{ name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash-exp', provider: 'gemini', description: '超快响应' },
		{ name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro', provider: 'gemini', description: '高性能模型' },
		{ name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash', provider: 'gemini', description: '快速轻量' }
	],
	'openai-compatible': [
		{ name: '自定义模型', value: '', provider: 'openai-compatible', description: '手动输入模型名称' },
		{ name: 'Llama 3.1 70B', value: 'llama-3.1-70b', provider: 'openai-compatible', description: '本地部署示例' },
		{ name: 'Qwen2.5 72B', value: 'qwen2.5-72b', provider: 'openai-compatible', description: '通义千问示例' }
	]
};

// 获取指定提供商的模型预设
function getModelPresets(provider: string): ModelPreset[] {
	return MODEL_PRESETS[provider] || [];
}

// 根据模型名称查找预设
function findModelPreset(provider: string, modelName: string): ModelPreset | undefined {
	const presets = getModelPresets(provider);
	return presets.find(p => p.value === modelName);
}

// --- Interfaces ---

interface TrendRadarSettings {
	apiUrl: string;
	exportPath: string;
	autoRefresh: boolean;
	refreshInterval: number; // 分钟
}

// 使用 API 中定义的 SourceConfig，添加本地别名
type SourceConfig = ApiSourceConfig;

interface FilterConfig {
	keyword_blacklist: string[];
	category_blacklist: string[];
	source_blacklist: string[];
	min_content_length: number;
	min_importance: number;
	enable_ai_prefilter: boolean;
}

interface AIConfig {
	provider: string;
	api_key: string;
	base_url: string;
	model_name: string;
	temperature: number;
}

const DEFAULT_SETTINGS: TrendRadarSettings = {
	apiUrl: 'http://127.0.0.1:3334',
	exportPath: 'TrendRadar',
	autoRefresh: false,
	refreshInterval: 15
}

// --- Main Plugin Class ---

export default class TrendRadarPlugin extends Plugin {
	settings: TrendRadarSettings;
	private refreshIntervalId: number | null = null;
	private lastFetchStatus: FetchStatus | null = null;

	async onload() {
		await this.loadSettings();
		console.log('TrendRadar AI Assistant Plugin loaded.');

		this.registerView(
			TRENDRADAR_VIEW_TYPE,
			(leaf) => new TrendRadarView(leaf, this)
		);

		// 添加工具栏图标
		this.addRibbonIcon('radar', 'TrendRadar AI', async (evt: MouseEvent) => {
			this.activateView();
		});
		
		// 添加设置选项卡
		this.addSettingTab(new TrendRadarSettingTab(this.app, this));

		// 启动自动刷新（如果启用）
		this.setupAutoRefresh();
	}

	onunload() {
		console.log('TrendRadar AI Assistant Plugin unloaded.');
		this.clearAutoRefresh();
	}

	setupAutoRefresh() {
		this.clearAutoRefresh();
		if (this.settings.autoRefresh && this.settings.refreshInterval > 0) {
			const intervalMs = this.settings.refreshInterval * 60 * 1000;
			this.refreshIntervalId = window.setInterval(() => {
				this.refreshView();
			}, intervalMs);
			console.log(`Auto-refresh enabled: every ${this.settings.refreshInterval} minutes`);
		}
	}

	clearAutoRefresh() {
		if (this.refreshIntervalId !== null) {
			window.clearInterval(this.refreshIntervalId);
			this.refreshIntervalId = null;
		}
	}

	async refreshView() {
		// 首先触发后端抓取任务
		try {
			const success = await triggerFetch(this.settings.apiUrl);
			if (success) {
				console.log('[TrendRadar] 自动触发抓取任务成功');
				// 不显示通知，避免打扰用户
			}
		} catch (error) {
			console.error('[TrendRadar] 自动触发抓取任务失败:', error);
		}

		// 检查抓取状态
		const status = await getFetchStatus(this.settings.apiUrl);
		if (status) {
			// 如果有新的完成状态，显示通知
			if (status.status === 'completed' &&
				this.lastFetchStatus &&
				(this.lastFetchStatus.status === 'running' || this.lastFetchStatus.status === 'idle')) {
				if (status.new_items_count > 0) {
					new Notice(`✨ 自动刷新: 新增 ${status.new_items_count} 条信息`);
				}
				// 如果没有新增内容，不显示通知，避免打扰
			}
			this.lastFetchStatus = status;
		}

		// 刷新视图
		const leaves = this.app.workspace.getLeavesOfType(TRENDRADAR_VIEW_TYPE);
		if (leaves.length > 0) {
			const leaf = leaves[0];
			if (leaf.view instanceof TrendRadarView) {
				const response = await getThemes(this.settings.apiUrl);
				if (response && response.themes) {
					leaf.view.update(response.themes, response.new_theme_age_days);
				}
			}
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TRENDRADAR_VIEW_TYPE);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			const newLeaf = workspace.getRightLeaf(false);
			if (newLeaf) {
				await newLeaf.setViewState({ type: TRENDRADAR_VIEW_TYPE, active: true });
				leaf = newLeaf;
			}
		}
		
		if (!leaf) return;
		workspace.revealLeaf(leaf);

		new Notice('正在从 TrendRadar 获取数据...');
		const response = await getThemes(this.settings.apiUrl);
		
		if (response && response.themes && response.themes.length > 0) {
			new Notice(`成功获取 ${response.themes.length} 个主题`);
			if (leaf.view instanceof TrendRadarView) {
				leaf.view.update(response.themes, response.new_theme_age_days);
			}
		} else {
			new Notice('暂无主题数据');
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setupAutoRefresh();
	}
}


// --- Settings Tab ---

class TrendRadarSettingTab extends PluginSettingTab {
	plugin: TrendRadarPlugin;
	private activeTab: string = 'general';
	private contentContainer: HTMLElement;

	constructor(app: App, plugin: TrendRadarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h1', { text: 'TrendRadar 设置' });

		// Tab 导航
		const tabsContainer = containerEl.createDiv({ cls: 'trendradar-settings-tabs' });
		
		const tabs = [
			{ id: 'general', name: '常规设置', icon: 'settings' },
			{ id: 'ai', name: 'AI 服务', icon: 'bot' },
			{ id: 'sources', name: '数据源管理', icon: 'database' },
			{ id: 'source-groups', name: '数据源分组', icon: 'layers' },
			{ id: 'filter', name: '内容过滤', icon: 'filter' },
			{ id: 'deduplication', name: '去重设置', icon: 'duplicate' },
			{ id: 'system', name: '系统设置', icon: 'gear' }
		];

		tabs.forEach(tab => {
			const tabEl = tabsContainer.createDiv({ 
				cls: `trendradar-settings-tab ${this.activeTab === tab.id ? 'active' : ''}`,
				text: tab.name
			});
			tabEl.onclick = () => {
				this.activeTab = tab.id;
				this.display(); // 重新渲染
			};
		});

		this.contentContainer = containerEl.createDiv({ cls: 'trendradar-settings-content' });
		
		// 根据当前 Tab 渲染内容
		switch (this.activeTab) {
			case 'general':
				this.renderGeneralSettings();
				break;
			case 'source-groups':
				this.renderSourceGroupsSettings();
				break;
			case 'sources':
				this.renderSourcesSettings();
				break;
			case 'ai':
				this.renderAISettings();
				break;
			case 'filter':
				this.renderFilterSettings();
				break;
			case 'deduplication':
				this.renderDeduplicationSettings();
				break;
			case 'system':
				this.renderSystemSettings();
				break;
		}
	}

	renderGeneralSettings() {
		const container = this.contentContainer;
		
		new Setting(container)
			.setName('后端 API 地址')
			.setDesc('TrendRadar Python 后端服务器的地址')
			.addText(text => text
				.setPlaceholder('http://127.0.0.1:3334')
				.setValue(this.plugin.settings.apiUrl)
				.onChange(async (value) => {
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(container)
			.setName('导出文件夹')
			.setDesc('新笔记将保存到此文件夹')
			.addText(text => text
				.setPlaceholder('TrendRadar/Notes')
				.setValue(this.plugin.settings.exportPath)
				.onChange(async (value) => {
					this.plugin.settings.exportPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(container)
			.setName('自动刷新')
			.setDesc('启用后将自动定时刷新数据')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoRefresh)
				.onChange(async (value) => {
					this.plugin.settings.autoRefresh = value;
					await this.plugin.saveSettings();
				}));

		new Setting(container)
			.setName('刷新间隔（分钟）')
			.setDesc('自动刷新的时间间隔')
			.addText(text => text
				.setPlaceholder('15')
				.setValue(String(this.plugin.settings.refreshInterval))
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num) && num > 0) {
						this.plugin.settings.refreshInterval = num;
						await this.plugin.saveSettings();
					}
				}));

		// 任务控制
		container.createEl('h3', { text: '任务控制' });
		
		new Setting(container)
			.setName('立即抓取')
			.setDesc('手动触发一次完整的数据抓取和分析任务（后台运行）')
			.addButton(button => button
				.setButtonText('🚀 开始抓取')
				.setCta()
				.onClick(async () => {
					new Notice('正在触发抓取任务...');
					try {
						const success = await triggerFetch(this.plugin.settings.apiUrl);
						if (success) {
							new Notice('抓取任务已在后台启动，请稍后刷新查看结果');
						} else {
							new Notice('触发失败，请检查后端连接');
						}
					} catch (error) {
						new Notice('触发失败: ' + error);
					}
				}));
	}

	renderSourceGroupsSettings() {
		const container = this.contentContainer;

		container.createEl('p', {
			text: '管理数据源分组，每个分组可以使用不同的AI配置。支持将网络源和本地目录混合分析。',
			cls: 'setting-item-description'
		});

		new Setting(container)
			.setName('添加新分组')
			.addButton(button => button
				.setButtonText('+ 添加分组')
				.setCta()
				.onClick(() => {
					new SourceGroupEditModal(this.app, this.plugin, null, () => {
						this.renderSourceGroupsSettings();
					}).open();
				}));

		const listContainer = container.createDiv({ cls: 'trendradar-groups-list' });
		this.refreshSourceGroupsList(listContainer);
	}

	async refreshSourceGroupsList(container: HTMLElement) {
		container.empty();
		try {
			const groups = await getSourceGroups(this.plugin.settings.apiUrl);

			if (groups.length === 0) {
				container.createEl('div', { text: '暂无分组，请点击上方按钮添加。', cls: 'trendradar-empty-state' });
				return;
			}

			groups.forEach(group => {
				const item = container.createDiv({ cls: 'trendradar-group-item' });

				// 图标
				const iconDiv = item.createDiv({ cls: 'group-icon' });
				iconDiv.setText('📁');

				// 信息
				const infoDiv = item.createDiv({ cls: 'group-info' });
				infoDiv.createDiv({ cls: 'group-name', text: group.name });

				const details = infoDiv.createDiv({ cls: 'group-details' });
				details.createSpan({
					text: `数据源: ${group.sources.length} 个`,
					cls: 'group-meta'
				});

				if (group.ai_config) {
					details.createSpan({
						text: ` | AI: ${group.ai_config.provider}/${group.ai_config.model_name}`,
						cls: 'group-meta'
					});
				}

				// 状态标签
				if (group.enabled) {
					infoDiv.createEl('span', {
						text: '已启用',
						cls: 'group-status enabled'
					});
				} else {
					infoDiv.createEl('span', {
						text: '已禁用',
						cls: 'group-status disabled'
					});
				}

				// 操作
				const actionsDiv = item.createDiv({ cls: 'group-actions' });

				// 编辑按钮
				new ButtonComponent(actionsDiv)
					.setIcon('pencil')
					.setTooltip('编辑分组')
					.onClick(() => {
						new SourceGroupEditModal(this.app, this.plugin, group, () => {
							this.refreshSourceGroupsList(container);
						}).open();
					});

				// 删除按钮
				new ButtonComponent(actionsDiv)
					.setIcon('trash')
					.setTooltip('删除分组')
					.onClick(async () => {
						const confirmed = await confirm(`确定要删除分组 "${group.name}" 吗？`);
						if (confirmed) {
							const success = await deleteSourceGroup(this.plugin.settings.apiUrl, group.id);
							if (success) {
								new Notice('分组已删除');
								this.refreshSourceGroupsList(container);
							} else {
								new Notice('删除失败');
							}
						}
					});
			});
		} catch (error) {
			container.createEl('div', {
				text: `加载分组列表失败: ${error}`,
				cls: 'trendradar-error'
			});
		}
	}

	renderSourcesSettings() {
		const container = this.contentContainer;
		
		container.createEl('p', { 
			text: '在这里添加、编辑或删除您的信息订阅源。支持 RSS、网站爬取和 Twitter/X 账号。',
			cls: 'setting-item-description'
		});

		new Setting(container)
			.setName('添加新数据源')
			.addButton(button => button
				.setButtonText('+ 添加数据源')
				.setCta()
				.onClick(() => {
					new SourceEditModal(this.app, this.plugin, null, () => {
						this.renderSourcesSettings(); // 刷新列表
					}).open();
				}));

		const listContainer = container.createDiv({ cls: 'trendradar-sources-list' });
		this.refreshSourcesList(listContainer);
	}

	async refreshSourcesList(container: HTMLElement) {
		container.empty();
		try {
			const sources = await getSources(this.plugin.settings.apiUrl);
			
			if (sources.length === 0) {
				container.createEl('div', { text: '暂无数据源，请点击上方按钮添加。', cls: 'trendradar-empty-state' });
				return;
			}

			sources.forEach(source => {
				const item = container.createDiv({ cls: 'trendradar-source-item' });
				
				// 图标
				const iconDiv = item.createDiv({ cls: 'source-icon' });
				let iconName = 'rss';
				if (source.type === 'twitter') iconName = 'twitter';
				// 简单模拟图标
				iconDiv.setText(source.type.toUpperCase());

				// 信息
				const infoDiv = item.createDiv({ cls: 'source-info' });
				infoDiv.createDiv({ cls: 'source-name', text: source.name });
				infoDiv.createDiv({ cls: 'source-url', text: source.url || source.username || 'No URL' });

				// 操作
				const actionsDiv = item.createDiv({ cls: 'source-actions' });
				
				// 启用/禁用开关
				const toggle = new ToggleComponent(actionsDiv)
					.setValue(source.enabled)
					.onChange(async (value) => {
						source.enabled = value;
						await updateSource(this.plugin.settings.apiUrl, source.id, source);
					});
				toggle.setTooltip(source.enabled ? '已启用' : '已禁用');

				// 编辑按钮
				new ButtonComponent(actionsDiv)
					.setIcon('pencil')
					.setTooltip('编辑')
					.onClick(() => {
						new SourceEditModal(this.app, this.plugin, source, () => {
							this.refreshSourcesList(container);
						}).open();
					});

				// 删除按钮
				new ButtonComponent(actionsDiv)
					.setIcon('trash')
					.setTooltip('删除')
					.setClass('mod-warning')
					.onClick(async () => {
						if (confirm(`确定要删除数据源 "${source.name}" 吗？`)) {
							await deleteSource(this.plugin.settings.apiUrl, source.id);
							this.refreshSourcesList(container);
						}
					});
			});

		} catch (error) {
			container.createEl('div', { text: '无法加载数据源列表，请检查后端连接。', cls: 'trendradar-error-state' });
		}
	}

	async renderAISettings() {
		const container = this.contentContainer;
		container.empty();

		container.createEl('p', {
			text: '管理可用的AI服务。配置的服务可以在数据源分组中使用。',
			cls: 'setting-item-description'
		});

		// 添加服务按钮
		new Setting(container)
			.setName('添加AI服务')
			.addButton(button => button
				.setButtonText('+ 添加服务')
				.setCta()
				.onClick(() => {
					new AIServiceEditModal(this.app, this.plugin, null, () => {
						this.renderAISettings(); // 刷新列表
					}).open();
				}));

		// 服务列表容器
		const listContainer = container.createDiv({ cls: 'trendradar-groups-list' });
		this.refreshAIServicesList(listContainer);
	}

	async refreshAIServicesList(container: HTMLElement) {
		container.empty();
		try {
			const services = await getAIServices(this.plugin.settings.apiUrl);

			if (services.length === 0) {
				container.createEl('div', {
					text: '暂无AI服务，请点击上方按钮添加。',
					cls: 'trendradar-empty-state'
				});
				return;
			}

			services.forEach(service => {
				const item = container.createDiv({ cls: 'trendradar-group-item' });

				// 图标
				const iconDiv = item.createDiv({ cls: 'group-icon' });
				iconDiv.setText('🤖');

				// 信息
				const infoDiv = item.createDiv({ cls: 'group-info' });
				infoDiv.createDiv({ cls: 'group-name', text: service.name });

				const details = infoDiv.createDiv({ cls: 'group-details' });
				details.createSpan({
					text: `${service.provider} / ${service.model_name}`,
					cls: 'group-meta'
				});
				if (service.description) {
					details.createSpan({
						text: ` | ${service.description}`,
						cls: 'group-meta'
					});
				}

				// 操作
				const actionsDiv = item.createDiv({ cls: 'source-actions' });

				// 编辑按钮
				new ButtonComponent(actionsDiv)
					.setIcon('pencil')
					.setTooltip('编辑')
					.onClick(() => {
						new AIServiceEditModal(this.app, this.plugin, service, () => {
							this.refreshAIServicesList(container);
						}).open();
					});

				// 删除按钮
				new ButtonComponent(actionsDiv)
					.setIcon('trash')
					.setTooltip('删除')
					.setClass('mod-warning')
					.onClick(async () => {
						if (confirm(`确定要删除AI服务 "${service.name}" 吗？`)) {
							const success = await deleteAIService(this.plugin.settings.apiUrl, service.id);
							if (success) {
								new Notice('AI服务已删除');
								this.refreshAIServicesList(container);
							} else {
								new Notice('删除失败');
							}
						}
					});
			});

		} catch (error) {
			container.createEl('div', {
				text: '无法加载AI服务列表，请检查后端连接。',
				cls: 'trendradar-error-state'
			});
		}
	}

	async renderFilterSettings() {
		const container = this.contentContainer;
		container.empty();

		try {
			const config = await getFilterConfig(this.plugin.settings.apiUrl);

			new Setting(container)
				.setName('关键词黑名单')
				.setDesc('包含这些关键词的内容将被过滤（用逗号分隔）')
				.addTextArea(text => text
					.setPlaceholder('广告, 推广, ...')
					.setValue(config.keyword_blacklist.join(', '))
					.onChange(async (value) => {
						config.keyword_blacklist = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
						await updateFilterConfig(this.plugin.settings.apiUrl, config);
					}));

			new Setting(container)
				.setName('分类黑名单')
				.setDesc('属于这些分类的内容将被过滤（用逗号分隔）')
				.addTextArea(text => text
					.setPlaceholder('娱乐, 八卦, ...')
					.setValue(config.category_blacklist.join(', '))
					.onChange(async (value) => {
						config.category_blacklist = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
						await updateFilterConfig(this.plugin.settings.apiUrl, config);
					}));

			new Setting(container)
				.setName('AI 预过滤')
				.setDesc('启用后，将使用 AI 初步判断内容相关性（会消耗 Token）')
				.addToggle(toggle => toggle
					.setValue(config.enable_ai_prefilter)
					.onChange(async (value) => {
						config.enable_ai_prefilter = value;
						await updateFilterConfig(this.plugin.settings.apiUrl, config);
					}));

		} catch (error) {
			container.createEl('p', { text: '无法加载过滤配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
		}
	}

	async renderDeduplicationSettings() {
		const container = this.contentContainer;
		container.empty();

		try {
			// 保存 API URL
			const apiUrl = this.plugin.settings.apiUrl;

			// 获取去重配置
			const configResponse = await fetch(`${apiUrl}/api/deduplication/config`);
			if (!configResponse.ok) {
				throw new Error(`HTTP ${configResponse.status}`);
			}
			const config = await configResponse.json();

			container.createEl('p', {
				text: '内容去重功能可以自动过滤与已处理内容相似的新主题，避免重复信息。',
				cls: 'setting-item-description'
			});

			// 启用/禁用去重
			new Setting(container)
				.setName('启用去重')
				.setDesc('是否启用智能内容去重功能')
				.addToggle(toggle => toggle
					.setValue(config.enabled)
					.onChange(async (value) => {
						config.enabled = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			// 相似度阈值
			new Setting(container)
				.setName('相似度阈值')
				.setDesc('判定为重复的相似度阈值（0.0-1.0），默认0.8表示80%相似')
				.addSlider(slider => slider
					.setLimits(0, 1, 0.05)
					.setValue(config.similarity_threshold)
					.setDynamicTooltip()
					.onChange(async (value) => {
						config.similarity_threshold = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			// 检查窗口（天数）
			new Setting(container)
				.setName('检查窗口（天）')
				.setDesc('只检查最近N天的历史记录')
				.addText(text => text
					.setValue(String(config.check_window_days))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							config.check_window_days = num;
							try {
								const response = await fetch(`${apiUrl}/api/deduplication/config`, {
									method: 'PUT',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify(config)
								});
								if (!response.ok) throw new Error(`HTTP ${response.status}`);
							} catch (error) {
								new Notice('更新配置失败');
								console.error(error);
							}
						}
					}));

			// 最大历史记录数
			new Setting(container)
				.setName('最大历史记录数')
				.setDesc('最多检查N条历史记录（与时间窗口取较小值）')
				.addText(text => text
					.setValue(String(config.max_history_records))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							config.max_history_records = num;
							try {
								const response = await fetch(`${apiUrl}/api/deduplication/config`, {
									method: 'PUT',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify(config)
								});
								if (!response.ok) throw new Error(`HTTP ${response.status}`);
							} catch (error) {
								new Notice('更新配置失败');
								console.error(error);
							}
						}
					}));

			// 过滤对象
			container.createEl('h3', { text: '过滤对象' });

			new Setting(container)
				.setName('过滤已删除内容')
				.setDesc('是否过滤已被删除的相似内容')
				.addToggle(toggle => toggle
					.setValue(config.filter_deleted)
					.onChange(async (value) => {
						config.filter_deleted = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			new Setting(container)
				.setName('过滤已归档内容')
				.setDesc('是否过滤已被归档的相似内容')
				.addToggle(toggle => toggle
					.setValue(config.filter_archived)
					.onChange(async (value) => {
						config.filter_archived = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			new Setting(container)
				.setName('过滤已导出内容')
				.setDesc('是否过滤已被导出的相似内容')
				.addToggle(toggle => toggle
					.setValue(config.filter_exported)
					.onChange(async (value) => {
						config.filter_exported = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			// 重复内容处理方式
			container.createEl('h3', { text: '重复内容处理' });

			new Setting(container)
				.setName('处理方式')
				.setDesc('keep=保留并标记为重复，discard=直接丢弃')
				.addDropdown(dropdown => dropdown
					.addOption('keep', '保留并标记')
					.addOption('discard', '直接丢弃')
					.setValue(config.duplicate_action)
					.onChange(async (value) => {
						config.duplicate_action = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			// 相似度计算方法
			container.createEl('h3', { text: '高级设置' });

			new Setting(container)
				.setName('相似度计算方法')
				.setDesc('title_only=仅标题（快速），hybrid=标题+摘要（准确）')
				.addDropdown(dropdown => dropdown
					.addOption('title_only', '仅标题')
					.addOption('hybrid', '标题+摘要')
					.setValue(config.method)
					.onChange(async (value) => {
						config.method = value;
						try {
							const response = await fetch(`${apiUrl}/api/deduplication/config`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(config)
							});
							if (!response.ok) throw new Error(`HTTP ${response.status}`);
						} catch (error) {
							new Notice('更新配置失败');
							console.error(error);
						}
					}));

			// 历史记录保留天数
			new Setting(container)
				.setName('历史保留天数')
				.setDesc('已处理历史记录的保留天数，超过此天数将被自动清理')
				.addText(text => text
					.setValue(String(config.history_retention_days))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							config.history_retention_days = num;
							try {
								const response = await fetch(`${apiUrl}/api/deduplication/config`, {
									method: 'PUT',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify(config)
								});
								if (!response.ok) throw new Error(`HTTP ${response.status}`);
							} catch (error) {
								new Notice('更新配置失败');
								console.error(error);
							}
						}
					}));

		} catch (error) {
			container.createEl('p', { text: '无法加载去重配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
			console.error(error);
		}
	}

	async renderSystemSettings() {
		const container = this.contentContainer;
		container.empty();

		try {
			const { getSettings, updateSettings } = await import('./api');
			const settings = await getSettings(this.plugin.settings.apiUrl);

			if (!settings) {
				container.createEl('p', { text: '无法加载系统配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
				return;
			}

			// 报告配置
			container.createEl('h3', { text: '报告配置' });

			new Setting(container)
				.setName('报告模式')
				.setDesc('选择报告模式：daily(当日汇总)、current(当前榜单)、incremental(增量模式)')
				.addDropdown(dropdown => dropdown
					.addOption('daily', '当日汇总')
					.addOption('current', '当前榜单')
					.addOption('incremental', '增量模式')
					.setValue(settings.report.mode)
					.onChange(async (value) => {
						settings.report.mode = value;
						await updateSettings(this.plugin.settings.apiUrl, { report: settings.report });
					}));

			new Setting(container)
				.setName('排名阈值')
				.setDesc('高亮显示的排名阈值')
				.addText(text => text
					.setValue(String(settings.report.rank_threshold))
					.onChange(async (value) => {
						settings.report.rank_threshold = parseInt(value) || 5;
						await updateSettings(this.plugin.settings.apiUrl, { report: settings.report });
					}));

			// 通知配置
			container.createEl('h3', { text: '通知配置' });

			new Setting(container)
				.setName('启用通知')
				.setDesc('是否启用通知推送')
				.addToggle(toggle => toggle
					.setValue(settings.notification.enabled)
					.onChange(async (value) => {
						settings.notification.enabled = value;
						await updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
					}));

			new Setting(container)
				.setName('飞书 Webhook')
				.setDesc('飞书机器人 Webhook URL')
				.addText(text => text
					.setValue(settings.notification.channels.feishu.webhook_url)
					.onChange(async (value) => {
						settings.notification.channels.feishu.webhook_url = value;
						await updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
					}));

			new Setting(container)
				.setName('钉钉 Webhook')
				.setDesc('钉钉机器人 Webhook URL')
				.addText(text => text
					.setValue(settings.notification.channels.dingtalk.webhook_url)
					.onChange(async (value) => {
						settings.notification.channels.dingtalk.webhook_url = value;
						await updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
					}));

			new Setting(container)
				.setName('Telegram Bot Token')
				.setDesc('Telegram 机器人 Token')
				.addText(text => text
					.setValue(settings.notification.channels.telegram.bot_token)
					.onChange(async (value) => {
						settings.notification.channels.telegram.bot_token = value;
						await updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
					}));

			new Setting(container)
				.setName('Telegram Chat ID')
				.setDesc('Telegram 聊天 ID')
				.addText(text => text
					.setValue(settings.notification.channels.telegram.chat_id)
					.onChange(async (value) => {
						settings.notification.channels.telegram.chat_id = value;
						await updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
					}));

			// 存储配置
			container.createEl('h3', { text: '存储配置' });

			new Setting(container)
				.setName('数据保留天数')
				.setDesc('本地数据保留天数（0 = 永久保留）')
				.addText(text => text
					.setValue(String(settings.storage?.local?.retention_days || 0))
					.onChange(async (value) => {
						if (!settings.storage) settings.storage = {};
						if (!settings.storage.local) settings.storage.local = {};
						settings.storage.local.retention_days = parseInt(value) || 0;
						await updateSettings(this.plugin.settings.apiUrl, { storage: settings.storage });
					}));

		} catch (error) {
			container.createEl('p', { text: '无法加载系统配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
		}
	}
}

// --- Source Edit Modal ---

class SourceEditModal extends Modal {
	plugin: TrendRadarPlugin;
	source: SourceConfig | null;
	onSave: () => void;

	constructor(app: App, plugin: TrendRadarPlugin, source: SourceConfig | null, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.source = source;
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.source ? '编辑数据源' : '添加数据源' });

		const config: SourceConfig = this.source ? { ...this.source } : {
			id: '',
			name: '',
			type: 'rss',
			enabled: true,
			url: '',
			username: '',
			selector: '',
			schedule: '0 * * * *',
			retention_days: 7,
			max_items: 20,
			use_proxy: false,
			extra: {}
		};

		// 类型选择
		new Setting(contentEl)
			.setName('类型')
			.addDropdown(dropdown => dropdown
				.addOption('rss', 'RSS 订阅')
				.addOption('twitter', 'Twitter/X 用户')
				.addOption('local', '本地目录')
				.setValue(config.type)
				.onChange(value => {
					config.type = value as any;
					this.onOpen(); // 刷新界面以显示不同类型的字段
				}));

		new Setting(contentEl)
			.setName('名称')
			.addText(text => text
				.setValue(config.name)
				.onChange(value => config.name = value));

		if (config.type === 'rss') {
			new Setting(contentEl)
				.setName('URL')
				.setDesc('RSS Feed 地址')
				.addText(text => text
					.setValue(config.url)
					.onChange(value => config.url = value));
		}

		if (config.type === 'twitter') {
			new Setting(contentEl)
				.setName('用户名')
				.setDesc('Twitter 用户名 (不带 @)')
				.addText(text => text
					.setValue(config.username || '')
					.onChange(value => config.username = value));
		}

		if (config.type === 'local') {
			new Setting(contentEl)
				.setName('目录路径')
				.setDesc('本地目录的绝对路径')
				.addText(text => text
					.setValue(config.extra?.path || '')
					.setPlaceholder('/Users/xxx/Documents/Inbox')
					.onChange(value => {
						if (!config.extra) config.extra = {};
						config.extra.path = value;
					}));

			new Setting(contentEl)
				.setName('文件模式')
				.setDesc('要包含的文件类型（逗号分隔）')
				.addText(text => text
					.setValue(config.extra?.file_patterns?.join(', ') || '*.md, *.txt')
					.setPlaceholder('*.md, *.txt')
					.onChange(value => {
						if (!config.extra) config.extra = {};
						config.extra.file_patterns = value.split(',').map(s => s.trim());
					}));

			new Setting(contentEl)
				.setName('递归子目录')
				.addToggle(toggle => toggle
					.setValue(config.extra?.recursive ?? true)
					.onChange(value => {
						if (!config.extra) config.extra = {};
						config.extra.recursive = value;
					}));
		}

		new Setting(contentEl)
			.setName('保留天数')
			.addText(text => text
				.setValue(String(config.retention_days))
				.onChange(value => config.retention_days = parseInt(value) || 7));

		new Setting(contentEl)
			.setName('最大条目数')
			.setDesc('每次抓取的最大数量')
			.addText(text => text
				.setValue(String(config.max_items))
				.onChange(value => config.max_items = parseInt(value) || 20));

		new Setting(contentEl)
			.addButton(button => button
				.setButtonText('保存')
				.setCta()
				.onClick(async () => {
					if (!config.name) {
						new Notice('请输入名称');
						return;
					}
					
					// 自动生成 ID
					if (!config.id) {
						config.id = config.type + '_' + Date.now();
					}

					try {
						if (this.source) {
							await updateSource(this.plugin.settings.apiUrl, config.id, config);
						} else {
							await createSource(this.plugin.settings.apiUrl, config);
						}
						this.onSave();
						this.close();
						new Notice('保存成功');
					} catch (error) {
						new Notice('保存失败: ' + error);
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// --- AI Service Edit Modal ---
class AIServiceEditModal extends Modal {
	plugin: TrendRadarPlugin;
	service: AIService | null;
	onSave: () => void;

	constructor(app: App, plugin: TrendRadarPlugin, service: AIService | null, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.service = service;
		this.onSave = onSave;
	}

	onOpen() {
		const { contentEl, modalEl } = this;
		contentEl.empty();

		// 添加CSS类名
		modalEl.addClass('mod-fresh-source-group-edit');

		contentEl.createEl('h2', { text: this.service ? '编辑AI服务' : '添加AI服务' });

		const service: AIService = this.service ? { ...this.service } : {
			id: '',
			name: '',
			provider: 'openai',
			api_key: '',
			base_url: '',
			model_name: 'gpt-4o',
			temperature: 0.7,
			description: ''
		};

		// ID（仅新建时可编辑）
		new Setting(contentEl)
			.setName('服务ID')
			.setDesc('唯一标识符（只能包含字母、数字、连字符）')
			.addText(text => text
				.setValue(service.id)
				.setPlaceholder('my-openai-service')
				.setDisabled(!!this.service)
				.onChange(value => service.id = value));

		// 服务名称
		new Setting(contentEl)
			.setName('服务名称')
			.setDesc('显示名称')
			.addText(text => text
				.setValue(service.name)
				.setPlaceholder('我的OpenAI服务')
				.onChange(value => service.name = value));

		// AI提供商
		new Setting(contentEl)
			.setName('AI提供商')
			.addDropdown(dropdown => dropdown
				.addOption('openai', 'OpenAI')
				.addOption('deepseek', 'DeepSeek')
				.addOption('gemini', 'Google Gemini')
				.addOption('openai-compatible', '兼容OpenAI')
				.setValue(service.provider)
				.onChange(value => {
					service.provider = value;
					// 更新默认模型
					const preset = getModelPresets(value)[0];
					if (preset) {
						service.model_name = preset.value;
						modelSelect.setValue(preset.value);
						if (preset.base_url) {
							service.base_url = preset.base_url;
							baseUrlInput.setValue(preset.base_url);
						}
					}
				}));

		// API Key
		new Setting(contentEl)
			.setName('API Key')
			.addText(text => text
				.setValue(service.api_key)
				.setPlaceholder('sk-...')
				.onChange(value => service.api_key = value));

		// API地址
		let baseUrlInput: TextComponent;
		new Setting(contentEl)
			.setName('API地址')
			.setDesc('自定义API端点（留空使用默认地址）')
			.addText(text => {
				baseUrlInput = text;
				baseUrlInput.setValue(service.base_url)
					.setPlaceholder('https://api.openai.com/v1')
					.onChange(value => service.base_url = value);
			});

		// 模型名称
		new Setting(contentEl)
			.setName('模型名称')
			.setDesc('例如: gpt-4o, deepseek-chat, gemini-2.0-flash-exp')
			.addText(text => text
				.setValue(service.model_name)
				.setPlaceholder('gpt-4o')
				.onChange(value => service.model_name = value));

		// 温度
		new Setting(contentEl)
			.setName('温度')
			.setDesc('控制随机性（0-1）')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(service.temperature)
				.setDynamicTooltip()
				.onChange(value => service.temperature = value));

		// 描述
		new Setting(contentEl)
			.setName('描述')
			.setDesc('服务用途说明')
			.addText(text => text
				.setValue(service.description)
				.setPlaceholder('用于...')
				.onChange(value => service.description = value));

		// 保存按钮
		new Setting(contentEl)
			.addButton(button => button
				.setButtonText('保存')
				.setCta()
				.onClick(async () => {
					if (!service.id || !service.name) {
						new Notice('请填写服务ID和名称');
						return;
					}

					// 验证ID格式
					if (!/^[a-z0-9-]+$/.test(service.id)) {
						new Notice('服务ID只能包含小写字母、数字和连字符');
						return;
					}

					try {
						if (this.service) {
							await updateAIService(this.plugin.settings.apiUrl, service.id, service);
						} else {
							await createAIService(this.plugin.settings.apiUrl, service);
						}
						this.onSave();
						this.close();
						new Notice('AI服务保存成功');
					} catch (error) {
						new Notice('保存失败: ' + error);
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SourceGroupEditModal extends Modal {
	plugin: TrendRadarPlugin;
	group: SourceGroupModel | null;
	onSave: () => void;
	config: SourceGroupModel; // 实例变量，保存编辑状态
	sourcesListContainer: HTMLElement; // 数据源列表容器，用于局部刷新

	constructor(app: App, plugin: TrendRadarPlugin, group: SourceGroupModel | null, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.group = group;
		this.onSave = onSave;
		// 初始化配置对象
		this.config = group ? { ...group } : {
			id: '',
			name: '',
			enabled: true,
			description: '',
			ai_config: {
				mode: 'two-stage',
				analysis_service_id: '',
				aggregation_service_id: ''
			},
			sources: []
		};
		// 确保ai_config存在
		if (!this.config.ai_config) {
			this.config.ai_config = {
				mode: 'two-stage',
				analysis_service_id: '',
				aggregation_service_id: ''
			};
		}
	}

	async onOpen() {
		const { contentEl, modalEl } = this;
		contentEl.empty();

		// 添加CSS类名以应用Apple风格样式
		modalEl.addClass('mod-fresh-source-group-edit');

		contentEl.createEl('h2', { text: this.group ? '编辑分组' : '添加分组' });

		// 分组ID
		new Setting(contentEl)
			.setName('分组ID')
			.setDesc('唯一标识符（只能包含字母、数字、连字符）')
			.addText(text => text
				.setValue(this.config.id)
				.setPlaceholder('my-group')
				.onChange(value => this.config.id = value));

		// 分组名称
		new Setting(contentEl)
			.setName('分组名称')
			.addText(text => text
				.setValue(this.config.name)
				.setPlaceholder('我的分组')
				.onChange(value => this.config.name = value));

		// 描述
		new Setting(contentEl)
			.setName('描述')
			.setDesc('分组的用途说明')
			.addText(text => text
				.setValue(this.config.description || '')
				.setPlaceholder('用于...')
				.onChange(value => this.config.description = value));

		// 启用开关
		new Setting(contentEl)
			.setName('启用此分组')
			.addToggle(toggle => toggle
				.setValue(this.config.enabled)
				.onChange(value => this.config.enabled = value));

		// AI配置部分 - 简化为服务选择
		// 创建 AI 配置头部容器（标题和模式选择在同一行）
		const aiConfigHeader = contentEl.createDiv({ cls: 'ai-config-header' });
		aiConfigHeader.createEl('h3', { text: 'AI 服务' });

		// AI处理模式选择（内联）
		const modeSelect = aiConfigHeader.createEl('select', { cls: 'ai-mode-select' });
		modeSelect.createEl('option', { value: 'two-stage' }).setText('分阶段（分析 + 聚合）');
		modeSelect.createEl('option', { value: 'single' }).setText('整体处理');
		modeSelect.value = this.config.ai_config?.mode || 'two-stage';
		modeSelect.addEventListener('change', async () => {
			if (this.config.ai_config) {
				this.config.ai_config.mode = modeSelect.value as 'two-stage' | 'single';
			}
			// 局部重绘服务选择器
			await this.renderAIServiceSelection(serviceContainer, this.config);
		});

		// 服务选择器容器
		const serviceContainer = contentEl.createDiv({ cls: 'ai-service-selection' });

		// 加载AI服务列表并渲染选择器（等待异步完成）
		await this.renderAIServiceSelection(serviceContainer, this.config);

		// 数据源部分
		// 创建数据源头部容器（标题和添加按钮在同一行）
		const dataSourceHeader = contentEl.createDiv({ cls: 'data-source-header' });
		dataSourceHeader.createEl('h3', { text: '数据源' });

		// 添加数据源按钮
		const addSourceBtn = new ButtonComponent(dataSourceHeader);
		addSourceBtn
			.setButtonText('+ 添加数据源')
			.setCta()
			.onClick(async () => {
				new UnifiedSourceModal(this.app, this.plugin, this.config, (resultSource) => {
					// 检查是否已经在分组中
					const exists = this.config.sources.find(s => s.id === resultSource.id);
					if (exists) {
						new Notice('此数据源已在分组中');
						return;
					}

					this.config.sources.push(resultSource);
					// 只更新数据源列表部分，不重新创建整个界面
					this.renderSourcesList();
				}).open();
			});

		// 显示当前分组的数据源列表
		this.sourcesListContainer = contentEl.createDiv({ cls: 'group-sources-list' });
		this.renderSourcesList();

		// 保存按钮
		new Setting(contentEl)
			.addButton(button => button
				.setButtonText('保存')
				.setCta()
				.onClick(async () => {
					if (!this.config.id || !this.config.name) {
						new Notice('请填写分组ID和名称');
						return;
					}

					// 验证ID格式
					if (!/^[a-z0-9-]+$/.test(this.config.id)) {
						new Notice('分组ID只能包含小写字母、数字和连字符');
						return;
					}

					try {
						if (this.group) {
							await updateSourceGroup(this.plugin.settings.apiUrl, this.config.id, this.config);
						} else {
							await createSourceGroup(this.plugin.settings.apiUrl, this.config);
						}
						this.onSave();
						this.close();
						new Notice('分组保存成功');
					} catch (error) {
						new Notice('保存失败: ' + error);
					}
				}));
	}

	async renderAIServiceSelection(container: HTMLElement, config: SourceGroupModel) {
		// 清空容器
		container.empty();

		try {
			console.log('[SourceGroupEditModal] 开始加载AI服务列表...');
			console.log('[SourceGroupEditModal] API URL:', this.plugin.settings.apiUrl);

			const services = await getAIServices(this.plugin.settings.apiUrl);

			console.log('[SourceGroupEditModal] 加载到', services.length, '个AI服务');

			if (services.length === 0) {
				const warningDiv = container.createEl('p', {
					text: '⚠️ 还没有配置AI服务，请先在"AI 服务"Tab中添加服务。',
					cls: 'setting-item-description'
				});
				return;
			}

			const mode = config.ai_config?.mode || 'two-stage';
			console.log('[SourceGroupEditModal] 当前模式:', mode);

			if (mode === 'two-stage') {
				// 分阶段模式 - 选择两个服务
				new Setting(container)
					.setName('分析服务')
					.addDropdown(dropdown => {
						dropdown.addOption('', '未选择');
						services.forEach(service => {
							dropdown.addOption(service.id, service.name);
						});
						dropdown.setValue(config.ai_config?.analysis_service_id || '');
						dropdown.onChange(value => {
							if (config.ai_config) {
								config.ai_config.analysis_service_id = value;
							}
						});
					});

				new Setting(container)
					.setName('聚合服务')
					.addDropdown(dropdown => {
						dropdown.addOption('', '未选择');
						services.forEach(service => {
							dropdown.addOption(service.id, service.name);
						});
						dropdown.setValue(config.ai_config?.aggregation_service_id || '');
						dropdown.onChange(value => {
							if (config.ai_config) {
								config.ai_config.aggregation_service_id = value;
							}
						});
					});
			} else {
				// 单一模式 - 选择一个服务
				new Setting(container)
					.setName('AI服务')
					.addDropdown(dropdown => {
						dropdown.addOption('', '未选择');
						services.forEach(service => {
							dropdown.addOption(service.id, service.name);
						});
						dropdown.setValue(config.ai_config?.analysis_service_id || '');
						dropdown.onChange(value => {
							if (config.ai_config) {
								config.ai_config.analysis_service_id = value;
								// 清空聚合服务ID，避免混淆
								config.ai_config.aggregation_service_id = '';
							}
						});
					});
			}

		} catch (error) {
			console.error('[SourceGroupEditModal] 加载AI服务失败:', error);
			container.createEl('p', {
				text: `⚠️ 无法加载AI服务列表: ${error}`,
				cls: 'setting-item-description'
			});
		}
	}

	// 局部更新数据源列表，不重新创建整个界面
	renderSourcesList() {
		if (!this.sourcesListContainer) return;

		this.sourcesListContainer.empty();

		if (this.config.sources.length === 0) {
			// 简单文本，无样式
			this.sourcesListContainer.createEl('div', {
				cls: 'empty-source-list',
				text: '暂无数据源'
			});
		} else {
			this.config.sources.forEach((source, index) => {
				const sourceItem = this.sourcesListContainer.createDiv({
					cls: 'group-source-item'
				});

				const sourceInfo = sourceItem.createDiv({ cls: 'source-info' });
				sourceInfo.createSpan({
					text: `${source.name} (${source.type})`,
					cls: 'source-name'
				});

				// 移除按钮
				new ButtonComponent(sourceItem)
					.setIcon('x')
					.setTooltip('移除')
					.onClick(() => {
						this.config.sources.splice(index, 1);
						// 只更新数据源列表部分
						this.renderSourcesList();
					});
			});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}


// 数据源选择器Modal
class SourceSelectorModal extends Modal {
	availableSources: ApiSourceConfig[];
	onSelect: (source: ApiSourceConfig) => void;

	constructor(app: App, availableSources: ApiSourceConfig[], onSelect: (source: ApiSourceConfig) => void) {
		super(app);
		this.availableSources = availableSources;
		this.onSelect = onSelect;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: '选择数据源' });

		if (this.availableSources.length === 0) {
			contentEl.createEl('p', { text: '没有可用的数据源' });
			return;
		}

		const listContainer = contentEl.createDiv({ cls: 'source-selector-list' });

		this.availableSources.forEach(source => {
			const item = listContainer.createDiv({ cls: 'source-selector-item' });

			const info = item.createDiv({ cls: 'source-info' });
			info.createDiv({ cls: 'source-name', text: source.name });
			info.createDiv({ cls: 'source-type', text: source.type });

			new ButtonComponent(item)
				.setButtonText('添加')
				.onClick(() => {
					this.onSelect(source);
					this.close();
				});
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// 在分组中创建数据源的Modal
class GroupSourceCreateModal extends Modal {
	plugin: TrendRadarPlugin;
	groupConfig: SourceGroupModel;
	onCreate: (source: ApiSourceConfig) => void;

	constructor(app: App, plugin: TrendRadarPlugin, groupConfig: SourceGroupModel, onCreate: (source: ApiSourceConfig) => void) {
		super(app);
		this.plugin = plugin;
		this.groupConfig = groupConfig;
		this.onCreate = onCreate;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: '创建新数据源' });

		const source: Partial<ApiSourceConfig> = {
			id: '',
			name: '',
			type: 'rss',
			enabled: true,
			url: '',
			username: '',
			selector: '',
			schedule: '0 * * * *',
			retention_days: 7,
			max_items: 20,
			use_proxy: false,
			extra: {}
		};

		new Setting(contentEl)
			.setName('类型')
			.addDropdown(dropdown => dropdown
				.addOption('rss', 'RSS 订阅')
				.addOption('twitter', 'Twitter/X 用户')
				.addOption('local', '本地目录')
				.setValue(source.type)
				.onChange(value => {
					source.type = value as any;
					this.onOpen();
				}));

		new Setting(contentEl)
			.setName('名称')
			.addText(text => text
				.setValue(source.name)
				.onChange(value => source.name = value));

		if (source.type === 'rss') {
			new Setting(contentEl)
				.setName('URL')
				.addText(text => text
					.setValue(source.url)
					.onChange(value => source.url = value));
		}

		if (source.type === 'twitter') {
			new Setting(contentEl)
				.setName('用户名')
				.addText(text => text
					.setValue(source.username || '')
					.onChange(value => source.username = value));
		}

		if (source.type === 'local') {
			new Setting(contentEl)
				.setName('目录路径')
				.addText(text => text
					.setValue(source.extra?.path || '')
					.onChange(value => {
						if (!source.extra) source.extra = {};
						source.extra.path = value;
					}));

			new Setting(contentEl)
				.setName('文件模式')
				.addText(text => text
					.setValue(source.extra?.file_patterns?.join(', ') || '*.md, *.txt')
					.onChange(value => {
						if (!source.extra) source.extra = {};
						source.extra.file_patterns = value.split(',').map(s => s.trim());
					}));
		}

		new Setting(contentEl)
			.addButton(button => button
				.setButtonText('创建')
				.setCta()
				.onClick(async () => {
					if (!source.name) {
						new Notice('请输入数据源名称');
						return;
					}

					source.id = source.type + '_' + Date.now().toString();

					const success = await createSource(this.plugin.settings.apiUrl, source as ApiSourceConfig);
					if (success) {
						this.groupConfig.sources.push(source as ApiSourceConfig);
						this.onCreate(source as ApiSourceConfig);
						this.close();
						new Notice('数据源创建成功');
					} else {
						new Notice('创建失败');
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// 统一数据源Modal（选择现有或创建新数据源）
class UnifiedSourceModal extends Modal {
	plugin: TrendRadarPlugin;
	groupConfig: SourceGroupModel;
	onConfirm: (source: ApiSourceConfig) => void;

	// State
	availableSources: ApiSourceConfig[] = [];
	selectedSourceId: string | null = null;
	isCreatingNew: boolean = true;
	newSource: Partial<ApiSourceConfig> = {};

	constructor(app: App, plugin: TrendRadarPlugin, groupConfig: SourceGroupModel, onConfirm: (source: ApiSourceConfig) => void) {
		super(app);
		this.plugin = plugin;
		this.groupConfig = groupConfig;
		this.onConfirm = onConfirm;
		this.isCreatingNew = true;
		this.initializeNewSource();
	}

	initializeNewSource() {
		this.newSource = {
			id: '',
			name: '',
			type: 'rss',
			enabled: true,
			url: '',
			username: '',
			selector: '',
			schedule: '0 * * * *',
			retention_days: 7,
			max_items: 20,
			use_proxy: false,
			extra: {}
		};
	}

	async onOpen() {
		const { contentEl, modalEl } = this;
		contentEl.empty();

		// 添加CSS类名以应用Apple风格样式
		modalEl.addClass('mod-fresh-unified-source');

		// Fetch available sources
		try {
			const allSources = await getSources(this.plugin.settings.apiUrl);
			// Filter out sources already in this group
			const groupSourceIds = this.groupConfig.sources.map(s => s.id);
			this.availableSources = allSources.filter(s => !groupSourceIds.includes(s.id));
		} catch (error) {
			console.error('Failed to fetch sources:', error);
			this.availableSources = [];
		}

		contentEl.createEl('h2', { text: '添加数据源' });

		// 模式选择：选择现有 或 创建新数据源
		new Setting(contentEl)
			.setName('选择数据源')
			.setDesc('选择已有数据源，或选择"创建新数据源"来创建新的')
			.addDropdown(dropdown => {
				dropdown.addOption('__new__', '✨ 创建新数据源');

				this.availableSources.forEach(source => {
					dropdown.addOption(source.id, `${source.name} (${source.type})`);
				});

				dropdown.setValue(this.isCreatingNew ? '__new__' : (this.selectedSourceId || '__new__'));

				dropdown.onChange(async (value) => {
					if (value === '__new__') {
						this.isCreatingNew = true;
						this.selectedSourceId = null;
					} else {
						this.isCreatingNew = false;
						this.selectedSourceId = value;
					}
					this.onOpen(); // Refresh modal
				});
			});

		if (!this.isCreatingNew && this.selectedSourceId) {
			// 显示已选数据源的信息
			const selectedSource = this.availableSources.find(s => s.id === this.selectedSourceId);
			if (selectedSource) {
				this.renderSelectedSourceInfo(contentEl, selectedSource);
			}
		} else {
			// 显示创建新数据源的表单
			this.renderCreateSourceForm(contentEl);
		}
	}

	renderSelectedSourceInfo(container: HTMLElement, source: ApiSourceConfig) {
		const infoContainer = container.createDiv({ cls: 'source-info-container' });

		infoContainer.createEl('h3', { text: '数据源信息' });

		const infoTable = infoContainer.createEl('table', { cls: 'source-info-table' });

		const fields = [
			{ label: '名称', value: source.name },
			{ label: '类型', value: source.type },
			{ label: '状态', value: source.enabled ? '启用' : '禁用' }
		];

		if (source.type === 'rss' && source.url) {
			fields.push({ label: 'URL', value: source.url });
		}
		if (source.type === 'twitter' && source.username) {
			fields.push({ label: '用户名', value: source.username });
		}
		if (source.type === 'local' && source.extra?.path) {
			fields.push({ label: '目录路径', value: source.extra.path });
		}

		fields.forEach(field => {
			const row = infoTable.createEl('tr');
			row.createEl('th', { text: field.label });
			row.createEl('td', { text: field.value });
		});

		// 确认按钮
		new Setting(container)
			.addButton(button => button
				.setButtonText('确认添加')
				.setCta()
				.onClick(() => {
					this.onConfirm(source);
					this.close();
				}));
	}

	renderCreateSourceForm(container: HTMLElement) {
		container.createEl('h3', { text: '创建新数据源' });

		new Setting(container)
			.setName('类型')
			.addDropdown(dropdown => dropdown
				.addOption('rss', 'RSS 订阅')
				.addOption('twitter', 'Twitter/X 用户')
				.addOption('local', '本地目录')
				.setValue(this.newSource.type)
				.onChange(value => {
					this.newSource.type = value as any;
					this.onOpen();
				}));

		new Setting(container)
			.setName('名称')
			.addText(text => text
				.setValue(this.newSource.name)
				.setPlaceholder('输入数据源名称')
				.onChange(value => this.newSource.name = value));

		if (this.newSource.type === 'rss') {
			new Setting(container)
				.setName('URL')
				.addText(text => text
					.setValue(this.newSource.url)
					.setPlaceholder('https://example.com/rss')
					.onChange(value => this.newSource.url = value));
		}

		if (this.newSource.type === 'twitter') {
			new Setting(container)
				.setName('用户名')
				.addText(text => text
					.setValue(this.newSource.username || '')
					.setPlaceholder('@username')
					.onChange(value => this.newSource.username = value));
		}

		if (this.newSource.type === 'local') {
			new Setting(container)
				.setName('目录路径')
				.addText(text => text
					.setValue(this.newSource.extra?.path || '')
					.setPlaceholder('/path/to/directory')
					.onChange(value => {
						if (!this.newSource.extra) this.newSource.extra = {};
						this.newSource.extra.path = value;
					}));

			new Setting(container)
				.setName('文件模式')
				.setDesc('逗号分隔的文件模式，例如: *.md, *.txt')
				.addText(text => text
					.setValue(this.newSource.extra?.file_patterns?.join(', ') || '*.md, *.txt')
					.onChange(value => {
						if (!this.newSource.extra) this.newSource.extra = {};
						this.newSource.extra.file_patterns = value.split(',').map(s => s.trim());
					}));

			new Setting(container)
				.setName('递归子目录')
				.addToggle(toggle => toggle
					.setValue(this.newSource.extra?.recursive ?? true)
					.onChange(value => {
						if (!this.newSource.extra) this.newSource.extra = {};
						this.newSource.extra.recursive = value;
					}));
		}

		// 通用配置（所有类型共享）
		new Setting(container)
			.setName('保留天数')
			.setDesc('保留内容的天数')
			.addText(text => text
				.setValue(String(this.newSource.retention_days || 7))
				.setPlaceholder('7')
				.onChange(value => this.newSource.retention_days = parseInt(value) || 7));

		new Setting(container)
			.setName('最大条目数')
			.setDesc('每次抓取的最大数量')
			.addText(text => text
				.setValue(String(this.newSource.max_items || 20))
				.setPlaceholder('20')
				.onChange(value => this.newSource.max_items = parseInt(value) || 20));

		new Setting(container)
			.setName('抓取计划')
			.setDesc('Cron 表达式（默认每小时一次）')
			.addText(text => text
				.setValue(this.newSource.schedule || '0 * * * *')
				.setPlaceholder('0 * * * *')
				.onChange(value => this.newSource.schedule = value));

		new Setting(container)
			.setName('使用代理')
			.addToggle(toggle => toggle
				.setValue(this.newSource.use_proxy || false)
				.onChange(value => this.newSource.use_proxy = value));

		new Setting(container)
			.setName('启用')
			.addToggle(toggle => toggle
				.setValue(this.newSource.enabled !== false)
				.onChange(value => this.newSource.enabled = value));

		// 创建按钮
		new Setting(container)
			.addButton(button => button
				.setButtonText('创建并添加')
				.setCta()
				.onClick(async () => {
					if (!this.newSource.name) {
						new Notice('请输入数据源名称');
						return;
					}

					// Generate ID
					this.newSource.id = this.newSource.type + '_' + Date.now().toString();

					try {
						// Create the source via API
						const success = await createSource(this.plugin.settings.apiUrl, this.newSource as ApiSourceConfig);
						if (success) {
							this.onConfirm(this.newSource as ApiSourceConfig);
							this.close();
							new Notice(`已创建并添加 ${this.newSource.name} 到分组`);
						} else {
							new Notice('创建失败，请重试');
						}
					} catch (error) {
						new Notice('创建失败: ' + error);
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
