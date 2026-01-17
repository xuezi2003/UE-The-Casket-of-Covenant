# Comp_PC_Endurance

> 关卡1（耐力之匣）专属 PlayerController 组件

## 一、概述

管理 QTE 显示、关卡特殊输入，挂载在 PC_Core 上。

**添加时机**：由 `GM_Endurance.LevelPCComponentClass` 配置，`PC_Core.OnPossess` 时动态添加（服务器复制）。

---

## 二、变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `PC_Core` | PC_Core | 缓存的 PC 引用 |
| `WBP_QTE_Stagger` | WBP_Endurance_QTE_Stagger | QTE Widget 实例 |

---

## 三、Event BeginPlay

```
Event Begin Play
    ↓
Get Owner → Cast to PC_Core → SET PC_Core
```

---

## 四、函数

### StartQTE

```
StartQTE()
    ↓
Create Widget (WBP_Endurance_QTE_Stagger, Owning Player = PC_Core)
    ↓
SET WBP_QTE_Stagger
    ↓
Add to Viewport
```

### CloseQTEWidget

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

### EndQTE

**调用者**：`WBP_Endurance_QTE_Stagger.OnQTEInput`（QTE 成功时）

```
EndQTE()
    ↓
CloseQTEWidget()
    ↓
Server_QTESuccess()
```

---

## 五、RPC

### Client_StartQTE（客户端 RPC）

**调用者**：`GA_Stagger` 玩家分支（服务器调用，客户端执行）

```
Client_StartQTE (Executes on Owning Client, Reliable)
    ↓
StartQTE()
```

### Client_CloseQTEWidget（客户端 RPC）

**调用者**：`GA_Stagger` 超时分支（服务器调用，客户端执行）

```
Client_CloseQTEWidget (Executes on Owning Client, Reliable)
    ↓
CloseQTEWidget()
```

### Server_QTESuccess（服务器 RPC）

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

## 六、输入绑定（InputGraph）

```
EnhancedInputAction IA_Endurance_QTE_Stagger
    ↓
Triggered → Is Valid (WBP_QTE_Stagger)
    ↓
Is Valid → WBP_QTE_Stagger.OnQTEInput()
```

---

## 相关文档

- [推搡系统.md](../GAS/推搡系统.md)（GA_Stagger QTE 逻辑）
- [UI 架构概述](../../00-通用逻辑/UI/架构概述.md)
