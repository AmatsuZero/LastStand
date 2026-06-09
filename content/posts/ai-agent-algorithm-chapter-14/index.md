+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第14章：扩展性架构算法"
tags = ["AI Agent", "Claude Code", "算法思想", "扩展性架构", "插件系统"]
categories = ["AI Agent", "Claude Code"]
+++
> "好的架构不是预知未来，而是让未来的变化变得廉价。" —— Robert C. Martin

## 14.1 问题引入：当能力边界需要不断外扩

一个 Agent 系统在发布后必然面临一个根本性矛盾：用户需求是无限的，而核心代码的变更是昂贵的。每一次向核心代码中添加新功能，都意味着更高的耦合度、更大的回归测试面积、更长的发布周期。

Claude Code 从第一天起就面对这个问题。它需要支持数十种斜杠命令、允许社区贡献新的技能、让每个用户拥有个性化的"记忆"，还要让企业能通过插件定制整个工作流——所有这些都不应该要求修改一行核心代码。

这就是**扩展性架构**要解决的问题。本章我们将剖析 Claude Code 源码中三个核心扩展子系统——**插件系统**、**技能框架**和 **Memory 系统**——背后的算法设计，揭示一个工业级 Agent 是如何在"对扩展开放、对修改封闭"的原则下，实现能力的无限外扩。

---

## 14.2 算法思想

### 14.2.1 插件发现算法：多源汇聚的声明式发现

Claude Code 的插件发现不是简单地扫描某个目录。它采用了一种**多源声明式发现**算法，插件来源按优先级排列：

1. **Marketplace 插件**（`plugin@marketplace` 格式声明于 settings 文件）
2. **会话插件**（`--plugin-dir` CLI 参数或 SDK 内联注入）
3. **内置插件**（编译进二进制的 builtin plugins）

发现算法的核心在 `assemblePluginLoadResult` 函数中：

```
assemblePluginLoadResult(marketplaceLoader):
    // 阶段1: 并行加载各来源
    [marketplaceResult, sessionResult] = await Promise.all([
        marketplaceLoader(),                    // marketplace 插件
        loadSessionOnlyPlugins(inlinePlugins)   // 会话插件
    ])
    builtinResult = getBuiltinPlugins()         // 内置插件

    // 阶段2: 多源合并（冲突解决）
    allPlugins = mergePluginSources({
        session:     sessionResult.plugins,
        marketplace: marketplaceResult.plugins,
        builtin:     builtinResult,
        managedNames: getManagedPluginNames()    // 企业策略锁定
    })

    // 阶段3: 依赖验证与降级
    { demoted, errors } = verifyAndDemote(allPlugins)
    for p in allPlugins:
        if demoted.has(p.source): p.enabled = false

    // 阶段4: 缓存插件设置以供同步访问
    cachePluginSettings(enabledPlugins)
    return { enabled, disabled, errors }
```

这个算法的关键设计决策有三个：

**决策一：并行加载，顺序合并。** Marketplace 加载可能涉及网络 I/O（git clone），会话插件是纯本地读取。通过 `Promise.all` 并行执行，总延迟取决于最慢的那个源，而非所有源之和。

**决策二：声明优先，物化延后。** 插件的"存在"由 settings 文件中的声明决定，实际的代码下载（物化）在后续执行。这意味着 `installPluginOp` 的操作顺序是：搜索 marketplace → 写入 settings（声明意图）→ 缓存插件代码。即便缓存失败，声明仍然存在，下次启动会自动重试。

**决策三：企业策略不可覆盖。** `managedNames`（来自 `policySettings`）标记的插件不会被会话插件覆盖。这确保了企业安全策略的不可绕过性。

#### 版本化缓存与种子层

插件的物理存储采用**版本化缓存**策略：

```
~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/
```

路径中的每个段都经过净化处理（`/[^a-zA-Z0-9\-_]/g` → `-`），防止路径遍历攻击。更巧妙的是**种子目录**机制——企业可以将预构建的插件目录打包进容器镜像，通过 `CLAUDE_CODE_PLUGIN_SEED_DIR` 环境变量指定。加载器先探测种子缓存，命中则跳过网络下载：

```
probeSeedCache(pluginId, version):
    for seedDir in getPluginSeedDirs():
        seedPath = getVersionedCachePathIn(seedDir, pluginId, version)
        if exists(seedPath): return seedPath
    return null
```

这个设计让离线环境和 CI/CD 场景的插件加载从数十秒降到毫秒级。

### 14.2.2 插件加载算法：分层设置与策略守卫

插件的启用/禁用遵循一个**分层设置级联**（Layered Settings Cascade）算法。每个插件的最终状态由多层设置源按优先级叠加决定：

```
优先级（从低到高）:
  0. addDir    (--add-dir 目录，会话级)
  1. managed   (policySettings，企业策略，不可编辑)
  2. user      (userSettings，用户全局)
  3. project   (projectSettings，项目级)
  4. local     (localSettings，本地覆盖)
  5. flag      (flagSettings，会话参数)
```

`getPluginEditableScopes` 函数实现了这个级联：

```
getPluginEditableScopes():
    result = Map<pluginId, scope>

    // 先处理 addDir（最低优先级）
    for [pluginId, value] in addDirPlugins:
        if value == true:  result.set(pluginId, 'flag')
        if value == false: result.delete(pluginId)

    // 按优先级升序处理各源
    for { scope, source } in [managed, user, project, local, flag]:
        for [pluginId, value] in getSettingsForSource(source).enabledPlugins:
            if value == true:  result.set(pluginId, scope)
            if value == false: result.delete(pluginId)

    return result
```

高优先级源的 `false` 可以**否决**低优先级源的 `true`。这使得一个项目级启用的插件可以被用户本地禁用（`local` 覆盖 `project`），而企业策略的禁用则无法被任何用户操作覆盖。

#### 策略守卫算法

安全策略通过 `isPluginBlockedByPolicy` 实现了一个极简但强效的守卫：

```
isPluginBlockedByPolicy(pluginId):
    policyEnabled = getSettingsForSource('policySettings')?.enabledPlugins
    return policyEnabled?.[pluginId] === false
```

这个检查被嵌入到安装（`installPluginOp`）、启用（`setPluginEnabledOp`）和加载（`loadAllPlugins`）三个关键路径中，形成三重防线。

### 14.2.3 技能匹配算法：从声明到执行的完整管线

技能（Skill）是 Claude Code 中"模型可调用的扩展能力"的核心抽象。一个技能本质上是一个 Markdown 文件加上元数据声明。技能匹配算法决定了"用户的请求应该触发哪个技能"。

#### 技能发现：四层来源的并行扫描

```
getCommands(cwd):
    allCommands = await loadAllCommands(cwd)
    dynamicSkills = getDynamicSkills()

    // 过滤出满足可用性和启用条件的命令
    baseCommands = allCommands.filter(
        cmd => meetsAvailabilityRequirement(cmd) && isCommandEnabled(cmd)
    )

    // 去重后插入动态技能
    uniqueDynamicSkills = dynamicSkills.filter(
        s => !baseCommandNames.has(s.name) && meets... && isEnabled...
    )

    // 插入位置: 在插件技能之后, 内置命令之前
    insertIndex = baseCommands.findIndex(c => builtInNames.has(c.name))
    return [...baseCommands[:insertIndex], ...uniqueDynamicSkills, ...baseCommands[insertIndex:]]
```

`loadAllCommands` 内部并行加载五类来源：

```
loadAllCommands(cwd):
    [skills, pluginCommands, workflowCommands] = await Promise.all([
        getSkills(cwd),           // 技能目录 + 插件技能 + 内置技能
        getPluginCommands(),      // 插件命令
        getWorkflowCommands(cwd)  // 工作流命令
    ])

    // 组装顺序决定了同名冲突时的优先级
    return [
        ...bundledSkills,         // 内置技能（最高优先级）
        ...builtinPluginSkills,   // 内置插件技能
        ...skillDirCommands,      // 目录技能
        ...workflowCommands,      // 工作流命令
        ...pluginCommands,        // 插件命令
        ...pluginSkills,          // 插件技能
        ...COMMANDS()             // 内置斜杠命令
    ]
```

#### 技能的前端元数据解析

每个 Markdown 技能文件通过 frontmatter 声明其元数据：

```yaml
---
name: deploy
description: Deploy the application to staging
when_to_use: When user asks to deploy or push to staging
allowed-tools: [Bash, Read]
argument-hint: <environment>
model: sonnet
context: fork
paths: ["src/deploy/**", "infra/**"]
---
```

`parseSkillFrontmatterFields` 函数解析这些字段，其中 `when_to_use` 是关键的匹配线索——它被注入到系统提示词中，让模型在语义层面判断何时应该调用某个技能。

#### 条件技能的延迟激活算法

Claude Code 中有一类特殊的技能：**条件技能**（Conditional Skills）。它们声明了 `paths` 前置条件——只有当用户操作的文件匹配特定模式时才会被激活。这避免了将大量低频技能一次性加载到模型上下文中。

```
activateConditionalSkillsForPaths(filePaths, cwd):
    activated = []

    for [name, skill] in conditionalSkills:
        skillIgnore = ignore().add(skill.paths)  // gitignore 语法匹配
        for filePath in filePaths:
            relativePath = relative(cwd, filePath)
            if skillIgnore.ignores(relativePath):
                dynamicSkills.set(name, skill)     // 提升为动态技能
                conditionalSkills.delete(name)      // 从待激活集中移除
                activatedConditionalSkillNames.add(name)
                activated.push(name)
                break

    if activated.length > 0:
        skillsLoaded.emit()  // 通知缓存失效

    return activated
```

这个算法使用了 `ignore` 库（gitignore 语法），与 `CLAUDE.md` 的条件规则共享同一匹配行为。其精妙之处在于 `activatedConditionalSkillNames` 集合——它在缓存清理时仍然保留，确保一旦激活的技能在会话内始终可用。

#### 动态技能发现：沿目录树向上搜索

当用户操作某个文件时，系统会沿着文件路径向上搜索 `.claude/skills/` 目录：

```
discoverSkillDirsForPaths(filePaths, cwd):
    for filePath in filePaths:
        currentDir = dirname(filePath)
        // 从文件所在目录向上走，到 cwd（不含）为止
        while currentDir.startsWith(cwd + sep):
            skillDir = join(currentDir, '.claude', 'skills')
            if not dynamicSkillDirs.has(skillDir):
                dynamicSkillDirs.add(skillDir)  // 无论存在与否都记录，避免重复 stat
                if exists(skillDir) and not isGitignored(currentDir):
                    newDirs.push(skillDir)
            currentDir = dirname(currentDir)

    // 深度优先排序——越靠近文件的技能优先级越高
    return newDirs.sort((a, b) => depth(b) - depth(a))
```

注意 `dynamicSkillDirs` 集合的**否定缓存**设计——即使目录不存在，也会记录"已检查"状态。这避免了对同一不存在的路径反复执行 `stat` 系统调用，在大型项目中可以显著减少 I/O。

#### 技能文件热重载

`skillChangeDetector` 通过 chokidar 监控技能目录变化，实现了运行时热重载：

```
initialize():
    watcher = chokidar.watch(skillDirectories, {
        depth: 2,               // 技能使用 skill-name/SKILL.md 格式
        awaitWriteFinish: { stabilityThreshold: 1000ms },
        usePolling: isBun,      // Bun 的 fs.watch 有死锁 bug，降级为轮询
    })

handleChange(path):
    scheduleReload(path)        // 防抖聚合

scheduleReload(changedPath):
    pendingChangedPaths.add(changedPath)
    debounce(300ms, () => {
        paths = [...pendingChangedPaths]
        pendingChangedPaths.clear()
        // 先执行 ConfigChange 钩子（可阻止重载）
        results = await executeConfigChangeHooks('skills', paths[0])
        if hasBlockingResult(results): return
        clearSkillCaches()
        clearCommandsCache()
        skillsChanged.emit()
    })
```

300ms 的防抖窗口是经过调优的——太短则 git 操作触发的批量文件变更会引发数十次重载；太长则用户编辑技能文件后需要等待才能看到效果。

### 14.2.4 Memory 存储算法：结构化的持久记忆

Memory 系统赋予 Agent "跨会话记忆"的能力。Claude Code 的 Memory 不是简单的 key-value 存储，而是一个**分类索引 + 主题文件**的两层架构。

#### 内存分类学

所有记忆被约束到一个闭合的四类分类学中：

| 类型 | 含义 | 示例 |
|------|------|------|
| `user` | 用户角色、偏好、知识背景 | "用户是数据科学家，专注于可观测性" |
| `feedback` | 用户对工作方式的反馈 | "集成测试必须使用真实数据库" |
| `project` | 项目的目标、里程碑、决策 | "3月5日起冻结非关键合并" |
| `reference` | 外部系统的指针 | "Linear 项目 INGEST 追踪管道 bug" |

分类验证通过 `parseMemoryType` 实现，对无效值优雅降级：

```
parseMemoryType(raw):
    if typeof raw !== 'string': return undefined
    return MEMORY_TYPES.find(t => t === raw)  // 严格匹配
```

这个设计的核心洞察是：代码模式、架构、git 历史等信息是**可推导的**（通过 grep/git/CLAUDE.md 就能获得），不应该存储为记忆。只有那些**不可从当前项目状态推导**的信息才值得持久化。

#### 两层存储结构

```
~/.claude/projects/<slug>/memory/
├── MEMORY.md              # 索引层：每行一个链接，限200行/25KB
├── user_role.md           # 主题文件：带 frontmatter 的详细记忆
├── feedback_testing.md
├── project_deadline.md
└── logs/                  # KAIROS 模式下的追加日志
    └── 2026/03/2026-03-31.md
```

`MEMORY.md` 是索引层，会被自动加载到每次对话的系统提示词中。它有严格的大小限制：

```
truncateEntrypointContent(raw):
    MAX_LINES = 200
    MAX_BYTES = 25,000

    if lineCount <= MAX_LINES and byteCount <= MAX_BYTES:
        return raw  // 未超限

    // 先按行截断
    truncated = lines[:MAX_LINES].join('\n')
    // 再按字节截断（在换行符处截断，避免断词）
    if truncated.length > MAX_BYTES:
        cutAt = truncated.lastIndexOf('\n', MAX_BYTES)
        truncated = truncated[:cutAt]

    // 附加警告信息
    return truncated + '\n\n> WARNING: MEMORY.md is ... Only part was loaded.'
```

双重限制（行数 + 字节数）的设计出自实际观察：有用户创建了单行超长的索引条目（一行数百个字符），仅靠行数限制无法阻止上下文膨胀。

#### 记忆新鲜度算法

每条记忆都有一个基于文件修改时间的新鲜度标签：

```
memoryAgeDays(mtimeMs):
    return max(0, floor((Date.now() - mtimeMs) / 86_400_000))

memoryFreshnessText(mtimeMs):
    days = memoryAgeDays(mtimeMs)
    if days <= 1: return ''  // 今天/昨天的不加警告
    return '该记忆已有 {days} 天。记忆是时间点观察，而非实时状态。
            关于代码行为或文件位置的引用可能已过时。
            在将其作为事实断言前，请对照当前代码验证。'
```

这个设计源于用户报告：模型会将陈旧的记忆（比如已重命名的函数）当作当前事实引用。新鲜度标签迫使模型在使用旧记忆前先验证。

### 14.2.5 Memory 检索算法：LLM 驱动的语义选择

Memory 检索不使用传统的向量数据库，而是采用了一种**LLM 驱动的两阶段检索**算法。

**第一阶段：目录扫描与头部提取**

```
scanMemoryFiles(memoryDir, signal):
    entries = readdir(memoryDir, { recursive: true })
    mdFiles = entries.filter(f => f.endsWith('.md') && f !== 'MEMORY.md')

    // 单趟扫描：读取 frontmatter 时顺带获取 mtime
    headers = await Promise.allSettled(
        mdFiles.map(async f => {
            { content, mtimeMs } = await readFileInRange(f, 0, 30_lines)
            { frontmatter } = parseFrontmatter(content)
            return { filename, filePath, mtimeMs, description, type }
        })
    )

    // 按修改时间降序排列，取前200条
    return headers
        .filter(fulfilled)
        .sort((a, b) => b.mtimeMs - a.mtimeMs)
        .slice(0, 200)
```

注意这里的 **single-pass 优化**：`readFileInRange` 在读取文件内容时内部执行 `stat` 获取 `mtimeMs`。对于常见的 N ≤ 200 场景，这比"先 stat 排序再读取"减少了一半的系统调用。

**第二阶段：LLM 语义选择**

```
findRelevantMemories(query, memoryDir, signal, recentTools):
    memories = await scanMemoryFiles(memoryDir, signal)
    manifest = formatMemoryManifest(memories)
    // 格式: "- [type] filename (ISO timestamp): description"

    // 调用 Sonnet 模型进行语义选择
    result = await sideQuery({
        model: defaultSonnetModel,
        system: SELECT_MEMORIES_SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: `Query: ${query}\n\nAvailable memories:\n${manifest}
                      \n\nRecently used tools: ${recentTools.join(', ')}`
        }],
        max_tokens: 256,
        output_format: json_schema({
            selected_memories: string[]  // 返回文件名列表
        })
    })

    // 严格验证返回值
    selected = parsed.selected_memories.filter(f => validFilenames.has(f))
    return selected.map(m => ({ path: m.filePath, mtimeMs: m.mtimeMs }))
```

这个算法的几个精妙设计值得特别关注：

1. **工具感知过滤**：如果用户正在使用某个 MCP 工具（如 `mcp__X__spawn`），系统会在提示中列出 `recentTools`，让选择器跳过该工具的 API 文档类记忆。但会保留关于该工具的"陷阱/已知问题"类记忆——正在使用时恰好是最需要这类警告的时候。

2. **已展示过滤**：`alreadySurfaced` 参数过滤了之前对话轮次中已经展示过的记忆，确保 5 个名额用在新的候选上。

3. **结构化输出**：使用 JSON Schema 约束模型输出格式（`output_format: json_schema`），再用 `validFilenames.has(f)` 进行严格验证，防止模型幻觉产生不存在的文件名。

#### 记忆提取算法

记忆不仅可以被检索，还会被自动提取。在每次查询循环结束时（模型产生最终回复、无工具调用），`extractMemories` 模块会运行一个**分叉代理**（Forked Agent），它共享主对话的提示缓存（prompt cache），审查对话记录并决定是否需要保存新的记忆。

```
extractMemories (伪代码):
    // 只在完整查询循环结束时运行
    memories = await scanMemoryFiles(autoMemDir, signal)
    manifest = formatMemoryManifest(memories)

    // 使用 forked agent —— 共享主对话的 prompt cache
    await runForkedAgent({
        system: buildExtractPrompt(manifest),
        messages: conversationHistory,
        allowedTools: [FileRead, FileWrite, FileEdit, Grep, Glob]
    })
```

分叉代理模式的优势在于：它"看到"完整的对话上下文（包括所有 prompt cache），因此能准确判断哪些信息值得持久化，同时又不会干扰主对话流。

### 14.2.6 命令注册与分发：大规模命令的组织算法

Claude Code 管理着数十个内置斜杠命令，加上插件命令、技能命令、工作流命令，总数可达上百个。如何组织这些命令？

#### 静态命令表 + 动态扩展

核心设计是一个**惰性初始化的静态命令表**与多个**动态扩展源**的组合：

```typescript
// 静态命令表 —— memoize 确保只初始化一次
const COMMANDS = memoize((): Command[] => [
    addDir, agents, branch, chrome, clear, color, compact,
    config, copy, desktop, context, cost, diff, doctor,
    effort, exit, fast, files, help, ide, init, keybindings,
    mcp, memory, model, plugin, resume, session, skills,
    status, tasks, vim, ...
    // 条件编译的命令
    ...(bridge ? [bridge] : []),
    ...(voiceCommand ? [voiceCommand] : []),
    // 内部命令（仅内部构建包含）
    ...(isInternal ? INTERNAL_ONLY_COMMANDS : []),
])
```

动态源通过 `loadAllCommands` 并行加载后与静态表合并。合并顺序即优先级：bundledSkills > builtinPluginSkills > skillDirCommands > workflowCommands > pluginCommands > pluginSkills > COMMANDS()。

#### 可用性过滤

每个命令可以声明 `availability` 约束：

```
meetsAvailabilityRequirement(cmd):
    if not cmd.availability: return true  // 默认所有人可用
    for requirement in cmd.availability:
        switch requirement:
            'claude-ai': if isClaudeAISubscriber(): return true
            'console':   if isDirectAPIUser(): return true
    return false
```

这个过滤器**不被 memoize**——因为认证状态可能在会话中改变（如执行 `/login` 后），必须每次调用时重新评估。

### 14.2.7 开放-封闭原则的算法实践

回顾 Claude Code 扩展架构的全貌，可以提炼出几个关键的设计模式：

**模式一：声明式注册，延迟加载。** 无论是插件（`enabledPlugins` in settings）、技能（`SKILL.md` frontmatter）还是记忆（`MEMORY.md` 索引），都采用声明-物化分离。声明廉价且可靠，物化可以延迟、重试或跳过。

**模式二：分层优先级级联。** 从设置系统的 6 层优先级，到命令合并时的来源顺序，到技能发现时的目录深度排序——统一的优先级语义让冲突解决具有确定性。

**模式三：否定缓存。** `dynamicSkillDirs` 记录"已检查过的路径"（无论存在与否），`memoize` 缓存加载结果——减少重复 I/O 的同时，通过 `clearAllCaches()` 提供显式失效手段。

**模式四：钩子守卫点。** 在每个关键路径（安装、启用、加载、热重载）上嵌入策略检查点（`isPluginBlockedByPolicy`、`executeConfigChangeHooks`），让管控能力不依赖于具体的扩展实现。

---

## 14.3 架构图解

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Claude Code 扩展性架构                          │
│                                                                     │
│  ┌─────────────────────── 命令分发层 ────────────────────────────┐  │
│  │  getCommands(cwd) → 合并 + 可用性过滤 + isEnabled 过滤       │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │  │
│  │  │ 内置 │ │ 技能 │ │ 插件 │ │ 动态 │ │ 工作 │ │ MCP  │     │  │
│  │  │ 命令 │ │ 目录 │ │ 命令 │ │ 技能 │ │ 流   │ │ 技能 │     │  │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘     │  │
│  └─────┼────────┼────────┼────────┼────────┼────────┼──────────┘  │
│        │        │        │        │        │        │              │
│  ┌─────┼────────┼────────┼────────┼────────┼────────┼──────────┐  │
│  │     │  技能框架 (loadSkillsDir + bundledSkills)   │          │  │
│  │     │                                             │          │  │
│  │  ┌──┴───────────────────┐  ┌──────────────────────┴──────┐   │  │
│  │  │ SKILL.md frontmatter │  │ 条件技能 (paths匹配)        │   │  │
│  │  │ • description        │  │ • activateConditionalSkills  │   │  │
│  │  │ • when_to_use        │  │ • discoverSkillDirsForPaths  │   │  │
│  │  │ • allowed-tools      │  │ • skillChangeDetector(热重载)│   │  │
│  │  └──────────────────────┘  └─────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────── 插件系统 ─────────────────────────────────────┐  │
│  │  loadAllPlugins → assemblePluginLoadResult                    │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌───────────┐  ┌───────────────────────┐  │  │
│  │  │ Marketplace │  │  Session   │  │   Builtin Plugins     │  │  │
│  │  │ (git/npm)   │  │(--plugin- │  │  (compiled-in)        │  │  │
│  │  │             │  │  dir/SDK)  │  │                       │  │  │
│  │  └──────┬──────┘  └─────┬─────┘  └───────────┬───────────┘  │  │
│  │         │               │                     │              │  │
│  │         └───────┬───────┘                     │              │  │
│  │     mergePluginSources ──────────────────────┘               │  │
│  │         │                                                    │  │
│  │     verifyAndDemote (依赖检查)                               │  │
│  │         │                                                    │  │
│  │  ┌──────┴──────────────────────────────────────────────────┐ │  │
│  │  │  设置级联: policy > local > project > user > addDir     │ │  │
│  │  │  策略守卫: isPluginBlockedByPolicy                      │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────── Memory 系统 ──────────────────────────────────┐  │
│  │                                                               │  │
│  │  ┌──────────────┐     ┌──────────────────────────────────┐   │  │
│  │  │  MEMORY.md   │     │  主题文件 (*.md with frontmatter) │   │  │
│  │  │  (索引层)    │     │  user / feedback / project / ref  │   │  │
│  │  │  200行/25KB  │     │  + mtime 新鲜度标签              │   │  │
│  │  └──────┬───────┘     └──────────────┬───────────────────┘   │  │
│  │         │                             │                      │  │
│  │    系统提示词注入              scanMemoryFiles (头部提取)     │  │
│  │                                       │                      │  │
│  │                              findRelevantMemories            │  │
│  │                              (Sonnet sideQuery 语义选择)      │  │
│  │                                       │                      │  │
│  │                              extractMemories                 │  │
│  │                              (forked agent 自动提取)          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 14.4 源码印证

### 印证一：插件多源合并与依赖降级

源码位于 `pluginLoader.ts` 的 `assemblePluginLoadResult`：

```typescript
async function assemblePluginLoadResult(
  marketplaceLoader: () => Promise<{ plugins: LoadedPlugin[]; errors: PluginError[] }>,
): Promise<PluginLoadResult> {
  const inlinePlugins = getInlinePlugins()
  // 阶段1: 并行加载
  const [marketplaceResult, sessionResult] = await Promise.all([
    marketplaceLoader(),
    inlinePlugins.length > 0
      ? loadSessionOnlyPlugins(inlinePlugins)
      : Promise.resolve({ plugins: [], errors: [] }),
  ])
  const builtinResult = getBuiltinPlugins()

  // 阶段2: 多源合并（managed 插件不可被 session 覆盖）
  const { plugins: allPlugins, errors: mergeErrors } = mergePluginSources({
    session: sessionResult.plugins,
    marketplace: marketplaceResult.plugins,
    builtin: [...builtinResult.enabled, ...builtinResult.disabled],
    managedNames: getManagedPluginNames(),
  })

  // 阶段3: 依赖验证与降级（不需要拓扑排序，因为是存在性检查）
  const { demoted, errors: depErrors } = verifyAndDemote(allPlugins)
  for (const p of allPlugins) {
    if (demoted.has(p.source)) p.enabled = false
  }

  // 阶段4: 缓存供同步消费
  cachePluginSettings(enabledPlugins)
  return { enabled: enabledPlugins, disabled: ..., errors: allErrors }
}
```

### 印证二：条件技能的 gitignore 模式匹配

源码位于 `loadSkillsDir.ts` 的 `activateConditionalSkillsForPaths`：

```typescript
export function activateConditionalSkillsForPaths(
  filePaths: string[], cwd: string
): string[] {
  const activated: string[] = []

  for (const [name, skill] of conditionalSkills) {
    if (skill.type !== 'prompt' || !skill.paths?.length) continue

    const skillIgnore = ignore().add(skill.paths)
    for (const filePath of filePaths) {
      const relativePath = isAbsolute(filePath)
        ? relative(cwd, filePath) : filePath

      if (!relativePath || relativePath.startsWith('..') ||
          isAbsolute(relativePath)) continue

      if (skillIgnore.ignores(relativePath)) {
        dynamicSkills.set(name, skill)          // 提升
        conditionalSkills.delete(name)          // 移除
        activatedConditionalSkillNames.add(name) // 永久标记
        activated.push(name)
        break
      }
    }
  }

  if (activated.length > 0) skillsLoaded.emit()
  return activated
}
```

### 印证三：Memory 语义检索

源码位于 `findRelevantMemories.ts`：

```typescript
export async function findRelevantMemories(
  query: string, memoryDir: string, signal: AbortSignal,
  recentTools: readonly string[] = [],
  alreadySurfaced: ReadonlySet<string> = new Set(),
): Promise<RelevantMemory[]> {
  const memories = (await scanMemoryFiles(memoryDir, signal))
    .filter(m => !alreadySurfaced.has(m.filePath))
  if (memories.length === 0) return []

  const selectedFilenames = await selectRelevantMemories(
    query, memories, signal, recentTools
  )

  const byFilename = new Map(memories.map(m => [m.filename, m]))
  return selectedFilenames
    .map(filename => byFilename.get(filename))
    .filter((m): m is MemoryHeader => m !== undefined)
    .map(m => ({ path: m.filePath, mtimeMs: m.mtimeMs }))
}
```

其中 `selectRelevantMemories` 使用 `sideQuery` 调用 Sonnet 模型，传入格式化的记忆清单和用户查询，通过 JSON Schema 约束输出为文件名数组。

---

## 14.5 思考题

**思考题 1：声明-物化分离的权衡**

Claude Code 的插件安装采用"先写 settings，再缓存代码"的策略。如果 settings 写入成功但代码缓存失败，系统下次启动时会如何处理？这种设计相比"先缓存代码，成功后再写 settings"有何优劣？试分析两种方案在网络不稳定环境下的行为差异。

**思考题 2：条件技能的激活粒度**

当前的条件技能使用 gitignore 模式匹配文件路径。如果一个技能声明了 `paths: ["**/*.py"]`，它会在用户第一次操作任意 Python 文件时永久激活。这种"一次激活，终身有效"的策略可能导致上下文膨胀。请设计一种"按需激活、闲时回收"的改进方案，要求：(a) 不增加模型调用次数，(b) 不丢失正在使用中的技能。

**思考题 3：LLM 驱动检索 vs. 向量检索**

Claude Code 使用 LLM（Sonnet sideQuery）而非向量数据库来选择相关记忆。这个选择在记忆数量较少（< 200）时是合理的。如果记忆数量增长到 10,000 条，当前的 `scanMemoryFiles` + `sideQuery` 架构将面临什么瓶颈？请设计一种混合检索方案，使其在 10,000 条记忆规模下仍能在 500ms 内返回结果。

---

## 14.6 小结

本章深入剖析了 Claude Code 扩展性架构的三大子系统：

1. **插件系统**实现了多源声明式发现、分层设置级联和策略守卫，使插件的安装-启用-加载全链路在"对扩展开放"的同时保持"对修改封闭"和"对策略不可绕过"。

2. **技能框架**通过 frontmatter 声明式注册、条件激活、目录树动态发现和文件热重载，让新能力的添加只需要创建一个 Markdown 文件——无需修改任何代码。

3. **Memory 系统**采用分类索引 + 主题文件的两层架构，结合 LLM 驱动的语义检索和分叉代理自动提取，实现了跨会话的持久记忆。新鲜度标签和排除规则确保记忆质量不因时间推移而腐化。

这三个系统共享一组通用的算法范式：声明式注册与延迟加载、分层优先级级联、否定缓存与显式失效、钩子守卫点。这些模式不是 Claude Code 的发明——它们是软件工程中"开放-封闭原则"在 AI Agent 领域的自然延伸。

理解这些扩展性算法的价值不仅在于读懂 Claude Code 的代码，更在于认识到：**好的 Agent 架构必须为"未来的未知能力"预留接入点。** 那些今天不存在的工具、明天才会出现的协议、后天才被发明的工作流——一个设计良好的扩展框架让它们都能以最低成本接入系统。这才是扩展性架构的终极价值。
