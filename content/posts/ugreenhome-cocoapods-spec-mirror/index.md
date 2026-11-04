---
title: "UgreenHome CocoaPods Specs / 镜像 tag 故障复盘"
date: 2026-10-21T14:06:24+08:00
draft: true
tags: ["CocoaPods", "iOS", "Specs", "镜像", "依赖管理"]
categories: ["绿联工作笔记"]
---

## 背景与现象

主工程使用内部 CocoaPods Specs 仓库。某些源码 pod 的 source.git 指向内部 GitLab 镜像；另一些第三方依赖由 <code>*-bin</code> spec 提供预编译 XCFramework。FCUUID-bin 的 spec 声明了对源码 pod UICKeyChainStore (~> 2.1.0) 的依赖，而主工程此前没有直接声明 UICKeyChainStore。

删除 iot/Podfile.lock 后运行 <code>make -C iot pods</code>，CocoaPods 重新解析传递依赖，选中了 Specs 中的 UICKeyChainStore 2.1.3。该 spec 指向镜像中不存在的 v2.1.1 tag，安装失败，典型报错是 <code>fatal: Remote branch v2.1.1 not found in upstream origin</code>。这发生在依赖解析、源码获取阶段，尚未进入 App 链接。

主工程 Podfile → FCUUID-bin 1.3.3.1 → UICKeyChainStore (~> 2.1.0) [传递源码依赖] → 无 lock 时选到 2.1.3 → source.tag = v2.1.1 [镜像不存在] → make pods 失败。

注意：验证 pod 变更应使用 <code>make -C iot pods</code>，不要直接跑裸 pod install——工程的 Makefile 流程负责 Specs 更新、Bundler 和必要的 JDK 环境。

## 名词解释

- **Specs 仓库**：存放 Podspec 的私有 Git 仓库，相当于私有 CocoaPods 源。
- **source.git / source.tag**：Podspec 里声明「源码从哪个 Git 仓库、哪个 tag 取」。
- **<code>*-bin</code> spec**：提供预编译 XCFramework 的 spec，避免源码编译。
- **Podfile.lock**：一次依赖解析结果的快照；删锁重解会重新按当前 Specs 内容选择版本。
- **dependency_redirect.rb**：在 CocoaPods 完成解析后，把同名源码 pod 的构建 / 嵌入重定向到 <code>*-bin</code>。

## 根因：三个层次

### 2.1 Specs 数据错误

镜像是上游仓库的整仓 fork，原有 tag 带 v 前缀（如 v2.1.2），随后人工维护又引入无 v 前缀的 tag。UICKeyChainStore 2.1.3 是多余的 spec，却指向镜像中不存在的 v2.1.1，把版本号、tag 命名和源码 commit 混在了一起。

同轮检查还发现：FCUUID 1.3.3.1 的源码地址仍是旧内网地址；SwiftyRSA 8.0.0.3 / 8.0.0.4 的源码 tag 不匹配；三个私有 patch 版本仍指向 GitHub 上不存在的 tag。

### 2.2 发布脚本未阻断坏 tag

CI 的 rewrite-spec-source-to-mirror.py 曾只改写 source.git，没有在写入 Specs 前强制确认镜像 tag 存在。无 fallback 时留下不存在的 tag；有 fallback 时又可能回退到与 spec 版本语义不符的旧 tag。于是坏 spec 能进入 Specs 仓库。

### 2.3 Podfile 与锁文件的作用被误解

<code>pod 'UICKeyChainStore', '2.1.2', :binary => true</code> 会被工程的 Podfile DSL 改写为直接声明 UICKeyChainStore-bin (= 2.1.2)，它**不会**把传递解析到的源码 pod UICKeyChainStore 也约束为精确的 2.1.2。dependency_redirect.rb 在解析之后才抑制同名源码的构建与嵌入，所以 Podfile.lock 同时出现 UICKeyChainStore 与 UICKeyChainStore-bin 是预期现象，不能据此断定去重失败——但源码 spec 的 tag 仍必须可获取。

## 修复（现象 → 根因 → 修复 → 防护）

1. **UICKeyChainStore 2.1.3 缺失 tag**：多余且错误的 spec 被发布 → Specs MR !8 撤回 2.1.3，保留指向有效 v2.1.2 的 spec；并全量校验所有 Git source spec 的远端 tag。
2. **FCUUID / SwiftyRSA / 其他 patch spec 的 source 不一致**：旧地址、GitHub 地址或语义错误的 tag 残留 → 同一 Specs MR 修正 FCUUID 1.3.3.1、SwiftyRSA 8.0.0.3 / 8.0.0.4、CocoaAsyncSocket 7.6.5.1、JXSegmentedView 1.4.1.1、UITextView+Placeholder 1.4.0.1，用程序校验而非肉眼 diff。
3. **坏 spec 可再次进入仓库**：镜像重写脚本没有 fail closed → CI MR !67 对 source.tag 执行 git ls-remote 校验，支持 v 前缀等价匹配，缺失即失败；发布链路增加 tag 别名检查 / 创建和全量体检脚本；CI 回归覆盖缺失 tag、回退与发布路径。创建别名需要有权限的 GITLAB_TOKEN，没有 token 时别名创建会告警，但 spec 最终引用的 tag 仍必须存在。
4. **主工程解析结果不稳定**：只从 FCUUID-bin 传递引入 UIC → 主工程 MR !144 显式声明 UICKeyChainStore-bin 2.1.2、更新 Podfile.lock 并修正关于头文件 import 的错误注释；删锁后经 make pods 重新解析验证。

三个 MR 均于 2026-10-21 合并（Specs !8、CI !67、主工程 !144，目标 feature/1.8.0）；主工程 MR 流水线 success。

## 验证结果与边界

- **Specs**：合并后的本地 Specs main 检查了 123 个带 Git source tag 的 spec，结果 OK: every source.tag exists in its remote（MISSING=0）。123 是带 Git tag 的检查对象数量，不是仓库全部 spec 数量。
- **安装**：删除 Podfile.lock 后，经 make -C iot pods 一次通过；解析到源码 UICKeyChainStore 2.1.2 和二进制 UICKeyChainStore-bin 2.1.2，没有再选到 2.1.3。
- **二进制去重**：生成的 App embed 脚本只使用 UICKeyChainStore-bin。FCUUID-bin 与 UICKeyChainStore-bin 的 ios-arm64 产物实际都是动态库；FCUUID 对 UICKeyChainStore 是未定义引用，通过 @rpath 动态链接。交接文档所谓「两者静态链接」不准确。
- **设备架构构建**：用已连接 iPhone 作为 xcodebuild 目标，执行 UgreenHome scheme、Beta configuration、iphoneos / arm64、CODE_SIGNING_ALLOWED=NO，退出码 0；生成的 App 同时链接 FCUUID.framework 与 UICKeyChainStore.framework，无 duplicate symbols。此验证没有签名、安装、启动或测试实际设备功能。
- **工作区**：构建产物使用独立的 DerivedData；主仓库无新增跟踪文件改动。

## 日后排查时如何区分阶段

<pre class="mermaid">
flowchart TD
  A[发布组件 tag / 镜像] --> B[生成并改写 podspec source.git + source.tag]
  B -->|CI 校验 tag 存在; 缺失即失败| C[合入 ugreenhomespecs]
  C --> D[make -C iot pods]
  D -->|CocoaPods 解析/下载; Podfile.lock 记录源码和 *-bin| E[dependency_redirect.rb 去重]
  E -->|抑制同名源码构建/嵌入| F[iphoneos App 编译与链接]
  F -->|本次已通过; 无重复符号| G[签名/安装/启动/功能验证]
  G -. 本次未执行 .-> H[设备运行]
</pre>

排查顺序：先区分失败发生在 spec 发布、tag 获取、Pods 安装、App 编译 / 链接、设备运行的哪一层。Podfile.lock 出现传递依赖不是错误；需要同时看 Podfile 的有效声明、spec 的依赖与 source.tag、最终 embed 脚本和构建结果。

当前没有原故障的待补修复。未来若新增兼容的 UICKeyChainStore 2.1.x 源码 spec，删锁后源码版本仍可能重新选择，因为 <code>*-bin</code> 的精确版本并不精确约束源码 pod——这是额外的版本确定性议题。

## 关键文件与复查命令

- ugreenhome/iot/Podfile、iot/Podfile.lock
- ugreenhome/Tools/cocoapods-bin/podfile_bins.rb、dependency_redirect.rb
- ci/scripts/ug-component/rewrite-spec-source-to-mirror.py、ensure-mirror-tag-alias.py、verify-spec-source-tags.py
- ~/.cocoapods/repos/ugreeniot-home-ios-ugreenhomespecs

复查命令：<code>python3 verify-spec-source-tags.py</code> 与 <code>make -C iot pods</code>。复查时保留现有工作区改动；Specs 本地 clone 应停留在 main，不要在未推送的分支上运行会更新 repo 的 Pods 流程；所有后续变更继续通过 MR 合入。
