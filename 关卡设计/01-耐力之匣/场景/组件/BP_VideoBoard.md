# BP_VideoBoard（终点视频黑板）

**职责**：终点区域的大屏幕，根据不同情况播放不同视频

**父类**：Actor

**实现状态**：⏳ 待测试

**摆放方式**：手动摆放

---

## 设计概述

`BP_VideoBoard` 是终点区域的视频播放屏幕，用于：
1. 增强终点区域的视觉效果
2. 根据游戏状态播放不同内容的视频


---

## 组件结构

- **SM_BlackBoard**：黑板外框 Static Mesh
- **SM_Plane**：Static Mesh (Plane)
  - 材质实例：`MI_VideoBoard_Panel` ✅

---

## 材质

### M_VideoBoard_Panel（父材质）

**类型**：Unlit Material

**节点结构**：
```
TexCoord[0] → CustomRotator (RotateVideo param) → Texture Sample (Media Texture) → Emissive Color
```

**参数**：
| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `RotateVideo` | Scalar | 0.0 | UV旋转角度 (0-1 对应 0-360°) |

### MI_VideoBoard_Panel（材质实例）

继承自 `M_VideoBoard_Panel`，用于 SM_Plane 组件。

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `MediaPlayer` | Media Player Object Reference | 指向 `MP_VideoBoard` |
| `VideoSourceMap` | Map<EVideoType, Media Source> | 枚举到视频源的映射 |

---

## 视频场景

| 场景 | 视频内容 | 触发时机 |
|------|----------|----------|
| 绿灯 | 木偶背对/安全提示 | GS.IsRedLight = false |
| 红灯 | 木偶转身/危险警告 | GS.IsRedLight = true |
| 被检测 | 木偶发现玩家的反应 | 玩家被 BP_Monitor 检测到 |

---

## 函数

### PlayVideo (VideoType: EVideoType)

根据视频类型播放对应视频。

```
If (Map_Find(VideoSourceMap, VideoType))
    → MediaPlayer.OpenSource(FoundValue)
    → MediaPlayer.Play()
```

---

## 素材资源

| 资源名 | 类型 | 状态 |
|--------|------|:----:|
| `MP_VideoBoard` | Media Player | ✅ |
| `MP_VideoBoard_Video` | Media Texture | ✅ |
| `FMS_Video_Green` | File Media Source | ✅ |
| `FMS_Video_Red` | File Media Source | ✅ |
| `FMS_Video_Detect` | File Media Source | ✅ |
| `M_VideoBoard_Panel` | Material (Unlit) | ✅ |

---

## 相关文档

- [BP_Section_封闭墙.md](BP_Section_封闭墙.md) - 起点/终点封闭墙
- [场景组件.md](../场景组件.md) - 组件索引
