---
title: "GitLab 专项定时流水线混入安全扫描与自启用 Job"
date: 2026-11-17T09:20:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "GitLab"]
---

## 现象（symptom）

UI 自动化的定时流水线额外运行 `semgrep-sast` 与 `dependency-scanning`，还生成了
无用代码扫描 Job。另一个编译耗时专项原计划只有 Build 与 Analyze，实际生成五个 Job，
其中也包含上述安全扫描和无用代码扫描。

UI 流水线中的无用代码扫描当次显示 skipped，只因前序测试失败；它已经进入 Job 图，
不能据此认定隔离有效。安全扫描为 success 也不表示它属于该专项。

## 已验证成因（verified cause）

1. 宿主引入的安全扫描模板保留了分支触发规则。定时流水线也有分支身份，专项 workflow
   允许创建流水线，并不会自动排除模板里的其他 Job。
2. 无用代码扫描 Job 自己在 `variables` 中设置 `IOS_DEAD_CODE_SCAN: "1"`，同时用
   同名变量作为 `rules:if` 的启用条件。实际 UI 与编译耗时 Schedule 都未携带该开关，
   该 Job 仍进入图中；触发选择与 Job 自身的运行配置发生耦合。
3. 本地规则测试只向表达式传入人工构造的环境，没有合并 Job 局部变量；它还跳过了
   由外部 include 引入的安全扫描 Job。因此“只选两个 Job”的本地断言通过，实际服务端图仍不同。

## 有效恢复（effective recovery）

本次仅做审计与止损：保持新 Schedule 为 disabled，取消本次手动触发的验证流水线，
避免额外的扫描和编译继续消耗 Runner。没有改动其他既有定时任务或生产 CI 配置。

现有维护专用 Schedule 的对照已验证：显式设置 `SAST_DISABLED=true` 与
`DEPENDENCY_SCANNING_DISABLED=true`，最近一次运行各只有一个预期维护 Job。
这证明这些维护任务的隔离生效，尚不等于其他专项已经修复。

待修复方向：专项统一限制安全扫描；触发开关只来自 pipeline/Schedule，Job 局部变量
不要自行置位同名开关；各专项显式排除其他模式。修改后先验证服务端图，再进行必要的实跑。
避免为了禁用 schedule 扫描而替换整份模板规则，意外扩大 tag 或其他来源的触发范围。

## 边界（boundaries）

- “无关”按专项职责判断。安全扫描应保留其正常 MR/集成流程职责，不应全局关闭。
- 工作流放行只决定能否建立 pipeline，不是其中 Job 的允许列表。
- 取消本次验证不能证明远端分析、报告与历史基线可用；这些仍需独立验收。
- 不通过修改公共 Runner 或清空共享缓存来修复规则选错任务。

## 证据（evidence）

审计读取四个现有 Schedule 的变量与最近真实 Job 列表，包含重试记录：

| 专项 | 实际 Job 图 |
| --- | --- |
| 周期磁盘检查 | 一个磁盘检查 Job |
| 每日清理 | 一个清理 Job |
| 无用代码扫描 | 扫描、Wiki 发布、两个安全扫描 |
| UI 自动化 | UI 测试、两个安全扫描、skipped 的无用代码扫描 |

新建编译耗时 Schedule 保持 disabled，手动验证实际生成五个 Job。发现混入任务后取消，
并回读确认 pipeline 为 canceled。数据来自实例 API 与日志，不以本地规则解析器代替。
