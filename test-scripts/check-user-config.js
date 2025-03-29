// 检查用户配置表
import { PrismaClient } from '@prisma/client';

async function checkUserConfig() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('检查所有用户配置...');
    
    // 获取所有用户和他们的配置
    const users = await prisma.user.findMany({
      include: {
        userConfig: true
      }
    });
    
    console.log(`找到 ${users.length} 个用户:`);
    
    // 检查每个用户是否有配置
    for (const user of users) {
      console.log(`\n用户: ${user.username} (${user.id})`);
      console.log(`邮箱: ${user.email || '无'}`);
      
      if (user.userConfig) {
        console.log('用户配置存在:');
        console.log(`  配置ID: ${user.userConfig.id}`);
        console.log(`  会话令牌: ${user.userConfig.sessionToken || '无'}`);
      } else {
        console.log('用户配置不存在，创建默认配置...');
        
        // 为没有配置的用户创建默认配置
        const newConfig = await prisma.userConfig.create({
          data: {
            userId: user.id,
            sessionToken: null
          }
        });
        
        console.log(`已创建配置 (ID: ${newConfig.id})`);
      }
    }
    
  } catch (error) {
    console.error('检查用户配置失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserConfig(); 