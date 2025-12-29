# ST_LevelFlow_Main（State Tree）

**职责**：关卡主流程状态管理

**上下文 Actor 类**：GS_Core

## 状态结构

```
Root
├── Preparing（顺序执行）
│   ├── SetPrepaingPhase
│   │   ├── STT_SetMatchPhase（NewPhase = Match.Phase.Main.Preparing）
│   │   └── STT_SimplePrint（"[ST_Core] 进入准备阶段"）
│   │   → 下个状态
│   ├── WaitingStart
│   │   └── Delay Task（Duration = Actor.PreparingDuration）
│   │   → 下个状态
│   ├── SetLock
│   │   ├── STT_AddMatchStatus（NewStatus = Match.Status.Locked）
│   │   └── STT_SimplePrint（"[ST_Core] 进入锁定"）
│   │   → 下个状态
│   └── FillAI
│       └── STT_FillAI
│       → InProgress
│
├── InProgress（顺序执行）
│   ├── SetInProgressPhase
│   │   ├── STT_SetMatchPhase（NewPhase = Match.Phase.Main.InProgress）
│   │   └── STT_SimplePrint（"[ST_Core] 进入正式游戏"）
│   │   → 下个状态
│   ├── StartSubStateTree
│   │   └── STT_StartSubStateTree（启动 GM.LevelSubStateTree 到 GS.SubST）
│   │   → 下个状态
│   └── WaitingSettle
│       └── Delay Task（Duration = Actor.InProgressDuration）
│       → Settlement
│
└── Settlement（顺序执行）
    └── （无任务）→ 树成功
```

## Preparing 阶段详细配置

### Preparing 状态（父状态）
- **类型**: 状态
- **选择行为**: 尝试按顺序选择子项
- **Transitions**: 完成后进入 SetPrepaingPhase

### SetPrepaingPhase 状态
- **Tasks**:
  - STT_SetMatchPhase: NewPhase = `Match.Phase.Main.Preparing`
  - STT_SimplePrint: Content = "[ST_Core] 进入准备阶段"
- **Transitions**: 完成后 → 下个状态（WaitingStart）

### WaitingStart 状态
- **Tasks**:
  - Delay Task: 时长绑定到 `Actor.PreparingDuration`，随机偏差 = 0.0，永远奔跑 = false
- **Transitions**: 完成后 → 下个状态（SetLock）

### SetLock 状态
- **Tasks**:
  - STT_AddMatchStatus: NewStatus = `Match.Status.Locked`
  - STT_SimplePrint: Content = "[ST_Core] 进入锁定"
- **Transitions**: 完成后 → 下个状态（FillAI）

### FillAI 状态
- **Tasks**:
  - STT_FillAI: 填充 AI 到目标人数
- **Transitions**: 完成后 → InProgress 阶段

## InProgress 阶段详细配置

### InProgress 状态（父状态）
- **类型**: 状态
- **选择行为**: 尝试按顺序选择子项
- **Transitions**: 完成后进入 SetInProgressPhase

### SetInProgressPhase 状态
- **Tasks**:
  - STT_SetMatchPhase: NewPhase = `Match.Phase.Main.InProgress`
  - STT_SimplePrint: Content = "[ST_Core] 进入正式游戏"
- **Transitions**: 完成后 → 下个状态（WaitingSettle）

### WaitingSettle 状态
- **Tasks**:
  - Delay Task: 时长绑定到 `Actor.InProgressDuration`，随机偏差 = 0.0，永远奔跑 = false
- **Transitions**: 完成后 → Settlement

### StartSubStateTree 状态
- **Tasks**:
  - STT_StartSubStateTree: 从 GM 获取 LevelSubStateTree，启动到 GS.SubST
- **Transitions**: 完成后 → 下个状态（WaitingSettle）

## Settlement 阶段详细配置

### Settlement 状态
- **类型**: 状态
- **选择行为**: 尝试按顺序选择子项
- **Tasks**: 无（待实现）
- **Transitions**: 完成后 → 树成功

## 自定义任务（STT）

| 任务 | 用途 | 参数 |
|------|------|------|
| STT_SetMatchPhase | 设置 GS 的 ActiveMatchPhase | NewPhase: GameplayTag |
| STT_SimplePrint | 调试打印（仅开发） | Content: String |
| STT_AddMatchStatus | 添加比赛状态标签到 GS.ActiveMatchStatus | NewStatus: GameplayTag |
| STT_FillAI | 填充 AI 玩家到目标人数 | - |
| STT_StartSubStateTree | 启动关卡子状态树 | - |

### STT_SetMatchPhase
```
Event EnterState
→ 使用通知设置 GS Core.ActiveMatchPhase = NewPhase
→ Finish Task (Succeeded = true)
```
- **输入**: NewPhase (GameplayTag)
- **作用**: 设置 GS 的 ActiveMatchPhase 变量（触发 RepNotify）

### STT_SimplePrint
```
Event EnterState
→ Print String (Content, 仅限开发)
```
- **输入**: Content (String)
- **作用**: 调试打印，仅开发模式生效
- **注意**: 无 Finish Task，立即完成

### STT_AddMatchStatus
```
Event EnterState
→ Get GS Core.ActiveMatchStatus
→ Add Gameplay Tag (NewStatus)
→ Finish Task (Succeeded = true)
```
- **输入**: NewStatus (GameplayTag)
- **作用**: 向 GS 的 ActiveMatchStatus 容器添加标签

### STT_FillAI
```
Event EnterState
→ Get Game Mode
→ Cast to GM_Core
→ Fill AIPlayers
→ Finish Task (Succeeded = true)
```
- **输入**: 无
- **作用**: 调用 GM_Core.FillAIPlayers 填充 AI 到目标人数

### STT_StartSubStateTree
```
Event EnterState
→ Get Game Mode → Cast to GM_Core → Get LevelSubStateTree
→ Is Valid?
    ├── Valid → Get GS_Core.LevelSubST (StateTreeComponent)
    │           → Set State Tree (LevelSubStateTree)
    │           → Start Logic
    │           → Finish Task (Succeeded = true)
    └── Not Valid → （跳过）
```
- **输入**: 无
- **作用**: 从 GM 获取关卡子状态树资产，设置并启动 GS 的 LevelSubST 组件

## 待实现

- [ ] Settlement 阶段逻辑

## 实现状态

- [x] 状态树已创建
- [x] Preparing 阶段已实现
- [x] InProgress 阶段已实现
- [x] StartLevelSubST 状态
- [x] STT_StartLevelSubST 任务
- [ ] Settlement 阶段
