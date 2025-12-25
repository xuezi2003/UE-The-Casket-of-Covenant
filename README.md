# 契约之匣 - The Casket of Covenant

> UE5 多人游戏项目设计文档

## 📚 在线文档

访问在线文档：[https://xuezi2003.github.io/UE-The-Casket-of-Covenant/](https://xuezi2003.github.io/UE-The-Casket-of-Covenant/)

## 🚀 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run docs:dev
```

访问 `http://localhost:5173` 查看文档。

### 构建生产版本

```bash
npm run docs:build
```

### 预览生产版本

```bash
npm run docs:preview
```

## 📝 文档结构

```
docs/
├── index.md              # 首页
├── guide/                # 开发指南
├── core/                 # 核心系统
│   └── class/            # 核心类文档
├── levels/               # 关卡设计
│   ├── 01-耐力之匣/
│   ├── 02-逻辑之匣/
│   ├── 03-勇气之匣/
│   ├── 04-洞察之匣/
│   └── 05-牺牲之匣/
├── reference/            # 参考文档
└── progress/             # 进度跟踪
```

## 🔧 技术栈

- **文档框架**: [VitePress](https://vitepress.dev/)
- **部署**: GitHub Pages
- **自动化**: GitHub Actions

## 📖 更新文档

1. 编辑 `docs/` 目录下的 Markdown 文件
2. 提交并推送到 `main` 分支
3. GitHub Actions 会自动构建并部署到 GitHub Pages

## 📄 许可证

MIT License
