# BP_GlassPair（双排玻璃板）

**职责**：管理左右两块玻璃板

**父类**：Actor

**实现状态**：✅ Phase 2 已完成

**摆放方式**：由 BP_GlassBridge 沿样条线动态生成

**测试验证**：✅ 编辑器验证通过（左右玻璃板生成正确，间距正确，床架模型差异正确）

---

## 设计概述

`BP_GlassPair` 是玻璃桥系统的中间层，负责：
1. **管理左右玻璃板**：使用 ChildActorComponent 管理两块 BP_GlassPanel
2. **设置左右位置**：在 Construction Script 中设置左右玻璃板的相对位置

**Phase 职责边界**：
- **Phase 2**：创建蓝图类，实现左右玻璃板生成

---

## 组件结构

```
BP_GlassPair
└── Scene
    ├── LeftPanel (ChildActorComponent)
    │   └── Child Actor Class: BP_GlassPanel
    └── RightPanel (ChildActorComponent)
        └── Child Actor Class: BP_GlassPanel
```

**说明**：
- `LeftPanel` / `RightPanel`：使用 ChildActorComponent 管理左右玻璃板

---

## 变量

| 变量名 | 类型 | 默认值 | 复制 | 说明 | 实现阶段 |
|--------|------|--------|:----:|------|:--------:|
| `GlassSpacing` | float | 200.0 | ❌ | 左右玻璃板间距（cm） | ✅ Phase 2 |
| `LeftPanel` | UChildActorComponent* | - | ❌ | 左侧玻璃板组件引用（UE 自动生成） | ✅ Phase 2 |
| `RightPanel` | UChildActorComponent* | - | ❌ | 右侧玻璃板组件引用（UE 自动生成） | ✅ Phase 2 |

**变量命名说明**：
- `GlassSpacing`：左右玻璃板之间的间距（BP_GlassPair 内部）
- `PairSpacing`：前后玻璃对之间的间距（BP_GlassBridge 中定义）

---

## 构造脚本 (Phase 2) ✅

```
Event 构造脚本
├─> LeftPanel.SetRelativeLocation((0, -GlassSpacing, 0))
└─> RightPanel.SetRelativeLocation((0, GlassSpacing, 0))
```

**说明**：
- 左右玻璃板以 BP_GlassPair 中心对称分布
- 实际间距为 2 * GlassSpacing

---

## 组件配置 (Phase 2) ✅

在 BP_GlassPair 的组件面板中配置：

| 组件 | 属性 | 值 | 说明 |
|------|------|:--:|------|
| LeftPanel | IsLeft | ✅ true | 使用左侧床架 |
| RightPanel | IsLeft | ❌ false | 使用右侧床架 |

**配置方式**：
1. 选中 LeftPanel 组件
2. 在 Details 面板中找到 Child Actor Template → IsLeft
3. 勾选为 true
4. 同样方式设置 RightPanel 的 IsLeft 为 false

**说明**：
- BP_GlassPanel.IsLeft 是"可编辑实例"（Instance Editable）
- 可以在父 Actor 的组件面板中直接配置子 Actor 的属性
- 编辑器中即可看到左右不同的床架

---

## 函数

### InitPair (Phase 2) ✅

**调用时机**：由 BP_GlassBridge 在生成后调用

**参数**：
- `bLeftIsReal`：布尔，左侧玻璃是否为真玻璃
- `bIsMid`：布尔，是否为中点玻璃

**实际蓝图实现**：
```
Event InitPair
├─> Cast (LeftPanel.ChildActor) To BP_GlassPanel
│   ├─> Set IsReal = ValueFrom(InitPair.IsLeftReal)
│   └─> Set IsMid = ValueFrom(InitPair.IsMid)
└─> Cast (RightPanel.ChildActor) To BP_GlassPanel
    ├─> Set IsReal = ! (ValueFrom(InitPair.IsLeftReal))
    └─> Set IsMid = ValueFrom(InitPair.IsMid)
```

**说明**：
- 左右玻璃互补（一真一假），只需要传入 bLeftIsReal
- IsMid 由 BP_GlassBridge 判断并传入

---

## 网络架构

**服务端权威**：
- IsReal 和 IsMid 由服务端设置（通过 InitPair）

**客户端表现**：
- IsLeft 在 Construction Script 中设置（服务端和客户端都执行）
- IsReal 和 IsMid 通过网络复制同步

---

## 相关文档

- [BP_GlassPanel.md](BP_GlassPanel.md) - 单块玻璃板（子 Actor，Phase 3.6 会在此判断是否为中点玻璃）
- [BP_GlassBridge.md](BP_GlassBridge.md) - 玻璃桥生成器（父 Actor）
- [总体策划.md](../../总体策划.md) - 关卡5总体策划
- [场景组件.md](../场景组件.md) - 场景组件索引

