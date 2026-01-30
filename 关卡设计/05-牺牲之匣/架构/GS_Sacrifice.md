# GS_Sacrifice（GameState）

**职责**：关卡5 牺牲之匣的 GameState

**父类**：GS_Core

**实现状态**：✅ 已完成

---

## 变量配置

### 基础配置

| 变量名 | 类型 | 值 | 复制 | 说明 | 实现状态 |
|--------|------|-----|------|------|----------|
| Preparing Duration | 浮点 | 5.0 | ❌ | 准备阶段时长（秒） | ✅ 已实现 |
| In Progress Duration | 浮点 | 600.0 | ❌ | 进行阶段时长（秒，10分钟） | ✅ 已实现 |

**配置说明**：
- PreparingDuration = 5.0（与关卡1相同）
- InProgressDuration = 600.0（与关卡1相同，后续可根据测试调整）

### 观察系统

| 变量名 | 类型 | 值 | 复制 | 说明 | 实现状态 |
|--------|------|-----|------|------|----------|
| CanObserve | 布尔 | true | ✅ RepNotify | 当前是否可观察（前半段 true，后半段 false） | ✅ 已实现 |

**配置说明**：
- CanObserve 用于控制玻璃视觉差异显示（前半段可观察，后半段不可观察）

---

## 事件分发器

| 事件 | 参数 | 说明 |
|------|------|------|
| OnCanObserveChanged | CanObserve: Bool | 观察状态变化时广播 |

---

## 函数

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| OnRep_CanObserve | - | RepNotify 回调，调用 OnCanObserveChanged 广播（Blueprint 中在服务端和客户端都会自动调用） | ✅ 已实现 |

---

## 关卡结束判定（✅ 继承自 GS_Core）

GS_Sacrifice 使用父类 `GS_Core.CheckLevelShouldEnd()` 进行关卡结束判定。

**触发时机（事件驱动）**：
- **玩家淘汰**：坠落碰到 Kill Volume → 发送 `Gameplay.Event.Player.Eliminated` → `PC_Core.HandlePlayerEliminate`
- **玩家完成**：`BP_FinishLine` → 发送 `Gameplay.Event.Player.Finished` → `PC_Core.HandlePlayerFinish` → `GS_Core.CheckLevelShouldEnd()`

**判定逻辑**：由 `GI_FiveBox.CheckLevelEndCondition()` 统计未完成且未淘汰的玩家数量，为 0 时广播 `OnLevelShouldEnd` 事件。

---

## 相关文档

- [GS_Core.md](../../00-通用逻辑/核心类/GS_Core.md) - 父类关卡结束逻辑
- [GI_FiveBox.md](../../00-通用逻辑/核心类/GI_FiveBox.md) - CheckLevelEndCondition 实现
- [PC_Core.md](../../00-通用逻辑/核心类/PC_Core.md) - HandlePlayerEliminate / HandlePlayerFinish
- [SM_Sacrifice.md](SM_Sacrifice.md) - 子状态机（控制观察状态切换）
- [总体策划.md](../总体策划.md) - 关卡5总体策划

