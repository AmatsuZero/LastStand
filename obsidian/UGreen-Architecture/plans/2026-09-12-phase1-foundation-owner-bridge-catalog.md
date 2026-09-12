# Phase 1 Foundation — Owner SSOT / Anti-God Inventory / Bridge Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把宪法阶段一的「Owner 表、反上帝边界、Bridge 能力目录」落成可审查文档 + 一条可自动跑绿的契约校验，作为后续 RN Host / Root 清理的硬前置。

**Architecture:** 不改业务运行时行为。在 `ugreenhome` 增加阶段一 SSOT 文档；在 `ugreenhome-rn` 增加 Bridge 方法目录与 Node 校验脚本，确保 `bridge.schema.json` 与 JS facade 方法名一致。Obsidian 同步上帝点清单。

**Tech Stack:** Markdown SSOT、JSON catalog、Node.js（≥20）脚本；仓库路径见 Global Constraints。

## Global Constraints

- Spec SSOT: `/Users/daubert/UGreen/ugreenhome/docs/superpowers/specs/2026-09-12-ugreen-home-hybrid-runtime-constitution-design.md`（§3 Owner、§4 Bridge、§5.0 反上帝）
- iOS host repo: `/Users/daubert/UGreen/ugreenhome`
- RN repo: `/Users/daubert/UGreen/ugreenhome-rn`
- Obsidian vault: `/Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/`
- 动态面禁止直连 IoT SDK；本计划不引入新原生模块
- 文档变更必须双仓提交（ugreenhome + LastStand）
- YAGNI：本计划不合并 RN feature 分支、不改 Composition Root 代码

---

### Task 1: Owner 与 Runtime 登记 SSOT 文档

**Files:**
- Create: `/Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/owner-registry.md`
- Create: `/Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/phase1/owner-registry.md`（内容与上一文件相同）

**Interfaces:**
- Consumes: Spec §3.1 / §3.2 表格
- Produces: 阶段一 Owner 权威表，供 Plan 02+ 引用路径 `docs/superpowers/phase1/owner-registry.md`

- [ ] **Step 1: 创建目录并写入 Owner 登记文件**

```bash
mkdir -p /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1
mkdir -p /Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/phase1
```

写入 `owner-registry.md`（两处内容一致）：

```markdown
# Phase 1 Owner Registry

> SSOT for stage-1 writable owners. Target-state owners remain in the constitution Spec.

| State | Stage-1 writable owner | Consumers |
|-------|------------------------|-----------|
| Session / Token | KMP `feature-auth` via `UGKmpAuthCoordinator` | Native / future RN Account Bridge |
| Env / country node | KMP `domain-env` | Host config adapters |
| Theme / KV subset | KMP `core-kv` + Host adapter | Native UI |
| Device list / online / caps | Native (`UGDeviceManager` / Android domain-repo) | RN Device Bridge read/write → Native |
| OTA session machine | KMP `feature-ota` | CMP / Host entry |
| RN page UI state | RN module only | — |
| H5 page UI state | H5 only | — |
| Navigation stack | Native UINavigationController / Android Nav | RouteIntent only from other runtimes |

## Red lines

1. No second writable cache for the same fact.
2. RN/H5 must not link IoT SDKs.
3. Logout reset order: RN cache → H5 → Native device domain → KMP auth gate.
```

- [ ] **Step 2: 人工核对关键句存在**

```bash
rg -n "UGDeviceManager|feature-auth|RouteIntent" \
  /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/owner-registry.md
```

Expected: 至少各命中 1 次。

- [ ] **Step 3: Commit（ugreenhome）**

```bash
cd /Users/daubert/UGreen/ugreenhome
git add docs/superpowers/phase1/owner-registry.md
git commit -m "$(cat <<'EOF'
docs: add phase-1 owner registry SSOT

EOF
)"
```

- [ ] **Step 4: Commit（LastStand Obsidian）**

```bash
cd /Users/daubert/Github/LastStand
git add obsidian/UGreen-Architecture/phase1/owner-registry.md
git commit -m "$(cat <<'EOF'
docs: mirror phase-1 owner registry in Obsidian vault

EOF
)"
```

---

### Task 2: 上帝点 / 粗模块清单（逻辑组件化前置）

**Files:**
- Create: `/Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/god-surface-inventory.md`
- Create: `/Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/phase1/god-surface-inventory.md`

**Interfaces:**
- Consumes: Spec §5.0；已知路径 `iot/iot/Common/Core/Manager/UGDeviceManager.swift`、`UGKmpAuthCoordinator.swift`
- Produces: 迁移清单 ID，后续宿主组件化 / Plan 04 引用

- [ ] **Step 1: 写入清单**

```markdown
# Phase 1 God-Surface Inventory

> Logical modularity only. No Pod/SPM split in phase 1.
> Rule: changes may shrink these surfaces (extract Port/Adapter) but must not add unrelated responsibilities.

| ID | Surface | Path / module | Risk | Phase-1 rule |
|----|---------|---------------|------|--------------|
| GOD-iOS-001 | Device manager | `iot/iot/Common/Core/Manager/UGDeviceManager.swift` | Device + cache + callers hub | No new unrelated APIs; prefer Bridge → narrow service |
| GOD-iOS-002 | Auth coordinator singleton | `iot/iot/Common/Login/UGKmpAuthCoordinator.swift` | Session bridge + install side effects | Keep as auth boundary; do not attach device IoT |
| GOD-iOS-003 | User manager | `iot/iot/Common/Core/Manager/UGUserManager.swift` | Profile + logout fan-out | Logout must call KMP auth; no device writes |
| GOD-iOS-004 | AppDelegate launch | `iot/iot/Modules/Lanuch/AppDelegate.swift` | Startup coupling | Only call Composition/bootstrap; no feature logic |
| GOD-AND-001 | Session locator | Android `SessionRepositoryProvider` (care domain) | Hidden DI | No new static providers; prefer Root injection |
| GOD-AND-002 | `:app` / `:base` sink | `ugreen-home/app`, `ugreen-home/base` | Reverse dependency magnet | New shared code goes to explicit modules |

## Allowed change types

- Extract protocol / Port
- Add Adapter wrapping existing singleton
- Move method to capability folder (`device` / `bridge` / `account`)

## Forbidden change types

- New global writable singleton
- Bypass Bridge to RTCX / thing-model from RN/H5
- Second writable device cache
```

- [ ] **Step 2: 确认磁盘上上帝点文件仍存在（防路径写错）**

```bash
test -f /Users/daubert/UGreen/ugreenhome/iot/iot/Common/Core/Manager/UGDeviceManager.swift
test -f /Users/daubert/UGreen/ugreenhome/iot/iot/Common/Login/UGKmpAuthCoordinator.swift
test -f /Users/daubert/UGreen/ugreenhome/iot/iot/Common/Core/Manager/UGUserManager.swift
echo OK
```

Expected: `OK`

- [ ] **Step 3: 双仓提交**

```bash
cd /Users/daubert/UGreen/ugreenhome
git add docs/superpowers/phase1/god-surface-inventory.md
git commit -m "$(cat <<'EOF'
docs: inventory phase-1 god surfaces for logical modularity

EOF
)"

cd /Users/daubert/Github/LastStand
cp /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/god-surface-inventory.md \
  obsidian/UGreen-Architecture/phase1/god-surface-inventory.md
git add obsidian/UGreen-Architecture/phase1/god-surface-inventory.md
git commit -m "$(cat <<'EOF'
docs: mirror god-surface inventory in Obsidian vault

EOF
)"
```

---

### Task 3: Bridge 能力目录 JSON（失败先行）

**Files:**
- Create: `/Users/daubert/UGreen/ugreenhome-rn/contracts/bridge-capability-catalog.json`
- Create: `/Users/daubert/UGreen/ugreenhome-rn/scripts/validate-bridge-catalog.js`
- Modify: `/Users/daubert/UGreen/ugreenhome-rn/package.json`（增加 script）

**Interfaces:**
- Consumes: `contracts/device-settings/bridge.schema.json` examples[0].methods[].name；`src/modules/device-settings/bridge/DeviceSettingsNative.js` export 函数名
- Produces: `npm run validate:bridges` 退出码 0/1；目录字段 `capabilities[].methods[]`

- [ ] **Step 1: 写入故意缺方法的 catalog（用于看校验失败）**

`contracts/bridge-capability-catalog.json`:

```json
{
  "version": 1,
  "capabilities": [
    {
      "id": "device-settings",
      "runtime": "rn",
      "nativeModuleName": "DeviceSettingsBridge",
      "componentName": "DeviceSettings",
      "schemaPath": "contracts/device-settings/bridge.schema.json",
      "jsFacadePath": "src/modules/device-settings/bridge/DeviceSettingsNative.js",
      "methods": [
        "getDeviceSettingState",
        "dispatchDeviceSettingAction",
        "closePage"
      ],
      "forbidden": [
        "direct IoT SDK linkage from JS",
        "second session owner inside RN"
      ]
    }
  ]
}
```

- [ ] **Step 2: 写入校验脚本**

`scripts/validate-bridge-catalog.js`:

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const catalogPath = path.join(rootDir, 'contracts/bridge-capability-catalog.json');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function schemaMethodNames(schema) {
  const example = schema.examples && schema.examples[0];
  if (!example || !Array.isArray(example.methods)) {
    fail(`${path.relative(rootDir, catalogPath)}: schema examples[0].methods missing`);
  }
  return example.methods.map((m) => m.name).sort();
}

function jsFacadeExports(jsPath) {
  const source = fs.readFileSync(jsPath, 'utf8');
  const names = new Set();
  const re = /export\s+function\s+([A-Za-z0-9_]+)/g;
  let match;
  while ((match = re.exec(source))) {
    names.add(match[1]);
  }
  // hasDeviceSettingsBridge is meta, not a native method
  names.delete('hasDeviceSettingsBridge');
  return [...names].sort();
}

const catalog = readJson(catalogPath);
if (!Array.isArray(catalog.capabilities) || catalog.capabilities.length === 0) {
  fail('catalog.capabilities must be a non-empty array');
}

for (const capability of catalog.capabilities) {
  const schemaFile = path.join(rootDir, capability.schemaPath);
  const jsFile = path.join(rootDir, capability.jsFacadePath);
  if (!fs.existsSync(schemaFile)) {
    fail(`missing schema: ${capability.schemaPath}`);
  }
  if (!fs.existsSync(jsFile)) {
    fail(`missing js facade: ${capability.jsFacadePath}`);
  }

  const fromSchema = schemaMethodNames(readJson(schemaFile));
  const fromCatalog = [...capability.methods].sort();
  const fromJs = jsFacadeExports(jsFile);

  const missingInCatalog = fromSchema.filter((n) => !fromCatalog.includes(n));
  const extraInCatalog = fromCatalog.filter((n) => !fromSchema.includes(n));
  if (missingInCatalog.length || extraInCatalog.length) {
    fail(
      `${capability.id}: catalog methods mismatch schema\n` +
        `  missingInCatalog: ${JSON.stringify(missingInCatalog)}\n` +
        `  extraInCatalog: ${JSON.stringify(extraInCatalog)}`
    );
  }

  const missingInJs = fromCatalog.filter((n) => !fromJs.includes(n));
  const extraInJs = fromJs.filter((n) => !fromCatalog.includes(n));
  if (missingInJs.length || extraInJs.length) {
    fail(
      `${capability.id}: catalog methods mismatch JS facade\n` +
        `  missingInJs: ${JSON.stringify(missingInJs)}\n` +
        `  extraInJs: ${JSON.stringify(extraInJs)}`
    );
  }

  console.log(`OK ${capability.id} methods=${fromCatalog.length}`);
}
```

- [ ] **Step 3: 注册 npm script**

在 `package.json` 的 `scripts` 中增加：

```json
"validate:bridges": "node scripts/validate-bridge-catalog.js"
```

- [ ] **Step 4: 跑校验，确认失败（缺方法）**

```bash
cd /Users/daubert/UGreen/ugreenhome-rn
npm run validate:bridges
```

Expected: 退出码非 0；stderr 含 `missingInCatalog` 且提到如 `getAIDetectionState`。

- [ ] **Step 5: 把 catalog methods 补全为与 schema 一致后再次跑绿**

将 `methods` 替换为：

```json
[
  "getDeviceSettingState",
  "dispatchDeviceSettingAction",
  "getAIDetectionState",
  "dispatchAIDetectionAction",
  "getDeviceSettingsPageState",
  "dispatchDeviceSettingsPageAction",
  "closePage"
]
```

```bash
cd /Users/daubert/UGreen/ugreenhome-rn
npm run validate:bridges
```

Expected: 退出码 0；stdout 含 `OK device-settings methods=7`。

- [ ] **Step 6: Commit（ugreenhome-rn）**

```bash
cd /Users/daubert/UGreen/ugreenhome-rn
git add contracts/bridge-capability-catalog.json scripts/validate-bridge-catalog.js package.json
git commit -m "$(cat <<'EOF'
feat: add bridge capability catalog validation

Keep DeviceSettingsBridge schema, catalog, and JS facade method names in lockstep.
EOF
)"
```

---

### Task 4: 宪法阶段一文档回链 + 计划索引同步

**Files:**
- Modify: `/Users/daubert/UGreen/ugreenhome/docs/superpowers/specs/2026-09-12-ugreen-home-hybrid-runtime-constitution-design.md`（§5.1 增加指向 phase1 文档的链接）
- Modify: `/Users/daubert/UGreen/ugreenhome/docs/superpowers/plans/2026-09-12-ugreen-home-phase1-plan-index.md`（标记 Plan 01 就绪）
- Create/Update Obsidian 镜像：`specs/` 与 `plans/` 副本

**Interfaces:**
- Consumes: Task 1–3 产出路径
- Produces: Spec ↔ phase1 文档可导航

- [ ] **Step 1: 在 Spec §5.1 列表末追加**

```markdown
8. 阶段一 SSOT 文档：`docs/superpowers/phase1/owner-registry.md`、`docs/superpowers/phase1/god-surface-inventory.md`；RN Bridge 目录校验：`ugreenhome-rn` 中 `npm run validate:bridges`。
```

- [ ] **Step 2: 同步 Obsidian 并双仓提交**

```bash
cp /Users/daubert/UGreen/ugreenhome/docs/superpowers/specs/2026-09-12-ugreen-home-hybrid-runtime-constitution-design.md \
  /Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/specs/
cp /Users/daubert/UGreen/ugreenhome/docs/superpowers/plans/2026-09-12-ugreen-home-phase1-plan-index.md \
  /Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/plans/
cp /Users/daubert/UGreen/ugreenhome/docs/superpowers/plans/2026-09-12-phase1-foundation-owner-bridge-catalog.md \
  /Users/daubert/Github/LastStand/obsidian/UGreen-Architecture/plans/

cd /Users/daubert/UGreen/ugreenhome
git add docs/superpowers/specs/2026-09-12-ugreen-home-hybrid-runtime-constitution-design.md \
  docs/superpowers/plans/
git commit -m "$(cat <<'EOF'
docs: link phase-1 SSOT artifacts from constitution

EOF
)"

cd /Users/daubert/Github/LastStand
git add obsidian/UGreen-Architecture/
git commit -m "$(cat <<'EOF'
docs: sync phase-1 foundation plans and Spec links in Obsidian

EOF
)"
```

- [ ] **Step 3: 最终验收命令**

```bash
cd /Users/daubert/UGreen/ugreenhome-rn && npm run validate:bridges
test -f /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/owner-registry.md
test -f /Users/daubert/UGreen/ugreenhome/docs/superpowers/phase1/god-surface-inventory.md
echo FOUNDATION_OK
```

Expected: `OK device-settings...` 与 `FOUNDATION_OK`。

---

## Self-Review (Plan Author)

1. **Spec coverage:** §3 Owner → Task 1；§5.0 反上帝 → Task 2；§4 Bridge 契约 → Task 3；§5.1 文档化 → Task 4。未覆盖 RN Host / Root 代码清理（属 Plan 02/04，见索引）。  
2. **Placeholders:** 无 TBD；脚本与 JSON 完整。  
3. **Consistency:** 方法名与现网 `DeviceSettingsNative.js` / `bridge.schema.json` examples 对齐。
