---
title: "CI 签名 IPA 的版本预检必须复用构建覆盖参数"
date: 2026-11-10T19:27:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "iOS"]
aliases: ["/posts/ci-ipa-preflight-version-overrides/"]
---

## 现象（symptom）

把 MR 的无签名 App 构建改为签名 IPA 后，真实 Runner 在 Fastlane 版本校验处报错：

```text
App target version settings missing or inconsistent
```

此时凭据非空检查已通过，但还没有运行 provisioning 或 archive，不能据此判断签名凭据、证书和 Nexus 链路是否有效。

## 已验证成因（verified cause）

主 App 的工程版本为 `1.9.0`，Notification Service Extension 的工程版本仍为 `1.7.0`。CI 先运行未覆盖版本的 `xcodebuild -showBuildSettings -json`，随后严格校验两个 target 的版本必须一致，因此提前失败。

实际 archive 会经 gym 给两个 target 统一注入 `MARKETING_VERSION` 和 `CURRENT_PROJECT_VERSION`。预检没有使用同一组覆盖参数，验证的输入与真正构建的输入不同。问题在预检与构建之间的契约，不需要放宽版本校验。

## 有效恢复（effective recovery）

1. 第一次读取选定 configuration、iOS destination 下主 App 的营销版本。
2. 用该版本与本次流水线构建号，再运行一次 `-showBuildSettings -json`，显式传入 `MARKETING_VERSION`、`CURRENT_PROJECT_VERSION`。
3. 用第二次结果执行原有 App/Extension 严格一致性校验；archive 继续使用相同覆盖参数。

不要直接改成“只检查主 App”或忽略 Extension，也不要把旧版本默认当作新版本。

## 边界（boundaries）

该恢复已通过执行真实 CI YAML 预检步骤与真实 Ruby 版本校验器的本地回归：只替换外部 `xcodebuild`，模拟主 App/Extension 原始版本不同，验证覆盖后的有效版本一致。

本地通过与 CI YAML valid 不证明真实签名、profile 下载、archive/export、Nexus 大包上传或跨 Runner 下载成功；这些仍需分别读取真实 job 证据。首次执行可能还会暴露独立的 Runner 检出、网络或签名环境问题。

## 证据（evidence）

- 真实 MR job 先通过 Nexus 用户名/密码非空检查，随后在 Ruby 版本校验器抛出上述错误；此时尚未调用 provisioning。
- 新回归测试在修复前复现相同错误，修复后成功输出 `1.9.0`。
- 修改后 CI 配置测试 `29/29`、完整 Python 套件 `381/381`、六组 Fastlane 测试 `75 runs / 378 assertions` 通过；GitLab CI Lint valid。
- 本条仅记录预检输入不一致及其本地验证，不包含未完成的签名与分发验收结论。
