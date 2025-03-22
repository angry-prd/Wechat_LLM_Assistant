import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 文章接口
interface ArticleData {
  id?: string;
  title: string;
  content: string;
  userId: string;
}

// 获取用户的所有文章
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    // 从数据库获取用户文章
    const userArticles = await prisma.article.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(userArticles);
  } catch (error) {
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
    
    // 使用Prisma创建新文章
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        userId
      }
    });
    
    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
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
    
    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: {
        id: id
      }
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 使用Prisma更新文章
    const updatedArticle = await prisma.article.update({
      where: {
        id: id
      },
      data: {
        title,
        content,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
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
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少文章ID' },
        { status: 400 }
      );
    }
    
    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: {
        id: id
      }
    });
    
    if (!existingArticle) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 使用Prisma删除文章
    await prisma.article.delete({
      where: {
        id: id
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}