/**
 * 本地配置文件
 * 用户可以通过修改这个文件来配置应用的本地设置
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'dotenv';

// 定义配置接口
export interface LocalConfig {
  // 应用配置
  appName: string;
  port: number;
  
  // 管理员配置
  admin: {
    username: string;
    password: string;
    email: string;
  };
  
  // AI模型配置
  aiModel: {
    useLocalModel: boolean;
    localModelEndpoint: string;
    models: Array<{
      name: string;
      apiKey: string;
      endpoint: string;
      model: string;
      isDefault: boolean;
    }>;
  };
  
  // 微信公众号配置
  wechat: {
    appId: string;
    appSecret: string;
    token: string;
    encodingAESKey: string;
  };
  
  // 默认文章设置
  articleDefaults: {
    author: string;
    copyright: string;
  };
}

// 默认配置
const defaultConfig: LocalConfig = {
  appName: '微信公众号AI助手',
  port: 3000,
  
  admin: {
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
  },
  
  aiModel: {
    useLocalModel: false,
    localModelEndpoint: 'http://localhost:1234/v1/chat/completions',
    models: [
      {
        name: '默认AI模型',
        apiKey: '',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        isDefault: true
      }
    ]
  },
  
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
    token: process.env.WECHAT_TOKEN || '',
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || '',
  },
  
  articleDefaults: {
    author: '微信公众号作者',
    copyright: '© ' + new Date().getFullYear() + ' 版权所有'
  }
};

// 用户配置文件路径
const USER_CONFIG_PATH = path.join(process.cwd(), 'local-config.json');

// 尝试读取用户配置
let userConfig: Partial<LocalConfig> = {};

try {
  if (fs.existsSync(USER_CONFIG_PATH)) {
    const configJson = fs.readFileSync(USER_CONFIG_PATH, 'utf-8');
    userConfig = JSON.parse(configJson);
    console.log('已加载用户本地配置');
  } else {
    console.log('未找到用户配置文件，使用默认配置');
    // 创建默认配置文件
    fs.writeFileSync(
      USER_CONFIG_PATH, 
      JSON.stringify(defaultConfig, null, 2),
      'utf-8'
    );
    console.log('已创建默认配置文件:', USER_CONFIG_PATH);
  }
} catch (error) {
  console.error('读取配置文件失败:', error);
}

// 合并默认配置和用户配置
export const config: LocalConfig = {
  ...defaultConfig,
  ...userConfig,
  admin: {
    ...defaultConfig.admin,
    ...userConfig.admin,
  },
  aiModel: {
    ...defaultConfig.aiModel,
    ...userConfig.aiModel,
    models: userConfig.aiModel?.models || defaultConfig.aiModel.models,
  },
  wechat: {
    ...defaultConfig.wechat,
    ...userConfig.wechat,
  },
  articleDefaults: {
    ...defaultConfig.articleDefaults,
    ...userConfig.articleDefaults,
  },
};

export default config; 