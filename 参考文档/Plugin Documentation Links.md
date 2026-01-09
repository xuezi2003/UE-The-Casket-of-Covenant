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
- **用途**: 状态机重构（`ST_Endurance` 及其他状态/阶段切换流程）

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
