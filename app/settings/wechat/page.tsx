'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/config/api';
import Toast from '@/components/Toast';

interface WechatConfig {
  userId: string;
  wechatAppId: string;
  wechatAppSecret: string;
  wechatToken: string;
  wechatEncodingAESKey: string;
  defaultArticleAuthor: string;
  defaultArticleCopyright: string;
}

export default function WechatSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [configExpanded, setConfigExpanded] = useState(true);
  
  // 表单状态
  const [formData, setFormData] = useState<WechatConfig>({
    userId: 'default',
    wechatAppId: '',
    wechatAppSecret: '',
    wechatToken: '',
    wechatEncodingAESKey: '',
    defaultArticleAuthor: '',
    defaultArticleCopyright: ''
  });
  
  // 获取当前登录用户ID
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) {
          setFormData(prev => ({
            ...prev,
            userId: user.id
          }));
        }
      } catch (e) {
        console.error('解析用户数据失败', e);
      }
    }
  }, []);
  
  // 加载微信配置
  const fetchWechatConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ENDPOINTS.userConfig}?userId=${formData.userId}`);
      const result = await response.json();
      
      if (response.ok) {
        setFormData({
          ...formData,
          wechatAppId: result.wechatAppId || '',
          wechatAppSecret: result.wechatAppSecret ? '••••••••' : '',
          wechatToken: result.wechatToken ? '••••••••' : '',
          wechatEncodingAESKey: result.wechatEncodingAESKey ? '••••••••' : '',
          defaultArticleAuthor: result.defaultArticleAuthor || '',
          defaultArticleCopyright: result.defaultArticleCopyright || ''
        });
      } else {
        console.error('获取微信配置失败:', result.message);
        setToast({
          visible: true,
          message: `获取微信配置失败: ${result.message}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('获取微信配置错误:', error);
      setToast({
        visible: true,
        message: '获取微信配置失败，请检查网络连接',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWechatConfig();
  }, []);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 处理用户ID变化
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      userId: value
    });
  };
  
  // 加载指定用户ID的配置
  const loadUserConfig = () => {
    fetchWechatConfig();
  };
  
  // 保存微信配置
  const saveWechatConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // 只发送已修改的字段
      const dataToSend: any = {
        userId: formData.userId
      };
      
      // 只有当字段不是占位符时才发送
      if (formData.wechatAppId) {
        dataToSend.wechatAppId = formData.wechatAppId;
      }
      
      if (formData.wechatAppSecret && formData.wechatAppSecret !== '••••••••') {
        dataToSend.wechatAppSecret = formData.wechatAppSecret;
      }
      
      if (formData.wechatToken && formData.wechatToken !== '••••••••') {
        dataToSend.wechatToken = formData.wechatToken;
      }
      
      if (formData.wechatEncodingAESKey && formData.wechatEncodingAESKey !== '••••••••') {
        dataToSend.wechatEncodingAESKey = formData.wechatEncodingAESKey;
      }
      
      if (formData.defaultArticleAuthor) {
        dataToSend.defaultArticleAuthor = formData.defaultArticleAuthor;
      }
      
      if (formData.defaultArticleCopyright) {
        dataToSend.defaultArticleCopyright = formData.defaultArticleCopyright;
      }
      
      const response = await fetch(API_ENDPOINTS.userConfig, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setToast({
          visible: true,
          message: '微信公众号配置已保存',
          type: 'success'
        });
        
        // 重新加载配置以显示更新后的值
        fetchWechatConfig();
      } else {
        setToast({
          visible: true,
          message: `保存失败: ${result.message || '未知错误'}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('保存微信配置错误:', error);
      setToast({
        visible: true,
        message: '保存微信配置失败，请稍后再试',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-gray-50 p-6 overflow-auto">
          {/* Toast提示组件 */}
          <Toast 
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, visible: false })}
          />
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">系统配置</h1>
          </div>
          
          {/* 配置类型选项卡 */}
          <div className="flex border-b border-gray-200 mb-6">
            <div className="mr-6">
              <Link href="/settings">
                <button
                  className="py-2 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  AI模型配置
                </button>
              </Link>
            </div>
            <div>
              <button
                className="py-2 px-1 border-b-2 border-blue-500 font-medium text-blue-600"
              >
                微信公众号配置
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
              onClick={() => setConfigExpanded(!configExpanded)}
            >
              <h2 className="text-lg font-semibold">微信公众号配置信息</h2>
              <div className="flex items-center">
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${configExpanded ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {configExpanded && (
              <div className="p-6">
                <form onSubmit={saveWechatConfig}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">用户标识</h2>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用户ID
                    </label>
                    <input
                      type="text"
                      name="userId"
                      value={formData.userId}
                      onChange={handleUserIdChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入用户ID"
                    />
                    <p className="mt-1 text-sm text-gray-500">不同用户可以配置不同的微信公众号</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadUserConfig}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    加载配置
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">微信公众号API配置</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AppID
                    </label>
                    <input
                      type="text"
                      name="wechatAppId"
                      value={formData.wechatAppId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="微信公众号AppID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AppSecret
                    </label>
                    <input
                      type="password"
                      name="wechatAppSecret"
                      value={formData.wechatAppSecret}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="微信公众号AppSecret"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Token
                    </label>
                    <input
                      type="password"
                      name="wechatToken"
                      value={formData.wechatToken}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="微信公众号Token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      EncodingAESKey
                    </label>
                    <input
                      type="password"
                      name="wechatEncodingAESKey"
                      value={formData.wechatEncodingAESKey}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="微信公众号EncodingAESKey"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">请从微信公众平台获取相关配置信息</p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">文章默认设置</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认作者
                    </label>
                    <input
                      type="text"
                      name="defaultArticleAuthor"
                      value={formData.defaultArticleAuthor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="默认作者名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      默认版权信息
                    </label>
                    <input
                      type="text"
                      name="defaultArticleCopyright"
                      value={formData.defaultArticleCopyright}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="默认版权信息"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}