---
title: "本机 macOS Runner 的 SessionCreate 与签名会话边界"
date: 2026-11-10T15:40:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["GitLabRunner", "CI/CD", "Xcode", "macOS", "故障", "踩坑"]
---

## 现象

已登录开发机作为 shell Runner 时，checkout、Pods 和编译前置成功，但扩展签名报
`errSecInternalComponent`。同一用户在交互会话中可以签名，查找签名身份也能找到证书。

## 已验证成因

Runner 使用当前用户 LaunchAgent，但额外配置了 `SessionCreate=true`。
使用两个独立的一次性 LaunchAgent，对同一复制的可执行文件、同一开发签名身份运行
`codesign --force --sign <identity> --timestamp=none <probe>`：

- 不指定 SessionCreate、继承 GUI 用户会话：退出码 0。
- 指定 SessionCreate=true：退出码 1，重现 `errSecInternalComponent`。

签名身份可见不等于私钥操作可用。这个对照证明该设置是本机签名探针失败的触发条件；
不能据此推断所有 macOS Runner 都应禁用它。

## 有效恢复

移除这台专用 Runner 的 SessionCreate 设置，使用现有 GUI 用户会话，待当前任务结束后
重启该用户服务再重试 CI。无需导出证书、改私钥 ACL、修改全局钥匙串设置或索取密码。
GitLab macOS 安装文档把 SessionCreate 列为特定场景可能需要的设置，不能不经验证直接套用。

## 边界

当前用户需保持登录。签名探针成功不能替代完整 App/扩展/runner 签名和真机 XCTest 验收。
新建服务不应覆盖现有 Runner 的配置或开发工作目录。
Git checkout 的凭据助手与代码签名钥匙串是两个边界：若后台 Git 尝试向 osxkeychain
存储临时 CI 凭据而报错，可用仅对该 Runner 生效的 Git 配置清空 credential.helper，
由 GitLab 注入的 job 凭据及进程级私有仓库配置负责读取；不要更改用户全局 Git 配置。

## 证据

失败 job 的 xcresult 含扩展动态库 CodeSign 错误；两个签名探针分别返回 0 和 1。
修正后服务状态为 running，完整 CI 签名构建与真机重试通过：5 tests、0 failures、0 skips；JUnit 与下载的 xcresult 一致，8 张截图可导出，报告制品上传成功。该结果仅覆盖本次设备与登录会话配置。
笔记不包含认证 token、签名身份指纹、设备标识或内部地址。
