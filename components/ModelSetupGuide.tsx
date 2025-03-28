'use client';

import React from 'react';
import { FaCog, FaKey, FaRobot } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function ModelSetupGuide() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] p-2 text-center">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow max-w-xl w-full">
        <h2 className="text-base font-bold mb-2 text-red-600 dark:text-red-400">
          AI模型未配置
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300 mb-2 text-xs">
          您需要设置API密钥并选择一个AI模型才能使用聊天功能：
        </p>
        
        <div className="space-y-2">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-left">
            <div className="flex items-center">
              <FaKey className="text-blue-500 mr-1.5" size={12} />
              <h3 className="text-sm font-medium">1. 配置API密钥</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-6 text-xs">
              添加API密钥，支持OpenAI、Azure OpenAI、Claude等多种服务
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg text-left">
            <div className="flex items-center">
              <FaRobot className="text-blue-500 mr-1.5" size={12} />
              <h3 className="text-sm font-medium">2. 选择合适的模型</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-6 text-xs">
              选择模型并设置参数，可配置多个模型随时切换
            </p>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/settings')}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg flex items-center justify-center transition-colors w-full text-xs"
        >
          <FaCog className="mr-1.5" size={12} />
          前往设置页面
        </button>
      </div>
    </div>
  );
} 