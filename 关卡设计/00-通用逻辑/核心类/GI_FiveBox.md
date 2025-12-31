# GI_FiveBox（GameInstance）

**职责**：唯一编号工厂 + 跨关卡数据持久化

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| PlayerNumPool | 整数数组 | 1-999 的可用编号池 |
| PlayerRecords | S_PlayerRecord[] | 所有参赛者档案（跨关卡持久化） |

## 函数

| 函数名 | 说明 |
|--------|------|
| Event Init | 初始化时填充 1-999 到编号池 |
| GetUniquePlayerNum | 随机取出一个编号并从池中移除 |
| AddPlayerRecord | 添加玩家档案到 PlayerRecords |

## 设计说明

> 数据结构详见 [系统架构.md](../系统架构.md#三数据结构)。
