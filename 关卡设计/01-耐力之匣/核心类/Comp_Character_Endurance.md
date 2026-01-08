# Comp_Character_Endurance（ActorComponent）

**职责**：关卡1 角色组件，移动状态检测 + 体力消耗管理（服务端逻辑）

**挂载于**：BP_Character_Game（在 InitPlayer 里根据 LevelCharacterComponentClass 动态添加）

> [!NOTE]
> **命名规范**：`Comp_Character_xxx` 挂载在 Character 上处理服务端逻辑，`Comp_PC_xxx` 挂载在 PlayerController 上处理客户端逻辑（如 QTE UI）。

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| BP_Character | BP_Character_Game | 缓存的角色引用 |
| ASC | AbilitySystemComponent | 缓存的 ASC 引用 |
| GSCCore | GSCCoreComponent | 缓存的 GSCCore 引用（用于绑定事件） |
| IsMoving | Boolean | 当前是否移动中 |
| MovingThreshold | Float | 移动速度阈值 |
| ExhaustedThreshold | Float | 力竭退出阈值（默认 15） |

## 关键逻辑

### Event BeginPlay

```
Get Owner → Cast To BP_Character_Game → SET BP_Character
    ↓
Set Timer by Function Name (WaitForASC, Looping)
```

### WaitForASC（自定义事件）

```
BP_Character → Get Component by Class (GSCCoreComponent) → SET GSCCore
    ↓
Get Ability System Component from Actor (BP_Character)
    ↓
Is Valid?
    ├─ Yes → SET ASC → Clear Timer (WaitForASC)
    │        → Bind Event to On Gameplay Tag Change (GSCCore) → HandleTagChanged
    │        → Bind Event to On Attribute Change (GSCCore) → HandleAttributeChanged
    └─ No → 继续等待
```

**注意**：ASC 挂在 PlayerState 上（GSC 架构），必须通过 GSCCore 组件获取。

### HandleAttributeChanged（自定义事件）

参数：Attribute, NewValue, OldValue

```
Switch on Gameplay Attribute (Attribute)
    ↓
BAS_Core.Stamina → HandleStaminaChanged
```

**说明**：使用 GSCCore 官方的 `On Attribute Change` 事件绑定，替代自定义 Async Task。

### HandleTagChanged（自定义事件）

参数：GameplayTag, NewTagCount

```
Switch on Gameplay Tag (GameplayTag)
    ↓
Player.Action.Running → HandleRunning (IsRunning = NewTagCount > 0)
Player.Action.Crouching → HandleCrouching
```

### HandleRunning（函数）

参数：IsRunning (Boolean)

```
IsRunning?
    ├─ True → ApplyGameplayEffectToSelf (GE_StaminaDrain_Sprint)
    └─ False → RemoveActiveGameplayEffectBySourceEffect (GE_StaminaDrain_Sprint, Stacks = -1)
```

### HandleCrouching（函数）

**说明**：蹲下/起身过程中添加危险标签（0.2 秒内算移动）

```
ApplyGameplayEffectToSelf (GE_Moving)
    ↓
Delay (0.2s)
    ↓
RemoveActiveGameplayEffectBySourceEffect (GE_Moving, Stacks = -1)
```

### HandleStaminaChanged（函数）

**说明**：采用滞后阈值逻辑，避免力竭边界抖动。

```
Has Matching Gameplay Tag (Player.State.Exhausted)?
    ├─ 否（未力竭） → Stamina <= 0? → ApplyGameplayEffectToSelf (GE_Exhausted)
    └─ 是（已力竭） → Stamina >= ExhaustedThreshold? → RemoveActiveGameplayEffectBySourceEffect (GE_Exhausted)
```

**阈值设计**：
- 进入力竭：Stamina = 0
- 退出力竭：Stamina ≥ 15（ExhaustedThreshold）
- 好处：防止体力在阈值边缘反复触发力竭状态

### UpdateMoving（Tick 调用，仅服务端）

```
Switch Has Authority
    ↓ Authority
Is Valid (ASC)
    ↓ Is Valid
速度 >= MovingThreshold?
    ├── True → NOT IsMoving? → Apply GE_Moving → SET IsMoving = true
    └── False → IsMoving? → Remove GE_Moving → SET IsMoving = false
```

**GE_Moving 效果**：
- 添加 `Player.State.Moving` 标签（表示移动中）
- 添加 `Player.State.Danger` 标签（红灯时被检测到会扣 HP）

## 待实现

- [ ] 红灯伤害判定逻辑（监听 GS.IsDetecting + 检查 Player.State.Danger）
