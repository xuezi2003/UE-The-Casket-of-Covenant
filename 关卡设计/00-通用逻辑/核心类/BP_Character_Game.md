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

## 事件图表

| 事件 | 处理 |
|------|------|
| Event BeginPlay | → Wait for Player State → 设置 0.1s 循环定时器 |
| WaitForPlayerState | → Cast To PS_FiveBox → 成功后 InitPlayer → 清除定时器 |
| HandleAvatarChange | → Update Player Avatar |
| HandleNumChange | → Update Player Num |
| On Attribute Change | → Switch on Attribute → HandleSpeedRateChange |

## LocoGraph（输入处理）

| 输入 | 处理 |
|------|------|
| IA_Core_Look | → Aim 函数 |
| IA_Core_Move | → Move 函数 |
| IA_Core_Jump | Started → Jump，Completed → Stop Jumping |

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
| HandleSpeedRateChange | 速度倍率变化 → 更新最大行走速度 |

### InitPlayer 流程

```
SET PS（保存引用）
    ↓
Bind Event to On Player Avatar Change → HandleAvatarChange
    ↓
Bind Event to On Player Num Change → HandleNumChange
    ↓
Update Player Num + Update Player Avatar
    ↓
Handle Speed Rate Change
    ↓
LevelCharacterComponentClass 有效？→ Add Actor Component
```

### HandleSpeedRateChange 逻辑

```
最大行走速度 = BaseSpeed × SpeedRate
```

## 待实现

| 功能 | 输入 | 说明 |
|------|------|------|
| Sprint | IA_Core_Sprint | 修改 SpeedRate |
| Crouch | IA_Core_Crouch | 低姿态移动 |

## 相关文档

- [外观加载.md](../外观加载.md)
- [输入与属性.md](../输入与属性.md)
