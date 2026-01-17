# OutlineMaker

**Version 1.06**

Available in the [Unreal Engine Marketplace](https://www.unrealengine.com/marketplace/en-US/slug/outline-maker) 

# **Introduction** {#introduction}

**Features**: 

* **Flexible material**: each part can be customized.   
* **Designed for performance**: lightweight.   
* Outline visible/hidden parts independently.   
* Customize colors, glow intensity, outline thickness and fill percentage.   
* Customizable "pulse" effect.   
* **Presets**: 6 presets available by default (up to 32 in extended version).  
* Correct depth computation.

# **Content** {#content}

**OutlineMaker** provides:
* ***PP\_Outline*** (PostProcess material)
* ***PPI\_OutlineInstance*** (Material Instance)

**Extended Version** (v1.02+):
* ***PP\_OutlineExtended***
* ***PPI\_OutlineInstanceExtended*** (Supports up to 16/32 presets)

# **Using the Outline material** {#using-the-outline-material}

**1. Enable Stencil Buffer**:

1. **Project Settings** -> **Rendering** -> **Postprocessing**.
2. Set **Custom Depth-Stencil Pass** to *Enabled with Stencil*.
3. (Mobile Only) Enable **Mobile HDR**.

**2. Add to Level**:

1. Add a **PostProcessVolume** (unbound).
2. **Details** -> **Post Process Materials** -> **Array** -> **Add** -> **Asset Reference**.
3. Select **PPI\_OutlineInstance** (or your custom instance).

# **Adding outlines to objects** {#adding-outlines-to-objects}

**Manually**:

1. Select **Actor** -> **Mesh Component**.
2. **Details** -> **Rendering** -> check **Render CustomDepth Pass**.
3. Set **CustomDepth Stencil Value** between 1 and 6 (or up to 16/32).

**From Blueprints:**

1. `Set Render Custom Depth` (true).
2. `Set Custom Depth Stencil Value` (1-6+).
   *Value 0 is reserved (no outline).*

# **Adding outlines to *translucent/transparent* objects** {#adding-outlines-to-translucent/transparent-objects}

1. Material Editor -> Details -> enable "**Allow Custom Depth Writes**".
2. Set "**Opacity Mask Clip Value**" to **0**.

# **Presets customization** {#presets-customization}

Open the Material Instance to customize each group.

**Note on Stencil Value 0**:
* Defines a special group that is **never outlined**.
* Useful for occluding objects (e.g. player covering outlined object).

**Overlapping Outlines**:
* Objects in the **same group** share the outline (merge).
* Objects in **different groups** have distinct outlines (stack).
* **Group 6 (or 16/32)** is special: objects with stencil value > max group will share Group 6/16/32 properties but act as *different presets* (stacking allowed).