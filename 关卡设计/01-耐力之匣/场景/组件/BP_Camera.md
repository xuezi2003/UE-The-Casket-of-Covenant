# BP_Camera

**用途**：场景壁挂监控，增强"监视"氛围与视觉动态。

## 组件

| 组件 | 类型 | 用途 |
|------|------|------|
| CameraBase | StaticMesh | 监控底座 |
| CameraHead | StaticMesh | 镜头模型 |

## 逻辑

**BeginPlay**：使用两个并行的 `TweenFloat` (FCTween 插件) 驱动自转。

| 轴向 | 控制目标 | 动画类型 |
|------|----------|----------|
| Yaw (水平) | 底座往复旋转 | Ping-Pong |
| Pitch (垂直) | 镜体上下俯仰 | Ping-Pong |

---

## 相关文档

- [BP_ArenaGenerator.md](BP_ArenaGenerator.md) - 场地生成器（BP_Section_Pillar 包含本组件）
- [场景组件.md](../场景组件.md) - 组件索引
