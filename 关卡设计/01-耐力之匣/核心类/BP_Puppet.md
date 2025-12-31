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
| SkeletalMesh | Skeletal Mesh Component | 木偶骨骼网格（Rotation Z = -90°，使模型面向 +X 轴） |

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| bIsFacing | 布尔 | 是否面对玩家（驱动动画蓝图） |
| GS_Ref | GS_Endurance | GS 引用缓存 |

## 动画资源

| 动画 | 说明 | 使用方式 |
|------|------|----------|
| Anim_BackIdle | 背对玩家待机（循环） | 状态机 |
| Anim_Face_Idle | 面对玩家待机（循环，已旋转 180°） | 状态机 |
| Anim_Trun | 转身动画（BackToFace） | 状态机 |
| Anim_Trun_inv | 转身动画倒放（FaceToBack） | 状态机 |
| Anim_Detect_Face_Montage | 发现玩家反应（已旋转 180°） | 蒙太奇 |

**旋转版动画制作方法**：
- 右键动画资产 → 资产操作 → 导出 FBX 到项目文件夹
- 项目自动导入该 FBX，在导入设置里设置旋转 180°
- FaceIdle 和 Detect 都用此方法处理，动画蓝图无需 Rotate Root Bone 节点

## Anim Notify

| Notify | 位置 | 说明 |
|--------|------|------|
| AN_DetectionStart | Anim_Turn 末尾 | 根据 bIsFacing 设置检测开关 |

**说明**：
- AN_DetectionStart 只放在 Anim_Turn 末尾
- Anim_Turn_inv 是 Anim_Turn 的倒放，所以 Notify 在 inv 的开头触发
- Turn 播放完毕时 bIsFacing=true → 开启检测
- Turn_inv 开始播放时 bIsFacing=false → 关闭检测
- 同一个 Notify 复用于两个方向的转身

**Notify 触发流程**（仅 DS 执行，通过 Is Server 检查）：
```
Anim_Turn 末尾 / Anim_Turn_inv 开头
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
Entry → BackIdle ←→ BackToFace ←→ FaceIdle
                                    ↕
                               FaceToBack
```

**Slot 节点设置**：
- 插槽名称：DefaultGroup.DefaultSlot
- **固定更新源姿势**：✅（确保蒙太奇播放期间状态机继续更新，蒙太奇结束后正确回到当前状态）

**状态转换条件**：
- BackIdle → BackToFace：bIsFacing = true
- BackToFace → FaceIdle：Time Remaining (ratio) <= 0.1
- FaceIdle → FaceToBack：bIsFacing = false
- FaceToBack → BackIdle：Time Remaining (ratio) <= 0.1

**FaceIdle 状态**：直接播放已旋转 180° 的 Anim_Face_Idle 动画。

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
BP_Puppet 监听事件（HandlePlayerDetected）
    ↓
播放 Anim_Detect_Face_Montage 蒙太奇
    ↓
蒙太奇结束回调（On Completed）
    ↓
检查 bIsFacing，如果 false → 调用 GS.Server_SetDetecting(false)
```

**蒙太奇结束回调说明**：
- 蒙太奇播放期间状态机会继续更新状态，但动画序列不会实际播放
- 如果蒙太奇播放期间 bIsFacing 变为 false，Turn_inv 开头的 Notify 会被跳过
- 因此需要在蒙太奇结束时手动检查并设置 IsDetecting

## 实现状态

- [x] 蓝图已创建
- [x] 骨骼网格已配置
- [x] 动画蓝图已创建
- [x] 动画蓝图状态机（BackIdle/Turn/FaceIdle）
- [x] 监听 GS_Endurance 事件（OnIsRedLightChange、OnPlayerDetected）
- [x] SkeletalMesh 设置 Always Tick Pose
- [x] Anim Notify（AN_DetectionStart）
- [x] HandlePlayerDetected 播放 Anim_Detect_Face_Montage 蒙太奇
