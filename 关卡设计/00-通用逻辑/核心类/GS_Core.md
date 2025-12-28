# GS_Core（GameState）

**职责**：当前关卡状态管理 + 状态树驱动

## 组件

| 组件 | 类型 | 用途 |
|------|------|------|
| MainST | Brain Component | 运行 ST_LevelFlow_Main |

## 变量

| 变量名 | 类型 | 复制 | 用途 |
|--------|------|------|------|
| ActiveMatchPhase | Gameplay Tag | ✅ | 当前比赛阶段 |
| ActiveMatchStatus | Gameplay Tag Container | ✅ | 当前比赛状态集合 |
| PreparingDuration | 浮点 | ❌ | 准备阶段时长 |
| InProgressDuration | 浮点 | ❌ | 进行阶段时长 |

## 事件分发器

| 名称 | 触发时机 |
|------|----------|
| OnActiveMatchPhaseChange | 阶段变化时广播 |
| OnActiveMatchStatusChange | 状态变化时广播 |

## 关键逻辑

| 事件/函数 | 说明 |
|-----------|------|
| Event BeginPlay | 服务端启动状态树 |
| OnRep_ActiveMatchPhase | 复制时广播事件通知客户端 |
| OnRep_ActiveMatchStatus | 复制时广播事件通知客户端 |

## 设计说明

PlayerRecords 已迁移至 GI_FiveBox，因为 GameState 在无缝切换时会被销毁。
