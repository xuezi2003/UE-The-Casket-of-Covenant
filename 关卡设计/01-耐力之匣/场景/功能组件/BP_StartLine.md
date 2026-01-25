# BP_StartLine（起点线触发器）

**职责**：检测玩家离开起点区域，实现单向通行（只出不进）

**父类**：Actor

**实现状态**：✅ 已测试（单向通行正常）

**摆放方式**：手动摆放

---

## 设计概述

`BP_StartLine` 是一个触发器 Actor，用于：
1. **事件通知**：发送 `Gameplay.Event.Player.Started` 事件
2. **单向通行**：玩家离开后无法返回起点

**职责分工**：
- **BP_StartLine**：只负责场景触发和事件发送
- **Comp_Character_Endurance**：负责碰撞切换（Pawn → PawnBlock）
- **能力赋予**：已在 GM_Core.Spawn 时通过 LevelAbilitySet 赋予，不需要在 StartLine 实现

---

## 单向通行机制

使用**动态碰撞通道切换**实现单向阻挡：

1. 玩家初始碰撞通道为 `Pawn`
2. 穿过 StartLine 后切换为 `PawnBlock`
3. StartLine TriggerBox 对 `PawnBlock` 阻挡，对 `Pawn` 重叠
4. 穿过后的玩家被 StartLine 阻挡，无法返回出生点

> [!NOTE]
> 碰撞切换不影响玩家之间的碰撞（Pawn 和 PawnBlock 对彼此都是阻挡），只改变玩家与 TriggerBox 的碰撞关系。

> [!IMPORTANT]
> **系统预设修改**：`OverlapAllDynamic` Profile 需要修改：
> - 对 `PawnBlock` 响应 Overlap（道具检测框可检测穿过 StartLine 的玩家）
> - 对 `PuppetVision` 响应 Overlap（Monitor 检测时不被意外阻挡）

---

## 组件结构

```
BP_StartLine
└── Scene
    ├── Decal_Line - 地面起点线贴花
    ├── TriggerBox (BoxComponent)
    │   ├── Collision: Custom（自定义碰撞）
    │   ├── Generate Overlap Events: true
    │   └── Can Ever Affect Navigation: ❌（不影响导航）
    └── TextRender - 起点线文字
```
    ├── TriggerBox (BoxComponent)
    │   ├── Collision: Custom（自定义碰撞）
    │   └── Generate Overlap Events: true
    └── TextRender - 起点线文字
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

当玩家离开触发区域时，通过方向检查确保是“向赛道内”离开：

```blueprint
Cast to Character
  → [CheckHasThrough]（自定义函数：执行点积判定）
      ├─ True (点积 > 0，确认向赛道离开) ↓
      │   → SendGameplayEventToActor(Character, Gameplay.Event.Player.Started)  ✅
      │   → PrintText（调试用）
      └─ False (说明向出生点退回，不做处理)
```

**设计说明**：
- BP_StartLine 只负责场景触发和事件发送
- 碰撞切换（Pawn → PawnBlock）由 Comp_Character_Endurance.HandlePlayerStart 处理
- 和 BP_FinishLine 架构完全对称

### CheckHasThrough 函数实现
计算玩家相对于 StartLine 的离开矢量，并与 StartLine 的 Forward Vector 进行点积：
- **A**: `CharacterLocation - StartLineLocation`
- **B**: `StartLine.GetActorForwardVector`
- **Return**: `Dot(A, B) > 0`

---

## 碰撞配置

**TriggerBox 自定义碰撞响应**：

| 通道 | 响应 | 说明 |
|------|:----:|------|
| Camera | 忽略 | 避免摄像机臂跳变 |
| PuppetVision | 阻挡 | 遮挡木偶视线，出生点玩家不被检测 |
| Pawn | 重叠 | 触发 Overlap 事件 |
| PawnBlock | 阻挡 | 阻止穿过的玩家返回 |
| 其他 | 忽略 | - |

---

## 相关文档

- [BP_FinishLine.md](BP_FinishLine.md) - 终点线触发器
- [BP_Section_Start.md](../结构组件/BP_Section_Start.md) - 起点封闭墙
- [场景组件.md](../场景组件.md) - 组件索引
- [碰撞预设配置.md](../../00-通用逻辑/碰撞预设配置.md) - PawnBlock 通道配置
- [Comp_Character_Endurance.md](../../架构/Comp_Character_Endurance.md) - HandlePlayerStart 碰撞切换

