# PlayerController - PC_Core

> 跨关卡保留，负责输入处理和 UI 管理

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **基类名** | `PC_Core` |
| **父类** | `GSCModularPlayerController`（GAS Companion） |
| **生命周期** | 跨关卡保留（Seamless Travel） |
| **存在位置** | 服务器 + 拥有者客户端 |

---

## 继承结构

```
GSCModularPlayerController
└── PC_Core (基类)
    ├── PC_Lobby  (大厅：无 Pawn，纯 UI)
    └── PC_Game   (游戏关卡：有 Pawn)
```

---

## PC_Lobby

| 项目 | 说明 |
|:-----|:-----|
| **Pawn** | 无 |
| **职责** | 大厅 UI 交互、准备状态 |
| **HUD** | `WBP_Lobby` |

---

## PC_Game

| 项目 | 说明 |
|:-----|:-----|
| **Pawn** | `BP_Character_Game` |
| **职责** | 游戏输入、HUD 管理 |
| **HUD** | `WBP_GameHUD` + 关卡专属 Widget |

### BeginPlay 逻辑

```
1. 创建 WBP_GameHUD → AddToViewport
2. 从 GM 获取 LevelHUDWidgetClass → CreateWidget
3. 添加到 WBP_GameHUD 的 LevelContentContainer
```

---

## HUD 结构

```
WBP_GameHUD (公用框架)
├── WBP_HPBar (公用)
├── WBP_CoinDisplay (公用)
├── WBP_Timer (公用)
└── LevelContentContainer (NamedSlot)
    └── 【动态添加关卡专属 Widget】
```

### 关卡专属 HUD Widget

| 关卡 | Widget | 显示内容 |
|:-----|:-------|:---------|
| L_Endurance | `WBP_HUD_Endurance` | 道具栏、灯状态、Buff图标 |
| L_Logic | `WBP_HUD_Logic` | 题目、密码进度、房间投票 |
| L_Courage | `WBP_HUD_Courage` | 面具数量、线索列表 |
| L_Insight | `WBP_HUD_Insight` | 站队UI、连胜进度 |
| L_Sacrifice | `WBP_HUD_Sacrifice` | 待定 |

---

## 各关卡 PC 配置

| 关卡 | PC |
|:-----|:---|
| L_MainMenu | 默认 |
| L_Lobby | `PC_Lobby` |
| L_Endurance ~ L_Sacrifice | `PC_Game` |
