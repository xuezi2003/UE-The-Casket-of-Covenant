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
| LevelAbilitySet | GSCAbility Set | None | 当前关卡技能集 | ✅ |
| NeedPlayerCnt | 整数 | 10 | 目标玩家数量 | ✅ |
| AI_BT | 行为树 | None | AI 行为树资产 | ✅ |
| LevelComponentClass | Actor Component Class | None | 关卡专属组件类 | ❌ 待实现 |
| LevelIMC | Input Mapping Context | None | 关卡专属输入映射 | ❌ 待实现 |

## 关卡配置驱动（待实现）

GM 子类通过配置以下变量实现关卡差异化：

| GM | LevelComponentClass | AI_BT | LevelAbilitySet | LevelIMC |
|----|---------------------|-------|-----------------|----------|
| GM_Endurance | Comp_Endurance | BT_Endurance | AbilitySet_Endurance | IMC_Endurance |
| GM_Logic | Comp_Logic | BT_Logic | None | None |
| GM_Courage | Comp_Courage | BT_Courage | None | IMC_Courage |
| GM_Insight | Comp_Insight | BT_Insight | None | None |
| GM_Sacrifice | Comp_Endurance | BT_Sacrifice | AbilitySet_Endurance | IMC_Endurance |

## 关键函数

### Event BeginPlay
```
BeginPlay → RestoreAISurvivors
```

### Event OnPostLogin（玩家登录）
```
OnPostLogin (New Player)
    ↓
GetUniquePlayerNum → 判断 PlayerNum == -1?
    ├── True（新玩家）：RandomAvatar → 设置到 PS
    └── False（无缝切换）：从 PS 读取现有数据
    ↓
Make S Player Record → GI_FiveBox.AddPlayerRecord
    ↓
Clear Ability Set → Give Ability Set
```

### RestoreAISurvivors（还原存活 AI）
```
For Each (GI_FiveBox.PlayerRecords)
    ↓
条件：!IsHuman && !IsEliminated
    ↓
SpawnActor BP_Character_Game → SpawnActor AIC_Core → Possess
    ↓
从档案注入 PlayerNum/AvatarData 到 PS
```

### FillAIPlayers（AI 填充）
```
NeedAICnt = NeedPlayerCnt - LENGTH(PlayerRecords)
    ↓
For Loop (1 to NeedAICnt)
    ↓
SpawnActor → Possess → 设置数据 → AddPlayerRecord
```

### GetSpawnPos（虚函数）
子类重写，返回关卡出生区域坐标。

## FillAI 作用场景

| 场景 | PlayerRecords 数量 | FillAI 效果 |
|------|-------------------|-------------|
| 第一关（正常流程） | 等待大厅收集的真人数 | 补齐 AI，数组大小固定 |
| 后续关卡 | 等于 NeedPlayerCnt | 不会填充 |
| 调试（直接打开某关） | 只有测试者 | 补齐到目标人数 |
