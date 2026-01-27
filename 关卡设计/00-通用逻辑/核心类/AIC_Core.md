# AIC_Core（AIController）

**职责**：AI 控制器，Possess 时启动行为树

**设计说明**：AIC_Core 是通用 AI 控制器，**不需要为每个关卡创建子类**。关卡差异通过 GM 子类配置不同的行为树（AI_BT）实现。

## 配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| bWantsPlayerState | ✅ | 确保 AI 也有 PlayerState |

## 变量

| 变量名 | 类型 | 配置 | 用途 |
|--------|------|------|------|
| BT_Asset | 行为树 | Instance Editable ✅<br>Expose on Spawn ✅ | 行为树资产（由 GM 生成时传入） |

> [!IMPORTANT]
> **BT_Asset 必须设置为 Expose on Spawn**：GM_Core 在生成 AIC_Core 时会通过 SpawnActor 的参数传递 `Level_BehaviorTree`。如果未勾选 Expose on Spawn，行为树将无法正确传递。

## 关键逻辑

### Event On Possess ✅

**完整实现**：

```blueprint
Event On Possess (PossessedPawn)
    ↓
Run Behavior Tree (BT_Asset)
    ↓
Sequence
    ├─ then_0: 监听完成事件
    │   AsyncAction: Wait for Gameplay Event to Actor
    │       ├─ Target: PossessedPawn
    │       ├─ Event Tag: Gameplay.Event.Player.Finished
    │       └─ Event Received:
    │           GetBrainComponent()
    │               → StopLogic(Reason = "Player Finished")
    │
    └─ then_1: 监听淘汰事件
        AsyncAction: Wait for Gameplay Event to Actor
            ├─ Target: PossessedPawn
            ├─ Event Tag: Gameplay.Event.Player.Eliminated
            └─ Event Received:
                GetBrainComponent()
                    → StopLogic(Reason = "Player Eliminated")
```

**设计说明**：

**为什么在 AIC_Core 中停止行为树？**
- **职责清晰**：AIC_Core 负责行为树的生命周期管理（启动和停止）
- **代码集中**：只需要在一个地方监听事件，不需要在多个地方重复
- **架构一致**：与 PC_Core、BP_Character_Game 的事件监听模式一致
- **符合原则**："谁启动谁停止"

**为什么监听两个事件？**
- **淘汰（死亡）**：AI 被淘汰时，应该停止行为树
- **完成（到达终点）**：AI 完成比赛时，也应该停止行为树

**双重保险机制**：
- **Check End Tag Decorator**（BT_Endurance）：阻止行为树执行新的分支
- **StopLogic**（AIC_Core）：完全停止行为树 Tick，节省性能
- 两者配合，确保 AI 死亡/完成后行为树彻底停止

## AI 触发操作方式

| 操作类型 | 触发方式 |
|----------|----------|
| GAS 操作（推搡、闪避等） | GSC 内置 `BTTask_TriggerAbilityByClass` 或 `BTTask_TriggerAbilityByTags` |
| 非 GAS 操作（选房间等） | 自定义 BTTask 调用组件的 `TryXxx()` 接口 |

## 各关卡行为树（待实现）

| 行为树 | 关卡 | AI 行为 |
|--------|------|---------|
| BT_Endurance | 1 | 走走停停地移动、红灯停/偷偷动、推搡/闪避、失衡QTE判定（详见 [BT_Endurance.md](../../01-耐力之匣/AI/BT_Endurance.md)） |
| BT_Logic | 2 | 随机选房间、跟随多数人 |
| BT_Courage | 3 | 按概率戴面具 |
| BT_Insight | 4 | 随机站队 |
| BT_Sacrifice | 5 | 向终点移动、推搡、闪避、失衡QTE判定、扔金币测试玻璃 |
