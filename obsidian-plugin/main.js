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
	append_styles(target, "svelte-1toxmtd", ".trendradar-theme-list-container.svelte-1toxmtd.svelte-1toxmtd{padding:var(--size-4-2);height:100%;overflow-y:auto}.empty-state.svelte-1toxmtd.svelte-1toxmtd{text-align:center;margin-top:60px;color:var(--text-muted)}.empty-icon.svelte-1toxmtd.svelte-1toxmtd{font-size:48px;margin-bottom:16px}.empty-state.svelte-1toxmtd .hint.svelte-1toxmtd{font-size:var(--font-ui-smaller);color:var(--text-faint)}.batch-group.svelte-1toxmtd.svelte-1toxmtd{margin-bottom:var(--size-4-4)}.batch-header.svelte-1toxmtd.svelte-1toxmtd{display:flex;align-items:center;padding:var(--size-4-2) var(--size-4-3);background-color:var(--background-secondary);border-radius:var(--radius-s);cursor:pointer;user-select:none;margin-bottom:var(--size-4-2)}.batch-header.svelte-1toxmtd.svelte-1toxmtd:hover{background-color:var(--background-secondary-alt)}.batch-toggle.svelte-1toxmtd.svelte-1toxmtd{margin-right:var(--size-4-2);font-size:10px;color:var(--text-muted)}.batch-label.svelte-1toxmtd.svelte-1toxmtd{font-weight:600;flex:1}.batch-count.svelte-1toxmtd.svelte-1toxmtd{font-size:var(--font-ui-smaller);color:var(--text-muted)}.theme-list.svelte-1toxmtd.svelte-1toxmtd{display:grid;gap:var(--size-4-3)}.theme-card.svelte-1toxmtd.svelte-1toxmtd{background-color:var(--background-secondary);border-radius:var(--radius-m);padding:var(--size-4-3);border-left:3px solid var(--interactive-accent);transition:all 0.15s ease;cursor:pointer}.theme-card.svelte-1toxmtd.svelte-1toxmtd:hover{background-color:var(--background-secondary-alt);transform:translateX(2px)}.theme-card.read.svelte-1toxmtd.svelte-1toxmtd{opacity:0.7;border-left-color:var(--text-muted)}.theme-card.archived.svelte-1toxmtd.svelte-1toxmtd{opacity:0.5;border-left-color:var(--text-faint)}.card-header.svelte-1toxmtd.svelte-1toxmtd{display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--size-4-2)}.card-meta.svelte-1toxmtd.svelte-1toxmtd{display:flex;align-items:center;gap:var(--size-4-2)}.category.svelte-1toxmtd.svelte-1toxmtd{background-color:var(--background-modifier-accent);color:var(--text-accent);padding:2px 8px;border-radius:var(--radius-s);font-size:var(--font-ui-smaller);font-weight:500}.new-badge.svelte-1toxmtd.svelte-1toxmtd{background-color:var(--color-red);color:white;padding:1px 6px;border-radius:var(--radius-s);font-size:10px;font-weight:600}.archived-badge.svelte-1toxmtd.svelte-1toxmtd{background-color:var(--text-faint);color:var(--background-primary);padding:1px 6px;border-radius:var(--radius-s);font-size:10px}.importance-badge.svelte-1toxmtd.svelte-1toxmtd{font-size:var(--font-ui-smaller);padding:2px 8px;border-radius:var(--radius-s);font-weight:500}.importance-badge.high.svelte-1toxmtd.svelte-1toxmtd{background-color:rgba(255, 100, 100, 0.2);color:var(--color-red)}.importance-badge.medium.svelte-1toxmtd.svelte-1toxmtd{background-color:rgba(255, 200, 100, 0.2);color:var(--color-yellow)}.importance-badge.low.svelte-1toxmtd.svelte-1toxmtd{background-color:rgba(100, 200, 100, 0.2);color:var(--color-green)}.title.svelte-1toxmtd.svelte-1toxmtd{font-size:var(--font-ui-medium);font-weight:600;margin-bottom:var(--size-4-2);line-height:1.4}.summary.svelte-1toxmtd.svelte-1toxmtd{color:var(--text-muted);font-size:var(--font-ui-small);margin-bottom:var(--size-4-2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.tags.svelte-1toxmtd.svelte-1toxmtd{display:flex;flex-wrap:wrap;gap:var(--size-4-1);margin-bottom:var(--size-4-2)}.tag.svelte-1toxmtd.svelte-1toxmtd{background-color:var(--background-modifier-border);color:var(--text-muted);padding:1px 6px;border-radius:var(--radius-s);font-size:11px}.card-footer.svelte-1toxmtd.svelte-1toxmtd{display:flex;justify-content:space-between;align-items:center;font-size:var(--font-ui-smaller);color:var(--text-faint);padding-top:var(--size-4-2);border-top:1px solid var(--background-modifier-border)}.footer-info.svelte-1toxmtd.svelte-1toxmtd{display:flex;gap:var(--size-4-3)}.card-actions.svelte-1toxmtd.svelte-1toxmtd{display:flex;gap:var(--size-4-1);opacity:0;transition:opacity 0.15s}.theme-card.svelte-1toxmtd:hover .card-actions.svelte-1toxmtd{opacity:1}.action-btn.svelte-1toxmtd.svelte-1toxmtd{background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:var(--radius-s);font-size:14px;transition:background-color 0.15s}.action-btn.svelte-1toxmtd.svelte-1toxmtd:hover{background-color:var(--background-modifier-hover)}.action-btn.delete.svelte-1toxmtd.svelte-1toxmtd:hover{background-color:rgba(255, 100, 100, 0.2)}");
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	child_ctx[17] = i;
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[18] = list[i];
	return child_ctx;
}

function get_each_context_2$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[21] = list[i];
	return child_ctx;
}

// (91:2) {:else}
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
			if (dirty & /*batches, handleThemeClick, handleDelete, handleArchive, handleMarkRead, Date, parseTags, getImportanceClass, isNew, toggleBatch*/ 254) {
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

// (85:2) {#if themes.length === 0}
function create_if_block$1(ctx) {
	let div1;

	return {
		c() {
			div1 = element("div");
			div1.innerHTML = `<div class="empty-icon svelte-1toxmtd">📭</div> <p>暂无主题数据</p> <p class="hint svelte-1toxmtd">点击刷新按钮获取最新信息</p>`;
			attr(div1, "class", "empty-state svelte-1toxmtd");
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

// (100:8) {#if !batch.collapsed}
function create_if_block_1$1(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_value_1 = ensure_array_like(/*batch*/ ctx[15].themes);
	const get_key = ctx => /*theme*/ ctx[18].id;

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

			attr(div, "class", "theme-list svelte-1toxmtd");
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
			if (dirty & /*batches, handleThemeClick, handleDelete, handleArchive, handleMarkRead, Date, parseTags, getImportanceClass, isNew*/ 250) {
				each_value_1 = ensure_array_like(/*batch*/ ctx[15].themes);
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

// (113:20) {#if isNew(theme) && theme.status !== 'read'}
function create_if_block_6$1(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "NEW";
			attr(span, "class", "new-badge svelte-1toxmtd");
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

// (116:20) {#if theme.status === 'archived'}
function create_if_block_5$1(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "已归档";
			attr(span, "class", "archived-badge svelte-1toxmtd");
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

// (132:16) {#if theme.tags}
function create_if_block_4$1(ctx) {
	let div;
	let each_value_2 = ensure_array_like(parseTags$2(/*theme*/ ctx[18].tags).slice(0, 4));
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

			attr(div, "class", "tags svelte-1toxmtd");
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
			if (dirty & /*parseTags, batches*/ 2) {
				each_value_2 = ensure_array_like(parseTags$2(/*theme*/ ctx[18].tags).slice(0, 4));
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

// (134:20) {#each parseTags(theme.tags).slice(0, 4) as tag}
function create_each_block_2$1(ctx) {
	let span;
	let t_value = /*tag*/ ctx[21] + "";
	let t;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "class", "tag svelte-1toxmtd");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*batches*/ 2 && t_value !== (t_value = /*tag*/ ctx[21] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

// (152:20) {#if theme.status !== 'read' && theme.status !== 'archived'}
function create_if_block_3$1(ctx) {
	let button;
	let mounted;
	let dispose;

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[10](/*theme*/ ctx[18], ...args);
	}

	return {
		c() {
			button = element("button");
			button.textContent = "✓";
			attr(button, "class", "action-btn svelte-1toxmtd");
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

// (157:20) {#if theme.status !== 'archived'}
function create_if_block_2$1(ctx) {
	let button;
	let mounted;
	let dispose;

	function click_handler_2(...args) {
		return /*click_handler_2*/ ctx[11](/*theme*/ ctx[18], ...args);
	}

	return {
		c() {
			button = element("button");
			button.textContent = "📥";
			attr(button, "class", "action-btn svelte-1toxmtd");
			attr(button, "title", "归档");
		},
		m(target, anchor) {
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", click_handler_2);
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

// (102:12) {#each batch.themes as theme (theme.id)}
function create_each_block_1$1(key_1, ctx) {
	let div6;
	let div2;
	let div0;
	let span0;
	let t0_value = /*theme*/ ctx[18].category + "";
	let t0;
	let t1;
	let show_if = /*isNew*/ ctx[7](/*theme*/ ctx[18]) && /*theme*/ ctx[18].status !== 'read';
	let t2;
	let t3;
	let div1;
	let t4;
	let t5_value = /*theme*/ ctx[18].importance + "";
	let t5;
	let div1_class_value;
	let t6;
	let h2;
	let t7_value = /*theme*/ ctx[18].title + "";
	let t7;
	let t8;
	let p;
	let t9_value = /*theme*/ ctx[18].summary + "";
	let t9;
	let t10;
	let t11;
	let div5;
	let div3;
	let span1;
	let t12;
	let t13_value = /*theme*/ ctx[18].impact + "";
	let t13;
	let t14;
	let t15;
	let span2;

	let t16_value = new Date(/*theme*/ ctx[18].created_at).toLocaleString('zh-CN', {
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}) + "";

	let t16;
	let t17;
	let div4;
	let t18;
	let t19;
	let button;
	let t21;
	let div6_class_value;
	let mounted;
	let dispose;
	let if_block0 = show_if && create_if_block_6$1();
	let if_block1 = /*theme*/ ctx[18].status === 'archived' && create_if_block_5$1();
	let if_block2 = /*theme*/ ctx[18].tags && create_if_block_4$1(ctx);
	let if_block3 = /*theme*/ ctx[18].status !== 'read' && /*theme*/ ctx[18].status !== 'archived' && create_if_block_3$1(ctx);
	let if_block4 = /*theme*/ ctx[18].status !== 'archived' && create_if_block_2$1(ctx);

	function click_handler_3(...args) {
		return /*click_handler_3*/ ctx[12](/*theme*/ ctx[18], ...args);
	}

	function click_handler_4() {
		return /*click_handler_4*/ ctx[13](/*theme*/ ctx[18]);
	}

	return {
		key: key_1,
		first: null,
		c() {
			div6 = element("div");
			div2 = element("div");
			div0 = element("div");
			span0 = element("span");
			t0 = text(t0_value);
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			div1 = element("div");
			t4 = text("⭐ ");
			t5 = text(t5_value);
			t6 = space();
			h2 = element("h2");
			t7 = text(t7_value);
			t8 = space();
			p = element("p");
			t9 = text(t9_value);
			t10 = space();
			if (if_block2) if_block2.c();
			t11 = space();
			div5 = element("div");
			div3 = element("div");
			span1 = element("span");
			t12 = text("影响力: ");
			t13 = text(t13_value);
			t14 = text("/10");
			t15 = space();
			span2 = element("span");
			t16 = text(t16_value);
			t17 = space();
			div4 = element("div");
			if (if_block3) if_block3.c();
			t18 = space();
			if (if_block4) if_block4.c();
			t19 = space();
			button = element("button");
			button.textContent = "🗑";
			t21 = space();
			attr(span0, "class", "category svelte-1toxmtd");
			attr(div0, "class", "card-meta svelte-1toxmtd");
			attr(div1, "class", div1_class_value = "importance-badge " + getImportanceClass(/*theme*/ ctx[18].importance) + " svelte-1toxmtd");
			attr(div2, "class", "card-header svelte-1toxmtd");
			attr(h2, "class", "title svelte-1toxmtd");
			attr(p, "class", "summary svelte-1toxmtd");
			attr(span1, "class", "impact");
			attr(span2, "class", "time");
			attr(div3, "class", "footer-info svelte-1toxmtd");
			attr(button, "class", "action-btn delete svelte-1toxmtd");
			attr(button, "title", "删除");
			attr(div4, "class", "card-actions svelte-1toxmtd");
			attr(div5, "class", "card-footer svelte-1toxmtd");

			attr(div6, "class", div6_class_value = "theme-card " + (/*theme*/ ctx[18].status === 'read' ? 'read' : '') + " " + (/*theme*/ ctx[18].status === 'archived'
			? 'archived'
			: '') + " svelte-1toxmtd");

			attr(div6, "role", "button");
			attr(div6, "tabindex", "0");
			this.first = div6;
		},
		m(target, anchor) {
			insert(target, div6, anchor);
			append(div6, div2);
			append(div2, div0);
			append(div0, span0);
			append(span0, t0);
			append(div0, t1);
			if (if_block0) if_block0.m(div0, null);
			append(div0, t2);
			if (if_block1) if_block1.m(div0, null);
			append(div2, t3);
			append(div2, div1);
			append(div1, t4);
			append(div1, t5);
			append(div6, t6);
			append(div6, h2);
			append(h2, t7);
			append(div6, t8);
			append(div6, p);
			append(p, t9);
			append(div6, t10);
			if (if_block2) if_block2.m(div6, null);
			append(div6, t11);
			append(div6, div5);
			append(div5, div3);
			append(div3, span1);
			append(span1, t12);
			append(span1, t13);
			append(span1, t14);
			append(div3, t15);
			append(div3, span2);
			append(span2, t16);
			append(div5, t17);
			append(div5, div4);
			if (if_block3) if_block3.m(div4, null);
			append(div4, t18);
			if (if_block4) if_block4.m(div4, null);
			append(div4, t19);
			append(div4, button);
			append(div6, t21);

			if (!mounted) {
				dispose = [
					listen(button, "click", click_handler_3),
					listen(div6, "click", click_handler_4)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*batches*/ 2 && t0_value !== (t0_value = /*theme*/ ctx[18].category + "")) set_data(t0, t0_value);
			if (dirty & /*batches*/ 2) show_if = /*isNew*/ ctx[7](/*theme*/ ctx[18]) && /*theme*/ ctx[18].status !== 'read';

			if (show_if) {
				if (if_block0) ; else {
					if_block0 = create_if_block_6$1();
					if_block0.c();
					if_block0.m(div0, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*theme*/ ctx[18].status === 'archived') {
				if (if_block1) ; else {
					if_block1 = create_if_block_5$1();
					if_block1.c();
					if_block1.m(div0, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*batches*/ 2 && t5_value !== (t5_value = /*theme*/ ctx[18].importance + "")) set_data(t5, t5_value);

			if (dirty & /*batches*/ 2 && div1_class_value !== (div1_class_value = "importance-badge " + getImportanceClass(/*theme*/ ctx[18].importance) + " svelte-1toxmtd")) {
				attr(div1, "class", div1_class_value);
			}

			if (dirty & /*batches*/ 2 && t7_value !== (t7_value = /*theme*/ ctx[18].title + "")) set_data(t7, t7_value);
			if (dirty & /*batches*/ 2 && t9_value !== (t9_value = /*theme*/ ctx[18].summary + "")) set_data(t9, t9_value);

			if (/*theme*/ ctx[18].tags) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_4$1(ctx);
					if_block2.c();
					if_block2.m(div6, t11);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty & /*batches*/ 2 && t13_value !== (t13_value = /*theme*/ ctx[18].impact + "")) set_data(t13, t13_value);

			if (dirty & /*batches*/ 2 && t16_value !== (t16_value = new Date(/*theme*/ ctx[18].created_at).toLocaleString('zh-CN', {
				month: 'numeric',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}) + "")) set_data(t16, t16_value);

			if (/*theme*/ ctx[18].status !== 'read' && /*theme*/ ctx[18].status !== 'archived') {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_3$1(ctx);
					if_block3.c();
					if_block3.m(div4, t18);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (/*theme*/ ctx[18].status !== 'archived') {
				if (if_block4) {
					if_block4.p(ctx, dirty);
				} else {
					if_block4 = create_if_block_2$1(ctx);
					if_block4.c();
					if_block4.m(div4, t19);
				}
			} else if (if_block4) {
				if_block4.d(1);
				if_block4 = null;
			}

			if (dirty & /*batches*/ 2 && div6_class_value !== (div6_class_value = "theme-card " + (/*theme*/ ctx[18].status === 'read' ? 'read' : '') + " " + (/*theme*/ ctx[18].status === 'archived'
			? 'archived'
			: '') + " svelte-1toxmtd")) {
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
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (92:4) {#each batches as batch, batchIndex}
function create_each_block$1(ctx) {
	let div1;
	let div0;
	let span0;
	let t0_value = (/*batch*/ ctx[15].collapsed ? '▶' : '▼') + "";
	let t0;
	let t1;
	let span1;
	let t2_value = /*batch*/ ctx[15].label + "";
	let t2;
	let t3;
	let span2;
	let t4_value = /*batch*/ ctx[15].themes.length + "";
	let t4;
	let t5;
	let t6;
	let t7;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[9](/*batchIndex*/ ctx[17]);
	}

	let if_block = !/*batch*/ ctx[15].collapsed && create_if_block_1$1(ctx);

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
			t5 = text(" 条");
			t6 = space();
			if (if_block) if_block.c();
			t7 = space();
			attr(span0, "class", "batch-toggle svelte-1toxmtd");
			attr(span1, "class", "batch-label svelte-1toxmtd");
			attr(span2, "class", "batch-count svelte-1toxmtd");
			attr(div0, "class", "batch-header svelte-1toxmtd");
			attr(div0, "role", "button");
			attr(div0, "tabindex", "0");
			attr(div1, "class", "batch-group svelte-1toxmtd");
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
			append(span2, t5);
			append(div1, t6);
			if (if_block) if_block.m(div1, null);
			append(div1, t7);

			if (!mounted) {
				dispose = listen(div0, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*batches*/ 2 && t0_value !== (t0_value = (/*batch*/ ctx[15].collapsed ? '▶' : '▼') + "")) set_data(t0, t0_value);
			if (dirty & /*batches*/ 2 && t2_value !== (t2_value = /*batch*/ ctx[15].label + "")) set_data(t2, t2_value);
			if (dirty & /*batches*/ 2 && t4_value !== (t4_value = /*batch*/ ctx[15].themes.length + "")) set_data(t4, t4_value);

			if (!/*batch*/ ctx[15].collapsed) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1$1(ctx);
					if_block.c();
					if_block.m(div1, t7);
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
			attr(div, "class", "trendradar-theme-list-container svelte-1toxmtd");
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
	const groups = { '今天': [], '昨天': [], '更早': [] };

	for (const theme of themes) {
		const createdAt = new Date(theme.created_at);
		const themeDate = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());

		if (themeDate.getTime() >= today.getTime()) {
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

function parseTags$2(tagsStr) {
	if (!tagsStr) return [];

	try {
		return JSON.parse(tagsStr);
	} catch(_a) {
		return tagsStr.split(',').map(t => t.trim()).filter(t => t);
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

	function handleArchive(e, themeId) {
		e.stopPropagation();
		dispatch('theme-archive', { themeId });
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
	const click_handler_2 = (theme, e) => handleArchive(e, theme.id);
	const click_handler_3 = (theme, e) => handleDelete(e, theme.id);
	const click_handler_4 = theme => handleThemeClick(theme.id);

	$$self.$$set = $$props => {
		if ('themes' in $$props) $$invalidate(0, themes = $$props.themes);
		if ('newThemeAgeDays' in $$props) $$invalidate(8, newThemeAgeDays = $$props.newThemeAgeDays);
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
		handleArchive,
		handleDelete,
		isNew,
		newThemeAgeDays,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4
	];
}

class ThemeList extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { themes: 0, newThemeAgeDays: 8 }, add_css$1);
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
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        // ========== 基本设置 ==========
        containerEl.createEl('h2', { text: 'TrendRadar 设置' });
        new obsidian.Setting(containerEl)
            .setName('后端 API 地址')
            .setDesc('TrendRadar Python 后端服务器的地址')
            .addText(text => text
            .setPlaceholder('http://127.0.0.1:3334')
            .setValue(this.plugin.settings.apiUrl)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.apiUrl = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('导出文件夹')
            .setDesc('新笔记将保存到此文件夹')
            .addText(text => text
            .setPlaceholder('TrendRadar/Notes')
            .setValue(this.plugin.settings.exportPath)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.exportPath = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('自动刷新')
            .setDesc('启用后将自动定时刷新数据')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.autoRefresh)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.autoRefresh = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
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
        // ========== 任务控制 ==========
        containerEl.createEl('h2', { text: '任务控制' });
        new obsidian.Setting(containerEl)
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
        new obsidian.Setting(containerEl)
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
    refreshAISettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.aiContainer.empty();
            try {
                const config = yield getAIConfig(this.plugin.settings.apiUrl);
                // 提供商
                new obsidian.Setting(this.aiContainer)
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
                // API Key
                new obsidian.Setting(this.aiContainer)
                    .setName('API Key')
                    .setDesc('输入您的 API Key')
                    .addText(text => text
                    .setPlaceholder('sk-...')
                    .setValue(config.api_key)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.api_key = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                // Base URL
                new obsidian.Setting(this.aiContainer)
                    .setName('Base URL')
                    .setDesc('API 基础地址（可选，用于中转或自定义端点）')
                    .addText(text => text
                    .setPlaceholder('https://api.openai.com/v1')
                    .setValue(config.base_url)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.base_url = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                // 模型名称
                new obsidian.Setting(this.aiContainer)
                    .setName('模型名称')
                    .setDesc('指定使用的模型（如 gpt-4o, deepseek-chat）')
                    .addText(text => text
                    .setPlaceholder('gpt-3.5-turbo')
                    .setValue(config.model_name)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.model_name = value;
                    yield updateAIConfig(this.plugin.settings.apiUrl, config);
                })));
                // 温度
                new obsidian.Setting(this.aiContainer)
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
                this.aiContainer.createEl('p', {
                    text: '无法加载 AI 配置，请检查后端服务是否运行。',
                    cls: 'trendradar-error-hint'
                });
            }
        });
    }
    refreshSourcesList() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sourcesContainer.empty();
            try {
                const sources = yield getSources(this.plugin.settings.apiUrl);
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
            }
            catch (error) {
                this.sourcesContainer.createEl('p', {
                    text: '无法加载数据源列表，请检查后端服务是否运行。',
                    cls: 'trendradar-error-hint'
                });
            }
        });
    }
    renderSourceItem(source) {
        const itemEl = this.sourcesContainer.createDiv({ cls: 'trendradar-source-item' });
        // 状态指示器
        const statusEl = itemEl.createSpan({
            cls: `trendradar-source-status ${source.enabled ? 'enabled' : 'disabled'}`
        });
        statusEl.title = source.enabled ? '已启用' : '已禁用';
        // 类型图标
        const typeIcons = {
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
        deleteBtn.onclick = () => __awaiter(this, void 0, void 0, function* () {
            if (confirm(`确定要删除数据源 "${source.name}" 吗？`)) {
                try {
                    yield deleteSource(this.plugin.settings.apiUrl, source.id);
                    new obsidian.Notice(`已删除数据源: ${source.name}`);
                    this.refreshSourcesList();
                }
                catch (error) {
                    new obsidian.Notice('删除失败，请重试');
                }
            }
        });
    }
    refreshFilterSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.filterContainer.empty();
            try {
                const config = yield getFilterConfig(this.plugin.settings.apiUrl);
                // 关键词黑名单
                new obsidian.Setting(this.filterContainer)
                    .setName('关键词黑名单')
                    .setDesc('包含这些关键词的文章将被自动过滤（每行一个）')
                    .addTextArea(text => {
                    text.setPlaceholder('娱乐圈\n八卦\n明星')
                        .setValue(config.keyword_blacklist.join('\n'))
                        .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        config.keyword_blacklist = value.split('\n').filter(k => k.trim());
                        yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                    }));
                    text.inputEl.rows = 6;
                    text.inputEl.cols = 30;
                });
                // 分类黑名单
                new obsidian.Setting(this.filterContainer)
                    .setName('分类黑名单')
                    .setDesc('这些分类的文章将被自动过滤（每行一个）')
                    .addTextArea(text => {
                    text.setPlaceholder('娱乐\n体育\n游戏')
                        .setValue(config.category_blacklist.join('\n'))
                        .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                        config.category_blacklist = value.split('\n').filter(k => k.trim());
                        yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                    }));
                    text.inputEl.rows = 6;
                    text.inputEl.cols = 30;
                });
                // 最低重要性
                new obsidian.Setting(this.filterContainer)
                    .setName('最低重要性评分')
                    .setDesc('低于此评分的文章将被过滤（1-10，0表示不过滤）')
                    .addSlider(slider => slider
                    .setLimits(0, 10, 1)
                    .setValue(config.min_importance)
                    .setDynamicTooltip()
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.min_importance = value;
                    yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                })));
                // AI 预过滤
                new obsidian.Setting(this.filterContainer)
                    .setName('启用 AI 预过滤')
                    .setDesc('让 AI 在分析时自动识别并过滤无关内容')
                    .addToggle(toggle => toggle
                    .setValue(config.enable_ai_prefilter)
                    .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                    config.enable_ai_prefilter = value;
                    yield updateFilterConfig(this.plugin.settings.apiUrl, config);
                })));
            }
            catch (error) {
                this.filterContainer.createEl('p', {
                    text: '无法加载过滤器配置，请检查后端服务是否运行。',
                    cls: 'trendradar-error-hint'
                });
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
        // 初始化表单数据
        this.formData = source ? Object.assign({}, source) : {
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
        new obsidian.Setting(contentEl)
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
        new obsidian.Setting(contentEl)
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
        new obsidian.Setting(contentEl)
            .setName('类型')
            .setDesc('选择数据源类型')
            .addDropdown(dropdown => {
            dropdown
                .addOption('rss', 'RSS 订阅')
                .addOption('web', '网站爬取')
                .addOption('twitter', 'Twitter/X')
                .setValue(this.formData.type || 'rss')
                .onChange(value => {
                this.formData.type = value;
                this.refreshTypeSpecificFields(contentEl);
            });
        });
        // 类型特定字段容器
        const typeFieldsContainer = contentEl.createDiv({ cls: 'trendradar-type-fields' });
        this.renderTypeSpecificFields(typeFieldsContainer);
        // 通用设置
        contentEl.createEl('h3', { text: '通用设置' });
        // 更新频率
        new obsidian.Setting(contentEl)
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
        new obsidian.Setting(contentEl)
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
        new obsidian.Setting(contentEl)
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
        new obsidian.Setting(contentEl)
            .setName('启用')
            .setDesc('是否启用此数据源')
            .addToggle(toggle => {
            toggle.setValue(this.formData.enabled !== false)
                .onChange(value => {
                this.formData.enabled = value;
            });
        });
        // 保存按钮
        new obsidian.Setting(contentEl)
            .addButton(button => {
            button.setButtonText('保存')
                .setCta()
                .onClick(() => __awaiter(this, void 0, void 0, function* () {
                yield this.saveSource();
            }));
        })
            .addButton(button => {
            button.setButtonText('取消')
                .onClick(() => {
                this.close();
            });
        });
    }
    refreshTypeSpecificFields(containerEl) {
        const typeFieldsContainer = containerEl.querySelector('.trendradar-type-fields');
        if (typeFieldsContainer) {
            typeFieldsContainer.empty();
            this.renderTypeSpecificFields(typeFieldsContainer);
        }
    }
    renderTypeSpecificFields(container) {
        container.empty();
        switch (this.formData.type) {
            case 'rss':
                new obsidian.Setting(container)
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
                new obsidian.Setting(container)
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
                new obsidian.Setting(container)
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
                new obsidian.Setting(container)
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
    saveSource() {
        return __awaiter(this, void 0, void 0, function* () {
            // 验证必填字段
            if (!this.formData.id || !this.formData.name) {
                new obsidian.Notice('请填写 ID 和名称');
                return;
            }
            if (this.formData.type === 'twitter' && !this.formData.username) {
                new obsidian.Notice('请填写 Twitter 用户名');
                return;
            }
            if ((this.formData.type === 'rss' || this.formData.type === 'web') && !this.formData.url) {
                new obsidian.Notice('请填写 URL');
                return;
            }
            try {
                if (this.source) {
                    // 更新
                    yield updateSource(this.plugin.settings.apiUrl, this.source.id, this.formData);
                    new obsidian.Notice(`已更新数据源: ${this.formData.name}`);
                }
                else {
                    // 创建
                    yield createSource(this.plugin.settings.apiUrl, this.formData);
                    new obsidian.Notice(`已创建数据源: ${this.formData.name}`);
                }
                this.onSave();
                this.close();
            }
            catch (error) {
                new obsidian.Notice('保存失败，请重试');
                console.error('Save source error:', error);
            }
        });
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

module.exports = TrendRadarPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzLy5wbnBtL0Byb2xsdXArcGx1Z2luLXR5cGVzY3JpcHRAMTEuMS42X3JvbGx1cEA0LjU1LjFfdHNsaWJAMi44LjFfdHlwZXNjcmlwdEA1LjkuMy9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwiYXBpLnRzIiwibm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMjAvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC91dGlscy5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjIwL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvZG9tLmpzIiwibm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMjAvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9saWZlY3ljbGUuanMiLCJub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4yMC9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3NjaGVkdWxlci5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjIwL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvdHJhbnNpdGlvbnMuanMiLCJub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4yMC9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2VhY2guanMiLCJub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4yMC9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL0NvbXBvbmVudC5qcyIsIm5vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjIwL25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3NoYXJlZC92ZXJzaW9uLmpzIiwibm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMjAvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9kaXNjbG9zZS12ZXJzaW9uL2luZGV4LmpzIiwiVGhlbWVMaXN0LnN2ZWx0ZSIsIlRoZW1lRGV0YWlsLnN2ZWx0ZSIsImZvcm1hdHRlci50cyIsIlRoZW1lRGV0YWlsTW9kYWwudHMiLCJ2aWV3LnRzIiwibWFpbi50cyJdLCJuYW1lcyI6WyJyZXF1ZXN0IiwiTm90aWNlIiwicGFyc2VUYWdzIiwiY3JlYXRlX2lmX2Jsb2NrXzUiLCJjcmVhdGVfaWZfYmxvY2tfNCIsImNyZWF0ZV9pZl9ibG9ja18zIiwiY3JlYXRlX2lmX2Jsb2NrXzIiLCJjcmVhdGVfaWZfYmxvY2tfMSIsImNyZWF0ZV9pZl9ibG9jayIsIk1vZGFsIiwiVGhlbWVEZXRhaWxDb21wb25lbnQiLCJJdGVtVmlldyIsIlBsdWdpbiIsIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrR0E7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUss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
