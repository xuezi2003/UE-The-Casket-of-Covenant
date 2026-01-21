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
| SetPlayerFinished | 设置指定 PlayerNum 为已到达终点 | ✅ |

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

**说明**：将指定玩家标记为已到达终点。

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

## 设计说明

> 数据结构详见 [系统架构.md](../系统架构.md#三数据结构)。
