# PlayerState - PS_FiveBox

> 跨关卡保留，GAS 宿主，玩家和 AI 共用

---

## 基本信息

| 项目 | 值 |
|:-----|:---|
| **类名** | `PS_FiveBox` |
| **父类** | `GSCModularPlayerState`（GAS Companion） |
| **生命周期** | 跨关卡保留（Seamless Travel） |
| **存在位置** | 服务器 + 所有客户端（自动复制） |

---

## 关键配置

| 配置 | 值 | 说明 |
|:-----|:---|:-----|
| **Replication Mode** | `Mixed` | 必须！否则 GE 不同步 |

---

## 职责

- GAS AbilitySystemComponent 宿主
- 玩家/AI 属性同步（HP、金币）
- 玩家身份信息（编号、头像）

---

## 属性

### 同步属性（Replicated）

| 属性 | 类型 | 说明 |
|:-----|:-----|:-----|
| `PlayerNum` | Int | 编号（Lobby 分配，全程不变） |
| `AvatarData` | Struct | 头像数据 |
| `bIsHuman` | Bool | 真人 / AI |

### GAS AttributeSet（使用 Blueprint Attributes）

| 属性 | 初始值 | 跨关卡 | 说明 |
|:-----|:-------|:-------|:-----|
| `Health` | 100 | 每关重置 | 当前 HP |
| `MaxHealth` | 100 | 保留 | 最大 HP |
| `Coins` | 初始值 | 保留 | 金币（死亡时掉落清零） |

---

## 跨关卡数据处理

| 属性 | Seamless Travel 后 | 处理方式 |
|:-----|:--------------------|:---------|
| `PlayerNum` | ✅ 保留 | 自动 |
| `AvatarData` | ✅ 保留 | 自动 |
| `Health` | ✅ 保留 | GM BeginPlay 重置为 MaxHealth |
| `Coins` | ✅ 保留 | 不处理，自然保留 |

---

## 玩家 vs AI

| 项目 | 玩家 | AI |
|:-----|:-----|:---|
| PlayerState | `PS_FiveBox` | `PS_FiveBox`（共用） |
| Controller | `PC_Game` | `AIC_Game` |
| `bIsHuman` | `true` | `false` |
| ASC 宿主 | PS | PS（统一） |

---

## 备注

- AI 生成时也创建 PS_FiveBox，确保 GAS 属性统一管理
- 掉线时 AI 接管只需切换 Controller，PS 保留
