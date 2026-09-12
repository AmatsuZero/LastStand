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
