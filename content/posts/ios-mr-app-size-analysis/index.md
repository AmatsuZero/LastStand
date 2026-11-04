---
title: "iOS MR 包体积分析实践：APPAnalyze、Link Map 与跨项目接入"
date: 2026-11-02T18:24:53+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["iOS", "CI", "包体积", "APPAnalyze", "LinkMap"]
---

## 这个 job 解决什么问题

`analyze_app_size_mr` 是合并前的包体积预检：复用 `build_app` 已构建的 App，回答「当前包有多大、代码与资源各占多少、哪些模块或资源最重、这笔 MR 相比目标分支是否增长」。分析结果自动出现在 MR 评论里，并附完整 HTML / JSON 报告，方便评审时定位增长来源。

几个关键约定：

- **不重新编译 App**：依赖 `build_app` 的 Beta、iphoneos、无签名产物，分析阶段只做扫描、汇总和报告；
- **APPAnalyze 看最终 .app**，二进制、资源和静态扫描问题；**Link Map 补足主程序内部静态库的来源归因**；
- 分支 push 的 `analyze_app_size` 负责写入基线；MR 的 `analyze_app_size_mr` 只读取目标分支基线；
- `allow_failure: true`：分析失败允许流水线继续；扫描提示用于评审参考，当前没有按体积阈值阻止合并。

## MR 的真实运行结果（以 !271 为例）

MR !271 已合入；最终 Pipeline #7020 成功，源码 SHA 为 `e55c648b`。`build_app #17094` 成功（约 451.6 秒）；`analyze_app_size_mr #17108` 成功（约 80.6 秒）。这是单次耗时证据，不能代表所有项目或冷缓存场景。

`package_size.json`：`.app` 总计 357,058,497 B（357.1 MB），二进制 210,367,928 B（210.4 MB），资源 146,690,569 B（146.7 MB）。报告展示使用十进制 MB。

报告 zip 实际下载成功（20,171,141 B，含 12 个文件），已核验 `modules_index.html`、`app_size.html`、`module_size.html`、`package_size.json`、`issues.json`、原始 Link Map 和两个摘要 JSON 均在其中。

值得注意的边界：该次评论明确「目标分支尚无 baseline」，因此没有有效 Δ；`new_large_resources.json` 的 `count=0` 不能证明本 MR 没有新增大资源。本次验证覆盖远端 job 状态、源码身份、日志、评论和下载制品；未重新构建 App，也未在浏览器中逐页点击 HTML。

## 工作原理：从构建产物到 MR 评论

<pre class="mermaid">
flowchart TD
    A[MR push] --> B[build_app: Beta/iphoneos/unsigned]
    B --> C[本机 staging: .app.zip + 主 App Link Map]
    C --> D[analyze_app_size_mr: review 阶段, needs build_app]
    D --> E[解压 .app → APPAnalyze arm64]
    D --> F[package_size.json / issues.json / HTML]
    D --> G[Link Map 汇总 + 新增大资源对比]
    E --> H[完整报告 zip → MR 评论]
    F --> H
    G --> H
</pre>

合入目标分支后 push → `build_app` → `analyze_app_size` → 更新目标分支 baseline → 后续 MR 读取。

### 产物传递

`build_app` 用 `stage_built_app.py` 从该 job 的 `DerivedData/Build/Products/Beta-iphoneos` 中定位 `UgreenHome.app`，压缩到 `$CI_BUILDS_DIR/app-size/$CI_PIPELINE_ID/UgreenHome.app.zip`；主 App Link Map 一起拷贝到该目录。使用 pipeline ID 隔离不同流水线，避免被后续 checkout 的 `git clean` 清掉。

这依赖构建与分析访问同一台机器、同一个 `CI_BUILDS_DIR`。`needs` 仅保证依赖顺序，不保证调度到相同 Runner。迁到多台 Mac、容器或自动伸缩 Runner 时，应改成 GitLab artifacts、受控对象存储或共享卷，并保持同一 pipeline / commit 绑定，不能直接照搬本机路径。

### APPAnalyze 与报告加工

`run_mr_app_size_ci.sh` 设置 `APPANALYZE_CONFIG=iot/appanalyze/config.ci.json`，传入 `APP_SOURCE_PATH` 与 `SKIP_MARKDOWN=1`，调用 `make app-size-analyze`。该 Make 目标进入 `ANALYZE_ONLY=1`，最终执行：

```sh
appanalyze --ipa "$APP_PATH" \
  --output "$ANALYZE_OUT" \
  --arch arm64 \
  --config "$CONFIG_PATH"
```

这里 `--ipa` 实际接收脚本找到的 `.app` 路径。`package_size.json` 提供总大小、二进制、资源及 components / bundles；`issues.json` 提供未使用资源、重复资源、大资源、大符号等扫描结果。`materialize_appanalyze_html.py` 为模块页生成入口索引和带 `?framework=模块名` 的链接，并适配模块页默认选择。

所有 HTML / JSON、原始 Link Map 和 README 一起打包为 `iot/build/appanalyze-report.zip`，CI 保留 7 天。下载后完整解压，优先打开 `modules_index.html`；只拿 `app_size.html` 会丢失相对路径依赖，模块页可能打不开。长期趋势数据应另行归档。

### 基线与增量

分支 push 的 `analyze_app_size` 使用 pull-push，写入 `.ci-app-size/baseline/package_size.json` 和 `baseline-meta.json`；元数据含 ref、commit_sha、pipeline_id、analyzed_at、configuration=Beta、unsigned=true。MR job 使用 pull，只读取目标分支快照，不把自己的结果写回目标分支基线。增量本质为「当前值 − 基线值」。

基线是目标分支最近一次可用分析的快照，不一定就是当前目标 HEAD，也不是 MR merge-base。首次没有基线、缓存过期或 key 不匹配时只能显示快照。要保证 Xcode、架构、构建配置、优化 / 裁剪方式和分析工具版本一致，才能解释 Δ；工具或口径变化时应换版本化 key 并重建基线。

### 评论与并发

评论包含总量 / 增量、全部包内模块、资源 bundle Top 25、扫描规则摘要、Link Map Top 25、新增大资源和制品链接。通过 marker `<!-- ugreenhome-app-size:v1 -->` 找到旧评论；当前实现是删除旧评论再发布新评论。评论带 commit / pipeline / job，发布前读取 MR HEAD SHA，旧流水线若已过时就跳过覆盖。这个检查减少陈旧覆盖，但不是事务锁。

认证依次尝试 `CI_JOB_TOKEN`、`CI_MR_NOTE_TOKEN`、`CI_READ_API_TOKEN`；只读 token 不能赋予评论写权限。本次实际使用专用 `CI_MR_NOTE_TOKEN`。MR 默认按 MR IID 串行，同 MR 的新 push 可取消旧可中断分析；不同 MR 仍可并行，是否需要全局限流取决于 Mac CPU / 内存。

### 新增大资源提醒

脚本按 `(module, bundle, name, kind)` 与基线比对，找出「基线没有、当前大小 ≥ 2 × 1024 × 1024 B」的文件或 imageset。它识别新增条目，不识别已有同名文件从小变大的情况；资源改名也可能被视为新增。评论展示前 15 项；满足条件且 `ENABLE_DINGTALK=true`、webhook / token 已配置时可发送提醒。缺基线时不产生有效新增判断。静态扫描规则 `largeResource` 的阈值另有配置，不等同于这里的 2 MiB 新增提醒。

## Link Map 基础：为什么还需要它

Swift / Objective-C / C / C++ 等源文件先编译为目标文件 `.o`；静态库 `.a` 或静态 framework 携带这些代码，链接器按需要把它们组合进最终 Mach-O。链接完成后，一个静态 Pod 通常不会以独立动态 framework 文件留在 `.app` 中，APPAnalyze 的模块表便难以把主程序内部的字节逐一还原到 Pod。Link Map 记录链接布局和来源，正好补上这一层。framework 是封装形式，内部二进制既可能静态也可能动态，不能只看扩展名判断。

Link Map 的四个段落：

- **Object files**：输入目标文件编号与路径。静态库成员常显示为 `libFoo.a(Bar.o)` 或 framework 内部对象；`[0]` 一般表示链接器生成的内容。
- **Sections**：最终输出 segment / section 的地址和大小，如 `__TEXT/__text`（机器码）、`__TEXT/__cstring`（字符串）、`__DATA` 的数据。标准 Sections 行通常没有 `[对象编号]`。
- **Symbols**：地址、十六进制大小、`[对象编号]`、符号名。通过对象编号关联 Object files，再按库 / 模块归并，得到已保留符号的来源贡献。
- **Dead Stripped Symbols**：被链接器判断为不需要、已从输出中裁掉的符号，常以 `<<dead>>` 开头。应独立统计，不能计入最终保留符号贡献。

```text
# Object files:
[  1] /.../libFoo.a(Bar.o)

# Sections:
0x100004000  0x00000010  __TEXT  __text

# Symbols:
0x100004000  0x00000010  [  1] _foo

# Dead Stripped Symbols:
<<dead>>     0x00000020  [  1] _unusedFoo
```

示例中 `_foo` 的 `0x10` 是 16 字节，来源为 `libFoo.a` 的 `Bar.o`；`_unusedFoo` 的 32 字节已经裁掉，应记录为 dead，而不加进 live。正确的基本归因是：live 符号 → object 编号 → 输入路径 → 静态库 / 业务模块 → 求和；Dead Stripped Symbols 单独输出。Sections 用于布局和总量校验，不应与 Symbols 重复相加。

### 这些数字为什么对不上 IPA 或内存

Link Map 的符号 / 地址范围之和、最终 Mach-O 文件大小、解压后的 `.app` 大小、压缩 IPA 大小、App Store 下载 / 安装大小、运行时内存是不同口径。文件还包含 header、对齐、链接器元数据、签名等；zero-fill / BSS 可占地址空间而不占同等文件字节；链接裁剪、LTO、常量合并会改变归属，后续 strip 又会改变文件。资源和动态库实现也不包含在主 App 的静态符号归因里。删除一个排名 10 MB 的库不代表 IPA 一定缩小 10 MB，必须重建后测量。

主 App 的 map 可说明链接进主程序的代码；动态 framework 的实现应看自身二进制或自身链接产物的 map，主 App map 主要能看到相关导入桩 / 指针等。App Extension 也有独立二进制和独立 map。Kotlin / Native、RN、静态 Pods 的路径归并是启发式规则，不等同于可靠的依赖图。

### 如何生成

```xcconfig
LD_GENERATE_MAP_FILE = YES
LD_MAP_FILE_PATH = $(SRCROOT)/build/linkmaps/$(TARGET_NAME)-LinkMap.txt
```

本项目将设置写在 `Tools/ios-ci/linkmap-ci.xcconfig`，由 `linkmap_xcargs.sh` 读成 `xcodebuild` 的 `KEY=VALUE` 参数；没有直接用 `-xcconfig` 作为全局覆盖，目的是避免影响现有 Pods 配置。`$(TARGET_NAME)` 由 Xcode 展开，使主 App 与 NotificationService 不争写同一文件。当前分析只收集 `UgreenHome-LinkMap.txt`。

## 迁移前必须处理的现有限制

### 5.1 当前 Link Map Top 混入 dead-stripped 符号

`linkmap_summary.py` 在遇到 `# Sections:` 后进入同一个解析状态；遇到 `# Symbols:` 和 `# Dead Stripped Symbols:` 只跳过标题，没有切换状态。因此它实际读取后续带 `[编号]` 的行，把 live 和 dead-stripped 符号一起累计。现有 fixture 把 `[编号]` 放在 Sections 行，不能覆盖真实 map 的完整分段。

对 job #17108 下载的原始 map 只读重算：当前 JSON 报告 186,240,725 B；截断 Dead Stripped Symbols 后，live 符号汇总为 163,330,336 B；混入的 dead 部分为 22,910,389 B。`UgreenHomeShared` 原报告为 84,639,319 B，live 部分为 81,036,921 B。这些 live 数仍是符号求和，不等于最终磁盘大小。

迁移时先为 objects / sections / symbols / dead 建立明确状态，Symbols 只计 live，dead 独立统计；加入真实格式 fixture，覆盖十六进制大小、零大小、链接器对象、缺失编号、静态库成员及 Dead Stripped 边界。

### 5.2 当前目标分支 cache key 没有正确展开

仓库 MR cache key 使用 `CI_MERGE_REQUEST_TARGET_BRANCH_SLUG`；GitLab 官方预定义变量清单提供 `TARGET_BRANCH_NAME`，却没有这个 `TARGET_BRANCH_SLUG`。本次 job 日志实际出现 `app-size-baseline-v1--protected`，目标分支部分为空，评论也没有取到基线。不能按文档字面认定已完成基线闭环。

应在流水线创建 / 配置展开阶段显式提供与分支 push 一致的目标分支 key，或通过 GitLab API / 对象存储按目标分支获取并校验基线。不能只在 `before_script` 里 export 一个 slug：恢复 cache 早于 script。也要核验 protected / non-protected cache 隔离后缀以及本地 / 共享 cache 配置。

### 5.3 基线和扫描结果的解释边界

Beta 无签名构建不能直接与 Release 发版基线混比，也不能当作 App Store 包大小。`UnusedClass` / `UnusedResource` 等结论需要结合反射、ObjC 动态调用、RN 注册、序列化和资源名称引用人工核实；不要根据优化构建的静态扫描报告直接删除代码。当前基线仅保存 `package_size.json` 与元数据，不保存按静态库的历史 Link Map 快照，所以 Top 表是当前快照，不是每个 Pod 的增长表。

## 其他项目如何接入

- 先固定口径：App / workspace / scheme、configuration、SDK / 架构、优化和 strip 选项；明确产物是无签名预检还是发版包。
- 在 Runner 服务账号中预装 Xcode、Python 3、zip、APPAnalyze 和项目构建依赖。当前 Homebrew tap 是 arm64 预编译二进制，Intel Runner 需另选可用发行版；固定实际版本，避免自动升级导致扫描口径漂移。
- 复用已有 build job：显式定位本次 DerivedData 中的 App，生成并绑定主程序 map；不要从历史 archive 随机找最近文件。不同 Runner 之间通过 artifacts 或受控存储传递。
- 迁移报告链路并保持 Python 同目录导入：各类 `app_size_*`、`mr_app_size_comment.py`、Link Map 脚本等；关闭或替换可选钉钉通知依赖。
- 替换项目名、App、map 文件名、产物路径、项目 marker，以及 `classify_object_path` 中的 Pods / SPM / 业务路径规则。
- 先处理第 5 节的 Link Map 分段和 cache key，再配置目标分支写基线、MR 只读基线。对不同目标分支分别建立命名空间；记录 baseline commit、时间、工具 / 构建版本，缺失时明确显示不可比较。
- 配置评论权限：先验证 `CI_JOB_TOKEN` 在当前 GitLab 的 MR Notes API 权限；不满足时使用专用最小范围 token。普通 MR 需可见的变量不能仅限 protected ref；不向不可信 fork 暴露写 token。只记录变量名，不把 token 值放进报告。
- 先以 `allow_failure` 运行观察；下载完整 zip，确认索引到模块页的相对链接有效。最后再考虑治理门槛：依据稳定历史数据约定增长预算、豁免和误报处理；不要将第一版静态扫描数直接变成合并门禁。

### GitLab 配置骨架（以 main 为唯一目标分支）

以下仅展示 job / cache / rules 结构。build_app、analyze 脚本及其产物传递必须先按本项目完成适配；这里刻意使用固定 main key，避免依赖不存在的目标分支 slug 变量。

```yaml
stages: [build, review]

.app_size:
  stage: review
  needs: [build_app]
  allow_failure: true
  interruptible: true
  script:
    - bash Tools/ios-ci/run_mr_app_size_ci.sh
  artifacts:
    when: always
    expire_in: 7 days
    paths: [iot/build/appanalyze-report.zip]

analyze_app_size:
  extends: .app_size
  resource_group: app-size-baseline-main
  cache:
    key: app-size-baseline-v1-main
    paths: [.ci-app-size/baseline/]
    policy: pull-push
  rules:
    - if: '$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == "main"'

analyze_app_size_mr:
  extends: .app_size
  resource_group: app-size-mr-$CI_MERGE_REQUEST_IID
  cache:
    key: app-size-baseline-v1-main
    paths: [.ci-app-size/baseline/]
    policy: pull
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == "main"'
```

两类 job 应继承项目自己的 macOS Runner tags / preflight；build_app 要有兼容的 rules。即使 key 字面一致，GitLab 的 protected cache 隔离仍可能使双方读到不同 cache，应通过实际 job 日志确认。

## 名词补充

- **APPAnalyze**：分析 iOS `.app` / IPA 的第三方工具，输出包大小、模块 / bundle 构成、未使用 / 重复 / 大资源与大符号等静态扫描结果。
- **Link Map（链接映射文件）**：链接器生成的文本文件，记录目标文件、段 / 节、符号及 dead-stripped 符号的布局与来源，用于把主程序内部的字节归因到具体静态库 / 模块。
- **resource_group**：GitLab CI 的串行资源组，保证同组 job 互斥运行；这里用 `app-size-mr-$CI_MERGE_REQUEST_IID` 让同 MR 串行、不同 MR 并行。
- **Baseline（基线）**：目标分支最近一次可用分析的快照，MR 增量以「当前值 − 基线值」计算；口径（Xcode / 架构 / 配置 / 工具版本）不一致时不可比较。
