# WBP_Core_Status

> 状态面板 Widget（GSCUserWidget）

## Widget 结构

```
WBP_Core_Status（GSCUserWidget）
└── 画布面板
    └── 垂直框
        └── 水平框
            ├── WBP_Core_Avatar ← 头像子组件
            ├── 垂直框
            │   ├── ProgressBar_Health（红色）
            │   └── ProgressBar_Stamina（黄色）
            └── 缩放框
                └── TextBlock_SpeedRate
```

---

## 初始化流程

```
Event Construct
    ↓
SetOwnerActor(GetOwningPlayerPawn)
    ↓
InitializeWithAbilitySystem(GetOwningAbilitySystemComponent)  ← 必须手动调用！
    ↓
触发 Event OnAbilitySystemInitialized
    ↓
Update_Status() → Update_Avatar()
```

> [!IMPORTANT]
> `SetOwnerActor` 只设置引用，**不会自动调用初始化**。
> 必须手动调用 `InitializeWithAbilitySystem` 才能触发 `OnAbilitySystemInitialized` 事件。

---

## Update_Status 函数

```
Update_Status
    ↓
Update_Health() → Update_Stamina() → Update_SpeedRate()
```

---

## 属性变化响应

```
Event OnAttributeChange (Attribute, NewValue, OldValue)
    ↓
Switch on Gameplay Attribute
├── BAS_Core.Health → Update_Health()
├── BAS_Core.Stamina → Update_Stamina()
└── BAS_Core.SpeedRate → Update_SpeedRate()
```

---

## 各 Update 函数实现

| 函数 | 实现 |
|------|------|
| `Update_Health` | `ProgressBar_Health.SetPercent(GetPercentForAttributes(Health, MaxHealth))` |
| `Update_Stamina` | `ProgressBar_Stamina.SetPercent(GetPercentForAttributes(Stamina, MaxStamina))` |
| `Update_SpeedRate` | `TextBlock_SpeedRate.SetText(Format("速率*{0}", GetAttributeValue(SpeedRate)))` |
| `Update_Avatar` | `GetOwningPlayer → PlayerState → PS_FiveBox.AvatarData → WBP_Core_Avatar.Update_Avatar()` |

---

## 相关文档

- [架构概述.md](架构概述.md)
- [WBP_Core_Avatar.md](WBP_Core_Avatar.md)
- [属性系统.md](../属性系统.md)
