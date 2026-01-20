# GS_Endurance（GameState）

**职责**：关卡1 耐力之匣的 GameState

**父类**：GS_Core

## 变量配置

| 变量名 | 类型 | 值 | 复制 | 说明 |
|--------|------|-----|------|------|
| Preparing Duration | 浮点 | 5.0 | ❌ | 准备阶段时长（秒） |
| In Progress Duration | 浮点 | 600.0 | ❌ | 进行阶段时长（秒，10分钟） |
| GreenLightInterval | 浮点 | 5.0 | ❌ | 绿灯持续时间（秒） |
| RedLightInterval | 浮点 | 3.0 | ❌ | 红灯持续时间（秒） |
| IsRedLight | 布尔 | false | ✅ RepNotify | 当前是否红灯状态 |
| IsDetecting | 布尔 | false | ✅ RepNotify | 当前是否检测中（木偶转身完成后为 true） |

## 事件分发器

| 事件 | 参数 | 说明 |
|------|------|------|
| OnRedLightChanged | IsRedLight: Bool | 红绿灯状态变化时广播 |
| OnDetectingChanged | IsDetecting: Bool | 检测状态变化时广播 |
| OnPlayerDetected | DetectedPlayer: BP_Character_Game | 玩家被检测到时广播（触发木偶动画） |

## 函数

| 函数 | 权限 | 说明 |
|------|------|------|
| OnRep_IsRedLight | - | RepNotify 回调，调用 OnRedLightChanged 广播 |
| OnRep_IsDetecting | - | RepNotify 回调，调用 OnDetectingChanged 广播 |
| Server_SetDetecting | Server | 设置 IsDetecting（由 BP_Puppet 的 HandleIsRedLightChange 调用） |
| Multicast_PlayerDetected | Multicast | 广播 OnPlayerDetected（由 Monitor 调用，所有端执行） |

