# BP_ArenaGenerator（场地生成器）

**职责**：动态生成第一关完整场地结构

**父类**：Actor

**实现状态**：❌ 待实现

> [!NOTE]
> 本蓝图在 **Construction Script** 中生成场地，确保编辑器中可预览且所有客户端看到相同结果。

---

## 设计概述

采用**分层切片**架构，将场地分为三层独立生成：

- **顶层**：天花板，一整块 Mesh，根据总长度动态缩放
- **中间层**：墙壁和柱子模块，按顺序沿 X 轴排列
- **底层**：地板，一整块 Mesh，根据总长度动态缩放

---

## 坐标系统

与 BP_Monitor 保持一致：

| 轴 | 方向 | 说明 |
|----|------|------|
| **X 轴** | 前进方向 | 起点位于 X=0，终点位于 X=TotalLength |
| **Y 轴** | 场地宽度方向 | 左墙位于 Y=-ArenaWidth/2，右墙位于 Y=+ArenaWidth/2 |
| **Z 轴** | 高度方向 | 地板位于 Z=0，天花板位于 Z=ArenaHeight |

---

## 场地结构

场地沿 X 轴正方向依次包含以下区域：

### 1. 起点区域

**起点封闭墙**（BP_Section_Start）：
- 位于 X=0，横跨整个场地宽度，封闭场地后方
- **包含子组件**：BP_BornVol（出生体积，跟随墙宽度缩放）

### 2. 中间重复区域

按 `[墙段] → [柱段]` 的顺序循环 `RepeatCount` 次：

- **BP_Section_Wall**：单侧墙壁模块
  - 包含墙体 Mesh 和 BP_BlackboardWall
  - 左侧一个，位于 Y=-ArenaWidth/2
  - 右侧一个，位于 Y=+ArenaWidth/2，Y 轴镜像
  
- **BP_Section_Pillar**：单侧柱子模块
  - 包含柱子 Mesh 和 BP_Camera
  - 左侧一个，位于 Y=-ArenaWidth/2
  - 右侧一个，位于 Y=+ArenaWidth/2，Y 轴镜像

### 3. 终点区域

**终点封闭墙**（BP_Section_End）：
- 位于 X=TotalLength，横跨整个场地宽度，封闭场地前方
- **包含子组件**：
  - 视频黑板 Mesh（跟随墙缩放，未来可能播放视频）
  - BP_FinishLine（终点线触发器，跟随墙宽度缩放）

**BP_Puppet**（独立 Actor）：
- 不属于终点墙，由 ArenaGenerator 单独放置
- 位置根据木偶自身 BoundingBox 计算，站在视频黑板前面
- 位置计算：X = TotalLength - Puppet.BoundingBox.X/2 - Gap，Y = 0，Z = 0

---

## 子模块蓝图

> [!WARNING]
> 以下子模块蓝图均 **❌ 待实现**。

### BP_Section_Start（起点封闭墙）

- **职责**：封闭场地起点，包含出生体积
- **包含组件**：
  - 墙壁 Static Mesh（横跨场地宽度）
  - BP_BornVol（ChildActor，出生体积，已实现）
- **缩放逻辑**：墙宽度根据 ArenaWidth 缩放，BP_BornVol 跟随缩放

### BP_Section_End（终点封闭墙）

- **职责**：封闭场地终点，包含视频黑板和终点线
- **包含组件**：
  - 墙壁 Static Mesh（横跨场地宽度）
  - BP_VideoBoard（ChildActor，终点视频黑板，需反缩放保持比例）
  - BP_FinishLine（Box Collision 触发器，跟随墙宽度缩放）
- **缩放逻辑**：墙和终点线根据 ArenaWidth 缩放；BP_VideoBoard 反缩放保持比例

### BP_Section_Wall（单侧墙段）

- **职责**：提供单侧墙壁和黑板装饰
- **包含组件**：
  - 墙壁 Static Mesh
  - BP_BlackboardWall（ChildActor，已实现）
- **放置方式**：ArenaGenerator 中左右各生成一个，右侧 Y 轴镜像

### BP_Section_Pillar（单侧柱段）

- **职责**：提供单侧柱子和监控摄像头
- **包含组件**：
  - 柱子 Static Mesh
  - BP_Camera（ChildActor，已实现）
- **放置方式**：ArenaGenerator 中左右各生成一个，右侧 Y 轴镜像

### BP_VideoBoard（终点视频黑板）

- **职责**：终点区域的大屏幕，根据不同情况播放不同视频
- **包含组件**：
  - Static Mesh（黑板/屏幕外框）
  - Media Player + Media Texture（视频播放）
- **视频场景**：绿灯、红灯、被检测（详见 [BP_VideoBoard.md](BP_VideoBoard.md)）
- **归属**：作为 BP_Section_End 的子组件，反缩放保持比例

### BP_FinishLine（终点线触发器）

- **职责**：检测玩家到达终点
- **包含组件**：Box Collision，横跨场地宽度
- **触发逻辑**：玩家进入后通知 GameState 该玩家到达终点
- **归属**：作为 BP_Section_End 的子组件

---

## 可编辑参数

### 基础尺寸

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `ArenaWidth` | float | 2000.0 | 场地宽度（cm），Y 方向总跨度 |
| `ArenaHeight` | float | 1500.0 | 场地高度（cm），Z 方向 |

### 模块配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `RepeatCount` | int | 5 | 中间重复单元数量（墙段+柱段为一组） |
| `PuppetGap` | float | 200.0 | 木偶距离视频黑板的间距（cm） |

### 子 Actor 类引用

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `StartSectionClass` | TSubclassOf<AActor> | 起点封闭墙蓝图类 |
| `EndSectionClass` | TSubclassOf<AActor> | 终点封闭墙蓝图类 |
| `WallSectionClass` | TSubclassOf<AActor> | 墙段蓝图类 |
| `PillarSectionClass` | TSubclassOf<AActor> | 柱段蓝图类 |
| `PuppetClass` | TSubclassOf<AActor> | 木偶蓝图类 |

### Mesh 引用

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `FloorMesh` | UStaticMesh* | 地板 Mesh |
| `CeilingMesh` | UStaticMesh* | 天花板 Mesh |

---

## 组件结构

BP_ArenaGenerator 包含以下固定组件：

- **SceneRoot**：根组件
- **FloorMeshComp**：地板 Mesh 组件
- **CeilingMeshComp**：天花板 Mesh 组件

Construction Script 生成的子 Actor：

- BP_Section_Start × 1（起点封闭墙，包含 BP_BornVol）
- BP_Section_Wall × (RepeatCount × 2)
- BP_Section_Pillar × (RepeatCount × 2)
- BP_Section_End × 1（终点封闭墙，包含视频黑板 + BP_FinishLine）
- BP_Puppet × 1（独立放置，自动定位）

---

## Construction Script 逻辑

### 第一步：获取子模块尺寸

通过 `GetActorBounds` 从子模块蓝图获取实际尺寸：
- `StartDepth`：起点封闭墙在 X 轴方向的长度
- `WallDepth`：墙段在 X 轴方向的长度
- `PillarDepth`：柱段在 X 轴方向的长度
- `EndDepth`：终点封闭墙在 X 轴方向的长度

### 第二步：计算总长度

```
TotalLength = StartDepth 
            + (WallDepth + PillarDepth) × RepeatCount 
            + EndDepth
```

### 第三步：生成地板和天花板

- 地板：根据 TotalLength 和 ArenaWidth 缩放，放置于 Z=0
- 天花板：根据 TotalLength 和 ArenaWidth 缩放，放置于 Z=ArenaHeight

### 第四步：生成起点区域

1. 生成 BP_Section_Start，位于 X=0
2. 设置其 Scale.Y = ArenaWidth / 默认宽度（使其横跨场地）
3. 记录 CurrentX = StartDepth

### 第五步：生成中间段

循环 RepeatCount 次：

1. 在 CurrentX 位置生成左侧 BP_Section_Wall（Y=-ArenaWidth/2）
2. 在 CurrentX 位置生成右侧 BP_Section_Wall（Y=+ArenaWidth/2，Y 轴镜像）
3. CurrentX += WallDepth
4. 在 CurrentX 位置生成左侧 BP_Section_Pillar（Y=-ArenaWidth/2）
5. 在 CurrentX 位置生成右侧 BP_Section_Pillar（Y=+ArenaWidth/2，Y 轴镜像）
6. CurrentX += PillarDepth

### 第六步：生成终点区域

1. 生成 BP_Section_End，位于 X=CurrentX
2. 设置其 Scale.Y = ArenaWidth / 默认宽度（使其横跨场地）
3. 获取 BP_Puppet 的 BoundingBox
4. 计算木偶位置：X = TotalLength - PuppetBounds.X/2 - PuppetGap，Y = 0，Z = 0
5. 生成 BP_Puppet，设置位置

---

## 网络同步

由于场地在 Construction Script 中生成，所有客户端使用相同参数将得到完全相同的结果，无需额外同步逻辑。

- Construction Script 在服务端和客户端各自独立执行
- 只要蓝图参数一致，生成结果一致（确定性生成）

---

## 待实现清单

| 组件 | 状态 | 说明 |
|------|------|------|
| BP_ArenaGenerator | ❌ | 主生成器 |
| BP_Section_Start | ❌ | 起点封闭墙（含 BP_BornVol） |
| BP_Section_End | ❌ | 终点封闭墙（含 BP_VideoBoard + BP_FinishLine） |
| BP_Section_Wall | ❌ | 单侧墙段 |
| BP_Section_Pillar | ❌ | 单侧柱段 |
| BP_VideoBoard | ❌ | 终点视频黑板（BP_Section_End 子组件） |
| BP_FinishLine | ❌ | 终点线触发器（BP_Section_End 子组件） |

---

## 相关文档

- [BP_BornVol.md](BP_BornVol.md) - 出生体积（✅ 已实现，作为 BP_Section_Start 子组件）
- [BP_BlackboardWall.md](BP_BlackboardWall.md) - 黑板墙组件（✅ 已实现）
- [BP_Camera.md](BP_Camera.md) - 监控摄像头（✅ 已实现）
- [BP_Puppet.md](../木偶与监视器/BP_Puppet.md) - 木偶（✅ 已实现，独立放置）
- [BP_Monitor.md](../木偶与监视器/BP_Monitor.md) - 监视器（坐标系参考）
- [场景设计.md](../场景设计.md) - 场景设计要点
- [场景组件.md](../场景组件.md) - 组件索引
