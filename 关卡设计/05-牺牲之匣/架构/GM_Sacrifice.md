# GM_Sacrifice（GameMode）

**职责**：关卡5 牺牲之匣的 GameMode

**父类**：GM_Core

**实现状态**：✅ Phase 1 已完成（类配置 + 变量配置）

---

## 类配置

| 配置项 | 值 |
|--------|-----|
| 游戏状态类 | GS_Sacrifice |
| 玩家控制器类 | PC_Core |
| 玩家状态类 | PS_FiveBox |
| 默认 Pawn 类 | BP_Character_Game |
| 使用无缝漫游 | ✅ |

---

## 变量配置

| 变量名 | 值 | 说明 | 实现状态 |
|--------|-----|------|----------|
| Level Ability Set | AbilitySet_Sacrifice | 关卡5 技能集（Phase 1 为空，Phase 5 配置能力） | ✅ Phase 1 已配置 |
| Level Behavior Tree | None | 关卡5 AI 行为树 | ⚠️ Phase 8 待创建 |
| Level Character Component Class | Comp_Character_Sacrifice | 关卡5 Character 组件 | ✅ Phase 1 已配置 |
| Level PC Component Class | Comp_PC_Sacrifice | 关卡5 PC 组件 | ✅ Phase 1 已配置 |
| Level IMC | IMC_Sacrifice | 关卡5 输入映射 | ✅ Phase 1 已配置 |
| Level Sub SM | SM_Sacrifice | 关卡5 子状态机 | ✅ Phase 1 已配置 |

**Phase 1 配置完成**：除 BT_Sacrifice（Phase 8 创建）外，所有变量已正确配置。

---

## 重写函数

### GetSpawnPos

**返回类型**：FVector

**实现**：
```
Get Actor Of Class (BP_BornVol)
→ RandomPoint (调用 BP_BornVol.GetRandomPlayerStarter)
→ Return Pos
```

返回 BP_BornVol 区域内的随机坐标。

---

## 场景依赖

| Actor | 用途 |
|-------|------|
| BP_BornVol | 出生区域，GetSpawnPos 从中获取随机点 |

---

## 相关文档

- [GM_Core.md](../../00-通用逻辑/核心类/GM_Core.md) - 父类
- [GS_Sacrifice.md](GS_Sacrifice.md) - GameState
- [总体策划.md](../总体策划.md) - 关卡5总体策划

