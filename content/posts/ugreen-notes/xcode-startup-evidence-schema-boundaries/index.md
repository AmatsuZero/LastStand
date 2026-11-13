---
title: "Xcode 启动采集：测试配置名与设备版本字段不能按直觉解析"
date: 2026-11-12T20:04:44+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "CI/CD", "踩坑", "故障"]
---

## 现象（symptom）

编排真机启动采集时，只用手写 JSON 测试会漏掉工具真实输出的结构差异。附件中的 `configurationName` 看起来像 Debug、Release 等编译配置，设备的 `osVersionNumber` 看起来像版本字符串；两项假设都可能使有效证据被误拒绝，或让报告缺少分组身份。

## 已验证成因（verified cause）

本机实际导出的 xcresult attachments manifest 使用 schema 0.5.0，`configurationName` 为 `Test Scheme Action`。同环境生成的 v2 xctestrun 的测试配置有独立 `Name`，目标又有 App 路径与环境字段。因此，不能仅凭附件配置名证明 App 使用了某个优化级别；必须另查实际 resolved build settings 和构建产物身份。

本机 CoreDevice JSON 的 `properties.software.osVersionNumber` 则是对象，含 `components`、`originalComponentsCount` 和 `stringValue`。若把整个对象交给只接受字符串的公开报告白名单，OS 版本会被丢弃，跨系统版本的基线身份也会不完整。

2026-11-13 的真实 UI 附件还显示：`suggestedHumanReadableName` 会将逻辑文件名变为 `<stem>_0_<UUID>.<extension>`，实际导出文件名另有 UUID。仅用原始逻辑文件名做字符串相等检查，会遗漏本来有效的附件。

## 有效恢复（effective recovery）

- 先读取当前安装版本的 `xcrun xcresulttool export attachments --help` 和 `--schema`，再检查一次真实导出；只按指定测试、附件名、设备和样本身份提取。原始 manifest 可含设备名和标识，不直接放进公开报告。
- 单样本 xctestrun 明确冻结所选配置的 `Name`、唯一 UI target、App 路径和测试选择。附件名校验与构建配置校验分别进行。
- 从 `xcodebuild -showBuildSettings -json` 检查 Swift/Clang 优化、内部测试编译条件与 KMP 构建类型，并核对 App、fixture、xctestrun 等内容身份。附件配置名不能替代这些检查。
- 对版本对象提取 `stringValue`，同时兼容已验证的字符串形式。保留从真实输出抽取并脱敏的最小结构，添加回归测试。
- 附件名只接受原始逻辑名或已验证的完整 `stem + 序号 + UUID + 扩展名` 形式；拒绝相似前缀、无效 UUID 和双重扩展名。两种名字同时出现仍视为重复，不能任选一个。名称归一化不放宽测试、设备、配置、sample 或实际文件路径校验。

## 边界（boundaries）

字段结构和取值都与 Xcode 版本有关。以上是当前本机输出的观察结果，不是所有版本的永久 schema；遇到新结构应显式停止或标记缺失，不能随便 `str(object)` 后混入基线。

命令执行成功、附件导出成功、功能用例通过，都不等于已采到有效启动时长。没有单次启动与安装状态证据时，系统首帧、pre-main 和业务阶段数值保持 unavailable，不用总用例耗时补齐。

## 证据（evidence）

2026-11-12 对已存在的真机功能结果包进行只读附件导出，确认 `Test Scheme Action` 的真实取值；对已有优化构建生成的 v2 xctestrun 进行只读解析与临时冻结校验，没有安装或启动 App。

随后对实际 CoreDevice inventory 做只读结构检查，发现版本对象。将该结构放入设备选择回归后，测试先因返回整个对象而失败；改为提取 `stringValue` 后，版本分组值按预期保留。上述证据验证了解析边界，不构成真机 fresh-install 性能采样验收。

2026-11-13 从新的优化构建 UI 失败结果导出 schema 0.5.0 附件，核对逻辑名后缀与导出文件名。新增合法后缀、相似名字及重复项回归，先复现 `missing_attachment`，修复后设备适配器 17 项主机检查通过。该失败用例不计入有效基线。
