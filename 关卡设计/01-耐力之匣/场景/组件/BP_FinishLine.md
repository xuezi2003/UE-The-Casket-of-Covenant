# BP_FinishLine（终点线触发器）

**职责**：检测玩家到达终点

**父类**：Actor

**实现状态**：❌ 待实现

**归属**：作为 `BP_Section_End` 的子组件

---

## 设计概述

`BP_FinishLine` 是一个触发器 Actor，用于：
1. 检测玩家穿过终点线
2. 通知 GameState 玩家到达终点

---

## 组件结构

- **SceneRoot**：根组件
- **TriggerBox**：Box Collision，横跨场地宽度
  - Collision Preset：OverlapOnlyPawn
  - Generate Overlap Events：true

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `TriggerBox` | UBoxComponent* | 触发体积 |

---

## 事件

### OnComponentBeginOverlap (TriggerBox)

当玩家进入触发区域时：
1. 检查是否为玩家 Character
2. 通知 GameState 该玩家到达终点
3. 可选：播放通关特效/音效

---

## 缩放处理

作为 BP_Section_End 子组件时：
- TriggerBox 跟随父级缩放，自动适应场地宽度

---

## 相关文档

- [BP_ArenaGenerator.md](BP_ArenaGenerator.md) - 场地生成器
- [BP_Section_End](BP_ArenaGenerator.md#bp_section_end终点封闭墙) - 所属父组件
- [场景组件.md](../场景组件.md) - 组件索引
