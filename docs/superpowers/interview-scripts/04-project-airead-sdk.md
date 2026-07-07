# AIRead 语音播报 SDK（KMMAIReadPractice）— 面试叙述稿

## 第一段：背景与决策（30秒）

业务需求：腾讯体育需要一个跨端（Android/iOS）的语音播报 SDK，让用户在比赛详情页听到 AI 语音播报。

我的技术决策：选 KMM（Kotlin Multiplatform）作为跨端方案。

为什么不选 Flutter/RN：
- SDK 体积敏感：Flutter/RN 会引入完整的引擎，包体积大
- KMM 编译为原生库：Android 是 .so，iOS 是 .framework，体积小且性能好
- 团队有 Kotlin 基础：学习成本可控

核心设计原则：业务逻辑收敛在 commonMain，平台能力下沉到平台层。

## 第二段：关键架构设计（1分钟）

核心架构：
```
commonMain（状态机/编排）
  ├── androidMain（ExoPlayer）
  └── iosMain（AVPlayer + QueuePlayer）
```

设计决策：

1. **状态机统一在 commonMain**：播放器的所有状态（idle/loading/playing/paused/error）和状态转换逻辑只维护一套。这是跨端 SDK 最核心的设计原则——避免双端状态漂移。

2. **播放器能力下沉平台层**：定义统一的 PlayerController 接口，Android 用 ExoPlayer 实现，iOS 用 AVPlayer + QueuePlayer 实现。commonMain 不关心具体播放器实现，只通过接口调用。

3. **WebSocket 流式接收 + 句子高亮闭环**：
```
WebSocket → AudioInfo（流式接收）
  → AIReadManager（编排：解析+调度）
  → PlayerController（播放）
  → WebViewNotifier（句子高亮同步到 WebView）
```
形成"听到哪看到哪"的用户体验闭环。

4. **重试策略**：支持 FIXED 和 MULTIPLICATION 两种延迟模式，应对网络波动。

## 第三段：推动落地与结果（30秒）

从 0 交付了完整的跨端语音播报 SDK，Android/iOS 双端对齐。

关键收获：
- 深刻理解了跨端 SDK 的核心命题：什么逻辑放 common 层、什么放平台层
- 接口契约设计的重要性：commonMain 和平台层之间的接口一旦定义好，双端可以独立开发
- 这个经验让我对跨端架构有了系统性的判断力，后面做技术选型时能更准确地评估方案

## 追问预案

**Q: commonMain 和平台层的边界怎么划？**
A: 我的原则是——有业务语义的逻辑放 commonMain，纯平台能力放平台层。比如"播放完句子A后播句子B"是业务逻辑，放 commonMain。"如何调用系统播放器播一个音频文件"是平台能力，放平台层。判断标准：如果这个逻辑换了平台实现会变，就放平台层。

**Q: 双端开发过程中遇到过什么不一致？**
A: 播放器行为不一致。ExoPlayer 和 AVPlayer 在某些边界状态（如快速切换音频）下行为有差异。我的解法是在 PlayerController 接口层做适配，把平台差异封装在实现内部，commonMain 看到的行为是统一的。

**Q: 如果现在重新设计，会有什么不同？**
A: 我会在协议层加版本字段和消息类型字段。当前协议设计比较简单，扩展性不够。另外 WebView 的 scrollToPosition 还没落地，这个需要补上。
