'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserId } from '@/lib/auth';
import Toast from '@/components/Toast';
import { useSession } from 'next-auth/react';

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
  const { data: session, status } = useSession();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<null | ModelConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [userId, setUserId] = useState(''); // 用户ID
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  
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
      // 获取当前登录用户ID
      const currentUserId = getCurrentUserId();
      setUserId(currentUserId);
      
      const response = await fetch(`/api/chat-models?userId=${currentUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setModels(result.data);
      } else {
        console.error('获取模型失败:', result.message);
        setToast({
          visible: true,
          message: `获取模型失败: ${result.message}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('获取模型错误:', error);
      alert('获取模型配置失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // 检查用户是否已登录
    if (status === 'unauthenticated') {
      // 未登录用户重定向到登录页面
      router.push('/login');
      return;
    }
    
    if (status !== 'loading') {
      fetchModels();
    }
  }, [status, router]);
  
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
      
      // 确保包含用户ID
      const dataWithUserId = {
        ...formData,
        userId: userId
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataWithUserId)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setIsModalOpen(false);
        fetchModels(); // 重新加载模型列表
        setToast({
          visible: true,
          message: '模型配置已保存',
          type: 'success'
        });
      } else {
        setToast({
          visible: true,
          message: `保存失败: ${result.message}`,
          type: 'error'
        });
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
  
  // 防止页面闪现的加载状态
  const [pageReady, setPageReady] = useState(false);
  
  useEffect(() => {
    // 当模型数据加载完成后，标记页面准备就绪
    if (!isLoading) {
      setPageReady(true);
    }
  }, [isLoading]);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type as 'error' | 'success' | 'info'}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      
      <div className="flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-gray-50 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">系统配置</h1>
          </div>
          
          {/* 配置类型选项卡 */}
          <div className="flex border-b border-gray-200 mb-6">
            <div className="mr-6">
              <button
                className="py-2 px-1 border-b-2 border-blue-500 font-medium text-blue-600"
              >
                AI模型配置
              </button>
            </div>
            <div>
              <Link href="/settings/wechat">
                <button
                  className="py-2 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  微信公众号配置
                </button>
              </Link>
            </div>
          </div>
          
          {/* 模型列表 */}
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={openNewModelForm}
              >
                添加模型
              </button>
            </div>
            
            {models.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">暂无模型配置，请点击添加模型按钮创建</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {models.map((model) => (
                  <div key={model.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium">{model.name}</h3>
                      {model.isDefault && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">默认</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{model.model}</p>
                    <p className="text-sm text-gray-500 mt-1 truncate">{model.endpoint}</p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => openEditModelForm(model)}
                        className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteModel(model.id)}
                        className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 模型配置表单模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingModel ? '编辑模型配置' : '添加新模型'}
            </h2>
            
            <form onSubmit={saveModelConfig}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">API密钥</label>
                <input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={!editingModel}
                  placeholder={editingModel ? '留空表示不修改' : ''}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">API端点</label>
                <input
                  type="text"
                  name="endpoint"
                  value={formData.endpoint}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  设为默认模型
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
}
