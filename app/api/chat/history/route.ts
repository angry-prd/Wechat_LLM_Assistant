import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET 获取聊天历史记录
export async function GET(request: NextRequest) {
  try {
    const userId = 'default'; // 使用默认用户ID
    
    // 如果提供了特定的聊天历史ID，则返回该聊天历史
    const url = new URL(request.url);
    const chatId = url.searchParams.get('id');
    
    if (chatId) {
      const chatHistory = await prisma.chatHistory.findFirst({
        where: { 
          id: chatId,
          userId: userId 
        },
      });
      
      if (!chatHistory) {
        return NextResponse.json(
          { success: false, message: '聊天历史不存在' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        chatHistory,
      });
    }
    
    // 否则返回所有聊天历史
    const histories = await prisma.chatHistory.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' },
    });
    
    console.log(`找到${histories.length}条聊天历史`);
    
    return NextResponse.json({
      success: true,
      histories,
    });
  } catch (error) {
    console.error('获取聊天历史记录失败:', error);
    return NextResponse.json(
      { success: false, message: '获取聊天历史记录失败' },
      { status: 500 }
    );
  }
}

// POST 保存聊天历史记录
export async function POST(request: NextRequest) {
  try {
    const userId = 'default'; // 使用默认用户ID
    const { title, messages } = await request.json();
    
    console.log('保存聊天历史:', { title, messagesType: typeof messages });
    
    if (!title) {
      return NextResponse.json(
        { success: false, message: '缺少标题' },
        { status: 400 }
      );
    }
    
    if (!messages) {
      return NextResponse.json(
        { success: false, message: '缺少聊天内容' },
        { status: 400 }
      );
    }
    
    // 确保messages是字符串格式
    const messagesString = typeof messages === 'string' ? messages : JSON.stringify(messages);
    
    const chatHistory = await prisma.chatHistory.create({
      data: {
        title,
        messages: messagesString,
        userId: userId,
      },
    });
    
    console.log('聊天历史保存成功，ID:', chatHistory.id);
    
    return NextResponse.json({
      success: true,
      chatHistory: {
        id: chatHistory.id,
        title: chatHistory.title,
        createdAt: chatHistory.createdAt,
        updatedAt: chatHistory.updatedAt
      },
    });
  } catch (error) {
    console.error('保存聊天历史记录失败:', error);
    return NextResponse.json(
      { success: false, message: '保存聊天历史记录失败' },
      { status: 500 }
    );
  }
}

// PUT 更新聊天历史记录
export async function PUT(request: NextRequest) {
  try {
    const userId = 'default'; // 使用默认用户ID
    const { id, title, messages } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少聊天历史ID' },
        { status: 400 }
      );
    }
    
    // 验证聊天历史是否存在
    const existingHistory = await prisma.chatHistory.findFirst({
      where: { 
        id: id,
        userId: userId 
      },
    });
    
    if (!existingHistory) {
      return NextResponse.json(
        { success: false, message: '聊天历史不存在' },
        { status: 404 }
      );
    }
    
    // 准备更新数据
    const updateData: any = {};
    if (title) updateData.title = title;
    if (messages) {
      updateData.messages = typeof messages === 'string' ? messages : JSON.stringify(messages);
    }
    
    // 更新聊天历史
    const updatedHistory = await prisma.chatHistory.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      chatHistory: {
        id: updatedHistory.id,
        title: updatedHistory.title,
        createdAt: updatedHistory.createdAt,
        updatedAt: updatedHistory.updatedAt
      },
    });
  } catch (error) {
    console.error('更新聊天历史记录失败:', error);
    return NextResponse.json(
      { success: false, message: '更新聊天历史记录失败' },
      { status: 500 }
    );
  }
}

// DELETE 删除聊天历史记录
export async function DELETE(request: NextRequest) {
  try {
    const userId = 'default'; // 使用默认用户ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少聊天历史ID' },
        { status: 400 }
      );
    }
    
    // 验证聊天历史是否存在
    const existingHistory = await prisma.chatHistory.findFirst({
      where: { 
        id: id,
        userId: userId 
      },
    });
    
    if (!existingHistory) {
      return NextResponse.json(
        { success: false, message: '聊天历史不存在' },
        { status: 404 }
      );
    }
    
    // 删除聊天历史
    await prisma.chatHistory.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: '聊天历史已删除'
    });
  } catch (error) {
    console.error('删除聊天历史记录失败:', error);
    return NextResponse.json(
      { success: false, message: '删除聊天历史记录失败' },
      { status: 500 }
    );
  }
}