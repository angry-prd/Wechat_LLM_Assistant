'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaCog, FaChevronDown, FaRobot } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// 修改接口定义以匹配API实际返回的数据
interface ModelConfig {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  hasApiKey: boolean;
  isDefault?: boolean;
}

interface ModelSelectorProps {
  selectedModel: ModelConfig | null;
  onSelectModel: (model: ModelConfig) => void;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel
}: ModelSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载模型配置
  useEffect(() => {
    async function fetchModels() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('开始获取模型配置');
        
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const url = `/api/chat-models?t=${timestamp}`;
          
        console.log('请求模型配置URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('API响应状态:', response.status);
        
        if (!response.ok) {
          throw new Error(`获取模型配置失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API返回数据:', data);
        
        // 适配后台API实际返回的数据结构
        if (data.success && data.data && Array.isArray(data.data)) {
          console.log('发现模型配置:', data.data.length);
          
          if (data.data.length === 0) {
            console.log('没有找到模型配置');
            setModels([]);
            return;
          }
          
          setModels(data.data);
          
          // 如果没有选择模型且有模型配置，自动选择默认模型或第一个模型
          if (!selectedModel) {
            const defaultModel = data.data.find((model: ModelConfig) => model.isDefault);
            if (defaultModel) {
              console.log('选择默认模型:', defaultModel.name);
              onSelectModel(defaultModel);
            } else {
              console.log('选择第一个模型:', data.data[0].name);
              onSelectModel(data.data[0]);
            }
          } else {
            // 如果已选择模型，检查当前选择的模型是否仍然存在
            const modelExists = data.data.some((model: ModelConfig) => model.id === selectedModel.id);
            if (!modelExists && data.data.length > 0) {
              console.log('当前选择的模型不存在，切换到其他模型');
              const defaultModel = data.data.find((model: ModelConfig) => model.isDefault);
              onSelectModel(defaultModel || data.data[0]);
            }
          }
        } else {
          console.log('没有找到模型配置或数据格式不正确:', data);
          setModels([]);
          setError('获取模型配置失败: 数据格式不正确');
        }
      } catch (err) {
        console.error('获取模型配置错误:', err);
        setError(err instanceof Error ? err.message : '获取模型配置失败');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchModels();
    
    // 定期刷新模型配置
    const intervalId = setInterval(fetchModels, 30000); // 每30秒刷新一次
    
    return () => clearInterval(intervalId);
  }, [selectedModel, onSelectModel]);

  // 前往模型设置页面
  const goToSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center text-base font-medium px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        title={selectedModel ? `当前模型: ${selectedModel.name}` : '选择模型'}
      >
        <span className="mr-2 text-sm">{selectedModel?.name || '选择模型'}</span>
        <FaChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 px-2">
              选择模型
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400 py-4">加载中...</div>
            ) : error ? (
              <div className="p-2 text-center text-sm text-red-500 py-4">{error}</div>
            ) : models.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                未配置任何模型
              </div>
            ) : (
              models.map(model => (
                <div
                  key={model.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                    selectedModel?.id === model.id ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                  }`}
                  onClick={() => {
                    onSelectModel(model);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <FaRobot className="mr-2 text-gray-500" size={14} />
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {model.model}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={goToSettings}
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <FaCog className="mr-2" size={14} />
              模型设置
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 