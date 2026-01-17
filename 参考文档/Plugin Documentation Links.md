# 插件文档链接

## GAS Companion
- **官方文档**: https://gascompanion.github.io/
- **Fab 商店**: https://www.fab.com/listings/20d07b00-e7ba-4c5d-8ec0-aab6a79b908a
- **用途**: GAS 系统核心框架（ASC 挂载、技能、属性、输入绑定）

### GSCUserWidget / GSCUWHud（UI 系统）

> **文档来源**: https://gascompanion.github.io/working-with-ui/

#### 类继承关系

```
UUserWidget
└── GSCUserWidget（基础类，提供 ASC 交互能力）
    └── GSCUWHud（HUD 专用，提供自动绑定 + 事件 API）
```

#### GSCUWHud 自动绑定 Widgets

使用 `meta=(BindWidgetOptional)` 实现，只需在 Widget 中创建**同名控件**即可自动绑定：

| 控件名称 | 类型 | 自动绑定属性 |
|----------|------|--------------|
| `HealthProgressBar` | Progress Bar | Health / MaxHealth |
| `StaminaProgressBar` | Progress Bar | Stamina / MaxStamina |
| `ManaProgressBar` | Progress Bar | Mana / MaxMana |
| `HealthText` | Text | Health 数值文本 |
| `StaminaText` | Text | Stamina 数值文本 |
| `ManaText` | Text | Mana 数值文本 |

> **注意**：自动绑定仅限 GSCAttributeSet 中的默认属性。自定义属性（如 SpeedRate）需使用 Exposed Events 手动处理。

#### Exposed Events（事件驱动 API）

GSCUserWidget / GSCUWHud 提供以下可覆盖事件：

| 事件 | 触发时机 | 用途 |
|------|----------|------|
| `OnAttributeChange` | 任意属性变化 | 自定义属性 UI 更新 |
| `OnGameplayTagChange` | Gameplay Tag 变化 | 状态指示器（力竭、失衡等） |
| `OnGameplayEffectAdded` | GE 添加到 ASC | Buff/Debuff 图标显示 |
| `OnGameplayEffectRemoved` | GE 从 ASC 移除 | Buff/Debuff 图标隐藏 |
| `OnGameplayEffectTimeChange` | GE 持续时间刷新 | 倒计时 UI 更新 |
| `OnCooldownStart` | 技能冷却开始 | 冷却 UI 显示 |
| `OnCooldownEnd` | 技能冷却结束 | 冷却 UI 隐藏 |

#### 核心函数

| 函数 | 说明 |
|------|------|
| `InitializeWithAbilitySystem()` | 初始化 ASC 绑定，设置事件委托 |
| `SetOwnerActor(Actor)` | 设置/更新 Owner Actor 和 ASC 缓存 |

#### 使用建议

1. **通用 HUD**：继承 `GSCUWHud`，利用自动绑定 + Exposed Events
2. **自定义 Widget**：继承 `GSCUserWidget`，完全手动处理
3. **BindWidget 规则**：控件名必须**完全匹配**（区分大小写）

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

