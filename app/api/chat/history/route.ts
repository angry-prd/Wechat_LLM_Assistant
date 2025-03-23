import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// GET 获取聊天历史记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    const histories = await prisma.chatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      histories,
    });
  } catch (error) {
    console.error('Error fetching chat histories:', error);
    return NextResponse.json(
      { success: false, message: '获取聊天历史记录失败' },
      { status: 500 }
    );
  }
}

// POST 保存聊天历史记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    const { title, messages } = await request.json();

    const chatHistory = await prisma.chatHistory.create({
      data: {
        title,
        messages,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      chatHistory,
    });
  } catch (error) {
    console.error('Error saving chat history:', error);
    return NextResponse.json(
      { success: false, message: '保存聊天历史记录失败' },
      { status: 500 }
    );
  }
}