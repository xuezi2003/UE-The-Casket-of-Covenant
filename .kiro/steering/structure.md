# 项目结构

本仓库为《契约之匣》的游戏设计文档库，非代码仓库。

## 目录结构

```
关卡设计/
├── 00-通用逻辑/          # 跨关卡共享的系统设计
│   ├── 系统架构.md       # 架构概览与数据流
│   ├── 总体策划.md       # 核心架构与任务总结
│   ├── 外观加载.md       # 玩家外观同步系统
│   ├── 输入与属性.md     # 输入映射与 GAS 属性配置
│   ├── 等待大厅.md       # 匹配等待系统（待实现）
│   ├── GameplayTags.csv  # Gameplay Tags 定义表
│   └── 核心类/           # 各核心类详细文档
│       ├── GI_FiveBox.md
│       ├── GS_Core.md
│       ├── GM_Core.md
│       ├── PS_FiveBox.md
│       ├── AIC_Core.md
│       └── BP_Character_Game.md
├── 01-耐力之匣/          # 关卡1：红绿灯机制
├── 02-逻辑之匣/          # 关卡2：答题博弈
├── 03-勇气之匣/          # 关卡3：毒气车厢
├── 04-洞察之匣/          # 关卡4：异常走廊
└── 05-牺牲之匣/          # 关卡5：玻璃桥
待办文档/                  # 每日待办记录（YYYY-MM-DD.md）
```

## 文档规范

- 每个关卡文件夹包含 `总体策划.md` 作为主设计文档
- 通用逻辑放在 `00-通用逻辑/` 目录
- 核心类详细文档放在 `00-通用逻辑/核心类/` 目录
- **每个关卡的专属类需要在关卡目录下创建 `核心类/` 子目录存放详细文档**
- 使用 Markdown 格式，支持表格和代码块

## 核心类命名约定

| 前缀 | 类型 | 示例 |
|------|------|------|
| GI_ | GameInstance | GI_FiveBox |
| GS_ | GameState | GS_Core, GS_Endurance |
| GM_ | GameMode | GM_Core, GM_Endurance |
| PC_ | PlayerController | PC_Core |
| PS_ | PlayerState | PS_FiveBox |
| AIC_ | AIController | AIC_Core |
| BP_ | Blueprint Actor | BP_Character_Game |
| ST_ | State Tree | ST_LevelFlow_Main |
| STT_ | State Tree Task | STT_FillAI |
| BT_ | Behavior Tree | BT_Endurance |
| S_ | Struct | S_PlayerRecord, S_AvatarData |
| E_ | Enum | E_LevelPhase |
| DT_ | Data Table | DT_Tex_Avatar_Path |
