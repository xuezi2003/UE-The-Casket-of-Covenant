# BP_Obstacle（障碍物）

**用途**：随机生成课桌或椅子的障碍物。

**父类**：Actor

**实现状态**：✅ 已实现（已修复多端不一致）

---

## 组件结构

```
BP_Obstacle
└── Scene
    └── StaticMesh (Static Mesh Component)
        └── 显示网格（随机选择）
```

---

## 变量

| 变量 | 类型 | 说明 |
|------|------|------|
| ObstacleModels | Static Mesh[] | 可选网格列表（SM_Desk, SM_Chair） |

---

## 构造脚本逻辑

```
Seed = (X + Y + Z + 11) * VSize(ActorLocation)
索引 = Abs(Floor(Seed)) % ObstacleModels.Length
→ Set Static Mesh (ObstacleModels[索引])
```

使用**坐标求和乘以向量长度**的组合算法确保：
- ✅ **结果抖动**：即使物体并排紧挨着，其结果也会发生剧变（避免并排显示相同）。
- ✅ **多端对齐**：Server 和 Client 坐标完全一致，计算结果必然一致。
- ✅ **零开销**：无需网络同步，纯本地确定性计算。

---

## 碰撞配置

| 网格 | 碰撞类型 | 参数 |
|------|----------|------|
| SM_Desk (桌子) | 26DOP 简化碰撞 | - |
| SM_Chair (椅子) | 自动凸包碰撞 | 凸包数量 4-8，顶点数 16 |

---

## Actor 标签

| 索引 | 标签名 | 用途 |
|------|--------|------|
| 0 | `Obstacle` | 供 IA Scatter 识别障碍物 |

---

## 散布方式

使用 **IA Scatter** 插件进行场景散布。

---

## 相关文档

- [场景组件.md](../场景组件.md) - 组件索引
- [IAScatter布局.md](../IAScatter布局.md) - IA Scatter 配置
- [IA Scatter 参考](../../../../参考文档/Plugins/IA%20Scatter%20参考.md) - 插件参考
