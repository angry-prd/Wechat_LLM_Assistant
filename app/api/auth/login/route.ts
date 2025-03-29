import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// 直接创建新的Prisma实例，确保使用最新的schema配置
const prisma = new PrismaClient();

// 登录接口
export async function POST(request: NextRequest) {
  try {
    console.log('收到登录请求');
    const { username, password } = await request.json();
    console.log(`尝试登录用户: ${username}`);
    
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: '用户名和密码不能为空',
          errorType: 'validation_error'
        },
        { status: 400 }
      );
    }
    
    // 查找用户
    console.log('查询用户信息...');
    const user = await prisma.user.findUnique({
      where: {
        username: username
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '账号不存在，请先注册',
          errorType: 'user_not_found'
        },
        { status: 401 }
      );
    }
    
    console.log(`找到用户: ${user.username}`);
    
    // 验证密码
    console.log('验证密码...');
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: '密码错误，请重新输入',
          errorType: 'invalid_password'
        },
        { status: 401 }
      );
    }
    
    console.log('密码验证成功');
    
    // 生成会话令牌
    console.log('生成会话令牌...');
    const sessionToken = uuidv4();
    
    // 更新用户配置，设置会话令牌
    console.log('更新用户配置...');
    try {
      let userConfig = await prisma.userConfig.findUnique({
        where: { userId: user.id }
      });
      
      if (userConfig) {
        // 如果用户配置已存在，更新会话令牌
        console.log('更新现有用户配置');
        await prisma.userConfig.update({
          where: { userId: user.id },
          data: { sessionToken }
        });
      } else {
        // 如果用户配置不存在，创建新的用户配置
        console.log('创建新用户配置');
        await prisma.userConfig.create({
          data: {
            userId: user.id,
            sessionToken
          }
        });
      }
      
      console.log('用户配置更新成功');
    } catch (error) {
      console.error('更新用户配置失败:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: `更新用户配置失败: ${error}`,
          errorType: 'server_error'
        },
        { status: 500 }
      );
    }
    
    // 设置响应
    console.log('构建响应数据...');
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      sessionToken
    });
    
    // 设置会话Cookie
    console.log('设置cookies...');
    response.cookies.set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });
    
    // 设置用户信息到localStorage用的cookie
    response.cookies.set({
      name: 'user_info',
      value: JSON.stringify({
        id: user.id,
        username: user.username
      }),
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });
    
    console.log('登录成功');
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `登录失败: ${error}`,
        errorType: 'server_error'
      },
      { status: 500 }
    );
  } finally {
    // 断开Prisma连接
    await prisma.$disconnect();
  }
}