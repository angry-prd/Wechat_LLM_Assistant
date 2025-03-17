import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库中的用户配置
let userConfigs: Record<string, any> = {
  'default': {
    openaiApiKey: '',
    openaiApiUrl: 'https://api.openai.com/v1',
    openaiModel: 'gpt-3.5-turbo',
    wechatAppId: '',
    wechatAppSecret: '',
    wechatToken: '',
    wechatEncodingAESKey: '',
    defaultArticleAuthor: '微信助手',
    defaultArticleCopyright: '© 2023 微信AI助手',
    wechatConfigs: [] // 存储多个微信公众号配置
  }
};

// 获取用户配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    const configType = searchParams.get('type');
    
    // 如果用户配置不存在，返回默认配置
    if (!userConfigs[userId]) {
      userConfigs[userId] = { ...userConfigs['default'] };
    }
    
    // 如果请求特定类型的配置
    if (configType === 'wechat') {
      return NextResponse.json({
        wechatConfigs: userConfigs[userId].wechatConfigs || []
      });
    }
    
    return NextResponse.json(userConfigs[userId]);
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
    
    // 如果用户配置不存在，创建新配置
    if (!userConfigs[userId]) {
      userConfigs[userId] = { ...userConfigs['default'] };
    }
    
    // 更新配置
    userConfigs[userId] = {
      ...userConfigs[userId],
      ...configData,
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(userConfigs[userId]);
  } catch (error) {
    console.error('更新用户配置失败:', error);
    return NextResponse.json(
      { error: '更新用户配置失败，请稍后再试' },
      { status: 500 }
    );
  }
}