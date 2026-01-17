# PC_Core（PlayerController）

**职责**：玩家控制器基类，管理 UI 组件、关卡组件动态加载、菜单输入

## 组件

| 组件 | 类型 | 用途 | 添加方式 |
|------|------|------|----------|
| Comp_UI_Core | ActorComponent | 游戏级 UI 管理 | 固有组件 |
| Comp_PC_\<Level\> | ActorComponent | 关卡专属逻辑（QTE、特殊输入等） | OnPossess 动态添加 |

## 关键事件

### Event OnPossess

动态添加关卡专属组件：

```
Event OnPossess (Pawn)
    ↓
Has Authority?
    ↓ True
Get Game Mode → Cast to GM_Core → Get LevelPCComponentClass
    ↓
Is Valid?
    ↓ True
Add Actor Component (LevelPCComponentClass)
    ↓
组件启用 Component Replicates → 自动复制到客户端
```

**设计说明**：
- 组件仅在服务端添加，通过复制系统同步到客户端
- 具体组件类由 GM 子类配置（如 GM_Endurance 配置 Comp_PC_Endurance）

## 输入处理

| 输入类型 | Input Action | 处理 |
|----------|--------------|------|
| 菜单操作 | ESC | → Comp_UI_Core.ToggleGameMenu() |

详见 [输入系统.md](../输入系统.md#三输入分层)。

## 关卡组件架构

```
PC_Core
├── [固有] Comp_UI_Core
│   └── 管理 WBP_Core_Main、WBP_GameMenu
│
└── [动态] Comp_PC_<Level>（由 GM 配置）
    ├── Comp_PC_Endurance（关卡1）
    │   └── QTE 显示、失衡输入
    ├── Comp_PC_Logic（关卡2）
    ├── Comp_PC_Courage（关卡3）
    ├── Comp_PC_Insight（关卡4）
    └── Comp_PC_Sacrifice（关卡5）
```

## 被引用场景

| 引用位置 | 用途 |
|----------|------|
| Comp_UI_Core | Get Owner → Cast To PC_Core → Get Player State |
| Comp_PC_Endurance | Get Owner → Cast to PC_Core（缓存引用） |
| GA_Stagger | Cast (GetController) to PC_Core 判断玩家/AI |
| WBP_Endurance_QTE_Stagger | Cast (GetOwningPlayer) to PC_Core |

## 相关文档

- [Comp_UI_Core.md](../UI/Comp_UI_Core.md) - 游戏级 UI 组件
- [UI 架构概述](../UI/架构概述.md) - UI 分层设计
- [输入系统.md](../输入系统.md) - 输入分层架构
- [Comp_PC_Endurance.md](../../01-耐力之匣/架构/Comp_PC_Endurance.md) - 关卡1 PC 组件
