import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 配置文件路径
const CONFIG_FILE = path.join(process.cwd(), 'data', 'chat-models.json');

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

// 获取模型配置
function getModelConfig(modelId: string): ModelConfig | null {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  
  const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const configs: ModelConfig[] = JSON.parse(data);
  
  if (modelId) {
    return configs.find(config => config.id === modelId) || null;
  }
  
  // 如果未指定modelId，返回默认配置
  return configs.find(config => config.isDefault) || (configs.length > 0 ? configs[0] : null);
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
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在，请先配置模型' },
        { status: 404 }
      );
    }
    
    // 根据不同的模型配置构建请求
    const apiUrl = modelConfig.endpoint;
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
    
    if (!fs.existsSync(CONFIG_FILE)) {
      if (getDefault) {
        return NextResponse.json(
          { success: false, message: '没有配置默认模型' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: [] });
    }
    
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const configs: ModelConfig[] = JSON.parse(data);
    
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
