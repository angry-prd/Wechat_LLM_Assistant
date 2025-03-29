// 为admin用户重置密码
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const USERNAME = 'admin'; // 要重置密码的用户名
const NEW_PASSWORD = 'admin123'; // 新密码
const SALT_ROUNDS = 10; // bcrypt加盐轮数

async function resetPassword() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log(`准备为用户 "${USERNAME}" 重置密码...`);
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username: USERNAME }
    });
    
    if (!user) {
      console.error(`找不到用户: ${USERNAME}`);
      return;
    }
    
    // 对新密码进行哈希处理
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);
    
    // 更新用户密码
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    console.log(`用户 ${updatedUser.username} 密码已成功重置`);
    console.log(`用户ID: ${updatedUser.id}`);
    console.log(`用户名: ${updatedUser.username}`);
    console.log(`邮箱: ${updatedUser.email || '无'}`);
    console.log(`请使用新密码 "${NEW_PASSWORD}" 尝试登录`);
    
  } catch (error) {
    console.error('重置密码失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword(); 