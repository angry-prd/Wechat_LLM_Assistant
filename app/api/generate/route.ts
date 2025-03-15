import { NextRequest, NextResponse } from 'next/server';

// 从本地存储获取用户配置
async function getUserConfig() {
  // 在实际应用中，这里应该从数据库获取用户配置
  // 这里简化为从环境变量获取
  return {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiApiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: '缺少必要的prompt参数' },
        { status: 400 }
      );
    }

    const userConfig = await getUserConfig();
    
    // 检查是否有API配置
    if (userConfig.openaiApiKey && userConfig.openaiApiKey !== 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      // 使用真实的OpenAI API
      console.log('使用OpenAI API生成文章...');
      
      const response = await fetch(`${userConfig.openaiApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userConfig.openaiApiKey}`
        },
        body: JSON.stringify({
          model: userConfig.openaiModel,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的微信公众号内容创作助手，擅长撰写高质量的文章。请用Markdown格式回复，以便于后续编辑和排版。'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json({ content: data.choices[0].message.content });
    } else {
      // 使用模拟数据
      console.log('使用模拟数据生成文章...');
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 根据用户输入生成不同的回复
      let content = '';
      
      if (prompt.toLowerCase().includes('微信运营')) {
        content = `# 微信公众号运营的10个实用技巧

微信公众号已经成为企业和个人展示自我、传播内容的重要平台。如何做好公众号运营，提高粉丝活跃度和文章阅读量？以下是10个实用技巧：

## 1. 明确定位，找准受众

在开始运营公众号前，明确你的目标受众是谁，他们关注什么内容，有什么需求。定位精准才能吸引精准粉丝。

## 2. 内容为王，保持高质量

无论平台如何变化，高质量的内容永远是吸引读者的核心。确保你的文章有价值、有深度、有洞见。

## 3. 保持更新频率稳定

制定内容日历，保持稳定的更新频率，让粉丝形成阅读习惯。每周更新2-3次是比较理想的频率。

## 4. 标题党适度，吸引点击

一个好的标题能大幅提高文章的打开率，但过度标题党会失去读者信任，需要把握好度。

## 5. 排版美观，提升体验

使用微信编辑器的排版功能，加入适当的图片、表情、分割线等元素，让文章更加美观易读。`;
      } else if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('人工智能')) {
        content = `# 人工智能如何改变我们的生活与工作

人工智能(AI)正以前所未有的速度融入我们的日常生活和工作环境。从智能手机助手到自动驾驶汽车，AI技术正在重塑我们与世界互动的方式。

## AI在日常生活中的应用

### 智能家居
智能音箱、智能灯光、智能恒温器等设备通过AI算法学习用户习惯，提供个性化的家居体验。

### 个人助手
Siri、Alexa和Google Assistant等虚拟助手可以帮助我们设置提醒、回答问题、控制设备，甚至讲笑话。

### 健康监测
AI驱动的健康应用和可穿戴设备可以追踪我们的健康状况，提供个性化的健康建议。

## AI在工作场所的变革

### 自动化重复任务
AI可以自动化数据输入、日程安排等重复性任务，让员工专注于更有创造性的工作。

### 数据分析与决策支持
AI系统可以分析海量数据，提取有价值的见解，辅助企业做出更明智的决策。

### 客户服务
聊天机器人和虚拟助手可以24/7提供客户支持，回答常见问题，提高客户满意度。`;
      } else {
        const topic = prompt.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim();
        content = `# ${topic}指南

## 引言
${topic}是当今社会中一个重要的话题。本文将深入探讨其核心要素、发展趋势以及实践建议。

## 核心要素
1. **理解基础概念** - 掌握${topic}的基本原理和关键术语
2. **分析当前趋势** - 了解行业最新发展和创新方向
3. **实践方法论** - 系统化的实施策略和步骤

## 发展趋势
随着技术的不断进步和社会需求的变化，${topic}呈现出以下趋势：

- 数字化转型加速
- 用户体验至上
- 可持续发展理念融入
- 全球化与本地化并重

## 实践建议
要在${topic}领域取得成功，可以考虑以下建议：

1. 持续学习，跟进行业动态
2. 建立专业网络，促进交流合作
3. 实践验证，从实际应用中总结经验
4. 创新思维，寻找差异化竞争优势

## 结语
${topic}是一个充满机遇与挑战的领域。通过深入理解其核心要素，把握发展趋势，并采取有效的实践策略，我们能够在这一领域中获得成功。`;
      }
      
      return NextResponse.json({ content });
    }
  } catch (error) {
    console.error('生成文章失败:', error);
    return NextResponse.json(
      { error: '生成文章失败，请稍后再试' },
      { status: 500 }
    );
  }
}