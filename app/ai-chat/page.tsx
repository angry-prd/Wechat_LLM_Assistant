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
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full h-full">
        {/* 历史聊天记录侧边栏 */}
        <div className={`bg-white shadow-lg ${showSessionList ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-200`}>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">聊天历史</h1>
          </div>
          <div className="mt-4 px-4">
            <button 
              onClick={createNewSession}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              新建对话
            </button>
          </div>
          <div className="mt-6 overflow-y-auto max-h-[calc(100vh-150px)]">
            {chatSessions.map((session) => (
              <div 
                key={session.id} 
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 ${currentSessionId === session.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                onClick={() => switchSession(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-800 truncate">{session.title}</p>
                </div>
                <button 
                  onClick={(e) => deleteSession(session.id, e)}
                  className="ml-2 text-gray-400 hover:text-red-500 text-lg"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 固定顶部操作区 */}
          <div className="sticky top-0 z-10 bg-white shadow-sm py-3 px-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center">
                <button 
                  className="mr-3 text-gray-600 hover:text-gray-900"
                  onClick={() => setShowSessionList(!showSessionList)}
                >
                  {showSessionList ? '◀' : '▶'}
                </button>
                <h1 className="text-xl font-bold">AI 聊天</h1>
              </div>
            </div>
          </div>
          
          {/* 聊天消息区域 - 可滚动 */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-gray-500">
                  <p>没有消息历史</p>
                  <p className="text-sm">选择一个模型并开始聊天</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl shadow-sm ${message.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}
                      >
                        <div className="p-2.5 text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="px-2.5 pb-1.5 text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                        
                        {/* AI回复的操作按钮 */}
                        {message.role === 'assistant' && (
                          <div className="flex justify-end space-x-2 px-2 pb-2">
                            <button 
                              className="flex items-center text-sm text-gray-600 hover:text-blue-600 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
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
                              className="flex items-center text-sm text-gray-600 hover:text-blue-600 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                // 可以添加复制成功的提示
                              }}
                              title="复制内容"
                            >
                              <FaCopy className="mr-1" /> 复制
                            </button>
                            <button 
                              className="flex items-center text-sm text-gray-600 hover:text-blue-600 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
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
                              <FaFileAlt className="mr-1" /> 直接创建新推文
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
          
          {/* 固定底部输入区域 */}
          <div className="sticky bottom-0 z-10 bg-white shadow-lg border-t border-gray-200 p-3 pb-5 mb-2">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 pr-24 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="absolute right-0 top-0 h-full flex items-center">
                  <button
                    className={`h-full px-4 text-sm ${isLoading || models.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-tr-md rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    onClick={sendMessage}
                    disabled={isLoading || models.length === 0}
                  >
                    {isLoading ? '发送中...' : '发送'}
                  </button>
                </div>
                
                {/* 模型选择下拉框 */}
                <div className="mt-3 flex justify-between items-center">
                  {models.length > 0 && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500 mr-2">当前模型:</span>
                      <select
                        className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                          className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50 flex items-center"
                          onClick={goToSettings}
                          title="配置模型"
                        >
                          配置
                        </button>
                        <button
                          className="ml-2 px-2 py-1 text-sm text-green-600 hover:text-green-800 border border-green-600 rounded-md hover:bg-green-50 flex items-center"
                          onClick={() => router.push('/settings')}
                          title="新增模型"
                        >
                          <FaPlus className="mr-1" /> 新增
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
