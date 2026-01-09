import { request, Notice } from 'obsidian';

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
}

export interface ThemesResponse {
    themes: ThemeSummary[];
    new_theme_age_days: number;
    date: string;
}

export interface SourceConfig {
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

export interface FilterConfig {
    keyword_blacklist: string[];
    category_blacklist: string[];
    source_blacklist: string[];
    min_content_length: number;
    min_importance: number;
    enable_ai_prefilter: boolean;
}


// --- Helper Functions ---

async function apiRequest<T>(url: string, method: string = 'GET', body?: any): Promise<T | null> {
    try {
        const options: any = {
            url,
            method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await request(options);
        return JSON.parse(response) as T;
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
