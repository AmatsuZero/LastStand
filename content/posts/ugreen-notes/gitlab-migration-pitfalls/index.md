---
title: "把 GitHub 依赖迁移到内网 GitLab 的踩坑总结"
date: 2026-10-12T10:13:41+08:00
categories: ["绿联工作笔记"]
tags: ["GitLab", "迁移", "CocoaPods", "LFS", "PackageRegistry"]
aliases: ["/posts/gitlab-migration-pitfalls/"]
---

## 背景

公司内网环境极差，外网访问几乎不可达，打包机几乎拉不到 GitHub 上的依赖，所以才把一部分依赖镜像到内网 GitLab，供打包机使用。加上部分仓库很大（如 Alamofire、lottie-ios），迁移过程中集中爆发了一批问题。

补充两点前置配置经验：

- 如果仓库是 Private 的，外部匿名拉取（不携带 token、cookie 等）会失败。需要在 General Settings - Visibility, project features, permissions - Package registry 下打开 **Allow anyone to pull from Package Registry**；
- 往 Pod Spec 仓库推送代码，需要 Maintainer 权限的账号，否则无法 push。

对于超大仓库，在网络环境差的情况下 `git push --mirror` 很容易出现 504 错误，只推我们用到的 tag 即可。

## 本次迁移踩坑总结

### 1. Shallow clone 无法推送 Tag

GitLab 报 `shallow update not allowed`，需要先 `git fetch --unshallow`，再推送标签。

### 2. Git LFS 对象缺失

GitLab 会拒绝推送并提示 `LFS objects are missing`，必须同步并执行 `git lfs push --all`。

### 3. 网络抖动

`curl 18/92`、`early EOF`、`Connection reset by peer`、`Empty reply from server` 分别出现在 GitHub 拉取和 GitLab 推送阶段，属于传输链路不稳定。重试、降低并发、切换 HTTP/1.1 只能缓解，不能替代完整性校验——传完一定要校验对象是否齐全。

### 4. 二进制 Pod 的 Git 仓库为空是正常的

GoogleMLKit、Bugly、MLKitCommon 等 HTTP binary Pod，实际内容在 GitLab Generic Package Registry，不在 Git 仓库中。看到空仓库不要误以为是迁移失败。

### 5. Package Registry 文件名必须完全匹配

缓存文件名不能直接作为上传文件名，否则 Podspec 下载会 404。必须按上游原始文件名上传，并验证匿名下载。

### 6. 匿名 Package Registry 权限

需要开启 Allow anyone to pull from Package Registry，否则匿名安装会返回 401 / 403。

### 7. 旧 Podfile.lock 会保留 trunk 来源

即使 Podfile 已只配置私有源，旧锁文件仍可能继续记录 trunk；需要删除旧锁文件后重新 `pod install`。

### 8. 恢复任务的报告可能过时

`--resume` 使用旧报告时，可能出现 `source_kind=unknown` 或已发布状态与实际仓库不一致，不能只看报告，应同时检查 Git refs、Package Registry 和实际安装结果。

### 9. GitLab 默认分支修复需幂等

并发或重复恢复时可能返回 `Branch already exists`，该情况应视为已满足，而不是任务失败。

### 10. 真机与模拟器验证要区分

Bugly 等部分二进制仅包含设备架构，模拟器构建失败不代表迁移失败；本次已通过连接的实体 iPhone 完成构建验证。

## 名词补充

- **git push --mirror**：镜像推送，把所有 refs（分支、tag）原样推到目标仓库；配合 `--unshallow` 解决浅克隆不支持推送 tag 的限制。
- **Git LFS**：Git 大文件存储，大文件以指针存于 Git、实体存于 LFS 服务；迁移时必须 `git lfs push --all` 同步实体，否则远端引用缺失。
- **Generic Package Registry**：GitLab 的通用包仓库，可存放任意二进制文件（区别于容器 / 包管理器的专用 registry），二进制 Pod 常把实体放这里、Git 仓库只留 Podspec 与指针。
- **Podfile.lock 来源漂移**：CocoaPods 锁文件会记住每个 Pod 的 `source`；切换到私有源后若不删除旧锁，仍可能从 trunk 解析，导致内网迁移「看起来没生效」。
