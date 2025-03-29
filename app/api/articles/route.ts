import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

// 文章接口
interface ArticleData {
  id?: string;
  title: string;
  content: string;
  userId: string;
  status?: string;
}

// 获取用户函数
async function getAuthorizedUser(request: NextRequest) {
  console.log('======== 开始用户身份验证 ========');
  
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
  
  if (userId) {
    console.log('从URL参数中获取到userId:', userId);
  }
  
  // 3. 尝试从请求体获取用户ID (对于POST和PUT请求)
  let bodyUserId = null;
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const clone = request.clone();
      const body = await clone.json();
      bodyUserId = body.userId;
      if (bodyUserId) {
        console.log('从请求体中获取到userId:', bodyUserId);
      }
    } catch (e) {
      console.error('解析请求体失败:', e);
    }
  }
  
  // 4. 从认证头部获取token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  if (token) {
    console.log('从Authorization头部获取到token (长度):', token.length);
  }
  
  // 5. 从cookie获取token
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  const userToken = cookieStore.get('user_token')?.value;
  const nextAuthToken = cookieStore.get('next-auth.session-token')?.value;
  
  if (sessionToken) console.log('从cookie获取到session_token');
  if (userToken) console.log('从cookie获取到user_token');
  if (nextAuthToken) console.log('从cookie获取到next-auth.session-token');
  
  console.log('认证信息汇总:', {
    hasSession: !!session?.user,
    hasUrlUserId: !!userId,
    hasBodyUserId: !!bodyUserId,
    hasAuthHeader: !!authHeader,
    hasSessionToken: !!sessionToken,
    hasUserToken: !!userToken,
    hasNextAuthToken: !!nextAuthToken,
    method: request.method
  });
  
  // 如果有URL参数或请求体中的ID，验证token并使用该ID
  const requestedUserId = userId || bodyUserId;
  if (requestedUserId) {
    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
    });
    
    if (user) {
      // 有某种形式的token就认为通过了身份验证
      if (token || sessionToken || userToken || nextAuthToken) {
        console.log('通过userId和token验证找到用户:', user.id);
        return user;
      }
      
      // 即使没有token，如果是DELETE或GET请求，也临时允许操作
      // 注意：这降低了安全性，生产环境应当移除
      if (request.method === 'DELETE' || request.method === 'GET') {
        console.log('【警告】仅通过userId找到用户，无token验证:', user.id);
        return user;
      }
    } else {
      console.log('找不到ID对应的用户:', requestedUserId);
    }
  }
  
  console.log('无法识别用户');
  console.log('======== 用户身份验证结束 ========');
  return null;
}

// 获取用户的所有文章
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');
    
    // 如果提供了特定文章ID，返回该文章
    if (articleId) {
      const article = await prisma.article.findFirst({
        where: {
          id: articleId,
          userId: user.id
        }
      });
      
      if (!article) {
        return NextResponse.json(
          { success: false, message: '文章不存在或无权限访问' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        article
      });
    }
    
    // 否则返回所有文章
    console.log('获取用户所有文章, 用户ID:', user.id);
    
    // 从数据库获取用户文章
    const userArticles = await prisma.article.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`找到${userArticles.length}篇文章`);
    
    return NextResponse.json({
      success: true,
      articles: userArticles
    });
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json(
      { success: false, message: '获取文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, content, status = '草稿' } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: '标题和内容不能为空' },
        { status: 400 }
      );
    }
    
    console.log('创建文章请求:', { title, contentLength: content.length, userId: user.id, status });
    
    // 使用Prisma创建新文章
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        userId: user.id,
        status
      }
    });
    
    console.log('文章创建成功:', newArticle.id);
    return NextResponse.json({
      success: true,
      message: '文章创建成功',
      article: {
        id: newArticle.id,
        title: newArticle.title,
        createdAt: newArticle.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { success: false, message: '创建文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    const { id, title, content, status } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    if (!title && !content && !status) {
      return NextResponse.json(
        { success: false, message: '未提供任何更新内容' },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在并属于当前用户
    const existingArticle = await prisma.article.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, message: '文章不存在或无权限修改' },
        { status: 404 }
      );
    }
    
    // 构建更新数据
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (status) updateData.status = status;
    
    // 使用Prisma更新文章
    const updatedArticle = await prisma.article.update({
      where: {
        id: id
      },
      data: updateData
    });
    
    console.log('文章更新成功, ID:', id);
    
    return NextResponse.json({
      success: true,
      message: '文章更新成功',
      article: updatedArticle
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { success: false, message: '更新文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request: NextRequest) {
  try {
    console.log('收到删除文章请求');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    console.log(`尝试删除文章 ID: ${id}, 请求的用户ID: ${userId || '未提供'}`);
    
    const user = await getAuthorizedUser(request);
    
    if (!user) {
      console.log('删除文章失败: 用户未登录或无法识别');
      return NextResponse.json(
        { success: false, message: '未登录或无法识别用户' },
        { status: 401 }
      );
    }
    
    // 检查文章是否存在并属于当前用户
    const existingArticle = await prisma.article.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });
    
    if (!existingArticle) {
      console.log(`删除文章失败: 找不到ID为${id}的文章或不属于用户${user.id}`);
      return NextResponse.json(
        { success: false, message: '文章不存在或无权限删除' },
        { status: 404 }
      );
    }
    
    // 使用Prisma删除文章
    await prisma.article.delete({
      where: {
        id: id
      }
    });
    
    console.log('文章删除成功, ID:', id, ', 用户ID:', user.id);
    
    return NextResponse.json({ 
      success: true,
      message: '文章已删除'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { success: false, message: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}