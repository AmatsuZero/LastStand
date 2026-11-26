---
title: "GitLab 制品上传反复重置时如何用短作业验证恢复"
date: 2026-11-26T16:57:15+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "GitLab", "GitLabRunner"]
---

## 现象

macOS Runner 产出了签名包，外部存储的回读校验也通过，GitLab 作业仍标记为失败。trace 把 `connection reset by peer` 定位在 `upload_artifacts_on_success`。重复完整构建会再次耗费归档与签名的时间。

## 已验证范围

同一条网络路径上的 GET 和约 160 KiB 的 CI lint POST 能成功返回。这些请求各自覆盖握手、请求体传输和校验 API。实际制品还要经过 Runner 自带的上传器、制品 API 和 GitLab 的存储后端。这次连接重置的发送方及根因仍未确认。

## 恢复验证

在隔离分支上用一个短 CI 作业走真实的 `artifacts:` 流程，并用专用 tag 指定受影响的 Runner。设置 `GIT_STRATEGY: none`，以作业 ID 建独立的输出目录。生成接近故障制品实际归档体积的随机文件，让测试数据经过压缩后仍维持相近体积。使作业记录文件的 SHA-256。

确认真实 Runner ID、上传返回 HTTP 201 及作业成功后，从 GitLab 制品 API 下载该文件并核对 SHA-256。有第二台 Runner 时可在同一条短流水线用相同方式做对照。通过后再重试完整作业。推送、MR 和正常生产流水线可保留原有入口，临时诊断通过独立的 API 入口运行。

## 证据与边界

两台 macOS Runner 的短作业均上传约 163 KiB 制品并通过回读校验，受影响 Runner 的常规 CI 随后也成功上传更大的制品。短作业证明观测时点上真制品链路可用。完整构建仍要以新作业的签名记录、制品上传和下游调度为准，间歇性重置还需继续观测。
