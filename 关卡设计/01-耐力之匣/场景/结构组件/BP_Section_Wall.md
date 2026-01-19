# BP_Section_Wall（墙段）

**用途**：场地侧墙，面向 +X

## 组件结构

```
BP_Section_Wall
└── Scene
    ├── SM_Wall (Static Mesh)
    │   ├── 位置: (0, 0, 0)
    │   ├── 缩放: (1, 1, 1)
    │   ├── 网格: SM_Wall (已烘焙缩放)
    │   └── 材质: M_Wall
    │
    └── SM_Pivot (Static Mesh)
        ├── 位置: (10, 0, 500) ← 墙体正中
        ├── 缩放: (1, 1, 1)
        └── 网格: SM_Pivot (用于 MSS 吸附)
```

## 吸附插槽（MSS）

定义在 SM_Pivot 上：

| 插槽名 | 极性 | 用途 |
|--------|:----:|------|
| `Section_Back-` | - | 后侧连接点 |
| `Section_Front+` | + | 前侧连接点 |

---

## 吸附拼接规则

使用 MSS 极性系统实现单向配对：
- `+` 极性匹配 `-` 极性
- 相同极性不匹配

**典型拼接**：
```
Pillar.Section_Right- ← 吸附 → Wall.SM_Pivot.Section_Front+
```

---

## 相关文档

- [场景组件.md](../场景组件.md) - 组件索引
- [BP_Section_Pillar.md](BP_Section_Pillar.md)
- [BP_BlackboardWall.md](../装饰组件/BP_BlackboardWall.md) - 可吸附到墙体 SM_Pivot
- [Modular Snap System Documentation](../../../../参考文档/Plugins/Modular%20Snap%20System%20Documentation.md)
