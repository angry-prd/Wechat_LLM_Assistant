'use client';

import React from 'react';
import Link from 'next/link';
import { FaRobot, FaArrowLeft, FaComments, FaLightbulb, FaHistory, FaUserFriends } from 'react-icons/fa';

export default function AIChatLandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 返回首页按钮 */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span className="mr-2"><FaArrowLeft /></span>
          返回首页
        </Link>
      </div>

      {/* 标题区域 */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
          <FaRobot size={36} />
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{
          background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI智能对话
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          与先进的AI大模型对话，获取创作灵感、内容建议和专业知识，提升您的公众号创作效率
        </p>
      </div>

      {/* 主要特点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <span><FaComments size={20} /></span>
          </div>
          <h3 className="text-xl font-semibold mb-3">自然对话</h3>
          <p className="text-gray-600">
            像与人类助手交流一样，通过自然语言与AI进行流畅对话，无需学习复杂指令
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <span><FaLightbulb size={20} /></span>
          </div>
          <h3 className="text-xl font-semibold mb-3">创作助手</h3>
          <p className="text-gray-600">
            获取文章创意、内容建议、标题推荐和素材整理，帮助您突破创作瓶颈
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <span><FaHistory size={20} /></span>
          </div>
          <h3 className="text-xl font-semibold mb-3">对话记录</h3>
          <p className="text-gray-600">
            自动保存所有对话历史，方便随时查阅和继续之前的讨论，不会丢失有价值的灵感
          </p>
        </div>
      </div>

      {/* 使用场景 */}
      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">AI对话的应用场景</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-3">
                <span className="text-purple-600 font-bold">1</span>
              </span>
              内容创作辅助
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>根据主题获取多个文章创意和大纲建议</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>针对特定段落获取多种表达方式和修改建议</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>生成吸引人的标题和引人入胜的开场白</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>获取文章结构和逻辑优化建议</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-3">
                <span className="text-purple-600 font-bold">2</span>
              </span>
              知识获取与研究
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>快速了解特定领域的基础知识和最新动态</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>获取专业术语解释和深入分析</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>发现不同观点和多角度思考</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-purple-100 rounded-full mr-2 mt-1"></span>
                <span>整理和总结复杂信息，形成清晰脉络</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 对话示例 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">AI对话示例</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <FaUserFriends className="text-gray-600" />
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                <p className="text-gray-800">我想写一篇关于数字化转型的文章，但不知道从哪些角度切入比较好，能给我一些建议吗？</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaRobot className="text-purple-600" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 max-w-3xl">
                <p className="text-gray-800 mb-2">数字化转型是个很好的主题！以下是几个可以切入的角度：</p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li><strong>企业战略视角</strong>：探讨数字化转型如何成为企业核心战略，以及如何与整体业务目标对齐</li>
                  <li><strong>技术实现路径</strong>：分析云计算、大数据、AI等关键技术在数字化转型中的应用</li>
                  <li><strong>组织变革管理</strong>：讨论数字化转型过程中的人才培养、组织结构调整和企业文化重塑</li>
                  <li><strong>行业案例分析</strong>：选择2-3个成功案例，深入分析其数字化转型的具体措施和成效</li>
                  <li><strong>挑战与解决方案</strong>：探讨企业在数字化转型过程中常见的障碍和应对策略</li>
                </ol>
                <p className="text-gray-800 mt-2">您想重点关注哪个角度？或者需要我帮您制定一个完整的文章大纲吗？</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 行动号召 */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">开始与AI对话</h2>
        <p className="text-xl mb-6">获取创作灵感，提升您的公众号内容质量</p>
        <Link href="/ai-chat" className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-purple-50 transition-colors">
          立即体验
        </Link>
      </div>
    </div>
  );
}