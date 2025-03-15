'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface ModelConfig {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  hasApiKey: boolean;
  isDefault?: boolean;
}

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIChat() {
  const router = useRouter();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 加载模型配置
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/chat');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          setModels(result.data);
          // 如果有默认模型，选择它
          const defaultModel = result.data.find((m: ModelConfig) => m.isDefault);
          if (defaultModel) {
            setSelectedModelId(defaultModel.id);
          } else {
            setSelectedModelId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error('加载模型配置失败:', error);
      }
    };
    
    fetchModels();
  }, []);
  
  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !selectedModelId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // 准备发送到API的消息格式
      const apiMessages = messages.concat(userMessage).map(({ role, content }) => ({
        role,
        content
      }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modelId: selectedModelId,
          messages: apiMessages
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 假设API返回的格式与OpenAI兼容
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.choices?.[0]?.message?.content || '抱歉，我无法生成回复。',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // 错误处理
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `错误: ${result.message || '发生未知错误'}`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '发送消息失败，请检查网络连接或稍后再试。',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 前往配置页面
  const goToSettings = () => {
    router.push('/settings');
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <div className="flex flex-col flex-1 bg-gray-50 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">AI 聊天</h1>
            <div className="flex items-center space-x-4">
              {models.length > 0 && (
                <select
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={goToSettings}
              >
                模型配置
              </button>
            </div>
          </div>
          
          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>没有消息历史</p>
                <p className="text-sm">选择一个模型并开始聊天</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-3/4 p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* 输入区域 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入消息..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={isLoading || models.length === 0}
              />
              <button
                className={`px-4 py-2 ${
                  isLoading || models.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={sendMessage}
                disabled={isLoading || models.length === 0}
              >
                {isLoading ? '发送中...' : '发送'}
              </button>
            </div>
            {models.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                未配置聊天模型。请先在模型配置中添加模型。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
