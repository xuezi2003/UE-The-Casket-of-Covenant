# GameState - GS_Core

> 关卡级，存在于服务器和所有客户端，负责同步关卡状态

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **基类名** | `GS_Core` |
| **父类** | `GameStateBase` |
| **生命周期** | 关卡级（ServerTravel 时销毁重建） |
| **存在位置** | 服务器 + 所有客户端（自动复制） |

---

## 继承结构

```
GameStateBase
└── GS_Core (基类)
    ├── GS_Endurance  (灯状态)
    ├── GS_Logic      (题目、密码进度、房间状态)
    ├── GS_Courage    (车厢毒气状态、投票)
    ├── GS_Insight    (分组、连胜计数、站队统计)
    └── GS_Sacrifice  (待定)
```

---

## GS_Core 同步数据（Replicated）

| 属性 | 类型 | 说明 |
|:-----|:-----|:-----|
| `RemainingTime` | Float | 剩余时间 |
| `CurrentPhase` | Enum | 当前阶段（Preparing / InProgress / Settlement） |
| `PlayerRecords` | Array | 玩家记录数组 |

---

## ELevelPhase 枚举

| 值 | 说明 |
|:---|:-----|
| `Preparing` | 准备阶段（开场动画） |
| `InProgress` | 游戏进行中 |
| `Settlement` | 结算阶段 |

---

## FPlayerRecord 结构

| 字段 | 类型 | 说明 |
|:-----|:-----|:-----|
| `PlayerNum` | Int | 编号（全程不变） |
| `AvatarData` | Struct | 头像数据 |
| `bIsHuman` | Bool | 真人 / AI |
| `bIsEliminated` | Bool | 已淘汰 |
| `bIsConnected` | Bool | 在线状态 |

---

## GS_Core 通用函数

| 函数 | 说明 |
|:-----|:-----|
| `GetAlivePlayerCount` | 获取存活玩家数 |
| `GetAliveHumanCount` | 获取存活真人数 |
| `MarkPlayerEliminated(PlayerNum)` | 标记玩家淘汰 |
| `GetPlayerRecord(PlayerNum)` | 获取玩家记录 |
| `Multicast_OnPhaseChanged(Phase)` | 广播阶段切换 |

---

## 子类特有数据

| 子类 | 特有同步数据 |
|:-----|:-------------|
| **GS_Endurance** | `ELightState` 灯状态（红/绿） |
| **GS_Logic** | 当前题目、密码进度、房间状态、当前答题者 |
| **GS_Courage** | 当前阶段、车厢毒气状态、投票结果 |
| **GS_Insight** | 玩家分组、各玩家连胜计数、站队统计 |
| **GS_Sacrifice** | 待定 |

---

## 各关卡 GS 配置

| 关卡 | GS |
|:-----|:---|
| L_Lobby | `GS_Core`（不需要子类） |
| L_Endurance | `GS_Endurance` |
| L_Logic | `GS_Logic` |
| L_Courage | `GS_Courage` |
| L_Insight | `GS_Insight` |
| L_Sacrifice | `GS_Sacrifice` |
