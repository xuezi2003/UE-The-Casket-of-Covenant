# MOTS - Object Throwing System Documentation

> Developed by Dreamrise Studios  
> Updated 02.03.2023  
> Unreal Engine 插件

---

## 概述

MOTS (Object Throwing System) 是一个用于 Unreal Engine 的物体投掷系统插件，支持角色拾取、持有和投掷物体。

---

## Custom Item - 添加自定义可投掷物品

### 步骤

1. **创建 Child Actor**：从 `BP_Throwable_Object` 创建子类
   - 这是所有可被投掷的 Actor 的父类

2. **创建 Child Actor**：从 `BP_Holdable_Object` 创建子类
   - 这是所有可被玩家手持的 Actor 的父类

3. **设置 Throwable Object Class 变量**：
   - 在新创建的 `BP_Holdable_Object` 子类中
   - 将 `Throwable Object Class` 变量设置为新创建的 `BP_Throwable_Object` 子类

4. **装备物品**：
   - 调用 `BPC_ThrowingSystem` 的 `Hold Object` 事件
   - 定义 Holdable Class 为你的物品类

### 蓝图示例

按键绑定示例：
- **G 键**：按下时调用 `Hold Object`，设置 Target 和 Holdable Class
- **M 键**：按下时调用 `Hold Object`，设置 Target 和 Holdable Class
- **H 键**：按下时调用 `Hold Object` + `Unequip`
- **O 键**：按下时调用 `Hold Object`，使用 Select Class

> 所有内容都有完整注释，并提供在线支持！

---

## Integration - 集成到现有项目

### 步骤

1. 按照集成视频进行角色集成
   - 视频链接：https://bit.ly/3LyFY55

---

## 相关文件

- 原始文档图片：
  - `MOTS Documentation_page-0001.jpg`
  - `MOTS Documentation_page-0002.jpg`
  - `MOTS Documentation_page-0003.jpg`
