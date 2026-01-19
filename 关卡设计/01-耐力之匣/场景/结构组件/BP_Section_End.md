# BP_Section_End（终点封闭墙）

**用途**：封闭场地终点

**实现状态**：✅ 已完成（配合 BP_FinishLine 测试通过）

**摆放方式**：手动摆放

---

## 组件结构

```
BP_Section_End
└── Scene
    └── SM_Wall (StaticMesh)
        ├── 网格: SM_Box
        ├── 缩放: (0.2, 10, 10)
        ├── 材质: MI_Wall
        │
        └── SM_Pivot (StaticMesh)
            └── 用于 MSS 吸附挂载 BP_VideoBoard
```

---

## 配合组件

| 组件 | 摆放方式 |
|------|----------|
| [BP_VideoBoard](../功能组件/BP_VideoBoard.md) | MSS 吸附 |
| [BP_FinishLine](../功能组件/BP_FinishLine.md) | 手动摆放 |

---

## 相关文档

- [BP_Section_Start.md](BP_Section_Start.md) - 起点封闭墙
- [Modular Snap System](../../../../参考文档/Plugins/Modular%20Snap%20System%20Documentation.md) - MSS 插件文档
- [场景组件.md](../场景组件.md) - 组件索引
