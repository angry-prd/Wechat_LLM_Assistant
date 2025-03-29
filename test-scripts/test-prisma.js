// 测试Prisma客户端与数据库的连接
import { PrismaClient } from '@prisma/client';

async function testPrismaConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('测试Prisma连接到数据库...');
    
    // 检查是否能正确查询用户表
    console.log('查询用户表...');
    const users = await prisma.user.findMany();
    console.log(`找到 ${users.length} 个用户:`);
    
    // 显示用户信息(不显示密码)
    users.forEach(user => {
      console.log(`- ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email || '无'}`);
    });
    
  } catch (error) {
    console.error('Prisma查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection(); 