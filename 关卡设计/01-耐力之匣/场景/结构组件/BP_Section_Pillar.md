# BP_Section_Pillar（柱段）

**用途**：场地边缘柱子，附带监控摄像头和画框装饰

## 组件结构

```
BP_Section_Pillar
└── Scene
    ├── BP_Camera (Child Actor)
    │   └── 监控摄像头组件
    │
    ├── BP_PaintFrame (Child Actor)
    │   └── 随机画框装饰
    │
    └── SM_Pillar (Static Mesh)
        ├── 位置: (0, 0, 0)
        ├── 缩放: (1, 1, 1)
        ├── 网格: SM_Pillar (已烘焙缩放)
        └── 材质: M_Wall
```

## 吸附插槽（MSS）

定义在 SM_Pillar 上：

| 插槽名 | 极性 | 用途 |
|--------|:----:|------|
| `Section_Left+` | + | 左侧连接点 |
| `Section_Right-` | - | 右侧连接点 |

---

## 相关文档

- [场景组件.md](../场景组件.md) - 组件索引
- [BP_Section_Wall.md](BP_Section_Wall.md)
- [BP_Camera.md](../装饰组件/BP_Camera.md)
- [BP_PaintFrame.md](../装饰组件/BP_PaintFrame.md)
- [Modular Snap System Documentation](../../../../参考文档/Plugins/Modular%20Snap%20System%20Documentation.md)
