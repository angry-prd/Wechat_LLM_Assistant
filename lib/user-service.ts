import { prisma } from './prisma';
import { users } from '@/app/api/auth/shared-data';
import { hash, compare } from 'bcrypt';

// 根据手机号查找用户
export async function findUserByPhone(phone: string) {
  // 首先尝试从内存中查找
  for (const key in users) {
    if (users[key].phone === phone) {
      return users[key];
    }
  }
  
  // 如果内存中没有，尝试从数据库查找
  try {
    const user = await prisma.user.findFirst({
      where: { username: phone } // 假设username字段存储手机号
    });
    
    if (user) {
      // 将用户信息缓存到内存中
      users[user.id] = {
        id: user.id,
        username: user.username,
        phone: user.username, // 假设username字段存储手机号
        password: user.password,
        createdAt: user.createdAt.toISOString()
      };
      return users[user.id];
    }
  } catch (error) {
    console.error('查询用户失败:', error);
  }
  
  return null;
}

// 验证用户密码
export async function validateUserPassword(user: any, password: string) {
  // 如果密码是哈希值，使用bcrypt比较
  if (user.password.startsWith('$2')) {
    return await compare(password, user.password);
  }
  
  // 否则直接比较（不安全，仅用于演示）
  return user.password === password;
}

// 更新用户会话令牌
export async function updateUserSessionToken(user: any, token: string) {
  // 更新内存中的用户会话令牌
  if (users[user.id]) {
    users[user.id].sessionToken = token;
  }
  
  // 如果用户存在于数据库中，也更新数据库
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // 假设我们在用户配置中存储会话令牌
        userConfig: {
          upsert: {
            create: { sessionToken: token },
            update: { sessionToken: token }
          }
        }
      }
    });
  } catch (error) {
    console.error('更新用户会话令牌失败:', error);
  }
  
  return true;
}

// 创建新用户并存储到数据库
export async function createUser(userData: { username: string, password: string, phone: string }) {
  try {
    console.info(`开始创建新用户: ${userData.phone}`);
    
    // 对密码进行哈希处理
    const hashedPassword = await hash(userData.password, 10);
    console.debug('密码哈希处理完成');
    
    // 创建新用户并存储到数据库
    const newUser = await prisma.user.create({
      data: {
        username: userData.phone, // 使用手机号作为用户名
        password: hashedPassword,
        email: null // 可选字段
      }
    }).catch(error => {
      console.error('数据库创建用户失败', error);
      throw new Error(`数据库创建用户失败: ${error.message}`);
    });
    
    // 将新用户添加到内存缓存
    users[newUser.id] = {
      id: newUser.id,
      username: newUser.username,
      phone: newUser.username, // 假设username字段存储手机号
      password: hashedPassword,
      createdAt: newUser.createdAt.toISOString()
    };
    
    return {
      id: newUser.id,
      username: newUser.username,
      phone: newUser.username,
      createdAt: newUser.createdAt.toISOString()
    };
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

// 验证会话令牌
export async function validateSessionToken(token: string) {
  // 首先从内存中查找
  for (const key in users) {
    if (users[key].sessionToken === token) {
      return users[key];
    }
  }
  
  // 如果内存中没有，尝试从数据库查找
  try {
    const userConfig = await prisma.userConfig.findFirst({
      where: { sessionToken: token },
      include: { user: true }
    });
    
    if (userConfig && userConfig.user) {
      // 将用户信息缓存到内存中
      const user = userConfig.user;
      users[user.id] = {
        id: user.id,
        username: user.username,
        phone: user.username, // 假设username字段存储手机号
        password: user.password,
        sessionToken: token,
        createdAt: user.createdAt.toISOString()
      };
      return users[user.id];
    }
  } catch (error) {
    console.error('验证会话令牌失败:', error);
  }
  
  return null;
}