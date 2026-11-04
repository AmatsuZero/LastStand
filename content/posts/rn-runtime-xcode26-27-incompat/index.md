---
title: "RN Runtime：Xcode 26 ↔ 27 二进制不兼容的原因"
date: 2026-09-15T19:33:46+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["iOS", "Swift", "ReactNative", "ABI", "NitroModules"]
---

## 现象

用 Xcode 27 编译主工程时，若本地 RN Runtime 仍是 Xcode 26.6 打的预编译包，链接阶段失败：

```text
Undefined symbols for architecture arm64:
  method descriptor for Cxx.CxxPair.first.getter
  method descriptor for Cxx.CxxPair.second.getter
  来源：NitroModules（AnyMap.o）
```

反向也成立：Xcode 27 的包拿到 Xcode 26.6 下去编，会缺另一组 `Iterable` / `makeBorrowingIterator` 相关符号。

## 结论（先看这个）

这不是某个编译参数（`-fxxx` / `OTHER_SWIFT_FLAGS` / `BUILD_LIBRARY_FOR_DISTRIBUTION`）能补丁过去的问题。

根因是：

```text
Swift 6.3.3（Xcode 26.6） → Swift 6.4（Xcode 27）
```

系统自带的 Swift–C++ 互通层（Cxx overlay）里，`CxxPair` 协议的 ABI 变了。预编译的 NitroModules 已经写死了对「旧 method descriptor」的引用；消费端换编译参数，补不出这些符号。

因此：**同一套预编译 RN Runtime，不能跨 Xcode 大版本混用**。

官方有痕迹，但没有面向 App 开发者的点名预警。官方提前说的是「C++ 互通还在变，用兼容模式保源码」，没有提前说「Xcode 26 的 Swift–Cxx 预编译包不能给 27 链接」。这是语言演进的必然结果，不是未公开的私有变更；发行说明漏了二进制兼容这一层。

## 二进制证据（nm + demangle）

两套 NitroModules 对 `Cxx.CxxPair` 的「未定义符号」不同。关键变化：`getter（vg）` → `read / borrow accessor（vr）`，属性访问从「经典 getter（返回拷贝）」变成了「borrowing _read」。

## Overlay 源码变化（CxxPair）

Xcode 26.6 / Swift 6.3.3：

```swift
public protocol CxxPair<First, Second> {
    associatedtype First
    associatedtype Second
    init(first: Self.First, second: Self.Second)
    var first: Self.First { get set }
    var second: Self.Second { get set }
}
```

Xcode 27 / Swift 6.4：

```swift
public protocol CxxPair<First, Second> : ~Copyable {
    associatedtype First : ~Copyable
    associatedtype Second : ~Copyable
    init(first: consuming Self.First, second: consuming Self.Second)
    var first: Self.First { get set }
    var second: Self.Second { get set }
}
```

说明：

- 表面仍是 `{ get set }`；
- 但协议与关联类型变成 `~Copyable`（非拷贝）；
- 编译器因此生成 `borrowing _read`（mangling: `vr`），不再生成旧的 `vg` getter；
- `AnyMap` 等走 `std::pair → CxxPair` 的代码，会把对应 descriptor 链进 `.o`。

## 为什么改编译参数救不了

1. **消费端参数改不了已进包的 relocation**：undefined symbol 已经写在预编译的 `AnyMap.o` 里。
2. **BUILD_LIBRARY_FOR_DISTRIBUTION / Library Evolution 帮不上**：Swift–C++ 导入类型不支持稳定的 library evolution；Nitro 上游也明确过这一点。硬开反而更容易出 witness / 重复符号问题。
3. **这不在「普通 Swift ABI 稳定」承诺范围内**：平台 Swift 主路径相对稳定；Cxx overlay 仍在演进（这次就是 6.4 为 ownership / 非拷贝改了协议形态）。没有「编一次、跨大版本 Xcode 通用」的官方保证。文档里的 compatibility version 保的是重新编译，不是混链旧 xcframework。

## 和「pod install 不同步」要分开看

另一份日志里还有：

```text
The sandbox is not in sync with the Podfile.lock
```

那是 CocoaPods Manifest 检查失败，几秒就停，还没到链接。和上面的 CxxPair ABI 问题不是一类。

另外注意：终端 `xcode-select` 可能指向 `Xcode_26.6`，而 GUI 打开的 `Xcode.app` 可能是 27.0。`pod install` / fetch 脚本若跟错工具链，会继续装到错误大版本的二进制。

## 可行方案

**短期（推荐）**：按 Xcode 大版本分发两套预编译（26.x / 27.x），精确匹配优先，同大版本 fallback。这是和 ABI 现实一致的做法，不是偷懒。

**中期（若想少打包）**：把会碰到 Swift–Cxx overlay 的部分（至少 NitroModules 的 Swift 侧）改为随宿主工具链源码编译；其余无 Swift interop 的 xcframework 仍可预编译共享。

**不现实 / 不建议押宝**：

- 指望一个编译 flag 打通 26↔27；
- 指望 Apple 短期内冻住 Cxx overlay ABI；
- 仅靠 `BUILD_LIBRARY_FOR_DISTRIBUTION` 做跨版本二进制。

以后看 overlay 变更，优先查 swiftlang/swift 的 cxx-interop PR，以及 Swift Evolution 里 get vs _read 的 ABI 说明；不要只看 Xcode Release Notes 的 New Features。

## 名词补充

- **Swift–C++ 互通（Cxx interop）**：Swift 直接导入和使用 C++ 类型 / 模板的能力，依赖一套叫 Cxx overlay 的标准库映射。overlay 仍在快速演进，是 ABI 不稳定的重灾区。
- **CxxPair / ~Copyable**：`CxxPair` 是 overlay 对 `std::pair` 的 Swift 协议表达；`~Copyable`（非拷贝类型，SE-0390/SE-0474）让类型可以禁止拷贝，`yielding accessors`（SE-0474）把属性访问从 getter 改成 borrowing `_read`，从而改变 mangling 与 ABI。
- **BUILD_LIBRARY_FOR_DISTRIBUTION（BLFD）**：Swift 的 Library Evolution / Module Stability 开关，开启后输出 `.swiftinterface` 以支持跨工具链导入；但 Swift–Cxx 导入类型不支持稳定的 library evolution，所以救不了本次问题。
- **NitroModules**：React Native 的新一代原生模块桥接框架，底层大量使用 C++ 模板与 Swift–Cxx 互通，因此首当其冲受 overlay ABI 变化影响。
