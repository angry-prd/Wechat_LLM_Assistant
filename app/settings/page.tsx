'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModelConfig {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  hasApiKey: boolean;
  isDefault?: boolean;
}

export default function Settings() {
  const router = useRouter();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<null | ModelConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    apiKey: '',
    endpoint: '',
    model: '',
    isDefault: false
  });
  
  // 加载模型配置
  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat-models');
      const result = await response.json();
      
      if (result.success) {
        setModels(result.data);
      } else {
        console.error('获取模型失败:', result.message);
        alert(`获取模型失败: ${result.message}`);
      }
    } catch (error) {
      console.error('获取模型错误:', error);
      alert('获取模型配置失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchModels();
  }, []);
  
  // 打开新建模型表单
  const openNewModelForm = () => {
    setFormData({
      id: '',
      name: '',
      apiKey: '',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      isDefault: models.length === 0 // 如果没有模型，默认设为默认
    });
    setEditingModel(null);
    setIsModalOpen(true);
  };
  
  // 打开编辑模型表单
  const openEditModelForm = (model: ModelConfig) => {
    setFormData({
      id: model.id,
      name: model.name,
      apiKey: '', // 不回显API密钥
      endpoint: model.endpoint,
      model: model.model,
      isDefault: model.isDefault || false
    });
    setEditingModel(model);
    setIsModalOpen(true);
  };
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };
  
  // 保存模型配置
  const saveModelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const url = '/api/chat-models';
      const method = editingModel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsModalOpen(false);
        fetchModels(); // 重新加载模型列表
      } else {
        alert(`保存失败: ${result.message}`);
      }
    } catch (error) {
      console.error('保存模型配置错误:', error);
      alert('保存模型配置失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 删除模型配置
  const deleteModel = async (id: string) => {
    if (!window.confirm('确定要删除此模型配置吗？')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/chat-models?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchModels(); // 重新加载模型列表
      } else {
        alert(`删除失败: ${result.message}`);
      }
    } catch (error) {
      console.error('删除模型配置错误:', error);
      alert('删除模型配置失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 返回聊天页面
  const goToChat = () => {
    router.push('/ai-chat');
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-gray-50 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">系统设置</h1>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={openNewModelForm}
              >
                添加模型
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={goToChat}
              >
                返回聊天
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">聊天模型配置</h2>
              <p className="text-gray-600 mb-4">配置AI聊天模型的API密钥和参数</p>
              <p className="text-sm text-gray-500 mb-4">当前已配置 {models.length} 个模型</p>
            </div>
            
            <div 
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push('/settings/wechat')}
            >
              <h2 className="text-xl font-semibold mb-2">微信公众号配置</h2>
              <p className="text-gray-600 mb-4">配置微信公众号的AppID和密钥</p>
              <p className="text-sm text-gray-500 mb-4">用于发布文章到微信公众号</p>
            </div>
          </div>
          
          {isLoading && models.length === 0 ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-lg text-gray-600 mb-4">暂无配置的聊天模型</p>
              <p className="text-gray-500 mb-6">
                添加一个模型配置以开始使用聊天功能
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={openNewModelForm}
              >
                添加第一个模型
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => (
                <div key={model.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{model.name}</h3>
                    {model.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        默认
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-semibold">API端点:</span> {model.endpoint}</p>
                    <p><span className="font-semibold">模型:</span> {model.model}</p>
                    <p>
                      <span className="font-semibold">API密钥:</span>{' '}
                      {model.hasApiKey ? '******' : '未设置'}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={() => openEditModelForm(model)}
                    >
                      编辑
                    </button>
                    <button
                      className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={() => deleteModel(model.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 模型配置表单模态框 */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingModel ? '编辑模型配置' : '添加新模型配置'}
                </h2>
                <form onSubmit={saveModelConfig}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        名称
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="模型名称 (例如: GPT-3.5)"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API密钥
                      </label>
                      <input
                        type="password"
                        name="apiKey"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={editingModel ? '留空以保持不变' : 'API密钥'}
                        value={formData.apiKey}
                        onChange={handleInputChange}
                        required={!editingModel}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API端点
                      </label>
                      <input
                        type="url"
                        name="endpoint"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://api.example.com/v1/chat/completions"
                        value={formData.endpoint}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        模型标识符
                      </label>
                      <input
                        type="text"
                        name="model"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="gpt-3.5-turbo"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                        设为默认模型
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={() => setIsModalOpen(false)}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      {isLoading ? '保存中...' : '保存'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
