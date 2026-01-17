# BP_Obstacle

障碍物蓝图，用于随机生成课桌或椅子。

## 组件

| 组件 | 类型 | 说明 |
|------|------|------|
| StaticMesh | Static Mesh Component | 显示网格 |

## 变量

| 变量 | 类型 | 说明 |
|------|------|------|
| ObstacleModels | Static Mesh[] | 可选网格列表（SM_Desk, SM_Chair） |

## 构造脚本逻辑

```
ObstacleModels → Random → Set Static Mesh
```

在生成时随机选择一个网格设置给 StaticMesh 组件。

## 碰撞配置

- **桌子**：26DOP 简化碰撞
- **椅子**：自动凸包碰撞（凸包数量 4-8，顶点数 16）

## 相关文档

- [场景组件.md](../场景组件.md)

> [!NOTE]
> 障碍物散布使用 **IA Scatter** 插件实现。
