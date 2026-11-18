---
title: "GitLab 新建私有项目发二进制包：Runner 未分配导致 Job 永久 pending，以及 Generic Package 上传缺 JOB-TOKEN 头"
date: 2026-11-18T18:16:00+0800
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "GitLab", "GitLabCI", "GitLabRunner", "PackageRegistry", "CocoaPods", "CI/CD"]
---

## 现象

新建一个私有项目，把预编译动态库按 vendored-binary pod 方式发到私有 Specs。两处卡住：

1. 打 tag 触发的发布流水线，job 状态一直是 `pending`，runner 一栏始终为空，几小时不被接取——既不是失败也不是排队，像被遗忘。
2. 流水线真正跑起来后，framework 包上传返回 401/403，但同一脚本里 `dSYM` 上传到另一对象仓却成功。

## 已验证成因

### 1. 新项目默认没有分配给带对应 tag 的 instance runner

本实例的 macOS instance runner（tag `macos`）是**按项目显式分配**的，不是自动对所有项目可用。用 `GET /runners/<id>` 看它的 `projects` 列表，新建项目不在其中；job 要 `macos` tag，又没有别的 runner 认领，于是永久 pending。

判别要点：`GET /projects/<id>/jobs/<job>` 的 `runner` 为 null、`queued_at`/`started_at` 都为空、`status=pending` 长时间不变，基本可定。

### 2. Generic Package 的 PUT 上传必须带 `JOB-TOKEN` 头

GitLab Generic Package Registry 用 `curl --upload-file` PUT 时，匿名或只用普通凭据会被拒。CI 里正确方式是带 `JOB-TOKEN: $CI_JOB_TOKEN` 头。另一个对象仓（Nexus raw）走的是 HTTP Basic `-u user:pass`，所以同一脚本里一个成功一个失败——不是权限问题，是两套鉴权机制。

（相关但不同的一个坑：包上传成功后，pod 的 `source.http` 对 CocoaPods 匿名下载返回 401，需要开 Package Registry 匿名读。这在本笔记库另有文章已覆盖，此处不重复。）

## 有效恢复

### 1. 从**项目侧**把 runner 分配给新项目

```
POST /projects/<id>/runner   # 参数 runner_id=<instance runner id>
```

```
glab api -X POST "projects/<id>/runner" --field runner_id=<runner_id>
```

注意方向：要在项目端点加 runner，**不要**在 runner 端点加项目——`POST /runners/<id> -F project_ids=<id>` 在本实例返回 404。分配后 `GET /projects/<id>/runners` 应能看到该 runner，`runner` 的 projects 列表应包含新项目，job 随即被接取。

### 2. PUT 上传带 JOB-TOKEN

```
status=$(curl -sS -o /dev/null -w '%{http_code}' \
  --header "JOB-TOKEN: ${CI_JOB_TOKEN}" \
  --upload-file "$file" "$generic_package_url")
accept 200|201|204
```

## 边界

- runner 分配是**实例级共享基础设施改动**，只给新项目加分配、不动 runner 本身或其它项目的分配；不要为了跑通去改 runner tag 或暂停/启用 runner。
- `CI_JOB_TOKEN` 只在当前 job 有效，写入最终 podspec 后长期无法访问——podspec 的下载地址必须用批量可匿名读的机制，不能指向需要 job token 的地址。
- protected CI 变量（如对象仓凭据）只在**受保护分支/tag** 的流水线注入；若发布靠 tag 触发，要给项目配受保护 tag 规则（如通配 `*`），否则 tag 流水线拿不到凭据。
- 验证上传是否落地，不要只看 HTTP 201；要做一次**匿名回读**确认下载 URL 真的可被使用者访问。

## 证据

- 新项目加 runner 分配前：`GET /projects/<id>/runners` 无 macos runner，job `runner=null`、`status=pending`；分配后同一 API 列出该 runner，job 被接取并在该 runner 上 success。
- 两种上传对比：Generic Package PUT 不带 `JOB-TOKEN` → 401/403；带 `JOB-TOKEN` → 201；Nexus raw 用 `-u user:pass` → 201。
- 端到端验证：发布 job 日志显示 framework PUT 201、dSYM PUT 201、spec 渲染完成，两个下载 URL 匿名 200；`pod repo update` 后 `pod spec cat` 解析到新版本，真实下载解压得到完整 framework（Mach-O + Headers + modulemap）。
