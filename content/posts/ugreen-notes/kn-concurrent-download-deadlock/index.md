---
title: "KMP 双 slice 并发构建 Kotlin/Native 下载死锁（Resource deadlock avoided）"
date: 2026-11-19T11:24:18+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "构建", "CI/CD", "KotlinMultiplatform"]
---

## 现象（symptom）

iOS 打包 job（双 slice 并发构建 XCFramework）在冷缓存时偶发失败：

```
> Task :domain-device:downloadKotlinNativeDistribution FAILED
> java.io.IOException: Resource deadlock avoided
```

同时其它 10 个模块的 `downloadKotlinNativeDistribution` 一起完成/报错，构建整体失败。Retry 通常能过。

## 已验证成因（verified cause）

- `scripts/build-ios-xcframework.sh` 把真机 / 模拟器两个 slice 拆到两个并发 Gradle 进程，共享同一个 `KONAN_DATA_DIR`（CI 注入 `$CI_PROJECT_DIR/.ci-konan`）。副本还各自建独立 git worktree。
- 冷缓存时两个进程同时下载/解压 K/N 发行版与编译器依赖（llvm、libffi）到同一 `.ci-konan/dependencies`，macOS APFS 并发写同一文件触发 `Resource deadlock avoided`（JVM 文件锁竞争）。
- **关键点**：`downloadKotlinNativeDistribution` 不是全局唯一 task，而是**每个 K/N 子项目各自注册**的同名 task（本项目 56 个）。原有防护（commit 9b7440da）只预热 `:core-util:downloadKotlinNativeDistribution` 单模块——它只 populate 了 core-util 的环境，其余模块在 fan-out 后仍各自检查/解压同一目录，死锁依旧。
- 时间线实证：预热 `:core-util` 下载完工具链后 fan-out，随后 11 个模块的同名 task 并发执行，`:domain-device` 抢锁失败。

## 有效恢复（effective recovery）

把 fan-out 前的单进程预热命令从单模块改成**不带模块前缀**的全模块调用：

```bash
# 改前（只预热一个模块，其余模块 fan-out 后仍并发写）
./gradlew ":core-util:downloadKotlinNativeDistribution" "${GRADLE_ARGS[@]}"
# 改后（无前缀 → Gradle 解析到全部 56 个子项目的同名 task，单进程先跑完）
./gradlew downloadKotlinNativeDistribution "${GRADLE_ARGS[@]}"
```

- 验证：`./gradlew downloadKotlinNativeDistribution --dry-run` 确认覆盖全部 56 个模块（含失败的 `:domain-device`）；热 KONAN 缓存下全模块预热 1s BUILD SUCCESSFUL；单测 + 全套 CI 契约测试通过。
- 加单测锁定契约：预热行必须含 `downloadKotlinNativeDistribution` 且**不含** `:module:` 前缀，防止回退到单模块。
- 这是最小对症修复：工具链只下一份，冷启动成本不增加；未来新增 K/N 子模块时无前缀调用自动覆盖。

## 边界（boundaries）

- 真正的端到端验证需在 macOS Runner 上跑一次冷缓存 `verify-ios-release`；本地只有热缓存 + dry-run，能证明命令覆盖范围与正确性，不能替代冷缓存全量链接。
- 另一条更彻底但更重的方案：给两个 slice 各自独立的 `KONAN_DATA_DIR`，从根上消除共享写。代价是冷启动下载两份工具链、缓存体积翻倍，是否采用按项目取舍。
- 这是既有 CI 问题，与具体版本升级（如 Compose 1.12.1）无关。判定某次失败是否此类：看该 MR diff 有没有碰 iOS 脚本 / KONAN 配置；没碰就不是升级引入，retry 可先解围，根治按本文改预热。

## 证据（evidence）

- 失败 job trace：`> Task :domain-device:downloadKotlinNativeDistribution FAILED` + `java.io.IOException: Resource deadlock avoided`；预热日志 `Warming Kotlin/Native distribution` 确实执行。
- `git show 9b7440da`：上次修复只预热 `:core-util` 单模块，未覆盖全部。
- `./gradlew downloadKotlinNativeDistribution --dry-run` 输出 56 个模块的同名 task。
- 修复 MR（ugreenhome-shared，独立分支 fix/ios-kn-concurrent-download-deadlock → release/1.9.0）。
