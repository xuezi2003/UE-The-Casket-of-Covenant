# BP_VideoBoard（终点视频黑板）

**职责**：根据游戏状态播放不同视频

**父类**：Actor

**实现状态**：✅ 已实现

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
| `CurrentVideoType` | E_VideoType | 当前播放的视频类型 |
| `IsRedLight` | Bool | 缓存的红绿灯状态（恢复用） |

---

## 视频场景

| 场景 | 触发时机 | 循环 |
|------|----------|:----:|
| GreenLight | GS.IsRedLight = false | ✅ 循环 |
| RedLight | GS.IsRedLight = true | ✅ 循环 |
| HasDetect | 玩家被 BP_Monitor 检测到 | ❌ 单次 |

---

## 函数结构

### BeginPlay ✅

```
Event BeginPlay
    ↓
Cast GetGameState() To GS_Endurance
    ↓
Bind Event to OnRedLightChanged → HandleRedLightChange
Bind Event to OnPlayerDetected → HandlePlayerDetected
    ↓
PlayVideo(GreenLight)  ← 初始播放绿灯视频
    ↓
Bind Event to MediaPlayer.OnEndReached → HandleMPReachEnd
```

### HandleRedLightChange ✅

```
HandleRedLightChange (IsRedLight: Bool)
    ↓
SET IsRedLight = IsRedLight  ← 缓存状态
    ↓
Branch (CurrentVideoType != HasDetect)
    ├─ True → PlayVideo(Select(IsRedLight, RedLight, GreenLight))
    └─ False → 跳过（不打断 Detect 视频）
```

### HandlePlayerDetected ✅

```
HandlePlayerDetected (DetectedPlayer)
    ↓
PlayVideo(HasDetect)
```

### HandleMPReachEnd ✅

```
HandleMPReachEnd
    ↓
Branch (CurrentVideoType == HasDetect)
    ├─ True → PlayVideo(Select(IsRedLight, RedLight, GreenLight))
    └─ False → 不处理（循环视频不触发）
```

### PlayVideo ✅

```
PlayVideo (VideoType: E_VideoType)
    ↓
SET CurrentVideoType = VideoType
    ↓
If VideoSourceMap.Find(VideoType) IsValid:
    ↓
    MediaPlayer.OpenSource(VideoSourceMap[VideoType])
    MediaPlayer.SetLooping(CurrentVideoType != HasDetect)  ← Detect 不循环
    MediaPlayer.Play()
```

---

## 网络架构

- **不需要复制**：BP_VideoBoard 是纯表现层组件
- **事件源已同步**：`GS_Endurance.IsRedLight` 是 RepNotify 变量
- **执行流程**：Server 修改 IsRedLight → 复制到客户端 → 触发 OnRep → 广播事件 → 各客户端本地 PlayVideo

---

## 插件依赖

> [!IMPORTANT]
> **必须启用 Electra 插件**以避免 MediaPlayer 循环播放卡顿！
> - Edit → Plugins → 启用 **Electra Player** 和 **Electra Codecs**
> - 重启引擎后生效

---

## 已知问题

> [!NOTE]
> **视频切换有约 1 秒延迟**：`OpenSource()` 是异步的，视频需要加载解码才能显示。
> 
> **已尝试方案**：FileMediaSource 的 Precache File 选项（无效）
> 
> **潜在解决方案**：使用多个 MediaPlayer 实例预加载所有视频，切换时只切换 MediaTexture 输入源。

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
