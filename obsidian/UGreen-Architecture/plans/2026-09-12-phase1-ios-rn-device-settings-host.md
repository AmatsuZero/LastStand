# Phase 1 — iOS RN DeviceSettings Host Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `ugreenhome` 的 `develop` 上落地可打开的 RN `DeviceSettings` 宿主（对齐 Android 已有能力），并遵守宪法：JS 不直连 IoT SDK，设备读写只经 Bridge → Native 设备域。

**Architecture:** 以远程分支 `origin/feature/wangming/UgreenHome_ReactNative` 中已存在的 `iot/iot/Modules/ReactNative/**` 与 `LocalPods/UHReactNativeRuntime` 为源，按切片合入 `develop`；入口使用 `UHDeviceSettingsReactNativeViewController` + 内置 `DeviceSettings.ios.bundle`；Bridge 方法集必须通过 Plan 01 的 `npm run validate:bridges`。

**Tech Stack:** React Native 0.82.x runtime pod、ObjC++/Swift Bridge、UIKit 容器、既有 `UGDeviceManager`（阶段一设备 Owner）。

## Global Constraints

- 先完成 Plan 01（`validate:bridges` 绿；owner/god 文档已存在）
- 宪法：RN 禁止直连 RTCX/物模型/配网 SDK
- 阶段一设备域 Owner 仍为 Native；Bridge 只适配，不新建第二套设备缓存
- 不扩大 `UGDeviceManager` 职责面（GOD-iOS-001）：缺能力就加窄服务，不往 Manager 塞 RN 专用 API
- 双端方法名以 `ugreenhome-rn/contracts` + `bridge-capability-catalog.json` 为准
- 源分支：`origin/feature/wangming/UgreenHome_ReactNative`（合入前先 `git fetch`）
- Obsidian / Spec 变更双仓提交
- 发布/验收须断言运行时存在真实 `NativeModules.DeviceSettingsBridge`（或 Task 0 reconcile 后的模块名）；JS mock/fallback 不得静默满足验收

---

### Task 1: 合入前基线检查

**Files:**
- Read-only: Plan 01 产出；源分支树

**Interfaces:**
- Consumes: `npm run validate:bridges` 必须已绿
- Produces: 书面基线（本 Task 步骤输出），决定是否继续

- [ ] **Step 1: 确认 Plan 01 验收**

```bash
cd /Users/daubert/UGreen/ugreenhome-rn && npm run validate:bridges
test -f /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/owner-registry.md
test -f /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/god-surface-inventory.md
```

Expected: 退出码 0。

- [ ] **Step 2: Fetch 并列出将合入的宿主路径**

```bash
cd /Users/daubert/UGreen/ugreenhome
git fetch origin feature/wangming/UgreenHome_ReactNative
git ls-tree -r --name-only origin/feature/wangming/UgreenHome_ReactNative \
  | rg '^iot/iot/Modules/ReactNative/|^LocalPods/UHReactNativeRuntime/|^iot/iot/Resources/RNBundle/' \
  | wc -l
```

Expected: 行数 ≫ 0。

- [ ] **Step 3: 确认 develop 上尚无完整 ReactNative 模块（避免重复）**

```bash
cd /Users/daubert/UGreen/ugreenhome
test ! -d iot/iot/Modules/ReactNative -o -z "$(ls -A iot/iot/Modules/ReactNative 2>/dev/null)" \
  && echo 'RN_MODULE_ABSENT_OR_EMPTY' || echo 'RN_MODULE_PRESENT'
```

Expected: 若为 `RN_MODULE_PRESENT`，改为 rebase/差异合入策略，不得直接覆盖未审查改动。

---

### Task 2: 检出 RN 运行时 Pod 与模块源（工作树隔离）

**Files:**
- Bring from branch onto working tree:
  - `LocalPods/UHReactNativeRuntime/**`
  - `iot/iot/Modules/ReactNative/**`
  - `iot/iot/Resources/RNBundle/DeviceSettings.ios.bundle/**`（若 develop 已有则 diff）
  - `iot/UgreenHomeTests/DeviceSettings*.swift`（若存在）

**Interfaces:**
- Consumes: Task 1 基线
- Produces: 工作区出现上述路径，尚未改业务入口

- [ ] **Step 1: 用 git checkout 按路径取出（不要整分支切换丢掉本地 develop 提交）**

```bash
cd /Users/daubert/UGreen/ugreenhome
git checkout origin/feature/wangming/UgreenHome_ReactNative -- \
  LocalPods/UHReactNativeRuntime \
  iot/iot/Modules/ReactNative \
  iot/UgreenHomeTests/DeviceSettingsNavigationSwipePolicyTests.swift \
  iot/UgreenHomeTests/DeviceSettingsSKUCapabilityPolicyTests.swift
```

若 bundle 在 develop 已存在：

```bash
git checkout origin/feature/wangming/UgreenHome_ReactNative -- \
  iot/iot/Resources/RNBundle/DeviceSettings.ios.bundle
```

- [ ] **Step 2: 核对关键入口文件存在**

```bash
test -f iot/iot/Modules/ReactNative/DeviceSettings/Container/UHDeviceSettingsReactNativeViewController.swift
test -f iot/iot/Modules/ReactNative/DeviceSettings/Bridge/DeviceSettingsBridge.mm
test -f iot/iot/Modules/ReactNative/Common/Core/UHReactNativeHost.swift
echo RN_SOURCES_OK
```

Expected: `RN_SOURCES_OK`

- [ ] **Step 3: Commit 源码落地（尚不接线）**

```bash
cd /Users/daubert/UGreen/ugreenhome
git add LocalPods/UHReactNativeRuntime iot/iot/Modules/ReactNative \
  iot/UgreenHomeTests/DeviceSettingsNavigationSwipePolicyTests.swift \
  iot/UgreenHomeTests/DeviceSettingsSKUCapabilityPolicyTests.swift \
  iot/iot/Resources/RNBundle/DeviceSettings.ios.bundle
git commit -m "$(cat <<'EOF'
chore: import RN runtime pod and DeviceSettings host sources

Land React Native host sources from the feature branch without wiring app entry yet.
EOF
)"
```

---

### Task 3: Podfile / 工程接线

**Files:**
- Modify: `/Users/daubert/UGreen/ugreenhome/iot/Podfile`（对照源分支增加 `UHReactNativeRuntime`）
- Modify: Xcode project membership（将 `Modules/ReactNative` 编进 `UgreenHome` target）——以源分支 `project.pbxproj` 差异为准，优先 `git checkout` 相关片段或手工把新组加入 App target
- Possibly: `iot/Podfile.lock` via `pod install`

**Interfaces:**
- Consumes: Task 2 源码
- Produces: `pod install` 成功；`import` / 链接 RN runtime 可编译

- [ ] **Step 1: 对比源分支 Podfile 中 RN 相关行**

```bash
cd /Users/daubert/UGreen/ugreenhome
git show origin/feature/wangming/UgreenHome_ReactNative:iot/Podfile | rg -n 'ReactNative|UHReactNative|hermes|Fabric' 
rg -n 'ReactNative|UHReactNative' iot/Podfile || true
```

- [ ] **Step 2: 将源分支 Podfile 中 RN 依赖块合并进当前 Podfile**

最小集合应包含本地 pod（路径以源分支为准，通常类似）：

```ruby
pod 'UHReactNativeRuntime', :path => '../LocalPods/UHReactNativeRuntime'
```

完整 flags（New Arch / Hermes）以源分支 `Podfile` + `gradle.properties` 对齐说明为准，**不要臆造版本号**——从源分支拷贝已验证片段。

- [ ] **Step 3: 安装 Pods**

```bash
cd /Users/daubert/UGreen/ugreenhome/iot
pod install
```

Expected: 成功结束；`Pods/UHReactNativeRuntime` 或 xcframework 可解析。

- [ ] **Step 4: 确保 Xcode 目标包含 ReactNative 源文件**

若 `pbxproj` 未包含新文件导致编译找不到符号，从源分支检出 pbxproj 中 ReactNative 相关差异，或在 Xcode 中把 `Modules/ReactNative` 加入 `UgreenHome` target（保持与源分支相同的成员关系）。

```bash
rg -n 'UHDeviceSettingsReactNativeViewController|DeviceSettingsBridge' \
  iot/UgreenHome.xcodeproj/project.pbxproj | head
```

Expected: 有命中。

- [ ] **Step 5: Commit**

```bash
cd /Users/daubert/UGreen/ugreenhome
git add iot/Podfile iot/Podfile.lock iot/UgreenHome.xcodeproj/project.pbxproj
git commit -m "$(cat <<'EOF'
chore: wire UHReactNativeRuntime into iOS app target

EOF
)"
```

---

### Task 4: 应用入口与反上帝约束下的打开路径

**Files:**
- Modify: IPC 设置入口（源分支中打开 RN 的调用点——用下列命令定位后改 develop 对应文件）
- Prefer narrow factory，例如已有 `UHDeviceSettingsReactNativeViewController`，避免把 RN 启动逻辑塞进 `UGDeviceManager`

**Interfaces:**
- Consumes: `UHDeviceSettingsReactNativeViewController` 公开初始化/工厂方法（以源文件实际签名为准）
- Produces: 从原生设置页可 push RN 容器；`closePage` 可 pop

- [ ] **Step 1: 在源分支定位入口调用**

```bash
cd /Users/daubert/UGreen/ugreenhome
git grep -n 'UHDeviceSettingsReactNativeViewController' \
  origin/feature/wangming/UgreenHome_ReactNative -- 'iot/iot/**/*.swift' | head -40
```

- [ ] **Step 2: 把同等调用合入 develop 对应设置入口**

模式（伪代码，**以源分支真实 API 替换**）：

```swift
let controller = UHDeviceSettingsReactNativeViewController(/* deviceId / context from source */)
navigationController?.pushViewController(controller, animated: true)
```

**禁止：** 在 `UGDeviceManager` 新增 `openRNSettings()` 一类大杂烩 API（违反 GOD-iOS-001）。若需共享上下文，新建 `iot/iot/Modules/ReactNative/DeviceSettings/Service/` 下窄类型。

- [ ] **Step 3: 确认 Navigation Bridge `closePage` 只操作 Host 导航栈**

阅读并保持：

`iot/iot/Modules/ReactNative/DeviceSettings/Bridge/NavigationRNBridge.mm`  
及对应 Swift service —— 应 pop/dismiss Host VC，而不是让 JS 持有 UINavigationController。

- [ ] **Step 4: Commit**

```bash
git add iot/iot/Modules/IPC iot/iot/Modules/ReactNative
git commit -m "$(cat <<'EOF'
feat: open DeviceSettings RN container from native settings entry

EOF
)"
```

---

### Task 5: Bridge 宪法合规检查（无 IoT 进 JS）

**Files:**
- Test: 新增 `/Users/daubert/UGreen/ugreenhome-rn/scripts/assert-no-iot-imports.js`（可选但推荐）
- Read: DeviceSettings Bridge Swift/ObjC 实现，确认写路径落在 Native 设备域

**Interfaces:**
- Consumes: Plan 01 catalog
- Produces: `npm run validate:bridges` + 无 IoT import 扫描绿

- [ ] **Step 1: 跑 Bridge 目录校验**

```bash
cd /Users/daubert/UGreen/ugreenhome-rn && npm run validate:bridges
```

Expected: 退出码 0（RN 内部锁步）；另须手工或集成测试确认 `NativeModules.DeviceSettingsBridge`（或 reconcile 名）在宿主运行时存在，mock 回退不算通过。

- [ ] **Step 2: 扫描 RN JS 不得出现 IoT/RTCX 关键字 import**

```bash
cd /Users/daubert/UGreen/ugreenhome-rn
rg -n "RTCX|thing-model|ThingModel|UGDeviceSetup|airrtc" src/modules --glob '*.js' || echo 'NO_IOT_HITS'
```

Expected: `NO_IOT_HITS`（或仅注释；若有代码命中必须删除）。

- [ ] **Step 3: 抽查 DeviceSettingsBridge 写路径不新建设备缓存**

```bash
cd /Users/daubert/UGreen/ugreenhome
rg -n "UGDeviceManager|property|dispatch" \
  iot/iot/Modules/ReactNative/DeviceSettings/Service/*.swift | head -40
```

确认是调用既有设备域，而不是平行 `Dictionary` 全局缓存。

- [ ] **Step 4: 若新增了 assert 脚本则提交到 ugreenhome-rn**

---

### Task 6: 编译与手工验收

**Files:**
- None new（验证）

- [ ] **Step 1: 编译 App（按团队常用配置，示例 Debug / 真机或模拟器）**

```bash
cd /Users/daubert/UGreen/ugreenhome/iot
xcodebuild -workspace UgreenHome.xcworkspace \
  -scheme UgreenHome \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

若 scheme/destination 名称不同，用 `xcodebuild -list` 替换。Expected: `BUILD SUCCEEDED`。

- [ ] **Step 2: 跑已合入的单测**

```bash
cd /Users/daubert/UGreen/ugreenhome/iot
xcodebuild -workspace UgreenHome.xcworkspace \
  -scheme UgreenHome \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:UgreenHomeTests/DeviceSettingsNavigationSwipePolicyTests \
  test
```

Expected: TEST SUCCEEDED（若需签名/模拟器名调整，记录实际命令于 PR）。

- [ ] **Step 3: 手工验收清单**

1. 登录后进入 IPC 设置，能打开 RN DeviceSettings 根页  
2. 改一项设置能反映到设备（经 Bridge → Native）  
3. `closePage` 回到原生  
4. 杀进程重进，RN 仍走内置 bundle（本阶段不启远端热更）

- [ ] **Step 4: 更新 Obsidian 进度短记并双仓提交文档（若有）**

```markdown
# Plan 02 status
- iOS DeviceSettings RN host landed on develop
- validate:bridges green
- no IoT imports in RN JS
```

路径：`/Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/phase1/plan02-ios-rn-status.md`

---

## Self-Review (Plan Author)

1. **Spec coverage:** §5.1 iOS RN 宿主 → Tasks 2–6；Bridge 红线 → Task 5；反上帝 → Task 4 禁止扩 `UGDeviceManager`。H5/core-net/device-biz 不在本计划。  
2. **Placeholders:** 入口签名要求以源分支实参为准（已用定位命令约束，避免臆造 API）。  
3. **Depends on:** Plan 01 完成。
