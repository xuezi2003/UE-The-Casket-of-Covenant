# BP_BornVol（出生体积）

**职责**：定义玩家出生/重生的区域，提供随机出生点

**父类**：Actor

**实现状态**：✅ 已实现

---

## 设计概述

`BP_BornVol` 是一个体积 Actor，用于：
1. 定义玩家的出生区域范围
2. 为 `GM_Endurance.GetSpawnPos()` 提供随机出生点

> [!NOTE]
> 本组件**手动摆放**。

---

## 组件结构

```
BP_BornVol (Actor)
├── SceneRoot (SceneComponent)
└── SpawnVolume (BoxComponent)
    ├── Box Extent: 根据起点段尺寸配置
    ├── Collision: NoCollision（仅用于定义范围）
    └── Hidden In Game: true
```

---

## 变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SpawnVolume` | BoxComponent* | - | 出生区域体积 |
| `SpawnHeight` | float | 100.0 | 出生点距地面高度（cm） |

---

## 函数

### GetRandomPlayerStarter

**返回类型**：FVector

**说明**：返回出生体积内的一个随机位置

```
函数逻辑：
1. 获取 SpawnVolume 的 Bounds (Origin, BoxExtent)
2. RandomX = FMath::RandRange(Origin.X - BoxExtent.X, Origin.X + BoxExtent.X)
3. RandomY = FMath::RandRange(Origin.Y - BoxExtent.Y, Origin.Y + BoxExtent.Y)
4. Z = Origin.Z + SpawnHeight
5. Return FVector(RandomX, RandomY, Z)
```

---

## 与 GameMode 的交互

`GM_Endurance` 通过以下方式获取出生点：

```
// GM_Endurance.GetSpawnPos()
Get Actor Of Class (BP_BornVol)
→ RandomPoint = BP_BornVol.GetRandomPlayerStarter()
→ Return RandomPoint
```

参见 [GM_Endurance.md](../../架构/GM_Endurance.md)

---

## 编辑器配置

手动摆放时：
- 通过 Box Extent 直接定义出生区域尺寸
- 确保体积位于场地内，不与墙壁 Mesh 重叠
- `SpawnHeight` 应确保玩家不会卡在地板里

---

## 相关文档

- [GM_Endurance.md](../../架构/GM_Endurance.md) - GameMode 引用
- [场景组件.md](../场景组件.md) - 组件索引
