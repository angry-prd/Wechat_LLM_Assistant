import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 模型配置接口
interface ModelConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
  isDefault?: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET 获取所有模型配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    
    // 从数据库获取模型配置
    const configs = await prisma.chatModel.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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
    const { name, apiKey, endpoint, model, isDefault, userId = 'default' } = body;
    
    if (!name || !apiKey || !endpoint || !model) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 如果设置为默认，将其他配置设为非默认
    if (isDefault) {
      await prisma.chatModel.updateMany({
        where: {
          userId: userId
        },
        data: {
          isDefault: false
        }
      });
    }
    
    // 检查是否有现有模型
    const existingModelsCount = await prisma.chatModel.count({
      where: {
        userId: userId
      }
    });
    
    // 创建新配置
    const newConfig = await prisma.chatModel.create({
      data: {
        name,
        apiKey,
        endpoint,
        model,
        isDefault: isDefault || existingModelsCount === 0, // 如果是第一个配置，默认设为默认
        userId
      }
    });
    
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
    const { id, name, apiKey, endpoint, model, isDefault, userId = 'default' } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少ID参数' },
        { status: 400 }
      );
    }
    
    // 检查模型配置是否存在
    const existingConfig = await prisma.chatModel.findUnique({
      where: {
        id: id
      }
    });
    
    if (!existingConfig) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在' },
        { status: 404 }
      );
    }
    
    // 如果设置为默认，将其他配置设为非默认
    if (isDefault) {
      await prisma.chatModel.updateMany({
        where: {
          userId: userId
        },
        data: {
          isDefault: false
        }
      });
    }
    
    // 准备更新数据
    const updateData: any = {};
    if (name) updateData.name = name;
    if (apiKey) updateData.apiKey = apiKey;
    if (endpoint) updateData.endpoint = endpoint;
    if (model) updateData.model = model;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    
    // 更新配置
    const updatedConfig = await prisma.chatModel.update({
      where: {
        id: id
      },
      data: updateData
    });
    
    // 返回时不包含API密钥
    const { apiKey: _, ...safeConfig } = updatedConfig;
    
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
    const userId = url.searchParams.get('userId') || 'default';
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少ID参数' },
        { status: 400 }
      );
    }
    
    // 检查模型配置是否存在
    const existingConfig = await prisma.chatModel.findUnique({
      where: {
        id: id
      }
    });
    
    if (!existingConfig) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在' },
        { status: 404 }
      );
    }
    
    // 删除配置
    await prisma.chatModel.delete({
      where: {
        id: id
      }
    });
    
    // 如果删除了默认配置且还有其他配置，设置第一个为默认
    const remainingConfigs = await prisma.chatModel.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    if (remainingConfigs.length > 0 && !remainingConfigs.some(config => config.isDefault)) {
      await prisma.chatModel.update({
        where: {
          id: remainingConfigs[0].id
        },
        data: {
          isDefault: true
        }
      });
    }
    
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
