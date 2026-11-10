---
title: "多台 macOS Runner 的签名能力必须分别验收"
date: 2026-11-10T20:56:28+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "构建", "CI/CD", "GitLabRunner", "macOS"]
---

## 现象

Jenkins 能正常打签名包，新增 GitLab macOS Runner 却在获取 App Store profile 时报告
`There are no local code signing identities found` 和
`Could not find a matching code signing identity for type 'AppStore'`。
ASC API Key 验证成功，不能据此判定本地证书和私钥已就绪。

## 已验证成因

两台 Runner 使用相同通用构建标签，实际 macOS 主机和执行账号不同：

- 旧节点的登录钥匙串有可用 Distribution 身份，实际 `codesign` 探针成功。
- 新节点没有专用签名钥匙串，默认列表和显式登录钥匙串均返回 0 个有效身份。
- 旧节点的专用钥匙串存在且可解锁，但解锁后仍返回 0 个有效身份。

因此，本例不能靠增加 `MATCH_KEYCHAIN_NAME` 或解锁空的专用钥匙串修复。
有效 App Store profiles 与旧节点的公开证书指纹相匹配；失败发生在新节点的本地签名能力边界。

## 有效恢复

给已通过真实私钥签名探针的节点增加独立签名能力标签，让签名构建要求该标签。
通用构建节点继续承担单测和包体积分析，经制品仓库接收签名 IPA。
在依赖安装之前重复预检，缺身份或私钥操作失败时尽早停止。

预检应先读取 `security find-identity -v -p codesigning` 并限定团队，再复制一个系统
可执行文件到临时目录，执行 `codesign --force --sign <identity> --timestamp=none <probe>`。
复制时不要保留系统 immutable flags：本例 Python `shutil.copy2` 在旧节点的 `chflags`
阶段报 `Operation not permitted`，改为 `copyfile` 并单独设置临时文件权限后签名成功。
临时文件结束后删除，不修改原二进制、全局钥匙串搜索列表、ACL 或锁定状态。

## 边界

- `find-identity` 能列出证书不代表后台会话可以操作私钥，必须验证真实签名。
- 只读枚举返回 0 可能是未安装、未解锁或不可见，要分别验证；本例已确认新节点缺专用钥匙串。
- ASC 只能提供公开证书和 profiles，不能恢复私钥。扩容签名节点需要安全迁移现有身份后重新验收。
- 本机非交互导出选定身份曾返回 `errSecAuthFailed`，没有完成导出或迁移；不能据此断言证书失效，也不能通过放宽原私钥 ACL 绕过。
- Runner 管理接口显示的出口地址不是可直接 SSH 的主机地址；无直连路径时可用临时 MR 执行不泄密的诊断。
- 签名能力标签是调度约束，不是受保护分支或 secret 权限边界。
- 私钥探针和 profile 下载通过不能替代完整 Archive/export、制品传递、App 运行或分发验收。

## 证据

只读诊断同时覆盖两个 Runner；后续探针确认旧节点私钥可用、新节点无签名身份。
限定签名节点后，真实 MR 构建通过私钥预检，下载并安装主 App 与扩展的有效 profile，进入 Archive；
另一节点并行完成 131 项单测、0 failures。本地 384 项构建工具测试和 GitLab CI Lint 通过。
后续真实流水线已通过 Archive、签名 IPA export、制品仓库上传、另一 Runner 的下载及摘要校验、包体积分析、报告上传和 MR 评论更新。
集成分支签名基线与下一笔 MR 增量比较仍需在用户合入后单独验收。

本文省略内部主机、账号、网络地址、证书指纹和所有凭据。
