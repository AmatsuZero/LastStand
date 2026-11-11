---
title: "无用代码扫描应拆开报告生成与 Wiki 发布重试"
date: 2026-11-11T11:20:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "构建", "CI/CD", "GitLab"]
---

## 现象（symptom）

定时扫描已经完成源码依赖安装、KMP Debug framework 链接、Xcode build 和
静态分析，却在最后一次 Wiki HTTPS 请求中遇到 `SSLEOFError`，整个 job 失败。
重试该 job 会重新执行约八分钟的构建和扫描。

## 已验证成因（verified cause）

日志显示 `BUILD SUCCEEDED`、报告 ZIP 已生成且 artifact 上传返回 201；异常栈
位于 Wiki 页面的 PUT 请求及 TLS 握手。扫描和发布耦合在同一个 job，是重复计算
的直接原因。网络 EOF 没有 HTTP 鉴权结果，不能据此判断 token 无效；仅凭这份
日志也不能认定为代理或特定 SSL 库故障。

## 有效恢复（effective recovery）

扫描 job 只生成报告与带原扫描元数据的 Markdown，将后者按 pipeline ID 命名并
保存为 artifact。独立发布 job 通过同一 pipeline 的 `needs:artifacts` 下载内容，
不运行 Pods、Gradle、Xcode 或分析器。发布失败时只重试该发布 job。

对于幂等 GET/PUT，TLS EOF、连接重置、超时或临时 HTTP 错误可做有限退避重试。
不关闭证书校验，不重试鉴权错误，不盲目重试创建页面的 POST，以免丢失响应后
重复创建。下一次发布从 PUT 开始，可以更新已经创建的页面。

旧 job 已有 ZIP 时，从中读取 `issues.json` 恢复结果页，保留原扫描的 commit、
pipeline/job 链接与时间；经既有 CLI 权限更新后读回全文核对，无需重新编译。

## 边界（boundaries）

- 已创建的旧 pipeline 不会因为合入新配置而长出额外 job。
- Markdown artifact 过期或缺失时明确失败，不退回其它 pipeline 的旧报告。
- 发布 job 仍受 develop/schedule 规则限制；只读网络探测不证明真实写入权限。
- CLI 恢复成功不等于 Runner 的 Python 网络故障已复现或消失。
- 原扫描 job 仍保留失败状态，不能把补发成功伪装成原 CI 成功。

## 证据（evidence）

原 job 的报告和 Debug KMP 构建证据均下载成功。恢复后的结果页经 API 读回与
生成的 Markdown 全文一致，原 job 未重试。脚本回归验证发布失败后单独重试仅
执行 Wiki upsert，并覆盖同 pipeline payload、缺 token/缺 artifact 与分支限制。
网络回归覆盖 TLS EOF 恢复、三次上限、永久错误与 POST 不重试。
GitLab 在线 CI lint 通过并包含新的发布 job；完整脚本测试 411 项通过，Runner
所用 Python 3.9 的 Wiki 网络测试通过。新 job 的实际 Runner 验收需合入后另记。
