# BP_Puppet（木偶 Actor）

**职责**：木偶表现层，播放转身/待机/发现动画

**父类**：Actor

## 网络同步方案

BP_Puppet 是场景中放置的 Actor，DS 和 Client 各自有独立实例，不自动同步。

**同步策略**：通过 GS_Endurance 广播驱动
- BP_Puppet 监听 GS_Endurance 的 `OnRedLightChanged` 和 `OnPlayerDetected` 事件
- 各端的 BP_Puppet 各自响应，播放相同动画
- 不需要 BP_Puppet 本身做网络复制

**DS 动画 Tick**：
- SkeletalMesh 设置 `Visibility Based Anim Tick Option = Always Tick Pose and Refresh Bones`
- 确保 DS 上动画状态机正常运行

## 组件

| 组件 | 类型 | 说明 |
|------|------|------|
| SkeletalMesh | Skeletal Mesh Component | 木偶骨骼网格（Rotation Z = -90°，使模型面向 +X 轴） |

## 导航网格配置 ✅

| 配置项 | 值 | 说明 |
|--------|:--:|------|
| **Can Ever Affect Navigation** | ✅ | 影响导航网格生成 |
| **Collision Preset** | BlockAllDynamic | 对所有通道阻挡 |
| **Collision Enabled** | Query and Physics | 启用碰撞查询和物理 |

**效果**：NavMesh 会在木偶周围挖空洞，AI 无法穿过木偶位置（木偶在终点线后方，符合设计）。

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| IsFacing | 布尔 | 是否面对玩家（驱动动画蓝图） |
| TurnAnimSeq | Animation Sequence | 转身动画序列引用（用于获取 SequenceLength） |

## 检测开关逻辑

### BeginPlay ✅

```
Event BeginPlay
    ↓
Cast GetGameState() To GS_Endurance
    ↓
Bind Event to OnRedLightChanged → HandleIsRedLightChange
Bind Event to OnPlayerDetected → HandlePlayerDetected
```

### HandleIsRedLightChange ✅

检测开关在 **`HandleIsRedLightChange`** 中手动延时触发（仅 DS 执行）。

```
HandleIsRedLightChange (IsRedLight)
    ↓
SET IsFacing = IsRedLight
    ↓
Switch Has Authority
    └─ Authority:
        Branch (IsRedLight)
            ├─ True（红灯）:
            │   Delay (TurnAnimSeq.SequenceLength)
            │   → GS.Server_SetDetecting(IsFacing)
            │
            └─ False（绿灯）:
                → GS.Server_SetDetecting(IsFacing) → 立即关闭检测
```

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

## 动画蓝图状态机

```
Entry → BackIdle ←→ BackToFace ←→ FaceIdle
                                    ↕
                               FaceToBack
```

**Slot 节点设置**：
- 插槽名称：DefaultGroup.DefaultSlot
- **固定更新源姿势**：✅（确保蒙太奇播放期间状态机继续更新）

**检测逻辑兼容性**：
- 播放蒙太奇时如果发生红绿灯切换，`HandleIsRedLightChange` 中的 Delay 逻辑不受影响，仍能正确切换 Monitor 状态。

## 事件流程

**发现玩家**：
```
BP_Monitor 检测到危险玩家
    ↓
GS_Endurance 广播 OnPlayerDetected 事件
    ↓
BP_Puppet 监听事件（HandlePlayerDetected）
    ↓
Branch: Is Any Montage Playing? (防止重复触发)
    ├─ True → 不执行
    └─ False → 播放 Anim_Detect_Face_Montage 蒙太奇
    ↓
(注意：蒙太奇回调中不再包含任何检测开关逻辑)
```

---

## 相关文档

- [BP_Monitor.md](BP_Monitor.md) - 监视器（逻辑层）
- [场景组件.md](../场景组件.md) - 组件索引
