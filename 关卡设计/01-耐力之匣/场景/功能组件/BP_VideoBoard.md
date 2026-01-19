# BP_VideoBoard（终点视频黑板）

**职责**：根据游戏状态播放不同视频

**父类**：Actor

**实现状态**：✅ 已实现（红绿灯切换）/ ⏳ 待实现（Detect 视频，需 BP_Monitor）

**摆放方式**：MSS 吸附到 BP_Section_End

**网络模式**：不复制（纯表现层，各客户端本地播放）

---

## 组件结构

```
BP_VideoBoard
└── SM_BlackBoard (StaticMesh) ← 黑板外框
    ├── SM_Pivot ← MSS 吸附点
    └── SM_Plane (StaticMesh) ← 视频显示面板
        └── 材质: MI_VideoBoard_Panel
```

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `MediaPlayer` | Media Player* | 指向 MP_VideoBoard |
| `VideoSourceMap` | Map\<E_VideoType, MediaSource\> | 视频类型映射 |

---

## 视频场景

| 场景 | 触发时机 | 状态 |
|------|----------|:----:|
| 绿灯 | GS.IsRedLight = false | ✅ |
| 红灯 | GS.IsRedLight = true | ✅ |
| 被检测 | 玩家被 BP_Monitor 检测到 | ⏳ |

---

## 事件绑定（BeginPlay）

```
Event BeginPlay
→ Cast(GetGameState()) To GS_Endurance
→ Bind Delegate(HandleRedLightChange) to OnIsRedLightChange
```

## 事件处理（HandleRedLightChange）

```
Custom Event: HandleRedLightChange (IsRedLight: Bool)
→ PlayVideo(Select(IsRedLight, Red, Green))
```

## 函数：PlayVideo

```
PlayVideo(VideoType: E_VideoType)
→ If VideoSourceMap.Find(VideoType) IsValid
   → MediaPlayer.OpenSource(VideoSourceMap[VideoType])
   → MediaPlayer.Play()
```

---

## 网络架构

- **不需要复制**：BP_VideoBoard 是纯表现层组件
- **事件源已同步**：`GS_Endurance.IsRedLight` 是 RepNotify 变量
- **执行流程**：Server 修改 IsRedLight → 复制到客户端 → 触发 OnRep → 广播事件 → 各客户端本地 PlayVideo

---

## 素材资源

| 资源名 | 类型 | 状态 |
|--------|------|:----:|
| `MP_VideoBoard` | Media Player | ✅ |
| `MP_VideoBoard_Video` | Media Texture | ✅ |
| `FMS_Video_Green/Red/Detect` | File Media Source | ✅ |
| `M_VideoBoard_Panel` | Material (Unlit) | ✅ |

---

## 相关文档

- [BP_Section_End.md](../结构组件/BP_Section_End.md) - 终点封闭墙
- [场景组件.md](../场景组件.md) - 组件索引
