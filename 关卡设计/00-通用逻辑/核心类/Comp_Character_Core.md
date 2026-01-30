# Comp_Character_Core（Character 组件基类）

**职责**：所有关卡通用的 Character 层面逻辑

**父类**：ActorComponent

**挂载于**：BP_Character_Game（在 InitPlayer 里根据 LevelCharacterComponentClass 动态添加）

**实现状态**：✅ 已完成（Phase 0.5）

> [!NOTE]
> **设计意图**：抽离所有关卡共性的 Character 层面逻辑，避免重复实现。关卡特化组件（如 Comp_Character_Endurance、Comp_Character_Sacrifice）继承此基类，只需实现关卡专属逻辑。

---

## 概述

Comp_Character_Core 是所有关卡 Character 组件的基类，负责：
- ASC 初始化和事件绑定
- 玩家开始/完成处理（碰撞切换、标签管理）
- 关卡技能集管理（赋予/清理）

**子类职责**：
- 关卡专属的属性监听（如 HP、Stamina）
- 关卡专属的标签监听（如 Running、Crouching）
- 关卡专属的死亡处理
- 关卡专属的玩法逻辑（如道具系统、玻璃站立检测）

---

## 组件复制配置（Class Defaults）

| 属性 | 值 | 说明 |
|------|:---:|------|
| **Component Replicates** | ✅ | 组件变量需要同步到客户端 |

> [!IMPORTANT]
> **动态组件同步**：必须在服务端执行 `Add Actor Component`（通过 `Switch Has Authority`）。组件开启 `Component Replicates` 后由系统自动同步。详见 [BP_Character_Game.md](BP_Character_Game.md#initplayer-流程)。

---

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| BP_Character | BP_Character_Game | 缓存的角色引用 |
| ASC | AbilitySystemComponent | 缓存的 ASC 引用 |
| GSCCore | GSCCoreComponent | 缓存的 GSCCore 引用（用于绑定事件） |

---

## 关键逻辑

### Event BeginPlay

```blueprint
Event BeginPlay
    ↓
Cast (GetOwner()) To BP_Character_Game
    ↓
SET BP_Character = Cast<BP_Character_Game>(GetOwner())
    ↓
K2_SetTimerDelegate(
    bLooping = true,
    Event = Delegate(InitComp on self),
    Time = GetWorldDeltaSeconds()
)
```

**说明**：
- 缓存 BP_Character 引用
- 启动 Timer 循环调用 InitComp，等待 ASC 初始化

---

### InitComp（自定义事件）

```blueprint
Event InitComp
    ↓
Is Valid (GetAbilitySystemComponent(BP_Character))
    ↓ Is Valid
K2_ClearTimer(FunctionName = "InitComp")
    ↓
SET ASC = GetAbilitySystemComponent(BP_Character)
    ↓
SET GSCCore = BP_Character.GSCCore
    ↓
AsyncAction: Wait for Gameplay Event (Gameplay.Event.Player.Started)
    → Event Received → HandlePlayerStart()
    ↓
AsyncAction: Wait for Gameplay Event (Gameplay.Event.Player.Finished)
    → Event Received → HandlePlayerFinish()
```

**说明**：
- 等待 ASC 初始化完成
- 缓存 ASC 和 GSCCore 引用（用于子类绑定属性/标签监听）
- 绑定 Gameplay.Event.Player.Started → HandlePlayerStart
- 绑定 Gameplay.Event.Player.Finished → HandlePlayerFinish
- ASC 初始化完成后清除 Timer

**子类扩展点**：
- 子类可以 Override InitComp，通过 `Parent: InitComp` 调用父类逻辑
- 然后添加子类的事件绑定（如属性监听、标签监听）

> [!IMPORTANT]
> **子类必须检查变量有效性**：父类 InitComp 中的 `Is Valid` 判断只控制父类内部的执行分支，不会阻止子类继续执行。因此子类在使用 `ASC`、`GSCCore` 等变量前，必须自己检查 `Is Valid`，只有当变量有效时才执行绑定操作，避免空引用报错。如果变量无效，Timer 会继续循环调用 InitComp 直到初始化完成。

---

### HandlePlayerStart（函数）

```blueprint
Event HandlePlayerStart
    ↓
BP_Character.CapsuleComponent.SetCollisionObjectType(PawnBlock)
    ↓
ASC.BP_ApplyGameplayEffectToSelf(GE_Start)
    ↓
GiveAbilitySet()
```

**说明**：
- 切换碰撞通道（Pawn → PawnBlock）：防止玩家在起点线后互相穿透
- 应用 GE_Start：添加 Player.State.Started 标签
- 赋予关卡技能集（通过 GiveAbilitySet 函数）

**触发时机**：
- 玩家穿过 BP_StartLine 时，BP_StartLine 发送 Gameplay.Event.Player.Started
- InitComp 中绑定的 AsyncAction 监听到事件后调用此函数

---

### HandlePlayerFinish（函数）

```blueprint
Event HandlePlayerFinish
    ↓
ASC.BP_ApplyGameplayEffectToSelf(GE_Finish) ← 添加 Player.State.Finished 标签
    ↓
BP_Character.CapsuleComponent.SetCollisionObjectType(Pawn)
    ↓
ClearAbilitySet()
```

**说明**：
- 应用 GE_Finish：添加 Player.State.Finished 标签
- 切换碰撞通道（PawnBlock → Pawn）：允许完成的玩家自由移动
- 清理关卡技能集（通过 ClearAbilitySet 函数）

**触发时机**：
- 玩家到达 BP_FinishLine 时，BP_FinishLine 发送 Gameplay.Event.Player.Finished
- InitComp 中绑定的 AsyncAction 监听到事件后调用此函数

---

### GiveAbilitySet（函数）

**类型**：函数

```blueprint
Event GiveAbilitySet
    ↓
BP_Character.MyPS.AbilitySystemComponent.GiveAbilitySet(
    InAbilitySet = BP_Character.LevelAbilitySet
)
    ↓
SET BP_Character.MyPS.CurrentAbilitySetHandle = OutHandle
```

**说明**：
- 赋予关卡技能集到 ASC
- 将返回的 Handle 存储到 BP_Character.MyPS.CurrentAbilitySetHandle
- Server 和 Client 都执行，确保 Handle 同步

**关卡技能集来源**：
- BP_Character.LevelAbilitySet 由 GM_Core.InitPlayer 设置
- 每个关卡的 GM 配置不同的 LevelAbilitySet（如 AbilitySet_Endurance、AbilitySet_Sacrifice）

---

### ClearAbilitySet（函数）

**类型**：函数

```blueprint
Event ClearAbilitySet
    ↓
Sequence
    ├─ then_0: 清理技能集
    │   If (! IsEmpty(BP_Character.MyPS.CurrentAbilitySetHandle.AbilitySetPathName))
    │       ↓ 真
    │       BP_Character.MyPS.AbilitySystemComponent.ClearAbilitySet(
    │           InAbilitySetHandle = BP_Character.MyPS.CurrentAbilitySetHandle
    │       )
    │
    └─ then_1: 清空 Handle
        SET BP_Character.MyPS.CurrentAbilitySetHandle = GSCAbilitySetHandle(...)
```

**说明**：
- 使用 Sequence 节点并行执行两个分支
- then_0: 检查 Handle 是否有效（AbilitySetPathName 不为空），如果有效则清理技能集
- then_1: 清空 Handle 变量（使用空的 GSCAbilitySetHandle）
- 清理技能集会移除 Abilities、Attributes、Effects、Owned Tags
- Server 和 Client 都执行

---

## 事件绑定

在 InitComp 时绑定以下事件监听：
- `Gameplay.Event.Player.Started` → HandlePlayerStart
- `Gameplay.Event.Player.Finished` → HandlePlayerFinish

---

## 子类实现指南

### 继承关系

```
Comp_Character_Core（基类）
    ├─ Comp_Character_Endurance（关卡1）
    ├─ Comp_Character_Sacrifice（关卡5）
    └─ Comp_Character_XXX（未来关卡）
```

### 子类职责

1. **关卡专属变量**：根据关卡玩法需求定义（如移动检测阈值、玻璃面板引用等）

2. **关卡专属函数**：实现关卡特有的逻辑（如属性监听、标签监听、死亡处理、玩法机制等）

3. **扩展 InitComp**（可选）：
   - Override InitComp，调用 `Parent: InitComp` 执行基类逻辑
   - 添加子类的事件绑定（如属性监听、标签监听）
   - **必须检查变量有效性**（`Is Valid (GSCCore)` 等），避免空引用报错

---

## 相关文档

- [BP_Character_Game.md](BP_Character_Game.md) - 角色基类，InitPlayer 流程
- [GM_Core.md](GM_Core.md) - InitPlayer 中设置 LevelAbilitySet
- [系统架构.md](../系统架构.md) - Core 层架构说明
- [Comp_Character_Endurance.md](../../01-耐力之匣/架构/Comp_Character_Endurance.md) - 关卡1 子类实现参考
- [Comp_Character_Sacrifice.md](../../05-牺牲之匣/架构/Comp_Character_Sacrifice.md) - 关卡5 子类实现参考
