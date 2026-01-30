# Comp_Character_Endurance

**父类**：Comp_Character_Core

**职责**：关卡1 角色组件，移动状态检测 + 体力消耗管理（服务端逻辑）

**挂载于**：BP_Character_Game（在 InitPlayer 里根据 LevelCharacterComponentClass 动态添加）

**实现状态**：✅ 已完成（Phase 0.5 重构完成）

> [!NOTE]
> **继承关系**：继承自 [Comp_Character_Core](../../00-通用逻辑/核心类/Comp_Character_Core.md)，复用 ASC 初始化、玩家开始/完成处理、技能集管理等共性逻辑。子类只需实现关卡1专属的属性监听、标签监听、道具系统、死亡处理。

> [!NOTE]
> **命名规范**：`Comp_Character_xxx` 挂载在 Character 上处理服务端逻辑，`Comp_PC_xxx` 挂载在 PlayerController 上处理客户端逻辑（如 QTE UI）。

### 组件复制配置（Class Defaults）

| 属性 | 值 | 说明 |
|------|:---:|------|
| **Component Replicates** | ✅ | 组件变量（如 ThrowItemID）需要同步到客户端 |

> [!IMPORTANT]
> **动态组件同步**：必须在服务端执行 `Add Actor Component`（通过 `Switch Has Authority`）。组件开启 `Component Replicates` 后由系统自动同步。详见 [BP_Character_Game.md](../../00-通用逻辑/核心类/BP_Character_Game.md#initplayer-流程)。

## 变量

### 继承自基类（Comp_Character_Core）

| 变量名 | 类型 | 用途 |
|--------|------|------|
| BP_Character_Core | BP_Character_Game | 缓存的角色引用 |
| ASC_Core | AbilitySystemComponent | 缓存的 ASC 引用 |
| GSCCore_Core | GSCCoreComponent | 缓存的 GSCCore 引用（用于绑定事件） |

> [!NOTE]
> **变量重命名**：为了更容易区分继承自基类的变量，在蓝图中这些变量显示为 `BP_Character_Core`、`ASC_Core`、`GSCCore_Core`。

### 关卡1专属变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| IsMoving | Boolean | 当前是否移动中 |
| MovingThreshold | Float | 移动速度阈值 |
| ExhaustedThreshold | Float | 力竭退出阈值（默认 15） |

## 关键逻辑

### 继承自基类的函数

以下函数已在 [Comp_Character_Core](../../00-通用逻辑/核心类/Comp_Character_Core.md) 中实现，子类无需重复实现。如需了解详细逻辑，请参考基类文档。

| 函数名 | 说明 |
|--------|------|
| **Event BeginPlay** | 缓存 BP_Character 引用，启动 InitComp Timer |
| **InitComp** | 等待 ASC 初始化，绑定 Started/Finished 事件（子类通过 Override 扩展） |
| **HandlePlayerStart** | 切换碰撞通道、添加 Started 标签、赋予技能集 |
| **HandlePlayerFinish** | 添加 Finished 标签、切换碰撞通道、清理技能集 |
| **GiveAbilitySet** | 赋予关卡技能集到 ASC |
| **ClearAbilitySet** | 清理关卡技能集 |

> [!NOTE]
> **子类不应该重写这些函数**，除非有特殊需求。如果需要在初始化时添加额外逻辑，应该通过 Override InitComp 并调用 Parent: InitComp 来扩展。

### InitComp（Override）

```blueprint
Event InitComp (Override)
    ↓
Parent: InitComp ← 调用父类逻辑（等待ASC、绑定Started/Finished事件）
    ↓
Is Valid (GSCCore_Core)
    ↓ Is Valid
Bind Event to On Gameplay Tag Change (GSCCore_Core) → HandleTagChanged
    ↓
Bind Event to On Attribute Change (GSCCore_Core) → HandleAttributeChanged
```

**说明**：
- 调用父类 InitComp，完成 ASC 初始化和基础事件绑定
- **关键**：必须检查 `Is Valid (GSCCore_Core)`，因为父类的 Is Valid 判断不会影响子类执行流程
- 只有当 GSCCore_Core 有效时才绑定事件，避免空引用报错
- 如果 GSCCore_Core 无效，Timer 会继续循环调用 InitComp 直到初始化完成
- 添加关卡1专属的属性监听（Stamina、Health）
- 添加关卡1专属的标签监听（Running、Crouching）

---

### Event Tick

```blueprint
Event Tick (DeltaSeconds)
    ↓
HandleMoving()
```

**说明**：
- 每帧调用 HandleMoving 检测玩家移动状态
- HandleMoving 会根据速度应用/移除 GE_Moving 效果

---

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
    ├─ True → ASC_Core.ApplyGameplayEffectToSelf (GE_StaminaDrain_Sprint)
    └─ False → ASC_Core.RemoveActiveGameplayEffectBySourceEffect (GE_StaminaDrain_Sprint, Stacks = -1)
```

### HandleCrouching（函数）

```
ASC_Core.ApplyGameplayEffectToSelf (GE_Moving)
    ↓
Delay (0.2s)
    ↓
ASC_Core.RemoveActiveGameplayEffectBySourceEffect (GE_Moving, Stacks = -1)
```

### HandleStaminaChanged（函数）

```
ASC_Core.Has Matching Gameplay Tag (Player.State.Exhausted)?
    ├─ 否（未力竭） → Stamina <= 0? → ASC_Core.ApplyGameplayEffectToSelf (GE_Exhausted)
    └─ 是（已力竭） → Stamina >= ExhaustedThreshold? → ASC_Core.RemoveActiveGameplayEffectBySourceEffect (GE_Exhausted)
```

### HandleHealthChanged（函数）

```blueprint
If (GetFloatAttributeFromAbilitySystemComponent(ASC_Core, BAS_Core.Health) <= 0 
    AND NOT ASC_Core.HasMatchingGameplayTag(Player.State.Dead))
    ↓ True
    ASC_Core.BP_ApplyGameplayEffectToSelf (GE_Dead)
        ↓
    Switch Has Authority → Authority:
        ↓
    SphereOverlapActors (
        ActorClassFilter: BP_Character_Game,
        ActorsToIgnore: [BP_Character_Core],
        ObjectTypes: [],
        SpherePos: BP_Character_Core.K2_GetActorLocation(),
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
            ├─ Multicast_OnDeath() ← 立即播放死亡表现
            ├─ SendGameplayEventToActor (BP_Character_Core, Gameplay.Event.Player.Eliminated)
            └─ SpawnDeadCoin() ← 延迟1秒后掉落金币
```

> [!NOTE]
> **执行顺序优化**：死亡处理链的顺序为 Multicast_OnDeath → SendGameplayEventToActor → SpawnDeadCoin，确保玩家立即看到死亡表现，然后通知系统处理淘汰逻辑，最后掉落金币。

---

### SpawnDeadCoin（函数）

```blueprint
Event SpawnDeadCoin
    ↓
Delay (1s)
    ↓
For Loop (1 to FFloor(GetFloatAttribute(ASC_Core, BAS_Core.Coin)))
    ↓ LoopBody
    SpawnActor (BP_Item_Coin)
        ├─ Location: BP_Character_Core.GetActorLocation() + RandomXY(0~80)
        ├─ InitialState: InField
        └─ Instigator: BP_Character_Core
```

### Multicast_OnDeath（Custom Event）

**类型**：NetMulticast, Reliable

```blueprint
Event Multicast_OnDeath
    ↓
BP_Character_Core.CapsuleComponent.SetCollisionEnabled (NoCollision)
    ↓
BP_Character_Core.Mesh.SetCollisionEnabled (QueryAndPhysics)
    ↓
BP_Character_Core.Mesh.SetSimulatePhysics (true)
    ↓
BP_Character_Core.CharacterMovement.DisableMovement()
```

---

### HandleMoving（函数）

```
Switch Has Authority
    ↓ Authority
Is Valid (ASC_Core)
    ↓ Is Valid
速度 >= MovingThreshold?
    ├── True → NOT IsMoving? → Apply GE_Moving → SET IsMoving = true
    └── False → IsMoving? → Remove GE_Moving → SET IsMoving = false
```

---

## 道具系统接口

### 新增变量

| 变量名 | 类型 | 复制 | 说明 |
|--------|------|:----:|------|
| ThrowItemID | DataTableRowHandle | ✅ RepNotify | 当前持有的投掷道具 ID |
| ThrowItemData | S_ItemData | ❌ | 缓存的道具数据（由 OnRep 查表填充） |
| PropInHandComp | StaticMeshComponent | ❌ | 手持道具组件引用 |
| DeathEffectRadius | Float | ❌ | 死亡广播范围（厘米），默认 500.0 |

### 新增函数

| 函数 | 权限 | 说明 |
|------|------|------|
| `SetThrowItemID(NewItemID)` | Any | 设置 ThrowItemID（由 RepNotify 自动同步） |
| `OnRep_ThrowItemID` | Client | RepNotify，查表更新 ThrowItemData |
| `GetThrowItemID()` | Any | 获取当前持有道具 ID |
| `ClearThrowItemID()` | Server | 清空持有道具（服务端权限检查） |
| `Multicast_ShowPropInHand(IsShow)` | NetMulticast | 同步显示/隐藏手持道具 |
| `ShowPropInHand()` | Local | 动态添加组件并附加到 Socket |
| `ClearPropInHand()` | Local | 销毁手持道具组件 |

### SetThrowItemID(NewItemID)

```blueprint
Event SetThrowItemID
    ↓
SET ThrowItemID = NewItemID
```

**说明**：
- ThrowItemID 是 RepNotify 变量，服务端设置后会自动同步到客户端
- 客户端收到同步后会触发 OnRep_ThrowItemID

---

### GetThrowItemID()

```blueprint
Event GetThrowItemID
    ↓
Return ThrowItemID
```

---

### ClearThrowItemID()

```blueprint
Event ClearThrowItemID
    ↓
Switch Has Authority
    ↓ Authority
    SET ThrowItemID = DataTableRowHandle(...)
    SET ThrowItemData = S_ItemData(...)
```

**说明**：
- 服务端权限检查（Switch Has Authority）
- 清空 ThrowItemID 和 ThrowItemData
- ThrowItemID 的清空会通过 RepNotify 同步到客户端

---

### OnRep_ThrowItemID

**类型**：RepNotify

```blueprint
Event OnRep_ThrowItemID
    ↓
Call OnThrowItemChanged (ThrowItemID)
    ↓
If (ThrowItemID.RowName != None)
    ├─ True → Get Data Table Row → SET ThrowItemData
    └─ False → SET ThrowItemData = 空结构体
```

**说明**：
- 当 ThrowItemID 变量同步到客户端时自动触发
- 触发 OnThrowItemChanged 事件（用于 UI 更新）
- 根据 ThrowItemID 查表更新 ThrowItemData

### Multicast_ShowPropInHand(IsShow)

**类型**：NetMulticast, Reliable

```
IsShow?
    ├─ True → ShowPropInHand()
    └─ False → ClearPropInHand()
```

### ShowPropInHand

```
AddComponentByClass (StaticMeshComponent)
    ↓
SET PropInHandComp
    ↓
SetStaticMesh (ThrowItemData.PropMesh)
    ↓
AttachToComponent (BP_Character_Core.Mesh, Socket_Throw)
```

### ClearPropInHand

```
If (IsValid(PropInHandComp))
    ↓ True
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

- [Comp_Character_Core.md](../../00-通用逻辑/核心类/Comp_Character_Core.md) - Character 组件基类
- [伤害系统.md](../GAS/伤害系统.md) - GA_Attacked / GE_Damage_Detect
- [体力系统.md](../GAS/体力系统.md) - Stamina 属性监听
- [BP_Character_Game.md](../../00-通用逻辑/核心类/BP_Character_Game.md) - 角色基类，档案管理事件监听
- [PC_Core.md](../../00-通用逻辑/核心类/PC_Core.md) - HandlePlayerEliminate 后续处理
- [BP_FinishLine.md](../场景/功能组件/BP_FinishLine.md) - 终点线触发器
- [BP_StartLine.md](../场景/功能组件/BP_StartLine.md) - 起点线触发器
