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

### WaitForASC（自定义事件）✅

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

### HandleAttributeChanged（自定义事件）

参数：Attribute, DeltaValue, EventTags

```
Switch on Gameplay Attribute (Attribute)
    ↓
BAS_Core.Stamina → HandleStaminaChanged
BAS_Core.Health → HandleHealthChanged
```

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

```
ApplyGameplayEffectToSelf (GE_Moving)
    ↓
Delay (0.2s)
    ↓
RemoveActiveGameplayEffectBySourceEffect (GE_Moving, Stacks = -1)
```

### HandleStaminaChanged（函数）

```
Has Matching Gameplay Tag (Player.State.Exhausted)?
    ├─ 否（未力竭） → Stamina <= 0? → ApplyGameplayEffectToSelf (GE_Exhausted)
    └─ 是（已力竭） → Stamina >= ExhaustedThreshold? → RemoveActiveGameplayEffectBySourceEffect (GE_Exhausted)
```

### HandleHealthChanged（函数）✅

```blueprint
If (GetFloatAttributeFromAbilitySystemComponent(ASC, BAS_Core.Health) <= 0 
    AND NOT ASC.HasMatchingGameplayTag(Player.State.Dead))
    ↓ True
    ASC.BP_ApplyGameplayEffectToSelf (GE_Dead)
        ↓
    Switch Has Authority → Authority:
        ↓
    SphereOverlapActors (
        ActorClassFilter: BP_Character_Game,
        ActorsToIgnore: [BP_Character],
        ObjectTypes: [],
        SpherePos: BP_Character.K2_GetActorLocation(),
        SphereRadius: DeathEffectRadius
    )
        ↓
    Sequence
        ├─ then_0: 死亡广播
        │   For Each in OutActors:
        │       Cast to Character
        │           → SendGameplayEventToActor (Gameplay.Event.Activate.Stagger.DeathBroadcast)
        │
        └─ then_1: 死亡处理链
            ├─ SpawnDeadCoin()
            ├─ Multicast_OnDeath()
            └─ SendGameplayEventToActor (BP_Character, Gameplay.Event.Player.Eliminated)
```

### HandlePlayerStart（函数）✅

```blueprint
Event HandlePlayerStart
    ↓
BP_Character.CapsuleComponent.SetCollisionObjectType(PawnBlock)
```

---

### HandlePlayerFinish（函数）✅

```blueprint
Event HandlePlayerFinish
    ↓
ASC.BP_ApplyGameplayEffectToSelf(GE_Finish)
    ↓
BP_Character.CapsuleComponent.SetCollisionObjectType(Pawn)
```

---

### SpawnDeadCoin（函数）✅

```blueprint
Event SpawnDeadCoin
    ↓
Delay (1s)
    ↓
For Loop (1 to FFloor(GetFloatAttribute(BAS_Core.Coin)))
    ↓ LoopBody
    SpawnActor (BP_Item_Coin)
        ├─ Location: BP_Character.GetActorLocation() + RandomXY(0~80)
        ├─ InitialState: InField
        └─ Instigator: BP_Character
```

### Multicast_OnDeath（Custom Event）✅

**类型**：NetMulticast, Reliable

```blueprint
Event Multicast_OnDeath
    ↓
BP_Character.CapsuleComponent.SetCollisionEnabled (NoCollision)
    ↓
BP_Character.Mesh.SetCollisionEnabled (QueryAndPhysics)
    ↓
BP_Character.Mesh.SetSimulatePhysics (true)
    ↓
BP_Character.CharacterMovement.DisableMovement()
```

---

### HandleMoving（函数）

```
Switch Has Authority
    ↓ Authority
Is Valid (ASC)
    ↓ Is Valid
速度 >= MovingThreshold?
    ├── True → NOT IsMoving? → Apply GE_Moving → SET IsMoving = true
    └── False → IsMoving? → Remove GE_Moving → SET IsMoving = false
```

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
- [BP_Character_Game.md](../../00-通用逻辑/核心类/BP_Character_Game.md) - 角色基类，档案管理事件监听
- [PC_Core.md](../../00-通用逻辑/核心类/PC_Core.md) - HandlePlayerEliminate 后续处理
- [BP_FinishLine.md](../场景/功能组件/BP_FinishLine.md) - 终点线触发器
- [BP_StartLine.md](../场景/功能组件/BP_StartLine.md) - 起点线触发器
