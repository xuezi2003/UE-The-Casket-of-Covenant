# BP_GlassBridge（玻璃桥生成器）

**职责**：沿样条线生成多对玻璃板，确定真假玻璃布局，为每个玻璃板设置中点标记

**父类**：Actor

**实现状态**：✅ Phase 2 已完成

**摆放方式**：手动摆放在关卡中，通过样条线编辑器调整形状

**测试验证**：✅ 编辑器验证通过（玻璃桥沿样条线生成正确，数量正确，朝向正确）

---

## 设计概述

`BP_GlassBridge` 是玻璃桥系统的顶层生成器，负责：
1. **样条线生成**：沿样条线生成多对玻璃板（BP_GlassPair）
2. **真假玻璃布局**：在服务端生成时确定真假玻璃布局（使用随机种子）
3. **布局同步**：通过 RepNotify 变量将布局信息同步到客户端
4. **中点标记**：为每个玻璃对设置 IsMid（标记是否为中点玻璃）

**Phase 职责边界**：
- **Phase 2**：创建蓝图类，实现样条线生成、真假玻璃布局、布局同步、中点玻璃标记设置

**设计参考**：
- 参考 BP_BlackboardWall 的生成器模式（父 Actor 管理子 Actor）
- 使用 Spline Component 支持任意形状，可视化编辑方便

---

## 组件结构

```
BP_GlassBridge
└── Scene
    ├── GlassRoot (SceneComponent)
    │   └── 动态生成的 ChildActorComponent（BP_GlassPair）
    └── Spline (SplineComponent)
        └── Closed Loop: false
```

**说明**：
- `GlassRoot`：SceneComponent，用于挂载动态生成的玻璃对
- `Spline`：样条线组件，定义玻璃桥的路径和形状
- 子 Actor（BP_GlassPair）在 Construction Script 中动态生成并挂载到 GlassRoot

---

## 变量

| 变量名 | 类型 | 默认值 | 复制 | 说明 | 实现阶段 |
|--------|------|--------|:----:|------|:--------:|
| `PairCnt` | int | 10 | ❌ | 玻璃对数量 | ✅ Phase 2 |
| `PairSpacing` | float | 300.0 | ❌ | 玻璃对之间的间距（cm） | ✅ Phase 2 |
| `GlassLayoutSeed` | int | 0 | ✅ RepNotify | 真假玻璃布局的随机种子 | ✅ Phase 2 |
| `GlassLayout` | TArray\<bool\> | - | ❌ | 真假玻璃布局数组（每个元素代表一对玻璃的左侧是否为真） | ✅ Phase 2 |
| `GlassPairs` | TArray\<BP_GlassPair*\> | - | ❌ | 运行时收集的玻璃对引用 | ✅ Phase 2 |

**网络配置说明**：
- `GlassLayoutSeed`：需要 RepNotify（服务端生成种子，客户端根据种子重建布局）
- `GlassLayout`：不复制（客户端根据 GlassLayoutSeed 重建）
- `GlassPairs`：不复制（仅用于运行时管理）

---

## 构造脚本 (Phase 2) ✅

**实际蓝图实现**：
```
Event 构造脚本
├─> Reverse For Each in GlassRoot.GetChildrenComponents
│   └─> Loop Element.K2_DestroyComponent
└─> For Loop (0 to PairCnt - 1)
    ├─> Add Component ChildActorComponent
    │   ├─> RelativeTransform = MakeTransform(
    │   │   Location = Spline.GetLocationAtDistanceAlongSpline(本地, Loop Index * PairSpacing),
    │   │   Rotation = Spline.GetRotationAtDistanceAlongSpline(本地, Loop Index * PairSpacing),
    │   │   Scale = (1, 1, 1))
    │   └─> 子Actor类 = BP_GlassPair（在节点详细面板中设置）
    └─> AddedComponent.K2_AttachToComponent(Parent = GlassRoot, 保持相对)
```

**说明**：
- Construction Script 只负责生成玻璃对的位置和数量
- 真假玻璃布局在 BeginPlay 时由服务端确定（使用随机种子）
- IsMid 在 ApplyGlassLayout 时设置
- 不需要设置组件复制（Construction Script 会在服务端和客户端都执行）

---

## 函数

### GenerateSeed (Phase 2) ✅

**调用时机**：BeginPlay（仅服务端执行）

**实际蓝图实现**：
```
Event GenerateSeed
├─> Switch Has Authority
├─> Set GlassLayoutSeed = RandomIntegerInRange(Max=9999, Min=0)
└─> Set RandomStream = MakeRandomStream(InitialSeed=GlassLayoutSeed)
```

**说明**：
- 只生成随机种子，不生成布局数组
- 布局数组由 ApplyGlassLayout 函数生成
- RandomStream 初始化后存储在变量中，供 ApplyGlassLayout 使用

---

### ApplyGlassLayout (Phase 2) ✅

**调用时机**：
- BeginPlay（服务端生成种子后调用）
- OnRep_GlassLayoutSeed（客户端接收种子后调用）

**实际蓝图实现**：
```
Event ApplyGlassLayout
├─> Sequence
│   ├─> then_0: 收集所有 BP_GlassPair 引用
│   │   ├─> Array_Clear on GlassPairs
│   │   └─> ForEach in GlassRoot.GetChildrenComponents(bIncludeAllDescendants=false)
│   │       └─> Cast Loop Element to ChildActorComponent
│   │           └─> Cast ChildActor to BP_GlassPair
│   │               └─> Array_Add to GlassPairs
│   │
│   ├─> then_1: 重建布局数组
│   │   ├─> Set RandomStream = MakeRandomStream(InitialSeed=GlassLayoutSeed)
│   │   ├─> Array_Clear on GlassLayout
│   │   └─> For Loop (0 to PairCnt - 1)
│   │       └─> Array_Add(NewItem=RandomBoolFromStream(Stream=RandomStream))
│   │
│   ├─> then_2: 应用布局到每对玻璃板
│   │   └─> For Loop (0 to PairCnt - 1)
│   │       └─> GlassPairs[Loop Index].InitPair(
│   │           IsLeftReal = GlassLayout[Loop Index],
│   │           IsMid = (Loop Index == PairCnt / 2))
│   │
│   └─> then_3: 调试输出（可选）
│       └─> Call DebugLayoutPrint()
```

**说明**：
- 服务端和客户端都会调用此函数
- 每次调用都会重建布局数组（使用 GlassLayoutSeed 确保一致性）
- IsMid 只标记中点玻璃（i == PairCnt / 2），当玩家踩到中点玻璃时触发观察系统切换

---

### OnRep_GlassLayoutSeed (Phase 2) ✅

**调用时机**：GlassLayoutSeed 变量 RepNotify 回调（服务端和客户端都会触发）

**实际蓝图实现**：
```
Event OnRep_GlassLayoutSeed
└─> Call ApplyGlassLayout()
```

**说明**：
- **Blueprint 特性**：Blueprint 中的 RepNotify 在服务端和客户端都会触发（与 C++ 不同）
- 服务端：GenerateSeed 设置种子后，RepNotify 触发，调用 ApplyGlassLayout
- 客户端：接收种子后，RepNotify 触发，调用 ApplyGlassLayout
- 这种机制确保服务端和客户端使用相同的代码路径，避免逻辑分歧

---

### DebugLayoutPrint (Phase 2) ✅

**调用时机**：ApplyGlassLayout 完成后调用（可选的调试功能）

**实际蓝图实现**：
```
Event DebugLayoutPrint
├─> Set TempStr = MakeLiteralString(Value="")
├─> For Each in GlassLayout
│   └─> Set TempStr = (TempStr + "|" + Conv_BoolToString(InBool=Loop Element))
└─> PrintText(InText=FormatText(Format="[Brdge] 布局：{0}", Args={0=TempStr}))
```

---

## 事件

### BeginPlay (Phase 2) ✅

**实际蓝图实现**：
```
Event BeginPlay
├─> Switch Has Authority
│   └─> Authority:
│       └─> Call GenerateSeed()
└─> (无 Remote 分支，客户端等待 RepNotify)
```

**说明**：
- 服务端：生成随机种子（GenerateSeed），种子复制会自动触发 OnRep_GlassLayoutSeed
- 客户端：等待 OnRep_GlassLayoutSeed 触发，接收种子后调用 ApplyGlassLayout
- **重要**：服务端不在 BeginPlay 中调用 ApplyGlassLayout，而是依赖 RepNotify 机制（Blueprint 的 RepNotify 在服务端和客户端都会触发）

---

## 网络架构

**服务端权威**：
- 真假玻璃布局由服务端生成（GenerateSeed）
- 随机种子由服务端生成并同步到客户端（GlassLayoutSeed）

**客户端表现**：
- 客户端根据 GlassLayoutSeed 重建布局（ApplyGlassLayout）
- 确保服务端和客户端的布局完全一致

**为什么不直接复制 GlassLayout 数组**：
- 数组复制开销大（PairCnt 个布尔值）
- 使用种子重建更高效（只复制 1 个整数）
- 确保确定性（相同种子生成相同布局）

---

## 样条线编辑

**编辑器操作**：
1. 在关卡中放置 BP_GlassBridge
2. 选中 Actor，在 Details 面板中找到 SplineComponent
3. 使用样条线编辑器调整路径：
   - 添加/删除样条点
   - 调整样条点位置和切线
   - 支持任意形状（直线、曲线、S 形等）

**样条线参数**：
- Closed Loop：false（不闭合）
- Spline Points：至少 2 个点（起点和终点）

---

## 相关文档

- [BP_GlassPair.md](BP_GlassPair.md) - 双排玻璃板（子 Actor）
- [BP_GlassPanel.md](BP_GlassPanel.md) - 单块玻璃板
- [GS_Sacrifice.md](../../架构/GS_Sacrifice.md) - GameState（观察系统）
- [总体策划.md](../../总体策划.md) - 关卡5总体策划
- [场景组件.md](../场景组件.md) - 场景组件索引
- [BP_BlackboardWall.md](../../../01-耐力之匣/场景/装饰组件/BP_BlackboardWall.md) - 生成器参考

