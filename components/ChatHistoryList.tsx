'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface ChatHistory {
  id: string;
  title: string;
  messages: string;
  createdAt: Date;
}

interface ChatHistoryListProps {
  histories: ChatHistory[];
  onSelectHistory: (history: ChatHistory) => void;
}

export default function ChatHistoryList({ histories, onSelectHistory }: ChatHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold">聊天历史</h2>
        {isExpanded ? (
          <FaChevronDown className="text-gray-500" />
        ) : (
          <FaChevronRight className="text-gray-500" />
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-2">
          {histories.map((history) => (
            <div
              key={history.id}
              className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => onSelectHistory(history)}
            >
              <div className="text-sm font-medium truncate">{history.title}</div>
              <div className="text-xs text-gray-500">
                {new Date(history.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}