# 插件文档链接

## GAS Companion
- **官方文档**: https://gascompanion.github.io/
- **Fab 商店**: https://www.fab.com/listings/20d07b00-e7ba-4c5d-8ec0-aab6a79b908a
- **用途**: GAS 系统核心框架（ASC 挂载、技能、属性、输入绑定、UI 与 AI 集成）
- **详细指南**: [GAS Companion Documentation](./Plugins/GAS Companion Documentation.md)

---

## Blueprint Attributes
- **官方文档**: https://blueprintattributes.github.io/
- **Fab 商店**: https://www.fab.com/listings/c43dd85f-c52a-4fd4-8db8-63c1f4e58e79
- **用途**: 蓝图 AttributeSet（`BAS_Core`）

---

## Logic Driver Lite
- **官网**: https://logicdriver.com
- **官方文档**: https://logicdriver.com/docs/
- **Fab 商店**: https://www.fab.com/listings/c2db80f4-4cdb-47cf-9c87-c5989a00adfd
- **用途**: 状态机重构（计划中）
- **当前状态**: 已完成迁移，`SM_LevelFlow_Main`、`SM_Endurance` 使用 Logic Driver Lite 状态机
- **最佳实践**: [Logic Driver Lite API 参考](./Plugins/Logic Driver Lite API 参考.md)

### Lite 版本支持的功能
- 基础 FSM（状态、转换、条件）
- 网络复制（ActorComponent）
- 嵌套状态机 / 状态机引用
- Any State（全局转换）
- 事件驱动转换（自动/手动绑定）
- On State Update（每帧执行）
- 蓝图调试支持

---

## iTween
- **Wiki 文档**: https://unrealcommunity.wiki/itween-z2xdb3w1
- **论坛帖子**: https://forums.unrealengine.com/t/open-beta-procedural-on-the-fly-animation-in-ue4-itween/10472
- **Fab 商店**: https://www.fab.com/listings/a1dd1f2a-61a8-4f3a-a94e-3e94b88c7d01
- **用途**: 程序化动画、平滑插值、Tween 效果

### 核心功能
- Float/Vector/Rotator From/To
- UMG RenderTransform 动画
- 30+ 种 EaseTypes（Quadratic, Elastic, Bounce 等）
- Loop Types: Once / PingPong / Rewind
- OnStart / OnUpdate / OnComplete 委托

### 常用参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `floatfrom` / `floatto` | Float 起止值 | `floatfrom=0; floatto=360;` |
| `time` | 持续时间（秒） | `time = 2;` |
| `looptype` | 循环类型 | `loop = pingpong;` |
| `easetype` | 缓动类型 | `ease = ioquad;` |

---

## SDF Robo Progress Bars
- **官方文档**: https://imaginaryblend.com/2018/06/26/sdf-robo-progress-bars/
- **Fab 商店**: https://www.fab.com/listings/59e7553a-5800-4757-ab63-0f0d2726f050
- **用途**: QTE 系统环形进度条

### 核心用法
1. 添加 Image Widget
2. 设置 Brush → Image = MI_UmgCircleBar
3. 创建动态材质实例
4. 设置 Progress 参数 (0.0-1.0)

### 材质层级
- **Outline layer**: 外轮廓
- **Shape layer**: 形状层
- **Progress layer**: 进度层（核心）
- **Pattern layer**: 图案层

---

## Path Tracer Toolkit
- **说明书**: [Path_Tracer_Documentation.pdf](./Plugins/Path_Tracer_Documentation.pdf)
- **用途**: 替代 HISM 的投掷轨迹线渲染（支持圆角、实线、小球虚线等多种模式）
- **核心组件**: `BP_PathTracer`
- **核心函数**: `Draw Path` (接收 Vector Array)

---

## Fresh Cooked Tweens
- **说明书**: [Fresh Cooked Tweens](./Plugins/Fresh Cooked Tweens.md)
- **用途**: 高性能 C++/Blueprint Tween 动画库
- **核心功能**:
    - 轻量级 (Header-only based)
    - 支持 C++ Lambda
    - 丰富的 Easing 函数 (Bounce, Elastic etc.)
    - Blueprint Async Task 支持

---

## OutlineMaker
- **说明书**: [OutlineMaker - Documentation](./Plugins/OutlineMaker - Documentation.md)
- **用途**: 高性能描边材质解决方案
- **Web Store**: [Unreal Engine Marketplace](https://www.unrealengine.com/marketplace/en-US/slug/outline-maker)
- **核心功能**:
    - 可定制的各个部分（颜色、辉光、粗细）
    - 自定义 "Pulse" 脉冲效果
    - 正确的深度计算
    - 预设支持 (Presets)

---

## IA Scatter
- **Fab 商店**: https://www.fab.com/listings/ia-scatter
- **用途**: 轻量级物体散布工具（障碍物、道具随机分布）
- **API 参考**: [IA Scatter 参考](./Plugins/IA Scatter 参考.md)

### 核心功能
- 多种分布方法（点、线、面、样条线）
- 追踪到表面（自动贴合地面）
- 随机位置/旋转/缩放
- 聚类生成
- 重叠检测
- 支持 Static Mesh 和 Blueprint Actor

---

## EasyMapper
- **Fab 商店**: https://www.fab.com/listings/easymapper
- **作者**: William Faucher
- **用途**: 世界对齐纹理投影（Triplanar）、Nanite 位移、顶点混合

### 核心功能
- **世界对齐投影**：无需 UV，自动投影纹理到模型表面
- **Nanite 位移/细分**：支持 Nanite 的 Tessellation/Displacement
- **顶点混合**：最多混合 3 种材质，带高度遮罩实现自然过渡
- **快速贴图**：整个关卡一键贴图，无需逐模型处理 UV

### 使用方法

1. 在 `Content/EasyMapper/Materials/Masters` 文件夹中找到 `M_EasyMapper_MASTER` 材质
2. 右键 → 创建 Material Instance
3. 在 Material Instance 中调整参数

> [!IMPORTANT]
> **不要修改 Master Material**，否则可能破坏功能！只修改 Material Instance。

### Master Material 变体

| 材质 | 用途 |
|------|------|
| `M_EasyMapper_MASTER` | 标准版本（ARD 工作流） |
| `M_EasyMapper_MASTER_VT` | 虚拟纹理版本 |
| `M_EasyMapper_MASTER_FAB` | FAB/Megascans 新版本（ORM 工作流） |

### FAB 兼容说明

FAB 集成后，Megascans 纹理工作流发生变化：

| 旧版（ARD） | 新版（ORM） |
|-------------|-------------|
| Ambient Occlusion | Ambient Occlusion |
| Roughness | Roughness |
| **Displacement** | **Metallic** |
| - | Displacement（独立贴图） |

- 使用 FAB 资源时，选择 `M_EasyMapper_MASTER_FAB`
- 原有 ARD 材质仍可用，旧项目不受影响
- 两种材质都支持**禁用 ARD/ORM 工作流**，使用自定义独立贴图

---

## Modular Snap System (MSS)
- **官方文档**: https://inu-games.com/2020/02/20/modular-snap-system-documentation/
- **UE Marketplace**: 搜索 "Modular Snap System"
- **支持论坛**: https://forums.unrealengine.com/unreal-engine/marketplace/1482720-mss-modular-snap-system-plugin
- **作者**: Inu Games (Stan)
- **用途**: 模块化建筑自动吸附系统，Socket 精确对接
- **详细指南**: [Modular Snap System Documentation](./Plugins/Modular Snap System Documentation.md)

### 核心功能
- **Socket 自动匹配**：基于名称、距离、角度的智能吸附
- **精确变换控制**：支持旋转步长、缩放匹配
- **极性系统**：正极(+)/负极(-)/中性 Socket 匹配规则
- **批量工具**：Export/Import Sockets Tool，支持多网格批处理
- **高级选项**：AttachToParent、Snap to Pivot、Open Only 检查

### Socket 命名规则
- **基本格式**：`SnapPointName_Parameters`
- **极性示例**：`Door+`、`Door-`、`Door`
- **参数示例**：`Window_RX180_SY0`（X轴旋转180°步长，Y轴禁用缩放）
- **附加参数**：`Socket_A`（自动附加到目标）

### 适用场景
- **模块化建筑**：墙体、门窗、柱子等组件精确对接
- **场景搭建**：`BP_Section_封闭墙`、`BP_Section_中间组件` 等快速组装
- **管线系统**：管道、电缆等需要精确连接的系统

---

## Advanced Light Pack
- **文档来源**：Advanced Light Pack Document.pdf
- **用途**：专业级灯光蓝图系统，支持开关、动画、音效和网络复制
- **详细指南**：[Advanced Light Pack Documentation](./Plugins/Advanced Light Pack Documentation.md)

### 核心特性
- **58 个灯光蓝图**：各类灯具（吊灯、投影灯、工作室灯等）
- **开关系统**：多开关控制，编辑器/游戏内均可使用
- **动画系统**：Heat Up/Flick/Cooldown 三状态动画
- **音效集成**：环境音效 + 动画音效
- **网络复制**：内置多人游戏支持
- **性能优化**：基于距离的 Tick Rate 优化

### 主要类
| 类 | 用途 |
|---|------|
| `BP_LightActorBase` | 所有灯光蓝图基类 |
| `BP_LightSwitchBase` | 所有开关蓝图基类 |
| `BP_LightControlComponent` | 控制灯光和材质 |
| `BP_LightControl_AnimCycle` | 三状态动画控制 |

### 适用场景
- **封闭空间照明**：室内、地下室、走廊
- **动态灯光效果**：开关动画、闪烁、预热
- **多人游戏**：内置网络复制支持

---

## Reactive Banners and Flags
- **说明书**: [Reactive Banners and Flags 中文明档](./Plugins/Reactive Banners and Flags Documentation.md)
- **用途**: 高性能、高度可定制的物理布料（旗帜、横幅）系统。
- **核心功能**:
    - **物理反馈**: 自动响应风力（Wind Directional Source）。
    - **材质深度定制**: 支持腐蚀（Corrosion）、破损（Damage）、湿润（Wetness）等动态效果。
    - **性能优化**: 可调节碰撞厚度、迭代次数及自碰撞开关。
    - **自定义纹理**: 提供 UV 模板，支持通过外部图像编辑器创建自定义旗帜图案。
- **UE 5.2 更新内容**: 优化了采样器使用，解决了 UE 5.2+ 材质采样器上限问题。

---

## Unreal Engine Behavior Tree（官方文档）
- **官方文档**: https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview
- **用途**: UE 原生 AI 行为树系统
- **详细指南**: [UE Behavior Tree 参考](./Plugins/UE Behavior Tree 参考.md)

### 核心特性

- **事件驱动架构**：不是每帧检查，而是被动监听事件触发
- **执行顺序**：从左到右、从上到下执行
- **Decorator**：条件装饰器，决定分支或节点是否可执行
- **Service**：定期执行更新，替代传统 Parallel 节点
- **Observer Aborts**：监听值变化并中断执行

### 重要限制

1. **Root 节点限制**: Root 节点不支持添加 Decorator 和 Service，必须添加在子节点上
2. **Root 直接子节点限制**: Root 的直接子节点上的 Decorator 也会被忽略！必须在 Root 和逻辑节点之间添加中间层（Sequence 或 Selector）
3. **Random Decorator**: UE 没有内置 Random Decorator，需要自定义创建
4. **Check Gameplay Tag Condition**: 不支持 Observer Aborts 参数，Gameplay Tag 变化会自动触发重新评估

### 参考链接

- **Node Reference**: https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-node-reference-in-unreal-engine
- **Quick Start Guide**: https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---quick-start-guide

---

## Volumetric Glass
- **官方文档**: https://imaginaryblend.com/2018/12/30/volumetric-glass/
- **Marketplace**: https://www.unrealengine.com/marketplace/en-US/product/volumetric-glass
- **Fab**: https://www.fab.com/listings/dad47d76-0a70-45fe-b9e8-1be166292499
- **用途**: 高级体积与玻璃材质系统（水箱、水下窗户、科幻实验室、体积雾）
- **详细指南**: [Volumetric Glass 参考](./Plugins/Volumetric Glass 参考.md)

### 核心功能
- **双材质系统**: 
    - `M_GlassVolume`: 内部体积渲染（从水内观察窗口、隧道）
    - `M_GlassShape`: 外部形状渲染（水箱、体积雾、科幻容器）
- **极致性能**: 仅 150 条指令，GPU 友好，专为移动端/VR 优化
- **多种形状**: 支持盒体、球体、椭圆、圆柱、自定义网格
- **反射捕捉**: 基于 Scene Capture 的高效立方体贴图反射（支持盒体投影）
- **高级效果**: 光轴、散射、动画裁切平面、多通道点光源
- **样条线隧道**: `BP_TunelSplineActor` 用于创建水下隧道

