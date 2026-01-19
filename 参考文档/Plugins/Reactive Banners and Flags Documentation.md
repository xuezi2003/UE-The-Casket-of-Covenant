# Reactive Banners and Flags 文档 (UE 5.2.0)

本文档提供了 "Reactive Banners and Flags" 插件的概览和自定义指南。

---

## 1. 快速入门：风力设置 (Wind Setup)
本资源包中的横幅和旗帜已预先配置了布料物理 (Cloth Physics)。要查看它们的动态效果：
1. **放置到关卡中**：只需将骨架网格体 (Skeletal Mesh) 拖放到场景中。
2. **添加风力**：
   - 使用 UE5 的 **快速添加 (Quick Add)** 按钮或 **放置执行器 (Place Actors)** 面板。
   - 搜索 **"Wind Directional Source"** (风向源)。
   - 将其拖入关卡。
   - 在风向源的细节面板中调整 **Speed (速度)** 和 **Strength (强度)**，即可看到横幅做出反应。

---

## 2. 调整对风力的反应
如果横幅反应过于强烈（飘得太乱）或过于微弱：
1. **打开网格体**：导航至 `BannersAndFlags/Meshes` 并打开相应的骨架网格体。
2. **布料选项卡 (Clothing Tab)**：选择布料数据集 (Clothing Data Set)。
3. **布料配置 (Cloth Configs)**：展开 `ChaosClothConfig` -> `Environmental Properties` (环境属性)。
4. **重力缩放 (Gravity Scale)**：
   - **数值较低 (如 0.1)**：使横幅对风力反应 **非常强烈**（感觉变轻）。
   - **数值较高 (如 2.0)**：使横幅感觉更 **沉重**，对风力反应较弱。
   - 默认值通常为 `1.0`。

---

## 3. 自定义视觉效果
主要有三种方式可以改变外观：

### A. 应用默认材质
每个网格体有两个材质槽：**Element 0 (Cloth/布料)** 和 **Element 1 (Pole/杆子)**。
- 以 `_C_Inst` 结尾的材质用于布料。
- 以 `_P_Inst` 结尾的材质用于杆子。
- 在网格体编辑器的 **资源细节 (Asset Details)** 选项卡中更改这些设置将影响使用该网格体的所有实例。

### B. 特定实例的材质
在关卡中选择一个执行器 (Actor)，直接在 **细节 (Details)** 面板中更新材质。这只会更改该特定实例，而不会影响全局网格体设置。

### C. 创建新的材质实例
建议 **复制 (Duplicate)** 现有的材质实例（例如从 `BannersAndFlags/Materials` 目录下），然后修改参数，而不是直接编辑主材质 (Master Materials)。

---

## 4. 材质参数指南
`M_Dbl_RectPnt_01_C_Inst` (及类似材质) 提供了多个自定义组：

### 布料设置 (Cloth Settings)
- **Cloth Image Texture (布料图像纹理)**：旗帜设计的主要纹理（漫反射）。
- **Layer 01 Color (图层 01 颜色)**：为基础纹理着色。
- **Cloth Value (布料数值)**：整体亮度/增益。
- **Cloth Fuzz Intensity (布料细毛强度)**：调整织物的“桃皮绒”着色器效果。
- **Desaturation Fraction (去饱和度分数)**：使颜色褪色（看起来像老化或久经日晒的布料）。

### 腐蚀设置 (Corrosion Settings - 脏迹/生锈外观)
- **Corrosion Mask 01/02 (腐蚀遮罩)**：定义污垢/锈迹出现位置的灰度纹理。
- **Corrosion Color (腐蚀颜色)**：设置污垢的颜色（如泥土用棕色，铁锈用橙色）。
- **Corrosion Strength (腐蚀强度)**：效果的整体强度。

### 损坏设置 (Damage Settings - 磨损/撕裂外观)
- **Damage Mask Texture (损坏遮罩纹理)**：决定孔洞和撕裂的图案。
- **Damage Strength (损坏强度)**：控制材质根据遮罩溶解的程度。

### 湿润设置 (Wetness Settings)
- **Wetness Mask Texture (湿润遮罩纹理)**：定义潮湿区域（白色=湿，黑色=干）。
- **Wetness Color (湿润颜色)**：使材质变暗以模拟受潮。
- **Wetness Strength (湿润强度)**：控制光泽度和变暗效果。

---

## 5. 自定义布料纹理 (旗帜模板)
要创建自定义设计：
1. **定位模板**：在 Windows 资源管理器中导航至插件文件夹 (`Content/BannersAndFlags/Flag Templates`)。
2. **UV 指南**：在图像编辑器（如 Photoshop、GIMP）中使用提供的 PNG UV 模板作为参考。
3. **匹配网格体**：确保使用的模板与网格体名称匹配（例如 `SK_BannerMast` 对应 `UV_BannerMast`）。
4. **导入**：将完成的纹理导入 UE，并将其分配给材质实例的 **Cloth Image Texture** 插槽。

---

## 6. 性能优化
如果物理效果导致场景变慢：
1. **碰撞厚度 (Collision Thickness)**：
   - 位于 `ChaosClothConfig` -> `Collision Properties`。
   - 默认值为 `1.0`。降低该值可提高性能，但可能导致穿模 (Clipping)。
2. **自碰撞 (Self Collisions)**：
   - 禁用 **Use Self Collisions** (在 Collision Properties 中) 可显著提高性能。
3. **模拟设置 (Simulation Settings)**：
   - 位于 `ChaosClothSharedSimConfig` -> `Simulation`。
   - **Iteration Count / Max Iteration Count (迭代次数)**：降低这些数值可提高性能，但布料稳定性会变差（可能下垂或穿模）。
   - **Subdivision Count (细分计数)**：较低的数值计算更快，但不够平滑。

---

## 7. UE 5.2+ 兼容性
由于 UE 5.2 中的材质更新变化：
- 某些材质超过了 **纹理采样器数量 (Texture Sampler Count)** 限制。
- **修复方案**：部分材质现在共享一个采样器用于 **基础粗糙度 (Base Roughness)** 和 **基础金属度 (Base Metallic)**，以节省采样器插槽。这不会改变默认实例的视觉效果。

---

## 8. 支持
如有进一步疑问，请联系：`support@tijgergames.com`
