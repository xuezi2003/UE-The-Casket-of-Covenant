# BP_BornVol（出生体积）

**职责**：定义玩家出生区域，提供随机出生点

**父类**：Actor

**实现状态**：✅ 已实现

**摆放方式**：手动摆放

---

## 组件结构

```
BP_BornVol
└── SceneRoot
    └── SpawnVolume (BoxComponent)
        ├── Collision: NoCollision
        └── Hidden In Game: true
```

---

## 变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SpawnVolume` | BoxComponent* | - | 出生区域体积 |
| `SpawnHeight` | float | 100.0 | 出生点距地面高度（cm） |

---

## 函数：GetRandomPlayerStarter

**返回类型**：FVector

在出生体积内返回一个随机位置：

```
1. 获取 SpawnVolume 的 Bounds
2. RandomX/Y = RandRange(Origin ± BoxExtent)
3. Z = Origin.Z + SpawnHeight
4. Return FVector(RandomX, RandomY, Z)
```

---

## 与 GameMode 的交互

```
GM_Endurance.GetSpawnPos()
→ Get Actor Of Class (BP_BornVol)
→ BP_BornVol.GetRandomPlayerStarter()
```

参见 [GM_Endurance.md](../../架构/GM_Endurance.md)

---

## 相关文档

- [GM_Endurance.md](../../架构/GM_Endurance.md) - GameMode
- [BP_Section_Start.md](../结构组件/BP_Section_Start.md) - 起点封闭墙
- [场景组件.md](../场景组件.md) - 组件索引
