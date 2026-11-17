---
title: "GitLab 分析模板未指定镜像，Lint 通过仍会缺少运行工具"
date: 2026-11-17T10:30:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "GitLab", "Nexus", "依赖"]
---

## 现象（symptom）

编译耗时流水线的任务选择和服务端 CI Lint 均通过，Linux Analyze Job 却在
下载预检脚本时退出，提示 `curl: not found`。Runner 日志显示 `Using default image`，
实际使用 `alpine:3.20`。这个 Job 还需要 Python 3.11 以上，默认镜像也未提供该环境。

## 已验证成因（verified cause）

共享隐藏模板声明 Linux tag，并在 before_script 调用 curl、Python，但没有声明 image。
消费项目同样没有指定 image，因此该次运行使用了 Docker Runner 的默认 Alpine。
配置语法、任务规则和继承关系有效，并不会验证实际容器中有没有这些可执行文件。

故障发生在分析器启动前，不能归因为官方构建 JSON 格式不兼容，也不能把没有产物
解释为“本次构建指标为零”。Build 未交付数据时，同样不能声称分析成功。

## 有效恢复（effective recovery）

消费项目在 Analyze Job 显式指定包含 Python、curl、Bash 的固定 digest 镜像，保留
共享模板的预检逻辑。这次没有在业务 Job 内临时运行 apk、apt 或 pip。

现有内网 slim Python 镜像实际缺少 curl，不能只按镜像名字判断是否满足需求。
验证过的完整 Python 3.12.16 bookworm ARM64 镜像，其压缩层合计 370,997,938 bytes，
超过团队约定的 100 MB，因此原样同步到 Nexus，未放入 GitLab Container Registry。
版本 tag 用于维护，Job 固定平台 manifest digest；同步后核对上游与内网 digest 相同。

维护机使用已有 Docker 凭据上传镜像，日志与配方不包含认证材料。业务 Job 只从
内网拉取运行镜像；升级必须同步新版本、验证并通过 MR 更新引用。

## 边界（boundaries）

- 本次 Nexus 镜像仅包含 Linux ARM64 平台；AMD64 Runner 需要对应平台镜像和新引用。
- 本地匿名 pull 确认了维护机的读取链路，不代表真实 Runner 的网络链路已验收。
- 本地禁网容器测试使用自动化测试输入，不能替代真实 App 的采集与跨 Runner 分析。
- 日志另有内网 Git checkout reset/TLS EOF；镜像迁入内网不能证明这类连接故障已解决。
- 一次 HTTP/1.1 checkout 成功只说明该次兼容路径可用，不能据此确定 HTTP/2 为根因。
- 定时开关保持关闭，完整 Build、交付包与 Analyze 验收后再评估启用。

## 证据（evidence）

1. 真实 Linux Job 显示默认 Alpine 与 `curl: not found`，共享模板原文未声明 image。
2. Nexus 上传返回的 ARM64 manifest digest 与上游固定平台 digest 一致。
3. 使用空 Docker 客户端配置进行匿名 pull，成功解析同一 digest。
4. Nexus 镜像在禁网、只读、临时 /tmp 容器内完成 Linux 预检，`capable=true`，
   Python 3.12.16、aarch64；分析器 help 及 29 项消费者/指标/基线测试通过。
5. 宿主固定 Ruby/Bundler 环境下 44 项 CI 配置测试通过，候选配置经服务端展开，
   `valid=true`、无错误和警告，仍只选择 Build 与 Analyze。

这些证据支持提交环境修复 MR，尚不支持声称远端完整采集已成功。
