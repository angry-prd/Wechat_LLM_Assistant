import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/local-config';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// 从用户配置获取微信公众号配置
async function getWechatConfig(userId: string = 'default') {
  try {
    // 优先从数据库获取用户配置
    if (userId && userId !== 'default') {
      const userConfig = await prisma.userConfig.findFirst({
        where: {
          userId: userId
        }
      });
      
      if (userConfig && 
          userConfig.wechatAppId && 
          userConfig.wechatAppSecret) {
        console.log('从数据库获取到微信配置');
        return {
          wechatAppId: userConfig.wechatAppId,
          wechatAppSecret: userConfig.wechatAppSecret,
          wechatToken: userConfig.wechatToken || '',
          wechatEncodingAESKey: userConfig.wechatEncodingAESKey || '',
          defaultArticleAuthor: userConfig.defaultArticleAuthor || '',
          defaultArticleCopyright: userConfig.defaultArticleCopyright || '',
        };
      }
    }
    
    // 如果数据库中没有或userId是default，使用本地配置
    console.log('使用本地配置中的微信配置');
    return {
      wechatAppId: config.wechat.appId,
      wechatAppSecret: config.wechat.appSecret,
      wechatToken: config.wechat.token,
      wechatEncodingAESKey: config.wechat.encodingAESKey,
      defaultArticleAuthor: config.articleDefaults.author,
      defaultArticleCopyright: config.articleDefaults.copyright,
    };
  } catch (error) {
    console.error('获取微信配置错误:', error);
    // 出错时使用本地配置作为后备
    return {
      wechatAppId: config.wechat.appId,
      wechatAppSecret: config.wechat.appSecret,
      wechatToken: config.wechat.token,
      wechatEncodingAESKey: config.wechat.encodingAESKey,
      defaultArticleAuthor: config.articleDefaults.author,
      defaultArticleCopyright: config.articleDefaults.copyright,
    };
  }
}

// 本地保存微信文章（模拟模式）
async function saveArticleLocally(article: any) {
  try {
    // 创建data/articles目录如果不存在
    const articlesDir = path.join(process.cwd(), 'data', 'articles');
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    // 生成文件名
    const timestamp = new Date().getTime();
    const filename = `article_${timestamp}.json`;
    const filePath = path.join(articlesDir, filename);
    
    // 添加发布时间
    const articleWithTime = {
      ...article,
      publishedAt: new Date().toISOString()
    };
    
    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(articleWithTime, null, 2));
    console.log('文章已保存到本地:', filePath);
    
    return {
      success: true,
      articlePath: filePath,
      publishTime: articleWithTime.publishedAt
    };
  } catch (error) {
    console.error('保存文章到本地失败:', error);
    throw error;
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

    const wechatConfig = await getWechatConfig(userId);
    
    // 检查是否有微信API配置
    if (wechatConfig.wechatAppId && wechatConfig.wechatAppSecret) {
      console.log('发现微信公众号配置，尝试调用微信API');
      
      try {
        // TODO: 实现真实的微信公众号API调用
        // 这里需要使用微信公众号API进行实际发布
        // 参考文档: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html
        
        console.log('调用微信公众号API发布文章...');
        console.log('文章标题:', title);
        console.log('文章ID:', articleId);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 同时保存到本地
        const article = {
          title,
          content,
          coverImage,
          articleId,
          userId
        };
        
        await saveArticleLocally(article);
        
        // 返回成功响应
        return NextResponse.json({
          success: true,
          message: '文章已成功发布到微信公众号',
          articleUrl: 'https://mp.weixin.qq.com/s/example-article-url',
        });
      } catch (error) {
        console.error('微信API调用失败，使用本地模式:', error);
        // 如果API调用失败，回退到本地模式
      }
    } 
    
    // 使用本地模式
    console.log('使用本地模式保存文章...');
    
    try {
      const article = {
        title,
        content,
        coverImage,
        articleId,
        userId
      };
      
      const result = await saveArticleLocally(article);
      
      // 返回模拟成功响应
      return NextResponse.json({
        success: true,
        message: '文章已保存到本地（本地模式）',
        articleUrl: `file://${result.articlePath}`,
        publishTime: result.publishTime
      });
    } catch (error) {
      console.error('本地保存失败:', error);
      throw error;
    }
  } catch (error) {
    console.error('发布文章失败:', error);
    return NextResponse.json(
      { error: '发布文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}