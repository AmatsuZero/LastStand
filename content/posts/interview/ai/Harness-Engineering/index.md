+++
title = "Harness Engineering 精读笔记"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 6
tags = ["AI", "LLM", "面试"]
categories = ["AI", "面试"]
+++
> 基于 2025.11 — 2026.03 期间 Anthropic、OpenAI、LangChain、Google DeepMind、Stanford 发布的九篇核心文章的精读整理。
> 目标：理解 Harness Engineering 是什么，以及大公司和学术机构在实践中做了哪些探索。

---

## 一、什么是 Harness Engineering？

### 1.1 Harness 的定义

**LangChain** 给出了最清晰的公式化定义：

> **Agent = Model + Harness**
> "If you're not the model, you're the harness."
> "A harness is every piece of code, configuration, and execution logic that isn't the model itself."

具体来说，Harness 包括：
- **System Prompts** — 系统提示词，定义 Agent 的行为边界
- **Tools / Skills / MCPs** — 工具集及其描述（文件读写、代码执行、浏览器操作等）
- **Bundled Infrastructure** — 捆绑基础设施（文件系统、沙箱、浏览器）
- **Orchestration Logic** — 编排逻辑（子 Agent 派生、任务交接、模型路由）
- **Hooks / Middleware** — 确定性执行逻辑（压缩、续行、lint 检查等）

**Anthropic** 不给 Harness 下抽象定义，而是通过实践来展示：他们用 "harness design" 和 "harnesses for long-running agents" 来描述围绕 Agent 执行循环的编排层。Anthropic 在博客中明确说："harness design is key to performance at the frontier of agentic coding"。

**OpenAI** 用 "Codex harness" 指代 Codex 产品的具体架构——agent loop + 工具编排 + App Server。更偏向一个产品/系统名词。

### 1.2 Harness Engineering 的演进谱系

Harness Engineering 不是凭空出现的，它是 AI 工程领域关注点三次跃迁的产物：

1. **Prompt Engineering**（~2023）：关注怎么写好一条指令。工作对象是一个 prompt 字符串。
2. **Context Engineering**（~2025）：关注怎么管理整个上下文窗口中的信息（system prompt + 工具定义 + 对话历史 + 外部数据）。Andrej Karpathy 提出，Anthropic 系统阐述。
3. **Harness Engineering**（~2026）：关注怎么设计 Agent 的整个执行环境（上下文 + 工具 + 基础设施 + 编排 + 验证循环）。工作对象是一个系统。

Anthropic 的表述很精准："Harnesses today are largely delivery mechanisms for good context engineering"——今天的 Harness 很大程度上是优质 Context Engineering 的交付机制，但 Harness 还涵盖工具执行、基础设施、编排逻辑、验证循环等 Context Engineering 不涉及的领域。

### 1.3 为什么需要 Harness？

LangChain 从模型的根本局限出发推导：模型本质上只做一件事——输入文本/图片/音频，输出文本。它开箱即用无法做到：

- 跨交互保持持久状态
- 执行代码
- 访问实时知识
- 搭建环境和安装依赖来完成工作

这些都是 Harness 层面的特性。Transformer 架构的结构决定了，需要某种机制来包裹模型才能做有用的工作。

---

## 二、Anthropic 的实践：从两阶段到三 Agent 架构

Anthropic 发布了两篇核心博客，构成了迄今最详细的 Harness 工程化实践公开案例。

### 2.1 V1 架构：Initializer + Coding Agent（2025.11）

**来源：** 《Effective harnesses for long-running agents》

**核心问题：** 当一个任务太复杂，需要多个上下文窗口（多次对话）才能完成时，Agent 面临的核心挑战是——每个新 session 启动时没有前一次对话的记忆，就像一个没有交接信息的换班工人。

**发现的两个失败模式：**

1. **过度野心（Over-ambition）**：Agent 试图一次做太多事情（one-shotting），上下文用完时功能只做了一半——没有文档、没有测试、没有提交。下一个 session 的 Agent 接手时看到一堆半成品，花大量时间试图让基本功能重新工作。即便有 compaction（上下文压缩），也不总是能传递足够清晰的指令给下一个 Agent。

2. **过早完成（Premature completion）**：后来的 Agent 实例看到已有的进度后，草草检查就宣布"工作完成了"，但实际上很多功能没测试、有 bug。

**V1 解决方案：两个 Agent 角色（本质是同一个 Agent 使用不同的 user prompt）**

- **Initializer Agent**（只在第一次运行）：
  - 基于用户的高层级 prompt，建立一个包含 200+ 功能的**结构化 JSON 功能列表**（而非 Markdown，因为模型不太会随意修改 JSON）
  - 创建 `init.sh` 脚本用于启动开发服务器
  - 写进度日志 `claude-progress.txt`
  - 创建初始 git commit
  - 所有功能初始标记为 "failing"，让后续 Agent 清楚看到完成度

- **Coding Agent**（每个后续 session）：
  - 先运行 `pwd` 了解工作目录
  - 读取 git log 和进度文件了解上次做到哪了
  - 运行 `init.sh` 启动开发服务器
  - 用浏览器自动化工具做端到端基础测试，确认应用没有处于坏的状态
  - **一次只实现一个功能**（这是关键——解决了 one-shotting 问题）
  - 功能完成后，用 Puppeteer MCP 做端到端测试（像真实用户一样操作应用）
  - 提交 git commit + 更新进度文档
  - 留下"干净的代码库状态"——类似于适合合并到 main 分支的代码

**关键设计洞察：**

- **功能列表用 JSON 而非 Markdown**：模型更不容易擅自修改 JSON 文件中的测试内容。Anthropic 还用了强措辞指令："It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality."
- **通过 git 和进度文件传递上下文**：每个新 session 的 Agent 通过 `git log` 和 `claude-progress.txt` 快速了解项目状态，无需猜测。
- **端到端测试是关键**：没有显式提示时，Agent 倾向于用单元测试或 curl 验证，但经常无法识别端到端不工作的问题。给予浏览器自动化工具后性能显著提升。

### 2.2 V2 架构：Planner + Generator + Evaluator（2026.03）

**来源：** 《Harness design for long-running application development》

在 V1 基础上，Anthropic 的 Prithvi Rajasekaran 引入了 **GAN-inspired（生成对抗网络启发）的三 Agent 架构**，同时解决了 V1 中遗留的自我评价问题。

**两个新发现的关键问题：**

1. **Context Anxiety（上下文焦虑）**：Claude Sonnet 4.5 在感觉上下文快满时会过早收尾工作——不是因为做完了，而是因为它"焦虑"上下文不够了。Compaction（压缩）不够，因为 Agent 仍然"知道"自己已经工作了很久。**Context Reset**（完全清空上下文，启动全新 Agent，通过结构化交接文件传递状态）效果更好——新 Agent 得到全新开始，没有焦虑感。

2. **自我评价偏差**：当被要求评价自己的工作时，Agent 会自信地说"做得很好"——即使产出质量明显不行。原文："I watched it identify legitimate issues, then talk itself into deciding they weren't a big deal and approve the work anyway."（我看着它发现了真实问题，然后说服自己这些问题没什么大不了的，然后放行了。）

**三个 Agent 角色：**

**Planner Agent（规划器）：**
- 输入：1-4 句话的简单需求
- 输出：完整产品规格说明书（包含 16 个功能、10 个 Sprint）
- 设计哲学：**宏观思考，不做微观技术决策**。如果 Planner 在规格中写了错误的技术细节，错误会级联到后续实现。所以只约束"交付什么"，不约束"怎么做"。
- 额外能力：主动在产品规格中加入 AI 功能（如用 Claude 生成精灵图）

**Generator Agent（生成器）：**
- 按 Sprint 逐个实现功能（React + Vite + FastAPI + SQLite/PostgreSQL）
- 每个 Sprint 结束时先自评，再交给 Evaluator
- 有 git 版本控制

**Evaluator Agent（评估器）：**
- 使用 **Playwright MCP** 实际操作运行中的应用——点击按钮、测试 UI、检查 API 端点、验证数据库状态
- 按照评分标准逐项打分（如设计质量、原创性、工艺、功能性）
- 每个标准有硬性阈值，低于阈值即判定 Sprint 失败
- 返回具体的 bug 描述和修复建议给 Generator

**Sprint Contract（Sprint 合约）机制：**
在每个 Sprint 开始前，Generator 和 Evaluator 会"谈判"一份合约——商定这个 Sprint 要做什么、怎么算完成。这避免了生成器做了不该做的事或遗漏了该做的事。因为产品规格有意保持高层级，Sprint 合约填补了从用户故事到可测试实现之间的鸿沟。

**评估器的调教过程（非常关键的工程经验）：**

Anthropic 发现开箱即用的 Claude 是一个**很差的 QA Agent**：
- 发现了真实问题，但会说服自己"这不是大问题"然后放行
- 只做浅层测试，不深入探索边界情况
- 需要多轮调教才能让评估器按照人类预期的严格程度来打分

调教方法：读评估器的日志，找出它的判断与人类判断不一致的地方，更新 QA 的 prompt 来解决这些问题。经过几轮迭代后评估器才开始合理地打分。

**对比实验结果：**

| 配置 | 时长 | 花费 | 核心功能是否可用 |
|------|------|------|------------------|
| Solo（单 Agent） | 20 min | $9 | 不可用（游戏不响应输入） |
| V2 Harness（三 Agent + Sprint） | 6 hr | $200 | 可用（能控制角色移动跳跃） |

贵了 22 倍，但单 Agent 版本的核心功能不能用（相当于废品），三 Agent 版本虽仍有瑕疵但是**可用的产品**。

### 2.3 V3 架构：随模型进化简化 Harness（2026.03）

Opus 4.6 发布后，Anthropic 做了关键简化：

- **去掉了 Sprint 结构**：Opus 4.6 能原生处理更长时间的连贯编码，Generator 可以连续工作 2 小时以上不需要 Sprint 分解
- **Evaluator 改为单次评估**：从每个 Sprint 评估改为最终评估，因为更强的模型在大部分任务上不需要中间检查
- **去掉了 Context Reset**：Opus 4.6 没有明显的 Context Anxiety，用 SDK 自带的 Compaction 就够了
- **但 Evaluator 仍然保留**：在任务复杂度超出模型当前能力边界的地方，Evaluator 仍然提供价值

**DAW 任务的详细成本数据：**

| Agent | 时长 | 花费 |
|-------|------|------|
| Planner | 4.7 min | $0.46 |
| Build Round 1 | 2 hr 7 min | $71.08 |
| QA Round 1 | 8.8 min | $3.24 |
| Build Round 2 | 1 hr 2 min | $36.89 |
| QA Round 2 | 6.8 min | $3.09 |
| Build Round 3 | 10.9 min | $5.88 |
| QA Round 3 | 9.6 min | $4.06 |
| **总计** | **3 hr 50 min** | **$124.70** |

Builder 占了绝大部分时间和成本，QA Agent 的成本很低但价值很高——每次都发现了 Builder 遗漏的真实问题。

**核心原则（非常重要）：**

> "Harness 的每个组件都编码了一个关于'模型做不到什么'的假设。当新模型发布时，这些假设值得重新验证——有些可以去掉（降低成本和延迟），有些可以替换为利用新能力的组件。"

> "Harness 设计的有趣组合空间不会随着模型进步而缩小。它只是在移动。AI 工程师的有趣工作是持续找到下一个新组合。"

**简化 Harness 的方法论教训：**
第一次尝试简化时"大刀阔斧地砍"，结果没能复现原有性能，还搞不清哪些组件是真正有用的。后来改为"每次只去掉一个组件，观察影响"的方法论——这和 Anthropic 在《Building Effective Agents》中的原则一致："find the simplest solution possible, and only increase complexity when needed."

---

## 三、OpenAI 的实践：Codex Harness 全景

OpenAI 发布了三篇技术博客，从底层原理、系统架构、工程实践三个层面完整解析了 Codex 编程 Agent 的 Harness。

### 3.1 Codex Agent Loop 的核心机制（2026.01）

**来源：** 《Unrolling the Codex agent loop》

**Agent Loop 的基本循环：**

```
用户输入 → 构建 Prompt → 发送给模型（推理） → 模型输出
    ↓
  如果输出是最终回复 → 返回给用户，结束 turn
  如果输出是工具调用请求 → 执行工具 → 将结果追加到 prompt → 重新发送给模型
    ↓
  重复直到模型给出最终回复
```

这个循环看似简单，但 OpenAI 在工程细节上做了大量工作。

**Prompt 的构建层次（从高到低优先级）：**

1. **System Message**（由 Responses API server 控制内容，角色为 `system`）
2. **Tools 定义**（客户端提供的工具列表，包含 Codex 内置工具、Responses API 工具、MCP 工具）
3. **Instructions**（开发者/系统指令，角色为 `developer`）
4. **Developer Instructions**（来自 `config.toml` 的自定义指令）
5. **User Instructions**（聚合自多个来源，包括 Skills 元数据）
6. **Environment Context**（当前工作目录、shell 类型等）
7. **用户消息**

**Codex 内置的关键工具：**
- `shell`：在沙箱中执行 shell 命令（命令列表、工作目录、超时）
- `update_plan`：更新任务计划
- `web_search`：Web 搜索（由 Responses API 提供）
- MCP 工具：用户配置的外部工具

**Prompt Caching 的工程实践：**

Codex 的 prompt 在对话过程中不断增长（每次新 turn 都包含完整历史），理论上是 O(n²) 的。但通过 **Prompt Caching**（精确前缀匹配复用计算），实际推理成本可以降为线性。

为了确保 cache hit，Codex 团队做了大量工程工作：
- 静态内容（instructions、tools）放在 prompt 开头，变化的内容（用户消息、工具结果）放在末尾
- 中途配置变更（沙箱设置、工作目录变化）通过**追加新消息**而非修改早期消息来实现，保护 cache 前缀不变
- 特别注意 MCP 工具的顺序一致性（曾有 bug 导致工具枚举顺序不稳定，造成 cache miss）
- MCP server 的 `notifications/tools/list_changed` 通知可能在长对话中触发昂贵的 cache miss

**上下文窗口管理——Compaction：**

- 早期实现需要用户手动执行 `/compact` 命令
- 现在 Responses API 提供专门的 `/responses/compact` endpoint，返回一个压缩后的 items 列表来替换之前的 input
- 包含特殊的 `type=compaction` item，带有加密的 `encrypted_content` 保留模型对原始对话的隐式理解
- Codex 在 `auto_compact_limit` 被超过时自动触发

**Reasoning（推理过程）的处理：**

模型的推理输出中有 `type=reasoning` 的 item，包含 `encrypted_content`——这是加密的推理痕迹，OpenAI 保留解密密钥但不存储客户数据（支持 Zero Data Retention）。后续请求将加密推理作为 input 的一部分发回，让模型能利用之前的推理但客户端看不到原始推理内容。

### 3.2 Codex App Server 架构（2026.02）

**来源：** 《Unlocking the Codex harness: how we built the App Server》

**核心问题：** Codex 需要在多个表面（CLI、VS Code 插件、Web 应用、macOS 桌面应用）提供一致的 Agent 体验。如何将一份 Harness 代码暴露给多个客户端？

**App Server 的起源故事：**

- 最初 Codex CLI 是一个 TUI（终端界面），Agent loop 直接在进程内运行
- 构建 VS Code 扩展时需要复用同一套 Harness——先尝试将 Codex 暴露为 MCP server，但 MCP 语义难以适配 VS Code 的丰富交互模式
- 最终引入了 **JSON-RPC 协议**，镜像 TUI loop 的交互模式
- 随着需求增长（JetBrains、Xcode、桌面应用、并行多 Agent 编排），演化为正式的 App Server 平台

**App Server 的四个内部组件：**
1. **Stdio Reader**：读取客户端输入
2. **Codex Message Processor**：客户端与 Codex core 之间的翻译层
3. **Thread Manager**：管理多个线程（每个线程 = 一个 Codex 对话）
4. **Core Threads**：每个线程运行独立的 Agent 循环

**Conversation Primitives（对话原语）——这是 App Server 协议的核心设计：**

1. **Item**：输入/输出的原子单元。有类型（用户消息、Agent 消息、工具执行、审批请求、diff 等），有显式生命周期：
   - `item/started` → 可选的 `item/*/delta`（流式更新）→ `item/completed`
   - 客户端在 `started` 时开始渲染，`delta` 时增量更新，`completed` 时最终确定

2. **Turn**：一个用户输入触发的一轮 Agent 工作。包含一系列 Items。

3. **Thread**：一个持久容器，承载用户与 Agent 的完整对话。可以创建、恢复、分叉、归档。历史被持久化，客户端可以重连并渲染一致的时间线。

**三种客户端集成模式：**

| 模式 | 传输方式 | 特点 |
|------|----------|------|
| **本地 App / IDE** | JSON-RPC over stdio（JSONL） | 捆绑平台特定的 App Server 二进制文件，作为长运行子进程启动 |
| **Codex Web** | HTTP + SSE（浏览器）→ Worker 内的 JSON-RPC/stdio | 容器化环境，Web 会话是临时的（tab 关闭、网络断开），状态保存在服务器端 |
| **TUI / Codex CLI** | 计划重构为 App Server 客户端 | 未来可支持远程 Codex server，笔记本睡眠也能继续工作 |

**多语言支持：** App Server 客户端已有 Go、Python、TypeScript、Swift、Kotlin 实现。可通过 `codex app-server generate-ts` 或 `codex app-server generate-json-schema` 生成类型定义。

**审批机制：** Server 可以在执行操作前向客户端发送审批请求，暂停 turn 直到客户端回复 "allow" 或 "deny"。这是安全约束的关键机制。

### 3.3 Harness Engineering 实战：零手写代码构建生产产品（2026.02）

**来源：** 《Harness engineering: leveraging Codex in an agent-first world》，作者 Ryan Lopopolo

这是 OpenAI 三篇博客中**实践性最强、信息密度最高**的一篇。它描述了一个团队从零开始，用纯 Agent 方式构建并交付了一个内部生产级产品的完整经验——包括什么可行、什么失败了、以及他们是如何让工程效率提高一个数量级的。

#### 3.3.1 实验约束与规模

**核心约束：零行手写代码。** 团队故意设定了这个限制，迫使自己去构建让 Agent 高效工作所需的一切基础设施。

**关键数字：**
- 从 2025 年 8 月底一个空 git 仓库开始
- 5 个月后：约 **100 万行代码**（应用逻辑、基础设施、工具、文档、内部开发工具）
- ~**1500 个 PR** 被合并
- 起步 3 人团队，后扩展到 7 人
- 平均每人每天 **3.5 个 PR**——且随团队扩大，吞吐量还在增长
- 产品有**数百名内部用户**，包括每天使用的重度用户，也有外部 alpha 测试者
- 估算速度约为手动编码的 **10 倍**
- 单次 Codex 运行经常持续工作 **6 小时以上**（通常在人类睡觉时执行）

所有代码——产品代码、测试、CI 配置、文档、可观测性、内部工具——全部由 Codex 生成。甚至初始的 `AGENTS.md` 文件也是 Codex 写的。

#### 3.3.2 工程师角色的根本转变

这是整篇文章最有价值的部分。团队发现早期进度比预期慢，**不是因为 Codex 不够能干，而是因为环境没有被充分定义（underspecified）。** Agent 缺少做出有意义进展所需的工具、抽象和内部结构。

> "The primary job of our engineering team became enabling the agents to do useful work."

工程师的角色从"写代码"转变为：
- **设计环境**：构建让 Agent 能理解和操作的系统结构
- **明确意图**：将高层目标分解为 Agent 可执行的构建块
- **构建反馈循环**：让 Agent 能自验证、自纠正

**工作方式的实际改变：**

人类与系统的交互几乎完全通过 prompt 完成。典型流程：
1. 工程师描述一个任务
2. Codex 执行工作并开一个 PR
3. Codex 在本地自我 review
4. Codex 请求其他 Agent（本地和云端）进行 review
5. Codex 回应所有反馈（人类和 Agent 的）
6. 循环直到所有 Agent reviewer 满意（**这就是 Ralph Wiggum Loop 的实际应用**）
7. 人类可以 review PR，但不是必须的——随着时间推移，几乎所有 review 都是 Agent-to-Agent 完成的

**当 Agent 失败时，团队的心智模型很关键：**
> "When something failed, the fix was almost never 'try harder.' Because the only way to make progress was to get Codex to do the work, human engineers always stepped into the task and asked: 'what capability is missing, and how do we make it both legible and enforceable for the agent?'"

失败不是 Agent 的问题，是环境的问题。修复方向永远是：**识别缺失的能力，让它对 Agent 既可读又可执行。**

#### 3.3.3 上下文管理：给 Agent 地图，而非千页手册

团队在上下文管理上走过弯路，经验非常有价值。

**"一个巨大的 AGENTS.md" 方法失败了。** 失败原因很清晰：

1. **上下文是稀缺资源。** 一个巨大的指令文件会挤占任务、代码和相关文档的空间——Agent 要么遗漏关键约束，要么开始优化错误的目标。
2. **太多指导等于没有指导。** 当所有东西都"重要"时，没有东西重要。Agent 开始局部模式匹配而不是有目的地导航。
3. **巨型文件会瞬间腐化。** 一个单体手册变成陈旧规则的坟场。Agent 分不清什么还有效，人类也不再维护它，文件悄悄变成一个"有害吸引物"。
4. **难以验证。** 一个大文件不适合做机械化检查（覆盖率、新鲜度、所有权、交叉链接），漂移不可避免。

**正确做法：AGENTS.md 是目录表，不是百科全书。**

仓库的知识库住在结构化的 `docs/` 目录中，作为事实的唯一来源。一个精简的 `AGENTS.md`（约 100 行）被注入上下文，主要作为地图，指向更深层次的信息源：

```
AGENTS.md                          ← ~100 行的目录/地图
ARCHITECTURE.md                    ← 顶层架构：领域和包分层
docs/
├── design-docs/                   ← 设计文档（有验证状态）
│   ├── index.md
│   ├── core-beliefs.md            ← 定义 Agent-first 运营原则
│   └── ...
├── exec-plans/                    ← 执行计划（一等公民）
│   ├── active/                    ← 进行中的计划
│   ├── completed/                 ← 已完成的计划
│   └── tech-debt-tracker.md       ← 技术债追踪
├── generated/
│   └── db-schema.md               ← 自动生成的数据库 schema
├── product-specs/
│   ├── index.md
│   ├── new-user-onboarding.md
│   └── ...
├── references/                    ← 外部参考（LLM 友好格式）
│   ├── design-system-reference-llms.txt
│   ├── nixpacks-llms.txt
│   └── ...
├── DESIGN.md
├── FRONTEND.md
├── PLANS.md
├── PRODUCT_SENSE.md
├── QUALITY_SCORE.md               ← 每个领域/架构层的质量评分
├── RELIABILITY.md
└── SECURITY.md
```

这实现了 **Progressive Disclosure（渐进式披露）**：Agent 从一个小而稳定的入口开始，被告知"下一步去哪找信息"，而不是一开始就被淹没。

**知识库的机械化维护：**
- 专用 linter 和 CI 任务验证知识库是最新的、交叉链接正确的、结构合规的
- 一个定期运行的 **"doc-gardening" Agent** 扫描陈旧或过时的文档，自动开 PR 修复

**执行计划（Execution Plans）是一等公民：**
- 小变更用临时轻量计划
- 复杂工作用完整的执行计划，包含进度和决策日志，**提交到仓库中**
- 进行中的计划、已完成的计划、已知技术债都版本化并共同存放
- 这让 Agent 无需依赖外部上下文就能工作

#### 3.3.4 Agent 可读性（Agent Legibility）

这是一个非常独特的视角——因为仓库完全由 Agent 生成，它首先为 Codex 的可读性做优化。

**核心原则：从 Agent 的角度看，它在上下文中无法访问的东西等于不存在。** Google Docs 里的讨论、Slack 线程中的决定、人们脑子里的知识——这些对 Agent 不可见，就像对三个月后加入的新人不可见一样。

> "That Slack discussion that aligned the team on an architectural pattern? If it isn't discoverable to the agent, it's illegible in the same way it would be unknown to a new hire joining three months later."

**实践推论：**
- 团队随着时间推移不断把更多上下文推入仓库中
- 倾向于选择 Agent 能在仓库内完全理解和推理的依赖和抽象
- "无聊"的技术往往更适合 Agent（可组合性好、API 稳定、训练集中表示充分）
- 有时让 Agent 重新实现功能子集比使用不透明的公共库更划算——例如团队没有引入 `p-limit` 这样的通用并发控制包，而是让 Agent 实现了自己的 map-with-concurrency helper，紧密集成 OpenTelemetry instrumentation，100% 测试覆盖，行为完全符合运行时预期

#### 3.3.5 架构约束的机械化执行

仅靠文档无法让一个完全由 Agent 生成的代码库保持一致。关键是**执行不变量（invariants），而非微管理实现。**

**严格的分层架构模型：**

每个业务领域被划分为固定的分层，代码只能"向前"依赖（即上层依赖下层，不可反向）：

```
Types → Config → Repo → Service → Runtime → UI
（底层/稳定）                        （顶层/易变）
```

例如 UI 层可以依赖 Service 层，但 Service 层不能反过来依赖 UI 层。`→` 表示的是"允许的依赖方向"：右侧模块可以依赖左侧模块，但左侧不可依赖右侧。

横切关注点（认证、连接器、遥测、特性开关）通过唯一的显式接口 **Providers** 进入。其他任何依赖方式都被禁止，且通过机械手段强制执行。

> "This is the kind of architecture you usually postpone until you have hundreds of engineers. With coding agents, it's an early prerequisite: the constraints are what allows speed without decay or architectural drift."

**在人类优先的工作流中，这些规则可能显得学究气或过度约束。但在 Agent 工作流中，它们成为乘数：一旦编码，就在所有地方同时生效。**

**具体的机械化约束手段：**
- **自定义 linter**（Codex 生成的！）+ 结构化测试强制执行架构规则
- 静态强制结构化日志、schema 和类型的命名规范、文件大小限制、平台特定可靠性要求
- **lint 错误信息被设计为"可注入 Agent 上下文的修复指令"**——这是一个巧妙的设计：当 Agent 违反规则时，错误信息本身就告诉 Agent 怎么修
- 明确区分"在哪里约束很重要"和"在哪里无所谓"——中央强制边界、正确性和可复现性，在边界内允许 Agent 高度自由

**关于"品味"的传递：**
- 代码不总是符合人类风格偏好，**这没关系**——只要输出正确、可维护、对未来的 Agent 运行可读
- 人类品味通过 review 评论、重构 PR、用户 bug 报告持续反馈进系统
- 当文档不够时，**将规则提升为代码**（从文档约束变为 linter 约束）

#### 3.3.6 成本反转与应用可观测性

整篇文章贯穿了一个根本性洞察：**当 Agent 吞吐量极高时，什么昂贵、什么廉价发生了根本性反转。**

原文开篇就点明了核心稀缺资源：
> "how to maximize our one truly scarce resource: human time and attention."

以及在合并哲学中明确说：
> "corrections are cheap, and waiting is expensive."

这意味着传统工程中的成本结构被颠覆了：

| | 传统模式 | Agent-first 模式 |
|--|---------|-----------------|
| **代码编写** | 昂贵（人力密集） | 廉价（Agent 批量生产） |
| **纠错/重做** | 需要谨慎避免 | 廉价（Agent 快速迭代修复） |
| **人类注意力** | 充足（人就是干活的） | **唯一真正的瓶颈** |
| **等待/阻塞** | 可接受 | **极其昂贵**（浪费 Agent 吞吐量） |
| **QA 验证** | 人力可覆盖 | 人力成为瓶颈，必须让 Agent 自己做 |
| **架构约束** | 可以推迟到团队变大 | **前置条件**（没有约束 Agent 会快速制造混乱） |

这个成本反转逻辑驱动了文章中几乎所有的工程决策：
- **QA 能力从人转给 Agent**（下文的可观测性建设）→ 因为人类 QA 成了瓶颈
- **合并门控从严变松** → 因为等待比纠错更贵
- **架构约束从可选变为必须** → 因为 Agent 产出速度太快，没有约束会快速漂移
- **Review 从人做变为 Agent-to-Agent** → 因为人类注意力是唯一稀缺资源
- **"垃圾回收"自动化** → 因为人类每周花 20% 时间手动清理无法扩展

理解了这个反转，才能理解为什么团队要在以下方面大量投入——它们全是为了**减少对人类注意力的消耗**：

随着代码吞吐量增加，**瓶颈变成了人类 QA 能力**。解决方案是让应用本身对 Codex 可读——让 Agent 自己做 QA。

**UI 可观测性：**
- 应用可以按 git worktree 启动——Codex 为每个变更启动一个独立实例
- 接入了 **Chrome DevTools Protocol**，创建了处理 DOM 快照、截图和导航的 Skills
- Codex 可以直接复现 bug、验证修复、推理 UI 行为

**运维可观测性：**
- 日志、指标和 trace 通过本地可观测性栈暴露给 Codex
- Codex 工作在完全隔离的应用版本上——包括日志和指标，任务完成后销毁
- Agent 可以用 **LogQL** 查询日志、**PromQL** 查询指标
- 这使得这样的 prompt 变得可行："ensure service startup completes in under 800ms"、"no span in these four critical user journeys exceeds two seconds"

**完整的端到端自主循环（已达到的里程碑）：**

给定一个 prompt，Agent 现在可以：
1. 验证代码库当前状态
2. 复现一个报告的 bug
3. **录制视频演示故障**
4. 实现修复
5. **驱动应用验证修复**
6. **录制第二个视频演示修复结果**
7. 开 PR
8. 回应 Agent 和人类反馈
9. 检测并修复构建失败
10. 仅在需要人类判断时上报人类（escalate）
11. 合并变更

这个行为高度依赖于这个特定仓库的结构和工具，不应假设它能通用——至少目前还不能。

#### 3.3.7 "垃圾回收"——对抗 Agent 产出的熵增

全 Agent 自治引入了新的问题：**Codex 会复制仓库中已存在的模式——包括不均匀或次优的模式。** 随着时间推移，这不可避免地导致漂移。

**最初的手动方法失败了：** 团队每周五花 20% 的时间清理 "AI slop"。不出所料，这无法扩展。

**自动化"垃圾回收"方案：**

1. 编码 **"黄金原则"（Golden Principles）** 到仓库中——这些是固执己见的、机械化的规则，保持代码库对未来 Agent 运行的可读性和一致性。例如：
   - 偏向使用共享工具包而非手写 helper，保持不变量集中化
   - 不"YOLO 式"探测数据——验证边界或依赖类型化 SDK，Agent 不能在猜测的数据结构上构建

2. 定期运行**后台 Codex 任务**：
   - 扫描偏差
   - 更新质量评分
   - 开有针对性的重构 PR
   - 大部分可以在一分钟内 review 并自动合并

> "Technical debt is like a high-interest loan: it's almost always better to pay it down continuously in small increments than to let it compound and tackle it in painful bursts."

**核心思路：人类品味被捕获一次，然后在每行代码上持续执行。** 坏模式在天级别被发现和修复，而不是扩散数天或数周。

#### 3.3.8 合并哲学的转变

当 Agent 吞吐量增加后，许多传统工程规范变得适得其反：

- 仓库使用**最少的阻塞式合并门控**
- PR 短生命周期
- 测试 flake 通常通过后续运行解决，而不是无限阻塞进度

> "In a system where agent throughput far exceeds human attention, corrections are cheap, and waiting is expensive."

在低吞吐量环境中这样做是不负责任的。但在 Agent 高吞吐量环境中，这通常是正确的权衡。

#### 3.3.9 尚未解决的问题

团队坦承了几个开放问题：
- 不知道在完全 Agent 生成的系统中，架构一致性如何经历多年演化
- 仍在学习人类判断在哪里产生最大杠杆，以及如何编码这些判断使其产生复利效应
- 不知道随着模型持续变强，这个系统会如何演化

> "Building software still demands discipline, but the discipline shows up more in the scaffolding rather than the code."

---

## 四、LangChain 的实践：Harness 解剖学

**来源：** 《The Anatomy of an Agent Harness》（2026.03）

LangChain 的这篇博客是方法论层面最清晰的，它从"模型做不到什么"出发，逐步推导出 Harness 需要的每个组件。

### 4.1 六大基础原语的推导

**原语 1：文件系统 — 最基础的 Harness 原语**

LangChain 认为文件系统是所有原语中最重要的，因为它解锁了三个关键能力：
- Agent 获得了真实数据的工作区（之前只能在对话框里粘贴内容）
- 工作可以增量添加和卸载，不必全部放在上下文中（上下文的溢出区）
- 文件系统是天然的多 Agent 协作界面（一个 Agent 写文件，另一个读并回应）

Git 作为文件系统的增强：版本控制让 Agent 能追踪历史、回滚错误、分支实验。

**原语 2：Bash + 代码执行 — 通用工具**

传统思路是为每个操作预设工具函数，但这不可能覆盖所有情况。给 Agent 一个通用的代码执行能力（bash shell），让它动态编写和运行代码来解决问题——相当于给模型一台"电脑"。

代码执行已经成为自主问题解决的默认通用策略。但专用工具在特定场景下更高效，两者互补。

**原语 3：沙箱 — 安全边界**

在本地运行 Agent 生成的代码是有风险的，沙箱提供隔离的执行环境。可以白名单命令、网络隔离。同时支持按需创建/销毁，实现规模化。

好的环境配备好的默认工具：语言运行时、包管理器、git、测试框架、浏览器。这些都是 Harness 层面的设计决策。

**原语 4：Memory & 搜索 — 持久记忆 + 实时知识**

- **Memory**：文件系统再次是核心原语。`AGENTS.md` 这样的记忆文件在 Agent 启动时注入上下文，Agent 编辑后下次启动加载更新版本——这是一种持续学习（continual learning）。
- **Search**：Web Search 和 MCP 工具（如 Context7）帮助 Agent 访问训练截止后的新信息（新版本库、当前数据等）。

**原语 5：对抗 Context Rot**

**Context Rot** 描述了模型在上下文填满时推理和完成任务能力下降的现象。上下文是稀缺资源，Harness 需要策略来管理它。

Anthropic 的表述："Harnesses today are largely delivery mechanisms for good context engineering."

三种策略：
- **Compaction（压缩）**：上下文接近满时智能卸载和总结
- **Tool call offloading（工具结果卸载）**：超过阈值的大型工具输出保留头尾 token，完整输出写入文件系统
- **Skills 渐进式披露**：通过三层加载（元数据 → SKILL.md → 详细 references）避免启动时加载过多工具/MCP 到上下文中

**原语 6：长时自主执行**

自主软件创建是编程 Agent 的圣杯，但当前模型存在过早停止、复杂问题分解困难、跨多个上下文窗口时连贯性丧失等问题。

**Ralph Loop**（以辛普森动画角色命名，Geoffrey Huntley 提出）：
1. Agent 尝试完成任务
2. 当 Agent 试图退出时，**Hook 拦截这个退出**
3. Hook 检查：任务真的完成了吗？
4. 如果没完成，在新的上下文窗口中重新注入原始目标，强制继续
5. 文件系统使这成为可能——新上下文是"干净的"，但 Agent 从文件系统读取之前的状态

这是 Anthropic 的 Context Reset 和 LangChain 的长时执行策略的底层统一范式。

### 4.2 模型训练与 Harness 设计的耦合

LangChain 发现了一个有趣且重要的现象：

当前的 Agent 产品（Claude Code、Codex）在训练模型时会把 Harness 也纳入训练循环——模型在训练时就在使用特定的 Harness（文件系统操作、bash 执行、子 Agent 调度等），使得模型在对应的 Harness 中表现特别好。

**副作用：模型对训练时的 Harness 产生了"过拟合"。** 比如 Codex 的模型对 `apply_patch` 工具的特定格式有很强依赖——一个"真正智能"的模型应该能轻松适应不同的编辑格式，但实际上换一种格式就会导致性能下降。

**但这不意味着最好的 Harness 就是模型训练时用的那个。** Terminal Bench 2.0 排行榜清楚展示：Opus 4.6 在 Claude Code 中的得分远低于在其他 Harness 中的得分。LangChain 通过优化自己的 Harness（不换模型）从 52.8% 跃升到 66.5%，进入 Top 5。

**这直接证明了 Harness 是性能的关键杠杆，且优化 Harness 的空间巨大。**

### 4.3 Harness 的未来方向

LangChain 提出了三个开放研究方向：
1. 编排数百个 Agent 在共享代码库上并行工作
2. Agent 分析自身执行轨迹（trace）来识别和修复 Harness 层面的失败模式
3. Harness 根据任务动态组装正确的工具和上下文（Just-in-time），而非预配置

---

## 五、Google DeepMind 的实践：AutoHarness — 让 Agent 自己编写约束代码

**来源：** 《AutoHarness: improving LLM agents by automatically synthesizing a code harness》（arXiv:2603.03329，2026.02）

与前面几家公司关注"如何设计长时运行 Agent 的编排环境"不同，Google DeepMind 的 AutoHarness 提出了一个更聚焦但极具启发性的问题：**Agent 明明"知道"规则，为什么还总是违反规则？能不能让 Agent 自己写代码来强制执行规则？**

### 5.1 核心问题：声明性知识 vs 程序性执行的鸿沟

DeepMind 团队从一个惊人的数据出发：在 Kaggle GameArena 国际象棋比赛中，Gemini-2.5-Flash 的 **78% 的失败不是因为策略差，而是因为走了非法棋步（illegal moves）**。

模型并非不理解国际象棋规则——它能够推理策略、分析局面。但在实际行动时，它经常在"知道规则"和"始终遵守规则"之间出现断裂。这就像人类"知道"应该先检查再提交，但在忙碌时经常跳过一样。

这揭示了一个根本性的 LLM 局限：**声明性知识（"我知道这条规则"）和程序性执行（"有什么东西阻止我违反规则"）之间存在鸿沟。** 上下文中的规则文本会和其他信息竞争注意力，模型不可能在每一步都完美地"记住"并执行所有约束。

传统解决方案要么是手写 harness 代码（脆弱且人力密集，每个新环境都要重写），要么是微调模型（昂贵且可能降低其他能力）。AutoHarness 提出了第三条路：**让 LLM 利用自身的代码生成能力，自动合成约束代码。**

### 5.2 方法：Code as Harness

AutoHarness 的核心定义：

> "An agent is often defined as the combination of a specific LLM and a harness that acts as the 'glue' or 'plumbing' between the model and the task. In this work, we propose 'code as harness', a framework where the LLM itself completes the agent by coding its own harness."

Harness 代码需要实现两个关键函数：
- `is_legal_action(state, action) → bool`：检查某个动作在当前状态下是否合法
- `propose_action(state) → str`：提议一个合法的动作

**合成过程是迭代式搜索，而非简单提示：**

1. LLM（Gemini-2.5-Flash）生成初始 harness 代码
2. 在游戏环境中测试代码（10 个并行环境，最多 1000 步）
3. 当出现非法动作或代码执行失败时，记录最多 5 个失败步骤
4. 失败反馈 + 原始代码一起送给 LLM 进行修改
5. 使用 **Thompson Sampling 树搜索** 在多个代码候选之间做探索-利用权衡
6. 重复直到合法动作成功率达到 100% 或超时

平均只需要 **~14.5 轮迭代** 就能收敛到完全合法的 harness。其中 19/32 个游戏在不到 10 轮内就完成了。最复杂的是象棋（64 轮）、Othello（62 轮）等规则复杂的游戏。

### 5.3 三种运行模式

合成好的 Harness 有三种使用方式，代表了约束从轻到重的谱系：

**Mode 1：Harness-as-Action-Verifier（动作验证器）**
- LLM 提出一个动作 → 代码检查是否合法 → 如果非法，附上"非法动作"警告重新让 LLM 提议
- LLM 仍然做决策，代码只做"守门员"
- 类比：**"我来决定，但系统阻止我提交非法操作"**

**Mode 2：Harness-as-Action-Filter（动作过滤器）**
- 代码先枚举所有合法动作 → LLM 从合法集合中选择最优
- LLM 永远看不到非法选项，降低认知负担
- 类比：**"有人预先帮我过滤了选项"**

**Mode 3：Harness-as-Policy（代码即策略）**
- 完全不需要 LLM 参与推理。代码本身就是完整的决策策略
- 推理成本为 $0（只运行 Python 代码）
- 类比：**"代码学会了自己下棋，不需要模型了"**

### 5.4 实验结果：小模型 + Harness 击败大模型

**合法性：** 合成的 harness 在**全部 145 个 TextArena 游戏**上实现了 **100% 合法动作成功率**。

**双人对战（16 个游戏）：**

| 配置 | 总胜率 |
|------|--------|
| Gemini-2.5-Flash + AutoHarness | **56.3%** |
| Gemini-2.5-Pro（裸模型） | 38.2% |

**小模型 + Harness 赢了大模型。** Flash+Harness 在 16 个游戏中赢了 9 个，对阵裸 Flash 更是赢了 12/16 个（胜率 64.8%）。

**单人游戏（16 个游戏），包含 Code-as-Policy 模式：**

| 配置 | 平均奖励 | 推理成本 |
|------|----------|----------|
| Gemini-2.5-Flash（裸） | 0.673 | 常规 |
| Gemini-2.5-Pro（裸） | 0.707 | 常规 |
| Flash + Harness（验证器模式） | 0.745 | 常规 |
| GPT-5.2-High（高推理） | 0.844 | ~$640 |
| Flash + Harness（代码即策略） | **0.870** | **~$0** |

**最惊人的结果：纯代码策略（不调用任何 LLM）击败了 GPT-5.2-High——当前最强的推理模型——同时推理成本接近于零。**

### 5.5 生成的 Harness 代码长什么样？

论文附录展示了实际生成的代码，非常有启发性。

**扫雷（Minesweeper）的 `propose_action()` 实现了完整的逻辑推理：**
- 第一步走中心位置
- 通过数字线索进行约束推理（逐步标记已知地雷和安全格子）
- 在约束之间做交叉推导（集合差集方法发现新信息）
- 没有安全格时，计算概率风险评分选择最低风险的格子
- 包含全局地雷概率估计作为后备

**象棋（Chess）的 harness 实现了：**
- UCI 坐标解析和格式化
- 棋子定位
- 完整的攻击检测（兵、马、王、车/后直线、象/后对角线）
- 走子合法性验证（包括将军检测）

这些代码不是模板化的——它们是 LLM 根据每个游戏的具体规则和反馈**从零合成**的，展现了 LLM 将规则理解"编译"为可执行代码的能力。

### 5.6 对 Harness Engineering 的独特贡献

AutoHarness 和前面 Anthropic/OpenAI/LangChain 的工作形成了互补视角：

| 维度 | 前面的工作（编排型 Harness） | AutoHarness（约束型 Harness） |
|------|------------------------------|-------------------------------|
| **关注点** | 长时运行 Agent 的编排、上下文管理、多 Agent 协作 | 单步决策的合法性保证 |
| **Harness 由谁编写** | 人类工程师设计 | LLM 自动合成 |
| **适用场景** | 软件工程、复杂应用开发 | 有严格规则的结构化环境（游戏、表单、API 调用） |
| **对应的四大维度** | Inform + Verify + Correct + Constrain | 极致聚焦于 **Constrain** |
| **核心洞察** | 瓶颈是编排基础设施 | 瓶颈是规则执行的可靠性 |

**三个关键启示：**

1. **Harness 不必手写。** AutoHarness 证明了 LLM 可以自动合成 harness 代码。这呼应了 LangChain 提出的前沿方向之一："harnesses that dynamically assemble the right tools and context just-in-time for a given task."

2. **约束是可以"编译"的。** 将模型的声明性规则理解"编译"为确定性代码执行，比依赖模型在每一步都正确回忆规则要可靠得多。这是 Harness 四维度中 **Constrain** 的极致实践。

3. **Code-as-Policy 模式暗示了 Harness 的终极形态：** 当约束代码足够强大时，它不仅能约束模型，还能完全替代模型的推理。这和 Anthropic 发现"Harness 组件编码了模型做不到什么的假设"是同一个方向的极端推论——如果代码能做到的事，就不需要模型来做。

### 5.7 局限性

论文坦承了几个边界：
- **每个环境需要独立合成**：没有通用的"万能 harness"，每个游戏需要单独跑合成流程
- **知识在代码中，不在模型中**：丢掉 harness 代码就丢掉了"学习成果"，不会回馈到模型权重
- **纯代码策略在双人对抗游戏中表现有限**：需要建模对手策略的场景仍需 LLM
- **仅测试了文本游戏**：多模态或具身环境尚未验证

**未来方向：** 团队希望将领域特定的 harness "蒸馏"回基础模型，实现递归式自我改进；同时探索构建可复用的 harness 库，并扩展到更复杂的多模态游戏。

---

## 六、斯坦福的实践：Meta-Harness — 让 Agent 自动优化 Harness

**来源：** 《Meta-Harness: End-to-End Optimization of Model Harnesses》（arXiv:2603.28052, 2026.03.30）
**作者：** Yoonho Lee, Roshen Nair, Qizheng Zhang, Kangwook Lee (KRAFTON), Omar Khattab (MIT), Chelsea Finn (Stanford)
**项目主页：** https://yoonholee.com/meta-harness/

如果说 DeepMind 的 AutoHarness 是"让 Agent 自动**生成**约束代码"，那 Meta-Harness 就是更进一步："让 Agent 自动**优化**整个 Harness"。这是 Harness Engineering 自动化的最新前沿。

### 6.1 核心问题：Harness 工程目前还是手动的

论文开篇就点明：改变固定 LLM 周围的 Harness，可以在同一个 benchmark 上产生 **6 倍的性能差距**。Harness 的重要性已经不需要争论。但问题是——Harness 的优化过程目前仍然高度依赖人工：工程师检查失败、调整启发式规则、在少数设计方案之间迭代。

论文的核心假设是：**这个优化过程本身可以被自动化。**

### 6.2 为什么现有的文本优化方法不够好？

已有大量工作试图用 LLM 自动优化 prompt 和代码（OPRO、TextGrad、AlphaEvolve 等），但它们在 Harness 工程场景中有一个共同缺陷：**反馈压缩得太狠了**。

| 方法 | 能看到什么 | 每步上下文量 |
|------|-----------|-------------|
| OPRO | 过去的 (方案, 分数) 对 | ~2K tokens |
| TextGrad | 当前方案的文本梯度反馈 | ~15K tokens |
| AlphaEvolve | 程序数据库 + 评估分数 | ~22K tokens |
| GEPA | 推理 trace 的摘要 | ~8K tokens |
| **Meta-Harness** | **所有候选方案的源码 + 分数 + 完整执行 trace** | **~10M tokens** |

差距是 **三个数量级**。Harness 的失败模式往往需要追溯到很早的决策（比如检索策略的选择影响了很多步之后的推理质量），压缩后的摘要丢掉了诊断所需的关键信息。

### 6.3 方法：用 Coding Agent 搜索 Harness 代码空间

Meta-Harness 的核心设计出人意料地简约：

**搜索循环：**
1. **Proposer**（Claude Code + Opus 4.6）读取一个文件系统，里面包含所有之前候选 Harness 的源码、评分、完整执行 Trace
2. Proposer **通过 `grep`、`cat` 等标准工具**按需查阅文件系统（而非把所有内容塞进一个 prompt）
3. Proposer 诊断失败原因，提出新的 Harness 代码
4. 评估新 Harness，把结果写回文件系统
5. 重复

**关键设计决策：**
- **文件系统而非 prompt**：每次评估可能产生 10M tokens 的诊断信息，远超任何模型的上下文窗口。让 Proposer 按需查阅比强制摘要好得多。实测中 Proposer 每次迭代中位数读取 82 个文件，涉及 20+ 个之前的候选方案。
- **最小化外层循环结构**：不做父选择规则、不做硬编码的搜索启发式。所有诊断和改进逻辑都委托给 Proposer Agent 自身。这意味着 Meta-Harness 会随着 coding agent 能力提升而自动变强。
- **代码空间搜索**：Harness 被表示为单文件 Python 程序，Proposer 可以修改检索逻辑、记忆管理、prompt 构造、状态更新等任何部分——从局部微调到完全重写。

论文特别指出：这种工作流只在 2026 年初 coding agent 能力大幅提升后才变得实用。

### 6.4 实验结果

**实验 1：在线文本分类**

在 LawBench（215 类）、Symptom2Disease（22 类）、USPTO-50k（180 类）三个数据集上：

| 方法 | 平均准确率 | 上下文量 |
|------|-----------|---------|
| ACE（手工设计的 SOTA） | 40.9% | 50.8K |
| MCE（手工设计） | 40.0% | 28.5K |
| **Meta-Harness** | **48.6%** | **11.4K** |

准确率提升 7.7 个点，同时上下文量只有 ACE 的 1/4。

与其他自动优化方法对比：Meta-Harness 用 **1/10 的评估次数**就达到了 OpenEvolve 和 TTT-Discover 的最终准确率，最终准确率超出它们 **10+ 个点**。

更重要的是，发现的 Harness 在 **9 个从未见过的分布外数据集**上也表现最好（73.1% vs ACE 的 70.2%），说明学到的不是过拟合的 trick，而是有泛化性的策略。

**实验 2：检索增强数学推理**

在 200 道 IMO 级数学题上，Meta-Harness 发现的检索策略在 **5 个从未见过的模型**上平均提升 4.7 个点。注意这里模型在搜索阶段完全没见过这些测试题，且检索策略是跨模型迁移的。

**实验 3：Agentic Coding（TerminalBench-2）**

| 模型 | Harness | 通过率 |
|------|---------|--------|
| Claude Opus 4.6 | Claude Code（无优化） | 58.0% |
| Claude Opus 4.6 | Terminus-KIRA（手工工程化） | 74.7% |
| Claude Opus 4.6 | **Meta-Harness（自动）** | **76.4%** |
| Claude Haiku 4.5 | Goose（最好的手工方案） | 35.5% |
| Claude Haiku 4.5 | **Meta-Harness（自动）** | **37.6%** |

在 Opus 4.6 上排名第二（仅次于 ForgeCode），在 **Haiku 4.5 上排名第一**——超过了所有手工工程化的方案。

### 6.5 消融实验：为什么完整 Trace 如此关键？

| Proposer 能看到什么 | 中位准确率 | 最佳准确率 |
|--------------------|-----------|-----------|
| 仅分数 + 代码 | 34.6% | 41.3% |
| 分数 + 代码 + LLM 摘要 | 34.9% | 38.7% |
| **完整文件系统（含原始 Trace）** | **50.0%** | **56.7%** |

这个消融实验非常有说服力：
- **仅看分数**几乎和随机搜索一样——因为分数不告诉你"为什么失败"
- **加上 LLM 摘要**几乎没有帮助——甚至最佳准确率还下降了！因为摘要压缩掉了诊断关键信息
- **完整 Trace** 是决定性因素——即使中位候选方案也超过了其他条件下的最佳方案

这和 Anthropic 在 Evaluator 设计中的发现一致：**压缩 ≠ 有效信息传递**。能"看到"完整的执行过程是做出正确判断的前提。

### 6.6 Proposer 的定性行为

论文在 TerminalBench-2 的搜索轨迹中观察到了令人印象深刻的 Proposer 行为：

1. **早期迭代**：Proposer 同时尝试了结构性修复和 prompt 模板修改，两个候选方案都退步了
2. **诊断**：Proposer 通过查看 Trace 明确假设——"退步是因为 prompt 修改引起的混淆，而非结构性修复的问题"
3. **隔离变量**：在下一次迭代中，Proposer 将结构性修改和 prompt 修改分开，验证假设
4. **转向安全策略**：确认 prompt 修改有害后，转向更保守的增量修改策略，最终产生了整个搜索中的最佳候选方案

这本质上是 **Agent 在做科学方法式的 Harness 工程**——观察、假设、控制变量、验证。

### 6.7 与 AutoHarness 的关系和区别

| 维度 | AutoHarness（DeepMind） | Meta-Harness（Stanford） |
|------|------------------------|-------------------------|
| **做什么** | 自动生成约束代码（action verifier / filter / code-as-policy） | 自动优化整个 Harness（prompt + 检索 + 记忆 + 编排逻辑） |
| **搜索空间** | 特定游戏的规则代码 | 通用的 Harness 代码 |
| **优化信号** | 环境反馈（合法/非法动作） | 完整执行 Trace + 分数 |
| **Proposer** | LLM 直接生成代码 | Coding Agent（Claude Code）通过文件系统诊断后生成 |
| **泛化性** | 每个环境需独立合成 | 发现的策略可跨模型、跨数据集迁移 |
| **适用范围** | 游戏 / 受限动作空间 | 文本分类、数学推理、Agentic Coding |

两者是互补的：
- AutoHarness 更适合 **约束型场景**（"确保 Agent 不做非法操作"）
- Meta-Harness 更适合 **优化型场景**（"找到让 Agent 表现最好的整体策略"）

### 6.8 对 Harness Engineering 的独特贡献

1. **证明了 Harness 工程可以端到端自动化** — 不仅限于约束代码（AutoHarness），整个 Harness（prompt、检索、记忆、编排）都可以自动搜索优化
2. **"Bitter Lesson" 的 Harness 版本** — 论文引用了 Rich Sutton 的 "Bitter Lesson"：一旦搜索空间变得可访问，强大的通用搜索方法就会超越手工工程。Meta-Harness 证明 Harness 空间也是如此
3. **完整 Trace 是关键** — 压缩反馈（摘要、分数）不够，Agent 需要能看到原始执行过程才能做有效的因果推断。这对所有 Harness 设计者都有指导意义
4. **发现的策略可迁移** — 在一个模型上搜索到的 Harness 可以迁移到其他模型，包括更强的未来模型。这意味着 Harness 搜索的投资有复合回报
5. **Proposer 展现了类似科学方法的行为** — 观察、假设、控制变量、验证。这暗示着 Harness Engineering 未来可能变成一个 Agent 自主迭代的持续过程

### 6.9 局限性

- **搜索成本**：每次运行约 20 次迭代、60 个候选方案评估，对于大型 benchmark 可能很贵
- **依赖强 Proposer**：实验使用了 Claude Code + Opus 4.6，论文坦承尚未研究较弱 Proposer 的效果
- **TerminalBench-2 上搜索集 = 测试集**：由于 benchmark 太小太贵，无法分出独立验证集。虽然做了防过拟合检查，但这是一个限制
- **单一 Proposer 类型**：只测试了 Claude Code，不同 coding agent 作为 Proposer 的效果差异尚不清楚

**未来方向：** 论文提出了一个激动人心的方向——**共同进化 Harness 和模型权重**，让策略影响模型学什么，模型能力又反过来影响策略设计。这和 AutoHarness 提出的"蒸馏回基础模型"方向不谋而合。

---

## 七、Harrison Chase：Coding Agent 如何重塑 EPD（Engineering, Product, Design）

**来源：** 《How Coding Agents Are Reshaping Engineering, Product and Design》（2026.03），Harrison Chase（LangChain CEO）

与前面几篇聚焦于"Harness 怎么建"的技术文章不同，Harrison 这篇文章从更宏观的视角审视了 Coding Agent 对整个软件行业 EPD（Engineering、Product、Design）三大职能的冲击。核心论点：**EPD 的最终产出就是代码，而 Coding Agent 让写代码变得极其容易——这正在从根本上改变流程和角色定义。**

### 7.1 流程变革：PRD 已死，PRD 万岁

**传统流程（Pre-Claude 时代）：**

```
想法 → PM 写 PRD → Designer 做 Mock → Engineer 写代码
```

这套瀑布式流程存在的根本原因是实现软件需要大量时间和精力，催生了专业化分工，分工又催生了跨职能沟通的需求，PRD 是沟通的起点。Coding Agent 改变了一切——Agent 可以直接从一个想法生成可运行的软件，传统的"先写 PRD 再逐级流转"的方式已经终结。

**瓶颈从实现转向 Review：**

过去的瓶颈是"把代码写出来"，现在任何人都能通过 Agent 写代码。但这不意味着产出就是好的。EPD 的角色变成了 **审查者和仲裁者**：

| 维度 | "Great" 的含义 |
|------|---------------|
| **Engineering** | 架构可扩展、高性能、鲁棒 |
| **Product** | 真正解决了用户痛点 |
| **Design** | 界面易用、直觉化 |

代码生成成本大幅下降 → 原型数量暴增 → Review 成为新的瓶颈。这个瓶颈在 Engineering、Product、Design 三个职能中普遍存在。

**但 PRD 并没有真正死掉——** 传统 PRD 流程死了，但描述产品需求的文档依然必不可少。当别人 review 一个原型时，怎么知道某段代码是有意为之还是偶然产生？需要某种形式的 **意图沟通（intent communication）**。Harrison 提出了一个有趣的设想：

> "What if PRDs of the future are just structured, versioned prompts?"

### 7.2 角色影响：七个关键变化

**（1）通才（Generalist）比以往更有价值**

通才 = 同时具备 Product、Engineering、Design 感觉的人。沟通是一切事务中最难的部分，一个通才独自完成三项工作比三个专才组成的团队更快——因为省去了沟通开销。过去通才受制于实现瓶颈仍需协作，现在通才只需要跟 Agent 沟通，个人产出能力有了指数级提升。

**（2）使用 Coding Agent 是必修课**

不是可选项，是必须：
- **PM** 用 Agent 直接构建原型来验证想法，不再写 spec 然后等待
- **Designer** 在代码中迭代，不局限于 Figma
- **Engineer** 把时间从实现转移到系统思考

> "If you don't adopt coding agents, you will be replaced by someone who does."

**（3）好 PM 更强了，差 PM 更可怕了**

好的 Product Thinking 让你能快速构建有用的东西。差的 Product Thinking 让差 PM 带着没用的原型出现，产生巨大的惯性（"It already exists! Let's just merge it!"），消耗更多 review 资源，让产品变得臃肿。

**（4）系统思维（System Thinking）是最值得磨练的能力**

当执行成本趋近于零，系统思维成为核心区分度：

| 角色 | 系统思维的含义 |
|------|---------------|
| **Engineering** | 如何架构服务、API、数据库的心智模型 |
| **Product** | 用户真正需要什么（不是他们嘴上说的） |
| **Design** | 为什么某个东西看起来和用起来是对的 |

**（5）每个人都需要 Product Sense**

Coding Agent 仍然需要有人告诉它做什么。如果你告诉它做了错误的东西，你只是在给组织制造更多需要 review 的垃圾。Product Sense 是跨职能的基本要求——有 product sense 只需最小化 spec 就能理解意图，加速沟通、review 和交付。

**（6）专才的门槛更高了**

角色在融合（Apple、Airbnb 的 Designer 兼任 PM，Vercel 兴起 "Design Engineer"），但专才仍有空间。门槛是：你不仅要在本领域极其出色，还要能极速 review、同时是优秀的沟通者。

**（7）你要么是 Builder，要么是 Reviewer**

EPD 正在分化为两种角色原型：

- **Builder（构建者）**：拥有良好的 product thinking、能熟练使用 coding agents、具备基本的 design 直觉，在 guardrails（测试套件、组件库）的保护下独立把功能从想法推进到生产环境
- **Reviewer（审查者）**：在自己领域是极其出色的系统思考者，能高速工作，对大型复杂功能进行深入的 EPD 审查

给不同角色的建议：
- Engineer → 要么精通系统设计成为 Reviewer，要么培养 Product/Design 能力成为 Builder
- PM/Designer → 要么有极强的心智模型做 Reviewer，要么拥抱 Coding Agent 成为 Builder

### 7.3 与 Harness Engineering 的关联

这篇文章与前面几篇技术文章形成了互补——前者讲"怎么建 Harness"，这篇讲"Harness 建好后，行业会怎么变"：

| 本文观点 | Harness 视角 |
|---------|-------------|
| Coding Agent 让实现成本趋零 | Harness 让 Agent 在特定代码库中的表现大幅提升 |
| 关键是告诉 Agent 做什么 | Harness 通过 Skills、Rules、MCP 工具告诉 Agent "怎么做" |
| 需要 guardrails（测试套件、组件库） | Harness 提供 linter、test、architecture rules 等 guardrails |
| Review 是新瓶颈 | 好的 Harness 减少 review 负担（Agent 产出质量更高） |
| 未来 PRD 可能是结构化 Prompt | Harness 中的 Skill 本质上就是结构化的、可复用的 Prompt |

核心范式转变：
```
旧世界：实现是瓶颈 → 分工协作 → 沟通成本高 → 流程重
新世界：实现近乎免费 → 原型爆炸 → Review 是瓶颈 → 人才要求变了
```

---

## 八、跨公司的共同发现与关键洞察

### 8.1 独立收敛的结论

多个独立团队（Anthropic、OpenAI、LangChain、Google DeepMind、Geoffrey Huntley、David Horthy）在没有相互沟通的情况下，独立得出了相同的结论：**瓶颈是基础设施，不是智能。**

| 来源 | 案例 | 关键数据 |
|------|------|----------|
| LangChain | Terminal Bench 2.0 | 不换模型，仅改 Harness：52.8% → 66.5% |
| OpenAI | Codex 百万行代码 | 5 个月纯 Agent 编码，零手写 |
| Anthropic | 单 Agent vs 三 Agent | 同一任务，前者废品，后者可用产品 |
| DeepMind | AutoHarness | 小模型 + 自合成 Harness 击败大模型，纯代码策略击败 GPT-5.2-High |

### 8.2 Harness 的四大能力维度

综合多篇文章，可以提炼出 Harness 需要解决的四个维度：

| 维度 | 含义 | 实践手段 |
|------|------|----------|
| **Constrain（约束）** | 限制 Agent 能做什么 | 命令白名单、沙箱隔离、模块边界、架构规则、代码规范 |
| **Inform（知会）** | 告诉 Agent 应该做什么 | Context Engineering、Skills 渐进式披露、AGENTS.md、Just-in-time Retrieval |
| **Verify（验证）** | 确认 Agent 做得对不对 | 编译器/类型检查、Linter、单元测试、端到端测试（Playwright）、CI |
| **Correct（纠正）** | 纠正 Agent 的错误 | 独立评估器 Agent、反馈循环、自修复、Trace 分析 |

Anthropic 的最高杠杆建议："The highest-leverage practice is giving Claude a way to verify its work."

### 8.3 Context Engineering 是 Harness 的灵魂

所有文章都强调了上下文管理的重要性。五大策略：

1. **Compaction（压缩）**：上下文快满时总结压缩，保留关键信息丢弃冗余
2. **Structured Note-taking（结构化笔记）**：关键信息写入外部文件，需要时读回
3. **Sub-agent Architecture（子 Agent 架构）**：子 Agent 深度探索后只返回精炼摘要
4. **Just-in-time Retrieval（即时检索）**：维护轻量标识符，需要时动态加载
5. **Progressive Disclosure（渐进式披露）**：三层加载（元数据 → 目录 → 详细内容）

### 8.4 Harness 设计会随模型进化而变化

这是所有文章的一致结论，也是 Harness Engineering 的核心特征：

- 模型越来越强 → Harness 中某些组件被模型内化（如 Opus 4.6 不再需要 Sprint 分解和 Context Reset）
- 但 Harness 不会变得不重要 → 设计空间只是在移动，而非缩小
- Harness 不仅是"打补丁" → 它在模型智能周围构建系统，让智能更高效
- **每次模型升级，都应该重新审视 Harness**：去掉不再必要的部分，添加利用新能力的组件

LangChain 的结语最为精准：

> "The model contains the intelligence and the harness is the system that makes that intelligence useful."
> （模型包含智能，Harness 是让智能变得有用的系统。）

---

## 九、各公司技术选择对比

| 维度 | Anthropic | OpenAI | LangChain | Google DeepMind | Stanford (Meta-Harness) |
|------|-----------|--------|-----------|-----------------|------------------------|
| **核心架构** | Planner + Generator + Evaluator 三 Agent | 单 Agent Loop + App Server 多端分发 | 单 Agent + deepagents SDK | LLM 自动合成约束代码 + Thompson Sampling 树搜索 | Coding Agent Proposer + 文件系统 + 外层搜索循环 |
| **上下文管理** | Context Reset（V1/V2）→ SDK Compaction（V3） | Responses API `/compact` endpoint + Prompt Caching | 工具结果卸载 + 摘要压缩 + 文件系统溢出 | 不涉及（单步决策，无长时上下文问题） | Proposer 通过 grep/cat 按需查阅文件系统（~10M tokens/步） |
| **验证策略** | 独立 Evaluator Agent + Playwright MCP | 内置 shell 工具 + 用户审批机制 | 自验证循环 + 测试运行 + 循环检测 | 环境反馈驱动的迭代代码精炼（合法动作率 100%） | 评估候选 Harness 在任务集上的表现 + Pareto 前沿筛选 |
| **工具执行** | Claude Agent SDK + MCP | Codex Core（Rust）+ 沙箱 shell | ReAct loop + bash + 代码执行 | 合成的 Python harness 代码 | Claude Code（Proposer）+ 被优化 Harness 的目标运行时 |
| **跨 session 状态** | git + 进度文件 + 功能列表 JSON | Thread 持久化 + encrypted reasoning | 文件系统 + AGENTS.md + Ralph Loop | 代码即持久化（harness 代码本身就是"记忆"） | 文件系统持久化所有候选方案的代码 + Trace + 分数 |
| **多端支持** | 未公开 | App Server JSON-RPC（CLI / VS Code / Web / macOS / JetBrains / Xcode） | deepagents library | 不涉及（研究论文） | 不涉及（研究论文） |
| **对 Harness 的定义** | 设计实践（不给形式化定义） | 产品/系统名词 | 形式化定义（Agent = Model + Harness） | "LLM 和任务之间的胶水/管道代码" | "决定存储、检索、呈现什么信息给模型的代码" |
| **独特贡献** | GAN-inspired 多 Agent 对抗 + 评估器调教方法论 | Prompt Caching 工程 + 对话原语协议设计 | 六大原语推导 + 模型-Harness 耦合分析 | Harness 自动合成 + Code-as-Policy（零推理成本） | 端到端 Harness 自动优化 + 完整 Trace 诊断 + 跨模型迁移 |

---

## 参考文献

1. Anthropic. *Effective harnesses for long-running agents*. 2025.11. https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
2. OpenAI. *Unrolling the Codex agent loop*. 2026.01. https://openai.com/index/unrolling-the-codex-agent-loop
3. OpenAI. *Unlocking the Codex harness: how we built the App Server*. 2026.02. https://openai.com/index/unlocking-the-codex-harness/
4. OpenAI. *Harness engineering: leveraging Codex in an agent-first world*. 2026.02. https://openai.com/index/harness-engineering/
5. LangChain. *The Anatomy of an Agent Harness*. 2026.03. https://blog.langchain.com/the-anatomy-of-an-agent-harness/
6. Anthropic. *Harness design for long-running application development*. 2026.03. https://www.anthropic.com/engineering/harness-design-long-running-apps
7. Google DeepMind. *AutoHarness: improving LLM agents by automatically synthesizing a code harness*. 2026.02. https://arxiv.org/abs/2603.03329
8. LangChain. *How Coding Agents Are Reshaping Engineering, Product and Design*. 2026.03. https://blog.langchain.com/how-coding-agents-are-reshaping-engineering-product-and-design/
9. Yoonho Lee, Roshen Nair, Qizheng Zhang, Kangwook Lee, Omar Khattab, Chelsea Finn. *Meta-Harness: End-to-End Optimization of Model Harnesses*. 2026.03. https://arxiv.org/abs/2603.28052
