---
title: "XCTest 启动测量：一次迭代不等于一次全新安装启动"
date: 2026-11-12T17:00:37+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "CI/CD", "踩坑"]
---

## 现象（symptom）

启动性能方案要求每个样本都先重新安装 App，再且仅启动一次，并将“固定 mock 设备卡片可见、可点击”作为业务终点。

最初计划使用 `XCTApplicationLaunchMetric`，把 `XCTMeasureOptions.iterationCount` 设置为 1，以为能同时满足一次进程启动和系统首帧采集。检查实际安装的 XCTest 公开头文件后，发现这个假设不成立。

## 已验证成因（verified cause）

本次安装工具链的 `XCTMeasureOptions.h` 对 `iterationCount` 明确说明：

> Note that the block is actually invoked `iterationCount` + 1 times, and the first iteration is discarded.

因此，`iterationCount = 1` 不能保证测量块只调用一次。如果块内调用 `app.launch()`，就不能把这个配置当作“恰好一次 App 启动”的证明。后续启动也可能受到首次运行创建的状态影响；具体进程和缓存行为仍要用运行证据确认。

这是本次工具链头文件证明的调用契约，尚没有本项目真机运行轨迹来量化额外调用的耗时或影响。其他 XCTest 版本应核对其文档和实际行为，不能把本次发现扩大为所有性能 API 的固定实现。

## 有效恢复（effective recovery）

专项用例暂时直接调用一次 `app.launch()`，由外部编排为每个样本执行独立的准备、卸载和安装。计时起点使用 UI 测试进程的单调时钟，在固定卡片可见、可点击时停止；详情导航在停止计时后单独验证。

该值命名为 `business_ready_ui_ms`，明确包含自动化等待与轮询开销。App 内从 AppDelegate 到列表就绪的事件保留在独立时钟域，只计算本域区间。

`system_first_frame_ms` 暂记为 unavailable。待找到并验证“与该次唯一启动对应”的系统采集来源后，再补齐首帧指标；不能用 UI 等待时间改名代替，不能把缺失指标填成 0，也不能把缺失系统指标的样本标成完整首帧基线。

后续接入采集来源时，需要保存原始指标身份、单位、样本映射和启动次数证据。只看到一个非空数字，不足以判断它属于哪次启动或是否包含预热。

## 边界（boundaries）

- 用例中只有一个显式 `app.launch()`，不等于已经证明外部 XCTest 编排没有额外启动或安装；还需真机进程与安装证据。
- 卸载重装通常重置 App 沙盒，不代表清除了 Keychain、第三方 SDK 私有持久化、系统缓存或运行时缓存。状态范围未查清时，应拒绝“无业务缓存”有效样本声明。
- `launch.app_delegate_begin` 是 AppDelegate 入口，不是 `main`，也不包含 pre-main。不同进程的时钟不能直接相减来推导 pre-main。
- 设备列表响应收到、模型绑定或 cell 创建均不能单独证明页面可交互。App 内 readiness 还需 UI 可见、可点击与导航断言验证。
- 本次调整保住了单次显式启动设计，但首帧采集与真机 fresh-install 验收仍是待办，不能记成已解决全部启动测量问题。

## 证据（evidence）

2026-11-12，读取安装工具链的 XCTest 公开头文件，确认上述 `iterationCount + 1` 说明；专项测试源码因此不使用标准 `measure` 块。

调整后的 App 与 UI test target 已完成 unsigned `StartupProfile build-for-testing`。记录器、readiness 和精确范围准备逻辑的 macOS 源码测试 harness 31 项通过，但这类单元证据不证明真机启动次数、首帧指标或 Keychain 重置已经通过。

本文归档的是测量契约纠正与当前验证边界，没有给出真实设备启动速度、劣化阈值或真机成功结论。
