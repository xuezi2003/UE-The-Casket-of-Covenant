# BP_Monitor（监视器 Actor）

**职责**：视线检测，红灯时判定危险状态并造成伤害（仅 DS 执行检测逻辑）

**父类**：Actor

**实现状态**：✅ 已实现（视线检测逻辑） | ⏳ 伤害逻辑待 Phase 6

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
| IsDetecting | 布尔 | - | 当前是否检测中（从 GS 同步） |
| CheckInterval | 浮点 | - | 检测间隔（秒），默认 0.1 |
| DetectSocketName | Name | - | 检测用骨骼名称（头部） |

## 视线检测逻辑

**核心机制**：从玩家头部向 +X 方向发射射线，命中 Monitor 则被检测到

**检测流程**：
```
GS.IsDetecting = true（木偶转身完成后触发）
    ↓
Monitor 启动定时检测
    ↓
遍历 GameState.PlayerArray
    ↓
对每个玩家执行 DetectSinglePlayer
    ├─ 起点：玩家 Mesh.GetSocketLocation(DetectSocketName)
    └─ 方向：固定 +X（世界坐标，延伸 100000 单位）
    ↓
判断射线结果
    ├─ 命中 BP_Monitor → 无遮挡 → 检查 Danger 标签
    │   ├─ 有 Danger 标签 → Multicast_PlayerDetected（⏳ 伤害待实现）
    │   └─ 无 Danger 标签 → 安全
    └─ 命中障碍物/其他玩家 → 有遮挡 → 安全
```

**遮挡机制**：
- 障碍物遮挡：射线被场景物体阻挡
- 玩家互相遮挡：射线先命中其他玩家的 **CharacterMesh**（不是胶囊体）

> [!NOTE]
> 遮挡检测由 CharacterMesh 而非胶囊体负责，蹲行时 Mesh 会跟随动画变矮，自然改变遮挡效果。详见 [碰撞预设配置.md](../../00-通用逻辑/碰撞预设配置.md)。

**Line Trace 配置**：
- Channel：**PuppetVision**（自定义 Trace Channel，默认 Block）
- Ignore Self：**否**（Monitor 需要接收碰撞）
- Actors to Ignore：当前检测的 Character（防止射线被玩家自身碰撞体挡住）

**PuppetVision 通道说明**：
- 专门用于木偶视线检测，不影响其他系统
- 玩家可以互相遮挡（躲在其他玩家后面不会被检测）
- 障碍物也会遮挡视线

## 函数结构

### BeginPlay ✅

```
Event BeginPlay
    ↓
Cast GetGameState() To GS_Endurance
    ↓
Bind Event to OnDetectingChanged → HandleDetectChange
```

### HandleDetectChange ✅

```
HandleDetectChange (IsDetecting: Bool)
    ↓
Switch Has Authority
    └─ Authority:
        SET IsDetecting
        ↓
        Branch (IsDetecting)
            ├─ True → Set Timer (DoLineTraceCheck, Time=CheckInterval, Looping=true)
            └─ False → Clear Timer (DoLineTraceCheck)
```

### DoLineTraceCheck ✅

```
DoLineTraceCheck
    ↓
Switch Has Authority
    └─ Authority:
        For Each in PlayerArray
            → DetectSinglePlayer(PS)
```

### DetectSinglePlayer ✅

```
DetectSinglePlayer (PS: PlayerState)
    ↓
Cast PS.GetPawn() to BP_Character_Game
    ↓
If Character.HasGameplayTag(Player.State.Danger):   ← 先检查 Danger Tag
    ├─ False → 返回（静止玩家跳过）
    └─ True ↓
        Line Trace By Channel (PuppetVision)
            ├─ Start: Mesh.GetSocketLocation(DetectSocketName)
            ├─ End: Start + (100000, 0, 0)
            └─ ActorsToIgnore: [Character]
            ↓
        If Hit && HitActor is BP_Monitor:
            → GS.Multicast_PlayerDetected(Character)
```

## 伤害触发流程

```
射线命中 Monitor + 玩家有 Danger 标签
    ↓
调用 GS_Endurance.Multicast_PlayerDetected（所有端执行）
    ↓
GS 广播 OnPlayerDetected 事件
    ↓
BP_Puppet 监听事件 → 播放 Anim_Detect 蒙太奇
    ↓
对玩家造成 34 点伤害（❌ Phase 6 待实现）
```

## 网络说明

- 检测逻辑仅在 DS 执行（HasAuthority 检查）
- Client 的 Monitor 不执行检测，只是占位

---

## 相关文档

- [BP_Puppet.md](BP_Puppet.md) - 木偶（表现层）
- [场景组件.md](../场景组件.md) - 组件索引
- [碰撞预设配置.md](../../00-通用逻辑/碰撞预设配置.md) - PuppetVision 通道配置
