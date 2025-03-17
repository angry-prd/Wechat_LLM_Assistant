import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库中的用户
let users: Record<string, any> = {};

// 注册新用户
export async function POST(request: NextRequest) {
  try {
    const { username, password, email } = await request.json();
    
    if (!username || !password || !email) {
      return NextResponse.json(
        { error: '用户名、密码和邮箱不能为空' },
        { status: 400 }
      );
    }
    
    // 检查用户名是否已存在
    if (users[username]) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }
    
    // 创建新用户（实际应用中应该对密码进行哈希处理）
    const newUser = {
      username,
      password, // 注意：实际应用中应该存储哈希后的密码
      email,
      createdAt: new Date().toISOString(),
    };
    
    users[username] = newUser;
    
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        username: newUser.username,
        email: newUser.email,
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