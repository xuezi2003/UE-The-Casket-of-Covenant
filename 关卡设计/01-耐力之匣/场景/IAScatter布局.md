# IA Scatter 布局记录

本文档用于记录 L_Endurance 关卡中所有 **IA Scatter** 实例的配置方案。

> 相关参考：[IA Scatter 参考](../../../参考文档/Plugins/IA%20Scatter%20参考.md)

---

## 布局概览

| 实例名称 | 散布目标 | 覆盖区域 | 职责 |
|----------|----------|----------|------|
| `BP_ia_scatter_Banner_01/02` | [BP_Banner](装饰组件/BP_Banner.md) | 赛道上方 | 两排高考横幅 |
| `BP_ia_scatter_Obstacle` | [BP_Obstacle](装饰组件/BP_Obstacle.md) | 地面主区域 | 课桌椅遮挡物 |
| `BP_ia_scatter_GroundDec` | Static Meshes | 地面开阔处 | 书本纸张杂物 |
| `BP_ia_scatter_Prop` | [BP_Item_Base](../道具/BP_Item_Base.md) 子类 | 地面随机 | 游戏道具 |

---

## 实例详细参数

### 1. `BP_ia_scatter_Banner` (悬挂横幅)

- **散布目标**：[BP_Banner](装饰组件/BP_Banner.md)
- **覆盖区域**：沿赛道中心线的 Spline 路径
- **核心参数**：
  - **分发方式**：`Spline (down)` + `Fixed Distance (800.0)`
  - **间距逻辑**：勾选 `Add Instance Size To Distance`
  - **追踪设置**：勾选 `No Tracing`（防止横幅掉落到地面）
  - **缩放**：固定 `1.0`
- **备注**：
  - 场景中存在两组完全一致的实例（`_01` / `_02`），形成左右平行的两排横幅。
  - 利用 [BP_Banner](装饰组件/BP_Banner.md) 内部的 Construction Script 实现 21 种标语的随机切换。

---

### 2. `BP_ia_scatter_Obstacle` (课桌椅障碍物)

- **散布目标**：[BP_Obstacle](装饰组件/BP_Obstacle.md)
- **数量**：`50`
- **核心参数**：
  - **随机旋转**：Z 轴 `±45.0°`
  - **随机缩放**：`1.0 - 1.2`
  - **Overlapping**：`method 2`
  - **Randomize Seed At Runtime**：`❌ 关闭`（多人游戏兼容性要求）
  - **Execute ia Scatter At Runtime**：`❌ 关闭`（多人游戏兼容性要求）
- **备注**：
  - [BP_Obstacle](装饰组件/BP_Obstacle.md) 会在 Construction Script 中随机切换成"课桌"或"椅子"。
  - 此实例是玩家躲避 [BP_Monitor](木偶与监视器/BP_Monitor.md) 视线的主要遮挡物来源。
  - 运行时选项已关闭以确保所有客户端看到相同的障碍物布局。

---

### 3. `BP_ia_scatter_GroundDec` (地面书本纸张)

- **散布目标**：Static Mesh 列表
  - `SM_notebook_01~03`、`SM_notebookComposition`、`SM_paper`
- **数量**：`150`
- **核心参数**：
  - **随机旋转**：Z 轴 `±45.0°`
  - **缩放范围**：`1.2 - 2.0`
  - **避让逻辑**：`Do Not Populate On Tags: Prop`
  - **Overlapping**：`method 1`
  - **Randomize Seed At Runtime**：`❌ 关闭`（多人游戏兼容性要求）
  - **Execute ia Scatter At Runtime**：`❌ 关闭`（多人游戏兼容性要求）
- **备注**：
  - 用于铺设散落文具，增加"考试废墟"的氛围感。
  - 通过 `Prop` 标签避让大型物件，使其更多分布在空地。
  - 运行时选项已关闭以确保所有客户端看到相同的装饰布局。

---

### 4. `BP_ia_scatter_Prop` (游戏道具散布)

- **散布目标**：[BP_Item_Base](../道具/BP_Item_Base.md) 的 6 种子类
  - [BP_Item_Banana](../道具/BP_Item_Subclasses.md#bp_item_banana)、[BP_Item_Bomb](../道具/BP_Item_Subclasses.md#bp_item_bomb)
  - [BP_Item_Lighting](../道具/BP_Item_Subclasses.md#bp_item_lighting)、[BP_Item_Shield](../道具/BP_Item_Subclasses.md#bp_item_shield)
  - [BP_Item_MedicalKit](../道具/BP_Item_Subclasses.md#bp_item_medicalkit)、[BP_Item_Coin](../道具/BP_Item_Subclasses.md#bp_item_coin)
- **核心参数**：
  - **分发方式**：`planar (down)`
  - **核心区域**：`2060 x 1321`
  - **最小间距**：`250.0`
  - **生成目标**：[BP_Section_Floor](结构组件/BP_Section_Floor.md)
  - **Randomize Seed At Runtime**：`❌ 关闭`（多人游戏兼容性要求）
  - **Execute ia Scatter At Runtime**：`❌ 关闭`（多人游戏兼容性要求）
- **备注**：
  - 这是游戏核心 [道具系统](../道具/道具系统.md) 的投放源。
  - 通过 `Method 2` 进行重叠检测。
  - 运行时选项已关闭以确保所有客户端看到相同的道具分布。

---

## 相关文档

- [场景组件.md](场景组件.md) - 组件索引
- [场景设计.md](场景设计.md) - 场景整体设计
- [道具系统.md](../道具/道具系统.md) - 道具系统概述
- [IA Scatter 参考](../../../参考文档/Plugins/IA%20Scatter%20参考.md) - 插件变量参考
