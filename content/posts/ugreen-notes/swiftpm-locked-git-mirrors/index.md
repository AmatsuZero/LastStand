---
title: "SwiftPM 外网克隆超时时，用锁定提交的 Git 镜像包构建"
date: 2026-11-26T13:53:57+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "GitLab", "依赖"]
---

## 现象

macOS Runner 执行 `swift package resolve --force-resolved-versions` 时，
多个 SwiftPM 依赖的 Git 克隆报 `curl 28`、`early EOF`。任务
耗尽一小时上限，测试还没开始，后续打包被跳过。

## 已验证成因

锁文件固定了每个依赖的 Git 提交。冷缓存仍需要取得这些 Git 对象。
GitHub 下载中断发生在 SwiftPM 创建工作副本、编译、执行测试之前。
同一次运行也有多个依赖成功下载，因此单个依赖的传输结果无法
代表完整依赖集。

## 有效恢复

1. 按 `Package.resolved` 准备浅 bare Git 镜像，每个镜像的 HEAD
   与锁定提交一致，保留对应的版本 tag。
2. 将镜像打包放进私有项目的 Generic Package Registry，让 MR 固定
   归档的 SHA-256。用 CI Job Token 下载和校验，避免把凭证放进 URL。
3. 逐仓检查 HEAD，在当前 job 用 Git `url.<file URL>.insteadOf`
   映射原始 HTTPS 地址，并设置 `GIT_ALLOW_PROTOCOL=file`。
   SwiftPM 仍使用原有锁文件。缺失的镜像会立即暴露。
4. 若某个图只在指定 trait 生效，检查包选择时使用同一个 trait。
   `swift package --traits <trait> show-dependencies --format json`
   可以检查最终的包路径。

## 边界

归档只包含锁定版本。依赖更新需要更新镜像和归档摘要，Git URL
映射只在当前 CI job 生效。对归档、镜像 HEAD、依赖解析和编译的
验证各自回答不同问题。镜像下载成功后仍需要验证测试和发布产物。

## 证据

私有包仓约 60 MiB 的归档上传后回读摘要一致。空工作目录在只允许
本地 Git 的环境中成功解析 37 个锁定提交，并在对应 trait 的依赖图
中选中补丁工作副本。真实 macOS Runner 下载同一归档并进入编译。
