# BP_FinishLine（终点线触发器）

**职责**：检测玩家到达终点，实现单向通行（只进不出）

**父类**：Actor

**实现状态**：✅ 已测试

**摆放方式**：手动摆放

---

## 设计概述

`BP_FinishLine` 是一个触发器 Actor，用于：
1. 检测玩家穿过终点线
2. **状态标记**：添加 `Player.State.Finished` 标签（❌ 待实现）
3. **通知进度**：通知 GameState 玩家到达终点（❌ 待实现）
4. **单向通行**：玩家进入后无法返回赛道

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

当玩家离开触发区域时：
```blueprint
Cast to Character
  → CapsuleComponent.SetCollisionObjectType(Pawn)
  → Add 'Finished' Tag（❌ 待实现：Server Only）
  → Notify GameState Finished（❌ 待实现）
  → PrintText（调试用）
```

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
