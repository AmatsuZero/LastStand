---
title: "Git 无文本冲突的合并也可能重复 Swift 方法"
date: 2026-11-11T16:06:54+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "GitLab", "Xcode"]
---

## 现象（symptom）

集成长期分支时，Git 自动合并的 Swift 控制器保留了两个签名完全相同的方法。
脚本测试全部通过、文本冲突清空，并不意味着 App 可以编译。

## 已验证成因（verified cause）

两个 parent 分别在不同文本上下文引入了同一职责的方法，文本合并把两个声明都保留。
比较合并结果与两个 parent，可以定位一段额外的旧实现；将两个生产方法提取到
最小 Swift 夹具并执行 swiftc，稳定报 invalid redeclaration。

## 有效恢复（effective recovery）

逐项比较方法语义，保留源分支已经扩充的 transport 错误分流和正确的阶段映射，
移除重复旧声明。修正后的业务 Swift 文件与源分支逐字节一致。再提取最终生产方法，
编译并执行蓝牙、AP、设备网络和服务失败路由断言；确认 merge commit 的两个 parent
以及关注 MR 的原始提交仍然可达。通过 MR 提交，不直接更新目标分支。

## 边界（boundaries）

不要无条件选择 newer/theirs；必须核对两个 parent 的实际行为和调用点。
提取夹具只证明该方法的编译和受控路由，完整 App 构建与真机验收仍独立进行。
合并历史包含某个提交，也不证明冲突解决保留了该提交的行为，需要同时比较文件和运行检查。

## 证据（evidence）

原合并提取方法编译出现 invalid redeclaration；去除重复后同一夹具编译成功，
5 项路由断言通过。集成的 CI 脚本测试 452 项通过，配网进度与传输断言 96 项、
关系及重连策略断言 20 项、AP entry/navigation 检查通过，依赖锁单独复验成功。
上述证据不替代远端签名 App 构建。
