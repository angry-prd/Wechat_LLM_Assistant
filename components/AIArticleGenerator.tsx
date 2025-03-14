'use client';

import { useState } from 'react';

export default function AIArticleGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          文章主题
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="请输入文章主题或关键词..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt}
        className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
          isLoading || !prompt
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? '生成中...' : '生成文章'}
      </button>

      {generatedContent && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">生成结果</h3>
          <div className="prose max-w-none">
            {generatedContent}
          </div>
        </div>
      )}
    </div>
  );
} 