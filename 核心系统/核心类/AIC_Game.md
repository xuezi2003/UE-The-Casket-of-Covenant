# AIController - AIC_Game

> AI 控制器，根据关卡运行不同行为树

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **类名** | `AIC_Game` |
| **父类** | `AAIController` |
| **生命周期** | 关卡级 |
| **控制对象** | `BP_Character_Game` |

---

## 架构设计

**一个 AIC + 多个行为树**

```
AIC_Game (通用)
    ↓ BeginPlay 根据关卡加载
├── BT_AI_Endurance
├── BT_AI_Logic
├── BT_AI_Courage
├── BT_AI_Insight
└── BT_AI_Sacrifice
```

---

## BeginPlay 逻辑

```
根据当前关卡名 → 运行对应行为树

if "Endurance" → RunBehaviorTree(BT_AI_Endurance)
if "Logic" → RunBehaviorTree(BT_AI_Logic)
if "Courage" → RunBehaviorTree(BT_AI_Courage)
if "Insight" → RunBehaviorTree(BT_AI_Insight)
if "Sacrifice" → RunBehaviorTree(BT_AI_Sacrifice)
```

---

## 各关卡 AI 行为

| 关卡 | 行为树 | AI 行为 |
|:-----|:-------|:--------|
| **Endurance** | `BT_AI_Endurance` | 跑向终点、红灯停、躲障碍、用道具 |
| **Logic** | `BT_AI_Logic` | 答题（概率正确）、选房间、可能撒谎 |
| **Courage** | `BT_AI_Courage` | 收集线索、上车、戴/摘面具决策 |
| **Insight** | `BT_AI_Insight` | 站队决策（跟随/独立判断） |
| **Sacrifice** | `BT_AI_Sacrifice` | 待定 |

---

## AI 与玩家的关系

| 项目 | 玩家 | AI |
|:-----|:-----|:---|
| Character | `BP_Character_Game` | `BP_Character_Game`（共用） |
| Controller | `PC_Game` | `AIC_Game` |
| PlayerState | `PS_FiveBox` | `PS_FiveBox`（共用，AI 也有 PS） |
| 输入来源 | 玩家输入 + 输入组件 | 行为树决策 |

---

## AI 生成时机

| 时机 | 说明 |
|:-----|:-----|
| **Lobby 开始游戏时** | 填充空位 |
| **玩家掉线时** | 接管该玩家（继承编号、PS） |

---

## 掉线接管逻辑

```
1. 玩家掉线 → PC 销毁
2. 生成 AIC_Game
3. AIC Possess 原 Character
4. PS 保留（bIsHuman 改为 false，bIsConnected 改为 false）
5. AIC 运行当前关卡行为树
```

---

## 使用 Logic Driver Pro

行为树使用 Logic Driver Pro 插件创建，优势：
- 可视化编辑
- 蓝图支持
- 与状态机统一
