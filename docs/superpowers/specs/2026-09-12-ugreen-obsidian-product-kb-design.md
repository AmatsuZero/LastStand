# UGreen Obsidian 产品知识库设计

## 目标

在现有 Obsidian vault（`obsidian/`）下建立产品知识库目录 `UGreen/`，帮助个人与 Agent 快速理解 UGreen 产品的**功能、需求、UI**，并与已有架构知识库形成统一入口。

成功标准：

- 能从钉钉入口索引扫出可维护的同步清单，并半自动把原料落到本地
- 日常阅读与 Agent 查询走结构化「产品域 → 功能 → 需求 → UI」地图，而不是钉钉原始目录
- 钉钉有更新时可差分合并原料层；结构化层不静默覆盖
- 从产品首页可进入 `UGreen-Architecture` 架构资料

## 背景与约束

- Vault 已存在：`obsidian/`（首页偏学习笔记）；架构资料在 `obsidian/UGreen-Architecture/`
- 钉钉入口索引：`https://alidocs.dingtalk.com/i/nodes/o14dA3GK8g5bDxmzS7YzblPxV9ekBD76`（**入口索引**，真正同步目标是其引用的文档/空间，需扫描后写入清单）
- 同步通道：钉钉文档 MCP（`dingtalk-doc`：`get_document_info`、`get_document_content`、`list_nodes` 等）。实现前须确认当前 Agent 会话已挂载该 MCP
- UI 粒度取**中量**：页面/模块清单 + 关键交互 + 外链；关键截图落本地并挂到功能点。不做重量级设计系统变体树（控制 Agent token）

## 决策摘要

| 议题 | 选择 |
|------|------|
| 服务对象 | 个人 + Agent（A）+ 结构化产品地图（C） |
| 与钉钉关系 | 定期半自动同步；冲突可人工处理（B） |
| 入口链接角色 | 索引入口，需再扫引用文档定清单（B） |
| 与 Architecture | `UGreen/` 做总首页；Architecture 为子入口，物理目录不移动（C） |
| 搭建方式 | 双层：原料 `sources/` + 结构化产品地图（方案 2） |
| UI 粒度 | 中量（B） |

## 架构：双层知识库

```text
obsidian/
├── Home.md                          # 增加 UGreen 产品入口
└── UGreen/
    ├── 00-产品首页.md               # 总 MOC
    ├── sync/
    │   ├── inventory.yaml           # 同步清单
    │   └── README.md                # 例行同步约定
    ├── sources/                     # 原料层（钉钉近乎忠实导出）
    │   ├── _index.md
    │   └── <nodeId>/
    │       ├── doc.md
    │       └── assets/
    ├── domains/
    ├── features/
    ├── requirements/
    ├── ui/
    ├── Templates/
    └── Views/                       # 可选 Base 视图
```

职责分离：

- **Agent / 日常阅读**：只走 `domains|features|requirements|ui` 与 `00-产品首页.md`
- **同步与 diff**：只碰 `sources/` 与 `sync/inventory.yaml`
- **架构**：`UGreen-Architecture/` 物理不移动；产品首页链到 `[[UGreen-Architecture/00-摸底索引]]`

## 同步流程

### Bootstrap

1. 经钉钉文档 MCP 读取入口索引文档
2. 抽取引用的文档/空间节点 → 写入 `sync/inventory.yaml`（可人工增删）
3. 对清单内每个启用节点导出 Markdown（及图片）到 `sources/<nodeId>/`
4. 整理进结构化层（Agent 起草，人工审阅）

### 例行同步

1. 读取 `inventory.yaml`，拉取各节点元信息/版本或内容哈希
2. 有变更则更新对应 `sources/<nodeId>/`（可保留一轮 `doc.prev.md` 便于 diff）
3. 产出变更摘要：哪些原料变了、可能影响哪些结构化笔记（经 frontmatter 反向索引）
4. 结构化层**不自动覆盖**；确认后再合并

### `inventory.yaml` 字段

- 根：`root_index_node_id`、`root_index_url`
- 条目：`node_id`、`title`、`url`、`kind`、`enabled`、`last_synced_at`；变更检测优先用钉钉版本号，否则用导出正文 `content_hash`
- 可选：`maps_to`（指向已整理的 domain/feature 路径）
- 错误：`last_error`（无权限、删除、循环快捷方式等）

### 冲突约定

- 原料层：钉钉胜
- 结构化层：Obsidian 胜，除非明确要求按钉钉改产品地图

## 笔记模板与 frontmatter

共用字段：`title`、`tags`、`status`（`draft|active|deprecated`）、`updated`、`source_node_ids`、可选 `source_paths`。

| 类型 | 路径 | 额外字段 | 正文约定 |
|------|------|----------|----------|
| Domain | `domains/` | `domain_id` | 域职责、边界、下属功能 |
| Feature | `features/` | `feature_id`、`domain` | 做什么/不做什么、主流程、链到 req/ui |
| Requirement | `requirements/` | `req_id`、`feature`、`priority` | 验收要点摘要，不堆钉钉全文 |
| UI | `ui/` | `ui_id`、`feature`、`screens` | 页面/模块、关键交互；本地截图标注状态 |

产品首页包含：产品地图、架构子入口、同步/原料入口、Agent 使用约定（先地图后 `sources/`）。

YAGNI：不建完整需求管理系统字段（assignee、sprint 等）；不做 UI 重量级变体树。

## 错误处理

- 无权限或节点删除：`enabled: false` + `last_error`；不删已有 `sources/`；首页提示失效源
- 快捷方式（dlink）：解析到真实 `nodeId` 再入库；循环链接停止并记错
- 索引增减链接：更新清单；新增默认启用待确认；减少不自动删结构化笔记，只标原料缺失
- MCP 不可用：同步中止并明确报错；不写半截 inventory

## 验证

- 从入口索引得到可用的首版 `inventory.yaml`
- `sources/` 中文档可打开且与 nodeId/标题对应
- `00-产品首页` + 至少一个 domain 与若干 feature 骨架可导航；Architecture 可达
- 无变更重跑同步时 hash 稳定；有变更只动 `sources/` 并生成摘要

## 首期范围（MVP）

1. 确认钉钉文档 MCP 在会话中可用，读取入口索引并生成首版 inventory
2. 搭建 `UGreen/` 目录、模板、首页，并挂到 `Home.md`
3. 导出清单内首批文档到 `sources/`
4. 整理最小产品地图（域/功能骨架 + 少量中量 UI 样例）；其余 `draft`
5. 编写 `sync/README.md`

明确不做：全量一次整理完；UI 设计系统级文档；自动回写钉钉；移动/合并 `UGreen-Architecture` 物理目录。

## 实现前提

实现阶段第一步必须重新探测 MCP：当前设计讨论期间，本机 `mcp.json` 已配置 `dingtalk-doc`，但部分 Agent 会话未挂载该 namespace。未接通前不得宣称已完成钉钉拉取。
