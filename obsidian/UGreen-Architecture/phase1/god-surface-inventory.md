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
