# Implementation Plan: Push-Dodge System

## Overview

基于 GAS 实现推搡/闪避系统，包括推搡、闪避、失衡、摔倒四个核心 Ability，以及目标检测组件和 AI 支持。

## Tasks

- [ ] 1. 实现目标检测组件
  - [ ] 1.1 创建 Comp_DetectionBox 组件
    - 添加 DetectionRange、DetectionWidth、DetectionHeight 属性
    - 实现 GetNearestTarget() 函数（Box Overlap + 过滤 + 排序）
    - 实现 GetAllTargets() 函数
    - _Requirements: 5.1, 5.2_
  - [ ] 1.2 挂载到 BP_Character_Game
    - 在 Character 上添加 Comp_DetectionBox 组件
    - _Requirements: 5.1_

- [ ] 2. 实现推搡系统
  - [ ] 2.1 添加推搡相关 Gameplay Tags（需确认）
    - `Player.Action.Pushing`, `Ability.Action.Push`
    - _Requirements: 1.2_
  - [ ] 2.2 创建 GE_Pushing
    - 持续时间：Has Duration（由蒙太奇控制）
    - 添加标签：`Player.Action.Pushing`, `Player.State.Danger`
    - _Requirements: 1.2_
  - [ ] 2.3 创建 GA_Push
    - 配置资产标签：`Ability.Require.Stamina`, `Ability.Action.Push`
    - 配置激活阻止标签：`Player.State.Exhausted`, `Player.State.Staggered`, `Player.State.Fallen`, `Player.State.Paralyzed`
    - 配置阻止/取消带标签的能力
    - _Requirements: 1.5, 1.6, 8.1_
  - [ ] 2.4 实现 GA_Push 执行逻辑
    - 应用 GE_StaminaCost（SetByCaller -15）
    - 应用 GE_Pushing
    - 播放推搡蒙太奇
    - 在命中帧调用 Comp_DetectionBox.GetNearestTarget()
    - 根据目标状态应用 GE_Staggered 或 GE_Fallen
    - _Requirements: 1.1, 1.3, 1.4, 5.3_
  - [ ] 2.5 创建 IA_Endurance_Push 并添加到 IMC_Endurance
    - 配置输入绑定
    - _Requirements: 6.1_
  - [ ] 2.6 将 GA_Push 添加到 AbilitySet_Endurance
    - 配置输入绑定到 IA_Endurance_Push
    - _Requirements: 6.3_

- [ ] 3. 实现闪避系统
  - [ ] 3.1 添加闪避相关 Gameplay Tags（需确认）
    - `Player.Action.Dodging`, `Ability.Action.Dodge`
    - _Requirements: 2.2_
  - [ ] 3.2 创建 GE_Dodging
    - 持续时间：Has Duration（由蒙太奇控制）
    - 添加标签：`Player.Action.Dodging`, `Player.State.Danger`, `Player.State.Invincible`
    - _Requirements: 2.2, 2.3_
  - [ ] 3.3 创建 GA_Dodge
    - 配置资产标签：`Ability.Require.Stamina`, `Ability.Action.Dodge`
    - 配置激活阻止标签：`Player.State.Exhausted`, `Player.State.Staggered`, `Player.State.Fallen`, `Player.State.Paralyzed`
    - 配置阻止/取消带标签的能力
    - _Requirements: 2.4, 2.5, 8.2_
  - [ ] 3.4 实现 GA_Dodge 执行逻辑
    - 应用 GE_StaminaCost（SetByCaller -20）
    - 应用 GE_Dodging
    - 播放闪避蒙太奇
    - 蒙太奇结束移除 GE_Dodging
    - _Requirements: 2.1_
  - [ ] 3.5 创建 IA_Endurance_Dodge 并添加到 IMC_Endurance
    - 配置输入绑定
    - _Requirements: 6.2_
  - [ ] 3.6 将 GA_Dodge 添加到 AbilitySet_Endurance
    - 配置输入绑定到 IA_Endurance_Dodge
    - _Requirements: 6.3_

- [ ] 4. 实现失衡状态
  - [ ] 4.1 添加失衡相关 Gameplay Tags（需确认）
    - `Ability.State.Stagger`
    - _Requirements: 3.2_
  - [ ] 4.2 创建 GE_Staggered
    - 持续时间：无限（手动移除）
    - 添加标签：`Player.State.Staggered`（**不添加 Danger**）
    - Grant Abilities While Active：GA_Stagger
    - _Requirements: 3.2_
  - [ ] 4.3 创建 GA_Stagger
    - 配置 Activate on Granted
    - 配置阻止所有 `Ability.Action.*` 技能
    - _Requirements: 8.3_
  - [ ] 4.4 实现 GA_Stagger 执行逻辑（玩家）
    - 播放失衡循环动画
    - 显示 QTE 界面
    - 启动 10 秒计时器
    - QTE 成功：移除 GE_Staggered，播放恢复动画
    - QTE 失败/超时：移除 GE_Staggered，应用 GE_Fallen
    - _Requirements: 3.1, 3.3, 3.4_
  - [ ] 4.5 实现 GA_Stagger 执行逻辑（AI）
    - 按概率判定（如 70% 成功）
    - 成功：移除 GE_Staggered
    - 失败：应用 GE_Fallen
    - _Requirements: 3.5_

- [ ] 5. 实现摔倒状态
  - [ ] 5.1 添加摔倒相关 Gameplay Tags（需确认）
    - `Ability.State.Fall`
    - _Requirements: 4.2_
  - [ ] 5.2 创建 GE_Fallen
    - 持续时间：Has Duration（由蒙太奇控制）
    - 添加标签：`Player.State.Fallen`, `Player.State.Danger`
    - Grant Abilities While Active：GA_Fall
    - _Requirements: 4.2_
  - [ ] 5.3 创建 GA_Fall
    - 配置 Activate on Granted
    - 配置阻止所有技能
    - _Requirements: 4.4, 8.4_
  - [ ] 5.4 实现 GA_Fall 执行逻辑
    - 播放摔倒蒙太奇（包含摔倒 + 起身）
    - 蒙太奇结束移除 GE_Fallen
    - _Requirements: 4.1, 4.3_

- [ ] 6. Checkpoint - 基础功能测试
  - 在 L_Dev_Endurance 中测试推搡、闪避、失衡、摔倒的基本流程
  - 验证体力消耗、状态标签、动画播放
  - 确保所有测试通过，如有问题请提出

- [ ] 7. 实现 AI 支持
  - [ ] 7.1 创建 BTTask_Push
    - 调用 ASC.TryActivateAbilityByClass(GA_Push)
    - _Requirements: 7.1_
  - [ ] 7.2 创建 BTTask_Dodge
    - 调用 ASC.TryActivateAbilityByClass(GA_Dodge)
    - _Requirements: 7.2_
  - [ ] 7.3 在 BT_Endurance 中添加推搡/闪避决策逻辑
    - 根据距离、体力、目标状态决定是否推搡/闪避
    - _Requirements: 7.3_

- [ ] 8. 更新文档
  - [ ] 8.1 更新 关卡设计/01-耐力之匣/总体策划.md
    - 添加推搡/闪避系统的实现状态
    - _Requirements: 全部_
  - [ ] 8.2 创建 关卡设计/01-耐力之匣/GAS/推搡闪避系统.md
    - 详细记录 GA/GE 配置和执行流程
    - _Requirements: 全部_
  - [ ] 8.3 更新 待办文档/2026-01-03.md
    - 标记已完成任务
    - _Requirements: 全部_

- [ ] 9. Final Checkpoint - 完整功能验证
  - 验证所有 9 个正确性属性
  - 测试玩家和 AI 的推搡/闪避交互
  - 确保所有测试通过，如有问题请提出

## Notes

- Gameplay Tags 采用增量更新策略，在各任务中按需添加并确认
- 蒙太奇资源需要用户在 UE5 中创建或指定
- QTE 界面需要单独的 UI 实现（可作为后续任务）
- 任务按依赖顺序排列，建议按顺序执行
