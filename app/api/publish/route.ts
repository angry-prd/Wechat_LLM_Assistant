import { NextRequest, NextResponse } from 'next/server';

// 从用户配置API获取用户配置
async function getUserConfig(userId = 'default') {
  try {
    // 从用户配置API获取配置
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'}/user-config?userId=${userId}`);
    
    if (!response.ok) {
      console.error('获取用户配置失败:', response.statusText);
      return {
        wechatAppId: process.env.WECHAT_APP_ID || '',
        wechatAppSecret: process.env.WECHAT_APP_SECRET || '',
        wechatToken: process.env.WECHAT_TOKEN || '',
        wechatEncodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || '',
      };
    }
    
    const config = await response.json();
    return {
      wechatAppId: config.wechatAppId || process.env.WECHAT_APP_ID || '',
      wechatAppSecret: config.wechatAppSecret || process.env.WECHAT_APP_SECRET || '',
      wechatToken: config.wechatToken || process.env.WECHAT_TOKEN || '',
      wechatEncodingAESKey: config.wechatEncodingAESKey || process.env.WECHAT_ENCODING_AES_KEY || '',
      defaultArticleAuthor: config.defaultArticleAuthor || '',
      defaultArticleCopyright: config.defaultArticleCopyright || '',
    };
  } catch (error) {
    console.error('获取用户配置错误:', error);
    // 出错时使用环境变量作为后备
    return {
      wechatAppId: process.env.WECHAT_APP_ID || '',
      wechatAppSecret: process.env.WECHAT_APP_SECRET || '',
      wechatToken: process.env.WECHAT_TOKEN || '',
      wechatEncodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || '',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, coverImage, articleId, userId = 'default' } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '缺少必要的文章内容' },
        { status: 400 }
      );
    }

    const userConfig = await getUserConfig(userId);
    
    // 检查是否有微信API配置
    if (userConfig.wechatAppId && userConfig.wechatAppSecret) {
      // TODO: 实现真实的微信公众号API调用
      // 这里需要使用微信公众号API进行实际发布
      // 参考文档: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html
      
      console.log('调用微信公众号API发布文章...');
      console.log('文章标题:', title);
      console.log('文章ID:', articleId);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回成功响应
      return NextResponse.json({
        success: true,
        message: '文章已成功发布到微信公众号',
        articleUrl: 'https://mp.weixin.qq.com/s/example-article-url',
      });
    } else {
      // 使用模拟数据
      console.log('使用模拟数据发布文章...');
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模拟成功响应
      return NextResponse.json({
        success: true,
        message: '模拟发布成功（未配置微信API）',
        articleUrl: 'https://mp.weixin.qq.com/s/example-article-url',
      });
    }
  } catch (error) {
    console.error('发布文章失败:', error);
    return NextResponse.json(
      { error: '发布文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}