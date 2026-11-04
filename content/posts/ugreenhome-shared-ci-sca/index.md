---
title: "UgreenHome 共享库 CI：依赖安全扫描与内网构建复盘"
date: 2026-11-04T08:56:35+08:00
draft: true
tags: ["CI/CD", "Gradle", "Kotlin Multiplatform", "SCA", "SBOM", "依赖管理", "Nexus"]
categories: ["绿联工作笔记"]
---

## 背景

UgreenHome 的 iOS / Android 两端共用一个 Kotlin Multiplatform（KMP）共享库 ugreenhome-shared。随着库里引入的开源与第三方 SDK 越来越多，安全与合规团队希望能定期知道「到底用了哪些包、什么版本、有没有已知漏洞」，而不是每次发版手工对账。这就是 SCA（软件成分分析）的诉求。

SCA 的流程本身不复杂：先用 Gradle 导出依赖清单（SBOM），再用 Grype 之类的扫描器比对漏洞库，最后把结果写进内部 Wiki 并通知相关人。真正麻烦的是前面那一步——**导出 SBOM 需要先完整编译**，而编译机在公司内网，连不上 Google Maven、Gradle Plugin Portal 这些外网源，公共镜像又经常抽风。于是这次工作的本质，就是打通「在内网里把依赖完整解析出来」这条链路。

> 说明：文中提到的 MR 编号（如 !87）、Pipeline 编号（如 7190）都是内网 GitLab 的内部标识，只当作叙事锚点，外部无法访问，也不附链接。

## 名词解释

- **SBOM（Software Bill of Materials，软件物料清单）**：一次构建实际用到的全部依赖（含传递依赖）的清单，通常带版本与坐标，是安全扫描的比对基线。
- **SCA（Software Composition Analysis，软件成分分析）**：对 SBOM 做漏洞 / 许可证扫描的过程。
- **GAV**：Maven 坐标 group:artifact:version，例如 androidx.fragment:fragment-ktx:1.8.0，用来唯一定位一个依赖。
- **Nexus**：公司内网的私有仓库（Maven 代理 + 托管）。本次用到 maven-ugreenhome-release（正式包）、maven-ugreenhome-snapshot（内部 SNAPSHOT）、ugreenhome-group（聚合多个源）。
- **Grype**：一款开源漏洞扫描 CLI，被放进 Nexus 的 raw 仓，CI 从内网下载。
- **seed（镜像上传）**：在能连外网的机器上，把 Plugin Portal / Google Maven 上的包下载并上传到 Nexus，CI 再从内网拉。
- **init.gradle**：Gradle 启动时执行的脚本，用来统一改写「去哪个仓库找包」的优先级。

## 为什么 CI 里会「下包失败」

可以把 Gradle 在 CI 里的依赖来源想成三道独立的采购渠道，缺任何一道，构建都会在**不同阶段**挂掉：

1. **构建插件**（plugins { id("...") }）：Kotlin DSL 预编译脚本、Android Gradle Plugin（AGP）、Room 插件等，大多来自 Gradle Plugin Portal。CI 连不上，就要把整个插件包按 Maven 布局镜像到 Nexus（不能只丢进 raw 目录）。
2. **AGP 自己的旧式依赖**（buildscript { classpath ... }）：AGP 还会再拉一批 com.android.* 工具 jar（manifest 合并、lint 等），这些通常在 Google Maven，数量大，靠批量 seed + 阿里云 Google 镜像路由。
3. **业务代码真正引用的库**（implementation(...)）：AndroidX、公司内部 SNAPSHOT SDK、GitHub 上的 FastBle（经 JitPack）。**仓库顺序不对**时，Gradle 会先问腾讯镜像 → 返回 567（镜像没有 / 拒绝）→ 构建失败，哪怕 Nexus / JitPack 里其实有。

本次大部分改动，都是在调 tencent-repos.init.gradle 里的仓库顺序和「哪类包必须去哪个仓」，以及让运维 / 开发在有网环境往 Nexus 补包。

<pre class="mermaid">
flowchart LR
  subgraph ext[有外网的环境]
    EP[Plugin Portal / Google Maven / JitPack]
  end
  subgraph nx[Nexus 内网 Maven]
    REL[maven-ugreenhome-release]
    SNAP[maven-ugreenhome-snapshot]
    GRP[ugreenhome-group]
  end
  subgraph ci[GitLab CI Runner]
    EXP[kmp_dependency_export / verify-android]
  end
  EP -- seed 上传 --> nx
  ci -- Gradle + init.gradle 只连 --> nx
  ci -. 不直接连 google/Portal .-> ext
</pre>

原则：能进 Nexus 的先进 Nexus；CI 禁止 Runner 直连 google() / Plugin Portal；AndroidX 与 com.android.* 过渡走阿里云 Google 镜像，长期应在 Nexus 上代理 dl.google.com；公司 SNAPSHOT 与 JitPack**必须排在腾讯兜底镜像之前**。

## 整体方案

配套交付（在 ugreenhome-shared 仓库）：

- scripts/ci/tencent-repos.init.gradle — CI 仓库策略（核心）
- scripts/ci/publish-gradle-plugin-portal-mirror.sh — 外网 seed
- scripts/ci/android-agp-mirror-gavs.txt — AGP / lint 相关坐标列表
- build-logic/settings.gradle.kts — 子工程 build-logic 也要能解析 kotlin-dsl 插件

扫描步骤从 shared 抽到 home/cicd/ci 的模板 kmp-sca-template.yml，shared 只 include 并 pin 一个 commit（SCA_CICD_CI_REF），集中维护。在 develop 分支上挂一个 GitLab 定时任务（Schedule），变量 SCA_PIPELINE=1，定时跑 export → scan → publish。

## 本地能不能提前验证

这次在 CI 里一连串失败，并不是「Gradle 只能在线上测」，而是**默认本地构建路径和 CI 不是同一条路**，再叠加 Nexus 是否已 seed、本地缓存是否掩盖缺包。具体：

- **init 脚本默认不启用**：本地日常不传 -I，仍走开发者自己的仓库配置；CI 一定会加 GRADLE_CI_INIT="-I .../tencent-repos.init.gradle"。
- **Gradle 缓存**：本机曾经解析过的 jar 在 ~/.gradle，即使 Nexus 里还没有也可能编过；CI 冷缓存或 Runner 上没该包时就会挂。
- **seed 是独立步骤**：改 init 只解决「去哪找」，包若从没 upload 到 Nexus，要在有外网机器跑 publish 脚本，本地没 seed 就测不全。
- **自动化测的是「路由」不是「真下载」**：仓库路由的单测在 offline 下断言 URL 顺序，不会真从腾讯 / Nexus 拉 AGP / AndroidX。

建议的本地 / Docker 检查（尽量模拟 CI）：

    # 可选：避免本机旧缓存掩盖缺包
    export GRADLE_USER_HOME="${TMPDIR:-/tmp}/gradle-ci-parity-$$"
    mkdir -p "$GRADLE_USER_HOME"

    # 与 verify-android-main 相同的 init + 主任务
    ./gradlew -I scripts/ci/tencent-repos.init.gradle       :app-shared:assembleAndroidMain -Pugreen.enableIos=false       --console=plain

    # 改 init / CI 契约时，跑 Android 相关单测
    python3 -m unittest discover -s scripts/tests -p 'test_*.py' -v

另外，Schedule 的 SCA export 与 MR 的 verify-android-main 触发的 Gradle 深度不同：只跑其一可能漏掉另一类依赖。所以「MR 前按 CI 等价条件跑过」比「只在 CI 里一层层试」高效得多。

## 看起来「修了很多次」，其实是三条独立链路

把现象混在一起会以为「同一个 SCA 翻来覆去修」，其实是三条链路各红过几次：

- **A. Gradle 能不能编**（export 阶段下包、编译）：Nexus seed、init.gradle 三条 classpath 顺序。
- **B. 运行时依赖路由**（export 后半段 assemble）：com.github.Jasonchenlijian:FastBle 应走 JitPack，但 Gradle 先问了腾讯镜像 → 567。修复是在 init 里对 com.github.* 配置 exclusiveContent 指向 jitpack.io，并排在腾讯之前。
- **C. 扫 SBOM**（export 已成功，scan 失败）：Grype 装完不在 PATH。原因是 job 里写 bash install-grype.sh，脚本里的 export PATH=... 只在子 shell 生效，回到主 shell 后没有 grype——纯 Shell / CI 写法问题，与镜像无关。

其中一个容易误判的例子：某次 Pipeline 总状态是绿的（allow_failure），export 已成功，只有 scan 红。如果只看「Pipeline 绿没绿」或只盯 export，会以为「还没修好」或「又坏了」，其实已经进入了下一轮问题 C。

## 时间线（精简）

下面用「现象 → 原因 → 动作」还原线上顺序；Pipeline / MR 编号只作日志锚点。

- **阶段 1（export 秒挂）**：export 需要编译 build-logic，首先下载 kotlin-dsl 等插件，Runner 连不上 Plugin Portal。动作：Grype 放进 Nexus raw；SCA 模板 pin 到含修复的 ci commit。
- **阶段 2（插件 mirror 放错地方）**：插件 jar 放在 raw 路径 Gradle 不认，或 Maven hosted 缺 maven-metadata.xml、content filter 把包装排除。动作：改存 maven-ugreenhome-release，补 metadata，调整顺序。
- **阶段 3（MR 全量 Android 编译打地鼠）**：verify-android 要做全模块 assemble + Lint，依赖面更大，每修好一个坐标才报下一个。依次解决 AGP buildscript 传递依赖、Room 插件、AndroidX、内部 SNAPSHOT、Lint 工具链；同期还有单 Runner 排队、job 内 apt 装 JDK 超时等基础设施噪音。
- **阶段 5（FastBle 路由）**：!89 在 init 里对 com.github.* 配置 exclusiveContent → jitpack.io，排在腾讯之前。
- **阶段 6（Grype PATH）**：!133 在 scan job 里 install 后显式 export PATH 并 command -v grype；!90 把 SCA_CICD_CI_REF pin 到修复 commit。最终 export + scan + publish 全绿。

## 为什么「修了很多次」的根因

不是「Gradle 只能一个一个试」，而是几件事叠在一起：

- 本地默认路径 ≠ CI 路径（未 -I、未清缓存、未 seed 就 push，Runner 上才第一次真解析）；
- Schedule export 与 MR verify-android 深度不同，只盯其一会漏；
- Nexus 内容与 init 规则分批合入，有时 init 已改包还没 seed；
- Gradle 一次报错通常只指向当前缺的一个 GAV，日志像打地鼠，但本地冷缓存跑一次 assemble 往往能扫出一串缺包；
- 旧 Schedule / 旧 SHA 误导（例如某次失败是合入前的旧代码）；
- SCA 拆在两个仓库：Gradle 问题改 shared，scan 脚本改 cicd/ci，还要 shared 再 pin 一次，少一步就「一半好一半坏」。

## 交付与后续

已落在 develop 的能力：init 脚本统一内网 / Nexus / 阿里云 / JitPack 顺序，Runner 不直连 Google / Plugin Portal；外网 seed 脚本 + AGP 坐标列表；相关 MR 已合，定时任务验证 export + scan + publish 全绿。

建议后续：Nexus 增加 Google Maven 代理，减少 CI 对阿里云直连与手工 seed 的依赖；Android CI 镜像预装 JDK 17，去掉 job 内 apt；轮换曾在不安全渠道出现过的 Nexus 发布账号密码；升 AGP / Kotlin 时按「更新 GAV → 外网 seed → 跑 verify-android + Schedule」走。

## 工程师速查

SCA 相关 MR / Pipeline 对照（内部标识，叙事用）：

| MR | 仓库 / 分支 | 内容 |
| --- | --- | --- |
| !87 | shared / develop | Nexus 优先 + init + seed |
| !89 | shared / develop | JitPack 排在腾讯之前 |
| !90 | shared / develop | pin SCA 模板（Grype PATH 修复） |
| !133 | cicd/ci / main | scan job：install 后回写 PATH |

| Pipeline | 说明 |
| --- | --- |
| 7185 | !87 后 export 失败在 FastBle / 腾讯 567 |
| 7187 | !89 后 export ok、scan 红（Grype 不在 PATH） |
| 7190 | !90 后 export + scan 均 ok，当前验收基准 |

定时任务：develop 分支，变量 SCA_PIPELINE=1。扫描结果落在内部 Wiki 的 SCA 最新页。
