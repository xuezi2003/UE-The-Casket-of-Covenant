# Comp_PC_Endurance

**父类**：Comp_PC_Core

**职责**：关卡1 PlayerController 组件，QTE 显示管理（客户端逻辑）

**挂载于**：PC_Core（在 OnPossess 时根据 LevelPCComponentClass 动态添加）

**实现状态**：✅ 已完成（Phase 0.5 重构完成）

> [!NOTE]
> **继承关系**：继承自 [Comp_PC_Core](../../00-通用逻辑/核心类/Comp_PC_Core.md)，复用 PC_Core 引用缓存逻辑。子类只需实现关卡1专属的 QTE 系统、RPC 通信、输入绑定。

> [!NOTE]
> **命名规范**：`Comp_Character_xxx` 挂载在 Character 上处理服务端逻辑，`Comp_PC_xxx` 挂载在 PlayerController 上处理客户端逻辑（如 QTE UI）。

### 组件复制配置（Class Defaults）

| 属性 | 值 | 说明 |
|------|:---:|------|
| **Component Replicates** | ❌ | 组件不需要复制，只处理客户端本地逻辑 |

> [!NOTE]
> **客户端本地组件**：Comp_PC_Core 及其子类主要管理客户端本地的 UI 和输入，不需要同步到服务器。服务器通过 RPC 与客户端通信。

## 变量

### 继承自基类（Comp_PC_Core）

| 变量名 | 类型 | 用途 |
|--------|------|------|
| PC_Core | PC_Core | 缓存的 PC 引用 |

### 关卡1专属变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| WBP_QTE_Stagger | WBP_Endurance_QTE_Stagger | QTE Widget 实例 |

## 关键逻辑

### 继承自基类的函数

以下函数已在 [Comp_PC_Core](../../00-通用逻辑/核心类/Comp_PC_Core.md) 中实现，子类通过 Override 扩展。

| 函数名 | 说明 |
|--------|------|
| **Event BeginPlay** | 缓存 PC_Core 引用（子类通过 Override 调用 Parent: ReceiveBeginPlay） |

> [!NOTE]
> **子类扩展方式**：Comp_PC_Endurance 的 BeginPlay 调用 Parent: ReceiveBeginPlay，确保基类逻辑正确执行。子类无需添加额外的初始化逻辑。

### QTE 系统概述

QTE（Quick Time Event）系统用于失衡恢复机制：
- 玩家被推搡 → 进入失衡状态 → 显示QTE Widget
- 玩家按下Q键 → QTE成功 → 恢复正常
- 超时未按 → QTE失败 → 摔倒

#### 正常流程

```
1. 玩家被推搡 → GA_Stagger 激活
    ↓
2. 服务器调用 Comp_PC_Endurance.Client_StartQTE
    ↓
3. 客户端显示 QTE Widget
    ↓
4. 玩家按下 Q 键 → WBP_QTE_Stagger.OnQTEInput()
    ↓
5. 客户端调用 Comp_PC_Endurance.EndQTE
    ↓
6. 客户端调用 Comp_PC_Endurance.Server_QTESuccess
    ↓
7. 服务器发送 Gameplay.Event.QTE.Result
    ↓
8. GA_Stagger 监听事件，执行恢复逻辑
```

#### 超时流程

```
1. 玩家被推搡 → GA_Stagger 激活
    ↓
2. 服务器调用 Comp_PC_Endurance.Client_StartQTE
    ↓
3. 客户端显示 QTE Widget
    ↓
4. 超时（玩家未按 Q 键）
    ↓
5. 服务器调用 Comp_PC_Endurance.Client_CloseQTEWidget
    ↓
6. 客户端关闭 QTE Widget
    ↓
7. GA_Stagger 执行失败逻辑（摔倒）
```

---

### Event BeginPlay（Override）

```
Event BeginPlay (Override)
    ↓
Parent: ReceiveBeginPlay ← 调用基类逻辑（缓存 PC_Core 引用）
```

**说明**：
- 调用基类的 BeginPlay，确保 PC_Core 引用正确缓存
- 子类无需添加额外的初始化逻辑

---

### QTE 函数

#### StartQTE

```
StartQTE()
    ↓
Create Widget (WBP_Endurance_QTE_Stagger, Owning Player = PC_Core)
    ↓
SET WBP_QTE_Stagger
    ↓
Add to Viewport
```

#### CloseQTEWidget

关闭 Widget 的通用函数（被 EndQTE 和 Client_CloseQTEWidget 复用）。

```
CloseQTEWidget()
    ↓
Is Valid (WBP_QTE_Stagger)
    ↓ Is Valid
WBP_QTE_Stagger → Remove from Parent
    ↓
SET WBP_QTE_Stagger = None
```

#### EndQTE

**调用者**：`WBP_Endurance_QTE_Stagger.OnQTEInput`（QTE 成功时）

```
EndQTE()
    ↓
CloseQTEWidget()
    ↓
Server_QTESuccess()
```

---

### QTE RPC

#### Client_StartQTE（客户端 RPC）

**调用者**：`GA_Stagger` 玩家分支（服务器调用，客户端执行）

```
Client_StartQTE (Executes on Owning Client, Reliable)
    ↓
StartQTE()
```

#### Client_CloseQTEWidget（客户端 RPC）

**调用者**：`GA_Stagger` 超时分支（服务器调用，客户端执行）

```
Client_CloseQTEWidget (Executes on Owning Client, Reliable)
    ↓
CloseQTEWidget()
```

#### Server_QTESuccess（服务器 RPC）

**调用者**：`EndQTE`（客户端调用，服务器执行）

```
Server_QTESuccess (Executes on Server, Reliable)
    ↓
Get Controlled Pawn (PC_Core)
    ↓
Send Gameplay Event to Actor
├── Target: Controlled Pawn
├── Event Tag: Gameplay.Event.QTE.Result
└── Payload: GameplayEventData
```

---

### 输入绑定

```
EnhancedInputAction IA_Endurance_QTE_Stagger
    ↓
Started → Is Valid (WBP_QTE_Stagger)
    ↓
Is Valid → WBP_QTE_Stagger.OnQTEInput()
```

---

## 相关文档

- [Comp_PC_Core.md](../../00-通用逻辑/核心类/Comp_PC_Core.md) - PC 组件基类
- [推搡系统.md](../GAS/推搡系统.md)（GA_Stagger QTE 逻辑）
- [UI 架构概述](../../00-通用逻辑/UI/架构概述.md)
