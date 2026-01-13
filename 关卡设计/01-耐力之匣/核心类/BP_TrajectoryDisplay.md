# BP_TrajectoryDisplay（投掷预测线）

> 使用 **Path Tracer Toolkit** 显示投掷轨迹预测线（离散小球）。

**路径**：`Content/0_/Blueprints/Items/BP_TrajectoryDisplay`

**父类**：Actor

---

## 组件结构

```
BP_TrajectoryDisplay (Actor)
├── DefaultSceneRoot (Scene)
└── PathTracer (Child Actor Component: BP_PathTracer)
```

### PathTracer 配置 (插件提供)

| 属性 | 值 | 说明 |
|------|-----|------|
| Child Actor Class | `BP_PathTracer` | 插件核心类 |
| Path Type | `Dot Way` | 离散小球模式 |
| Main Mesh | `SM_PT_Sphere_LowPoly` | 解决圆柱体背面剔除导致不可见的问题 |
| Distance Between Dots | 24 | 小球间距 |
| Path Scale | 2.0 | 小球缩放 |
| Path Color | (0, 1, 0.88, 1) | 青绿色发光效果 |
| Manual Edit Mode | `False` | 运行时动态刷新 |

---

## 变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| SimTime | Float | 3.0 | 最大模拟时间(秒) |
| SimFreq | Float | 20.0 | 模拟频率 |

> [!NOTE]
> `LaunchVel` 和 `StartLocation` 改为函数参数传入，不再作为成员变量。

---

## 函数

### UpdateTrajectory(LaunchVelocity, StartPos) ✅

**输入**：
- LaunchVelocity (Vector) - 投掷速度
- StartPos (Vector) - 起始位置

```
UpdateTrajectory
    ↓
PredictProjectilePath_ByTraceChannel (Radius=5, Channel=Pawn)
    ↓
Cast to BP_PathTracer (from ChildActorComponent)
    ↓
BP_PathTracer.DrawPath (Points = OutPathPositions)
```

> [!NOTE]
> 使用 `Pawn` 通道而非 `Visibility`，确保预测线能被玩家角色阻挡（Visibility 通道默认被 Pawn 忽略）。

### ShowTrajectory(IsShow: Bool) ✅

```
ShowTrajectory(IsShow)
    ↓
SetActorHiddenInGame(NOT IsShow)
```

---

## 使用方式

由 GA_Aim 在瞄准时每帧调用 UpdateTrajectory，传入起始位置和投掷速度。

---

## 实现状态

| 功能 | 状态 |
|------|:----:|
| 组件结构 | ✅ |
| 变量定义 | ✅ |
| UpdateTrajectory | ✅ |
| ShowTrajectory | ✅ |
| GA_Aim 集成 | ✅ |

---

## 相关文档

- [瞄准投掷系统.md](../GAS/瞄准投掷系统.md)
- [道具系统.md](../道具系统.md)
