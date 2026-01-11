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

### 状态生命周期事件

每个 State 节点提供以下核心事件：

| 事件 (Event) | 触发时机 | 典型用途 |
|--------------|----------|----------|
| **On State Begin** | 进入状态时执行一次 | 初始化状态行为（如开启物理模拟、修改 Collision Profile、播放特效） |
| **On State Update** | 每帧执行（Tick） | 持续性逻辑（如 Trace 检测、位置更新） |
| **On State End** | 离开状态时执行 | 清理状态行为（如关闭物理、解绑事件、重置变量） |
| On State Initialized | Begin 之前 | 状态机初始化时的预处理（较少用） |
| On State Shutdown | End 之后 | 状态机销毁时的后处理（较少用） |

### 访问 Context

在状态蓝图中操作 Owner Actor：

```blueprint
Get Context → Cast to [MyActorClass] → (调用函数/访问变量)
```

---

## 转换 (Transitions)

### 转换评估模式

- **Tick 评估 (默认)**：每帧检查 `Can Enter Transition`。适合简单的布尔值检查。
- **事件驱动 (推荐)**：绑定 Event Dispatcher，仅在事件触发时评估。比 Tick 更加高效且逻辑清晰。

### 实现事件驱动转换

#### 方式一：自动事件绑定 (Automatic Event Binding)

最简便的方式，直接在 Transition 的 Details 面板配置：

1. **Delegate Owner Instance**：
   - `Context`：绑定 Owner Actor 的 Event Dispatcher
   - `This`：绑定状态机自身的 Event Dispatcher
2. **Delegate Property Name**：选择具体的事件分发器名称
3. Logic Driver 会自动生成 `Event Trigger Result Node`，事件触发即代表尝试转换。

#### 方式二：手动事件绑定 (Manual Event Binding)

适用于需要复杂条件判断的场景：

1. 取消勾选 `Can Evaluate Conditionally`
2. 勾选 `Can Enter Transition` (True)
3. 使用 `On Transition Initialized` 绑定事件
4. 事件触发时调用 `Evaluate From Manually Bound Event`
5. 使用 `On Transition Shutdown` **必须解绑事件**

---

## 网络复制 (Network Replication)

### 组件配置

SMStateMachineComponent 在 `Component Replication` 分类下有以下关键配置：

| 属性 | 推荐设置 | 说明 |
|------|:--------:|------|
| **Component Replicates** | ✅ | 基础开关，必须开启 |
| **State Change Authority** | `Server` | **权威模式**：仅服务器可切换状态，自动同步给客户端 |
| **Network Tick Configuration** | `Server` | 仅服务器执行 Tick 逻辑 |
| **Network State Execution** | `Server and Client` | **双端执行**：Begin/End 逻辑在双端都会运行（适合表现层同步） |
| **Include Simulated Proxies** | ✅ | 确保非本机玩家（Simulated Proxy）也能同步状态 |

### 最佳实践

- **Server Driven**：所有的状态切换判定（Transition）应由服务器完成。
- **Client Visuals**：客户端通过复制接收状态变化，并在 `On State Begin/End` 中执行表现逻辑（如 Mesh 显隐、特效播放）。

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
