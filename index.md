# 契约之匣 - The Casket of Covenant

> 项目名：**A_FiveBox** | 纯蓝图项目

---

## 文件夹结构

```
.
├── 核心系统/
│   ├── 系统架构.md           # 核心类总览、技术选型、GAS/State Tree 规范
│   ├── 整体流程.md           # 关卡流程、编号/淘汰/金币/HP 系统
│   └── 核心类/               # 各核心类详细文档
├── 关卡设计/
│   ├── 01-耐力之匣/
│   ├── 02-逻辑之匣/
│   ├── 03-勇气之匣/
│   ├── 04-洞察之匣/
│   └── 05-牺牲之匣/
├── 参考文档/
│   ├── 命名规范.md           # 资源命名前缀、文件夹组织规范
│   ├── 插件整理.md           # 插件列表
│   ├── 插件文档链接.md       # 插件官方文档链接
│   └── 素材整理.md           # 动画/模型/UI 素材
├── 进度跟踪/
└── README.md
```

---

## 技术栈

| 组件 | 选型 |
|:-----|:-----|
| 引擎 | Unreal Engine 5 |
| 能力系统 | GAS Companion + Blueprint Attributes |
| 状态机/行为树 | State Tree (引擎内置) |
| 联机插件 | Advanced Sessions |
| 开发联机 | Null Online Subsystem (LAN) |
| 发布联机 | Steam Online Subsystem |
| 网络架构 | ⚠️ **Dedicated Server** |
| 关卡切换 | ⚠️ **Seamless Travel** |
| 版本控制 | **Diversion** |

---

## 核心类速查

| 类 | 父类 | 生命周期 | 详细文档 |
|:---|:-----|:---------|:---------|
| `GI_FiveBox` | AdvancedFriendsGameInstance | 全局永久 | [链接](核心系统/核心类/GI_FiveBox.md) |
| `GM_Core` | GameModeBase | 关卡级 | [链接](核心系统/核心类/GM_Core.md) |
| `GS_Core` | GameStateBase | 关卡级 | [链接](核心系统/核心类/GS_Core.md) |
| `PS_FiveBox` | GSCModularPlayerState | 跨关卡 | [链接](核心系统/核心类/PS_FiveBox.md) |
| `PC_Core` | GSCModularPlayerController | 跨关卡 | [链接](核心系统/核心类/PC_Core.md) |
| `BP_Character_Game` | GSCModularPlayerStateCharacter | 关卡级 | [链接](核心系统/核心类/BP_Character_Game.md) |
| `AIC_Game` | AAIController | 关卡级 | [链接](核心系统/核心类/AIC_Game.md) |

---

## 更新日志

| 日期 | 内容 |
|:-----|:-----|
| 2024-12-24 | 重新策划并设计项目结构，新增核心类详细文档 |
| 2024-12-24 | 初始化新版设计文档结构 |
