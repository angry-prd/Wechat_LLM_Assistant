'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [userId, setUserId] = useState('default'); // 默认用户ID
  
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
      const userData = localStorage.getItem('user');
      let currentUserId = 'default';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            currentUserId = user.id;
            setUserId(currentUserId);
          }
        } catch (e) {
          console.error('解析用户数据失败', e);
        }
      }
      
      const response = await fetch(`/api/chat-models?userId=${currentUserId}`);
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
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={openNewModelForm}
            >
              添加模型
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
