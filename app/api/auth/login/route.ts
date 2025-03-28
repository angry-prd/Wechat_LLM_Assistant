import { NextRequest, NextResponse } from 'next/server';

// 导入用户服务
import { findUserByPhone, validateUserPassword, updateUserSessionToken } from '@/lib/user-service';
// 导入共享数据存储
import { users } from '../shared-data';

// 登录接口
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();
    
    if (!phone || !password) {
      return NextResponse.json(
        { error: '手机号和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在（通过手机号查找）
    const user = await findUserByPhone(phone);
    
    if (!user) {
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      );
    }
    
    // 验证密码（使用bcrypt比较哈希值）
    const isPasswordValid = await validateUserPassword(user, password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      );
    }
    
    // 生成会话令牌
    const sessionToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    // 更新用户会话令牌（同时更新内存和数据库）
    await updateUserSessionToken(user, sessionToken);
    
    // 设置响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone
      },
      sessionToken: sessionToken,
      triggerStorageEvent: true
    });
    
    // 设置会话Cookie
    response.cookies.set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });
    
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后再试' },
      { status: 500 }
    );
  }
}