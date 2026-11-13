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

## 补充：控制台截断不等于构建终止

另一轮重试在控制台出现 `Job's log exceeded limit of 4194304 bytes`，随后
不再收集输出。此提示明确表示 job 仍会继续，不能把最后可见的编译行当作失败位置。
下载的 artifact 中完整编译日志包含 `BUILD SUCCEEDED`，报告 ZIP 含 issues、
体积数据和 HTML；但 job 状态为 script failure，线上结果仍指向上一轮。
这只能证明编译、分析和打包完成，不能在缺失尾部日志时断言最终是 TLS 错误。
允许失败的 job 还可能让整个 pipeline 显示成功，需逐个核对 job 状态。

修复将完整脱敏编译输出写入 artifact，控制台只输出编译阶段状态；失败时显示
末尾 80 行诊断并保留原退出码。超过 4 MiB 的真实脚本 fixture 验证成功与失败
两种路径，确保控制台仍可看到最终状态。生产 Runner 的后续验收仍单独记录。

## 同步验证时的 Python 夹具边界

某些 macOS 脚本测试通过 `#!/usr/bin/env python3` 启动假的构建命令，同时
将 `DEVELOPER_DIR` 设为测试专用的 `/Fake/Xcode.app/Contents/Developer`。
如果 PATH 命中系统的 Xcode Python shim，假命令也可能在执行 Python 正文前
就被 `xcrun` 拒绝，报 missing DEVELOPER_DIR path。
本次同步前后有完全相同的 11 个夹具失败；仅把 Homebrew Python 放到本轮命令
PATH 前面，同一测试文件 12 项和完整套件 431 项均通过，未修改测试或生产脚本。
此修正只适用于隔离的脚本夹具验证，不是让真实 Xcode 构建使用无效路径的办法。

## 补充：采集、Wiki 和大归档上传是三个验收层

一次真机任务的优化构建、5 项 UI 测试及 Instruments 诊断均成功，普通基线因状态审计
在启动前拒绝，Job 保留失败；收尾还同时出现启动 Wiki 的请求失败和原始归档的 HTTP 413。
原始报告约 1 GiB，其中整批符号资料约 699 MiB，不能因此把诊断采集本身判为失败。

先查专用节点按 7 天保留的同 Job 兜底目录，确认原始 trace、符号和结构化结果仍在。
使用同一份数据及原 commit/job 身份，只补发 Wiki 并逐页全文回读；不重跑构建、测试或
设备采样，原 CI 失败状态保留。首页与运行页需注明补发，并将不存在的在线归档链接改为
仍可用的 Job 日志链接。不能让文案继续承诺已经被服务器拒绝的下载文件。

本轮同一份原始 Wiki JSON 请求约 1.11 MB，通过既有 CLI 权限直接重放成功，所以没有
证据将 Wiki 失败归因为归档接口的 413。报告生成成功、Wiki 发布成功、归档上传成功
必须分别记录；自动发布失败后人工补发成功，也不证明 Runner 的原网络问题已消失。
大原始资料用于离线复核和符号化，每日小摘要的可见性不应依赖整批符号资料成功上传。

### 小报告白名单应经过原生 Runner 打包验证

后续按需保留原始资料在节点，将 CI 上传范围收窄为 JSON、Markdown、JUnit 的明确路径，
避免再次上传整个报告目录。目录级上传会递归带入 trace、xcresult、dSYM、LinkMap 和
将来新增的大文件；只按扩展名排除已知大文件也容易遗漏新增类型。

验证先使用真实目录结构的回归夹具，确认报告保留、原始资料排除；再使用生产同版本
Runner 的原生 artifacts-uploader，对上一轮真实报告执行本地打包。目的地为一次性
本地接收器、凭据为虚拟值，不发送到远端。结果为 15 个小报告，未压缩 702,587 bytes，
ZIP 76,094 bytes，保留阶段、热点和 JUnit，未包含原始 trace、XML 或符号资料。
完整脚本测试 643 项和在线 CI lint 通过；这仍不代替下一次正式任务的上传验收，
也不修复独立存在的样本状态审计或 Wiki 网络问题。
