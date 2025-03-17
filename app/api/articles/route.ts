import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库中的文章 - 按用户ID组织
let articles: Record<string, Array<{
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}>> = {};

// 获取用户的所有文章
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    // 如果用户没有文章，返回空数组
    if (!articles[userId]) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(articles[userId]);
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  } {
    console.error('获取文章失败:', error);
    return NextResponse.json(
      { error: '获取文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const { title, content, userId = 'default' } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }
    
    const newArticle = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };
    
    // 如果用户没有文章集合，创建一个
    if (!articles[userId]) {
      articles[userId] = [];
    }
    
    articles[userId].push(newArticle);
    
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  } {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { error: '创建文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request: NextRequest) {
  try {
    const { id, title, content, userId = 'default' } = await request.json();
    
    if (!id || !title || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 检查用户是否有文章
    if (!articles[userId]) {
      return NextResponse.json(
        { error: '用户没有文章' },
        { status: 404 }
      );
    }
    
    const articleIndex = articles[userId].findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    articles[userId][articleIndex] = {
      ...articles[userId][articleIndex],
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(articles[userId][articleIndex]);
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  } {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { error: '更新文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'default';
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 检查用户是否有文章
    if (!articles[userId]) {
      return NextResponse.json(
        { error: '用户没有文章' },
        { status: 404 }
      );
    }
    
    const articleIndex = articles[userId].findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    articles[userId].splice(articleIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  }