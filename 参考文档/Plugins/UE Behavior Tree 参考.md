# Unreal Engine Behavior Tree 参考指南

> **官方文档**: https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview  
> **学习日期**: 2026-01-24, 2026-01-25

本文档基于 UE 官方文档整理，侧重于 API 使用和最佳实践，不绑定特定业务逻辑。

---

## 核心概念

### 事件驱动架构

UE 的行为树与传统行为树不同，采用**事件驱动**而非每帧轮询：

- **不是每帧检查**：而是被动监听事件触发
- **性能优化**：避免不必要的迭代
- **调试友好**：只显示相关的执行变化

### 执行顺序

- 从左到右、从上到下执行
- 节点右上角显示执行顺序编号
- 左侧分支优先级高于右侧

### 条件判断原则

**推荐用 Decorator 而非 Task 实现条件判断**：
- Decorator 附加到节点上，决定是否执行
- Task 用于执行具体动作
- 这样结构更清晰，易于调试

---

## Decorator（条件装饰器）

> **官方文档**: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators

Decorator 附加到 Composite 或 Task 节点，决定分支或节点是否可执行。

### 通用参数

大多数 Decorator 支持以下参数：

| 参数 | 说明 | 选项 |
|------|------|------|
| **Observer Aborts** | 控制中断行为 | None / Self / Lower Priority / Both |
| **Notify Observer** | 何时重新评估 | On Result Change / On Value Change |
| **Inverse Condition** | 反转条件结果 | true ↔ false |

**Observer Aborts 详解**：
- **None**: 不中断任何节点
- **Self**: 中断自己和子树
- **Lower Priority**: 中断右侧（优先级更低）的节点
- **Both**: 中断自己、子树和右侧节点

### 常用 Decorator

| Decorator | 用途 | 关键参数 |
|-----------|------|----------|
| **Blackboard** | 检查 Blackboard Key 是否设置 | Key Query (Is Set / Is Not Set) |
| **Check Gameplay Tag Condition** | 检查 Actor 的 Gameplay Tags | Actor to Check, Gameplay Tags, Inverse Condition |
| **Compare BBEntries** | 比较两个 Blackboard Key | Operator (Is Equal To / Is Not Equal To) |
| **Cooldown** | 冷却计时器，锁定执行直到到期 | Cooldown Time (秒) |
| **Loop** | 循环执行节点或分支 | Num Loops, Infinite Loop |
| **Time Limit** | 给节点设置时间限制 | Time Limit (秒) |
| **Composite** | 组合多个 Decorator（AND/OR/NOT） | 可视化逻辑编辑器，双击打开图表编辑 |
| **Cone Check** | 检查位置是否在锥形范围内 | Cone Half Angle, Cone Origin, Cone Direction |
| **Does Path Exist** | 检查两点间是否存在路径 | Path Query Type (NavMesh/Hierarchical/Regular) |
| **Force Success** | 强制节点返回成功 | - |
| **Tag Cooldown** | 基于 Gameplay Tag 的冷却 | Cooldown Tag, Cooldown Duration |

### Composite Decorator（组合装饰器）

**用途**：组合多个 Decorator，支持 AND、OR、NOT 逻辑

**使用方式**：
1. 添加 Composite Decorator 到节点
2. 双击 Composite Decorator 打开图表编辑器
3. 右键添加 Decorator 节点（作为独立节点）
4. 使用 AND、OR、NOT 节点连接 Decorator

**属性**：
- **Composite Name**: 节点显示名称
- **Show Operations**: 在节点上显示逻辑操作的文本

**性能提示**：
- Composite Decorator 会影响内存和性能
- 如果逻辑复杂，建议用 C++ 创建自定义 Decorator（更高效）

**示例**：
```
Composite Decorator "HasCombatOpportunity"
├─ OR
    ├─ Blackboard Based (ShouldDodge)
    └─ Blackboard Based (HasNearbyPlayers)
```

---

### Check Gameplay Tag Condition 特殊说明

**重要特性**：
- **不支持 Observer Aborts 参数**（与其他 Decorator 不同）
- Gameplay Tag 变化会自动触发行为树重新评估
- 无需手动配置监听

**属性列表**：
- **Actor to Check**: 要检查的 Actor 引用（Blackboard Key）
- **Tags to Match**: 匹配模式（Any / All）
- **Gameplay Tags**: 要检查的 Gameplay Tags
- **Inverse Condition**: 是否反转条件结果
- **Node Name**: 节点显示名称

---

## Service（服务节点）

> **官方文档**: https://docs.unrealengine.com/4.26/en-US/InteractiveExperiences/ArtificialIntelligence/BehaviorTrees/BehaviorTreeNodeReference/BehaviorTreeNodeReferenceServices

### 核心特性

- 附加到 Composite 或 Task 节点
- 在分支执行期间按定义频率执行
- 用于检查和更新 Blackboard
- **替代传统行为树系统中的 Parallel 节点**

### 关键参数

| 参数 | 说明 |
|------|------|
| **Interval** | Service 的 Tick 间隔时间（秒） |
| **Random Deviation** | 为 Interval 添加随机范围值（秒），避免所有 AI 同时更新 |
| **Call Tick on Search Start** | 当任务搜索进入节点时调用 Tick 事件 |
| **Restart Timer on Each Activation** | 节点激活时重置 Tick 时间 |

### 内置 Service

| Service | 用途 |
|---------|------|
| **Default Focus** | 设置 AI Controller 的焦点 Actor（快捷访问） |
| **Run EQS** | 定期执行 EQS 查询并更新 Blackboard |

### 自定义 Service

创建自定义 Service：
1. 在行为树编辑器中点击 **New Service** 按钮
2. 实现 **Receive Tick AI** 事件（每个 Interval 执行一次）
3. 实现 **Receive Activation AI** 事件（Service 激活时执行一次，用于初始化）

**典型用途**：
- 定期更新感知信息（如检测附近敌人）
- 定期评估最佳目标
- 定期更新 Blackboard 值

---

## Task（任务节点）

### 内置 Task

| Task | 用途 | 关键参数 |
|------|------|----------|
| **MoveTo** | 使用导航系统移动 AI Pawn | Acceptable Radius（到达阈值） |
| **Wait** | 等待指定时间后完成 | Wait Time, Random Deviation |

### MoveTo Task

- 使用导航系统移动 AI Pawn 到指定位置或 Actor
- 支持移动到 Blackboard 中的 Vector 或 Actor
- 自动使用 NavMesh 寻路
- **Acceptable Radius**: 接受半径（到达目标的距离阈值，单位：厘米）

### Wait Task

- 等待指定时间后完成
- **Wait Time**: 等待时间（秒）
- **Random Deviation**: 随机偏差（秒），实际等待时间 = Wait Time ± Random Deviation

### 自定义 Task

创建自定义 Task：
1. 在行为树编辑器中点击 **New Task** 按钮
2. 实现 **Receive Execute AI** 事件（Task 开始执行时调用）
3. 调用 **Finish Execute** 节点结束 Task（Success = True/False）

**注意**：
- Task 必须调用 Finish Execute，否则行为树会卡住
- 可以使用 Delay 或其他异步操作，但最终必须调用 Finish Execute

---

## 并发行为处理

UE 使用以下方式替代传统 Parallel 节点：

### 1. Simple Parallel 节点

"在做 A 的同时做 B"（一个主任务 + 一个次要任务）

### 2. Service

定期执行更新（如每 0.5 秒检查最佳目标）

### 3. Observer Aborts

Decorator 监听值变化并中断执行

**优势**：
- 更清晰的树结构，易于阅读和理解
- 更容易调试（减少同时执行的路径）
- 更容易优化（事件驱动架构）

---

## 最佳实践

### 1. 条件判断

✅ **推荐**：使用 Decorator 实现条件
```
Selector
├─ Sequence + Decorator: Blackboard Based (HasEnemy == True)
│   └─ Attack Task
└─ Patrol Task
```

❌ **不推荐**：使用 Task 实现条件
```
Selector
├─ Sequence
│   ├─ Check Has Enemy Task
│   └─ Attack Task
└─ Patrol Task
```

### 2. 定期更新

✅ **推荐**：使用 Service 定期更新
```
Selector + Service: Update Perception (Interval: 0.5s)
├─ Attack Branch
└─ Patrol Branch
```

❌ **不推荐**：每帧检查
```
Loop
├─ Check Perception Task
└─ Decide Action Task
```

### 3. 事件驱动

✅ **推荐**：利用 Observer Aborts 实现响应式行为
```
Selector
├─ Sequence + Decorator: Blackboard Based (IsAlerted, Observer Aborts: Lower Priority)
│   └─ Investigate Task
└─ Patrol Task
```

### 4. 导航

场景中必须有 **NavMeshBoundsVolume**，否则 MoveTo Task 无法工作。

---

## 重要限制

### 1. Root 节点限制

**Root 节点不支持添加 Decorator 和 Service**，必须添加在子节点（通常是 Root 下的第一个 Composite 节点）上。

**正确做法**：
```
Root
└─ Selector（Decorator 和 Service 添加在此节点上）
    ├─ Decorator: Check Dead Tag
    ├─ Service: Update Perception
    ├─ Branch 1
    └─ Branch 2
```

### 2. Random Decorator

UE 没有内置 Random Decorator，需要自定义创建：
1. 在行为树编辑器中点击 **New Decorator** 按钮
2. 实现 **Perform Condition Check AI** 事件
3. 返回 `Random Float (0.0 to 1.0) <= Probability`

### 3. Check Gameplay Tag Condition

此类型 Decorator 不支持 Observer Aborts 参数（UE 官方设计），Gameplay Tag 变化会自动触发行为树重新评估。

---

## 常见问题 (FAQ)

### 1. 行为树不执行？

**检查清单**：
- AI Controller 是否调用了 `Run Behavior Tree`？
- Behavior Tree 资产是否正确配置？
- Blackboard 资产是否正确关联？

### 2. MoveTo Task 失败？

**检查清单**：
- 场景中是否有 NavMeshBoundsVolume？
- 目标位置是否在导航网格上？
- Acceptable Radius 是否设置合理？

### 3. Decorator 不触发？

**检查清单**：
- Observer Aborts 是否正确设置？
- Blackboard Key 是否正确更新？
- Notify Observer 是否设置为 On Value Change？

### 4. Service 不执行？

**检查清单**：
- Service 是否附加到正在执行的节点上？
- Interval 是否设置正确？
- 分支是否已经激活？

---

## 调试技巧

### 1. Visual Debugging

PIE 运行时，按 **'** 键（单引号）打开 Gameplay Debugger，可以看到：
- 当前激活的行为树节点（高亮）
- Blackboard 值
- AI 感知信息

### 2. Print String

在关键节点（如 Task 的 Receive Execute AI）中添加 Print String，输出：
- 节点名称
- Blackboard 值
- 执行时间

### 3. Breakpoint

在行为树节点的蓝图图表中设置断点，可以暂停执行并检查变量。

---

## 参考资源

- **官方概览**: https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview
- **Decorator 参考**: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-behavior-tree-node-reference-decorators
- **Service 参考**: https://docs.unrealengine.com/4.26/en-US/InteractiveExperiences/ArtificialIntelligence/BehaviorTrees/BehaviorTreeNodeReference/BehaviorTreeNodeReferenceServices
- **快速入门**: https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---quick-start-guide
