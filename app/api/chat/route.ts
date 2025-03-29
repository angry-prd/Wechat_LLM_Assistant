import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// 模型配置接口
interface ModelConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
  isDefault?: boolean;
}

// 消息接口
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 请求接口
interface ChatRequest {
  modelId: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

// 获取模型配置 - 从数据库获取
async function getModelConfig(modelId: string): Promise<ModelConfig | null> {
  try {
    console.log('获取模型配置，模型ID:', modelId);
    
    // 获取当前用户
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    // 从请求头中获取userId（如果由前端传递）
    let userId = null;
    
    console.log('会话信息:', { 
      hasSession: !!session, 
      userEmail
    });
    
    // 如果没有通过会话找到用户，直接通过modelId查找
    if (modelId) {
      console.log('直接使用模型ID查找:', modelId);
      const modelConfig = await prisma.chatModel.findUnique({
        where: {
          id: modelId
        }
      });
      
      if (modelConfig) {
        console.log('找到模型配置:', modelConfig.name);
        return modelConfig;
      }
    }
    
    if (!userEmail) {
      console.log('未通过会话找到用户，尝试使用默认用户');
      
      // 如果未指定modelId，尝试获取默认用户的默认模型
      const defaultModelConfig = await prisma.chatModel.findFirst({
        where: {
          userId: 'default',
          isDefault: true
        }
      });
      
      if (defaultModelConfig) {
        console.log('使用默认用户的默认模型:', defaultModelConfig.name);
        return defaultModelConfig;
      }
      
      // 获取默认用户的第一个模型
      const firstDefaultModel = await prisma.chatModel.findFirst({
        where: {
          userId: 'default'
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      if (firstDefaultModel) {
        console.log('使用默认用户的第一个模型:', firstDefaultModel.name);
        return firstDefaultModel;
      }
      
      console.error('未登录且找不到默认模型');
      return null;
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      // 尝试通过用户名查找
      const userByUsername = await prisma.user.findUnique({
        where: { username: userEmail }
      });
      
      if (!userByUsername) {
        console.error('找不到用户记录');
        return null;
      }
      
      console.log('通过用户名找到用户:', userByUsername.username);
      
      // 使用找到的用户ID
      let modelConfig;
      if (modelId) {
        modelConfig = await prisma.chatModel.findFirst({
          where: {
            id: modelId,
            userId: userByUsername.id
          }
        });
      } else {
        // 如果未指定modelId，获取默认模型
        modelConfig = await prisma.chatModel.findFirst({
          where: {
            userId: userByUsername.id,
            isDefault: true
          }
        });
        
        // 如果没有默认模型，获取第一个模型
        if (!modelConfig) {
          modelConfig = await prisma.chatModel.findFirst({
            where: {
              userId: userByUsername.id
            },
            orderBy: {
              createdAt: 'asc'
            }
          });
        }
      }
      
      if (modelConfig) {
        console.log('找到模型配置:', modelConfig.name);
      } else {
        console.log('未找到模型配置');
      }
      
      return modelConfig;
    }
    
    console.log('通过邮箱找到用户:', user.email);
    
    // 根据ID获取模型配置
    let modelConfig;
    if (modelId) {
      modelConfig = await prisma.chatModel.findFirst({
        where: {
          id: modelId,
          userId: user.id
        }
      });
    } else {
      // 如果未指定modelId，获取默认模型
      modelConfig = await prisma.chatModel.findFirst({
        where: {
          userId: user.id,
          isDefault: true
        }
      });
      
      // 如果没有默认模型，获取第一个模型
      if (!modelConfig) {
        modelConfig = await prisma.chatModel.findFirst({
          where: {
            userId: user.id
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
      }
    }
    
    if (modelConfig) {
      console.log('找到模型配置:', modelConfig.name);
    } else {
      console.log('未找到模型配置');
    }
    
    return modelConfig;
  } catch (error) {
    console.error('获取模型配置失败:', error);
    return null;
  }
}

// POST 处理聊天请求
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { modelId, messages, temperature = 0.7, max_tokens = 1000 } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: '消息不能为空' },
        { status: 400 }
      );
    }
    
    // 获取模型配置
    const modelConfig = await getModelConfig(modelId);
    if (!modelConfig) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在，请先配置模型' },
        { status: 404 }
      );
    }
    
    // 根据不同的模型配置构建请求
    // 确保API端点URL是完整的
    let apiUrl = modelConfig.endpoint;
    // 如果endpoint不包含'/v1/chat/completions'，则添加
    if (!apiUrl.includes('/chat/completions')) {
      apiUrl = apiUrl.endsWith('/') ? `${apiUrl}v1/chat/completions` : `${apiUrl}/v1/chat/completions`;
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${modelConfig.apiKey}`
    };
    
    // 构建请求体 - 支持各类通用LLM API格式
    // 这里假设使用类OpenAI格式的API
    const requestBody = {
      model: modelConfig.model,
      messages,
      temperature,
      max_tokens
    };
    
    console.log('发送请求到AI服务:', apiUrl);
    console.log('使用模型:', modelConfig.name);
    
    // 发送请求到模型API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('AI模型API响应错误:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          message: '调用AI模型失败', 
          error: errorData || response.statusText 
        },
        { status: response.status }
      );
    }
    
    // 获取API响应
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('处理聊天请求失败:', error);
    return NextResponse.json(
      { success: false, message: '处理聊天请求失败', error: String(error) },
      { status: 500 }
    );
  }
}

// 获取聊天模型配置
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const getDefault = url.searchParams.get('default') === 'true';
    
    // 获取当前用户
    const session = await getServerSession();
    const userEmail = session?.user?.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: '找不到用户' },
        { status: 404 }
      );
    }
    
    // 获取用户的模型配置
    const configs = await prisma.chatModel.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 如果要获取默认模型
    if (getDefault) {
      const defaultConfig = configs.find(config => config.isDefault) || (configs.length > 0 ? configs[0] : null);
      if (!defaultConfig) {
        return NextResponse.json(
          { success: false, message: '没有配置默认模型' },
          { status: 404 }
        );
      }
      // 返回时不包含API密钥
      const { apiKey, ...safeConfig } = defaultConfig;
      return NextResponse.json({ 
        success: true, 
        data: { ...safeConfig, hasApiKey: true } 
      });
    }
    
    // 返回所有模型的公开信息（不包含API密钥）
    const publicConfigs = configs.map(({ apiKey, ...rest }) => ({
      ...rest,
      hasApiKey: !!apiKey
    }));
    
    return NextResponse.json({ success: true, data: publicConfigs });
  } catch (error) {
    console.error('获取模型配置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取模型配置失败' },
      { status: 500 }
    );
  }
}
