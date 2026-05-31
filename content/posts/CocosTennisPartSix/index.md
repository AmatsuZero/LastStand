+++
date = '2026-05-31T09:00:00+08:00'
draft = true
title = '3D球场项目 (六)：客户端工程化与优化'
tags = ['3D', 'Cocos', 'WebGPU', 'VAT', 'GPU Instancing', 'Shader', '性能优化', 'iOS', '工程化']
categories = ['iOS 开发', '前端开发']
+++

[3D球场项目 (五)]({{< relref "/posts/CocosTennisPartFive" >}}) 把客户端的核心业务流
讲完了：Native 推送 → DataManager 队列 → ScenePlayer 章节调度 → GameController 状态机
→ Handler → 渲染层。功能闭环跑通之后，真正的硬仗是 **"工程化"和"性能"**——前者保证
项目能稳定上线（编译跑通、退出不崩、Swift 调用顺手），后者保证在中低端机上画面流畅。

第一版上线时遇到了两类问题：

- **稳定性 / 工程化**：modulemap 编译报错、lipo 架构冲突、A11 设备启动 crash、
  Cocos 退出期 OpenAL 资源竞争 crash……这些都不是"画面卡"，但每一个都能让用户体验
  归零；
- **性能**：中端 iPhone 在比赛回合渲染期间，GPU 和 CPU 都偶尔抖到 80%+，帧率掉到
  30 fps 出头。

本篇按这两类拆成两部分，所有改动都遵循一条原则：**不动玩法，只把工程问题和帧时间
解决掉**。

## 架构改动一览

[3D球场项目 (二)]({{< relref "/posts/CocosTennisPartTwo" >}}) 介绍过弹幕引擎的四层
架构（腾讯视频 APP / MagicDanmakuiOS / MagicDanmaku / cocos-engine）。这一阶段
**每一层都动了**——3D 球场不是单点改造，而是一次自上而下的纵贯。下面这张图是把
PartTwo 那张原始架构图重画一遍，**改动的节点用蓝色**、**新增的节点用绿色**，
没动的节点保持白色：

<div class="arch-diagram arch-diff">
  <style>
    .arch-diff { font-size: 13px; color: #222; margin: 1.2em 0; max-width: 100%; overflow-x: auto; }
    .arch-diff .layer {
      background: #f0f4f8;
      border: 1.5px solid #aab4c2;
      border-radius: 8px;
      padding: 14px 16px 16px;
      margin: 10px 0;
      position: relative;
    }
    .arch-diff .layer-title {
      font-weight: 600;
      color: #334155;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .arch-diff .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .arch-diff .node {
      background: #fff;
      border: 1px solid #8b8b8b;
      border-radius: 18px;
      padding: 6px 14px;
      min-width: 60px;
      text-align: center;
      box-shadow: 0 1px 1px rgba(0,0,0,0.03);
      flex: 1 1 auto;
      white-space: nowrap;
    }
    .arch-diff .node.changed {
      background: #dbeafe;
      border-color: #2563eb;
      color: #1e3a8a;
    }
    .arch-diff .node.added {
      background: #dcfce7;
      border-color: #16a34a;
      color: #14532d;
      font-weight: 600;
    }
    .arch-diff .node.wrap {
      white-space: normal;
      line-height: 1.35;
      padding: 8px 12px;
    }
    .arch-diff .group {
      background: #fafbfc;
      border: 1px dashed #9aa4b2;
      border-radius: 8px;
      padding: 12px;
      flex: 1;
      min-width: 200px;
      display: flex;
      flex-direction: column;
    }
    .arch-diff .group-title {
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .arch-diff .inner {
      background: #fff;
      border: 1px solid #c5ccd6;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .arch-diff .inner:last-child { margin-bottom: 0; }
    .arch-diff .inner-title {
      color: #475569;
      font-size: 12px;
      text-align: center;
      margin-bottom: 6px;
    }
    .arch-diff .arrow {
      text-align: center;
      color: #94a3b8;
      font-size: 18px;
      line-height: 1;
      margin: 4px 0;
      user-select: none;
    }
    .arch-diff .app-row { display: flex; justify-content: center; }
    .arch-diff .app-row .node { flex: 0 0 auto; min-width: 120px; padding: 8px 24px; }
    .arch-diff .md-row { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
    .arch-diff .md-row > .group:first-child { flex: 2.4 1 360px; }
    .arch-diff .md-row > .group:last-child { flex: 1 1 200px; }
    .arch-diff .ce-row { display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap; }
    .arch-diff .ce-row .nodes { display: flex; gap: 10px; flex: 1 1 280px; flex-wrap: wrap; }
    .arch-diff .ce-row .ext-group { flex: 1 1 38%; min-width: 220px; }
    .arch-diff .legend {
      display: flex;
      gap: 14px;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
      color: #475569;
      flex-wrap: wrap;
    }
    .arch-diff .legend .node {
      flex: 0 0 auto;
      min-width: 0;
      padding: 4px 12px;
      font-size: 12px;
    }

    @media (max-width: 900px) {
      .arch-diff { font-size: 12px; }
      .arch-diff .layer { padding: 10px 10px 12px; }
      .arch-diff .layer-title { font-size: 13px; margin-bottom: 8px; }
      .arch-diff .row { gap: 6px; }
      .arch-diff .row > .node {
        flex: 1 1 calc(33.333% - 6px);
        padding: 5px 6px;
        min-width: 0;
        font-size: 11.5px;
        white-space: normal;
        line-height: 1.3;
        word-break: break-word;
      }
      .arch-diff .node.wrap { padding: 6px 8px; line-height: 1.3; }
      .arch-diff .group { padding: 8px; min-width: 0; }
      .arch-diff .inner { padding: 8px; }
      .arch-diff .app-row .node { min-width: 0; padding: 6px 18px; flex: 0 0 auto; white-space: nowrap; }
      .arch-diff .md-row { flex-direction: column; gap: 8px; }
      .arch-diff .md-row > .group:first-child,
      .arch-diff .md-row > .group:last-child { flex: 1 1 auto; width: 100%; }
      .arch-diff .ce-row { flex-direction: column; gap: 8px; }
      .arch-diff .ce-row .nodes { flex: 1 1 auto; width: 100%; }
      .arch-diff .ce-row .ext-group { flex: 1 1 auto; width: 100%; min-width: 0; }
    }
    @media (max-width: 420px) {
      .arch-diff .row > .node { flex: 1 1 calc(50% - 6px); }
    }

    @media (prefers-color-scheme: dark) {
      .arch-diff { color: #e2e8f0; }
      .arch-diff .layer { background: #1e293b; border-color: #475569; }
      .arch-diff .group { background: #0f172a; border-color: #475569; }
      .arch-diff .inner { background: #1e293b; border-color: #475569; }
      .arch-diff .node { background: #0f172a; border-color: #94a3b8; color: #e2e8f0; }
      .arch-diff .node.changed { background: #1e3a8a; border-color: #60a5fa; color: #dbeafe; }
      .arch-diff .node.added   { background: #14532d; border-color: #4ade80; color: #dcfce7; }
      .arch-diff .layer-title, .arch-diff .group-title, .arch-diff .inner-title { color: #cbd5e1; }
      .arch-diff .legend { color: #cbd5e1; }
    }
  </style>

  <div class="legend">
    <div class="node">未改动</div>
    <div class="node changed">本次改动</div>
    <div class="node added">本次新增</div>
  </div>

  <div class="app-row">
    <div class="node changed">腾讯体育 APP（新接入方）</div>
  </div>
  <div class="arrow">▲</div>

  <div class="layer">
    <div class="layer-title">业务层 SwiftUI（腾讯体育侧，PartFive §四 / 全部新增）</div>
    <div class="row">
      <div class="node added">InMatchTop3DLiveView</div>
      <div class="node added">QS3DCourtSwiftUIView</div>
      <div class="node added">QS3DCourtEventBroker</div>
      <div class="node added">CourtContainerControlOverlay</div>
      <div class="node added">TennisMatchScoreBoard</div>
      <div class="node added">TennisGameEventBoardView</div>
      <div class="node added">QS3DCourtViewController</div>
      <div class="node added">MagicDanmakuViewController</div>
    </div>
  </div>
  <div class="arrow">▲</div>

  <div class="layer">
    <div class="layer-title">弹幕业务接入层 MagicDanmakuiOS（PartFive §三 + PartSix 第一部分）</div>
    <div class="row">
      <div class="node">资源包</div>
      <div class="node">业务接入层</div>
      <div class="node">JS 注册绑定</div>
      <div class="node">动态化</div>
      <div class="node">playground</div>
      <div class="node changed">CocosPlayer（场景代理回滚）</div>
      <div class="node added">modulemap + framework</div>
      <div class="node added">A11 / lipo 构建修复</div>
    </div>
  </div>
  <div class="arrow">▲</div>

  <div class="layer">
    <div class="layer-title">弹幕实现 MagicDanmaku（PartFive §二 + PartSix 第二部分）</div>
    <div class="md-row">
      <div class="group">
        <div class="group-title">Assets 资源包</div>
        <div class="inner">
          <div class="inner-title">TypeScript 版弹幕组件（原有，未改）</div>
          <div class="row">
            <div class="node">样式</div>
            <div class="node">轨道</div>
            <div class="node">特效</div>
            <div class="node">通信</div>
            <div class="node">…</div>
          </div>
        </div>
        <div class="inner">
          <div class="inner-title">★ 新增：3D 网球球场（assets/tennis/）</div>
          <div class="row">
            <div class="node added">Model / DataManager</div>
            <div class="node added">ScenePlayer</div>
            <div class="node added">GameController</div>
            <div class="node added">States × 6</div>
            <div class="node added">Handlers × 7</div>
            <div class="node added">Player / QSArmature</div>
            <div class="node added">Ball / Bezier+Physics</div>
            <div class="node added">Camera</div>
            <div class="node added">Audience（VAT）</div>
            <div class="node added">Shader 球场边线</div>
          </div>
        </div>
        <div class="inner">
          <div class="inner-title">素材</div>
          <div class="row">
            <div class="node">图片</div>
            <div class="node">视频</div>
            <div class="node">音频</div>
            <div class="node changed">网球资产（减面 / 压缩 / 合材）</div>
          </div>
        </div>
      </div>
      <div class="group">
        <div class="group-title">二进制库</div>
        <div class="row">
          <div class="node wrap changed">engine framework（重新打包）</div>
          <div class="node wrap changed">external framework（A11 兼容重编）</div>
        </div>
      </div>
    </div>
  </div>
  <div class="arrow">▲</div>

  <div class="layer">
    <div class="layer-title">引擎内核 cocos-engine（PartFive §一 + PartSix §二、§三）</div>
    <div class="ce-row">
      <div class="nodes">
        <div class="node">2D</div>
        <div class="node">3D</div>
        <div class="node">物理</div>
        <div class="node">粒子</div>
        <div class="node">…</div>
        <div class="node changed">loadScene（进度 / 传参 / 4 阶段代理）</div>
        <div class="node changed">JsbBridgeWrapper（内存语义）</div>
        <div class="node changed">AudioEngine（OpenAL atomic 守卫）</div>
        <div class="node changed">OC 头文件（Swift 友好标注）</div>
      </div>
      <div class="group ext-group">
        <div class="group-title">引擎内核扩展 cocos-engine/native/external</div>
        <div class="row">
          <div class="node">webp</div>
          <div class="node">freetype</div>
          <div class="node">…</div>
        </div>
      </div>
    </div>
  </div>
</div>

一句话归纳：

- **业务层**：从无到有新增了一整套 SwiftUI 容器 + Combine Broker + Overlay 控件
  （PartFive §四）；
- **MagicDanmakuiOS 层**：完成 framework 化（modulemap）+ 真机 crash 修复
  （A11、lipo），`CocosPlayer` 内部尝试切代理后又回滚（PartFive §3.1）；
- **MagicDanmaku 层**：Assets 里**新增整个 3D 网球球场子树**（≈ 6.7 万行 TypeScript），
  原有弹幕组件零改动。性能优化（VAT 观众、合材、减面、shader 边线、降频）也都集中
  在这一层；
- **cocos-engine 层**：4 处可见改动——`loadScene` 全流程能力升级、`JsbBridgeWrapper`
  内存语义修复、AudioEngine OpenAL 退出守卫、OC 头文件 Swift 友好标注。

下面分两部分展开，每一项都对应到上图里的某个标蓝 / 标绿节点。

---

# 第一部分：工程化

## 一、应用启动模板：自定义 settings 路径 + sceneRouter 启动判断

我们的 iOS 容器需要把 settings.json 放在 App 的私有目录（动态下发的资源都丢这），
原始模板写死从主 bundle 读，所以模板要让一步：先问 Native 拿到自定义路径，没有就回退
到默认路径（`18da5c9b`）。

```javascript
// cocos-engine/templates/launcher/application.ejs:24
start () {
    let customSettingsPath = "";
    if (cc.sys.isNative && (cc.sys.os === cc.sys.OS.IOS || cc.sys.os === cc.sys.OS.OSX)) {
        customSettingsPath = cc.native.reflection.callStaticMethod(
            'QSInMatchTop3DLiveViewController', 'getSettingsPath');
    } else if (cc.sys.isNative && cc.sys.os === cc.sys.OS.ANDROID) {
        customSettingsPath = cc.native.reflection.callStaticMethod(
            'com/cocos/lib/CocosHelper', 'getSettingsPath', '()Ljava/lang/String;');
    }
    // ★ 拿到 Native 自定义路径就覆盖；空字符串 / undefined 保留默认
    if (customSettingsPath !== "" && customSettingsPath !== undefined) {
        this.settingsPath = customSettingsPath;
    }
    return cc.game.init({
        debugMode: <%= debugMode %> ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
        settingsPath: this.settingsPath,
        // ...
    }).then(() => cc.game.run());
}
```

另一条线是 `isStartWithSceneRounter` 属性——这是 `CocosCreator` 对外暴露的一个 BOOL，
告诉调用方"App 这次是不是以 scene-route 作为根场景启动的"。这个属性的实现演化挺典型：

1. 一开始（`29589f07`）写在引擎里：在 `CocosCreator init` 时去读 `src/settings.json`，
   用 KeyPath `launch.launchScene` 拿到主场景名，再判断 `lastPathComponent ==
   "scene-route.scene"`；
2. 紧接着 `f48ed1407` / `6090bfe7` 把整段 `isStartWithSceneRouter` 方法以及对它的
   `init` 调用都**移除了**——读 settings.json 这种业务知识不该写在引擎里；
3. 最终方案：`isStartWithSceneRounter` 仍然作为 `CocosCreator.h:49` 上的一个公开
   `BOOL` 属性保留，但 **由 iOS 容器层在自己合适的时机 setter 写入**，引擎只读不算。

```objc
// cocos-engine/native/cocos/platform/ios/Headers/CocosCreator.h:49
/// 是否是以 sceneRounter 启动的
@property (nonatomic, assign) BOOL isStartWithSceneRounter;
```

这种 "先写到引擎、再下放到容器" 的回退是个很值得记下的设计决策——**引擎不应感知业务
配置**，越靠近内核的代码越要保持纯净。

---

## 二、OpenAL 退出期资源竞争 crash 修复

线上一段时间反馈过一类很稳定但很难复现的 crash：从 Cocos 场景退出回 iOS 原生的瞬间，
Cocos 引擎正在析构、AudioPlayer 的 `~AudioPlayer()` 还在调 `alDeleteBuffers` /
`alSourceStop` / `alGetSourcei`，但底层 `s_ALContext` 已经被释放——线程安全直接崩。

修复分两步走，是个标准的"先临时止血、后正式修"过程：

**Step 1：临时止血**（`b7fea4dd`）——直接把退出路径上的 OpenAL 调用注释掉：

```diff
// AudioEngine-inl.mm:213
  if (s_ALContext) {
-     alDeleteSources(MAX_AUDIOINSTANCES, _alSources);
+ //  alDeleteSources(MAX_AUDIOINSTANCES, _alSources);
      _audioCaches.clear();
      ...
  }

// AudioPlayer.mm:125
  ALOGVV("Before alSourceStop");
- alSourceStop(_alSource);
+ // alSourceStop(_alSource);
```

注释掉等于不释放，会泄漏一点点资源，但起码不崩。

**Step 2：正式修**（`7d42a3b5`）——加一个 atomic 守卫，所有 OpenAL 调用统一前置检查：

```cpp
// cocos-engine/native/cocos/audio/apple/AudioEngine-inl.h:36
namespace cc {
class Scheduler;

// 标识 AudioEngine 是否正在销毁，用于避免销毁时的 OpenAL 线程安全问题
extern std::atomic<bool> s_isEngineDestroying;
} // namespace cc
```

```objc
// cocos-engine/native/cocos/audio/apple/AudioPlayer.mm:57
AudioPlayer::~AudioPlayer() {
    destroy();
    // 引擎正在销毁就跳过 alDeleteBuffers
    if (_streamingSource && !s_isEngineDestroying.load()) {
        alDeleteBuffers(QUEUEBUFFER_NUM, _bufferIds);
    }
}

void AudioPlayer::destroy() {
    _isDestroyed = true;
    bool isEngineDestroying = s_isEngineDestroying.load();
    // ...
    if (!isEngineDestroying) {
        ALint sourceState;
        alGetSourcei(_alSource, AL_SOURCE_STATE, &sourceState);
        if (sourceState == AL_PLAYING) { /* 排空 buffer 队列 */ }
    }
    // ...
    if (!isEngineDestroying) {
        alSourceStop(_alSource);
        alSourcei(_alSource, AL_BUFFER, 0);
    }
}
```

修法的精髓是 **在 `~AudioEngineImpl()` 入口处把 `s_isEngineDestroying` 置 true**，
之后整个析构链路上的 OpenAL 调用都被这个 atomic 守卫挡住。比一刀砍掉调用更稳，
也不会泄漏正常路径下该释放的资源。

---

## 三、Swift 友好的 OC 头文件标注 + 编译修复

iOS 容器层是 Swift 写的，引擎暴露的 OC 头一直没做 Swift Concurrency / 类型化集合 /
可空性的标注，从 Swift 调过来体验不好。`57c1f4d6` 这一笔 5 个文件加了一整套标注：

```objc
// cocos-engine/native/cocos/platform/ios/Headers/CocosCreator.h:18
NS_SWIFT_SENDABLE                              // 值类型，跨 actor 传递安全
@interface CocosLoadSceneConfig : NSObject
@end

NS_SWIFT_UI_ACTOR                              // 必须在主线程访问，对应 Swift @MainActor
@interface CocosCreator : NSObject
@end

// CocosView.h:45 / 68
NS_SWIFT_UI_ACTOR
@protocol CocosViewSceneDelegate <NSObject>
@end
NS_SWIFT_UI_ACTOR
@interface CocosView : UIView<CocosMetalUIView>
@property (nonatomic, copy, nullable) void(^doubleTapResumedCallback)(void);  // 补齐 nullable
@end

// CocosTimerType.h:7（C enum → NS_ENUM，Swift 侧能拿到正经枚举类型）
typedef NS_ENUM(NSInteger, CocosTimerType) {
    COCOS_TIMER_DISPLAY_LINK,
    COCOS_TIMER_SOURCE_TIMER
};

// CocosProfileInfo.h:22（裸 NSMutableDictionary → 类型化）
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSNumber *> *frameMap;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSNumber *> *wholeMap;
```

加完之后 Swift 调用方就能写 `@MainActor` 标注的代码、用类型化字典、对 `NS_ENUM` 做
完整 switch、对 nullable 属性强制解包。**对画面无感，但对容器侧维护性提升非常显著**。
后续两个提交（`e4f11118` / `ba37d081`）是这一波改造引入的编译错误的回头修。

---

## 四、iOS 容器层的编译 / 构建修复：modulemap + lipo 架构

iOS 容器层这一阶段从老式 pod 升级到了**现代 framework**，过程踩了三个坑。

### 4.1 开启 modulemap 支持（`c6367af0`）

业务侧用 Swift `import MagicDanmakuiOS` 而不是 `#import <MagicDanmakuiOS/...>`，
需要 podspec + 显式的 modulemap：

```podspec
# MagicDanmakuiOS.podspec:115（修订后）
spec.public_header_files = 'MagicDanmakuiOS/Headers/**/*.h'  # ★ 仅暴露 Headers/
```

```objc
// MagicDanmakuiOS/Headers/MagicDanmakuiOS.h（umbrella header 节选）
FOUNDATION_EXPORT double MagicDanmakuiOSVersionNumber;
FOUNDATION_EXPORT const unsigned char MagicDanmakuiOSVersionString[];

// 核心组件
#import <MagicDanmakuiOS/CocosTimerType.h>
#import <MagicDanmakuiOS/CocosView.h>
#import <MagicDanmakuiOS/CocosCreator.h>
#import <MagicDanmakuiOS/CocosProfileInfo.h>
#import <MagicDanmakuiOS/CocosPlayer.h>
// 桥接组件
#import <MagicDanmakuiOS/JsbBridgeWrapper.h>
#import <MagicDanmakuiOS/DanmaV8Bridge.h>
#import <MagicDanmakuiOS/CCNativeChannel.h>
#import <MagicDanmakuiOS/CocosMessageInvoker.h>
```

```
# MagicDanmakuiOS/Headers/module.modulemap
framework module MagicDanmakuiOS {
    umbrella header "MagicDanmakuiOS.h"
    export *
    module * { export * }

    link framework "UIKit"
    link framework "Metal" / "MetalKit" / "JavaScriptCore" / "WebKit" / "AVKit"
    link framework "OpenAL" / "OpenGLES" / "AudioToolbox" / "MetalPerformanceShaders"
    // ...
    link "c++" / "stdc++" / "z" / "sqlite3" / "iconv"
}
```

值得注意：modulemap 里把所有需要的系统 framework 和 C 库都显式 `link` 了一遍——这样
业务侧 podfile 引用 `MagicDanmakuiOS` 时，**不需要再手动加 OpenAL / sqlite3 这些
依赖**，编译期 ld 会自动接上。

紧接着的修复（`e7fd9f5d`）把 `CocosPlayer.h` / `CCNativeChannel.h` 等几个常用头文件
从 `Classes/` 搬到 `Headers/`——modulemap 模式下 umbrella header 引用的所有头必须都
在 public 路径下，否则报 "non-modular header inside framework module"。

### 4.2 `lipo` 架构冲突（`f229971f`）

出 framework 之前要把模拟器（x86_64）和真机（arm64）的静态库 `lipo -create` 成胖
二进制。旧脚本对两个 sdk 复用同一套构建产物路径，结果模拟器的 build 把真机的二进制
覆盖了，`lipo` 合并时拿到两个 x86_64 的输入直接报 `same architectures`。修法是按
sdk 分目录构建：

```bash
# build_static.sh（节选）
SIM_BUILD_DIR="$BUILD_PROJ_DIR/build/$CONFIGURATION/products/iphonesimulator"
DEVICE_BUILD_DIR="$BUILD_PROJ_DIR/build/$CONFIGURATION/products/iphoneos"

# 模拟器（x86_64）
xcodebuild -project "$PROJECT_PATH" -target cocos_engine \
    -sdk iphonesimulator \
    OTHER_CPLUSPLUSFLAGS='$(inherited) -Wno-invalid-specialization' \
    CONFIGURATION_BUILD_DIR="$SIM_BUILD_DIR"
cp "$SIM_BUILD_DIR/libcocos_engine.a"   "$X86_LIB/libcocos_engine.a"
cp "$SIM_BUILD_DIR/libboost_container.a" "$X86_LIB/libboost_container.a"

# 真机（arm64）
xcodebuild -project "$PROJECT_PATH" -target cocos_engine \
    -sdk iphoneos \
    OTHER_CPLUSPLUSFLAGS='$(inherited) -Wno-invalid-specialization'
# arm64 后续再 cp + lipo -create -output
```

### 4.3 A11 设备非法指令 crash（`461460f6` / `a4b2c7c9`）

arm64 产物路径不一致导致 `lipo` 拿到的是旧缓存（`461460f6`）；A11 Bionic（iPhone X /
8）启动 `EXC_BAD_INSTRUCTION`（`a4b2c7c9`）。后者根因非常隐蔽：

> `libboost_container.a` 编译时未指定 `IPHONEOS_DEPLOYMENT_TARGET`，编译器生成了
> ARMv8.3 的 **`ldaprb` 指令（FEAT_LRCPC）**，该指令在 A11 Bionic 及更早芯片上为
> 非法指令，触发 SIGILL。

修法两步走：① 所有 `xcodebuild` 调用统一加 `IPHONEOS_DEPLOYMENT_TARGET=12.0`，强制
生成 ARMv8.0 兼容指令；② 构建前 `rm -rf` 清理 DerivedData，避免吃到旧的 ARMv8.3
缓存。

```bash
# build_static.sh（修订后）
xcodebuild ... \
    IPHONEOS_DEPLOYMENT_TARGET=12.0 \    # ★ 强制 ARMv8.0 兼容指令集
    OTHER_CPLUSPLUSFLAGS='$(inherited) -Wno-invalid-specialization' \
    CONFIGURATION_BUILD_DIR="$SIM_BUILD_DIR"
```

这一类问题只能在真机上复现、单元测试和模拟器都查不出来，是典型的"上线后用户日志里
拼出来"的疑难杂症，写一笔下来作为后人参考。

---

## 五、引擎子模块的滚动更新

`MagicDanmakuiOS` 这一层把 `MagicDanmaku`（即我们的 cocos-engine 内部分支）挂作 git
submodule，每次引擎侧出新提交，这边就跟一笔 "更新子模块" 的提交。这段范围内带过的
关键升级：

| 提交 | 引擎侧带过来的能力 |
|---|---|
| `4de9f0d8` / `44ae7242` | Swift 友好语义标注（`NS_SWIFT_SENDABLE` / `NS_SWIFT_UI_ACTOR` / `NS_ENUM`） |
| `b16724da` | OpenAL 退出期 `s_isEngineDestroying` atomic 守卫（对应引擎 `7d42a3b5`） |
| `2e44141b` | OpenAL 退出期临时止血版本（注释掉 `alSourceStop`，对应引擎 `b7fea4dd`） |
| `c37f4f26` | setting path 路径修复 + DataManager 清理逻辑等业务侧零散更新 |
| `34f9daa8` | 子模块滚动更新（与 `44ae7242` 一同支撑 Swift 友好标注上线） |

每次更新子模块还顺带更新了 `MagicDanmakuiOS/Headers/*.h`（这层做的是 Headers 镜像）和
`MagicDanmakuiOS/libs/libcocos_engine.a`（预编译的静态库，避免业务方再编一遍引擎）。
比如 `44ae7242` 同时改了 5 个头文件 + 重新打包了 `libcocos_engine.a` 和
`libboost_container.a`。

---

# 第二部分：性能优化

第一部分修的是"项目能不能上线"，这一部分修的是"上线之后画面够不够流畅"。所有改动
按"改资产"和"改代码"两类排开，加上一张总收益对照，共八节。

## 六、VAT + GPU Instancing：观众席（`0de07f11`）

观众一场球场要放 200 人左右。如果每个人都是 SkinnedMeshRenderer + 独立 Material，
DrawCall 直接爆——蒙皮动画走 CPU 计算关节矩阵、Material 不同还合不了批。

VAT（Vertex Animation Texture）是把骨骼动画"烘焙"成两张纹理（位置图 + 法线图）、
在顶点着色器里采样还原顶点位置的技术——它把"骨骼蒙皮 + 关节矩阵插值"换成一次纹理
采样，代价是失去骨骼控制能力，但获得了 **GPU Instancing** 的资格：相同的 VAT 模型
可以合批到一次 DrawCall。

我们把观众的呼吸 / 挥手动画离线烘焙成 VAT 纹理，运行时用
`MeshRenderer + builtin-unlit` 渲染：

```typescript
// Audience/AudienceGenerator.ts:279
/** 材质缓存：key = `${纹理 uuid}_${dark|normal}` */
private _materialCache: Map<string, Material> = new Map();

private getOrCreateSharedMaterial(texture: Texture2D, isDark = false): Material {
    const cacheKey = `${texture._uuid}_${isDark ? 'dark' : 'normal'}`;
    const cached = this._materialCache.get(cacheKey);
    if (cached) return cached;

    const mat = new Material();
    mat.initialize({
        effectName: 'builtin-unlit',
        defines: {
            USE_TEXTURE: true,
            USE_INSTANCING: true,    // ★ 启用 GPU Instancing
        }
    });
    mat.setProperty('mainTexture', texture);
    if (isDark) {
        // 远端高排座位染暗，模拟自然遮挡
        mat.setProperty('mainColor', new Color(150, 150, 150, 255));
    }
    this._materialCache.set(cacheKey, mat);
    return mat;
}

// 应用阶段：从 SkinnedMeshRenderer 改成 MeshRenderer
const renderer = audienceNode.getComponentInChildren(MeshRenderer);
const needDark = seatInfo && /* sectionId / row / seat 综合判断 */ false;
renderer.material = this.getOrCreateSharedMaterial(randomTexture, needDark);
```

收益：

| 指标 | VAT 前 | VAT 后 |
|---|---|---|
| FBX 体积（observer_*.fbx） | 195 KB | 82 KB（-58%） |
| 观众部分 DrawCall | ~200 | ~ 纹理种类数 (≤8) |
| CPU 蒙皮计算 | 每人每帧一次 | 0 |

观众动画因为都是循环动作（呼吸、左右晃），VAT 的"丢失骨骼控制"代价完全可以接受。
**球员仍然走骨骼动画 + QSArmature 包装**——球员需要按服务端 Script 切换 hit /
back_hand_hit / run / serve / victory 等动作，VAT 不适合这种动态切动画的场景。

---

## 七、球场材质合并（`6e962ea0`）

球场原本一个 `MeshRenderer` 挂 4 个材质槽（边线、地面、网、装饰），即使只有一个
mesh，每个材质就是一次 DrawCall：

```diff
- "_materials": [
-   "__uuid__": "...@5381f",
-   "__uuid__": "...@00a48",
-   "__uuid__": "...@1cd61",
-   "__uuid__": "...@75cec"
- ]
+ "_materials": [
+   "__uuid__": "...@bb4ef"   // 合并后的单一材质
+ ]
```

合并方式是在 DCC 工具（Blender）里把多套贴图打到一张 atlas，再合并材质槽。
`court.glb` 体积反而从 8.2 MB → 10.3 MB（顶点信息增加），但 `court.glb.meta` 行数
从 4287 → 2950，**DrawCall 从 4 降到 1**。

这是一个非常典型的"用空间换 DrawCall"的取舍——移动 GPU 上 DrawCall 是比内存更稀缺的
资源，多 2 MB 顶点数据完全可以接受。

---

## 八、球员 / 球拍减面 + 纹理压缩（`ad1dd8c8` / `8ab30dff` / `cf2f567f`）

在 DCC 工具里直接减面，FBX 体积缩了一半：

| 资产 | 减面前 | 减面后 | 减面前三角数 | 减面后 |
|---|---|---|---|---|
| `player.fbx` | 773 KB | 326 KB | 15000 | 5560 |
| `player_female.fbx` | 778 KB | 368 KB | — | — |
| `racket.fbx` | 2.09 MB | 416 KB | 49999 | 9529 |

球拍顺带去骨骼（球拍是道具，不需要骨骼动画），所以减得最狠（-81%）。

GPU 纹理压缩在 8 张观众 / 球员贴图的 `.png.meta` 里加了一个开关：

```json
// assets/tennis-player/player_male.png.meta
{
  "userData": {
    "compressSettings": {
      "useCompressTexture": true   // ★ 启用压缩，具体格式由打包平台决定
    }
  }
}
```

iOS 上跑出来的是 ASTC（4x4 / 6x6 看尺寸自适应），单张纹理显存占用从 RGBA8 的 4 MB
降到 ~1 MB，**整体显存节省 50–75%**。

---

## 九、闲置降频 + 纹理分配监控（`f0b70a05`）

打开比赛但没数据可播（等服务端推送）的时候，画面其实只需要球员在底线 idle 站着，
没必要跑 60 fps。`ScenePlayer` 进入 `WAITING_DATA` 状态时直接把帧率压到 30：

```typescript
// Model/ScenePlayer.ts（_changeState 内）
if (newState === ScenePlayerState.WAITING_DATA) {
    CPUOptimizationHelper.SetFrameRate(30.0);   // 闲置 30fps
    this._movePlayersToBaselineAndIdle();
} else {
    CPUOptimizationHelper.SetFrameRate(60.0);   // 数据来了恢复 60fps
}
```

这一步 CPU 占用直接腰斩。

同提交还引入了 `TextureAllocationMonitor`（603 行）——线上跑久了之后会偶发显存爆掉的
问题，事后才能从崩溃栈猜原因，这个工具把"什么时候、什么尺寸、什么调用栈"全记下来：

```typescript
// utils/TextureAllocationMonitor.ts
export interface TextureMonitorConfig {
    warningThreshold?: number;   // 单边尺寸告警，默认 2048
    errorThreshold?: number;     // 单边尺寸错误，默认 4096
    maxMemoryMB?: number;        // 总纹理内存上限，默认 512
    enableStackTrace?: boolean;  // 抓分配栈
}
```

事后排查显存问题时，这个 monitor 救过命好几次——它不是优化，是**让优化能落地的前提**。

---

## 十、球员名称纹理动态尺寸（`2086eb09`）

球员名字是画在球场底线两侧的两个矩形 Zone 上（远端 / 近端各一个），用 Canvas 2D
画完上传到 GPU。原本写死的 1024x256 既浪费又模糊（远端看起来糊、近端浪费像素），
改成按"Zone 实际米数 × 分辨率参数"动态算，并卡在 [128, 1024] 之间：

```typescript
// Game/PlayerInfoController.ts:135
const zoneSize = manager.getZoneSize();
const resolution = Math.max(this.textureResolution, 64);
this._textureWidth  = Math.ceil(zoneSize.width  * resolution);
this._textureHeight = Math.ceil(zoneSize.length * resolution);
const minSize = 128, maxSize = 1024;
this._textureWidth  = Math.max(minSize, Math.min(maxSize, this._textureWidth));
this._textureHeight = Math.max(minSize, Math.min(maxSize, this._textureHeight));
```

Canvas 绘制时字体大小也跟着自适应（约纹理高度的 60%）：

```typescript
// Game/PlayerInfoController.ts:343
const autoFontSize = Math.min(this.fontSize, this._textureHeight * 0.6);
ctx.font = `${this.fontWeight} ${autoFontSize}px ${this.fontFamily}`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(name, this._textureWidth / 2, this._textureHeight / 2);
texture.uploadData(canvas);   // 直接传到 GPU
```

---

## 十一、球场边线：节点 → Shader（`3d5bb81e` / `6fd4ee99` / `452a2966`）

边线最早是用一堆细长 Plane 拼出来的——每条边线一个 Node + MeshRenderer。问题有两个：
DrawCall 多（10+）、移动相机时远处的细线 **闪烁严重**（光栅化抖动）。

最终方案是 **删掉所有边线节点，把边线绘制塞进 fragment shader**：球场是一个大平面，
shader 知道每条线的世界坐标，每个像素自己算"我离最近的边线多远"，用 `smoothstep`
做抗锯齿。

```glsl
// effects/court-with-line.effect (节选)
uniform CourtParams {
    vec4  courtColor;
    vec4  lineColor;
    float lineWidth;        // 默认 0.05 m，可在编辑器里 0.01–0.20 调
    float courtHalfWidth;
    float courtHalfLength;
    float singlesHalfWidth;
    float serviceLineZ;
};

vec4 frag () {
    vec2 pos = v_worldPos.xz;
    float halfWidth = lineWidth * 0.5;

    // ★ 关键：用 fwidth 取屏幕空间像素大小，让远近线条等宽
    float aa = max(length(vec2(fwidth(pos.x), fwidth(pos.y))), 0.001);

    // 求到最近一条边线（底线/边线/单打边线/发球线/中线）的距离
    float minDist = 1000.0;
    minDist = min(minDist, distToVLine(pos, -courtHalfWidth, ...));
    minDist = min(minDist, distToVLine(pos,  courtHalfWidth, ...));
    minDist = min(minDist, distToHLine(pos, -courtHalfLength, ...));
    // ... 其他线

    // ★ 抗闪烁核心：在 [halfWidth - aa*1.5, halfWidth + aa*1.5] 平滑过渡
    float aaRange   = aa * 1.5;
    float lineAlpha = 1.0 - smoothstep(halfWidth - aaRange,
                                       halfWidth + aaRange,
                                       minDist);

    return CCFragOutput(vec4(mix(courtColor.rgb, lineColor.rgb, lineAlpha), 1.0));
}
```

`fwidth` 是 fragment shader 拿到的"该像素在屏幕空间相邻像素之间的差量"，远处一个像素
对应的世界距离比近处大，`aa` 自动放大，`smoothstep` 的过渡区间也跟着加宽，于是远处的
线变成了"两像素的渐变带"而不是"一像素的硬边"——闪烁就消失了。

DrawCall 一并从 10+ 降到 1（整个球场地面就一个 mesh）。

这一节是这一系列优化里最 "shader 思维" 的一笔——它说明了一个朴素道理：**当一个东西
本质上是平面上的几何信号，与其用 mesh 拼出来，不如让 fragment shader 自己算**。
mesh 表达"这是什么形状"，shader 表达"这个像素离形状多近"——后者天然支持任意分辨率
下的抗锯齿。

---

## 十二、击球点 / 飞行时间 / Update 降频 / Prefab 缓存（`da756b9e`）

这个提交一次塞了四个不相关的优化，逐个简述：

1. **击球点 Y 抬高**：原本击球点 y=0（地面），球员挥到地上不真实。改成调
   `PositionGenerator.ballHitPositionY()` 拿到一个 1m 左右的标准击球高度。
2. **球飞行时间归一化**：[PartFive §2.3]({{< relref "/posts/CocosTennisPartFive" >}})
   讲过的"球飞行时间 = 移动时间 + 等待时间 + 击球关键帧时间"公式，按
   `hitKeyframeTime / animSpeed` 归一化，避免不同动画速度下时序错乱。
3. **QSArmature.update 降频**：动画状态机的 update 每帧跑挺贵的，改成每 2 帧跑一次，
   累计 deltaTime 一次性消化：

   ```typescript
   // Player/QSArmature/QSArmature.ts
   private _updateInterval: number = 2;
   private _frameCounter: number = 0;
   private _accumulatedDeltaTime: number = 0;

   public update(deltaTime: number): void {
       this._gameTime += deltaTime;                 // 时间还得每帧累
       this._accumulatedDeltaTime += deltaTime;
       this._frameCounter++;
       if (this._frameCounter >= this._updateInterval) {
           this._updateCurrentAnimation(this._accumulatedDeltaTime);
           this._frameCounter = 0;
           this._accumulatedDeltaTime = 0;
       }
   }
   ```

   注意 `_gameTime` 仍然每帧累加——只有"动画状态检查"这件事降频，时间本身不能降频，
   否则触发关键帧的判定会偏。
4. **Prefab 缓存**：球员 prefab 第一次加载耗时 200ms+，重连/重播时再加载就是浪费。
   `TennisAssetBinder` 加了双层缓存（prefab 资源 + 实例化好的 Node）：

   ```typescript
   private _prefabCache: Map<string, Prefab> = new Map();
   private _playerNodeCache: Map<string, Node> = new Map();
   ```

四个改动放在一个提交里其实是个反模式（commit 应该单一职责），但它们的共同点是
"从 profile 数据里挑出来的尖刺"——每个都是几毫秒、十几毫秒的级别，单独发 PR 不够分量，
合在一起一波解决。

---

## 十三、性能优化收益对照

把第二部分所有优化项放到一张表里：

| 优化项 | 类别 | 改动量 | 主要收益 |
|---|---|---|---|
| VAT + Instancing（观众） | 资产 + 代码 | 8 个 .meta + 81 行 ts | 观众 DrawCall: ~200 → ≤8 |
| 球场材质合并 | 资产 | court.glb.meta -42% | DrawCall: 4 → 1 |
| 球员 / 球拍减面 | 资产 | FBX -50%~80% | 顶点 -60%（球员）/ -80%（球拍） |
| GPU 纹理压缩 | 资产 | 8 张 .meta | 显存 -50~75% |
| 闲置降频 | 代码 | 单点开关 | CPU -50%（闲置态） |
| 名称纹理动态尺寸 | 代码 | 1 个类重构 | 远端清晰、近端省显存 |
| Shader 边线 + smoothstep | 资产 + 代码 | 1 effect + scene 减肥 | DrawCall: 10+ → 1，消除闪烁 |
| Update 降频 | 代码 | QSArmature | 动画 update 频率 50% |
| Prefab 缓存 | 代码 | TennisAssetBinder | 重进场景近 0 加载 |

---

## 十四、收尾

PartFive 把客户端核心业务讲完，PartSix 把工程化和性能两块都讲完——到这里 3D 球场
项目客户端的工程闭环就真的完整了：

- **业务侧**保证"功能正确"——状态机、Script 调度、超时恢复、ACE / 双误兼容；
- **工程化**保证"项目能上线"——modulemap、framework 打包、Swift 兼容、退出 crash 修复；
- **优化侧**保证"性能可接受"——VAT、合材、减面、压缩、shader、降频、缓存。

回看从 PartOne 到 PartSix 这一系列：（一）资产、（二）引擎、（三）Demo、（四）服务端、
（五）客户端业务、（六）客户端工程化与优化——一个完整的 3D 实时直播系统的全栈工程实践。
