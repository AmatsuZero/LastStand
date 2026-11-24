---
title: "多台 macOS Runner 怎样共享缓存：一次从本机到 NAS 的技术选型"
date: 2026-11-24T15:55:25+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["CI/CD", "GitLabRunner", "CocoaPods", "Gradle", "KotlinMultiplatform", "Xcode", "迁移"]
summary: "一台 macOS Runner 的可用空间跌破 60 GB，定时维护都跑不起来了。我们用现有 NAS 分担长期留存，再用跨机实测决定哪些缓存值得共享。"
---

一台负责 iOS 构建的 Mac，只剩不到 **60 GB** 的可用空间。构建缓存越积越多，连定时维护任务都跑不起来了。我们还有另一台 Mac 可以接构建，但两台机器各存一份缓存。作业换台机器跑，有些依赖要重新下载，原本能复用的编译结果也得重新生成。

当时内网刚接入一台 NAS。我们想用它存放能跨机复用的缓存，让两台 Mac 都能取到同一份，同时减少各自长期保留的副本。构建仍在本地执行，所以我们得分别算清本机能少留多少缓存，以及从 NAS 下载、解包之后，一次构建到底能省多久。

## 这个 iOS 工程是怎么构建的

我们的 App 以 Swift 和 Objective-C 写成的原生 iOS 工程为宿主，部分页面和功能由 React Native 实现，还有一部分业务代码放在 Kotlin Multiplatform（KMP）共享模块里，供 iOS 和 Android 共用。宿主用 CocoaPods 安装和集成原生依赖、React Native 的 iOS 运行时，以及 KMP 发布的二进制 Pod，最后由 Xcode 编译和归档整个 App。

KMP 模块有自己的流水线。Gradle 准备依赖和工具链，Kotlin/Native 把 Kotlin 代码编译、链接成面向真机和模拟器的 framework，再合成 XCFramework，作为 Pod 发布给宿主。日常的 App 流水线直接消费已发布的版本，通常不用从源码重编 KMP。也就是说，这次迁移同时涉及两条构建链。**App 流水线**里的 CocoaPods 下载缓存和 Xcode 编译缓存，以及 **KMP 流水线**里的 Gradle 缓存和链接产物缓存。

## 为什么选 SeaweedFS 和 GitLab Runner

我们先看了 Tuist 的远程缓存。它的缓存节点可以跑在自己的 NAS 上，编译产物也可以留在内网，但节点仍要连接 Tuist 服务端来注册和验证访问权限。接入托管服务端时，生成自托管节点的凭据需要 Enterprise。连服务端也一起部署到内网，则需要单独的付费服务端许可。我们原本想借现有设备搭一套无新增订阅的共享缓存，这项授权要求让我们放弃了 Tuist 方案。[Tuist 自托管缓存文档](https://tuist.dev/en/docs/guides/cache/self-host) · [Tuist 服务端自托管文档](https://tuist.dev/en/docs/guides/server/self-host/server)

最终方案是在 NAS 的 Docker 环境里跑 **SeaweedFS**。它是一个开源存储系统，这里用它提供与 S3 兼容的接口。可以把 S3 理解为一个通过网络按名称存取文件的服务。我们的缓存压缩包就是其中的对象，数据实际落在 NAS 的磁盘上。[SeaweedFS 项目](https://github.com/seaweedfs/seaweedfs) · [S3 对象存储简介](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)

**GitLab Runner 的分布式缓存，本质上是把作业目录里的文件按键搬到共享存储。** 作业开始时，Runner 用 CI 配置算出缓存键，在本项目的 S3 路径下找对应的归档，找到就下载并解包。允许写回的作业结束后，再把指定目录的当前内容打包上传。同一个项目的另一个 Runner 只要算出相同的键，就能取到同一份归档。Runner 负责搬文件，解包后哪些文件可以复用，由 CocoaPods 或 Gradle 各自判断。构建仍在本机磁盘上执行，省去了给每台 Mac 挂载 SMB 或 NFS 共享目录。[GitLab CI 缓存机制](https://docs.gitlab.com/ci/caching/) · [GitLab Runner 分布式缓存](https://docs.gitlab.com/runner/configuration/speed_up_job_execution/#use-a-distributed-cache)

连通性验证也要走这条真实路径。试运行时，作业里的 `curl` 已经能收到 S3 的 `403 AccessDenied`，Runner 恢复缓存却仍报 `no route to host`。给 macOS 上的 GitLab Runner 进程授予本地网络权限后，两台机器才都能通过 Runner 的缓存机制下载、解包并校验同一个测试文件。

## 从改配置到跨机命中

这次改动分两处。**Runner 的 `config.toml` 决定缓存发到哪里，项目的 CI YAML 决定哪些目录可以归档、用什么键，以及哪些作业有权写回。** 只改 Runner 配置，流水线还不知道该共享哪些文件。只写 CI 规则，归档也只会留在原有的缓存后端。

在两台 Mac 上，我们按实际运行的 Runner 注册条目修改 `config.toml`。有一台 Mac 同时运行 Shell 和 Docker 两个 executor，两个服务各读自己的配置文件，需要分别核对。下面是去掉地址和凭据后的配置结构。两台 Runner 指向同一个 bucket 和前缀，并设置 `Shared = true`。

```toml
[[runners]]
  # 合入已有 Runner 条目，其余注册配置省略。
  [runners.cache]
    Type = "s3"
    Path = "runner"
    Shared = true

    [runners.cache.s3]
      ServerAddress = "<NAS 的 S3 endpoint>"
      BucketName = "<CI 缓存 bucket>"
      BucketLocation = "us-east-1"
      AuthenticationType = "access-key"
      AccessKey = "<从安全配置注入>"
      SecretKey = "<从安全配置注入>"
```

主工程和 KMP 子模块都修改了各自的 `.gitlab-ci.yml`。CocoaPods 用锁文件给归档分组，Gradle 用 Wrapper 配置和依赖版本表给归档分组。两边都明确列出要打包的目录，普通构建使用 `pull` 只读，允许预热和写回的任务使用 `pull-push`。两个项目共用 S3 后端，归档仍按项目和缓存键隔离。S3 凭据由 Runner 配置管理。

```mermaid
flowchart TB
    CI["项目 CI YAML<br/>选缓存目录、计算 key、指定读写策略"]
    TOML["两台 Mac 的 config.toml<br/>配置同一 S3 bucket 和共享前缀"]
    A["Mac A 上的预热或构建作业<br/>下载并准备缓存目录"]
    NAS[("NAS 上的 SeaweedFS<br/>按项目和 key 存缓存归档")]
    B["Mac B 上的构建作业<br/>Runner 按 key 请求缓存"]
    HIT["解包到 Mac B 的工作目录<br/>构建工具检查可以复用的内容"]
    MISS["缓存缺失时<br/>按原路径下载依赖并构建"]
    CLEAN["作业结束<br/>回收本次作业的临时目录"]

    CI --> A
    CI --> B
    TOML -.-> A
    TOML -.-> B
    A -->|Runner 打包上传| NAS
    B -->|按 key 查询| NAS
    NAS -->|命中后下载| HIT
    NAS -->|对象不存在| MISS
    HIT --> CLEAN
    MISS --> CLEAN
```

上图是 CocoaPods 和 Gradle 共用的归档传输路径。两类编译产物另有匹配逻辑。Xcode CAS 通过手动流水线试验跨机恢复，KMP 链接缓存则由构建流程主动向 S3 请求对应的二进制。两者目前都保留原来的正式构建路径。

## CocoaPods 下载缓存，省掉重复下载

CocoaPods 安装依赖时，先根据锁文件确定版本，再查找本地是否已有对应的下载内容。我们把下载目录和对应的 podspec，也就是依赖的规格文件，打包到 NAS。换一台 Mac 执行 `pod install`，CocoaPods 可以直接使用恢复下来的依赖，再照常完成安装和工程集成。GitLab 的归档键由 `Podfile.lock` 与 `Gemfile.lock` 决定，合并请求和受保护分支使用不同前缀。锁文件变化时触发预热，预热任务串行写入。[CocoaPods 安装与锁文件](https://guides.cocoapods.org/using/pod-install-vs-update.html)

第一次跨机验收时，读取任务恰好被调到了写入的同一台 Mac。我们重新调度，用日志里的 Runner ID 确认换了机器。另一台 Mac 花约 **13 秒**下载并解包 **1.03 GiB** 的归档。安装前，用项目的实际安装逻辑确认 **24 个锁定的 Git Pod 全部命中**，随后的 **120 个 Pods** 安装完成，锁文件检查通过。这组结果证明换机后能复用下载过的依赖。安装一共快了多少，还需要同机的冷、热对照。

## Gradle 缓存，先恢复依赖，再看任务能否跳过

在 KMP 流水线里，GitLab Runner 打包的是 Gradle 的依赖目录和 Wrapper 下载的 Gradle 发行包，以及 Kotlin/Native 工具链目录。另一台 Mac 花约 **28 秒**恢复了 **1.66 GiB** 的归档。这样，构建可以使用已经下载的依赖和工具链。日志里的 `Successfully extracted cache` 证明了归档恢复，到这里还不知道哪些编译任务被省掉。

Gradle Build Cache 的判断粒度是**单个任务**。对支持缓存的任务，Gradle 会根据任务的实现和声明的输入生成一个键。以编译任务为例，输入可以包括源码、编译选项和依赖。只要键相同，Gradle 就能取回之前生成的输出，省去重新执行任务，日志会显示 `FROM-CACHE`。`UP-TO-DATE` 表示当前工作目录里已有可用输出。这次用 GitLab 的归档搬运 Gradle 本地缓存目录，任务输出仍由 Gradle 自己查找。跨机恢复已验证，Kotlin 编译任务的命中数量和耗时收益还未测定。[Gradle Build Cache](https://docs.gradle.org/current/userguide/build_cache.html)

## Xcode CAS，复用单个编译动作

打开 Xcode 的 Compilation Cache 后，编译器会给一次编译动作的输入计算指纹。后续构建遇到相同的动作时，可以从 CAS 取回复用的编译结果，例如目标文件或模块。CAS 是内容寻址存储，内部用内容摘要引用数据。把整份 CAS 复制到另一台 Mac，只是把这些结果带了过去。那台 Mac 仍要根据自己的有效编译输入找到匹配项，找不到就重新编译。[Xcode 26 编译缓存说明](https://developer.apple.com/documentation/Xcode-Release-Notes/xcode-26-release-notes?changes=la_5__7_1)

我们在同一台消费 Mac 上两次恢复同一份 CAS，用相同提交、依赖和工具链做无签名归档。每轮都用新的 DerivedData，也就是 Xcode 保存构建中间产物的目录。两组之间只改了源码 checkout 的物理路径。

下表只统计归档构建阶段，缓存的读写开销另计。

| 消费端 checkout | 空 CAS | 本机热 CAS | NAS 恢复的 CAS |
| --- | ---: | ---: | ---: |
| 与写入端同路径 | 0/2793，363.17 秒 | 2793/2793，66.28 秒 | 2283/2793，294.68 秒 |
| 与写入端不同路径 | 0/2793，361.34 秒 | 2793/2793，71.26 秒 | 1199/2793，362.42 秒 |

不同路径组命中了 1199 项，归档还是花了 362 秒。路径对齐后多命中的 1084 项中，有 1068 项是 Clang 源码编译。两组的 Swift 编译和模块产出仍都是 0/62。这里总命中数涨了多少只是第一层信息，更要紧的是哪些编译任务被省掉了。

同路径组花 **9.73 秒**恢复缓存，写入端另花 **13.93 秒**压缩并上传。假设写入端本来就要归档，从消费端冷构建里扣掉热构建时间和一写一读的开销，约省 **45 秒**。再把两端约 **15 秒**的路径准备算进去，单轮估算净省 **30 秒**。这次无签名归档只测了一轮，顺序固定，同机热缓存又明显更快。因此，正式构建继续使用本机 CAS，NAS 回放留在实验入口里。

这也解释了为什么迁移后还要做本机清理。约 **1.99 GiB** 的 CAS 在试验中额外产生了三份约 **0.88 GiB** 的压缩包，写端、读端和 NAS 各一份。作业结束可以回收解开的目录，Runner 缓存目录里的 ZIP 仍需单独处理。我们验收时分别核对工作目录、Runner 缓存目录和 NAS 上的对象。那台可用空间跌破 60 GB 的机器究竟能长期省下多少磁盘，仍需要看日常构建的峰值和留存数据。

## KMP 链接缓存，直接复用已链接的二进制

依赖和工具链都准备好之后，Kotlin/Native 还要链接出 iOS framework。一个 XCFramework 可以打包多个目标的二进制，我们把真机和模拟器的那两份分别称为 slice。旧方案把它们存进 Nexus 制品仓库的固定槽位，不同构建算到同一个槽位时，新产物会覆盖旧产物。[Kotlin/Native 编译和链接](https://kotlinlang.org/docs/native-improving-compilation-time.html)

新方案在 NAS 上为每个构建键和 slice 存一个对象，例如 `v1/<build-key>/ios-arm64.tar.gz`。构建脚本在启动链接前，用源码提交、锁定的子模块、工具链、构建模式和目标平台算出键。找到归档后，核对 SHA-256 再解包，将已链接的 framework 直接交给打包步骤。真机与模拟器分别查询，命中哪一个，就跳过哪一个的链接。缺哪个才构建哪个，新产物通过条件上传保护已有对象。预发布 tag 和正式 tag 指向同一提交且键一致时，可以复用二进制，仍分别生成各自版本的 Pod 发布包。

这个后端在隔离的 SeaweedFS 上已验证签名读写、不同键共存和重复上传的保护。代码已合入，正式打包仍默认用 Nexus。切过去前，我们要用真实 NAS 做冷构建、Nexus 命中和 NAS 命中的对照，确认两台 Runner 之间两个 slice 都能命中，再用包括归档传输在内的耗时决定是否启用。

对于也想用 NAS 缓解 Runner 空间压力的团队，建议先挑一类常用的下载缓存做小范围验证。让读取作业换机，核对它取回了哪份归档、构建日志里少了哪些工作，以及作业退出后本机还有几份副本。这样既能知道哪块 SSD 真的能腾出空间，也能判断下一层缓存值不值得过网。
