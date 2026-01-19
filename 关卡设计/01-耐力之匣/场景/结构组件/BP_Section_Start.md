# BP_Section_Start（起点封闭墙）

**用途**：封闭场地起点

**实现状态**：✅ 已完成（配合 BP_StartLine 测试通过）

**摆放方式**：手动摆放

---

## 组件结构

```
BP_Section_Start
└── Scene
    └── SM_Wall (StaticMesh)
        ├── 网格: SM_Box
        ├── 缩放: (0.2, 10, 10)
        └── 材质: MI_Wall
```

---

## 配合组件

以下功能性组件手动摆放于附近：

| 组件 | 说明 |
|------|------|
| [BP_BornVol](../功能组件/BP_BornVol.md) | 出生体积 |
| [BP_StartLine](../功能组件/BP_StartLine.md) | 起点线触发器 |

---

## 相关文档

- [BP_Section_End.md](BP_Section_End.md) - 终点封闭墙
- [场景组件.md](../场景组件.md) - 组件索引
