import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 文章接口
interface ArticleData {
  id?: string;
  title: string;
  content: string;
  status?: string;
}

// GET 获取所有文章
export async function GET(request: NextRequest) {
  try {
    const userId = 'default'; // 使用默认用户ID
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');
    
    // 如果提供了特定文章ID，返回该文章
    if (articleId) {
      const article = await prisma.article.findFirst({
        where: {
          id: articleId
        }
      });
      
      if (!article) {
        return NextResponse.json(
          { success: false, message: '文章不存在' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        article
      });
    }
    
    // 否则返回所有文章
    console.log('获取所有文章');
    
    // 从数据库获取文章
    const articles = await prisma.article.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`找到${articles.length}篇文章`);
    
    return NextResponse.json({
      success: true,
      articles
    });
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json(
      { success: false, message: '获取文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// POST 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, status = '草稿' } = body;
    
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: '标题和内容不能为空' },
        { status: 400 }
      );
    }
    
    // 创建新文章
    const article = await prisma.article.create({
      data: {
        title,
        content,
        status
      }
    });
    
    console.log('文章创建成功:', article.id);
    
    return NextResponse.json({
      success: true,
      message: '文章创建成功',
      article
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json(
      { success: false, message: '创建文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// PUT 更新文章
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, status } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 验证文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, message: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 准备更新数据
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (status) updateData.status = status;
    
    // 更新文章
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData
    });
    
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

// DELETE 删除文章
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 验证文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, message: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 删除文章
    await prisma.article.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { success: false, message: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}