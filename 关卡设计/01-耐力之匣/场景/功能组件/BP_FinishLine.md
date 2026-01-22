# BP_FinishLine（终点线触发器）

**职责**：检测玩家到达终点，实现单向通行（只进不出）

**父类**：Actor

**实现状态**：✅ 已测试

**摆放方式**：手动摆放

---

## 设计概述

`BP_FinishLine` 是一个触发器 Actor，用于：
1. **事件通知**：发送 `Gameplay.Event.Player.Finished` 事件
2. **单向通行**：玩家进入后无法返回赛道

**职责分工**：
- **BP_FinishLine**：只负责场景触发和事件发送
- **Comp_Character_Endurance**：负责状态标记（GE_Finish）和碰撞切换
- **GM_Core**：负责档案管理（SetPlayerFinished）和关卡检查

---

## 场景位置

```
出生点 → StartLine → 场地 → Monitor → FinishLine → 木偶
```

---

## 单向通行机制

使用**动态碰撞通道切换**实现单向阻挡：

1. 玩家穿过 StartLine 后碰撞通道为 `PawnBlock`
2. 穿过 FinishLine（EndOverlap）后切换为 `Pawn`
3. 返回时被 FinishLine Block，无法返回赛道

---

## 组件结构

```
BP_FinishLine
└── Scene
    ├── Decal_Line - 地面终点线贴花
    ├── TriggerBox (BoxComponent)
    │   ├── Collision: Custom（自定义碰撞）
    │   └── Generate Overlap Events: true
    └── TextRender - 终点线文字
```

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `TriggerBox` | UBoxComponent* | 触发体积 |
| `IsDebug` | Bool | 调试模式（控制 TriggerBox 可见性） |

---

## 构造脚本

```
TriggerBox.SetVisibility(IsDebug, PropagateToChildren=true)
```

---

## 事件：OnComponentEndOverlap

**执行条件**：Server + Client 都执行

当玩家离开触发区域时，通过方向检查确保是"向终点区"离开：

```blueprint
Cast to Character
  → [CheckHasThrough]（自定义函数：执行点积判定）
      ├─ True (点积 > 0，确认进入终点区) ↓
      │   → SendGameplayEventToActor(Character, Gameplay.Event.Player.Finished)  ✅
      │   → PrintText（调试用）
      └─ False (说明向赛道退回，不做处理)
```

**设计说明**：
- BP_FinishLine 只负责场景触发和事件发送
- 状态标记（GE_Finish）和碰撞切换由 Comp_Character_Endurance.HandlePlayerFinish 处理
- 档案管理（SetPlayerFinished）和关卡检查由 GM_Core.HandlePlayerFinish 处理

### CheckHasThrough 函数实现

计算玩家相对于 FinishLine 的离开矢量，并与 FinishLine 的 Forward Vector 进行点积：

```blueprint
Event CheckHasThrough (Actor: Character) → Returns: bool
    ↓
A = Actor.GetActorLocation() - FinishLine.GetActorLocation()
B = FinishLine.GetActorForwardVector()
    ↓
Return (Dot(A, B) > 0)
```

**设计说明**：
- **A**: 玩家相对于终点线的位置向量
- **B**: 终点线的前向向量
- **点积 > 0**: 表示玩家向终点区方向离开
- **点积 ≤ 0**: 表示玩家向赛道方向退回（不触发完成）

---

## 碰撞配置

**TriggerBox 自定义碰撞响应**：

| 通道 | 响应 | 说明 |
|------|:----:|------|
| Camera | 忽略 | 避免摄像机臂跳变 |
| PuppetVision | 阻挡 | 遮挡木偶视线，终点玩家不被检测 |
| Pawn | 阻挡 | 阻止返回赛道 |
| PawnBlock | 重叠 | 让穿过 StartLine 的玩家进入 |
| 其他 | 忽略 | - |

---

## 相关文档

- [BP_StartLine.md](BP_StartLine.md) - 起点线触发器
- [BP_Section_End.md](../结构组件/BP_Section_End.md) - 终点封闭墙
- [BP_Monitor.md](../木偶与监视器/BP_Monitor.md) - 监视器
- [碰撞预设配置.md](../../00-通用逻辑/碰撞预设配置.md) - Pawn/PawnBlock 通道配置
- [Comp_Character_Endurance.md](../../架构/Comp_Character_Endurance.md) - HandlePlayerFinish 状态标记
- [GM_Core.md](../../../00-通用逻辑/核心类/GM_Core.md) - HandlePlayerFinish 档案管理
