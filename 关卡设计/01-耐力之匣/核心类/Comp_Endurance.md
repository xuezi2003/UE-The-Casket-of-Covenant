# Comp_Endurance（ActorComponent）

**职责**：关卡1 玩家操作组件，移动状态检测 + 体力消耗管理

**挂载于**：BP_Character_Game（在 InitPlayer 里根据 LevelCharacterComponentClass 动态添加，服务端和客户端都会执行）

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| BP_Character | BP_Character_Game | 缓存的角色引用 |
| ASC | AbilitySystemComponent | 缓存的 ASC 引用 |
| GSCCore | GSCCoreComponent | 缓存的 GSCCore 引用（用于绑定事件） |

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
    │        → InitWaitAttributeChanged
    └─ No → 继续等待
```

**注意**：ASC 挂在 PlayerState 上（GSC 架构），必须通过 GSCCore 组件获取。

### InitWaitAttributeChanged（自定义事件）

```
Get Owner → Get Ability System Component → Get All Attributes
    ↓
For Each Loop
    ↓
Wait for Attribute Changed (Only Trigger Once = false) → HandleAttributeChanged
```

**说明**：自动获取所有属性并监听变化，与 BP_Character_Game 使用相同的 Async Task 模式。

### HandleTagChanged（自定义事件）

参数：GameplayTag, NewTagCount

```
Switch on Gameplay Tag (GameplayTag)
    ↓
Player.Action.Running → HandleRunning (IsRunning = NewTagCount > 0)
```

### HandleRunning（函数）

参数：IsRunning (Boolean)

```
IsRunning?
    ├─ True → ApplyGameplayEffectToSelf (GE_StaminaDrain_Sprint)
    └─ False → RemoveActiveGameplayEffectBySourceEffect (GE_StaminaDrain_Sprint, Stacks = -1)
```

### HandleAttributeChanged（自定义事件）

参数：Attribute

```
Switch on Gameplay Attribute (Attribute)
    ↓
BAS_Core_C.Stamina → HandleStaminaChanged
```

### HandleStaminaChanged（自定义事件）

```
Get Float Attribute (Stamina) → Stamina <= 20?
    ├─ True → ApplyGameplayEffectToSelf (GE_Exhausted)
    └─ False → RemoveActiveGameplayEffectBySourceEffect (GE_Exhausted, Stacks = -1)
```

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
- 添加 `Player.State.Danger` 标签（红灯时被检测到会死亡）

## 待实现

| 功能 | 说明 |
|------|------|
| 红灯死亡判定 | 监听 GS.IsDetecting + 检查 Player.State.Danger |

- [x] 蓝图已创建
- [x] BeginPlay 获取 BP_Character
- [x] WaitForASC 定时器轮询获取 ASC（通过 GSCCore）
- [x] 绑定 OnGameplayTagChange 事件
- [x] HandleTagChanged → Switch → HandleRunning
- [x] 奔跑体力消耗（Apply/Remove GE_StaminaDrain_Sprint）
- [x] InitWaitAttributeChanged 属性监听（Async Task 模式）
- [x] HandleStaminaChanged 力竭处理（Stamina <= 20）
- [x] 移动状态检测逻辑（Has Authority 鉴权）
- [ ] 红灯死亡判定逻辑

