# BP_BlackBoardWithPaint

**用途**：展示随机粉笔画贴花的单体黑板。

## 组件

| 组件 | 类型 | 用途 |
|------|------|------|
| Decal | DecalComponent | 显示粉笔画 |

## 变量

| 变量名 | 类型 | 用途 |
|--------|------|------|
| DMI_Paint | MaterialInstanceDynamic | 动态材质实例 |
| ImgPathFormat | Text | 图片路径格式（`/Game/.../img_cc_{0}`） |
| FInv / MInv | double | 动画时长参数（由父 Actor 传入） |

## 材质：M_Blackboard_Decal

| 参数 | 类型 | 用途 |
|------|------|------|
| Tex_Paint | Texture2D | 粉笔画贴图 |
| RotateAngle | Scalar | 旋转角度（0~1 对应 0~360°） |

> [!NOTE]
> Decal Size 需设为 `(深度, 1, 1)`，以便通过 Actor Scale 控制整体大小。

## 函数：LoadRandomPaint

**触发**：构造脚本

**逻辑**：
1. 生成随机路径：`img_cc_{Random(0,12)}`
2. 同步加载贴图：`LoadAsset_Blocking`
3. 创建动态材质实例 (DMI)
4. 设置贴图参数 `Tex_Paint`
5. 设置随机旋转 `RotateAngle`
6. 应用材质到 Decal

---

## 事件：SwapMoveTo

**用途**：交换动画事件（由 `BP_BlackboardWall` 调用）。

### 参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| ForwardOffset | double | X 轴前移距离 |
| TargetPos | Vector | 目标位置 |

### 逻辑（4 段链式 TweenVector）

1. **前移**：当前位置 → 当前位置 + X 偏移
2. **Y 平移**：移动到目标 Y 坐标
3. **Z 平移**：移动到目标 Z 坐标
4. **后移**：移动到最终目标位置

> [!NOTE]
> 动画逻辑放在子 Actor 而非父 Actor，是为了解决 **蓝图自定义事件参数覆盖问题**：在同一蓝图中多次调用含 Latent 节点的事件时，参数会被后续调用覆盖。每个子 Actor 独立持有事件参数，互不干扰。

---

## 相关文档

- [BP_BlackboardWall.md](BP_BlackboardWall.md) - 父 Actor 文档
- [场景组件.md](../场景组件.md) - 组件索引
