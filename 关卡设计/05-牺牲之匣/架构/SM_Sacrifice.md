# SM_Sacrifice ([Logic Driver State Machine](../../../参考文档/Plugins/Logic Driver Lite API 参考.md))

> [!NOTE]
> **状态**: ✅ Phase 1 已完成（基础状态配置）| ⚠️ Phase 3.6 待实现（FirstHalf → SecondHalf 转换触发机制）

**职责**：关卡5 牺牲之匣（玻璃桥）观察系统分段控制
**上下文 Actor 类 (Context)**：`GS_Sacrifice`
**父类**：`SMInstance`

## 状态机结构

### 状态列表

| 状态名 | 类型 | 说明 |
|--------|------|------|
| FirstHalf | 普通状态 | 前半段，视觉差异可见（CanObserve = true） |
| SecondHalf | 普通状态 | 后半段，视觉差异消失（CanObserve = false） |
| LevelComplete | 结束状态 | 关卡结束（Can be End State = true） |

### 状态转换

| 起始状态 | 目标状态 | 触发条件 | 优先级 |
|---------|---------|---------|--------|
| Entry | FirstHalf | 初始状态 | - |
| FirstHalf | SecondHalf | 玩家踩到中点玻璃时，BP_GlassPanel 调用 GS_Sacrifice 函数 | 0 |
| FirstHalf | LevelComplete | 事件：OnLevelShouldEnd | 0 |
| SecondHalf | LevelComplete | 事件：OnLevelShouldEnd | 0 |

**设计说明**：
- FirstHalf 和 SecondHalf 都能响应 OnLevelShouldEnd 事件，因为关卡结束可能在任何时候触发（所有玩家完成或淘汰）
- 参考 SM_Endurance 的设计模式（GreenLight 和 RedLight 都能转换到 LevelComplete）

## 变量定义

| 变量名 | 类型 | 说明 |
|--------|------|------|
| Context | `GS_Sacrifice` | 自动获取的 Owner Actor |

---

## Context 获取方式

**重要说明**：Context 不是在 Class Defaults 中配置的，而是在运行时通过 **Get Context** 节点自动获取。

### Event OnStateMachineStart 配置

在状态机的事件图中：

```
Event OnStateMachineStart
    ↓
Parent: OnStateMachineStart (调用父类逻辑)
    ↓
Get Context (获取 Owner Actor)
    ↓
Cast To GS_Sacrifice (转换为 GS_Sacrifice 类型)
    ↓
SET Context (保存为变量，供后续使用)
```

**说明**：
- **Get Context**：Logic Driver 自动将状态机的 Owner Actor 作为 Context
- **Cast To GS_Sacrifice**：将 Context 转换为具体的类型，以便访问 GS_Sacrifice 的变量和函数
- **SET Context**：保存为变量（可选），方便在状态节点中使用

---

## 状态详细配置

### 1. FirstHalf 状态（前半段）

**On State Begin**:
- 使用通知设置 `Context.CanObserve = true`
- 打印日志: `"[SM_Sacrifice] 前半段（可观察）"`

**Transitions**:
- **Target**: SecondHalf
  - **Trigger**: 玩家踩到中点玻璃时，BP_GlassPanel 调用 GS_Sacrifice 函数触发
  - **Priority**: 0
- **Target**: LevelComplete
  - **Trigger**: 事件 (`OnLevelShouldEnd`)
  - **Priority**: 0

### 2. SecondHalf 状态（后半段）

**On State Begin**:
- 使用通知设置 `Context.CanObserve = false`
- 打印日志: `"[SM_Sacrifice] 后半段（不可观察）"`

**Transitions**:
- **Target**: LevelComplete
  - **Trigger**: 事件 (`OnLevelShouldEnd`)
  - **Priority**: 0

### 3. LevelComplete 状态 (End State)

**On State Begin**:
- 打印日志: `"[SM_Sacrifice] 已停止"`

**属性配置**:
- `Can be End State = true`

**Transitions (入向)**:
- **From**: FirstHalf
  - **Trigger**: 事件 (`OnLevelShouldEnd`)
  - **Priority**: 0
- **From**: SecondHalf
  - **Trigger**: 事件 (`OnLevelShouldEnd`)
  - **Priority**: 0

## 网络配置 (SMStateMachineComponent)

所有逻辑仅在 **Server** 运行，通过 `GS_Sacrifice` 的 `CanObserve` (RepNotify) 变量同步给客户端。

| 属性 | 设置 |
|------|------|
| Component Replicates | ✅ True |
| State Change Authority | Server |
| Network Tick Configuration | Server |
| Network State Execution | Server |
| Include Simulated Proxies | ✅ True |

## 组件挂载说明

`SM_Sacrifice` 将作为运行时实例逻辑，运行在 `GS_Core`（及其子类 `GS_Sacrifice`）上的 `LevelSubSM` 组件中。

1. **Host Component**: `GS_Core.LevelSubSM` (SMStateMachineComponent)
2. **Initialization**: 由 `SM_LevelFlow_Main` 的 `InProgress` -> `StartLevelSM` 状态负责加载类并启动。

## 事件监听

| 事件 | 触发源 | 处理 |
|------|--------|------|
| OnLevelShouldEnd | GS_Core（关卡结束判定） | SecondHalf → LevelComplete 转换 |

> [!NOTE]
> **FirstHalf → SecondHalf 转换**：玩家踩到中点玻璃时，BP_GlassPanel 直接调用 GS_Sacrifice 的函数触发，不使用 GameplayTag 事件。

## 相关文档

- [SM_LevelFlow_Main.md](../../00-通用逻辑/核心类/SM_LevelFlow_Main.md) - 主流程状态机
- [GS_Sacrifice.md](GS_Sacrifice.md) - GameState（CanObserve 变量）
- [总体策划.md](../总体策划.md) - 观察系统设计
- [BP_GlassPanel.md](../场景/玻璃桥组件/BP_GlassPanel.md) - 单块玻璃板（Phase 3.6 判断是否为中点玻璃）

