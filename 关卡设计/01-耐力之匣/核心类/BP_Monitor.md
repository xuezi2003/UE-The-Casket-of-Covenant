# BP_Monitor（监视器 Actor）

**职责**：视线检测，红灯时判定危险状态并触发死亡（仅 DS 执行检测逻辑）

**父类**：Actor

## 设计理念

木偶（BP_Puppet）与监视器（BP_Monitor）分离：
- BP_Puppet：表现层，播放动画
- BP_Monitor：逻辑层，视线检测

BP_Monitor 是横跨场地的 Box Collision，与场地等宽。

## 组件

| 组件 | 类型 | 说明 |
|------|------|------|
| DetectionBox | Box Collision | 横跨场地的检测墙（与 Y 轴平行） |

## 变量

| 变量名 | 类型 | 复制 | 说明 |
|--------|------|------|------|
| bIsDetecting | 布尔 | - | 当前是否检测中（从 GS 同步） |
| CheckInterval | 浮点 | - | 检测间隔（秒），默认 0.1 |
| HeadSocketName | Name | - | 头部骨骼名称 |

## 视线检测逻辑

**核心机制**：从玩家头部向 +X 方向发射射线，命中 Monitor 则被检测到

**检测流程**：
```
GS.IsDetecting = true（木偶转身完成后触发）
    ↓
Monitor 启动定时检测（CheckInterval 间隔）
    ↓
获取所有玩家（通过 GameState.PlayerArray）
    ↓
对每个玩家执行 Line Trace
    ├─ 起点：玩家头部骨骼位置
    └─ 方向：固定 +X（世界坐标）
    ↓
判断射线结果
    ├─ 命中 BP_Monitor → 无遮挡 → 检查 Danger 标签
    │   ├─ 有 Danger 标签 → 触发死亡
    │   └─ 无 Danger 标签 → 安全
    └─ 命中障碍物/其他玩家 → 有遮挡 → 安全
```

**遮挡机制**：
- 障碍物遮挡：射线被场景物体阻挡
- 玩家互相遮挡：射线先命中其他玩家

**Line Trace 配置**：
- Channel：Visibility 或自定义 Channel
- 忽略发射者自身：是

## 事件监听

**检测开关**：
```
GS_Endurance.OnDetectionChange
    ↓
BP_Monitor 监听
    ↓
IsDetecting = true → 启动检测定时器
IsDetecting = false → 停止检测定时器
```

## 死亡触发流程

```
射线命中 Monitor + 玩家有 Danger 标签
    ↓
调用 GS_Endurance.Multicast_PlayerDetected（所有端执行）
    ↓
GS 广播 OnPlayerDetected 事件
    ↓
BP_Puppet 监听事件 → 播放 Anim_Detect 蒙太奇
    ↓
对玩家造成伤害（HP 归零 → 淘汰）
```

## 网络说明

- 检测逻辑仅在 DS 执行（HasAuthority 检查）
- Client 的 Monitor 不执行检测，只是占位

## 实现状态

- [x] 蓝图已创建
- [x] DetectionBox 组件（横跨场地）
- [x] 监听 GS.OnDetectionChange 事件
- [x] Line Trace 视线检测（玩家头部 → +X）
- [x] Danger 标签判定
- [x] 调用 Multicast_PlayerDetected 广播
- [ ] 对玩家造成伤害（HP 归零 → 淘汰）
