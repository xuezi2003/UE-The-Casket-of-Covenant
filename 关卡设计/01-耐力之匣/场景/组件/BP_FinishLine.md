# BP_FinishLine（终点线触发器）

**职责**：检测玩家到达终点，实现单向通行（只进不出）

**父类**：Actor

**实现状态**：⏳ 待测试

**摆放方式**：手动摆放

---

## 设计概述

`BP_FinishLine` 是一个触发器 Actor，用于：
1. 检测玩家穿过终点线
2. 通知 GameState 玩家到达终点
3. **单向通行**：玩家进入后无法返回赛道

---

## 单向通行机制（多人游戏适配）

### 原理

使用**动态碰撞通道切换**实现单向阻挡，每个玩家独立处理：

1. 新建自定义碰撞通道 `PawnBlock`
2. TriggerBox 设置：**Overlap** `Pawn`，**Block** `PawnBlock`
3. 玩家穿过时：将**该玩家**的 Capsule 碰撞通道从 `Pawn` → `PawnBlock`
4. 结果：该玩家被阻挡无法返回，其他玩家不受影响

### 为什么适合多人游戏

- 每个玩家的碰撞通道是独立属性
- 切换只影响触发的玩家自身
- 服务器/客户端都能正确处理

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

---

## 事件

### OnComponentBeginOverlap (TriggerBox)

**执行条件**：Server + Client 都执行（不需要鉴权）

> [!NOTE]
> Collision Object Type 不会自动复制，因此需要两端都执行碰撞切换：
> - Server 执行 → 权威判定
> - Client 执行 → 本地预测（避免穿透后被拉回）

当玩家进入触发区域时：
1. Cast to Character
2. **切换碰撞通道**：Get Capsule Component → Set Collision Object Type → `PawnBlock`
3. **添加标签**：添加 `Player.State.Finished` 标签（待定，需 Server Only）
4. 通知 GameState 该玩家到达终点（Server Only）
5. 可选：播放通关特效/音效

---

## 前置配置

### Project Settings → Collision

需要新建 Object Channel：

| 通道名 | 说明 |
|--------|------|
| `PawnBlock` | 已穿过触发器的玩家，被阻挡无法返回 |

---

## 缩放处理

手动摆放时：
- 通过 Box Extent 直接定义尺寸，不依赖缩放

---

## 相关文档

- [BP_Section_封闭墙.md](BP_Section_封闭墙.md) - 起点/终点封闭墙
- [BP_StartLine.md](BP_StartLine.md) - 起点线触发器（镜像逻辑）
- [场景组件.md](../场景组件.md) - 组件索引
