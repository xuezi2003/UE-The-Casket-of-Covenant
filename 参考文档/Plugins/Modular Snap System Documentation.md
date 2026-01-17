# Modular Snap System (MSS) 插件文档

**插件来源**：[Inu Games](https://inu-games.com/2020/02/20/modular-snap-system-documentation/)
**适用版本**：UE4/UE5
**用途**：模块化建筑自动吸附系统

**快速链接**：
- **Marketplace**：搜索 "Modular Snap System"
- **支持论坛**：[MSS Support Forum](https://forums.unrealengine.com/unreal-engine/marketplace/1482720-mss-modular-snap-system-plugin)
- **教程视频**：[YouTube 播放列表](https://www.youtube.com/playlist?list=PLP-uPWYCiCCHC3mwRFldle-o5XnrBcxpC)

---

## 工作原理

### 基本原理
MSS 插件通过查找 Actor 中的 Socket（也称为"吸附点"）来对齐 Actor。当你在关卡编辑器中移动或旋转一个或多个 Actor 后，插件会：

1. **搜索源 Socket**：查看所有被移动 Actor 中定义的 Socket（称为源 Socket）
2. **查找目标 Socket**：在关卡中的其他 Actor 中搜索匹配的 Socket（目标 Socket）  
3. **执行吸附**：如果找到匹配的 Socket 对，将移动和旋转源 Actor，使源和目标 Socket 在世界空间中具有相同的位置和方向

### 重要说明
- **默认不附加**：移动的 Actor 默认不会附加到匹配的 Socket
- **组件支持**：适用于任何可包含 Socket 的组件（静态网格、骨骼网格、样条等）
- **Actor 类型**：拥有这些组件的 Actor 可以是任何类或蓝图
- **碰撞要求**：MSS 使用碰撞查询，所有相关组件必须定义并启用简单碰撞

### 参数访问
- **编辑器工具栏**：关卡编辑器工具栏 "Settings" 菜单
- **项目设置**："Plugins" 部分的项目设置
- **配置文件**：参数保存在 `EditorPerProjectUserSettings.ini` 配置文件中

---

## 搜索规则 (Search Rules)

### 源 Actor 识别

插件会根据选择情况识别源 Actor：

1. **选中一个或多个 Actor**：考虑这些 Actor 组件的所有 Socket
2. **选中 Actor 的特定组件**：仅考虑选中的组件
3. **移动样条端点**：将端点视为 Socket，使用样条组件名作为 Socket 名

### 关键参数设置

- **Source/Target Component Classes**：只考虑指定类型的组件，其他组件会被忽略
- **Snap Attached Too**：是否考虑附加到选中 Actor 的其他 Actor
- **"nosnap" tag**：在组件标签列表中添加此标签可隐藏组件，插件将忽略它

### Socket 匹配条件

插件通过以下三个条件判断 Socket 是否匹配：

#### 1. 距离匹配
- **SearchDist 参数**：定义每个源 Socket 周围的搜索半径
- 插件在此半径内进行球形碰撞查询

#### 2. 角度匹配
- **MaxAngle 参数**：源和目标 Socket 的前向量（X轴，红色箭头）应基本相对
- `MaxAngle = 0°`：前向量必须完全相对
- `MaxAngle = 180°`：前向量可以是任意方向
- **默认值**：75°

#### 3. 名称匹配
- **命名格式**：`SnapPointName_TheRest`
- 只比较第一个下划线前的部分（`SnapPointName`）
- `_TheRest` 部分为可选，搜索时被忽略
- **不区分大小写**
- **示例**：`Socket`、`Socket_0`、`Socket_XYZ_123` 可以互相吸附
- 可通过 `bIgnoreSocketName` 参数禁用名称匹配

#### 4. 极性系统
- **正极性**：`Door+`
- **负极性**：`Door-`  
- **中性**：`Door`
- **匹配规则**：
  - `Door+` 匹配 `Door-`
  - `Door` 匹配 `Door+` 和 `Door-`
  - `Door+` 不匹配 `Door+`
  - `Door-` 不匹配 `Door-`
- **极性位置**：在下划线前指定，如 `Door+_1`

### 特殊功能

#### Snap Open Only
- 在源或目标 Socket 周围进行额外检查，确保未被阻挡
- 使用球形追踪检测，半径由 `OpenCheckRadius` 参数控制（默认 2cm）
- 只将 Target Component Classes 中的组件视为阻挡物

#### 样条支持
- 样条组件本身无碰撞，需要其他组件作为碰撞器
- 可配合 SplineMeshComponent 或添加小球形碰撞组件
- 相应的类需添加到 Target Component Classes 列表中

#### ISM 支持（2021年3月起）
- 需将 `InstancedStaticMeshComponent` 添加到源/目标类设置中
- 必须在 ISM 组件碰撞设置中启用 "Multi Body Overlap"

---

## 吸附规则 (Snap Rules)

### 参数定义位置
- **全局设置**：在插件设置中定义
- **Socket 参数**：在 Socket 名称的 `_TheRest` 部分定义
- 可通过 `IgnoreSocketParams` 设置忽略 Socket 参数

### 旋转控制

#### 旋转步长参数
- **格式**：`_RXn`、`_RYn`、`_RZn`（n为角度）
- **示例**：`Window_RX180`

#### 旋转逻辑
- 默认情况下会旋转源 Actor 使源 Socket 与目标 Socket 对齐
- 旋转步长允许按指定角度增量对齐而非完全对齐
- **角度含义**：
  - `0°`：保持世界旋转，不应用旋转吸附
  - `180°`：可以完全对齐或翻转 180°
  - `360°`：完全对齐到目标 Socket

#### 默认旋转设置
- **DefaultRotSnap**：`RX=90°, RY=360°, RZ=360°`
- 含义：源 Socket YZ 平面与目标 YZ 平面完全对齐，但可围绕 X 轴以 90° 增量旋转

### 缩放控制

#### 缩放参数
- **格式**：`_SXn`、`_SYn`、`_SZn`（n为0或1）
- **示例**：`Window_SX0_SY0_SZ0`
- **值含义**：
  - `1`：启用该轴缩放匹配
  - `0`：禁用该轴缩放匹配

#### 注意事项
- 缩放应用于源 Actor，使其匹配目标缩放
- 建议要么完全禁用，要么所有 3 轴都启用
- 非均匀缩放可能产生奇怪结果，谨慎使用

### 附加功能

#### AttachToParent
- 当 `AttachToParent` 为 true 时，MSS 会将移动的 Actor 附加到目标 Actor 的父级
- 适用于将多个 Actor "分组" 到一个根 Actor 下

#### Snap to Pivot
- 启用后，选择枢轴（变换控件）会移动到最后的吸附点
- 枢轴位置变化是临时的，选择改变时会恢复正常
- 便于围绕吸附点而非原点旋转已吸附的 Actor

#### No Snap Back
- 如果源 Socket 的新变换与旧变换近似相等，插件会中止吸附操作
- 容差由 `NoSnapbackTolerance` 参数指定

#### 附加到目标 Socket (`_A` 参数)
- 默认情况下移动的 Actor 不会附加到匹配的 Actor
- 当目标 Socket 有 `_A` 参数时会自动附加
- **骨骼网格**：源 Actor 附加到目标 Socket，可随骨架移动
- **静态网格**：源始终附加到组件本身
- 可通过 `bAttachToSocket` 参数禁用

#### 忽略样条 Socket 缩放
- 将 Actor 附加到样条端点时忽略端点缩放
- 样条端点缩放通常与普通 Actor 缩放意义不同

---

## 工具功能

### Export/Import Sockets Tool

#### 功能说明
- 批量导出/导入多个静态网格的 Socket 定义到文本文件
- 支持跨文件夹选择网格（使用内容浏览器过滤器）

#### 使用方法
1. 在内容浏览器中选择静态网格
2. 右键点击选择 "Snap System" 子菜单（Asset Actions 部分）
3. 选择操作：
   - **Export**：将选中资产的 Socket 写入文本文件
   - **Import**：从文本文件读取并添加/修改匹配的 Socket
   - **Delete**：删除选中资产的所有 Socket

#### 文件格式
```
StaticMesh /Game/Meshes/SomeMesh S SomeSocket 0.0,-25.0,0.0|0.0,-90.0,0.0|1.0,1.0,1.0 S OtherSocket 0.0,25.0,0.0|0.0,90.0,0.0|1.0,1.0,1.0
```

格式说明：
- `StaticMesh /路径/网格名`：资产完整路径
- `S Socket名`：Socket 定义开始
- `位置|旋转|缩放`：变换信息，用管道符分隔

#### 智能导入
- 可处理资产移动到其他文件夹的情况
- 会尝试找到同名且路径最相似的资产
- 会询问用户确认

---

## 编辑器集成

### Socket 编辑
在 UE4/UE5 中直接编辑静态网格的 Socket：
1. 双击静态网格资产打开编辑器
2. 在 Socket 面板中添加/编辑 Socket
3. 设置正确的位置、旋转和名称
4. 按照 MSS 命名规则设置 Socket 名称

### 支持论坛
如有问题或建议，请访问：[MSS 官方支持论坛](https://forums.unrealengine.com/unreal-engine/marketplace/1482720-mss-modular-snap-system-plugin)

---

## 使用建议

### 适用场景
- **模块化建筑**：墙体、柱子、门窗等组件的精确对接
- **管线系统**：管道、电缆等需要精确连接的系统
- **道具组装**：武器配件、机械部件等复杂组装

### 最佳实践
1. **Socket 命名**：使用清晰的命名约定，合理利用极性系统
2. **参数设置**：根据项目需求调整搜索距离、角度容差等参数
3. **组件类型**：正确配置源和目标组件类型列表
4. **批量操作**：使用 Export/Import 工具提高多资产的 Socket 设置效率

### 性能考虑
- 合理设置搜索距离，避免过大范围的碰撞查询
- 使用 "nosnap" 标签排除不需要吸附的组件
- 在复杂场景中考虑使用 Snap Open Only 功能

---

## 相关链接

- **官方文档**：https://inu-games.com/2020/02/20/modular-snap-system-documentation/
- **插件作者**：Inu Games (Stan)
- **YouTube 频道**：https://www.youtube.com/channel/UCA5vCqJ9jlPIGQapKIMrsjw
- **Twitter**：[@games_inu](https://twitter.com/games_inu)
- **ArtStation**：https://inugames.artstation.com/
- **itch.io**：https://inugames.itch.io/
- **UE Marketplace**：搜索 "Modular Snap System"

### 相关文章
- [Modular Snap System v1.3 released](https://inu-games.com/2018/09/17/mss-v1-3/)
- [Modular Snap System Plugin for UE4](https://inu-games.com/2018/08/30/modular-snap-system-plugin-for-ue4/)
