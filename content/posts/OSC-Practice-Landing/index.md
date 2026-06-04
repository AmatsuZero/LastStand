+++
date = '2026-06-04T11:00:00+08:00'
draft = false
title = '腾讯体育 Vibe Coding 实践：基于 Claude Code 的团队 AI 工作流框架落地'
tags = ['Claude Code', 'AI 辅助开发', '团队实践', 'Vibe Coding']
categories = ['工程化']
+++

## 一、背景：团队在 AI 辅助开发中的痛点

随着 Claude Code / CodeBuddy 等 AI 编程助手的普及，腾讯体育团队在日常开发中逐渐积累了大量与 AI 协作的经验。但在推广过程中，我们发现了几个反复出现的问题：

**1. 重复解释团队上下文**

每位同学使用 AI 时，都需要反复告诉它："我们的路由怎么跳转"、"我们的架构层级是什么"、"Commit 格式应该怎么写"。这些团队共有的知识，每次都要重新解释。

**2. 有效方案无法沉淀复用**

某位同学花了一下午和 Claude 反复沟通，终于摸索出某类问题的可靠解决方案。但下一位同学面对同样的问题时，却不得不从头再来——AI 不会记住上一位同学的探索成果。

**3. 规范依赖自觉，缺乏确定性保障**

可以把规范写进 Prompt，但 Agent 是否遵守取决于模型"自律"。关键的验证步骤（如编译检查、commit 格式）需要确定性的工具触发，而不是靠模型"记得做"。

**4. 社区能力与企业场景之间存在鸿沟**

Claude Code 社区（如 OMC/oh-my-claudecode）提供了优秀的多 Agent 编排、自动规划等能力，但它不了解我们团队的 tRPC/DDD 架构约定、日志规范、代码评审流程等企业特定知识。

---

## 二、核心思路："AI 时代的业务组件"

OSC（oh-sports-claudecode）的核心设计理念是：

> **一个同学与大模型反复沟通，最终沉淀出某类问题的解决方案（知识库 + Skill）；下一个同学直接复用，无需再次摸索，AI 开箱即用地理解我们的业务上下文。**

这与"业务组件"的思想完全一致——只是这里的"组件"不是 UI 组件或函数库，而是 **AI 可消费的知识与工作流**。

```
传统组件：    团队共享代码  → 减少重复实现
AI 业务组件：团队共享知识  → 减少重复沟通
```

基于这个思路，OSC 在 [oh-my-claudecode (OMC)](https://github.com/Yeachan-Heo/oh-my-claudecode) 开源框架之上，构建了一套适合腾讯体育团队的 AI 工作流体系。

---

## 三、架构设计：三层体系

OSC 采用 **知识层 → Workflow 层 → 工具层** 的三层架构，每一层职责清晰、可独立演进。

```
oh-sports-claudecode/
│
├── knowledge/                          ★ Layer 1: 知识层
│   ├── common/rules/                  通用规范（注入 CLAUDE.md）
│   │   ├── execution.md               执行连续性 + 知识锚定 + 提交规范
│   │   ├── review.md                  CR 规范 + 写审分离
│   │   └── verification.md            完整性验证 + 契约清单
│   ├── backend/rules/                 后端角色规范（注入）
│   │   ├── go-team-conventions.md    Go 团队约定（tRPC/DDD）
│   │   ├── dev-workflow.md            自动路由 + 轻量 AC 清单
│   │   ├── unit-testing.md           GoMock + testify 单测约定
│   │   └── trpc-mcp-usage.md        tRPC MCP 使用策略
│   ├── backend/docs/                  参考文档（按需读取，不注入）
│   ├── ios/rules/                    iOS 角色规范
│   ├── frontend/skills/              前端 osc-fe 技能集合
│   └── android/rules/                Android 角色规范
│
├── skills/                            ★ Layer 2: Workflow 层
│   ├── osc-setup/                    /osc-setup 一键初始化
│   ├── osc-update/                   /osc-update 一键更新
│   ├── osc-ap/                       完整研发 workflow
│   ├── osc-parallel/                 多分支并行开发
│   └── osc-review-code/              MR 代码评审
│
├── scripts/                           ★ Layer 3: 工具层
│   ├── merge-settings.py             知识库注入 CLAUDE.md
│   ├── apply-patches.sh             Patch 应用（LLM 驱动）
│   ├── detect-structural-changes.sh  Hook: 检测结构性变更
│   └── check-knowledge-size.sh      CI: 知识库行数门控
│
├── patches/                          OMC 定制补丁（按版本沉淀）
└── templates/                        项目 CLAUDE.md 模板
```

### 三层之间的协作关系

```
┌─────────────────────────────────────────────────────┐
│                  用户触发命令                        │
│            /osc-setup  /osc-ap  /osc-parallel       │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │   Layer 2: Workflow │  技能编排（Skills）
         │   (osc-ap 等)      │
         └─────────┬──────────┘
                   │ 读取知识 + 调用工具
         ┌─────────▼──────────┐
         │   Layer 1: 知识层   │  团队规范（注入 CLAUDE.md）
         │   (rules/docs)     │  + 按需读取的参考文档
         └─────────┬──────────┘
                   │ 调用
         ┌─────────▼──────────┐
         │   Layer 3: 工具层   │  确定性执行（scripts/hooks）
         │   (scripts/hooks)  │  + CI 门控
         └─────────────────────┘
```

---

## 四、设计原则：有所为有所不为

在设计 OSC 时，我们制定了几条关键的设计原则，这些原则指导了每一个设计决策。

### 原则 1：有所为有所不为

**团队做的事（不可替代的价值）**：

- tRPC/DDD 业务知识 → `knowledge/<role>/rules/`
- 团队 SDK 陷阱沉淀 → `knowledge/<role>/rules/`
- 团队执行规范增强 → `knowledge/common/rules/`
- 轻量 AC 清单与验收约束 → `knowledge/<role>/rules/`
- 场景化 Workflow → `skills/osc-*`
- OMC 定制补丁 → `patches/`
- CI 集成钩子 → `scripts/`

**社区做的事（我们不重复造轮子）**：

| 能力 | 来源 |
|------|------|
| Agent 连续执行循环 | OMC ralph/autopilot |
| 多 Agent 编排 | OMC team/ultrawork |
| 上下文压缩 | Claude Code compaction |
| 写审分离 | OMC code-reviewer agent |
| Git worktree | Claude Code / Superpowers |
| 通用编码规范 | 大模型训练数据 |
| 调试方法论 | Superpowers systematic-debug |
| 知识锚定 | OMC operating_principles |
| 反馈循环分离 | OMC execution_protocols |

### 原则 2：导航地图 > 百科全书

注入 CLAUDE.md 的内容总计 **≤ 200 行**（非空行），详细文档放在 `docs/` 目录按需读取。

**原因**：CLAUDE.md 作为 system prompt 的一部分，每一行都消耗 token。我们应该提供"导航地图"（告诉 AI 去哪里找），而不是"百科全书"（把所有细节都塞进去）。

```
rules/     → 注入 CLAUDE.md，AI 启动时直接可用（小文件 < 100 行）
docs/      → 按需读取，Skill 执行时再加载完整内容
```

### 原则 3：Linter-as-Guardrails

**能用确定性工具（CI/linter/pre-commit）验证的规范，不写进 prompt。**

例如："Edit *.go 文件后必须运行 go build" 这条规则，如果只写在 execution.md 里，靠 Agent 自律执行，可靠性很低。我们通过 PostToolUse Hook 确定性触发：

```json
// templates/hooks.json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "glob": "*.go",
      "command": "bash scripts/hook-auto-build.sh"
    }
  ]
}
```

### 原则 4：渐进式自主权

| 阶段 | 人工干预程度 | 目标 |
|------|-------------|------|
| Phase 1 | 高（人工确认关键决策） | 基线收敛，建立最小闭环 |
| Phase 2 | 中（半自动） | 显式 workflow + 评审闭环 |
| Phase 3 | 低（高自主） | 自动化护栏 + 并行开发 |

### 原则 5：Worktree 隔离并行

多分支并行通过 Git worktree 实现，每个 worktree 拥有独立的 `.omc/state/` 和 `.omc/plans/`，避免 Agent 状态互相覆盖。

---

## 五、知识层：让 AI 理解团队上下文

### 5.1 核心设计：Rules vs Docs 双轨制

知识层的核心问题是：**哪些知识应该每次会话都加载，哪些可以按需读取？**

OSC 的解法是 **Rules（注入）+ Docs（按需）** 双轨制：

```
knowledge/backend/
├── rules/                        ← 自动注入到项目 CLAUDE.md
│   ├── go-team-conventions.md   ← 核心约定（组件选型、tRPC 用法、DDD 分层）
│   ├── dev-workflow.md          ← 自动路由规则 + 轻量 AC 清单
│   ├── unit-testing.md          ← 单测规范
│   └── trpc-mcp-usage.md       ← MCP 使用策略
│
└── docs/                        ← 按需读取（Skill 执行时加载）
    ├── go-standards-full.md     ← Go 编码规范完整版
    ├── trpc-architecture-full.md← DDD 架构完整版（含 CRUD 示例）
    ├── trpc-config.md           ← tRPC 配置详解
    └── security.md              ← 安全规范
```

**注入方式**：`merge-settings.py` 在 `/osc-setup` 时，将 `knowledge/common/rules/*.md` 和 `knowledge/<role>/rules/*.md` 的内容合并写入目标 CLAUDE.md 的 `<!-- OSC-BEGIN -->` 和 `<!-- OSC-END -->` 标记之间。

### 5.2 自动路由：让 AI 自主决策开发路径

`dev-workflow.md` 实现了自动路由机制，AI 根据需求清晰度、风险级别、变更范围自动决策：

```
用户："实现 XX 功能"
    │
    ├── 1-2 文件小改动 → 快速流程（Edit → Build → Test）
    │                    └── 若含逻辑变更，再补独立 review
    │
    ├── 需求模糊 → 转 /deep-interview（苏格拉底式需求访谈）
    ├── 方案未定 → 转 /omc-plan（结构化规划）
    ├── 高风险变更 → 转 /ralplan（架构决策）
    │
    └── 进入实现阶段 → 生成轻量 AC 清单（非小改动）
                     → /autopilot 执行
                     → 独立 review
                     → 有 MR 时进入 /osc-review-code ↔ /osc-review-mr 闭环
```

### 5.3 轻量 AC 清单：让验收可审计

旧版设计依赖 `prd.json` 作为核心验收产物，但实际落地中发现维护成本较高。当前方案改为 **轻量 AC 清单**，直接嵌入 plan / skill / 交付流程：

| 字段 | 用途 |
|------|------|
| `ID` | Story / Task 编号 |
| `目标` | 这一项到底要交付什么 |
| `AC` | 具体验收条件，禁止写"完成开发"这类空话 |
| `验证方式` | 对应测试、命令、日志、接口行为或人工检查点 |
| `完成证据` | 执行后用于判定 PASS / FAIL 的结果 |

**完成判定矩阵**：

| 场景 | 必需条件 |
|------|---------|
| 快速流程（纯格式/文档） | build + test |
| 快速流程（逻辑修改） | build + test + 独立 review |
| 完整流程（无 MR） | 轻量 AC 清单收口 + /autopilot QA/Validation + 独立 review |
| 完整流程（有 MR） | 上述条件 + /osc-review-code ↔ /osc-review-mr 闭环 |

---

## 六、Workflow 层：场景化 Skill 编排

Workflow 层的核心是 **将团队研发流程沉淀为可复用的 Skill**，让 AI 按照团队约定的流程执行。

### 6.1 两条研发路径

OSC 提供两条研发路径，适用不同场景：

**路径 A：自动路由**（dev-workflow.md 控制，当前已实现）

```
用户直接描述任务 → AI 自动判断路由 → 小改动快速流程 / 大改动进入 autopilot
```

- 触发方式：自然语言描述任务
- 确认方式：默认自治推进，必要时向用户澄清
- 核心目标：最少决策成本

**路径 B：/osc-ap**（显式完整 workflow）

```
/osc-ap "<TAPD_URL 或文本需求>"
    → 输入归一化 → 按需澄清 → 规划 → 轻量 AC 清单
    → ★ 展示给用户确认 ★
    → 用户 Approve → /autopilot 执行
                     → 独立评审
                     → MR 阶段 /osc-review-code
                     → /osc-review-mr 修复评论并回环
```

- 触发方式：用户主动敲 `/osc-ap`
- 确认方式：编码前强制人工确认 AC 清单
- 核心目标：把完整研发链路显式编排成统一入口

### 6.2 核心 Skill 详解

#### `/osc-setup` — 一键初始化

这是新同学接入 OSC 的第一步，也是最重要的 Skill：

```
/osc-setup
    → Step 1: 确认 OMC 已安装
    → Step 2: 选择开发角色（ios / backend / frontend / android / harmony）
    → Step 3: 选择注入位置（项目级推荐，可提交 git 团队共享）
    → Step 4: 判断当前环境（claude-internal / claude / codebuddy）
    → Step 5: 定位并执行 osc-setup-run.sh 脚本
          ├── 注入知识库到 CLAUDE.md（调 merge-settings.py）
          ├── 生成 .claude/osc-config.json
          ├── 安装角色专属 Skills
          ├── 安装 osc 启动脚本并配置 PATH
          ├── 合并 MCP 配置（调 merge-mcp.py）
          └── CodeBuddy 环境：修复 OMC 兼容性
    → Step 6: 展示结果
```

**设计亮点**：Claude 只负责采集参数（角色、注入位置、环境），全部安装操作由 `osc-setup-run.sh` 脚本完成。这种"AI 采集 + 脚本执行"的模式，既利用了 AI 的自然语言交互能力，又保证了安装过程的确定性。

#### `/osc-update` — 一键更新

```
/osc-update
    → 拉取 OSC 最新版本（Plugin 机制）
    → 更新 OMC 到最新版本
    → 应用 patches/ 目录下的定制补丁（LLM 驱动）
    → 重新注入知识库到 CLAUDE.md
```

#### `/osc-ap` — 完整研发 workflow

这是 OSC 最核心的 Skill，将 OMC 的多个能力编排成统一的研发入口：

```
/osc-ap "https://tapd.woa.com/xxx"
    │
    ├── 输入归一化（TAPD URL / PRD 文本 / 自然语言）
    ├── 按需澄清（需求模糊时调用 /deep-interview）
    ├── 按需规划（方案未定时调用 /omc-plan）
    ├── 生成轻量 AC 清单
    ├── ★ 展示给用户确认 ★（关键卡点）
    ├── 用户 Approve → 调用 /autopilot 执行
    ├── 独立评审（写审分离）
    └── 有 MR 时 → /osc-review-code + /osc-review-mr 闭环
```

#### `/osc-parallel` — 多分支并行开发

当需求可拆分时，多 Agent 并行可大幅缩短交付周期：

```
/osc-parallel "feature-A: 实现登录" "feature-B: 重构支付"
    │
    ├── 自动判断可并行性（需求已清晰 + 2-3 个低耦合子任务）
    ├── 为每个子任务创建 worktree + Author Task
    ├── Author claim 任务 → in_progress
    ├── 完成后提交证据 → ready_for_review
    ├── Team Lead 创建 Reviewer Task
    ├── Reviewer 给出 pass / changes_required / blocked
    ├── 通过后 Team Lead 标记 verified
    └── Merge Keeper 顺序合并（每次合并后 build/test）
```

**可并行判断标准**（全部满足）：

```
任务 A 和任务 B 可以并行：
├── 不修改同一个文件
├── 不修改同一个 proto 定义
├── 不同时改 go.mod/go.sum
├── 不存在数据依赖（A 的输出不是 B 的输入）
└── 各自可独立编译通过
```

**状态机**：

```
pending → in_progress → ready_for_review → verified → completed
                                  ↓
                              blocked（冲突或超时）
```

---

## 七、工具层：确定性执行保障

### 7.1 PostToolUse Hooks：从"自律"到"他律"

将规则从"Agent 自律"迁移到"确定性工具触发"，是 OSC 工具层设计的核心思想。

**Hook 配置**（templates/hooks.json）：

| 触发条件 | 行为 | 用途 |
|---------|------|------|
| `Edit/Write *.go` | 提醒 `go build ./...` | 变更即验证（规则确定性执行） |
| `git commit` | `detect-structural-changes.sh` | 检测新增/删除文件，提醒更新项目 CLAUDE.md |

**detect-structural-changes.sh** 的检测逻辑：

```bash
git commit 后：
    ├── 新增/删除文件 ≥ 3       → 提醒运行 /osc-init-project
    ├── proto 文件变更           → 提醒更新 CLAUDE.md 模块清单
    ├── go.mod/go.sum 变更       → 提醒更新依赖说明
    └── 仅内部逻辑/bugfix        → 不提醒
```

### 7.2 merge-settings.py：知识库注入与行数门控

`merge-settings.py` 负责将知识库内容注入到 CLAUDE.md，同时内置了 **≤ 200 行** 的门控：

```python
# 核心逻辑
for subdir in ["common/rules", f"{role}/rules"]:
    for md_file in glob(f"{subdir}/*.md"):
        content = read(md_file)
        if len(non_empty_lines(content)) < 100:
            inline(content)   # 小文件直接内联
        else:
            reference(md_file)  # 大文件以路径引用方式注入
```

```bash
# 行数门控（CI 模式）
python3 merge-settings.py --role backend --max-lines 200
# 注入后超过 200 行则报错退出
```

### 7.3 Patch 系统：定制 OMC 而不 fork

当我们希望修改 OMC 的行为时（如汉化某个 Skill 的提示词），不直接 fork OMC，而是以 **Markdown 格式的 patch** 沉淀到 `patches/` 目录：

```
patches/
└── 001-skill-prompt-zh/
    └── ultrawork-SKILL-zh.md
```

**Patch 格式**（YAML frontmatter + 修改指令）：

```yaml
---
target: skills/ultrawork/SKILL.md   # 相对于 OMC 根目录的路径
type: content-replace                # content-replace | append | js-patch
min_omc_version: "4.0.0"
description: "将 ultrawork skill 汉化"
---

# 修改指令（LLM 解释执行）
请将该 SKILL.md 中的所有英文提示词翻译为中文，
保持 YAML frontmatter 格式不变...
```

**应用方式**：执行 `/osc-update` 时，`apply-patches.sh` 将每个 patch 和目标文件一起喂给 LLM（`claude --print`），由 LLM 生成修改后的输出。

**为什么用 LLM 应用 patch，而不是传统 diff？**

传统 diff patch 在 OMC 升级时容易因为上下文变化而失效。LLM 驱动的 patch 系统通过自然语言指令描述"要做什么改动"，对目标文件的具体措辞变化更鲁棒。

---

## 八、跨 Session 上下文同步

### 8.1 问题

```
需求变更 → 代码改了 → 但项目 CLAUDE.md 没更新
→ 新 session 冷启动 → Agent 基于过时地图工作
→ 浪费 token 重新探索或做出错误决策
```

### 8.2 解决方案：分层持久化 + 两个触发时机

**两个存储的定位**：

| | 项目根 CLAUDE.md | project-memory |
|---|---|---|
| **本质** | 项目"导航地图" | Agent"工作笔记本" |
| **读取时机** | Claude Code 启动时作为 system prompt | OMC session 启动时注入上下文 |
| **更新频率** | 低（仅结构性变更） | 高（每次 session 结束） |
| **生命周期** | 入 git，跟随项目版本 | .omc/ 目录，不入 git |
| **大小约束** | 需精简（占 system prompt token） | 无硬限制（OMC 做 compaction） |

**触发时机 1：session 结束前**

```
session 有代码变更？
    ├── project_memory_add_note          ← 每次都写（变更摘要）
    ├── notepad_write_working           ← 有未完成工作时写
    └── 是否结构性变更？
        ├── 新增/删除目录或模块         → ✅ 更新 CLAUDE.md 模块清单
        ├── 新增 tRPC service          → ✅ 更新 CLAUDE.md 模块清单
        ├── 新增外部系统对接           → ✅ 更新 CLAUDE.md 外部依赖
        └── 仅内部逻辑/bugfix         → ❌ 不更新 CLAUDE.md
```

**触发时机 2：新 session 冷启动**

```
1. Claude Code 自动加载 CLAUDE.md        → 项目地图
2. OMC 自动加载 project-memory            → 运行时上下文
3. git log --oneline -10                  → 最近变更概览
4. 检查 .omc/plans/ + notepad             → 未完成工作
5. CLAUDE.md 模块清单 vs 实际目录          → 不一致则主动更新
```

---

## 九、OMC team 与 OSC 并行协议职责边界

在多 Agent 并行开发中，明确"社区能力"和"团队协议"的职责边界至关重要。

| 层次 | 直接复用 OMC / 社区能力 | OSC 并行协议补充 |
|------|------------------------|------------------|
| 运行时 / 编排 | `OMC team`、`TaskList`、`SendMessage`、`git worktree` | 不重复实现 |
| 任务领取 | 通用 task 原语 | Author claim 顺序、owner 写入、抢占失败重读 |
| 评审分工 | `code-reviewer` 等只读 reviewer | Reviewer Task 字段模板、写审分离、`pass/changes_required/blocked` 约束 |
| 状态机 | 通用 pending/in_progress | `ready_for_review`、`verified`、`blocked`、`completed` 的团队语义 |
| 消息协作 | `SendMessage` 原语 | Author/Reviewer/Lead 的标准消息模板 |
| 合并收口 | Git merge / rebase | Merge Keeper、仅 `verified` 可合并、合并后 build/test |
| 异常处理 | 通用 team 协调 | 20/30/40 分钟超时分级、Lead 裁决、串行化/重分配策略 |

**结论**：OMC team 负责"能并行"，OSC 并行协议负责"并行后如何稳定交付"。

---

## 十、分阶段落地：从基线到并行

OSC 的实施采用分阶段、渐进式推进的策略，确保每一阶段都有可验证的产出。

### Phase 1：基线收敛 ✅ 已完成

**目标**：把通用规范、自动路由规则和根 CLAUDE.md 同步机制收敛到可落地的最小闭环。

**交付物**：
1. `knowledge/common/rules/` 收敛为 `execution.md` / `review.md` / `verification.md`
2. `knowledge/backend/rules/dev-workflow.md` 明确为"自动路由 + 交付收尾检查"
3. 项目根 `CLAUDE.md` 成为唯一项目地图同步目标
4. `scripts/detect-structural-changes.sh` + `templates/hooks.json` 覆盖结构性变更提醒

### Phase 2：显式 workflow 与评审闭环 ✅ 已完成

**目标**：在自动路由之外，提供一个可人工确认、可终审闭环的完整研发入口。

**交付物**：
1. `osc-ap` Skill — TAPD/文本 → 澄清 → 规划 → 轻量 AC 清单 → 人工确认 → /autopilot → 独立评审
2. `osc-review-code` Skill — MR 终审 reviewer 入口
3. `osc-review-mr` Skill — author 侧修复评论并回复

### Phase 3：自动化护栏与并行能力 🔄 进行中

**目标**：把"规则靠自觉"继续迁移到 hooks、脚本和可复用 workflow 上，同时支持受控并行开发。

**已完成**：
1. `osc-verify` Skill — build → test → lint 验证循环
2. `osc-parallel` Skill — worktree + team 并行开发协议
3. `check-commit-msg.sh` — CI commit 格式检查

**待持续演进**：
1. 持续把高价值踩坑沉淀进 rules/docs
2. 继续把评审、验证、结构同步做成更强的确定性触发

### Phase 4：多端扩展（规划中）

1. iOS / Frontend / Android 角色知识库继续补齐
2. 更多场景化 workflow（重构、多端协同）
3. 结合团队真实使用反馈，继续删减重复规则

---

## 十一、Pre-Mortem：风险与缓解

在设计阶段，我们主动进行了 Pre-Mortem 分析，识别潜在风险并制定缓解措施。

| # | 场景 | 可能性 | 影响 | 缓解措施 |
|---|------|--------|------|----------|
| 1 | OMC 大版本升级 patch 失效 | 高 | 高 | Markdown patch + LLM 应用 + 优先上游 PR |
| 2 | 团队不愿转型 | 中 | 高 | 先行者试点；Phase 1 效率提升 < 20% → 止损回退 |
| 3 | 多 Agent 并行质量下降 | 中 | 中 | worktree 隔离 + 合并前全量测试 + ≤3 并行 |
| 4 | CLAUDE.md 膨胀 compaction 丢规则 | 高 | 高 | merge-settings.py --max-lines 200 门控 |
| 5 | 轻量 AC 清单写得太泛导致虚标完成 | 高 | 高 | dev-workflow.md 质量基线 + /osc-ap 人工确认 + 独立 review |

---

## 十二、总结与展望

### 12.1 核心成果

OSC 框架在腾讯体育团队的落地，实现了以下几个核心成果：

1. **知识复用**：团队成员的探索成果沉淀为知识库，新同学开箱即用
2. **规范自动化**：从"靠自觉"到"确定性触发"，关键验证步骤由 Hook 保障
3. **Workflow 固化**：团队研发流程沉淀为可复用的 Skill，AI 按约定流程执行
4. **并行加速**：多 Agent 并行开发协议，让需求交付周期缩短

### 12.2 关键设计决策回顾

| 决策 | 理由 |
|------|------|
| 基于 OMC 而非从零构建 | OMC 提供了成熟的多 Agent 编排能力，团队只需叠加业务知识 |
| Rules 注入 + Docs 按需读取 | 平衡 token 消耗与信息完整性 |
| LLM 驱动 patch 应用 | 相比传统 diff，对 OMC 升级更鲁棒 |
| 写审分离 + 独立 review | 避免 Agent 既写代码又当最终评审者的偏差 |
| ≤3 并行分支 | 合并冲突概率随并行数指数增长，需要可控 |

### 12.3 下一步展望

1. **更多端的支持**：iOS / Frontend / Android 角色知识库继续补齐
2. **更强的自动化护栏**：把评审、验证、结构同步做成确定性触发
3. **社区反哺**：将 OSC 中通用的设计（如 patch 系统、并行协议）抽象为 OMC 社区贡献

---

## 附录：快速上手

```bash
# 1. 安装 OMC（Claude Code 对话框中手动执行）
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode

# 2. 安装 OSC
/plugin marketplace add git@git.woa.com:QQSports_iOS/oh-sports-claudecode.git
/plugin install oh-sports-claudecode

# 3. 初始化（选择角色、注入知识库）
/osc-setup

# 4. 日常使用
osc                              # 启动 claude-internal（腾讯内网版）
osc --binary claude              # 使用标准 claude 启动

# 5. 同步更新
/osc-update
```
