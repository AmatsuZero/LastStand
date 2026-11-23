---
title: "Gradle Kotlin DSL 源码分发包优先走 Wrapper 镜像与坏缓存处理"
date: 2026-11-23T17:45:45+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Gradle", "构建", "踩坑", "依赖"]
---

## 现象

Android Studio 同步已经完成大部分项目解析，却长时间停在 Gradle 源码分发包下载。下载信息中出现 `gradle-9.4.1-src.zip`，请求在官方分发地址上反复失败。受管的 Gradle User Home 中还留下了一个只有 988 B 的同名 ZIP 文件。

## 已验证成因

Gradle Kotlin DSL 的源码解析器会为 `gradle:gradle:<version>` 请求 `src` ZIP。Gradle 9.4.1 的实现先从项目 Wrapper URL 推导自定义分发仓库，再回退到官方分发仓库。Wrapper 使用自定义镜像时，这个源码包也会优先从镜像查找。

本次项目的 Wrapper 分发地址指向腾讯 Gradle 镜像，镜像对 `gradle-9.4.1-src.zip` 返回了 `application/zip` 和 75,236,150 B 的内容。官方地址会重定向到 GitHub Release 资源，链路更长。受管缓存中的 988 B 文件实际是 HTML challenge 页面，不能作为 ZIP 使用，因此解析器继续回退并产生长时间重试。

本机主 Gradle 缓存中的同版本源码包大小为 75,236,150 B，SHA-256 为 `e07d5ab9a5ee05064d2cea472ad2d8b46144c75d598080e5f77660d18c0e3020`，`unzip -t` 通过。

## 有效恢复

先确认 Android Studio 的 Sync 已停止，再检查受管 Gradle User Home 中的源码包。只处理明确的 Gradle 9.4.1 源码包目录，不清空整个缓存，也不使用 `--refresh-dependencies` 作为默认恢复手段。

```sh
find "$GRADLE_USER_HOME/caches/modules-2/files-2.1/gradle/gradle/9.4.1" \
  -name 'gradle-9.4.1-src.zip' -type f -print

file "$GRADLE_USER_HOME/caches/modules-2/files-2.1/gradle/gradle/9.4.1"/*/gradle-9.4.1-src.zip
unzip -t "$GRADLE_USER_HOME/caches/modules-2/files-2.1/gradle/gradle/9.4.1"/*/gradle-9.4.1-src.zip
```

优先让 Gradle 重新从 Wrapper 推导出的国内分发仓库获取源码包。若已有经过大小、哈希和 ZIP 完整性验证的同版本本地副本，可以在没有活动下载时按 Gradle 的 content-addressed 缓存目录预热，但预热后仍需重新 Sync 验证，不能仅凭复制缓存宣布问题解决。

## 边界

- Wrapper 的 `-bin.zip` 镜像设置与源码分发包解析相关，但不是同一个缓存条目。
- Maven Central、Gradle Plugin Portal 和 Gradle distribution source 使用不同的解析路径。Maven init script 能改变仓库解析顺序，不能替代源码分发包的 Wrapper 镜像解析。
- 988 B HTML 文件是坏缓存证据，不代表腾讯镜像永远不可用。重新请求腾讯源得到的响应是完整 ZIP，官方地址仍作为 Gradle 的 fallback。
- 不要在 Gradle daemon 仍写入 `.tmp/gradle_download*` 时覆盖或删除活动文件。

## 证据

- Gradle 9.4.1 `SourceDistributionResolver.kt` 的 `candidateRepositories()` 先使用 Wrapper 推导的 `primaryRepository`，再使用官方 fallback。
- 腾讯镜像对源码包请求返回 HTTP 200、`content-type: application/zip`、`content-length: 75236150`，Range 请求返回 HTTP 206。
- 本地有效副本通过 `unzip -t`，受管缓存中的 988 B 副本被 `file` 识别为 HTML 文本。
- Android Studio 的 Gradle 插件在 `prepareForExecution` 阶段加入 `-Didea.active=true`。该标记可以用于区分 IDE 发起的 Gradle 操作，但不能改变源码分发包的解析仓库。
