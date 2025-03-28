'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPlus, FaPaperclip, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';
import ClientAuthCheck from '@/components/ClientAuthCheck';
import ChatHistoryList from '@/components/ChatHistoryList';
import ModelSelector from '@/components/ModelSelector';
import ModelSetupGuide from '@/components/ModelSetupGuide';
import FileUploader from '@/components/FileUploader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ModelConfig {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  hasApiKey: boolean;
  isDefault?: boolean;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [hasModels, setHasModels] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 滚动到消息列表底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 获取聊天历史
  const fetchChatHistories = async () => {
    try {
      setIsHistoryLoading(true);
      const response = await fetch('/api/chat/history');
      if (!response.ok) {
        throw new Error('Failed to fetch chat histories');
      }
      const data = await response.json();
      if (data.success) {
        setChatHistories(data.histories);
      }
    } catch (err) {
      console.error('Error fetching chat histories:', err);
      toast.error('获取聊天历史失败');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // 检查是否有配置模型
  const checkModels = async () => {
    try {
      console.log('开始检查模型配置');
      // 添加时间戳防止缓存
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat-models?t=${timestamp}`);
      
      console.log('模型检查API响应状态:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('用户未登录，无法获取模型');
          setHasModels(false);
          return;
        }
        throw new Error('获取模型配置失败');
      }
      
      const data = await response.json();
      console.log('获取到模型数据:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const hasConfiguredModels = data.data.length > 0;
        console.log('是否有配置模型:', hasConfiguredModels, '模型数量:', data.data.length);
        setHasModels(hasConfiguredModels);
      } else {
        console.log('未找到模型配置或格式不正确');
        setHasModels(false);
      }
    } catch (error) {
      console.error('检查模型错误:', error);
      setHasModels(false);
    }
  };

  useEffect(() => {
    fetchChatHistories();
    checkModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!hasModels) {
      toast.error('请先配置AI模型');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          modelId: selectedModel?.id || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '发送消息失败');
      }

      const data = await response.json();
      
      // 从API响应中提取助手消息
      let assistantMessage: Message | null = null;
      if (data.success && data.data) {
        // OpenAI格式处理
        if (data.data.choices && data.data.choices[0]?.message) {
          assistantMessage = {
            role: 'assistant',
            content: data.data.choices[0].message.content
          };
        } 
        // 通用格式处理，适应其他可能的API响应
        else if (data.data.message) {
          assistantMessage = data.data.message;
        } 
        // 直接使用content字段
        else if (data.data.content) {
          assistantMessage = {
            role: 'assistant',
            content: data.data.content
          };
        }
      }
      
      if (!assistantMessage) {
        throw new Error('无法解析API响应');
      }
      
      const newMessages = [...updatedMessages, assistantMessage];
      setMessages(newMessages);

      // 如果有当前会话ID，更新会话
      if (currentChatId) {
        updateChatHistory(currentChatId, newMessages);
      } 
      // 如果是第一条消息，创建新会话
      else if (updatedMessages.length === 1) {
        saveChatHistory(newMessages);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || '发送消息失败');
      toast.error(err.message || '发送消息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 保存聊天历史
  const saveChatHistory = async (chatMessages: Message[]) => {
    if (chatMessages.length === 0) return;

    try {
      const title = chatMessages[0].content.substring(0, 30) + (chatMessages[0].content.length > 30 ? '...' : '');
      const response = await fetch('/api/chat/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          messages: chatMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('保存聊天历史失败');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('聊天已保存');
        setCurrentChatId(data.chatHistory.id);
        fetchChatHistories();
      }
    } catch (err) {
      console.error('Error saving chat history:', err);
      toast.error('保存聊天历史失败');
    }
  };

  // 更新聊天历史
  const updateChatHistory = async (id: string, updatedMessages: Message[]) => {
    try {
      const response = await fetch('/api/chat/history', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('更新聊天历史失败');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '更新聊天历史失败');
      }
    } catch (err) {
      console.error('Error updating chat history:', err);
      toast.error('更新聊天历史失败');
    }
  };

  // 删除聊天历史
  const deleteChatHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/history?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除聊天历史失败');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('聊天历史已删除');
        fetchChatHistories();
        
        // 如果删除的是当前聊天，清空当前消息
        if (id === currentChatId) {
          setMessages([]);
          setCurrentChatId(null);
        }
      }
    } catch (err) {
      console.error('Error deleting chat history:', err);
      toast.error('删除聊天历史失败');
    }
  };

  // 加载历史聊天
  const loadChatHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setCurrentChatId(history.id);
  };

  // 创建新聊天
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  // 处理模型选择
  const handleModelSelect = (model: ModelConfig) => {
    setSelectedModel(model);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 处理文件选择
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0) {
      toast.success(`已选择 ${files.length} 个文件`);
    }
  };

  // 切换附件上传区域
  const toggleAttachment = () => {
    setIsAttachmentOpen(!isAttachmentOpen);
  };

  // 清除所有选择的文件
  const clearAttachments = () => {
    setSelectedFiles([]);
    setIsAttachmentOpen(false);
  };

  return (
    <ClientAuthCheck>
      <div className="page-container flex flex-col md:flex-row h-[calc(100vh-60px)] max-h-screen overflow-hidden">
        {/* 聊天历史侧边栏 - 缩小宽度 */}
        <div className="w-full md:w-1/5 lg:w-1/6 border-r border-gray-200 dark:border-gray-700 h-full overflow-hidden flex-shrink-0">
          <ChatHistoryList 
            chatHistories={chatHistories} 
            isLoading={isHistoryLoading} 
            onSelectHistory={loadChatHistory}
            onNewChat={handleNewChat}
            onDeleteHistory={deleteChatHistory}
            currentChatId={currentChatId}
          />
        </div>

        {/* 主聊天区域 - 增加宽度 */}
        <div className="w-full md:w-4/5 lg:w-5/6 h-full flex flex-col p-2 overflow-hidden">
          {/* 消息列表 - 调整内边距和间距，适当放大字体 */}
          <div className="flex-grow overflow-y-auto mb-2 pr-2 pb-1">
            {messages.length === 0 ? (
              hasModels ? (
                <div className="flex flex-col items-center justify-center h-[70%] text-center">
                  <h2 className="text-xl font-bold mb-2">欢迎使用AI助手</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base">
                    开始一个新的对话，或从历史记录中选择一个聊天
                  </p>
                </div>
              ) : (
                <ModelSetupGuide />
              )
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-50 dark:bg-blue-900/20 ml-6'
                      : 'bg-gray-50 dark:bg-gray-800/50 mr-6'
                  }`}
                >
                  <div className="font-bold mb-1 text-base">
                    {message.role === 'user' ? '你' : 'AI助手'}
                  </div>
                  <ReactMarkdown
                    className="prose dark:prose-invert max-w-none"
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ))
            )}
            {isLoading && (
              <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 mr-6">
                <div className="font-bold mb-1 text-base">AI助手</div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                <div className="font-bold mb-1 text-base">错误</div>
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 - 调整为更高且居中的设计，增加与底部的距离 */}
          <div className="flex-shrink-0 mt-auto mb-4 px-4">
            <div className="max-w-4xl mx-auto relative flex flex-col rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg dark:bg-gray-700">
              {/* 附件上传区域 */}
              {isAttachmentOpen && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">文件上传</h3>
                    <button
                      onClick={toggleAttachment}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                  <FileUploader onFileSelect={handleFileSelect} />
                </div>
              )}
              
              {/* 附件按钮区域 */}
              <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <button
                  className={`p-1.5 rounded-full ${isAttachmentOpen ? 'text-blue-500 bg-blue-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors`}
                  title="添加附件"
                  onClick={toggleAttachment}
                >
                  <FaPaperclip size={14} />
                </button>
                
                {selectedFiles.length > 0 && (
                  <div className="ml-2 text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <span className="mr-1">已选择 {selectedFiles.length} 个文件</span>
                    <button 
                      className="text-red-500 hover:text-red-700 ml-2"
                      onClick={clearAttachments}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* 文本输入区域 */}
              <div className="flex items-center">
                <textarea
                  className="flex-grow px-4 py-3 border-0 focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white text-base resize-none min-h-[80px]"
                  placeholder="输入你的问题..."
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || !hasModels}
                />
              </div>
              
              {/* 底部工具栏 */}
              <div className="flex justify-between items-center px-3 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                {/* 模型选择器按钮 */}
                <div className="flex-shrink-0">
                  <ModelSelector 
                    selectedModel={selectedModel} 
                    onSelectModel={handleModelSelect} 
                  />
                </div>
                
                {/* 发送按钮 */}
                <button
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || !hasModels}
                >
                  <span>发送</span>
                  <FaPaperPlane size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientAuthCheck>
  );
}
