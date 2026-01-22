# Comp_Character_Endurance（ActorComponent）

**职责**：关卡1 角色组件，移动状态检测 + 体力消耗管理（服务端逻辑）

**挂载于**：BP_Character_Game（在 InitPlayer 里根据 LevelCharacterComponentClass 动态添加）

> [!NOTE]
> **命名规范**：`Comp_Character_xxx` 挂载在 Character 上处理服务端逻辑，`Comp_PC_xxx` 挂载在 PlayerController 上处理客户端逻辑（如 QTE UI）。

### 组件复制配置（Class Defaults）

| 属性 | 值 | 说明 |
|------|:---:|------|
| **Component Replicates** | ✅ | 组件变量（如 ThrowItemID）需要同步到客户端 |

> [!IMPORTANT]
> **动态组件同步**：必须在服务端执行 `Add Actor Component`（通过 `Switch Has Authority`）。组件开启 `Component Replicates` 后由系统自动同步。详见 [BP_Character_Game.md](../../00-通用逻辑/核心类/BP_Character_Game.md#initplayer-流程)。

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

### WaitForASC（自定义事件）✅ 已更新

```blueprint
BP_Character → Get Component by Class (GSCCoreComponent) → SET GSCCore
    ↓
Get Ability System Component from Actor (BP_Character)
    ↓
Is Valid?
    ├─ Yes → SET ASC → Clear Timer (WaitForASC)
    │        → Bind Event to On Gameplay Tag Change (GSCCore) → HandleTagChanged
    │        → Bind Event to On Attribute Change (GSCCore) → HandleAttributeChanged
    │        → AsyncAction: Wait for Gameplay Event (Gameplay.Event.Player.Started)
    │            → HandlePlayerStart()
    │        → AsyncAction: Wait for Gameplay Event (Gameplay.Event.Player.Finished)
    │            → HandlePlayerFinish()
    └─ No → 继续等待
```

**注意**：
- ASC 挂在 PlayerState 上（GSC 架构），必须通过 GSCCore 组件获取
- 新增两个事件监听：Started 和 Finished，用于处理起点/终点的碰撞切换和状态标记

### HandleAttributeChanged（自定义事件）

参数：Attribute, DeltaValue, EventTags

```
Switch on Gameplay Attribute (Attribute)
    ↓
BAS_Core.Stamina → HandleStaminaChanged
BAS_Core.Health → HandleHealthChanged  // Phase 6 新增
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

### HandleHealthChanged（函数）✅ 已实现

**说明**：HP 归零时执行完整的死亡流程。

**执行流程**：

```blueprint
If (GetFloatAttribute(BAS_Core.Health) <= 0 AND NOT ASC.HasMatchingGameplayTag(Player.State.Dead))
    ↓ True
    【步骤 1】应用死亡标签
    ASC.BP_ApplyGameplayEffectToSelf (GE_Dead)
        ↓
    Switch Has Authority → Authority:
        ↓
    【步骤 2】范围检测（死亡广播）
    SphereTraceMulti (Channel: PuppetVision, Radius: DeathEffectRadius, IgnoreSelf)
        ↓
    Sequence（并行执行两个分支）
        ├─ then_0: 【步骤 3】死亡广播 - 周围玩家失衡
        │   For Each in OutHits:
        │       Cast HitActor to Character
        │           → SendGameplayEventToActor (Gameplay.Event.Activate.Stagger)
        │
        └─ then_1: 死亡处理链（顺序执行）
            ├─ 【步骤 4】掉落金币
            │   SpawnDeadCoin()
            │       → For Loop: Spawn BP_Item_Coin (数量 = Coin 属性值)
            │
            ├─ 【步骤 5】死亡表现（所有端执行）
            │   Multicast_OnDeath()
            │       ├─ CapsuleComponent.SetCollisionEnabled(无碰撞)
            │       ├─ Mesh.SetSimulatePhysics(true) ← Ragdoll
            │       └─ CharacterMovement.DisableMovement()
            │
            └─ 【步骤 6】发送淘汰事件
                SendGameplayEventToActor (BP_Character, Gameplay.Event.Player.Eliminated)
                    → GM_Core.HandlePlayerEliminate (监听此事件)
                        ├─ GI_FiveBox.SetPlayerEliminated(PlayerNum) ✅
                        └─ GS_Core.CheckLevelShouldEnd() ✅
                    → PC_Core.HandlePlayerEliminate (监听此事件，仅真人)
                        ├─ UnPossess() ✅
                        └─ 真人玩家返回主菜单 ⚠️ 待实现
```

**设计说明**：
- 步骤 1-6 在 `Comp_Character_Endurance` 中完整实现
- 步骤 6 发送的淘汰事件由 `GM_Core.HandlePlayerEliminate` 和 `PC_Core.HandlePlayerEliminate` 监听处理
- **档案管理和关卡检查由 GM_Core 统一处理**，不在 Character 组件中直接操作档案

### SetPlayerEliminate（函数）❌ 已删除

> [!IMPORTANT]
> **架构优化**：此函数已删除，档案管理统一由 GM_Core 处理。
> 
> **原因**：
> - Character 组件不应该直接操作档案（GI_FiveBox）
> - 淘汰和完成的档案管理应该由 GM_Core 统一处理
> - 修复了 AI 完成状态丢失的 Bug
> 
> **新流程**：
> ```
> HandleHealthChanged 发送 Gameplay.Event.Player.Eliminated
>     ↓
> GM_Core.HandlePlayerEliminate 监听事件
>     ↓
> GI_FiveBox.SetPlayerEliminated(PlayerNum)
> ```
> 
> 详见 [GM_Core.md](../../00-通用逻辑/核心类/GM_Core.md#handleplayereliminate-custom-event-已实现)

---

### HandlePlayerStart（函数）✅ 已实现

**说明**：玩家穿过起点线后，切换碰撞通道，实现单向通行。

```blueprint
Event HandlePlayerStart
    ↓
BP_Character.CapsuleComponent.SetCollisionObjectType(PawnBlock)
```

**触发来源**：
- BP_StartLine.OnComponentEndOverlap 发送 Gameplay.Event.Player.Started 事件

**设计说明**：
- 碰撞切换由 Character 组件处理，而不是场景 Actor
- 和 HandlePlayerFinish 架构对称

---

### HandlePlayerFinish（函数）✅ 已实现

**说明**：玩家到达终点后，应用完成标签和切换碰撞通道。

```blueprint
Event HandlePlayerFinish
    ↓
ASC.BP_ApplyGameplayEffectToSelf(GE_Finish)
    ↓
BP_Character.CapsuleComponent.SetCollisionObjectType(Pawn)
```

**触发来源**：
- BP_FinishLine.OnComponentEndOverlap 发送 Gameplay.Event.Player.Finished 事件

**设计说明**：
- 状态标记（GE_Finish）和碰撞切换由 Character 组件处理
- 档案管理（SetPlayerFinished）由 GM_Core 处理
- 职责清晰，架构优雅

---

### SpawnDeadCoin（函数）✅ 已实现

```blueprint
Event SpawnDeadCoin
    ↓
For Loop (0 to FFloor(GetFloatAttribute(BAS_Core.Coin)))
    ↓ LoopBody
    SpawnActor (BP_Item_Coin)
        ├─ Location: BP_Character.GetActorLocation() + RandomXY(0~50)
        └─ InitialState: InField
```

> [!NOTE]
> **子类默认 ItemID**：`BP_Item_Coin` 子类的 Class Defaults 已预设 `ItemID = "Coin"`，Spawn 时无需传入。

### Multicast_OnDeath（Custom Event）✅ 已实现

**类型**：NetMulticast, Reliable

```blueprint
Event Multicast_OnDeath
    ↓
BP_Character.CapsuleComponent.SetCollisionEnabled (NoCollision)
    ↓
BP_Character.Mesh.SetSimulatePhysics (true)
    ↓
BP_Character.CharacterMovement.DisableMovement()
```

**设计说明**：
- 在所有端执行（Multicast），确保死亡表现同步
- Ragdoll 效果由 `SetSimulatePhysics(true)` 实现
- 禁用碰撞避免死亡后仍然阻挡其他玩家

---

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

---

## 道具系统接口 ✅

### 新增变量

| 变量名 | 类型 | 复制 | 说明 |
|--------|------|:----:|------|
| ThrowItemID | DataTableRowHandle | ✅ RepNotify | 当前持有的投掷道具 ID |
| ThrowItemData | S_ItemData | ❌ | 缓存的道具数据（由 OnRep 查表填充） |
| PropInHandComp | StaticMeshComponent | ❌ | 手持道具组件引用 |
| DeathEffectRadius | Float | ❌ | 死亡广播范围（厘米），默认 500.0 |

### 新增函数

| 函数 | 权限 | 说明 | 状态 |
|------|------|------|:----:|
| `SetThrowItemID(NewItemID)` | Server | 使用通知设置 ThrowItemID | ✅ |
| `OnRep_ThrowItemID` | Client | RepNotify，查表更新 ThrowItemData | ✅ |
| `GetThrowItemID()` | Any | 获取当前持有道具 ID | ✅ |
| `ClearThrowItemID()` | Server | 清空持有道具 | ✅ |
| `Multicast_ShowPropInHand(IsShow)` | NetMulticast | 同步显示/隐藏手持道具 | ✅ |
| `ShowPropInHand()` | Local | 动态添加组件并附加到 Socket | ✅ |
| `ClearPropInHand()` | Local | 销毁手持道具组件 | ✅ |

### OnRep_ThrowItemID ✅

```
OnRep_ThrowItemID
    ↓
Call OnThrowItemChanged (ThrowItemID)
    ↓
ThrowItemID.RowName != None?
    ├─ True → Get Data Table Row → SET ThrowItemData
    └─ False → SET ThrowItemData = 空结构体
```

### Multicast_ShowPropInHand(IsShow) ✅

**类型**：NetMulticast, Reliable, Executes On All

```
IsShow?
    ├─ True → ShowPropInHand()
    └─ False → ClearPropInHand()
```

### ShowPropInHand ✅

```
AddComponentByClass (StaticMeshComponent)
    ↓
SET PropInHandComp
    ↓
SetStaticMesh (ThrowItemData.PropMesh)
    ↓
AttachToComponent (BP_Character.Mesh, Socket_Throw)
```

### ClearPropInHand ✅

```
SetStaticMesh (PropInHandComp, None)  ← 先清空 Mesh（立即生效）
    ↓
DestroyComponent (PropInHandComp)
    ↓
SET PropInHandComp = None
```

### Event Dispatchers

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `OnThrowItemChanged` | NewItemID (DataTableRowHandle) | 道具变更时触发（用于 UI 更新） |

---

## 相关文档

- [伤害系统.md](../GAS/伤害系统.md) - GA_Attacked / GE_Damage_Detect
- [体力系统.md](../GAS/体力系统.md) - Stamina 属性监听
- [BP_Character_Game.md](../../00-通用逻辑/核心类/BP_Character_Game.md) - 角色基类
- [GM_Core.md](../../00-通用逻辑/核心类/GM_Core.md) - 淘汰/完成档案管理
- [PC_Core.md](../../00-通用逻辑/核心类/PC_Core.md) - HandlePlayerEliminate 后续处理
- [BP_FinishLine.md](../场景/功能组件/BP_FinishLine.md) - 终点线触发器
- [BP_StartLine.md](../场景/功能组件/BP_StartLine.md) - 起点线触发器
