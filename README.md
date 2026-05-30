# Last Stand

基于 [Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题搭建的个人技术博客。

> 站点地址：<https://amatsuzero.github.io/LastStand/>

---

## 📁 目录结构

```
LastStand/
├── archetypes/           # 新文章模板
├── assets/
│   └── css/extended/     # 自定义 CSS（PaperMod 自动加载）
│       └── details.css   # 折叠块样式
├── content/posts/        # 文章正文（每篇一个目录，含同目录图片资源）
├── layouts/
│   ├── _markup/          # 自定义 markdown 渲染钩子（如 mermaid）
│   ├── partials/         # 局部模板（如 footer 注入 mermaid 脚本）
│   └── shortcodes/       # 自定义 shortcode（如 details 折叠块）
├── public/               # Hugo 构建产物（`hugo` 命令生成）
├── themes/PaperMod/      # PaperMod 主题
└── hugo.toml             # 站点配置
```

---

## 🚀 本地开发

```bash
# 启动 dev server，包含草稿，端口 1313
hugo server --buildDrafts

# 仅构建静态文件到 public/
hugo

# 新建一篇文章
hugo new content posts/MyArticle/index.md
```

文章默认 `draft = true`，发布前请改为 `false`。

---

## ✍️ 写作功能与约定

### 1. Front Matter

每篇文章顶部必须有：

```toml
+++
date = '2026-05-30T10:00:00+08:00'
draft = true
title = '文章标题'
tags = ['Cocos', 'iOS']
categories = ['前端开发']
+++
```

- `tags`、`categories` 写中文或英文都可以，会自动生成索引页
- 文章目录名建议用 PascalCase（如 `CocosTennisPartTwo/`），URL 会变小写

### 2. 图片与本地资源

建议每篇文章一个独立目录（page bundle 模式）：

```
content/posts/MyArticle/
├── index.md
├── cover.png
└── diagram.svg
```

在文章里直接相对引用：

```markdown
![alt text](cover.png)
```

### 3. 代码块折叠（自定义 shortcode）

文章里有超长代码块时，使用 `details` shortcode 包裹，浏览器会渲染成可折叠的块：

```markdown
{{</* details summary="点击展开完整代码" */>}}
​```cpp
// 你的代码...
​```
{{</* /details */>}}
```

参数：
- `summary`（可选）：折叠标题，默认 "展开/收起"
- `open="true"`（可选）：默认展开，例如 `{{</* details summary="重要说明" open="true" */>}}`
- 简写：`{{</* details "标题" */>}}`（位置参数）

实现见 `layouts/shortcodes/details.html` + `assets/css/extended/details.css`，
配套样式自动跟随 PaperMod 浅色/深色主题切换。

### 4. Mermaid 图表

在 markdown 里直接写：

````markdown
```mermaid
flowchart TD
    A --> B
```
````

实现机制：
- `layouts/_markup/render-codeblock-mermaid.html` 把 ` ```mermaid ` 代码块渲染为 `<pre class="mermaid">`
- `layouts/partials/extend_footer.html` 在使用了 mermaid 的页面动态加载 `mermaid.esm.min.mjs`（CDN）
- 主题感知：`document.documentElement[data-theme]` 切换 dark/default 主题

⚠️ Mermaid 对**深度嵌套子图 + 多个 LR direction**布局不稳定，遇到这种"分层架构图"时建议改用纯 HTML/CSS 静态卡片（参考 `CocosTennisPartTwo/index.md` 的 `.arch-diagram` 和 `.flow-timeline` 实现）。

### 5. 内联 HTML / CSS

`hugo.toml` 已开启 `[markup.goldmark.renderer] unsafe = true`，可以在 markdown 里直接写 HTML/CSS：

```markdown
<div class="my-component">
  <style>.my-component { ... }</style>
  ...
</div>
```

适合写复杂的架构图、时间线等 Mermaid 难以胜任的可视化。

### 6. 标签与分类

- `tags = ['xxx']` → 自动生成 `/tags/xxx/`
- `categories = ['yyy']` → 自动生成 `/categories/yyy/`
- 多个标签/分类同时存在，文章会出现在所有对应索引页

### 7. 文章间相对链接

```markdown
[前文]({{</* relref "/posts/CocosTennisPartOne" */>}})
```

---

## 🎨 自定义扩展

### 添加新的 CSS

放在 `assets/css/extended/` 下任意 `.css` 文件，PaperMod 会自动 `resources.Match "css/extended/*.css"` 合并打包。

### 添加新的 Shortcode

新建 `layouts/shortcodes/<name>.html`，使用：

```markdown
{{</* name param1="value" */>}}
内容
{{</* /name */>}}
```

模板内可用：
- `.Get "param1"` 或 `.Get 0`（位置参数）
- `.Inner`（块内文本）
- `.Page.RenderString` 把 Inner 当 markdown 渲染

### 添加新的 Markdown 渲染钩子

放在 `layouts/_markup/`：
- `render-codeblock-<lang>.html` — 自定义某语言代码块渲染
- `render-image.html` — 自定义图片渲染
- `render-link.html` — 自定义链接渲染

---

## 🛠️ 站点配置（hugo.toml）

主要字段：

```toml
baseURL = 'https://amatsuzero.github.io/LastStand/'
locale = 'zh-cn'
title = 'Last Stand'
theme = 'PaperMod'

[markup.goldmark.renderer]
unsafe = true              # 允许内联 HTML（必须开启）

[taxonomies]
tag = 'tags'
category = 'categories'
```

如需更多 PaperMod 配置项（如导航、SEO、评论、社交链接），参考 [PaperMod Wiki](https://github.com/adityatelange/hugo-PaperMod/wiki/Variables)。

---

## 📦 部署

GitHub Pages 自动部署到 `gh-pages` 分支或 `/docs` 目录，构建命令：

```bash
hugo --minify
```

产物在 `public/`。

---

## 🔗 相关文档

- [Hugo 官方文档](https://gohugo.io/documentation/)
- [PaperMod Wiki](https://github.com/adityatelange/hugo-PaperMod/wiki)
- [Mermaid 文档](https://mermaid.js.org/intro/)
- [Goldmark Markdown](https://github.com/yuin/goldmark)（Hugo 默认 markdown 引擎）
