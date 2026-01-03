# Requirements Document

## Introduction

推搡/闪避系统是《契约之匣》关卡1（耐力之匣）和关卡5（牺牲之匣）的核心玩家交互机制。该系统允许玩家通过推搡干扰其他玩家，或通过闪避躲避推搡攻击。推搡成功会使目标进入失衡状态，失衡后需要通过 QTE 恢复，否则会摔倒。

## Glossary

- **Push_System**: 推搡系统，玩家对前方目标发起推搡攻击的 GAS Ability
- **Dodge_System**: 闪避系统，玩家快速闪避以躲避推搡的 GAS Ability
- **Stagger_State**: 失衡状态，被推搡后进入的特殊状态，不算危险状态，可通过 QTE 恢复
- **Fall_State**: 摔倒状态，失衡 QTE 失败或推搡被闪避后进入的状态，算危险状态
- **QTE**: Quick Time Event，快速反应事件，玩家需要在限定时间内完成特定输入
- **DetectionBox**: 检测盒组件，用于检测前方可交互对象（推搡目标）
- **Danger_Tag**: 危险标签 `Player.State.Danger`，红灯时被木偶检测到会死亡
- **Stamina**: 体力属性，推搡消耗 15，闪避消耗 20

## Requirements

### Requirement 1: 推搡攻击

**User Story:** As a 玩家, I want to 推搡前方的其他玩家, so that 我可以干扰他们并使其进入失衡状态。

#### Acceptance Criteria

1. WHEN 玩家按下推搡键且体力 ≥ 15 THEN THE Push_System SHALL 消耗 15 体力并播放推搡动画
2. WHEN 推搡动画播放期间 THEN THE Push_System SHALL 添加 `Player.State.Danger` 标签
3. WHEN 推搡命中前方目标且目标未处于闪避状态 THEN THE Push_System SHALL 使目标进入 Stagger_State
4. WHEN 推搡命中前方目标且目标处于闪避状态 THEN THE Push_System SHALL 使推搡者进入 Fall_State
5. WHEN 玩家体力 < 15 或处于力竭状态 THEN THE Push_System SHALL 阻止推搡激活
6. WHEN 玩家处于失衡/摔倒/麻痹状态 THEN THE Push_System SHALL 阻止推搡激活

### Requirement 2: 闪避动作

**User Story:** As a 玩家, I want to 快速闪避, so that 我可以躲避其他玩家的推搡攻击。

#### Acceptance Criteria

1. WHEN 玩家按下闪避键且体力 ≥ 20 THEN THE Dodge_System SHALL 消耗 20 体力并播放闪避动画
2. WHEN 闪避动画播放期间 THEN THE Dodge_System SHALL 添加 `Player.State.Danger` 标签
3. WHILE 闪避动画播放期间 THEN THE Dodge_System SHALL 添加 `Player.State.Invincible` 标签（无敌帧）
4. WHEN 玩家体力 < 20 或处于力竭状态 THEN THE Dodge_System SHALL 阻止闪避激活
5. WHEN 玩家处于失衡/摔倒/麻痹状态 THEN THE Dodge_System SHALL 阻止闪避激活

### Requirement 3: 失衡状态

**User Story:** As a 玩家, I want to 在失衡时通过 QTE 恢复, so that 我可以避免摔倒并继续游戏。

#### Acceptance Criteria

1. WHEN 玩家进入 Stagger_State THEN THE Stagger_State SHALL 播放失衡动画并显示 QTE 界面
2. WHILE 玩家处于 Stagger_State THEN THE Stagger_State SHALL 不添加 `Player.State.Danger` 标签（安全状态）
3. WHEN 玩家在 10 秒内完成 QTE THEN THE Stagger_State SHALL 结束失衡并恢复正常状态
4. WHEN 玩家在 10 秒内未完成 QTE THEN THE Stagger_State SHALL 使玩家进入 Fall_State
5. WHEN AI 进入 Stagger_State THEN THE Stagger_State SHALL 按概率判定是否恢复（无 QTE 界面）

### Requirement 4: 摔倒状态

**User Story:** As a 玩家, I want to 在摔倒后自动起身, so that 我可以继续游戏。

#### Acceptance Criteria

1. WHEN 玩家进入 Fall_State THEN THE Fall_State SHALL 播放摔倒动画（约 3 秒）
2. WHILE 玩家处于 Fall_State THEN THE Fall_State SHALL 添加 `Player.State.Danger` 标签（危险状态）
3. WHEN 摔倒动画播放完毕 THEN THE Fall_State SHALL 自动结束并恢复正常状态
4. WHILE 玩家处于 Fall_State THEN THE Fall_State SHALL 阻止所有其他技能激活

### Requirement 5: 目标检测

**User Story:** As a 玩家, I want to 检测前方可推搡的目标, so that 推搡可以正确命中。

#### Acceptance Criteria

1. THE DetectionBox SHALL 检测玩家前方一定范围内的其他角色
2. WHEN 推搡技能激活时 THEN THE DetectionBox SHALL 返回最近的有效目标
3. WHEN 检测范围内无有效目标 THEN THE Push_System SHALL 播放推搡动画但不产生效果

### Requirement 6: 输入绑定

**User Story:** As a 玩家, I want to 通过按键触发推搡和闪避, so that 我可以方便地操作。

#### Acceptance Criteria

1. THE Push_System SHALL 绑定到 IA_Endurance_Push 输入动作
2. THE Dodge_System SHALL 绑定到 IA_Endurance_Dodge 输入动作
3. WHEN 输入动作触发时 THEN THE Push_System 或 Dodge_System SHALL 通过 GAS 激活对应 Ability

### Requirement 7: AI 支持

**User Story:** As a AI, I want to 能够执行推搡和闪避, so that AI 行为与真人玩家一致。

#### Acceptance Criteria

1. THE Push_System SHALL 支持通过 BTTask_Push 由行为树触发
2. THE Dodge_System SHALL 支持通过 BTTask_Dodge 由行为树触发
3. WHEN AI 触发推搡或闪避 THEN THE Push_System 或 Dodge_System SHALL 执行与玩家相同的逻辑

### Requirement 8: 动作互斥

**User Story:** As a 系统, I want to 确保技能之间正确互斥, so that 不会出现状态冲突。

#### Acceptance Criteria

1. WHILE 玩家处于推搡动画期间 THEN THE Push_System SHALL 阻止闪避、奔跑、瞄准、投掷激活
2. WHILE 玩家处于闪避动画期间 THEN THE Dodge_System SHALL 阻止推搡、奔跑、瞄准、投掷激活
3. WHILE 玩家处于失衡状态 THEN THE Stagger_State SHALL 阻止推搡、闪避、奔跑、跳跃、瞄准、投掷激活
4. WHILE 玩家处于摔倒状态 THEN THE Fall_State SHALL 阻止所有技能激活
