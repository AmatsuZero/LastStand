import * as params from '@params';

const overlay = document.getElementById('search-overlay');
const trigger = document.getElementById('search-trigger');
const input = document.getElementById('search-modal-input');
const results = document.getElementById('search-modal-results');
const closeBtn = document.getElementById('search-modal-close');

let fuse = null;
let activeIndex = -1;
let lastFocused = null;

const defaultFuseOptions = {
    distance: 100,
    threshold: 0.4,
    ignoreLocation: true,
    keys: ['title', 'permalink', 'summary']
};

const buildFuseOptions = () => {
    if (!params.fuseOpts) return defaultFuseOptions;
    return {
        isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
        includeScore: params.fuseOpts.includescore ?? false,
        includeMatches: params.fuseOpts.includematches ?? false,
        minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
        shouldSort: params.fuseOpts.shouldsort ?? true,
        findAllMatches: params.fuseOpts.findallmatches ?? false,
        keys: params.fuseOpts.keys ?? defaultFuseOptions.keys,
        location: params.fuseOpts.location ?? 0,
        threshold: params.fuseOpts.threshold ?? defaultFuseOptions.threshold,
        distance: params.fuseOpts.distance ?? defaultFuseOptions.distance,
        ignoreLocation: params.fuseOpts.ignorelocation ?? defaultFuseOptions.ignoreLocation
    };
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), delay);
    };
};

const open = () => {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    trigger?.setAttribute('aria-expanded', 'true');
    // Defer focus past the transition: synchronous focus() during a click
    // handler can be discarded, and an element during a visibility transition
    // is not focusable.
    setTimeout(() => input?.focus({ preventScroll: true }), 30);
};

const close = () => {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    trigger?.setAttribute('aria-expanded', 'false');
    results.innerHTML = '';
    activeIndex = -1;
    // Intentionally not focusing trigger: avoids focus ring on close,
    // and keyboard users can Tab to navigate from here.
};

const renderStatus = (html) => {
    results.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'search-modal-status';
    li.innerHTML = html;
    results.appendChild(li);
};

const renderResults = (matches) => {
    results.innerHTML = '';
    activeIndex = -1;

    if (!Array.isArray(matches) || matches.length === 0) {
        renderStatus('未找到匹配文章');
        return;
    }

    const fragment = document.createDocumentFragment();
    matches.forEach((match, index) => {
        const item = match.item || match;
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.permalink;
        link.setAttribute('aria-label', item.title);

        const title = document.createElement('span');
        title.className = 'result-title';
        title.textContent = item.title;

        const summary = document.createElement('span');
        summary.className = 'result-summary';
        summary.textContent = item.summary;

        link.appendChild(title);
        if (item.summary) link.appendChild(summary);
        li.appendChild(link);
        fragment.appendChild(li);
    });

    results.appendChild(fragment);
};

const setActive = (index) => {
    const items = Array.from(results.querySelectorAll('li:not(.search-modal-status)'));
    if (!items.length) return;

    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    activeIndex = index;

    items.forEach((item, i) => {
        item.classList.toggle('is-active', i === index);
    });
    items[index].scrollIntoView({ block: 'nearest' });
};

const performSearch = () => {
    const query = input.value.trim();
    if (!query) {
        results.innerHTML = '';
        activeIndex = -1;
        return;
    }
    if (!fuse) return;

    const searchOptions = params.fuseOpts?.limit ? { limit: params.fuseOpts.limit } : undefined;
    const matches = searchOptions ? fuse.search(query, searchOptions) : fuse.search(query);
    renderResults(matches);
    setActive(0);
};

const initSearch = async () => {
    if (!overlay || !input || !results) return;

    try {
        const response = await fetch(window.searchIndexUrl || '../index.json');
        if (!response.ok) throw new Error(`Search index load failed: ${response.status}`);
        const data = await response.json();
        if (data) fuse = new Fuse(data, buildFuseOptions());
    } catch (error) {
        console.error(error);
        renderStatus('搜索索引加载失败');
    }
};

/* ---- events ---- */
// Prevent the browser from focusing the trigger button on click,
// so the modal's input can take focus reliably.
trigger?.addEventListener('mousedown', (event) => {
    if (event.button === 0) event.preventDefault();
});

trigger?.addEventListener('click', () => {
    if (!overlay.classList.contains('is-open')) open();
    else close();
});

closeBtn?.addEventListener('click', close);

overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) close();
});

document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key === '/') {
        event.preventDefault();
        if (!overlay?.classList.contains('is-open')) open();
        else close();
    }

    if (!overlay?.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
        close();
        return;
    }

    const items = Array.from(results.querySelectorAll('li:not(.search-modal-status)'));

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (items.length) setActive(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (items.length) setActive(activeIndex - 1);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        const active = items[activeIndex]?.querySelector('a');
        if (active) {
            window.location.href = active.href;
        }
    }
});

input?.addEventListener('input', debounce(performSearch, 150));

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}
