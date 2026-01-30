# Comp_PC_Sacrifice（PlayerController 组件）

**职责**：关卡5 牺牲之匣的 PlayerController 专属逻辑

**父类**：Comp_PC_Core

**实现状态**：✅ Phase 1 已完成（蓝图已创建，继承基类逻辑）| ⚠️ Phase 5 待实现 QTE 系统

---

## 概述

Comp_PC_Sacrifice 负责关卡5的玩家控制器层面逻辑，主要包括：
- 输入映射管理
- QTE 系统（参考 Comp_PC_Endurance 实现）
- 金币数量显示
- UI 交互

**继承自基类**：
- BeginPlay（缓存 PC_Core 引用）

**关卡5专属逻辑**：
- QTE 系统（StartQTE、EndQTE、CloseQTEWidget）- 参考 [Comp_PC_Endurance.md](../../01-耐力之匣/架构/Comp_PC_Endurance.md)
- QTE RPC（Client_StartQTE、Client_CloseQTEWidget、Server_QTESuccess）- 参考 [Comp_PC_Endurance.md](../../01-耐力之匣/架构/Comp_PC_Endurance.md)
- 输入绑定（IA_Sacrifice_QTE_Stagger）
- 金币管理（CoinCount、OnRep_CoinCount、Server_UseCoin）

---

## 变量

| 变量名 | 类型 | 复制 | 说明 | 实现状态 |
|--------|------|------|------|----------|
| PC_Core | PC_Core | ❌ | 缓存的 PC 引用（继承自基类） | ⚠️ 待实现 |
| WBP_QTE_Stagger | WBP_Endurance_QTE_Stagger | ❌ | QTE Widget 实例 | ⚠️ 待实现 |
| CoinCount | 整数 | ✅ | 当前金币数量 | ⚠️ 待实现 |

---

## 函数

### 核心架构

| 函数 | 权限 | 说明 |
|------|------|------|
| BeginPlay | - | 初始化组件（继承自基类） |

### QTE 系统

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| StartQTE | Local | 创建并显示 QTE Widget | ⚠️ 待实现 |
| EndQTE | Local | QTE 成功时调用，关闭 Widget 并通知服务器 | ⚠️ 待实现 |
| CloseQTEWidget | Local | 关闭并清理 QTE Widget | ⚠️ 待实现 |
| Client_StartQTE | Client RPC | 服务器调用，客户端显示 QTE | ⚠️ 待实现 |
| Client_CloseQTEWidget | Client RPC | 服务器调用，客户端关闭 QTE | ⚠️ 待实现 |
| Server_QTESuccess | Server RPC | 客户端调用，服务器发送 QTE 成功事件 | ⚠️ 待实现 |

> [!NOTE]
> **QTE 实现参考**：完全参考 [Comp_PC_Endurance.md](../../01-耐力之匣/架构/Comp_PC_Endurance.md) 的 QTE 系统实现。

### 金币测试系统

| 函数 | 权限 | 说明 | 实现状态 |
|------|------|------|----------|
| OnRep_CoinCount | Client | RepNotify 回调，更新 UI 显示 | ⚠️ 待实现 |
| Server_UseCoin | Server | 消耗金币（投掷测试时调用） | ⚠️ 待实现 |

---

## 相关文档

- [Comp_PC_Core.md](../../00-通用逻辑/核心类/Comp_PC_Core.md) - PC 组件基类
- [Comp_PC_Endurance.md](../../01-耐力之匣/架构/Comp_PC_Endurance.md) - QTE 系统实现参考
- [总体策划.md](../总体策划.md) - 关卡5总体策划
- [金币测试系统.md](../道具/金币测试系统.md) - 金币测试机制（待创建）
- [UI/README.md](../UI/README.md) - UI 系统

