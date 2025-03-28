/**
 * 测试模型API连接的工具函数
 */
export async function testModelConnection(endpoint: string, apiKey: string, model: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 构建简单的测试消息
    const testMessage = {
      model: model,
      messages: [
        { role: "system", content: "你是一个有用的助手。" },
        { role: "user", content: "你好，请回复一句简单的话来测试连接。" }
      ],
      max_tokens: 20
    };
    
    console.log(`开始测试模型连接: ${endpoint}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(testMessage),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`模型连接测试响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('模型连接测试失败:', errorText);
      return {
        success: false,
        message: `API返回错误: ${response.status} - ${errorText.slice(0, 100)}`
      };
    }
    
    const data = await response.json();
    console.log('模型连接测试成功:', data);
    
    return {
      success: true,
      message: '连接测试成功'
    };
  } catch (error) {
    console.error('模型连接测试异常:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 添加默认导出
export default testModelConnection; 