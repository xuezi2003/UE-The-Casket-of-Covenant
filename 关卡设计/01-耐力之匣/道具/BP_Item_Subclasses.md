# BP_Item 子类

> 所有道具子类的实现文档，继承自 [BP_Item_Base](BP_Item_Base.md)。

---

## BP_Item_Banana

**路径**：`Content/0_/Level/1_Endurance/BP/Actor/Item_Actor/Items/BP_Item_Banana`

**父类**：BP_Item_Base

**效果**：
- Flying 命中玩家 → 触发失衡（非投掷者）
- Flying 命中地面/障碍物 → 转为 Trap 状态
- Trap 状态被踩 → 触发失衡

### 重写函数

#### OnHit (Override) ✅

**输入**：HitActor (Actor)
**权限**：Server（Has Authority）

```
Event OnHit
    ↓
Switch Has Authority
    └─ Authority ↓
Call Parent: OnHit(HitActor)
    ↓
Cast HitActor to BP_Character_Game
    ├─ 成功 ↓
    │   HitActor != Instigator?  ← 不能打自己
    │       └─ True ↓
    │       SendGameplayEventToActor (HitActor, Gameplay.Event.Activate.Stagger)
    │           ↓
    │       DestroyActor
    │
    └─ 失败（命中地面/障碍物）↓
        SMComp.GetInstance().SwitchActiveStateByQualifiedName("Trap")
```

#### OnTrap (Override) ✅

**输入**：TrappedCharacter (BP_Character_Game)
**权限**：Server（需在子类检查 Has Authority）

```
Event OnTrap
    ↓
Call Parent: OnTrap(TrappedCharacter)
    ↓
Switch Has Authority
    └─ Authority ↓
SendGameplayEventToActor (TrappedCharacter, Gameplay.Event.Activate.Stagger)
    ↓
DestroyActor
```

> [!NOTE]
> `OnTrapTriggered` Event Dispatcher 已在 BP_Item_Base 定义，Phase 9 做特效/音效时再调用。

---

## BP_Item_Bomb

**路径**：`Content/0_/Level/1_Endurance/BP/Actor/Item_Actor/Items/BP_Item_Bomb`

**父类**：BP_Item_Base

**效果**：
- 命中玩家 → 目标摔倒（排除投掷者），Bomb 销毁
- 命中地面/障碍物 → 范围检测，附近所有玩家摔倒（排除投掷者）

### 重写函数

#### OnHit (Override) ✅

**输入**：HitActor (Actor)
**权限**：Server

**变量**：
| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| BombRadius | Float | 300 | 爆炸范围半径 |

```
Event OnHit
    ↓
Switch Has Authority
    └─ Authority ↓
Call Parent: OnHit(HitActor)
    ↓
Cast HitActor to BP_Character_Game
    ├─ 成功 ↓
    │   HitActor != Instigator?  ← 不能炸自己
    │       └─ True ↓
    │       SendGameplayEventToActor (HitActor, Gameplay.Event.Activate.Fall)
    │           ↓
    │       DestroyActor
    │
    └─ 失败（命中地面/障碍物）↓
        SphereOverlapActors (Pos=Self.Location, Radius=BombRadius, 
                             Class=BP_Character_Game, Ignore=[Instigator])
            ↓
        DrawDebugSphere (调试用，Phase 9 移除)
            ↓
        For Each (OutActors)
            ├─ LoopBody: SendGameplayEventToActor (Actor, Gameplay.Event.Activate.Fall)
            └─ Completed: DestroyActor
```

---

## BP_Item_Lighting

**路径**：`Content/0_/Level/1_Endurance/BP/Actor/Item_Actor/Items/BP_Item_Lighting`

**父类**：BP_Item_Base

**效果**：拾取后 SpeedRate ×1.5，持续 10s

### 实现方式

通过 `ItemAbility` 字段配置 `GA_Item_Lightning`，拾取时由 `GiveAbilityAndActivateOnce` 激活。

> [!IMPORTANT]
> **Buff GA 配置要求**：`Activate on Granted` 必须关闭（❌），否则与 `GiveAbilityAndActivateOnce` 冲突导致能力被激活两次。

#### GA_Item_Lightning

**配置**：
| 配置项 | 值 |
|--------|-----|
| Activate on Granted | ❌ |
| 网络执行策略 | 服务器已启动 |

**事件图表**：
```
Event ActivateAbility
    ↓
CommitAbility → ApplyEffectContainerSpec (Item_Lightning_EffectContainer)
    ↓
EndAbility
```

#### GE_Buff_Lighting

| 配置项 | 值 |
|--------|-----|
| 持续时间 | 10s |
| Granted Tags | `Player.State.Buffed.Lightning` |
| Modifier | BAS_Core.SpeedRate, Multiply, 1.5 |

---

## BP_Item_Shield

**路径**：`Content/0_/Level/1_Endurance/BP/Actor/Item_Actor/Items/BP_Item_Shield`

**父类**：BP_Item_Base

**效果**：拾取后获得护盾，抵消一次攻击或检测伤害减半

### 实现方式

通过 `ItemAbility` 字段配置 `GA_Item_Shield`，拾取时由 `GiveAbilityAndActivateOnce` 激活。

#### GA_Item_Shield

**配置**：
| 配置项 | 值 |
|--------|-----|
| Activate on Granted | ❌ |
| 网络执行策略 | 服务器已启动 |

**事件图表**：
```
Event ActivateAbility
    ↓
CommitAbility → ApplyEffectContainerSpec (Item_Shield_EffectContainer)
    ↓
EndAbility
```

#### GE_Buff_Shield

| 配置项 | 值 |
|--------|-----|
| 持续时间 | 30s |
| Granted Tags | `Player.State.Buffed.Shield` |

### 护盾消耗逻辑

需要在以下位置检查 `Player.State.Buffed.Shield`：
- GA_Stagger：被推搡时
- GA_Fall：被炸弹击中时
- BP_Monitor：被检测时（伤害减半）

---

## BP_Item_MedicalKit

**路径**：`Content/0_/Level/1_Endurance/BP/Actor/Item_Actor/Items/BP_Item_MedicalKit`

**父类**：BP_Item_Base

**效果**：拾取后 HP +50

### 实现方式

通过 `ItemAbility` 字段配置 `GA_Item_MedicalKit`，拾取时由 `GiveAbilityAndActivateOnce` 激活。

#### GA_Item_MedicalKit

**配置**：
| 配置项 | 值 |
|--------|-----|
| Activate on Granted | ❌ |
| 网络执行策略 | 服务器已启动 |

**事件图表**：
```
Event ActivateAbility
    ↓
CommitAbility → ApplyEffectContainerSpec (Item_MedicalKit_EffectContainer)
    ↓
EndAbility
```

#### GE_Buff_MedicalKit

| 配置项 | 值 |
|--------|-----|
| 持续时间 | Instant |
| Modifier | BAS_Core.HP, Add, 50 |

---

## BP_Item_Coin

**路径**：`Content/0_/Level/1_Endurance/BP/Actor/Item_Actor/Items/BP_Item_Coin`

**父类**：BP_Item_Base

**效果**：拾取后 Coin +1

### 实现方式

通过 `ItemAbility` 字段配置 `GA_Item_Coin`。

#### GA_Item_Coin

```
Event ActivateAbility
    ↓
ApplyGameplayEffectToSelf (GE_Item_Coin)
    ↓
EndAbility
```

#### GE_Resource_Coin

| 配置项 | 值 |
|--------|-----|
| 持续时间 | Instant |
| Modifier | BAS_Core.Coin, Add, 1 |

---

## 相关文档

- [BP_Item_Base.md](BP_Item_Base.md) - 道具基类
- [道具系统.md](道具系统.md) - 系统概述
- [瞄准投掷系统.md](瞄准投掷系统.md) - GA_Aim / GA_Throw
