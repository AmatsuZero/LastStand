+++
title = "包瘦身-App Thinning"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 32
tags = ["iOS", "性能优化", "包瘦身"]
categories = ["iOS开发", "性能优化"]
+++
App Thinning是Apple提供的包体积优化技术，让用户只下载适合其设备的内容。本文详细介绍App Thinning的三个组成部分及其原理。

---

## 整体架构

```
开发者上传：
┌─────────────────────────────────────────┐
│            Universal IPA                │
│  ├── arm64 代码                          │
│  ├── @1x/@2x/@3x 图片                    │
│  ├── iPhone/iPad 资源                    │
│  └── Metal GPU资源（OpenGL ES已弃用）     │
└─────────────────────────────────────────┘
                    ↓
            App Store处理
                    ↓
┌───────────┐  ┌──────────┐  ┌──────────┐
│ iPhone 12 │  │ iPhone 8 │  │ iPad Pro │
│   变体     │  │   变体    │  │  变体    │
│  @3x图片   │  │  @2x图片  │  │ @2x图片  │
│  arm64    │  │  arm64   │  │  arm64   │
│ A14 GPU   │  │ A11 GPU  │  │ M1 GPU   │
└───────────┘  └──────────┘  └──────────┘
```

App Thinning包含三个部分：

| 技术 | 说明 | 状态 |
|-----|------|-----|
| Slicing | 按设备分发对应资源 | 可用 |
| Bitcode | 上传编译中间产物 | Xcode 14 起不再支持（新项目默认关闭） |
| On-Demand Resources | 按需下载资源 | 可用 |

---

## Slicing

Slicing在App Store服务器端进行，根据设备特征生成定制版本。

### 分发维度

| 维度 | 分发逻辑 | 示例 |
|-----|---------|-----|
| 屏幕分辨率 | @2x设备不下载@3x资源 | iPhone 8只下载@2x |
| 设备类型 | iPhone不下载iPad专用资源 | ~ipad后缀的资源 |
| GPU能力 | 按Metal特性集分发 | A12+设备下载特定着色器 |
| 内存大小 | 按设备内存分发 | 低内存设备下载低分辨率资源 |

### Asset Catalog的Slicing支持

正确使用Asset Catalog可以自动获得Slicing优化：

```
Images.xcassets/
└── Background.imageset/
    ├── Contents.json
    ├── background@2x.png      ← @2x设备下载
    ├── background@3x.png      ← @3x设备下载
    ├── background~ipad.png    ← iPad下载
    └── background~ipad@2x.png ← iPad @2x下载
```

### 验证Slicing效果

```bash
# Xcode → Product → Archive → Distribute App → Development
# 选择 "App Thinning: All compatible device variants"
# 导出后查看 App Thinning Size Report.txt
```

App Thinning Size Report示例：

```
App Thinning Size Report for All Variants of YourApp

Variant: YourApp-iPhone12,1.ipa
Supported devices: iPhone 11
App + On Demand Resources size: 45.2 MB compressed, 98.7 MB uncompressed
App size: 45.2 MB compressed, 98.7 MB uncompressed

Variant: YourApp-iPhone10,6.ipa
Supported devices: iPhone X
App + On Demand Resources size: 42.1 MB compressed, 91.3 MB uncompressed
App size: 42.1 MB compressed, 91.3 MB uncompressed
```

---

## Bitcode

Bitcode是LLVM的中间表示（IR），介于源代码和机器码之间。

### 工作原理

```
编译流程：
源代码 → 前端(Clang/Swift) → LLVM IR(Bitcode) → 后端 → 机器码
                                    ↑
                              上传到App Store
```

**传统流程 vs Bitcode流程**：

```
传统流程：
开发者编译为arm64机器码 → 上传 → 用户下载arm64代码

Bitcode流程：
开发者编译为Bitcode → 上传 → Apple重新编译 → 用户下载优化后的代码

好处：
1. Apple可以针对新CPU指令集重新优化
2. Apple可以使用最新的编译器优化
3. 未来新架构设备可以直接支持（理论上）
```

### 当前状态

```
# Xcode 14之前
Enable Bitcode = YES  # 可选开启

# Xcode 14及之后
Bitcode已被弃用，不再支持
原因：Apple芯片架构趋于稳定，Bitcode的优势不再明显
```

**废弃原因**：

- Apple Silicon架构统一，不再需要针对多种架构优化
- Bitcode增加了构建复杂性
- 调试困难（崩溃堆栈需要重新符号化）

---

## On-Demand Resources

ODR将资源托管在App Store服务器，应用按需下载。

### 架构

```
应用结构：
┌─────────────────────────────────────────┐
│              App Bundle                 │
│  ├── 核心资源（随应用下载）                 │
│  └── ODR标签引用                         │
└─────────────────────────────────────────┘
                    ↓ 运行时请求
┌─────────────────────────────────────────┐
│           App Store服务器                │
│  ├── level-2 资源包                      │
│  ├── level-3 资源包                      │
│  └── bonus-content 资源包                │
└─────────────────────────────────────────┘
```

### 标签类型

| 标签类型 | 说明 | 下载时机 |
|---------|-----|---------|
| Initial Install Tags | 随应用一起下载 | 安装时 |
| Prefetch Tag Order | 安装后预加载 | 安装后台下载 |
| 普通Tags | 按需下载 | 代码请求时 |

### 配置ODR

1. 在Asset Catalog中设置资源的On Demand Resource Tags
2. 在项目设置中配置标签类型

```
Project → Build Settings → On Demand Resources:
- Enable On Demand Resources: YES
- Initial Install Tags: core-assets
- Prefetch Tag Order: level-1, level-2
```

### 代码实现

```swift
class ResourceManager {
    private var currentRequest: NSBundleResourceRequest?
    
    /// 加载指定关卡的资源
    func loadLevel(_ levelNumber: Int, completion: @escaping (Bool) -> Void) {
        let tags: Set<String> = ["level-\(levelNumber)"]
        let request = NSBundleResourceRequest(tags: tags)
        currentRequest = request
        
        // 设置优先级
        request.loadingPriority = NSBundleResourceRequestLoadingPriorityUrgent
        
        // 检查是否已下载
        request.conditionallyBeginAccessingResources { available in
            if available {
                completion(true)
                return
            }
            
            // 需要下载
            request.beginAccessingResources { error in
                DispatchQueue.main.async {
                    completion(error == nil)
                }
            }
        }
    }
    
    /// 释放当前关卡资源
    func unloadCurrentLevel() {
        currentRequest?.endAccessingResources()
        currentRequest = nil
    }
    
    /// 预加载下一关卡
    func prefetchNextLevel(_ levelNumber: Int) {
        let tags: Set<String> = ["level-\(levelNumber)"]
        let request = NSBundleResourceRequest(tags: tags)
        request.loadingPriority = NSBundleResourceRequestLoadingPriorityLow
        request.beginAccessingResources { _ in }
    }
}
```

### 监控下载进度

```swift
func loadLevelWithProgress(_ levelNumber: Int, 
                           progress: @escaping (Double) -> Void,
                           completion: @escaping (Bool) -> Void) {
    let tags: Set<String> = ["level-\(levelNumber)"]
    let request = NSBundleResourceRequest(tags: tags)
    
    // 监控进度
    let observation = request.progress.observe(\.fractionCompleted) { progressObj, _ in
        DispatchQueue.main.async {
            progress(progressObj.fractionCompleted)
        }
    }
    
    request.beginAccessingResources { error in
        observation.invalidate()
        DispatchQueue.main.async {
            completion(error == nil)
        }
    }
}
```

### 系统资源管理

```
ODR资源生命周期：
1. 请求下载 → 资源可用
2. 使用中 → 系统不会清理
3. endAccessingResources() → 标记为可清理
4. 磁盘空间不足 → 系统自动清理

注意：
- 即使调用endAccessingResources()，资源也不会立即删除
- 系统会在需要时自动清理
- 下次请求时可能需要重新下载
```

### 适用场景

ODR适合以下场景：

- **游戏关卡**：玩家可能不会玩到所有关卡
- **教程内容**：用户可能跳过教程
- **本地化资源**：用户只需要一种语言
- **可选功能**：如滤镜包、贴纸包等

### 限制和注意事项

1. **网络依赖**：需要网络才能下载资源
2. **存储限制**：ODR资源总大小有限制（通常2GB）
3. **用户体验**：需要处理下载等待和失败情况
4. **测试复杂**：需要测试各种网络条件下的行为

---

## App Thinning最佳实践

### 1. 正确使用Asset Catalog

- 所有图片资源放入Asset Catalog
- 提供@2x和@3x版本
- 为iPad提供专用资源（如需要）

### 2. 验证Slicing效果

- 定期导出App Thinning Size Report
- 检查各设备变体的大小
- 确保没有不必要的资源被包含

### 3. 合理使用ODR

- 识别非核心资源
- 设计好资源加载流程
- 处理好加载失败的情况

### 4. 监控包体积

- 在CI中集成包体积检查
- 跟踪各版本的体积变化
- 及时发现体积异常增长
