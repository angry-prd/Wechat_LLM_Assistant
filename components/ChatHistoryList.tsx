'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

interface ChatHistory {
  id: string;
  title: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

interface ChatHistoryListProps {
  chatHistories: ChatHistory[];
  isLoading: boolean;
  onSelectHistory: (history: ChatHistory) => void;
  onNewChat: () => void;
  onDeleteHistory: (id: string) => void;
  currentChatId?: string | null;
}

export default function ChatHistoryList({ 
  chatHistories, 
  isLoading,
  onSelectHistory, 
  onNewChat,
  onDeleteHistory,
  currentChatId = null
}: ChatHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDeleteHistory = (e: React.MouseEvent, historyId: string) => {
    e.stopPropagation(); // 防止触发选择历史事件
    if (confirm('确定要删除这个聊天历史吗？')) {
      onDeleteHistory(historyId);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-3 overflow-hidden">
      {/* 新建对话按钮 */}
      <button
        onClick={onNewChat}
        className="flex items-center justify-center w-full mb-3 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-base"
      >
        <FaPlus className="mr-2" size={14} />
        <span>新建对话</span>
      </button>
      
      <div
        className="flex items-center justify-between mb-3 cursor-pointer px-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-base font-semibold dark:text-white">聊天历史</h2>
        {isExpanded ? (
          <FaChevronDown className="text-gray-500" size={14} />
        ) : (
          <FaChevronRight className="text-gray-500" size={14} />
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-2 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-gray-500 text-center p-3 text-base">
              加载中...
            </div>
          ) : chatHistories.length === 0 ? (
            <div className="text-gray-500 text-center p-3 dark:text-gray-400 text-base">
              暂无聊天历史
            </div>
          ) : (
            chatHistories.map((history) => (
              <div
                key={history.id}
                className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-start group ${
                  currentChatId === history.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                }`}
                onClick={() => onSelectHistory(history)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate dark:text-white">{history.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(history.createdAt).toLocaleDateString()} {new Date(history.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteHistory(e, history.id)}
                  className="text-gray-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除聊天"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}