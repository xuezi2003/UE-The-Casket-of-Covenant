# BP_BlackboardWall

**用途**：黑板墙管理器，生成并管理多个 `BP_BlackBoardWithPaint`，驱动随机配对交换动画。

## 组件结构

```
BP_BlackboardWall
└── Scene
    └── SM_Pivot ← 用于 MSS 吸附到 BP_Section_Wall
```

---


## Construction Script

调用 `CreateBlackboards` 函数生成子黑板。

---

## 函数：CreateBlackboards

**触发**：Construction Script

**逻辑**：
1. 销毁所有现有 ChildActorComponent
2. 双重 For Loop：Row (0 to RowCnt-1)，Col (0 to ColCnt-1)
3. Add ChildActorComponent：
   - Class：BP_BlackBoardWithPaint
   - Location：使用 Math Expression 计算中心对齐位置
   - Scale：`BlackBoard_Scale`

**位置计算**（中心对齐）：
```
Y = x * (y - ((z - 1) / 2.0))
    x = BlackBoard_Interval.X
    y = Temp_Col
    z = ColCnt

Z = x * (y - ((z - 1) / 2.0))
    x = BlackBoard_Interval.Y
    y = Temp_Row
    z = RowCnt
```

**原点**：中心 (Y=0, Z=0)，向四周均匀展开

---

## 变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| RowCnt | int | 3 | 行数 |
| ColCnt | int | 4 | 列数 |
| BlackBoard_Interval | Vector2D | (100, 100) | 格子间距 |
| BlackBoard_Scale | Vector | (1, 1, 1) | 黑板缩放 |
| ChildBlackBoards | TArray\<BP_BlackBoardWithPaint\> | - | 运行时收集的黑板引用 |
| IdxPool | TArray\<int\> | - | 可用索引池（用于随机配对） |
| SwapPairCnt | int | - | 每轮交换对数 |
| SwapInterval | double | - | 交换间隔时间 |
| ForwardOffset | double | - | 前移基础偏移量（本地坐标系） |
| SwapTimerHandler | TimerHandle | - | 定时器句柄 |
| FInv / MInv | double | - | 传递给子 Actor 的动画时长参数 |

## 事件：BeginPlay

**逻辑**（Sequence 并行执行）：

**then_0**：收集子 Actor
1. 清空 `ChildBlackBoards`
2. 遍历所有 `ChildActorComponent`
3. Cast 到 `BP_BlackBoardWithPaint`，传递 `FInv`/`MInv` 参数
4. 加入 `ChildBlackBoards` 数组

**then_1**：初始化交换逻辑
1. 计算 `SwapPairCnt`、`SwapInterval`
2. 计算 `ForwardOffset`（使用本地坐标系）：
   ```
   ForwardOffset = Dot(Abs(GetActorForwardVector()), ChildBlackBoards[0].GetActorBounds().BoxExtent) × 2.1
   ```
3. 调用 `SwapPaints` 启动首轮
4. 设置循环定时器（间隔 = SwapInterval + RandomFloat）

## 事件：SwapPaints

**逻辑**：
1. 调用 `CreateIdxPool` 重置索引池
2. For Loop 循环 `SwapPairCnt` 次
3. 调用 `SwapPairs(PairCnt)` 自定义事件（异步并行）

## 事件：SwapPairs (PairCnt: int)

**逻辑**：
1. 调用 `PreparePairData(PairCnt)` 获取配对数据（ActorA, ActorB, PosA, PosB, PairCnt_Plus）
2. 计算位置差：`PosDiff = PosB - PosA`
3. 使用点积提取本地坐标分量：
   - `RightDelta = Dot(GetActorRightVector(), PosDiff)`
   - `UpDelta = Dot(GetActorUpVector(), PosDiff)`
4. 调用 ActorA.SwapMoveTo：
   - `ForwardDelta = ((PairCnt_Plus × 2) - 1) × ForwardOffset`
   - `RightDelta`、`UpDelta`、`TargetPos = PosB`
5. 调用 ActorB.SwapMoveTo：
   - `ForwardDelta = ((PairCnt_Plus × 2) - 0) × ForwardOffset`
   - `RightDelta × -1`、`UpDelta × -1`、`TargetPos = PosA`


## 函数：CreateIdxPool

**逻辑**：清空 `IdxPool`，填充 `0` 到 `ChildBlackBoards.Length - 1`

## 函数：PreparePairData (PairCnt: int)

**逻辑**：
1. 从 `IdxPool` 随机取出 `Temp_IdxA`，移除
2. 从 `IdxPool` 随机取出 `Temp_IdxB`，移除
3. 返回 `ActorA`、`ActorB`、`PosA`、`PosB`、`PairCnt_Plus`

## 事件：EndPlay

**逻辑**：清除并失效 `SwapTimerHandler`

---

## 相关文档

- [BP_BlackBoardWithPaint.md](BP_BlackBoardWithPaint.md) - 子 Actor 文档
- [BP_Section_Wall.md](../结构组件/BP_Section_Wall.md) - 墙段组件（可吸附）
- [场景组件.md](../场景组件.md) - 组件索引
