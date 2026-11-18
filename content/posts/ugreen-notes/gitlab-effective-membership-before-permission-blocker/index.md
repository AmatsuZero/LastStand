---
title: "GitLab 权限判断不能只看项目响应中的 group_access"
date: 2026-11-18T17:13:54+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["GitLab", "凭证", "踩坑"]
---

## 现象

用当前登录用户读取项目详情时，`permissions.project_access` 为空，`permissions.group_access.access_level` 为 30。仅依据这一结果，误报当前用户无法修改 CI Job Token 入站 allowlist。

## 已验证成因

项目详情中的该嵌套权限字段不足以支持这次“有效权限只有 Developer”的结论。同一账号在 `GET /projects/<project-id>/members/all/<user-id>` 的返回值为 `access_level: 50`。当前实例两个项目均出现这种差异。这里记录的是观测，不推断 GitLab 各版本的内部权限计算原因。

## 有效恢复

先通过 `GET /user` 固定当前身份，再用项目的 `members/all/<user-id>` 核对成员记录。已获得操作授权后，对精确目标执行所需 API，并回读确认。本次添加一项 Job Token 入站 allowlist 成功，返回 source/target 项目编号；回读只增加请求的项目，既有条目保留。

## 边界

本结论不授权更改用户角色或扩大 token 权限。成员字段也不能替代具体操作结果；token scope、受保护资源及实例策略仍可能拒绝请求。allowlist 添加成功也不证明 Runner 已完成 Git 认证、密文解密或签名。

## 证据

同一登录身份对两个项目读到 `group_access: 30` 和成员记录 `access_level: 50`；授权后精确 allowlist POST 成功，并由 GET 核验。公开笔记不包含内部地址、真实账号、项目编号、凭证或签名资产。
