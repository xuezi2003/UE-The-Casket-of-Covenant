# BP_VideoBoard（终点视频黑板）

**职责**：终点区域的大屏幕，根据不同情况播放不同视频

**父类**：Actor

**实现状态**：❌ 待实现

**归属**：作为 `BP_Section_End` 的子组件

---

## 设计概述

`BP_VideoBoard` 是终点区域的视频播放屏幕，用于：
1. 增强终点区域的视觉效果
2. 根据游戏状态播放不同内容的视频

> [!NOTE]
> 作为 BP_Section_End 的子组件时，需要**反缩放**以保持比例不变形。

---

## 组件结构

- **SceneRoot**：根组件
- **ScreenMesh**：屏幕/黑板外框 Static Mesh
- **MediaPlane**：播放视频的平面 Mesh
  - 绑定 Media Texture

---

## 变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `MediaPlayer` | UMediaPlayer* | 媒体播放器 |
| `VideoMap` | TMap<EVideoType, UMediaSource*> | 视频类型到资源的映射 |

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

---

## 缩放处理

作为 BP_Section_End 子组件时：
- 父级缩放时需要**反缩放**保持比例
- 或者使用 World Space 锚定，只更新位置

---

## 相关文档

- [BP_ArenaGenerator.md](BP_ArenaGenerator.md) - 场地生成器
- [BP_Section_End](BP_ArenaGenerator.md#bp_section_end终点封闭墙) - 所属父组件
- [场景组件.md](../场景组件.md) - 组件索引
