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
4. 当前实例内置的 `Dependency-Scanning.v2` 规则不读取 `DEPENDENCY_SCANNING_DISABLED`。
   在专项 workflow 同时设置两个 scanner disabled 变量后，CI Lint 仍选中依赖扫描，
   只有 SAST 被排除。合并配置显示 v2 仅检查 MR、已打开 MR 和分支三个条件。

## 有效恢复（effective recovery）

先保持新 Schedule 为 disabled，并取消混入任务的手动验证流水线，避免继续消耗 Runner。
随后在独立分支完成以下修复，暂不修改既有定时任务或启用新任务：

1. 移除无用代码 Job 局部的触发开关，保留 KMP 等实际运行配置。触发开关由 Schedule 提供。
2. 三类专项 workflow 设置 `SAST_DISABLED=true`，保留 SAST 模板原有规则。
3. 依赖扫描显式先排除 `schedule`，其余条件完整保留当前实例 v2 模板的三个规则，
   不用简单的 MR/分支放行替换它们，防止扩大 tag 或重复 push 的扫描范围。
4. 补齐 UI 与无用代码同时启用时的 workflow 拒绝规则，三个模式两两互斥。
5. 本地测试合并 Job 局部变量，其他模式开关默认缺省；另由服务端展开外部模板验证实际 Job 图。

维护专用 Schedule 虽然同时带两个 disabled 变量且最近只有一个维护 Job，
但它使用独立配置，不能据此推断 v2 模板支持同名变量。模板能力要读合并配置并单独验证。

## 边界（boundaries）

- “无关”按专项职责判断。安全扫描应保留其正常 MR/集成流程职责，不应全局关闭。
- 工作流放行只决定能否建立 pipeline，不是其中 Job 的允许列表。
- 取消本次验证不能证明远端分析、报告与历史基线可用；这些仍需独立验收。
- 不通过修改公共 Runner 或清空共享缓存来修复规则选错任务。
- 显式保留的 v2 规则来自当前实例，升级 GitLab 后需要重新比较上游合并规则。
- CI Lint 的 dry-run 不消耗 Runner。本次仅在临时请求 YAML 中覆盖来源和模式变量，
  以 develop 为 ref 做规则模拟；不能把模拟成功说成真实定时任务已执行成功。

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

修复后的服务端 dry-run 使用实例当前安全模板：

| 专项 | 修复前 Job 数 | 修复后 Job 图 |
| --- | --- | --- |
| UI 自动化 | 4 | 仅 UI 测试 |
| 无用代码扫描 | 4 | 扫描、Wiki 发布 |
| 编译耗时 | 5 | Build、Analyze |

普通 MR、develop push、已有 MR 的分支 push、beta/release tag 的修复前后 Job 图相同；
混合开关、无模式与非 develop 专项被 workflow 拒绝。宿主 Tools/ios-ci 完整测试执行
771 项，770 通过、1 项跳过。

后续修复已合入目标分支，手动执行同一个 disabled Schedule，真实 Job 图确认为
Build、Analyze 两个 Job，没有安全扫描或无用代码 Job，任务隔离由此获得运行态验证。
该次执行仍因 checkout 网络错误和分析容器缺少 curl 而失败，没有完成 App 编译。
因此这里只确认 Job 选择正确，采集和分析成功仍需独立验收。
