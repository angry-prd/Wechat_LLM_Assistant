import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库中的文章
let articles = [
  {
    id: '1',
    title: '微信公众号运营指南',
    content: '# 微信公众号运营指南\n\n微信公众号已经成为企业和个人展示自我、传播内容的重要平台。本文将分享一些实用的运营技巧。\n\n## 1. 明确定位\n\n在开始运营公众号前，明确你的目标受众是谁，他们关注什么内容，有什么需求。定位精准才能吸引精准粉丝。\n\n## 2. 内容为王\n\n无论平台如何变化，高质量的内容永远是吸引读者的核心。确保你的文章有价值、有深度、有洞见。',
    createdAt: new Date('2023-05-15').toISOString(),
    updatedAt: new Date('2023-05-15').toISOString(),
  },
  {
    id: '2',
    title: 'AI在内容创作中的应用',
    content: '# AI在内容创作中的应用\n\n人工智能正在改变内容创作的方式。从自动生成文章到智能排版，AI工具正在帮助创作者提高效率。\n\n## 1. 文本生成\n\n基于大型语言模型的AI可以根据提示生成高质量的文章内容，帮助创作者克服写作瓶颈。\n\n## 2. 内容优化\n\n AI可以分析文章结构和表达，提供改进建议，使文章更加清晰、连贯。',
    createdAt: new Date('2023-06-20').toISOString(),
    updatedAt: new Date('2023-06-25').toISOString(),
  },
];

// 获取所有文章
export async function GET() {
  return NextResponse.json(articles);
}

// 创建新文章
export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    
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
    };
    
    articles.push(newArticle);
    
    return NextResponse.json(newArticle, { status: 201 });
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
    const { id, title, content } = await request.json();
    
    if (!id || !title || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const articleIndex = articles.findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    articles[articleIndex] = {
      ...articles[articleIndex],
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(articles[articleIndex]);
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
    
    const articleIndex = articles.findIndex(article => article.id === id);
    
    if (articleIndex === -1) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    articles.splice(articleIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}