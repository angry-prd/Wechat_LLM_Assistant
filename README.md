# 微信公众号AI助手

一个集成了AI大模型和Markdown编辑器的微信公众号推文助手，帮助用户生成、编辑和发布高质量的推文。

## 主要功能

- **AI文章生成**: 利用AI大模型，快速生成高质量的文章内容
- **Markdown编辑**: 使用Markdown编辑器，轻松美化文章排版
- **一键发布**: 直接发布到微信公众号，省去繁琐的复制粘贴

## 技术栈

- 前端: Next.js, React, TypeScript, Tailwind CSS
- 数据库: MySQL (通过Prisma ORM)
- API接口: Next.js API Routes
- UI组件库: React-icons和自定义组件

## 系统特点

### 权限控制系统

系统采用统一的权限控制机制，确保只有登录用户才能访问特定功能：

1. **未登录用户**:
   - 可以查看首页和公开内容
   - 无法访问AI聊天、推文管理和系统设置等功能
   - 尝试访问受保护功能时会自动重定向到登录页面
   - 导航栏中不显示"系统配置"选项

2. **已登录用户**:
   - 可以自由访问所有功能
   - 导航栏中显示"系统配置"选项
   - 拥有完整的用户体验

3. **权限控制实现**:
   - 使用中间件拦截受保护路径和API请求
   - 保存原始访问路径，登录后自动跳回
   - 支持多种认证方式，包括自定义认证和NextAuth

### 登录状态显示

系统在界面上明确显示用户的登录状态：

1. **未登录状态**:
   - 显示醒目的红色"未登录"提示
   - 点击提示可直接跳转到登录页面

2. **已登录状态**:
   - 显示绿色的"已登录"提示
   - 显示用户名信息
   - 提供退出登录选项

## 开发工具

### 开发预览功能

在开发过程中，提供了一个内部预览工具，可以在编辑器内直接查看UI组件和状态：

- 直接在编辑器内预览UI组件效果
- 支持模拟登录/未登录状态切换
- 包含导航栏、登录状态和移动菜单预览

### 启动脚本

提供了两种启动方式：

1. `npm run dev`: 在3000端口启动应用
2. `npm run dev:force`: 自动释放3000端口并启动应用，适合端口被占用的情况

## 安装和使用

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 如果端口被占用，强制启动
npm run dev:force

# 构建生产版本
npm run build

# 启动生产版本
npm run start
```

## 贡献指南

欢迎贡献代码！请确保您的代码符合项目的代码风格和命名规范。提交PR前，请确保通过所有测试。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
