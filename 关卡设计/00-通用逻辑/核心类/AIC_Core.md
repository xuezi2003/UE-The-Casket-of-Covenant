# AIC_Core（AIController）

**职责**：AI 控制器，Possess 时启动行为树

**设计说明**：AIC_Core 是通用 AI 控制器，**不需要为每个关卡创建子类**。关卡差异通过 GM 子类配置不同的行为树（AI_BT）实现。

## 配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| bWantsPlayerState | ✅ | 确保 AI 也有 PlayerState |

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| BT_Asset | 行为树 | 行为树资产（由 GM 生成时传入） |

## 关键逻辑

```
Event On Possess → Run Behavior Tree (BT_Asset)
```

## AI 触发操作方式

| 操作类型 | 触发方式 |
|----------|----------|
| GAS 操作（推搡、闪避等） | GSC 内置 `BTTask_TriggerAbilityByClass` 或 `BTTask_TriggerAbilityByTags` |
| 非 GAS 操作（选房间等） | 自定义 BTTask 调用组件的 `TryXxx()` 接口 |

## 各关卡行为树（待实现）

| 行为树 | 关卡 | AI 行为 |
|--------|------|---------|
| BT_Endurance | 1 | 向终点移动、红灯停绿灯跑、奔跑/蹲行/跳跃、推搡、闪避、失衡QTE判定、道具使用 |
| BT_Logic | 2 | 随机选房间、跟随多数人 |
| BT_Courage | 3 | 按概率戴面具 |
| BT_Insight | 4 | 随机站队 |
| BT_Sacrifice | 5 | 向终点移动、推搡、闪避、失衡QTE判定、扔金币测试玻璃 |
