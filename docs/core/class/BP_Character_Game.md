# Character - BP_Character_Game

> 玩家和 AI 共用，关卡切换时销毁重建

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **类名** | `BP_Character_Game` |
| **父类** | `GSCModularCharacter`（GAS Companion） |
| **生命周期** | 关卡级（ServerTravel 时销毁） |
| **使用者** | 玩家（PC_Game 控制）、AI（AIC_Game 控制） |

---

## 必备组件

| 组件 | 类型 | 说明 |
|:-----|:-----|:-----|
| `GSCCoreComponent` | GAS Companion | GAS 接口，连接 PS 上的 ASC |
| `GSCAbilityInputBinding` | GAS Companion | Enhanced Input 绑定到 GA |
| `CharacterMovementComponent` | 引擎自带 | 移动处理 |
| `【动态添加】` | 关卡专属输入组件 | BeginPlay 时从 GM 获取并添加 |

---

## 关卡专属输入组件

### 动态添加逻辑（BeginPlay）

```
1. 从 GM 获取 LevelInputComponentClass
2. NewObject 创建组件
3. RegisterComponent 注册
```

### 各关卡组件

| 关卡 | 输入组件 | 绑定的操作 |
|:-----|:---------|:-----------|
| L_Endurance | `InputComp_Endurance` | 推搡、闪避、投掷、蹲行 |
| L_Logic | `InputComp_Logic` | 答题交互 |
| L_Courage | `InputComp_Courage` | 检视物品、戴/摘面具 |
| L_Insight | `InputComp_Insight` | 站队选择 |
| L_Sacrifice | `InputComp_Sacrifice` | 待定 |

### 组件职责

- BeginPlay 时添加对应 IMC（Input Mapping Context）
- 绑定 IA（Input Action）到处理函数
- 包含该关卡特有的输入逻辑

---

## GAS 配置

| 项目 | 说明 |
|:-----|:-----|
| **ASC 位置** | PlayerState（不在 Character 上） |
| **Avatar** | Character（技能效果作用对象） |
| **Owner** | PlayerState |

---

## 玩家 vs AI

| 项目 | 玩家 | AI |
|:-----|:-----|:---|
| Character | `BP_Character_Game` | `BP_Character_Game`（共用） |
| Controller | `PC_Game` | `AIC_Game` |
| 输入组件 | ✅ 添加 | ❌ 不添加（AI 用行为树） |

---

## 外观系统

| 项目 | 说明 |
|:-----|:-----|
| 编号显示 | 材质参数，从 PS 获取 PlayerNum |
| 头像显示 | 材质参数，从 PS 获取 AvatarData |
| 淘汰变灰 | 材质参数切换 |
