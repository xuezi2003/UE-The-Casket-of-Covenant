# GameMode - GM_Core

> 关卡级，仅存在于服务器，负责游戏规则

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **基类名** | `GM_Core` |
| **父类** | `GameModeBase` |
| **生命周期** | 关卡级（ServerTravel 时销毁重建） |
| **存在位置** | 仅服务器 |

---

## 继承结构

```
GameModeBase
└── GM_Core (基类)
    ├── GM_Lobby      (大厅)
    ├── GM_Endurance  (耐力之匣)
    ├── GM_Logic      (逻辑之匣)
    ├── GM_Courage    (勇气之匣)
    ├── GM_Insight    (洞察之匣)
    └── GM_Sacrifice  (牺牲之匣)
```

---

## 关键配置

| 配置 | 值 |
|:-----|:---|
| `bUseSeamlessTravel` | `true`（保留 PS 跨关卡） |

---

## GM_Core 配置项（子类覆盖）

| 属性 | 类型 | 说明 |
|:-----|:-----|:-----|
| `LevelInputComponentClass` | Class | 关卡专属输入组件类 |
| `LevelHUDWidgetClass` | Class | 关卡专属 HUD Widget 类 |
| `LevelTimeLimit` | Float | 关卡时限（秒） |
| `NextLevelName` | Name | 下一关卡名 |

---

## GM_Core 通用函数

### 生命周期

| 函数 | 说明 |
|:-----|:-----|
| `HandleMatchHasStarted` | 关卡开始时调用 |
| `HandleLevelComplete` | 关卡完成时调用（子类覆盖） |

### 玩家管理

| 函数 | 说明 |
|:-----|:-----|
| `HandleStartingNewPlayer(NewPlayer)` | 玩家登录后分配编号，更新 GS.PlayerRecords<br>1. **⚠️ 必须先调用 Parent: HandleStartingNewPlayer** (生成Pawn)<br>2. 分配 PlayerNum (GS.PlayerRecords.Length **+ 1**, 从 1 开始)<br>3. 生成随机头像 (BPL_Common.RandomAvatar, Index 从 1 开始)<br>4. 更新 GS.PlayerRecords |
| `EliminatePlayer(PS)` | 淘汰玩家（踢出 + 标记） |
| `InstantKillPlayer(PS)` | 即死（违规） |
| `OnPlayerDisconnected(PS)` | 掉线 → AI 接管 |

### AI 管理

| 函数 | 说明 |
|:-----|:-----|
| `SpawnAIToFillSlots` | AI 填充空位 |

### 检测

| 函数 | 说明 |
|:-----|:-----|
| `AreAllHumansEliminated` | 检测真人是否全死 |
| `GetAlivePlayerCount` | 获取存活玩家数 |

### 关卡流转

| 函数 | 说明 |
|:-----|:-----|
| `TravelToNextLevel` | Seamless Travel 到下一关 |
| `EndGameSession` | 结束整局（真人全死时） |

### GAS 相关

| 函数 | 说明 |
|:-----|:-----|
| `RestoreAllPlayersHP` | 每关开始恢复所有玩家 HP |
| `DropPlayerCoins(PS)` | 玩家死亡掉落金币 |

---

## 子类特有逻辑

| 子类 | 特有功能 |
|:-----|:---------|
| **GM_Lobby** | 编号分配、倒计时、全员同意缩短倒计时 |
| **GM_Endurance** | 红绿灯切换、移动检测→击杀 |
| **GM_Logic** | 题目验证、房间安全判定、密码管理 |
| **GM_Courage** | 毒气判定、面具检查、车厢推进 |
| **GM_Insight** | 异常生成、站队判定、分组管理 |
| **GM_Sacrifice** | 待定 |

---

## 各关卡 GM 配置

| 关卡 | GM | DefaultPawnClass | AIControllerClass |
|:-----|:---|:-----------------|:------------------|
| L_Lobby | `GM_Lobby` | None | - |
| L_Endurance | `GM_Endurance` | `BP_Character_Game` | `AIC_Game` |
| L_Logic | `GM_Logic` | `BP_Character_Game` | `AIC_Game` |
| L_Courage | `GM_Courage` | `BP_Character_Game` | `AIC_Game` |
| L_Insight | `GM_Insight` | `BP_Character_Game` | `AIC_Game` |
| L_Sacrifice | `GM_Sacrifice` | `BP_Character_Game` | `AIC_Game` |
