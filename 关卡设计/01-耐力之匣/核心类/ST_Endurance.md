# ST_Endurance（State Tree）

**职责**：关卡1 红绿灯状态切换

**上下文 Actor 类**：GS_Endurance

## 状态结构

```
Root
├── GreenLight → SetRedLight（转换）
│   ├── SetGreenLight（设置 IsRedLight = false）
│   └── Delay（绿灯持续时间）→ RedLight
│
└── RedLight → SetRedLight（转换）
    ├── SetRedLight（设置 IsRedLight = true）
    └── Delay（红灯持续时间）→ GreenLight
```

## 自定义任务

| 任务 | 用途 | 参数 |
|------|------|------|
| STT_SetRedLight | 设置 GS 的 IsRedLight 变量 | GS: Actor, IsRedLight: Bool |

## 待实现

- [ ] 时长衰减逻辑（随轮次增加，绿灯时间缩短）
- [ ] 从 GS 读取配置的时长参数

## 实现状态

- [x] 状态树已创建
- [x] GreenLight/RedLight 状态已添加
- [x] STT_SetRedLight 任务已创建
- [x] 状态转换已配置
