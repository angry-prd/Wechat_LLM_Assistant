'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    modelId: ''
  });
  
  // 添加编辑模型和模态框状态
  const [editingModel, setEditingModel] = useState<null | ModelConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    apiKey: '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
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
        setToast({
          visible: true,
          message: `获取模型失败: ${result.message}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('获取模型错误:', error);
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
      endpoint: '',
      model: '',
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
      setToast({
        visible: true,
        message: '保存模型配置失败，请稍后再试',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 删除模型配置
  const deleteModel = async (id: string) => {
    // 显示确认对话框
    setConfirmDialog({
      isOpen: true,
      title: '删除确认',
      message: '确定要删除此模型配置吗？',
      modelId: id
    });
  };
  
  // 确认删除处理函数
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/chat-models/${confirmDialog.modelId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        fetchModels(); // 重新加载模型列表
        setToast({
          visible: true,
          message: '模型配置已删除',
          type: 'success'
        });
      } else {
        setToast({
          visible: true,
          message: `删除失败: ${result.message}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('删除模型配置错误:', error);
      setToast({
        visible: true,
        message: '删除模型配置失败，请稍后再试',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">系统设置</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">AI模型配置</h2>
          <button
            onClick={openNewModelForm}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            添加模型
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">加载中...</div>
        ) : models.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无模型配置，请添加新的模型
          </div>
        ) : (
          <div className="grid gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.endpoint}</p>
                  <p className="text-sm text-gray-600">模型: {model.model}</p>
                  {model.isDefault && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      默认模型
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModelForm(model)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => deleteModel(model.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 模型配置表单模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingModel ? '编辑模型' : '添加新模型'}
            </h3>
            <form onSubmit={saveModelConfig}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">名称</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">API密钥</label>
                <input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required={!editingModel}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">接口地址</label>
                <input
                  type="text"
                  name="endpoint"
                  value={formData.endpoint}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">模型名称</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">设为默认模型</span>
                </label>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {confirmDialog.isOpen && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      )}

      {/* 提示消息 */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
    </div>
  );
}
