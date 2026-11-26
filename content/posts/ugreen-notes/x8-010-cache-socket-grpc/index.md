---
title: "x8 0.1.0 前台代理的 socket 文件名与握手验证"
date: 2026-11-25T21:31:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD"]
---

### 现象

给 x8 0.1.0 的 macOS 发布二进制传入私有目录下的短 socket 名 `s`。配置校验通过，前台服务进程持续运行，客户端连接指定路径得到 curl 退出码 7。

### 已验证成因

对照该版本服务输出的 `COMPILATION_CACHE_REMOTE_SERVICE_PATH` 和实际文件，代理把监听点建在指定目录里的 `cache.sock`。同目录的 `events.sock` 提供 NDJSON 事件。另一个容易误判的信号是 `x8 doctor` 的 protocol 检查，它会创建自己的测试代理。

### 有效恢复

为每次作业创建短、权限为 0700 的私有目录，把配置、前台服务参数和 Xcode 的远端服务设置统一指向该目录的 `cache.sock`。使用 HTTP/2 over Unix socket 对这个运行实例调用 `KeyValueDB/GetValue`，以随机不存在的键取得 `KEY_NOT_FOUND` 后再启用构建。握手完成后订阅事件，使预检流量排除在编译计数外。

### 边界与证据

测量使用 Xcode 27.2、x8 0.1.0 发布包和本机回环测试存储。换用实际监听路径后收到了 HTTP/2 200、gRPC status 0 和包含未命中枚举值的响应。无签名小工程在相同输入、清空本机缓存后重新构建，观察到 4 次 action 命中、10 次对象读取。凭据仅使用测试数据。生产对象存储的证书、权限、命中率和签名包耗时需要独立测量。

本机仿真存储还需按 S3 对象路径索引。该客户端对同一对象的 PUT 和 GET 会附上不同的 `x-id` 查询参数，把整个请求目标当作对象键会造成假 miss。

### 从 events.sock 判断只读构建里的写入错误

在配置 `s3.read=api`、`s3.write=none` 的构建机上，Xcode 仍会请求保存本地新编译的对象。x8 的 `ConsumerOnlyCASStore.save` 在本机直接抛出 `CacheRoleError.writeNotAllowed`，CAS 服务将这次 RPC 记作 `cas.save/remoteError`。构建日志里相应的错误是 `This invocation's cache role does not permit writing to the cache.`。这种拒绝发生在访问 S3 之前。

一次完整 App 签名构建中，3,004 次这样的保存请求合计传输了 0 字节，第 95 百分位耗时约 3 毫秒。同一作业有 4,287 次 `cas.load/hit`，第 95 百分位约 118 毫秒。两个计数均与作业制品一致。诊断时将角色、RPC、结果和日志里的具体错误对应起来。将所有 `remoteError` 合计为 S3 失败会把本机拒写也计入故障。

同一个 `events.sock` 支持多个独立订阅者。按事件里的 `timestamp`、`rpc`、`outcome`、`latencyMs` 和 `bytes` 统计，就能在运行中的作业旁观测延迟，无需记录缓存键或认证信息。订阅缓冲区满时会丢弃旧事件，精确计数需与作业自身的采样核对。RPC 耗时包含代理内的处理时间，要进一步拆出反向代理与存储耗时，还需服务端记录。

### 从写端超时追到 SeaweedFS 的 PUT

一次写端构建完成了签名。x8 在同一轮中既成功保存了对象，也返回了 `HTTPClientError.deadlineExceeded`。该版本的 x8 先取得 S3 并发许可，再调用 Soto。Soto 为 HTTP 请求设置的默认时限是 20 秒。AsyncHTTPClient 在连接池排队、正在发送请求体或等待响应头时都可能报这个错误。单凭客户端错误无法判断是哪一步耗尽了时间。

按同一时间窗读取 SeaweedFS 4.54 的 Docker 日志，最初只搜索超时关键字和 HTTP 状态码，漏掉了上传错误。按 glog 的源码文件和行号重新统计，发现 `weed/operation/upload_chunked.go:283` 记录了 552 次错误，`weed/s3api/s3api_object_handlers_put.go:779` 也记录了 552 次。前者返回错误后，调用它的 PUT 处理函数会再次记录同一个错误。按内层记录计数可避免重复。将这些记录与客户端 RPC 计数关联时，还需要请求级证据。

保留内层错误最有助于区分方向。`read chunk at offset … (got … bytes)` 描述 SeaweedFS 读取入站请求体时的位置和已读字节数。`upload chunk: …` 描述它向存储卷上传分块时遇到的错误。`assign volume: …` 描述分配存储卷时遇到的错误。上游测试 `TestMapChunkedUploadErrorToS3Error` 专门覆盖了入站读取与卷上传均可返回 `unexpected EOF` 的情况。采样时可只输出阶段、错误类别和字节数。
