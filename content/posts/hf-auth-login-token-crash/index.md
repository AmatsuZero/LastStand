---
title: "hf auth login 粘贴 token 崩溃排查与修复"
date: 2026-10-25T21:39:07+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["CLI", "Python", "代理", "排障"]
---\n
## 现象

homebrew 安装的 `hf` CLI（huggingface_hub 2.3.0，venv 基于 Python 3.15.1）执行 `hf auth login`，粘贴 token 后立即崩溃，刷屏 Python traceback（`ImportError`）。

## 根因

`~/.zshenv` 中无条件导出：

```sh
export all_proxy=socks5://127.0.0.1:7897
```

这是 Clash Verge Rev 的混合端口，对所有 shell（包括子 shell）生效。`hf` 粘贴 token 后调用 `whoami` 校验，`huggingface_hub` 创建 httpx 客户端时检测到 SOCKS 代理，需要 `socksio` 包；而 homebrew 的 hf venv（`--without-pip --system-site-packages` 创建）未打包 `socksio`，于是：

```text
ImportError: Using SOCKS proxy, but the socksio package is not installed
```

之所以恰好在「粘贴 token 时」崩：那是整个登录流程中第一次发 HTTP 请求的时刻，`getpass` 读输入本身不发网络请求。

## 修复

把 `socksio 1.0.0` 装进 hf venv 自己的 site-packages（不污染共享的 `python@3.15`）：

```sh
/opt/homebrew/opt/python@3.15/bin/python3.15 -m pip install \
  --target /opt/homebrew/Cellar/hf/2.3.0/libexec/lib/python3.15/site-packages \
  socksio
```

## 验证

`hf auth whoami` 显示 `Logged in as Daubert`（token 名 ugreen）；用假 token 测试返回标准 `401 Invalid user token.`，说明代理链路与 SSL 均正常。

## 注意事项

1. `brew upgrade hf` 会重建 venv，`socksio` 会丢失，需要用上面的命令重装。
2. `/tmp/struct.py` 会影子标准库 `struct` 模块，从 `/tmp` 目录运行 Python 脚本会 `import ctypes` 失败，建议删除或移走。

## 名词补充

- **httpx / socksio**：`httpx` 是 Python 的异步 HTTP 客户端，原生支持 HTTP/1.1、HTTP/2 与代理；使用 SOCKS 代理时需额外的 `socksio` 包提供 SOCKS 协议实现，否则抛 `ImportError`。
- **`all_proxy` 与子 shell**：`~/.zshenv` 对非登录、非交互 shell 也会执行，因此像 `hf` 这种由 CI / 脚本拉起的子进程同样继承该代理变量，容易在非交互场景触发意料外的网络路径。
- **`--system-site-packages` venv**：创建 venv 时复用系统已装包，但 homebrew 用 `--without-pip` 建 hf venv 时并未把 `socksio` 纳入，故需显式 `--target` 装到 venv 私有目录，避免污染系统 Python。
