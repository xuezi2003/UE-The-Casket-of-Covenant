# 场景组件：BP_Banner (随机高考标语横幅)

`BP_Banner` 用于在关卡中自动生成带有随机"高考/内卷"标语的横幅。

## 组件结构

```
BP_Banner
└── SM_Banner (Static Mesh) ← 已改为静态网格体节约性能
```

## 变量说明

| 变量 | 类型 | 说明 |
|------|------|------|
| MI_Banner | Material Instance Dynamic | 动态材质实例 |
| TexFormat | Text | 纹理路径格式（如 `/Game/.../banner_{0}`） |

## 构造脚本逻辑

```
Event 构造脚本
→ 创建动态材质实例
→ SM_Banner.SetMaterialByName(Material, "cloth")
→ RandomIntegerInRange(0, 20) → FormatText(TexFormat)
→ LoadAsset_Blocking → Cast to Texture2D
→ SetTextureParameterValue("Cloth Image Texture", Texture)
```

1. **创建动态材质**：为 `SM_Banner` 的 `cloth` 材质槽创建动态材质实例
2. **随机索引生成**：生成 0~20 的随机整数（对应 21 种标语纹理）
3. **路径格式化**：使用 `TexFormat` 拼接纹理路径
4. **同步加载**：`LoadAsset_Blocking` 加载纹理资源
5. **应用纹理**：设置材质参数 `Cloth Image Texture`

---

## 相关文档

- [场景组件.md](../场景组件.md) - 组件索引
- [IAScatter布局.md](../IAScatter布局.md) - IA Scatter 配置
