import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, TextComponent, DropdownComponent, ToggleComponent, ButtonComponent } from 'obsidian';
import { getThemes, getSources, createSource, updateSource, deleteSource, getFilterConfig, updateFilterConfig, getAIConfig, updateAIConfig, triggerFetch } from './api';
import { TrendRadarView, TRENDRADAR_VIEW_TYPE } from './view';

// --- Interfaces ---

interface TrendRadarSettings {
	apiUrl: string;
	exportPath: string;
	autoRefresh: boolean;
	refreshInterval: number; // 分钟
}

interface SourceConfig {
	id: string;
	name: string;
	type: 'rss' | 'web' | 'twitter';
	enabled: boolean;
	url: string;
	username: string;
	selector: string;
	schedule: string;
	retention_days: number;
	max_items: number;
	use_proxy: boolean;
	extra: Record<string, any>;
}

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
	private sourcesContainer: HTMLElement;
	private filterContainer: HTMLElement;
	private aiContainer: HTMLElement;

	constructor(app: App, plugin: TrendRadarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// ========== 基本设置 ==========
		containerEl.createEl('h2', { text: 'TrendRadar 设置' });

		new Setting(containerEl)
			.setName('后端 API 地址')
			.setDesc('TrendRadar Python 后端服务器的地址')
			.addText(text => text
				.setPlaceholder('http://127.0.0.1:3334')
				.setValue(this.plugin.settings.apiUrl)
				.onChange(async (value) => {
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('导出文件夹')
			.setDesc('新笔记将保存到此文件夹')
			.addText(text => text
				.setPlaceholder('TrendRadar/Notes')
				.setValue(this.plugin.settings.exportPath)
				.onChange(async (value) => {
					this.plugin.settings.exportPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('自动刷新')
			.setDesc('启用后将自动定时刷新数据')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoRefresh)
				.onChange(async (value) => {
					this.plugin.settings.autoRefresh = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
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

		// ========== 任务控制 ==========
		containerEl.createEl('h2', { text: '任务控制' });
		
		new Setting(containerEl)
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

		// ========== AI 配置 ==========
		containerEl.createEl('h2', { text: '大模型配置' });
		containerEl.createEl('p', { 
			text: '配置用于内容分析和总结的大语言模型。',
			cls: 'setting-item-description'
		});

		this.aiContainer = containerEl.createDiv({ cls: 'trendradar-ai-settings' });
		this.refreshAISettings();

		// ========== 数据源管理 ==========
		containerEl.createEl('h2', { text: '数据源管理' });
		containerEl.createEl('p', { 
			text: '在这里添加、编辑或删除您的信息订阅源。支持 RSS、网站爬取和 Twitter/X 账号。',
			cls: 'setting-item-description'
		});

		// 添加数据源按钮
		new Setting(containerEl)
			.setName('添加新数据源')
			.addButton(button => button
				.setButtonText('+ 添加')
				.setCta()
				.onClick(() => {
					new SourceEditModal(this.app, this.plugin, null, () => {
						this.refreshSourcesList();
					}).open();
				}));

		// 数据源列表容器
		this.sourcesContainer = containerEl.createDiv({ cls: 'trendradar-sources-list' });
		this.refreshSourcesList();

		// ========== 内容过滤 ==========
		containerEl.createEl('h2', { text: '内容过滤' });
		containerEl.createEl('p', { 
			text: '配置关键词黑名单和分类过滤，自动排除您不感兴趣的内容。',
			cls: 'setting-item-description'
		});

		this.filterContainer = containerEl.createDiv({ cls: 'trendradar-filter-settings' });
		this.refreshFilterSettings();
	}

	async refreshAISettings() {
		this.aiContainer.empty();

		try {
			const config = await getAIConfig(this.plugin.settings.apiUrl);
			
			// 提供商
			new Setting(this.aiContainer)
				.setName('AI 提供商')
				.setDesc('选择 AI 服务提供商')
				.addDropdown(dropdown => dropdown
					.addOption('openai', 'OpenAI')
					.addOption('deepseek', 'DeepSeek')
					.addOption('gemini', 'Google Gemini')
					.setValue(config.provider)
					.onChange(async (value) => {
						config.provider = value;
						await updateAIConfig(this.plugin.settings.apiUrl, config);
					}));

			// API Key
			new Setting(this.aiContainer)
				.setName('API Key')
				.setDesc('输入您的 API Key')
				.addText(text => text
					.setPlaceholder('sk-...')
					.setValue(config.api_key)
					.onChange(async (value) => {
						config.api_key = value;
						await updateAIConfig(this.plugin.settings.apiUrl, config);
					}));

			// Base URL
			new Setting(this.aiContainer)
				.setName('Base URL')
				.setDesc('API 基础地址（可选，用于中转或自定义端点）')
				.addText(text => text
					.setPlaceholder('https://api.openai.com/v1')
					.setValue(config.base_url)
					.onChange(async (value) => {
						config.base_url = value;
						await updateAIConfig(this.plugin.settings.apiUrl, config);
					}));

			// 模型名称
			new Setting(this.aiContainer)
				.setName('模型名称')
				.setDesc('指定使用的模型（如 gpt-4o, deepseek-chat）')
				.addText(text => text
					.setPlaceholder('gpt-3.5-turbo')
					.setValue(config.model_name)
					.onChange(async (value) => {
						config.model_name = value;
						await updateAIConfig(this.plugin.settings.apiUrl, config);
					}));

			// 温度
			new Setting(this.aiContainer)
				.setName('温度 (Temperature)')
				.setDesc('控制生成内容的随机性 (0.0 - 1.0)')
				.addSlider(slider => slider
					.setLimits(0, 1, 0.1)
					.setValue(config.temperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						config.temperature = value;
						await updateAIConfig(this.plugin.settings.apiUrl, config);
					}));

		} catch (error) {
			this.aiContainer.createEl('p', { 
				text: '无法加载 AI 配置，请检查后端服务是否运行。',
				cls: 'trendradar-error-hint'
			});
		}
	}

	async refreshSourcesList() {
		this.sourcesContainer.empty();

		try {
			const sources = await getSources(this.plugin.settings.apiUrl);
			
			if (!sources || sources.length === 0) {
				this.sourcesContainer.createEl('p', { 
					text: '暂无数据源，请点击上方按钮添加。',
					cls: 'trendradar-empty-hint'
				});
				return;
			}

			for (const source of sources) {
				this.renderSourceItem(source);
			}
		} catch (error) {
			this.sourcesContainer.createEl('p', { 
				text: '无法加载数据源列表，请检查后端服务是否运行。',
				cls: 'trendradar-error-hint'
			});
		}
	}

	renderSourceItem(source: SourceConfig) {
		const itemEl = this.sourcesContainer.createDiv({ cls: 'trendradar-source-item' });
		
		// 状态指示器
		const statusEl = itemEl.createSpan({ 
			cls: `trendradar-source-status ${source.enabled ? 'enabled' : 'disabled'}` 
		});
		statusEl.title = source.enabled ? '已启用' : '已禁用';

		// 类型图标
		const typeIcons: Record<string, string> = {
			'rss': '📡',
			'web': '🌐',
			'twitter': '🐦'
		};
		itemEl.createSpan({ text: typeIcons[source.type] || '📄', cls: 'trendradar-source-icon' });

		// 名称和描述
		const infoEl = itemEl.createDiv({ cls: 'trendradar-source-info' });
		infoEl.createEl('strong', { text: source.name });
		const descText = source.type === 'twitter' 
			? `@${source.username}` 
			: source.url.substring(0, 50) + (source.url.length > 50 ? '...' : '');
		infoEl.createEl('small', { text: descText });

		// 操作按钮
		const actionsEl = itemEl.createDiv({ cls: 'trendradar-source-actions' });
		
		// 编辑按钮
		const editBtn = actionsEl.createEl('button', { text: '编辑' });
		editBtn.onclick = () => {
			new SourceEditModal(this.app, this.plugin, source, () => {
				this.refreshSourcesList();
			}).open();
		};

		// 删除按钮
		const deleteBtn = actionsEl.createEl('button', { text: '删除', cls: 'mod-warning' });
		deleteBtn.onclick = async () => {
			if (confirm(`确定要删除数据源 "${source.name}" 吗？`)) {
				try {
					await deleteSource(this.plugin.settings.apiUrl, source.id);
					new Notice(`已删除数据源: ${source.name}`);
					this.refreshSourcesList();
				} catch (error) {
					new Notice('删除失败，请重试');
				}
			}
		};
	}

	async refreshFilterSettings() {
		this.filterContainer.empty();

		try {
			const config = await getFilterConfig(this.plugin.settings.apiUrl);
			
			// 关键词黑名单
			new Setting(this.filterContainer)
				.setName('关键词黑名单')
				.setDesc('包含这些关键词的文章将被自动过滤（每行一个）')
				.addTextArea(text => {
					text.setPlaceholder('娱乐圈\n八卦\n明星')
						.setValue(config.keyword_blacklist.join('\n'))
						.onChange(async (value) => {
							config.keyword_blacklist = value.split('\n').filter(k => k.trim());
							await updateFilterConfig(this.plugin.settings.apiUrl, config);
						});
					text.inputEl.rows = 6;
					text.inputEl.cols = 30;
				});

			// 分类黑名单
			new Setting(this.filterContainer)
				.setName('分类黑名单')
				.setDesc('这些分类的文章将被自动过滤（每行一个）')
				.addTextArea(text => {
					text.setPlaceholder('娱乐\n体育\n游戏')
						.setValue(config.category_blacklist.join('\n'))
						.onChange(async (value) => {
							config.category_blacklist = value.split('\n').filter(k => k.trim());
							await updateFilterConfig(this.plugin.settings.apiUrl, config);
						});
					text.inputEl.rows = 6;
					text.inputEl.cols = 30;
				});

			// 最低重要性
			new Setting(this.filterContainer)
				.setName('最低重要性评分')
				.setDesc('低于此评分的文章将被过滤（1-10，0表示不过滤）')
				.addSlider(slider => slider
					.setLimits(0, 10, 1)
					.setValue(config.min_importance)
					.setDynamicTooltip()
					.onChange(async (value) => {
						config.min_importance = value;
						await updateFilterConfig(this.plugin.settings.apiUrl, config);
					}));

			// AI 预过滤
			new Setting(this.filterContainer)
				.setName('启用 AI 预过滤')
				.setDesc('让 AI 在分析时自动识别并过滤无关内容')
				.addToggle(toggle => toggle
					.setValue(config.enable_ai_prefilter)
					.onChange(async (value) => {
						config.enable_ai_prefilter = value;
						await updateFilterConfig(this.plugin.settings.apiUrl, config);
					}));

		} catch (error) {
			this.filterContainer.createEl('p', { 
				text: '无法加载过滤器配置，请检查后端服务是否运行。',
				cls: 'trendradar-error-hint'
			});
		}
	}
}


// --- Source Edit Modal ---

class SourceEditModal extends Modal {
	private plugin: TrendRadarPlugin;
	private source: SourceConfig | null;
	private onSave: () => void;
	private formData: Partial<SourceConfig>;

	constructor(app: App, plugin: TrendRadarPlugin, source: SourceConfig | null, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.source = source;
		this.onSave = onSave;
		
		// 初始化表单数据
		this.formData = source ? { ...source } : {
			id: '',
			name: '',
			type: 'rss',
			enabled: true,
			url: '',
			username: '',
			selector: '',
			schedule: '0 * * * *',
			retention_days: 30,
			max_items: 50,
			use_proxy: false,
			extra: {}
		};
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('trendradar-source-modal');

		contentEl.createEl('h2', { text: this.source ? '编辑数据源' : '添加数据源' });

		// ID（仅新建时可编辑）
		new Setting(contentEl)
			.setName('ID')
			.setDesc('唯一标识符，只能包含字母、数字和连字符')
			.addText(text => {
				text.setPlaceholder('my-source-id')
					.setValue(this.formData.id || '')
					.setDisabled(!!this.source)
					.onChange(value => {
						this.formData.id = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
					});
			});

		// 名称
		new Setting(contentEl)
			.setName('名称')
			.setDesc('显示名称')
			.addText(text => {
				text.setPlaceholder('我的数据源')
					.setValue(this.formData.name || '')
					.onChange(value => {
						this.formData.name = value;
					});
			});

		// 类型
		new Setting(contentEl)
			.setName('类型')
			.setDesc('选择数据源类型')
			.addDropdown(dropdown => {
				dropdown
					.addOption('rss', 'RSS 订阅')
					.addOption('web', '网站爬取')
					.addOption('twitter', 'Twitter/X')
					.setValue(this.formData.type || 'rss')
					.onChange(value => {
						this.formData.type = value as 'rss' | 'web' | 'twitter';
						this.refreshTypeSpecificFields(contentEl);
					});
			});

		// 类型特定字段容器
		const typeFieldsContainer = contentEl.createDiv({ cls: 'trendradar-type-fields' });
		this.renderTypeSpecificFields(typeFieldsContainer);

		// 通用设置
		contentEl.createEl('h3', { text: '通用设置' });

		// 更新频率
		new Setting(contentEl)
			.setName('更新频率')
			.setDesc('Cron 表达式，例如: 0 * * * * (每小时), */15 * * * * (每15分钟)')
			.addText(text => {
				text.setPlaceholder('0 * * * *')
					.setValue(this.formData.schedule || '0 * * * *')
					.onChange(value => {
						this.formData.schedule = value;
					});
			});

		// 数据保留天数
		new Setting(contentEl)
			.setName('数据保留天数')
			.setDesc('超过此天数的数据将被自动清理')
			.addText(text => {
				text.setPlaceholder('30')
					.setValue(String(this.formData.retention_days || 30))
					.onChange(value => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.formData.retention_days = num;
						}
					});
			});

		// 单次最大抓取数量
		new Setting(contentEl)
			.setName('单次最大抓取数量')
			.setDesc('每次抓取的最大文章数量')
			.addText(text => {
				text.setPlaceholder('50')
					.setValue(String(this.formData.max_items || 50))
					.onChange(value => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.formData.max_items = num;
						}
					});
			});

		// 启用状态
		new Setting(contentEl)
			.setName('启用')
			.setDesc('是否启用此数据源')
			.addToggle(toggle => {
				toggle.setValue(this.formData.enabled !== false)
					.onChange(value => {
						this.formData.enabled = value;
					});
			});

		// 保存按钮
		new Setting(contentEl)
			.addButton(button => {
				button.setButtonText('保存')
				.setCta()
				.onClick(async () => {
					await this.saveSource();
				});
			})
			.addButton(button => {
				button.setButtonText('取消')
				.onClick(() => {
					this.close();
				});
			});
	}

	refreshTypeSpecificFields(containerEl: HTMLElement) {
		const typeFieldsContainer = containerEl.querySelector('.trendradar-type-fields');
		if (typeFieldsContainer) {
			typeFieldsContainer.empty();
			this.renderTypeSpecificFields(typeFieldsContainer as HTMLElement);
		}
	}

	renderTypeSpecificFields(container: HTMLElement) {
		container.empty();

		switch (this.formData.type) {
			case 'rss':
				new Setting(container)
					.setName('RSS URL')
					.setDesc('RSS 或 Atom 订阅源的 URL')
					.addText(text => {
						text.setPlaceholder('https://example.com/feed.xml')
							.setValue(this.formData.url || '')
							.onChange(value => {
								this.formData.url = value;
							});
						text.inputEl.style.width = '100%';
					});
				break;

			case 'web':
				new Setting(container)
					.setName('网页 URL')
					.setDesc('要爬取的网页地址')
					.addText(text => {
						text.setPlaceholder('https://example.com/news')
							.setValue(this.formData.url || '')
							.onChange(value => {
								this.formData.url = value;
							});
						text.inputEl.style.width = '100%';
					});

				new Setting(container)
					.setName('CSS 选择器')
					.setDesc('用于定位文章链接的 CSS 选择器')
					.addText(text => {
						text.setPlaceholder('.article-list a')
							.setValue(this.formData.selector || '')
							.onChange(value => {
								this.formData.selector = value;
							});
						text.inputEl.style.width = '100%';
					});
				break;

			case 'twitter':
				new Setting(container)
					.setName('Twitter 用户名')
					.setDesc('要关注的 Twitter/X 账号（不含 @）')
					.addText(text => {
						text.setPlaceholder('elonmusk')
							.setValue(this.formData.username || '')
							.onChange(value => {
								this.formData.username = value.replace('@', '');
							});
					});
				break;
		}
	}

	async saveSource() {
		// 验证必填字段
		if (!this.formData.id || !this.formData.name) {
			new Notice('请填写 ID 和名称');
			return;
		}

		if (this.formData.type === 'twitter' && !this.formData.username) {
			new Notice('请填写 Twitter 用户名');
			return;
		}

		if ((this.formData.type === 'rss' || this.formData.type === 'web') && !this.formData.url) {
			new Notice('请填写 URL');
			return;
		}

		try {
			if (this.source) {
				// 更新
				await updateSource(this.plugin.settings.apiUrl, this.source.id, this.formData as SourceConfig);
				new Notice(`已更新数据源: ${this.formData.name}`);
			} else {
				// 创建
				await createSource(this.plugin.settings.apiUrl, this.formData as SourceConfig);
				new Notice(`已创建数据源: ${this.formData.name}`);
			}
			
			this.onSave();
			this.close();
		} catch (error) {
			new Notice('保存失败，请重试');
			console.error('Save source error:', error);
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
