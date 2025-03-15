import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 配置文件路径
const CONFIG_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'chat-models.json');

// 模型配置接口
interface ModelConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 确保配置目录和文件存在
function ensureConfigExists() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify([], null, 2));
  }
}

// 获取所有模型配置
function getModelConfigs(): ModelConfig[] {
  ensureConfigExists();
  const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(data);
}

// 保存模型配置
function saveModelConfigs(configs: ModelConfig[]) {
  ensureConfigExists();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2));
}

// GET 获取所有模型配置
export async function GET() {
  try {
    const configs = getModelConfigs();
    // 返回配置时不包含API密钥
    const safeConfigs = configs.map(({ apiKey, ...rest }) => ({
      ...rest,
      hasApiKey: !!apiKey
    }));
    return NextResponse.json({ success: true, data: safeConfigs });
  } catch (error) {
    console.error('获取模型配置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取模型配置失败' },
      { status: 500 }
    );
  }
}

// POST 创建新的模型配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, apiKey, endpoint, model, isDefault } = body;
    
    if (!name || !apiKey || !endpoint || !model) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const configs = getModelConfigs();
    
    // 如果设置为默认，将其他配置设为非默认
    if (isDefault) {
      configs.forEach(config => {
        config.isDefault = false;
      });
    }
    
    // 创建新配置
    const newConfig: ModelConfig = {
      id: crypto.randomUUID(),
      name,
      apiKey,
      endpoint,
      model,
      isDefault: isDefault || configs.length === 0, // 如果是第一个配置，默认设为默认
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    configs.push(newConfig);
    saveModelConfigs(configs);
    
    // 返回时不包含API密钥
    const { apiKey: _, ...safeConfig } = newConfig;
    
    return NextResponse.json({ 
      success: true, 
      message: '模型配置已创建', 
      data: { ...safeConfig, hasApiKey: true } 
    });
  } catch (error) {
    console.error('创建模型配置失败:', error);
    return NextResponse.json(
      { success: false, message: '创建模型配置失败' },
      { status: 500 }
    );
  }
}

// PUT 更新模型配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, apiKey, endpoint, model, isDefault } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少ID参数' },
        { status: 400 }
      );
    }
    
    let configs = getModelConfigs();
    const configIndex = configs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在' },
        { status: 404 }
      );
    }
    
    // 如果设置为默认，将其他配置设为非默认
    if (isDefault) {
      configs.forEach(config => {
        config.isDefault = false;
      });
    }
    
    // 更新配置
    configs[configIndex] = {
      ...configs[configIndex],
      name: name || configs[configIndex].name,
      apiKey: apiKey || configs[configIndex].apiKey,
      endpoint: endpoint || configs[configIndex].endpoint,
      model: model || configs[configIndex].model,
      isDefault: isDefault !== undefined ? isDefault : configs[configIndex].isDefault,
      updatedAt: new Date().toISOString()
    };
    
    saveModelConfigs(configs);
    
    // 返回时不包含API密钥
    const { apiKey: _, ...safeConfig } = configs[configIndex];
    
    return NextResponse.json({ 
      success: true, 
      message: '模型配置已更新', 
      data: { ...safeConfig, hasApiKey: true } 
    });
  } catch (error) {
    console.error('更新模型配置失败:', error);
    return NextResponse.json(
      { success: false, message: '更新模型配置失败' },
      { status: 500 }
    );
  }
}

// DELETE 删除模型配置
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少ID参数' },
        { status: 400 }
      );
    }
    
    let configs = getModelConfigs();
    const configIndex = configs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在' },
        { status: 404 }
      );
    }
    
    // 删除配置
    configs.splice(configIndex, 1);
    
    // 如果删除了默认配置且还有其他配置，设置第一个为默认
    if (configs.length > 0 && !configs.some(config => config.isDefault)) {
      configs[0].isDefault = true;
    }
    
    saveModelConfigs(configs);
    
    return NextResponse.json({ 
      success: true, 
      message: '模型配置已删除'
    });
  } catch (error) {
    console.error('删除模型配置失败:', error);
    return NextResponse.json(
      { success: false, message: '删除模型配置失败' },
      { status: 500 }
    );
  }
}
