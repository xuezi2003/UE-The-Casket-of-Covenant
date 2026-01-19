# BP_Camera（监控摄像头）

**用途**：场景壁挂监控，增强"监视"氛围与视觉动态。

**父类**：Actor

**实现状态**：✅ 已实现

---

## 组件结构

```
BP_Camera
└── Scene
    ├── CameraBase (StaticMesh)
    │   └── 监控底座（固定）
    │
    └── CameraHead (StaticMesh)
        └── 镜头模型（动画驱动）
```

---

## 逻辑

### BeginPlay

使用两个并行的 `TweenFloat` (FCTween 插件) 驱动自转：

| 轴向 | 控制目标 | 动画类型 |
|------|----------|----------|
| Yaw (水平) | 底座往复旋转 | Ping-Pong |
| Pitch (垂直) | 镜体上下俯仰 | Ping-Pong |

---

## 引用关系

- 被 [BP_Section_Pillar](../结构组件/BP_Section_Pillar.md) 作为子 Actor 包含

---

## 相关文档

- [场景组件.md](../场景组件.md) - 组件索引
- [FCTween Documentation](../../../../参考文档/Plugins/FCTween%20Documentation.md)
