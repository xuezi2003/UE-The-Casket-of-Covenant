# PS_FiveBox（PlayerState）

**职责**：玩家身份数据的运行时载体

**父类**：GSCModular Player State

## 变量

| 变量名 | 类型 | 复制 | 用途 |
|--------|------|------|------|
| PlayerNum | 整数 | ✅ | 玩家唯一编号 |
| AvatarData | S_AvatarData | ✅ | 外观数据 |
| CurrentAbilitySetHandle | GSCAbility Set Handle | - | 当前技能集句柄 |

## 事件分发器

| 名称 | 触发时机 |
|------|----------|
| OnPlayerAvatarChange | Avatar 变化时广播 |
| OnPlayerNumChange | PlayerNum 变化时广播 |

## OnRep 函数

| 函数 | 处理 |
|------|------|
| OnRep_AvatarData | 广播 OnPlayerAvatarChange |
| OnRep_PlayerNum | 广播 OnPlayerNumChange |
