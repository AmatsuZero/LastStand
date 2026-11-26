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

### 在锁定版本上应用临时补丁

需要修补某个依赖时，`swift package edit` 会让当前 package 的构建和测试
使用可编辑副本中的源码。`--revision` 让 SwiftPM 从指定提交准备托管副本，
`--branch` 则可创建编辑分支。两者均省略时，托管副本从当前已解析版本开始。
用 `--path` 可接入已有 checkout，SwiftPM 会校验包名并在 `Packages/`
下建立链接。已有 checkout 按当前内容使用，接入前应单独核对其 Git 提交。

在干净的 CI job 中，将 `revision` 设为锁文件中的提交，`checkout` 设为
该 job 独有的绝对路径，`patch` 指向项目维护的补丁文件。在镜像映射生效后执行：

```sh
swift package resolve --force-resolved-versions
mkdir -p "$(dirname "$checkout")"
swift package edit async-http-client --path "$checkout" --revision "$revision"
test "$(git -C "$checkout" rev-parse HEAD)" = "$revision"
git -C "$checkout" apply "$patch"
```

应用补丁后，核对工作副本仅有预期文件被修改，并校验目标源码的 Git blob
哈希。用与正式构建相同的 trait 执行 `show-dependencies --format json`，
确认该依赖的路径指向补丁副本，再测试并打包。

本地调试完成后，可用 `swift package unedit async-http-client` 恢复正常解析。
托管副本有未提交或未推送的改动时，先保存改动再退出。
`unedit --force` 可能丢弃托管副本中的修改。
参见 [SwiftPM 编辑依赖文档](https://docs.swift.org/latest/documentation/packagemanagerdocs/editingdependencypackage/)。

## 边界

归档只包含锁定版本。依赖更新需要更新镜像和归档摘要，Git URL
映射只在当前 CI job 生效。对归档、镜像 HEAD、依赖解析和编译的
验证各自回答不同问题。镜像下载成功后仍需要验证测试和发布产物。

`Package.resolved` 记录基础提交。编辑状态属于当前 SwiftPM 工作目录，
每个干净 job 都要重新建立编辑副本并应用补丁。长期维护的修复可纳入
依赖 fork 并固定其版本，或等上游发布后更新锁文件。

## 证据

私有包仓约 60 MiB 的归档上传后回读摘要一致。空工作目录在只允许
本地 Git 的环境中成功解析 37 个锁定提交，并在对应 trait 的依赖图
中选中补丁工作副本。AsyncHTTPClient 1.36.1 的 HTTP/2 回归用例在补丁前
失败，补丁后相关 11 项测试通过。真实 macOS Runner 下载同一归档，
完成默认与 S3 trait 测试、双架构打包和发布。
