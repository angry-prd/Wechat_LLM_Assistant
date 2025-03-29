import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

// 创建Prisma实例
const prisma = new PrismaClient();

// 密码重置接口
export async function POST(request: NextRequest) {
  try {
    const { username, newPassword } = await request.json();
    console.log(`尝试重置密码: ${username}`);
    
    if (!username || !newPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: '用户名和新密码不能为空',
          errorType: 'validation_error'
        },
        { status: 400 }
      );
    }
    
    // 查找用户
    console.log('查询用户信息...');
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '用户不存在，请先注册账号',
          errorType: 'user_not_found'
        },
        { status: 404 }
      );
    }
    
    // 对新密码进行哈希处理
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新用户密码
    console.log('更新用户密码...');
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    console.log('密码重置成功');
    
    return NextResponse.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('密码重置失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `密码重置失败: ${error}`,
        errorType: 'server_error'
      },
      { status: 500 }
    );
  } finally {
    // 断开Prisma连接
    await prisma.$disconnect();
  }
} 