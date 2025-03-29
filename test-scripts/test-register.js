// 测试注册API的脚本
import fetch from 'node-fetch';

// 生成一个随机的用户名后缀，避免重复
const randomSuffix = Date.now();

async function testRegister() {
  try {
    // 创建admin用户
    const adminResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com'
      }),
    });

    const adminData = await adminResponse.json();
    console.log('Admin用户注册状态码:', adminResponse.status);
    console.log('Admin用户注册响应:', JSON.stringify(adminData, null, 2));

    // 创建测试用户
    const testUserResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `testuser${randomSuffix}`,
        password: 'testpassword',
        email: `test${randomSuffix}@example.com`
      }),
    });

    const testUserData = await testUserResponse.json();
    console.log('测试用户注册状态码:', testUserResponse.status);
    console.log('测试用户注册响应:', JSON.stringify(testUserData, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testRegister(); 