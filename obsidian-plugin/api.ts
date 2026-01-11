import { Notice } from 'obsidian';

// --- Interfaces for API Data ---

export interface Article {
    id: number;
    title: string;
    url: string;
    published_at: string;
    feed_id: string;
    summary: string;
    author: string;
    source_name?: string;
}

export interface ThemeDetail {
    id: number;
    title: string;
    summary: string;
    category: string;
    importance: number;
    impact: number;
    created_at: string;
    status: string;
    read_at?: string;
    tags?: string;
    key_points?: string[];
    articles: Article[];
    is_duplicate?: number;
    duplicate_similarity?: number;
}

export interface ThemeSummary {
    id: number;
    title: string;
    summary: string;
    category: string;
    importance: number;
    impact: number;
    created_at: string;
    status: string;
    read_at?: string;
    tags?: string;
    is_duplicate?: number;
    duplicate_similarity?: number;
}

export interface ThemesResponse {
    themes: ThemeSummary[];
    new_theme_age_days: number;
    date: string;
}

export interface SourceConfig {
    id: string;
    name: string;
    type: 'rss' | 'web' | 'twitter' | 'local';
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

export interface FilterConfig {
    keyword_blacklist: string[];
    category_blacklist: string[];
    source_blacklist: string[];
    min_content_length: number;
    min_importance: number;
    enable_ai_prefilter: boolean;
}

export interface AIConfig {
    provider: string;
    api_key: string;
    base_url: string;
    model_name: string;
    temperature: number;
}

export interface AIService {
    id: string;
    name: string;
    provider: string;
    api_key: string;
    base_url: string;
    model_name: string;
    temperature: number;
    description: string;
}

// ========================================
// AI Services API
// ========================================

/**
 * 获取所有AI服务
 */
export async function getAIServices(apiUrl: string): Promise<AIService[]> {
    if (!apiUrl) return [];

    const result = await apiRequest<AIService[]>(`${apiUrl}/api/ai-services`);
    return result ?? [];
}

/**
 * 获取单个AI服务
 */
export async function getAIService(apiUrl: string, serviceId: string): Promise<AIService | null> {
    if (!apiUrl) return null;

    return apiRequest<AIService>(`${apiUrl}/api/ai-services/${serviceId}`);
}

/**
 * 创建AI服务
 */
export async function createAIService(apiUrl: string, service: AIService): Promise<AIService | null> {
    if (!apiUrl) return null;

    return apiRequest<AIService>(`${apiUrl}/api/ai-services`, 'POST', service);
}

/**
 * 更新AI服务
 */
export async function updateAIService(apiUrl: string, serviceId: string, service: AIService): Promise<AIService | null> {
    if (!apiUrl) return null;

    return apiRequest<AIService>(`${apiUrl}/api/ai-services/${serviceId}`, 'PUT', service);
}

/**
 * 删除AI服务
 */
export async function deleteAIService(apiUrl: string, serviceId: string): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/ai-services/${serviceId}`, 'DELETE');
    return result?.success ?? false;
}

// ========================================
// Source Groups API
// ========================================

export interface SourceGroupModel {
    id: string;
    name: string;
    enabled: boolean;
    description?: string;
    ai_config?: AIConfigModel;
    sources: SourceConfig[];
}

// Single AI stage configuration
export interface AIStageConfig {
    provider: string;
    api_key: string;
    base_url: string;
    model_name: string;
    temperature: number;
}

// Two-stage AI configuration (analysis + aggregation)
export interface AIConfigModel {
    // AI processing mode: 'two-stage' (analysis + aggregation) or 'single' (one-stage processing)
    mode?: 'two-stage' | 'single';

    // AI service IDs (new format)
    analysis_service_id?: string;
    aggregation_service_id?: string;

    // Legacy single-stage format (for backward compatibility or single mode)
    provider?: string;
    api_key?: string;
    base_url?: string;
    model_name?: string;
    temperature?: number;

    // Legacy two-stage format (for backward compatibility)
    analysis?: AIStageConfig;
    aggregation?: AIStageConfig;
}

export interface SourceGroupsResponse {
    groups: SourceGroupModel[];
}

/**
 * 获取所有数据源分组
 */
export async function getSourceGroups(apiUrl: string): Promise<SourceGroupModel[]> {
    if (!apiUrl) return [];

    const result = await apiRequest<SourceGroupsResponse>(`${apiUrl}/api/source-groups`);
    return result?.groups ?? [];
}

/**
 * 获取单个数据源分组
 */
export async function getSourceGroup(apiUrl: string, groupId: string): Promise<SourceGroupModel | null> {
    if (!apiUrl) return null;

    return apiRequest<SourceGroupModel>(`${apiUrl}/api/source-groups/${groupId}`);
}

/**
 * 创建数据源分组
 */
export async function createSourceGroup(apiUrl: string, group: SourceGroupModel): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/source-groups`, 'POST', group);
    return result?.success ?? false;
}

/**
 * 更新数据源分组
 */
export async function updateSourceGroup(apiUrl: string, groupId: string, group: SourceGroupModel): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/source-groups/${groupId}`, 'PUT', group);
    return result?.success ?? false;
}

/**
 * 删除数据源分组
 */
export async function deleteSourceGroup(apiUrl: string, groupId: string): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/source-groups/${groupId}`, 'DELETE');
    return result?.success ?? false;
}


// --- Helper Functions ---

async function apiRequest<T>(url: string, method: string = 'GET', body?: any): Promise<T | null> {
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result as T;
    } catch (error) {
        console.error(`TrendRadar API Error (${method} ${url}):`, error);
        return null;
    }
}


// ========================================
// Themes API
// ========================================

/**
 * 获取主题列表
 */
export async function getThemes(apiUrl: string, date?: string, status?: string): Promise<ThemesResponse | null> {
    if (!apiUrl) {
        new Notice('TrendRadar API URL is not configured.');
        return null;
    }

    const url = new URL(`${apiUrl}/api/themes`);
    if (date) url.searchParams.append('date', date);
    if (status) url.searchParams.append('status', status);

    return apiRequest<ThemesResponse>(url.toString());
}

/**
 * 获取主题详情
 */
export async function getThemeDetails(apiUrl: string, themeId: number, date?: string): Promise<ThemeDetail | null> {
    if (!apiUrl) {
        new Notice('TrendRadar API URL is not configured.');
        return null;
    }

    const url = new URL(`${apiUrl}/api/themes/${themeId}`);
    if (date) url.searchParams.append('date', date);

    return apiRequest<ThemeDetail>(url.toString());
}

/**
 * 更新主题状态
 */
export async function updateThemeStatus(apiUrl: string, themeId: number, status: string, date?: string): Promise<boolean> {
    if (!apiUrl) return false;

    const url = new URL(`${apiUrl}/api/themes/${themeId}/status`);
    if (date) url.searchParams.append('date', date);

    const result = await apiRequest<{ success: boolean }>(url.toString(), 'PUT', { status });
    return result?.success ?? false;
}

/**
 * 删除主题
 */
export async function deleteTheme(apiUrl: string, themeId: number, date?: string): Promise<boolean> {
    if (!apiUrl) return false;

    const url = new URL(`${apiUrl}/api/themes/${themeId}`);
    if (date) url.searchParams.append('date', date);

    const result = await apiRequest<{ success: boolean }>(url.toString(), 'DELETE');
    return result?.success ?? false;
}


// ========================================
// Sources API
// ========================================

/**
 * 获取所有数据源
 */
export async function getSources(apiUrl: string): Promise<SourceConfig[]> {
    if (!apiUrl) return [];

    const result = await apiRequest<SourceConfig[]>(`${apiUrl}/api/sources`);
    return result ?? [];
}

/**
 * 获取单个数据源
 */
export async function getSource(apiUrl: string, sourceId: string): Promise<SourceConfig | null> {
    if (!apiUrl) return null;

    return apiRequest<SourceConfig>(`${apiUrl}/api/sources/${sourceId}`);
}

/**
 * 创建数据源
 */
export async function createSource(apiUrl: string, source: SourceConfig): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/sources`, 'POST', source);
    return result?.success ?? false;
}

/**
 * 更新数据源
 */
export async function updateSource(apiUrl: string, sourceId: string, source: SourceConfig): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/sources/${sourceId}`, 'PUT', source);
    return result?.success ?? false;
}

/**
 * 删除数据源
 */
export async function deleteSource(apiUrl: string, sourceId: string): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/sources/${sourceId}`, 'DELETE');
    return result?.success ?? false;
}

/**
 * 切换数据源启用状态
 */
export async function toggleSource(apiUrl: string, sourceId: string, enabled: boolean): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/sources/${sourceId}/toggle`, 'PUT', { enabled });
    return result?.success ?? false;
}


// ========================================
// Filter API
// ========================================

/**
 * 获取过滤器配置
 */
export async function getFilterConfig(apiUrl: string): Promise<FilterConfig> {
    if (!apiUrl) {
        return {
            keyword_blacklist: [],
            category_blacklist: [],
            source_blacklist: [],
            min_content_length: 100,
            min_importance: 0,
            enable_ai_prefilter: true
        };
    }

    const result = await apiRequest<FilterConfig>(`${apiUrl}/api/filter`);
    return result ?? {
        keyword_blacklist: [],
        category_blacklist: [],
        source_blacklist: [],
        min_content_length: 100,
        min_importance: 0,
        enable_ai_prefilter: true
    };
}

/**
 * 更新过滤器配置
 */
export async function updateFilterConfig(apiUrl: string, config: FilterConfig): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/filter`, 'PUT', config);
    return result?.success ?? false;
}

/**
 * 添加黑名单关键词
 */
export async function addFilterKeyword(apiUrl: string, keyword: string): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/filter/keywords`, 'POST', { keyword });
    return result?.success ?? false;
}

/**
 * 移除黑名单关键词
 */
export async function removeFilterKeyword(apiUrl: string, keyword: string): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/filter/keywords/${encodeURIComponent(keyword)}`, 'DELETE');
    return result?.success ?? false;
}


// ========================================
// AI Config API
// ========================================

/**
 * 获取 AI 配置
 */
export async function getAIConfig(apiUrl: string): Promise<AIConfig> {
    if (!apiUrl) {
        return {
            provider: 'openai',
            api_key: '',
            base_url: '',
            model_name: 'gpt-3.5-turbo',
            temperature: 0.7
        };
    }

    const result = await apiRequest<AIConfig>(`${apiUrl}/api/ai/config`);
    return result ?? {
        provider: 'openai',
        api_key: '',
        base_url: '',
        model_name: 'gpt-3.5-turbo',
        temperature: 0.7
    };
}

/**
 * 更新 AI 配置
 */
export async function updateAIConfig(apiUrl: string, config: AIConfig): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/ai/config`, 'PUT', config);
    return result?.success ?? false;
}


// ========================================
// Settings API
// ========================================

export interface SettingsConfig {
    app: {
        timezone: string;
        show_version_update: boolean;
    };
    frontend: {
        new_theme_age_days: number;
    };
    report: {
        mode: string;
        display_mode: string;
        rank_threshold: number;
        sort_by_position_first: boolean;
        max_news_per_keyword: number;
        reverse_content_order: boolean;
    };
    notification: {
        enabled: boolean;
        push_window: {
            enabled: boolean;
            start: string;
            end: string;
            once_per_day: boolean;
        };
        channels: {
            feishu: { webhook_url: string };
            dingtalk: { webhook_url: string };
            wework: { webhook_url: string; msg_type: string };
            telegram: { bot_token: string; chat_id: string };
            email: {
                from: string;
                password: string;
                to: string;
                smtp_server: string;
                smtp_port: string;
            };
            ntfy: {
                server_url: string;
                topic: string;
                token: string;
            };
            bark: { url: string };
            slack: { webhook_url: string };
        };
    };
    integrations: {
        obsidian: { export_path: string };
    };
    storage: any;
    advanced: any;
}

/**
 * 获取系统设置
 */
export async function getSettings(apiUrl: string): Promise<SettingsConfig | null> {
    if (!apiUrl) return null;

    return apiRequest<SettingsConfig>(`${apiUrl}/api/settings`);
}

/**
 * 更新系统设置
 */
export async function updateSettings(apiUrl: string, settings: Partial<SettingsConfig>): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/settings`, 'PUT', settings);
    return result?.success ?? false;
}


// ========================================
// Tasks API
// ========================================

export interface FetchStatus {
    last_fetch_time: string | null;
    new_items_count: number;
    status: 'idle' | 'running' | 'completed' | 'error';
}

/**
 * 触发立即抓取任务
 */
export async function triggerFetch(apiUrl: string): Promise<boolean> {
    if (!apiUrl) return false;

    const result = await apiRequest<{ success: boolean }>(`${apiUrl}/api/tasks/fetch`, 'POST');
    return result?.success ?? false;
}

/**
 * 获取抓取状态
 */
export async function getFetchStatus(apiUrl: string): Promise<FetchStatus | null> {
    if (!apiUrl) return null;

    return await apiRequest<FetchStatus>(`${apiUrl}/api/tasks/status`);
}


// ========================================
// Errors API
// ========================================

export interface ErrorLog {
    id: string;
    type: 'source' | 'ai' | 'storage' | 'display';
    severity: 'warning' | 'error' | 'critical';
    source: string;
    message: string;
    details?: string;
    timestamp: string;
    resolved: boolean;
}

export interface ErrorSummary {
    total_unresolved: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
    by_source?: Record<string, number>;
    by_date?: Record<string, number>;
    recent_errors: ErrorLog[];
}

/**
 * 获取错误统计摘要
 */
export async function getErrorSummary(apiUrl: string): Promise<ErrorSummary | null> {
    if (!apiUrl) return null;

    return await apiRequest<ErrorSummary>(`${apiUrl}/api/errors/summary`);
}

/**
 * 获取错误列表
 */
export async function getErrors(apiUrl: string, unresolvedOnly: boolean = true, limit?: number): Promise<ErrorLog[]> {
    if (!apiUrl) return [];

    const url = new URL(`${apiUrl}/api/errors`);
    url.searchParams.append('unresolved_only', String(unresolvedOnly));
    if (limit) url.searchParams.append('limit', String(limit));

    return await apiRequest<ErrorLog[]>(url.toString()) ?? [];
}

/**
 * 标记错误已解决
 */
export async function resolveErrors(apiUrl: string, errorType?: string, source?: string): Promise<boolean> {
    if (!apiUrl) return false;

    const url = new URL(`${apiUrl}/api/errors/resolve`);
    if (errorType) url.searchParams.append('error_type', errorType);
    if (source) url.searchParams.append('source', source);

    const result = await apiRequest<{ success: boolean }>(url.toString(), 'PUT');
    return result?.success ?? false;
}
