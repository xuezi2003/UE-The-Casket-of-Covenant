# GM_Core（GameMode）

**职责**：玩家登录处理、出生控制、AI 管理

## 类配置

| 配置项 | 值 |
|--------|-----|
| 游戏状态类 | GS_Core |
| 玩家控制器类 | PC_Core |
| 玩家状态类 | PS_FiveBox |
| 默认 Pawn 类 | BP_Character_Game |
| 使用无缝漫游 | ✅ |

## 变量

| 变量名 | 类型 | 默认值 | 用途 | 实现状态 |
|--------|------|--------|------|----------|
| Level Ability Set | GSCAbility Set | None | 当前关卡技能集 | ✅ |
| Level Behavior Tree | 行为树 | None | AI 行为树资产 | ✅ |
| Level Character Component Class | Actor Component Class | None | 关卡专属 Character 组件类 | ✅ |
| Level PC Component Class | Actor Component Class | None | 关卡专属 PC 组件类 | ✅ |
| Level IMC | Input Mapping Context | None | 关卡专属输入映射 | ✅ |
| Level Sub SM | `TSubclassOf<USMInstance>` | None | 关卡专属子状态机类 | ✅ |

| NeedPlayerCnt | 整数 | 10 | 目标玩家数量 | ✅ |

## 关卡配置驱动

GM 子类通过配置以下变量实现关卡差异化：

| GM | Character 组件 | PC 组件 | Behavior Tree | Ability Set | IMC | Sub State Machine |
|----|----------------|---------|---------------|-------------|-----|-------------------|
| GM_Endurance | Comp_Character_Endurance | Comp_PC_Endurance | BT_Endurance | AbilitySet_Endurance | IMC_Endurance | SM_Endurance |
| GM_Logic | Comp_Logic | Comp_PC_Logic | BT_Logic | None | None | SM_Logic (待实现) |
| GM_Courage | Comp_Courage | Comp_PC_Courage | BT_Courage | None | IMC_Courage | SM_Courage (待实现) |
| GM_Insight | Comp_Insight | Comp_PC_Insight | BT_Insight | None | None | SM_Insight (待实现) |
| GM_Sacrifice | Comp_Character_Sacrifice | Comp_PC_Sacrifice | BT_Sacrifice | AbilitySet_Sacrifice | IMC_Sacrifice | SM_Sacrifice (待实现) |

## 关键函数

### Event BeginPlay
```
BeginPlay → RestoreAISurvivors
```

### Spawn Default Pawn For（重写）
```
Spawn Default Pawn For (New Player, Start Spot)
    ↓
GetSpawnPos → SpawnActor (Default Pawn Class)
    ↓
传入 Expose on Spawn 参数：
    - LevelCharacterComponentClass
    - LevelIMC
    - LevelAbilitySet
    ↓
Return Spawned Pawn
```

**注意**：
- 组件实际在 BP_Character_Game.InitPlayer 里添加，不在 GM 里添加
- AbilitySet 也在 InitPlayer 里通过 GiveAbilitySet 赋予
- GM 只负责传入配置参数

### Event OnPostLogin（玩家登录）✅ 已更新

在玩家登录时添加档案 + 绑定事件监听：

```blueprint
Event OnPostLogin (NewPlayer: PlayerController)
    ↓
Sequence
    ├─ then_0: [原有逻辑] 获取 PlayerNum 和 AvatarData
    │   GetUniquePlayerNum → 判断 PlayerNum == -1?
    │   └── True（新玩家）：RandomAvatar → 设置到 PS
    │       False（无缝切换）：从 PS 读取现有数据
    │
    └─ then_1: [原有逻辑] 添加玩家档案
        Make S Player Record → GI_FiveBox.AddPlayerRecord
        ↓
        Cast (NewPlayer.GetPawn()) To BP_Character_Game
        ↓
        HandlePlayerLogin(Character)  ← 新增：为玩家绑定事件监听
```

**说明**：
- 旧逻辑保持不变（获取 PlayerNum/AvatarData → 添加档案）
- 新增 HandlePlayerLogin 调用，为真人玩家绑定淘汰/完成事件监听

### RestoreAISurvivors（还原存活 AI）✅ 已更新

```blueprint
For Each (GI_FiveBox.PlayerRecords)
    ↓
条件：!IsHuman && !IsEliminated
    ↓ True
    ├─ SpawnActor BP_Character_Game（传入 LevelCharacterComponentClass/LevelIMC/LevelAbilitySet）
    ├─ HandlePlayerLogin(SpawnedActor)  ← 新增：为 AI 绑定事件监听
    ├─ SpawnActor AIC_Core
    ├─ Possess(Character)
    └─ 从档案注入 PlayerNum/AvatarData 到 PS
```

**说明**：
- 在 SpawnActor 后立即调用 HandlePlayerLogin，确保 AI 也能绑定事件监听
- AI 到达终点或死亡时，档案会被正确记录

### FillAIPlayers（AI 填充）✅ 已更新

```blueprint
NeedAICnt = NeedPlayerCnt - LENGTH(PlayerRecords)
    ↓
For Loop (1 to NeedAICnt)
    ↓ LoopBody
    ├─ SpawnActor BP_Character_Game（传入 LevelCharacterComponentClass/LevelIMC/LevelAbilitySet）
    ├─ HandlePlayerLogin(SpawnedActor)  ← 新增：为 AI 绑定事件监听
    ├─ SpawnActor AIC_Core
    ├─ Possess(Character)
    ├─ GetUniquePlayerNum → 设置 PlayerNum
    ├─ GetRandomAvatar → 设置 AvatarData
    └─ AddPlayerRecord
```

**说明**：
- 在 SpawnActor 后立即调用 HandlePlayerLogin，确保 AI 也能绑定事件监听
- AI 到达终点或死亡时，档案会被正确记录

### GetSpawnPos（虚函数）
子类重写，返回关卡出生区域坐标。

---

## 玩家淘汰与完成管理 ✅ 已实现

GM_Core 统一管理所有玩家（真人 + AI）的淘汰和完成逻辑。

### HandlePlayerLogin（Custom Event）✅ 已实现

**类型**：Custom Event  
**输入参数**：NewPlayer (BP_Character_Game)

在玩家登录或 AI 生成时，为其绑定淘汰/完成事件监听：

```blueprint
Event HandlePlayerLogin (NewPlayer: BP_Character_Game)
    ↓
Sequence
    ├─ then_0: AsyncAction: Wait for Gameplay Event to Actor
    │   ├─ Target: NewPlayer
    │   ├─ Event Tag: Gameplay.Event.Player.Eliminated
    │   └─ On Event Received → HandlePlayerEliminate(NewPlayer)
    │
    └─ then_1: AsyncAction: Wait for Gameplay Event to Actor
        ├─ Target: NewPlayer
        ├─ Event Tag: Gameplay.Event.Player.Finished
        └─ On Event Received → HandlePlayerFinish(NewPlayer)
```

**说明**：
- 真人和 AI 都会调用此函数，逻辑统一
- 使用 Sequence 节点并行执行两个 Async Action
- 监听的是 Character 的事件，不区分真人和 AI
- 当 Character 发送淘汰/完成事件时，自动调用对应的处理函数

**调用位置**：
- OnPostLogin：真人玩家登录后调用
- RestoreAISurvivors：还原存活 AI 后调用
- FillAIPlayers：填充 AI 后调用

---

### HandlePlayerEliminate（Custom Event）✅ 已实现

**类型**：Custom Event  
**输入参数**：Character (BP_Character_Game)

统一处理所有玩家的淘汰逻辑（档案管理 + 关卡检查）：

```blueprint
Event HandlePlayerEliminate (Character: BP_Character_Game)
    ↓
Get Player State (from Character)
    ↓
Cast to PS_FiveBox
    ↓ Success → Get PlayerNum
    ↓
BPL_Game_Core.GetGIFiveBox()
    ↓
Call SetPlayerEliminated (EliminatedPlayerNum = PlayerNum)
    ↓
Cast (GetGameState()) To GS_Core
    ↓
Call CheckLevelShouldEnd()
```

**说明**：
- 从 Character 获取 PlayerState，再获取 PlayerNum
- 调用 GI_FiveBox.SetPlayerEliminated 记录淘汰状态
- 调用 GS_Core.CheckLevelShouldEnd 触发关卡结束检查
- 真人和 AI 使用相同的处理逻辑

**触发来源**：
- Comp_Character_Endurance.HandleHealthChanged 发送 Gameplay.Event.Player.Eliminated 事件

---

### HandlePlayerFinish（Custom Event）✅ 已实现

**类型**：Custom Event  
**输入参数**：Character (BP_Character_Game)

统一处理所有玩家的完成逻辑（档案管理 + 关卡检查）：

```blueprint
Event HandlePlayerFinish (Character: BP_Character_Game)
    ↓
Get Player State (from Character)
    ↓
Cast to PS_FiveBox
    ↓ Success → Get PlayerNum
    ↓
BPL_Game_Core.GetGIFiveBox()
    ↓
Call SetPlayerFinished (FinishedPlayerNum = PlayerNum)
    ↓
Cast (GetGameState()) To GS_Core
    ↓
Call CheckLevelShouldEnd()
```

**说明**：
- 从 Character 获取 PlayerState，再获取 PlayerNum
- 调用 GI_FiveBox.SetPlayerFinished 记录完成状态
- 调用 GS_Core.CheckLevelShouldEnd 触发关卡结束检查
- 真人和 AI 使用相同的处理逻辑

**触发来源**：
- BP_FinishLine.OnComponentEndOverlap 发送 Gameplay.Event.Player.Finished 事件

---

## FillAI 作用场景

| 场景 | PlayerRecords 数量 | FillAI 效果 |
|------|-------------------|-------------|
| 第一关（正常流程） | 等待大厅收集的真人数 | 补齐 AI，数组大小固定 |
| 后续关卡 | 等于 NeedPlayerCnt | 不会填充 |
| 调试（直接打开某关） | 只有测试者 | 补齐到目标人数 |
