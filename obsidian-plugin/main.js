'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// ========================================
// AI Services API
// ========================================
/**
 * 获取所有AI服务
 */
function getAIServices(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return [];
        const result = yield apiRequest(`${apiUrl}/api/ai-services`);
        return result !== null && result !== void 0 ? result : [];
    });
}
/**
 * 获取单个AI服务
 */
function getAIService(apiUrl, serviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return apiRequest(`${apiUrl}/api/ai-services/${serviceId}`);
    });
}
/**
 * 创建AI服务
 */
function createAIService(apiUrl, service) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return apiRequest(`${apiUrl}/api/ai-services`, 'POST', service);
    });
}
/**
 * 更新AI服务
 */
function updateAIService(apiUrl, serviceId, service) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return apiRequest(`${apiUrl}/api/ai-services/${serviceId}`, 'PUT', service);
    });
}
/**
 * 删除AI服务
 */
function deleteAIService(apiUrl, serviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/ai-services/${serviceId}`, 'DELETE');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 获取所有数据源分组
 */
function getSourceGroups(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return [];
        const result = yield apiRequest(`${apiUrl}/api/source-groups`);
        return (_a = result === null || result === void 0 ? void 0 : result.groups) !== null && _a !== void 0 ? _a : [];
    });
}
/**
 * 获取单个数据源分组
 */
function getSourceGroup(apiUrl, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return apiRequest(`${apiUrl}/api/source-groups/${groupId}`);
    });
}
/**
 * 创建数据源分组
 */
function createSourceGroup(apiUrl, group) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/source-groups`, 'POST', group);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 更新数据源分组
 */
function updateSourceGroup(apiUrl, groupId, group) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/source-groups/${groupId}`, 'PUT', group);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 删除数据源分组
 */
function deleteSourceGroup(apiUrl, groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/source-groups/${groupId}`, 'DELETE');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
// --- Helper Functions ---
function apiRequest(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, method = 'GET', body) {
        try {
            const options = {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = yield fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = yield response.json();
            return result;
        }
        catch (error) {
            console.error(`TrendRadar API Error (${method} ${url}):`, error);
            return null;
        }
    });
}
// ========================================
// Themes API
// ========================================
/**
 * 获取主题列表
 */
function getThemes(apiUrl, date, status) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl) {
            new obsidian.Notice('TrendRadar API URL is not configured.');
            return null;
        }
        const url = new URL(`${apiUrl}/api/themes`);
        if (date)
            url.searchParams.append('date', date);
        if (status)
            url.searchParams.append('status', status);
        return apiRequest(url.toString());
    });
}
/**
 * 获取主题详情
 */
function getThemeDetails(apiUrl, themeId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl) {
            new obsidian.Notice('TrendRadar API URL is not configured.');
            return null;
        }
        const url = new URL(`${apiUrl}/api/themes/${themeId}`);
        if (date)
            url.searchParams.append('date', date);
        return apiRequest(url.toString());
    });
}
/**
 * 更新主题状态
 */
function updateThemeStatus(apiUrl, themeId, status, date) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const url = new URL(`${apiUrl}/api/themes/${themeId}/status`);
        if (date)
            url.searchParams.append('date', date);
        const result = yield apiRequest(url.toString(), 'PUT', { status });
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 删除主题
 */
function deleteTheme(apiUrl, themeId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const url = new URL(`${apiUrl}/api/themes/${themeId}`);
        if (date)
            url.searchParams.append('date', date);
        const result = yield apiRequest(url.toString(), 'DELETE');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
// ========================================
// Sources API
// ========================================
/**
 * 获取所有数据源
 */
function getSources(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return [];
        const result = yield apiRequest(`${apiUrl}/api/sources`);
        return result !== null && result !== void 0 ? result : [];
    });
}
/**
 * 获取单个数据源
 */
function getSource(apiUrl, sourceId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return apiRequest(`${apiUrl}/api/sources/${sourceId}`);
    });
}
/**
 * 创建数据源
 */
function createSource(apiUrl, source) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/sources`, 'POST', source);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 更新数据源
 */
function updateSource(apiUrl, sourceId, source) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/sources/${sourceId}`, 'PUT', source);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 删除数据源
 */
function deleteSource(apiUrl, sourceId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/sources/${sourceId}`, 'DELETE');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 切换数据源启用状态
 */
function toggleSource(apiUrl, sourceId, enabled) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/sources/${sourceId}/toggle`, 'PUT', { enabled });
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
// ========================================
// Filter API
// ========================================
/**
 * 获取过滤器配置
 */
function getFilterConfig(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const result = yield apiRequest(`${apiUrl}/api/filter`);
        return result !== null && result !== void 0 ? result : {
            keyword_blacklist: [],
            category_blacklist: [],
            source_blacklist: [],
            min_content_length: 100,
            min_importance: 0,
            enable_ai_prefilter: true
        };
    });
}
/**
 * 更新过滤器配置
 */
function updateFilterConfig(apiUrl, config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/filter`, 'PUT', config);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 添加黑名单关键词
 */
function addFilterKeyword(apiUrl, keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/filter/keywords`, 'POST', { keyword });
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 移除黑名单关键词
 */
function removeFilterKeyword(apiUrl, keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/filter/keywords/${encodeURIComponent(keyword)}`, 'DELETE');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
// ========================================
// AI Config API
// ========================================
/**
 * 获取 AI 配置
 */
function getAIConfig(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl) {
            return {
                provider: 'openai',
                api_key: '',
                base_url: '',
                model_name: 'gpt-3.5-turbo',
                temperature: 0.7
            };
        }
        const result = yield apiRequest(`${apiUrl}/api/ai/config`);
        return result !== null && result !== void 0 ? result : {
            provider: 'openai',
            api_key: '',
            base_url: '',
            model_name: 'gpt-3.5-turbo',
            temperature: 0.7
        };
    });
}
/**
 * 更新 AI 配置
 */
function updateAIConfig(apiUrl, config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/ai/config`, 'PUT', config);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 获取系统设置
 */
function getSettings(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return apiRequest(`${apiUrl}/api/settings`);
    });
}
/**
 * 更新系统设置
 */
function updateSettings(apiUrl, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/settings`, 'PUT', settings);
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 触发立即抓取任务
 */
function triggerFetch(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const result = yield apiRequest(`${apiUrl}/api/tasks/fetch`, 'POST');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}
/**
 * 获取抓取状态
 */
function getFetchStatus(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return yield apiRequest(`${apiUrl}/api/tasks/status`);
    });
}
/**
 * 获取错误统计摘要
 */
function getErrorSummary(apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiUrl)
            return null;
        return yield apiRequest(`${apiUrl}/api/errors/summary`);
    });
}
/**
 * 获取错误列表
 */
function getErrors(apiUrl_1) {
    return __awaiter(this, arguments, void 0, function* (apiUrl, unresolvedOnly = true, limit) {
        var _a;
        if (!apiUrl)
            return [];
        const url = new URL(`${apiUrl}/api/errors`);
        url.searchParams.append('unresolved_only', String(unresolvedOnly));
        if (limit)
            url.searchParams.append('limit', String(limit));
        return (_a = yield apiRequest(url.toString())) !== null && _a !== void 0 ? _a : [];
    });
}
/**
 * 标记错误已解决
 */
function resolveErrors(apiUrl, errorType, source) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!apiUrl)
            return false;
        const url = new URL(`${apiUrl}/api/errors/resolve`);
        if (errorType)
            url.searchParams.append('error_type', errorType);
        if (source)
            url.searchParams.append('source', source);
        const result = yield apiRequest(url.toString(), 'PUT');
        return (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : false;
    });
}

var api = /*#__PURE__*/Object.freeze({
    __proto__: null,
    addFilterKeyword: addFilterKeyword,
    createAIService: createAIService,
    createSource: createSource,
    createSourceGroup: createSourceGroup,
    deleteAIService: deleteAIService,
    deleteSource: deleteSource,
    deleteSourceGroup: deleteSourceGroup,
    deleteTheme: deleteTheme,
    getAIConfig: getAIConfig,
    getAIService: getAIService,
    getAIServices: getAIServices,
    getErrorSummary: getErrorSummary,
    getErrors: getErrors,
    getFetchStatus: getFetchStatus,
    getFilterConfig: getFilterConfig,
    getSettings: getSettings,
    getSource: getSource,
    getSourceGroup: getSourceGroup,
    getSourceGroups: getSourceGroups,
    getSources: getSources,
    getThemeDetails: getThemeDetails,
    getThemes: getThemes,
    removeFilterKeyword: removeFilterKeyword,
    resolveErrors: resolveErrors,
    toggleSource: toggleSource,
    triggerFetch: triggerFetch,
    updateAIConfig: updateAIConfig,
    updateAIService: updateAIService,
    updateFilterConfig: updateFilterConfig,
    updateSettings: updateSettings,
    updateSource: updateSource,
    updateSourceGroup: updateSourceGroup,
    updateThemeStatus: updateThemeStatus
});

/** @returns {void} */
function noop() {}

function run(fn) {
	return fn();
}

function blank_object() {
	return Object.create(null);
}

/**
 * @param {Function[]} fns
 * @returns {void}
 */
function run_all(fns) {
	fns.forEach(run);
}

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/** @returns {boolean} */
function is_empty(obj) {
	return Object.keys(obj).length === 0;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @returns {void}
 */
function append(target, node) {
	target.appendChild(node);
}

/**
 * @param {Node} target
 * @param {string} style_sheet_id
 * @param {string} styles
 * @returns {void}
 */
function append_styles(target, style_sheet_id, styles) {
	const append_styles_to = get_root_for_style(target);
	if (!append_styles_to.getElementById(style_sheet_id)) {
		const style = element('style');
		style.id = style_sheet_id;
		style.textContent = styles;
		append_stylesheet(append_styles_to, style);
	}
}

/**
 * @param {Node} node
 * @returns {ShadowRoot | Document}
 */
function get_root_for_style(node) {
	if (!node) return document;
	const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
	if (root && /** @type {ShadowRoot} */ (root).host) {
		return /** @type {ShadowRoot} */ (root);
	}
	return node.ownerDocument;
}

/**
 * @param {ShadowRoot | Document} node
 * @param {HTMLStyleElement} style
 * @returns {CSSStyleSheet}
 */
function append_stylesheet(node, style) {
	append(/** @type {Document} */ (node).head || node, style);
	return style.sheet;
}

/**
 * @param {Node} target
 * @param {Node} node
 * @param {Node} [anchor]
 * @returns {void}
 */
function insert(target, node, anchor) {
	target.insertBefore(node, anchor || null);
}

/**
 * @param {Node} node
 * @returns {void}
 */
function detach(node) {
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

/**
 * @returns {void} */
function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} name
 * @returns {HTMLElementTagNameMap[K]}
 */
function element(name) {
	return document.createElement(name);
}

/**
 * @param {string} data
 * @returns {Text}
 */
function text(data) {
	return document.createTextNode(data);
}

/**
 * @returns {Text} */
function space() {
	return text(' ');
}

/**
 * @returns {Text} */
function empty() {
	return text('');
}

/**
 * @param {EventTarget} node
 * @param {string} event
 * @param {EventListenerOrEventListenerObject} handler
 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
 * @returns {() => void}
 */
function listen(node, event, handler, options) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

/**
 * @returns {(event: any) => any} */
function stop_propagation(fn) {
	return function (event) {
		event.stopPropagation();
		// @ts-ignore
		return fn.call(this, event);
	};
}

/**
 * @param {Element} node
 * @param {string} attribute
 * @param {string} [value]
 * @returns {void}
 */
function attr(node, attribute, value) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

/**
 * @param {Element} element
 * @returns {ChildNode[]}
 */
function children(element) {
	return Array.from(element.childNodes);
}

/**
 * @param {Text} text
 * @param {unknown} data
 * @returns {void}
 */
function set_data(text, data) {
	data = '' + data;
	if (text.data === data) return;
	text.data = /** @type {string} */ (data);
}

/**
 * @returns {void} */
function set_input_value(input, value) {
	input.value = value == null ? '' : value;
}

/**
 * @returns {void} */
function select_option(select, value, mounting) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
	if (!mounting || value !== undefined) {
		select.selectedIndex = -1; // no option should be selected
	}
}

function select_value(select) {
	const selected_option = select.querySelector(':checked');
	return selected_option && selected_option.__value;
}

/**
 * @returns {void} */
function toggle_class(element, name, toggle) {
	// The `!!` is required because an `undefined` flag means flipping the current state.
	element.classList.toggle(name, !!toggle);
}

/**
 * @template T
 * @param {string} type
 * @param {T} [detail]
 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
 * @returns {CustomEvent<T>}
 */
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
	return new CustomEvent(type, { detail, bubbles, cancelable });
}

/**
 * @typedef {Node & {
 * 	claim_order?: number;
 * 	hydrate_init?: true;
 * 	actual_end_child?: NodeEx;
 * 	childNodes: NodeListOf<NodeEx>;
 * }} NodeEx
 */

/** @typedef {ChildNode & NodeEx} ChildNodeEx */

/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

/**
 * @typedef {ChildNodeEx[] & {
 * 	claim_info?: {
 * 		last_index: number;
 * 		total_claimed: number;
 * 	};
 * }} ChildNodeArray
 */

let current_component;

/** @returns {void} */
function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error('Function called outside component initialization');
	return current_component;
}

/**
 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
 * ```ts
 * const dispatch = createEventDispatcher<{
 *  loaded: never; // does not take a detail argument
 *  change: string; // takes a detail argument of type string, which is required
 *  optional: number | null; // takes an optional detail argument of type number
 * }>();
 * ```
 *
 * https://svelte.dev/docs/svelte#createeventdispatcher
 * @template {Record<string, any>} [EventMap=any]
 * @returns {import('./public.js').EventDispatcher<EventMap>}
 */
function createEventDispatcher() {
	const component = get_current_component();
	return (type, detail, { cancelable = false } = {}) => {
		const callbacks = component.$$.callbacks[type];
		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
			callbacks.slice().forEach((fn) => {
				fn.call(component, event);
			});
			return !event.defaultPrevented;
		}
		return true;
	};
}

// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
/**
 * @param component
 * @param event
 * @returns {void}
 */
function bubble(component, event) {
	const callbacks = component.$$.callbacks[event.type];
	if (callbacks) {
		// @ts-ignore
		callbacks.slice().forEach((fn) => fn.call(this, event));
	}
}

const dirty_components = [];
const binding_callbacks = [];

let render_callbacks = [];

const flush_callbacks = [];

const resolved_promise = /* @__PURE__ */ Promise.resolve();

let update_scheduled = false;

/** @returns {void} */
function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

/** @returns {void} */
function add_render_callback(fn) {
	render_callbacks.push(fn);
}

// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();

let flushidx = 0; // Do *not* move this inside the flush() function

/** @returns {void} */
function flush() {
	// Do not reenter flush while dirty components are updated, as this can
	// result in an infinite loop. Instead, let the inner flush handle it.
	// Reentrancy is ok afterwards for bindings etc.
	if (flushidx !== 0) {
		return;
	}
	const saved_component = current_component;
	do {
		// first, call beforeUpdate functions
		// and update components
		try {
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
		} catch (e) {
			// reset dirty state to not end up in a deadlocked state and then rethrow
			dirty_components.length = 0;
			flushidx = 0;
			throw e;
		}
		set_current_component(null);
		dirty_components.length = 0;
		flushidx = 0;
		while (binding_callbacks.length) binding_callbacks.pop()();
		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		for (let i = 0; i < render_callbacks.length; i += 1) {
			const callback = render_callbacks[i];
			if (!seen_callbacks.has(callback)) {
				// ...so guard against infinite loops
				seen_callbacks.add(callback);
				callback();
			}
		}
		render_callbacks.length = 0;
	} while (dirty_components.length);
	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}
	update_scheduled = false;
	seen_callbacks.clear();
	set_current_component(saved_component);
}

/** @returns {void} */
function update($$) {
	if ($$.fragment !== null) {
		$$.update();
		run_all($$.before_update);
		const dirty = $$.dirty;
		$$.dirty = [-1];
		$$.fragment && $$.fragment.p($$.ctx, dirty);
		$$.after_update.forEach(add_render_callback);
	}
}

/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 * @param {Function[]} fns
 * @returns {void}
 */
function flush_render_callbacks(fns) {
	const filtered = [];
	const targets = [];
	render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
	targets.forEach((c) => c());
	render_callbacks = filtered;
}

const outroing = new Set();

/**
 * @param {import('./private.js').Fragment} block
 * @param {0 | 1} [local]
 * @returns {void}
 */
function transition_in(block, local) {
	if (block && block.i) {
		outroing.delete(block);
		block.i(local);
	}
}

/** @typedef {1} INTRO */
/** @typedef {0} OUTRO */
/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

/**
 * @typedef {Object} Outro
 * @property {number} r
 * @property {Function[]} c
 * @property {Object} p
 */

/**
 * @typedef {Object} PendingProgram
 * @property {number} start
 * @property {INTRO|OUTRO} b
 * @property {Outro} [group]
 */

/**
 * @typedef {Object} Program
 * @property {number} a
 * @property {INTRO|OUTRO} b
 * @property {1|-1} d
 * @property {number} duration
 * @property {number} start
 * @property {number} end
 * @property {Outro} [group]
 */

// general each functions:

function ensure_array_like(array_like_or_iterator) {
	return array_like_or_iterator?.length !== undefined
		? array_like_or_iterator
		: Array.from(array_like_or_iterator);
}

// keyed each functions:

/** @returns {void} */
function destroy_block(block, lookup) {
	block.d(1);
	lookup.delete(block.key);
}

/** @returns {any[]} */
function update_keyed_each(
	old_blocks,
	dirty,
	get_key,
	dynamic,
	ctx,
	list,
	lookup,
	node,
	destroy,
	create_each_block,
	next,
	get_context
) {
	let o = old_blocks.length;
	let n = list.length;
	let i = o;
	const old_indexes = {};
	while (i--) old_indexes[old_blocks[i].key] = i;
	const new_blocks = [];
	const new_lookup = new Map();
	const deltas = new Map();
	const updates = [];
	i = n;
	while (i--) {
		const child_ctx = get_context(ctx, list, i);
		const key = get_key(child_ctx);
		let block = lookup.get(key);
		if (!block) {
			block = create_each_block(key, child_ctx);
			block.c();
		} else {
			// defer updates until all the DOM shuffling is done
			updates.push(() => block.p(child_ctx, dirty));
		}
		new_lookup.set(key, (new_blocks[i] = block));
		if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
	}
	const will_move = new Set();
	const did_move = new Set();
	/** @returns {void} */
	function insert(block) {
		transition_in(block, 1);
		block.m(node, next);
		lookup.set(block.key, block);
		next = block.first;
		n--;
	}
	while (o && n) {
		const new_block = new_blocks[n - 1];
		const old_block = old_blocks[o - 1];
		const new_key = new_block.key;
		const old_key = old_block.key;
		if (new_block === old_block) {
			// do nothing
			next = new_block.first;
			o--;
			n--;
		} else if (!new_lookup.has(old_key)) {
			// remove old block
			destroy(old_block, lookup);
			o--;
		} else if (!lookup.has(new_key) || will_move.has(new_key)) {
			insert(new_block);
		} else if (did_move.has(old_key)) {
			o--;
		} else if (deltas.get(new_key) > deltas.get(old_key)) {
			did_move.add(new_key);
			insert(new_block);
		} else {
			will_move.add(old_key);
			o--;
		}
	}
	while (o--) {
		const old_block = old_blocks[o];
		if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
	}
	while (n) insert(new_blocks[n - 1]);
	run_all(updates);
	return new_blocks;
}

/** @returns {void} */
function mount_component(component, target, anchor) {
	const { fragment, after_update } = component.$$;
	fragment && fragment.m(target, anchor);
	// onMount happens before the initial afterUpdate
	add_render_callback(() => {
		const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
		// if the component was destroyed immediately
		// it will update the `$$.on_destroy` reference to `null`.
		// the destructured on_destroy may still reference to the old array
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});
	after_update.forEach(add_render_callback);
}

/** @returns {void} */
function destroy_component(component, detaching) {
	const $$ = component.$$;
	if ($$.fragment !== null) {
		flush_render_callbacks($$.after_update);
		run_all($$.on_destroy);
		$$.fragment && $$.fragment.d(detaching);
		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		$$.on_destroy = $$.fragment = null;
		$$.ctx = [];
	}
}

/** @returns {void} */
function make_dirty(component, i) {
	if (component.$$.dirty[0] === -1) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty.fill(0);
	}
	component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
}

// TODO: Document the other params
/**
 * @param {SvelteComponent} component
 * @param {import('./public.js').ComponentConstructorOptions} options
 *
 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
 * This will be the `add_css` function from the compiled component.
 *
 * @returns {void}
 */
function init(
	component,
	options,
	instance,
	create_fragment,
	not_equal,
	props,
	append_styles = null,
	dirty = [-1]
) {
	const parent_component = current_component;
	set_current_component(component);
	/** @type {import('./private.js').T$$} */
	const $$ = (component.$$ = {
		fragment: null,
		ctx: [],
		// state
		props,
		update: noop,
		not_equal,
		bound: blank_object(),
		// lifecycle
		on_mount: [],
		on_destroy: [],
		on_disconnect: [],
		before_update: [],
		after_update: [],
		context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
		// everything else
		callbacks: blank_object(),
		dirty,
		skip_bound: false,
		root: options.target || parent_component.$$.root
	});
	append_styles && append_styles($$.root);
	let ready = false;
	$$.ctx = instance
		? instance(component, options.props || {}, (i, ret, ...rest) => {
				const value = rest.length ? rest[0] : ret;
				if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
					if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
					if (ready) make_dirty(component, i);
				}
				return ret;
		  })
		: [];
	$$.update();
	ready = true;
	run_all($$.before_update);
	// `false` as a special case of no DOM component
	$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
	if (options.target) {
		if (options.hydrate) {
			// TODO: what is the correct type here?
			// @ts-expect-error
			const nodes = children(options.target);
			$$.fragment && $$.fragment.l(nodes);
			nodes.forEach(detach);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			$$.fragment && $$.fragment.c();
		}
		if (options.intro) transition_in(component.$$.fragment);
		mount_component(component, options.target, options.anchor);
		flush();
	}
	set_current_component(parent_component);
}

/**
 * Base class for Svelte components. Used when dev=false.
 *
 * @template {Record<string, any>} [Props=any]
 * @template {Record<string, any>} [Events=any]
 */
class SvelteComponent {
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$ = undefined;
	/**
	 * ### PRIVATE API
	 *
	 * Do not use, may change at any time
	 *
	 * @type {any}
	 */
	$$set = undefined;

	/** @returns {void} */
	$destroy() {
		destroy_component(this, 1);
		this.$destroy = noop;
	}

	/**
	 * @template {Extract<keyof Events, string>} K
	 * @param {K} type
	 * @param {((e: Events[K]) => void) | null | undefined} callback
	 * @returns {() => void}
	 */
	$on(type, callback) {
		if (!is_function(callback)) {
			return noop;
		}
		const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
		callbacks.push(callback);
		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	/**
	 * @param {Partial<Props>} props
	 * @returns {void}
	 */
	$set(props) {
		if (this.$$set && !is_empty(props)) {
			this.$$.skip_bound = true;
			this.$$set(props);
			this.$$.skip_bound = false;
		}
	}
}

/**
 * @typedef {Object} CustomElementPropDefinition
 * @property {string} [attribute]
 * @property {boolean} [reflect]
 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
 */

// generated during release, do not modify

const PUBLIC_VERSION = '4';

if (typeof window !== 'undefined')
	// @ts-ignore
	(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

/* ThemeList.svelte generated by Svelte v4.2.20 */

function add_css$1(target) {
	append_styles(target, "svelte-1lcxgcb", ".trendradar-theme-list-container.svelte-1lcxgcb.svelte-1lcxgcb{padding:8px;height:100%;overflow-y:auto}.empty-state.svelte-1lcxgcb.svelte-1lcxgcb{text-align:center;margin-top:60px;color:var(--text-muted)}.empty-icon.svelte-1lcxgcb.svelte-1lcxgcb{font-size:32px;margin-bottom:10px}.tab-filter-bar.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px;margin-bottom:8px;background:var(--background-secondary);border-radius:8px;position:sticky;top:0;z-index:20}.tab-filter.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;gap:4px;flex:1}.tab-btn.svelte-1lcxgcb.svelte-1lcxgcb{padding:6px 12px;font-size:13px;font-weight:500;background:transparent;border:none;border-radius:6px;color:var(--text-muted);cursor:pointer;transition:all 0.15s ease}.tab-btn.svelte-1lcxgcb.svelte-1lcxgcb:hover{background:var(--background-modifier-hover);color:var(--text-normal)}.tab-btn.active.svelte-1lcxgcb.svelte-1lcxgcb{background:var(--interactive-accent);color:var(--text-on-accent);font-weight:600}.icon-btn.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;align-items:center;justify-content:center;padding:6px 8px;font-size:16px;background:transparent;border:none;border-radius:6px;cursor:pointer;transition:all 0.15s ease;min-width:32px}.icon-btn.svelte-1lcxgcb.svelte-1lcxgcb:hover{background:var(--background-modifier-hover)}.refresh-btn.svelte-1lcxgcb.svelte-1lcxgcb{color:var(--interactive-accent)}.error-badge.svelte-1lcxgcb.svelte-1lcxgcb{color:var(--color-orange);font-weight:600;font-size:14px;padding:6px 10px}.error-badge.svelte-1lcxgcb.svelte-1lcxgcb:hover{background:rgba(255, 165, 0, 0.1)}.batch-actions-bar.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;margin-bottom:8px;background:var(--background-modifier-form-field);border:2px solid var(--interactive-accent);border-radius:6px}.selected-count.svelte-1lcxgcb.svelte-1lcxgcb{font-size:13px;font-weight:600;color:var(--interactive-accent)}.batch-actions.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;gap:6px}.control-bar.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;align-items:center;gap:12px;padding:8px;margin-bottom:8px;background:var(--background-secondary);border-radius:8px;flex-wrap:wrap}.batch-actions-compact.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;align-items:center;gap:6px}.batch-actions-buttons.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;gap:2px}.batch-btn.compact.svelte-1lcxgcb.svelte-1lcxgcb{padding:4px 10px;font-size:13px;font-weight:500;background:transparent;border:none;border-radius:4px;color:var(--text-normal);cursor:pointer;transition:all 0.15s ease}.batch-btn.compact.svelte-1lcxgcb.svelte-1lcxgcb:disabled{opacity:0.4;cursor:not-allowed}.batch-btn.compact.svelte-1lcxgcb.svelte-1lcxgcb:hover:not(:disabled){background:var(--background-modifier-hover)}.sort-controls-compact.svelte-1lcxgcb.svelte-1lcxgcb{flex:0}.sort-select-compact.svelte-1lcxgcb.svelte-1lcxgcb{padding:4px 8px;font-size:13px;font-weight:500;background:var(--background-primary);border:1px solid var(--background-modifier-border);border-radius:6px;color:var(--text-normal);cursor:pointer;transition:all 0.15s ease}.select-all-compact.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--text-normal);cursor:pointer;user-select:none}.select-all-compact.svelte-1lcxgcb input[type=\"checkbox\"].svelte-1lcxgcb{width:16px;height:16px;cursor:pointer;accent-color:var(--interactive-accent)}.batch-btn.svelte-1lcxgcb.svelte-1lcxgcb{padding:6px 12px;font-size:13px;font-weight:600;background:var(--interactive-normal);border:1px solid var(--background-modifier-border);border-radius:4px;color:var(--text-normal);cursor:pointer;transition:all 0.2s}.batch-btn.svelte-1lcxgcb.svelte-1lcxgcb:disabled{opacity:0.5;cursor:not-allowed;transform:none !important}.batch-btn.svelte-1lcxgcb.svelte-1lcxgcb:hover:not(:disabled){background:var(--interactive-hover);transform:translateY(-1px)}.batch-btn.read.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--color-green)}.batch-btn.archive.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--color-orange)}.batch-btn.delete.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--color-red);background:var(--color-error);color:var(--text-on-accent)}.batch-btn.compact.svelte-1lcxgcb.svelte-1lcxgcb:hover:not(:disabled){background:var(--interactive-hover)}.batch-btn.compact.read.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--color-green)}.batch-btn.compact.archive.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--color-orange)}.batch-btn.compact.delete.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--color-red)}.sort-select-compact.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--interactive-accent)}.sort-select-compact.svelte-1lcxgcb.svelte-1lcxgcb:focus{outline:none;border-color:var(--interactive-accent);box-shadow:0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2)}.batch-group.svelte-1lcxgcb.svelte-1lcxgcb{margin-bottom:12px}.batch-group.archived-group.svelte-1lcxgcb.svelte-1lcxgcb{opacity:0.9;margin-top:20px;padding-top:12px;border-top:2px solid var(--background-modifier-border)}.batch-header.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;align-items:center;padding:6px 8px;font-size:13px;color:var(--text-normal);cursor:pointer;user-select:none;margin-bottom:6px;border-radius:4px;background:var(--background-modifier-form-field);font-weight:600}.batch-header.svelte-1lcxgcb.svelte-1lcxgcb:hover{background-color:var(--background-modifier-hover)}.batch-toggle.svelte-1lcxgcb.svelte-1lcxgcb{margin-right:6px;font-size:10px}.batch-label.svelte-1lcxgcb.svelte-1lcxgcb{font-weight:600;flex:1}.batch-count.svelte-1lcxgcb.svelte-1lcxgcb{background-color:var(--interactive-accent);color:var(--text-on-accent);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}.theme-list.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;flex-direction:column;gap:8px}.theme-card.svelte-1lcxgcb.svelte-1lcxgcb{background-color:var(--background-primary);border:1px solid var(--background-modifier-border);border-radius:6px;padding:10px 10px 10px 36px;cursor:pointer;transition:all 0.15s ease;position:relative}.theme-card.svelte-1lcxgcb.svelte-1lcxgcb:hover{border-color:var(--interactive-accent);box-shadow:0 2px 8px rgba(0, 0, 0, 0.05)}.theme-card.read.svelte-1lcxgcb.svelte-1lcxgcb{opacity:0.6;background-color:var(--background-secondary)}.card-header.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}.title-row.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;align-items:baseline;gap:6px;flex:1;min-width:0}.new-dot.svelte-1lcxgcb.svelte-1lcxgcb{width:6px;height:6px;background-color:var(--color-red);border-radius:50%;flex-shrink:0;transform:translateY(-2px)}.duplicate-badge.svelte-1lcxgcb.svelte-1lcxgcb{font-size:12px;flex-shrink:0;margin-right:4px;opacity:0.8;filter:grayscale(0.3)}.duplicate-badge.svelte-1lcxgcb.svelte-1lcxgcb:hover{opacity:1;filter:grayscale(0)}.title.svelte-1lcxgcb.svelte-1lcxgcb{font-size:14px;font-weight:600;margin:0;line-height:1.3;color:var(--text-normal)}.importance-badge.svelte-1lcxgcb.svelte-1lcxgcb{font-size:10px;font-weight:bold;padding:1px 5px;border-radius:4px;margin-left:8px;flex-shrink:0;background-color:var(--background-modifier-border);color:var(--text-muted)}.importance-badge.high.svelte-1lcxgcb.svelte-1lcxgcb{color:var(--color-red);background-color:rgba(var(--color-red-rgb), 0.1)}.summary.svelte-1lcxgcb.svelte-1lcxgcb{font-size:12px;color:var(--text-muted);margin:0 0 8px 0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.meta-row.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:11px}.keywords.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;gap:6px;overflow:hidden}.keyword.svelte-1lcxgcb.svelte-1lcxgcb{color:var(--interactive-accent)}.category-tag.svelte-1lcxgcb.svelte-1lcxgcb{background-color:var(--background-modifier-border);color:var(--text-muted);padding:1px 5px;border-radius:3px;white-space:nowrap}.card-footer.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px dashed var(--background-modifier-border)}.time.svelte-1lcxgcb.svelte-1lcxgcb{font-size:10px;color:var(--text-faint)}.card-actions.svelte-1lcxgcb.svelte-1lcxgcb{display:flex;gap:4px}.checkbox-wrapper.svelte-1lcxgcb.svelte-1lcxgcb{position:absolute;top:10px;left:10px;width:18px;height:18px;z-index:10;cursor:pointer}.checkbox-wrapper.svelte-1lcxgcb input[type=\"checkbox\"].svelte-1lcxgcb{width:16px;height:16px;cursor:pointer;accent-color:var(--interactive-accent)}.theme-card.selected.svelte-1lcxgcb.svelte-1lcxgcb{border-color:var(--interactive-accent) !important;background-color:var(--background-modifier-form-field) !important;box-shadow:0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2)}.theme-card.read.svelte-1lcxgcb.svelte-1lcxgcb{opacity:0.6;background-color:var(--background-secondary)}.action-btn.svelte-1lcxgcb.svelte-1lcxgcb{background:var(--background-secondary);border:1px solid var(--background-modifier-border);padding:3px 8px;font-size:12px;color:var(--text-normal);cursor:pointer;border-radius:4px;font-weight:500;transition:all 0.2s}.action-btn.svelte-1lcxgcb.svelte-1lcxgcb:hover{transform:translateY(-1px);box-shadow:0 2px 4px rgba(0, 0, 0, 0.1)}.action-btn.read.svelte-1lcxgcb.svelte-1lcxgcb:hover{color:var(--color-green);border-color:var(--color-green);background-color:rgba(var(--color-green-rgb), 0.1)}.action-btn.archive.svelte-1lcxgcb.svelte-1lcxgcb:hover{color:var(--color-orange);border-color:var(--color-orange);background-color:rgba(var(--color-orange-rgb), 0.1)}.action-btn.unarchive.svelte-1lcxgcb.svelte-1lcxgcb:hover{color:var(--interactive-accent);border-color:var(--interactive-accent);background-color:rgba(var(--interactive-accent-rgb), 0.1)}.action-btn.delete.svelte-1lcxgcb.svelte-1lcxgcb:hover{color:var(--color-red);border-color:var(--color-red);background-color:rgba(var(--color-red-rgb), 0.15)}.action-btn.export.svelte-1lcxgcb.svelte-1lcxgcb:hover{color:var(--interactive-accent);border-color:var(--interactive-accent);background-color:rgba(var(--interactive-accent-rgb), 0.1)}");
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[43] = list[i];
	child_ctx[45] = i;
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[46] = list[i];
	return child_ctx;
}

function get_each_context_2$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[49] = list[i];
	return child_ctx;
}

// (213:2) {:else}
function create_else_block$1(ctx) {
	let div1;
	let button0;
	let t0;
	let button1;
	let t1;
	let div0;
	let button2;
	let t2;
	let button2_class_value;
	let t3;
	let button3;
	let t4;
	let button3_class_value;
	let t5;
	let button4;
	let t6;
	let button4_class_value;
	let t7;
	let button5;
	let t8;
	let button5_class_value;
	let t9;
	let div5;
	let t10;
	let div3;
	let div2;
	let button6;
	let t11;
	let button6_disabled_value;
	let t12;
	let button7;
	let t13;
	let button7_disabled_value;
	let t14;
	let button8;
	let t15;
	let button8_disabled_value;
	let t16;
	let div4;
	let select;
	let option0;
	let option1;
	let option2;
	let t20;
	let each_1_anchor;
	let mounted;
	let dispose;
	let if_block = /*filteredThemes*/ ctx[4].length > 0 && create_if_block_7$1(ctx);
	let each_value = ensure_array_like(/*batches*/ ctx[7]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			div1 = element("div");
			button0 = element("button");
			button0.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
			t0 = space();
			button1 = element("button");
			button1.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.16L12 17.58l8.47-4.29a2 2 0 0 0 1.71-3.16l-8.47-14.12a2 2 0 0 0-3.42 0z"></path></svg>`;
			t1 = space();
			div0 = element("div");
			button2 = element("button");
			t2 = text("待阅");
			t3 = space();
			button3 = element("button");
			t4 = text("已读");
			t5 = space();
			button4 = element("button");
			t6 = text("归档");
			t7 = space();
			button5 = element("button");
			t8 = text("All");
			t9 = space();
			div5 = element("div");
			if (if_block) if_block.c();
			t10 = space();
			div3 = element("div");
			div2 = element("div");
			button6 = element("button");
			t11 = text("已读");
			t12 = space();
			button7 = element("button");
			t13 = text("归档");
			t14 = space();
			button8 = element("button");
			t15 = text("删除");
			t16 = space();
			div4 = element("div");
			select = element("select");
			option0 = element("option");
			option0.textContent = "重要性";
			option1 = element("option");
			option1.textContent = "时间";
			option2 = element("option");
			option2.textContent = "影响力";
			t20 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			attr(button0, "class", "icon-btn refresh-btn svelte-1lcxgcb");
			attr(button0, "title", "刷新");
			attr(button1, "class", "icon-btn error-badge svelte-1lcxgcb");
			attr(button1, "title", "查看错误");
			attr(button2, "class", button2_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'unread' ? 'active' : '') + " svelte-1lcxgcb");
			attr(button3, "class", button3_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'read' ? 'active' : '') + " svelte-1lcxgcb");
			attr(button4, "class", button4_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'archived' ? 'active' : '') + " svelte-1lcxgcb");
			attr(button5, "class", button5_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'all' ? 'active' : '') + " svelte-1lcxgcb");
			attr(div0, "class", "tab-filter svelte-1lcxgcb");
			attr(div1, "class", "tab-filter-bar svelte-1lcxgcb");
			attr(button6, "class", "batch-btn compact svelte-1lcxgcb");
			attr(button6, "title", "标记已读");
			button6.disabled = button6_disabled_value = /*selectedThemes*/ ctx[1].size === 0;
			attr(button7, "class", "batch-btn compact svelte-1lcxgcb");
			attr(button7, "title", "归档");
			button7.disabled = button7_disabled_value = /*selectedThemes*/ ctx[1].size === 0;
			attr(button8, "class", "batch-btn compact svelte-1lcxgcb");
			attr(button8, "title", "删除");
			button8.disabled = button8_disabled_value = /*selectedThemes*/ ctx[1].size === 0;
			attr(div2, "class", "batch-actions-buttons svelte-1lcxgcb");
			attr(div3, "class", "batch-actions-compact svelte-1lcxgcb");
			option0.__value = "importance";
			set_input_value(option0, option0.__value);
			option1.__value = "time";
			set_input_value(option1, option1.__value);
			option2.__value = "impact";
			set_input_value(option2, option2.__value);
			attr(select, "class", "sort-select-compact svelte-1lcxgcb");
			if (/*sortBy*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[33].call(select));
			attr(div4, "class", "sort-controls-compact svelte-1lcxgcb");
			attr(div5, "class", "control-bar svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, button0);
			append(div1, t0);
			append(div1, button1);
			append(div1, t1);
			append(div1, div0);
			append(div0, button2);
			append(button2, t2);
			append(div0, t3);
			append(div0, button3);
			append(button3, t4);
			append(div0, t5);
			append(div0, button4);
			append(button4, t6);
			append(div0, t7);
			append(div0, button5);
			append(button5, t8);
			insert(target, t9, anchor);
			insert(target, div5, anchor);
			if (if_block) if_block.m(div5, null);
			append(div5, t10);
			append(div5, div3);
			append(div3, div2);
			append(div2, button6);
			append(button6, t11);
			append(div2, t12);
			append(div2, button7);
			append(button7, t13);
			append(div2, t14);
			append(div2, button8);
			append(button8, t15);
			append(div5, t16);
			append(div5, div4);
			append(div4, select);
			append(select, option0);
			append(select, option1);
			append(select, option2);
			select_option(select, /*sortBy*/ ctx[2], true);
			insert(target, t20, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*handleRefresh*/ ctx[20]),
					listen(button1, "click", /*showErrorLog*/ ctx[21]),
					listen(button2, "click", /*click_handler_1*/ ctx[29]),
					listen(button3, "click", /*click_handler_2*/ ctx[30]),
					listen(button4, "click", /*click_handler_3*/ ctx[31]),
					listen(button5, "click", /*click_handler_4*/ ctx[32]),
					listen(button6, "click", /*batchMarkRead*/ ctx[11]),
					listen(button7, "click", /*batchArchive*/ ctx[12]),
					listen(button8, "click", /*batchDelete*/ ctx[13]),
					listen(select, "change", /*select_change_handler*/ ctx[33]),
					listen(select, "change", /*change_handler*/ ctx[28])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*filterTab*/ 1 && button2_class_value !== (button2_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'unread' ? 'active' : '') + " svelte-1lcxgcb")) {
				attr(button2, "class", button2_class_value);
			}

			if (dirty[0] & /*filterTab*/ 1 && button3_class_value !== (button3_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'read' ? 'active' : '') + " svelte-1lcxgcb")) {
				attr(button3, "class", button3_class_value);
			}

			if (dirty[0] & /*filterTab*/ 1 && button4_class_value !== (button4_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'archived' ? 'active' : '') + " svelte-1lcxgcb")) {
				attr(button4, "class", button4_class_value);
			}

			if (dirty[0] & /*filterTab*/ 1 && button5_class_value !== (button5_class_value = "tab-btn " + (/*filterTab*/ ctx[0] === 'all' ? 'active' : '') + " svelte-1lcxgcb")) {
				attr(button5, "class", button5_class_value);
			}

			if (/*filteredThemes*/ ctx[4].length > 0) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_7$1(ctx);
					if_block.c();
					if_block.m(div5, t10);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*selectedThemes*/ 2 && button6_disabled_value !== (button6_disabled_value = /*selectedThemes*/ ctx[1].size === 0)) {
				button6.disabled = button6_disabled_value;
			}

			if (dirty[0] & /*selectedThemes*/ 2 && button7_disabled_value !== (button7_disabled_value = /*selectedThemes*/ ctx[1].size === 0)) {
				button7.disabled = button7_disabled_value;
			}

			if (dirty[0] & /*selectedThemes*/ 2 && button8_disabled_value !== (button8_disabled_value = /*selectedThemes*/ ctx[1].size === 0)) {
				button8.disabled = button8_disabled_value;
			}

			if (dirty[0] & /*sortBy*/ 4) {
				select_option(select, /*sortBy*/ ctx[2]);
			}

			if (dirty[0] & /*batches, selectedThemes, handleThemeClick, handleDelete, handleExport, handleUnarchive, handleArchive, handleMarkRead, isNew, toggleThemeSelection, toggleBatch*/ 5227394) {
				each_value = ensure_array_like(/*batches*/ ctx[7]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
				detach(t9);
				detach(div5);
				detach(t20);
				detach(each_1_anchor);
			}

			if (if_block) if_block.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (207:2) {#if themes.length === 0}
function create_if_block$1(ctx) {
	let div1;

	return {
		c() {
			div1 = element("div");
			div1.innerHTML = `<div class="empty-icon svelte-1lcxgcb">📭</div> <p>暂无主题数据</p> <p class="hint">点击刷新按钮获取最新信息</p>`;
			attr(div1, "class", "empty-state svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(div1);
			}
		}
	};
}

// (262:6) {#if filteredThemes.length > 0}
function create_if_block_7$1(ctx) {
	let label;
	let input;
	let t0;
	let span;
	let mounted;
	let dispose;

	return {
		c() {
			label = element("label");
			input = element("input");
			t0 = space();
			span = element("span");
			span.textContent = "全选";
			attr(input, "type", "checkbox");
			input.checked = /*allSelected*/ ctx[6];
			input.indeterminate = /*someSelected*/ ctx[5];
			attr(input, "class", "svelte-1lcxgcb");
			attr(label, "class", "select-all-compact svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, label, anchor);
			append(label, input);
			append(label, t0);
			append(label, span);

			if (!mounted) {
				dispose = listen(input, "change", /*toggleSelectAll*/ ctx[10]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*allSelected*/ 64) {
				input.checked = /*allSelected*/ ctx[6];
			}

			if (dirty[0] & /*someSelected*/ 32) {
				input.indeterminate = /*someSelected*/ ctx[5];
			}
		},
		d(detaching) {
			if (detaching) {
				detach(label);
			}

			mounted = false;
			dispose();
		}
	};
}

// (322:8) {#if !batch.collapsed}
function create_if_block_1$1(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_value_1 = ensure_array_like(/*batch*/ ctx[43].themes);
	const get_key = ctx => /*theme*/ ctx[46].id;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "theme-list svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*batches, selectedThemes, handleThemeClick, handleDelete, handleExport, handleUnarchive, handleArchive, handleMarkRead, isNew, toggleThemeSelection*/ 5227138) {
				each_value_1 = ensure_array_like(/*batch*/ ctx[43].themes);
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1$1, null, get_each_context_1$1);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

// (343:20) {#if isNew(theme) && theme.status !== 'read'}
function create_if_block_6$1(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			attr(span, "class", "new-dot svelte-1lcxgcb");
			attr(span, "title", "新内容");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (346:20) {#if theme.is_duplicate && theme.is_duplicate === 1}
function create_if_block_5$1(ctx) {
	let span;
	let t;
	let span_title_value;

	return {
		c() {
			span = element("span");
			t = text("🔄");
			attr(span, "class", "duplicate-badge svelte-1lcxgcb");
			attr(span, "title", span_title_value = "重复内容 (相似度: " + (/*theme*/ ctx[46].duplicate_similarity || 0) * 100 + "%})");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*batches*/ 128 && span_title_value !== (span_title_value = "重复内容 (相似度: " + (/*theme*/ ctx[46].duplicate_similarity || 0) * 100 + "%})")) {
				attr(span, "title", span_title_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (361:18) {#if theme.keywords}
function create_if_block_4$1(ctx) {
	let div;
	let each_value_2 = ensure_array_like(parseKeywords(/*theme*/ ctx[46].keywords).slice(0, 3));
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "keywords svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*batches*/ 128) {
				each_value_2 = ensure_array_like(parseKeywords(/*theme*/ ctx[46].keywords).slice(0, 3));
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (363:22) {#each parseKeywords(theme.keywords).slice(0, 3) as kw}
function create_each_block_2$1(ctx) {
	let span;
	let t0;
	let t1_value = /*kw*/ ctx[49] + "";
	let t1;

	return {
		c() {
			span = element("span");
			t0 = text("#");
			t1 = text(t1_value);
			attr(span, "class", "keyword svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*batches*/ 128 && t1_value !== (t1_value = /*kw*/ ctx[49] + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (378:20) {:else}
function create_else_block_1(ctx) {
	let t0;
	let button;
	let mounted;
	let dispose;
	let if_block = /*theme*/ ctx[46].status !== 'read' && create_if_block_3$1(ctx);

	function click_handler_8(...args) {
		return /*click_handler_8*/ ctx[38](/*theme*/ ctx[46], ...args);
	}

	return {
		c() {
			if (if_block) if_block.c();
			t0 = space();
			button = element("button");
			button.textContent = "📦";
			attr(button, "class", "action-btn archive svelte-1lcxgcb");
			attr(button, "title", "归档");
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, t0, anchor);
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_8);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (/*theme*/ ctx[46].status !== 'read') {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_3$1(ctx);
					if_block.c();
					if_block.m(t0.parentNode, t0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(button);
			}

			if (if_block) if_block.d(detaching);
			mounted = false;
			dispose();
		}
	};
}

// (376:20) {#if theme.status === 'archived'}
function create_if_block_2$1(ctx) {
	let button;
	let mounted;
	let dispose;

	function click_handler_6(...args) {
		return /*click_handler_6*/ ctx[36](/*theme*/ ctx[46], ...args);
	}

	return {
		c() {
			button = element("button");
			button.textContent = "↑";
			attr(button, "class", "action-btn unarchive svelte-1lcxgcb");
			attr(button, "title", "取消归档");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_6);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (379:22) {#if theme.status !== 'read'}
function create_if_block_3$1(ctx) {
	let button;
	let mounted;
	let dispose;

	function click_handler_7(...args) {
		return /*click_handler_7*/ ctx[37](/*theme*/ ctx[46], ...args);
	}

	return {
		c() {
			button = element("button");
			button.textContent = "✓";
			attr(button, "class", "action-btn read svelte-1lcxgcb");
			attr(button, "title", "标记已读");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_7);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (324:12) {#each batch.themes as theme (theme.id)}
function create_each_block_1$1(key_1, ctx) {
	let div7;
	let div0;
	let input;
	let input_checked_value;
	let t0;
	let div3;
	let div1;
	let show_if = /*isNew*/ ctx[22](/*theme*/ ctx[46]) && /*theme*/ ctx[46].status !== 'read';
	let t1;
	let t2;
	let h2;
	let t3_value = /*theme*/ ctx[46].title + "";
	let t3;
	let t4;
	let div2;
	let t5_value = /*theme*/ ctx[46].importance + "";
	let t5;
	let div2_class_value;
	let t6;
	let p;
	let t7_value = /*theme*/ ctx[46].summary + "";
	let t7;
	let t8;
	let div4;
	let t9;
	let span0;
	let t10_value = /*theme*/ ctx[46].category + "";
	let t10;
	let t11;
	let div6;
	let span1;
	let t12_value = new Date(/*theme*/ ctx[46].created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + "";
	let t12;
	let t13;
	let div5;
	let t14;
	let button0;
	let t16;
	let button1;
	let t18;
	let div7_class_value;
	let mounted;
	let dispose;

	function change_handler_1() {
		return /*change_handler_1*/ ctx[35](/*theme*/ ctx[46]);
	}

	let if_block0 = show_if && create_if_block_6$1();
	let if_block1 = /*theme*/ ctx[46].is_duplicate && /*theme*/ ctx[46].is_duplicate === 1 && create_if_block_5$1(ctx);
	let if_block2 = /*theme*/ ctx[46].keywords && create_if_block_4$1(ctx);

	function select_block_type_1(ctx, dirty) {
		if (/*theme*/ ctx[46].status === 'archived') return create_if_block_2$1;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block3 = current_block_type(ctx);

	function click_handler_9(...args) {
		return /*click_handler_9*/ ctx[39](/*theme*/ ctx[46], ...args);
	}

	function click_handler_10(...args) {
		return /*click_handler_10*/ ctx[40](/*theme*/ ctx[46], ...args);
	}

	function click_handler_11() {
		return /*click_handler_11*/ ctx[41](/*theme*/ ctx[46]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			div7 = element("div");
			div0 = element("div");
			input = element("input");
			t0 = space();
			div3 = element("div");
			div1 = element("div");
			if (if_block0) if_block0.c();
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			h2 = element("h2");
			t3 = text(t3_value);
			t4 = space();
			div2 = element("div");
			t5 = text(t5_value);
			t6 = space();
			p = element("p");
			t7 = text(t7_value);
			t8 = space();
			div4 = element("div");
			if (if_block2) if_block2.c();
			t9 = space();
			span0 = element("span");
			t10 = text(t10_value);
			t11 = space();
			div6 = element("div");
			span1 = element("span");
			t12 = text(t12_value);
			t13 = space();
			div5 = element("div");
			if_block3.c();
			t14 = space();
			button0 = element("button");
			button0.textContent = "📤";
			t16 = space();
			button1 = element("button");
			button1.textContent = "🗑️";
			t18 = space();
			attr(input, "type", "checkbox");
			input.checked = input_checked_value = /*selectedThemes*/ ctx[1].has(/*theme*/ ctx[46].id);
			attr(input, "class", "svelte-1lcxgcb");
			attr(div0, "class", "checkbox-wrapper svelte-1lcxgcb");
			attr(h2, "class", "title svelte-1lcxgcb");
			attr(div1, "class", "title-row svelte-1lcxgcb");
			attr(div2, "class", div2_class_value = "importance-badge " + getImportanceClass(/*theme*/ ctx[46].importance) + " svelte-1lcxgcb");
			attr(div3, "class", "card-header svelte-1lcxgcb");
			attr(p, "class", "summary svelte-1lcxgcb");
			attr(span0, "class", "category-tag svelte-1lcxgcb");
			attr(div4, "class", "meta-row svelte-1lcxgcb");
			attr(span1, "class", "time svelte-1lcxgcb");
			attr(button0, "class", "action-btn export svelte-1lcxgcb");
			attr(button0, "title", "导出并删除");
			attr(button1, "class", "action-btn delete svelte-1lcxgcb");
			attr(button1, "title", "删除");
			attr(div5, "class", "card-actions svelte-1lcxgcb");
			attr(div6, "class", "card-footer svelte-1lcxgcb");

			attr(div7, "class", div7_class_value = "theme-card " + (/*theme*/ ctx[46].status === 'read' ? 'read' : '') + " " + (/*theme*/ ctx[46].status === 'archived'
			? 'archived'
			: '') + " " + (/*selectedThemes*/ ctx[1].has(/*theme*/ ctx[46].id)
			? 'selected'
			: '') + " svelte-1lcxgcb");

			attr(div7, "role", "button");
			attr(div7, "tabindex", "0");
			this.first = div7;
		},
		m(target, anchor) {
			insert(target, div7, anchor);
			append(div7, div0);
			append(div0, input);
			append(div7, t0);
			append(div7, div3);
			append(div3, div1);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t1);
			if (if_block1) if_block1.m(div1, null);
			append(div1, t2);
			append(div1, h2);
			append(h2, t3);
			append(div3, t4);
			append(div3, div2);
			append(div2, t5);
			append(div7, t6);
			append(div7, p);
			append(p, t7);
			append(div7, t8);
			append(div7, div4);
			if (if_block2) if_block2.m(div4, null);
			append(div4, t9);
			append(div4, span0);
			append(span0, t10);
			append(div7, t11);
			append(div7, div6);
			append(div6, span1);
			append(span1, t12);
			append(div6, t13);
			append(div6, div5);
			if_block3.m(div5, null);
			append(div5, t14);
			append(div5, button0);
			append(div5, t16);
			append(div5, button1);
			append(div7, t18);

			if (!mounted) {
				dispose = [
					listen(input, "change", stop_propagation(change_handler_1)),
					listen(div0, "click", stop_propagation(/*click_handler*/ ctx[27])),
					listen(button0, "click", click_handler_9),
					listen(button1, "click", click_handler_10),
					listen(div7, "click", click_handler_11)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty[0] & /*selectedThemes, batches*/ 130 && input_checked_value !== (input_checked_value = /*selectedThemes*/ ctx[1].has(/*theme*/ ctx[46].id))) {
				input.checked = input_checked_value;
			}

			if (dirty[0] & /*batches*/ 128) show_if = /*isNew*/ ctx[22](/*theme*/ ctx[46]) && /*theme*/ ctx[46].status !== 'read';

			if (show_if) {
				if (if_block0) ; else {
					if_block0 = create_if_block_6$1();
					if_block0.c();
					if_block0.m(div1, t1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*theme*/ ctx[46].is_duplicate && /*theme*/ ctx[46].is_duplicate === 1) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_5$1(ctx);
					if_block1.c();
					if_block1.m(div1, t2);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty[0] & /*batches*/ 128 && t3_value !== (t3_value = /*theme*/ ctx[46].title + "")) set_data(t3, t3_value);
			if (dirty[0] & /*batches*/ 128 && t5_value !== (t5_value = /*theme*/ ctx[46].importance + "")) set_data(t5, t5_value);

			if (dirty[0] & /*batches*/ 128 && div2_class_value !== (div2_class_value = "importance-badge " + getImportanceClass(/*theme*/ ctx[46].importance) + " svelte-1lcxgcb")) {
				attr(div2, "class", div2_class_value);
			}

			if (dirty[0] & /*batches*/ 128 && t7_value !== (t7_value = /*theme*/ ctx[46].summary + "")) set_data(t7, t7_value);

			if (/*theme*/ ctx[46].keywords) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_4$1(ctx);
					if_block2.c();
					if_block2.m(div4, t9);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*batches*/ 128 && t10_value !== (t10_value = /*theme*/ ctx[46].category + "")) set_data(t10, t10_value);
			if (dirty[0] & /*batches*/ 128 && t12_value !== (t12_value = new Date(/*theme*/ ctx[46].created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + "")) set_data(t12, t12_value);

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block3) {
				if_block3.p(ctx, dirty);
			} else {
				if_block3.d(1);
				if_block3 = current_block_type(ctx);

				if (if_block3) {
					if_block3.c();
					if_block3.m(div5, t14);
				}
			}

			if (dirty[0] & /*batches, selectedThemes*/ 130 && div7_class_value !== (div7_class_value = "theme-card " + (/*theme*/ ctx[46].status === 'read' ? 'read' : '') + " " + (/*theme*/ ctx[46].status === 'archived'
			? 'archived'
			: '') + " " + (/*selectedThemes*/ ctx[1].has(/*theme*/ ctx[46].id)
			? 'selected'
			: '') + " svelte-1lcxgcb")) {
				attr(div7, "class", div7_class_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div7);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if_block3.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (314:4) {#each batches as batch, batchIndex}
function create_each_block$1(ctx) {
	let div1;
	let div0;
	let span0;
	let t0_value = (/*batch*/ ctx[43].collapsed ? '▶' : '▼') + "";
	let t0;
	let t1;
	let span1;
	let t2_value = /*batch*/ ctx[43].label + "";
	let t2;
	let t3;
	let span2;
	let t4_value = /*batch*/ ctx[43].themes.length + "";
	let t4;
	let t5;
	let t6;
	let mounted;
	let dispose;

	function click_handler_5() {
		return /*click_handler_5*/ ctx[34](/*batchIndex*/ ctx[45]);
	}

	let if_block = !/*batch*/ ctx[43].collapsed && create_if_block_1$1(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			span0 = element("span");
			t0 = text(t0_value);
			t1 = space();
			span1 = element("span");
			t2 = text(t2_value);
			t3 = space();
			span2 = element("span");
			t4 = text(t4_value);
			t5 = space();
			if (if_block) if_block.c();
			t6 = space();
			attr(span0, "class", "batch-toggle svelte-1lcxgcb");
			attr(span1, "class", "batch-label svelte-1lcxgcb");
			attr(span2, "class", "batch-count svelte-1lcxgcb");
			attr(div0, "class", "batch-header svelte-1lcxgcb");
			attr(div0, "role", "button");
			attr(div0, "tabindex", "0");
			attr(div1, "class", "batch-group svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, span0);
			append(span0, t0);
			append(div0, t1);
			append(div0, span1);
			append(span1, t2);
			append(div0, t3);
			append(div0, span2);
			append(span2, t4);
			append(div1, t5);
			if (if_block) if_block.m(div1, null);
			append(div1, t6);

			if (!mounted) {
				dispose = listen(div0, "click", click_handler_5);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*batches*/ 128 && t0_value !== (t0_value = (/*batch*/ ctx[43].collapsed ? '▶' : '▼') + "")) set_data(t0, t0_value);
			if (dirty[0] & /*batches*/ 128 && t2_value !== (t2_value = /*batch*/ ctx[43].label + "")) set_data(t2, t2_value);
			if (dirty[0] & /*batches*/ 128 && t4_value !== (t4_value = /*batch*/ ctx[43].themes.length + "")) set_data(t4, t4_value);

			if (!/*batch*/ ctx[43].collapsed) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1$1(ctx);
					if_block.c();
					if_block.m(div1, t6);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$1(ctx) {
	let div;

	function select_block_type(ctx, dirty) {
		if (/*themes*/ ctx[3].length === 0) return create_if_block$1;
		return create_else_block$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "trendradar-theme-list-container svelte-1lcxgcb");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if_block.d();
		}
	};
}

function filterThemes(themes, tab) {
	switch (tab) {
		case 'unread':
			return themes.filter(t => t.status !== 'read' && t.status !== 'archived');
		case 'read':
			return themes.filter(t => t.status === 'read');
		case 'archived':
			return themes.filter(t => t.status === 'archived');
		default:
			return themes;
	}
}

function groupThemesByBatch(themes, sortBy) {
	if (!themes || themes.length === 0) return [];
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
	const groups = { '刚刚': [], '今天': [], '昨天': [], '更早': [] };

	for (const theme of themes) {
		const createdAt = new Date(theme.created_at);
		const themeDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
		const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

		if (hoursDiff < 1) {
			groups['刚刚'].push(theme);
		} else if (themeDate.getTime() >= today.getTime()) {
			groups['今天'].push(theme);
		} else if (themeDate.getTime() >= yesterday.getTime()) {
			groups['昨天'].push(theme);
		} else {
			groups['更早'].push(theme);
		}
	}

	// 排序
	const sortFn = getSortFn(sortBy);

	return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([label, items]) => ({
		label,
		themes: items.sort(sortFn),
		collapsed: false
	}));
}

function getSortFn(sortBy) {
	switch (sortBy) {
		case 'time':
			return (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		case 'importance':
			return (a, b) => b.importance - a.importance;
		case 'impact':
			return (a, b) => (b.impact || 0) - (a.impact || 0);
		default:
			return (a, b) => b.importance - a.importance;
	}
}

function getImportanceClass(importance) {
	if (importance >= 8) return 'high';
	if (importance >= 5) return 'medium';
	return 'low';
}

function parseKeywords(keywordsStr) {
	if (!keywordsStr) return [];

	try {
		return JSON.parse(keywordsStr);
	} catch(_a) {
		return keywordsStr.split(',').map(t => t.trim()).filter(t => t);
	}
}

function instance$1($$self, $$props, $$invalidate) {
	let filteredThemes;
	let batchGroups;
	let batches;
	let allSelected;
	let someSelected;
	let { themes = [] } = $$props;
	let { newThemeAgeDays = 1 } = $$props;
	let { errorCount = 0 } = $$props;
	const dispatch = createEventDispatcher();
	let { filterTab = 'unread' } = $$props;
	let { selectedThemes = new Set() } = $$props;
	let { sortBy = 'time' } = $$props;

	// 独立存储折叠状态，避免每次重新创建时重置
	let batchCollapsedStates = {};

	function toggleBatch(index) {
		const label = batches[index].label;
		$$invalidate(25, batchCollapsedStates[label] = !batchCollapsedStates[label], batchCollapsedStates);
		$$invalidate(25, batchCollapsedStates = Object.assign({}, batchCollapsedStates)); // 触发更新
	}

	function toggleThemeSelection(themeId) {
		if (selectedThemes.has(themeId)) {
			selectedThemes.delete(themeId);
		} else {
			selectedThemes.add(themeId);
		}

		$$invalidate(1, selectedThemes = new Set(selectedThemes)); // 触发更新
	}

	function toggleSelectAll() {
		if (allSelected || someSelected) {
			selectedThemes.clear();
		} else {
			filteredThemes.forEach(t => selectedThemes.add(t.id));
		}

		$$invalidate(1, selectedThemes = new Set(selectedThemes));
	}

	function batchMarkRead() {
		return __awaiter(this, void 0, void 0, function* () {
			for (const themeId of selectedThemes) {
				dispatch('theme-mark-read', { themeId });
			}

			selectedThemes.clear();
			$$invalidate(1, selectedThemes = new Set());
		});
	}

	function batchArchive() {
		return __awaiter(this, void 0, void 0, function* () {
			for (const themeId of selectedThemes) {
				dispatch('theme-archive', { themeId });
			}

			selectedThemes.clear();
			$$invalidate(1, selectedThemes = new Set());
		});
	}

	function batchDelete() {
		return __awaiter(this, void 0, void 0, function* () {
			const count = selectedThemes.size;

			if (count > 1) {
				if (!confirm(`确定要删除选中的 ${count} 条信息吗？`)) {
					return;
				}
			}

			for (const themeId of selectedThemes) {
				dispatch('theme-delete', { themeId });
			}

			selectedThemes.clear();
			$$invalidate(1, selectedThemes = new Set());
		});
	}

	function handleThemeClick(themeId) {
		dispatch('theme-click', { themeId });
	}

	function handleMarkRead(e, themeId) {
		e.stopPropagation();
		dispatch('theme-mark-read', { themeId });
	}

	function handleArchive(e, themeId) {
		e.stopPropagation();
		dispatch('theme-archive', { themeId });
	}

	function handleUnarchive(e, themeId) {
		e.stopPropagation();
		dispatch('theme-unarchive', { themeId });
	}

	function handleDelete(e, themeId) {
		e.stopPropagation();

		// 单个删除直接执行，不提示
		dispatch('theme-delete', { themeId });
	}

	function handleExport(e, themeId) {
		return __awaiter(this, void 0, void 0, function* () {
			e.stopPropagation();
			dispatch('theme-export', { themeId });
		});
	}

	function handleRefresh() {
		return __awaiter(this, void 0, void 0, function* () {
			dispatch('refresh');
		});
	}

	function showErrorLog() {
		dispatch('show-errors');
	}

	function isNew(theme) {
		const createdAt = new Date(theme.created_at);
		const ageMs = Date.now() - createdAt.getTime();
		const ageDays = ageMs / (1000 * 60 * 60 * 24);
		return ageDays <= newThemeAgeDays;
	}

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	function change_handler(event) {
		bubble.call(this, $$self, event);
	}

	const click_handler_1 = () => $$invalidate(0, filterTab = 'unread');
	const click_handler_2 = () => $$invalidate(0, filterTab = 'read');
	const click_handler_3 = () => $$invalidate(0, filterTab = 'archived');
	const click_handler_4 = () => $$invalidate(0, filterTab = 'all');

	function select_change_handler() {
		sortBy = select_value(this);
		$$invalidate(2, sortBy);
	}

	const click_handler_5 = batchIndex => toggleBatch(batchIndex);
	const change_handler_1 = theme => toggleThemeSelection(theme.id);
	const click_handler_6 = (theme, e) => handleUnarchive(e, theme.id);
	const click_handler_7 = (theme, e) => handleMarkRead(e, theme.id);
	const click_handler_8 = (theme, e) => handleArchive(e, theme.id);
	const click_handler_9 = (theme, e) => handleExport(e, theme.id);
	const click_handler_10 = (theme, e) => handleDelete(e, theme.id);
	const click_handler_11 = theme => handleThemeClick(theme.id);

	$$self.$$set = $$props => {
		if ('themes' in $$props) $$invalidate(3, themes = $$props.themes);
		if ('newThemeAgeDays' in $$props) $$invalidate(23, newThemeAgeDays = $$props.newThemeAgeDays);
		if ('errorCount' in $$props) $$invalidate(24, errorCount = $$props.errorCount);
		if ('filterTab' in $$props) $$invalidate(0, filterTab = $$props.filterTab);
		if ('selectedThemes' in $$props) $$invalidate(1, selectedThemes = $$props.selectedThemes);
		if ('sortBy' in $$props) $$invalidate(2, sortBy = $$props.sortBy);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*themes, filterTab*/ 9) {
			$$invalidate(4, filteredThemes = filterThemes(themes, filterTab));
		}

		if ($$self.$$.dirty[0] & /*filteredThemes, sortBy*/ 20) {
			$$invalidate(26, batchGroups = groupThemesByBatch(filteredThemes, sortBy));
		}

		if ($$self.$$.dirty[0] & /*batchGroups, batchCollapsedStates*/ 100663296) {
			$$invalidate(7, batches = batchGroups.map(group => Object.assign(Object.assign({}, group), {
				collapsed: batchCollapsedStates[group.label] || false
			})));
		}

		if ($$self.$$.dirty[0] & /*filteredThemes, selectedThemes*/ 18) {
			$$invalidate(6, allSelected = filteredThemes.length > 0 && selectedThemes.size === filteredThemes.length);
		}

		if ($$self.$$.dirty[0] & /*selectedThemes, filteredThemes*/ 18) {
			$$invalidate(5, someSelected = selectedThemes.size > 0 && selectedThemes.size < filteredThemes.length);
		}
	};

	return [
		filterTab,
		selectedThemes,
		sortBy,
		themes,
		filteredThemes,
		someSelected,
		allSelected,
		batches,
		toggleBatch,
		toggleThemeSelection,
		toggleSelectAll,
		batchMarkRead,
		batchArchive,
		batchDelete,
		handleThemeClick,
		handleMarkRead,
		handleArchive,
		handleUnarchive,
		handleDelete,
		handleExport,
		handleRefresh,
		showErrorLog,
		isNew,
		newThemeAgeDays,
		errorCount,
		batchCollapsedStates,
		batchGroups,
		click_handler,
		change_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4,
		select_change_handler,
		click_handler_5,
		change_handler_1,
		click_handler_6,
		click_handler_7,
		click_handler_8,
		click_handler_9,
		click_handler_10,
		click_handler_11
	];
}

class ThemeList extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$1,
			create_fragment$1,
			safe_not_equal,
			{
				themes: 3,
				newThemeAgeDays: 23,
				errorCount: 24,
				filterTab: 0,
				selectedThemes: 1,
				sortBy: 2
			},
			add_css$1,
			[-1, -1]
		);
	}
}

/* ThemeDetail.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-1hhql91", ".trendradar-theme-detail-container.svelte-1hhql91.svelte-1hhql91{padding:0 var(--size-4-2);max-height:70vh;overflow-y:auto}.header.svelte-1hhql91.svelte-1hhql91{margin-bottom:var(--size-4-4);padding-bottom:var(--size-4-4);border-bottom:2px solid var(--background-modifier-border)}.link-summary-header.svelte-1hhql91.svelte-1hhql91{border-bottom:none;padding-bottom:0}.header-top.svelte-1hhql91.svelte-1hhql91{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--size-4-3);flex-wrap:wrap;gap:var(--size-4-2)}.meta-left.svelte-1hhql91.svelte-1hhql91{display:flex;align-items:center;gap:var(--size-4-2)}.category.svelte-1hhql91.svelte-1hhql91{background-color:var(--interactive-accent);color:var(--text-on-accent);padding:4px 12px;border-radius:var(--radius-m);font-weight:600;font-size:var(--font-ui-small)}.status-badge.svelte-1hhql91.svelte-1hhql91{padding:2px 8px;border-radius:var(--radius-s);font-size:var(--font-ui-smaller)}.status-badge.archived.svelte-1hhql91.svelte-1hhql91{background-color:var(--text-faint);color:var(--background-primary)}.status-badge.read.svelte-1hhql91.svelte-1hhql91{background-color:var(--background-modifier-border);color:var(--text-muted)}.action-buttons.svelte-1hhql91.svelte-1hhql91{display:flex;gap:var(--size-4-2)}.action-btn.svelte-1hhql91.svelte-1hhql91{padding:6px 12px;border-radius:var(--radius-s);border:1px solid var(--background-modifier-border);background-color:var(--background-secondary);cursor:pointer;font-size:var(--font-ui-small);transition:all 0.15s}.action-btn.svelte-1hhql91.svelte-1hhql91:hover{background-color:var(--background-secondary-alt)}.action-btn.export.svelte-1hhql91.svelte-1hhql91{border-color:var(--interactive-accent);color:var(--interactive-accent)}.action-btn.delete.svelte-1hhql91.svelte-1hhql91:hover{background-color:rgba(255, 100, 100, 0.2);border-color:var(--color-red)}.metrics.svelte-1hhql91.svelte-1hhql91{display:flex;gap:var(--size-4-4);margin-bottom:var(--size-4-3);flex-wrap:wrap}.metric.svelte-1hhql91.svelte-1hhql91{display:flex;flex-direction:column;gap:2px}.metric-label.svelte-1hhql91.svelte-1hhql91{font-size:var(--font-ui-smaller);color:var(--text-faint)}.metric-value.svelte-1hhql91.svelte-1hhql91{font-weight:600;font-size:var(--font-ui-small)}.metric-value.importance.svelte-1hhql91.svelte-1hhql91{color:var(--color-red)}.metric-value.impact.svelte-1hhql91.svelte-1hhql91{color:var(--color-orange)}.tags.svelte-1hhql91.svelte-1hhql91{display:flex;flex-wrap:wrap;gap:var(--size-4-2)}.tag.svelte-1hhql91.svelte-1hhql91{background-color:var(--background-modifier-border);color:var(--text-muted);padding:3px 10px;border-radius:var(--radius-m);font-size:var(--font-ui-smaller)}.section.svelte-1hhql91.svelte-1hhql91{margin-bottom:var(--size-4-4)}.section.svelte-1hhql91 h2.svelte-1hhql91{font-size:var(--font-ui-medium);font-weight:600;margin-bottom:var(--size-4-3);padding-bottom:var(--size-4-2);border-bottom:1px solid var(--background-modifier-border);color:var(--text-normal)}.summary-text.svelte-1hhql91.svelte-1hhql91{line-height:1.7;color:var(--text-normal);background-color:var(--background-secondary);padding:var(--size-4-3);border-radius:var(--radius-m);border-left:3px solid var(--interactive-accent)}.key-points.svelte-1hhql91.svelte-1hhql91{list-style:none;padding:0;margin:0}.key-points.svelte-1hhql91 li.svelte-1hhql91{position:relative;padding-left:var(--size-4-4);margin-bottom:var(--size-4-2);line-height:1.6}.key-points.svelte-1hhql91 li.svelte-1hhql91::before{content:\"•\";position:absolute;left:0;color:var(--interactive-accent);font-weight:bold}.articles-list.svelte-1hhql91.svelte-1hhql91{display:flex;flex-direction:column;gap:var(--size-4-3);max-height:300px;overflow-y:auto;padding-right:var(--size-4-2)}.link-summary-list.svelte-1hhql91.svelte-1hhql91{gap:var(--size-4-2);max-height:400px}.article-item.svelte-1hhql91.svelte-1hhql91{padding:var(--size-4-3);border-radius:var(--radius-m);background-color:var(--background-secondary);border:1px solid var(--background-modifier-border);transition:all 0.15s}.article-item.svelte-1hhql91.svelte-1hhql91:hover{border-color:var(--background-modifier-border-hover);background-color:var(--background-secondary-alt)}.article-header.svelte-1hhql91.svelte-1hhql91{display:flex;align-items:flex-start;gap:var(--size-4-2)}.article-title.svelte-1hhql91.svelte-1hhql91{font-weight:500;text-decoration:none;color:var(--text-normal);flex:1;line-height:1.4}.article-title.svelte-1hhql91.svelte-1hhql91:hover{color:var(--interactive-accent);text-decoration:underline}.external-link.svelte-1hhql91.svelte-1hhql91{color:var(--text-faint);font-size:12px}.article-meta.svelte-1hhql91.svelte-1hhql91{font-size:var(--font-ui-smaller);color:var(--text-muted);margin-top:var(--size-4-2);display:flex;flex-wrap:wrap;gap:var(--size-4-3)}.article-summary.svelte-1hhql91.svelte-1hhql91{font-size:var(--font-ui-small);color:var(--text-muted);margin-top:var(--size-4-2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	return child_ctx;
}

// (45:8) {#if !isLinkSummary}
function create_if_block_12(ctx) {
	let span;
	let t_value = /*theme*/ ctx[0].category + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "category svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t_value !== (t_value = /*theme*/ ctx[0].category + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (50:42) 
function create_if_block_11(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "已读";
			attr(span, "class", "status-badge read svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (48:8) {#if theme.status === 'archived'}
function create_if_block_10(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "已归档";
			attr(span, "class", "status-badge archived svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (55:8) {#if !isLinkSummary}
function create_if_block_9(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "📝 导出笔记";
			attr(button, "class", "action-btn export svelte-1hhql91");
			attr(button, "title", "导出为笔记");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*handleExport*/ ctx[4]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (60:8) {#if theme.status !== 'archived'}
function create_if_block_8(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "📥 归档";
			attr(button, "class", "action-btn archive svelte-1hhql91");
			attr(button, "title", "归档");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*handleArchive*/ ctx[5]);
				mounted = true;
			}
		},
		p: noop,
		d(detaching) {
			if (detaching) {
				detach(button);
			}

			mounted = false;
			dispose();
		}
	};
}

// (72:4) {#if !isLinkSummary}
function create_if_block_7(ctx) {
	let div3;
	let div0;
	let span0;
	let t1;
	let span1;
	let t2_value = /*theme*/ ctx[0].importance + "";
	let t2;
	let t3;
	let t4;
	let div1;
	let span2;
	let t6;
	let span3;
	let t7_value = /*theme*/ ctx[0].impact + "";
	let t7;
	let t8;
	let t9;
	let div2;
	let span4;
	let t11;
	let span5;
	let t12_value = new Date(/*theme*/ ctx[0].created_at).toLocaleString('zh-CN') + "";
	let t12;

	return {
		c() {
			div3 = element("div");
			div0 = element("div");
			span0 = element("span");
			span0.textContent = "重要性";
			t1 = space();
			span1 = element("span");
			t2 = text(t2_value);
			t3 = text("/10");
			t4 = space();
			div1 = element("div");
			span2 = element("span");
			span2.textContent = "影响力";
			t6 = space();
			span3 = element("span");
			t7 = text(t7_value);
			t8 = text("/10");
			t9 = space();
			div2 = element("div");
			span4 = element("span");
			span4.textContent = "创建时间";
			t11 = space();
			span5 = element("span");
			t12 = text(t12_value);
			attr(span0, "class", "metric-label svelte-1hhql91");
			attr(span1, "class", "metric-value importance svelte-1hhql91");
			attr(div0, "class", "metric svelte-1hhql91");
			attr(span2, "class", "metric-label svelte-1hhql91");
			attr(span3, "class", "metric-value impact svelte-1hhql91");
			attr(div1, "class", "metric svelte-1hhql91");
			attr(span4, "class", "metric-label svelte-1hhql91");
			attr(span5, "class", "metric-value svelte-1hhql91");
			attr(div2, "class", "metric svelte-1hhql91");
			attr(div3, "class", "metrics svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div0);
			append(div0, span0);
			append(div0, t1);
			append(div0, span1);
			append(span1, t2);
			append(span1, t3);
			append(div3, t4);
			append(div3, div1);
			append(div1, span2);
			append(div1, t6);
			append(div1, span3);
			append(span3, t7);
			append(span3, t8);
			append(div3, t9);
			append(div3, div2);
			append(div2, span4);
			append(div2, t11);
			append(div2, span5);
			append(span5, t12);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t2_value !== (t2_value = /*theme*/ ctx[0].importance + "")) set_data(t2, t2_value);
			if (dirty & /*theme*/ 1 && t7_value !== (t7_value = /*theme*/ ctx[0].impact + "")) set_data(t7, t7_value);
			if (dirty & /*theme*/ 1 && t12_value !== (t12_value = new Date(/*theme*/ ctx[0].created_at).toLocaleString('zh-CN') + "")) set_data(t12, t12_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div3);
			}
		}
	};
}

// (90:4) {#if !isLinkSummary && tags.length > 0}
function create_if_block_6(ctx) {
	let div;
	let each_value_2 = ensure_array_like(/*tags*/ ctx[3]);
	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "tags svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty & /*tags*/ 8) {
				each_value_2 = ensure_array_like(/*tags*/ ctx[3]);
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_2.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (92:8) {#each tags as tag}
function create_each_block_2(ctx) {
	let span;
	let t_value = /*tag*/ ctx[15] + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "tag svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*tags*/ 8 && t_value !== (t_value = /*tag*/ ctx[15] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (100:2) {#if !isLinkSummary}
function create_if_block_5(ctx) {
	let div;
	let h2;
	let t1;
	let p;
	let t2_value = /*theme*/ ctx[0].summary + "";
	let t2;

	return {
		c() {
			div = element("div");
			h2 = element("h2");
			h2.textContent = "📊 AI 分析摘要";
			t1 = space();
			p = element("p");
			t2 = text(t2_value);
			attr(h2, "class", "svelte-1hhql91");
			attr(p, "class", "summary-text svelte-1hhql91");
			attr(div, "class", "section summary-section svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, h2);
			append(div, t1);
			append(div, p);
			append(p, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t2_value !== (t2_value = /*theme*/ ctx[0].summary + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (108:2) {#if !isLinkSummary && keyPoints.length > 0}
function create_if_block_4(ctx) {
	let div;
	let h2;
	let t1;
	let ul;
	let each_value_1 = ensure_array_like(/*keyPoints*/ ctx[2]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c() {
			div = element("div");
			h2 = element("h2");
			h2.textContent = "💡 核心要点";
			t1 = space();
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(h2, "class", "svelte-1hhql91");
			attr(ul, "class", "key-points svelte-1hhql91");
			attr(div, "class", "section svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, h2);
			append(div, t1);
			append(div, ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(ul, null);
				}
			}
		},
		p(ctx, dirty) {
			if (dirty & /*keyPoints*/ 4) {
				each_value_1 = ensure_array_like(/*keyPoints*/ ctx[2]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(ul, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (112:8) {#each keyPoints as point}
function create_each_block_1(ctx) {
	let li;
	let t_value = /*point*/ ctx[12] + "";
	let t;

	return {
		c() {
			li = element("li");
			t = text(t_value);
			attr(li, "class", "svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, t);
		},
		p(ctx, dirty) {
			if (dirty & /*keyPoints*/ 4 && t_value !== (t_value = /*point*/ ctx[12] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(li);
			}
		}
	};
}

// (121:4) {#if !isLinkSummary}
function create_if_block_3(ctx) {
	let h2;
	let t0;
	let t1_value = /*theme*/ ctx[0].articles.length + "";
	let t1;
	let t2;

	return {
		c() {
			h2 = element("h2");
			t0 = text("📰 信息来源 (");
			t1 = text(t1_value);
			t2 = text(")");
			attr(h2, "class", "svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			append(h2, t0);
			append(h2, t1);
			append(h2, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = /*theme*/ ctx[0].articles.length + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(h2);
			}
		}
	};
}

// (137:14) {:else}
function create_else_block(ctx) {
	let t0;
	let t1_value = (/*article*/ ctx[9].feed_id || '未知来源') + "";
	let t1;

	return {
		c() {
			t0 = text("📄 ");
			t1 = text(t1_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = (/*article*/ ctx[9].feed_id || '未知来源') + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (135:14) {#if article.source_name}
function create_if_block_2(ctx) {
	let t0;
	let t1_value = /*article*/ ctx[9].source_name + "";
	let t1;

	return {
		c() {
			t0 = text("📡 ");
			t1 = text(t1_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = /*article*/ ctx[9].source_name + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (142:14) {#if article.author}
function create_if_block_1(ctx) {
	let t0;
	let t1_value = /*article*/ ctx[9].author + "";
	let t1;

	return {
		c() {
			t0 = text("👤 ");
			t1 = text(t1_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = /*article*/ ctx[9].author + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (156:10) {#if !isLinkSummary && article.summary}
function create_if_block(ctx) {
	let p;
	let t_value = /*article*/ ctx[9].summary + "";
	let t;

	return {
		c() {
			p = element("p");
			t = text(t_value);
			attr(p, "class", "article-summary svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t_value !== (t_value = /*article*/ ctx[9].summary + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (125:6) {#each theme.articles as article}
function create_each_block(ctx) {
	let div2;
	let div0;
	let a;
	let t0_value = /*article*/ ctx[9].title + "";
	let t0;
	let a_href_value;
	let t1;
	let span0;
	let t3;
	let div1;
	let span1;
	let t4;
	let span2;
	let t5;
	let span3;
	let t6;

	let t7_value = new Date(/*article*/ ctx[9].published_at).toLocaleString('zh-CN', {
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}) + "";

	let t7;
	let t8;
	let t9;

	function select_block_type_1(ctx, dirty) {
		if (/*article*/ ctx[9].source_name) return create_if_block_2;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*article*/ ctx[9].author && create_if_block_1(ctx);
	let if_block2 = !/*isLinkSummary*/ ctx[1] && /*article*/ ctx[9].summary && create_if_block(ctx);

	return {
		c() {
			div2 = element("div");
			div0 = element("div");
			a = element("a");
			t0 = text(t0_value);
			t1 = space();
			span0 = element("span");
			span0.textContent = "↗";
			t3 = space();
			div1 = element("div");
			span1 = element("span");
			if_block0.c();
			t4 = space();
			span2 = element("span");
			if (if_block1) if_block1.c();
			t5 = space();
			span3 = element("span");
			t6 = text("🕐 ");
			t7 = text(t7_value);
			t8 = space();
			if (if_block2) if_block2.c();
			t9 = space();
			attr(a, "href", a_href_value = /*article*/ ctx[9].url);
			attr(a, "target", "_blank");
			attr(a, "rel", "noopener noreferrer");
			attr(a, "class", "article-title svelte-1hhql91");
			attr(span0, "class", "external-link svelte-1hhql91");
			attr(div0, "class", "article-header svelte-1hhql91");
			attr(span1, "class", "source");
			attr(span2, "class", "author");
			attr(span3, "class", "time");
			attr(div1, "class", "article-meta svelte-1hhql91");
			attr(div2, "class", "article-item svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div0);
			append(div0, a);
			append(a, t0);
			append(div0, t1);
			append(div0, span0);
			append(div2, t3);
			append(div2, div1);
			append(div1, span1);
			if_block0.m(span1, null);
			append(div1, t4);
			append(div1, span2);
			if (if_block1) if_block1.m(span2, null);
			append(div1, t5);
			append(div1, span3);
			append(span3, t6);
			append(span3, t7);
			append(div2, t8);
			if (if_block2) if_block2.m(div2, null);
			append(div2, t9);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t0_value !== (t0_value = /*article*/ ctx[9].title + "")) set_data(t0, t0_value);

			if (dirty & /*theme*/ 1 && a_href_value !== (a_href_value = /*article*/ ctx[9].url)) {
				attr(a, "href", a_href_value);
			}

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(span1, null);
				}
			}

			if (/*article*/ ctx[9].author) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					if_block1.m(span2, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*theme*/ 1 && t7_value !== (t7_value = new Date(/*article*/ ctx[9].published_at).toLocaleString('zh-CN', {
				month: 'numeric',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}) + "")) set_data(t7, t7_value);

			if (!/*isLinkSummary*/ ctx[1] && /*article*/ ctx[9].summary) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(div2, t9);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div2);
			}

			if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
		}
	};
}

function create_fragment(ctx) {
	let div6;
	let div3;
	let div2;
	let div0;
	let t0;
	let t1;
	let div1;
	let t2;
	let t3;
	let button;
	let t5;
	let t6;
	let t7;
	let t8;
	let t9;
	let div5;
	let t10;
	let div4;
	let mounted;
	let dispose;
	let if_block0 = !/*isLinkSummary*/ ctx[1] && create_if_block_12(ctx);

	function select_block_type(ctx, dirty) {
		if (/*theme*/ ctx[0].status === 'archived') return create_if_block_10;
		if (/*theme*/ ctx[0].status === 'read') return create_if_block_11;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type && current_block_type(ctx);
	let if_block2 = !/*isLinkSummary*/ ctx[1] && create_if_block_9(ctx);
	let if_block3 = /*theme*/ ctx[0].status !== 'archived' && create_if_block_8(ctx);
	let if_block4 = !/*isLinkSummary*/ ctx[1] && create_if_block_7(ctx);
	let if_block5 = !/*isLinkSummary*/ ctx[1] && /*tags*/ ctx[3].length > 0 && create_if_block_6(ctx);
	let if_block6 = !/*isLinkSummary*/ ctx[1] && create_if_block_5(ctx);
	let if_block7 = !/*isLinkSummary*/ ctx[1] && /*keyPoints*/ ctx[2].length > 0 && create_if_block_4(ctx);
	let if_block8 = !/*isLinkSummary*/ ctx[1] && create_if_block_3(ctx);
	let each_value = ensure_array_like(/*theme*/ ctx[0].articles);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div6 = element("div");
			div3 = element("div");
			div2 = element("div");
			div0 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			div1 = element("div");
			if (if_block2) if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			t3 = space();
			button = element("button");
			button.textContent = "🗑 删除";
			t5 = space();
			if (if_block4) if_block4.c();
			t6 = space();
			if (if_block5) if_block5.c();
			t7 = space();
			if (if_block6) if_block6.c();
			t8 = space();
			if (if_block7) if_block7.c();
			t9 = space();
			div5 = element("div");
			if (if_block8) if_block8.c();
			t10 = space();
			div4 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "class", "meta-left svelte-1hhql91");
			attr(button, "class", "action-btn delete svelte-1hhql91");
			attr(button, "title", "删除");
			attr(div1, "class", "action-buttons svelte-1hhql91");
			attr(div2, "class", "header-top svelte-1hhql91");
			attr(div3, "class", "header svelte-1hhql91");
			toggle_class(div3, "link-summary-header", /*isLinkSummary*/ ctx[1]);
			attr(div4, "class", "articles-list svelte-1hhql91");
			toggle_class(div4, "link-summary-list", /*isLinkSummary*/ ctx[1]);
			attr(div5, "class", "section svelte-1hhql91");
			attr(div6, "class", "trendradar-theme-detail-container svelte-1hhql91");
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div3);
			append(div3, div2);
			append(div2, div0);
			if (if_block0) if_block0.m(div0, null);
			append(div0, t0);
			if (if_block1) if_block1.m(div0, null);
			append(div2, t1);
			append(div2, div1);
			if (if_block2) if_block2.m(div1, null);
			append(div1, t2);
			if (if_block3) if_block3.m(div1, null);
			append(div1, t3);
			append(div1, button);
			append(div3, t5);
			if (if_block4) if_block4.m(div3, null);
			append(div3, t6);
			if (if_block5) if_block5.m(div3, null);
			append(div6, t7);
			if (if_block6) if_block6.m(div6, null);
			append(div6, t8);
			if (if_block7) if_block7.m(div6, null);
			append(div6, t9);
			append(div6, div5);
			if (if_block8) if_block8.m(div5, null);
			append(div5, t10);
			append(div5, div4);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div4, null);
				}
			}

			if (!mounted) {
				dispose = listen(button, "click", /*handleDelete*/ ctx[6]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!/*isLinkSummary*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_12(ctx);
					if_block0.c();
					if_block0.m(div0, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type && current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div0, null);
				}
			}

			if (!/*isLinkSummary*/ ctx[1]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_9(ctx);
					if_block2.c();
					if_block2.m(div1, t2);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*theme*/ ctx[0].status !== 'archived') {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_8(ctx);
					if_block3.c();
					if_block3.m(div1, t3);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (!/*isLinkSummary*/ ctx[1]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_7(ctx);
					if_block4.c();
					if_block4.m(div3, t6);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (!/*isLinkSummary*/ ctx[1] && /*tags*/ ctx[3].length > 0) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_6(ctx);
					if_block5.c();
					if_block5.m(div3, null);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if (dirty & /*isLinkSummary*/ 2) {
				toggle_class(div3, "link-summary-header", /*isLinkSummary*/ ctx[1]);
			}

			if (!/*isLinkSummary*/ ctx[1]) {
				if (if_block6) {
					if_block6.p(ctx, dirty);
				} else {
					if_block6 = create_if_block_5(ctx);
					if_block6.c();
					if_block6.m(div6, t8);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (!/*isLinkSummary*/ ctx[1] && /*keyPoints*/ ctx[2].length > 0) {
				if (if_block7) {
					if_block7.p(ctx, dirty);
				} else {
					if_block7 = create_if_block_4(ctx);
					if_block7.c();
					if_block7.m(div6, t9);
				}
			} else if (if_block7) {
				if_block7.d(1);
				if_block7 = null;
			}

			if (!/*isLinkSummary*/ ctx[1]) {
				if (if_block8) {
					if_block8.p(ctx, dirty);
				} else {
					if_block8 = create_if_block_3(ctx);
					if_block8.c();
					if_block8.m(div5, t10);
				}
			} else if (if_block8) {
				if_block8.d(1);
				if_block8 = null;
			}

			if (dirty & /*theme, isLinkSummary, Date*/ 3) {
				each_value = ensure_array_like(/*theme*/ ctx[0].articles);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div4, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*isLinkSummary*/ 2) {
				toggle_class(div4, "link-summary-list", /*isLinkSummary*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div6);
			}

			if (if_block0) if_block0.d();

			if (if_block1) {
				if_block1.d();
			}

			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			if (if_block5) if_block5.d();
			if (if_block6) if_block6.d();
			if (if_block7) if_block7.d();
			if (if_block8) if_block8.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			dispose();
		}
	};
}

function parseTags$1(tagsStr) {
	if (!tagsStr) return [];

	try {
		return JSON.parse(tagsStr);
	} catch(_a) {
		return tagsStr.split(',').map(t => t.trim()).filter(t => t);
	}
}

function instance($$self, $$props, $$invalidate) {
	let tags;
	let keyPoints;
	let isLinkSummary;
	let { theme } = $$props;
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

	function parseKeyPoints(keyPoints) {
		if (!keyPoints) return [];
		if (Array.isArray(keyPoints)) return keyPoints;

		try {
			return JSON.parse(keyPoints);
		} catch(_a) {
			return [];
		}
	}

	$$self.$$set = $$props => {
		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*theme*/ 1) {
			$$invalidate(3, tags = parseTags$1(theme.tags));
		}

		if ($$self.$$.dirty & /*theme*/ 1) {
			$$invalidate(2, keyPoints = parseKeyPoints(theme.key_points));
		}

		if ($$self.$$.dirty & /*theme*/ 1) {
			$$invalidate(1, isLinkSummary = theme.category === "链接汇总");
		}
	};

	return [
		theme,
		isLinkSummary,
		keyPoints,
		tags,
		handleExport,
		handleArchive,
		handleDelete
	];
}

class ThemeDetail extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0 }, add_css);
	}
}

/**
 * Sanitizes a string to be used as a valid filename.
 * Removes characters that are not allowed in filenames on most operating systems.
 * @param title The string to sanitize.
 * @returns A sanitized string.
 */
function sanitizeFilename(title) {
    // Replace slashes, backslashes, colons, etc., with a space
    // and remove any leading/trailing whitespace or dots.
    return title.replace(/[\\/:*?"<>|]/g, ' ').trim().replace(/\.$/, '');
}
/**
 * 解析 tags 字段，支持字符串和数组格式
 */
function parseTags(tags) {
    if (!tags)
        return [];
    if (Array.isArray(tags))
        return tags;
    try {
        return JSON.parse(tags);
    }
    catch (_a) {
        return tags.split(',').map(t => t.trim()).filter(t => t);
    }
}
/**
 * 解析 key_points 字段，支持字符串和数组格式
 */
function parseKeyPoints(keyPoints) {
    if (!keyPoints)
        return [];
    if (Array.isArray(keyPoints))
        return keyPoints;
    try {
        return JSON.parse(keyPoints);
    }
    catch (_a) {
        return [];
    }
}
/**
 * Formats a ThemeDetail object into a Markdown string for a new note.
 * @param theme The theme object to format.
 * @returns A string containing the full content of the note in Markdown format.
 */
function formatThemeToMarkdown(theme) {
    const filename = `${sanitizeFilename(theme.title)}.md`;
    const tags = parseTags(theme.tags);
    const keyPoints = parseKeyPoints(theme.key_points);
    let tagsSection = '';
    if (tags.length > 0) {
        tagsSection = tags.map(tag => `  - ${tag.toLowerCase().replace(' ', '-')}`).join('\n') + '\n';
    }
    const frontmatter = `---
tags:
  - trendradar
  - ${theme.category.toLowerCase().replace(' ', '-')}
${tagsSection}category: ${theme.category}
importance: ${theme.importance}
impact: ${theme.impact}
created: ${new Date().toISOString()}
---
`;
    let content = frontmatter;
    content += `\n# ${theme.title}\n\n`;
    content += `## AI 分析摘要\n`;
    content += `${theme.summary}\n\n`;
    if (keyPoints.length > 0) {
        content += `## 核心要点\n`;
        keyPoints.forEach(point => {
            content += `- ${point}\n`;
        });
        content += `\n`;
    }
    content += `## 信息来源 (${theme.articles.length})\n`;
    theme.articles.forEach(article => {
        content += `- [${article.title}](${article.url})\n`;
    });
    return { filename, content };
}

var formatter = /*#__PURE__*/Object.freeze({
    __proto__: null,
    formatThemeToMarkdown: formatThemeToMarkdown
});

class ThemeDetailModal extends obsidian.Modal {
    constructor(app, theme, plugin, onAction) {
        super(app);
        this.theme = theme;
        this.plugin = plugin;
        this.onAction = onAction || (() => { });
        this.modalEl.addClass('trendradar-detail-modal');
    }
    onOpen() {
        // 设置模态框标题
        this.titleEl.setText(this.theme.title);
        // 创建 Svelte 组件
        this.component = new ThemeDetail({
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
    handleExport() {
        return __awaiter(this, void 0, void 0, function* () {
            const exportPath = this.plugin.settings.exportPath;
            if (!exportPath) {
                new obsidian.Notice("请先在设置中配置导出路径");
                return;
            }
            const { filename, content } = formatThemeToMarkdown(this.theme);
            const fullPath = `${exportPath}/${filename}`;
            try {
                // 检查文件夹是否存在，不存在则创建
                if (!(yield this.app.vault.adapter.exists(exportPath))) {
                    yield this.app.vault.createFolder(exportPath);
                }
                // 创建笔记
                const newFile = yield this.app.vault.create(fullPath, content);
                new obsidian.Notice(`已导出笔记: ${newFile.basename}`);
                // 导出后删除卡片
                this.onAction('delete');
                // 关闭模态框
                this.close();
                // 打开新笔记
                this.app.workspace.openLinkText(newFile.path, '', false);
            }
            catch (error) {
                console.error("TrendRadar - 导出笔记失败:", error);
                new obsidian.Notice("导出失败，请查看控制台获取详情");
            }
        });
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

class ErrorListModal extends obsidian.Modal {
    constructor(app, errorSummary, plugin) {
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
            const typeLabels = {
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
    createStatCard(title) {
        const card = document.createElement('div');
        card.addClass('error-stat-card');
        card.innerHTML = `<div class="stat-card-title">${title}</div>`;
        return card;
    }
    onClose() {
        // Modal 会自动处理关闭，点击空白区域即可关闭
    }
}

const TRENDRADAR_VIEW_TYPE = "trendradar-view";
class TrendRadarView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.currentThemes = [];
        this.newThemeAgeDays = 1;
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
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    filterThemes(status) {
        if (!this.currentThemes)
            return;
        let filtered = this.currentThemes;
        if (status) {
            if (status === 'unread') {
                filtered = this.currentThemes.filter(t => t.status !== 'read' && t.status !== 'archived');
            }
            else {
                filtered = this.currentThemes.filter(t => t.status === status);
            }
        }
        this.component.$set({ themes: filtered, newThemeAgeDays: this.newThemeAgeDays });
    }
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.component) {
                this.component.$destroy();
            }
        });
    }
    onThemeClick(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const themeId = event.detail.themeId;
            const themeDetails = yield getThemeDetails(this.plugin.settings.apiUrl, themeId);
            if (themeDetails) {
                // 自动标记为已读
                if (themeDetails.status !== 'read' && themeDetails.status !== 'archived') {
                    yield updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'read');
                    // 更新本地状态
                    const theme = this.currentThemes.find(t => t.id === themeId);
                    if (theme) {
                        theme.status = 'read';
                        this.component.$set({ themes: this.currentThemes });
                    }
                }
                new ThemeDetailModal(this.app, themeDetails, this.plugin, (action) => __awaiter(this, void 0, void 0, function* () {
                    if (action === 'archive') {
                        yield this.archiveTheme(themeId);
                    }
                    else if (action === 'delete') {
                        yield this.deleteThemeById(themeId);
                    }
                })).open();
            }
            else {
                new obsidian.Notice("获取详情失败");
            }
        });
    }
    onThemeMarkRead(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const themeId = event.detail.themeId;
            const success = yield updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'read');
            if (success) {
                const theme = this.currentThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.status = 'read';
                    this.component.$set({ themes: this.currentThemes });
                }
            }
        });
    }
    onThemeArchive(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const themeId = event.detail.themeId;
            yield this.archiveTheme(themeId);
        });
    }
    onThemeUnarchive(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const themeId = event.detail.themeId;
            const success = yield updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'unread');
            if (success) {
                new obsidian.Notice('已取消归档');
                const theme = this.currentThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.status = 'unread';
                    this.component.$set({ themes: this.currentThemes });
                }
            }
            else {
                new obsidian.Notice('取消归档失败');
            }
        });
    }
    archiveTheme(themeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'archived');
            if (success) {
                new obsidian.Notice('已归档');
                const theme = this.currentThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.status = 'archived';
                    this.component.$set({ themes: this.currentThemes });
                }
            }
            else {
                new obsidian.Notice('归档失败');
            }
        });
    }
    onThemeDelete(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const themeId = event.detail.themeId;
            yield this.deleteThemeById(themeId);
        });
    }
    deleteThemeById(themeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield deleteTheme(this.plugin.settings.apiUrl, themeId);
            if (success) {
                new obsidian.Notice('已删除');
                this.currentThemes = this.currentThemes.filter(t => t.id !== themeId);
                this.component.$set({ themes: this.currentThemes });
            }
            else {
                new obsidian.Notice('删除失败');
            }
        });
    }
    onThemeExport(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const themeId = event.detail.themeId;
            // 获取主题详情
            const themeDetails = yield getThemeDetails(this.plugin.settings.apiUrl, themeId);
            if (!themeDetails) {
                new obsidian.Notice("获取详情失败");
                return;
            }
            // 导入 formatThemeToMarkdown
            const { formatThemeToMarkdown } = yield Promise.resolve().then(function () { return formatter; });
            const exportPath = this.plugin.settings.exportPath;
            if (!exportPath) {
                new obsidian.Notice("请先在设置中配置导出路径");
                return;
            }
            const { filename, content } = formatThemeToMarkdown(themeDetails);
            const fullPath = `${exportPath}/${filename}`;
            try {
                // 检查文件夹是否存在，不存在则创建
                if (!(yield this.app.vault.adapter.exists(exportPath))) {
                    yield this.app.vault.createFolder(exportPath);
                }
                // 创建笔记
                const newFile = yield this.app.vault.create(fullPath, content);
                new obsidian.Notice(`已导出笔记: ${newFile.basename}`);
                // 导出后删除卡片
                yield this.deleteThemeById(themeId);
                // 打开新笔记
                this.app.workspace.openLinkText(newFile.path, '', false);
            }
            catch (error) {
                console.error("TrendRadar - 导出笔记失败:", error);
                new obsidian.Notice("导出失败，请查看控制台获取详情");
            }
        });
    }
    onRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield triggerFetch(this.plugin.settings.apiUrl);
            if (success) {
                new obsidian.Notice('已触发抓取任务，正在后台处理...');
                // 延迟3秒后刷新数据，给抓取任务一些时间
                setTimeout(() => {
                    this.plugin.activateView();
                }, 3000);
            }
            else {
                new obsidian.Notice('触发抓取失败');
            }
        });
    }
    onShowErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            const summary = yield getErrorSummary(this.plugin.settings.apiUrl);
            if (summary) {
                new ErrorListModal(this.app, summary, this.plugin).open();
            }
        });
    }
    // 更新视图数据
    update(themes_1) {
        return __awaiter(this, arguments, void 0, function* (themes, newThemeAgeDays = 1) {
            this.currentThemes = themes;
            this.newThemeAgeDays = newThemeAgeDays;
            // 获取错误统计
            let errorCount = 0;
            try {
                const summary = yield getErrorSummary(this.plugin.settings.apiUrl);
                if (summary) {
                    errorCount = summary.total_unresolved || 0;
                }
            }
            catch (error) {
                console.error('[TrendRadar] 获取错误统计失败:', error);
            }
            this.component.$set({ themes, newThemeAgeDays, errorCount });
        });
    }
}

const MODEL_PRESETS = {
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
function getModelPresets(provider) {
    return MODEL_PRESETS[provider] || [];
}
const DEFAULT_SETTINGS = {
    apiUrl: 'http://127.0.0.1:3334',
    exportPath: 'TrendRadar',
    autoRefresh: false,
    refreshInterval: 15
};
// --- Main Plugin Class ---
class TrendRadarPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.refreshIntervalId = null;
        this.lastFetchStatus = null;
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            console.log('TrendRadar AI Assistant Plugin loaded.');
            this.registerView(TRENDRADAR_VIEW_TYPE, (leaf) => new TrendRadarView(leaf, this));
            // 添加工具栏图标
            this.addRibbonIcon('radar', 'TrendRadar AI', (evt) => __awaiter(this, void 0, void 0, function* () {
                this.activateView();
            }));
            // 添加设置选项卡
            this.addSettingTab(new TrendRadarSettingTab(this.app, this));
            // 启动自动刷新（如果启用）
            this.setupAutoRefresh();
        });
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
    refreshView() {
        return __awaiter(this, void 0, void 0, function* () {
            // 首先触发后端抓取任务
            try {
                const success = yield triggerFetch(this.settings.apiUrl);
                if (success) {
                    console.log('[TrendRadar] 自动触发抓取任务成功');
                    // 不显示通知，避免打扰用户
                }
            }
            catch (error) {
                console.error('[TrendRadar] 自动触发抓取任务失败:', error);
            }
            // 检查抓取状态
            const status = yield getFetchStatus(this.settings.apiUrl);
            if (status) {
                // 如果有新的完成状态，显示通知
                if (status.status === 'completed' &&
                    this.lastFetchStatus &&
                    (this.lastFetchStatus.status === 'running' || this.lastFetchStatus.status === 'idle')) {
                    if (status.new_items_count > 0) {
                        new obsidian.Notice(`✨ 自动刷新: 新增 ${status.new_items_count} 条信息`);
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
                    const response = yield getThemes(this.settings.apiUrl);
                    if (response && response.themes) {
                        leaf.view.update(response.themes, response.new_theme_age_days);
                    }
                }
            }
        });
    }
    activateView() {
        return __awaiter(this, void 0, void 0, function* () {
            const { workspace } = this.app;
            let leaf = null;
            const leaves = workspace.getLeavesOfType(TRENDRADAR_VIEW_TYPE);
            if (leaves.length > 0) {
                leaf = leaves[0];
            }
            else {
                const newLeaf = workspace.getRightLeaf(false);
                if (newLeaf) {
                    yield newLeaf.setViewState({ type: TRENDRADAR_VIEW_TYPE, active: true });
                    leaf = newLeaf;
                }
            }
            if (!leaf)
                return;
            workspace.revealLeaf(leaf);
            new obsidian.Notice('正在从 TrendRadar 获取数据...');
            const response = yield getThemes(this.settings.apiUrl);
            if (response && response.themes && response.themes.length > 0) {
                new obsidian.Notice(`成功获取 ${response.themes.length} 个主题`);
                if (leaf.view instanceof TrendRadarView) {
                    leaf.view.update(response.themes, response.new_theme_age_days);
                }
            }
            else {
                new obsidian.Notice('暂无主题数据');
            }
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
            this.setupAutoRefresh();
        });
    }
}
// --- Settings Tab ---
class TrendRadarSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.activeTab = 'general';
        this.plugin = plugin;
    }
    display() {
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
        new obsidian.Setting(container)
            .setName('后端 API 地址')
            .setDesc('TrendRadar Python 后端服务器的地址')
            .addText(text => text
            .setPlaceholder('http://127.0.0.1:3334')
            .setValue(this.plugin.settings.apiUrl)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.apiUrl = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(container)
            .setName('导出文件夹')
            .setDesc('新笔记将保存到此文件夹')
            .addText(text => text
            .setPlaceholder('TrendRadar/Notes')
            .setValue(this.plugin.settings.exportPath)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.exportPath = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(container)
            .setName('自动刷新')
            .setDesc('启用后将自动定时刷新数据')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.autoRefresh)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.autoRefresh = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(container)
            .setName('刷新间隔（分钟）')
            .setDesc('自动刷新的时间间隔')
            .addText(text => text
            .setPlaceholder('15')
            .setValue(String(this.plugin.settings.refreshInterval))
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
                this.plugin.settings.refreshInterval = num;
                yield this.plugin.saveSettings();
            }
        })));
        // 任务控制
        container.createEl('h3', { text: '任务控制' });
        new obsidian.Setting(container)
            .setName('立即抓取')
            .setDesc('手动触发一次完整的数据抓取和分析任务（后台运行）')
            .addButton(button => button
            .setButtonText('🚀 开始抓取')
            .setCta()
            .onClick(() => __awaiter(this, void 0, void 0, function* () {
            new obsidian.Notice('正在触发抓取任务...');
            try {
                const success = yield triggerFetch(this.plugin.settings.apiUrl);
                if (success) {
                    new obsidian.Notice('抓取任务已在后台启动，请稍后刷新查看结果');
                }
                else {
                    new obsidian.Notice('触发失败，请检查后端连接');
                }
            }
            catch (error) {
                new obsidian.Notice('触发失败: ' + error);
            }
        })));
    }
    renderSourceGroupsSettings() {
        const container = this.contentContainer;
        container.createEl('p', {
            text: '管理数据源分组，每个分组可以使用不同的AI配置。支持将网络源和本地目录混合分析。',
            cls: 'setting-item-description'
        });
        new obsidian.Setting(container)
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
    refreshSourceGroupsList(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.empty();
            try {
                const groups = yield getSourceGroups(this.plugin.settings.apiUrl);
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
                    }
                    else {
                        infoDiv.createEl('span', {
                            text: '已禁用',
                            cls: 'group-status disabled'
                        });
                    }
                    // 操作
                    const actionsDiv = item.createDiv({ cls: 'group-actions' });
                    // 编辑按钮
                    new obsidian.ButtonComponent(actionsDiv)
                        .setIcon('pencil')
                        .setTooltip('编辑分组')
                        .onClick(() => {
                        new SourceGroupEditModal(this.app, this.plugin, group, () => {
                            this.refreshSourceGroupsList(container);
                        }).open();
                    });
                    // 删除按钮
                    new obsidian.ButtonComponent(actionsDiv)
                        .setIcon('trash')
                        .setTooltip('删除分组')
                        .onClick(() => __awaiter(this, void 0, void 0, function* () {
                        const confirmed = yield confirm(`确定要删除分组 "${group.name}" 吗？`);
                        if (confirmed) {
                            const success = yield deleteSourceGroup(this.plugin.settings.apiUrl, group.id);
                            if (success) {
                                new obsidian.Notice('分组已删除');
                                this.refreshSourceGroupsList(container);
                            }
                            else {
                                new obsidian.Notice('删除失败');
                            }
                        }
                    }));
                });
            }
            catch (error) {
                container.createEl('div', {
                    text: `加载分组列表失败: ${error}`,
                    cls: 'trendradar-error'
                });
            }
        });
    }
    renderSourcesSettings() {
        const container = this.contentContainer;
        container.createEl('p', {
            text: '在这里添加、编辑或删除您的信息订阅源。支持 RSS、网站爬取和 Twitter/X 账号。',
            cls: 'setting-item-description'
        });
        new obsidian.Setting(container)
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
    refreshSourcesList(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.empty();
            try {
                const sources = yield getSources(this.plugin.settings.apiUrl);
                if (sources.length === 0) {
                    container.createEl('div', { text: '暂无数据源，请点击上方按钮添加。', cls: 'trendradar-empty-state' });
                    return;
                }
                sources.forEach(source => {
                    const item = container.createDiv({ cls: 'trendradar-source-item' });
                    // 图标
                    const iconDiv = item.createDiv({ cls: 'source-icon' });
                    let iconName = 'rss';
                    if (source.type === 'twitter')
                        iconName = 'twitter';
                    // 简单模拟图标
                    iconDiv.setText(source.type.toUpperCase());
                    // 信息
                    const infoDiv = item.createDiv({ cls: 'source-info' });
                    infoDiv.createDiv({ cls: 'source-name', text: source.name });
                    infoDiv.createDiv({ cls: 'source-url', text: source.url || source.username || 'No URL' });
                    // 操作
                    const actionsDiv = item.createDiv({ cls: 'source-actions' });
                    // 启用/禁用开关
                    const toggle = new obsidian.ToggleComponent(actionsDiv)
                        .setValue(source.enabled)
                        .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        source.enabled = value;
                        yield updateSource(this.plugin.settings.apiUrl, source.id, source);
                    }));
                    toggle.setTooltip(source.enabled ? '已启用' : '已禁用');
                    // 编辑按钮
                    new obsidian.ButtonComponent(actionsDiv)
                        .setIcon('pencil')
                        .setTooltip('编辑')
                        .onClick(() => {
                        new SourceEditModal(this.app, this.plugin, source, () => {
                            this.refreshSourcesList(container);
                        }).open();
                    });
                    // 删除按钮
                    new obsidian.ButtonComponent(actionsDiv)
                        .setIcon('trash')
                        .setTooltip('删除')
                        .setClass('mod-warning')
                        .onClick(() => __awaiter(this, void 0, void 0, function* () {
                        if (confirm(`确定要删除数据源 "${source.name}" 吗？`)) {
                            yield deleteSource(this.plugin.settings.apiUrl, source.id);
                            this.refreshSourcesList(container);
                        }
                    }));
                });
            }
            catch (error) {
                container.createEl('div', { text: '无法加载数据源列表，请检查后端连接。', cls: 'trendradar-error-state' });
            }
        });
    }
    renderAISettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = this.contentContainer;
            container.empty();
            container.createEl('p', {
                text: '管理可用的AI服务。配置的服务可以在数据源分组中使用。',
                cls: 'setting-item-description'
            });
            // 添加服务按钮
            new obsidian.Setting(container)
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
        });
    }
    refreshAIServicesList(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.empty();
            try {
                const services = yield getAIServices(this.plugin.settings.apiUrl);
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
                    new obsidian.ButtonComponent(actionsDiv)
                        .setIcon('pencil')
                        .setTooltip('编辑')
                        .onClick(() => {
                        new AIServiceEditModal(this.app, this.plugin, service, () => {
                            this.refreshAIServicesList(container);
                        }).open();
                    });
                    // 删除按钮
                    new obsidian.ButtonComponent(actionsDiv)
                        .setIcon('trash')
                        .setTooltip('删除')
                        .setClass('mod-warning')
                        .onClick(() => __awaiter(this, void 0, void 0, function* () {
                        if (confirm(`确定要删除AI服务 "${service.name}" 吗？`)) {
                            const success = yield deleteAIService(this.plugin.settings.apiUrl, service.id);
                            if (success) {
                                new obsidian.Notice('AI服务已删除');
                                this.refreshAIServicesList(container);
                            }
                            else {
                                new obsidian.Notice('删除失败');
                            }
                        }
                    }));
                });
            }
            catch (error) {
                container.createEl('div', {
                    text: '无法加载AI服务列表，请检查后端连接。',
                    cls: 'trendradar-error-state'
                });
            }
        });
    }
    renderFilterSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = this.contentContainer;
            container.empty();
            try {
                const config = yield getFilterConfig(this.plugin.settings.apiUrl);
                new obsidian.Setting(container)
                    .setName('关键词黑名单')
                    .setDesc('包含这些关键词的内容将被过滤（用逗号分隔）')
                    .addTextArea(text => text
                    .setPlaceholder('广告, 推广, ...')
                    .setValue(config.keyword_blacklist.join(', '))
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.keyword_blacklist = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
                    yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                })));
                new obsidian.Setting(container)
                    .setName('分类黑名单')
                    .setDesc('属于这些分类的内容将被过滤（用逗号分隔）')
                    .addTextArea(text => text
                    .setPlaceholder('娱乐, 八卦, ...')
                    .setValue(config.category_blacklist.join(', '))
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.category_blacklist = value.split(/[,，]/).map(s => s.trim()).filter(s => s);
                    yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                })));
                new obsidian.Setting(container)
                    .setName('AI 预过滤')
                    .setDesc('启用后，将使用 AI 初步判断内容相关性（会消耗 Token）')
                    .addToggle(toggle => toggle
                    .setValue(config.enable_ai_prefilter)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.enable_ai_prefilter = value;
                    yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                })));
            }
            catch (error) {
                container.createEl('p', { text: '无法加载过滤配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
            }
        });
    }
    renderDeduplicationSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = this.contentContainer;
            container.empty();
            try {
                // 保存 API URL
                const apiUrl = this.plugin.settings.apiUrl;
                // 获取去重配置
                const configResponse = yield fetch(`${apiUrl}/api/deduplication/config`);
                if (!configResponse.ok) {
                    throw new Error(`HTTP ${configResponse.status}`);
                }
                const config = yield configResponse.json();
                container.createEl('p', {
                    text: '内容去重功能可以自动过滤与已处理内容相似的新主题，避免重复信息。',
                    cls: 'setting-item-description'
                });
                // 启用/禁用去重
                new obsidian.Setting(container)
                    .setName('启用去重')
                    .setDesc('是否启用智能内容去重功能')
                    .addToggle(toggle => toggle
                    .setValue(config.enabled)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.enabled = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                // 相似度阈值
                new obsidian.Setting(container)
                    .setName('相似度阈值')
                    .setDesc('判定为重复的相似度阈值（0.0-1.0），默认0.8表示80%相似')
                    .addSlider(slider => slider
                    .setLimits(0, 1, 0.05)
                    .setValue(config.similarity_threshold)
                    .setDynamicTooltip()
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.similarity_threshold = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                // 检查窗口（天数）
                new obsidian.Setting(container)
                    .setName('检查窗口（天）')
                    .setDesc('只检查最近N天的历史记录')
                    .addText(text => text
                    .setValue(String(config.check_window_days))
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        config.check_window_days = num;
                        try {
                            const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(config)
                            });
                            if (!response.ok)
                                throw new Error(`HTTP ${response.status}`);
                        }
                        catch (error) {
                            new obsidian.Notice('更新配置失败');
                            console.error(error);
                        }
                    }
                })));
                // 最大历史记录数
                new obsidian.Setting(container)
                    .setName('最大历史记录数')
                    .setDesc('最多检查N条历史记录（与时间窗口取较小值）')
                    .addText(text => text
                    .setValue(String(config.max_history_records))
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        config.max_history_records = num;
                        try {
                            const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(config)
                            });
                            if (!response.ok)
                                throw new Error(`HTTP ${response.status}`);
                        }
                        catch (error) {
                            new obsidian.Notice('更新配置失败');
                            console.error(error);
                        }
                    }
                })));
                // 过滤对象
                container.createEl('h3', { text: '过滤对象' });
                new obsidian.Setting(container)
                    .setName('过滤已删除内容')
                    .setDesc('是否过滤已被删除的相似内容')
                    .addToggle(toggle => toggle
                    .setValue(config.filter_deleted)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.filter_deleted = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                new obsidian.Setting(container)
                    .setName('过滤已归档内容')
                    .setDesc('是否过滤已被归档的相似内容')
                    .addToggle(toggle => toggle
                    .setValue(config.filter_archived)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.filter_archived = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                new obsidian.Setting(container)
                    .setName('过滤已导出内容')
                    .setDesc('是否过滤已被导出的相似内容')
                    .addToggle(toggle => toggle
                    .setValue(config.filter_exported)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.filter_exported = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                // 重复内容处理方式
                container.createEl('h3', { text: '重复内容处理' });
                new obsidian.Setting(container)
                    .setName('处理方式')
                    .setDesc('keep=保留并标记为重复，discard=直接丢弃')
                    .addDropdown(dropdown => dropdown
                    .addOption('keep', '保留并标记')
                    .addOption('discard', '直接丢弃')
                    .setValue(config.duplicate_action)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.duplicate_action = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                // 相似度计算方法
                container.createEl('h3', { text: '高级设置' });
                new obsidian.Setting(container)
                    .setName('相似度计算方法')
                    .setDesc('title_only=仅标题（快速），hybrid=标题+摘要（准确）')
                    .addDropdown(dropdown => dropdown
                    .addOption('title_only', '仅标题')
                    .addOption('hybrid', '标题+摘要')
                    .setValue(config.method)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.method = value;
                    try {
                        const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config)
                        });
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                    }
                    catch (error) {
                        new obsidian.Notice('更新配置失败');
                        console.error(error);
                    }
                })));
                // 历史记录保留天数
                new obsidian.Setting(container)
                    .setName('历史保留天数')
                    .setDesc('已处理历史记录的保留天数，超过此天数将被自动清理')
                    .addText(text => text
                    .setValue(String(config.history_retention_days))
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        config.history_retention_days = num;
                        try {
                            const response = yield fetch(`${apiUrl}/api/deduplication/config`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(config)
                            });
                            if (!response.ok)
                                throw new Error(`HTTP ${response.status}`);
                        }
                        catch (error) {
                            new obsidian.Notice('更新配置失败');
                            console.error(error);
                        }
                    }
                })));
            }
            catch (error) {
                container.createEl('p', { text: '无法加载去重配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
                console.error(error);
            }
        });
    }
    renderSystemSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = this.contentContainer;
            container.empty();
            try {
                const { getSettings, updateSettings } = yield Promise.resolve().then(function () { return api; });
                const settings = yield getSettings(this.plugin.settings.apiUrl);
                if (!settings) {
                    container.createEl('p', { text: '无法加载系统配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
                    return;
                }
                // 报告配置
                container.createEl('h3', { text: '报告配置' });
                new obsidian.Setting(container)
                    .setName('报告模式')
                    .setDesc('选择报告模式：daily(当日汇总)、current(当前榜单)、incremental(增量模式)')
                    .addDropdown(dropdown => dropdown
                    .addOption('daily', '当日汇总')
                    .addOption('current', '当前榜单')
                    .addOption('incremental', '增量模式')
                    .setValue(settings.report.mode)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.report.mode = value;
                    yield updateSettings(this.plugin.settings.apiUrl, { report: settings.report });
                })));
                new obsidian.Setting(container)
                    .setName('排名阈值')
                    .setDesc('高亮显示的排名阈值')
                    .addText(text => text
                    .setValue(String(settings.report.rank_threshold))
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.report.rank_threshold = parseInt(value) || 5;
                    yield updateSettings(this.plugin.settings.apiUrl, { report: settings.report });
                })));
                // 通知配置
                container.createEl('h3', { text: '通知配置' });
                new obsidian.Setting(container)
                    .setName('启用通知')
                    .setDesc('是否启用通知推送')
                    .addToggle(toggle => toggle
                    .setValue(settings.notification.enabled)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.notification.enabled = value;
                    yield updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
                })));
                new obsidian.Setting(container)
                    .setName('飞书 Webhook')
                    .setDesc('飞书机器人 Webhook URL')
                    .addText(text => text
                    .setValue(settings.notification.channels.feishu.webhook_url)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.notification.channels.feishu.webhook_url = value;
                    yield updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
                })));
                new obsidian.Setting(container)
                    .setName('钉钉 Webhook')
                    .setDesc('钉钉机器人 Webhook URL')
                    .addText(text => text
                    .setValue(settings.notification.channels.dingtalk.webhook_url)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.notification.channels.dingtalk.webhook_url = value;
                    yield updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
                })));
                new obsidian.Setting(container)
                    .setName('Telegram Bot Token')
                    .setDesc('Telegram 机器人 Token')
                    .addText(text => text
                    .setValue(settings.notification.channels.telegram.bot_token)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.notification.channels.telegram.bot_token = value;
                    yield updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
                })));
                new obsidian.Setting(container)
                    .setName('Telegram Chat ID')
                    .setDesc('Telegram 聊天 ID')
                    .addText(text => text
                    .setValue(settings.notification.channels.telegram.chat_id)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    settings.notification.channels.telegram.chat_id = value;
                    yield updateSettings(this.plugin.settings.apiUrl, { notification: settings.notification });
                })));
                // 存储配置
                container.createEl('h3', { text: '存储配置' });
                new obsidian.Setting(container)
                    .setName('数据保留天数')
                    .setDesc('本地数据保留天数（0 = 永久保留）')
                    .addText(text => {
                    var _a, _b;
                    return text
                        .setValue(String(((_b = (_a = settings.storage) === null || _a === void 0 ? void 0 : _a.local) === null || _b === void 0 ? void 0 : _b.retention_days) || 0))
                        .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        if (!settings.storage)
                            settings.storage = {};
                        if (!settings.storage.local)
                            settings.storage.local = {};
                        settings.storage.local.retention_days = parseInt(value) || 0;
                        yield updateSettings(this.plugin.settings.apiUrl, { storage: settings.storage });
                    }));
                });
            }
            catch (error) {
                container.createEl('p', { text: '无法加载系统配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
            }
        });
    }
}
// --- Source Edit Modal ---
class SourceEditModal extends obsidian.Modal {
    constructor(app, plugin, source, onSave) {
        super(app);
        this.plugin = plugin;
        this.source = source;
        this.onSave = onSave;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: this.source ? '编辑数据源' : '添加数据源' });
        const config = this.source ? Object.assign({}, this.source) : {
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
        new obsidian.Setting(contentEl)
            .setName('类型')
            .addDropdown(dropdown => dropdown
            .addOption('rss', 'RSS 订阅')
            .addOption('twitter', 'Twitter/X 用户')
            .addOption('local', '本地目录')
            .setValue(config.type)
            .onChange(value => {
            config.type = value;
            this.onOpen(); // 刷新界面以显示不同类型的字段
        }));
        new obsidian.Setting(contentEl)
            .setName('名称')
            .addText(text => text
            .setValue(config.name)
            .onChange(value => config.name = value));
        if (config.type === 'rss') {
            new obsidian.Setting(contentEl)
                .setName('URL')
                .setDesc('RSS Feed 地址')
                .addText(text => text
                .setValue(config.url)
                .onChange(value => config.url = value));
        }
        if (config.type === 'twitter') {
            new obsidian.Setting(contentEl)
                .setName('用户名')
                .setDesc('Twitter 用户名 (不带 @)')
                .addText(text => text
                .setValue(config.username || '')
                .onChange(value => config.username = value));
        }
        if (config.type === 'local') {
            new obsidian.Setting(contentEl)
                .setName('目录路径')
                .setDesc('本地目录的绝对路径')
                .addText(text => {
                var _a;
                return text
                    .setValue(((_a = config.extra) === null || _a === void 0 ? void 0 : _a.path) || '')
                    .setPlaceholder('/Users/xxx/Documents/Inbox')
                    .onChange(value => {
                    if (!config.extra)
                        config.extra = {};
                    config.extra.path = value;
                });
            });
            new obsidian.Setting(contentEl)
                .setName('文件模式')
                .setDesc('要包含的文件类型（逗号分隔）')
                .addText(text => {
                var _a, _b;
                return text
                    .setValue(((_b = (_a = config.extra) === null || _a === void 0 ? void 0 : _a.file_patterns) === null || _b === void 0 ? void 0 : _b.join(', ')) || '*.md, *.txt')
                    .setPlaceholder('*.md, *.txt')
                    .onChange(value => {
                    if (!config.extra)
                        config.extra = {};
                    config.extra.file_patterns = value.split(',').map(s => s.trim());
                });
            });
            new obsidian.Setting(contentEl)
                .setName('递归子目录')
                .addToggle(toggle => {
                var _a, _b;
                return toggle
                    .setValue((_b = (_a = config.extra) === null || _a === void 0 ? void 0 : _a.recursive) !== null && _b !== void 0 ? _b : true)
                    .onChange(value => {
                    if (!config.extra)
                        config.extra = {};
                    config.extra.recursive = value;
                });
            });
        }
        new obsidian.Setting(contentEl)
            .setName('保留天数')
            .addText(text => text
            .setValue(String(config.retention_days))
            .onChange(value => config.retention_days = parseInt(value) || 7));
        new obsidian.Setting(contentEl)
            .setName('最大条目数')
            .setDesc('每次抓取的最大数量')
            .addText(text => text
            .setValue(String(config.max_items))
            .onChange(value => config.max_items = parseInt(value) || 20));
        new obsidian.Setting(contentEl)
            .addButton(button => button
            .setButtonText('保存')
            .setCta()
            .onClick(() => __awaiter(this, void 0, void 0, function* () {
            if (!config.name) {
                new obsidian.Notice('请输入名称');
                return;
            }
            // 自动生成 ID
            if (!config.id) {
                config.id = config.type + '_' + Date.now();
            }
            try {
                if (this.source) {
                    yield updateSource(this.plugin.settings.apiUrl, config.id, config);
                }
                else {
                    yield createSource(this.plugin.settings.apiUrl, config);
                }
                this.onSave();
                this.close();
                new obsidian.Notice('保存成功');
            }
            catch (error) {
                new obsidian.Notice('保存失败: ' + error);
            }
        })));
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
// --- AI Service Edit Modal ---
class AIServiceEditModal extends obsidian.Modal {
    constructor(app, plugin, service, onSave) {
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
        const service = this.service ? Object.assign({}, this.service) : {
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
        new obsidian.Setting(contentEl)
            .setName('服务ID')
            .setDesc('唯一标识符（只能包含字母、数字、连字符）')
            .addText(text => text
            .setValue(service.id)
            .setPlaceholder('my-openai-service')
            .setDisabled(!!this.service)
            .onChange(value => service.id = value));
        // 服务名称
        new obsidian.Setting(contentEl)
            .setName('服务名称')
            .setDesc('显示名称')
            .addText(text => text
            .setValue(service.name)
            .setPlaceholder('我的OpenAI服务')
            .onChange(value => service.name = value));
        // AI提供商
        new obsidian.Setting(contentEl)
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
        new obsidian.Setting(contentEl)
            .setName('API Key')
            .addText(text => text
            .setValue(service.api_key)
            .setPlaceholder('sk-...')
            .onChange(value => service.api_key = value));
        // API地址
        let baseUrlInput;
        new obsidian.Setting(contentEl)
            .setName('API地址')
            .setDesc('自定义API端点（留空使用默认地址）')
            .addText(text => {
            baseUrlInput = text;
            baseUrlInput.setValue(service.base_url)
                .setPlaceholder('https://api.openai.com/v1')
                .onChange(value => service.base_url = value);
        });
        // 模型名称
        new obsidian.Setting(contentEl)
            .setName('模型名称')
            .setDesc('例如: gpt-4o, deepseek-chat, gemini-2.0-flash-exp')
            .addText(text => text
            .setValue(service.model_name)
            .setPlaceholder('gpt-4o')
            .onChange(value => service.model_name = value));
        // 温度
        new obsidian.Setting(contentEl)
            .setName('温度')
            .setDesc('控制随机性（0-1）')
            .addSlider(slider => slider
            .setLimits(0, 1, 0.1)
            .setValue(service.temperature)
            .setDynamicTooltip()
            .onChange(value => service.temperature = value));
        // 描述
        new obsidian.Setting(contentEl)
            .setName('描述')
            .setDesc('服务用途说明')
            .addText(text => text
            .setValue(service.description)
            .setPlaceholder('用于...')
            .onChange(value => service.description = value));
        // 保存按钮
        new obsidian.Setting(contentEl)
            .addButton(button => button
            .setButtonText('保存')
            .setCta()
            .onClick(() => __awaiter(this, void 0, void 0, function* () {
            if (!service.id || !service.name) {
                new obsidian.Notice('请填写服务ID和名称');
                return;
            }
            // 验证ID格式
            if (!/^[a-z0-9-]+$/.test(service.id)) {
                new obsidian.Notice('服务ID只能包含小写字母、数字和连字符');
                return;
            }
            try {
                if (this.service) {
                    yield updateAIService(this.plugin.settings.apiUrl, service.id, service);
                }
                else {
                    yield createAIService(this.plugin.settings.apiUrl, service);
                }
                this.onSave();
                this.close();
                new obsidian.Notice('AI服务保存成功');
            }
            catch (error) {
                new obsidian.Notice('保存失败: ' + error);
            }
        })));
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
class SourceGroupEditModal extends obsidian.Modal {
    constructor(app, plugin, group, onSave) {
        super(app);
        this.plugin = plugin;
        this.group = group;
        this.onSave = onSave;
        // 初始化配置对象
        this.config = group ? Object.assign({}, group) : {
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
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { contentEl, modalEl } = this;
            contentEl.empty();
            // 添加CSS类名以应用Apple风格样式
            modalEl.addClass('mod-fresh-source-group-edit');
            contentEl.createEl('h2', { text: this.group ? '编辑分组' : '添加分组' });
            // 分组ID
            new obsidian.Setting(contentEl)
                .setName('分组ID')
                .setDesc('唯一标识符（只能包含字母、数字、连字符）')
                .addText(text => text
                .setValue(this.config.id)
                .setPlaceholder('my-group')
                .onChange(value => this.config.id = value));
            // 分组名称
            new obsidian.Setting(contentEl)
                .setName('分组名称')
                .addText(text => text
                .setValue(this.config.name)
                .setPlaceholder('我的分组')
                .onChange(value => this.config.name = value));
            // 描述
            new obsidian.Setting(contentEl)
                .setName('描述')
                .setDesc('分组的用途说明')
                .addText(text => text
                .setValue(this.config.description || '')
                .setPlaceholder('用于...')
                .onChange(value => this.config.description = value));
            // 启用开关
            new obsidian.Setting(contentEl)
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
            modeSelect.value = ((_a = this.config.ai_config) === null || _a === void 0 ? void 0 : _a.mode) || 'two-stage';
            modeSelect.addEventListener('change', () => __awaiter(this, void 0, void 0, function* () {
                if (this.config.ai_config) {
                    this.config.ai_config.mode = modeSelect.value;
                }
                // 局部重绘服务选择器
                yield this.renderAIServiceSelection(serviceContainer, this.config);
            }));
            // 服务选择器容器
            const serviceContainer = contentEl.createDiv({ cls: 'ai-service-selection' });
            // 加载AI服务列表并渲染选择器（等待异步完成）
            yield this.renderAIServiceSelection(serviceContainer, this.config);
            // 数据源部分
            // 创建数据源头部容器（标题和添加按钮在同一行）
            const dataSourceHeader = contentEl.createDiv({ cls: 'data-source-header' });
            dataSourceHeader.createEl('h3', { text: '数据源' });
            // 添加数据源按钮
            const addSourceBtn = new obsidian.ButtonComponent(dataSourceHeader);
            addSourceBtn
                .setButtonText('+ 添加数据源')
                .setCta()
                .onClick(() => __awaiter(this, void 0, void 0, function* () {
                new UnifiedSourceModal(this.app, this.plugin, this.config, (resultSource) => {
                    // 检查是否已经在分组中
                    const exists = this.config.sources.find(s => s.id === resultSource.id);
                    if (exists) {
                        new obsidian.Notice('此数据源已在分组中');
                        return;
                    }
                    this.config.sources.push(resultSource);
                    // 只更新数据源列表部分，不重新创建整个界面
                    this.renderSourcesList();
                }).open();
            }));
            // 显示当前分组的数据源列表
            this.sourcesListContainer = contentEl.createDiv({ cls: 'group-sources-list' });
            this.renderSourcesList();
            // 保存按钮
            new obsidian.Setting(contentEl)
                .addButton(button => button
                .setButtonText('保存')
                .setCta()
                .onClick(() => __awaiter(this, void 0, void 0, function* () {
                if (!this.config.id || !this.config.name) {
                    new obsidian.Notice('请填写分组ID和名称');
                    return;
                }
                // 验证ID格式
                if (!/^[a-z0-9-]+$/.test(this.config.id)) {
                    new obsidian.Notice('分组ID只能包含小写字母、数字和连字符');
                    return;
                }
                try {
                    if (this.group) {
                        yield updateSourceGroup(this.plugin.settings.apiUrl, this.config.id, this.config);
                    }
                    else {
                        yield createSourceGroup(this.plugin.settings.apiUrl, this.config);
                    }
                    this.onSave();
                    this.close();
                    new obsidian.Notice('分组保存成功');
                }
                catch (error) {
                    new obsidian.Notice('保存失败: ' + error);
                }
            })));
        });
    }
    renderAIServiceSelection(container, config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // 清空容器
            container.empty();
            try {
                console.log('[SourceGroupEditModal] 开始加载AI服务列表...');
                console.log('[SourceGroupEditModal] API URL:', this.plugin.settings.apiUrl);
                const services = yield getAIServices(this.plugin.settings.apiUrl);
                console.log('[SourceGroupEditModal] 加载到', services.length, '个AI服务');
                if (services.length === 0) {
                    const warningDiv = container.createEl('p', {
                        text: '⚠️ 还没有配置AI服务，请先在"AI 服务"Tab中添加服务。',
                        cls: 'setting-item-description'
                    });
                    return;
                }
                const mode = ((_a = config.ai_config) === null || _a === void 0 ? void 0 : _a.mode) || 'two-stage';
                console.log('[SourceGroupEditModal] 当前模式:', mode);
                if (mode === 'two-stage') {
                    // 分阶段模式 - 选择两个服务
                    new obsidian.Setting(container)
                        .setName('分析服务')
                        .addDropdown(dropdown => {
                        var _a;
                        dropdown.addOption('', '未选择');
                        services.forEach(service => {
                            dropdown.addOption(service.id, service.name);
                        });
                        dropdown.setValue(((_a = config.ai_config) === null || _a === void 0 ? void 0 : _a.analysis_service_id) || '');
                        dropdown.onChange(value => {
                            if (config.ai_config) {
                                config.ai_config.analysis_service_id = value;
                            }
                        });
                    });
                    new obsidian.Setting(container)
                        .setName('聚合服务')
                        .addDropdown(dropdown => {
                        var _a;
                        dropdown.addOption('', '未选择');
                        services.forEach(service => {
                            dropdown.addOption(service.id, service.name);
                        });
                        dropdown.setValue(((_a = config.ai_config) === null || _a === void 0 ? void 0 : _a.aggregation_service_id) || '');
                        dropdown.onChange(value => {
                            if (config.ai_config) {
                                config.ai_config.aggregation_service_id = value;
                            }
                        });
                    });
                }
                else {
                    // 单一模式 - 选择一个服务
                    new obsidian.Setting(container)
                        .setName('AI服务')
                        .addDropdown(dropdown => {
                        var _a;
                        dropdown.addOption('', '未选择');
                        services.forEach(service => {
                            dropdown.addOption(service.id, service.name);
                        });
                        dropdown.setValue(((_a = config.ai_config) === null || _a === void 0 ? void 0 : _a.analysis_service_id) || '');
                        dropdown.onChange(value => {
                            if (config.ai_config) {
                                config.ai_config.analysis_service_id = value;
                                // 清空聚合服务ID，避免混淆
                                config.ai_config.aggregation_service_id = '';
                            }
                        });
                    });
                }
            }
            catch (error) {
                console.error('[SourceGroupEditModal] 加载AI服务失败:', error);
                container.createEl('p', {
                    text: `⚠️ 无法加载AI服务列表: ${error}`,
                    cls: 'setting-item-description'
                });
            }
        });
    }
    // 局部更新数据源列表，不重新创建整个界面
    renderSourcesList() {
        if (!this.sourcesListContainer)
            return;
        this.sourcesListContainer.empty();
        if (this.config.sources.length === 0) {
            // 简单文本，无样式
            this.sourcesListContainer.createEl('div', {
                cls: 'empty-source-list',
                text: '暂无数据源'
            });
        }
        else {
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
                new obsidian.ButtonComponent(sourceItem)
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
// 统一数据源Modal（选择现有或创建新数据源）
class UnifiedSourceModal extends obsidian.Modal {
    constructor(app, plugin, groupConfig, onConfirm) {
        super(app);
        // State
        this.availableSources = [];
        this.selectedSourceId = null;
        this.isCreatingNew = true;
        this.newSource = {};
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
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            const { contentEl, modalEl } = this;
            contentEl.empty();
            // 添加CSS类名以应用Apple风格样式
            modalEl.addClass('mod-fresh-unified-source');
            // Fetch available sources
            try {
                const allSources = yield getSources(this.plugin.settings.apiUrl);
                // Filter out sources already in this group
                const groupSourceIds = this.groupConfig.sources.map(s => s.id);
                this.availableSources = allSources.filter(s => !groupSourceIds.includes(s.id));
            }
            catch (error) {
                console.error('Failed to fetch sources:', error);
                this.availableSources = [];
            }
            contentEl.createEl('h2', { text: '添加数据源' });
            // 模式选择：选择现有 或 创建新数据源
            new obsidian.Setting(contentEl)
                .setName('选择数据源')
                .setDesc('选择已有数据源，或选择"创建新数据源"来创建新的')
                .addDropdown(dropdown => {
                dropdown.addOption('__new__', '✨ 创建新数据源');
                this.availableSources.forEach(source => {
                    dropdown.addOption(source.id, `${source.name} (${source.type})`);
                });
                dropdown.setValue(this.isCreatingNew ? '__new__' : (this.selectedSourceId || '__new__'));
                dropdown.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    if (value === '__new__') {
                        this.isCreatingNew = true;
                        this.selectedSourceId = null;
                    }
                    else {
                        this.isCreatingNew = false;
                        this.selectedSourceId = value;
                    }
                    this.onOpen(); // Refresh modal
                }));
            });
            if (!this.isCreatingNew && this.selectedSourceId) {
                // 显示已选数据源的信息
                const selectedSource = this.availableSources.find(s => s.id === this.selectedSourceId);
                if (selectedSource) {
                    this.renderSelectedSourceInfo(contentEl, selectedSource);
                }
            }
            else {
                // 显示创建新数据源的表单
                this.renderCreateSourceForm(contentEl);
            }
        });
    }
    renderSelectedSourceInfo(container, source) {
        var _a;
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
        if (source.type === 'local' && ((_a = source.extra) === null || _a === void 0 ? void 0 : _a.path)) {
            fields.push({ label: '目录路径', value: source.extra.path });
        }
        fields.forEach(field => {
            const row = infoTable.createEl('tr');
            row.createEl('th', { text: field.label });
            row.createEl('td', { text: field.value });
        });
        // 确认按钮
        new obsidian.Setting(container)
            .addButton(button => button
            .setButtonText('确认添加')
            .setCta()
            .onClick(() => {
            this.onConfirm(source);
            this.close();
        }));
    }
    renderCreateSourceForm(container) {
        container.createEl('h3', { text: '创建新数据源' });
        new obsidian.Setting(container)
            .setName('类型')
            .addDropdown(dropdown => dropdown
            .addOption('rss', 'RSS 订阅')
            .addOption('twitter', 'Twitter/X 用户')
            .addOption('local', '本地目录')
            .setValue(this.newSource.type)
            .onChange(value => {
            this.newSource.type = value;
            this.onOpen();
        }));
        new obsidian.Setting(container)
            .setName('名称')
            .addText(text => text
            .setValue(this.newSource.name)
            .setPlaceholder('输入数据源名称')
            .onChange(value => this.newSource.name = value));
        if (this.newSource.type === 'rss') {
            new obsidian.Setting(container)
                .setName('URL')
                .addText(text => text
                .setValue(this.newSource.url)
                .setPlaceholder('https://example.com/rss')
                .onChange(value => this.newSource.url = value));
        }
        if (this.newSource.type === 'twitter') {
            new obsidian.Setting(container)
                .setName('用户名')
                .addText(text => text
                .setValue(this.newSource.username || '')
                .setPlaceholder('@username')
                .onChange(value => this.newSource.username = value));
        }
        if (this.newSource.type === 'local') {
            new obsidian.Setting(container)
                .setName('目录路径')
                .addText(text => {
                var _a;
                return text
                    .setValue(((_a = this.newSource.extra) === null || _a === void 0 ? void 0 : _a.path) || '')
                    .setPlaceholder('/path/to/directory')
                    .onChange(value => {
                    if (!this.newSource.extra)
                        this.newSource.extra = {};
                    this.newSource.extra.path = value;
                });
            });
            new obsidian.Setting(container)
                .setName('文件模式')
                .setDesc('逗号分隔的文件模式，例如: *.md, *.txt')
                .addText(text => {
                var _a, _b;
                return text
                    .setValue(((_b = (_a = this.newSource.extra) === null || _a === void 0 ? void 0 : _a.file_patterns) === null || _b === void 0 ? void 0 : _b.join(', ')) || '*.md, *.txt')
                    .onChange(value => {
                    if (!this.newSource.extra)
                        this.newSource.extra = {};
                    this.newSource.extra.file_patterns = value.split(',').map(s => s.trim());
                });
            });
            new obsidian.Setting(container)
                .setName('递归子目录')
                .addToggle(toggle => {
                var _a, _b;
                return toggle
                    .setValue((_b = (_a = this.newSource.extra) === null || _a === void 0 ? void 0 : _a.recursive) !== null && _b !== void 0 ? _b : true)
                    .onChange(value => {
                    if (!this.newSource.extra)
                        this.newSource.extra = {};
                    this.newSource.extra.recursive = value;
                });
            });
        }
        // 通用配置（所有类型共享）
        new obsidian.Setting(container)
            .setName('保留天数')
            .setDesc('保留内容的天数')
            .addText(text => text
            .setValue(String(this.newSource.retention_days || 7))
            .setPlaceholder('7')
            .onChange(value => this.newSource.retention_days = parseInt(value) || 7));
        new obsidian.Setting(container)
            .setName('最大条目数')
            .setDesc('每次抓取的最大数量')
            .addText(text => text
            .setValue(String(this.newSource.max_items || 20))
            .setPlaceholder('20')
            .onChange(value => this.newSource.max_items = parseInt(value) || 20));
        new obsidian.Setting(container)
            .setName('抓取计划')
            .setDesc('Cron 表达式（默认每小时一次）')
            .addText(text => text
            .setValue(this.newSource.schedule || '0 * * * *')
            .setPlaceholder('0 * * * *')
            .onChange(value => this.newSource.schedule = value));
        new obsidian.Setting(container)
            .setName('使用代理')
            .addToggle(toggle => toggle
            .setValue(this.newSource.use_proxy || false)
            .onChange(value => this.newSource.use_proxy = value));
        new obsidian.Setting(container)
            .setName('启用')
            .addToggle(toggle => toggle
            .setValue(this.newSource.enabled !== false)
            .onChange(value => this.newSource.enabled = value));
        // 创建按钮
        new obsidian.Setting(container)
            .addButton(button => button
            .setButtonText('创建并添加')
            .setCta()
            .onClick(() => __awaiter(this, void 0, void 0, function* () {
            if (!this.newSource.name) {
                new obsidian.Notice('请输入数据源名称');
                return;
            }
            // Generate ID
            this.newSource.id = this.newSource.type + '_' + Date.now().toString();
            try {
                // Create the source via API
                const success = yield createSource(this.plugin.settings.apiUrl, this.newSource);
                if (success) {
                    this.onConfirm(this.newSource);
                    this.close();
                    new obsidian.Notice(`已创建并添加 ${this.newSource.name} 到分组`);
                }
                else {
                    new obsidian.Notice('创建失败，请重试');
                }
            }
            catch (error) {
                new obsidian.Notice('创建失败: ' + error);
            }
        })));
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

module.exports = TrendRadarPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsImFwaS50cyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2RvbS5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvbGlmZWN5Y2xlLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9zY2hlZHVsZXIuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3RyYW5zaXRpb25zLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9lYWNoLmpzIiwibm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9Db21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9zaGFyZWQvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvZGlzY2xvc2UtdmVyc2lvbi9pbmRleC5qcyIsIlRoZW1lTGlzdC5zdmVsdGUiLCJUaGVtZURldGFpbC5zdmVsdGUiLCJmb3JtYXR0ZXIudHMiLCJUaGVtZURldGFpbE1vZGFsLnRzIiwiRXJyb3JMaXN0TW9kYWwudHMiLCJ2aWV3LnRzIiwibWFpbi50cyJdLCJuYW1lcyI6WyJOb3RpY2UiLCJjcmVhdGVfaWZfYmxvY2tfNyIsImNyZWF0ZV9pZl9ibG9ja18zIiwiY3JlYXRlX2lmX2Jsb2NrXzUiLCJjcmVhdGVfaWZfYmxvY2tfNCIsImNyZWF0ZV9pZl9ibG9ja18yIiwiY3JlYXRlX2lmX2Jsb2NrXzEiLCJjcmVhdGVfaWZfYmxvY2siLCJNb2RhbCIsIlRoZW1lRGV0YWlsQ29tcG9uZW50IiwiSXRlbVZpZXciLCJQbHVnaW4iLCJQbHVnaW5TZXR0aW5nVGFiIiwiU2V0dGluZyIsIkJ1dHRvbkNvbXBvbmVudCIsIlRvZ2dsZUNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0dBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEcsUUFBUSxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxH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QTtBQUNBO0FBQ0EsQ0FBQyxLQUFLLEdBQUcsU0FBUzs7QUFFbEI7QUFDQSxDQUFDLFFBQVEsR0FBRztBQUNaLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM1QixFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSTtBQUN0QixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDckIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzlCLEdBQUcsT0FBTyxJQUFJO0FBQ2QsRUFBRTtBQUNGLEVBQUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzdFLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDMUIsRUFBRSxPQUFPLE1BQU07QUFDZixHQUFHLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzVDLEdBQUcsSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUMvQyxFQUFFLENBQUM7QUFDSCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2IsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdEMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJO0FBQzVCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDcEIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxLQUFLO0FBQzdCLEVBQUU7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QixDQUFDO2dCQUNsRyxJQUFJLE9BQU8sRUFBRTtBQUNaLG9CQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQTRCLENBQUM7b0JBQ2pELElBQUksQ0FBQyxLQUFLLEVBQUU7b0JBQ1osSUFBSUEsZUFBTSxDQUFDLENBQUEsT0FBQSxFQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFBLElBQUEsQ0FBTSxDQUFDO2dCQUNoRDtxQkFBTztBQUNOLG9CQUFBLElBQUlBLGVBQU0sQ0FBQyxVQUFVLENBQUM7Z0JBQ3ZCO1lBQ0Q7WUFBRSxPQUFPLEtBQUssRUFBRTtBQUNmLGdCQUFBLElBQUlBLGVBQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQzdCO1FBQ0QsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNOO0lBRUEsT0FBTyxHQUFBO0FBQ04sUUFBQSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSTtRQUMxQixTQUFTLENBQUMsS0FBSyxFQUFFO0lBQ2xCO0FBQ0E7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMiwzLDQsNSw2LDcsOCw5LDEwXX0=
