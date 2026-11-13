---
title: "GitLab Runner 架构变量不能直接放进 cache key"
date: 2026-11-13T14:06:16+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "GitLab"]
---

## 现象

候选分析 Job 用 `${CI_RUNNER_EXECUTABLE_ARCH}` 区分工具缓存。
展开后的 key 含 `darwin/arm64` 或 `linux/amd64`。YAML/server Lint 可以通过，
但 key 不符合 GitLab 的运行时限制；不能以语法检查成功代替 Runner 缓存验收。
本例尚未执行真实 Runner Job，不将其描述为已观测到的线上失败。

## 已验证成因

GitLab 18.9 官方 `cache:key` 文档规定 key 不能包含 `/` 或 `%2F`。
`CI_RUNNER_EXECUTABLE_ARCH` 表示 Runner executable 的 OS/architecture，
不能直接作为满足上述限制的字符串。此值也不保证等于 executor 环境。

## 有效恢复

候选模板改用数字 `${CI_RUNNER_ID}` 与固定工具供应 commit 组成外层 cache key；
安装器内部继续按平台选择子目录并校验固定归档和二进制。这样既避免斜杠，
也不把 Runner ID 当作二进制兼容性的唯一证据。

## 边界

- cache key 在 Runner 执行缓存恢复前展开；在 `before_script` 中修改变量太晚。
- Runner 更换宿主或架构时，安装器仍须校验当前平台与缓存内容。
- 使用预定义变量不会自动确保值满足每个消费字段的语法。
- 本轮证明了模板 key 的合法性和准备/调用边界，真实缓存上传、恢复仍需独立实跑。

## 证据

回归测试从真实候选 YAML 读取 key，分别展开 `darwin/arm64`、
`darwin/amd64`、`linux/amd64`：改动前三项均因 `/` 失败，改动后通过。
同次安装器九项与模板两项测试通过，服务器展开配置 Lint 返回 valid true、零错误和警告。

官方依据：
[cache:key](https://docs.gitlab.com/18.9/ci/yaml/#cachekey)、
[predefined variables](https://docs.gitlab.com/18.9/ci/variables/predefined_variables/)。
