'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaSun, FaMoon } from 'react-icons/fa';
import Toast from '../../../components/Toast';
import MarkdownEditor from '@/components/MarkdownEditor';
import PhonePreview from '@/components/PhonePreview';
import { toast } from 'react-hot-toast';
import { createArticle } from '@/lib/client/articleClient';

// 使用完全不同的结构重写
const CreateArticlePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 检查是否有从AI聊天页面传来的内容
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draftContent = localStorage.getItem('article_draft_content');
      const draftTitle = localStorage.getItem('article_draft_title');
      
      if (draftContent) {
        setContent(draftContent);
        
        if (draftTitle) {
          setTitle(draftTitle);
        } else {
          setTitle(generateTitleFromContent(draftContent));
        }
        
        localStorage.removeItem('article_draft_content');
        localStorage.removeItem('article_draft_title');
        
        toast.success('已从AI助手导入内容');
      }
    }
  }, []);
  
  // 从内容中生成标题
  const generateTitleFromContent = (text: string) => {
    const headingMatch = text.match(/^#+ (.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    
    const firstLine = text.split('\n')[0];
    const firstSentence = firstLine.split(/[.!?。！？]/)[0];
    
    if (firstSentence.length > 30) {
      return firstSentence.substring(0, 30) + '...';
    }
    
    return firstSentence || '新推文';
  };

  // 创建文章
  const handleCreateArticle = async (isDraft = true) => {
    if (!title.trim()) {
      toast.error('标题不能为空');
      return;
    }

    if (!content.trim()) {
      toast.error('内容不能为空');
      return;
    }

    setIsLoading(true);
    try {
      const articleData = { title, content, published: !isDraft };
      const response = await createArticle(articleData);
      
      if (response.success) {
        toast.success('文章已创建!');
        router.push('/articles');
      } else {
        toast.error(response.message || '创建失败，请重试');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('创建失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex flex-col h-screen max-w-screen pb-16 items-center">
      {/* 顶部标题容器 */}
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 w-full max-w-6xl">
        <h1 className="text-xl font-bold text-gray-800">推文编辑</h1>
        <Link href="/articles" className="text-blue-600 hover:text-blue-800 text-base font-medium">
          返回推文列表
        </Link>
      </header>
      
      {/* 主要内容区域 - 使用更窄的宽度并居中 */}
      <main className="flex flex-1 overflow-auto max-w-6xl w-full">
        {/* 左侧预览区 - 居中显示 */}
        <div className="flex justify-center items-center overflow-auto pl-4 w-1/2">
          <PhonePreview 
            title={title} 
            content={content} 
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>
        
        {/* 右侧编辑区 */}
        <section className="flex flex-col flex-1 overflow-auto">
          <div className={`flex items-center p-3 border-b ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
            <span className="font-bold text-base">Markdown 编辑器</span>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="输入文章标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
          
          <div className="flex-1 overflow-auto">
            <MarkdownEditor 
              value={content}
              onChange={setContent}
              darkMode={darkMode}
            />
          </div>
        </section>
      </main>
      
      {/* 底部按钮区域 */}
      <footer className="bg-gray-100 border-t border-gray-200 p-3 flex justify-end sticky bottom-0 w-full max-w-6xl mx-auto">
        <button 
          onClick={() => handleCreateArticle(true)}
          className={`px-4 py-2 rounded mr-3 border border-gray-300 bg-white text-gray-800 flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:text-blue-500'}`}
          disabled={isLoading}
        >
          保存为草稿
        </button>
        <button 
          onClick={() => handleCreateArticle(false)}
          className={`px-4 py-2 rounded bg-blue-500 text-white flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={isLoading}
        >
          <FaSave />
          {isLoading ? '处理中...' : '发布文章'}
        </button>
      </footer>
    </div>
  );
};

export default CreateArticlePage;