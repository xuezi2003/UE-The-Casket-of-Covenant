# GI_FiveBox（GameInstance）

**职责**：唯一编号工厂 + 跨关卡数据持久化

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| PlayerNumPool | 整数数组 | 1-999 的可用编号池 |
| PlayerRecords | S_PlayerRecord[] | 所有参赛者档案（跨关卡持久化） |

## 函数

| 函数名 | 说明 | 状态 |
|--------|------|:----:|
| Event Init | 初始化时填充 1-999 到编号池 | ✅ |
| GetUniquePlayerNum | 随机取出一个编号并从池中移除 | ✅ |
| AddPlayerRecord | 添加玩家档案到 PlayerRecords | ✅ |
| SetPlayerEliminated | 设置指定 PlayerNum 的玩家为已淘汰 | ✅ |
| CheckIsHuman | 检查指定 PlayerNum 是否为真人 | ✅ |
| SetPlayerFinished | 设置指定 PlayerNum 为已完成关卡目标 | ✅ |
| CheckLevelEndCondition | 检查关卡是否应该结束（统计存活者） | ✅ |

### SetPlayerEliminated (int PlayerNum) ✅ 已实现

**说明**：在 `PlayerRecords` 数组中查找匹配的 `PlayerNum`，设置 `IsEliminated = true`。

```blueprint
Event SetPlayerEliminate (EliminatePlayerNum: int)
    ↓
For Each Loop with Break in (PlayerRecords)
    ↓ LoopBody
    If (Loop Element.PlayerNum == EliminatePlayerNum)
        ↓ True
        Set Fields in (Loop Element) (IsEliminated = true)
            ↓
        Array_Set (PlayerRecords, Index = Loop Index, Item = Modified Struct)
            ↓
        [Break]
```

> [!IMPORTANT]
> **Struct 修改注意**：For Each 输出的是副本，必须使用 `Set Array Elem` (Array_Set) 将修改后的 Struct 写回原数组。

### CheckIsHuman (int PlayerNum) ✅ 已实现

**说明**：检查指定 `PlayerNum` 的玩家是否为真人。

```blueprint
Event CheckIsHuman (PlayerNum: int) → Returns: IsHuman (bool)
    ↓
For Each in (PlayerRecords)
    ↓ Loop Body
    If (Loop Element.PlayerNum == PlayerNum)
        ↓ True
        Return (IsHuman = Loop Element.IsHuman)
```

### SetPlayerFinished (int PlayerNum) ✅ 已实现

**说明**：将指定玩家标记为已完成关卡目标。

```blueprint
Event SetPlayerFinished (FinishedPlayerNum: int)
    ↓
For Each (PlayerRecords)
    ↓ Loop Body
    If (Loop Element.PlayerNum == FinishedPlayerNum)
        ↓ True
        Set Loop Element.IsFinished = True
        ↓
        Array_Set (PlayerRecords, Index = Loop Index, Item = Loop Element)
        ↓
        [Break]
```

### CheckLevelEndCondition () ✅ 已实现

**说明**：检查关卡是否应该结束（统计"未完成且未淘汰"的玩家数量）。

**返回值**：`ShouldEnd (bool)` - 为 true 时表示关卡应该结束

**判定逻辑**：遍历 `PlayerRecords`，统计既未淘汰也未完成关卡的玩家数量，为 0 时返回 true。

```blueprint
Event CheckLevelEndCondition → Returns: ShouldEnd (bool)
    ↓
SET LivePlayerCnt = 0
    ↓
For Each in (PlayerRecords)
    ↓ Loop Body
    If (NOT Loop Element.IsEliminated AND NOT Loop Element.IsFinished)
        ↓ True
        IncrementInt (LivePlayerCnt)
    ↓
Return (ShouldEnd = LivePlayerCnt == 0)
```

**调用位置**：`GS_Core.CheckLevelShouldEnd()`

**设计说明**：
- 统计的是"仍在进行关卡"的玩家，包括真人和 AI
- `IsFinished` 的含义因关卡而异：
  - 关卡1（耐力之匣）：到达终点
  - 其他关卡：完成该关卡的特定目标
- 满足以下任一条件时返回 true：
  - 所有玩家都完成关卡（全部 IsFinished = true）
  - 所有玩家都被淘汰（全部 IsEliminated = true）
  - 部分完成，部分淘汰（无人仍在进行）

## 设计说明

> PlayerRecords 存储架构详见 [系统架构.md](../系统架构.md#三数据结构)。
