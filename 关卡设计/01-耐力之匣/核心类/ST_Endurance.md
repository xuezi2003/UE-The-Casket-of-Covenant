# ST_Endurance（State Tree）

**职责**：关卡1 红绿灯状态切换

**上下文 Actor 类**：GS_Endurance

## 状态结构

```
Root
├── GreenLight
│   ├── SetGreenLight（STT_SetRedLight: false + STT_SimplePrint）
│   └── Delay（Actor.GreenLightInterval）→ RedLight
│
└── RedLight
    ├── SetRedLight（STT_SetRedLight: true + STT_SimplePrint）
    └── Delay（Actor.RedLightInterval）→ GreenLight
```

## 参数绑定

| Delay | 绑定变量 |
|-------|----------|
| GreenLight → RedLight | Actor.GreenLightInterval |
| RedLight → GreenLight | Actor.RedLightInterval |

## 自定义任务

| 任务 | 用途 | 参数 |
|------|------|------|
| STT_SetRedLight | 设置 GS 的 IsRedLight 变量 | GS: Actor, IsRedLight: Bool |

## 待实现

- [ ] 时长衰减逻辑（随轮次增加，绿灯时间缩短）

## 实现状态

- [x] 状态树已创建
- [x] GreenLight/RedLight 状态已添加
- [x] STT_SetRedLight 任务已创建
- [x] 状态转换已配置
- [x] Delay 绑定 GS 的 Interval 变量
