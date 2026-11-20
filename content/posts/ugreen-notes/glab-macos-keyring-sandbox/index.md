---
title: "macOS 沙箱内 glab 报错找不到钥匙串凭证"
date: 2026-11-20T09:31:57+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["GitLab", "CLI", "踩坑", "故障"]
---

## 现象

在 macOS 上已配置 GitLab CLI。Codex 的默认沙箱运行 `glab api` 时仍提示 `the token ... is missing from the operating system keyring`。

## 已验证成因

沙箱内的进程没有读到系统钥匙串中的登录态。同一个只读请求在授权的执行环境中立即成功，无需重新登录。这个对照验证了当前执行环境之间的凭证访问差异。

## 有效恢复

保留现有登录态。在权限允许时，对同一只读查询使用 `sandbox_permissions: "require_escalated"`，明确目标主机并核对退出码和返回结果。

```bash
glab api --hostname <gitlab-host> 'projects/<project-id>/pipelines/<pipeline-id>/jobs'
```

## 边界

如果授权查询仍失败，依据新的错误排查主机、登录态或项目权限。排查不需要查看、打印或复制 token。后续写操作仍按各自的授权范围执行。

## 证据

同一次排查中，沙箱内查询流水线 Job 列表返回钥匙串报错，授权后原查询返回 Job 状态与编号。随后只读检查分析和发布日志也成功。
