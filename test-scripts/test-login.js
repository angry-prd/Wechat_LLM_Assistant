// 测试登录API的脚本
import fetch from 'node-fetch';

async function testLogin() {
  try {
    // 测试使用已知存在的用户名登录
    console.log('尝试使用用户名 "admin" 登录...');
    console.log('请求数据:', JSON.stringify({
      username: 'admin',
      password: 'admin123'
    }, null, 2));
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',  // 尝试使用admin用户
        password: 'admin123'  // 假设这是正确的密码
      }),
    });

    console.log('状态码:', response.status);
    console.log('响应头:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    // 获取响应头中的cookie信息
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      console.log('Cookie信息:', cookies);
    }
    
    // 尝试查看错误详情
    if (data.error) {
      console.error('错误详情:', data.error);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testLogin(); 