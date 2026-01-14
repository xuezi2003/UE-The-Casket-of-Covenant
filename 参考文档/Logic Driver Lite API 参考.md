# Logic Driver Lite API 参考指南

> **文档来源**: https://logicdriver.com/docs/release/

本文档基于 Logic Driver Lite 官方文档整理，侧重于 API 使用 Pattern 和通用最佳实践，不绑定特定业务逻辑。

---

## 核心概念

### 状态机组件 (SMStateMachineComponent)

Logic Driver 提供 **SMStateMachineComponent**，是对 `USMInstance` 的封装，支持网络复制。这是在 Actor 中使用状态机的推荐方式。

**使用步骤**：
1. 在 Actor 蓝图中添加 `SMStateMachineComponent`
2. 将 **State Machine Blueprint** 分配给组件的 `State Machine Class` 属性
3. 组件会自动将 Owner Actor 作为 **Context** 传入状态机

> **Context 获取**：在状态机内部（State 或 Transition 图表中），始终通过 `Get Context` 节点获取 Owner Actor 的引用。

---

## 状态 (States)

### State vs State Machine 节点

> [!IMPORTANT]
> Logic Driver 中有两种不同类型的状态节点，行为完全不同！

| 节点类型 | 创建方式 | 双击进入 | On State Begin |
|----------|----------|----------|----------------|
| **State** (普通状态) | 拖连线或右键 Add State | Local Graph (蓝图逻辑) | ✅ 有 |
| **State Machine** (子状态机) | 右键 Add State Machine | 状态图 (带 Entry) | ❌ 无（需在内部 State 中写） |

**实践建议**：如果你需要在进入复合状态时执行逻辑，应在其内部创建一个 `Init` 状态作为入口点。

### 状态生命周期事件

每个 State 节点提供以下核心事件：

| 事件 (Event) | 触发时机 | 典型用途 |
|--------------|----------|----------|
| **On State Begin** | 进入状态时执行一次 | 初始化状态行为（如开启物理模拟、修改 Collision Profile、播放特效） |
| **On State Update** | 每帧执行（Tick） | 持续性逻辑（如 Trace 检测、位置更新） |
| **On State End** | 离开状态时执行 | 清理状态行为（如关闭物理、解绑事件、重置变量） |
| On State Initialized | Begin 之前 | 状态机初始化时的预处理（较少用） |
| On State Shutdown | End 之后 | 状态机销毁时的后处理（较少用） |

> [!TIP]
> On State Begin 内的逻辑是**同步执行**的。即使配置了 `Eval Transitions on Start = true`，转换评估也会在 On State Begin **完全执行完毕后**才进行。

### 访问 Context

在状态蓝图中操作 Owner Actor：

```blueprint
Get Context → Cast to [MyActorClass] → (调用函数/访问变量)
```

---

## 转换 (Transitions)

### 转换类型与配置

| 转换类型 | 配置方式 | 适用场景 |
|----------|----------|----------|
| **立即转换** | `Can Enter Transition = true` + `Eval Transitions on Start = true` | 初始化状态、竅时执行后立刻进入下一状态 |
| **Timer 转换** | `Time in State >= Duration` | 等待倒计时结束 |
| **条件转换** | `Can Enter Transition` 连接布尔表达式 | 基于游戏状态判断 |
| **事件转换** | 绑定 Event Dispatcher | 外部事件触发 |

### 立即转换配置步骤

1. **双击转换线**进入转换逻辑图
2. 勾选 `Can Enter Transition` = ✅ True
3. **配置源状态属性**：`Eval Transitions on Start = true`
4. **配置转换属性**：`Can Eval with Start State = true`

### Timer 转换配置步骤

1. 双击转换线进入转换逻辑图
2. 添加 `Time in State` 节点（返回当前状态已激活的秒数）
3. 添加 `>=` 比较节点
4. 将 Context 的 Duration 变量连接到比较节点右侧
5. 将比较结果连接到 `Can Enter Transition`

```blueprint
[Time in State] ──→ [>=] ──→ [Can Enter Transition / Return]
                      ↑
          [Context.Duration]
```

### 事件驱动转换 (推荐)

比 Tick 评估更高效，适合外部事件触发的转换。

#### 方式一：自动事件绑定 (Automatic Event Binding)

> **官方文档**: https://logicdriver.com/docs/release/guides/transitions/

自动绑定支持绑定到状态机实例或 Context 的事件分发器。

**配置步骤**：

1. 选中转换线，在 Details 面板找到 **Event** 分类
2. 设置 **Delegate Owner Instance**：
   - `This`：绑定状态机自身的 Event Dispatcher
   - `Context`：绑定 Owner Actor 的 Event Dispatcher
3. 如果选择 `Context`，需要在 **Delegate Owner Class** 中指定 Context 类（如 `GS_Core`）
4. 在 **Delegate Property Name** 下拉框中选择事件分发器名称
5. Logic Driver 自动在转换图中生成 `Event Trigger Result Node`

**重要说明**：
- 自动事件绑定依赖 `Event Trigger Result Node` 的 `Can Enter Transition`，**忽略**主条件的 `Can Enter Transition`
- 事件触发时，转换会立即执行（如果条件满足）

> [!WARNING]
> **不要在同一条转换线上混用 Timer 条件和事件绑定！** 自动事件绑定会忽略主条件（Timer），导致 Timer 失效。如需双触发，必须创建两条独立的转换线。

#### 方式二：手动事件绑定 (Manual Event Binding)

适用于需要复杂条件判断或绑定到非 Context/This 位置的事件。

**配置步骤（优化方式）**：

1. 在转换 Details 面板，取消勾选 `Can Evaluate Conditionally`
2. 设置 `Can Enter Transition = true`
3. 双击转换线进入转换图
4. 添加 `On Transition Initialized` 节点，在其中绑定事件
5. 事件触发时调用 `Evaluate From Manually Bound Event`（需要先 `Get Node Instance`）
6. 添加 `On Transition Shutdown` 节点，**必须解绑事件**（防止内存泄漏）

```blueprint
// On Transition Initialized
Get Context → Get Event Dispatcher → Bind Event

// 事件触发时
Get Node Instance → Evaluate From Manually Bound Event

// On Transition Shutdown
Get Context → Get Event Dispatcher → Unbind Event
```

### 转换优先级 (Priority)

当一个状态有多条出向转换时，按 **Priority** 数值排序，**数值越小优先级越高**。

- 转换在状态机初始化时排序一次
- 评估时按优先级顺序检查，第一个满足条件的转换被执行
- Priority 数值显示在转换图标上方

**典型用法**：
- 事件触发转换：Priority = 0（最高优先级，立即响应）
- Timer 转换：Priority = 1（兜底，超时后触发）

### 双触发转换模式 (Timer + 事件)

当需要同时支持"超时自动触发"和"事件提前触发"时，必须创建**两条独立的转换线**：

```
State A ──[Timer, Priority=1]──→ State B
       ──[Event, Priority=0]──→ State B
```

**配置要点**：

| 转换线 | 类型 | Priority | 配置 |
|--------|------|----------|------|
| 转换 A | Timer | 1 | `Time in State >= Duration`，无事件绑定 |
| 转换 B | 事件 | 0 | 自动事件绑定，无条件逻辑 |

**工作原理**：
- 正常情况：Timer 转换在超时后触发
- 提前结束：事件广播时，Priority 0 的事件转换优先响应

### 子状态机完成转换

当需要等待子状态机完成后再转换时：

1. 确保子状态机内有一个 **End State**（`Can be End State = true`）
2. 在父级转换逻辑中使用 `Is State Machine in End State` 节点

---

## 网络复制 (Network Replication)

### 组件配置

SMStateMachineComponent 在 `Component Replication` 分类下有以下关键配置：

| 属性 | 推荐设置 | 说明 |
|------|:--------:|------|
| **Component Replicates** | ✅ | 基础开关，必须开启 |
| **State Change Authority** | `Server` | **权威模式**：仅服务器可切换状态，自动同步给客户端 |
| **Network Tick Configuration** | `Server` | 仅服务器执行 Tick 逻辑 |
| **Network State Execution** | `Server` | **仅服务端执行**：On State Begin/End 逻辑仅在 Server 运行，Client 通过 Replicated Variables 同步 |
| **Include Simulated Proxies** | ✅ | 确保非本机玩家（Simulated Proxy）也能同步状态 |

### 最佳实践

- **Server Driven**：所有的状态切换判定（Transition）应由服务器完成。
- **Client Visuals**：客户端通过 Replicated Variables 的 OnRep 事件感知状态变化，执行表现逻辑（如 Mesh 显隐、特效播放）。

---

## 常用操作

### 手动切换状态

虽然推荐使用 Event 驱动转换，但在某些特殊情况下（如调试或强制重置），可以直接通过代码切换：

```blueprint
// 方式一：切换到指定名称的状态
SMComponent → Get Instance → SwitchActiveStateByQualifiedName("StateName")

// 方式二：从当前状态切换到下一链接状态
Get State Instance → SwitchToLinkedState(NextStateNode)
```

### 调试技巧

1. **Visual Debugging**：PIE 运行时，选中 Actor，打开状态机蓝图，可实时看到当前激活状态（高亮）。
2. **Print String**：在 `On State Begin` 中打印 Context 和 State Name，确认切换流程。

---

## 常见问题 (FAQ)

1. **Context 为空？**
   - 检查 SMStateMachineComponent 是否已正确初始化（`Start on Begin Play`）。
   - 确保 Actor 还没有被 Destroy。

2. **客户端状态不同步？**
   - 检查 `State Change Authority` 是否为 Server。
   - 检查 `Include Simulated Proxies` 是否勾选。
   - 确认 Actor 本身已开启 `Replicates`。

3. **事件未触发转换？**
   - 确认 Event Dispatcher 已正确调用（Server 端调用）。
   - 确认转换连线方向正确。
   - 确认事件绑定的转换线没有混用 Timer 条件（会被忽略）。

4. **Timer 和事件同时配置但 Timer 不生效？**
   - 自动事件绑定会忽略主条件，必须使用两条独立转换线实现双触发。
