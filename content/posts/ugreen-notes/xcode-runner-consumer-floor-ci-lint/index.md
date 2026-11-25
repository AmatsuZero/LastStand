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
