'use client';

import React from 'react';
import Link from 'next/link';
import { FaRobot, FaArrowLeft, FaMagic, FaRegClock, FaRegLightbulb, FaRegEdit } from 'react-icons/fa';

export default function AIGeneratorLandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 返回首页按钮 */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span className="mr-2 inline-block">
            <FaArrowLeft size={16} color="currentColor" />
          </span>
          返回首页
        </Link>
      </div>

      {/* 标题区域 */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
          <FaRobot size={36} color="#2563eb" />
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{
          background: 'linear-gradient(to right, #2563eb, #4f46e5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI文章生成
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          利用先进的AI大模型，轻松生成高质量、原创性强的文章内容，提升创作效率
        </p>
      </div>

      {/* 主要特点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <FaMagic size={20} color="#2563eb" />
          </div>
          <h3 className="text-xl font-semibold mb-3">智能创作</h3>
          <p className="text-gray-600">
            基于先进的大语言模型，能够理解您的创作意图，生成符合主题、逻辑清晰的高质量文章
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <FaRegClock size={20} color="#2563eb" />
          </div>
          <h3 className="text-xl font-semibold mb-3">效率提升</h3>
          <p className="text-gray-600">
            几分钟内完成从构思到成稿的全过程，大幅节省写作时间，让您专注于内容审核和优化
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <FaRegLightbulb size={20} color="#2563eb" />
          </div>
          <h3 className="text-xl font-semibold mb-3">创意激发</h3>
          <p className="text-gray-600">
            突破创作瓶颈，AI提供多样化的表达方式和内容建议，激发您的创作灵感
          </p>
        </div>
      </div>

      {/* 使用流程 */}
      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">简单三步，轻松生成优质文章</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
            <h3 className="text-lg font-semibold mb-2">输入主题</h3>
            <p className="text-gray-600">输入您想要创作的文章主题、关键词或简要描述</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
            <h3 className="text-lg font-semibold mb-2">选择风格</h3>
            <p className="text-gray-600">选择适合的文章风格、长度和结构要求</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
            <h3 className="text-lg font-semibold mb-2">生成文章</h3>
            <p className="text-gray-600">AI快速生成文章，您可以直接编辑、优化或发布</p>
          </div>
        </div>
      </div>

      {/* 示例展示 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">AI生成文章示例</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaRegEdit size={18} color="#2563eb" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">《数字化转型：企业发展的必由之路》</h3>
              <p className="text-sm text-gray-500 mb-2">生成时间：2分钟 | 字数：1200字</p>
              <p className="text-gray-700 mb-3">
                在当今数字经济时代，数字化转型已经成为企业保持竞争力的关键战略。本文将探讨数字化转型的重要性、实施路径以及成功案例，帮助企业领导者更好地理解和规划自身的数字化转型之旅...
              </p>
              <div className="text-sm text-gray-500">
                <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2">#企业管理</span>
                <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2">#数字化转型</span>
                <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 mb-2">#技术创新</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 行动号召 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">开始使用AI助力您的创作</h2>
        <p className="text-xl mb-6">告别写作困难，让AI成为您的创作助手</p>
        <Link href="/ai-chat" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors">
          立即体验
        </Link>
      </div>
    </div>
  );
}