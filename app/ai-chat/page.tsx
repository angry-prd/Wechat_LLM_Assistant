'use client';
import React from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaPlus, FaPaperclip, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-hot-toast';
import ChatHistoryList from '@/components/ChatHistoryList';
import ModelSelector from '@/components/ModelSelector';
import ModelSetupGuide from '@/components/ModelSetupGuide';
import FileUploader from '@/components/FileUploader';
import { useRouter } from 'next/navigation';

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

// 为ReactMarkdown组件code函数定义类型
interface CodeProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
  [key: string]: any;
}

export default function AIChat() {
  const [messages, setMessages] = useState([] as Message[]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [chatHistories, setChatHistories] = useState([] as ChatHistory[]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null as string | null);
  const [selectedModel, setSelectedModel] = useState(null as ModelConfig | null);
  const [hasModels, setHasModels] = useState(null as boolean | null);
  const messagesEndRef = useRef(null as HTMLDivElement | null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([] as File[]);
  const router = useRouter();

  // 滚动到消息列表底部 - 修改为只滚动消息容器
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // 获取包含消息的容器元素
      const container = messagesEndRef.current.parentElement;
      if (container) {
        // 只滚动消息容器，而不是整个页面
        container.scrollTop = container.scrollHeight;
      } else {
        // 如果无法获取到容器，才使用scrollIntoView
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  };

  // 获取聊天历史
  const fetchChatHistories = async () => {
    try {
      setIsHistoryLoading(true);
      
      // 添加时间戳参数防止缓存
      const timestamp = new Date().getTime();
      const url = `/api/chat/history?t=${timestamp}`;
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`获取聊天历史失败 (${response.status})`);
      }
      
      const data = await response.json();
      if (data.success) {
        console.log(`成功获取${data.histories.length}条聊天历史`);
        
        // 处理每个历史记录中的messages，确保它是对象而不是字符串
        const processedHistories = data.histories.map((history: any) => {
          let processedMessages: Message[];
          try {
            // 尝试解析messages字段，如果它是JSON字符串
            if (typeof history.messages === 'string') {
              processedMessages = JSON.parse(history.messages);
            } else {
              processedMessages = history.messages;
            }
          } catch (e) {
            console.error('解析消息失败:', e);
            processedMessages = [];
          }
          return {
            ...history,
            messages: processedMessages
          };
        });
        
        setChatHistories(processedHistories);
      } else {
        console.warn('获取聊天历史API返回失败状态:', data.message);
        setChatHistories([]);
      }
    } catch (err) {
      console.error('获取聊天历史出错:', err);
      toast.error('获取聊天历史失败');
      setChatHistories([]);
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
      
      console.log('模型检查API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error('获取模型配置失败');
      }
      
      const data = await response.json();
      console.log('获取到模型数据:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        const hasConfiguredModels = data.data.length > 0;
        console.log('是否有配置模型:', hasConfiguredModels, '模型数量:', data.data.length);
        setHasModels(hasConfiguredModels);
        
        // 如果有模型配置，直接选择第一个或默认模型
        if (hasConfiguredModels && !selectedModel) {
          const defaultModel = data.data.find((model: ModelConfig) => model.isDefault);
          setSelectedModel(defaultModel || data.data[0]);
          console.log('自动选择模型:', defaultModel?.name || data.data[0].name);
        }
      } else {
        console.log('未找到模型配置或格式不正确');
        setHasModels(false);
      }
    } catch (error) {
      console.error('检查模型错误:', error);
      setHasModels(false);
    }
  };

  // 获取当前登录用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr);
        } catch (e) {
          console.error('解析用户数据失败:', e);
        }
      }
    }
    return null;
  };

  // 检查是否有配置模型并加载聊天历史
  useEffect(() => {
    fetchChatHistories();
    checkModels();
    
    // 每次进入页面时，默认创建新的聊天
    // 除非URL中有指定的聊天ID
    const handleNewChatOnLoad = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('id');
        
        if (chatId) {
          // 如果URL中有聊天ID，加载指定的聊天
          fetch(`/api/chat/history?id=${chatId}`)
            .then(response => response.json())
            .then(data => {
              if (data.success && data.chatHistory) {
                setMessages(data.chatHistory.messages);
                setCurrentChatId(data.chatHistory.id);
              } else {
                // 如果找不到指定的聊天，重置为新聊天
                handleNewChat();
              }
            })
            .catch(err => {
              console.error('加载指定聊天失败:', err);
              handleNewChat();
            });
        } else {
          // 如果没有指定聊天ID，始终创建新聊天
          handleNewChat();
        }
      }
    };
    
    handleNewChatOnLoad();
  }, []);

  // 确保消息变化时滚动到底部
  useEffect(() => {
    // 使用setTimeout确保DOM已经更新
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!hasModels || !selectedModel) {
      toast.error('请先配置AI模型');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    // 如果这是第一条消息且没有当前聊天ID，立即创建一个新聊天历史记录
    if (messages.length === 0 && !currentChatId) {
      try {
        const title = generateTitle([userMessage]);
        console.log('创建新聊天，初始标题:', title);
        const response = await fetch('/api/chat/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            messages: updatedMessages,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentChatId(data.chatHistory.id);
            fetchChatHistories(); // 立即刷新聊天列表
          }
        }
      } catch (err) {
        console.error('创建新聊天历史失败:', err);
        // 继续处理后续步骤，不中断消息发送流程
      }
    }

    try {
      console.log('准备发送消息，使用模型:', selectedModel?.name, '模型ID:', selectedModel?.id);
      
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
          modelId: selectedModel?.id
        }),
      });

      console.log('消息发送API响应状态:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '发送消息失败');
      }
      
      const data = await response.json();
      console.log('收到API响应:', data);
      
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
      // 如果之前没创建成功，则在AI回复后创建新的聊天历史
      else {
        saveChatHistory(newMessages);
      }
    } catch (err: any) {
      console.error('发送消息错误:', err);
      setError(err.message || '消息发送失败');
      toast.error(err.message || '消息发送失败');
      setIsLoading(false);
    }
  };

  // 生成聊天标题
  const generateTitle = (chatMessages: Message[]): string => {
    // 生成一个更有意义的标题
    let title = '';
    
    // 获取用户的第一条消息
    const userMessage = chatMessages.find(msg => msg.role === 'user');
    if (userMessage) {
      // 提取前30个字符，如果消息长度超过30个字符，添加省略号
      // 移除多余空格和换行符
      const cleanContent = userMessage.content
        .replace(/\s+/g, ' ')
        .trim();
      
      title = cleanContent.length > 30 
        ? cleanContent.substring(0, 30) + '...'
        : cleanContent;
    } 
    
    // 如果依然没有标题，使用默认标题
    if (!title) {
      const now = new Date();
      title = `对话 ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }

    return title;
  };

  // 保存聊天历史
  const saveChatHistory = async (chatMessages: Message[]) => {
    if (chatMessages.length === 0) return;

    try {
      // 生成标题 - 确保从用户第一条消息生成有意义的标题
      const title = generateTitle(chatMessages);

      console.log('准备保存聊天历史，标题:', title);
      
      // 获取当前登录用户信息
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        console.error('用户未登录或无法获取用户ID，无法保存聊天历史');
        toast.error('未登录，无法保存聊天历史');
        return;
      }
      
      // 序列化消息内容为JSON字符串
      const messagesJSON = JSON.stringify(chatMessages);
      
      console.log(`尝试保存聊天历史，用户ID: ${currentUser.id}, 标题: ${title}, 消息数: ${chatMessages.length}`);
      
      const response = await fetch('/api/chat/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 确保发送认证信息
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        credentials: 'include', // 确保发送cookies
        body: JSON.stringify({
          title,
          messages: messagesJSON,
          userId: currentUser.id, // 明确指定用户ID
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('保存聊天历史API错误:', response.status, errorData);
        throw new Error(errorData.message || `保存聊天历史失败 (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setCurrentChatId(data.chatHistory.id);
        console.log('聊天历史保存成功，ID:', data.chatHistory.id);
        fetchChatHistories(); // 刷新聊天历史列表
        toast.success('对话已保存');
      } else {
        throw new Error(data.message || '保存聊天历史失败');
      }
    } catch (err) {
      console.error('保存聊天历史错误:', err);
      toast.error('保存聊天历史失败');
    }
  };

  // 更新聊天历史
  const updateChatHistory = async (id: string, updatedMessages: Message[], title?: string) => {
    try {
      // 如果没有提供标题，但消息列表刚好有第一条用户消息，则生成标题
      let updatedTitle = title;
      if (!updatedTitle && updatedMessages.length > 0 && !chatHistories.some((h: ChatHistory) => h.id === id)) {
        updatedTitle = generateTitle(updatedMessages);
      }

      // 序列化消息内容为JSON字符串
      const messagesJSON = JSON.stringify(updatedMessages);
      
      const requestBody: any = {
        id,
        messages: messagesJSON,
      };

      // 只在有标题时才更新标题
      if (updatedTitle) {
        requestBody.title = updatedTitle;
      }

      // 获取当前用户ID
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id) {
        requestBody.userId = currentUser.id;
      }

      console.log('更新聊天历史:', id, updatedTitle ? `标题: ${updatedTitle}` : '不更新标题', `消息数: ${updatedMessages.length}`);
      
      const response = await fetch('/api/chat/history', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        credentials: 'include', // 确保发送cookies
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('更新聊天历史API错误:', response.status, errorData);
        throw new Error(errorData.message || `更新聊天历史失败 (${response.status})`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || '更新聊天历史失败');
      }

      // 更新成功后刷新聊天历史列表
      fetchChatHistories();
    } catch (err) {
      console.error('更新聊天历史错误:', err);
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
    // 确保messages是数组格式
    let processedMessages: Message[];
    try {
      if (typeof history.messages === 'string') {
        processedMessages = JSON.parse(history.messages);
      } else {
        processedMessages = history.messages;
      }
    } catch (e) {
      console.error('解析消息失败:', e);
      processedMessages = [];
      toast.error('消息格式错误，无法加载聊天历史');
    }
    
    setMessages(processedMessages);
    setCurrentChatId(history.id);
  };

  // 创建新聊天
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    
    // 更新URL，移除可能存在的id参数
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    }
  };

  // 处理模型选择
  const handleModelSelect = (model: ModelConfig) => {
    setSelectedModel(model);
  };

  const handleKeyDown = (e: any) => {
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

  // 复制内容到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('内容已复制到剪贴板');
      })
      .catch((err: any) => {
        console.error('复制失败:', err);
        toast.error('复制失败，请手动复制');
      });
  };

  // 重新生成响应
  const regenerateResponse = (messageIndex: number) => {
    if (isLoading) return;
    
    // 找到最后一个用户消息和它之前的所有消息
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);
    
    // 如果没有用户消息，则不重新生成
    if (messagesToKeep.length === 0) return;
    
    // 立即发送请求以重新生成响应
    setIsLoading(true);
    setError(null);
    
    fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
        messages: messagesToKeep.map((msg: Message) => ({
          role: msg.role,
          content: msg.content
        })),
        modelId: selectedModel?.id
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || '重新生成失败');
        });
      }
      return response.json();
    })
    .then(data => {
      let assistantMessage: Message | null = null;
      
      if (data.success && data.data) {
        // 处理不同格式的API响应
        if (data.data.choices && data.data.choices[0]?.message) {
          assistantMessage = {
            role: 'assistant',
            content: data.data.choices[0].message.content
          };
        } else if (data.data.message) {
          assistantMessage = data.data.message;
        } else if (data.data.content) {
          assistantMessage = {
            role: 'assistant',
            content: data.data.content
          };
        }
      }
      
      if (!assistantMessage) {
        throw new Error('无法解析API响应');
      }
      
      const newMessages = [...messagesToKeep, assistantMessage];
      setMessages(newMessages);
      
      // 如果有当前会话ID，更新会话
      if (currentChatId) {
        // 如果是第一次从新建的空会话开始重新生成，需要生成标题
        if (messagesToKeep.length === 1) {
          const title = generateTitle(messagesToKeep);
          updateChatHistory(currentChatId, newMessages, title);
        } else {
          updateChatHistory(currentChatId, newMessages);
        }
      } else {
        // 如果没有当前会话ID，创建新的聊天历史
        saveChatHistory(newMessages);
      }
    })
    .catch((err: any) => {
      console.error('重新生成错误:', err);
      setError(err.message || '重新生成失败');
      toast.error(err.message || '重新生成失败');
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  // 创建推文
  const createArticleFromResponse = (content: string) => {
    try {
      // 将内容保存到localStorage，以便在创建推文页面使用
      localStorage.setItem('article_draft_content', content);
      
      // 尝试从内容中提取标题
      const extractTitle = (text: string) => {
        // 尝试从Markdown标题中提取
        const headingMatch = text.match(/^#+ (.+)$/m);
        if (headingMatch) {
          return headingMatch[1].trim();
        }
        
        // 或使用第一行/第一句话
        const firstLine = text.split('\n')[0];
        const firstSentence = firstLine.split(/[.!?。！？]/)[0];
        
        // 如果太长则截取
        return firstSentence.length > 30 
          ? firstSentence.substring(0, 30) + '...'
          : firstSentence;
      };
      
      // 也尝试生成一个标题
      const title = extractTitle(content);
      if (title) {
        localStorage.setItem('article_draft_title', title);
      }
      
      // 提示用户正在跳转
      toast.success('内容已复制，正在跳转到推文编辑器...');
      
      // 跳转到创建推文页面
      setTimeout(() => {
        router.push('/articles/create');
      }, 800);
    } catch (error) {
      console.error('创建推文失败:', error);
      toast.error('创建推文失败，请手动复制内容');
    }
  };

  return (
    <div className="flex h-[calc(100vh-var(--navbar-height))] max-h-[calc(100vh-var(--navbar-height))] overflow-hidden">
      {/* 聊天历史侧边栏 - 仿ChatGPT风格 */}
      <div className="w-[260px] border-r border-gray-200 dark:border-gray-700 h-full flex flex-col bg-gray-50 dark:bg-gray-800">
        <ChatHistoryList 
          chatHistories={chatHistories} 
          isLoading={isHistoryLoading} 
          onSelectHistory={loadChatHistory}
          onNewChat={handleNewChat}
          onDeleteHistory={deleteChatHistory}
          currentChatId={currentChatId}
        />
      </div>

      {/* 主聊天区域 - 仿ChatGPT风格 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
        {/* 顶部模型选择栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center space-x-2">
            <ModelSelector 
              selectedModel={selectedModel} 
              onSelectModel={handleModelSelect} 
            />
            </div>
          <div className="flex items-center space-x-2">
            {/* 可以添加其他功能按钮，如全屏、主题切换等 */}
          </div>
        </div>
        
        {/* 消息内容区域 - 固定高度并启用滚动 */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto px-4 py-5 space-y-5 scroll-smooth chat-messages-container" style={{ height: '100%', overscrollBehavior: 'contain' }}>
            {messages.length === 0 ? (
              hasModels ? (
                <div className="flex flex-col items-center justify-center h-[70%] text-center">
                  <h2 className="text-2xl font-bold mb-3">有什么可以帮忙的?</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-base max-w-md">
                    开始一个新的对话，或从左侧历史记录中选择一个聊天
                  </p>
                </div>
              ) : (
                <ModelSetupGuide />
              )
            ) : (
              messages.map((message: Message, index: number) => (
                <div
                  key={index}
                  className={`max-w-3xl mx-auto ${
                    message.role === 'user'
                      ? 'text-right'
                      : ''
                  }`}
                >
                  <div className={`inline-block max-w-[85%] px-4 py-3 rounded-lg relative ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    <ReactMarkdown
                      className="prose dark:prose-invert max-w-none"
                      components={{
                        code({ node, inline, className, children, ...props }: CodeProps) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
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
                    
                    {/* AI回复消息的操作按钮 */}
                    {message.role === 'assistant' && (
                      <div className="flex mt-2 space-x-2 opacity-70 hover:opacity-100 transition-opacity">
                        <button 
                          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </button>
                        <button 
                          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => regenerateResponse(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          重新生成
                        </button>
                        <button 
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded flex items-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          onClick={() => createArticleFromResponse(message.content)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          创建推文
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
              {isLoading && (
              <div className="max-w-3xl mx-auto">
                <div className="inline-block max-w-[85%] px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="max-w-3xl mx-auto">
                <div className="inline-block max-w-[85%] px-4 py-3 rounded-lg bg-red-50 text-red-700">
                  <p className="font-medium">发生错误</p>
                  <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

        {/* 输入区域 - 仿ChatGPT风格 */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden bg-white dark:bg-gray-700">
            <textarea
                className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white resize-none min-h-[56px] max-h-[200px] text-base"
                placeholder="输入你的问题..."
                rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || !hasModels}
                style={{ lineHeight: '1.5' }}
              />
              
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                {/* 附件上传按钮 */}
                <button
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={toggleAttachment}
                  disabled={isLoading}
                  title="上传附件"
                >
                  <FaPaperclip size={16} />
                </button>
                
                {/* 发送按钮 */}
            <button
                  className={`p-2 rounded-md ${input.trim() && !isLoading && hasModels ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              onClick={sendMessage}
                  disabled={!input.trim() || isLoading || !hasModels}
                >
                  <FaPaperPlane size={16} />
                </button>
              </div>
            </div>
            
            {/* 附件上传区域 */}
            {isAttachmentOpen && (
              <div className="mt-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">附件上传</h3>
                  <button 
                    className="text-gray-500 hover:text-red-500"
                    onClick={clearAttachments}
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
                
                <FileUploader 
                  onFileSelect={handleFileSelect}
                />
                
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      已选择 {selectedFiles.length} 个文件
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedFiles.map((file: File, index: number) => (
                        <div
                          key={index}
                          className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded flex items-center"
                        >
                          <span className="truncate max-w-[100px]">{file.name}</span>
                          <button
                            className="ml-1 text-gray-500 hover:text-red-500"
                            onClick={() => {
                              const newFiles = [...selectedFiles];
                              newFiles.splice(index, 1);
                              setSelectedFiles(newFiles);
                            }}
                          >
                            <FaTimes size={10} />
              </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-xs text-center text-gray-500 mt-2">
              AI大模型也可能会犯错。检查重要信息的准确性。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
