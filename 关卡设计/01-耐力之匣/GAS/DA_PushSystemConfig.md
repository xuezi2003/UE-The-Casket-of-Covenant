# DA_PushSystemConfig

> 推搡系统数据资产 - 集中管理所有 GA 和 QTE Widget 的可配置数值

**位置**：`Content/0_/Level/1_Endurance/GAS/DA/`

| 资产 | 类型 | 说明 |
|------|------|------|
| DA_PushSystemConfig | 蓝图类 | 定义数据结构 |
| DA_Push_Default | 实例 | 默认配置值 |

---

## Effect Container

### PushEffectContainer
| 配置 | 值 |
|------|-----|
| Target Type | GSCTargetTypeUseOwner |
| GE | GE_Pushing, GE_StaminaCost |
| SetByCaller | Effect.Cost.Stamina = -20 |

### StaggerEffectContainer
| 配置 | 值 |
|------|-----|
| Target Type | GSCTargetTypeUseOwner |
| GE | GE_Staggered |
| SetByCaller | 无 |

### FallEffectContainer
| 配置 | 值 |
|------|-----|
| Target Type | GSCTargetTypeUseOwner |
| GE | GE_Fallen |
| SetByCaller | 无 |

### DodgeEffectContainer
| 配置 | 值 |
|------|-----|
| Target Type | GSCTargetTypeUseOwner |
| GE | GE_StaminaCost, GE_Dodging |
| SetByCaller | Effect.Cost.Stamina = -20 |

---

## GA 参数

| 字段 | 类型 | 默认值 | 使用者 |
|------|------|--------|--------|
| StaggerDuration | Float | 8.0 | GA_Stagger |
| AISuccessRate | Float | 0.5 | GA_Stagger |
| FallDuration | Float | 5.0 | GA_Fall |

---

## QTE 参数

| 字段 | 类型 | 默认值 | 使用者 |
|------|------|--------|--------|
| RequireCnt | Int | 3 | WBP_Endurance_QTE_Stagger |
| PointSpeed | Float | 280.0 | WBP_Endurance_QTE_Stagger |
| TargetMoveInterval | Float | 3.0 | WBP_Endurance_QTE_Stagger |
| TargetSpeed | Float | 12.0 | WBP_Endurance_QTE_Stagger |

---

## 使用说明

所有 GA 和 Widget 通过 `ConfigAsset` 变量引用此 Data Asset（变量默认值 = DA_Push_Default）。

**获取 Effect Container**：
```
MakeEffectContainerSpecFromContainer (ConfigAsset.XXXEffectContainer)
    → ApplyEffectContainerSpec
```

**获取数值参数**：
```
ConfigAsset.StaggerDuration
ConfigAsset.PointSpeed
...
```

---

## 相关文档

- [推搡系统.md](推搡系统.md)
- [WBP_Endurance_QTE_Stagger.md](../UI/WBP_Endurance_QTE_Stagger.md)
