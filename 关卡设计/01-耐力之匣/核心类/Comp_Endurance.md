# Comp_Endurance（ActorComponent）

**职责**：关卡1 玩家操作组件，移动状态检测 + GE 应用

**挂载于**：BP_Character_Game（在 InitPlayer 里根据 LevelCharacterComponentClass 动态添加，服务端和客户端都会执行）

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| BP_Character | BP_Character_Game | 缓存的角色引用 |
| ASC | AbilitySystemComponent | 缓存的 ASC 引用 |

## 关键逻辑

### Event BeginPlay

```
Get Owner → Cast To BP_Character_Game → SET BP_Character
    ↓
Set Timer by Function Name (WaitForASC, Looping)
```

### WaitForASC（自定义事件）

```
BP_Character → Get Component by Class (GSCCoreComponent)
    ↓
Get Ability System Component from Actor (BP_Character)
    ↓
Is Valid?
    ├─ Yes → SET ASC → Clear Timer (WaitForASC)
    └─ No → 继续等待
```

**注意**：ASC 挂在 PlayerState 上（GSC 架构），必须通过 GSCCore 组件获取，不能直接用 `Get Ability System Component(Character)`。

## 关键逻辑

### UpdateMoving（Tick 调用，仅服务端）

```
Switch Has Authority
    ↓ Authority
Is Valid (ASC)
    ↓ Is Valid
速度 >= MovingThreshold?
    ├── True → NOT IsMoving? → Apply GE_Moving → SET IsMoving = true
    └── False → IsMoving? → Remove GE_Moving → SET IsMoving = false
```

## 待实现

| 功能 | 说明 |
|------|------|
| 红灯死亡判定 | 监听 GS.IsDetecting + 检查 Player.State.Danger |

## 实现状态

- [x] 蓝图已创建
- [x] BeginPlay 获取 BP_Character
- [x] WaitForASC 定时器轮询获取 ASC（通过 GSCCore）
- [x] 移动状态检测逻辑（Has Authority 鉴权）
- [ ] 红灯死亡判定逻辑
