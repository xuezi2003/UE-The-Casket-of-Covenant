# WBP_Endurance_QTE_Stagger

> QTE Widget（失衡恢复）- GSCUserWidget

## Widget 结构

```
WBP_Endurance_QTE_Stagger (GSCUserWidget)
└── SizeBox
    └── Overlay
        ├── Image_Bg        ← 红色背景圆
        ├── Image_Target    ← 绿色安全区（25% Progress）
        ├── Image_Point     ← 白色指针（2% Progress）
        └── TextBlock_QTE   ← "要求 0/5" 计数
```

---

## 变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `ImgSize` | Float | SizeBox 宽高（Instance Editable） |
| `TargetAngle` | Float | Target 当前角度 |
| `TargetGoalAngle` | Float | Target 目标角度 |
| `PointAngle` | Float | Point 当前角度 |
| `PointGoalAngle` | Float | Point 目标角度（0 或 360，PingPong） |
| `CorrectCnt` | Int | 连续正确次数 |
| `RequireCnt` | Int | 要求正确次数 |
| `TargetWidth` | Float | Target 占用角度 |
| `PointWidth` | Float | Point 占用角度 |

---

## 事件图表

### Event PreConstruct

```
Event PreConstruct (IsDesignTime)
    ↓
SetImgSize()
```

### Event Construct

```
Event Construct
    ↓
Move_Target() → Update_Text()
```

### Event Tick

```
Event Tick (InDeltaTime, MyGeometry)
    ↓
Update_Target() → Update_Point()
```

---

## 函数

### SetImgSize

设置 SizeBox 的宽高覆盖值。

```
Event SetImgSize
    ↓
SizeBox.SetWidthOverride(ImgSize)
    ↓
SizeBox.SetHeightOverride(ImgSize)
```

### Move_Target

随机设置 Target 的目标角度。

```
Event Move_Target
    ↓
SET TargetGoalAngle = RandomFloatInRange(Min=0, Max=360)
```

### Update_Target

每 Tick 平滑更新 Target 角度（使用 iTween）。

```
Event Update_Target
    ↓
iTween.AngleUmgRtUpdate(
    InWidget = Image_Target,
    AngleTo = TargetGoalAngle,
    Delta = GetWorldDeltaSeconds(),
    Speed = 5
)
    ↓
SET TargetAngle = Image_Target.GetRenderTransformAngle()
```

### Update_Point

每 Tick 平滑更新 Point 角度 + PingPong 逻辑。

```
Event Update_Point
    ↓
iTween.AngleUmgRtUpdate(
    InWidget = Image_Point,
    AngleTo = PointGoalAngle,
    Delta = GetWorldDeltaSeconds(),
    Speed = 3
)
    ↓
SET PointAngle = Image_Point.GetRenderTransformAngle()
    ↓
If NearlyEqual(PointAngle, PointGoalAngle, ErrorTolerance=1)
    ↓ True
SET PointGoalAngle = (PointGoalAngle == 360) ? 0 : 360  ← PingPong 切换
```

### Update_Text

更新计数显示文本。

```
Event Update_Text
    ↓
TextBlock_QTE.SetText(
    FormatText(
        Format = "要求\n{0}/{1}",
        Args = {CorrectCnt, RequireCnt}
    )
)
```

### Check_Hit

判断 Point 是否在 Target 区间内，返回 Boolean。

```
Check_Hit() → Boolean
    ↓
Math Expression:
    (x >= min((y - z), y)) && (x <= max((y - z), y))
    
    X = PointAngle
    Y = TargetAngle  
    Z = TargetWidth
    ↓
Return Value
```

**逻辑说明**：判断 PointAngle 是否在 [TargetAngle - TargetWidth, TargetAngle] 范围内。

### OnQTEInput

处理玩家输入，由 Comp_PC_Endurance 调用。

```
OnQTEInput()
    ↓
Sequence
├── Then 0: Check_Hit() → Branch
│   ├── True:
│   │   └── ++CorrectCnt → Branch (CorrectCnt >= RequireCnt)
│   │       ├── True: Cast (GetOwningPlayer) to PC_Core
│   │       │         → GetComponentByClass(Comp_PC_Endurance)
│   │       │         → EndQTE()
│   │       └── False: Move_Target()
│   └── False:
│       └── SET CorrectCnt = 0
│
└── Then 1: Update_Text()
```

---

## 使用插件

| 插件 | 用途 |
|------|------|
| SDF Robo Progress Bars | 圆形进度条材质 |
| iTween | `AngleUmgRtUpdate` 平滑旋转 |

---

## 相关文档

- [推搡系统.md](../GAS/推搡系统.md)（GA_Stagger QTE 逻辑）
- [Comp_PC_Endurance.md](../核心类/Comp_PC_Endurance.md)
