# PC_Core（PlayerController）

**职责**：玩家控制器基类，管理 UI 组件、关卡组件动态加载、菜单输入

## 组件

| 组件 | 类型 | 用途 | 添加方式 |
|------|------|------|----------|
| Comp_UI_Core | ActorComponent | 游戏级 UI 管理 | 固有组件 |
| Comp_PC_\<Level\> | ActorComponent | 关卡专属逻辑（QTE、特殊输入等） | OnPossess 动态添加 |

## 关键事件

### Event OnPossess ✅ 已更新

动态添加关卡专属组件 + 绑定淘汰/完成事件监听：

```blueprint
Event OnPossess (PossessedPawn)
    ↓
Call Parent: OnPossess
    ↓
Switch Has Authority → Authority:
    ↓
Sequence
    ├─ then_0: 添加关卡组件
    │   Cast GetGameMode() to GM_Core
    │       → If IsValidClass(LevelPCComponentClass)
    │           → AddComponentByClass
    │               → SetIsReplicated(true)
    │                   → SET LevelPCComp
    │
    └─ then_1: 绑定事件监听
        ├─ AsyncAction: Wait for Gameplay Event to Actor
        │   ├─ Target: PossessedPawn (Character)
        │   ├─ Event Tag: Gameplay.Event.Player.Eliminated
        │   └─ On Event Received → HandlePlayerEliminate()
        │
        └─ AsyncAction: Wait for Gameplay Event to Actor
            ├─ Target: PossessedPawn (Character)
            ├─ Event Tag: Gameplay.Event.Player.Finished
            └─ On Event Received → HandlePlayerFinish()
```

**设计说明**：
- 组件仅在服务端添加，通过复制系统同步到客户端
- 具体组件类由 GM 子类配置（如 GM_Endurance 配置 Comp_PC_Endurance）
- **事件监听架构**：BP_Character_Game 和 PC_Core 都监听 Character 的淘汰/完成事件（事件多播模式）
  - BP_Character_Game 负责：档案管理 + 关卡检查（Server Only）
  - PC_Core 负责：真人玩家的特殊逻辑（UnPossess + 返回主菜单）

### HandlePlayerEliminate（Custom Event）⚠️ 部分实现

**说明**：只处理真人玩家的特殊逻辑（UnPossess + 返回主菜单）

```blueprint
Event HandlePlayerEliminate
    ↓
UnPossess()
    ↓
BPL_Game_Core.GetGIFiveBox().CheckIsHuman(PlayerNum)
    ↓
If (IsHuman)
    ├─ True → PrintText ("【PC_Core】玩家已淘汰，应返回主菜单")
    └─ False → [结束]
```

> [!WARNING]
> **待完善功能**：真人玩家返回主菜单
> 
> 当前使用 `PrintText` 占位符，需要替换为：
> ```blueprint
> Open Level (by Name)
>     └─ Level Name: "MainMenu"
> ```
> 
> **注意**：
> - 开启无缝切换不影响单个玩家的 `Open Level`
> - `Open Level` 会触发非无缝切换，彻底重置玩家状态

**设计说明**：
- PC_Core 只负责真人玩家的特殊逻辑（UnPossess、返回主菜单）
- **档案管理和关卡检查由 BP_Character_Game 统一处理**
- 事件监听由 BP_Character_Game.HandlePlayerRecord 绑定（Server Only）

**触发来源**：
- PC_Core.OnPossess 中绑定的事件监听（监听 Gameplay.Event.Player.Eliminated）
- Comp_Character_Endurance.HandleHealthChanged 发送此事件

---

### HandlePlayerFinish（Custom Event）✅ 已清空

```blueprint
Event HandlePlayerFinish
    ↓
[Path ends]
```

**设计说明**：
- 此函数已清空，不再处理档案管理和关卡检查
- **档案管理和关卡检查由 BP_Character_Game 统一处理**
- 如果未来需要真人玩家的特殊完成逻辑，可以在此添加

**触发来源**：
- PC_Core.OnPossess 中绑定的事件监听（监听 Gameplay.Event.Player.Finished）
- BP_FinishLine.OnComponentEndOverlap 发送此事件

---

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
- [BP_Character_Game.md](BP_Character_Game.md) - 淘汰/完成事件监听和档案管理
