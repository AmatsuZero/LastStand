---
title: "Fastlane Match 读到了描述文件，不等于 macOS 导入了私钥"
date: 2026-11-18T23:21:47+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "构建", "CI/CD", "macOS"]
---

## 现象

Fastlane Match `readonly` 解密成功，定向安装了 App 和扩展的描述文件，lane 退出码为 0；下一步 `security set-key-partition-list` 却返回 `SecItemCopyMatching: The specified item could not be found in the keychain`。临时钥匙串中能找到证书，找不到具备私钥的签名身份。

## 已验证成因

在本机使用锁定的 Fastlane 2.240.1，逐步区分仓库解密、P12 解析、系统导入和签名。旧 P12 可用空口令在 OpenSSL 中解析，且私钥与证书匹配；同一个 P12 用系统 `security import` 导入已解锁的一次性钥匙串报 `MAC verification failed`。Fastlane 记录导入错误后仍可继续安装描述文件，因此不能从 lane 退出码判断私钥已装好。只替换 OpenSSL 输出的 MAC 摘要算法未解决对照失败；没有证据支持将问题普遍归因于某一种摘要算法。

## 有效恢复

在有授权的 Mac 上使用同一证书和私钥，经一次性口令导入隔离钥匙串，再从该钥匙串以空内层口令重新导出；仅将重新加密后的 Match 文件纳入签名仓库。复核私钥公钥与原证书一致、Match 加密可往返。清理临时 P12 和钥匙串，不启用宽松私钥 ACL，不写入 login 或系统钥匙串。

部署预检时使用 `security find-identity -v -p codesigning <临时钥匙串>` 严格匹配目标证书指纹；找不到身份时，在修改 partition list 之前报错。随后签名一个可丢弃的可执行文件，确认私钥可非交互调用。口令不要出现在参数、调试输出或工件中。

## 边界

本结论针对实测的 P12 和 macOS 环境，不推断所有 OpenSSL 导出的 P12 都不兼容。内层空口令是这里 Match 导入的兼容约定，私钥文件仍必须以独立口令加密存储并做访问控制。重新封装不等于重新签发或吊销证书，也不需要改描述文件。本地文件镜像不证明 Runner 有仓库访问权限；真实 Runner、Archive、IPA 导出和分发分别验证。

## 证据

旧 P12：OpenSSL 解析成功，系统导入退出 1，目标签名身份不存在。重新导出后：系统导入、目标身份检查、partition 设置及实际 `codesign` 均退出 0。随后用加密本地镜像运行锁定 Match，从空的一次性钥匙串完成 App Store/Ad Hoc 双目标同步及签名探针。没有修改 Apple Portal、既有钥匙串或正式发布流程。
