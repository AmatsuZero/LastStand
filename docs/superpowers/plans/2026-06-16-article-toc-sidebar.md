# Article TOC Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a default-open, hideable left-side table-of-contents drawer for long article pages, with mobile drawer behavior and current-section highlighting.

**Architecture:** Reuse PaperMod's existing Hugo `toc.html` partial and heading anchors. Add a local `single.html` override that renders the TOC in a sidebar shell only when the article has headings and `ShowToc` is enabled. Add one extended CSS file for layout/states and one guarded footer script for toggle/highlight behavior.

**Tech Stack:** Hugo, PaperMod templates, Hugo Pipes extended CSS, vanilla JavaScript, browser smoke testing.

---

## File Structure

- Modify: `hugo.toml`
  - Enable TOC globally for article pages and default the inner `<details>` TOC to open.
- Create: `layouts/single.html`
  - Local site override of `themes/PaperMod/layouts/single.html`.
  - Computes whether a rendered article really has headings.
  - Moves the existing `toc.html` partial into a fixed/sidebar shell.
- Create: `assets/css/extended/article-toc-sidebar.css`
  - Extended PaperMod stylesheet loaded by `resources.Match "css/extended/*.css"` in `themes/PaperMod/layouts/_partials/head.html`.
  - Defines desktop default-open sidebar, collapsed state, mobile drawer, backdrop, and active-link styles.
- Modify: `layouts/partials/extend_footer.html`
  - Append a `ShowToc`-guarded vanilla JS block after the existing Mermaid script.
  - Handles opening/closing, mobile backdrop, mobile link-close, and scroll-driven active heading highlight.

## Task 1: Enable TOC by default

**Files:**
- Modify: `hugo.toml:4-9`

- [ ] **Step 1: Verify current config does not globally enable TOC**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
text = Path('hugo.toml').read_text()
print('ShowToc =' in text)
print('TocOpen =' in text)
PY
```

Expected before this task:

```text
False
False
```

- [ ] **Step 2: Add global PaperMod TOC params**

Change `hugo.toml` from:

```toml
baseURL = 'https://amatsuzero.github.io/LastStand/'
locale = 'zh-cn'
title = 'Last Stand'
theme = 'PaperMod'

[params.assets]
favicon = 'favicon.svg'
theme_color = '#111827'
```

to:

```toml
baseURL = 'https://amatsuzero.github.io/LastStand/'
locale = 'zh-cn'
title = 'Last Stand'
theme = 'PaperMod'

[params]
ShowToc = true
TocOpen = true

[params.assets]
favicon = 'favicon.svg'
theme_color = '#111827'
```

- [ ] **Step 3: Build to verify config syntax**

Run:

```bash
hugo --gc --minify
```

Expected: build exits with status `0` and no TOML parse errors.

## Task 2: Add the local article template override

**Files:**
- Create: `layouts/single.html`
- Reference: `themes/PaperMod/layouts/single.html:1-67`

- [ ] **Step 1: Confirm the local override does not already exist**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
print(Path('layouts/single.html').exists())
PY
```

Expected before this task:

```text
False
```

- [ ] **Step 2: Create `layouts/single.html` with TOC shell**

Write this complete file:

```html
{{- define "main" }}
{{- $headers := findRE "<h[1-6].*?>(.|\n])+?</h[1-6]>" .Content -}}
{{- $hasToc := and (.Param "ShowToc") (ge (len $headers) 1) -}}

<article class="post-single{{ if $hasToc }} has-page-toc{{ end }}">
  <header class="post-header">
    {{ partial "breadcrumbs.html" . }}
    <h1 class="post-title entry-hint-parent">
      {{ .Title }}
      {{- if .Draft }}
      <span class="entry-hint" title="Draft">
        <svg xmlns="http://www.w3.org/2000/svg" height="35" viewBox="0 -960 960 960" fill="currentColor">
          <path
            d="M160-410v-60h300v60H160Zm0-165v-60h470v60H160Zm0-165v-60h470v60H160Zm360 580v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q9 9 13 20t4 22q0 11-4.5 22.5T862.09-380L643-160H520Zm300-263-37-37 37 37ZM580-220h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z" />
        </svg>
      </span>
      {{- end }}
    </h1>
    {{- if .Description }}
    <div class="post-description">
      {{ .Description }}
    </div>
    {{- end }}
    {{- if not (.Param "hideMeta") }}
    <div class="post-meta">
      {{- partial "post_meta.html" . -}}
      {{- partial "translation_list.html" . -}}
      {{- partial "edit_post.html" . -}}
      {{- partial "post_canonical.html" . -}}
    </div>
    {{- end }}
  </header>
  {{- $isHidden := (.Param "cover.hiddenInSingle") | default (.Param "cover.hidden") | default false }}
  {{- partial "cover.html" (dict "cxt" . "IsSingle" true "isHidden" $isHidden) }}

  {{- if $hasToc }}
  <div class="post-toc-shell" data-post-toc>
    <button class="post-toc-toggle" type="button" data-toc-toggle aria-expanded="true" aria-controls="post-toc-sidebar">
      <span class="post-toc-toggle-icon" aria-hidden="true">☰</span>
      <span class="post-toc-toggle-text">目录</span>
    </button>
    <aside class="post-toc-sidebar" id="post-toc-sidebar" data-toc-sidebar aria-label="文章目录">
      {{- partial "toc.html" . }}
    </aside>
    <button class="post-toc-backdrop" type="button" data-toc-backdrop aria-label="关闭目录" hidden></button>
  {{- end }}

  {{- if .Content }}
  <div class="post-content md-content">
    {{- if not (.Param "disableAnchoredHeadings") }}
    {{- partial "anchored_headings.html" .Content -}}
    {{- else }}{{ .Content }}{{ end }}
  </div>
  {{- end }}

  {{- partial "extend_post_content.html" . }}

  <footer class="post-footer">
    {{- $tags := .Language.Params.Taxonomies.tag | default "tags" }}
    <ul class="post-tags">
      {{- range ($.GetTerms $tags) }}
      <li><a href="{{ .Permalink }}">{{ .LinkTitle }}</a></li>
      {{- end }}
    </ul>
    {{- if (.Param "ShowPostNavLinks") }}
    {{- partial "post_nav_links.html" . }}
    {{- end }}
    {{- if (and site.Params.ShowShareButtons (ne .Params.disableShare true)) }}
    {{- partial "share_icons.html" . -}}
    {{- end }}
  </footer>

  {{- if (.Param "comments") }}
  {{- partial "comments.html" . }}
  {{- end }}

  {{- if $hasToc }}
  </div>
  {{- end }}
</article>

{{- end }}{{/* end main */}}
```

- [ ] **Step 3: Build to verify Hugo template syntax**

Run:

```bash
hugo --gc --minify
```

Expected: build exits with status `0`.

- [ ] **Step 4: Verify generated article HTML contains the sidebar shell**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
matches = list(Path('public').glob('posts/**/index.html'))
html = '\n'.join(p.read_text(errors='ignore') for p in matches)
print('post-toc-shell' in html)
print('post-toc-sidebar' in html)
print('data-toc-toggle' in html)
PY
```

Expected after this task:

```text
True
True
True
```

## Task 3: Add responsive sidebar and drawer styles

**Files:**
- Create: `assets/css/extended/article-toc-sidebar.css`
- Reference: `themes/PaperMod/assets/css/common/post-single.css:59-114`

- [ ] **Step 1: Write the CSS file**

Create `assets/css/extended/article-toc-sidebar.css` with this content:

```css
.post-toc-shell {
    display: block;
}

.post-toc-sidebar {
    position: fixed;
    top: calc(var(--header-height) + var(--gap));
    left: max(var(--gap), calc((100vw - (var(--main-width) + var(--gap) * 2)) / 2 - 252px));
    z-index: 10;
    width: 220px;
    max-height: calc(100vh - var(--header-height) - var(--gap) * 2);
    overflow: auto;
    overscroll-behavior: contain;
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
    transition: opacity 160ms ease, transform 160ms ease, visibility 160ms ease;
}

.post-toc-sidebar details.toc {
    margin-bottom: 0;
    background: var(--theme);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .post-toc-sidebar details.toc {
    background: var(--entry);
}

.post-toc-sidebar details.toc summary {
    position: sticky;
    top: 0;
    z-index: 1;
    background: inherit;
}

.post-toc-sidebar details .inner {
    margin: 0 1rem;
    padding: 0 0 0.8rem;
}

.post-toc-sidebar details ul {
    padding-inline-start: 0;
}

.post-toc-sidebar details li {
    margin: 0.35rem 0;
    list-style: none;
}

.post-toc-sidebar details li ul {
    margin-inline-start: 0.85rem;
}

.post-toc-sidebar a {
    display: block;
    border-radius: calc(var(--radius) / 2);
    padding: 0.18rem 0.35rem;
    color: var(--secondary);
    font-size: 0.86rem;
    line-height: 1.45;
    text-decoration: none;
}

.post-toc-sidebar a:hover,
.post-toc-sidebar a.is-active {
    color: var(--primary);
    background: var(--code-bg);
    text-decoration: none;
}

.post-toc-sidebar a.is-active {
    font-weight: 600;
}

.post-toc-toggle {
    position: fixed;
    top: calc(var(--header-height) + var(--gap));
    left: max(var(--gap), calc((100vw - (var(--main-width) + var(--gap) * 2)) / 2 - 296px));
    z-index: 11;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 34px;
    padding: 0 0.65rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--primary);
    background: var(--theme);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    cursor: pointer;
}

[data-theme="dark"] .post-toc-toggle {
    background: var(--entry);
}

.post-toc-toggle:hover {
    background: var(--code-bg);
}

.post-single.has-page-toc.is-toc-collapsed .post-toc-sidebar {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateX(-12px);
}

.post-single.has-page-toc.is-toc-collapsed .post-toc-toggle-icon {
    transform: rotate(180deg);
}

.post-toc-backdrop {
    display: none;
}

@media (max-width: 1199px) {
    .post-toc-sidebar {
        top: 0;
        bottom: 0;
        left: 0;
        width: min(82vw, 320px);
        max-height: none;
        padding: var(--gap);
        background: var(--theme);
        box-shadow: 18px 0 40px rgba(0, 0, 0, 0.18);
        transform: translateX(-100%);
        opacity: 0;
        visibility: hidden;
    }

    [data-theme="dark"] .post-toc-sidebar {
        background: var(--theme);
    }

    .post-toc-sidebar details.toc {
        box-shadow: none;
    }

    .post-toc-toggle {
        top: calc(var(--header-height) + 10px);
        left: var(--gap);
    }

    .post-single.has-page-toc.is-toc-open .post-toc-sidebar {
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
    }

    .post-toc-backdrop:not([hidden]) {
        position: fixed;
        inset: 0;
        z-index: 9;
        display: block;
        border: 0;
        background: rgba(0, 0, 0, 0.32);
    }
}

@media (max-width: 768px) {
    .post-toc-toggle {
        min-height: 32px;
        padding: 0 0.55rem;
        font-size: 0.86rem;
    }

    .post-toc-sidebar {
        width: min(86vw, 300px);
        padding: calc(var(--gap) * 0.75);
    }
}
```

- [ ] **Step 2: Build to verify CSS is picked up by Hugo Pipes**

Run:

```bash
hugo --gc --minify
```

Expected: build exits with status `0`.

- [ ] **Step 3: Verify generated CSS contains the new selectors**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
css = '\n'.join(p.read_text(errors='ignore') for p in Path('public').glob('assets/css/*.css'))
print('.post-toc-sidebar' in css)
print('.post-toc-toggle' in css)
print('.is-toc-collapsed' in css)
PY
```

Expected:

```text
True
True
True
```

## Task 4: Add toggle and active-heading JavaScript

**Files:**
- Modify: `layouts/partials/extend_footer.html:190`

- [ ] **Step 1: Append the guarded script block**

Append this exact block after the existing Mermaid block in `layouts/partials/extend_footer.html`:

```html
{{- if (.Param "ShowToc") }}
<script>
  (() => {
    const article = document.querySelector('.post-single.has-page-toc');
    if (!article) return;

    const button = article.querySelector('[data-toc-toggle]');
    const sidebar = article.querySelector('[data-toc-sidebar]');
    const backdrop = article.querySelector('[data-toc-backdrop]');
    const links = Array.from(article.querySelectorAll('.post-toc-sidebar a[href^="#"]'));
    const desktopQuery = window.matchMedia('(min-width: 1200px)');
    let open = desktopQuery.matches;

    const setOpen = nextOpen => {
      open = nextOpen;
      article.classList.toggle('is-toc-open', open);
      article.classList.toggle('is-toc-collapsed', !open);
      if (button) {
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? '隐藏目录' : '显示目录');
        const text = button.querySelector('.post-toc-toggle-text');
        if (text) text.textContent = open ? '隐藏目录' : '目录';
      }
      if (backdrop) {
        backdrop.hidden = !open || desktopQuery.matches;
      }
      if (sidebar && open && !desktopQuery.matches) {
        sidebar.focus({ preventScroll: true });
      }
    };

    if (sidebar) sidebar.tabIndex = -1;
    setOpen(open);

    button?.addEventListener('click', () => setOpen(!open));
    backdrop?.addEventListener('click', () => setOpen(false));
    desktopQuery.addEventListener('change', event => setOpen(event.matches));

    links.forEach(link => {
      link.addEventListener('click', () => {
        if (!desktopQuery.matches) setOpen(false);
      });
    });

    const headingById = new Map();
    links.forEach(link => {
      const id = decodeURIComponent(link.hash.slice(1));
      const heading = id ? document.getElementById(id) : null;
      if (heading) headingById.set(id, heading);
    });

    if (!headingById.size) return;

    const setActive = id => {
      links.forEach(link => {
        link.classList.toggle('is-active', decodeURIComponent(link.hash.slice(1)) === id);
      });
    };

    if (!('IntersectionObserver' in window)) {
      setActive(headingById.keys().next().value);
      return;
    }

    const visibleHeadings = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleHeadings.set(entry.target.id, entry.boundingClientRect.top);
        } else {
          visibleHeadings.delete(entry.target.id);
        }
      });

      if (visibleHeadings.size) {
        const [id] = Array.from(visibleHeadings.entries()).sort((a, b) => a[1] - b[1])[0];
        setActive(id);
      }
    }, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 1]
    });

    headingById.forEach(heading => observer.observe(heading));
  })();
</script>
{{- end }}
```

- [ ] **Step 2: Build to verify template and JS are emitted**

Run:

```bash
hugo --gc --minify
```

Expected: build exits with status `0`.

- [ ] **Step 3: Verify generated article HTML contains the script selectors**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
html = '\n'.join(p.read_text(errors='ignore') for p in Path('public').glob('posts/**/index.html'))
print('data-toc-toggle' in html)
print('IntersectionObserver' in html)
print('is-active' in html)
PY
```

Expected:

```text
True
True
True
```

## Task 5: Browser verification

**Files:**
- Verify generated site only.

- [ ] **Step 1: Run the local Hugo server**

Run:

```bash
hugo server --bind 127.0.0.1 --port 1313 --disableFastRender
```

Expected: server starts and prints a local URL containing `http://127.0.0.1:1313/`.

- [ ] **Step 2: Open an existing heading-heavy article**

Use a page such as:

```text
http://127.0.0.1:1313/posts/OCSourceCodeAnalysis/autorelease-explained/
```

Expected on desktop width `>= 1200px`:

- Left TOC is visible by default.
- Toggle button says `隐藏目录`.
- Clicking the toggle hides the TOC and changes the button text to `目录`.
- Clicking the toggle again shows the TOC.
- Clicking a TOC entry scrolls to the corresponding heading.
- Scrolling the article highlights the current TOC entry.

- [ ] **Step 3: Verify mobile drawer behavior**

Set browser viewport to `390x844`.

Expected:

- TOC is hidden by default.
- `目录` button is visible near the upper-left side of the viewport.
- Tapping `目录` opens a left drawer and backdrop.
- Tapping the backdrop closes the drawer.
- Tapping a TOC link scrolls to the heading and closes the drawer.

- [ ] **Step 4: Verify pages without headings do not show empty TOC chrome**

Create this temporary smoke page:

```bash
mkdir -p content/posts/toc-no-heading-smoke
python3 - <<'PY'
from pathlib import Path
Path('content/posts/toc-no-heading-smoke/index.md').write_text('''+++
title = "TOC no heading smoke"
date = "2026-06-16T00:00:00+08:00"
draft = false
+++

This article intentionally has no Markdown headings.

It should render without any table-of-contents button or sidebar.
''')
PY
hugo --gc --minify
python3 - <<'PY'
from pathlib import Path
html = Path('public/posts/toc-no-heading-smoke/index.html').read_text(errors='ignore')
print('post-toc-toggle' in html)
print('post-toc-sidebar' in html)
PY
rm -rf content/posts/toc-no-heading-smoke
```

Expected:

```text
False
False
```

## Task 6: Final validation and commit

**Files:**
- Validate all changed files.

- [ ] **Step 1: Run final production build**

Run:

```bash
hugo --gc --minify
```

Expected: build exits with status `0`.

- [ ] **Step 2: Review the diff**

Run:

```bash
git diff -- hugo.toml layouts/single.html assets/css/extended/article-toc-sidebar.css layouts/partials/extend_footer.html
```

Expected:

- `hugo.toml` enables `ShowToc` and `TocOpen` globally.
- `layouts/single.html` is a focused PaperMod single-page override.
- `article-toc-sidebar.css` only styles the article TOC sidebar/drawer.
- `extend_footer.html` appends only the guarded TOC script and keeps the existing Mermaid script intact.

- [ ] **Step 3: Commit**

Run:

```bash
git add hugo.toml layouts/single.html assets/css/extended/article-toc-sidebar.css layouts/partials/extend_footer.html
git commit -m "feat: add article toc sidebar"
```

Expected: commit succeeds after hooks pass.
