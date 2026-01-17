# BP_StartLine（起点线触发器）

**职责**：检测玩家离开起点区域，实现单向通行（只出不进）+ 能力赋予

**父类**：Actor

**实现状态**：⏳ 待测试

**摆放方式**：手动摆放

---

## 设计概述

`BP_StartLine` 是一个触发器 Actor，用于：
1. 检测玩家离开起点区域
2. **单向通行**：玩家离开后无法返回起点
3. **能力赋予**：玩家穿过时赋予关卡能力
4. **状态标记**：移除"在起点"标签（用于惩罚机制）

---

## 与 BP_FinishLine 对比

| 属性 | BP_FinishLine | BP_StartLine |
|------|---------------|--------------|
| **方向** | 只进不出 | 只出不进 |
| **触发时机** | BeginOverlap | EndOverlap |
| **碰撞切换** | 进入后阻挡 | 离开后阻挡 |
| **附加功能** | 通知到达终点 | 赋予能力 + 移除标签 |

---

## 单向通行机制（多人游戏适配）

### 原理

与 BP_FinishLine 相同，使用**动态碰撞通道切换**：

1. TriggerBox 设置：**Overlap** `Pawn`，**Block** `PawnBlock`
2. 玩家**离开时**（EndOverlap）：将该玩家的 Capsule 碰撞通道 `Pawn` → `PawnBlock`
3. 结果：该玩家被阻挡无法返回起点，其他玩家不受影响

---

## 组件结构

- **SceneRoot**：根组件
- **TriggerBox**：Box Collision，横跨场地宽度
  - **Box Extent**：X=10, Y=100, Z=100（标准基础尺寸，通过父级缩放适配场地）
  - Collision Preset：`OneWayTrigger`
  - Generate Overlap Events：true

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `TriggerBox` | UBoxComponent* | 触发体积 |
| `AbilitiesToGrant` | TArray<TSubclassOf\<UGameplayAbility\>> | 穿过时赋予的能力列表（可选，待定） |

---

## 事件

### OnComponentEndOverlap (TriggerBox)

**执行条件**：Server + Client 都执行（不需要鉴权）

> [!NOTE]
> Collision Object Type 不会自动复制，因此需要两端都执行碰撞切换：
> - Server 执行 → 权威判定
> - Client 执行 → 本地预测（避免穿透后被拉回）

当玩家离开触发区域时：
1. Cast to Character
2. **切换碰撞通道**：Get Capsule Component → Set Collision Object Type → `PawnBlock`
3. **赋予能力**：通过 ASC 赋予关卡专属能力（待定，需 Server Only）
4. **移除标签**：移除 `Player.State.AtStart` 标签（待定，需 Server Only）
5. 通知 GameState 该玩家已离开起点（Server Only）

---

## 待定设计点

> [!WARNING]
> 以下设计点需要进一步讨论确认：

### 1. 能力赋予方式
- **方案A**：在 StartLine 中直接赋予能力
- **方案B**：通知 GameMode/GameState 处理能力赋予
- **方案C**：能力在 Possess 时就赋予，StartLine 只解锁使用

### 2. 起点标签机制
- 标签名称：`Player.State.AtStart`（待确认）
- 何时添加：玩家 Possess 时？还是进入起点区域时？
- 惩罚逻辑：由谁负责检测和执行？

### 3. 与准备阶段的关系
- 准备阶段玩家是否可以移动？
- InProgress 开始时才激活 StartLine？

---

## 缩放处理

手动摆放时：
- 通过 Box Extent 直接定义尺寸，不依赖缩放

---

## 相关文档

- [BP_Section_封闭墙.md](BP_Section_封闭墙.md) - 起点/终点封闭墙
- [BP_FinishLine.md](BP_FinishLine.md) - 终点线触发器（镜像逻辑）
- [场景组件.md](../场景组件.md) - 组件索引
