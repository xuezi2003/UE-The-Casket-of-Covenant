# BP_Section 封闭墙

**职责**：封闭场地的起点和终点

**父类**：Actor

**实现状态**：⏳ 待测试

**摆放方式**：手动摆放到关卡中

---

## 设计概述

封闭墙组件用于封闭场地的起点和终点区域，均仅包含 SM_Wall。

### BP_Section_Start（起点封闭墙）

用于封闭场地起点。

> [!NOTE]
> BP_BornVol、BP_StartLine 等功能性组件**手动摆放**于附近，与本组件配合使用。

### BP_Section_End（终点封闭墙）

用于封闭场地终点。

> [!NOTE]
> BP_VideoBoard、BP_FinishLine 等功能性组件**手动摆放**于附近，与本组件配合使用。

---

## 组件结构

两个封闭墙使用相同的结构：

- **Scene**：根组件
- **SM_Wall**：墙壁 Static Mesh
  - Mesh：Cube (1×1×1)
  - Scale：`0.2 × 10 × 10`
  - 材质实例：`MI_Wall`

---

## 变量

无额外变量，仅包含 SM_Wall 组件。

---

## 缩放处理

手动调整 Scale.Y 使墙横跨场地宽度。

---

## 网络同步

- 由 Construction Script 生成，服务端/客户端各自独立执行
- 无需额外网络同步（纯表现层）

---

## 相关文档

### 起点相关
- [BP_BornVol.md](BP_BornVol.md) - 出生体积（手动摆放）
- [BP_StartLine.md](BP_StartLine.md) - 起点线触发器（手动摆放）

### 终点相关
- [BP_VideoBoard.md](BP_VideoBoard.md) - 视频黑板（手动摆放）
- [BP_FinishLine.md](BP_FinishLine.md) - 终点线触发器（手动摆放）

### 其他
- [场景组件.md](../场景组件.md) - 组件索引
