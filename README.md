# 写在前面的话
- 我是一个懂点SQL等皮毛技术的产品经理，纯爱好，用AI编程工具写的项目，中途因为账号和成本的问题，折腾了很多客户端，导致代码有点乱，理解万岁！
- 现在功能还没有彻底完成，还在持续更新中，有空的人也可以参与贡献

# 微信公众号AI助手

一个集成了AI大模型和Markdown编辑器的微信公众号推文助手，支持本地部署，数据和API配置完全由用户自己控制。

## 🌟 功能特点

- **AI文章生成**：利用AI大模型，快速生成高质量的文章内容
- **Markdown编辑**：使用Markdown编辑器，轻松美化文章排版
- **本地部署**：所有数据存储在本地，无需担心隐私泄露
- **自定义配置**：支持配置多种AI大模型，包括本地模型和API模型
- **微信发布**：支持将文章发布到微信公众号（需配置微信公众号API）
- **本地存储**：未配置微信API时，文章内容会保存在本地文件中

## 📋 系统要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器
- 可选：本地AI模型服务器（如果希望完全离线使用）

## 🚀 快速开始

### 安装

1. 克隆本仓库到本地：

```bash
git clone https://github.com/yourusername/wechat-llm-assistant.git
cd wechat-llm-assistant
```

2. 安装依赖：

```bash
npm install
# 或使用 yarn
yarn install
```

3. 初始化数据库：

```bash
npx prisma migrate dev --name init
```

4. 启动开发服务器：

```bash
npm run dev
# 或使用 yarn
yarn dev
```

5. 打开浏览器访问：`http://localhost:3000`

### 生产环境部署

1. 构建生产版本：

```bash
npm run build
# 或使用 yarn
yarn build
```

2. 启动生产服务器：

```bash
npm run start
# 或使用 yarn
yarn start
```

## ⚙️ 配置

首次运行时，系统会在项目根目录创建一个 `local-config.json` 文件，你可以编辑此文件自定义配置：

```json
{
  "appName": "微信公众号AI助手",
  "port": 3000,
  
  "admin": {
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com"
  },
  
  "aiModel": {
    "useLocalModel": false,
    "localModelEndpoint": "http://localhost:1234/v1/chat/completions",
    "models": [
      {
        "name": "默认AI模型",
        "apiKey": "",
        "endpoint": "https://api.openai.com/v1/chat/completions",
        "model": "gpt-3.5-turbo",
        "isDefault": true
      }
    ]
  },
  
  "wechat": {
    "appId": "",
    "appSecret": "",
    "token": "",
    "encodingAESKey": ""
  },
  
  "articleDefaults": {
    "author": "微信公众号作者",
    "copyright": "© 2024 版权所有"
  }
}
```

### 配置本地AI模型

如果你想使用本地部署的AI模型（如 [Ollama](https://github.com/ollama/ollama) 或其他兼容 OpenAI API 的模型服务）：

1. 在 `local-config.json` 文件中设置 `aiModel.useLocalModel` 为 `true`
2. 将 `aiModel.localModelEndpoint` 设置为你本地模型的API地址
3. 配置你希望使用的模型名称

### 配置微信公众号

1. 登录微信公众平台，获取 `AppID`、`AppSecret` 等信息
2. 将这些信息填入 `local-config.json` 的 `wechat` 部分
3. 或者在应用内登录后，在设置页面进行配置

## 🔒 数据存储

所有数据默认存储在本地SQLite数据库中，文件位置：`prisma/dev.db`

文章发布相关文件存储在 `data/articles` 目录

## 🤝 贡献指南

欢迎贡献代码或提出建议！请遵循以下步骤：

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。

---

希望这个工具能帮助你更高效地管理和发布微信公众号内容！
