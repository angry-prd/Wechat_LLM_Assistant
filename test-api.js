const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    // 测试DeepSeek模型
    console.log('测试DeepSeek模型...');
    // 注意：请将下面的API密钥替换为您的实际DeepSeek API密钥
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 您的DeepSeek API密钥' // 请替换为您的实际API密钥
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    
    const deepseekData = await deepseekResponse.text();
    console.log('DeepSeek API响应:');
    console.log(deepseekData);
    console.log('\n');
    
    // 测试Claude模型
    console.log('测试Claude模型...');
    const claudeResponse = await fetch('https://chat.cloudapi.vip/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-R5cgq1DasV2dmUz7tdabL4uPmXrLPunbc07P06zyw8nbFSfB'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    
    const claudeData = await claudeResponse.text();
    console.log('Claude API响应:');
    console.log(claudeData);
  } catch (error) {
    console.error('错误:', error);
  }
}

testAPI();