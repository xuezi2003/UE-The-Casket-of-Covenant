# 耐力之匣 AI 设计文档

**父类**：BehaviorTree

**实现状态**：✅ Phase 7.5 已完成（BT_Endurance 完整结构已实现）

## 📋 实现进度

| 阶段 | 状态 | 内容 |
|------|:----:|------|
| **设计阶段** | ✅ | AI能力清单、行为树结构、Blackboard设计、组件设计 |
| **Phase 7.1** | ✅ | 前置依赖检查与补充（GE_Dead标签、GE_Started、BP_StartLine、NavMesh） |
| **Phase 7.2** | ✅ | 创建Blackboard资产（BB_Endurance，8个键） |
| **Phase 7.3** | ✅ | 创建自定义Service（BTService_UpdatePerception、BTService_WeightedRandomSelector） |
| **Phase 7.4** | ✅ | 创建自定义Task/Decorator（BTTask_GetRandomLocationAhead、BTTask_GetNearestPlayer、BTDecorator_IndexMatch） |
| **Phase 7.5** | ✅ | 创建行为树资产（BT_Endurance，完整结构已实现） |
| **Phase 7.6** | ⏸️ | 配置与测试（GM_Endurance配置、PIE测试） |

> **当前阶段**：Phase 7.5 已完成 ✅  
> **下一阶段**：Phase 7.6 - 配置与测试  

---

## 一、设计概览

### AI 能力清单

**会做的**：
- 走走停停地移动到终点（80% 移动，20% 等待）
- 红灯时：原地不动(80%) / 往前偷偷动(20%)
- 绿灯时：推搡附近玩家 / 闪避推搡 / 走走停停地移动
- 碰撞拾取道具（被动）

**不会做的**：
- 跳跃
- 蹲行
- 主动寻找道具
- 瞄准投掷
- 躲避到障碍物后面

### 行为树顶层结构

```
Root
└─ Selector（所有 Decorator 和 Service 附加在此节点上）
    ├─ Decorator: 死亡检查（Player.State.Dead 不存在）
    ├─ Decorator: 开始检查（Player.State.Started 存在）
    ├─ Service: 每 0.5s 更新感知
    ├─ 红灯行为（优先级高，会中断绿灯）
    └─ 绿灯行为
```

> **架构说明**：Root 节点不支持直接添加 Decorator 和 Service（UE 限制），因此所有 Decorator 和 Service 都附加在 Root 下的第一个 Composite 节点（Selector）上。  
> **详细结构**：参见"四、行为树结构"章节

---

## 二、架构集成

> **核心原则**：行为树只负责 AI 的决策逻辑，档案管理、网络同步、死亡表现等由现有架构自动处理。

### AI 生命周期与职责边界

**行为树的职责**：只负责"运行阶段"的决策逻辑

```
【运行阶段】行为树控制决策
├─ AIC_Core.OnPossess → Run Behavior Tree (BT_Endurance)
├─ Service 更新 Blackboard（感知环境）
├─ Decorator 判断条件（红灯/绿灯/死亡/开始）
└─ Task 执行动作（移动/技能）
```

**其他阶段由现有架构自动处理**：
- **生成/初始化**：GM_Core 管理 AI 生成，BP_Character_Game 自动初始化
- **死亡/完成**：事件系统自动处理，行为树检测到标签后立即中断
- **淘汰机制**：档案驱动，GI_FiveBox 跨关卡持久化

> **详细流程**：参见 [系统架构](../../00-通用逻辑/系统架构.md)、[GM_Core](../../00-通用逻辑/核心类/GM_Core.md)

| 职责 | 行为树 | 现有架构 |
|------|:------:|:--------:|
| **AI 决策逻辑** | ✅ | - |
| 红灯/绿灯行为选择 | ✅ | - |
| 移动目标选择 | ✅ | - |
| 技能激活时机 | ✅ | - |
| **档案管理** | ❌ | ✅ |
| PlayerNum 分配 | - | GM_Core.GetUniquePlayerNum |
| IsEliminated 更新 | - | BP_Character_Game.HandlePlayerEliminate |
| IsFinished 更新 | - | BP_Character_Game.HandlePlayerFinish |
| **网络同步** | ❌ | ✅ |
| 技能效果同步 | - | GAS 自动复制 |
| 移动同步 | - | Character Movement 自动复制 |
| 状态同步 | - | RepNotify 自动复制 |
| **表现逻辑** | ❌ | ✅ |
| 死亡表现 | - | Comp_Character_Endurance.HandleHealthChanged |
| 外观加载 | - | BP_Character_Game.UpdateAvatar |
| QTE 响应 | - | GA_Stagger（按 AISuccessRate 概率） |
| 完成检测 | - | BP_FinishLine.OnComponentEndOverlap |

### 数据流向

**输入（行为树从哪里获取数据）**：

| 数据 | 来源 | 更新方式 |
|------|------|----------|
| **IsRedLight** | GS_Endurance | SM_Endurance 状态机控制，RepNotify 同步 |
| **FinishLineActor** | 场景 | GetActorOfClass(BP_FinishLine) |
| **NearbyPlayers** | 场景 | SphereOverlapActors（半径 120） |
| **ShouldDodge** | 其他玩家 | 检查 NearbyPlayers 的 `Player.Action.Pushing` 标签 |
| **Player.State.Dead** | GAS | GE_Dead 添加标签 |
| **Player.State.Started** | GAS | BP_StartLine 触发，GE_Started 添加标签 |

**输出（行为树的决策如何影响游戏）**：

| 输出 | 目标 | 同步方式 |
|------|------|----------|
| **移动** | Character Movement | MoveTo Task → AI Controller → 自动复制 |
| **技能激活** | GAS | BTTask_TriggerAbilityByClass → ASC → 自动复制 |
| **档案更新** | GI_FiveBox | 事件系统自动触发（行为树无需感知） |

### 网络架构

**执行位置**：
- **行为树**：只在 Dedicated Server 运行（HasAuthority）
- **Blackboard**：只在 Server 存在，不需要复制
- **Service/Task/Decorator**：只在 Server 执行

**同步机制**：
- **技能效果**：GAS 自动复制（动画、标签、属性变化）
- **移动**：Character Movement 自动复制（位置、旋转、速度）
- **状态**：RepNotify 自动复制（IsRedLight、IsDetecting）
- **档案**：GI_FiveBox 在 Server 上更新，不需要复制

**客户端表现**：
- 客户端看到同步后的结果（AI 在移动、播放动画、受到推搡等）
- 客户端不知道 AI 的决策过程（行为树、Blackboard）
- 客户端通过 RepNotify 获取红绿灯状态（用于 UI 显示、木偶动画等）

### 系统集成点

| 系统 | 集成方式 | 说明 |
|------|----------|------|
| **GM_Core** | 配置 Level Behavior Tree | GM_Endurance.Level Behavior Tree = BT_Endurance |
| **GM_Core** | AI 生成管理 | RestoreAISurvivors / FillAIPlayers |
| **AIC_Core** | 运行行为树 | OnPossess → Run Behavior Tree (BT_Asset) |
| **GS_Endurance** | 红绿灯状态 | Service 读取 IsRedLight（RepNotify） |
| **SM_Endurance** | 红绿灯控制 | 状态机设置 GS_Endurance.IsRedLight |
| **GI_FiveBox** | 档案管理 | SetPlayerEliminated / SetPlayerFinished（事件触发） |
| **BP_Character_Game** | 事件监听 | HandlePlayerEliminate / HandlePlayerFinish |
| **Comp_Character_Endurance** | 死亡处理 | HandleHealthChanged → 发送 Eliminated 事件 |
| **BP_FinishLine** | 完成检测 | OnComponentEndOverlap → 发送 Finished 事件 |
| **BP_StartLine** | 开始检测 | OnComponentEndOverlap → 发送 Started 事件 |
| **GAS** | 技能激活 | BTTask_TriggerAbilityByClass → ASC.TryActivateAbilityByClass |
| **GAS** | 状态标签 | GE_Dead 添加 Player.State.Dead，GE_Started 添加 Player.State.Started |
| **NavMesh** | 寻路 | MoveTo Task 使用导航系统 |

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

> **重要架构说明**：Root 节点不支持添加 Decorator 和 Service（UE 官方限制），因此 Decorator 和 Service 必须添加在 Root 下的第一个 Composite 节点（Selector）上。

```
Root
└─ Selector（根 Selector）
    ├─ Decorator: Check Dead Tag (Player.State.Dead 不存在)
    ├─ Decorator: Check Start Tag (Player.State.Started 存在)
    ├─ Service: BTS_UpdatePerception (0.5s)
    │
    ├─ 【分支1：红灯行为】
    │   └─ Sequence
    │       ├─ Decorator: CheckIsRedLight (Observer Aborts: Lower Priority)
    │       └─ Selector（二选一：原地不动 80% / 往前偷偷动 20%）
    │
    └─ 【分支2：绿灯行为】
        └─ Sequence
            ├─ Decorator: CheckIsGreenLight
            └─ Selector
                ├─ 战斗行为（闪避 / 推搡）
                └─ 移动行为（向前移动 80% / 等待 20%）
```

> **详细结构**：参见下方各小节

---

### 4.2 红灯行为详细结构

```
【分支1：红灯行为】
└─ Sequence
    ├─ Decorator: Blackboard Based - "CheckIsRedLight"
    │   └─ Blackboard: IsRedLight is 已设置
    │       Key Query: Is Set
    │       Observer Aborts: Lower Priority（中断绿灯）
    │
    └─ Selector "RedLightSelector"（二选一）
        ├─ Service: BTService_WeightedRandomSelector (Weights: [0.8, 0.2])
        │   └─ Selected Index Key: SelectedIndex
        │
        ├─ [80%] 原地不动
        │   └─ Sequence
        │       ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 0)
        │       │   └─ Selected Index Key: SelectedIndex
        │       └─ Wait (3s ± 1s)
        │
        └─ [20%] 往前偷偷动
            └─ Sequence
                ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 1)
                │   └─ Selected Index Key: SelectedIndex
                ├─ BTTask_GetRandomLocationAhead
                │   └─ Finish Line Key: FinishLineActor
                │       Target Location Key: TargetLocation
                │       Min Distance: 50.0
                │       Max Distance: 80.0
                └─ MoveTo (TargetLocation, Radius: 50)
```

---

### 4.3 绿灯战斗行为详细结构

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
            ├─ Service: BTS_WeightedRandomSelector
            │   └─ Weights: [0.6, 0.4]
            │       Selected Index Key: SelectedIndex
            │       Interval: 0.5s, Random Deviation: 0.1s
            └─ Selector（推搡二选一）
                ├─ [60%] 推搡成功
                │   └─ Sequence
                │       ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 0)
                │       ├─ BTTask_GetNearestPlayer
                │       │   └─ Target Player Key: TargetPlayer
                │       │       Search Radius: 120.0
                │       ├─ Rotate to Face BB Entry
                │       │   └─ Blackboard Key: TargetPlayer
                │       │       Precision: 10.0
                │       ├─ Move To
                │       │   └─ Blackboard Key: TargetPlayer
                │       │       Acceptable Radius: 100.0
                │       └─ BTTask_TriggerAbilityByClass (GA_Push)
                └─ [40%] 不推搡
                    └─ Sequence
                        ├─ Decorator: BTDecorator_IndexMatch (MyIndex = 1)
                        └─ Wait (0.1s)
```

---

### 4.4 绿灯移动行为详细结构

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
    │       ├─ BTTask_GetRandomLocationAhead
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
| **BTService_UpdatePerception** | 每 0.5s 更新感知信息 | Interval: 0.5s, Random Deviation: 0.1s |
| **BTService_WeightedRandomSelector** | 加权随机选择 | Weights 数组（自动归一化） |

### Task 组件

| 组件名 | 用途 | 关键参数 |
|--------|------|----------|
| **BTTask_GetNearestPlayer** | 查找最近的玩家 | SearchRadius: 120.0 |
| **BTTask_GetRandomLocationAhead** | 计算朝向终点的随机位置 | MinDistance, MaxDistance |
| **MoveTo**（内置） | 移动到目标位置 | Acceptable Radius |
| **Wait**（内置） | 等待指定时间 | Wait Time, Random Deviation |
| **BTTask_TriggerAbilityByClass**（GAS Companion） | 激活 GAS Ability | Ability Class |

### Decorator 组件

| 组件名 | 用途 | 关键参数 |
|--------|------|----------|
| **BTDecorator_IndexMatch** | 配合 WeightedRandomSelector 实现加权随机 | MyIndex, SelectedIndexKey |
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
| 往前偷偷动 | 20% | GetRandomLocationAhead (50-80 cm) |

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
| 推搡成功 | 60% | GetNearestPlayer → TriggerAbilityByClass (GA_Push) |
| 不推搡 | 40% | Wait (0.1s) |

**权重配置**：WeightedRandomSelector (Weights: [0.6, 0.4])

**移动行为**：

| 行为 | 概率 | 参数配置 |
|------|:----:|----------|
| 向前移动 | 80% | GetRandomLocationAhead (200-300 cm) |
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
