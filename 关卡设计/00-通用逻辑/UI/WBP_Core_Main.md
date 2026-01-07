# WBP_Core_Main

> 顶层 HUD 容器（GSCUserWidget）

## Widget 结构

```
WBP_Core_Main（GSCUserWidget）
└── 画布面板
    └── Panel_Core_Status ← WBP_Core_Status 实例
```

## 职责

- 管理状态面板（Panel_Core_Status）
- 提供关卡 HUD 插槽（LevelHUDSlot）

## 实现状态

| 功能 | 状态 |
|------|------|
| 状态面板插槽 | ✅ 已实现 |
| 关卡 UI 插槽接口 | ❌ 待实现 |

### 待完成逻辑

- `SetLevelHUD(Widget)` - 设置关卡专属 HUD
- `ClearLevelHUD()` - 清除关卡专属 HUD

---

## 相关文档

- [架构概述.md](架构概述.md)
- [WBP_Core_Status.md](WBP_Core_Status.md)
