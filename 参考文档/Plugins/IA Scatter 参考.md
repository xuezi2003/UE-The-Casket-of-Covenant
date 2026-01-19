# IA Scatter 插件参考文档

> **来源**: 从 `BP_ia_scatter` 蓝图类提取的变量说明

---

## Ia Scatter (主控制)

| 变量 | 类型 | 说明 |
|------|------|------|
| `ia scatter on/off` | bool | 开关 ia scatter |
| `refresh ia scatter` | bool | 刷新 ia scatter，当场景发生变化需要重新计算时使用 |
| `seed` | int32 | ia scatter 随机种子 |
| `randomize seed` | bool | 将随机种子设为随机数 |
| `instance type` | E_spawnOptions | 选择实例化对象类型 |
| `mesh` | FF_ia_meshActorScale[] | 选择静态网格/Actor、初始缩放和相对概率 |
| `number of instances` | int32 | 设置期望的实例数量 |
| `display less instances` | bool | 显示比设定数量更少的实例（用于调试） |
| `display static mesh proxies` | bool | 显示代理网格替代原始静态网格 |
| `use hierarchical instances` | bool | 使用分层实例，适合带 LOD 的静态网格（Nanite 网格不需要） |
| `no tracing` | bool | 不计算追踪，在追踪起点直接生成实例 |
| `execute ia scatter at runtime` | bool | 运行时执行 ia scatter |
| `randomize seed at runtime` | bool | 运行时随机化种子 |
| `refresh ia scatter every frame` | bool | 每帧刷新，用于过场动画中 Sequencer 动画参数或动画表面 |
| `runtime execution delay` | double | 运行时执行延迟 |

---

## Ia Scatter Distribution (分布)

| 变量 | 类型 | 说明 |
|------|------|------|
| `distribution method` | E_tracingOptions | 选择实例分布方法 |
| `ia scatter area` | FVector | ia scatter 区域大小，用于点、线、面分布方法 |
| `external spline source` | AActor* | 使用外部 Actor 的样条线进行样条分布 |
| `add spline rotation` | E_rotationOptions | 将样条线旋转应用到实例 |
| `fixed instance distance along spline` | double | 沿样条线的固定实例间距 |
| `trace length` | double | 从样条线计算追踪的最大距离 |
| `spline left` | bool | 在样条线左侧生成实例 |
| `spline right` | bool | 在样条线右侧生成实例 |
| `limit spline instance loops` | bool | 限制样条线实例循环为 1 |
| `trace complex` | bool | 追踪时使用复杂碰撞 |
| `ignore self` | bool | 忽略实例化对象的自身碰撞 |
| `overlapping` | E_overlappingOptions | 重叠检测方法 |
| `min distance between instances` | double | 实例之间的最小距离 |
| `add instance size` | bool | 将实例大小加入最小距离计算 |
| `attract towards center` | bool | 吸引实例向 ia scatter 区域中心靠拢 |
| `slope min` | double | 分布最小坡度 |
| `slope max` | double | 分布最大坡度 |

### 重叠检测方法（Overlapping Detection Method）详解

| 方法 | 检测原理 | 适用场景 | 注意事项 |
|------|----------|----------|----------|
| **Method 1** | 从追踪原点发射半径为 `min distance between instances` 的**球体射线**。如果球体碰到已存在的实例，则取消生成。 | 通用场景，需要精确避开已有物体。 | 如果实例没有启用碰撞，可能需要开启 `trace complex` 选项。**不支持 ignore self 选项**。 |
| **Method 2** | 每个实例放置一个半径为 `min distance between instances` 的**碰撞球**。新生成点如果碰到这个球，则取消生成。 | **树木等植被**——只需要树干不重叠，树枝和树叶重叠无所谓。 | **不支持 ignore self 选项**。配合 `location grid snap` 使用效果更好。 |
| **Method 3** | **最精确**的重叠检测方法，基于实际网格体形状检测。 | 需要高精度检测的场景（如紧密排列的道具）。 | **仅支持 Static Mesh**。`min distance between instances` 应设为 **0**，然后微调。 |

**选择建议**：
- 障碍物是 **BP 蓝图类**，有碰撞 → **Method 1**
- 障碍物是 **树木/植被**，允许枝叶穿插 → **Method 2**
- 障碍物是 **Static Mesh**，需要高精度 → **Method 3**

---

## Ia Scatter Location (位置)

| 变量 | 类型 | 说明 |
|------|------|------|
| `random location min` | FVector | 随机实例位置最小值 |
| `random location max` | FVector | 随机实例位置最大值 |
| `random distance from face min` | float | 随机实例距离表面（沿法线）最小值 |
| `random distance from face max` | float | 随机实例距离表面（沿法线）最大值 |
| `location grid snap` | double | 将生成位置对齐到此大小的网格（配合重叠检测方法 2 使用） |
| `spread` | float | 在样条线或网格周围展开实例 |
| `offset` | double | 在样条线（向下）分布中偏移实例 |
| `relation to face` | E_faceRelation | 与表面的关系（轴心点在网格中心时效果更好） |

---

## Ia Scatter Rotation (旋转)

| 变量 | 类型 | 说明 |
|------|------|------|
| `align to normal` | bool | 对齐到追踪表面法线 |
| `look at target` | FVector | 注视目标位置（可图形化设置） |
| `instance look at` | E_rotationOptions | 对实例应用注视目标旋转 |
| `random rotation min` | FVector | 随机实例旋转最小值 |
| `random rotation max` | FVector | 随机实例旋转最大值 |

---

## Ia Scatter Scale (缩放)

| 变量 | 类型 | 说明 |
|------|------|------|
| `scale falloff` | bool | 基于与追踪起点距离使用实例缩放衰减 |
| `random uniform scale min` | double | 随机实例均匀缩放最小值 |
| `random uniform scale max` | double | 随机实例均匀缩放最大值 |
| `random non uniform scale min` | FVector | 随机实例非均匀缩放最小值 |
| `random non uniform scale max` | FVector | 随机实例非均匀缩放最大值 |

---

## Ia Scatter Instance Inheritance (实例继承)

| 变量 | 类型 | 说明 |
|------|------|------|
| `instances collision type` | ECollisionEnabled::Type | 散布后设置实例碰撞类型 |
| `instances physical material` | UPhysicalMaterial* | 对所有实例应用选定的物理材质 |
| `instances cast shadow` | bool | 启用/禁用实例投射阴影 |
| `instances cast contact shadow` | bool | 启用/禁用实例投射接触阴影 |
| `instance Start Cull Distance` | int32 | 实例开始剔除距离 |
| `instance End Cull Distance` | int32 | 实例结束剔除距离 |
| `instances tags` | FName[] | 对所有实例应用选定的标签 |

---

## Ia Scatter Special Behavior (特殊行为)

| 变量 | 类型 | 说明 |
|------|------|------|
| `actors to ignore form trace` | AActor*[] | 追踪时忽略的 Actor（追踪穿透） |
| `ignore all except tagged:ia_ignoreNot` | bool | 忽略所有 Actor，除了带 "ia_ignoreNot" 标签的 |

---

## Ia Scatter Clustering (聚类)

| 变量 | 类型 | 说明 |
|------|------|------|
| `clustering` | bool | 开启/关闭聚类 |
| `Ignore Overlapping Detection` | bool | 聚类时忽略重叠检测 |
| `cluster instance number` | int32 | 每个聚类中的实例数（注意：会与"实例数量"相乘） |
| `cluster spread` | double | 聚类实例展开量 |
| `clustering detection angle` | float | 聚类检测角度 |

---

## Ia Scatter Surface Curvature (表面曲率)

| 变量 | 类型 | 说明 |
|------|------|------|
| `surface curvature` | E_ConvexOptions | 根据表面曲率选择 ia scatter 行为 |
| `surface curvature spread` | double | 区域检测的展开范围 |

---

## Ia Scatter Voxelization (体素化)

| 变量 | 类型 | 说明 |
|------|------|------|
| `Static Mesh Actor` | AStaticMeshActor* | 选择用于体素化的静态网格 |
| `Grid Resolution` | int32 | 体素化网格分辨率 |
| `tessellation (tvox)` | int32 | 应用于体素化结果的细分级别 |

---

## Ia Scatter Texture (Beta) (纹理)

| 变量 | 类型 | 说明 |
|------|------|------|
| `use texture` | bool | 使用纹理进行实例投影（低性能） |
| `texture` | UTexture* | 设置用于实例投影的纹理 |
| `threshold` | double | 阈值 |
| `texture resolution` | int32 | 设置纹理分辨率，避免 >2048 |
| `texture channel` | E_TextureChannel | 选择用于实例投影的纹理通道 |
| `invert texture` | bool | 反转纹理 |

---

## Ia Scatter Instance Source (Beta)

| 变量 | 类型 | 说明 |
|------|------|------|
| `override instance source` | bool | 使用实例源替代网格结构 |

---

## Ia Scatter Cables (电缆)

| 变量 | 类型 | 说明 |
|------|------|------|
| `enable cables` | bool | 启用电缆 |
| `cable material` | UMaterialInterface* | 电缆材质 |
| `connect to look at target` | bool | 连接到注视目标 |
| `cable collision` | bool | 电缆碰撞 |

---

## Ia Scatter Debug (调试)

| 变量 | 类型 | 说明 |
|------|------|------|
| `unlock number of instances / distance` | bool | 使用网格分布时，解锁实例数量和间距（location grid snap） |

---

## 项目实践

- [IAScatter布局.md](../../关卡设计/01-耐力之匣/场景/IAScatter布局.md) - L_Endurance 关卡中的 IA Scatter 实例配置
