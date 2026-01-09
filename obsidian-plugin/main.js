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

// --- Helper Functions ---
function apiRequest(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, method = 'GET', body) {
        try {
            const options = {
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
            const response = yield obsidian.request(options);
            return JSON.parse(response);
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
// ========================================
// Tasks API
// ========================================
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
	append_styles(target, "svelte-151vmb9", ".trendradar-theme-list-container.svelte-151vmb9.svelte-151vmb9{padding:8px;height:100%;overflow-y:auto}.empty-state.svelte-151vmb9.svelte-151vmb9{text-align:center;margin-top:60px;color:var(--text-muted)}.empty-icon.svelte-151vmb9.svelte-151vmb9{font-size:32px;margin-bottom:10px}.batch-group.svelte-151vmb9.svelte-151vmb9{margin-bottom:12px}.batch-header.svelte-151vmb9.svelte-151vmb9{display:flex;align-items:center;padding:4px 8px;font-size:12px;color:var(--text-muted);cursor:pointer;user-select:none;margin-bottom:4px;border-radius:4px}.batch-header.svelte-151vmb9.svelte-151vmb9:hover{background-color:var(--background-modifier-hover)}.batch-toggle.svelte-151vmb9.svelte-151vmb9{margin-right:6px;font-size:10px}.batch-label.svelte-151vmb9.svelte-151vmb9{font-weight:600;flex:1}.batch-count.svelte-151vmb9.svelte-151vmb9{background-color:var(--background-modifier-border);padding:1px 6px;border-radius:10px;font-size:10px}.theme-list.svelte-151vmb9.svelte-151vmb9{display:flex;flex-direction:column;gap:8px}.theme-card.svelte-151vmb9.svelte-151vmb9{background-color:var(--background-primary);border:1px solid var(--background-modifier-border);border-radius:6px;padding:10px;cursor:pointer;transition:all 0.15s ease;position:relative}.theme-card.svelte-151vmb9.svelte-151vmb9:hover{border-color:var(--interactive-accent);box-shadow:0 2px 8px rgba(0, 0, 0, 0.05)}.theme-card.read.svelte-151vmb9.svelte-151vmb9{opacity:0.6;background-color:var(--background-secondary)}.card-header.svelte-151vmb9.svelte-151vmb9{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px}.title-row.svelte-151vmb9.svelte-151vmb9{display:flex;align-items:baseline;gap:6px;flex:1;min-width:0}.new-dot.svelte-151vmb9.svelte-151vmb9{width:6px;height:6px;background-color:var(--color-red);border-radius:50%;flex-shrink:0;transform:translateY(-2px)}.title.svelte-151vmb9.svelte-151vmb9{font-size:14px;font-weight:600;margin:0;line-height:1.3;color:var(--text-normal)}.importance-badge.svelte-151vmb9.svelte-151vmb9{font-size:10px;font-weight:bold;padding:1px 5px;border-radius:4px;margin-left:8px;flex-shrink:0;background-color:var(--background-modifier-border);color:var(--text-muted)}.importance-badge.high.svelte-151vmb9.svelte-151vmb9{color:var(--color-red);background-color:rgba(var(--color-red-rgb), 0.1)}.summary.svelte-151vmb9.svelte-151vmb9{font-size:12px;color:var(--text-muted);margin:0 0 8px 0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.meta-row.svelte-151vmb9.svelte-151vmb9{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:11px}.keywords.svelte-151vmb9.svelte-151vmb9{display:flex;gap:6px;overflow:hidden}.keyword.svelte-151vmb9.svelte-151vmb9{color:var(--interactive-accent)}.category-tag.svelte-151vmb9.svelte-151vmb9{background-color:var(--background-modifier-border);color:var(--text-muted);padding:1px 5px;border-radius:3px;white-space:nowrap}.card-footer.svelte-151vmb9.svelte-151vmb9{display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px dashed var(--background-modifier-border)}.time.svelte-151vmb9.svelte-151vmb9{font-size:10px;color:var(--text-faint)}.card-actions.svelte-151vmb9.svelte-151vmb9{display:flex;gap:4px;opacity:0;transition:opacity 0.2s}.theme-card.svelte-151vmb9:hover .card-actions.svelte-151vmb9{opacity:1}.action-btn.svelte-151vmb9.svelte-151vmb9{background:none;border:none;padding:2px 6px;font-size:12px;color:var(--text-muted);cursor:pointer;border-radius:3px}.action-btn.svelte-151vmb9.svelte-151vmb9:hover{background-color:var(--background-modifier-hover);color:var(--text-normal)}.action-btn.delete.svelte-151vmb9.svelte-151vmb9:hover{color:var(--color-red);background-color:rgba(var(--color-red-rgb), 0.1)}");
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	child_ctx[16] = i;
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[17] = list[i];
	return child_ctx;
}

function get_each_context_2$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[20] = list[i];
	return child_ctx;
}

// (106:2) {:else}
function create_else_block$1(ctx) {
	let each_1_anchor;
	let each_value = ensure_array_like(/*batches*/ ctx[1]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*batches, handleThemeClick, handleDelete, handleMarkRead, Date, parseKeywords, getImportanceClass, isNew, toggleBatch*/ 126) {
				each_value = ensure_array_like(/*batches*/ ctx[1]);
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
				detach(each_1_anchor);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

// (100:2) {#if themes.length === 0}
function create_if_block$1(ctx) {
	let div1;

	return {
		c() {
			div1 = element("div");
			div1.innerHTML = `<div class="empty-icon svelte-151vmb9">📭</div> <p>暂无主题数据</p> <p class="hint">点击刷新按钮获取最新信息</p>`;
			attr(div1, "class", "empty-state svelte-151vmb9");
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

// (115:8) {#if !batch.collapsed}
function create_if_block_1$1(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_value_1 = ensure_array_like(/*batch*/ ctx[14].themes);
	const get_key = ctx => /*theme*/ ctx[17].id;

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

			attr(div, "class", "theme-list svelte-151vmb9");
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
			if (dirty & /*batches, handleThemeClick, handleDelete, handleMarkRead, Date, parseKeywords, getImportanceClass, isNew*/ 122) {
				each_value_1 = ensure_array_like(/*batch*/ ctx[14].themes);
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

// (127:20) {#if isNew(theme) && theme.status !== 'read'}
function create_if_block_4$1(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			attr(span, "class", "new-dot svelte-151vmb9");
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

// (142:18) {#if theme.keywords}
function create_if_block_3$1(ctx) {
	let div;
	let each_value_2 = ensure_array_like(parseKeywords(/*theme*/ ctx[17].keywords).slice(0, 3));
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

			attr(div, "class", "keywords svelte-151vmb9");
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
			if (dirty & /*parseKeywords, batches*/ 2) {
				each_value_2 = ensure_array_like(parseKeywords(/*theme*/ ctx[17].keywords).slice(0, 3));
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

// (144:22) {#each parseKeywords(theme.keywords).slice(0, 3) as kw}
function create_each_block_2$1(ctx) {
	let span;
	let t0;
	let t1_value = /*kw*/ ctx[20] + "";
	let t1;

	return {
		c() {
			span = element("span");
			t0 = text("#");
			t1 = text(t1_value);
			attr(span, "class", "keyword svelte-151vmb9");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
		},
		p(ctx, dirty) {
			if (dirty & /*batches*/ 2 && t1_value !== (t1_value = /*kw*/ ctx[20] + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (157:20) {#if theme.status !== 'read' && theme.status !== 'archived'}
function create_if_block_2$1(ctx) {
	let button;
	let mounted;
	let dispose;

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[9](/*theme*/ ctx[17], ...args);
	}

	return {
		c() {
			button = element("button");
			button.textContent = "✓";
			attr(button, "class", "action-btn svelte-151vmb9");
			attr(button, "title", "标记已读");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_1);
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

// (117:12) {#each batch.themes as theme (theme.id)}
function create_each_block_1$1(key_1, ctx) {
	let div6;
	let div2;
	let div0;
	let show_if = /*isNew*/ ctx[6](/*theme*/ ctx[17]) && /*theme*/ ctx[17].status !== 'read';
	let t0;
	let h2;
	let t1_value = /*theme*/ ctx[17].title + "";
	let t1;
	let t2;
	let div1;
	let t3_value = /*theme*/ ctx[17].importance + "";
	let t3;
	let div1_class_value;
	let t4;
	let p;
	let t5_value = /*theme*/ ctx[17].summary + "";
	let t5;
	let t6;
	let div3;
	let t7;
	let span0;
	let t8_value = /*theme*/ ctx[17].category + "";
	let t8;
	let t9;
	let div5;
	let span1;
	let t10_value = new Date(/*theme*/ ctx[17].created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + "";
	let t10;
	let t11;
	let div4;
	let t12;
	let button;
	let t14;
	let div6_class_value;
	let mounted;
	let dispose;
	let if_block0 = show_if && create_if_block_4$1();
	let if_block1 = /*theme*/ ctx[17].keywords && create_if_block_3$1(ctx);
	let if_block2 = /*theme*/ ctx[17].status !== 'read' && /*theme*/ ctx[17].status !== 'archived' && create_if_block_2$1(ctx);

	function click_handler_2(...args) {
		return /*click_handler_2*/ ctx[10](/*theme*/ ctx[17], ...args);
	}

	function click_handler_3() {
		return /*click_handler_3*/ ctx[11](/*theme*/ ctx[17]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			div6 = element("div");
			div2 = element("div");
			div0 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			h2 = element("h2");
			t1 = text(t1_value);
			t2 = space();
			div1 = element("div");
			t3 = text(t3_value);
			t4 = space();
			p = element("p");
			t5 = text(t5_value);
			t6 = space();
			div3 = element("div");
			if (if_block1) if_block1.c();
			t7 = space();
			span0 = element("span");
			t8 = text(t8_value);
			t9 = space();
			div5 = element("div");
			span1 = element("span");
			t10 = text(t10_value);
			t11 = space();
			div4 = element("div");
			if (if_block2) if_block2.c();
			t12 = space();
			button = element("button");
			button.textContent = "×";
			t14 = space();
			attr(h2, "class", "title svelte-151vmb9");
			attr(div0, "class", "title-row svelte-151vmb9");
			attr(div1, "class", div1_class_value = "importance-badge " + getImportanceClass(/*theme*/ ctx[17].importance) + " svelte-151vmb9");
			attr(div2, "class", "card-header svelte-151vmb9");
			attr(p, "class", "summary svelte-151vmb9");
			attr(span0, "class", "category-tag svelte-151vmb9");
			attr(div3, "class", "meta-row svelte-151vmb9");
			attr(span1, "class", "time svelte-151vmb9");
			attr(button, "class", "action-btn delete svelte-151vmb9");
			attr(button, "title", "删除");
			attr(div4, "class", "card-actions svelte-151vmb9");
			attr(div5, "class", "card-footer svelte-151vmb9");

			attr(div6, "class", div6_class_value = "theme-card " + (/*theme*/ ctx[17].status === 'read' ? 'read' : '') + " " + (/*theme*/ ctx[17].status === 'archived'
			? 'archived'
			: '') + " svelte-151vmb9");

			attr(div6, "role", "button");
			attr(div6, "tabindex", "0");
			this.first = div6;
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div2);
			append(div2, div0);
			if (if_block0) if_block0.m(div0, null);
			append(div0, t0);
			append(div0, h2);
			append(h2, t1);
			append(div2, t2);
			append(div2, div1);
			append(div1, t3);
			append(div6, t4);
			append(div6, p);
			append(p, t5);
			append(div6, t6);
			append(div6, div3);
			if (if_block1) if_block1.m(div3, null);
			append(div3, t7);
			append(div3, span0);
			append(span0, t8);
			append(div6, t9);
			append(div6, div5);
			append(div5, span1);
			append(span1, t10);
			append(div5, t11);
			append(div5, div4);
			if (if_block2) if_block2.m(div4, null);
			append(div4, t12);
			append(div4, button);
			append(div6, t14);

			if (!mounted) {
				dispose = [
					listen(button, "click", click_handler_2),
					listen(div6, "click", click_handler_3)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*batches*/ 2) show_if = /*isNew*/ ctx[6](/*theme*/ ctx[17]) && /*theme*/ ctx[17].status !== 'read';

			if (show_if) {
				if (if_block0) ; else {
					if_block0 = create_if_block_4$1();
					if_block0.c();
					if_block0.m(div0, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty & /*batches*/ 2 && t1_value !== (t1_value = /*theme*/ ctx[17].title + "")) set_data(t1, t1_value);
			if (dirty & /*batches*/ 2 && t3_value !== (t3_value = /*theme*/ ctx[17].importance + "")) set_data(t3, t3_value);

			if (dirty & /*batches*/ 2 && div1_class_value !== (div1_class_value = "importance-badge " + getImportanceClass(/*theme*/ ctx[17].importance) + " svelte-151vmb9")) {
				attr(div1, "class", div1_class_value);
			}

			if (dirty & /*batches*/ 2 && t5_value !== (t5_value = /*theme*/ ctx[17].summary + "")) set_data(t5, t5_value);

			if (/*theme*/ ctx[17].keywords) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_3$1(ctx);
					if_block1.c();
					if_block1.m(div3, t7);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*batches*/ 2 && t8_value !== (t8_value = /*theme*/ ctx[17].category + "")) set_data(t8, t8_value);
			if (dirty & /*batches*/ 2 && t10_value !== (t10_value = new Date(/*theme*/ ctx[17].created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + "")) set_data(t10, t10_value);

			if (/*theme*/ ctx[17].status !== 'read' && /*theme*/ ctx[17].status !== 'archived') {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_2$1(ctx);
					if_block2.c();
					if_block2.m(div4, t12);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty & /*batches*/ 2 && div6_class_value !== (div6_class_value = "theme-card " + (/*theme*/ ctx[17].status === 'read' ? 'read' : '') + " " + (/*theme*/ ctx[17].status === 'archived'
			? 'archived'
			: '') + " svelte-151vmb9")) {
				attr(div6, "class", div6_class_value);
			}
		},
		d(detaching) {
			if (detaching) {
				detach(div6);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (107:4) {#each batches as batch, batchIndex}
function create_each_block$1(ctx) {
	let div1;
	let div0;
	let span0;
	let t0_value = (/*batch*/ ctx[14].collapsed ? '▶' : '▼') + "";
	let t0;
	let t1;
	let span1;
	let t2_value = /*batch*/ ctx[14].label + "";
	let t2;
	let t3;
	let span2;
	let t4_value = /*batch*/ ctx[14].themes.length + "";
	let t4;
	let t5;
	let t6;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[8](/*batchIndex*/ ctx[16]);
	}

	let if_block = !/*batch*/ ctx[14].collapsed && create_if_block_1$1(ctx);

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
			attr(span0, "class", "batch-toggle svelte-151vmb9");
			attr(span1, "class", "batch-label svelte-151vmb9");
			attr(span2, "class", "batch-count svelte-151vmb9");
			attr(div0, "class", "batch-header svelte-151vmb9");
			attr(div0, "role", "button");
			attr(div0, "tabindex", "0");
			attr(div1, "class", "batch-group svelte-151vmb9");
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
				dispose = listen(div0, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*batches*/ 2 && t0_value !== (t0_value = (/*batch*/ ctx[14].collapsed ? '▶' : '▼') + "")) set_data(t0, t0_value);
			if (dirty & /*batches*/ 2 && t2_value !== (t2_value = /*batch*/ ctx[14].label + "")) set_data(t2, t2_value);
			if (dirty & /*batches*/ 2 && t4_value !== (t4_value = /*batch*/ ctx[14].themes.length + "")) set_data(t4, t4_value);

			if (!/*batch*/ ctx[14].collapsed) {
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
		if (/*themes*/ ctx[0].length === 0) return create_if_block$1;
		return create_else_block$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "trendradar-theme-list-container svelte-151vmb9");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, [dirty]) {
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

function groupThemesByBatch(themes) {
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

	return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([label, items]) => ({
		label,
		themes: items.sort((a, b) => b.importance - a.importance),
		collapsed: false
	}));
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
	let batches;
	let { themes = [] } = $$props;
	let { newThemeAgeDays = 1 } = $$props;
	const dispatch = createEventDispatcher();

	function toggleBatch(index) {
		$$invalidate(1, batches[index].collapsed = !batches[index].collapsed, batches);
		($$invalidate(1, batches), $$invalidate(0, themes)); // 触发更新
	}

	function handleThemeClick(themeId) {
		dispatch('theme-click', { themeId });
	}

	function handleMarkRead(e, themeId) {
		e.stopPropagation();
		dispatch('theme-mark-read', { themeId });
	}

	function handleDelete(e, themeId) {
		e.stopPropagation();

		if (confirm('确定要删除这条信息吗？')) {
			dispatch('theme-delete', { themeId });
		}
	}

	function isNew(theme) {
		const createdAt = new Date(theme.created_at);
		const ageMs = Date.now() - createdAt.getTime();
		const ageDays = ageMs / (1000 * 60 * 60 * 24);
		return ageDays <= newThemeAgeDays;
	}

	const click_handler = batchIndex => toggleBatch(batchIndex);
	const click_handler_1 = (theme, e) => handleMarkRead(e, theme.id);
	const click_handler_2 = (theme, e) => handleDelete(e, theme.id);
	const click_handler_3 = theme => handleThemeClick(theme.id);

	$$self.$$set = $$props => {
		if ('themes' in $$props) $$invalidate(0, themes = $$props.themes);
		if ('newThemeAgeDays' in $$props) $$invalidate(7, newThemeAgeDays = $$props.newThemeAgeDays);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*themes*/ 1) {
			$$invalidate(1, batches = groupThemesByBatch(themes));
		}
	};

	return [
		themes,
		batches,
		toggleBatch,
		handleThemeClick,
		handleMarkRead,
		handleDelete,
		isNew,
		newThemeAgeDays,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3
	];
}

class ThemeList extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { themes: 0, newThemeAgeDays: 7 }, add_css$1);
	}
}

/* ThemeDetail.svelte generated by Svelte v4.2.20 */

function add_css(target) {
	append_styles(target, "svelte-33drfa", ".trendradar-theme-detail-container.svelte-33drfa.svelte-33drfa{padding:0 var(--size-4-2);max-height:70vh;overflow-y:auto}.header.svelte-33drfa.svelte-33drfa{margin-bottom:var(--size-4-4);padding-bottom:var(--size-4-4);border-bottom:2px solid var(--background-modifier-border)}.header-top.svelte-33drfa.svelte-33drfa{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--size-4-3);flex-wrap:wrap;gap:var(--size-4-2)}.meta-left.svelte-33drfa.svelte-33drfa{display:flex;align-items:center;gap:var(--size-4-2)}.category.svelte-33drfa.svelte-33drfa{background-color:var(--interactive-accent);color:var(--text-on-accent);padding:4px 12px;border-radius:var(--radius-m);font-weight:600;font-size:var(--font-ui-small)}.status-badge.svelte-33drfa.svelte-33drfa{padding:2px 8px;border-radius:var(--radius-s);font-size:var(--font-ui-smaller)}.status-badge.archived.svelte-33drfa.svelte-33drfa{background-color:var(--text-faint);color:var(--background-primary)}.status-badge.read.svelte-33drfa.svelte-33drfa{background-color:var(--background-modifier-border);color:var(--text-muted)}.action-buttons.svelte-33drfa.svelte-33drfa{display:flex;gap:var(--size-4-2)}.action-btn.svelte-33drfa.svelte-33drfa{padding:6px 12px;border-radius:var(--radius-s);border:1px solid var(--background-modifier-border);background-color:var(--background-secondary);cursor:pointer;font-size:var(--font-ui-small);transition:all 0.15s}.action-btn.svelte-33drfa.svelte-33drfa:hover{background-color:var(--background-secondary-alt)}.action-btn.export.svelte-33drfa.svelte-33drfa{border-color:var(--interactive-accent);color:var(--interactive-accent)}.action-btn.delete.svelte-33drfa.svelte-33drfa:hover{background-color:rgba(255, 100, 100, 0.2);border-color:var(--color-red)}.title.svelte-33drfa.svelte-33drfa{font-size:var(--font-ui-large);font-weight:700;margin:var(--size-4-2) 0;line-height:1.3}.metrics.svelte-33drfa.svelte-33drfa{display:flex;gap:var(--size-4-4);margin-bottom:var(--size-4-3);flex-wrap:wrap}.metric.svelte-33drfa.svelte-33drfa{display:flex;flex-direction:column;gap:2px}.metric-label.svelte-33drfa.svelte-33drfa{font-size:var(--font-ui-smaller);color:var(--text-faint)}.metric-value.svelte-33drfa.svelte-33drfa{font-weight:600;font-size:var(--font-ui-small)}.metric-value.importance.svelte-33drfa.svelte-33drfa{color:var(--color-red)}.metric-value.impact.svelte-33drfa.svelte-33drfa{color:var(--color-orange)}.tags.svelte-33drfa.svelte-33drfa{display:flex;flex-wrap:wrap;gap:var(--size-4-2)}.tag.svelte-33drfa.svelte-33drfa{background-color:var(--background-modifier-border);color:var(--text-muted);padding:3px 10px;border-radius:var(--radius-m);font-size:var(--font-ui-smaller)}.section.svelte-33drfa.svelte-33drfa{margin-bottom:var(--size-4-4)}.section.svelte-33drfa h2.svelte-33drfa{font-size:var(--font-ui-medium);font-weight:600;margin-bottom:var(--size-4-3);padding-bottom:var(--size-4-2);border-bottom:1px solid var(--background-modifier-border);color:var(--text-normal)}.summary-text.svelte-33drfa.svelte-33drfa{line-height:1.7;color:var(--text-normal);background-color:var(--background-secondary);padding:var(--size-4-3);border-radius:var(--radius-m);border-left:3px solid var(--interactive-accent)}.key-points.svelte-33drfa.svelte-33drfa{list-style:none;padding:0;margin:0}.key-points.svelte-33drfa li.svelte-33drfa{position:relative;padding-left:var(--size-4-4);margin-bottom:var(--size-4-2);line-height:1.6}.key-points.svelte-33drfa li.svelte-33drfa::before{content:\"•\";position:absolute;left:0;color:var(--interactive-accent);font-weight:bold}.articles-list.svelte-33drfa.svelte-33drfa{display:flex;flex-direction:column;gap:var(--size-4-3);max-height:300px;overflow-y:auto;padding-right:var(--size-4-2)}.article-item.svelte-33drfa.svelte-33drfa{padding:var(--size-4-3);border-radius:var(--radius-m);background-color:var(--background-secondary);border:1px solid var(--background-modifier-border);transition:all 0.15s}.article-item.svelte-33drfa.svelte-33drfa:hover{border-color:var(--background-modifier-border-hover);background-color:var(--background-secondary-alt)}.article-header.svelte-33drfa.svelte-33drfa{display:flex;align-items:flex-start;gap:var(--size-4-2)}.article-title.svelte-33drfa.svelte-33drfa{font-weight:500;text-decoration:none;color:var(--text-normal);flex:1;line-height:1.4}.article-title.svelte-33drfa.svelte-33drfa:hover{color:var(--interactive-accent);text-decoration:underline}.external-link.svelte-33drfa.svelte-33drfa{color:var(--text-faint);font-size:12px}.article-meta.svelte-33drfa.svelte-33drfa{font-size:var(--font-ui-smaller);color:var(--text-muted);margin-top:var(--size-4-2);display:flex;flex-wrap:wrap;gap:var(--size-4-3)}.article-summary.svelte-33drfa.svelte-33drfa{font-size:var(--font-ui-small);color:var(--text-muted);margin-top:var(--size-4-2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[8] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	return child_ctx;
}

// (47:42) 
function create_if_block_7(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "已读";
			attr(span, "class", "status-badge read svelte-33drfa");
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

// (45:8) {#if theme.status === 'archived'}
function create_if_block_6(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "已归档";
			attr(span, "class", "status-badge archived svelte-33drfa");
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

// (55:8) {#if theme.status !== 'archived'}
function create_if_block_5(ctx) {
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "📥 归档";
			attr(button, "class", "action-btn archive svelte-33drfa");
			attr(button, "title", "归档");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*handleArchive*/ ctx[4]);
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

// (84:4) {#if tags.length > 0}
function create_if_block_4(ctx) {
	let div;
	let each_value_2 = ensure_array_like(/*tags*/ ctx[2]);
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

			attr(div, "class", "tags svelte-33drfa");
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
			if (dirty & /*tags*/ 4) {
				each_value_2 = ensure_array_like(/*tags*/ ctx[2]);
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

// (86:8) {#each tags as tag}
function create_each_block_2(ctx) {
	let span;
	let t_value = /*tag*/ ctx[14] + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "tag svelte-33drfa");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*tags*/ 4 && t_value !== (t_value = /*tag*/ ctx[14] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (100:2) {#if keyPoints.length > 0}
function create_if_block_3(ctx) {
	let div;
	let h2;
	let t1;
	let ul;
	let each_value_1 = ensure_array_like(/*keyPoints*/ ctx[1]);
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

			attr(h2, "class", "svelte-33drfa");
			attr(ul, "class", "key-points svelte-33drfa");
			attr(div, "class", "section svelte-33drfa");
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
			if (dirty & /*keyPoints*/ 2) {
				each_value_1 = ensure_array_like(/*keyPoints*/ ctx[1]);
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

// (104:8) {#each keyPoints as point}
function create_each_block_1(ctx) {
	let li;
	let t_value = /*point*/ ctx[11] + "";
	let t;

	return {
		c() {
			li = element("li");
			t = text(t_value);
			attr(li, "class", "svelte-33drfa");
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, t);
		},
		p(ctx, dirty) {
			if (dirty & /*keyPoints*/ 2 && t_value !== (t_value = /*point*/ ctx[11] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(li);
			}
		}
	};
}

// (127:14) {:else}
function create_else_block(ctx) {
	let t0;
	let t1_value = (/*article*/ ctx[8].feed_id || '未知来源') + "";
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
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = (/*article*/ ctx[8].feed_id || '未知来源') + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (125:14) {#if article.source_name}
function create_if_block_2(ctx) {
	let t0;
	let t1_value = /*article*/ ctx[8].source_name + "";
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
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = /*article*/ ctx[8].source_name + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (132:14) {#if article.author}
function create_if_block_1(ctx) {
	let t0;
	let t1_value = /*article*/ ctx[8].author + "";
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
			if (dirty & /*theme*/ 1 && t1_value !== (t1_value = /*article*/ ctx[8].author + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) {
				detach(t0);
				detach(t1);
			}
		}
	};
}

// (145:10) {#if article.summary}
function create_if_block(ctx) {
	let p;
	let t_value = /*article*/ ctx[8].summary + "";
	let t;

	return {
		c() {
			p = element("p");
			t = text(t_value);
			attr(p, "class", "article-summary svelte-33drfa");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t);
		},
		p(ctx, dirty) {
			if (dirty & /*theme*/ 1 && t_value !== (t_value = /*article*/ ctx[8].summary + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (115:6) {#each theme.articles as article}
function create_each_block(ctx) {
	let div2;
	let div0;
	let a;
	let t0_value = /*article*/ ctx[8].title + "";
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

	let t7_value = new Date(/*article*/ ctx[8].published_at).toLocaleString('zh-CN', {
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}) + "";

	let t7;
	let t8;
	let t9;

	function select_block_type_1(ctx, dirty) {
		if (/*article*/ ctx[8].source_name) return create_if_block_2;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*article*/ ctx[8].author && create_if_block_1(ctx);
	let if_block2 = /*article*/ ctx[8].summary && create_if_block(ctx);

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
			attr(a, "href", a_href_value = /*article*/ ctx[8].url);
			attr(a, "target", "_blank");
			attr(a, "rel", "noopener noreferrer");
			attr(a, "class", "article-title svelte-33drfa");
			attr(span0, "class", "external-link svelte-33drfa");
			attr(div0, "class", "article-header svelte-33drfa");
			attr(span1, "class", "source");
			attr(span2, "class", "author");
			attr(span3, "class", "time");
			attr(div1, "class", "article-meta svelte-33drfa");
			attr(div2, "class", "article-item svelte-33drfa");
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
			if (dirty & /*theme*/ 1 && t0_value !== (t0_value = /*article*/ ctx[8].title + "")) set_data(t0, t0_value);

			if (dirty & /*theme*/ 1 && a_href_value !== (a_href_value = /*article*/ ctx[8].url)) {
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

			if (/*article*/ ctx[8].author) {
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

			if (dirty & /*theme*/ 1 && t7_value !== (t7_value = new Date(/*article*/ ctx[8].published_at).toLocaleString('zh-CN', {
				month: 'numeric',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}) + "")) set_data(t7, t7_value);

			if (/*article*/ ctx[8].summary) {
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
	let div11;
	let div7;
	let div2;
	let div0;
	let span0;
	let t0_value = /*theme*/ ctx[0].category + "";
	let t0;
	let t1;
	let t2;
	let div1;
	let button0;
	let t4;
	let t5;
	let button1;
	let t7;
	let h1;
	let t8_value = /*theme*/ ctx[0].title + "";
	let t8;
	let t9;
	let div6;
	let div3;
	let span1;
	let t11;
	let span2;
	let t12_value = /*theme*/ ctx[0].importance + "";
	let t12;
	let t13;
	let t14;
	let div4;
	let span3;
	let t16;
	let span4;
	let t17_value = /*theme*/ ctx[0].impact + "";
	let t17;
	let t18;
	let t19;
	let div5;
	let span5;
	let t21;
	let span6;
	let t22_value = new Date(/*theme*/ ctx[0].created_at).toLocaleString('zh-CN') + "";
	let t22;
	let t23;
	let t24;
	let div8;
	let h20;
	let t26;
	let p;
	let t27_value = /*theme*/ ctx[0].summary + "";
	let t27;
	let t28;
	let t29;
	let div10;
	let h21;
	let t30;
	let t31_value = /*theme*/ ctx[0].articles.length + "";
	let t31;
	let t32;
	let t33;
	let div9;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*theme*/ ctx[0].status === 'archived') return create_if_block_6;
		if (/*theme*/ ctx[0].status === 'read') return create_if_block_7;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type && current_block_type(ctx);
	let if_block1 = /*theme*/ ctx[0].status !== 'archived' && create_if_block_5(ctx);
	let if_block2 = /*tags*/ ctx[2].length > 0 && create_if_block_4(ctx);
	let if_block3 = /*keyPoints*/ ctx[1].length > 0 && create_if_block_3(ctx);
	let each_value = ensure_array_like(/*theme*/ ctx[0].articles);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div11 = element("div");
			div7 = element("div");
			div2 = element("div");
			div0 = element("div");
			span0 = element("span");
			t0 = text(t0_value);
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			div1 = element("div");
			button0 = element("button");
			button0.textContent = "📝 导出笔记";
			t4 = space();
			if (if_block1) if_block1.c();
			t5 = space();
			button1 = element("button");
			button1.textContent = "🗑 删除";
			t7 = space();
			h1 = element("h1");
			t8 = text(t8_value);
			t9 = space();
			div6 = element("div");
			div3 = element("div");
			span1 = element("span");
			span1.textContent = "重要性";
			t11 = space();
			span2 = element("span");
			t12 = text(t12_value);
			t13 = text("/10");
			t14 = space();
			div4 = element("div");
			span3 = element("span");
			span3.textContent = "影响力";
			t16 = space();
			span4 = element("span");
			t17 = text(t17_value);
			t18 = text("/10");
			t19 = space();
			div5 = element("div");
			span5 = element("span");
			span5.textContent = "创建时间";
			t21 = space();
			span6 = element("span");
			t22 = text(t22_value);
			t23 = space();
			if (if_block2) if_block2.c();
			t24 = space();
			div8 = element("div");
			h20 = element("h2");
			h20.textContent = "📊 AI 分析摘要";
			t26 = space();
			p = element("p");
			t27 = text(t27_value);
			t28 = space();
			if (if_block3) if_block3.c();
			t29 = space();
			div10 = element("div");
			h21 = element("h2");
			t30 = text("📰 信息来源 (");
			t31 = text(t31_value);
			t32 = text(")");
			t33 = space();
			div9 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(span0, "class", "category svelte-33drfa");
			attr(div0, "class", "meta-left svelte-33drfa");
			attr(button0, "class", "action-btn export svelte-33drfa");
			attr(button0, "title", "导出为笔记");
			attr(button1, "class", "action-btn delete svelte-33drfa");
			attr(button1, "title", "删除");
			attr(div1, "class", "action-buttons svelte-33drfa");
			attr(div2, "class", "header-top svelte-33drfa");
			attr(h1, "class", "title svelte-33drfa");
			attr(span1, "class", "metric-label svelte-33drfa");
			attr(span2, "class", "metric-value importance svelte-33drfa");
			attr(div3, "class", "metric svelte-33drfa");
			attr(span3, "class", "metric-label svelte-33drfa");
			attr(span4, "class", "metric-value impact svelte-33drfa");
			attr(div4, "class", "metric svelte-33drfa");
			attr(span5, "class", "metric-label svelte-33drfa");
			attr(span6, "class", "metric-value svelte-33drfa");
			attr(div5, "class", "metric svelte-33drfa");
			attr(div6, "class", "metrics svelte-33drfa");
			attr(div7, "class", "header svelte-33drfa");
			attr(h20, "class", "svelte-33drfa");
			attr(p, "class", "summary-text svelte-33drfa");
			attr(div8, "class", "section summary-section svelte-33drfa");
			attr(h21, "class", "svelte-33drfa");
			attr(div9, "class", "articles-list svelte-33drfa");
			attr(div10, "class", "section svelte-33drfa");
			attr(div11, "class", "trendradar-theme-detail-container svelte-33drfa");
		},
		m(target, anchor) {
			insert(target, div11, anchor);
			append(div11, div7);
			append(div7, div2);
			append(div2, div0);
			append(div0, span0);
			append(span0, t0);
			append(div0, t1);
			if (if_block0) if_block0.m(div0, null);
			append(div2, t2);
			append(div2, div1);
			append(div1, button0);
			append(div1, t4);
			if (if_block1) if_block1.m(div1, null);
			append(div1, t5);
			append(div1, button1);
			append(div7, t7);
			append(div7, h1);
			append(h1, t8);
			append(div7, t9);
			append(div7, div6);
			append(div6, div3);
			append(div3, span1);
			append(div3, t11);
			append(div3, span2);
			append(span2, t12);
			append(span2, t13);
			append(div6, t14);
			append(div6, div4);
			append(div4, span3);
			append(div4, t16);
			append(div4, span4);
			append(span4, t17);
			append(span4, t18);
			append(div6, t19);
			append(div6, div5);
			append(div5, span5);
			append(div5, t21);
			append(div5, span6);
			append(span6, t22);
			append(div7, t23);
			if (if_block2) if_block2.m(div7, null);
			append(div11, t24);
			append(div11, div8);
			append(div8, h20);
			append(div8, t26);
			append(div8, p);
			append(p, t27);
			append(div11, t28);
			if (if_block3) if_block3.m(div11, null);
			append(div11, t29);
			append(div11, div10);
			append(div10, h21);
			append(h21, t30);
			append(h21, t31);
			append(h21, t32);
			append(div10, t33);
			append(div10, div9);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div9, null);
				}
			}

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*handleExport*/ ctx[3]),
					listen(button1, "click", /*handleDelete*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*theme*/ 1 && t0_value !== (t0_value = /*theme*/ ctx[0].category + "")) set_data(t0, t0_value);

			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
				if (if_block0) if_block0.d(1);
				if_block0 = current_block_type && current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div0, null);
				}
			}

			if (/*theme*/ ctx[0].status !== 'archived') {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_5(ctx);
					if_block1.c();
					if_block1.m(div1, t5);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*theme*/ 1 && t8_value !== (t8_value = /*theme*/ ctx[0].title + "")) set_data(t8, t8_value);
			if (dirty & /*theme*/ 1 && t12_value !== (t12_value = /*theme*/ ctx[0].importance + "")) set_data(t12, t12_value);
			if (dirty & /*theme*/ 1 && t17_value !== (t17_value = /*theme*/ ctx[0].impact + "")) set_data(t17, t17_value);
			if (dirty & /*theme*/ 1 && t22_value !== (t22_value = new Date(/*theme*/ ctx[0].created_at).toLocaleString('zh-CN') + "")) set_data(t22, t22_value);

			if (/*tags*/ ctx[2].length > 0) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_4(ctx);
					if_block2.c();
					if_block2.m(div7, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty & /*theme*/ 1 && t27_value !== (t27_value = /*theme*/ ctx[0].summary + "")) set_data(t27, t27_value);

			if (/*keyPoints*/ ctx[1].length > 0) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_3(ctx);
					if_block3.c();
					if_block3.m(div11, t29);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (dirty & /*theme*/ 1 && t31_value !== (t31_value = /*theme*/ ctx[0].articles.length + "")) set_data(t31, t31_value);

			if (dirty & /*theme, Date*/ 1) {
				each_value = ensure_array_like(/*theme*/ ctx[0].articles);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div9, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) {
				detach(div11);
			}

			if (if_block0) {
				if_block0.d();
			}

			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
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
			$$invalidate(2, tags = parseTags$1(theme.tags));
		}

		if ($$self.$$.dirty & /*theme*/ 1) {
			$$invalidate(1, keyPoints = parseKeyPoints(theme.key_points));
		}
	};

	return [theme, keyPoints, tags, handleExport, handleArchive, handleDelete];
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
        if (confirm('确定要删除这条信息吗？删除后无法恢复。')) {
            this.onAction('delete');
            this.close();
        }
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
        });
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
                        this.updateStats();
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
                    this.updateStats();
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
    archiveTheme(themeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const success = yield updateThemeStatus(this.plugin.settings.apiUrl, themeId, 'archived');
            if (success) {
                new obsidian.Notice('已归档');
                const theme = this.currentThemes.find(t => t.id === themeId);
                if (theme) {
                    theme.status = 'archived';
                    this.component.$set({ themes: this.currentThemes });
                    this.updateStats();
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
                this.updateStats();
            }
            else {
                new obsidian.Notice('删除失败');
            }
        });
    }
    // 更新视图数据
    update(themes_1) {
        return __awaiter(this, arguments, void 0, function* (themes, newThemeAgeDays = 1) {
            this.currentThemes = themes;
            this.newThemeAgeDays = newThemeAgeDays;
            this.component.$set({ themes, newThemeAgeDays });
            this.updateStats();
        });
    }
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
            { id: 'sources', name: '数据源管理', icon: 'database' },
            { id: 'ai', name: 'AI 配置', icon: 'bot' },
            { id: 'filter', name: '内容过滤', icon: 'filter' }
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
            case 'sources':
                this.renderSourcesSettings();
                break;
            case 'ai':
                this.renderAISettings();
                break;
            case 'filter':
                this.renderFilterSettings();
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
                    if (source.type === 'web')
                        iconName = 'globe';
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
            try {
                const config = yield getAIConfig(this.plugin.settings.apiUrl);
                new obsidian.Setting(container)
                    .setName('AI 提供商')
                    .setDesc('选择 AI 服务提供商')
                    .addDropdown(dropdown => dropdown
                    .addOption('openai', 'OpenAI')
                    .addOption('deepseek', 'DeepSeek')
                    .addOption('gemini', 'Google Gemini')
                    .setValue(config.provider)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.provider = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                new obsidian.Setting(container)
                    .setName('API Key')
                    .setDesc('输入您的 API Key')
                    .addText(text => text
                    .setPlaceholder('sk-...')
                    .setValue(config.api_key)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.api_key = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                new obsidian.Setting(container)
                    .setName('Base URL')
                    .setDesc('API 基础地址（可选，用于中转或自定义端点）')
                    .addText(text => text
                    .setPlaceholder('https://api.openai.com/v1')
                    .setValue(config.base_url)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.base_url = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                new obsidian.Setting(container)
                    .setName('模型名称')
                    .setDesc('指定使用的模型（如 gpt-4o, deepseek-chat）')
                    .addText(text => text
                    .setPlaceholder('gpt-3.5-turbo')
                    .setValue(config.model_name)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.model_name = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                new obsidian.Setting(container)
                    .setName('温度 (Temperature)')
                    .setDesc('控制生成内容的随机性 (0.0 - 1.0)')
                    .addSlider(slider => slider
                    .setLimits(0, 1, 0.1)
                    .setValue(config.temperature)
                    .setDynamicTooltip()
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.temperature = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
            }
            catch (error) {
                container.createEl('p', { text: '无法加载 AI 配置，请检查后端服务是否运行。', cls: 'trendradar-error-text' });
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
            .addOption('web', '网站爬取')
            .addOption('twitter', 'Twitter/X 用户')
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
        if (config.type === 'rss' || config.type === 'web') {
            new obsidian.Setting(contentEl)
                .setName('URL')
                .setDesc(config.type === 'rss' ? 'RSS Feed 地址' : '目标网页地址')
                .addText(text => text
                .setValue(config.url)
                .onChange(value => config.url = value));
        }
        if (config.type === 'web') {
            new obsidian.Setting(contentEl)
                .setName('CSS 选择器')
                .setDesc('用于提取文章链接的 CSS 选择器 (例如: .post-title a)')
                .addText(text => text
                .setValue(config.selector || '')
                .onChange(value => config.selector = value));
        }
        if (config.type === 'twitter') {
            new obsidian.Setting(contentEl)
                .setName('用户名')
                .setDesc('Twitter 用户名 (不带 @)')
                .addText(text => text
                .setValue(config.username || '')
                .onChange(value => config.username = value));
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

module.exports = TrendRadarPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzLy5wbnBtL0Byb2xsdXArcGx1Z2luLXR5cGVzY3JpcHRAMTEuMS42X3JvbGx1cEA0LjU1LjFfdHNsaWJAMi44LjFfdHlwZXNjcmlwdEA1LjkuMy9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwiYXBpLnRzIiwibm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMjAvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjIwL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvZG9tLmpzIiwibm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMjAvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9saWZlY3ljbGUuanMiLCJub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4yMC9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3NjaGVkdWxlci5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjIwL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvdHJhbnNpdGlvbnMuanMiLCJub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4yMC9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2VhY2guanMiLCJub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4yMC9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL0NvbXBvbmVudC5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjIwL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3NoYXJlZC92ZXJzaW9uLmpzIiwibm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMjAvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9kaXNjbG9zZS12ZXJzaW9uL2luZGV4LmpzIiwiVGhlbWVMaXN0LnN2ZWx0ZSIsIlRoZW1lRGV0YWlsLnN2ZWx0ZSIsImZvcm1hdHRlci50cyIsIlRoZW1lRGV0YWlsTW9kYWwudHMiLCJ2aWV3LnRzIiwibWFpbi50cyJdLCJuYW1lcyI6WyJyZXF1ZXN0IiwiTm90aWNlIiwiY3JlYXRlX2lmX2Jsb2NrXzMiLCJjcmVhdGVfaWZfYmxvY2tfMiIsImNyZWF0ZV9pZl9ibG9ja18xIiwiY3JlYXRlX2lmX2Jsb2NrIiwiTW9kYWwiLCJUaGVtZURldGFpbENvbXBvbmVudCIsIkl0ZW1WaWV3IiwiUGx1Z2luIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciLCJUb2dnbGVDb21wb25lbnQiLCJCdXR0b25Db21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWtHQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxD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
