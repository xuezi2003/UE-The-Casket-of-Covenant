# 项目结构

## 目录组织

```
/
├── .agent/rules/          # AI 开发规则（已整合至 steering）
├── .kiro/steering/        # Kiro 引导文档
├── 关卡设计/              # 核心设计文档
│   ├── 00-通用逻辑/       # 跨关卡通用系统
│   │   ├── 核心类/        # GM/GS/PS/Character 等
│   │   └── UI/            # UI 架构与 Widget
│   ├── 01-耐力之匣/       # 关卡1 设计
│   │   ├── GAS/           # 技能系统设计
│   │   ├── 核心类/        # 关卡专属类
│   │   └── UI/            # 关卡专属 UI
│   └── 02~05-*/           # 其他关卡（结构同上）
├── 参考文档/              # 插件文档、开发技巧
└── 待办文档/              # 每日开发进度
```

## 命名规范

### 文档命名

| 类型 | 命名 | 示例 |
|------|------|------|
| 类设计 | `<类名>.md` | `GM_Core.md`, `BP_Puppet.md` |
| 系统设计 | `<系统名>.md` | `属性系统.md`, `输入系统.md` |
| 关卡总览 | `总体策划.md` | 每个关卡目录下 |

### GameplayTag 命名

| 前缀 | 用途 |
|------|------|
| `Match.Phase.*` | 比赛阶段 |
| `Player.Action.*` | 玩家主动操作 |
| `Player.State.*` | 玩家被动状态 |
| `Effect.Container.*` | GAS 效果容器 |
| `Gameplay.Event.*` | 游戏事件 |

## 类层级结构

> 详细类层级、职责、文档链接见 [系统架构.md](../../关卡设计/00-通用逻辑/系统架构.md#二类层级结构)

### 快速参考

| 层级 | 类 |
|------|-----|
| Core 层 | GI_FiveBox、GM_Core、GS_Core、PC_Core、PS_FiveBox、AIC_Core、BP_Character_Game |
| 关卡特化层 | GM_\<Level\>、GS_\<Level\>、Comp_Character_\<Level\>、Comp_PC_\<Level\> |
