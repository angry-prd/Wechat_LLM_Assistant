# 数据库配置说明

## 开发环境

当前项目使用Prisma ORM与SQLite数据库进行开发环境的数据存储。SQLite是一个轻量级的文件数据库，不需要额外的数据库服务器，适合开发和测试。

## 生产环境部署（腾讯云）

在腾讯云服务器上部署时，建议使用PostgreSQL或MySQL数据库进行数据存储。以下是部署步骤：

### 1. 在腾讯云创建数据库

1. 登录腾讯云控制台
2. 创建PostgreSQL或MySQL数据库实例
3. 设置数据库名称、用户名和密码
4. 配置网络安全组，确保应用服务器可以访问数据库

### 2. 配置环境变量

在服务器上，修改`.env`文件中的数据库连接字符串：

```
# PostgreSQL
DATABASE_URL="postgresql://username:password@your-tencent-cloud-host:5432/wechat_assistant?schema=public"

# 或者 MySQL
# DATABASE_URL="mysql://username:password@your-tencent-cloud-host:3306/wechat_assistant"
```

### 3. 修改Prisma配置

在`prisma/schema.prisma`文件中，将数据库提供商从`sqlite`改为`postgresql`或`mysql`：

```prisma
datasource db {
  provider = "postgresql" // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

### 4. 生成Prisma客户端

```bash
npx prisma generate
```

### 5. 应用数据库迁移

```bash
npx prisma migrate deploy
```

## 数据迁移

如果需要将本地开发环境的数据迁移到腾讯云服务器上，可以使用以下方法：

### SQLite到PostgreSQL/MySQL的数据迁移

1. 导出本地数据（可以使用Prisma的seed功能或自定义脚本）
2. 将数据导入到云数据库

## 数据库模型

当前项目包含以下数据模型：

- **User**: 用户信息
- **ChatModel**: AI聊天模型配置
- **UserConfig**: 用户配置（包括微信公众号配置）
- **Article**: 文章内容

## 安全注意事项

1. 确保数据库密码足够强壮
2. 限制数据库访问IP
3. 定期备份数据库
4. 不要在代码中硬编码数据库凭证，始终使用环境变量