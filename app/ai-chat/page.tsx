'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSync, FaCopy, FaFileAlt, FaPlus } from 'react-icons/fa';
// 移除Sidebar导入

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

// 新增聊天会话接口
interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  modelId: string;
}

export default function AIChat() {
  const router = useRouter();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 新增聊天会话状态
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showSessionList, setShowSessionList] = useState(true);
  
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
    
    // 加载历史聊天会话
    loadChatSessions();
  }, []);
  
  // 加载历史聊天会话
  const loadChatSessions = () => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions) as ChatSession[];
      setChatSessions(sessions);
      
      // 如果有会话，加载最近的一个
      if (sessions.length > 0) {
        const latestSession = sessions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        setCurrentSessionId(latestSession.id);
        loadSessionMessages(latestSession.id);
      } else {
        // 如果没有会话，创建一个新的
        createNewSession();
      }
    } else {
      // 如果没有保存的会话，创建一个新的
      createNewSession();
    }
  };
  
  // 创建新的聊天会话
  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: `未命名对话`,
      lastMessage: '开始新对话',
      timestamp: new Date().toISOString(),
      modelId: selectedModelId
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    // 保存到本地存储
    localStorage.setItem('chatSessions', JSON.stringify([newSession, ...chatSessions]));
  };
  
  // 加载会话消息
  const loadSessionMessages = (sessionId: string) => {
    const savedMessages = localStorage.getItem(`messages_${sessionId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([]);
    }
  };
  
  // 切换会话
  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    loadSessionMessages(sessionId);
  };
  
  // 删除会话
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = chatSessions.filter(session => session.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    localStorage.removeItem(`messages_${sessionId}`);
    
    // 如果删除的是当前会话，切换到最新的会话或创建新会话
    if (sessionId === currentSessionId) {
      if (updatedSessions.length > 0) {
        switchSession(updatedSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };
  
  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 更新会话标题
  const updateSessionTitle = (messages: Message[]) => {
    if (messages.length > 0 && currentSessionId) {
      // 获取第一条用户消息作为标题基础
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        // 智能提取聊天主题作为标题
        let title = '';
        const content = firstUserMessage.content;
        
        // 如果内容包含问题，使用问题作为标题
        if (content.includes('?') || content.includes('？')) {
          const questionMatch = content.match(/([^.!?。！？]+[?？])/g);
          if (questionMatch && questionMatch[0]) {
            title = questionMatch[0].length > 30 
              ? questionMatch[0].substring(0, 30) + '...' 
              : questionMatch[0];
          }
        } 
        // 如果内容以命令或请求开头
        else if (content.match(/^(请|帮我|如何|怎样|怎么|我想|我需要|我要|生成|创建|制作|写一个|写一篇|分析|解释|比较|评估|优化)/)) {
          const lines = content.split('\n');
          title = lines[0].length > 30 ? lines[0].substring(0, 30) + '...' : lines[0];
        }
        // 如果内容包含关键词
        else if (content.match(/(关于|主题|话题|讨论|探讨|研究|学习|了解)/)) {
          const keywordMatch = content.match(/关于([^。！？.!?]+)|([^。！？.!?]+)(主题|话题|讨论|探讨|研究)/);
          if (keywordMatch) {
            const keyword = keywordMatch[1] || keywordMatch[2];
            if (keyword) {
              title = keyword.length > 30 ? keyword.substring(0, 30) + '...' : keyword;
            }
          }
        }
        // 默认使用内容的前30个字符
        if (!title) {
          title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        }
        
        // 更新当前会话标题
        const updatedSessions = chatSessions.map(session => 
          session.id === currentSessionId 
            ? { ...session, title } 
            : session
        );
        
        setChatSessions(updatedSessions);
        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      }
    }
  };
  
  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !selectedModelId) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    // 保存消息到本地存储
    if (currentSessionId) {
      localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(updatedMessages));
      
      // 如果是第一条消息，更新会话标题
      if (messages.length === 0) {
        updateSessionTitle(updatedMessages);
      }
    }
    
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
        // 处理成功响应
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.choices?.[0]?.message?.content || '抱歉，我无法生成回复。',
          timestamp: new Date().toISOString()
        };
        
        const newMessages = [...messages, assistantMessage];
        setMessages(newMessages);
        
        // 保存消息到本地存储并更新会话信息
        if (currentSessionId) {
          localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(newMessages));
          
          // 更新会话的最后消息和时间戳
          const updatedSessions = chatSessions.map(session => 
            session.id === currentSessionId 
              ? { 
                  ...session, 
                  lastMessage: assistantMessage.content.length > 30 
                    ? assistantMessage.content.substring(0, 30) + '...' 
                    : assistantMessage.content,
                  timestamp: new Date().toISOString() 
                } 
              : session
          );
          
          setChatSessions(updatedSessions);
          localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
        }
      } else {
        // 错误处理 - 显示更详细的错误信息
        let errorMessage = '发生错误';
        if (result.error && result.error.message) {
          errorMessage = `错误: ${result.error.message}`;
        } else if (result.message) {
          errorMessage = `错误: ${result.message}`;
        }
        
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorResponse]);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 左侧历史聊天记录侧边栏 */}
      <div className={`bg-white shadow-md ${showSessionList ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200 relative flex flex-col h-full`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">聊天历史</h1>
        </div>
        <div className="p-3">
          <button 
            onClick={createNewSession}
            className="w-full py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> 新建对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatSessions.map((session) => (
            <div 
              key={session.id} 
              className={`flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-100 ${currentSessionId === session.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
              onClick={() => switchSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{new Date(session.timestamp).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={(e) => deleteSession(session.id, e)}
                className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
        {/* 折叠按钮到侧边栏右侧边缘 */}
        <button 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-300 p-2 rounded-l-md shadow-md z-10"
          onClick={() => setShowSessionList(!showSessionList)}
        >
          {showSessionList ? '◀' : '▶'}
        </button>
      </div>
      
      {/* 右侧聊天主区域 */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* 顶部标题栏 */}
        <div className="sticky top-0 z-10 bg-white shadow-sm py-3 px-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
            <div className="flex items-center">
              {!showSessionList && (
                <button 
                  className="mr-3 text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setShowSessionList(true)}
                >
                  ▶
                </button>
              )}
              <h1 className="text-lg font-semibold">AI 聊天</h1>
            </div>
          </div>
        </div>
        
        {/* 聊天消息区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto py-4 px-4">
          <div className="max-w-3xl mx-auto w-full">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-gray-500">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-semibold mb-2">开始新对话</h3>
                    <p className="mb-4">选择一个模型并开始与AI助手对话</p>
                    <button 
                      onClick={createNewSession}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center"
                    >
                      <FaPlus className="mr-2" /> 新建对话
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg shadow-sm ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                      >
                        <div className="p-3 text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`px-3 pb-2 text-xs ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                        
                        {/* AI回复的操作按钮 */}
                        {message.role === 'assistant' && (
                          <div className="flex justify-end space-x-2 px-3 pb-2 border-t border-gray-100 pt-2 mt-1">
                            <button 
                              className="flex items-center text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                              onClick={() => {
                                // 重新生成逻辑
                                // 找到最后一条用户消息之前的所有消息
                                const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
                                if (lastUserIndex !== -1) {
                                  const userMessageIndex = messages.length - 1 - lastUserIndex;
                                  // 保留到最后一条用户消息
                                  const messagesToKeep = messages.slice(0, userMessageIndex + 1);
                                  setMessages(messagesToKeep);
                                  setIsLoading(true);
                                  
                                  // 重新发送请求
                                  const apiMessages = messagesToKeep.map(({ role, content }) => ({
                                    role,
                                    content
                                  }));
                                  
                                  fetch('/api/chat', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                      modelId: selectedModelId,
                                      messages: apiMessages
                                    })
                                  })
                                  .then(response => response.json())
                                  .then(result => {
                                    if (result.success && result.data) {
                                      const assistantMessage: Message = {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: result.data.choices?.[0]?.message?.content || '抱歉，我无法生成回复。',
                                        timestamp: new Date().toISOString()
                                      };
                                      
                                      const newMessages = [...messagesToKeep, assistantMessage];
                                      setMessages(newMessages);
                                      
                                      // 保存消息到本地存储并更新会话信息
                                      if (currentSessionId) {
                                        localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(newMessages));
                                        
                                        // 更新会话的最后消息和时间戳
                                        const updatedSessions = chatSessions.map(session => 
                                          session.id === currentSessionId 
                                            ? { 
                                                ...session, 
                                                lastMessage: assistantMessage.content.length > 30 
                                                  ? assistantMessage.content.substring(0, 30) + '...' 
                                                  : assistantMessage.content,
                                                timestamp: new Date().toISOString() 
                                              } 
                                            : session
                                        );
                                        
                                        setChatSessions(updatedSessions);
                                        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
                                      }
                                    } else {
                                      // 错误处理
                                      let errorMessage = '发生错误';
                                      if (result.error && result.error.message) {
                                        errorMessage = `错误: ${result.error.message}`;
                                      } else if (result.message) {
                                        errorMessage = `错误: ${result.message}`;
                                      }
                                      
                                      const errorResponse: Message = {
                                        id: Date.now().toString(),
                                        role: 'assistant',
                                        content: errorMessage,
                                        timestamp: new Date().toISOString()
                                      };
                                      
                                      setMessages([...messagesToKeep, errorResponse]);
                                    }
                                  })
                                  .catch(error => {
                                    console.error('重新生成失败:', error);
                                    const errorMessage: Message = {
                                      id: Date.now().toString(),
                                      role: 'assistant',
                                      content: '重新生成失败，请检查网络连接或稍后再试。',
                                      timestamp: new Date().toISOString()
                                    };
                                    
                                    setMessages([...messagesToKeep, errorMessage]);
                                  })
                                  .finally(() => {
                                    setIsLoading(false);
                                  });
                                }
                              }}
                              title="重新生成"
                              disabled={isLoading}
                            >
                              <FaSync className="mr-1" /> 重新生成
                            </button>
                            <button 
                              className="flex items-center text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                // 可以添加复制成功的提示
                              }}
                              title="复制内容"
                            >
                              <FaCopy className="mr-1" /> 复制
                            </button>
                            <button 
                              className="flex items-center text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                              onClick={() => {
                                // 创建新文章逻辑 - 保存到localStorage并跳转
                                localStorage.setItem('newArticleContent', message.content);
                                // 可以从AI回复中提取标题（如果有）
                                const titleMatch = message.content.match(/^#\s+(.+)$/m);
                                if (titleMatch && titleMatch[1]) {
                                  localStorage.setItem('newArticleTitle', titleMatch[1]);
                                }
                                router.push('/articles/create');
                              }}
                              title="创建推文"
                            >
                              <FaFileAlt className="mr-1" /> 创建推文
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))})
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* 固定底部输入区域 */}
          <div className="sticky bottom-0 z-10 bg-white shadow-lg border-t border-gray-200 p-4">
            <div className="max-w-3xl mx-auto w-full">
              {/* 模型选择区域 */}
              <div className="mb-3 flex justify-between items-center">
                {models.length > 0 && (
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">当前模型:</span>
                    <select
                      className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      disabled={isLoading}
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex ml-2">
                      <button
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50 flex items-center"
                        onClick={goToSettings}
                        title="配置模型"
                      >
                        配置
                      </button>
                      <button
                        className="ml-2 px-2 py-1 text-xs text-green-600 hover:text-green-800 border border-green-600 rounded-md hover:bg-green-50 flex items-center"
                        onClick={() => router.push('/settings')}
                        title="新增模型"
                      >
                        <FaPlus className="mr-1" /> 新增
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 输入框区域 */}
              <div className="relative rounded-lg border border-gray-300 bg-white shadow-sm hover:border-blue-400 transition-colors">
                <input
                  type="text"
                  className="w-full px-4 py-3 pr-24 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                  <button
                    className={`px-4 py-2 text-sm ${isLoading || models.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    onClick={sendMessage}
                    disabled={isLoading || models.length === 0}
                  >
                    {isLoading ? '发送中...' : '发送'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

