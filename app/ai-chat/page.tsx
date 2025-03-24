'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaSync } from 'react-icons/fa';
import ChatHistoryList from '@/components/ChatHistoryList';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/Spinner';

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: string;
  createdAt: Date;
}

export default function AIChatPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
    
    // 加载聊天历史记录
    fetchChatHistories();
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [error, setError] = useState<string>('');

  const fetchChatHistories = async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await fetch('/api/chat/history');
      const data = await response.json();
      if (data.success) {
        setHistories(data.histories);
      } else {
        setError(data.message || '加载聊天历史失败');
      }
    } catch (error) {
      console.error('Error fetching chat histories:', error);
      setError('网络请求失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (history: ChatHistory) => {
    const parsedMessages = JSON.parse(history.messages);
    setMessages(parsedMessages);
  };

  const generateTitle = (messages: Message[]): string => {
    if (messages.length === 0) return '新对话';
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return '新对话';
    return firstUserMessage.content.slice(0, 20) + (firstUserMessage.content.length > 20 ? '...' : '');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage]
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API请求失败');
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.choices[0].message.content
      };
      const updatedMessages = [...messages, newMessage, assistantMessage];
      setMessages(updatedMessages);
      
      try {
        // 保存聊天记录
        await fetch('/api/chat/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: generateTitle(updatedMessages),
            messages: JSON.stringify(updatedMessages)
          }),
        });
        
        // 刷新历史记录列表
        await fetchChatHistories();
      } catch (saveError) {
        console.error('Error saving chat history:', saveError);
        setError('保存聊天记录失败，但不影响当前对话');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : '发送消息失败，请重试');
      // 移除失败的消息
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 移除全屏加载状态，改为局部加载指示器 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-3 text-red-700 hover:text-red-900">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
      <ChatHistoryList histories={histories} onSelectHistory={handleSelectHistory} />
      <div className="flex-1 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading && histories.length === 0 ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <FaSync className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600">加载聊天历史中...</span>
              </div>
            </div>
          ) : (
            <div className="h-[600px] overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'assistant' ? 'bg-white border border-gray-200' : 'bg-blue-600 text-white'}`}
                    >
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        {message.content}
                      </pre>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <FaSync className="w-4 h-4 animate-spin text-gray-500" />
                        <span>正在思考...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="输入消息，按Enter发送，Shift+Enter换行"
                className="flex-1 min-h-[80px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
