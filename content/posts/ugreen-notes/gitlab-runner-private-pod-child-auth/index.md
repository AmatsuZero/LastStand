---
title: "新 macOS Runner 的 CocoaPods 私有仓库认证：授权和子进程凭证是两层"
date: 2026-11-09T17:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["GitLab", "GitLabRunner", "CocoaPods", "凭证", "CI/CD", "踩坑"]
---

## 现象

旧 macOS Runner 的组件发布成功，迁移后的新 Runner 在 CocoaPods 安装私有 Specs 或组件源码时失败。初始脚本的认证 clone 成功，CocoaPods 再启动的 Git clone 仍提示无法读取用户名。另一种表现是只有新增的私有 Specs 源失败。

## 已验证成因

有两个独立边界：目标仓库是否允许调用项目的 CI_JOB_TOKEN，以及后续 Git 子进程是否实际拿到凭证。只给首个 clone 的 URL 携带凭证，不会让 CocoaPods 后续普通 URL 的 clone 自动认证。目标仓库新增入站 allowlist 后，子进程认证缺失仍可重现。

新增 Specs 源还可能遗漏进程级 URL rewrite。用现有 Pod token 的最小读取成功，而实际 CI 仍失败，说明应检查 URL 匹配范围，不能直接判断 token 权限不足。

## 有效恢复

- 按失败日志为必要的调用项目增加目标仓库入站授权，保留其他条目；不要直接开放整个组。
- 组件分支验证使用进程级 GIT_CONFIG_COUNT / KEY / VALUE，把仓库限定的 credential helper 传给 CocoaPods 子进程。保留已有配置条目，helper 从 CI_JOB_TOKEN 环境取值，不把 token 写进磁盘配置。
- credential helper 校验协议、主机和仓库路径，只实现 get；store/erase 不持久化凭证。
- 已有 Pod token 可用但 URL 映射缺失时，只补充缺少的仓库范围和配置数量，不扩大成整个主机的 rewrite。
- 在独立验证分支只运行读取与构建，不运行发布。用唯一临时 tag 定向到新 Runner，结束后移除该 tag。

## 证据

本次实际排查中：补充 Specs allowlist 后初次 snapshot 成功，后续 CocoaPods Git clone 仍失败；补齐继承和私有源码目标授权后，组件依赖安装、设备 Archive 与 XCFramework 生成成功。另一条 App 链路中，现有 Pod token 的最小读取成功，新增 Specs URL 映射后，在新 Runner 上使用同一映射的 Git 子进程读取退出 0。

本地 8 个聚焦测试验证 Git 子进程继承、无持久化、继承配置保留、主机/路径边界及既有发布认证保持；全套 268 tests 成功，2 skipped。测试数量仅为当次快照。

## 边界

入站 allowlist 不能替代触发账号的权限；认证读取成功不能证明 App/KMP 编译、签名或发布成功。旧 protected tag 发布成功也不能证明新机器的非 protected 分支读取路径可用。Runner 注册 token、CI_JOB_TOKEN、Pod 读取凭证承担不同用途，通常不需要在新 Runner 安装 glab 或个人 PAT。

使用 URL rewrite 时应避免把凭证写入持久配置，并控制日志输出；新的仓库地址必须有独立的读取验证。不要用删除锁文件、重装 IDE 或安装个人凭证来掩盖认证范围缺失。


## 补充：Specs 读取成功后仍要核对传递源码仓库

私有 Specs 仓库只保存依赖描述，不代表它引用的源码仓库也在认证范围内。一次分支同步后的构建在 CocoaPods 获取一个 ObjC SDK 时失败：Specs 已可读，但该 podspec 的 source.git 指向另一个独立仓库；该 SDK 又依赖一个 Swift SDK，后者也使用独立 Git 仓库。

本次先用原有 Pod token 在新 Runner 最小读取 ObjC SDK 的锁定 tag 成功，确认无需新 token。再沿锁定版本的 podspec 递归检查传递依赖，发现两个源码地址均未匹配已有 URL rewrite；修复为逐仓库补充映射并验证两者实际 clone。不要只添加错误日志中的第一个仓库，也不要把整个主机加入认证范围。

分支 cherry-pick 成功与其 CI job 成功是不同结论。用旧机器的缓存或凭证跑绿，也不能证明新机器的同一依赖链可用。检查锁定 Pod 的 source.git 及其传递依赖应当是新 Runner 认证验收的一部分。
