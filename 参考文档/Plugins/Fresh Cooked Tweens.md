# Fresh Cooked Tweens 使用指南

## 核心概念
Tweening 库提供方便的曲线函数，用于在起始值和结束值之间（如位置、缩放、颜色等）进行平滑过渡。

### C++ 快速示例:
```c++
FCTween::Play(
    GetActorLocation(),
    GetActorLocation() + FVector(0, 0, 50),
    [&](FVector t)
    {
        SetActorLocation(t);
    },
    2.0f,
    EFCEase::OutCubic);
```

### Blueprints 快速示例:
![基本用法](./images/basic_usage_bp.png)

---

# Blueprints (蓝图)

## 基础用法
在“Tween”类别下添加 BP 任务。提供起始值和结束值，并将 **Apply Easing** 引脚连接到更新逻辑。**Value** 引脚每帧提供当前值。

- **Async Task**: 用于后续操作（如中途停止）。
- **Custom Curve**: 使用 UE Curve 资源作为缓动函数。
- **Ease**: 仅计算 0-1 的浮点数缓动值。
- **Ease with Params**: 允许覆盖 Elastic、Bounce、Back 和 Smoothstep 的默认参数。

---

# C++ API

## 基础调用
支持 Float, Vector, Vector2D, 和 Quaternion。
```c++
// 简单调用
FCTween::Play(0, 1, [&](float t) { Foo = t; }, .5f);

// 带选项调用
FCTween::Play(0, 1, [&](float t) { Foo = t; }, .5f, EFCEase::OutElastic)
    ->SetLoops(2)           // 循环次数
    ->SetYoyo(true)          // 往返模式
    ->SetOnLoop([&]() { ... }); // 循环回调
```

## 在执行中设置起始/结束值
```c++
FCTweenInstanceVector* Tween = FCTween::Play(...);
// 在 Tick 中动态更新
Tween->StartValue = Target1->GetActorLocation();
Tween->EndValue = Target2->GetActorLocation();
```

## 安全性与回收 (Safety)
如果 Tween 正在运行但目标 Actor 被销毁，lambda 会报错。
- **手动销毁**: `Tween->Destroy();`
- **全局清理**: `FCTween::ClearActiveTweens();`
- **Lambda 内判空**: `if (IsValid(this)) { ... }`
- **使用 UFCTweenUObject**: `TweenObj = FCTween::Play()->CreateUObject();` (会在 BeginDestroy 中自动清理)。

## 内存管理
- Tween 完成后会自动进入回收系统（Recycle）。
- 如果想手动控制销毁：调用 `SetAutoDestroy(false)`。
- 无限循环：`SetLoops(-1)`。

---

# 缓动函数参考 (Easing Functions)

| 常用函数 | 功能说明 |
| :--- | :--- |
| **Linear** | 线性匀速 |
| **Quadratic** | 二次方曲线 (t*t)，表现良好且开销低 |
| **Cubic / Quartic** | 更剧烈的加速/减速 |
| **Elastic** | 弹性效果 (Boing)，适合 UI 弹出 |
| **Bounce** | 弹跳效果 |
| **Back** | 预备动作 (回缩后再冲出) |
| **Step** | 阶梯式跳变 |

### In/Out 类型
- **In**: 缓动发生在**开始**阶段。
- **Out**: 缓动发生在**结束**阶段。
- **InOut**: 两头都有缓动，中间较快。

### 常用参数 (EaseParam)
- **Elastic**: 参数1为振幅 (Amplitude)，参数2为周期 (Period)。
- **Back**: 参数1为超越量 (Overshoot)。
- **Step**: 参数1为步数 (默认为 10)。
