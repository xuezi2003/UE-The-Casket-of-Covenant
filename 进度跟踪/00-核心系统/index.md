# 核心系统进度

> 最后更新：2024-12-26 18:21

---

## 核心类蓝图

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| GI_FiveBox | ✅ | 2024-12-25 00:05 | ← AdvancedFriendsGameInstance |
| GM_Core | ✅ | 2024-12-25 00:20 | 全局设置已绑定 |
| GS_Core | ✅ | 2024-12-25 00:20 | 已绑定到 GM_Core |
| PS_FiveBox | ✅ | 2024-12-25 00:20 | 已绑定到 GM_Core |
| PC_Core | ✅ | 2024-12-25 00:20 | 已绑定到 GM_Core |
| BP_Character_Game | ✅ | 2024-12-25 00:24 | 父类已修正为 PlayerStateCharacter |
| AIC_Game | ✅ | 2024-12-25 00:20 | 标准 AIController |

---

## GAS 系统

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| BAS_Core (AttributeSet) | ✅ | 2024-12-25 | Health(0~100) / Coin(0~∞) |
| DT_BAS_Core (DataTable) | ✅ | 2024-12-25 | Clamping 已配置 |
| ASC 配置 | ✅ | 2024-12-25 | PS Default Starting Data 已绑定 |

---

## 关卡流程状态树 (State Tree)

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| ST_LevelFlow 创建 | ✅ | 2024-12-26 | StateTreeComponentSchema |
| 状态设计 (States) | ✅ | 2024-12-26 | Preparing/InProgress/Settlement |
| E_LevelPhase 枚举 | ✅ | 2024-12-26 | 0_/Core/Data/ |
| GameplayTags CSV | ✅ | 2024-12-26 | 0_/Core/Config/, 清理未使用标签 |
| GS 架构 (RepNotify+Handle) | ✅ | 2024-12-26 | Server_SetPhase / HandlePhaseChange |
| GS StateTreeComponent | ✅ | 2024-12-26 | BeginPlay 手动启动(Has Authority) |
| STT_SetPhase 自定义Task | ✅ | 2024-12-26 | State Tree 调用 GS.Server_SetPhase |
| STT_SimplePrint 调试Task | ✅ | 2024-12-26 | 用于打印状态转换日志 |
| Preparing → InProgress | ✅ | 2024-12-26 | Delay Task 完成后自动转换 |
| InProgress → Settlement | ⬜ | - | **延后**: 由 GM 根据游戏结束条件触发 |

---

## 编号与记录系统

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| F_AvatarData 结构体 | ✅ | 2024-12-26 | 0_/Core/Data/ |
| F_PlayerRecord 结构体 | ✅ | 2024-12-26 | 0_/Core/Data/ |
| PS 编号变量 | ✅ | 2024-12-26 | PlayerNum (RepNotify) + AvatarData |
| GS 记录数组 | ✅ | 2024-12-26 | PlayerRecords (Replicated) |
| GM 编号分配 | ✅ | 2024-12-26 | HandleStartingNewPlayer |
| 视觉同步 (OnRep) | ⬜ | - | **延后**: 依赖角色网格体/材质完成 |

---

## 测试环境 (Stage 0.5)

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| L_Dev_Core 测试关卡 | ✅ | 2024-12-26 | 0_/Dev/Maps/ |
| PIE 多人配置 | ✅ | 2024-12-26 | 1 Server + 1 Client, Run As Client |
| State Tree 验证 | ✅ | 2024-12-26 | Preparing→InProgress 转换成功 |
| GM 编号分配验证 | ✅ | 2024-12-26 | PlayerNum=0 分配成功 |

---

## 输入系统

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| IMC_Default | ⬜ | - | 默认输入映射 |
| IA 基础输入 | ⬜ | - | Move/Look/Jump |

---

## Stage 0.6: 角色视觉整合

| 功能 | 状态 | 完成时间 | 备注 |
|:-----|:----:|:---------|:-----|
| SKM_Character 骨骼网格 | ✅ | 2024-12-26 | 带动画蓝图 ABP_Character |
| SM_Monitor 显示器组件 | ✅ | 2024-12-26 | 附加到头部骨骼 |
| MF_AvatarComposite | ✅ | 2024-12-26 | 四层头像合成 (Cloth→Face→Eye→Hair) |
| MF_MonitorBaseColor | ✅ | 2024-12-26 | UV变换 + BoxMask裁剪 |
| M_Monitor / MI_Monitor | ✅ | 2024-12-26 | 显示器材质 (参数化) |
| 数字贴图生成 | ✅ | 2024-12-26 | T_Num_1/10/100_0~9 (共30张) |
| MF_NumberComposite | ✅ | 2024-12-26 | 三层数字合成 (百+十+个位) |
| M_Clothes / MI_Cloth | ✅ | 2024-12-26 | 衣服材质 (编号显示) |
| InitPlayerVisual | ✅ | 2024-12-26 | DataTable + Load Asset Blocking |
| Event Dispatcher 同步 | ✅ | 2024-12-26 | OnPlayerNumChange / OnPlayerAvatarChange |
| InitPS 模式 | ✅ | 2024-12-26 | 绑定 + 手动初始化 |
| PIE 多人测试 | ✅ | 2024-12-26 | 编号/头像正常显示 |
