import { NextRequest, NextResponse } from 'next/server';

// 导入用户服务和日志记录器
import { findUserByPhone, createUser } from '@/lib/user-service';
import { logger } from '../../../lib/logger';

// 注册新用户
export async function POST(request: NextRequest) {
  try {
    await logger.info('开始处理注册请求');
    const { username, password, phone } = await request.json();
    
    if (!username || !password || !phone) {
      return NextResponse.json(
        { error: '用户名、密码和手机号不能为空' },
        { status: 400 }
      );
    }
    
    // 检查手机号是否已存在
    const existingUser = await findUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 400 }
      );
    }
    
    // 创建新用户并存储到数据库
    const newUser = await createUser({
      username,
      password,
      phone
    });
    
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    await logger.error('注册失败', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: `注册失败：${errorMessage}` },
      { status: 500 }
    );
  }
}