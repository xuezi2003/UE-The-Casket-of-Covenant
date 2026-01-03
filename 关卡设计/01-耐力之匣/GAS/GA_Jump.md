# GA_Jump（跳跃技能）

**父类**：GSCGameplayAbility

## 标签配置

| 配置项 | 值 |
|--------|-----|
| 资产标签 | `Ability.Require.Stamina`, `Player.Action.Jumping` |
| 激活阻止标签 | `Player.Action.Jumping`, `Player.State.Exhausted` |

**设计说明**：
- `Player.Action.Jumping` 在激活阻止标签中 → 防止二段跳
- `Player.State.Exhausted` → 力竭时无法跳跃

## 高级配置

| 配置项 | 值 |
|--------|-----|
| 复制策略 | 请勿复制 |
| 实例化策略 | 每个 Actor 实例化 |
| 网络执行策略 | 本地预测 |
| 网络安全策略 | 客户端或服务器 |
| 重新触发实例化能力 | ✅ |

## Effect Container Map

| 触发标签 | GE | SetByCaller |
|----------|-----|-------------|
| `Effect.Container.Jump` | GE_Jumping, GE_StaminaCost | `Effect.Cost.Stamina` = -15 |

## 事件图表

### Event ActivateAbility

```
CommitAbility
    ↓
Apply Effect Container (Effect.Container.Jump) → 保存返回的 Effect Container
    ↓
Get Avatar Actor → Cast To Character
    ↓
Character.Jump()
    ↓
Wait Input Release (IA_Core_Jump)
    ↓
Character.StopJumping() + Bind CMC.OnMovementModeChanged → HandleMovementChanged
```

### HandleMovementChanged（自定义事件）

参数：Character, PrevMovementMode, NewMovementMode

```
PrevMovementMode = Falling?
    └─ True → End Ability
```

**说明**：当前一个状态是 Falling，说明刚落地，结束技能。

### Event OnEndAbility

```
Get Avatar Actor → Cast To Character → StopJumping()
    ↓
For Each (Effect Container Handles)
    → RemoveGameplayEffectFromOwnerWithHandle
```

## 相关 GE

### GE_Jumping

| 配置项 | 值 |
|--------|-----|
| 持续时间 | 无限 |
| Target Tags | `Player.Action.Jumping` |
| 堆叠样式 | 按源聚合（限制1） |

**注意**：Danger 标签不在此 GE 中，由 Comp_Character_Endurance 的 `UpdateMoving` 通过速度检测自动应用 `GE_Moving`。

### GE_StaminaCost

通用按次体力消耗 GE，详见 [体力系统.md](../GAS/体力系统.md#按次消耗通用-ge_staminacost)。
