# Design Document: Push-Dodge System

## Overview

推搡/闪避系统是关卡1（耐力之匣）和关卡5（牺牲之匣）的核心玩家交互机制。该系统基于 GAS (Gameplay Ability System) 实现，遵循项目现有的标签驱动架构。

核心设计原则：
- **GE 优先**：所有状态变化通过 Gameplay Effect 实现
- **标签驱动**：Ability 只负责添加/移除标签，组件监听标签变化
- **玩家/AI 统一**：同一套 Ability，不同触发方式（输入 vs 行为树）

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Input Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  IA_Endurance_Push ──┬──► GA_Push                               │
│  IA_Endurance_Dodge ─┼──► GA_Dodge                              │
│  BTTask_Push ────────┼──► (AI 触发)                             │
│  BTTask_Dodge ───────┘                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Ability Layer (GAS)                         │
├─────────────────────────────────────────────────────────────────┤
│  GA_Push ──────► GE_Pushing (Danger + Pushing 标签)             │
│       │                                                          │
│       ├──► 命中 + 目标无闪避 → 目标 Apply GE_Staggered          │
│       └──► 命中 + 目标闪避中 → 自己 Apply GE_Fallen             │
│                                                                  │
│  GA_Dodge ─────► GE_Dodging (Danger + Dodging + Invincible 标签)│
│                                                                  │
│  GA_Stagger ───► GE_Staggered (Staggered 标签，无 Danger)       │
│       │                                                          │
│       ├──► QTE 成功 → Remove GE_Staggered                       │
│       └──► QTE 失败/超时 → Apply GE_Fallen                      │
│                                                                  │
│  GA_Fall ──────► GE_Fallen (Danger + Fallen 标签)               │
│       └──► 动画结束 → Remove GE_Fallen                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Detection Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Comp_DetectionBox                                               │
│       │                                                          │
│       ├──► Box Collision (前方检测区域)                         │
│       └──► GetNearestTarget() → 返回最近有效目标                │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### GA_Push (Gameplay Ability)

推搡技能，按下按键触发。

| 配置项 | 值 |
|--------|-----|
| 资产标签 | `Ability.Require.Stamina`, `Ability.Action.Push` |
| 激活已拥有标签 | `Player.Action.Pushing` |
| 激活阻止标签 | `Player.State.Exhausted`, `Player.State.Staggered`, `Player.State.Fallen`, `Player.State.Paralyzed` |
| 阻止带标签的能力 | `Ability.Action.Dodge`, `Ability.Action.Sprint`, `Ability.Action.Aim`, `Ability.Action.Throw` |
| 取消带标签的能力 | `Ability.Action.Sprint` |

**执行流程**：
1. 检查体力 ≥ 15（通过 Cost GE 或 Activation Required Tags）
2. 应用 GE_StaminaCost（SetByCaller -15）
3. 应用 GE_Pushing（添加 Pushing + Danger 标签）
4. 播放推搡蒙太奇
5. 在蒙太奇命中帧：
   - 调用 Comp_DetectionBox.GetNearestTarget()
   - 如果目标存在且无 Invincible 标签 → 对目标应用 GE_Staggered
   - 如果目标存在且有 Invincible 标签 → 对自己应用 GE_Fallen
6. 蒙太奇结束 → 移除 GE_Pushing → 结束 Ability

### GA_Dodge (Gameplay Ability)

闪避技能，按下按键触发。

| 配置项 | 值 |
|--------|-----|
| 资产标签 | `Ability.Require.Stamina`, `Ability.Action.Dodge` |
| 激活已拥有标签 | `Player.Action.Dodging` |
| 激活阻止标签 | `Player.State.Exhausted`, `Player.State.Staggered`, `Player.State.Fallen`, `Player.State.Paralyzed` |
| 阻止带标签的能力 | `Ability.Action.Push`, `Ability.Action.Sprint`, `Ability.Action.Aim`, `Ability.Action.Throw` |
| 取消带标签的能力 | `Ability.Action.Sprint` |

**执行流程**：
1. 检查体力 ≥ 20
2. 应用 GE_StaminaCost（SetByCaller -20）
3. 应用 GE_Dodging（添加 Dodging + Danger + Invincible 标签）
4. 播放闪避蒙太奇
5. 蒙太奇结束 → 移除 GE_Dodging → 结束 Ability

### GA_Stagger (Gameplay Ability)

失衡状态技能，被动触发（被推搡、被香蕉皮、被死亡惊吓）。

| 配置项 | 值 |
|--------|-----|
| 资产标签 | `Ability.State.Stagger` |
| 激活已拥有标签 | `Player.State.Staggered` |
| 激活阻止标签 | `Player.State.Staggered`, `Player.State.Fallen`, `Player.State.Paralyzed`, `Player.State.Invincible` |
| 阻止带标签的能力 | 所有 `Ability.Action.*` |
| Activate on Granted | ✅ 勾选（由 GE_Staggered 赋予时自动激活）|

**执行流程**：
1. 播放失衡动画（循环）
2. 启动 10 秒计时器
3. 判断是玩家还是 AI：
   - **玩家**：显示 QTE 界面，等待输入
   - **AI**：按概率判定（如 70% 成功）
4. QTE 成功 / AI 判定成功：
   - 移除 GE_Staggered
   - 播放恢复动画
   - 结束 Ability
5. QTE 失败 / 超时 / AI 判定失败：
   - 移除 GE_Staggered
   - 应用 GE_Fallen
   - 结束 Ability

### GA_Fall (Gameplay Ability)

摔倒状态技能，被动触发。

| 配置项 | 值 |
|--------|-----|
| 资产标签 | `Ability.State.Fall` |
| 激活已拥有标签 | `Player.State.Fallen` |
| 激活阻止标签 | `Player.State.Fallen` |
| 阻止带标签的能力 | 所有 Ability |
| Activate on Granted | ✅ 勾选（由 GE_Fallen 赋予时自动激活）|

**执行流程**：
1. 播放摔倒蒙太奇（包含摔倒 + 起身，约 3 秒）
2. 蒙太奇结束 → 移除 GE_Fallen → 结束 Ability

### Comp_DetectionBox (Actor Component)

目标检测组件，挂载在 BP_Character_Game 上。

**属性**：
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| DetectionRange | float | 150.0 | 检测距离（前方） |
| DetectionWidth | float | 100.0 | 检测宽度 |
| DetectionHeight | float | 100.0 | 检测高度 |

**函数**：
| 函数 | 返回值 | 说明 |
|------|--------|------|
| GetNearestTarget() | AActor* | 返回检测范围内最近的有效目标，无则返回 nullptr |
| GetAllTargets() | TArray<AActor*> | 返回检测范围内所有有效目标 |

**实现方式**：
- 使用 Box Overlap 检测
- 过滤条件：是角色、非自己、存活状态
- 按距离排序返回最近目标

## Data Models

### Gameplay Effects

| GE | 持续时间 | 添加标签 | 赋予 Ability | 说明 |
|----|----------|----------|--------------|------|
| GE_Pushing | 蒙太奇时长 | `Player.Action.Pushing`, `Player.State.Danger` | - | 推搡状态 |
| GE_Dodging | 蒙太奇时长 | `Player.Action.Dodging`, `Player.State.Danger`, `Player.State.Invincible` | - | 闪避状态 |
| GE_Staggered | 无限 | `Player.State.Staggered` | GA_Stagger | 失衡状态（手动移除）|
| GE_Fallen | 蒙太奇时长 | `Player.State.Fallen`, `Player.State.Danger` | GA_Fall | 摔倒状态 |

### Gameplay Tags（新增）

| 标签 | 说明 |
|------|------|
| `Player.Action.Pushing` | 推搡动作中 |
| `Player.Action.Dodging` | 闪避动作中 |
| `Ability.Action.Push` | 推搡技能标识 |
| `Ability.Action.Dodge` | 闪避技能标识 |
| `Ability.State.Stagger` | 失衡技能标识 |
| `Ability.State.Fall` | 摔倒技能标识 |

**注意**：`Player.State.Staggered`, `Player.State.Fallen`, `Player.State.Invincible` 已在 GameplayTags.csv 中定义。

### Input Actions（新增）

| Input Action | 按键建议 | 说明 |
|--------------|----------|------|
| IA_Endurance_Push | 鼠标左键 / F | 推搡 |
| IA_Endurance_Dodge | 空格 / Shift | 闪避 |

### Behavior Tree Tasks（新增）

| Task | 说明 |
|------|------|
| BTTask_Push | AI 触发推搡，调用 ASC.TryActivateAbilityByClass(GA_Push) |
| BTTask_Dodge | AI 触发闪避，调用 ASC.TryActivateAbilityByClass(GA_Dodge) |



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

由于本项目是 UE5 蓝图项目，无法直接进行代码级别的属性测试。以下属性用于指导手动测试和设计验证。

### Property 1: 体力消耗一致性

*For any* 推搡或闪避操作，执行后体力应减少对应的固定值（推搡 -15，闪避 -20）。

**Validates: Requirements 1.1, 2.1**

### Property 2: 状态标签正确性

*For any* 技能激活期间：
- 推搡期间：应有 `Pushing` + `Danger` 标签
- 闪避期间：应有 `Dodging` + `Danger` + `Invincible` 标签
- 失衡期间：应有 `Staggered` 标签，**不应有** `Danger` 标签
- 摔倒期间：应有 `Fallen` + `Danger` 标签

**Validates: Requirements 1.2, 2.2, 2.3, 3.2, 4.2**

### Property 3: 推搡命中逻辑

*For any* 推搡命中有效目标：
- 若目标无 `Invincible` 标签 → 目标进入失衡状态
- 若目标有 `Invincible` 标签 → 推搡者进入摔倒状态

**Validates: Requirements 1.3, 1.4**

### Property 4: 激活条件检查

*For any* 推搡或闪避尝试：
- 体力不足时（推搡 < 15，闪避 < 20）→ 激活失败
- 处于力竭/失衡/摔倒/麻痹状态时 → 激活失败

**Validates: Requirements 1.5, 1.6, 2.4, 2.5**

### Property 5: 失衡状态转换

*For any* 失衡状态：
- QTE 成功 → 恢复正常状态（移除 Staggered 标签）
- QTE 失败或超时 → 进入摔倒状态（添加 Fallen 标签）
- AI 最终必定进入恢复或摔倒状态之一

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 6: 摔倒状态自动恢复

*For any* 摔倒状态，动画结束后应自动恢复正常状态（移除 Fallen 标签）。

**Validates: Requirements 4.3**

### Property 7: 技能互斥规则

*For any* 技能激活期间：
- 推搡期间：闪避、奔跑、瞄准、投掷应被阻止
- 闪避期间：推搡、奔跑、瞄准、投掷应被阻止
- 失衡期间：所有主动技能应被阻止
- 摔倒期间：所有技能应被阻止

**Validates: Requirements 4.4, 8.1, 8.2, 8.3, 8.4**

### Property 8: 目标检测正确性

*For any* 检测范围内的目标集合：
- 应只包含有效角色（非自己、存活状态）
- GetNearestTarget() 应返回距离最近的目标
- 范围外目标不应被检测到

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 9: AI 与玩家逻辑一致性

*For any* AI 触发的推搡或闪避，执行效果应与玩家触发完全一致（体力消耗、状态标签、命中逻辑）。

**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

| 错误场景 | 处理方式 |
|----------|----------|
| 体力不足时尝试推搡/闪避 | Ability 激活失败，可选播放提示音效 |
| 推搡无目标 | 播放推搡动画但不产生效果 |
| 失衡 QTE 超时 | 自动进入摔倒状态 |
| 网络延迟导致状态不同步 | 依赖 GAS 的网络复制机制，GE 在服务器应用后自动同步 |
| 同时被多人推搡 | 只响应第一次推搡，后续推搡被 Staggered 标签阻止 |

## Testing Strategy

### 测试方法

由于本项目是 UE5 蓝图项目，采用以下测试方式：

1. **手动测试**：在测试关卡 `L_Dev_Endurance` 中验证各属性
2. **自动化测试**（可选）：使用 UE5 的 Automation Testing 框架编写功能测试

### 测试用例清单

| 属性 | 测试步骤 | 预期结果 |
|------|----------|----------|
| Property 1 | 记录体力 → 推搡 → 检查体力 | 体力减少 15 |
| Property 1 | 记录体力 → 闪避 → 检查体力 | 体力减少 20 |
| Property 2 | 推搡期间检查标签 | 有 Pushing + Danger |
| Property 2 | 闪避期间检查标签 | 有 Dodging + Danger + Invincible |
| Property 2 | 失衡期间检查标签 | 有 Staggered，无 Danger |
| Property 2 | 摔倒期间检查标签 | 有 Fallen + Danger |
| Property 3 | 推搡命中普通目标 | 目标进入失衡 |
| Property 3 | 推搡命中闪避中目标 | 推搡者摔倒 |
| Property 4 | 体力 10 时尝试推搡 | 激活失败 |
| Property 4 | 失衡状态时尝试推搡 | 激活失败 |
| Property 5 | 失衡后完成 QTE | 恢复正常 |
| Property 5 | 失衡后等待 10 秒 | 进入摔倒 |
| Property 6 | 摔倒后等待动画结束 | 恢复正常 |
| Property 7 | 推搡期间尝试闪避 | 闪避失败 |
| Property 7 | 摔倒期间尝试任何技能 | 全部失败 |
| Property 8 | 前方有目标时推搡 | 命中最近目标 |
| Property 8 | 前方无目标时推搡 | 动画播放但无效果 |
| Property 9 | AI 执行推搡 | 效果与玩家一致 |

### 测试环境

- 测试关卡：`L_Dev_Endurance`
- 测试 GM：`GM_Dev_Endurance`
- 测试 GS：`GS_Dev_Endurance`
- 使用触发体积手动控制游戏状态
