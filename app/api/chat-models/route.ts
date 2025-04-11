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
  provider: string;
  maxTokens?: number;
  temperature?: number;
  createdAt: Date;
  updatedAt: Date;
}

// GET 获取所有模型配置
export async function GET(request: NextRequest) {
  try {
    console.log('请求获取模型配置');
    
    // 使用默认用户ID
    const authorizedUserId = 'default';
    console.log('使用默认用户ID:', authorizedUserId);
    
    // 从数据库获取模型配置
    const configs = await prisma.chatModel.findMany({
      where: {
        userId: authorizedUserId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`找到${configs.length}个模型配置`);
    
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
    const { 
      name, 
      apiKey, 
      endpoint, 
      model, 
      isDefault,
      provider = 'openai',
      maxTokens,
      temperature = 0.7
    } = body;
    const userId = 'default'; // 使用默认用户ID
    
    console.log('创建模型配置请求:', { 
      name, 
      endpoint, 
      model, 
      isDefault, 
      userId,
      provider,
      maxTokens,
      temperature
    });
    
    if (!name || !apiKey || !endpoint || !model) {
      console.log('创建失败: 缺少必要参数');
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
    
    console.log(`当前用户已有${existingModelsCount}个模型配置`);
    
    // 创建新配置
    const newConfig = await prisma.chatModel.create({
      data: {
        name,
        apiKey,
        endpoint,
        model,
        isDefault: isDefault || existingModelsCount === 0, // 如果是第一个配置，默认设为默认
        userId,
        provider,
        maxTokens,
        temperature
      }
    });
    
    console.log('模型配置创建成功:', { id: newConfig.id, name: newConfig.name });
    
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
    const { 
      id, 
      name, 
      apiKey, 
      endpoint, 
      model, 
      isDefault,
      provider,
      maxTokens,
      temperature
    } = body;
    const userId = 'default'; // 使用默认用户ID
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少模型ID' },
        { status: 400 }
      );
    }
    
    // 验证模型是否存在
    const existingModel = await prisma.chatModel.findUnique({
      where: { id }
    });
    
    if (!existingModel) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在' },
        { status: 404 }
      );
    }
    
    // 如果设置为默认，将其他配置设为非默认
    if (isDefault) {
      await prisma.chatModel.updateMany({
        where: {
          userId: userId,
          id: { not: id }
        },
        data: {
          isDefault: false
        }
      });
    }
    
    // 更新配置
    const updateData: any = {
      name,
      endpoint,
      model,
      isDefault,
      provider,
      maxTokens,
      temperature
    };
    
    // 只有在提供新的API密钥时才更新
    if (apiKey) {
      updateData.apiKey = apiKey;
    }
    
    const updatedConfig = await prisma.chatModel.update({
      where: { id },
      data: updateData
    });
    
    // 返回时不包含API密钥
    const { apiKey: _, ...safeConfig } = updatedConfig;
    
    return NextResponse.json({ 
      success: true, 
      message: '模型配置已更新',
      data: { ...safeConfig, hasApiKey: !!updatedConfig.apiKey }
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少模型ID' },
        { status: 400 }
      );
    }
    
    // 验证模型是否存在
    const existingModel = await prisma.chatModel.findUnique({
      where: { id }
    });
    
    if (!existingModel) {
      return NextResponse.json(
        { success: false, message: '模型配置不存在' },
        { status: 404 }
      );
    }
    
    // 删除配置
    await prisma.chatModel.delete({
      where: { id }
    });
    
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
