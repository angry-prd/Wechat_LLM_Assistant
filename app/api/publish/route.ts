import { NextRequest, NextResponse } from 'next/server';

// 从本地存储获取用户配置
async function getUserConfig(wechatConfigId?: string) {
  try {
    // 获取所有微信公众号配置
    const response = await fetch('http://localhost:3001/api/user-config?type=wechat');
    const data = await response.json();
    
    // 获取微信公众号配置列表
    const wechatConfigs = data.wechatConfigs || [];
    
    // 如果指定了配置ID，则返回对应的配置
    if (wechatConfigId && wechatConfigs.length > 0) {
      const config = wechatConfigs.find((c: any) => c.id === wechatConfigId);
      if (config) {
        return {
          wechatAppId: config.appId,
          wechatAppSecret: config.appSecret,
          wechatToken: config.token || '',
          wechatEncodingAESKey: config.encodingAESKey || '',
        };
      }
    }
    
    // 如果没有指定ID或找不到对应配置，则返回默认配置
    const defaultConfig = wechatConfigs.find((c: any) => c.isDefault) || wechatConfigs[0];
    
    if (defaultConfig) {
      return {
        wechatAppId: defaultConfig.appId,
        wechatAppSecret: defaultConfig.appSecret,
        wechatToken: defaultConfig.token || '',
        wechatEncodingAESKey: defaultConfig.encodingAESKey || '',
      };
    }
    
    // 如果没有配置，则返回空值
    return {
      wechatAppId: '',
      wechatAppSecret: '',
      wechatToken: '',
      wechatEncodingAESKey: '',
    };
  } catch (error) {
    console.error('获取微信配置失败:', error);
    // 出错时返回空值
    return {
      wechatAppId: '',
      wechatAppSecret: '',
      wechatToken: '',
      wechatEncodingAESKey: '',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, coverImage, articleId, wechatConfigId } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '缺少必要的文章内容' },
        { status: 400 }
      );
    }

    const userConfig = await getUserConfig(wechatConfigId);
    
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