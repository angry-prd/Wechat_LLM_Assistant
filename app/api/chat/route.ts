import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { config } from '@/config/local-config';

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
  role: string;
  content: string;
}

// 请求接口
interface ChatRequest {
  messages: Message[];
  modelId?: string;
  temperature?: number;
  max_tokens?: number;
}

// 获取模型配置
async function getModelConfig(modelId: string | undefined) {
  try {
    // 如果未指定模型ID，尝试获取默认模型配置
    if (!modelId) {
      console.log('未指定模型ID，尝试获取默认模型');
      
      // 先从数据库中查找用户的默认模型
      const defaultModel = await prisma.chatModel.findFirst({
        where: { isDefault: true }
      });
      
      if (defaultModel) {
        console.log('从数据库找到默认模型:', defaultModel.name);
        return defaultModel;
      }
      
      // 如果数据库中没有默认模型，使用配置文件中的默认模型
      console.log('使用配置文件中的默认模型');
      const localDefaultModel = config.aiModel.models.find(model => model.isDefault);
      
      if (localDefaultModel) {
        console.log('使用本地配置的默认模型:', localDefaultModel.name);
        return {
          id: 'local-default',
          name: localDefaultModel.name,
          apiKey: localDefaultModel.apiKey,
          endpoint: localDefaultModel.endpoint,
          model: localDefaultModel.model,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'local'
        };
      }
      
      // 如果没有找到默认模型，返回null
      console.log('未找到默认模型配置');
      return null;
    }
    
    // 如果指定了模型ID，先从数据库查找
    console.log('尝试查找模型ID:', modelId);
    if (modelId !== 'local-default') {
      const model = await prisma.chatModel.findUnique({
        where: { id: modelId }
      });
      
      if (model) {
        console.log('从数据库找到模型:', model.name);
        return model;
      }
    }
    
    // 如果是local-default或在数据库中未找到，从本地配置查找
    const localModel = config.aiModel.models.find(model => 
      model.name === modelId || (modelId === 'local-default' && model.isDefault)
    );
    
    if (localModel) {
      console.log('使用本地配置的模型:', localModel.name);
      return {
        id: 'local-model',
        name: localModel.name,
        apiKey: localModel.apiKey,
        endpoint: localModel.endpoint,
        model: localModel.model,
        isDefault: localModel.isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'local'
      };
    }
    
    console.log('未找到指定的模型配置');
    return null;
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
    
    // 检查是否使用本地模型
    let apiUrl = modelConfig.endpoint;
    
    // 如果配置了使用本地模型且endpoint为空，使用本地模型端点
    if (config.aiModel.useLocalModel && (!modelConfig.endpoint || modelConfig.endpoint === '')) {
      console.log('使用本地模型端点');
      apiUrl = config.aiModel.localModelEndpoint;
    }
    
    // 确保API端点URL是完整的
    if (!apiUrl.includes('/chat/completions')) {
      apiUrl = apiUrl.endsWith('/') ? `${apiUrl}v1/chat/completions` : `${apiUrl}/v1/chat/completions`;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // 只有当API密钥不为空时才添加Authorization头
    if (modelConfig.apiKey && modelConfig.apiKey.trim() !== '') {
      headers['Authorization'] = `Bearer ${modelConfig.apiKey}`;
    }
    
    // 构建请求体 - 支持各类通用LLM API格式
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
    
    // 从数据库获取用户模型配置
    const dbConfigs = await prisma.chatModel.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // 合并本地配置文件中的模型配置
    const localModels = config.aiModel.models.map(model => ({
      id: `local-${model.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: model.name,
      apiKey: model.apiKey,
      endpoint: model.endpoint,
      model: model.model,
      isDefault: model.isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'local'
    }));
    
    // 合并数据库和本地配置的模型
    const allConfigs = [...dbConfigs, ...localModels];
    
    // 如果要获取默认模型
    if (getDefault) {
      const defaultConfig = allConfigs.find(config => config.isDefault) || (allConfigs.length > 0 ? allConfigs[0] : null);
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
        data: { ...safeConfig, hasApiKey: !!apiKey } 
      });
    }
    
    // 返回所有模型的公开信息（不包含API密钥）
    const publicConfigs = allConfigs.map(({ apiKey, ...rest }) => ({
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
