---
title: "Gradle exclusiveContent 不应把所有 com.github 依赖送往 JitPack"
date: 2026-11-10T16:02:01+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "Gradle", "CI/CD", "依赖"]
---

## 现象

Detekt 在执行分析前报 Caffeine 2.9.3 无法解析，searched locations 仅有 JitPack。空的违规报告不能证明分析通过。

## 已验证成因

CI init 脚本将全部 `com.github.*` exclusiveContent 路由到 JitPack。Caffeine 的 group 虽然是 `com.github.ben-manes.caffeine`，发布来源却是 Maven Central。exclusiveContent 会排除其他仓库，因此调整仓库排列顺序不能恢复它。

## 有效恢复

把 JitPack exclusive filter 收窄到项目实际依赖的 `com.github.Jasonchenlijian`，保留 FastBle 的确定性路由；Caffeine group 显式从 Maven Central 获取。沿用现有仓库策略，不改版本或清空整个缓存。

## 边界

这不说明所有 com.github 包都来自 Central。新依赖应核对实际发布来源。路由恢复也不等于静态检查零告警，必须分别核对任务退出状态和报告内容。

## 证据

真实 Gradle 与本地 HTTP Maven fixture：修复前 Caffeine 解析失败，FastBle 仍通过；修复后 8 项路由探针全部通过。CI 脚本全套 158 项通过，10 项条件跳过。修复后的远端 Detekt job 成功并上传报告；仍有 177 项规则发现，其中变更文件过滤后为 2 项。未发布构件或 tag。
