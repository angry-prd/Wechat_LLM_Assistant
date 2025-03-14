'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Preview() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    // TODO: 获取文章列表
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(data);
      if (data.length > 0) {
        setSelectedArticle(data[0]);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">微信预览</h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">文章列表</h2>
            <div className="space-y-2">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    selectedArticle?.id === article.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {article.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="max-w-[500px] mx-auto">
              <div className="bg-[#f8f8f8] p-4 rounded-lg">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold">{selectedArticle?.title}</h2>
                  <p className="text-sm text-gray-500">作者：管理员</p>
                </div>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedArticle?.content || '请选择一篇文章进行预览'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 