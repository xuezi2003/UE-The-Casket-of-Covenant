# Comp_UI_Core

> 游戏级 UI 管理组件

## 职责

管理游戏级 UI（WBP_Core_Main + WBP_GameMenu）

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `WBP_Core_Main_Class` | TSubclassOf | Widget 类（Instance Editable） |
| `WBP_Core_Main` | WBP_Core_Main 引用 | 创建的实例 |
| `Wait_PSHandle` | Timer Handle | PlayerState 等待 Timer |

---

## 初始化流程

等待 PlayerState 同步后再创建 UI：

```
Event BeginPlay
    ↓
Set Timer by Event (Looping, Time = 每帧)
├── Create Event → WaitForPlayerState()
└── Return Value → SET Wait_PSHandle

WaitForPlayerState()
    ↓
Get Owner → Cast To PC_Core → Get Player State → Cast To PS_FiveBox
    ↓ (Cast 成功)
Clear Timer → InitComp()

InitComp()
    ↓
CreateUI()
```

---

## 接口函数

| 函数 | 说明 |
|------|------|
| `CreateUI()` | 创建并添加 UI 到 Viewport |
| `DestroyUI()` | 销毁 UI |
| `GetCoreMain()` | 返回 WBP_Core_Main 引用 |
| `ToggleGameMenu()` | 切换游戏菜单 |

---

## 相关文档

- [架构概述.md](架构概述.md)
- [WBP_Core_Main.md](WBP_Core_Main.md)
