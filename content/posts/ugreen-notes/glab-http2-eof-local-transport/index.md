---
title: "glab API 返回 EOF：验证单次 HTTP/1.1 兼容路径"
date: 2026-11-13T10:22:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["GitLab", "CLI", "踩坑", "故障"]
---

## 现象（symptom）

当前 glab 对已配置 GitLab 的只读 API 请求返回 EOF。去掉进程环境中的代理变量后仍失败；同一次任务需要核对 MR 状态和 Runner 是否空闲。

## 已验证成因（verified cause）

尚未定位到具体服务端或中间代理实现，不能把 EOF 判成权限拒绝或服务宕机。已确认的是本机当前 glab 的协议路径差异：相同只读请求默认失败，单次禁用 Go HTTP/2 客户端后成功，能取得实际 MR 状态及 Runner 任务列表。

## 有效恢复（effective recovery）

仅对需要的 glab 进程设置兼容选项，保留认证与 TLS 验证：

```bash
GODEBUG=http2client=0 glab api 'projects/<project-id>/merge_requests/<mr-iid>'
```

先用只读请求验证，再考虑后续已授权操作。检查命令退出码和 JSON 后才读取字段，不把空输出继续交给解析器，也不让失败请求覆盖上一份有效证据。

## 边界（boundaries）

不修改全局网络配置，不关闭证书验证，不输出 token，不把这一兼容路径视为任何 EOF 的通用根因。其他主机、工具版本或网络环境应重新验证。

## 证据（evidence）

2026-11-13，同一只读 MR API 在默认协议、移除代理变量两次均返回 EOF；使用进程级 `GODEBUG=http2client=0` 成功。随后同样配置成功取得 Runner 当前运行任务数为零。该证据只支持本次客户端协议兼容恢复，不支持服务端归因。
