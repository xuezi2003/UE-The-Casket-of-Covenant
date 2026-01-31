# BP_Glass（破碎效果 Actor）

**职责**：纯粹的破碎效果组件，管理预制碎片的物理模拟

**父类**：Actor

**实现状态**：✅ 已实现（Phase 2.1）

**使用方式**：由 BP_GlassPanel 通过 ChildActorComponent 加载

---

## 设计概述

`BP_Glass` 是一个**职责单一的破碎效果组件**，只负责"完整 → 破碎"的视觉表现：
- 包含多个预制的 Static Mesh 碎片
- 初始状态：碎片拼成完整玻璃，物理模拟禁用（悬浮状态）
- 破碎时：启用碎片物理模拟，碎片受重力影响掉落
- **不负责**：网络同步、碰撞管理、玩家检测（由 BP_GlassPanel 负责）

**设计优势**：
- **职责分离**：BP_Glass 只管破碎效果，BP_GlassPanel 管游戏逻辑
- **简单可靠**：避开 Geometry Collection 的复杂配置，使用引擎基础功能
- **易于替换**：如果以后想换破碎方案，只需要替换这个组件

---

## 组件结构

```
BP_Glass
└── Scene
    └── 多个 StaticMeshComponent（预制碎片）
        - SM_Glass_1 到 SM_Glass_10
        - 使用破碎工具生成，应用凸包碰撞
```

**说明**：
- 包含 10 个预制的 StaticMeshComponent 碎片（SM_Glass_1 到 SM_Glass_10）
- 碎片使用破碎工具生成，应用了凸包碰撞
- 碎片初始状态拼成完整玻璃（手动摆放位置）
- 碎片使用 Volumetric Glass 材质

---

## 函数

### BeginPlay ✅

**Blueprint 实现**：
```
Event BeginPlay
└─> Call SetAllPhysics(IsSimulate=false)
```

---

### BreakGlass (Custom Event) ✅

**调用时机**：由 BP_GlassPanel 调用

**Blueprint 实现**：
```
Custom Event: BreakGlass
└─> Call SetAllPhysics(IsSimulate=true)
```

---

### SetAllPhysics (Custom Event) ✅

**参数**：
- `IsSimulate`：布尔，是否启用物理模拟

**Blueprint 实现**：
```
Custom Event: SetAllPhysics
Args: (IsSimulate: bool)
└─> For Each Loop
    ├─ Array: K2_GetComponentsByClass(ComponentClass=StaticMeshComponent)
    └─ Loop Body:
        └─> Element.SetSimulatePhysics(bSimulate=IsSimulate)
```

**说明**：
- 统一管理所有碎片的物理模拟状态
- BeginPlay 调用 SetAllPhysics(false) 禁用物理模拟（悬浮状态）
- BreakGlass 调用 SetAllPhysics(true) 启用物理模拟（碎片掉落）

---

### BreakNow (Custom Event) ✅

**调用时机**：编辑器调试

**Blueprint 实现**：
```
Custom Event: BreakNow
└─> Call BreakGlass
```

---

### UpdateMaterial (Phase 3.6)

**实现状态**：❌ 未实现

**调用时机**：由 BP_GlassPanel.UpdateVisualDifference 调用

**参数**：
- `NewMaterial`：UMaterialInstance*，新的材质实例

**逻辑**：
```
1. 获取所有 StaticMeshComponent（K2_GetComponentsByClass）
2. For Each Component:
   - SetMaterial(0, NewMaterial)（设置材质）
```

**说明**：
- 统一管理所有碎片的材质
- 保持职责分离：BP_Glass 负责自己的材质管理，BP_GlassPanel 只负责判断逻辑

---

## 碰撞配置

### 碎片碰撞响应

| 通道 | 响应 | 说明 |
|------|:----:|------|
| Pawn | 阻挡 | 玩家可以站立（破碎前） |
| PawnBlock | 阻挡 | 穿过 StartLine 的玩家可以站立（破碎前） |
| Camera | 忽略 | 避免摄像机臂跳变 |
| Visibility | 阻挡 | 可被射线检测 |
| 其他 | 忽略 | - |

**说明**：
- 破碎前：碎片拼成完整玻璃，物理模拟禁用，玩家可以站立
- 破碎后：碎片启用物理模拟，受重力影响掉落

---

## 网络架构

**职责分离**：
- **BP_Glass**：纯粹的本地效果组件，不负责网络同步
- **BP_GlassPanel**：负责网络同步（通过 Multicast RPC 触发客户端破碎）

**同步流程**：
1. 服务端：BP_GlassPanel.BreakGlass() → 调用 Multicast_BreakGlass()
2. Multicast RPC：广播到所有客户端
3. 所有客户端：执行 BP_Glass.BreakGlass()（启用碎片物理模拟）
4. 结果：服务端和客户端都执行破碎效果

---

## 相关文档

- [BP_GlassPanel.md](BP_GlassPanel.md) - 玻璃板 Actor（父容器）
- [Volumetric Glass 参考.md](../../../../参考文档/Plugins/Volumetric%20Glass%20参考.md) - 玻璃材质插件
- [场景组件.md](../场景组件.md) - 场景组件索引
