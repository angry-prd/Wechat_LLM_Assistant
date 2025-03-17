'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

interface WechatConfig {
  id: string;
  name: string;
  appId: string;
  appSecret: string;
  token?: string;
  encodingAESKey?: string;
  isDefault?: boolean;
}

export default function WechatSettings() {
  const router = useRouter();
  const [configs, setConfigs] = useState<WechatConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<null | WechatConfig>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    appId: '',
    appSecret: '',
    token: '',
    encodingAESKey: '',
    isDefault: false
  });
  
  // 加载微信公众号配置
  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user-config?type=wechat');
      const result = await response.json();
      
      // 处理返回的配置数据
      if (result && !result.error) {
        // 假设返回的数据格式为 { wechatConfigs: [...] }
        const wechatConfigs = result.wechatConfigs || [];
        setConfigs(wechatConfigs);
      } else {
        console.error('获取微信配置失败:', result.error);
        alert(`获取微信配置失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取微信配置错误:', error);
      alert('获取微信配置失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchConfigs();
  }, []);
  
  // 打开新建配置表单
  const openNewConfigForm = () => {
    setFormData({
      id: '',
      name: '',
      appId: '',
      appSecret: '',
      token: '',
      encodingAESKey: '',
      isDefault: configs.length === 0 // 如果没有配置，默认设为默认
    });
    setEditingConfig(null);
    setIsModalOpen(true);
  };
  
  // 打开编辑配置表单
  const openEditConfigForm = (config: WechatConfig) => {
    setFormData({
      id: config.id,
      name: config.name,
      appId: config.appId,
      appSecret: '', // 不回显密钥
      token: config.token || '',
      encodingAESKey: config.encodingAESKey || '',
      isDefault: config.isDefault || false
    });
    setEditingConfig(config);
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
  
  // 保存微信配置
  const saveWechatConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 构建要保存的数据
      const configToSave = {
        type: 'wechat',
        wechatConfigs: editingConfig 
          ? configs.map(c => c.id === formData.id ? { ...formData, appSecret: formData.appSecret || c.appSecret } : c)
          : [...configs, { ...formData, id: Date.now().toString() }]
      };
      
      // 如果设置了默认，需要更新其他配置
      if (formData.isDefault) {
        configToSave.wechatConfigs = configToSave.wechatConfigs.map(c => ({
          ...c,
          isDefault: c.id === formData.id
        }));
      }
      
      const response = await fetch('/api/user-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configToSave)
      });
      
      const result = await response.json();
      
      if (!result.error) {
        setIsModalOpen(false);
        fetchConfigs(); // 重新加载配置列表
      } else {
        alert(`保存失败: ${result.error}`);
      }
    } catch (error) {
      console.error('保存微信配置错误:', error);
      alert('保存微信配置失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 删除微信配置
  const deleteConfig = async (id: string) => {
    if (!window.confirm('确定要删除此微信公众号配置吗？')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 获取当前所有配置
      const updatedConfigs = configs.filter(c => c.id !== id);
      
      // 如果删除的是默认配置，且还有其他配置，则将第一个设为默认
      if (configs.find(c => c.id === id)?.isDefault && updatedConfigs.length > 0) {
        updatedConfigs[0].isDefault = true;
      }
      
      const response = await fetch('/api/user-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'wechat',
          wechatConfigs: updatedConfigs
        })
      });
      
      const result = await response.json();
      
      if (!result.error) {
        fetchConfigs(); // 重新加载配置列表
      } else {
        alert(`删除失败: ${result.error}`);
      }
    } catch (error) {
      console.error('删除微信配置错误:', error);
      alert('删除微信配置失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 返回设置页面
  const goToSettings = () => {
    router.push('/settings');
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 bg-gray-50 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">微信公众号配置</h1>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => openNewConfigForm()}
              >
                添加公众号
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => goToSettings()}
              >
                返回设置
              </button>
            </div>
          </div>
          
          {isLoading && configs.length === 0 ? (
            <div className="flex justify-center py-10">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-lg text-gray-600 mb-4">暂无配置的微信公众号</p>
              <p className="text-gray-500 mb-6">
                添加一个微信公众号配置以开始使用发布功能
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => openNewConfigForm()}
              >
                添加第一个公众号
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configs.map((config) => (
                <div key={config.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{config.name}</h3>
                    {config.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        默认
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-semibold">AppID:</span> {config.appId}</p>
                    <p>
                      <span className="font-semibold">AppSecret:</span>{' '}
                      {'******'}
                    </p>
                    {config.token && (
                      <p><span className="font-semibold">Token:</span> {config.token}</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={() => openEditConfigForm(config)}
                    >
                      编辑
                    </button>
                    <button
                      className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      onClick={() => deleteConfig(config.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 微信配置表单模态框 */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingConfig ? '编辑公众号配置' : '添加新公众号配置'}
                </h2>
                <form onSubmit={saveWechatConfig}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        名称
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="公众号名称"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AppID
                      </label>
                      <input
                        type="text"
                        name="appId"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="微信公众号AppID"
                        value={formData.appId}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AppSecret
                      </label>
                      <input
                        type="password"
                        name="appSecret"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={editingConfig ? '留空以保持不变' : '微信公众号AppSecret'}
                        value={formData.appSecret}
                        onChange={handleInputChange}
                        required={!editingConfig}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token (可选)
                      </label>
                      <input
                        type="text"
                        name="token"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="微信公众号Token"
                        value={formData.token}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray

