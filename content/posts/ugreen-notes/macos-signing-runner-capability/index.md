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

先用独立能力标签把签名构建临时路由到已验证节点，恢复端到端诊断；这只是临时隔离措施。
要让所有通用 macOS 节点都能构建，需要在用户授权后安全迁移现有签名身份：

- 仅导出选定 Distribution 身份为加密 PKCS12，上传项目 Secure Files；密码单独存 masked CI 变量。
- 下载时验证固定 SHA256；首次导入新的 GitLab 专用钥匙串，与 Jenkins/login 分离。
- 每次构建解锁并保留既有搜索列表；仅首次导入时修改这个新钥匙串的 partition ACL。
- 用用户级文件锁串行首次准备，不在 job 结束锁共享钥匙串；用自动锁定超时控制闲置状态。
- 预检必须显式指定新钥匙串和证书 SHA1，验证真实签名，不能借用 login 身份掩盖初始化失败。
- 两台节点各自通过完整构建后，生产 job 恢复共同标签，不保留单节点限制。

密码可经 `security -i` 的 stdin 传入，避免出现在进程 argv；捕获输出但不转发钥匙串属性。
真实隔离测试发现 `security create-keychain` 的默认文件权限可能不是 `0600`，创建后应立即收紧，
否则下一次严格的安全检查会拒绝它；不要通过放松已有文件检查掩盖这个问题。

预检应先读取 `security find-identity -v -p codesigning` 并限定团队，再复制一个系统
可执行文件到临时目录，执行 `codesign --force --sign <identity> --timestamp=none <probe>`。
复制时不要保留系统 immutable flags：本例 Python `shutil.copy2` 在旧节点的 `chflags`
阶段报 `Operation not permitted`，改为 `copyfile` 并单独设置临时文件权限后签名成功。
探针临时文件结束后删除，不修改原二进制；初始化仅操作新 CI 钥匙串并追加搜索项，保留既有项。

## 边界

- `find-identity` 能列出证书不代表后台会话可以操作私钥，必须验证真实签名。
- 只读枚举返回 0 可能是未安装、未解锁或不可见，要分别验证；本例已确认新节点缺专用钥匙串。
- ASC 只能提供公开证书和 profiles，不能恢复私钥。扩容签名节点需要安全迁移现有身份后重新验收。
- 本机非交互导出选定身份曾返回 `errSecAuthFailed`；系统授权后同一选定身份成功导出。授权失败不能据此断言证书失效，也不能通过放宽原私钥 ACL 绕过。
- Runner 管理接口显示的出口地址不是可直接 SSH 的主机地址；无直连路径时可用临时 MR 执行不泄密的诊断。
- 签名能力标签是调度约束，不是受保护分支或 secret 权限边界。
- 私钥探针和 profile 下载通过不能替代完整 Archive/export、制品传递、App 运行或分发验收。

## 证据

只读诊断同时覆盖两个 Runner；后续探针确认旧节点私钥可用、新节点无签名身份。
限定签名节点后，真实 MR 构建通过私钥预检，下载并安装主 App 与扩展的有效 profile，进入 Archive；
另一节点并行完成 131 项单测、0 failures。本轮本地 394 项构建工具测试和 GitLab CI Lint 通过。
后续真实流水线已通过 Archive、签名 IPA export、制品仓库上传、另一 Runner 的下载及摘要校验、包体积分析、报告上传和 MR 评论更新。
集成分支签名基线与下一笔 MR 增量比较仍需在用户合入后单独验收。

本文省略内部主机、账号、网络地址、证书指纹和所有凭据。

## 并发验收补充

新节点自动导入和私钥探针通过后，首次完整验收仍在 Pods 安装阶段失败。
日志证明两个同时运行的 job 使用相同 checkout 目录；只读进程和 launchd 清单又确认：
原生 Runner 服务与 Homebrew Runner 服务同时运行，读取同一配置。
两个独立进程各自分配相同并发槽位，导致 checkout 和 Pods 互相覆盖。
这是 Runner 服务重复启动问题，不能归因于签名或直接重试 Pods。
恢复时只停用核实重复的 Homebrew 服务，保留带 `SessionCreate` 的原生服务，
先排空节点并确认目标服务没有其他任务，保留服务文件备份，再重新验收并发目录隔离。
本例恢复后只剩一个 Runner 服务，并发只读任务分别取得两个不同目录，后续两节点单测均成功。

## Archive 与 export 的签名边界

迁移 Distribution 私钥且成功下载 App Store profiles 后，新节点 Archive 仍可能报找不到
`iOS App Development provisioning profiles`。本例工程配置保留 `Apple Development`，
旧节点恰好有开发身份和 profile，所以旧节点成功不能证明 Distribution-only 节点可用。
`export_options.provisioningProfiles` 仅控制导出，不会反向配置 Archive。
CI 应在当前 checkout 中，按 App 与扩展分别应用 Distribution 身份和各自的 App Store profile，
限定选中的 build configuration，结束后恢复工程原字节；不要全局传一个 profile 覆盖所有目标或 Pods。
真实工程副本回归验证 App/extension 配置各自匹配，Archive 异常后原字节恢复。

## 最终签名验收

自动准备的新专用钥匙串在两台 Runner 都通过真实私钥探针；随后两台分别完成
Archive、App Store 签名 IPA export、IPA/LinkMap/manifest 上传。
两条流水线各自报告 131 项单测成功、0 failed/error/skipped。
生产签名 job 已恢复通用 macOS/iOS 标签，两台 Runner 的临时验证标签均移除。
未创建或吊销 Apple 证书，未修改旧登录/Jenkins 钥匙串 ACL；TestFlight 开关保持关闭。
