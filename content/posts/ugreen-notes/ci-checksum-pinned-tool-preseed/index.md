---
title: "CI 固定版本工具下载失败时，用校验原包预置恢复自动安装"
date: 2026-11-13T15:09:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "GitLab"]
---

## 现象

macOS Runner 能通过 `CI_JOB_TOKEN` 下载私有 CI 仓库中的安装脚本，但从
GitHub Release 下载 XCLogParser 0.2.50 官方归档先后返回 curl 56 和 28。
准备 Job 失败，后续 App Build 被跳过。不能把这种失败解释成解析器不支持
Xcode，或把它计入编译性能开销。

## 已验证成因

失败发生在固定归档的外网传输边界：脚本已取得并开始执行，归档下载未完成，
尚未进入解压、版本探测或日志解析。两次失败只证明该 Runner 当时无法稳定
取得归档；没有证据进一步归因到 DNS、代理、TLS 或 GitHub 服务端。

## 有效恢复

把已取得且 SHA256 与版本清单一致的官方原包放入 GitLab Generic Package
Registry 的独立临时包版本。上传后重新下载，确认字节数和摘要一致。
Runner 使用 `JOB-TOKEN` 请求头下载原包，再把本地路径传给既有安装器的
`--archive` / `XCLOGPARSER_ARCHIVE` 入口。安装器继续校验固定摘要、ZIP
条目、二进制和版本，第二次调用还要验证缓存复用。

下载接口为：

```text
GET /projects/<ci-project-id>/packages/generic/<package>/<version>/<file>
JOB-TOKEN: <CI_JOB_TOKEN>
```

不要把 token 写进 URL、日志、仓库文件或工具清单。跨项目下载还须核验 CI
项目的 Job Token allowlist 和触发人的读取权限；成功读取源码模板不能替代
Package Registry 的真实下载验收。

## 边界

- 原包预置只改变传输路径；不得换成未经评估的 fork、latest 或未知镜像。
- 此次只验证 macOS ARM64 归档，不证明其他平台可用。
- 内网预置通过后，准备 Job 在真实 Runner 上约 3.5 秒成功，完成安装、版本、
  同 Job 缓存复用、Xcode 版本与磁盘预检；不证明跨 Job 缓存已命中。
- 原包上传是独立的仓库/Registry 写入，应使用已授权的临时作用域，不更改
  匿名读取权限、Runner 配置或生产流水线。
- 工具准备通过不等于 App Build、报告语义、跨物理机或 A/B/C 开销验收通过。

## 证据

官方 darwin-arm64 ZIP 为 1,008,149 bytes，SHA256：
`450efaa1925c063c244c06129663eafbe68caca8ad59fd214fc45db12803ed62`。
回读摘要相同；Runner 安装后二进制 SHA256：
`ad9d4f03a480ac148945333a98b3d9251c55a439c024834cff3240278fa89635`，
版本输出为 `XCLogParser 0.2.50`。准备 Job 的白名单 JSON 记录 Xcode
26.5 / 17F42 和检查结果，没有公开内部 trace、域名或机器身份。

参考：[Generic packages](https://docs.gitlab.com/user/packages/generic_packages/)、
[CI job token](https://docs.gitlab.com/ci/jobs/ci_job_token/)。
