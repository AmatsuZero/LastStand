---
title: "UgreenHome RN iOS 组件化与调试能力重建（阶段总结）"
date: 2026-11-02T18:12:04+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["iOS", "ReactNative", "CocoaPods", "组件化", "Metro"]
---

## 背景与目标

2026-10-29 至 11-02，我接手了 UgreenHome 主工程里一套陈旧的 RN（React Native）依赖栈，把目标定为三件事：

1. 清理重复的实现入口与本地临时代码，统一走内网 Specs / GitLab / Nexus；
2. 把可复用逻辑按单一职责拆成独立组件；
3. 恢复原生符号调试与 Metro JS 调试，同时不破坏默认的离线与发布链路。

明确的不变量：不再为内部库新增「Debug/Release × 静态/动态」四套制品；不覆盖已发布 tag；所有产品变更走 MR；主工程保留业务组合，不追求机械地搬空目录。

本文是阶段收口记录。这里先说明一个原则：**已发布、已合入、测试通过、真实设备运行通过，这四件事要分别记录，不能互相替代**。下面凡是说到「已合入」「已发布」，都不代表所有真机业务场景已逐项通过。

## 推进路线

1. **先清理、再合入**：移除重复的 Runtime/Kit 接线与过时实验内容，清理无用分支、worktree、临时文件与部分缓存，保留未提交的业务改动。
2. **建立远端组件边界**：从 LocalPods / 主工程抽取可复用逻辑与资源，迁到 `home/rn`；测试随实现进入 `test_spec`，宿主只保留跨组件与设备集成测试。
3. **治理依赖图**：从显式 binary 选择推导传递 redirect，处理 Lottie、MMKVCore、ZIPFoundation 等同模块双实现问题，再扩展为调试源码闭包。
4. **恢复 RN_DEBUG**：统一安装入口、源码/Debug 变体选择、Metro 编译隔离与调试工具组件化。
5. **继续下沉**：通用 Debug 编辑器已发布，宿主 MR !262 已合入；`UGreenRNComponents 0.1.0` 已发布，WebView / Lottie 两个 subspec 已由宿主 MR !273 消费，原实现已从主工程删除。

## 阶段成果与真实边界

**依赖单一真源**：移除 `LocalPods/UGreenRNRuntime` 等重复清单，以 Podfile 的 `rn_dependencies` 统一维护版本与来源。

**组件化切片**：Platform、Transport、DeviceSettings、E-Ink、Debug 等职责已有独立组件。Transport 先下沉 HTTP callback gate / 取消策略，DeviceSettings 先下沉启动校验 / 手势 / codec，E-Ink 先下沉图片身份 / 重试 / 调度——不宣称整套 HTTP / MQTT / 业务桥已搬完。

**离线资源**：`InkFrame.ios.bundle` 作为独立资源 Pod 交付，制品放 Nexus；主工程消费 locator 并保留 manifest、SHA-256、RN / Hermes 兼容验证。

**调试入口**：开发者只需设置 `RN_DEBUG=1`，可与 `KMP_DEBUG=1` 组合。`RN_PREBUILT_VARIANT`、`RN_CORE_VARIANT`、`UG_RN_METRO_DEBUG` 是安装派生值，不是第二套手工开关。Xcode Debug 只是构建约束，不会自行开启 Metro。

**调试产物策略**：与宿主重复且可控的依赖优先走源码，并按实际消费者依赖关系传播；RN Core 等继续使用已有 Debug 预编译变体。消费者（如 UHKit）必要时也需源码化，不能只替换叶子库而忽略 ABI / 动态加载边。

**通用 Debug 编辑器**：`UGreenRNDebug 0.1.1` 已发布；组件 MR !2、Specs MR !18 已合入。Metro 四字段表单、参数行 / 权限展示归组件；设备选择、preset、账号身份、保存兼容、initialProperties 与导航仍在宿主。宿主删除了旧参数行及约 300 行重复 UI。

**原生 UI 的真实下沉结果**：新仓库 `home/rn/ugreen-rn-components-ios`，发布源码静态 Pod `UGreenRNComponents 0.1.0`。默认仅 WebView，Lottie 必须显式选择；WebView-only 消费不带入 Lottie。主工程删除五份旧视图 / manager 实现；旧 ObjC / RN 组件名和 props / events 保持不变，不改业务 JS，不重打离线 Bundle。

**可维护的依赖来源**：`ReactNativeCore` 继续固定 1.0.13，URL 切到 `home/rn/ReactNativeCore`；自维护 Specs 也已补齐对应版本。fork MR !1、Specs MR !19 已合入，不覆盖既有 tag，不隐式升级到 1.0.14。组件测试使用自维护 lottie-ios 源码；宿主默认使用静态 binary，RN_DEBUG 仍采用批准的 RN 配套变体——这三种消费场景分别验证，不能把一份安装结果当作三者全部通过。

## 踩过的坑与定位方法

这些是从排障里沉淀下来的判断原则，比结论更值得保留：

1. **「主工程选了静态库」不等于传递依赖也会改名**。源码 Pod 名仍可能经 RN wrapper 进入 lock。解决层应在 resolver，而不是只做下载 URL redirect；从已选择的 binary + linkage 推导规则，再校验版本、模块、commit provenance 与 target 一致性。
2. **名字和版本相似，不足以证明同一产物**。Lottie 源码 spec 的来源元数据、MMKV / Nitro 的传递关系、UHKit 的消费边均需核验。不能靠改后缀、放宽版本或把锁文件手改成「看起来正确」来过关。
3. **源码回退必须看消费者闭包**。binary 引用源码模块后可能存在 ABI、静态 / 动态或 Mach-O 加载边不兼容。采用动态 resolve + fail-closed：明确报出不满足的库和链路，不静默混装，也不把网络 / 鉴权错误误判成应切源码。
4. **下沉了 Pod，不代表主工程已经组件化**。只迁纯逻辑切片后，业务桥、设备、MQTT、账号和 UI 仍留宿主是阶段事实；需要逐批设计注入边界，而不是建几个仓库就宣布完成。
5. **静态组件被 App 和 XCTest bundle 同时链接，会出现重复类 / 类型转换异常**。测试 target 改为 `inherit! :search_paths`，消除重复链接，而不是修改产品类型绕过。
6. **UIKit test host 在 iOS 27 遇到 UIScene 要求**。补 test-only app_spec 和 scene host；审查曾建议删除显式 app-spec 依赖，但实测会触发 CocoaPods 必须显式声明的错误，因此保留。
7. **焦点输入不一定先触发 editingDidEnd**。保存 / 切换需实时采样；另发现模块名改完立即 Add 会用到旧编辑模式，先跑出 RED，再仅更新展示输入到 GREEN，不提前触发业务刷新或保存。
8. **完整 App 模拟器测试被既有 vendor SDK 导入阻塞**。改用真实 controller + 发布 tag 的定向 harness 补确定性回归；明确 fixture 边界，不能把它当作完整 App / 真实设备验收。
9. **「设备已连接」不等于「自动化通道可用」**。手机一直 online，但先前缺少 MobileNext agent。现已复用已有开发证书 / 通配符 profile 安装官方 agent 0.0.35，未新建 / 撤销证书、未改主工程签名；下载超时改用同一官方 IPA，并核对 release SHA-256 后安装。
10. **审查结果也要验证**。只看 diff 的审查曾怀疑未改动的 codec 被删除；回看完整调用链与 throwing codec 证据后否决该项。真正的焦点编辑问题则用 RED→GREEN 修复。平台 429 / 审批超时是工具失败，不是代码结论或审核通过。
11. **Metro 能连接，不等于 JS 与宿主协议匹配**。早先 DeviceSettings「加载失败」的根因是旧 RN checkout 仍要求 `shareRole` / 字符串 role，而 iOS 已导出数值 role。使用 RN 已有提交对齐协议后，真实设置首屏与 `getDeviceContext` / `getProperties` 才成功。不要把协议错配归咎于原生编辑器下沉。
12. **Job Token 授权是跨仓库有向边，不是 home 组成员身份**。真实 Runner 曾报来源项目到 RN Core 的 Job Token 403。Runner 只用 token，清除进程内 keychain / 旧 credential helper，按 exact HTTPS host 返回凭据；不以本机个人账号安装成功替代 CI 授权。通过自维护 RN Core / Lottie / Specs 与必要来源项目白名单解除阻塞，保留入站限制，不用个人 token 绕过。
13. **test_spec 的名字与依赖也属于发布契约**。subspec 内 test_spec 会形成嵌套路径；测试消费端须使用正确 testspec 名，避免冗余自依赖。WebView、Lottie、组合三套真实 xcresult 均按 scheme 核对测试数；缺失、零测试、失败或跳过都不能算通过。
14. **最终链接证据不能只靠 lock 或 map 文件名**。Xcode Debug dylib 的完整 map 可能被启动器 map 覆盖。验收专用构建通过命令行 `ENABLE_DEBUG_DYLIB=NO` 获取完整 App map，不修改产品工程配置。检查器绑定本次原始 linker 命令、map manifest、实际产物及依赖来源；多构建混杂或证据不足直接失败。
15. **fail-closed 检查器本身也可能误判**。审查发现 `4.6.0.4` 的子串判断会错误接受 `4.6.0.40`，默认模式也曾遗漏冲突源码 provenance。补精确版本 / 来源校验及 RED→GREEN 回归，最终检查器 fixture 13 / 13。检查器通过只证明其覆盖的结构 / 链接条件，不自动证明动画正在播放。
16. **自动合并开启后，Draft 仍然会阻塞**。某宿主 MR 同-head CI 全绿但 `detailed_merge_status` 为 `draft_status`。用户明确要求跟进合入后标为 Ready，自动合并随即完成；必须回读 `state=merged` 与 merge SHA，而不是只看已点击自动合并。

## 验证结果与当前阻塞

**前批 Debug 编辑器回归**：组件 XCTest 43 / 43；宿主 controller harness 12 / 12；profile / progress 11 / 11；安装契约 4 tests / 123 assertions。

**本批原生 UI 组件回归**：WebView 7 原生测试 + 1 Consumer；Lottie 9 原生测试 + 1 Consumer；组合 16 原生测试 + 2 Consumer。三组真实 xcresult 均无失败 / 跳过，私有 source spec lint 通过。组件 pipeline 成功，证明 Runner token-only 能完成拉取、测试和 lint。

**宿主默认 / RN_DEBUG**：两套标准安装、真机签名构建及最终完整 App map 检查通过。默认仅一份 `lottie-ios-static-bin 4.6.0.4`；RN_DEBUG 仅一份 RN 配套 `lottie-ios 4.6.0.1`，Core 使用 Debug 变体，UHKit 源码重编。最终恢复默认 Pods，独立 `make -C iot verify-lock` 通过。

**真实 Metro 首屏**：使用隔离 RN revision、独立端口，保留原共享 checkout 和其他 Metro。真实 iPhone / iOS 27 已完成「配置 → Metro → 设置首屏」。前批成功采集 JS / Bridge 读取，匹配协议的 RN bridge 测试 18 / 18。

**保留的验收缺口**：
- Lottie 人脸引导页面播放、后台和返回生命周期：当前账号无管理员 / 拥有者设备，用户确认先保留此缺口，不修改角色、不绕过权限。
- WebView 完整双模式 back / reload / error / loadEnd 事件矩阵仍未完整覆盖。
- 普通设置页返回后第一次 Metro 曾被单活动上下文保护拒绝，重启后直接 Metro 成功；全部释放路径不能据此标绿。
- InkFrame preset、完整设备切换等组合场景未在本轮补齐。
- 完整 App 模拟器 XCTest 仍受基线 vendor SDK 导入问题影响。

## 经验总结与后续规范

- **先锁行为，再搬代码**：测试先 RED→GREEN，迁移不顺手改业务语义；纯组件测试随代码迁到 `test_spec`，宿主保留组合 / 设备回归。
- **单一入口不等于写死名单**：公共开关收敛为 `RN_DEBUG`，内部选择按依赖图动态计算；对不能证明兼容的边界 fail-closed，让开发者看到可操作的错误。
- **规则来自声明与证据，而不是同名猜测**：binary opt-in、linkage、源码 commit、模块名、版本和实际 Mach-O 共同决定能否替换。
- **分清六层证据**：解析 / lock → 发布与可访问性 → 组件测试 → 宿主构建 / 安装 → 真机页面 / Metro → CI / 合入。上一层通过不等于下一层通过。
- **发布顺序固定**：组件 MR 合入 → 不可变 tag → Specs MR → 宿主消费 MR。版本只增不覆盖；默认 lock 通过 `make -C iot pods` 生成，`verify-lock` 独立跑，不提交 Debug lock 或生成宏漂移。
- **不在笔记或仓库记录发布密码 / token**。

一句话结论：已把「依赖重复 + 本地临时代码 + 多套调试配置」收敛为「声明驱动的依赖图 + 可发布组件 + 单一 RN_DEBUG 入口」。默认与调试的构建、唯一 Lottie 链接、真实 Metro 首屏及 MR 交付已形成证据链；部分业务页面生命周期仍明确未验证。

## 名词补充

- **RN_DEBUG / Metro**：`RN_DEBUG=1` 是统一开启 RN 本地调试的开关；Metro 是 RN 的 JS 打包与开发服务器，负责把 JS 资源在开发期实时编译并推送到真机。
- **CocoaPods subspec / test_spec**：subspec 把组件拆成可独立选择的子模块（如 WebView / Lottie）；test_spec 是随组件发布的测试目标，其名字与依赖同样构成发布契约。
- **fail-closed**：在无法证明「安全 / 兼容」时默认拒绝并报错，而不是静默放行，避免把不确定性伪装成成功。
- **Job Token**：GitLab 跨项目 CI 授权用的临时令牌，是「来源项目 → 目标项目」的有向边，不同于同组成员身份。
