# 耐力之匣 AI 组件实现

**父文档**：[BT_Endurance](./BT_Endurance.md)

**实现状态**：✅ Phase 7.3-7.4 已完成

---

## 一、Service 组件

### BTService_UpdatePerception

**用途**：每 0.5 秒更新 AI 的感知信息（红绿灯状态、附近玩家、推搡检测等）

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| SelfActorKey | BlackboardKeySelector | - | Instance Editable | 指向 SelfActor 的 Blackboard 键 |
| FinishLineKey | BlackboardKeySelector | - | Instance Editable | 指向 FinishLineActor 的 Blackboard 键 |
| IsRedLightKey | BlackboardKeySelector | - | Instance Editable | 指向 IsRedLight 的 Blackboard 键 |
| HasNearbyPlayersKey | BlackboardKeySelector | - | Instance Editable | 指向 HasNearbyPlayers 的 Blackboard 键 |
| ShouldDodgeKey | BlackboardKeySelector | - | Instance Editable | 指向 ShouldDodge 的 Blackboard 键 |
| NearbyThreshold | Float | 120.0 | Instance Editable | 附近玩家检测半径（厘米） |

**配置参数**：

在 Service 蓝图的**类默认值 → 服务**分类中设置：

| 参数 | 值 | 说明 |
|------|-----|------|
| 间隔（Interval） | 0.5 | Service 的 Tick 间隔时间（秒） |
| 随机偏差（Random Deviation） | 0.1 | 为 Interval 添加随机范围值（秒），避免所有 AI 同时更新 |

> **注意**：Call Tick on Search Start 和 Restart Timer on Each Activation 等高级参数也在类默认值中，通常使用默认值即可。

**初始化逻辑（ReceiveActivationAI）**：

| Blackboard Key | 获取方式 |
|----------------|----------|
| SelfActor | `Get Controlled Pawn` |
| FinishLineActor | `GetActorOfClass(BP_FinishLine)` |

**更新逻辑（ReceiveTickAI）**：

```
1. 更新 IsRedLight
   GetGameState → Cast To GS_Endurance → 读取 IsRedLight → Set Blackboard Value as Bool

2. 设置 ShouldDodge 默认值 = false

3. SphereOverlapActors
   - Sphere Pos: ControlledPawn.GetActorLocation()
   - Sphere Radius: NearbyThreshold
   - Class Filter: BP_Character_Game
   - Actors to Ignore: [ControlledPawn]

4. 设置 HasNearbyPlayers = Out Actors

5. Branch (Out Actors.Length > 0)
   └─ True:
       For Each Loop with Break (Out Actors)
           └─ Is Valid (GetAbilitySystemComponent(Loop Element))
               └─ Is Valid:
                   HasMatchingGameplayTag(Player.Action.Pushing)
                       └─ True: Set ShouldDodge = true, Break
```

---

### BTService_WeightedRandomSelector

**用途**：实现加权随机选择，支持自动归一化

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| SelectedIndexKey | BlackboardKeySelector | - | Instance Editable | 指向 SelectedIndex 的 Blackboard 键 |
| Weights | Array\<Float\> | [0.4, 0.4, 0.2] | Instance Editable | 权重数组（自动归一化） |

**实现逻辑（ReceiveActivationAI）**：

```
1. TotalWeight = 0.0
2. Sum = 0.0
3. For Each (Weights):
   - TotalWeight += Element
4. RandomValue = Random Float (0.0 to TotalWeight)
5. For Each Loop with Break (Weights):
   - Sum += Element
   - If (Sum >= RandomValue):
       - Set Blackboard Value as Int (SelectedIndexKey, Loop Index)
       - Break
```

---

## 二、Task 组件

### BTTask_GetNearestPlayer

**用途**：在指定半径内查找最近的玩家，用于推搡分支

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| TargetPlayerKey | BlackboardKeySelector | - | Instance Editable | 指向 TargetPlayer 的 Blackboard 键 |
| SearchRadius | Float | 120.0 | Instance Editable | 搜索半径（厘米） |

**实现逻辑（ReceiveExecuteAI）**：

```
1. SetBlackboardValueAsObject (TargetPlayerKey, None)
2. SphereOverlapActors
   - Sphere Pos: ControlledPawn.GetActorLocation()
   - Sphere Radius: SearchRadius
   - Class Filter: BP_Character_Game
   - Actors to Ignore: [ControlledPawn]
3. Branch (OutActors 非空)
   ├─ False: FinishExecute (Success = false)
   └─ True:
       FindNearestActor (OutActors, Origin = ControlledPawn.Location)
       SetBlackboardValueAsObject (TargetPlayerKey, NearestActor)
       FinishExecute (Success = true)
```

---

### BTTask_GetRandomLocationAhead

**用途**：计算朝向终点线方向的随机位置，用于移动行为

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| TargetLocationKey | BlackboardKeySelector | - | Instance Editable | 指向 TargetLocation 的 Blackboard 键 |
| FinishLineKey | BlackboardKeySelector | - | Instance Editable | 指向 FinishLineActor 的 Blackboard 键 |
| MinDistance | Float | 50.0 | Instance Editable | 最小移动距离（厘米） |
| MaxDistance | Float | 80.0 | Instance Editable | 最大移动距离（厘米） |

**实现逻辑（ReceiveExecuteAI）**：

```
1. Cast (GetBlackboardValueAsObject(FinishLineKey)) To Actor
2. Set FinishLineActor = GetBlackboardValueAsObject(FinishLineKey)
3. 计算方向：
   - Trend = FinishLineActor.Location - AI.Location
   - Dot = DotProduct(FinishLineActor.ForwardVector, Trend)
   - Multiplier = (Dot > 0) ? 1.0 : -1.0
   - Final Direction = FinishLineActor.ForwardVector * Multiplier
4. Random Distance = RandomFloatInRange(MinDistance, MaxDistance)
5. Target Location = AI.Location + (Final Direction * Random Distance)
6. Set Blackboard Value as Vector (TargetLocationKey, Target Location)
7. Finish Execute (Success = True)
```

---

## 三、Decorator 组件

### BTDecorator_IndexMatch

**用途**：配合 BTService_WeightedRandomSelector 实现加权随机选择

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| MyIndex | Int | 0 | Instance Editable | 当前节点的索引（0, 1, 2...） |
| SelectedIndexKey | BlackboardKeySelector | - | Instance Editable | 指向 SelectedIndex 的 Blackboard 键 |

**实现逻辑（Perform Condition Check AI）**：

```
Get Blackboard Value as Int (SelectedIndexKey) == MyIndex
└─ Return
```

---

## 四、内置组件参考

### 内置 Task 参数

| Task | 关键参数 | 说明 |
|------|----------|------|
| **MoveTo** | Acceptable Radius | 到达阈值（厘米） |
| **Wait** | Wait Time, Random Deviation | 等待时间 ± 随机偏差 |
| **BTTask_TriggerAbilityByClass** | Ability Class | 激活 GAS Ability，自动等待结束 |

> **Decorator 配置**：参见主文档的 [行为树结构](./BT_Endurance.md#四行为树结构bt_endurance) 章节

---

## 五、相关文档

**主文档**：
- [BT_Endurance](./BT_Endurance.md) - 行为树设计概览与架构集成

**官方文档**：
- [UE Behavior Tree 参考](../../../参考文档/Plugins/UE Behavior Tree 参考.md) - UE 官方行为树文档
- [Plugin Documentation Links](../../../参考文档/Plugin Documentation Links.md) - GAS Companion AI 集成等
