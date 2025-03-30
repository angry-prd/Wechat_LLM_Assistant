/**
 * 微信公众号AI助手 - 安装和初始化脚本
 * 用于首次安装时初始化数据库和配置文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 项目根目录
const rootDir = path.join(__dirname, '..');

// 配置文件路径
const configPath = path.join(rootDir, 'local-config.json');

// 确认要执行的操作
async function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// 获取用户输入
async function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(`${question}${defaultValue ? ` (${defaultValue})` : ''}: `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

// 初始化配置文件
async function initConfig() {
  console.log('\n🔧 初始化配置文件...');
  
  let config = {};
  
  if (fs.existsSync(configPath)) {
    const useExisting = await confirm('检测到已存在的配置文件，是否使用现有配置');
    if (useExisting) {
      console.log('✅ 使用现有配置文件');
      return;
    }
    
    // 备份现有配置
    const backupPath = `${configPath}.bak-${Date.now()}`;
    fs.copyFileSync(configPath, backupPath);
    console.log(`已备份现有配置到: ${backupPath}`);
  }
  
  // 管理员设置
  console.log('\n--- 管理员设置 ---');
  const adminUsername = await prompt('管理员用户名', 'admin');
  const adminPassword = await prompt('管理员密码', 'admin123');
  const adminEmail = await prompt('管理员邮箱', 'admin@example.com');
  
  // AI模型设置
  console.log('\n--- AI模型设置 ---');
  const useLocalModel = await confirm('是否使用本地AI模型');
  const localModelEndpoint = useLocalModel 
    ? await prompt('本地模型API地址', 'http://localhost:1234/v1/chat/completions')
    : 'http://localhost:1234/v1/chat/completions';
  
  // 默认模型配置
  let models = [];
  if (useLocalModel) {
    const modelName = await prompt('本地模型名称', 'local-llm');
    models.push({
      name: modelName,
      apiKey: '',
      endpoint: localModelEndpoint,
      model: await prompt('模型标识', 'llama3'),
      isDefault: true
    });
  } else {
    // 添加OpenAI配置
    const useOpenAI = await confirm('是否配置OpenAI API');
    if (useOpenAI) {
      const apiKey = await prompt('OpenAI API Key');
      models.push({
        name: 'OpenAI GPT模型',
        apiKey,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: await prompt('OpenAI模型名称', 'gpt-3.5-turbo'),
        isDefault: true
      });
    } else {
      // 添加默认空配置
      models.push({
        name: '默认AI模型',
        apiKey: '',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        isDefault: true
      });
    }
  }
  
  // 微信公众号配置
  console.log('\n--- 微信公众号配置 ---');
  const configureWechat = await confirm('是否配置微信公众号');
  const wechat = {
    appId: '',
    appSecret: '',
    token: '',
    encodingAESKey: ''
  };
  
  if (configureWechat) {
    wechat.appId = await prompt('微信公众号AppID');
    wechat.appSecret = await prompt('微信公众号AppSecret');
    wechat.token = await prompt('微信公众号Token');
    wechat.encodingAESKey = await prompt('微信公众号EncodingAESKey');
  }
  
  // 文章默认设置
  console.log('\n--- 文章默认设置 ---');
  const author = await prompt('默认作者名', '微信公众号作者');
  const copyright = await prompt('默认版权信息', `© ${new Date().getFullYear()} 版权所有`);
  
  // 构建配置对象
  config = {
    appName: await prompt('应用名称', '微信公众号AI助手'),
    port: parseInt(await prompt('应用端口', '3000')),
    
    admin: {
      username: adminUsername,
      password: adminPassword,
      email: adminEmail,
    },
    
    aiModel: {
      useLocalModel,
      localModelEndpoint,
      models
    },
    
    wechat,
    
    articleDefaults: {
      author,
      copyright
    }
  };
  
  // 写入配置文件
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`✅ 配置文件已创建: ${configPath}`);
}

// 初始化数据库
async function initDatabase() {
  console.log('\n🗄️ 初始化数据库...');
  
  try {
    // 运行Prisma迁移
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ 数据库初始化成功');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
  }
}

// 创建必要的目录
function createDirectories() {
  console.log('\n📁 创建必要的目录...');
  
  const dirs = [
    path.join(rootDir, 'data'),
    path.join(rootDir, 'data', 'articles'),
    path.join(rootDir, 'logs')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`创建目录: ${dir}`);
    }
  });
  
  console.log('✅ 目录创建完成');
}

// 主函数
async function main() {
  console.log('===========================================');
  console.log('🚀 微信公众号AI助手 - 安装和初始化向导');
  console.log('===========================================');
  
  await initConfig();
  await initDatabase();
  createDirectories();
  
  console.log('\n🎉 安装和初始化完成！');
  console.log('\n你可以通过以下命令启动应用:');
  console.log('  开发模式: npm run dev');
  console.log('  生产模式: npm run build 然后 npm run start');
  console.log('\n祝你使用愉快！');
  
  rl.close();
}

// 执行主函数
main().catch(error => {
  console.error('安装过程中出错:', error);
  rl.close();
}); 