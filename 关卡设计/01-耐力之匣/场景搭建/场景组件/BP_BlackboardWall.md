# BP_BlackboardWall

**用途**：黑板墙管理器，生成并管理多个 `BP_BlackBoardWithPaint`，驱动随机配对交换动画。

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
| ForwardBaseOffset | double | - | 前移基础偏移量（黑板宽度 × 2.1） |
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
2. 计算 `ForwardBaseOffset = 黑板宽度 × 2.1`
3. 调用 `SwapPaints` 启动首轮
4. 延迟 0.2 秒后设置循环定时器

## 事件：SwapPaints

**逻辑**：
1. 调用 `CreateIdxPool` 重置索引池
2. For Loop 循环 `SwapPairCnt` 次
3. 调用 `SwapPairs(PairCnt)` 自定义事件（异步并行）

## 事件：SwapPairs (PairCnt: int)

**逻辑**：
1. 调用 `PreparePairData(PairCnt)` 获取配对数据
2. 调用 `ActorA.SwapMoveTo(ForwardOffset, TargetPos=PosB)`
3. 调用 `ActorB.SwapMoveTo(ForwardOffset, TargetPos=PosA)`

**Offset 计算公式**（确保每个 Actor 唯一）：
- ActorA: `((PairCnt_Plus × 2) - 1) × ForwardBaseOffset`
- ActorB: `((PairCnt_Plus × 2) - 0) × ForwardBaseOffset`

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
- [BP_ArenaGenerator.md](BP_ArenaGenerator.md) - 场地生成器（BP_Section_Wall 包含本组件）
- [场景组件.md](../场景组件.md) - 组件索引
