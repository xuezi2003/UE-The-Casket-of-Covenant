# BP_PaintFrame（画框）

**用途**：挂在柱子上的随机画框装饰。

**父类**：Actor

**实现状态**：✅ 已实现

---

## 组件结构

```
BP_PaintFrame
└── DefaultSceneRoot
    └── SM_PictureFrame (Static Mesh)
```

---

## 变量

| 变量 | 类型 | 说明 |
|------|------|------|
| MI_Cavans | Material Instance | 画布动态材质实例 |
| TexFormat | Text | 贴图路径格式（含 `{0}` 占位符） |

---

## 构造脚本逻辑

```
CreateDynamicMaterialInstance → SET MI_Cavans
→ SM_PictureFrame.SetMaterialByName("Picture", MI_Cavans)
→ RandomIntegerInRange(0, 20)
→ FormatText(TexFormat, {0=随机索引})
→ LoadAsset_Blocking → Cast to Texture2D
→ MI_Cavans.SetTextureParameterValue("Diffuse Texture", 贴图)
```

> ⚠️ 使用随机逻辑，多端可能显示不同画作（纯装饰，不影响游戏）。

---

## 相关文档

- [场景组件.md](../场景组件.md) - 组件索引
- [BP_Section_Pillar.md](../结构组件/BP_Section_Pillar.md) - 柱段（包含此组件）
