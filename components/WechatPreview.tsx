'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare } from '@fortawesome/free-solid-svg-icons';

interface WechatPreviewProps {
  content?: string;
}

export default function WechatPreview({ content = '' }: WechatPreviewProps) {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const handlePublish = async () => {
    try {
      // TODO: 这里需要替换为实际的微信 API 调用
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          coverImage,
          content,
        }),
      });
      
      if (response.ok) {
        alert('发布成功！');
      } else {
        throw new Error('发布失败');
      }
    } catch (error) {
      console.error('发布文章时出错:', error);
      alert('发布失败，请重试');
    }
  };

  return (
    <div className="space-y-4">
      {/* 文章设置 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">文章设置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">文章标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="请输入文章标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">封面图片</label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="请输入封面图片URL"
            />
          </div>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">预览效果</h3>
          <button
            onClick={handlePublish}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center"
          >
            <FontAwesomeIcon icon={faShare} className="mr-2" />
            发布文章
          </button>
        </div>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="prose max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
} 