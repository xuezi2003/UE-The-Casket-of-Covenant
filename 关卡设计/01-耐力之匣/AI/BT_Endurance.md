# 耐力之匣 AI 设计文档

**父类**：BehaviorTree

**实现状态**：✅ 已完成

---

## 一、设计概览

### AI 能力清单

**会做的**：走走停停移动、红灯偷偷动、绿灯推搡/闪避、被动拾取道具  
**不会做的**：跳跃、蹲行、主动找道具、瞄准投掷、躲避障碍物

> **详细结构**：参见"四、行为树结构"章节

---

## 二、架构集成

> **核心原则**：行为树只负责 AI 决策逻辑，档案管理、网络同步、死亡表现等由现有架构自动处理。

### 职责边界

| 职责 | 行为树 | 现有架构 |
|------|:------:|:--------:|
| **决策逻辑** | ✅ 红绿灯行为选择、移动目标、技能激活时机 | - |
| **档案管理** | - | ✅ PlayerNum 分配、IsEliminated/IsFinished 更新 |
| **网络同步** | - | ✅ GAS 自动复制、Character Movement 自动复制 |
| **表现逻辑** | - | ✅ 死亡表现、外观加载、QTE 响应、完成检测 |

### 数据流向

**输入**：IsRedLight (GS_Endurance)、FinishLineActor (场景)、NearbyPlayers (SphereOverlap)、Player.State.* (GAS 标签)  
**输出**：移动 (MoveTo → 自动复制)、技能激活 (GAS → 自动复制)

### 网络架构

- 行为树只在 **Dedicated Server** 运行（HasAuthority）
- 通过 **GAS** 和 **Character Movement** 自动同步到客户端
- 客户端只看到结果（移动、动画、效果），不知道决策过程

### 系统集成点

| 系统 | 集成方式 | 说明 |
|------|----------|------|
| **GM_Endurance** | Level Behavior Tree = BT_Endurance | 配置行为树资产 |
| **AIC_Core** | OnPossess → Run Behavior Tree | 自动运行行为树 |
| **GS_Endurance** | IsRedLight (RepNotify) | Service 读取红绿灯状态 |
| **SM_Endurance** | 设置 IsRedLight | 状态机控制红绿灯 |
| **BP_StartLine** | OnOverlap → GE_Started | 添加 Player.State.Started 标签 |
| **BP_FinishLine** | OnOverlap → 发送 Finished 事件 | 完成检测 |
| **GAS** | GE_Dead、GE_Started | 添加状态标签 |
| **NavMesh** | MoveTo Task | 寻路系统 |

---

## 三、Blackboard 数据结构（BB_Endurance）

| 键名 | 类型 | 说明 |
|------|------|------|
| **SelfActor** | Object (Actor) | AI Pawn 自己的引用（用于 Check Gameplay Tag Condition Decorator） |
| **IsRedLight** | Bool | 当前是否红灯 |
| **HasNearbyPlayers** | Bool | 附近是否有玩家（半径 120） |
| **ShouldDodge** | Bool | 是否应该闪避（检测到推搡标签） |
| **FinishLineActor** | Object (Actor) | 终点线引用 |
| **TargetLocation** | Vector | 当前目标位置（红灯偷偷动、绿灯移动） |
| **TargetPlayer** | Object (Actor) | 当前推搡目标（推搡分支使用） |
| **SelectedIndex** | Int | 加权随机选中的索引（用于红灯二选一、闪避二选一、推搡二选一） |

**设计说明**：
- **SelfActor**：指向 AI Pawn 自己，用于 Check Gameplay Tag Condition Decorator 查询 ASC 标签
- **HasNearbyPlayers**：替代 NearbyPlayers 数组，用 Bool 判断是否有附近玩家（性能更好）
- **GameplayTag 查询**：使用 Check Gameplay Tag Condition Decorator 直接查询 SelfActor 的标签，无需在 Blackboard 中存储标签值
- **SelectedIndex**：配合 BTService_WeightedRandomSelector 和 BTDecorator_IndexMatch 实现加权随机选择

---

## 四、行为树结构（BT_Endurance）

### 4.1 顶层结构概览

> **⚠️ 关键架构限制**：  
> 根据 UE 官方文档，Root 节点不支持添加 Decorator 和 Service。  
> **更重要的是**：如果 Decorator 和 Service 附加在 Root 的**直接子节点**上，它们也会被忽略！  
> **解决方案**：在 Root 和实际逻辑节点之间添加一个**中间层 Sequence**，确保 Decorator 和 Service 不在 Root 的直接子节点上。

```
Root
└─ Sequence（中间层，确保 Decorator 生效）
    └─ Selector（根 Selector）
        ├─ Decorator: Check End Tag (Player.State.Dead 和 Player.State.Finished 都不存在)
        ├─ Decorator: Check Game Phase (Match.Phase.Main.InProgress 存在)
        ├─ Service: BTS_UpdatePerception (0.5s)
        │
        ├─ 【分支0：走出起点线】
        │   └─ Sequence
        │       ├─ Decorator: Check Start Tag (inversed, Player.State.Started 不存在)
        │       ├─ BTTask_GetLocationBeyondStartLine
        │       └─ MoveTo (TargetLocation)
        │
        ├─ 【分支1：红绿灯逻辑】
        │   └─ Sequence
        │       ├─ Decorator: Check Start Tag (Player.State.Started 存在)
        │       └─ Selector "红绿灯选择器"
        │           ├─ 红灯行为
        │           │   └─ Sequence
        │           │       ├─ Decorator: CheckIsRedLight (Observer Aborts: Lower Priority)
        │           │       └─ Selector（二选一：原地不动 80% / 往前偷偷动 20%）
        │           │
        │           └─ 绿灯行为
        │               └─ Sequence
        │                   ├─ Decorator: CheckIsGreenLight
        │                   └─ Selector
        │                       ├─ 战斗行为（闪避 / 推搡）
        │                       └─ 移动行为（向前移动 80% / 等待 20%）
        │
        └─ 【兜底：Wait Task】
            └─ Wait (0.5s ± 0.1s)
```

> **详细结构**：参见下方各小节

> **⚠️ 重要说明**：
> - 中间层 Sequence 必须保留，否则 Decorator 会被忽略
> - 根 Selector 末尾的 Wait Task 是兜底方案，确保 Service 能正常更新（当所有分支都失败时，树会快速重启导致 Service 无法更新）
> - Check Game Phase 确保 AI 只在 InProgress 阶段执行
> - Check End Tag 同时检查 Dead 和 Finished 标签

**行为树停止机制（双重保险）**：

1. **Check End Tag Decorator**：
   - 作用：阻止行为树执行新的分支
   - 触发条件：AI 死亡（`Player.State.Dead`）或完成（`Player.State.Finished`）
   - 效果：行为树停滞在 root，无法执行任何分支

2. **StopLogic（AIC_Core）**：
   - 作用：完全停止行为树 Tick，节省性能
   - 触发条件：监听 `Gameplay.Event.Player.Eliminated` 和 `Gameplay.Event.Player.Finished` 事件
   - 效果：行为树彻底停止，不再 Tick
   - 详见：[AIC_Core.md](../../00-通用逻辑/核心类/AIC_Core.md#event-on-possess-) 中的事件监听实现

**为什么需要双重保险？**
- Decorator 作为第一道防线，立即阻止行为树执行新的分支
- StopLogic 作为第二道防线，彻底停止行为树 Tick，节省性能
- 两者配合，确保 AI 死亡/完成后行为树彻底停止

---

### 4.2 走出起点线详细结构

```
【分支0：走出起点线】
└─ Sequence
    ├─ Decorator: Check Gameplay Tag Condition - "Check Start Tag"
    │   └─ Actor to Check: SelfActor
    │       Gameplay Tags: Player.State.Started
    │       Inverse Condition: True（没有 Started 标签时执行）
    │
    ├─ BTTask_GetLocationBeyondStartLine
    │   └─ Target Location Key: TargetLocation
    │       Ahead Distance: 100.0
    │
    └─ MoveTo (TargetLocation, Radius: 50)
```

**设计说明**：
- **用途**：解决后续关卡 AI 在起点线内还原的问题
- **触发条件**：AI 没有 Player.State.Started 标签（还没穿过起点线）
- **执行逻辑**：
  1. 计算起点线前方 100cm 的位置
  2. 移动到目标位置
  3. 穿过起点线时，BP_StartLine 触发，添加 Player.State.Started 标签
  4. 下次循环时，Check Start Tag (inversed) 失败，跳过这个分支，进入红绿灯逻辑
- **优先级**：最高（在红绿灯分支之前），确保 AI 先走出起点再执行其他逻辑
- **适用场景**：
  - 第一关：AI 在起点线外生成 → 已有 Started 标签 → 跳过此分支 → 直接进入红绿灯逻辑
  - 后续关卡：AI 在起点线内还原 → 没有 Started 标签 → 执行此分支 → 走出起点 → 再进入红绿灯逻辑

---

### 4.3 红绿灯逻辑详细结构

```
【分支1：红绿灯逻辑】
└─ Sequence
    ├─ Decorator: Check Gameplay Tag Condition - "Check Start Tag"
    │   └─ Actor to Check: SelfActor
    │       Gameplay Tags: Player.State.Started
    │       Inverse Condition: False（已有 Started 标签时执行）
    │
    └─ Selector "红绿灯选择器"
        ├─ 红灯行为
        │   └─ Sequence
        │       ├─ Decorator: Blackboard Based - "CheckIsRedLight"
        │       │   └─ Blackboard: IsRedLight is 已设置
        │       │       Key Query: Is Set
        │       │       Observer Aborts: Lower Priority（中断绿灯）
        │       │
        │       └─ Selector "RedLightSelector"（二选一）
        │           ├─ Service: BTService_WeightedRandomSelector (Weights: [0.8, 0.2])
        │           │   └─ Selected Index Key: SelectedIndex
        │           │
        │           ├─ [80%] 原地不动
        │           │   └─ Sequence
        │           │       ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 0)
        │           │       │   └─ Selected Index Key: SelectedIndex
        │           │       └─ Wait (3s ± 1s)
        │           │
        │           └─ [20%] 往前偷偷动
        │               └─ Sequence
        │                   ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 1)
        │                   │   └─ Selected Index Key: SelectedIndex
        │                   ├─ BTTask_GetLocationToFinishLine
        │                   │   └─ Finish Line Key: FinishLineActor
        │                   │       Target Location Key: TargetLocation
        │                   │       Min Distance: 50.0
        │                   │       Max Distance: 80.0
        │                   └─ MoveTo (TargetLocation, Radius: 50)
        │
        └─ 绿灯行为
            └─ Sequence
                ├─ Decorator: Blackboard Based - "CheckIsGreenLight"
                │   └─ Blackboard: IsRedLight is 未设置
                │       Key Query: Is Not Set
                │
                └─ Selector
                    ├─ 战斗行为（闪避 / 推搡）
                    └─ 移动行为（向前移动 80% / 等待 20%）
```

**设计说明**：
- **触发条件**：AI 已有 Player.State.Started 标签（已穿过起点线）
- **优先级**：在"走出起点线"分支之后，确保 AI 先走出起点再执行红绿灯逻辑
- **红绿灯切换**：通过 CheckIsRedLight Decorator 的 Observer Aborts: Lower Priority 实现红灯中断绿灯
- **适用场景**：
  - 第一关：AI 在起点线外生成 → 立即获得 Started 标签 → 直接执行红绿灯逻辑
  - 后续关卡：AI 走出起点线后 → 获得 Started 标签 → 进入红绿灯逻辑

---

### 4.4 红灯行为详细结构

> **注意**：红灯行为是红绿灯逻辑的子分支，详细结构参见 4.3 章节。

---

### 4.5 绿灯战斗行为详细结构

```
【行为组1：战斗行为】
└─ Selector "战斗行为选择器"
    │
    ├─ Decorator: Composite - "HasCombatOpportunity"
    │   └─ Observer Aborts: Lower Priority（中断移动行为）
    │       逻辑图表：
    │       OR
    │       ├─ Blackboard Based (ShouldDodge is Set, aborts lower priority)
    │       └─ Blackboard Based (HasNearbyPlayers is Set, aborts lower priority)
    │
    ├─ 闪避分支
    │   └─ Sequence
    │       ├─ Decorator: Blackboard Based (ShouldDodge is Set)
    │       ├─ Service: BTS_WeightedRandomSelector
    │       │   └─ Weights: [0.5, 0.5]
    │       │       Selected Index Key: SelectedIndex
    │       │       Interval: 0.5s, Random Deviation: 0.1s
    │       └─ Selector（闪避二选一）
    │           ├─ [50%] 闪避成功
    │           │   └─ Sequence
    │           │       ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 0)
    │           │       └─ BTTask_TriggerAbilityByClass (GA_Dodge)
    │           └─ [50%] 闪避失败
    │               └─ Sequence
    │                   ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 1)
    │                   └─ Wait (0.1s)
    │
    └─ 推搡分支
        └─ Sequence
            ├─ Decorator: Blackboard Based (HasNearbyPlayers is Set)
            ├─ Decorator: Cooldown (2.0s)
            ├─ Decorator: Check Gameplay Tag Condition - "Check Target Pushable"
            │   └─ Actor to Check: TargetPlayer
            │       Tags to Match: Any
            │       Gameplay Tags: Player.State.Dead, Player.State.Finished, Player.State.Staggered, Player.State.Fallen
            │       Inverse Condition: True
            ├─ Service: BTS_WeightedRandomSelector
            │   └─ Weights: [0.6, 0.4]
            │       Selected Index Key: SelectedIndex
            │       Interval: 0.5s, Random Deviation: 0.1s
            └─ Selector（推搡二选一）
                ├─ [60%] 推搡成功
                │   └─ Sequence
                │       ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 0)
                │       ├─ Move To
                │       │   └─ Blackboard Key: TargetPlayer
                │       │       Acceptable Radius: 100.0
                │       └─ BTTask_TriggerAbilityByClass (GA_Push)
                └─ [40%] 不推搡
                    └─ Sequence
                        ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 1)
                        └─ Wait (0.5s)
```

**设计说明**：
- **TargetPlayer 由 Service 更新**：BTService_UpdatePerception 持续更新 TargetPlayer，推搡分支直接使用
- **Check Target Pushable**：检查 TargetPlayer 是否可推搡，避免 AI 浪费时间和体力在无效目标上（死亡、已完成、失衡中、摔倒中的玩家）
- **Cooldown (2.0s)**：强制冷却，无论推搡成功还是失败，2 秒内不会再次尝试推搡，防止 AI 频繁推搡
- **Wait (0.5s)**：配合 Cooldown，"不推搡"分支等待 0.5 秒，让 AI 的决策更自然
- **不检查 Invincible**：无敌状态短暂且频繁变化，推搡无敌目标导致自己摔倒是游戏设计的惩罚机制，保留这个"犯错"的可能性增加游戏趣味性

---

### 4.6 绿灯移动行为详细结构

```
【行为组2：移动行为】
└─ Selector "移动行为选择器"
    ├─ Service: BTS_WeightedRandomSelector
    │   └─ Weights: [0.8, 0.2]
    │       Selected Index Key: SelectedIndex
    │       Interval: 0.5s, Random Deviation: 0.1s
    │
    ├─ [80%] 向前移动
    │   └─ Sequence
    │       ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 0)
    │       ├─ BTTask_GetLocationToFinishLine
    │       │   └─ Finish Line Key: FinishLineActor
    │       │       Target Location Key: TargetLocation
    │       │       Min Distance: 200.0
    │       │       Max Distance: 300.0
    │       └─ Move To (TargetLocation, Radius: 50)
    │
    └─ [20%] 等待
        └─ Sequence
            ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 1)
            └─ Wait (0.1s)
```

---

## 五、组件实现

> **详细实现**：参见 [BT_Endurance_Components](./BT_Endurance_Components.md)

本章节提供组件的简要说明，详细的变量、配置参数、实现逻辑请查阅组件文档。

### Service 组件

| 组件名 | 用途 | 关键参数 |
|--------|------|----------|
| **BTService_UpdatePerception** | 每 0.5s 更新感知信息 | Interval, TargetPlayerKey |
| **BTService_WeightedRandomSelector** | 加权随机选择 | Weights 数组（自动归一化） |

### Task 组件

| 组件名 | 用途 | 关键参数 |
|--------|------|----------|
| **BTTask_GetLocationToFinishLine** | 计算朝向终点的随机位置 | MinDistance, MaxDistance, LateralRange |
| **BTTask_GetLocationBeyondStartLine** | 计算起点线前方位置 | AheadDistance: 100.0 |
| **MoveTo**（内置） | 移动到目标位置 | Acceptable Radius |
| **Wait**（内置） | 等待指定时间 | Wait Time, Random Deviation |
| **BTTask_TriggerAbilityByClass**（GAS Companion） | 激活 GAS Ability | Ability Class |

### Decorator 组件

| 组件名 | 用途 | 关键参数 |
|--------|------|----------|
| **BTDecorator_IndexMatch** | 配合 WeightedRandomSelector 实现加权随机 | MyIndex, SelectedIndexKey |
| **BTDecorator_CheckPhase** | 检查当前游戏阶段 | CheckPhase (GameplayTag) |
| **Check Gameplay Tag Condition**（内置） | 检查 GameplayTag | Actor to Check, Gameplay Tags, Inverse Condition |
| **Blackboard Based**（内置） | 检查 Blackboard 键值 | Key, Key Query, Observer Aborts |
| **Composite**（内置） | 组合多个条件 | 逻辑图表（AND/OR） |

---

## 六、关键依赖

**场景依赖**：
- **NavMeshBoundsVolume**（必需）：MoveTo Task 需要
- **BP_FinishLine**（必需）：终点检测
- **BP_StartLine**（必需）：开始检测

**资产依赖**：
- **AbilitySet_Endurance**：必须包含 GA_Push、GA_Dodge
- **GE_Dead**：必须添加 Player.State.Dead 标签
- **GE_Started**：必须添加 Player.State.Started 标签

**系统依赖**：
- **SM_Endurance**：必须正确设置 GS_Endurance.IsRedLight
- **GM_Endurance**：必须配置 Level Behavior Tree = BT_Endurance

**架构说明**：
- **Character 继承**：BP_Character_Game 继承自 GSCModularPlayerStateCharacter，ASC 在 PlayerState 上
- **行为树配置**：GM_Endurance 配置 Level Behavior Tree，AIC_Core 在 OnPossess 时自动运行
- **ASC 获取**：蓝图使用 `Get Ability System Component` 节点，C++ 使用 `UAbilitySystemBlueprintLibrary::GetAbilitySystemComponent(Actor)`

---

## 七、随机性配置

### 红灯行为

| 行为 | 概率 | 参数配置 |
|------|:----:|----------|
| 原地不动 | 80% | Wait (3s ± 1s) |
| 往前偷偷动 | 20% | BTTask_GetLocationToFinishLine (50-80 cm) |

**权重配置**：WeightedRandomSelector (Weights: [0.8, 0.2])

### 绿灯行为

**战斗行为**：

| 行为 | 概率 | 参数配置 |
|------|:----:|----------|
| 闪避成功 | 50% | TriggerAbilityByClass (GA_Dodge) |
| 闪避失败 | 50% | Wait (0.1s) |

**权重配置**：WeightedRandomSelector (Weights: [0.5, 0.5])

| 行为 | 概率 | 参数配置 |
|------|:----:|----------|
| 推搡成功 | 60% | Move To → Push |
| 不推搡 | 40% | Wait (0.5s) |

**权重配置**：WeightedRandomSelector (Weights: [0.6, 0.4])

**移动行为**：

| 行为 | 概率 | 参数配置 |
|------|:----:|----------|
| 向前移动 | 80% | BTTask_GetLocationToFinishLine (200-300 cm) |
| 等待 | 20% | Wait (0.1s) |

**权重配置**：WeightedRandomSelector (Weights: [0.8, 0.2])

---

## 八、相关文档

**AI 组件**：
- [BT_Endurance_Components](./BT_Endurance_Components.md) - 自定义组件实现细节

**关卡设计**：
- [总体策划](../总体策划.md) - 关卡1 核心玩法
- [系统架构](../../00-通用逻辑/系统架构.md) - 档案驱动架构

**GAS 系统**：
- [推搡系统](../GAS/推搡系统.md) - GA_Push/GA_Dodge/GA_Stagger/GA_Fall
- [伤害系统](../GAS/伤害系统.md) - GE_Dead（添加 Player.State.Dead 标签）

**场景组件**：
- [BP_FinishLine](../场景/功能组件/BP_FinishLine.md) - 终点线
- [BP_StartLine](../场景/功能组件/BP_StartLine.md) - 起点线（触发 Player.State.Started）

**架构组件**：
- [Comp_Character_Endurance](../架构/Comp_Character_Endurance.md) - 死亡处理、开始处理

**官方文档**：
- [Plugin Documentation Links](../../../参考文档/Plugin Documentation Links.md) - UE Behavior Tree、GAS Companion AI 集成等
