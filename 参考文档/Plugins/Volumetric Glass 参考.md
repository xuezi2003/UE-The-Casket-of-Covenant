# Volumetric Glass 参考

> **官方文档**: https://imaginaryblend.com/2018/12/30/volumetric-glass/  
> **Marketplace**: https://www.unrealengine.com/marketplace/en-US/product/volumetric-glass  
> **Fab**: https://www.fab.com/listings/dad47d76-0a70-45fe-b9e8-1be166292499

---

## 概述

### 插件简介

Volumetric Glass 是一个高级且高效的主材质系统，专为渲染体积效果和玻璃而设计。该插件在质量和效率之间达到了完美平衡，专为移动端、VR 和风格化 PC/主机游戏优化。

### 核心特性

- **双材质系统**：水下体积（Glass Volume）和形状玻璃（Glass Shape）
- **极致性能**：仅 150 条指令，GPU 友好，支持移动端和 VR
- **多种形状**：盒体、球体、椭圆、圆柱、自定义网格
- **丰富参数**：70+ 可调参数（光轴、体积效果、散射、玻璃颜色、雾密度等）
- **高级功能**：动画裁切平面、基于样条线的隧道蓝图、快速盒体投影反射
- **多通道光照**：自定义多通道点光源系统
- **易于集成**：可与其他水面系统（如 Aquatic Surface）集成

### 适用场景

- **科幻环境**：水箱、实验室玻璃容器、体积雾效果
- **水下场景**：水族馆、水下隧道、潜水艇窗户
- **风格化游戏**：需要高效体积渲染的移动端/VR 游戏

---

## 快速开始

### 两种材质类型对比

插件提供两种专门用于不同场景的材质：

| 材质类型 | 路径 | 用途 | 适用场景 |
|---------|------|------|---------|
| **Glass Volume** | `Materials/M_GlassVolume` | 从流体体积**内部**渲染玻璃 | 水下窗户、隧道（从水内观察） |
| **Glass Shape** | `Materials/M_GlassShape` | 从流体体积**外部**渲染形状 | 水箱、体积雾（从外部观察） |

> **重要提示**：使用前必须先创建**材质实例（Material Instance）**。右键点击材质 → 选择 "Create Material Instance"。

### 基础使用流程

**Glass Shape 快速上手**：
1. 选择形状网格（如 `Package/Meshes/SM_Box`）并放置在场景中
2. 基于 `M_GlassShape` 创建材质实例
3. 在材质实例的 **Shape** 选项卡中选择形状类型
4. 设置 **Reflection Texture** 立方体贴图（参见"反射捕捉"章节）
5. 应用材质到网格

**Glass Volume 快速上手**：
1. 在场景中放置 `BP_GlassVolume` 蓝图（代表雾气体积形状）
2. 基于 `M_GlassVolume` 创建材质实例并设置参数
3. 将材质应用到玻璃网格上

> **注意**：体积仅通过使用 `M_GlassVolume` 材质的玻璃网格可见。

---

## Glass Shape（外部体积渲染）

### 使用场景

- 科幻风格水箱和容器
- 环境体积雾效果
- 从外部观察的体积物体

### 网格要求

- **统一尺寸**：100cm × 100cm × 100cm
- **轴心位置**：中心
- **缩放方式**：通过 Actor 属性缩放
- **示例网格**：`Package/Meshes` 文件夹

### 形状类型

| 形状 | 说明 |
|------|------|
| **Box** | 盒体形状 |
| **Sphere** | 球体形状 |
| **Ellipse** | 椭圆形状 |
| **Cylinder** | 圆柱形状 |
| **UseShapedMesh** | 自定义网格模式（用于不规则形状的近似渲染） |

> **自定义形状说明**：对于角色道具或定制元素，由于几何不兼容，无法直接使用标准形状。可使用 `UseShapedMesh` 模式为未定义的形状提供近似渲染。

---

### 参数配置

#### 基础参数

| 参数 | 说明 |
|------|------|
| **Use Fog Exp2** | 使用指数雾（true）或线性雾（false） |
| **Fog Base** | 雾效果的基础深度 |
| **Fog Density** | 雾效果的密度 |
| **Fog Color** | 深层雾的颜色 |
| **Use Wet Color** | 启用湿润颜色功能 |
| **Wet Color** | 应用于形状内部几何体的颜色乘数 |
| **Use Translucency** | 是否激活半透明效果 |

---

#### 裁切平面表面

裁切平面表面是通过动画流体表面填充的裁切几何体效果，可用于模拟水面波动。

| 参数 | 说明 |
|------|------|
| **Use Shape Clip Plane** | 是否激活裁切平面效果 |
| **Shape Clip Plane** | 裁切平面方程（RGB=法线，A=位移） |
| **Use Surface Normal Map** | 使用表面法线贴图 |
| **Surface Normal Map Texture** | 用作法线贴图的纹理 |
| **Surface Normal Map UV** | 两层法线贴图动画的 UV 缩放和位移<br>• R 通道：第 1 层缩放<br>• B 通道：第 2 层缩放<br>• G 通道：第 1 层移动<br>• A 通道：第 2 层移动 |
| **Surface Normal Scale** | 归一化前的表面法线 Z 值乘数，控制波浪高度 |
| **Surface Normal Flatness** | 表面法线平坦度，控制波浪高度 |
| **Use Surface Normal Scale** | 是否使用 Flatness 或 Scale |
| **Use Clip Plane Reflection** | 允许使用裁切平面反射效果 |
| **Use Water Line** | 允许在玻璃上渲染水线（实验性功能） |

---

#### 照明系统

系统支持多种照明方法，可以单独使用或组合使用。只有单个光源可以影响玻璃，可以是点光源或定向光。

**光源类型选择**：
- **Use Directional Light = True**：使用定向光
- **Use Directional Light = False**：使用点光源

**通道模式**：
- **Use Channel = true**：从全局设置读取光照值
  - 定向光：`Materials/UtilsPC_VolumetricGlass DirLightChannel0`
  - 点光源：`Materials/UtilsPC_VolumetricGlass PointLightChannel0-2`
  - 点光源通道可通过关卡中的 `BP_ScatteringLight` 蓝图控制
- **Use Channel = false**：从材质的局部变量读取光照值

| 参数 | 说明 |
|------|------|
| **Diffuse Power** | 漫反射光照颜色 |
| **Light Color** | 体积内部的光照颜色 |
| **Use Directional Light** | 是否使用定向光或点光源 |
| **Light Direction** | 定向光方向。向量长度改变衰减 |
| **Light Location** | 点光源位置（相对于 Actor）。Alpha 通道包含衰减 |
| **Use Light Color Edge** | 使用光照颜色作为形状边缘。形状将在深度上变亮。深度比例可在 Light Color 参数的 alpha 通道中更改 |
| **Use Channel 0/1/2** | 选择将哪个通道用作全局点光源 |

---

#### 散射效果

| 参数 | 说明 |
|------|------|
| **Use Lighting** | 是否激活光照和散射效果 |
| **Scattering Ambient** | 散射环境光值 |
| **Scattering Depth** | 散射深度比例 |
| **Scattering Depth Block** | 体积内网格深度阻挡的散射 |
| **Scattering Distortion** | 体积内散射中的光照扭曲 |
| **Scattering Power** | 体积内散射效果的指数幂 |
| **Scattering Scale** | 体积内散射效果的比例 |

---

#### 反射设置

反射效果基于预渲染的立方体贴图。Volumetric Glass 支持两种反射映射类型：

**反射映射类型**：
1. **球面反射（Spherical Reflections）**：速度极快但不精确
2. **盒体投影映射（Box Projection Mapping）**：在矩形房间内非常精确

**盒体投影映射参数**：

| 参数 | 说明 |
|------|------|
| **UseBoxProjection** | 允许使用盒体投影映射。如果禁用，则使用标准球面立方体贴图投影 |
| **ReflectionBoxExtend** | 反射贴图中缓存的房间的一半大小 |
| **ReflectionBoxPosition** | 捕捉反射的相机位置 |
| **UseReflectionBoxLocal** | 强制系统在 Actor 位置的局部空间中使用反射盒捕捉。当网格连接到与反射捕捉组件相同的 Actor 时很有用 |

**其他反射参数**：

| 参数 | 说明 |
|------|------|
| **ReflectionTexture** | 预烘焙的立方体贴图反射纹理，应在渲染玻璃的位置缓存 |
| **ReflectionColor** | 反射颜色，允许调整立方体贴图以适应水下条件。Alpha 通道表示菲涅尔强度 |
| **Use Shlick Reflection** | 启用基于物理的 Schlick 菲涅尔计算。否则使用快速简化的 dot(camera, normal) 菲涅尔 |

---

#### 玻璃表面

Volumetric Glass 材质支持高级玻璃表面配置。玻璃表面在体积之前渲染，可以遮挡后面的物体。

| 参数 | 说明 |
|------|------|
| **Glass Color** | 玻璃网格的颜色（带半透明） |
| **UseGlassTexture** | 允许使用玻璃纹理而不是纯色 |
| **GlassTexture** | 当 UseGlassTexture = true 时使用的玻璃纹理 |
| **UseGlassTextureColor** | 玻璃纹理颜色乘数 |
| **GlassTextureU** | 在 U 轴上缩放玻璃纹理 |
| **GlassTextureV** | 在 V 轴上缩放玻璃纹理 |
| **UseGlassTexturVertexAlpha** | 使用顶点颜色 alpha 通道作为玻璃纹理的乘数（破碎玻璃效果） |

---

## Glass Volume（内部体积渲染）

### 使用场景

- 水下窗户和隧道（从水内观察）
- 潜水艇玻璃
- 需要从内部观察的体积效果

### 使用要点

- 必须先放置 `BP_GlassVolume` 蓝图定义体积形状
- 体积仅通过使用 `M_GlassVolume` 材质的玻璃网格可见
- 适合表现从水内观察外部世界的效果

---

### 参数配置

#### 基础参数

| 参数 | 说明 |
|------|------|
| **Use Fog Exp2** | 使用指数雾（true）或线性雾（false） |
| **Fog Base** | 雾效果的基础深度 |
| **Fog Density** | 雾效果的密度 |
| **Fog Color** | 深层雾的颜色 |
| **Fog Scattering Clamp** | 最大散射强度 |
| **Fog Scattering Scale** | 散射颜色效果的比例配置 |
| **Fog Scattering Shift** | 散射颜色效果的偏移配置 |
| **Fog Scattering Width** | 散射颜色效果的宽度配置 |

---

#### 光轴效果

Glass Volume 材质支持简化优化的光轴效果（Light Shafts），可用于表现水下光线效果。

| 参数 | 说明 |
|------|------|
| **UseLightShaft** | 激活光轴效果 |
| **LightShaftTexture** | 用作光轴的纹理 |
| **LightShaftColor** | 散射中的光轴颜色 |
| **LightShaftIntensity** | 光轴效果的强度 |
| **LightShaftDistance** | 光轴效果距相机的距离 |
| **LightShaftPosition** | 移动光轴时的相机位置比例 |
| **LightShaftSpeed** | 光轴动画速度 |

---

## 高级功能

### 隧道样条线（Tunnel Spline）

`BP_TunelSplineActor` 是用于创建水下隧道的附加蓝图，基于样条线系统。

**使用方法**：
1. 在场景中放置 `BP_TunelSplineActor`
2. 设置参数
3. 按住 Alt 键并拖动样条点可快速复制样条点

**参数说明**：

| 参数 | 说明 |
|------|------|
| **Static Mesh** | 用于管道的循环网格 |
| **Forward Axis** | 网格的前向轴 |
| **Translucency Sort Priority** | 网格渲染的优先级。可以修复一些半透明 bug |

---

### 反射捕捉（Capture Reflections）

Volumetric Glass 系统基于从场景中捕捉的立方体贴图渲染反射。这是一种非常高效的方法，但需要手动捕捉。

**捕捉步骤**：

1. **放置捕捉 Actor**：在地图上放置 `Blueprints/BP_SceneCaptureCube` 并设置好捕捉位置
   - 房间中心通常是最佳位置

2. **找到渲染目标**：在 `Material/Textures` 中找到渲染目标 `RT_SceneCapture`

3. **创建静态纹理**：右键点击 `RT_SceneCapture` 并选择 **"Create Static Texture"**
   - 生成的静态纹理即可用于材质的 **ReflectionTexture** 参数

---

### 多通道光照系统

系统支持通过 `BP_ScatteringLight` 蓝图控制多个点光源通道（Channel 0-2）。

**使用方法**：
1. 在关卡中放置 `BP_ScatteringLight` 蓝图
2. 选择要使用的通道（0-2）
3. 在材质中启用对应的 **Use Channel** 参数

**全局设置位置**：
- 定向光：`Materials/UtilsPC_VolumetricGlass DirLightChannel0`
- 点光源：`Materials/UtilsPC_VolumetricGlass PointLightChannel0-2`

---

## 最佳实践

### 性能优化

- **指令数**：材质仅 150 条指令，非常高效
- **移动端/VR**：专门优化，可直接用于移动端和 VR 项目
- **反射捕捉**：使用预烘焙立方体贴图而非实时反射，大幅提升性能
- **形状选择**：标准形状（Box、Sphere）性能最优，自定义网格模式性能略低

### 常见问题

**Q: 体积不可见？**
- 确认使用了正确的材质类型（Glass Volume 需要 `M_GlassVolume`）
- 确认已放置 `BP_GlassVolume` 蓝图（仅 Glass Volume 需要）
- 检查材质实例参数是否正确设置

**Q: 反射效果不正确？**
- 确认已正确捕捉反射立方体贴图
- 检查 **ReflectionBoxPosition** 和 **ReflectionBoxExtend** 参数
- 尝试切换 **UseBoxProjection** 参数

**Q: 自定义形状渲染不正确？**
- 使用 **UseShapedMesh** 模式
- 确认网格尺寸为 100cm × 100cm × 100cm，轴心在中心
- 通过 Actor 属性缩放而非修改网格尺寸

### 集成建议

- **与水面系统集成**：可与 Aquatic Surface 等水面系统配合使用
- **裁切平面**：使用裁切平面功能可实现动态水面效果
- **光照配合**：配合场景光照使用多通道光照系统，实现更丰富的视觉效果

---

## 相关链接

- **官方文档**: https://imaginaryblend.com/2018/12/30/volumetric-glass/
- **Marketplace**: https://www.unrealengine.com/marketplace/en-US/product/volumetric-glass
- **Fab**: https://www.fab.com/listings/dad47d76-0a70-45fe-b9e8-1be166292499
