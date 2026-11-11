---
title: "源码扫描 CI 的 JDK 冷缓存必须进入受控下载路径"
date: 2026-11-11T10:32:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "构建", "CI/CD", "GitLab"]
---

## 现象（symptom）

定时无用代码扫描复用 KMP 源码 Pod 安装，尚未运行 Gradle 或 Xcode 就失败：
`project-managed JDK is not installed or is invalid`。
通用工具链 preflight 已报告成功，任务结束时又提示报告文件不存在。

## 已验证成因（verified cause）

源码 preflight 按 CI 环境分流：本地调用 `managed_jdk.py ensure`，CI 只调用
`print-home`。后者只校验既有缓存，不会下载或安装。即使 manifest 已配置可访问的
内网镜像，冷 Runner 也到不了下载路径。通用 preflight 不检查该源码模式的 JDK，
其成功日志不能证明 JDK 已就绪；报告缺失是任务提前退出的结果。

不同 Runner 还有不同失败边界：另一台机器的 JDK 校验成功，但历史锁定版本的
Gradle 配置从旧 Maven 入口读取 Kotlin POM 时返回 HTTP 502，不能归为同一问题。

## 有效恢复（effective recovery）

显式源码安装统一调用现有 `ensure`：优先复用通过 marker 校验的缓存，缺失时从
预置归档或 manifest 内网镜像准备。保留 SHA-256 校验、带锁的原子安装和 CI 公网
upstream 禁令；默认二进制安装仍不准备 JDK。`print-home` 继续保持只读查询语义。

核对 Maven 故障时使用宿主锁定版本对应的 Shared tag，不能拿本地其它分支的
仓库配置作结论。当前锁定版本已改用 HTTPS 仓库，相关 POM 返回 200；旧入口仍
返回 502。不修改已发布 tag，不用切换依赖版本掩盖基础设施问题。

## 边界（boundaries）

- 本次恢复针对显式源码安装入口，不在通用 Job 门禁中安装全部工具。
- 内网镜像缺失、不可达或 checksum 不符时必须失败，不静默回退公网。
- 本地下载成功不证明远端 Runner 网络、完整 KMP 编译或扫描/Wiki 发布成功。
- 受管缓存归属于实际 Runner 账号，不应依赖 checkout 内的临时目录。

## 证据（evidence）

新增 CI 冷缓存回归用例先复现只查询缓存而失败；统一 `ensure` 后，源码预检、扫描
版本传递和受管 JDK 三组测试均通过。测试还覆盖准备失败时不启动 Gradle、CI 禁止
公网 upstream、只读查询不会安装以及缓存复用。

独立临时缓存中的真实内网下载完成，归档通过 manifest SHA-256 校验及原子解压，
执行 `java -version` 得到锁定的 Temurin 17 版本；再次调用 `ensure` 不发起下载。
这些证据只覆盖 JDK 准备，不宣称完整远端扫描已通过。
