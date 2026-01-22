# GS_Core（GameState）

**职责**：当前关卡状态管理 + 状态机驱动

## 组件

| 组件 | 类型 | 用途 | 默认资产 |
|------|------|------|----------|
| MainSM | SMStateMachineComponent | 运行主流程状态机 | SM_LevelFlow_Main |
| LevelSubSM | SMStateMachineComponent | 运行关卡子状态机（由 SM_LevelFlow_Main 启动） | 无（运行时设置） |


**组件设置**：

| 组件 | Initialize on Begin Play | Start on Begin Play | 说明 |
|------|:------------------------:|:-------------------:|------|
| MainSM | ✅ | ✅ | 自动初始化并启动 |
| LevelSubSM | ❌ | ❌ | 由 MainSM 的 StartLevelSM 状态手动启动 |

**网络配置**（两个组件相同）：

| 属性 | 设置 |
|------|------|
| Component Replicates | ✅ True |
| State Change Authority | Server |
| Network Tick Configuration | Server |
| Network State Execution | Server |
| Include Simulated Proxies | ✅ True |

**配置注意**：
- **MainSM**: State Machine Class 设置为 `SM_LevelFlow_Main`
- **LevelSubSM**: State Machine Class 为 None，运行时由 StartLevelSM 状态设置


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
| OnLevelShouldEnd | 关卡应提前结束时广播 |

### OnLevelShouldEnd ✅

> [!NOTE]
> 此事件用于触发 InProgress 阶段提前结束，由 SM_LevelFlow_Main 的 WaitingSettle → Complete 转换绑定。

**触发条件**：
- 未完成且未淘汰的玩家数量为 0（即所有参与本关的玩家都已完成目标或被淘汰）

**调用位置**：由 `CheckLevelShouldEnd` 函数检查条件并广播

## 关键逻辑

| 事件/函数 | 说明 | 权限 |
|-----------|------|------|
| Event BeginPlay | 仅服务端：确保 MainSM 启动（如果未自动启动） | Server |
| CheckLevelShouldEnd | 调用 `GI.CheckLevelEndCondition`，为真则广播 `OnLevelShouldEnd` | Server |
| OnRep_ActiveMatchPhase | 复制时广播事件通知客户端 | Client |
| OnRep_ActiveMatchStatus | 复制时广播事件通知客户端 | Client |

### CheckLevelShouldEnd ✅ 已实现

**说明**：检查关卡结束条件（基于 PlayerRecords 的通用逻辑）。

```blueprint
Function CheckLevelShouldEnd
    ↓
Get GI_FiveBox -> Call CheckLevelEndCondition()
    ↓
If (ShouldEnd == True)
    Call OnLevelShouldEnd.Broadcast()
```


## 设计说明

> PlayerRecords 存储架构详见 [系统架构.md](../系统架构.md#三数据结构)。
