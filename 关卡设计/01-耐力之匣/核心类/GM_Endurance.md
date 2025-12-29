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
| Level Character Compoent Class | Comp_Endurance | 关卡1 操作组件 |
| Level IMC | None | 关卡1 输入映射（待配置） |
| Level Sub State Tree | ST_Endurance | 关卡1 子状态树 |

## 重写函数

| 函数 | 说明 |
|------|------|
| GetSpawnPos | 返回关卡1 出生点坐标 |

## 实现状态

- [x] 蓝图已创建
- [x] 类配置已设置
- [x] Level Ability Set 已配置（空壳）
- [x] Level Behavior Tree 已配置（空壳）
- [x] Level Character Compoent Class 已配置（Comp_Endurance）
- [x] Level Sub State Tree 已配置（ST_Endurance）
- [x] GetSpawnPos 已重写
- [ ] Level IMC 待配置（IMC_Endurance 未创建）
