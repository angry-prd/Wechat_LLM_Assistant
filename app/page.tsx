'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPen, FaRobot, FaWeixin } from 'react-icons/fa';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null as number | null);
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 检查用户是否已登录
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      setIsLoggedIn(!!userData);
    };
    
    checkLoginStatus();
    
    // 添加存储事件监听器，当localStorage变化时更新状态
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const features: Feature[] = [
    {
      id: 1,
      title: 'AI文章生成',
      description: '利用AI大模型，快速生成高质量的文章内容',
      icon: <FaRobot size={24} color="#2563eb" />,
      link: '/ai-chat'
    },
    {
      id: 2,
      title: 'Markdown编辑',
      description: '使用Markdown编辑器，轻松美化文章排版',
      icon: <FaPen size={24} color="#16a34a" />,
      link: '/editor'
    },
    {
      id: 3,
      title: '一键发布',
      description: '直接发布到微信公众号，省去繁琐的复制粘贴',
      icon: <FaWeixin size={24} color="#4f46e5" />,
      link: '/publish'
    }
  ];

  // 获取功能卡片的链接地址，未登录时可访问介绍页
  const getFeatureLink = (feature: Feature) => {
    // 特性介绍页面可自由访问，不需要登录
    if (feature.id === 1) {
      return '/ai-chat/landing'; // AI文章生成的介绍页面
    } else if (feature.id === 2) {
      return '/editor/landing'; // Markdown编辑器的介绍页面
    } else if (feature.id === 3) {
      return '/publish/landing'; // 一键发布的介绍页面
    }
    
    // 高级功能需要登录
    return isLoggedIn ? feature.link : `/login?redirect=${encodeURIComponent(feature.link)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
          欢迎使用微信公众号AI助手
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          一个集成了AI大模型和Markdown编辑器的微信公众号推文助手
        </p>
        <div className="flex justify-center gap-4 mb-12">
          <Link 
            href={isLoggedIn ? "/ai-chat" : "/login?redirect=/ai-chat"} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors"
          >
            开始使用
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <Link 
            href={getFeatureLink(feature)} 
            key={feature.id}
            className="block text-decoration-none"
          >
            <div 
              className={`bg-white p-6 rounded-xl shadow-md transition-all duration-300 ${
                isClient && hoveredCard === feature.id ? 'transform scale-105 shadow-lg' : ''
              }`}
              onMouseEnter={() => isClient && setHoveredCard(feature.id)}
              onMouseLeave={() => isClient && setHoveredCard(null)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-center mb-4">
                {feature.description}
              </p>
              <div className="text-center text-blue-600 font-medium">了解更多</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">提升您的公众号内容质量</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          使用我们的AI助手，轻松创建高质量的微信公众号推文
        </p>
      </div>
    </div>
  );
}