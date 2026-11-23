---
title: "macOS Runner 缓存 helper 受本地网络授权影响时，先区分 Job 网络和 helper 网络"
date: 2026-11-23T15:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "CI/CD", "GitLabRunner", "macOS"]
---

## 现象

macOS shell executor 的 Job 在恢复缓存时，cache helper 下载 S3 兼容缓存返回
`no route to host`。同一个 macOS Job 中，普通 `curl` 可以到达对象桶并收到匿名请求的
`403`，Docker executor 上传缓存也能成功，因此不能只用 Job 内的普通网络探针判断
cache helper 的路径已经可用。

## 已验证成因

缓存下载由 GitLab Runner 的 helper 路径执行，和 Job 脚本中直接启动的网络进程不是同一
个验证边界。某台 Mac 的内核诊断还报告了 `gitlab-runner` 进程受到 NECP 拦截并返回
错误 65。该证据只说明这台主机上的 Runner 进程网络路径异常，不能推广为所有 macOS
环境的系统性结论。

两台桌面都出现本地网络访问授权提示。允许 `gitlab-runner` 访问本地网络后，使用同一
随机 marker 的探针重新提交任务：Docker executor 负责上传缓存，两台 macOS Runner
分别完成真实缓存下载和 `Successfully extracted cache`，两台解压后的 marker 校验一致。

## 有效恢复

先把缓存问题拆成三个独立探针，分别记录请求身份和结果：

1. Job 内的普通 `curl`，确认 DNS、路由和对象服务返回状态。
2. Docker executor 的缓存上传，确认对象服务接受写入。
3. macOS shell Runner 的真实 cache helper 下载、解压和 marker 校验，确认 Runner
   进程自己的网络路径可用。

在 macOS 桌面出现本地网络授权提示时，允许实际运行 GitLab Runner 的应用访问本地
网络。授权后使用新的随机 marker 重新跑同一探针，并在两台 macOS Runner 上分别检查
下载、解压和 marker 摘要，避免把一次上传成功误判为两台节点都能恢复缓存。

## 边界

- 普通 `curl` 能收到匿名 `403`，只能证明请求抵达对象服务，不能证明 cache helper
  的下载和解压链路可用。
- Docker 上传成功不能证明 macOS shell Runner 的下载路径可用，上传和下载需要分别验收。
- `no route to host` 在本例中与 Runner 进程的本地网络授权和内核网络策略有关，不能据此
  推断所有 macOS、所有 Runner 版本或所有网络环境都需要相同处理。
- 同一随机 marker 的跨 executor、跨节点校验是缓存内容一致性的证据，不能替代正式 Job
  的构建、制品和测试验收。

## 证据

初始 macOS shell cache helper 下载失败并报告 `no route to host`；同一 Job 的普通
`curl` 到达对象桶并收到匿名 `403`，Docker executor 上传成功。某台 Mac 的内核诊断
记录了 `gitlab-runner` 的 NECP 拦截和错误 65。两台桌面允许 Runner 本地网络访问后，
同一探针使用新的随机 marker 运行，两台 macOS Runner 都报告真实下载和
`Successfully extracted cache`，解压后的 marker 一致。

本文省略真实用户、主机、内网地址、项目号、流水线号、密码、令牌和内部域名。
