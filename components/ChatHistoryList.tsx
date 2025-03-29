'use client';

import React from 'react';
import { FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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

interface ChatHistoryListProps {
  chatHistories: ChatHistory[];
  onSelectHistory: (history: ChatHistory) => void;
  onNewChat: () => void;
  onDeleteHistory: (id: string) => void;
  currentChatId: string | null;
  isLoading: boolean;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({
  chatHistories,
  onSelectHistory,
  onNewChat,
  onDeleteHistory,
  currentChatId,
  isLoading
}) => {
  const router = useRouter();
  
  // 获取简短的聊天标题
  const getShortTitle = (title: string) => {
    return title.length > 28 ? title.substring(0, 25) + '...' : title;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch (error) {
      return '未知时间';
    }
  };
  
  // 处理选择聊天历史
  const handleSelectHistory = (history: ChatHistory) => {
    // 调用传入的选择历史函数
    onSelectHistory(history);
    
    // 更新URL以包含聊天ID
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', history.id);
      window.history.pushState({}, '', url.toString());
    }
  };

  // 按日期分组聊天历史
  const groupChatsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    const groups: { [key: string]: ChatHistory[] } = {
      '今天': [],
      '昨天': [],
      '前7天': [],
      '30天前': []
    };
    
    chatHistories.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0);
      
      if (chatDate.getTime() === today.getTime()) {
        groups['今天'].push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        groups['昨天'].push(chat);
      } else if (chatDate >= lastWeek) {
        groups['前7天'].push(chat);
      } else {
        groups['30天前'].push(chat);
      }
    });
    
    return groups;
  };

  const groupedChats = groupChatsByDate();

  return (
    <div className="h-full flex flex-col">
      {/* 新建聊天按钮 */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full py-3 px-3 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
        >
          <FaPlus size={12} />
          <span>新建对话</span>
        </button>
      </div>
      
      {/* 历史记录标题 */}
      <div className="px-3 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
        聊天历史
      </div>
      
      {/* 聊天历史列表 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-gray-400" size={20} />
          </div>
        ) : chatHistories.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            暂无聊天历史
          </div>
        ) : (
          Object.entries(groupedChats).map(([group, chats]) => 
            chats.length > 0 && (
              <div key={group} className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                  {group}
                </div>
                {chats.map((history) => (
                  <div
                    key={history.id}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                      currentChatId === history.id
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectHistory(history)}
                  >
                    <div className="flex-1 truncate">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                        {getShortTitle(history.title)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(history.updatedAt)}
                      </div>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory(history.id);
                      }}
                      title="删除聊天"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default ChatHistoryList;