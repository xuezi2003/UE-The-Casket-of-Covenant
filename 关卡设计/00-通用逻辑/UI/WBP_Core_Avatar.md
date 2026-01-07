# WBP_Core_Avatar

> 动态头像 Widget（GSCUserWidget）

## Widget 结构

```
WBP_Core_Avatar（GSCUserWidget）
└── SizeBox_Avatar
    └── 缩放框
        └── 覆层
            ├── Img_Bg（白色背景）
            └── Img_Avatar（动态材质头像）
```

---

## 数据源

- `DT_Tex_Avatar_Path`：DataTable 存储贴图路径
- `AvatarData`：包含 HairIndex, EyeIndex, FaceIndex, ClothIndex

---

## Update_Avatar(AvatarData) 流程

```
SET AvatarData
    ↓
Sequence (6 分支)
├── Then 0: Create Dynamic Material Instance → SET MI_Avatar
├── Then 1: DataTable[Hair] → Load → Set Texture (Tex_Hair)
├── Then 2: DataTable[Eye] → Load → Set Texture (Tex_Eye)
├── Then 3: DataTable[Face] → Load → Set Texture (Tex_Face)
├── Then 4: DataTable[Cloth] → Load → Set Texture (Tex_Cloth)
└── Then 5: Img_Avatar.SetBrushFromMaterial(MI_Avatar)
```

---

## 相关文档

- [架构概述.md](架构概述.md)
- [WBP_Core_Status.md](WBP_Core_Status.md)
- [外观加载.md](../外观加载.md)
