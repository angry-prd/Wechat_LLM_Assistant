import { NextRequest, NextResponse } from 'next/server';

// 导入用户服务
import { findUserByPhone, createUser } from '@/lib/user-service';

// 注册新用户
export async function POST(request: NextRequest) {
  try {
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
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后再试' },
      { status: 500 }
    );
  }
}