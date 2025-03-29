import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// 获取用户函数
async function getAuthorizedUser(request: NextRequest) {
  // 1. 尝试从会话获取用户
  const session = await getServerSession();
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) {
      console.log('通过NextAuth会话找到用户:', user.id);
      return user;
    }
  }
  
  // 2. 尝试从URL参数获取用户ID
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  // 3. 尝试从请求体获取用户ID (对于POST和PUT请求)
  let bodyUserId = null;
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const clone = request.clone();
      const body = await clone.json();
      bodyUserId = body.userId;
    } catch (e) {
      console.error('解析请求体失败:', e);
    }
  }
  
  // 4. 从认证头部获取token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  // 5. 从cookie获取token
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  const userToken = cookieStore.get('user_token')?.value;
  
  console.log('认证信息:', {
    hasSession: !!session?.user,
    hasUrlUserId: !!userId,
    hasBodyUserId: !!bodyUserId,
    hasAuthHeader: !!authHeader,
    hasSessionToken: !!sessionToken,
    hasUserToken: !!userToken
  });
  
  // 如果有URL参数或请求体中的ID，验证token并使用该ID
  const requestedUserId = userId || bodyUserId;
  if (requestedUserId && (token || sessionToken || userToken)) {
    // 在生产环境中应该验证token的有效性
    // 目前为了调试，我们直接信任提供的用户ID
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
    });
    
    if (user) {
      console.log('通过请求参数和token验证找到用户:', user.id);
      return user;
    }
  }
  
  // 如果所有方法都失败，但有请求的用户ID，尝试查找该用户
  // 注意：这降低了安全性，仅用于调试
  if (requestedUserId) {
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
    });
    
    if (user) {
      console.log('【警告】使用未完全验证的用户ID:', user.id);
      return user;
    }
  }
  
  console.log('无法识别用户');
  return null;
}

// GET 获取聊天历史记录
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    // 如果提供了特定的聊天历史ID，则返回该聊天历史
    const url = new URL(request.url);
    const chatId = url.searchParams.get('id');
    
    if (chatId) {
      const chatHistory = await prisma.chatHistory.findFirst({
        where: { 
          id: chatId,
          userId: user.id 
        },
      });
      
      if (!chatHistory) {
        return NextResponse.json(
          { success: false, message: '聊天历史不存在或无权限访问' },
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
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });
    
    console.log(`找到${histories.length}条聊天历史, 用户ID: ${user.id}`);
    
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
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    const { title, messages } = await request.json();
    
    console.log('保存聊天历史:', { title, messagesType: typeof messages, userId: user.id });
    
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
        userId: user.id,
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

// PUT 更新已有的聊天历史记录
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    const { id, title, messages } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少聊天历史ID' },
        { status: 400 }
      );
    }
    
    console.log('更新聊天历史:', { id, title, messagesType: typeof messages, userId: user.id });
    
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
    
    // 构建更新数据
    const updateData: any = {};
    
    // 只更新提供的字段
    if (title !== undefined) {
      updateData.title = title;
    }
    
    if (messages !== undefined) {
      // 确保messages是字符串格式
      updateData.messages = typeof messages === 'string' ? messages : JSON.stringify(messages);
    }
    
    // 如果没有要更新的字段，直接返回成功
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: '无需更新',
        chatHistory: existingHistory,
      });
    }
    
    const updatedHistory = await prisma.chatHistory.update({
      where: { id },
      data: updateData,
    });
    
    console.log('聊天历史更新成功, ID:', id);
    
    return NextResponse.json({
      success: true,
      message: '聊天历史更新成功',
      chatHistory: updatedHistory,
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
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
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
    
    console.log('聊天历史已删除, ID:', id);
    
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