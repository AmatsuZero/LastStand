+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第15章：从算法到实践：构建你的 Agent"
tags = ["AI Agent", "Claude Code", "算法思想", "Agent 实践", "系统构建"]
categories = ["AI Agent", "Claude Code"]
+++
> "复杂系统从来不是一次性设计出来的，它是从一个可工作的简单系统逐步演化而来。"
> — John Gall，《系统学》

## 15.1 问题引入

经过前14章的深入分析，我们已经逐一拆解了 Claude Code 的每一个核心算法思想——从工具抽象到推理循环，从权限控制到多 Agent 协调，从 MCP 协议到钩子系统，从上下文压缩到容错重试。现在，一个自然的问题摆在面前：

**如果你要从零开始构建一个类似 Claude Code 的 Agent 系统，该怎么做？**

这不是一个简单的问题。Claude Code 的源码体量庞大，模块之间存在复杂的依赖关系。直接照搬源码既不现实也不明智。我们需要的是一张**路线图**——从最小可行系统出发，逐步叠加能力层，每一步都有清晰的目标和边界。

本章将给出这张路线图。我们将按照八个递进步骤，从一个仅有50行伪代码的最小循环，逐步演化为一个功能完整的 Agent 系统。每一步都会回顾前几章的核心算法，给出可执行的伪代码框架，并对照 Claude Code 的实际实现进行验证。

## 15.2 算法思想

### 15.2.1 Agent 系统的最小可行架构

任何 Agent 系统，无论多复杂，都可以归结为三个核心组件：

```
┌─────────────────────────────────────────┐
│              Agent 系统                  │
│                                         │
│  ┌───────────┐  ┌──────────┐  ┌──────┐ │
│  │ 推理循环   │←→│ 工具系统  │←→│ 权限  │ │
│  │ (大脑)    │  │ (双手)   │  │ 控制  │ │
│  └───────────┘  └──────────┘  └──────┘ │
│                                         │
└─────────────────────────────────────────┘
```

- **推理循环**是大脑，决定"做什么"和"何时停止"；
- **工具系统**是双手，提供"怎么做"的能力；
- **权限控制**是安全阀，确保"能不能做"。

Claude Code 的源码完美印证了这一划分。`query.ts` 中的 `queryLoop` 是推理循环，`Tool.ts` 定义了工具抽象，`permissions.ts` 实现了权限判定。三者紧密协作，但职责清晰分离。

我们的构建策略是**增量式**的：先让最小循环跑通，再逐层叠加。

### 15.2.2 第一步：设计推理循环

推理循环是 Agent 的心跳。回顾第4章的核心算法，其本质是一个**条件终止的迭代**：反复调用 LLM、执行工具、收集结果，直到 LLM 不再请求工具调用。

**伪代码框架：**

```python
class MinimalAgent:
    def __init__(self, model_client, tools):
        self.model = model_client
        self.tools = {t.name: t for t in tools}

    def run(self, user_message: str) -> str:
        messages = [{"role": "user", "content": user_message}]

        # 核心循环：调用LLM → 执行工具 → 反馈结果
        while True:
            # 1. 调用 LLM
            response = self.model.create(
                messages=messages,
                tools=self.get_tool_schemas()
            )

            # 2. 收集助手回复
            assistant_message = response.to_message()
            messages.append(assistant_message)

            # 3. 检查终止条件
            tool_calls = extract_tool_calls(response)
            if not tool_calls:
                # 没有工具调用 → 循环结束
                return extract_text(response)

            # 4. 执行工具并收集结果
            for tool_call in tool_calls:
                result = self.execute_tool(tool_call)
                messages.append({
                    "role": "user",
                    "content": [{
                        "type": "tool_result",
                        "tool_use_id": tool_call.id,
                        "content": result
                    }]
                })

    def execute_tool(self, tool_call):
        tool = self.tools.get(tool_call.name)
        if not tool:
            return f"Error: Unknown tool {tool_call.name}"
        return tool.call(tool_call.input)
```

这就是 Agent 的最小闭环。仅需约40行代码，你就拥有了一个可工作的 Agent。

**对应 Claude Code 源码：** 在 `query.ts` 的 `queryLoop` 函数中（第241行起），`while (true)` 循环实现了同样的逻辑，只是增加了大量的边缘处理——自动压缩、token 预算追踪、流式输出、错误恢复等。但骨架完全一致：调用 API → 检查是否有 tool_use → 执行工具 → 将结果送回 → 继续循环。

**关键设计决策：**
- 循环的终止条件是"LLM 不再发出 tool_use"，而非预设的步数限制（虽然实践中会加上步数上限作为兜底）；
- 消息数组是"只追加"的，这确保了 LLM 始终能看到完整的对话历史；
- 工具结果以 `tool_result` 类型回传，而非普通文本，这让 LLM 能区分用户输入和工具反馈。

### 15.2.3 第二步：构建工具抽象层

有了循环骨架，下一步是让工具系统具备可扩展性。回顾第2章和第5章的设计思想，核心是**统一的工具接口**和**注册发现机制**。

**伪代码框架：**

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class ToolResult:
    """统一的工具返回结构"""
    content: str                  # 返回给 LLM 的文本
    is_error: bool = False        # 是否为错误
    side_effects: list = None     # 附加的消息或上下文变更

class BaseTool(ABC):
    """工具抽象基类"""

    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def input_schema(self) -> dict: ...

    @abstractmethod
    def call(self, input: dict, context: ToolContext) -> ToolResult: ...

    def is_read_only(self, input: dict) -> bool:
        """是否为只读操作，决定能否并发执行"""
        return False

    def is_enabled(self) -> bool:
        """动态启用/禁用"""
        return True

    def validate_input(self, input: dict, context) -> ValidationResult:
        """输入校验，在权限检查之前执行"""
        return ValidationResult(ok=True)

    def check_permissions(self, input: dict, context) -> PermissionResult:
        """工具特有的权限逻辑"""
        return PermissionResult(behavior="allow")

class ToolRegistry:
    """工具注册表：统一管理所有工具"""

    def __init__(self):
        self._tools: dict[str, BaseTool] = {}

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool

    def get(self, name: str) -> BaseTool | None:
        return self._tools.get(name)

    def get_all_enabled(self) -> list[BaseTool]:
        return [t for t in self._tools.values() if t.is_enabled()]

    def get_schemas(self) -> list[dict]:
        """生成发送给 LLM 的工具 schema 列表"""
        return [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.input_schema,
            }
            for t in self.get_all_enabled()
        ]
```

**对应 Claude Code 源码：** `Tool.ts` 中的 `Tool` 类型定义（第362行起）正是这个抽象。它定义了 `call`、`inputSchema`、`isConcurrencySafe`、`isReadOnly`、`isEnabled`、`validateInput`、`checkPermissions` 等方法。`buildTool` 工厂函数（第783行）则提供了默认值填充机制——"安全失败"原则：并发安全默认为 `false`，只读默认为 `false`，即假设最坏情况。

`tools.ts` 中的 `getAllBaseTools`（第193行）和 `assembleToolPool`（第345行）构成了注册表。前者返回所有内置工具，后者将内置工具与 MCP 工具合并，并按名称排序以保证缓存稳定性。

**关键设计决策：**
- 工具接口需要区分"只读"和"写入"操作——这是后续并发优化的基础；
- `is_enabled` 提供运行时动态开关，而非编译期确定——这让工具集能随环境变化；
- `validate_input` 与 `check_permissions` 分离——前者是"输入合法吗"，后者是"用户允许吗"，关注点不同。

### 15.2.4 第三步：实现权限系统

Agent 能执行 shell 命令、修改文件，这意味着它有破坏性能力。权限系统是必须的安全层。回顾第6章和第11章的思想，核心是**分层决策链**。

**伪代码框架：**

```python
class PermissionSystem:
    """三层权限决策链"""

    def __init__(self):
        self.mode = "default"           # default | auto | plan
        self.allow_rules = []           # 始终允许的规则
        self.deny_rules = []            # 始终拒绝的规则

    def check(self, tool_name: str, input: dict, context) -> PermissionResult:
        # 第一层：规则匹配（静态配置）
        rule_result = self._check_rules(tool_name, input)
        if rule_result.is_decisive:
            return rule_result

        # 第二层：模式判定（运行时状态）
        if self.mode == "auto":
            # 自动模式：只读操作直接放行，写入操作交给分类器
            if is_read_only(tool_name, input):
                return PermissionResult(behavior="allow")
            classifier_result = self._run_classifier(tool_name, input)
            if classifier_result.is_safe:
                return PermissionResult(behavior="allow")
            # 分类器不确定 → 降级为询问

        # 第三层：交互询问（用户确认）
        return PermissionResult(behavior="ask", description=...)

    def _check_rules(self, tool_name, input) -> RuleResult:
        """规则匹配：deny 优先于 allow"""
        for rule in self.deny_rules:
            if rule.matches(tool_name, input):
                return RuleResult(decisive=True, behavior="deny")
        for rule in self.allow_rules:
            if rule.matches(tool_name, input):
                return RuleResult(decisive=True, behavior="allow")
        return RuleResult(decisive=False)

    def _run_classifier(self, tool_name, input) -> ClassifierResult:
        """安全分类器：评估操作风险"""
        # 分析命令模式、路径范围、破坏性等
        risk = analyze_risk(tool_name, input)
        return ClassifierResult(is_safe=(risk < THRESHOLD))
```

**对应 Claude Code 源码：** `permissions.ts` 中的 `hasPermissionsToUseTool` 函数实现了完全相同的三层决策链。第一层是 `checkRuleBasedPermissions`——遍历 deny/allow/ask 规则列表。第二层在自动模式下由 `classifierDecision` 模块处理——结合 `yoloClassifier`（基于模式匹配的快速分类）和可选的 LLM 分类器。第三层返回 `{behavior: "ask"}`，由 UI 层弹出确认对话框。

`useCanUseTool.tsx` 是权限系统与循环的桥梁。它将权限判定结果包装为 `CanUseToolFn`，传入 `toolExecution.ts` 中的工具执行流程。

**关键设计决策：**
- "deny 优先"原则——安全相关的否定判断必须不可被覆盖；
- 权限模式是运行时可切换的——用户可以随时在 `default`、`auto`、`plan` 之间切换；
- 分类器是"可选加速层"，不是"必须通过层"——它的否定只是降级为询问，而非直接拒绝。

### 15.2.5 第四步：添加状态管理

随着系统变复杂，你需要一个中心化的状态存储。回顾第7章，核心思想是**不可变状态 + 函数式更新**。

**伪代码框架：**

```python
from dataclasses import dataclass, field
from typing import Callable
import copy

@dataclass(frozen=True)
class AppState:
    """不可变应用状态"""
    messages: tuple = ()
    permission_mode: str = "default"
    permission_rules: dict = field(default_factory=dict)
    mcp_connections: tuple = ()
    tasks: dict = field(default_factory=dict)
    verbose: bool = False
    model: str = "claude-sonnet-4-20250514"

class StateStore:
    """状态仓库：函数式更新，支持订阅"""

    def __init__(self, initial: AppState):
        self._state = initial
        self._listeners = []

    def get_state(self) -> AppState:
        return self._state

    def set_state(self, updater: Callable[[AppState], AppState]):
        """函数式更新：传入转换函数，而非新状态"""
        old_state = self._state
        new_state = updater(old_state)
        self._state = new_state
        # 通知所有订阅者
        for listener in self._listeners:
            listener(old_state, new_state)

    def subscribe(self, listener):
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

# 使用示例：
store = StateStore(AppState())

# 更新权限模式
store.set_state(lambda s: AppState(
    **{**vars(s), "permission_mode": "auto"}
))

# 添加任务
store.set_state(lambda s: AppState(
    **{**vars(s), "tasks": {**s.tasks, task_id: new_task}}
))
```

**对应 Claude Code 源码：** `AppStateStore.ts` 中定义了 `AppState` 类型（第89行），包含 `settings`、`toolPermissionContext`、`mcp` 连接状态、`tasks` 列表等字段。`store.ts` 中的 `createStore` 函数实现了订阅-通知模式。整个系统通过 `setAppState(f: (prev: AppState) => AppState)` 这一函数式签名传递状态变更——这在 `ToolUseContext`（`Tool.ts` 第183行）中以 `setAppState` 字段的形式贯穿工具执行全流程。

`DeepImmutable<>` 类型工具（出现在 `AppState` 定义中）在编译期强制不可变性，防止意外修改。

**关键设计决策：**
- 函数式更新而非直接赋值——确保状态变更可追踪、可组合；
- 状态通过上下文对象（`ToolUseContext`）注入工具，而非全局变量——保证可测试性；
- 订阅机制让 UI 层和持久化层能响应状态变化，但不阻塞核心循环。

### 15.2.6 第五步：引入多 Agent 协调

当任务复杂到需要并行处理时，单一 Agent 不够用。回顾第8章，核心思想是**主Agent分发 + 子Agent执行 + 消息传递协调**。

**伪代码框架：**

```python
class SubAgent:
    """子 Agent：在独立上下文中运行"""

    def __init__(self, agent_id, parent_context, task_description):
        self.agent_id = agent_id
        self.abort_controller = AbortController()
        # 子 Agent 拥有自己的消息历史
        self.messages = []
        # 从父上下文继承工具集（可能受限）
        self.tools = filter_tools_for_agent(parent_context.tools)
        # 独立的状态更新通道
        self.set_state = create_subagent_state_setter(parent_context)

    async def run(self, prompt: str) -> str:
        """运行子 Agent 的推理循环"""
        # 复用第一步的推理循环，但使用独立的上下文
        agent = MinimalAgent(model_client, self.tools)
        return agent.run(prompt)

class AgentCoordinator:
    """Agent 编排器"""

    def spawn_agent(self, task: str, context: ToolContext) -> TaskHandle:
        """创建并启动子 Agent"""
        agent_id = generate_id()
        agent = SubAgent(agent_id, context, task)

        # 注册到任务管理器
        handle = TaskHandle(
            task_id=agent_id,
            cleanup=lambda: agent.abort_controller.abort()
        )

        # 异步启动
        asyncio.create_task(self._run_and_track(agent, task))
        return handle

    async def _run_and_track(self, agent, task):
        """运行并追踪 Agent 状态"""
        update_task_state(agent.agent_id, status="running")
        try:
            result = await agent.run(task)
            update_task_state(agent.agent_id,
                            status="completed", result=result)
        except Exception as e:
            update_task_state(agent.agent_id,
                            status="failed", error=str(e))
```

**对应 Claude Code 源码：** `Task.ts` 定义了任务状态机（`pending → running → completed/failed/killed`）。`AgentTool` 是主 Agent 用来启动子 Agent 的工具。`coordinatorMode.ts` 实现了协调者模式——主 Agent 只负责分发任务和收集结果，实际工作由 worker Agent 完成。

子 Agent 的工具集通过 `filterToolsForAgent` 受限——比如子 Agent 不能再启动子 Agent（防止无限递归），也不能使用某些仅限主线程的工具。

**关键设计决策：**
- 子 Agent 的消息历史独立于父 Agent——隔离避免上下文污染；
- 子 Agent 的 `setAppState` 是一个受限版本——它能更新任务状态，但不能修改全局权限配置；
- 任务有明确的生命周期（`isTerminalTaskStatus` 检查 `completed/failed/killed`），确保资源可回收。

### 15.2.7 第六步：接入 MCP 协议

MCP（Model Context Protocol）让 Agent 能够连接外部工具服务。回顾第9章，核心是**协议适配 + 工具归一化**。

**伪代码框架：**

```python
class MCPClient:
    """MCP 客户端：连接外部工具服务器"""

    def __init__(self, server_config):
        self.name = server_config["name"]
        self.transport = self._create_transport(server_config)
        self.tools = []

    async def connect(self):
        """连接服务器并发现工具"""
        await self.transport.connect()
        # 发现可用工具列表
        response = await self.transport.request("tools/list")
        self.tools = response.tools

    async def call_tool(self, tool_name: str, args: dict) -> str:
        """调用远程工具"""
        response = await self.transport.request("tools/call", {
            "name": tool_name,
            "arguments": args
        })
        return response.content

    def _create_transport(self, config):
        if "command" in config:
            return StdioTransport(config["command"], config["args"])
        elif "url" in config:
            return StreamableHTTPTransport(config["url"])
        else:
            raise ValueError("Unknown transport type")

def normalize_mcp_tool(server_name: str, mcp_tool) -> BaseTool:
    """将 MCP 工具归一化为内部工具接口"""
    return MCPToolAdapter(
        name=f"mcp__{server_name}__{mcp_tool.name}",
        description=mcp_tool.description,
        input_schema=mcp_tool.inputSchema,
        server_name=server_name,
        original_name=mcp_tool.name,
        client=mcp_client
    )

def merge_tool_pools(builtin_tools, mcp_tools) -> list[BaseTool]:
    """合并内置工具和 MCP 工具，内置优先"""
    seen = set()
    merged = []
    # 内置工具优先
    for t in sorted(builtin_tools, key=lambda x: x.name):
        if t.name not in seen:
            merged.append(t)
            seen.add(t.name)
    # MCP 工具补充
    for t in sorted(mcp_tools, key=lambda x: x.name):
        if t.name not in seen:
            merged.append(t)
            seen.add(t.name)
    return merged
```

**对应 Claude Code 源码：** `services/mcp/client.ts` 实现了完整的 MCP 客户端。它支持三种传输方式：`StdioClientTransport`（本地进程）、`SSEClientTransport`（Server-Sent Events）和 `StreamableHTTPClientTransport`（HTTP 流）。工具归一化在 `MCPTool.ts` 中完成——每个 MCP 工具被包装为实现了 `Tool` 接口的对象，名称格式为 `mcp__{server}__{tool}`。

`tools.ts` 中的 `assembleToolPool`（第345行）实现了合并逻辑——内置工具排序后作为前缀，MCP 工具排序后追加，用 `uniqBy('name')` 去重保证内置优先。排序的目的是缓存稳定性：工具列表的顺序影响系统提示的 token 排列，排序后即使新增工具也只影响局部缓存。

**关键设计决策：**
- 名称前缀（`mcp__server__tool`）确保命名空间隔离——不同服务器的同名工具不会冲突；
- 传输层抽象让协议层不关心具体通信方式——本地进程和远程 HTTP 服务用同一套调用接口；
- 排序为缓存优化服务——这是工程中"看似无关紧要但影响深远"的设计。

### 15.2.8 第七步：加入钩子系统

钩子让用户能在不修改 Agent 源码的情况下，在关键生命周期点注入自定义逻辑。回顾第10章，核心是**事件点 + 外部进程执行 + 结果消费**。

**伪代码框架：**

```python
class HookSystem:
    """钩子系统：在关键生命周期点执行用户脚本"""

    # 支持的钩子事件
    EVENTS = [
        "PreToolUse",      # 工具执行前
        "PostToolUse",     # 工具执行后
        "Notification",    # 通知触发时
        "Stop",            # Agent 即将停止时
    ]

    def __init__(self, hooks_config: dict):
        self.hooks = self._load_hooks(hooks_config)

    async def execute(self, event: str, context: dict) -> HookResult:
        """执行匹配的钩子"""
        matching = [h for h in self.hooks if h.matches(event, context)]

        results = []
        for hook in matching:
            # 准备环境变量
            env = {
                "HOOK_EVENT": event,
                "TOOL_NAME": context.get("tool_name", ""),
                "TOOL_INPUT": json.dumps(context.get("input", {})),
                "SESSION_ID": context.get("session_id", ""),
            }

            # 执行外部命令
            process = await run_subprocess(
                hook.command,
                env=env,
                timeout=hook.timeout or 60000,
                stdin=json.dumps(context)  # 详细上下文通过 stdin 传入
            )

            # 解析结果
            result = self._parse_result(process)
            results.append(result)

            # 如果钩子要求阻止操作，立即返回
            if result.decision == "block":
                return HookResult(
                    blocked=True,
                    reason=result.reason
                )

        return HookResult(blocked=False, results=results)

    def _parse_result(self, process) -> SingleHookResult:
        """解析钩子输出：支持 JSON 和退出码两种协议"""
        if process.returncode == 0:
            # 尝试解析 JSON 输出
            try:
                output = json.loads(process.stdout)
                if output.get("decision") == "block":
                    return SingleHookResult(
                        decision="block",
                        reason=output.get("reason", "")
                    )
            except json.JSONDecodeError:
                pass
            return SingleHookResult(decision="allow")

        elif process.returncode == 2:
            # 退出码 2 = 阻止操作
            return SingleHookResult(
                decision="block",
                reason=process.stderr
            )
        else:
            # 其他退出码 = 钩子执行失败，不阻止
            return SingleHookResult(decision="allow")
```

**对应 Claude Code 源码：** `utils/hooks.ts` 实现了完整的钩子系统。钩子通过 `settings.json` 中的 `hooks` 配置注册，支持 `PreToolUse`、`PostToolUse`、`Notification`、`Stop` 等事件。上下文通过环境变量和 stdin 双通道传入——环境变量携带关键元数据（工具名、会话 ID），stdin 传入 JSON 格式的详细上下文。

`toolHooks.ts` 中的 `runPreToolUseHooks` 和 `runPostToolUseHooks` 是钩子与工具执行流程的集成点。钩子的结果可以阻止工具执行（`block`），也可以修改工具输出。

**关键设计决策：**
- 钩子是外部进程，而非内部回调——这保证了隔离性，钩子崩溃不影响 Agent；
- 双协议（JSON 输出 / 退出码）降低了编写钩子的门槛——简单场景用退出码，复杂场景用 JSON；
- 钩子有超时限制——防止挂起的钩子阻塞整个 Agent。

### 15.2.9 第八步：性能优化和容错

最后一步是让系统健壮且高效。回顾第12章（上下文压缩）和第13章（容错重试），核心是**自动压缩 + 分层重试**。

**伪代码框架：**

```python
class ResilientQueryLoop:
    """带压缩和重试的健壮查询循环"""

    def __init__(self, agent, compactor, retry_policy):
        self.agent = agent
        self.compactor = compactor
        self.retry = retry_policy

    async def run(self, messages, context):
        max_output_recovery = 3
        recovery_count = 0

        while True:
            # ---- 上下文压缩检查 ----
            token_count = estimate_tokens(messages)
            if self.compactor.should_compact(token_count):
                messages = await self.compactor.compact(messages, context)

            # ---- API 调用（带重试）----
            try:
                response = await self.retry.execute(
                    lambda: self.agent.model.create(
                        messages=messages,
                        tools=context.tool_schemas
                    )
                )
            except PromptTooLongError:
                # 上下文溢出 → 强制压缩后重试
                messages = await self.compactor.force_compact(messages)
                continue
            except MaxOutputTokensError:
                # 输出截断 → 追加提示后继续
                if recovery_count < max_output_recovery:
                    recovery_count += 1
                    messages.append(create_continuation_hint())
                    continue
                else:
                    break  # 超过恢复上限

            # ---- 工具执行 ----
            # ... 同第一步的工具执行逻辑 ...

            if not tool_calls:
                return extract_text(response)

class RetryPolicy:
    """分层重试策略"""

    MAX_RETRIES = 10
    BASE_DELAY_MS = 500

    async def execute(self, fn):
        for attempt in range(self.MAX_RETRIES):
            try:
                return await fn()
            except RateLimitError as e:
                # 429/529：指数退避
                delay = self.BASE_DELAY_MS * (2 ** attempt)
                delay = min(delay, 60000)  # 上限 60 秒
                await sleep(delay)
            except ConnectionError:
                # 网络错误：短暂等待后重试
                await sleep(self.BASE_DELAY_MS)
            except AuthError:
                # 认证失败：尝试刷新凭证
                await refresh_credentials()
        raise MaxRetriesExceeded()

class AutoCompactor:
    """自动上下文压缩器"""

    WARNING_THRESHOLD = 0.6   # 60% 容量时预警
    COMPACT_THRESHOLD = 0.8   # 80% 容量时压缩

    def should_compact(self, token_count) -> bool:
        ratio = token_count / MAX_CONTEXT_TOKENS
        return ratio >= self.COMPACT_THRESHOLD

    async def compact(self, messages, context) -> list:
        """使用 LLM 生成对话摘要，替换历史消息"""
        # 保留最近的消息（保护尾部）
        protected_tail = messages[-TAIL_SIZE:]
        to_summarize = messages[:-TAIL_SIZE]

        # 用轻量模型生成摘要
        summary = await summarize(to_summarize, context)

        # 返回 [摘要] + [保留的尾部]
        return [create_summary_message(summary)] + protected_tail
```

**对应 Claude Code 源码：** `withRetry.ts` 实现了完整的分层重试——区分 429（速率限制，指数退避）、529（过载，有限重试）、连接错误（短暂重试）、认证错误（刷新凭证后重试）。`DEFAULT_MAX_RETRIES = 10`，`BASE_DELAY_MS = 500`。

`autoCompact.ts` 实现了自动压缩触发逻辑——当 token 使用率超过阈值时触发。`compact.ts` 中的 `buildPostCompactMessages` 构造压缩后的消息列表。`query.ts` 中的 `MAX_OUTPUT_TOKENS_RECOVERY_LIMIT = 3` 限制了输出截断的恢复次数。

此外，`toolOrchestration.ts` 中的 `partitionToolCalls` 实现了并发优化——将工具调用分为"并发安全"和"非安全"两组，前者并行执行，后者串行执行。最大并发数通过 `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` 环境变量控制，默认为10。

**关键设计决策：**
- 压缩是"保护尾部"策略——最近的对话最重要，压缩的是旧历史；
- 重试对不同错误类型采用不同策略——不是万能退避，而是精细化处理；
- 输出截断有恢复上限——防止无限循环消耗 token。

### 15.2.10 增量构建策略

以上八步不是并列的，而是有严格的递进关系。我们用一张演进图来概括：

```
第1步：最小循环（~50行）
  → 能对话、能调用工具、能停止

第2步：+工具抽象（~150行）
  → 工具可扩展、可动态启用/禁用

第3步：+权限系统（~300行）
  → 安全地执行文件操作和 shell 命令

第4步：+状态管理（~400行）
  → 配置可变、状态可追踪

第5步：+多Agent（~600行）
  → 复杂任务可分解并行

第6步：+MCP协议（~800行）
  → 接入外部工具生态

第7步：+钩子系统（~1000行）
  → 用户可自定义扩展点

第8步：+性能与容错（~1200行）
  → 长时间运行不崩溃
```

核心原则是：**每一步完成后系统都是可工作的**。第1步完成后你有一个能用的 Agent；加上第2步它变得可扩展；加上第3步它变得安全……这就是增量构建的精髓。

## 15.3 架构图解

下面给出完整 Agent 系统的架构蓝图，展示所有组件如何协作：

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户接口层                                │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │  CLI/   │  │  SDK/    │  │  Web     │  │  IDE Extension  │  │
│  │  REPL   │  │  API     │  │  UI      │  │  (LSP)          │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬──────────┘  │
│       └────────────┼─────────────┼───────────────┘              │
│                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    QueryEngine                           │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              推理循环 (query.ts)                  │    │    │
│  │  │                                                  │    │    │
│  │  │  while(true) {                                   │    │    │
│  │  │    ┌──────────────────┐                          │    │    │
│  │  │    │  上下文预处理     │ ← 自动压缩/微压缩        │    │    │
│  │  │    └────────┬─────────┘                          │    │    │
│  │  │             ▼                                    │    │    │
│  │  │    ┌──────────────────┐                          │    │    │
│  │  │    │  调用 LLM API    │ ← 重试策略/模型降级       │    │    │
│  │  │    └────────┬─────────┘                          │    │    │
│  │  │             ▼                                    │    │    │
│  │  │    ┌──────────────────┐                          │    │    │
│  │  │    │  流式处理响应     │ → 事件输出到用户接口      │    │    │
│  │  │    └────────┬─────────┘                          │    │    │
│  │  │             ▼                                    │    │    │
│  │  │    ┌──────────────────┐                          │    │    │
│  │  │    │  工具编排执行     │ ← 并发/串行分区          │    │    │
│  │  │    └────────┬─────────┘                          │    │    │
│  │  │             ▼                                    │    │    │
│  │  │    tool_calls为空? ──是──→ 返回最终文本           │    │    │
│  │  │         │否                                      │    │    │
│  │  │         └──→ continue                            │    │    │
│  │  │  }                                               │    │    │
│  │  └──────────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌───────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    工具系统         │  │   权限系统    │  │    钩子系统       │  │
│  │                    │  │              │  │                   │  │
│  │ ┌──────────────┐  │  │ 规则匹配     │  │ PreToolUse        │  │
│  │ │ 内置工具      │  │  │    ↓         │  │ PostToolUse       │  │
│  │ │ Bash/Read/   │  │  │ 模式判定     │  │ Notification      │  │
│  │ │ Edit/Glob/.. │  │  │    ↓         │  │ Stop              │  │
│  │ ├──────────────┤  │  │ 交互询问     │  │                   │  │
│  │ │ MCP 工具      │  │  │              │  │ [用户自定义脚本]   │  │
│  │ │ (外部服务器)  │  │  │              │  │                   │  │
│  │ ├──────────────┤  │  │              │  │                   │  │
│  │ │ Agent 工具    │  │  │              │  │                   │  │
│  │ │ (子Agent启动) │  │  │              │  │                   │  │
│  │ └──────────────┘  │  └──────────────┘  └──────────────────┘  │
│  └───────────────────┘                                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    状态管理 (AppState)                      │  │
│  │  messages | permissions | mcp | tasks | settings | model   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 15.4 源码印证

让我们将构建蓝图与 Claude Code 的实际实现做一次系统性的对照：

| 构建步骤 | 核心算法 | Claude Code 实现 | 关键源码位置 |
|---------|---------|-----------------|-------------|
| 第1步：推理循环 | 条件终止迭代 | `queryLoop` 中的 `while(true)` | `query.ts:241-307` |
| 第2步：工具抽象 | 统一接口 + 注册发现 | `Tool` 类型 + `buildTool` 工厂 | `Tool.ts:362-792` |
| 第3步：权限系统 | 三层决策链 | `hasPermissionsToUseTool` | `permissions.ts` |
| 第4步：状态管理 | 不可变 + 函数式更新 | `AppState` + `createStore` | `AppStateStore.ts:89` |
| 第5步：多Agent | 主分发 + 子执行 | `AgentTool` + `coordinatorMode` | `coordinator/` |
| 第6步：MCP | 协议适配 + 归一化 | `MCPClient` + `assembleToolPool` | `services/mcp/client.ts` |
| 第7步：钩子 | 事件点 + 外部进程 | `executePreToolHooks` 等 | `utils/hooks.ts` |
| 第8步：容错 | 分层重试 + 自动压缩 | `withRetry` + `autoCompact` | `services/api/withRetry.ts` |

几个值得特别注意的实现细节：

**1. 工具并发分区（第2步+第8步的交叉点）**

`toolOrchestration.ts` 中的 `partitionToolCalls` 函数将工具调用分为并发安全组和非安全组。这不是一个简单的二分——它使用贪心分区算法：连续的并发安全调用合并为一组并行执行，遇到非安全调用则"切断"，单独串行执行。这比全部串行快得多，同时保证了写操作的顺序性。

**2. 状态注入的深度传递（第4步+第5步的交叉点）**

`ToolUseContext` 中同时存在 `setAppState` 和 `setAppStateForTasks`。前者在子 Agent 中可能是 no-op（因为子 Agent 的状态变更不应直接影响父 Agent），后者则始终指向根存储——用于注册/注销跨 Agent 生命周期的基础设施（如后台任务）。这是一个精妙的"双通道"设计。

**3. MCP 工具排序的缓存考量（第6步的工程细节）**

`assembleToolPool` 中对内置工具和 MCP 工具分别排序后合并，而非混合排序。原因是 API 服务端会在最后一个内置工具之后设置缓存断点。如果 MCP 工具插入到内置工具之间，会导致所有下游缓存失效。这是"算法为性能服务"的典型例子。

## 15.5 思考题

**1. 工具数量爆炸问题**

当 MCP 服务器提供大量工具时，将所有工具的 schema 放入系统提示会消耗大量 token。Claude Code 使用 `ToolSearchTool` 实现了延迟加载——部分工具标记为 `shouldDefer`，模型需要先搜索才能使用。请设计一个你自己的工具发现策略：如何在"模型能找到正确工具"和"减少 token 消耗"之间取得平衡？考虑向量化索引、分类树等方案的利弊。

**2. 权限规则冲突解决**

假设用户在项目级配置中设置了 `allow: Bash(git *)` ，但在全局配置中设置了 `deny: Bash(git push *)`。当模型尝试执行 `git push origin main` 时，应该允许还是拒绝？请设计一套冲突解决规则，要求满足：(a) 安全优先——deny 应该比 allow 强；(b) 特异性优先——更具体的规则应该覆盖更通用的规则；(c) 可预测——用户能推理出结果。对比你的设计与 Claude Code 的实际处理方式。

**3. 子 Agent 的上下文共享策略**

在多 Agent 架构中，子 Agent 是否应该看到父 Agent 的完整对话历史？如果看到，上下文可能溢出；如果看不到，它可能缺少完成任务的关键信息。Claude Code 采用了"独立消息历史 + 任务描述传递"的方案。请设计一个替代方案：让子 Agent 能够"按需查询"父 Agent 的历史，而非预先获取。考虑延迟加载、摘要缓存、相关性过滤等机制。

## 15.6 小结

本章将前14章的算法思想串联为一条完整的构建路线。我们从一个50行的最小循环出发，经过八个递进步骤，勾勒出一个功能完整的 Agent 系统架构。

核心要点回顾：

1. **最小闭环优先**：推理循环是 Agent 的心跳。先让"调用LLM → 执行工具 → 反馈结果"的循环跑通，再考虑一切增强。

2. **抽象是扩展的基础**：统一的工具接口让系统从3个工具扩展到300个工具时，核心循环不需要改动一行代码。

3. **安全不是事后添加的**：权限系统必须在第三步就到位。一个没有权限控制的 Agent 操作文件系统，等于一枚没有保险的手榴弹。

4. **函数式状态管理抵御复杂性**：当多个组件需要共享和修改状态时，不可变数据 + 函数式更新是对抗混乱的有效武器。

5. **协议化连接外部世界**：MCP 将"工具提供方"与"工具消费方"解耦，让 Agent 生态可以独立演化。

6. **钩子赋予用户控制权**：Agent 不应是黑盒。在关键生命周期点暴露扩展接口，让用户能注入自己的安全策略和定制逻辑。

7. **健壮性来自对失败的预期**：网络会断、API 会限流、上下文会溢出。分层重试和自动压缩不是"锦上添花"，而是生产可用的必要条件。

8. **增量演进是方法论**：每一步完成后系统都是可工作的。这不仅是构建策略，更是一种工程哲学——避免"大爆炸式集成"的风险。

Claude Code 的源码证明了这条路线的可行性。它的实际架构与我们的蓝图高度吻合——不是因为我们照搬了源码，而是因为这些算法思想本身就是构建此类系统的自然选择。当你面对相似的问题空间时，这些思想会再次成为你的指南。

下一步是你的了。拿起键盘，从第一步开始。
