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
├── obsidian/             # Obsidian 知识层（Library 为本地生成镜像）
├── public/               # Hugo 构建产物（`hugo` 命令生成）
├── scripts/
│   └── obsidian-vault/   # 知识库导出器与测试
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

## 🧠 Obsidian 知识库

仓库同时提供基于 Obsidian 核心功能的学习知识层。Hugo 的 `content/` 仍是博客原文的唯一事实源；`obsidian/Library/` 是由脚本生成的本地只读镜像。

### 目录结构

```text
obsidian/
├── Home.md               # 知识库首页
├── MOCs/                 # 前端、iOS、AI、项目实践、面试等主题入口
├── Notes/                # 个人理解、问题与总结
├── Templates/            # 学习笔记模板
├── Views/                # Obsidian Bases 视图
├── .obsidian/            # 可复现的核心配置
└── Library/              # 从 content/ 生成，不提交 Git
```

### 生成并打开知识库

在仓库根目录运行：

```bash
python3 scripts/obsidian-vault/export.py
```

随后在 Obsidian 中将仓库里的 `obsidian/` 目录作为 Vault 打开，并从 `Home.md` 开始浏览。

> `Library/` 会在重新导出时被替换，请勿直接修改。博客原文写入 `content/`，个人学习内容写入 `Notes/`。

### 日常工作流

1. 从 `Home.md` 或 `MOCs/` 选择主题和原文。
2. 使用 `Templates/学习笔记.md` 在 `Notes/` 中创建笔记。
3. 在笔记的 `source_notes` 属性中链接对应的 `Library/` 原文。
4. 修改博客内容后重新运行导出命令。

检查本地镜像是否最新且链接、资源完整：

```bash
python3 scripts/obsidian-vault/export.py --check
```

重新生成镜像并输出文章、资源、链接及兼容性统计：

```bash
python3 scripts/obsidian-vault/export.py --report
```

如需显式指定路径：

```bash
python3 scripts/obsidian-vault/export.py \
  --source content \
  --vault obsidian
```

导出器只依赖 Python 3 标准库。运行测试：

```bash
python3 scripts/obsidian-vault/test_export.py
```

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
- 单篇文章目录名建议用 PascalCase；系列文章建议使用父目录 + kebab-case 子目录（如 `CocosTennis/part-two/`）

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

⚠️ Mermaid 对**深度嵌套子图 + 多个 LR direction**布局不稳定，遇到这种"分层架构图"时建议改用纯 HTML/CSS 静态卡片（参考 `CocosTennis/part-two/index.md` 的 `.arch-diagram` 和 `.flow-timeline` 实现）。

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
[前文](../part-one/)
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
