# DA_ItemSystemConfig

> 道具系统数据资产 - 集中管理瞄准和投掷相关配置

**路径**：`Content/0_/Level/1_Endurance/Items/DA/`

| 资产 | 类型 | 说明 |
|------|------|------|
| DA_ItemSystemConfig | 蓝图类（继承 UPrimaryDataAsset） | 道具系统数据资产定义 |
| DA_Item_Default | 实例 | 默认配置值 |

---

## Effect Container

### AimEffectContainer

| 配置 | 值 |
|------|-----|
| Target Type | GSCTargetTypeUseOwner |
| GE | GE_Aiming |
| SetByCaller | 无 |

### ThrowEffectContainer

| 配置 | 值 |
|------|-----|
| Target Type | GSCTargetTypeUseOwner |
| GE | GE_Throwing |
| SetByCaller | 无 |

---

## 使用说明

GA_Aim 和 GA_Throw 通过 `ConfigAsset` 变量引用此 Data Asset（变量默认值 = DA_Item_Default）。

**获取 Effect Container**：
```
MakeEffectContainerSpecFromContainer (ConfigAsset.AimEffectContainer)
    → ApplyEffectContainerSpec
```

---

## 相关文档

- [道具系统.md](../道具系统.md)
- [瞄准投掷系统.md](瞄准投掷系统.md)
- [BP_Item_Base.md](../核心类/BP_Item_Base.md)
