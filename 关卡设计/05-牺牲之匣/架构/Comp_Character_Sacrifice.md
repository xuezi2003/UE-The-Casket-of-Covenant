# Comp_Character_Sacrifice（Character 组件）

**职责**：关卡5 牺牲之匣的 Character 专属逻辑

**父类**：Comp_Character_Core

**实现状态**：✅ Phase 1 已完成（蓝图已创建，继承基类逻辑）| ⚠️ Phase 3+ 待实现关卡专属逻辑

---

## 概述

Comp_Character_Sacrifice 负责关卡5的角色层面逻辑，包括：
- 玩家开始/完成处理（继承自基类）
- 玻璃站立检测
- 拥挤机制处理
- Kill Volume 死亡触发
- 推搡限制
- 金币测试系统

**继承自基类**：
- BeginPlay（缓存 BP_Character、启动 InitComp）
- InitComp（等待 ASC 初始化、绑定事件）
- HandlePlayerStart（碰撞切换、GE_Start、GiveAbilitySet）
- HandlePlayerFinish（GE_Finish、碰撞切换、ClearAbilitySet）
- GiveAbilitySet / ClearAbilitySet

**关卡5专属逻辑**：
- 玻璃站立检测（OnGlassPanelEnter、OnGlassPanelExit）
- Kill Volume 死亡触发（OnKillVolumeHit）
- 推搡限制（CheckCanPushTarget）
- 金币测试系统（ThrowCoin）

---

## 变量

| 变量名 | 类型 | 复制 | 说明 | 实现状态 |
|--------|------|------|------|----------|
| BP_Character | BP_Character_Game | ❌ | 缓存的角色引用（继承自基类） | ⚠️ 待实现 |
| ASC | AbilitySystemComponent | ❌ | 缓存的 ASC 引用（继承自基类） | ⚠️ 待实现 |
| GSCCore | GSCCoreComponent | ❌ | 缓存的 GSCCore 引用（继承自基类） | ⚠️ 待实现 |
| CurrentGlassPanel | BP_GlassPanel* | ❌ | 当前站立的玻璃板 | ⚠️ 待实现 |
| CanPushTarget | 布尔 | ❌ | 是否可以推搡目标（同一块玻璃检测） | ⚠️ 待实现 |

---

## 函数

### 核心架构（继承自基类）

| 函数 | 权限 | 说明 |
|------|------|------|
| BeginPlay | - | 缓存 BP_Character、启动 InitComp（继承自基类） |
| InitComp | - | 等待 ASC 初始化、绑定事件（继承自基类） |
| HandlePlayerStart | All | 碰撞切换、应用 GE_Start、赋予 AbilitySet（继承自基类） |
| HandlePlayerFinish | All | 应用 GE_Finish、碰撞切换、清理 AbilitySet（继承自基类） |
| GiveAbilitySet | All | 赋予关卡技能集（继承自基类） |
| ClearAbilitySet | All | 清理关卡技能集（继承自基类） |

### 玻璃站立检测

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| OnGlassPanelEnter | Server | 玩家进入玻璃板时调用，更新 CurrentGlassPanel | ⚠️ 待实现 |
| OnGlassPanelExit | Server | 玩家离开玻璃板时调用，清空 CurrentGlassPanel | ⚠️ 待实现 |

### Kill Volume 死亡触发

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| OnKillVolumeHit | Server | 碰到 Kill Volume 时触发，发送 `Gameplay.Event.Player.Eliminated` | ⚠️ 待实现 |

### 推搡限制

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| CheckCanPushTarget | Server | 检查目标是否在同一块玻璃上，返回是否可推搡 | ⚠️ 待实现 |

### 金币测试系统

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| ThrowCoin | Server | 投掷金币测试玻璃 | ⚠️ 待实现 |

---

## 事件绑定

在 InitComp 时绑定以下事件监听（继承自基类）：
- `Gameplay.Event.Player.Started` → HandlePlayerStart
- `Gameplay.Event.Player.Finished` → HandlePlayerFinish

---

## 相关文档

- [Comp_Character_Core.md](../../00-通用逻辑/核心类/Comp_Character_Core.md) - Character 组件基类
- [总体策划.md](../总体策划.md) - 关卡5总体策划
- [BP_GlassPanel.md](../场景/玻璃桥组件/BP_GlassPanel.md) - 玻璃板
- [推搡系统.md](../GAS/推搡系统.md) - 推搡限制机制（待创建）
- [金币测试系统.md](../道具/金币测试系统.md) - 金币测试机制（待创建）

