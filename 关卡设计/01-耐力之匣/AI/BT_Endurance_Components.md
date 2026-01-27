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
| TargetPlayerKey | BlackboardKeySelector | - | Instance Editable | 指向 TargetPlayer 的 Blackboard 键 |
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

4. 设置 HasNearbyPlayers（基于 Out Actors 是否为空）

5. 清空 TargetPlayer = None

6. Branch (Out Actors.Length > 0)
   └─ True:
       For Each Loop with Break (Out Actors)
           └─ Is Valid (GetAbilitySystemComponent(Loop Element))
               └─ Is Valid:
                   HasMatchingGameplayTag(Player.Action.Pushing)
                       └─ True: Set ShouldDodge = true, Break
       
       Completed:
           FindNearestActor (Out Actors, Origin = ControlledPawn.Location)
           Set TargetPlayer = Nearest Actor
```

**设计说明**：
- **TargetPlayer 持续更新**：Service 负责持续更新 TargetPlayer，确保始终指向最近的玩家
- **自动清空**：没有附近玩家时，TargetPlayer 自动清空为 None
- **解决问题**：修复了 TargetPlayer 不清空和不更新的问题（2026-01-27）

---

### BTService_WeightedRandomSelector

**用途**：实现加权随机选择，支持自动归一化

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| SelectedIndexKey | BlackboardKeySelector | - | Instance Editable | 指向 SelectedIndex 的 Blackboard 键 |
| Weights | Array\<Float\> | [0.4, 0.4, 0.2] | Instance Editable | 权重数组（自动归一化） |

**实现逻辑（ReceiveSearchStartAI）**：

```
1. TotalWeight = 0.0
2. Sum = 0.0
3. For Each (Weights):
   - TotalWeight += Element
4. RandomValue = Random Float (0.0 to TotalWeight)
5. For Each Loop with Break (Weights):
   - Sum += Element
   - If (Sum > RandomValue):
       - Set Blackboard Value as Int (SelectedIndexKey, Loop Index)
       - Break
```

**设计说明**：
- 使用 `ReceiveSearchStartAI` 而不是 `ReceiveActivationAI`，确保在 Decorator 判断前设置 SelectedIndex
- 判断条件使用 `Sum > RandomValue` 而不是 `Sum >= RandomValue`，避免权重为 0 的项被选中
- 修复了"第一次必然执行默认 Index 0"的问题（2026-01-26）

---

## 二、Task 组件

---


### BTTask_GetLocationToFinishLine

**用途**：计算朝向终点线方向的随机位置，用于移动行为

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| TargetLocationKey | BlackboardKeySelector | - | Instance Editable | 指向 TargetLocation 的 Blackboard 键 |
| FinishLineKey | BlackboardKeySelector | - | Instance Editable | 指向 FinishLineActor 的 Blackboard 键 |
| MinDistance | Float | 200.0 | Instance Editable | 最小移动距离（厘米） |
| MaxDistance | Float | 300.0 | Instance Editable | 最大移动距离（厘米） |
| LateralRange | Float | 100.0 | Instance Editable | 横向随机范围（厘米） |

**实现逻辑（ReceiveExecuteAI）**：

```
1. 从 Blackboard 获取 FinishLine：
   TargetActor = GetBlackboardValueAsObject(FinishLineKey) → Cast To Actor
2. 计算前向偏移：
   Forward Offset = RandomFloatInRange(MinDistance, MaxDistance)
3. 计算横向偏移：
   Lateral Offset = RandomFloatInRange(-LateralRange, +LateralRange)
4. 计算理想目标：
   IdealTarget = AI.Location + (TargetActor.ForwardVector * Forward Offset) + (TargetActor.RightVector * Lateral Offset)
5. 投影到 NavMesh：
   Projected Location = ProjectPointToNavigation(IdealTarget, Query Extent=(200, 200, 100))
6. 检查是否在前方：
   Dot = DotProduct(Projected Location - AI.Location, TargetActor.ForwardVector)
7. 选择最终目标：
   FinalTarget = (Dot > 0.0) ? Projected Location : GetRandomReachablePointInRadius(AI.Location, MinDistance).RandomLocation
8. Set Blackboard Value as Vector (TargetLocationKey, FinalTarget)
9. Finish Execute (Success = True)
```

**设计说明**：
- **Blackboard 优化**：从 Blackboard 读取 FinishLineActor（由 BTService_UpdatePerception 初始化），避免重复调用 GetActorOfClass
- **横向随机性**：通过横向偏移增加移动的自然感，避免直线前进
- **NavMesh 验证**：使用 ProjectPointToNavigation 确保目标位置可到达
- **前方检查**：如果投影后的位置在后方，使用退化方案
- **退化策略**：使用 GetRandomReachablePointInRadius 保证可达性（优先避免卡死，允许偶尔往回走）
- **Query Extent**：(200, 200, 100) 表示横向搜索 ±200cm，垂直搜索 ±100cm
- **穿过终点**：当 AI 接近 FinishLine 时，目标位置会在 FinishLine 后方，AI 会穿过终点线（需要 FinishLine 后方有 NavMesh）

**使用场景**：
- **红灯偷偷动**：MinDistance=50, MaxDistance=80, LateralRange=50（小范围移动）
- **绿灯移动**：MinDistance=200, MaxDistance=300, LateralRange=100（大范围移动）

**修复历史**：
- 2026-01-25：修复直线移动和障碍卡死问题（Phase 7.12）
  - 问题1：AI 直线前进，没有随机性 → 添加横向随机偏移
  - 问题2：遇到障碍物卡死 → 使用 ProjectPointToNavigation + 前方检查 + 退化策略
  - 重命名：BTTask_GetRandomLocationAhead → BTTask_GetLocationToFinishLine（更清晰的命名）

---

### BTTask_SimplePrint

**用途**：调试工具，用于在行为树执行时输出日志

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| PrintContent | String | - | Instance Editable | 要输出的内容 |

**实现逻辑（ReceiveExecuteAI）**：

```
1. PrintText (Format: "【BT】 {PrintContent}")
2. FinishExecute (Success = true)
```

**设计说明**：
- 用于调试行为树执行流程
- 输出格式统一为 `【BT】 {内容}`，方便在日志中识别
- 立即成功完成，不阻塞行为树执行

---

### BTTask_GetLocationBeyondStartLine

**用途**：计算 StartLine 前面（朝赛道内方向）的位置，用于"走出起点"分支

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| TargetLocationKey | BlackboardKeySelector | - | Instance Editable | 指向 TargetLocation 的 Blackboard 键 |
| AheadDistance | Float | 100.0 | Instance Editable | StartLine 前面的距离（厘米） |

**实现逻辑（ReceiveExecuteAI）**：

```
1. GetActorOfClass(BP_StartLine) → StartLineActor
2. 计算基准点：
   Base = StartLineActor.Location + (StartLineActor.ForwardVector * AheadDistance)
3. 计算横向偏移：
   Lateral Offset = DotProduct(AI.Location - StartLineActor.Location, StartLineActor.RightVector)
4. 计算理想目标：
   IdealTarget = Base + (StartLineActor.RightVector * Lateral Offset)
5. 投影到 NavMesh：
   Projected Location = ProjectPointToNavigation(IdealTarget, Query Extent=(200, 200, 100))
6. 检查是否在前方：
   Dot = DotProduct(Projected Location - StartLineActor.Location, StartLineActor.ForwardVector)
7. 选择最终目标：
   FinalTarget = (Dot > 0.0) ? Projected Location : Base
8. Set Blackboard Value as Vector (TargetLocationKey, FinalTarget)
9. Finish Execute (Success = True)
```

**设计说明**：
- **横向分布**：通过横向偏移保持每个 AI 的"横向车道"，避免聚集
- **NavMesh 验证**：使用 ProjectPointToNavigation 确保目标位置可到达
- **后方检查**：如果投影后的位置在 StartLine 后方，则使用基准点（退化策略）
- **Query Extent**：(200, 200, 100) 表示横向搜索 ±200cm，垂直搜索 ±100cm
- **不使用 Multiplier**：StartLine 只需单向移动，不需要动态判断方向

**修复历史**：
- 2026-01-25：修复聚集和反复移动问题（Phase 7.11）
  - 问题1：所有 AI 目标位置相同 → 使用横向偏移保持分布
  - 问题2：AI 反复移动 → 删除 Multiplier，固定使用 ForwardVector
  - 问题3：目标位置可能不在 NavMesh 上 → 使用 ProjectPointToNavigation + 后方检查

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

### BTDecorator_CheckPhase

**用途**：检查当前游戏阶段，确保 AI 只在指定阶段执行逻辑

**变量**：

| 变量名 | 类型 | 默认值 | 配置 | 说明 |
|--------|------|--------|------|------|
| CheckPhase | FGameplayTag | Match.Phase.Main.InProgress | Instance Editable | 要检查的游戏阶段标签 |

**实现逻辑（Perform Condition Check AI）**：

```
1. Get Game State → Cast To GS_Core
2. Return: GS_Core.ActiveMatchPhase == CheckPhase
```

**设计说明**：
- 用于控制 AI 的启动时机
- 解决 AI 在 Preparing 阶段就启动行为树的问题
- 确保 AI 只在 InProgress 阶段执行逻辑
- 适用于所有关卡（通用 Decorator）

---

## 五、内置组件参考

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
