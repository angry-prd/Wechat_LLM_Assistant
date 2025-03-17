import { NextRequest, NextResponse } from 'next/server';

// 从auth路由导入用户数据（在实际应用中应该从数据库获取）
// 注意：这里简化处理，实际应用中应该使用数据库
let users: Record<string, any> = {};

// 登录接口
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 检查用户是否存在
    const user = users[username];
    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 验证密码（实际应用中应该比较哈希值）
    if (user.password !== password) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 生成简单的会话令牌（实际应用中应该使用JWT或其他安全机制）
    const sessionToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    // 在实际应用中，应该将令牌存储在数据库中并设置过期时间
    user.sessionToken = sessionToken;
    
    // 设置Cookie（实际应用中应该设置更多安全选项）
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        username: user.username,
        email: user.email
      }
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