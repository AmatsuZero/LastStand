---
title: "用真实任务区分 Gradle 的启动 JDK、后台 JVM 与缓存目录"
date: 2026-11-23T14:21:20+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Gradle", "构建", "踩坑"]
---

## 现象

给 Gradle Wrapper 设置 `JAVA_HOME` 指向 JDK 17，并显式设置 `GRADLE_USER_HOME`。依赖和日志出现在预期的缓存目录，但任务内读取的 Java 版本是 21。一个只复制 Wrapper 的最小工程会漏掉影响结果的项目配置。

## 已验证成因

原工程提交了 `gradle/gradle-daemon-jvm.properties`，其中 `toolchainVersion=21`。Gradle 9.4.1 据此选择执行构建的 JVM。启动 Wrapper 的 Java、运行任务的 Java、保存缓存的目录各有独立的观测值。

## 有效恢复

复现时一并复制项目锁定的 Wrapper 和 daemon criteria，沿用实际构建入口的环境。先运行 `./gradlew --version` 查看 Launcher JVM 和 Daemon JVM，再在临时工程的 `build.gradle` 中加一个不需要插件的任务。

```groovy
tasks.register('probeRuntime') {
    doLast {
        println("java.version=" + System.getProperty('java.version'))
        println("java.home=" + System.getProperty('java.home'))
        println("gradle.user.home=" + gradle.gradleUserHomeDir)
    }
}
```

用 `./gradlew --offline --no-daemon -q probeRuntime` 核对任务进程。离线运行需要预先缓存 Wrapper 分发包，并准备符合 criteria 的 JDK。比较两个入口时应在两端记录这三项，再决定是否需要改变选用的 JDK。

## 边界与证据

在 macOS 上，带原 criteria 的离线复测得到 Launcher JVM 17、Daemon JVM 21、任务内 Java 21，Gradle User Home 为显式指定的目录。这个探针只验证 Gradle 构建运行时。Android Studio 同步要从 IDE 单独触发并取证，编译器 toolchain 也需要按具体编译任务核对。

### Android Studio 已运行时，启动环境不会切换 Gradle User Home

**现象**：启动脚本设置了 `GRADLE_USER_HOME` 后，请求系统用 Android Studio 打开项目。IDE 已经运行时，下一次 Sync 仍可能使用旧缓存目录。

**已验证成因**：环境变量只在进程启动时确定，复用已有 IDE 进程不会重新注入环境。Android Studio 2026.2.2 将项目的 Gradle User Home 保存到内部 `$CACHE_FILE$` 的 `GradleLocalSettings`。执行路径优先读取该项目设置，未设置时才依次回退到 JVM 属性 `gradle.user.home`、环境变量 `GRADLE_USER_HOME` 和 `~/.gradle`。这个内部缓存没有仓库脚本可依赖的外部热重载契约。

**有效恢复**：在当前窗口进入 **Settings → Build, Execution, Deployment → Build Tools → Gradle**，填写 **Gradle User Home** 并点击 Apply，然后执行一次新的 **Sync Project with Gradle Files**。Apply 会更新项目的内存设置，新 Sync 会重新计算 Gradle execution 参数。已经运行中的 Sync 或任务不会中途切换目录。

**验收边界**：设置页显示目标路径只证明配置已写入。还应从 IDE 发起新的 Sync，并在目标 Gradle User Home 中检查本次 daemon 日志或新建缓存痕迹。终端 Wrapper 探针、脚本输出和设置页截图均不能替代 IDE Sync 证据。外部脚本直接修改 `cache-state.xml` 属于内部实现依赖，不能作为稳定方案。

**证据**：对已安装 Android Studio 2026.2.2 的 Gradle 插件字节码检查确认，`GradleLocalSettings.myGradleUserHome` 是项目设置，且 Gradle task 启动时会清理对应的 build-layout 参数缓存。
