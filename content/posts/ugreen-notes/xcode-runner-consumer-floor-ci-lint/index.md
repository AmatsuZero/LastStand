---
title: "Xcode Runner 升级后，怎样核对 Swift 组件的最低消费版本"
date: 2026-11-25T18:30:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "Xcode", "XCFramework", "GitLab", "CI/CD"]
---

## 现象

更换 macOS Runner 的 Xcode 后，普通 Swift 程序仍能编译，组件发布却在导入 XCFramework 接口前报 `oldest consumer Xcode mismatch`。定时性能任务也可能在构建前退出，因为它单独校验 Xcode 的 build number。

## 已验证成因

Runner 提供 Developer 目录，组件发布配置另外声明最低支持的 Xcode 版本。把目录改为新版本后，组件仓库的 YAML 或 GitLab 项目变量仍可能要求旧版本。性能模板使用的 build number 与界面上的版本号也是两个独立的值。

## 有效恢复

1. 在 Runner 上分别读取系统选择、Runner 服务环境和作业配置。用配置中的目录执行 `xcodebuild -version`。
2. 确认组件的支持策略。如果保留旧消费端，让相应的编译器实际导入新产物。如果决定提高下限，在共享发布模板集中设置版本，移除组件 YAML 和项目设置里的重复值。保留版本精确比对和 Swift 接口导入。
3. 更新性能模板的 build number，核对宿主引用的模板 SHA 和工具脚本 SHA。使用固定 SHA 的宿主只有更新引用才会采用新模板。
4. 对含本地 include 的已提交配置，调用 `GET /projects/<id>/ci/lint?content_ref=<commit-sha>`，检查 `valid` 和 `merged_yaml`。本次把 YAML 放进 POST 请求并附上分支 `ref` 时，服务端提示本地 include 不存在；用同一提交的 `content_ref` 再验，展开成功。实际项目变量另查。

## 边界与证据

同一台 Runner、同一份最小 Swift 产物，声明 26.5 时校验退出 1，声明 27.2 时接口导入成功。真机与模拟器 SDK 的依赖导入回归也通过。性能预检要求 `17F42` 时退出 1，要求 `27B52` 时退出 0。以上验证覆盖工具链选择与接口导入，完整 App 链接和组件正式发布各自需要流水线记录。

## Xcode 升级后，模拟器和 Metal 还要分别验一次

两台构建机运行同一版 Xcode 时，一台同时注册了通用 iOS runtime 和特定设备变体。原脚本取 `simctl list runtimes` 的最后一行，再用只接受数字和连字符的正则截取标识。遇到带设备名称的后缀时，`simctl create` 收到被截断的标识，随即报 `Invalid runtime`。即使完整保留了后缀，变体也可能不支持测试使用的设备。

改为读取 `xcrun simctl list runtimes --json`，筛选可用的 iOS runtime，在 `supportedDeviceTypes` 中匹配实际设备，从候选中按数值版本取最新，原样传入 `identifier`。两台构建机均选中支持 iPhone 16 的通用 iOS 27.2 runtime，一台实测完成创建、启动与删除本次任务的临时设备。

另一个组件在真机 archive 编译着色器时提示 `cannot execute tool 'metal' due to missing Metal Toolchain`。在两台构建机所选 Xcode 下执行 `xcodebuild -downloadComponent MetalToolchain`，随后 `xcrun metal --version` 均可执行。原失败组件的 archive 验证作业重跑成功。最低消费 Xcode、模拟器系统及设备兼容性、Metal 编译器分别由上述命令验证。

## 模拟器 lint 的 iOS 版本与 Swift 消费 Xcode 分开核对

Xcode 27.2 的模拟器构建拒绝了 CocoaPods 生成项目中的 iOS 9、10 和 12 deployment target。组件交付给最低 iOS 15.1 的宿主时，可以在 CocoaPods lint 使用的 `XCODE_XCCONFIG_FILE` 中设置 `IPHONEOS_DEPLOYMENT_TARGET[sdk=iphonesimulator*] = 15.1`，让生成工程按宿主目标编译。用声明 iOS 12 的工程读取实际 build settings，模拟器得到 15.1，真机 SDK 仍得到 12.0。原先因 iOS 10 而失败的组件在同一提交重跑，source lint 通过。这个结果覆盖宿主 iOS 15.1 的编译；组件若另有更低系统的支持承诺，需要能覆盖该版本的环境独立验收。

## XCTest 在连接前退出时检查测试宿主

把相同的模拟器部署目标用于独立 `build-for-testing` 与实际 XCTest 后，一个旧 storyboard 宿主已成功链接，启动时却出现 `The test runner crashed before establishing connection`。在构建机上核对同一作业时间和进程名对应的 `.ips`，主线程停在 UIKit 的 `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`，异常为 `EXC_BREAKPOINT`。因此继续调整 podspec 或编译设置都没有解决启动问题。

在 Example 的 `Info.plist` 注册单场景 `UIApplicationSceneManifest`，通过 `UISceneStoryboardFile` 指向原有 Main storyboard，提供带 `window` 属性的 `UIWindowSceneDelegate`。保留原有宿主功能与测试断言。修复后，同一套测试在 iOS 27.2 模拟器执行 30 项，0 失败；独立的测试 bundle 编译也通过。

## 回退 Xcode 也要核对独立选择器和 Metal 组件

回退到 Xcode 26.6 / 17F113 时，实际定时性能任务已经使用旧编译器，但共享模板仍要求 27B52，环境报告因此得到 `capable=false`。这个失败发生在构建前，不能通过清空编译缓存解决。固定模板 SHA 的消费仓库还要更新引用；只改共享模板默认分支不会改变旧 SHA 的行为。

另一台构建机并行安装旧版时，`DEVELOPER_DIR` 和 `UG_COMPONENT_OLDEST_CONSUMER_DEVELOPER_DIR` 是两个独立的 Runner 环境项。组件测试脚本会用后者覆盖前者，因此只改主选择器会使组件测试继续使用新版。应分别核对实际调用链，调整路径后仍保留最低消费版本的精确校验，让模板中的版本策略也能被检查出来。

旧版 Xcode 的 Swift、真机 SDK 和模拟器 SDK 均可用，不代表 Metal 可用。真实探针中，首次启动检查、Swift 编译执行、UIKit 真机和模拟器类型检查均成功，而 Metal 报 `missing Metal Toolchain`。在明确设置旧版 `DEVELOPER_DIR` 的环境中运行 `xcodebuild -downloadComponent MetalToolchain` 后，`xcrun metal --version` 和实际 `.metal` 编译均通过。下载资产显示 17F109，而 Xcode 本体仍为 17F113；组件资产的标识不能代替本体版本核验，也不应据此擅自重装为候选版。

SSH 下的 xcodes 下载还曾返回 `OSStatus -25308: User interaction is not allowed`，随后附带账号密码错误提示。这只能证明当前调用没有完成钥匙串交互，不能据此认定账号密码错误或用户未登录。本次没有改动钥匙串或获取密码，而是复用另一台授权构建机上已经安装的同版 Xcode：通过既有 SSH 连接传输到独立目录，不复制凭证。目标完整 `codesign --verify --deep --strict`、版本核验、首次启动检查及实际编译探针通过后，才备份并修改 Runner 配置。

验证边界：Runner 配置只改两个工具链路径，TOML 结构对比通过；重载后服务 PID 保持不变，服务在线。使用实际 Runner 环境执行性能能力检查并要求 17F113，结果通过。这里的能力与探针检查不代表完整 App archive、签名分发或后续正式流水线已验收。保留较新 Xcode 时，系统级 `xcode-select` 可以继续指向它；报告必须明确 Runner 的显式路径，避免把 SSH 默认工具链当成 Job 工具链。

已授权的临时回退也可以在原性能 Schedule 增加 `BP_REQUIRE_XCODE_BUILD=17F113`，覆盖固定模板中的旧期望值；先保存并对比任务分支、cron、启用状态和相关变量，不改动其他设置，再通过原 Schedule 的 play 接口触发，保留 `CI_PIPELINE_SOURCE=schedule` 的工作流条件。真实重跑的环境报告得到 `capable=true`，要求值与实际 build 均为 17F113，unsigned Beta Archive 返回 0、官方 JSON 导出为 PASS。随后 GitLab Artifact 上传发生 connection reset，下游 checkout 也发生 TLS EOF，因此构建与导出通过不能写成整条性能流水线通过；采集、传输、分析和发布要分别报告。
