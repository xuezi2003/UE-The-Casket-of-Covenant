# BP_GlassPanel（单块玻璃板）

**职责**：单块玻璃板，管理真假类型、玩家站立检测、承重逻辑、破碎效果

**父类**：Actor

**实现状态**：✅ Phase 2 已完成，Phase 3 待实现

**Phase 2 已实现部分**：
- ✅ 组件结构（SM_Bed、BP_Glass、BoxTrigger）
- ✅ Construction Script（根据 IsLeft 动态设置床架）
- ✅ 变量 IsLeft、BedSMs、IsReal、IsMid、StandPlayers
- ✅ 组件引用变量（SM_Bed、BP_Glass、BoxTrigger，UE 自动生成）
- ✅ 网络复制配置（Replicates = True、IsReal = Replicated、IsLeft = Replicated、IsMid = Replicated）
- ✅ BoxTrigger 碰撞配置（OverlapAllDynamic）
- ✅ SM_Bed 碰撞配置（BlockAllDynamic）
- ✅ BP_Glass 碎片碰撞配置（BlockAllDynamic）
- ✅ 编辑器验证通过（玻璃板生成正确，床架模型差异正确）

**Phase 3 待实现部分**：
- ❌ 材质变量（RealGlassMaterial、FakeGlassMaterial、UnifiedGlassMaterial，Phase 3.6 使用）
- ❌ BeginPlay 事件（Phase 3 绑定 BoxTrigger 的 Overlap 事件）
- ❌ 游戏逻辑（Phase 3/3.5）

**摆放方式**：由 BP_GlassPair 动态生成

---

## 设计概述

`BP_GlassPanel` 是玻璃桥系统的最小单元，负责：
1. **真假类型管理**：由 BP_GlassBridge 在生成时设置
2. **玩家站立检测**：检测玻璃上的玩家数量（Phase 3）
3. **承重逻辑**：真玻璃承重 ≤2 人，假玻璃承重 0 人（Phase 3/3.5）
4. **破碎效果**：使用预制碎片实现破碎效果（Phase 3/3.5）

**破碎方案**：
- 使用 **BP_Glass**（预制碎片 Actor）实现破碎效果
- BP_Glass 包含多个 Static Mesh 碎片，初始状态拼成完整玻璃
- 破碎时启用碎片物理模拟，碎片掉落
- 职责分离：BP_Glass 只负责破碎效果，BP_GlassPanel 负责游戏逻辑和网络同步

**Phase 职责边界**：
- **Phase 2**：创建蓝图类，定义变量和函数接口，实现基础组件结构
- **Phase 3**：实现单人站立检测、假玻璃破碎逻辑
- **Phase 3.5**：实现多人站立检测、拥挤机制（第 3 人踏上真玻璃时随机挤掉 1 人）
- **Phase 3.6**：实现视觉差异材质切换（根据 GS_Sacrifice.CanObserve）

---

## 组件结构

```
BP_GlassPanel
└── Scene
    ├── SM_Bed (StaticMeshComponent)
    │   ├── Static Mesh: 根据 IsLeft 动态设置（Construction Script）
    │   ├── Collision: Custom（凸包碰撞）
    │   └── Simulate Physics: false
    ├── BP_Glass (ChildActorComponent, Class = BP_Glass)
    │   └── BP_Glass（破碎效果 Actor，包含多个预制碎片）
    └── BoxTrigger (BoxComponent)
        ├── Collision: OverlapAllDynamic
        ├── Generate Overlap Events: true
        └── Hidden In Game: true
```

**说明**：
- `SM_Bed`：病床床架，使用 Construction Script 根据 IsLeft 变量动态设置左右床架模型
- `BP_Glass`：破碎效果组件，使用 ChildActorComponent 加载 BP_Glass
- `BoxTrigger`：玩家站立检测体积，略大于玻璃区域

**设计意图**：
- 用一个 SM_Bed 组件 + IsLeft 变量动态切换左右病床模型，简化组件结构
- 使用预制碎片实现破碎效果，避开 Geometry Collection 的复杂配置
- 职责分离：BP_Glass 只负责破碎效果，BP_GlassPanel 负责游戏逻辑

---

## 变量

| 变量名 | 类型 | 默认值 | 复制 | 说明 | 实现阶段 |
|--------|------|--------|:----:|------|:--------:|
| `IsLeft` | 布尔 | false | ✅ | 是否使用左侧床架（true=左，false=右） | ✅ Phase 2 |
| `BedSMs` | Map<整数, UStaticMesh*> | - | ❌ | 床架模型映射表（0=Left, 1=Right） | ✅ Phase 2 |
| `IsReal` | 布尔 | false | ✅ | 是否为真玻璃（true=真，false=假） | ✅ Phase 2 |
| `IsMid` | 布尔 | false | ✅ | 是否为中点玻璃（用于触发观察系统切换） | ✅ Phase 2 |
| `StandPlayers` | TArray\<BP_Character_Game*\> | - | ❌ | 当前站立的玩家列表 | ✅ Phase 2（Phase 3 使用） |
| `SM_Bed` | UStaticMeshComponent* | - | ❌ | 床架组件引用（UE 自动生成） | ✅ Phase 2 |
| `BP_Glass` | UChildActorComponent* | - | ❌ | 破碎效果组件引用（UE 自动生成） | ✅ Phase 2 |
| `BoxTrigger` | UBoxComponent* | - | ❌ | 检测体积组件引用（UE 自动生成） | ✅ Phase 2 |
| `RealGlassMaterial` | UMaterialInstance* | - | ❌ | 真玻璃材质实例 | ❌ Phase 3.6 |
| `FakeGlassMaterial` | UMaterialInstance* | - | ❌ | 假玻璃材质实例 | ❌ Phase 3.6 |
| `UnifiedGlassMaterial` | UMaterialInstance* | - | ❌ | 统一玻璃材质实例（无差异） | ❌ Phase 3.6 |

**网络配置说明**：
- `IsReal`：需要复制（客户端需要知道真假类型用于视觉差异）
- `IsLeft`：需要复制（客户端 Construction Script 需要正确的值来设置床架模型）
- `IsMid`：需要复制（客户端需要知道是否为中点玻璃，用于触发观察系统切换）
- `StandPlayers`：不复制（仅服务端维护，用于承重判定）
- `BedSMs`：不复制（仅用于 Construction Script，编辑器配置）

---

## 函数

### OnPlayerEnter (Phase 3)

**实现状态**：❌ 未实现

**调用时机**：BoxTrigger 的 OnComponentBeginOverlap 事件

**参数**：
- `Player`：ACharacter*，进入的玩家

**逻辑**（仅服务端执行）：
```
1. Cast to BP_Character_Game
2. 检查是否已在 StandPlayers 中（避免重复添加）
3. Add to StandPlayers
4. Call CheckCrowding()
5. (Phase 3.6) 判断是否为中点玻璃：
   - 如果 IsMid == true，且 GS_Sacrifice.CanObserve == true：
     - Call GS_Sacrifice.SwitchToSecondHalf()
```

---

### OnPlayerExit (Phase 3)

**实现状态**：❌ 未实现

**调用时机**：BoxTrigger 的 OnComponentEndOverlap 事件

**参数**：
- `Player`：ACharacter*，离开的玩家

**逻辑**（仅服务端执行）：
```
1. Remove from StandPlayers
```

---

### CheckCrowding (Phase 3/3.5)

**实现状态**：❌ 未实现

**调用时机**：OnPlayerEnter 后调用

**逻辑**（仅服务端执行）：
```
Phase 3（假玻璃破碎）：
1. If IsReal == false:
   - Call BreakGlass()
   - 踏上的玩家触发坠落（通过 Kill Volume）

Phase 3.5（拥挤机制）：
2. If IsReal == true AND StandPlayers.Num() > 2:
   - 随机选择 1 人（从 StandPlayers 中）
   - 对选中的玩家施加向下的冲量（模拟被挤掉）
   - 被挤掉的玩家触发坠落（通过 Kill Volume）
```

---

### BreakGlass (Phase 3)

**实现状态**：❌ 未实现

**调用时机**：CheckCrowding 检测到假玻璃被踏上时调用

**逻辑**（仅服务端执行）：
```
1. Multicast_BreakGlass()（广播破碎事件到所有客户端）
2. Disable Collision（SM_Bed 和 BoxTrigger）
3. Delay 2.5s（等待碎片掉落）
4. Destroy Actor
```

---

### Multicast_BreakGlass (Phase 3)

**实现状态**：❌ 未实现

**类型**：Multicast RPC

**调用时机**：由 BreakGlass 调用，广播到所有客户端

**逻辑**（服务端和所有客户端执行）：
```
1. 获取 GlassActor.ChildActor（Cast to BP_Glass）
2. 调用 BP_Glass.BreakGlass()（启用碎片物理模拟）
3. 播放破碎音效（3D 空间音效）
```

**说明**：
- Multicast RPC 确保服务端和所有客户端都播放破碎效果
- BP_Glass 的破碎效果由物理引擎自动处理
- 碎片启用物理模拟后会自然掉落
- 服务端统一管理 Actor 销毁（客户端不需要 Delay）

---

### UpdateVisualDifference (Phase 3.6)

**实现状态**：❌ 未实现

**调用时机**：由 GS_Sacrifice.OnCanObserveChanged 事件触发

**参数**：
- `bCanObserve`：布尔，是否可观察

**逻辑**（客户端执行）：
```
1. 获取 GlassActor.ChildActor（Cast to BP_Glass）
2. If bCanObserve == true:
   - If IsReal: Call BP_Glass.UpdateMaterial(RealGlassMaterial)
   - Else: Call BP_Glass.UpdateMaterial(FakeGlassMaterial)
3. Else:
   - Call BP_Glass.UpdateMaterial(UnifiedGlassMaterial)
```

**说明**：
- 材质设置由 BP_Glass.UpdateMaterial 函数负责，保持职责分离
- BP_GlassPanel 只负责判断逻辑，不直接访问 BP_Glass 的内部组件

---

## 事件

### BeginPlay (Phase 2)

**实现状态**：❌ 未实现

**逻辑**：
```
1. （Phase 2 暂时为空）
2. （Phase 3 绑定 BoxTrigger 的 Overlap 事件）
3. （Phase 3.6 绑定 GS_Sacrifice.OnCanObserveChanged 事件）
```

**说明**：Phase 2 只创建函数框架，不需要缓存组件引用（UE 已自动创建变量）

---

### OnComponentBeginOverlap (Phase 3)

**实现状态**：❌ 未实现

**触发条件**：BoxTrigger 检测到玩家进入

**逻辑**：
```
Call OnPlayerEnter(OverlappedActor)
```

---

### OnComponentEndOverlap (Phase 3)

**实现状态**：❌ 未实现

**触发条件**：BoxTrigger 检测到玩家离开

**逻辑**：
```
Call OnPlayerExit(OverlappedActor)
```

---

## 碰撞配置

### SM_Bed 碰撞响应

| 通道 | 响应 | 说明 |
|------|:----:|------|
| 所有通道 | 阻挡 | BlockAllDynamic 预设 |

**说明**：使用 BlockAllDynamic 预设，玩家可以站立在床架上。

### BP_Glass 碎片碰撞响应

| 通道 | 响应 | 说明 |
|------|:----:|------|
| 所有通道 | 阻挡 | BlockAllDynamic 预设 |

**说明**：
- 破碎前：碎片拼成完整玻璃，物理模拟禁用，玩家可以站立
- 破碎后：碎片启用物理模拟，受重力影响掉落
- 床架的碰撞也会被禁用（通过 `SetCollisionEnabled(NoCollision)` 控制）

### BoxTrigger 碰撞响应

| 通道 | 响应 | 说明 |
|------|:----:|------|
| Pawn | 重叠 | 检测玩家进入/离开 |
| PawnBlock | 重叠 | 检测穿过 StartLine 的玩家 |
| 其他 | 忽略 | - |

---

## 网络架构

**服务端权威**：
- 真假玻璃类型由服务端设置（IsReal）
- 承重判定由服务端执行（CheckCrowding）
- 破碎触发由服务端决定（BreakGlass）

**客户端表现**：
- 通过 Multicast RPC 同步破碎效果（Multicast_BreakGlass）
- 播放破碎特效和音效
- 通过 GS_Sacrifice.CanObserve 切换视觉差异

---

## 相关文档

- [BP_GlassPair.md](BP_GlassPair.md) - 双排玻璃板（父 Actor）
- [BP_GlassBridge.md](BP_GlassBridge.md) - 玻璃桥生成器
- [GS_Sacrifice.md](../../架构/GS_Sacrifice.md) - GameState（CanObserve 变量）
- [Comp_Character_Sacrifice.md](../../架构/Comp_Character_Sacrifice.md) - Character 组件（CurrentGlassPanel 引用）
- [总体策划.md](../../总体策划.md) - 关卡5总体策划
- [场景组件.md](../场景组件.md) - 场景组件索引
- [Volumetric Glass 参考.md](../../../../参考文档/Plugins/Volumetric%20Glass%20参考.md) - 玻璃材质插件
- [BP_Glass.md](BP_Glass.md) - 破碎效果 Actor（预制碎片）

