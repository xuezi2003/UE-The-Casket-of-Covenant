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
| Logic Driver Lite | 状态机（关卡流程、红绿灯等） |
| iTween | 程序化动画、Tween 效果 |
| SDF Robo Progress Bars | QTE 环形进度条 |

## 架构模式

- 状态树驱动关卡流程 (ST_LevelFlow_Main)
- GM 配置驱动：各关卡通过 GameMode 子类配置组件、行为树、技能集
- 输入映射：每关卡独立 IMC，包含通用 + 专属输入

## 网络架构

- 数据同步：PlayerState 复制属性，GAS 自动同步
- 权限模型：逻辑判定在 DS，表现在客户端
- 无缝切换：ServerTravel 保留 PlayerState

## **开发规范**

- 严格遵循联网开发范式：数据同步、网络延迟、权限授权
- 禁止编写临时 Demo 代码，所有代码必须是最终实现
- 使用插件功能前必须查阅官方文档，禁止臆造 API
- GameplayTag 修改**必须**需用户确认，并审阅所有引用处
