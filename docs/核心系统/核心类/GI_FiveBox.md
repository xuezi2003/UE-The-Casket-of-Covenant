# GameInstance - GI_FiveBox

> 全局唯一，游戏启动到关闭期间永久存在

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **类名** | `GI_FiveBox` |
| **父类** | `AdvancedFriendsGameInstance` |
| **生命周期** | 全局永久 |
| **存在位置** | 客户端和服务器各自一份 |

---

## 职责

- Session 管理（创建/搜索/加入房间）
- 全局配置数据
- 跨关卡持久数据（非网络同步）

---

## 属性

| 属性 | 类型 | 说明 |
|:-----|:-----|:-----|
| `LocalPlayerAvatarData` | Struct | 本地玩家头像数据（加入房间前设置） |

---

## 函数

| 函数 | 说明 |
|:-----|:-----|
| `CreateSession` | 创建房间（Advanced Sessions） |
| `FindSessions` | 搜索房间列表 |
| `JoinSession` | 加入指定房间 |
| `DestroySession` | 销毁当前 Session |

---

## 备注

- 使用 Advanced Sessions 插件提供的功能
- 开发阶段使用 Null Subsystem（局域网）
- 发布阶段切换到 Steam Online Subsystem
