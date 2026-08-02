+++
title = "腾讯-2年社招-前端面试 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/78"
experienceId = 78
roundId = 126
roundOrder = 1
company = "腾讯"
date = "2025-09-07T02:17:29.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-78/round-125/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-78/_index.md" >}}) · 已是最后一轮 →

本轮共 9 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下你觉得比较有亮点的项目 {#question-subjective-9a287344c514}

### 题目要点

技术选型合理性、渐进式迁移策略、自动化工具、性能保障

<details>
<summary>参考答案</summary>

在负责的一个大型电商平台重构项目中，面临着从传统 jQuery 架构向现代化 Vue 3 + TypeScript 架构迁移的挑战。项目的亮点在于采用了渐进式迁移策略，通过微前端架构实现新老系统的平滑过渡。设计了一套自动化的代码转换工具，将重复性的迁移工作自动化，提升了整体迁移效率 60%。同时建立了完善的性能监控体系，确保迁移过程中用户体验不受影响。

</details>

## 2. 项目的难点，你是怎么推动的 {#question-subjective-3d6a09a5ba0d}

### 题目要点

风险控制、分阶段实施、灰度发布、跨团队协作

<details>
<summary>参考答案</summary>

最大的难点是在不影响线上业务的前提下完成大规模重构。通过制定详细的迁移计划，将整个项目拆分为多个独立的里程碑，每个阶段都有明确的交付物和验收标准。建立了灰度发布机制，新功能先在小范围用户中验证，逐步扩大覆盖范围。同时与产品、测试、运维团队建立了紧密的协作机制，确保各个环节的顺畅衔接。

</details>

## 3. 页面性能优化你做了哪些工作 {#question-subjective-3118e233931d}

### 题目要点

多维度优化、量化效果、监控体系、持续改进

<details>
<summary>参考答案</summary>

从多个维度进行了系统性优化：资源层面实施了代码分割和懒加载，将首屏加载时间减少 40%；网络层面启用了 HTTP/2 和资源预加载，优化了关键渲染路径；渲染层面使用了虚拟滚动和组件缓存，提升了长列表的交互性能；同时建立了性能监控体系，通过 Performance API 和用户行为分析持续跟踪优化效果。

</details>

## 4. 相关的指标有哪些，怎么去衡量的，标准是什么 {#question-subjective-d7098a03adf1}

### 题目要点

Core Web Vitals、RUM监控、分类基准、持续监测

<details>
<summary>参考答案</summary>

建立了完整的性能指标体系：Core Web Vitals 作为核心指标，包括 LCP（2.5s 以内）、FID（100ms 以内）、CLS（0.1 以内）；业务指标包括首屏加载时间、页面完全加载时间、接口响应时间等。通过 RUM（真实用户监控）收集线上数据，结合 Lighthouse 进行定期检测。制定了不同页面类型的性能基准，如首页 LCP 控制在 2s 内，列表页控制在 2.5s 内。

</details>

## 5. WebSocket 协议原理 {#question-95185ca6-291f-4160-b65d-f291dfdf8a4f}

> 题库原题：[说下 websocket 的连接原理](https://fe.ecool.fun/topic/95185ca6-291f-4160-b65d-f291dfdf8a4f)

### 题目要点

**答题要点：**

WebSocket是一种基于TCP协议的双向通信机制，它通过以下原理实现客户端与服务器间的实时数据交互：

1. **利用HTTP建立连接**：通过包含特殊头部字段的HTTP请求进行握手，以初始化连接。
2. **建立TCP连接**：在HTTP连接基础上，客户端和服务器建立TCP连接，并交换加密和压缩参数。
3. **双向通信**：TCP连接建立后，双方可随时发送消息，无需HTTP请求，直接通过连接传递数据。
4. **断开连接**：任一方发送控制帧来关闭连接。

WebSocket首次连接较慢，因为需要握手过程。连接建立后，需维持长时间状态，考虑网络稳定性、负载均衡和错误处理。

WebSocket适用于需要实时交互的应用，如在线游戏、即时通讯和实时监控，它在实时性、效率和安全性方面具有优势。

<details>
<summary>参考答案</summary>

WebSocket 是一种基于 TCP 协议的双向通信协议，它可以在客户端和服务器之间建立持久性的连接，实现实时的数据传输和交互。其主要原理如下：

1. 利用 HTTP 建立连接：WebSocket 的连接需要通过 HTTP 请求首先建立握手（Handshaking）过程，该过程类似于普通的 HTTP 请求，但包含了一些特殊的头部字段，例如 Upgrade 和 Connection 等。

2. 建立 TCP 连接：建立 HTTP 连接之后，客户端和服务器之间会建立一个 TCP 连接，并交换协商的加密和压缩参数等。

3. 双向通信：建立好 TCP 连接之后，就可以进行双向通信了。客户端和服务器都可以在任意时刻发送消息，并且不需要发送 HTTP 请求或响应，而是直接通过已经建立好的连接进行数据的传递和处理。

4. 断开连接：当双方其中一方决定关闭连接时，会发送一个特殊的控制帧（Close Frame），告知对方关闭连接。

需要注意的是，在 WebSocket 的连接过程中，由于需要进行 Handshaking 过程，因此第一次连接较慢。同时，在建立连接之后，需要保持长时间的连接状态，因此需要考虑网络稳定性、负载均衡和错误重试等问题，以保证连接的可靠性和稳定性。

WebSocket 是一种基于 TCP 的双向通信协议，通过建立长时间的持久连接来实现客户端和服务器之间的实时数据传输和交互。它在实时性、效率和安全性等方面都有很大的优势，适用于在线游戏、即时聊天、实时监控等领域。

</details>

## 6. 代码质量是如何保证的 {#question-subjective-215b15671388}

### 题目要点

静态检查、自动化测试、Code Review、规范文档

<details>
<summary>参考答案</summary>

建立了多层次的质量保障体系：开发阶段通过 ESLint、Prettier、TypeScript 进行静态检查；提交阶段使用 Husky 和 lint-staged 进行代码规范检查；CI/CD 流程中集成了单元测试、集成测试和 E2E 测试；Code Review 机制确保每个 PR 都经过同行评审。同时制定了编码规范文档，定期进行代码质量分析和技术债务清理。

</details>

## 7. 团队管理过程中遇到了什么问题，是怎么解决的 {#question-subjective-6ff76fe9235a}

### 题目要点

敏捷流程、沟通机制、变更控制、跨团队协作

<details>
<summary>参考答案</summary>

在跨部门协作项目中遇到了需求频繁变更和进度协调困难的问题。通过引入敏捷开发流程，建立了每日站会和迭代回顾机制，提高了团队沟通效率。针对需求变更，建立了需求评审和变更控制流程，确保变更的合理性和可行性。同时加强了与产品和设计团队的协作，通过定期的跨团队会议和共享文档，保持信息同步。

</details>

## 8. 你能给团队带来什么 {#question-subjective-7861e06046d5}

### 题目要点

技术专业性、知识分享、协调能力、技术前瞻性

<details>
<summary>参考答案</summary>

在技术方面，具备扎实的前端基础和丰富的项目经验，能够在技术选型和架构设计上提供专业建议。在团队协作方面，注重知识分享和团队成长，通过技术分享会和 Code Review 帮助团队成员提升技能。在项目管理方面，具备良好的沟通协调能力，能够推动项目顺利进行。同时保持对新技术的敏感度，为团队引入合适的技术方案。

</details>

## 9. 如果你们组一个实习生，他本地 git 的 A 分支被误删了，A 分支代码没有被 push 到远程，如何找到之前的提交记录和代码 {#question-subjective-20a3a0d07f57}

### 题目要点

git reflog、提交恢复、fsck命令、预防机制

<details>
<summary>参考答案</summary>

首先使用 `git reflog` 查看本地的引用日志，找到 A 分支被删除前的最后一次提交 hash。然后通过 `git checkout -b A <commit-hash>` 重新创建 A 分支并恢复到指定提交。如果 reflog 也被清理了，可以尝试使用 `git fsck --lost-found` 查找悬空的提交对象。为了避免类似问题，建议建立定期备份机制和分支保护策略，同时培训团队成员养成及时推送代码的习惯。

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-78/round-125/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-78/_index.md" >}}) · 已是最后一轮 →
