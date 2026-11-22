---
title: "CMP Demo 跨端改版复盘：标题居中、安全区、原生桥接与 AI 助手交付"
date: 2026-11-22T11:06:05+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "KotlinMultiplatform", "Xcode", "构建", "debug", "CLI"]
---

这次任务是在已确认原型的基础上，改造 ondevice-ai-kit 的 Compose Multiplatform（CMP）能力详情页，同时处理 iOS 播放页崩溃，并完成 iOS、Android 模拟器验收。用户中途指出“标题怎么歪了”，暴露了首版实现和测试共同遗漏的几何条件。

最终改动已集成到项目提交 `b1fe0dbe8bcb28c5383c85c1e10730d6b14d5083`。这篇记录可复用的排障方法和交付约束。具体数字均属于本次样本，不是其他项目的通过阈值。文中路径使用仓库相对位置或占位符，临时结果包仅作为原任务的本地取证材料，不作为长期可下载附件。

## 快速排障索引

| 现象或搜索词 | 本次查实的原因 | 有效处理 | 不能据此推断 |
| --- | --- | --- | --- |
| 标题偏右、Row、weight | 标题在返回键右侧的剩余区域居中 | 测量返回宽度，左右对称预留，断言整屏中心 | `CenterHorizontally` 一定等于屏幕居中 |
| 页面顶部空白、安全区 | 外层 padding、导航占位与 Scaffold 避让叠加 | 明确安全区唯一责任方，删除重复占位 | 所有系统边缘都应忽略安全区 |
| 横屏预览过高、16:9 | 预览在滚动内容中，缺少有限视口约束 | 在滚动外按有限宽高拟合，实际只占拟合高度 | 比例修好就不会留下布局空槽 |
| 空态测试找不到 playback-preview | Host 有意隐藏 MTKView；包装曾与 native 重名 | 分离包装与原生标识，分别测空态和选片后 | 找到同名节点就证明原生渲染器存在 |
| hasVideo、kotlin2objc、SIGABRT | 新 Kotlin framework 混用旧 Swift Host 对象 | 保留旧对象取证，当前 framework + 全新隔离 DerivedData | Kernel Triage 的 VM 行证明内存耗尽 |
| exit 0、empty_model_response | CLI 自然结束但没有实现候选 | 读取终态事件与实际文件，保留失败并按授权换路线 | 退出成功、模型目录或 DELIVERY 自报等于交付 |
| 旋转后找不到标题 | Android 配置重建后回首页 | 读取实际路由并重入，再验证几何 | 布局回归通过证明旋转保留路由 |

## 先固定 CMP 与原生 Host 的职责

本项目的产品约束是：shared CMP 持有导航、页面、控件和状态；native Host 持有媒体选择、解码及渲染。布局调整必须在这个边界内完成。把播放控制页改成原生页面，即使截图相似，也不满足这次任务。

文件处理页保留既有 ViewModel 的运行、取消、输出清理、输出 lease 和记录语义。主流程展示输入、处理设置、运行状态、真实结果，以及不可用原因、重试和模型导入入口；原始 backend ID、strict selection 等放进默认折叠的高级项。高级参数可以折叠，恢复路径不能一起藏起来。

平台能力也必须来自对应 Host。本次使用 `videoProfileDescription` 展示要求，避免把 Apple 路线的 iOS 26+ 物理设备、320×180、24fps、1–48 帧、BT.709 SDR、4× 等条件写成 Android 通用限制。`selectedMode` 只表示用户选择，`presentedMode` 才能描述 Host 报告的实际呈现；仍须进一步用设备证据验证。

## 标题为什么歪了：居中的参照物错了

首版用自然宽度的返回区域，加上 `weight` 标题区域。标题虽然在自己的区域中居中，但自己的区域从返回键右边开始，因此相对整屏向右偏。

设整行宽度为 `W`，左侧返回区域宽度为 `B`，右边没有对称占位。标题所在剩余区域的中心是：

```text
B + (W - B) / 2 = W / 2 + B / 2
```

这说明，单纯调文字对齐方式不能修复参照区域。固定预留 80dp 也不能可靠覆盖不同返回文案、字号和可用宽度。

最终通过自定义 Compose `Layout` 实测返回区域宽度，在标题两侧预留同样宽度，再把标题中心放到整条 header 的中点。标题宽度受剩余安全空间限制，大字允许换行，返回区域保留可点击面积。实现细节应看项目源码，不能把这里的公式直接当可复制组件。

这次真正缺失的是验收条件。测试最初覆盖“有标题”和“返回能点”，没有覆盖“标题相对整屏居中”。用户截图因此成为新的有效反例。修复后增加：

- 标题中点与整屏中点的坐标误差。
- 标题、返回区域的边界有限且处于屏幕内。
- 标题与返回区域不相交。
- 横竖屏和大字号下重复验证。

本次 Android 四组配置的中心误差为 0–0.5px。这个结果证明这些配置下的几何表现，不代表所有字体、语言和设备都已覆盖。视觉反馈应转成可执行断言，不能只补一张“看起来好了”的截图。

## 安全区、媒体比例和主题必须验证实际渲染

### 安全区只应有清晰的责任方

原布局叠加了外层安全区 padding、旧导航竖向 Spacer 和 CMP Scaffold 避让。最初一轮 RED 使用了旧 framework，不能当作当前源码的可靠失败证据；随后以当前源重建才实际测到导航 `minY = 136pt`，违反该用例要求的上界。

恢复后由 Scaffold 负责页面内容的安全区，SwiftUI 背景延伸到系统边缘，删除额外 padding 与导航占位。辅助设置、报告内容仍保留适当安全区。需要分别审查背景、主内容和辅助页面，不能为消除顶部空白而全局忽略边缘。

### 有比例还需要有限宽高

将“全宽 16:9”预览放在垂直滚动内容里，横屏时仍可能高于可用视口。首轮定位节点测得的 frame 比值为 `2.30128`；当时 CMP 包装和 native 标识重名，所以这份测量不能唯一归因于原生视图。

最终把预览移到滚动区域外，使用有限 `BoxWithConstraints` 拟合 16:9；控件区域单独滚动。可概括为：

```text
fitHeight = min(availableWidth × 9 / 16, allowedHeight)
fitWidth  = fitHeight × 16 / 9
```

本次对媒体高度设置的半屏限制只是最大 cap，组件实际只占 `fitHeight`。中间候选曾预留整半屏槽位，会造成潜在竖屏空白，因此没有接受。几何验收既要检查比例，也要检查父容器实际占用空间。

### 空态包装与原生渲染器使用不同身份

既有 Host 在未选视频时设置 `MTKView.isHidden = true`。原生 `playback-preview` 因此不在可访问树中。测试若要求空态原生节点存在，本身就与产品状态不一致。

此前 CMP 包装复用了这个 tag，反而让测试误认找到了 renderer。最终约定：

- `playback-preview-container`：CMP 包装，空态验证它的有限边界和 16:9。
- `playback-preview`：唯一 native 渲染器，真实选片后验证数量、frame、横竖屏比例和画面运动。

这次没有修改生产 renderer 的隐藏行为来迎合测试，也没有放宽比例断言。先明确节点归属，再解释测量结果。

### 改主题色不等于改到了组件实际 token

改 `primary` 并不能保证 Filled Card 变白。本次实际需要修正 `surfaceContainerHighest`，再检查卡片和背景。编译成功只证明代码可构建，不能证明颜色、留白和视觉层次符合原型；截图目视核对仍有价值。

## hasVideo 崩溃：查实际链接产物，别只看源码

### 现象与已证成因

iOS 模拟器进入播放详情页后，在 `PlaybackEnhancementDemoActions.hasVideo` 的 Kotlin → Objective-C getter 调用处进入 forwarding，最终 `SIGABRT`。

当前 Kotlin 协议、生成头文件和 Swift 源码都有该属性。但旧 `PlaybackEnhancementHost.o` 缺少以下四个 Objective-C getter thunk，也就是供 Objective-C 调用 Swift getter 的桥接入口：

```text
hasVideo
isPlaying
inputName
playbackStatus
```

旧 App 的 Host 方法表为 14 项。保持播放器源码不变，链接当前 CMP framework，再使用全新隔离 DerivedData 重建，四个入口齐全，方法表变为 18 项；原有 EOS/重播、模式/后台 UI 回归随后通过。证据支持“当前 framework 与旧 Swift 对象混用”，没有必要添加播放器源码 workaround。

### 可复用的诊断顺序

1. 从异常前最靠近业务的桥接调用定位协议成员，区分 Objective-C forwarding 与普通 Kotlin 异常。
2. 核对当前协议、导出头和 Swift 实现，再检查实际 `.o`、App 符号与方法元数据。
3. 保留旧对象、原始日志及失败结果，记录各产物身份与摘要。
4. 先完成当前 framework link，再选择全新的、任务独占的 DerivedData 构建宿主。
5. 比较新旧桥接入口，并运行触发原症状的 UI 路径。

构建日志里出现 `SwiftCompile` 标题，不证明目标 Host 对象已重新生成；新的头文件也不证明旧消费者对象已失效。不要先广泛清理缓存，把唯一旧对象证据删掉。

### 仍然不能下的结论

Xcode 为什么保留旧对象，其内部依赖失效机制没有查实。报告中的 Kernel Triage VM 行也不是这次内存耗尽的证据。

知识库已有[另一篇 CMP 1.12.1 无障碍崩溃记录](../compose-mp-1211-accessibility-a11y-crash/)。那次涉及 `CMPAccessibilityElement` 已释放对象的 `EXC_BAD_ACCESS / SIGSEGV`，和本次 getter forwarding 的 `SIGABRT` 不同。相似的框架名称不能代替相同根因的证据，不能直接套用版本升级方案。

## UI 自动化：断言真实状态，保留测试自己的失败

这次同时遇到异步状态、懒加载入口和方向同步问题：

- CMP 状态存在约 250ms 的轮询。点击返回不代表媒体已打开，应等待实际 label、按钮和 Host 状态。
- Android 禁用按钮的 Text 子节点仍可能显示 enabled；应检查对应 button resource-id 的状态。
- LazyColumn 入口需要先进入可见的“视频”分类，再等待条目，不能假定目标一直在树中。
- 请求旋转不代表画面已完成旋转。先等待实际 `app.frame`，再断言几何；恢复时同样等待 portrait。
- Android 配置变化会重建 Activity，并回到首页。首几何脚本因此找不到标题；修正脚本读取真实状态并重入，未改变产品的路由恢复行为。

每轮字号、方向、尺寸调整都记录原值，并通过 `defer` 或 `finally` 精确恢复。失败脚本和首次错误保留，后续通过不能抹去先前证据，也不能改写成“旋转保留页面已通过”。

## AI 助手：授权、隔离、交付和验收分别取证

### 退出码不是实现候选

最初免费 `hy4free` 请求自然结束，exit 0，但终态为 `empty_model_response`，没有可用候选。其 provider `modelUsage` 记录了 `hy4std`；记录请求模型与结果用量即可，现有证据不足以解释路由原因或判断收费。

用户随后指定 `hy4flash-free`。先用当前 CLI help 核实模型 ID，并获得六份 Demo 源码及必要设计、测试、合同摘录的明确外发授权，再派发新任务。后续成功候选的 `modelUsage` 为该 ID。模型名称和额度都可能变化，本文记录不是未来可用性保证。

保留原提示、stdout/stderr 和原始事件。对于流式 JSON 按行解析终态 `result`、`is_error`、`modelUsage` 与工具事件；遇到非流式输出则按该次实际格式解析。不能把 exit 0、外层 SUCCESS 或助手写的 DELIVERY 当验收结果。provider/quota 失败不自动重试、循环换模或付费回退；已经给过的同一范围授权也不应重复索取。

### 文件工具不等于文件系统隔离

prompt、cwd、工具 allowlist 和 `--add-dir` 都不能单独证明 OS 写边界。文件交付任务应在每次独立调用中验证：

- 只允许该任务的候选目录；实际写探针确认仓库和无关临时目录被拒绝。
- CLI 必需的 trace 例外只匹配该次真实 PID，不复用旧 PID/profile。
- 预先创建 TMPDIR、缓存和日志目录；本地启动错误与 provider 错误分开判断。
- 上下文使用精确绝对路径，明确哪些内容只读、哪些文件归助手交付。

本次工具事件仍出现过候选相对路径下找不到 context、改用正确绝对路径后才成功读取，以及写 DELIVERY 前读取不存在文件的错误。保留这些事件并披露，不能照抄“没有工具错误”的自报。它们也不自动否定后续实际文件，需要分别核查。

### 实现来源与验收责任不能混写

本次用户分工是外部 helper 写实现候选，主代理负责规划、审查、精确原字节集成和执行验收；最多一个 native 子代理只做只读审核。不能因为候选慢或失败，未经授权就把主代理实现包装成助手交付。

每份候选分别保留实际路径、字节数、SHA-256、diff 和工具记录。集成后核对与接受候选逐字节一致，再由主代理运行 build、单测和 UI；native 审核读取集成代码与验收证据。助手自测、父端执行和独立复核是三个不同的证据来源。

## 验收与提交：通过的范围写清楚

本次最终验收记录包括：

| 范围 | 已完成证据 |
| --- | --- |
| shared iOS simulator 单测 | 107 项，0 失败、0 跳过 |
| Android Demo JVM 单测 | 67 项，0 失败、0 跳过 |
| 构建与静态检查 | iOS simulator framework link、Android lintDebug / assembleDebug 通过 |
| iOS UI | 默认套件 5 项通过；accessibility-large 布局 1 项通过 |
| Android UI | 实际播放、模式切换、暂停、后台返回、离页重入通过 |
| Android 布局 | 正常横竖屏、font_scale 2、375dp + font_scale 2 通过 |
| 工作区保护 | 设置恢复，19 份原个人配置与 scheme 的 SHA 保持 |
| 交付 | 隔离 worktree 精确提交，主干快进，两个远端普通推送并回读同一 SHA；最终只读审核 PASS |

集成前备份四份原有未跟踪设计/计划文件，保留其他 dirty/untracked 状态。不要为了获得 clean 输出覆盖个人 scheme、全局配置或其他任务文件。远端同步需要回读验证，不能只看本地 commit 或单个 push 退出码。

本次未证明的内容同样需要随交付保留：

- 没有真机超分质量、实际呈现时序、持续性能、热行为和能耗验收；模拟器画面运动不能替代这些证据。
- Android 默认构建的文件超分 Host 未接入，不能声称文件转换、导出与选片完整流程已验收。
- Android 配置重建回首页仍是既有行为。
- 键盘遮挡、无 Home 指示条设备、其他 OEM、SwiftUI 辅助报告与权限内容运行态未单独覆盖。

## 下次任务可直接采用的执行顺序

1. 读取当前 handoff 和 pitfalls，核对真实 worktree、基线、dirty/untracked 及受保护文件；保存摘要。
2. 把已批准原型转换为行为与坐标条件：整屏标题中心、返回不重叠、安全区、有限媒体比例、空态/加载态身份、大字和横竖屏。
3. 明确 shared/Host 边界与平台能力来源，再按精确文件所有权派发候选。
4. 用当前 framework 和隔离宿主产物构建；异常时先保留证据，按源码、对象、App、运行态逐层核对。
5. 审查实际候选文件和原始工具事件，接受后精确集成，再运行针对性测试与实际 UI。
6. 用户反馈的新反例立即补成可执行回归；不为测试改变产品状态或放松关键断言。
7. 恢复设备设置，复核保护文件和范围，单独列出未验收项，再按已授权范围提交与同步。

## 长期证据入口

以下链接固定到本次项目提交，便于从经验回到源代码与验收描述。原任务的对象文件、xcresult、截图和 helper 原始事件仍属于本地取证附件，不承诺在公开仓库可下载。

- [能力详情页与 iOS 桥接恢复验收](https://github.com/AmatsuZero/ondevice-ai-kit/blob/b1fe0dbe8bcb28c5383c85c1e10730d6b14d5083/docs/validation/cmp-capability-details-20261122.md)
- [最终独立只读审核](https://github.com/AmatsuZero/ondevice-ai-kit/blob/b1fe0dbe8bcb28c5383c85c1e10730d6b14d5083/docs/validation/cmp-capability-details-review-20261122.md)
- [实施与验收台账](https://github.com/AmatsuZero/ondevice-ai-kit/blob/b1fe0dbe8bcb28c5383c85c1e10730d6b14d5083/docs/superpowers/plans/2026-11-22-capability-details-ledger.md)
- [已批准原型及边界](https://github.com/AmatsuZero/ondevice-ai-kit/blob/b1fe0dbe8bcb28c5383c85c1e10730d6b14d5083/docs/superpowers/prototypes/2026-11-22-capability-details/README.md)
