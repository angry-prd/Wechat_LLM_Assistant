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

// PUT 更新已有的聊天历史记录
export async function PUT(request: NextRequest) {
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

    const { id, title, messages } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少聊天历史ID' },
        { status: 400 }
      );
    }

    // 验证聊天历史属于当前用户
    const existingHistory = await prisma.chatHistory.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingHistory) {
      return NextResponse.json(
        { success: false, message: '聊天历史不存在或无权限' },
        { status: 404 }
      );
    }

    const updatedHistory = await prisma.chatHistory.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(messages && { messages }),
      },
    });

    return NextResponse.json({
      success: true,
      chatHistory: updatedHistory,
    });
  } catch (error) {
    console.error('Error updating chat history:', error);
    return NextResponse.json(
      { success: false, message: '更新聊天历史记录失败' },
      { status: 500 }
    );
  }
}

// DELETE 删除聊天历史记录
export async function DELETE(request: NextRequest) {
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

    // 从URL获取历史记录ID
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少聊天历史ID' },
        { status: 400 }
      );
    }

    // 验证聊天历史属于当前用户
    const existingHistory = await prisma.chatHistory.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingHistory) {
      return NextResponse.json(
        { success: false, message: '聊天历史不存在或无权限' },
        { status: 404 }
      );
    }

    await prisma.chatHistory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '聊天历史已删除'
    });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return NextResponse.json(
      { success: false, message: '删除聊天历史记录失败' },
      { status: 500 }
    );
  }
}