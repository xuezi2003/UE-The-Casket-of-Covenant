# 技术栈

## 引擎与框架

- **引擎**: Unreal Engine 5
- **网络架构**: Dedicated Server 模式
- **无缝切换**: 启用 Seamless Travel（关卡间保留 PlayerState）

## 核心插件

| 插件 | 用途 | 文档 |
|------|------|------|
| GAS (Gameplay Ability System) | 技能与属性管理 | [GAS Documentation](https://github.com/tranek/GASDocumentation) |
| GSC (GAS Companion) | GAS 模块化扩展，挂载在 PlayerState | [官方文档](https://gascompanion.github.io/) |
| Blueprint Attributes | 蓝图属性系统，AttributeSet 蓝图化 | [官方文档](https://blueprintattributes.github.io/docs) |
| Target System | 玩家锁定/视线检测（木偶监视等） | [GitHub Wiki](https://github.com/mklabs/ue4-targetsystemplugin/wiki) |
| Advanced Sessions | 高级会话管理（Steam 集成） | [GitHub](https://github.com/mordentral/AdvancedSessionsPlugin) / [论坛](https://forums.unrealengine.com/t/advanced-sessions-plugin/30020) |
| State Tree | 游戏流程状态管理 | UE5 内置 |
| Behavior Tree | AI 行为控制 | UE5 内置 |
| PCG (Procedural Content Generation) | 场景/道具随机生成 | UE5 内置 |

## 数据驱动

- **Gameplay Tags**: 管理游戏阶段与状态（见 `GameplayTags.csv`）
- **Data Table**: 外观贴图路径、数字贴图等
- **Ability Set**: 每关卡独立技能集配置

## 设计原则

### 插件优先原则

**实现功能时优先考虑已有插件，再考虑原生实现！**

1. 先查阅插件文档，确认是否已有现成方案
2. 评估插件方案与原生方案的优劣
3. 优先使用插件以减少重复造轮子

### 类职责分离原则

- 各核心类职责要分清楚
- 通用逻辑尽量抽离到父类（Core 层）
- 关卡特化逻辑放在子类
- 避免在子类中重复实现父类已有功能

### 操作/变量设计检查清单

设计任何操作或变量时，必须同时明确：

1. **事件 vs 函数**：明确选择事件或函数，说明是否需要蓝图重写或多播
2. **网络复制**：明确变量的 Replicated 设置、复制条件、OnRep 回调
3. **RPC 设置**：明确 Server/Client/Multicast 类型及 Reliable/Unreliable
4. **真人/AI 兼容**：确保逻辑同时适用于真人和 AI，优先统一处理

### 关键设计模式

- **档案驱动实体 (Record-Driven Architecture)**: GameInstance 存储数据，PlayerState/Character 表现状态
- **事件驱动**: OnRep 复制 + 事件分发器广播状态变化
- **虚函数扩展**: 父类定义流程，子类重写具体实现（如 GetSpawnPos）

## 文档语言

- 所有设计文档使用中文编写
- 代码注释和变量命名使用英文
