# Comp_PC_Core（PlayerController 组件基类）

**职责**：所有关卡通用的 PlayerController 层面逻辑（最小基类）

**父类**：ActorComponent

**挂载于**：PC_Core（在 OnPossess 时根据 LevelPCComponentClass 动态添加）

**实现状态**：✅ 已完成（Phase 0.5）

> [!NOTE]
> **设计意图**：提供所有关卡PC组件的最小共性逻辑，为未来扩展预留空间。关卡特化组件（如 Comp_PC_Endurance、Comp_PC_Sacrifice）继承此基类，实现关卡专属逻辑。

---

## 概述

Comp_PC_Core 是所有关卡 PC 组件的最小基类，负责：
- PC_Core 引用缓存（所有子类都需要访问 PC_Core）
- 为未来共性逻辑预留扩展空间

**子类职责**：
- 关卡专属的 UI 管理（如金币数量显示、QTE Widget）
- 关卡专属的输入绑定（如 IA_XXX_QTE_Stagger）
- 关卡专属的客户端逻辑（如 QTE 管理、观察系统）

---

## 组件复制配置（Class Defaults）

| 属性 | 值 | 说明 |
|------|:---:|------|
| **Component Replicates** | ❌ | 组件不需要复制，只处理客户端本地逻辑 |

> [!NOTE]
> **客户端本地组件**：Comp_PC_Core 及其子类主要管理客户端本地的 UI 和输入，不需要同步到服务器。服务器通过 RPC 与客户端通信。

---

## 变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `PC_Core` | PC_Core | 缓存的 PC 引用 |

---

## Event BeginPlay

```
Event Begin Play
    ↓
Get Owner → Cast to PC_Core → SET PC_Core
```

**说明**：
- 缓存 PC_Core 引用，供子类使用
- 子类可以在 BeginPlay 中添加额外的初始化逻辑

---

## 子类实现指南

### 继承关系

```
Comp_PC_Core（最小基类）
    ├─ Comp_PC_Endurance（关卡1）
    ├─ Comp_PC_Sacrifice（关卡5）
    ├─ Comp_PC_Logic（关卡2）
    ├─ Comp_PC_Courage（关卡3）
    └─ Comp_PC_Insight（关卡4）
```

### 子类职责

1. **关卡专属变量**：根据关卡玩法需求定义（如 QTE Widget 引用、金币数量等）

2. **关卡专属函数**：实现关卡特有的逻辑（如 QTE 管理、RPC 通信、UI 更新等）

3. **输入绑定**（必须）：在 InputGraph 中绑定关卡专属的 InputAction

4. **扩展 BeginPlay**（可选）：
   - Override BeginPlay，调用 `Parent: ReceiveBeginPlay` 执行基类逻辑
   - 添加子类的初始化逻辑（如果需要）

---

## 相关文档

- [PC_Core.md](PC_Core.md) - PlayerController 基类
- [GM_Core.md](GM_Core.md) - OnPossess 中添加 LevelPCComponent
- [系统架构.md](../系统架构.md) - Core 层架构说明
- [推搡系统.md](../../01-耐力之匣/GAS/推搡系统.md) - GA_Stagger QTE 逻辑
- [Comp_PC_Endurance.md](../../01-耐力之匣/架构/Comp_PC_Endurance.md) - 关卡1 子类实现参考（包含完整QTE文档）
- [Comp_PC_Sacrifice.md](../../05-牺牲之匣/架构/Comp_PC_Sacrifice.md) - 关卡5 子类实现参考
