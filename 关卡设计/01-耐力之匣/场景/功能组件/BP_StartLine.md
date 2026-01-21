# BP_StartLine（起点线触发器）

**职责**：检测玩家离开起点区域，实现单向通行（只出不进）

**父类**：Actor

**实现状态**：✅ 已测试（单向通行正常）

**摆放方式**：手动摆放

---

## 设计概述

`BP_StartLine` 是一个触发器 Actor，用于：
1. 检测玩家离开起点区域
2. **单向通行**：玩家离开后无法返回起点
3. **能力赋予**：玩家穿过时赋予关卡能力（❌ 待实现）
4. **状态标记**：移除"在起点"标签（❌ 待实现）
5. **通知进度**：通知 GameState 该玩家已离开起点（❌ 待实现）

---

## 单向通行机制

使用**动态碰撞通道切换**实现单向阻挡：

1. 玩家初始碰撞通道为 `Pawn`
2. 穿过 StartLine（EndOverlap）后切换为 `PawnBlock`
3. 返回时被 StartLine Block，无法返回出生点

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
    │   └── Generate Overlap Events: true
    └── TextRender - 起点线文字
```

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `TriggerBox` | UBoxComponent* | 触发体积 |
| `IsDebug` | Bool | 调试模式（控制 TriggerBox 可见性） |
| `AbilitiesToGrant` | TArray\<TSubclassOf\<UGameplayAbility\>\> | 穿过时赋予的能力列表 |

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
      │   → CapsuleComponent.SetCollisionObjectType(PawnBlock)
      │   → GrantAbilities（❌ 待实现：Server Only）
      │   → Remove 'AtStart' Tag（❌ 待实现：Server Only）
      │   → Notify GameState（❌ 待实现）
      │   → PrintText（调试用）
      └─ False (说明向出生点退回，不做处理)
```

### CheckHasThrough 函数实现
计算玩家相对于 StartLine 的离开矢量，并与 StartLine 的 Forward Vector 进行点积：
- **A**: `CharacterLocation - StartLineLocation`
- **B**: `StartLine.GetActorForwardVector`
- **Return**: `Dot(A, B) > 0`


> [!NOTE]
> Collision Object Type 不会自动复制，需要 Server + Client 都执行碰撞切换。

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

