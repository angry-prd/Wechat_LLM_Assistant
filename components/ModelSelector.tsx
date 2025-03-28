'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaCog, FaChevronDown, FaRobot } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

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
        
        // 添加调试信息
        console.log('开始获取模型配置');
        
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/chat-models?t=${timestamp}`);
        
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
  }, [selectedModel, onSelectModel, session]);

  // 前往模型设置页面
  const goToSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-center text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        title={selectedModel ? `当前模型: ${selectedModel.name}` : '选择模型'}
      >
        <FaRobot size={18} />
        <FaChevronDown size={10} className="ml-1" />
      </button>
      
      {isDropdownOpen && (
        <div className="absolute bottom-10 right-0 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg overflow-hidden z-20">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 px-2">
              {selectedModel ? `当前模型: ${selectedModel.name}` : '选择模型'}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto border-t border-gray-100 dark:border-gray-700">
            {isLoading ? (
              <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">加载中...</div>
            ) : error ? (
              <div className="p-2 text-center text-sm text-red-500">{error}</div>
            ) : models.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
                未配置任何模型
              </div>
            ) : (
              models.map(model => (
                <div
                  key={model.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                    selectedModel?.id === model.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => {
                    onSelectModel(model);
                    setIsDropdownOpen(false);
                  }}
                >
                  {model.name}
                  {model.isDefault && <span className="ml-1 text-xs text-blue-500">(默认)</span>}
                </div>
              ))
            )}
          </div>
          <div className="border-t dark:border-gray-700 p-2">
            <button
              className="flex items-center w-full p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={goToSettings}
            >
              <FaCog className="mr-2" size={14} />
              <span>模型配置</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 