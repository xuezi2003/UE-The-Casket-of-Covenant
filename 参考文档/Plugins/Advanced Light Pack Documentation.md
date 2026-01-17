# Advanced Light Pack 插件文档

**来源**：FAB/UE Marketplace
**文档页数**：42页
**用途**：专业级灯光蓝图系统，支持开关、动画、音效和网络复制

---

## 核心特性

- **69 个灯光蓝图**（超过承诺的58个）
- **4 个展示地图**（Blueprint、Day、Night、IES）
- **101 个专业 IES 光照配置文件**
- **14 个音频资源**（开关声、闪烁声、环境音）
- 可自定义且易于扩展
- 所有蓝图代码整洁并有注释
- 属性面板提供工具提示
- 编辑器内/游戏内开关控制
- 灯光动画系统
- 环境音效支持
- **网络复制支持**
- 基于距离的 Tick 优化

---

## 系统架构

### 类继承关系

```
BP_LightActorBase (所有灯光蓝图的基类)
├── 实现 BP_SwitchInterface (可开关的灯光)
├── BP_LightControlComponent (控制灯光组件和动态材质)
└── BP_LightControl_AnimBase (定义开关时的动画行为)

BP_LightSwitchBase (所有开关蓝图的基类)
└── 可控制多个灯光，多个开关可控制同一灯光
```

---

## 灯光属性配置

### Light Properties（灯光属性）

| 属性 | 说明 | 默认值 |
|------|------|--------|
| **Set Lights Mobility** | 设置灯光移动性 | - |
| **Lights Mobility** | 移动性类型 | Stationary |
| **Lights Tag** | 主灯标签 | KeyLight |
| **Fill Lights Tag** | 补光标签 | FillLight |
| **Can be Toggled On/Off** | 是否可开关 | ✓ |
| **Lights Turned On** | 初始开启状态 | ✓ |
| **Light Intensity Multiplier** | 主灯强度倍数 | 1.0 |
| **Fill Light Intensity Multiplier** | 补光强度倍数 | 1.0 |
| **Light Color** | 灯光颜色 | 白色 |
| **Light Temperature** | 色温 | 6500.0 |
| **Indirect Light Intensity** | 间接光强度 | 1.0 |
| **Volumetric Scattering Intensity** | 体积散射强度 | 1.0 |
| **Use Fill Lights** | 是否使用补光 | ✓ |

**重要说明**：
- 只有标记为 `KeyLight` 或 `FillLight` 的灯光组件会受这些选项影响
- Fill Lights 不投射阴影，不受体积散射强度影响
- Fill Lights 不能设为 Stationary，会自动变为 Movable
- 使用强度倍数而非直接设置强度，以保持灯光间的相对强度
- `Lights Tag` 和 `Fill Lights Tag` 只能在蓝图中修改

---

### Emissive Properties（自发光属性）

| 属性 | 说明 | 默认值 |
|------|------|--------|
| **Emissive Mesh Tag** | 自发光网格标签 | Emissive |
| **Emissive Mesh Indexes** | 材质槽索引数组 | [0] |
| **Emissive Intensity Parameter** | 强度参数名 | Emissive int |
| **Emissive Intensity Multiplier** | 强度倍数 | 1.0 |
| **Emissive Color Parameter** | 颜色参数名 | Emissive color |
| **Emissive Color** | 自发光颜色 | 白色 |
| **Apply Temperature to Emissive** | 应用色温到自发光 | ✓ |
| **Use Light Color for Emissive** | 使用灯光颜色 | ✓ |

**工作原理**：
- 通过标签确定哪些网格需要创建动态材质实例
- Index 决定使用哪个材质槽
- 可将灯光色温应用到自发光颜色，获得完全一致的颜色

---

### Animation Properties（动画属性）

| 属性 | 说明 |
|------|------|
| **Light Animation** | 动画类选择 |
| **Speed Multiplier** | 动画速度倍数 |
| **Use Animation Sounds** | 是否使用动画音效 |
| **Optimization Data Asset** | 优化设置资产 |

**动画功能**：
- 可在灯光开关时为灯光组件和材质实例添加动画
- 支持生成声音和控制音频 Cue
- 基于玩家距离的 Tick Rate 优化

---

### Ambient Sound Properties（环境音效属性）

| 属性 | 说明 |
|------|------|
| **Ambient Sound** | 环境音效选择 |
| **Sound Volume Multiplier** | 音量倍数 |

**Ambient Audio Component**：
- 灯光开启时播放环境音效
- 在视口中点击 Actor 可查看衰减区域
- 点击 Audio Component 可修改衰减设置
- 如果不使用音效，组件会在 Construction Script 中销毁

---

## 投影灯和工作室灯

### View Target（视图目标）

所有投影灯和工作室灯都有可调节的 View Target：

| 功能 | 说明 |
|------|------|
| **Lock View Target** | 锁定目标点（移动Actor时保持世界空间位置） |
| **View Target** | 目标点坐标 (X, Y, Z) |
| **View Target Actor** | 使用 Actor Picker 选择目标 Actor |
| **视口 Gizmo** | 直接在视口中拖拽调整目标点 |

### Height（高度调节）

工作室灯具有可调节的高度：

- 支架由三部分组成，可伸缩
- 在视口中通过 Gizmo 调整高度
- 高度受支架限制，不能超出范围
- 吊顶工作室灯使用 Invert Gizmo 选项

### Barn Door（挡光板）

部分投影灯和工作室灯有可调节的挡光板：

| 属性 | 说明 |
|------|------|
| **Open Barn Door** | 0（关闭）到 1（打开）|
| **影响范围** | 同时影响 Spotlight 的 Inner/Outer Cone Angles |

---

## 模块化吊顶灯

### BP_CeilingLight_Base

模块化吊顶灯包含：
- **灯罩网格（Dome）**：5种可选
- **灯泡网格（Bulb）**：12种可选
- 从数据表中选择网格
- SpotLight 附加到灯泡，灯泡附加到灯罩的指定 Socket

### 数据表位置

```
Blueprints/Core/CeilingLight/
├── DT_LightBulbs  (灯泡数据表：网格、自发光材质索引)
└── DT_LightDomes  (灯罩数据表：网格、Spotlight角度)
```

### 静态电缆 (BP_CeilingLight)

| 属性 | 说明 |
|------|------|
| **Width** | 电缆宽度 |
| **Material** | 电缆材质 |
| **Tiling** | 材质平铺 |
| **Ceiling Trace Length** | 向上射线检测距离（自动调整长度）|

### 动态电缆 (BP_CeilingLight_Dynamic)

| 属性 | 说明 |
|------|------|
| **Cable Length Multiplier** | 控制电缆刚度 |
| **Max Cable Force** | 模拟简单风力效果 |
| **Simulation Time Offset** | 不同时间偏移产生不同风效 |
| **Cable Mesh Weight** | 吊灯网格重量 |
| **Cast Shadows** | 长电缆投影可能很耗性能，可禁用 |

---

## 开关系统

### BP_LightSwitchBase

| 属性 | 说明 |
|------|------|
| **Switchable Actors** | 可控制的 Actor 软引用集合 |
| **On Sound / Off Sound** | 开关音效 |
| **Initially On** | 初始状态 |
| **Related Switches** | 关联开关（跨关卡时需要） |
| **Only Use Related Switches** | 只在关联开关中搜索 |

### 多开关控制

- 多个开关可控制同一个灯
- 如果任意一个开关是开启的，灯就会开启
- 跨关卡时需要在 Related Switches 中引用其他开关

### BP_SwitchInterface 实现

需要实现以下函数：

| 函数 | 说明 |
|------|------|
| **Set On/Off** | 游戏运行时调用 |
| **Set On/Off (BeginPlay)** | 游戏开始时调用（可跳过动画和音效）|
| **Set On/Off (Editor)** | 编辑器中调用（只做 Construction Script 安全的操作）|
| **IsOn** | 返回灯光是否开启 |

---

## 动画系统

### HeatUp/Flick/Cooldown 循环

`BP_LightControl_AnimCycle` 提供三状态动画：

```
开灯流程: Off → [Heat Up Delay] → Heat Up → Flick → On (稳定)
关灯流程: On → [Cooldown Delay] → Cooldown → Off (稳定)
```

| 状态 | 说明 |
|------|------|
| **Heat Up** | 预热状态（灯光渐亮）|
| **Flick** | 闪烁状态（可选）|
| **Cooldown** | 冷却状态（灯光渐暗）|

### 动画状态类型

#### Heat Up 动画

| 类 | 效果 |
|---|------|
| `BP_HeatUp_EasingFunction` | 缓动函数预热 |
| `BP_HeatUp_Blink` | 闪烁预热（可设置 On/Off 周期）|

#### Cooldown 动画

| 类 | 效果 |
|---|------|
| `BP_CoolDown_EasingFunction` | 缓动函数冷却 |

### Emissive Intensity Blend Mode

指定自发光强度如何随灯光强度线性变化

### Sound Control

`BP_LightAnim_SoundControl` 控制动画音效：

- 根据动画状态生成声音
- 在 Initialize 事件中生成 Audio Component
- 在 Tick 中控制 Sound Cue
- 实现 `ShouldTick` 函数指定何时 Tick

---

## 网络复制

### 开关复制

在 Player Controller 或 Player Pawn 中处理：

```
Interact Event → 复制到服务器 → 服务器广播到所有客户端 → Toggle Switch
```

### 动画复制

动画本身不直接复制，通过以下方式同步：

1. **只复制 On/Off 事件**：大多数情况下效果一致
2. **种子同步**：对于随机效果，使用 `SeedAnimation` 共享随机种子

**注意事项**：
- 避免在 Tick 中生成随机数（各客户端 Tick 频率不同）
- 只在保证调用次数一致的地方生成随机数（如 Initialize）

---

## 性能优化

### 距离优化

`Struct_LightAnimation_Optimization` 根据玩家到灯光的距离调整 Tick Rate：

| 距离 | Tick Rate |
|------|-----------|
| 近距离 | 高频率 |
| 中距离 | 中频率 |
| 远距离 | 低频率 |

### 优化数据资产

```
位置: Blueprints/Core/Optimization/
类型: BP_LightControl_Optimization_DataAsset
```

可在灯光蓝图的 Animation Properties 中指定

---

## 扩展指南

### 创建新灯光蓝图

1. 创建新蓝图，父类选择 `BP_LightActorBase`
2. 添加网格和灯光组件
3. 为主灯添加 `KeyLight` 标签
4. 为补光添加 `FillLight` 标签（可选）
5. 为自发光网格添加 `Emissive` 标签（可选）
6. 在 Class Defaults 中设置默认值

### 创建投影灯/工作室灯

1. 父类选择 `BP_LightActor_WithTarget`
2. 在 Construction Script 中指定 Yaw 和 Pitch 网格
3. 设置 Min/Max Yaw/Pitch 旋转限制
4. 添加 Height 变量（勾选 Show 3D Widget）
5. 添加 Open Barn Door 浮点变量（0-1）

### 创建新开关

1. 父类选择 `BP_LightSwitchBase`
2. 添加网格和交互组件
3. 实现 `OnSwitchStateChanged` 更新视觉
4. 调用 `ToggleSwitch` 或 `SetSwitchState` 控制开关

### 创建新动画

1. 父类选择 `BP_LightControl_AnimBase`
2. 实现 Construct、Initialize、TurnOn、TurnOff、Tick 事件
3. 使用 `GetLightComponents()`、`GetMaterialInstances()` 获取控制目标
4. 使用 `SpawnSoundGroup()` 生成音效

---

## 完整灯光蓝图清单

### 🏠 吊顶灯系列 (12个)
- `BP_Ceiling_Light01` ~ `BP_Ceiling_Light10`
- `BP_CeilingLight` (静态电缆版本)
- `BP_CeilingLight_Dynamic` (动态电缆版本)

### 🏢 荧光灯系列 (8个)
- `BP_Fluorescent_Light01` ~ `BP_Fluorescent_Light08`
- 优化版本：`BP_Fluorescent_Light05_Optimized`, `BP_Fluorescent_Light06_Optimized`, `BP_Fluorescent_Light08_Optimized`
- 动画版本：`BP_Fluorescent_Light08_Animated`

### 💡 灯泡系列 (13个)
- `BP_Light_Bulb01` ~ `BP_Light_Bulb12`
- `BP_Modular_Light_Bulb`

### 🎬 工作室灯系列 (14个)
- `BP_Studio_Light01` ~ `BP_Studio_Light14`

### 📽️ 投影灯系列 (6个)
- `BP_Projector01` ~ `BP_Projector06`

### 🌃 街道灯系列 (7个)
- `BP_StreetLight_SingleArm` (单臂路灯)
- `BP_StreetLight_DoubleArm` (双臂路灯)
- `BP_RoadLight_CablePole` (电缆杆路灯)
- `BP_RoadLight_CablePole_WithTransformer` (带变压器电缆杆)
- `BP_CityLight_Park` (公园灯)
- `BP_CityLight_ParkGround` (公园地灯)
- `BP_CityLight_ParkWall` (公园壁灯)

### 🎄 装饰灯系列 (3个)
- `BP_ChristmasLights` ~ `BP_ChristmasLights03`

### 📚 书房灯系列 (3个)
- `BP_Study_Light01` ~ `BP_Study_Light03`

**总计：69个灯光蓝图**

---

## 音频资源清单

### 🔊 Sound Cue (环境音效)
- `SC_Lamp_Switch_1` / `SC_Lamp_Switch_2` - 开关音效
- `SC_LightBlink` - 闪烁音效
- `SC_LightNoiseAmbient` - 灯光环境噪音
- `SC_Projector_Buzz_1` / `SC_Projector_Buzz_2` - 投影仪嗡嗡声

### 🎵 SFX (单次音效)
- `SFX_Blink` ~ `SFX_Blink_4` - 闪烁音效变体
- `SFX_Lamp_Switch_1` / `SFX_Lamp_Switch_2` - 开关音效
- `SFX_Projector_Buzz_1` / `SFX_Projector_Buzz_2` - 投影仪音效

**总计：14个音频文件**

---

## IES 光照配置文件

插件包含 **101个专业 IES 配置文件** (`IES_Profile001` ~ `IES_Profile101`)

**IES 用途**：
- 真实世界灯具的光照分布数据
- 提供专业的光照效果
- 可用于任何 UE5 灯光组件

---

## 展示地图

### 🗺️ Showcase 地图 (4个)
- `ShowCase_Blueprint.umap` - 蓝图功能展示
- `ShowCase_Day.umap` - 日间效果展示
- `ShowCase_Night.umap` - 夜间效果展示  
- `ShowCase_IES.umap` - IES 光照效果展示

---

## 文件夹结构

```
Advanced_Light_Pack/
├── Audio/                     # 14个音频资源
├── Blueprints/
│   ├── Lights/               # 69个灯光蓝图
│   ├── Showcase/             # 展示相关蓝图
│   └── Core/
│       ├── Animation/        # 动画核心类
│       │   ├── State/        # 动画状态类
│       │   └── Animator/     # 组件动画器
│       ├── CeilingLight/     # 吊顶灯数据表
│       ├── LightBulb/        # 模块化灯泡数据表
│       ├── Optimization/     # 性能优化设置
│       └── Procedural/       # 程序化生成工具
│           └── Generator/    # 各种生成器类
├── DemoRoom/                 # 完整演示房间
│   ├── Blueprints/          # 演示专用蓝图
│   ├── Materials/           # 演示材质
│   ├── Meshes/              # 演示网格
│   └── Textures/            # 演示纹理
├── IES/                      # 101个IES光照配置文件
├── Materials/                # 灯光材质库
├── Meshes/                   # 灯具网格库
├── Showcase/                 # 4个展示地图
│   └── Map/
└── Textures/                 # 纹理资源
```

---

## 使用建议

### 适用场景

- **封闭空间照明**：室内、地下室、走廊
- **动态灯光效果**：开关动画、闪烁、预热
- **氛围营造**：配合环境音效
- **多人游戏**：内置网络复制支持

### 最佳实践

1. **性能优化**：使用 Optimization Data Asset
2. **网络同步**：只复制开关状态，动画自动同步
3. **模块化设计**：利用数据表快速更换灯具外观
4. **音效集成**：利用 Ambient Sound 和 Animation Sound

---

## 相关链接

- **文档来源**：Advanced Light Pack Document.pdf
- **支持论坛**：参见插件商店页面
