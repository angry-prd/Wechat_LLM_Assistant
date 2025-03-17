'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import Toast from '@/components/Toast';

// 定义文章类型接口
interface Article {
  id: string;
  title: string;
  content: string;
}

// 定义用户配置类型接口
interface UserConfig {
  userId: string;
  wechatAppId: string;
  defaultArticleAuthor: string;
}

export default function Publish() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [userConfigs, setUserConfigs] = useState<UserConfig[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('default');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as const });

  useEffect(() => {
    fetchArticles();
    fetchUserConfigs();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/articles?userId=${selectedUserId}`);
      const data = await response.json();
      setArticles(data);
      if (data.length > 0) {
        setSelectedArticle(data[0]);
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      setToast({
        visible: true,
        message: '获取文章列表失败',
        type: 'error'
      });
    }
  };
  
  // 获取所有用户配置
  const fetchUserConfigs = async () => {
    try {
      // 这里简化处理，实际应用中应该有一个API端点来获取所有用户配置列表
      // 这里模拟获取默认用户配置
      const response = await fetch(`${API_ENDPOINTS.userConfig}?userId=default`);
      const defaultConfig = await response.json();
      
      // 将默认配置添加到列表中
      setUserConfigs([{
        userId: 'default',
        wechatAppId: defaultConfig.wechatAppId || '未配置',
        defaultArticleAuthor: defaultConfig.defaultArticleAuthor || ''
      }]);
      
      // 如果有其他用户配置，可以在这里添加到列表中
    } catch (error) {
      console.error('获取用户配置失败:', error);
      setToast({
        visible: true,
        message: '获取用户配置失败',
        type: 'error'
      });
    }
  };

  const handlePublish = async () => {
    if (!selectedArticle) return;
    
    setIsPublishing(true);
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          articleId: selectedArticle.id,
          title: selectedArticle.title,
          content: selectedArticle.content,
          userId: selectedUserId
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setToast({
          visible: true,
          message: result.message || '发布成功！',
          type: 'success'
        });
        fetchArticles(); // 刷新文章列表
      } else {
        throw new Error(result.error || '发布失败');
      }
    } catch (error) {
      console.error('发布失败:', error);
      setToast({
        visible: true,
        message: error instanceof Error ? error.message : '发布失败，请重试',
        type: 'error'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <h1 className="text-3xl font-bold mb-8">发布管理</h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">待发布文章</h2>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">发布设置</h2>
              <button
                onClick={handlePublish}
                disabled={!selectedArticle || isPublishing}
                className={`px-6 py-2 rounded-lg text-white font-medium ${
                  !selectedArticle || isPublishing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPublishing ? '发布中...' : '发布到微信'}
              </button>
            </div>

            {selectedArticle ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    文章标题
                  </label>
                  <input
                    type="text"
                    value={selectedArticle.title}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发布时间
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发布类型
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="immediate">立即发布</option>
                    <option value="scheduled">定时发布</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户配置
                  </label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {userConfigs.map(config => (
                      <option key={config.userId} value={config.userId}>
                        {config.userId} {config.wechatAppId ? `(${config.wechatAppId})` : '(未配置)'}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {userConfigs.find(c => c.userId === selectedUserId)?.wechatAppId === '未配置' && 
                      <span className="text-red-500">当前用户未配置微信公众号，请先在设置中配置</span>
                    }
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">请选择一篇文章进行发布</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}