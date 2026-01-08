# GM_Endurance（GameMode）

**职责**：关卡1 耐力之匣的 GameMode

**父类**：GM_Core

## 类配置

| 配置项 | 值 |
|--------|-----|
| 游戏状态类 | GS_Endurance |
| 玩家控制器类 | PC_Core |
| 玩家状态类 | PS_FiveBox |
| 默认 Pawn 类 | BP_Character_Game |
| 使用无缝漫游 | ✅ |

## 变量配置

| 变量名 | 值 | 说明 |
|--------|-----|------|
| Level Ability Set | AbilitySet_Endurance | 关卡1 技能集 |
| Level Behavior Tree | BT_Endurance | 关卡1 AI 行为树 |
| Level Character Component Class | Comp_Character_Endurance | 关卡1 Character 组件 |
| Level PC Component Class | Comp_PC_Endurance | 关卡1 PC 组件 |
| Level IMC | IMC_Endurance | 关卡1 输入映射 |
| Level Sub State Tree | ST_Endurance | 关卡1 子状态树 |

## 重写函数

### GetSpawnPos
```
Get Actor Of Class (BP_BornVol)
→ RandomPoint (调用 BP_BornVol.GetRandomPlayerStarter)
→ Return Pos
```
返回 BP_BornVol 区域内的随机坐标。

## 场景依赖

| Actor | 用途 |
|-------|------|
| BP_BornVol | 出生区域，GetSpawnPos 从中获取随机点 |
