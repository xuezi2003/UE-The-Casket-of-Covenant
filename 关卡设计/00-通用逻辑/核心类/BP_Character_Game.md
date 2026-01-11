# BP_Character_Game（Character）

**职责**：玩家角色，移动控制，响应式外观同步

**父类**：GSCModular Player State Character

## 组件

| 组件 | 类型 | 用途 | 实现状态 |
|------|------|------|----------|
| CollisionCylinder | 胶囊体 | 碰撞体 | ✅ |
| CameraBoom | Spring Arm | 相机臂 | ✅ |
| FollowCamera | Camera | 跟随相机（第三人称） | ✅ |
| CharacterMesh0 | Skeletal Mesh | 角色模型 | ✅ |
| SM_Monitor | Static Mesh | 显示器（外观用） | ✅ |
| GSCCore | GSC 组件 | GAS Companion 核心（复制开启） | ✅ |
| GSCAbilityInputBinding | GSC 组件 | 技能输入绑定（复制关闭） | ✅ |
| CharMoveComp | Character Movement | 移动控制 | ✅ |
| DetectionBox | Box Collision | 前方检测框（交互检测） | ❌ 待实现 |

### CharMoveComp 关键设置

> [!WARNING]
> **网络平滑模式必须禁用**：为了确保蹲行时 Mesh 位置在 Simulated Proxy 上正确显示，必须将 **网络平滑模式** 设为 **禁用**。
>
> 原因：Simulated Proxy 上的网络平滑会每帧将 Mesh 位置"校正"回默认值，覆盖 HandleCrouch 中 Timeline 设置的位置。

### CharacterMesh0 关键设置

> [!IMPORTANT]
> **Dedicated Server 动画优化**：必须在 CharacterMesh0 的 Optimization 设置中，将 **Visibility Based Anim Tick Option** 设为 `Always Tick Pose and Refresh Bones`。
>
> 否则 Server 上的动画不会更新，导致骨骼位置与 Client 不同步（如蹲行时 head 骨骼高度不变）。

## 前方检测框（DetectionBox）设计（待实现）

**用途**：检测角色前方可交互对象（其他玩家、道具）

| 配置项 | 值 |
|--------|-----|
| 位置 | 角色前方（相对位置 X=100 左右） |
| 大小 | 根据交互距离调整（如 100x100x100） |
| 碰撞 | 只检测 Pawn、Item 等需要交互的对象 |

**接口函数**（待实现）：
- `GetOverlappingPlayers()` → TArray\<Character\>
- `GetOverlappingItems()` → TArray\<Item\>
- `GetBestInteractTarget()` → Actor（最近/最优先的）

**使用方式**：
- 玩家：Overlap → UI 提示 → 按键触发交互
- AI：行为树 Service 读取 → 决策 → BTTask 触发交互

## 变量

| 变量名 | 类型 | 复制 | 用途 |
|--------|------|------|------|
| PS | PS_FiveBox | ❌ | 缓存的 PlayerState 引用 |
| LevelCharacterComponentClass | Actor Component Class | ✅ | 关卡专属组件类（Spawn 时传入） |
| LevelIMC | Input Mapping Context | ✅ | 关卡专属输入映射（Spawn 时传入） |
| LevelAbilitySet | GSCAbilitySet | ✅ | 关卡专属技能集（Spawn 时传入） |

**复制说明**：GM 里动态设置的变量需要复制到客户端，因此 LevelCharacterComponentClass、LevelIMC、LevelAbilitySet 都设为 Replicated，在 InitPlayer 里统一初始化。

**关卡专属配置架构**：
- **LevelIMC**：每个关卡一个完整的 IMC（包含通用输入 + 关卡专属输入），不与 IMC_Core 组合
- **LevelAbilitySet**：每个关卡一个 AbilitySet，包含该关卡所需的所有 Ability
- **Input Action 可跨关卡使用**：IA 资产（如 IA_Core_Move、IA_Core_Sprint）可在多个关卡中使用

## 事件图表

| 事件 | 处理 |
|------|------|
| Event BeginPlay | → Wait for Player State → 设置 0.1s 循环定时器 |
| WaitForPlayerState | → Cast To PS_FiveBox → 成功后 InitPlayer → InitWaitAttributeChanged → 清除定时器 |
| HandleAvatarChange | → Update Player Avatar |
| HandleNumChange | → Update Player Num |
| OnAttributeChange | → Switch on Gameplay Attribute → HandleSpeedRateChanged |

## 属性变化处理（双重保险方案）

为了彻底解决 Autonomous Proxy 上的属性同步延迟和丢失问题，采用 **双重保险** 策略：

1. **BAS_Core (AttributeSet)**: 监听 `PostAttributeChange` 事件
2. **BP_Character_Game**: 监听 `OnAttributeChange` 委托

### 1. BAS_Core - PostAttributeChange

在 `BAS_Core`（AttributeSet 的蓝图类）中重写 `PostAttributeChange` 事件：

```
Event PostAttributeChange
    ↓
Switch on Gameplay Attribute
    ↓
SpeedRate → 调用 Character.HandleSpeedRateChanged
```

**作用**：作为第一道防线，蓝图 AttributeSet 层面的属性变化会触发此事件，确保 Server 和 Simulated Proxy 的及时更新。

### 2. BP_Character_Game - OnAttributeChange

在 `BP_Character_Game` 中监听 GSCCore 的 `OnAttributeChange`：

```
On Attribute Change (GSCCore)
    ↓
Switch on Gameplay Attribute
    ↓
SpeedRate → 调用 HandleSpeedRateChanged
```

**作用**：作为补充，处理一些本地预测的瞬时变化。

### 3. HandleSpeedRateChanged

统一的速度更新函数：

```
最大行走速度 = BaseSpeed × SpeedRate
```

**注意**：`InitPlayer` 中仍需手动调用一次 `InitSpeed`（内容同 HandleSpeedRateChanged）以设置初始速度。

## GASGraph（标签变化监听）

**用途**：监听 Gameplay Tag 变化，触发本地表现逻辑（如胶囊体高度变化）。

### On Gameplay Tag Change 流程

```
On Gameplay Tag Change (GSCCore)
    ↓
Switch on Gameplay Tag
    ↓
Player.Action.Crouching → HandleCrouch (NeedHalf = New Tag Count > 0)
```

**说明**：
- GE 复制会自动同步标签到所有客户端
- 每个客户端本地监听标签变化，执行对应的表现逻辑
- 这样避免了 Timeline Replicated 导致的同步问题

## LocoGraph（输入处理）

| 输入 | 处理 |
|------|------|
| IA_Core_Look | → Aim 函数 |
| IA_Core_Move | → Move 函数 |
| IA_Core_Jump | Started → GA_Jump（通过 AbilitySet 输入绑定触发） |

## 函数

### Loco 分类

| 函数 | 说明 |
|------|------|
| Move | 基于控制器旋转计算方向，调用 Add Movement Input |
| Aim | X → Add Controller Yaw Input，Y → Add Controller Pitch Input |

**Move 函数逻辑**：
```
Get Control Rotation → Get Forward/Right Vector → Add Movement Input
```

**Aim 函数逻辑**：
```
X Axis → Add Controller Yaw Input (Left/Right)
Y Axis → Add Controller Pitch Input (Up/Down)
```

### Visual 分类

| 函数 | 说明 |
|------|------|
| UpdatePlayerNum | 更新编号显示 |
| UpdatePlayerAvatar | 更新外观 |
| InitPlayer | 初始化：绑定事件 + 同步外观/编号 |
| InitSpeed | 初始化时设置速度（后续由 BAS_Core 更新） |
| HandleCrouch | 蹲行胶囊体高度变化（Timeline 平滑过渡） |

### InitPlayer 流程

使用 **Sequence** 节点并行执行多个初始化分支：

```
Sequence
├─ then_0: 事件绑定
│   SET PS → Bind OnPlayerAvatarChange → Bind OnPlayerNumChange
│
├─ then_1: 组件创建（仅服务端）
│   Switch Has Authority
│       └─ Authority → Add Actor Component (LevelCharacterComponentClass)
│
├─ then_2: 技能系统初始化
│   ClearAbilitySet → GiveAbilitySet(LevelAbilitySet)
│       → SET InputMappingContext = IMC_Endurance
│       → SET ASC → HandleSpeedRateChanged
│
└─ then_3: 外观同步
    UpdatePlayerNum → UpdatePlayerAvatar
```

> [!IMPORTANT]
> **组件创建必须只在服务端执行**：通过 `Switch Has Authority` 确保只有服务端调用 `Add Actor Component`。组件需启用 `Component Replicates`，引擎会自动复制到客户端。

**关键点**：
- LevelIMC 设置到 GSCAbilityInputBinding 组件的 InputMappingContext 属性
- LevelAbilitySet 通过 GiveAbilitySet 赋予，同时建立输入绑定
- 组件添加仅服务端执行，复制系统负责同步到客户端

### HandleSpeedRateChanged / InitSpeed 逻辑

```
最大行走速度 = BaseSpeed × SpeedRate
```

**说明**：
- `InitSpeed`：仅在初始化时调用
- `HandleSpeedRateChanged`：在运行时由属性变化触发（BAS_Core 或 Character 监听）

## 已实现功能

| 功能 | 输入 | 说明 |
|------|------|------|
| Crouch | IA_Core_Crouch | 蹲行（Toggle 模式，GA_Crouch + GE_Crouch） |
| Sprint | IA_Core_Sprint | GA_Sprint 修改 SpeedRate（通过 GE_Sprint） |
| Jump | IA_Core_Jump | GA_Jump（消耗体力 -15，防止二段跳） |

## 相关文档

- [外观加载.md](../外观加载.md)
- [输入系统.md](../输入系统.md)
- [属性系统.md](../属性系统.md)
