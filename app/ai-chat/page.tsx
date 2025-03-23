'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaSync } from 'react-icons/fa';
import ChatHistoryList from '@/components/ChatHistoryList';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  const { data: session } = useSession();
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
    if (!session) {
      router.push('/login');
      return;
    }
    
    // 加载聊天历史记录
    fetchChatHistories();
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistories = async () => {
    try {
      const response = await fetch('/api/chat/history');
      const data = await response.json();
      if (data.success) {
        setHistories(data.histories);
      }
    } catch (error) {
      console.error('Error fetching chat histories:', error);
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
      // const data = await response.json();
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message
      };
      const updatedMessages = [...messages, newMessage, assistantMessage];
      setMessages(updatedMessages);
      
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
      fetchChatHistories();
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ChatHistoryList histories={histories} onSelectHistory={handleSelectHistory} />
      <div className="flex-1 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
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
