# BP_Section 中间组件

### BP_Sectionall（纯墙体）
**组件**：SM_Wall (Cube, Scale: `0.2×20×10`, 面向X+)

### BP_BlackboardWall（独立黑板墙）
- 详细文档：[BP_BlackboardWall.md](BP_BlackboardWall.md)
- **已知问题**：运动方向需从硬编码X轴改为动态ForwardVector

---

### BP_Section_Pillar（单侧柱段）
**组件**：SM_Pillar (Cube, Scale: `2×2×10`) + BP_Camera

**放置**：场地左右边缘，手动摆放

**相关**：[BP_BlackboardWall.md](BP_BlackboardWall.md) | [场景组件.md](../场景组件.md)
