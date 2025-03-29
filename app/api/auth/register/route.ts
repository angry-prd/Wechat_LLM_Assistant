import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// 直接创建新的Prisma实例，确保使用最新的schema配置
const prisma = new PrismaClient();

// 用户注册接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email } = body;
    
    console.log('收到注册请求:', { 
      username, 
      passwordLength: password ? password.length : 0,
      hasEmail: !!email 
    });
    
    if (!username || !password) {
      console.log('注册失败: 用户名或密码为空');
      return NextResponse.json(
        { success: false, error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 检查用户名是否已存在
    console.log('检查用户名是否已存在:', username);
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          username: username
        }
      });
      
      if (existingUser) {
        console.log('注册失败: 用户名已存在');
        return NextResponse.json(
          { success: false, error: '用户名已存在' },
          { status: 409 }
        );
      }
    } catch (err) {
      console.error('检查用户名时出错:', err);
    }
    
    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      console.log('检查邮箱是否已存在:', email);
      try {
        const existingEmail = await prisma.user.findUnique({
          where: {
            email: email
          }
        });
        
        if (existingEmail) {
          console.log('注册失败: 邮箱已被注册');
          return NextResponse.json(
            { success: false, error: '邮箱已被注册' },
            { status: 409 }
          );
        }
      } catch (err) {
        console.error('检查邮箱时出错:', err);
      }
    }
    
    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('创建用户:', { username, hasPassword: !!hashedPassword, email: email || '无' });
    
    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        ...(email && { email })
      }
    });
    
    console.log('用户创建成功, ID:', newUser.id);
    
    // 返回创建成功的用户信息（不包含密码）
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('注册失败:', error);
    // 获取详细错误信息
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : '未知错误';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('错误详情:', errorMessage);
    if (errorStack) console.error('错误堆栈:', errorStack);
    
    // 修复数据库错误信息，使其对用户更友好
    let userFriendlyError = '注册失败，请稍后再试';
    if (errorMessage.includes('user` does not exist') || 
        errorMessage.includes('users` does not exist')) {
      userFriendlyError = '系统错误：数据库配置问题，请联系管理员';
    }
    
    return NextResponse.json(
      { success: false, error: userFriendlyError, details: errorMessage },
      { status: 500 }
    );
  } finally {
    // 断开Prisma连接
    await prisma.$disconnect();
  }
} 