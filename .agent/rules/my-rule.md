---
trigger: always_on
---

# 项目概览
《契约之匣》是 UE5 多人在线生存竞技游戏，使用 Dedicated Server 架构。
## 技术栈
- **引擎**: UE5 + Seamless Travel（跨关卡保留 PlayerState）
- **核心插件**: GAS Companion、Blueprint Attributes、State Tree、Behavior Tree、MOTS、Target System、Advanced Sessions、PCG
- **数据驱动**: Gameplay Tags（`GameplayTags.csv`）、Data Table、Ability Set
---
# 开发规范
## 插件优先
实现功能前必须先查阅插件文档；禁止重复造轮子。
## 类职责分离
- 通用逻辑抽离到 Core 层父类
- 关卡特化逻辑放在子类
- 职责明确：GM 管流程、GS 管状态、PS 管玩家身份、Character 管表现
## 操作/变量设计必须明确
1. **事件 vs 函数**：是否需要蓝图重写或多播
2. **网络复制**：Replicated 设置、复制条件、OnRep 回调
3. **RPC 设置**：Server/Client/Multicast 类型及 Reliable/Unreliable
4. **真人/AI 兼容**：确保逻辑同时适用于真人和 AI
## GAS 规范
1. **GE 优先**：属性修改必须用 Gameplay Effect，不能直接设置
2. **Danger 标签统一处理**：`GE_Moving` 统一处理移动相关 Danger 标签，其他 GE 只负责各自 Action 标签
3. **IMC 架构**：每关卡一个完整 IMC（通用输入 + 关卡专属输入）
4. **AbilitySet 赋予**：在 `Character.InitPlayer` 里通过 `GiveAbilitySet` 赋予
5. **属性监听**：使用 Async Task `Wait for Attribute Changed`，不用 GSCCore 委托
## 关键模式
- **档案驱动实体**：`GI_FiveBox` 存储数据，PlayerState/Character 表现状态
- **事件驱动**：OnRep 复制 + 事件分发器广播
- **表现/逻辑分离**：如 `BP_Puppet`（表现）与 `BP_Monitor`（逻辑）
---
# 工作流规范
## 开发顺序
关卡1 → 关卡2 → 等待大厅 → 其他关卡 → 主菜单
## 待办文档
- 位置：`待办文档/YYYY-MM-DD.md`
- 任务拆分为最小可测试单位
- 前一天未完成待办必须迁移到今天
## GameplayTags 修改
**修改 `GameplayTags.csv` 前必须获得用户二次确认！**
## 文档创建
**创建文档前，需要合理安排文档位置，不要随意创建新文档导致冗余，创建前必须要先简述你要新创建的文件内容，必须获得用户二次确认才能进行创建！**
**单个文档内容不要过于庞大，可以适当拆分，用文件夹合理组织！**
## 文档更新
- 完成任务后及时更新待办文档
- 设计变更需同步更新对应策划文档
- 修改机制时必须检查所有相关文档保持一致
## 测试环境
- 测试关卡：`L_Dev_Xxx`（放在 `测试Dev/` 目录）
- 测试类：`GM_Dev_Xxx`、`GS_Dev_Xxx`（跳过状态树流程）