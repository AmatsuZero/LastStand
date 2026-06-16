+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第2章 Agent 的骨架：对象模型"
tags = ["AI Agent", "Claude Code", "算法思想", "对象模型", "工具系统"]
categories = ["AI Agent", "Claude Code"]
weight = 4
+++
## 2.1 问题引入：如何让 Agent 拥有"手脚"

一个纯粹的大语言模型（LLM），无论多么聪明，都只是一颗"大脑"——它能思考、推理、生成文本，却无法触及真实世界。它读不了磁盘上的文件，执不了终端里的命令，搜不了代码库中的符号。要将这颗大脑变成一个真正能解决问题的 Agent，就必须为它接上"手脚"——一套能够操作外部世界的能力体系。

这套能力体系在 Claude Code 中被称为**工具（Tool）**。截至当前版本，Claude Code 内建了约 45 种工具，涵盖以下截然不同的能力域：

| 能力域 | 代表性工具 | 特征 |
|--------|-----------|------|
| 文件操作 | FileReadTool、FileEditTool、FileWriteTool | 输入为文件路径，输出为文件内容或操作状态 |
| Shell 执行 | BashTool、PowerShellTool | 输入为命令字符串，输出为标准输出流 |
| 代码搜索 | GrepTool、GlobTool | 输入为正则/通配模式，输出为匹配结果集 |
| 网络访问 | WebFetchTool、WebSearchTool | 输入为 URL 或查询词，输出为网页内容 |
| Agent 派生 | AgentTool | 输入为任务描述，输出为子 Agent 的执行结果 |
| 外部协议 | MCPTool | 输入完全由外部服务器定义，输出格式未知 |
| 用户交互 | AskUserQuestionTool | 输入为问题文本，输出取决于用户回答 |

问题的核心在于：这些工具的输入结构不同（有的是文件路径，有的是 Shell 命令，有的是完全开放的 JSON）、输出类型不同（有的返回纯文本，有的返回二进制图像，有的返回结构化对象）、执行语义不同（有的只读、有的破坏性写入、有的会派生出新的 Agent 循环）、安全要求不同（有的需要沙箱隔离，有的需要用户授权，有的可以自由执行）。

然而，从调用方——也就是 Agent 主循环——的视角来看，它不关心这些差异。主循环的逻辑永远是：

```
收到 LLM 的工具调用请求 → 找到对应工具 → 验证输入 → 检查权限 → 执行 → 返回结果
```

这就是本章要探讨的核心设计问题：**如何构建一个统一的工具抽象，使得 45 种截然不同的能力共享同一套接口，让调用方的代码在工具数量翻倍时依然一行不改？**

## 2.2 算法思想：工具多态的四重设计

### 2.2.1 接口不变性原则

在软件工程中，接口不变性（Interface Invariance）是多态设计的基石。其核心命题是：

> **无论具体实现如何变化，调用方看到的契约永远不变。**

Claude Code 将所有工具统一为一个 `Tool` 接口。这个接口定义了工具必须提供的全部契约。我们用伪代码来呈现其核心骨架：

```
接口 Tool<Input, Output, Progress>:
    // ===== 身份标识 =====
    name: 字符串                      // 工具的唯一标识
    aliases: 字符串列表               // 旧名称别名，向后兼容
    searchHint: 字符串                // 关键词提示，用于工具搜索

    // ===== Schema 自描述 =====
    inputSchema: Schema<Input>        // 输入参数的结构定义
    outputSchema: Schema<Output>      // 输出结果的结构定义
    description(): 字符串             // 告诉 LLM 自己能做什么
    prompt(): 字符串                  // 详细的使用说明

    // ===== 生命周期判断 =====
    isEnabled(): 布尔                 // 当前环境下是否可用
    validateInput(input): 验证结果    // 输入合法性前置检查
    checkPermissions(input, ctx): 权限结果  // 是否需要用户授权

    // ===== 核心执行 =====
    call(input, context, ...): 工具结果<Output>

    // ===== 元信息查询 =====
    isReadOnly(input): 布尔           // 是否只读
    isDestructive(input): 布尔        // 是否破坏性
    isConcurrencySafe(input): 布尔    // 是否可以并发执行
    isSearchOrReadCommand(input): {...}  // 是否为搜索/读取类
```

这个接口有一个关键的设计选择：**所有方法的签名都是统一的**。无论是读取文件还是执行 Shell 命令，调用方看到的都是 `call(input, context)` → `ToolResult<Output>` 这同一个签名。输入和输出的具体类型由泛型参数 `<Input, Output>` 承载，差异被封装在接口之下。

### 2.2.2 Schema 驱动的自描述机制

Claude Code 面对的一个独特挑战是：工具的"调用方"不是人类程序员，而是一个大语言模型。LLM 需要知道每个工具接受什么参数、参数的语义是什么、在什么场景下该使用哪个工具。这就要求工具必须能够**自描述**——自己告诉 LLM 自己能做什么。

Claude Code 采用了 **Schema 驱动**的自描述机制，每个工具通过三个层次来描述自己：

**第一层：输入 Schema（inputSchema）**

这是工具的参数结构定义。以 `FileReadTool` 为例：

```
FileReadTool.inputSchema = {
    file_path: 字符串  // "要读取的文件的绝对路径"
    offset:    整数?   // "从第几行开始读。仅在文件太大时使用"
    limit:     整数?   // "读取多少行。仅在文件太大时使用"
    pages:     字符串?  // "PDF 页码范围，如 '1-5'、'3'、'10-20'"
}
```

而 `GrepTool` 的 inputSchema 则完全不同：

```
GrepTool.inputSchema = {
    pattern:     字符串     // "要搜索的正则表达式"
    path:        字符串?    // "搜索路径，默认为当前目录"
    glob:        字符串?    // "文件过滤模式，如 '*.js'"
    output_mode: 枚举?      // "content" | "files_with_matches" | "count"
    head_limit:  整数?      // "限制输出前 N 条"
    ...
}
```

每个参数都携带 `describe()` 描述信息，这些描述会被序列化为 JSON Schema 发送给 LLM，使 LLM 能准确理解每个参数的语义和使用场景。

**第二层：描述与提示（description / prompt）**

`description()` 返回一句话概述工具的能力。`prompt()` 返回详细的使用指南，包括使用规范、注意事项、示例等。这两个方法都是**异步的**，因为它们的内容可能需要根据当前环境动态生成。例如，`AgentTool` 的 prompt 会根据当前可用的子 Agent 类型列表动态拼接。

**第三层：搜索提示（searchHint）**

当工具数量超过阈值时，Claude Code 会启用"工具搜索"机制（ToolSearch），将部分工具延迟加载。此时 `searchHint` 提供关键词摘要，帮助 LLM 在需要时通过关键词搜索找到合适的工具。例如：

```
FileReadTool.searchHint = "read files, images, PDFs, notebooks"
GrepTool.searchHint    = "search file contents with regex (ripgrep)"
```

这三层自描述机制构成了一个完整的"工具发现协议"：LLM 先通过 inputSchema 和 description 理解工具的能力边界，通过 prompt 学习使用规范，在工具数量庞大时通过 searchHint 定位所需工具。整个过程中，**工具自己告诉模型自己的一切**，系统不需要为每个工具硬编码任何调用逻辑。

### 2.2.3 多态分发算法

当 LLM 决定调用一个工具时，它会发送一个包含工具名称和参数的 JSON 块。Agent 主循环需要根据这个名称找到对应的工具实现并执行。这个过程本质上是一个**多态分发**——同一个调用入口，根据名称路由到不同的实现。

Claude Code 的分发算法简洁而高效，其核心逻辑如下：

```
函数 findToolByName(tools: 工具列表, name: 字符串) -> 工具:
    对于 tools 中的每个 tool:
        如果 tool.name == name:
            返回 tool
        如果 name 在 tool.aliases 中:
            返回 tool
    返回 未找到
```

这里有一个值得注意的设计：**别名（aliases）机制**。当一个工具被重命名时（例如 `Task` 更名为 `Agent`），旧名称会被保留为别名。这意味着旧版客户端发送的 `Task` 调用请求仍然能路由到正确的实现，而不需要对 LLM 的已有对话历史做任何迁移。这是一个在持续演进的系统中极其重要的向后兼容策略。

工具的注册则通过一个中心化的注册表完成。伪代码如下：

```
函数 getAllBaseTools() -> 工具列表:
    返回 [
        AgentTool,
        BashTool,
        GlobTool,           // 如果未嵌入搜索工具
        GrepTool,           // 如果未嵌入搜索工具
        FileReadTool,
        FileEditTool,
        FileWriteTool,
        NotebookEditTool,
        WebFetchTool,
        WebSearchTool,
        ...                 // 根据环境变量和特性开关动态加入
        MCPTool 列表,       // 外部 MCP 服务提供的工具
    ]
```

注册表的组装包含大量的条件判断——某些工具只在特定平台可用（如 PowerShellTool 仅在 Windows 上），某些工具依赖功能开关（feature flags），某些工具需要特定的用户类型。这些条件判断全部集中在注册阶段，而不是散落在调用链路上。这种"在入口处过滤，在内部假定一切可用"的模式，大幅简化了下游逻辑。

完整的工具池组装流程如下：

```
函数 assembleToolPool(权限上下文, MCP工具列表) -> 工具列表:
    内建工具 = getTools(权限上下文)    // 获取内建工具并按权限过滤
    MCP工具 = filterToolsByDenyRules(MCP工具列表, 权限上下文)

    // 两组分别排序，内建优先，按名称去重
    返回 去重合并(
        排序(内建工具, 按名称),
        排序(MCP工具, 按名称)
    )
```

这里的排序和分区策略不仅仅是为了美观——它服务于**提示缓存（Prompt Cache）的稳定性**。Anthropic API 支持缓存系统提示中的工具定义，缓存的有效性取决于内容的逐字节稳定。如果工具列表的顺序因为某个 MCP 服务器的上下线而改变，就会导致缓存失效，浪费大量 token。因此，Claude Code 将内建工具和 MCP 工具分为两个稳定的区段，每个区段内部按名称排序，确保工具池的序列化结果在绝大多数情况下保持不变。

### 2.2.4 工具生命周期：从发现到执行的完整链路

一个工具调用从发起到完成，经历以下关键生命周期阶段：

```
┌─────────────┐
│ 1. 发现阶段  │  isEnabled() → 过滤出当前环境可用的工具
│             │  description/prompt → 序列化为 LLM 能理解的工具定义
└──────┬──────┘
       ↓
┌─────────────┐
│ 2. 选择阶段  │  LLM 根据工具定义选择要调用的工具
│             │  findToolByName() → 多态分发定位具体实现
└──────┬──────┘
       ↓
┌─────────────┐
│ 3. 验证阶段  │  validateInput() → 前置合法性检查
│             │  （路径是否存在、参数是否合规、是否命中拒绝规则）
└──────┬──────┘
       ↓
┌─────────────┐
│ 4. 授权阶段  │  checkPermissions() → 工具级别权限检查
│             │  （是否需要用户确认、是否被规则拒绝、是否在沙箱中）
└──────┬──────┘
       ↓
┌─────────────┐
│ 5. 执行阶段  │  call() → 实际执行工具逻辑
│             │  onProgress() → 流式报告执行进度
└──────┬──────┘
       ↓
┌─────────────┐
│ 6. 结果序列化│  mapToolResultToToolResultBlockParam()
│             │  → 将异构输出转换为 LLM 能消费的标准格式
└─────────────┘
```

让我们深入几个关键阶段的设计思想。

**isEnabled()：动态启停**

`isEnabled()` 不接受任何参数，返回一个布尔值。它在工具池组装阶段被调用，决定工具是否对 LLM 可见。这个方法的判断依据通常是环境级别的——操作系统、用户类型、功能开关等。被禁用的工具不会出现在 LLM 的工具列表中，LLM 根本不知道它们的存在。

```
函数 getTools(权限上下文) -> 工具列表:
    所有工具 = getAllBaseTools()
    允许的工具 = filterToolsByDenyRules(所有工具, 权限上下文)
    启用状态 = [tool.isEnabled() 对于 允许的工具 中的每个 tool]
    返回 允许的工具.filter(按启用状态过滤)
```

**validateInput()：面向 LLM 的错误报告**

`validateInput()` 是一个可选的前置检查，在权限检查之前执行。它的特殊之处在于：验证失败时返回的错误消息会**直接发送给 LLM**，而不是给用户看。因此，这些消息需要足够清晰，让 LLM 能理解错误原因并自我修正。例如，FileReadTool 的验证会在文件路径指向设备文件时返回：

```
"Cannot read '/dev/random': this device file would block or produce infinite output."
```

这句话对 LLM 来说信息量充足：它理解了失败原因（设备文件），知道了约束（会阻塞或产生无限输出），可以据此调整策略。

**checkPermissions()：分层权限模型**

权限检查是工具系统中安全性最关键的一环。Claude Code 采用了分层权限模型：

```
函数 checkPermissions(input, context) -> 权限结果:
    // 可能的返回值：
    // { behavior: "allow" }       → 直接放行
    // { behavior: "deny" }        → 静默拒绝
    // { behavior: "ask" }         → 需要用户确认
    // { behavior: "passthrough" } → 交给通用权限系统
```

每个工具可以覆盖这个方法来实现工具特有的权限逻辑。例如，`BashTool` 有极其复杂的权限检查——它需要解析 Shell 命令的 AST，判断命令是否安全，是否涉及破坏性操作，是否在沙箱中运行。而 `FileReadTool` 的权限检查则相对简单——主要是检查文件路径是否在允许的目录范围内。`MCPTool` 则直接返回 `passthrough`，将权限判断完全交给通用权限系统。

这种设计体现了一个重要原则：**通用逻辑上提，特殊逻辑下沉**。通用的权限框架（规则匹配、用户交互、拒绝追踪）由系统统一提供，每个工具只需要关注自己独有的安全约束。

## 2.3 架构图解：工具体系的层次关系

Claude Code 的工具体系可以用以下层次结构来理解：

```
                    ┌────────────────────────────────┐
                    │          Tool 接口               │
                    │  name, inputSchema, call(),      │
                    │  isEnabled(), validateInput(),    │
                    │  checkPermissions(), prompt()     │
                    └──────────────┬─────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
    ┌───────┴───────┐    ┌────────┴────────┐    ┌────────┴────────┐
    │  原子工具层    │    │   复合工具层     │    │   协议桥接层     │
    │               │    │                 │    │                 │
    │ FileReadTool  │    │  AgentTool      │    │  MCPTool        │
    │ FileEditTool  │    │  SkillTool      │    │  LSPTool        │
    │ FileWriteTool │    │                 │    │                 │
    │ BashTool      │    │（调用子 Agent    │    │（桥接外部协议    │
    │ GrepTool      │    │  循环或执行      │    │  的通用适配器）   │
    │ GlobTool      │    │  命令管道）      │    │                 │
    │ WebFetchTool  │    │                 │    │                 │
    └───────────────┘    └─────────────────┘    └─────────────────┘
```

**原子工具层**执行单一的具体操作，是 Agent 与外部世界交互的最小单位。它们的 `call()` 方法实现明确而直接：读文件就是读文件，执行命令就是执行命令。

**复合工具层**不直接操作外部世界，而是通过编排其他工具来完成复杂任务。`AgentTool` 是其中最典型的代表——它的 `call()` 方法会启动一个完整的子 Agent 循环，这个子 Agent 拥有自己的工具集、对话历史和执行上下文。也就是说，`AgentTool` 的执行是**递归的**：一个 Agent 通过调用 AgentTool 派生出另一个 Agent，后者又可能调用 AgentTool 派生出更深层的 Agent。

**协议桥接层**将外部协议的工具适配为内部的 Tool 接口。`MCPTool` 是一个特殊的存在——它不是某一个具体工具的实现，而是一个**模板**。每当一个 MCP 服务器连接时，系统会基于 MCPTool 的模板为该服务器提供的每个工具创建一个 Tool 实例，动态覆盖 `name`、`description`、`inputSchema`、`call()` 等方法。这意味着一个 MCP 服务器可以在运行时为系统注入任意数量的新工具，而主循环的代码完全不需要改变。

### buildTool：默认值填充的工厂函数

Claude Code 提供了一个 `buildTool` 工厂函数来简化工具的定义。其核心思想是**约定优于配置**：

```
函数 buildTool(定义) -> 完整的 Tool:
    默认值 = {
        isEnabled:          () => true,            // 默认启用
        isConcurrencySafe:  () => false,           // 默认不可并发（安全保守）
        isReadOnly:         () => false,           // 默认有写操作（安全保守）
        isDestructive:      () => false,           // 默认非破坏性
        checkPermissions:   () => { allow },       // 默认放行
        toAutoClassifierInput: () => '',           // 默认不参与安全分类
        userFacingName:     () => 定义.name,       // 默认用工具名称
    }
    返回 { ...默认值, userFacingName: () => 定义.name, ...定义 }
```

注意默认值的设计哲学——**安全相关的默认值总是保守的**：

- `isConcurrencySafe` 默认 `false`——假定工具不能并发执行，避免潜在的竞态条件。
- `isReadOnly` 默认 `false`——假定工具会写入数据，确保权限系统会参与检查。
- `isDestructive` 默认 `false`——这看似"不保守"，但实际上对 LLM 的行为引导是正确的：大多数工具确实不是破坏性的，只有 delete、overwrite 等明确的破坏性操作才需要标记。

这种"fail-closed"的默认值策略确保了：即使开发者忘记实现某个方法，系统也不会因此放松安全约束。

## 2.4 源码印证：四种典型工具的设计差异

让我们通过四种典型工具的实现，来印证上述设计思想在真实代码中的体现。

### 2.4.1 FileReadTool——原子只读工具的标杆

FileReadTool 是最"规矩"的工具之一，它完整展示了一个原子工具应有的实现模式。

```
FileReadTool = buildTool({
    name: "Read",
    searchHint: "read files, images, PDFs, notebooks",
    maxResultSizeChars: Infinity,   // 读取结果不持久化（避免循环读取）

    inputSchema: {
        file_path: 字符串,
        offset: 可选整数,
        limit: 可选整数,
        pages: 可选字符串
    },

    // 元信息——明确声明只读、可并发
    isConcurrencySafe: () => true,
    isReadOnly: () => true,

    // 输入验证——在权限检查之前、不做 I/O
    validateInput({ file_path, pages }):
        如果 pages 格式非法: 返回错误("Invalid pages parameter")
        如果 file_path 指向设备文件: 返回错误("would block or produce infinite output")
        如果 file_path 是二进制文件: 返回错误("cannot read binary files")
        返回 通过

    // 权限检查——委托给文件系统权限模块
    checkPermissions(input, context):
        返回 checkReadPermissionForTool(FileReadTool, input, ...)

    // 核心执行——根据文件类型分派
    call({ file_path, offset, limit, pages }, context):
        如果是 notebook: 读取并解析 notebook
        如果是 image: 读取并压缩图片（控制 token 消耗）
        如果是 PDF: 读取或提取页面
        否则: 按行范围读取文本文件

    // 结果序列化——将异构输出统一为 API 格式
    mapToolResultToToolResultBlockParam(data, toolUseID):
        匹配 data.type:
            "image"  → 图像 Base64 块
            "pdf"    → PDF 文档块
            "text"   → 带行号的文本内容
            ...
})
```

FileReadTool 的几个设计亮点值得关注：

1. **`maxResultSizeChars: Infinity`**——普通工具的输出超过阈值时会被持久化到文件，但 FileReadTool 的输出永远不持久化。原因是：如果 FileReadTool 的结果被存到文件 X，LLM 可能会再次调用 FileReadTool 去读 X，形成无限循环。

2. **`validateInput` 不做 I/O**——所有的检查都是基于路径字符串的纯计算（扩展名判断、设备路径黑名单、正则匹配），不触及文件系统。真正的 I/O 操作（如文件是否存在）延迟到 `call()` 阶段，在用户授权之后才执行。这是一个安全设计：避免在用户授权之前触发 NTLM 凭证泄漏等攻击。

3. **输出去重**——如果同一文件已经在上下文中被读取过且未修改，`call()` 会返回 `file_unchanged` 存根而非完整内容。这避免了重复的 cache_creation token 消耗。

### 2.4.2 BashTool——安全约束最复杂的工具

BashTool 是整个工具体系中权限逻辑最复杂的工具。它的输入是一个任意 Shell 命令字符串，这意味着安全校验的负担巨大。

BashTool 的独特之处在于其权限检查模块（`bashPermissions`）需要完成以下工作：

```
BashTool.checkPermissions(input, context):
    // 1. 解析 Shell 命令的 AST
    ast = parseCommandAST(input.command)

    // 2. 逐节点检查安全语义
    对于 ast 中的每个命令节点:
        检查是否为已知安全命令（ls, cat, echo...）
        检查是否涉及文件写入（重定向 >, >> 等）
        检查是否涉及网络操作（curl, wget...）
        检查路径是否在允许范围内

    // 3. 匹配权限规则
    对于每条用户配置的权限规则:
        如果命令匹配 "allow" 规则: 放行
        如果命令匹配 "deny" 规则: 拒绝
        如果命令匹配 "ask" 规则: 请求用户确认

    // 4. 沙箱决策
    如果需要沙箱: 返回 { behavior: "allow", 使用沙箱 }

    // 5. 安全分类器（可选）
    如果启用了 AI 分类器:
        分类结果 = classifyBashCommand(input.command)
        根据分类结果决定 allow/deny/ask
```

BashTool 还有一个独特的 `preparePermissionMatcher` 方法，用于支持 Hook 系统中的模式匹配。例如，用户可以配置 `Bash(git *)` 规则来允许所有 git 命令，这需要 BashTool 提供一个将输入命令与通配符模式匹配的函数。

### 2.4.3 AgentTool——递归的工具

AgentTool 是工具体系中最特殊的存在。它不执行任何具体操作，而是**启动一个全新的 Agent 循环**。

```
AgentTool.call({ prompt, subagent_type, ... }, context):
    // 1. 解析 Agent 类型定义
    agentDef = 查找 subagent_type 对应的 Agent 定义

    // 2. 构建子 Agent 的工具集
    子工具集 = resolveAgentTools(agentDef, 父工具集)
    // 根据 Agent 定义中的 tools/disallowedTools 过滤

    // 3. 构建子 Agent 上下文
    子上下文 = createSubagentContext(context, {
        agentId: 生成新 ID,
        工具集: 子工具集,
        模型: agentDef.model 或 默认模型,
    })

    // 4. 启动子 Agent 循环（递归！）
    结果 = query(prompt, 子上下文)
    // query() 内部会调用 LLM → 工具调用 → 又可能调用 AgentTool

    // 5. 返回子 Agent 的最终回复
    返回 { data: 结果.最终回复 }
```

这种递归结构使得 Claude Code 可以实现**分层任务分解**：主 Agent 负责理解用户意图和总体规划，通过 AgentTool 将子任务委托给专门化的子 Agent。每个子 Agent 拥有独立的对话历史和工具集，避免了上下文污染。

AgentTool 的 `prompt()` 方法是所有工具中最长的，因为它需要教会 LLM 何时使用子 Agent、如何撰写有效的任务描述、如何处理并发和等待。这本身就是一个 prompt 工程的范例。

### 2.4.4 MCPTool——协议世界的万能适配器

MCPTool（Model Context Protocol Tool）代表了工具体系中最开放的一端。它是一个**模板**，在运行时被实例化为具体的外部工具。

```
MCPTool = buildTool({
    isMcp: true,
    name: "mcp",              // 占位名，运行时覆盖
    inputSchema: { 任意对象 },  // 完全开放，运行时覆盖

    call():                    // 占位实现，运行时覆盖
        返回空结果

    checkPermissions():
        返回 { behavior: "passthrough" }  // 交给通用权限系统
})
```

MCPTool 的每个字段几乎都标注了"运行时覆盖"。当一个 MCP 服务器连接时，`mcpClient.ts` 会为该服务器的每个工具克隆 MCPTool 模板，然后动态替换 `name`、`description`、`inputSchema`、`call()` 等方法。这使得任何遵循 MCP 协议的外部服务都能无缝集成到 Claude Code 的工具体系中，无需修改核心代码。

MCPTool 还有一个特殊属性——`inputJSONSchema`。与其他内建工具使用 Zod Schema 不同，MCP 工具的输入 Schema 来自外部服务器，格式为原始的 JSON Schema。系统在序列化工具定义时，会优先使用 `inputJSONSchema`（如果存在），否则将 Zod Schema 转换为 JSON Schema。这种双路径设计避免了 Zod ↔ JSON Schema 之间不必要的转换。

## 2.5 深入设计：隐含的设计决策

### 2.5.1 为什么不用继承而用鸭子类型？

在传统的面向对象设计中，45 种工具通常会被组织为一个类继承层次：

```
抽象类 BaseTool
    ├── ReadOnlyTool
    │     ├── FileReadTool
    │     ├── GrepTool
    │     └── GlobTool
    ├── WriteTool
    │     ├── FileEditTool
    │     └── FileWriteTool
    ├── ShellTool
    │     ├── BashTool
    │     └── PowerShellTool
    └── MetaTool
          ├── AgentTool
          └── SkillTool
```

但 Claude Code 没有使用类继承。所有工具都是**平坦的对象字面量**，通过 `buildTool()` 工厂函数构建，通过 `satisfies ToolDef` 类型约束来保证接口一致性。

这个选择背后有深刻的工程考量：

1. **组合优于继承**——工具的特性是正交的。一个工具可以同时是只读的、可并发的、支持搜索折叠的。这些特性的组合有 $2^n$ 种，用继承表达需要庞大的层次结构，而用接口方法（`isReadOnly()`、`isConcurrencySafe()`、`isSearchOrReadCommand()`）则只需要在每个工具上独立声明。

2. **输入感知的属性**——许多属性不是工具级别的常量，而是取决于输入内容。例如，BashTool 的 `isReadOnly()` 需要分析命令字符串才能判断——`ls` 是只读的，`rm` 不是。这意味着这些方法的签名是 `isReadOnly(input)` 而非无参的 `isReadOnly()`，继承层次无法直接表达这种输入敏感的多态。

3. **运行时组合**——MCPTool 需要在运行时动态"克隆加覆盖"来创建新工具实例。对象字面量 + 展开运算符天然支持这种模式，而类实例的运行时修改则需要更多的 hack。

### 2.5.2 并发安全标记的精妙用途

`isConcurrencySafe(input)` 这个看似简单的布尔方法，在 Agent 主循环中扮演着关键角色。当 LLM 在一个回合中发起多个工具调用时，主循环需要决定：这些调用能否并行执行？

```
如果 所有工具调用都标记为 concurrencySafe:
    并行执行所有调用
否则:
    只并行执行 concurrencySafe 的调用
    串行执行非 concurrencySafe 的调用
```

例如，多个 `FileReadTool` 调用可以安全地并行（它们只读文件），但多个 `FileEditTool` 调用必须串行（它们可能修改同一个文件）。`BashTool` 调用默认不可并发，因为 Shell 命令之间可能存在隐含的依赖关系。

这个标记还有一个被 `contextModifier` 增强的用法：非并发安全的工具可以通过返回 `contextModifier` 来修改后续工具调用的上下文。这使得工具之间可以传递状态——例如，一个改变工作目录的工具可以通过 `contextModifier` 将新目录传递给后续工具。

### 2.5.3 结果尺寸控制策略

每个工具都有一个 `maxResultSizeChars` 属性，控制工具输出的最大字符数。当输出超过这个阈值时，系统会将结果持久化到磁盘文件，并向 LLM 发送一个包含文件路径和内容摘要的替代结果。

```
GrepTool.maxResultSizeChars  = 20,000     // 搜索结果可以持久化
MCPTool.maxResultSizeChars   = 100,000    // MCP 输出阈值较高
FileReadTool.maxResultSizeChars = Infinity // 永不持久化（防循环）
```

这个机制解决了一个核心矛盾：工具输出可能极其庞大（例如搜索整个代码库），但 LLM 的上下文窗口是有限的。通过持久化机制，系统在保留完整输出（供后续查看）的同时，控制了上下文的 token 消耗。

## 2.6 思考题

**思考题 1：开放世界问题**

MCPTool 的输入 Schema 是 `z.object({}).passthrough()`——即接受任何 JSON 对象。这意味着系统在编译期无法对 MCP 工具的输入做任何类型检查。请思考：这种"开放世界"设计带来了哪些风险？Claude Code 通过什么机制来缓解这些风险？如果你来设计，会如何在开放性和安全性之间取得平衡？

**思考题 2：递归深度控制**

AgentTool 允许子 Agent 再次调用 AgentTool，形成递归。在理论上，这可以产生无限深度的 Agent 嵌套。请思考：这种递归需要什么样的终止条件？资源（token 预算、执行时间、内存）如何在父子 Agent 之间分配？如果子 Agent 进入死循环，系统如何检测和终止？

**思考题 3：新增工具的代价**

假设你需要为 Claude Code 添加一个新的 `DatabaseQueryTool`，允许 LLM 直接查询 SQL 数据库。请思考：在当前的工具接口框架下，你需要实现哪些方法？哪些方法可以使用 `buildTool` 的默认值？权限检查应该如何设计——是逐条 SQL 审查，还是按数据库/表级别授权？这个思考过程本身，就是理解 Tool 接口设计优劣的最佳方式。

## 2.7 小结

本章深入剖析了 Claude Code 的工具对象模型——一个将 45 种截然不同的能力统一为一个多态体系的设计方案。

其核心设计思想可以提炼为四个原则：

1. **接口不变性**——所有工具共享同一个 Tool 接口，调用方（Agent 主循环）的代码不因工具数量或种类的变化而改变。通过泛型参数 `<Input, Output>` 吸收差异，通过 `buildTool` 工厂函数填充安全保守的默认值。

2. **Schema 驱动的自描述**——工具通过 inputSchema + description + prompt 三层机制向 LLM 完整描述自己的能力、参数和使用规范，使 LLM 能够自主发现和正确使用工具，无需硬编码调用逻辑。

3. **分层安全模型**——validateInput（纯计算、无 I/O）→ checkPermissions（工具特有逻辑）→ 通用权限框架（规则匹配、用户交互）三级安全检查，通用逻辑上提，特殊逻辑下沉，默认值 fail-closed。

4. **三类工具的有机统一**——原子工具（直接操作）、复合工具（递归编排）、协议桥接工具（动态适配）虽然实现差异巨大，但在接口层面完全对齐，使得 Agent 循环可以无差别地调度它们。

这个设计的最深层价值在于：它将**"如何执行"的复杂性**封装在每个工具的实现内部，而将**"何时执行、是否执行、执行后怎么处理"的一致性**提升到接口层面。Agent 主循环因此获得了极大的简洁性——它不需要知道读文件和执行 Shell 命令有什么区别，它只需要遵循统一的发现-验证-授权-执行-序列化链路即可。

在下一章中，我们将深入 Agent 主循环本身——看它如何利用本章描述的工具接口，编排一个完整的"思考-行动-观察"循环。
