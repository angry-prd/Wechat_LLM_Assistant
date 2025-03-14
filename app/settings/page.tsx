'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';

export default function Settings() {
  const [config, setConfig] = useState({
    openaiApiKey: '',
    openaiApiUrl: '',
    wechatAppId: '',
    wechatAppSecret: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId] = useState('demo_user'); // 这里应该使用实际的用户ID

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.userConfig}/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
      setMessage('获取配置失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_ENDPOINTS.userConfig}/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage('配置保存成功！');
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setMessage('保存配置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">系统配置</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API密钥
            </label>
            <input
              type="password"
              value={config.openaiApiKey}
              onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入OpenAI API密钥"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API地址
            </label>
            <input
              type="text"
              value={config.openaiApiUrl}
              onChange={(e) => setConfig({ ...config, openaiApiUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入OpenAI API地址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              微信公众号AppID
            </label>
            <input
              type="text"
              value={config.wechatAppId}
              onChange={(e) => setConfig({ ...config, wechatAppId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入微信公众号AppID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              微信公众号AppSecret
            </label>
            <input
              type="password"
              value={config.wechatAppSecret}
              onChange={(e) => setConfig({ ...config, wechatAppSecret: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入微信公众号AppSecret"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? '保存中...' : '保存配置'}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">配置说明</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            <strong>OpenAI API密钥：</strong>
            从OpenAI官网获取的API密钥，用于调用AI服务。
          </p>
          <p>
            <strong>OpenAI API地址：</strong>
            OpenAI API的接口地址，默认为 https://api.openai.com/v1。
          </p>
          <p>
            <strong>微信公众号AppID：</strong>
            从微信公众平台获取的AppID，用于发布文章。
          </p>
          <p>
            <strong>微信公众号AppSecret：</strong>
            从微信公众平台获取的AppSecret，用于发布文章。
          </p>
        </div>
      </div>
    </div>
  );
} 