'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
      title: `新对话 ${new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
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
    localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(updatedMessages));
    
    // 更新会话信息
    const updatedSession = chatSessions.find(session => session.id === currentSessionId);
    if (updatedSession) {
      updatedSession.lastMessage = userMessage.content;
      updatedSession.timestamp = userMessage.timestamp;
      const updatedSessions = chatSessions.map(session => 
        session.id === currentSessionId ? updatedSession : session
      );
      setChatSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    }
    
    try {
      // 准备发送到API的消息格式
      const apiMessages = updatedMessages.map(({ role, content }) => ({
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
        
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        
        // 保存消息到本地存储
        localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(finalMessages));
        
        // 更新会话信息
        if (updatedSession) {
          updatedSession.lastMessage = assistantMessage.content;
          updatedSession.timestamp = assistantMessage.timestamp;
          const updatedSessions = chatSessions.map(session => 
            session.id === currentSessionId ? updatedSession : session
          );
          setChatSessions(updatedSessions);
          localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
        }
      } else {
        // 错误处理
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `错误: ${result.message || '发生未知错误'}`,
          timestamp: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(finalMessages));
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '发送消息失败，请检查网络连接或稍后再试。',
        timestamp: new Date().toISOString()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      localStorage.setItem(`messages_${currentSessionId}`, JSON.stringify(finalMessages));
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
                <p className="font-medium text-gray-800 truncate">{session.title}</p>
                <p className="text-sm text-gray-500 truncate">{session.lastMessage}</p>
                <p className="text-xs text-gray-400">
                  {new Date(session.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button 
                onClick={(e) => deleteSession(session.id, e)}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 移除外层容器的内边距，使内容区域更靠近侧边栏 */}
        <div className="flex flex-col flex-1 bg-gray-50 overflow-hidden">
          <div className="mx-auto w-full max-w-4xl px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <button 
                  className="mr-3 text-gray-600 hover:text-gray-900"
                  onClick={() => setShowSessionList(!showSessionList)}
                >
                  {showSessionList ? '◀' : '▶'}
                </button>
                <h1 className="text-2xl font-bold">AI 聊天</h1>
              </div>
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
            <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow p-4 h-[calc(100vh-220px)]">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
