// 创建管理员用户脚本
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // 检查admin用户是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: {
        username: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('管理员用户已存在，ID:', existingAdmin.id);
      return;
    }

    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 创建管理员用户
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com'
      }
    });

    console.log('管理员用户创建成功！');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('ID:', admin.id);
  } catch (error) {
    console.error('创建管理员用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('脚本执行失败:', e);
  process.exit(1);
}); 