# BP_Puppet（木偶 Actor）

**职责**：木偶表现层，播放转身/待机/发现动画

**父类**：Actor

## 网络同步方案

BP_Puppet 是场景中放置的 Actor，DS 和 Client 各自有独立实例，不自动同步。

**同步策略**：通过 GS_Endurance 广播驱动
- BP_Puppet 监听 GS_Endurance 的 `IsRedLight` 变化
- 各端的 BP_Puppet 各自响应，播放相同动画
- 不需要 BP_Puppet 本身做网络复制

**DS 动画 Tick**：
- SkeletalMesh 设置 `Visibility Based Anim Tick Option = Always Tick Pose and Refresh Bones`
- 确保 DS 上动画正常 Tick，Anim Notify 可以触发

## 组件

| 组件 | 类型 | 说明 |
|------|------|------|
| SkeletalMesh | Skeletal Mesh Component | 木偶骨骼网格 |

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| bIsFacing | 布尔 | 是否面对玩家（驱动动画蓝图） |
| GS_Ref | GS_Endurance | GS 引用缓存 |

## 动画资源

| 动画 | 说明 | 使用方式 |
|------|------|----------|
| Anim_BackIdle | 背对玩家待机（循环） | 状态机 |
| Anim_FaceIdle | 面对玩家待机（循环） | 状态机 |
| Anim_Turn | 转身动画（启用 Root Motion） | 状态机 |
| Anim_Detect | 发现玩家反应 | 蒙太奇 |

## Anim Notify

| Notify | 位置 | 说明 |
|--------|------|------|
| AN_DetectionStart | Anim_Turn 末尾 | 根据 bIsFacing 设置检测开关 |

**说明**：AN_DetectionStart 在转身动画末尾触发，根据当前 bIsFacing 值决定是开始检测（true）还是停止检测（false）。同一个 Notify 复用于两个方向的转身。

**Notify 触发流程**（仅 DS 执行，通过 Is Server 检查）：
```
Anim_Turn 播放完成
    ↓
AN_DetectionStart 触发
    ↓
Is Server? → 获取 BP_Puppet.bIsFacing
    ↓
调用 GS.Server_SetDetecting(bIsFacing)
    ↓
GS.IsDetecting 更新（RepNotify）
    ↓
Monitor 开始/停止检测
```

## 动画蓝图状态机

```
Entry → BackIdle ←→ Turn ←→ FaceIdle
                              ↓
                      Detect（蒙太奇叠加）
```

**状态转换条件**：
- BackIdle → Turn：bIsFacing = true
- Turn → FaceIdle：动画播放完毕 且 bIsFacing = true
- FaceIdle → Turn：bIsFacing = false
- Turn → BackIdle：动画播放完毕 且 bIsFacing = false

**说明**：Anim_Turn 启用 Root Motion，正向和反向转身都播放同一个动画，角色实际转动 180°。

## 事件流程

**红绿灯切换**：
```
GS_Endurance.OnRep_IsRedLight
    ↓
BP_Puppet 监听事件
    ↓
设置 bIsFacing = IsRedLight
    ↓
动画蓝图状态机切换
```

**发现玩家**：
```
BP_Monitor 检测到危险玩家
    ↓
GS_Endurance 广播 OnPlayerDetected 事件
    ↓
BP_Puppet 监听事件
    ↓
播放 Anim_Detect 蒙太奇
```

## 实现状态

- [x] 蓝图已创建
- [x] 骨骼网格已配置
- [x] 动画蓝图已创建
- [x] 动画蓝图状态机（BackIdle/Turn/FaceIdle）
- [x] 监听 GS_Endurance 事件（OnIsRedLightChange、OnPlayerDetected）
- [x] SkeletalMesh 设置 Always Tick Pose
- [x] Anim Notify（AN_DetectionStart）
- [x] HandlePlayerDetected 播放 Anim_Detect 蒙太奇
