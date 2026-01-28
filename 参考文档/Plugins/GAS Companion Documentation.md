# GAS Companion 插件文档

> **官方文档**: https://gascompanion.github.io/  
> **用途**: GAS 系统核心框架，提供蓝图友好的 GAS 开发环境

---

## 一、核心功能

GAS Companion 旨在为 GAS 项目提供通用基础，不做任何游戏设计决策，所有系统部分都可以被子类化和定制。

### 主要特性

- **蓝图友好**: 无需 C++ 即可使用 GAS 全部功能
- **Attribute Set 生成器**: C++ 代码生成向导，自动生成 AttributeSet
- **模块化架构**: 基于 Modular Gameplay Actors
- **输入绑定**: Enhanced Input 集成，自动绑定技能到输入
- **UI 集成**: 提供 Widget 基类，自动响应属性变化
- **AI 集成**: 内置 Behavior Tree Tasks，支持 AI 使用技能
- **Ability Sets**: 数据资产驱动的技能/属性/效果批量授予系统
- **Effect Container**: 简化 GE 应用流程
- **Ability Queue**: 技能队列系统，支持连招

---

## 二、核心模块

### 1. Modular Gameplay Actors

GAS Companion 提供一套模块化 Actor 基类，所有类都以 `GSC` 为前缀：

| 类名 | 用途 | ASC 位置 |
|------|------|----------|
| `GSCModularCharacter` | 角色基类（AI/NPC） | Pawn 上 |
| `GSCModularPlayerStateCharacter` | 玩家角色基类 | PlayerState 上 |
| `GSCModularActor` | 通用 Actor 基类 | Actor 上 |
| `GSCModularDefaultPawn` | Pawn 基类 | Pawn 上 |
| `GSCModularPlayerController` | PlayerController 基类 | - |
| `GSCModularGameModeBase` | GameMode 基类 | - |

**网络复制模式**:
- **Full**: 完整复制（适用于单人游戏或玩家角色）
- **Mixed**: 仅向所有者复制完整信息，向模拟代理复制最小信息
- **Minimal**: 仅复制 GameplayTags 和 GameplayCues（适用于 AI）

### 2. 核心组件

#### GSCCoreComponent

**职责**: 提供 ASC 的抽象层，统一 Pawn 和 PlayerState 上的 ASC 访问方式

**核心事件**:
- `OnHealthChange` / `OnStaminaChange` / `OnManaChange`: 属性变化
- `OnAttributeChange`: 任意属性变化（通用）
- `OnDamage` / `OnDeath`: 伤害和死亡
- `OnAbilityActivated` / `OnAbilityEnded` / `OnAbilityFailed`: 技能生命周期
- `OnGameplayEffectAdded` / `OnGameplayEffectRemoved`: GE 添加/移除
- `OnGameplayTagChange`: GameplayTag 变化
- `OnCooldownStart` / `OnCooldownEnd`: 冷却时间

**核心函数**:
- `GetHealth()` / `GetMaxHealth()` / `GetStamina()` / `GetMana()`: 获取属性值
- `SetAttributeValue()`: 设置属性基础值
- `ActivateAbilityByClass()` / `ActivateAbilityByTags()`: 激活技能
- `GrantAbility()` / `ClearAbility()`: 授予/移除技能
- `IsAlive()` / `Die()`: 生命状态管理
- `HasMatchingGameplayTag()`: 检查 GameplayTag

#### GSCAbilitySystemComponent

**职责**: ASC 子类，提供 GAS Companion 特有功能

**核心功能**:
- 管理 Granted Abilities / Effects / Attributes
- 支持 Ability Sets 授予和移除
- 初始化时自动调用 Anim Instance 接口（用于 Gameplay Tag Property Mapping）

**配置位置**: Character 类默认值 → Ability System Component

#### GSCAbilityInputBindingComponent

**职责**: 管理技能输入绑定（Enhanced Input）

**配置项**:
- `InputMappingContext`: 输入映射上下文
- `AbilityInputMapping`: 技能输入映射（InputAction → GameplayTag）
- `TriggerEvents`: 触发事件类型（Started / Triggered / Completed 等）

**注意事项**:
- 必须添加到 Avatar Actor（Pawn/Character）上
- 仅在 LocallyControlled 时生效
- 支持运行时动态切换 InputMappingContext

### 3. Gameplay Ability

#### GSCGameplayAbility

**父类**: `UGameplayAbility`

**新增功能**:

1. **Effect Container Map**
   - 类型: `Map<FGameplayTag, FGSCGameplayEffectContainer>`
   - 用途: 通过 Tag 快速应用一组 GE
   - API:
     - `MakeEffectContainerSpec()`: 创建 Container Spec
     - `ApplyEffectContainer()`: 应用 Container

2. **Loosely Check Ability Cost**
   - 属性: `bLooselyCheckAbilityCost`
   - 用途: 允许技能在消耗后属性为负值（仅阻止已经 ≤0 的情况）

3. **Activate On Granted**
   - 属性: `bActivateOnGranted`
   - 用途: 授予时自动激活（适用于被动技能或一次性技能）
   - 网络策略: 通常设为 Server Only

4. **Ability Queue**
   - 属性: `bEnableAbilityQueue`
   - 用途: 允许其他技能在此技能结束时排队激活
   - 推荐: 使用 `AbilityQueueNotifyState` 在蒙太奇中精确控制队列窗口

5. **OnAbilityEnded 事件**
   - 用途: 技能结束时触发（特别适用于 AI Behavior Tree Tasks）

### 4. Ability Sets

**定义**: 数据资产，用于批量授予 Abilities / Attributes / Effects / Owned Tags

**创建方式**: Content Browser → Miscellaneous → Data Asset → GSCAbilitySet

**包含内容**:
- Granted Abilities（可绑定 InputAction）
- Granted Attributes
- Granted Effects
- Owned Tags（Loose Gameplay Tags）

**API**:
- `UGSCAbilitySystemComponent::GiveAbilitySet()`: 授予 Ability Set，返回 Handle
- `UGSCAbilitySystemComponent::ClearAbilitySet()`: 移除 Ability Set

**使用时机**:
- **静态授予**: 在 ASC 类默认值中配置 `Ability Sets` 属性
- **动态授予**: 在 `OnInitAbilityActorInfo` 或 `OnBeginPlay`（仅 Pawn ASC）中调用 `GiveAbilitySet()`

**注意事项**:
- 必须在 Server 和 Client 都调用（用于输入绑定和 Owned Tags）
- Avatar Actor 必须有 `GSCAbilityInputBindingComponent` 才能绑定输入
- 典型用例: 装备武器/道具时授予，卸载时移除

### 5. UI 系统

#### GSCUserWidget

**职责**: UMG Widget 基类，用于与 ASC 交互

**子类**:
- `GSCUWHud`: HUD Widget 基类，提供属性变化、冷却、GE/Tag 事件

**内置 Widget**:
- `WB_HUD`: 默认 HUD
- `WB_HUD_TopLeft`: 左上角布局变体
- `WB_HUD_Minimalist`: 极简风格

**驱动方式**: C++ AttributeChangeDelegate，自动响应属性变化

### 6. AI 系统

#### Behavior Tree Tasks

GAS Companion 提供两个内置 BT Task：

| Task | 用途 | 参数 |
|------|------|------|
| `BTTask_TriggerAbilityByClass` | 按类激活技能 | AbilityToActivate |
| `BTTask_TriggerAbilityByTags` | 按标签激活技能 | GameplayTagContainer |

**实现要点**:
- 绑定 `GSCGameplayAbility::OnAbilityEnded` 事件
- 在技能结束时调用 `FinishExecute()`

**AI Character 配置**:
- 继承自 `GSCModularCharacter`（ASC 在 Pawn 上）
- ASC 复制模式建议设为 `Minimal`
- 在 AIController 的 `OnPossess` 或 `BeginPlay` 中运行 Behavior Tree

---

## 三、重要 API 参考

### GSCCoreComponent

```blueprint
// 属性操作
GetHealth() → float
GetMaxHealth() → float
SetAttributeValue(Attribute, NewValue)
ClampAttributeValue(Attribute, MinValue, MaxValue)

// 技能操作
ActivateAbilityByClass(AbilityClass, ActivatedAbility, bAllowRemoteActivation) → bool
ActivateAbilityByTags(AbilityTags, ActivatedAbility, bAllowRemoteActivation) → bool
GrantAbility(Ability, Level)
ClearAbility(Ability)

// 状态查询
IsAlive() → bool
IsUsingAbilityByClass(AbilityClass) → bool
IsUsingAbilityByTags(AbilityTags) → bool
HasMatchingGameplayTag(TagToCheck) → bool

// 生命周期
Die()
```

### GSCAbilitySystemComponent

```blueprint
// Ability Set 管理
GiveAbilitySet(AbilitySet) → FGSCAbilitySetHandle
ClearAbilitySet(Handle)

// 辅助函数
GetCompanionAbilitySystemComponent(Actor) → GSCAbilitySystemComponent (静态)
```

### GSCGameplayAbility

```blueprint
// Effect Container
MakeEffectContainerSpec(ContainerTag, EventData, OverrideGameplayLevel) → FGSCGameplayEffectContainerSpec
ApplyEffectContainer(ContainerTag, EventData, OverrideGameplayLevel) → Array<FActiveGameplayEffectHandle>
ApplyEffectContainerSpec(ContainerSpec) → Array<FActiveGameplayEffectHandle>
```

---

## 五、最佳实践

### 1. ASC 位置选择

| 场景 | 推荐父类 | ASC 位置 |
|------|----------|----------|
| 玩家角色 | GSCModularPlayerStateCharacter | PlayerState |
| AI/NPC | GSCModularCharacter | Pawn |
| 通用 Actor | GSCModularActor | Actor |

### 2. Ability Set 授予时机

**静态授予**（推荐）:
- 在 ASC 类默认值中配置 `Ability Sets` 属性
- 自动在 ASC 初始化时授予

**动态授予**:
- PlayerState ASC: 在 `OnInitAbilityActorInfo` 中调用
- Pawn ASC: 在 `OnInitAbilityActorInfo` 或 `OnBeginPlay` 中调用
- 必须在 Server 和 Client 都调用

### 3. 输入绑定

- Avatar Actor 必须有 `GSCAbilityInputBindingComponent`
- 在 Ability Set 中配置 InputAction 绑定
- 支持运行时切换 InputMappingContext（通过 `LevelIMC` 变量）

### 4. 属性监听

- 优先使用 `Async Task Wait for Attribute Changed`
- 避免使用 `GSCCore.OnAttributeChange`（虽然仍可用）

### 5. Effect Container

- 适用于需要同时应用多个 GE 的场景
- 通过 Tag 索引，便于管理和复用
- 支持 SetByCaller 动态设置参数

### 6. AI 技能激活

- AI Character 继承自 `GSCModularCharacter`
- 使用内置 BT Task 或自定义 Task
- 绑定 `OnAbilityEnded` 事件以正确结束 Task

---

## 六、常见问题

### 1. 输入绑定不生效

**原因**: Avatar Actor 缺少 `GSCAbilityInputBindingComponent`

**解决**: 在 Character 蓝图中添加该组件

### 2. PlayerState ASC 在 BeginPlay 授予 Ability Set 失败

**原因**: BeginPlay 时 ASC 可能尚未初始化

**解决**: 使用 `OnInitAbilityActorInfo` 事件

### 3. 属性变化事件不触发

**原因**: 
- GSCCoreComponent 未正确初始化
- 事件绑定时机过早

**解决**: 
- 确保在 ASC 初始化后绑定事件
- 使用 `OnInitAbilityActorInfo` 或延迟绑定

### 4. Effect Container 不生效

**原因**: 
- Target Type 配置错误
- GE 未正确添加到 Container

**解决**: 
- 检查 Target Type（通常使用 `GSCTargetTypeUseOwner`）
- 确认 GE Classes 已添加

---

## 七、相关链接

- **官方文档**: https://gascompanion.github.io/
- **Fab 商店**: https://www.fab.com/listings/20d07b00-e7ba-4c5d-8ec0-aab6a79b908a
- **升级指南**: https://gascompanion.github.io/upgrade-guide/
- **API 参考**: https://gascompanion.github.io/api/

---

*最后更新: 2026-01-28*
