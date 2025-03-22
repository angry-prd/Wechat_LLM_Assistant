import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 默认用户配置
const defaultConfig = {
  wechatAppId: '',
  wechatAppSecret: '',
  wechatToken: '',
  wechatEncodingAESKey: '',
  defaultArticleAuthor: '微信助手',
  defaultArticleCopyright: '© 2023 微信AI助手',
};

// 获取用户配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    // 从数据库获取用户配置
    const userConfig = await prisma.userConfig.findUnique({
      where: {
        userId: userId
      }
    });
    
    // 如果用户配置不存在，返回默认配置
    if (!userConfig) {
      return NextResponse.json(defaultConfig);
    }
    
    return NextResponse.json(userConfig);
  } catch (error) {
    console.error('获取用户配置失败:', error);
    return NextResponse.json(
      { error: '获取用户配置失败，请稍后再试' },
      { status: 500 }
    );
  }
}

// 更新用户配置
export async function POST(request: NextRequest) {
  try {
    const { userId = 'default', ...configData } = await request.json();
    
    // 查找是否已存在配置
    const existingConfig = await prisma.userConfig.findUnique({
      where: {
        userId: userId
      }
    });
    
    let userConfig;
    
    if (existingConfig) {
      // 更新现有配置
      userConfig = await prisma.userConfig.update({
        where: {
          userId: userId
        },
        data: {
          ...configData,
          updatedAt: new Date()
        }
      });
    } else {
      // 创建新配置
      userConfig = await prisma.userConfig.create({
        data: {
          userId: userId,
          ...configData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    return NextResponse.json(userConfig);
  } catch (error) {
    console.error('更新用户配置失败:', error);
    return NextResponse.json(
      { error: '更新用户配置失败，请稍后再试' },
      { status: 500 }
    );
  }
}