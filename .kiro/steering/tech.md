# 技术栈

## 引擎与框架

- Unreal Engine 5（C++ 与蓝图混合架构）
- Dedicated Server 联网模式
- GAS (Gameplay Ability System) 技能框架

## 核心插件

| 插件 | 用途 |
|------|------|
| GAS Companion | ASC 挂载、技能、属性、输入绑定 |
| Blueprint Attributes | 蓝图 AttributeSet (BAS_Core) |
| Logic Driver Lite | 状态机重构（计划中，当前使用 UE5 State Tree） |
| iTween | 程序化动画、Tween 效果 |
| SDF Robo Progress Bars | QTE 环形进度条 |
| Path Tracer Toolkit | 投掷轨迹预测线渲染（Spline 路径可视化） |

## 架构模式

- 状态树驱动关卡流程 (ST_LevelFlow_Main)
- GM 配置驱动：各关卡通过 GameMode 子类配置组件、行为树、技能集
- 输入映射：每关卡独立 IMC，包含通用 + 专属输入

## 网络架构

- 数据同步：PlayerState 复制属性，GAS 自动同步
- 权限模型：逻辑判定在 DS，表现在客户端
- 无缝切换：ServerTravel 保留 PlayerState
