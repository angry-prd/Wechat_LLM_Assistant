'use client';

import React from 'react';
import Link from 'next/link';
import { FaWeixin, FaArrowLeft, FaRocket, FaSync, FaChartLine, FaMobileAlt, FaPaperPlane, FaClock } from 'react-icons/fa';
import Image from 'next/image';

export default function PublishLandingPage() {
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
          <FaWeixin size={36} />
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{
          background: 'linear-gradient(to right, #4f46e5, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          一键发布到微信公众号
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          无缝连接您的微信公众号，告别繁琐的复制粘贴，一键发布精美文章
        </p>
      </div>

      {/* 主要特点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
            <span><FaRocket size={20} /></span>
          </div>
          <h3 className="text-xl font-semibold mb-3">快速发布</h3>
          <p className="text-gray-600">
            一键将文章直接发布到微信公众号，无需手动复制粘贴，节省大量时间
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
            <span><FaSync size={20} /></span>
          </div>
          <h3 className="text-xl font-semibold mb-3">格式保持</h3>
          <p className="text-gray-600">
            完美保留Markdown格式和样式，确保文章在微信公众号中的展示效果与编辑器预览一致
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
            <span><FaChartLine size={20} /></span>
          </div>
          <h3 className="text-xl font-semibold mb-3">内容管理</h3>
          <p className="text-gray-600">
            集中管理所有已发布和草稿文章，随时编辑、更新或重新发布，提高内容运营效率
          </p>
        </div>
      </div>

      {/* 工作流程 */}
      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">简化的发布流程</h2>
        <div className="relative">
          {/* 连接线 */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-indigo-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-indigo-500 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">创建内容</h3>
              <p className="text-gray-600">使用AI助手或Markdown编辑器创建高质量文章</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-indigo-500 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">预览效果</h3>
              <p className="text-gray-600">实时预览文章在微信公众号中的显示效果</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-indigo-500 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">一键发布</h3>
              <p className="text-gray-600">点击发布按钮，文章自动同步到微信公众号</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-2 border-indigo-500 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">数据分析</h3>
              <p className="text-gray-600">查看文章发布状态和基础数据统计</p>
            </div>
          </div>
        </div>
      </div>

      {/* 功能展示 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">强大的发布功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaMobileAlt className="text-indigo-600 mr-2" />
              移动端预览
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>实时模拟微信公众号文章在手机上的显示效果</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>支持横屏和竖屏预览，确保各种场景下的阅读体验</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>精确还原微信公众号的字体、间距和排版规则</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>支持预览文章封面和摘要效果</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaWeixin className="text-indigo-600 mr-2" />
              微信集成
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>安全连接微信公众号，一次配置长期使用</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>支持草稿箱保存和定时发布功能</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>自动处理图片上传和素材管理</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full mr-2 mt-1"></span>
                <span>支持多个公众号账号管理和切换</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 发布流程展示 */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">一键发布流程展示</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FaPaperPlane className="text-indigo-600 mr-2" />
              传统发布流程
            </h3>
            <div className="p-4 bg-white rounded border border-gray-200">
              <ol className="space-y-6">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">1</span>
                  <div>
                    <p className="font-medium">在编辑器中创建文章</p>
                    <p className="text-gray-600 text-sm mt-1">使用各种工具编辑排版文章内容</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">2</span>
                  <div>
                    <p className="font-medium">复制全部内容</p>
                    <p className="text-gray-600 text-sm mt-1">需要手动全选并复制文章内容</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">3</span>
                  <div>
                    <p className="font-medium">登录微信公众号后台</p>
                    <p className="text-gray-600 text-sm mt-1">打开浏览器，输入账号密码登录</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">4</span>
                  <div>
                    <p className="font-medium">新建图文消息</p>
                    <p className="text-gray-600 text-sm mt-1">在后台创建新的图文消息</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">5</span>
                  <div>
                    <p className="font-medium">粘贴内容并调整格式</p>
                    <p className="text-gray-600 text-sm mt-1">粘贴后通常需要重新调整格式</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">6</span>
                  <div>
                    <p className="font-medium">上传图片素材</p>
                    <p className="text-gray-600 text-sm mt-1">需要重新上传所有图片</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">7</span>
                  <div>
                    <p className="font-medium">预览检查并发布</p>
                    <p className="text-gray-600 text-sm mt-1">反复预览检查格式问题</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FaRocket className="text-indigo-600 mr-2" />
              一键发布流程
            </h3>
            <div className="p-4 bg-white rounded border border-gray-200">
              <ol className="space-y-6">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-1 font-medium">1</span>
                  <div>
                    <p className="font-medium">在系统中创建文章</p>
                    <p className="text-gray-600 text-sm mt-1">使用Markdown编辑器或AI助手创建内容</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-1 font-medium">2</span>
                  <div>
                    <p className="font-medium">实时预览效果</p>
                    <p className="text-gray-600 text-sm mt-1">所见即所得，实时查看微信样式</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-1 font-medium">3</span>
                  <div>
                    <p className="font-medium">点击"发布到微信"按钮</p>
                    <p className="text-gray-600 text-sm mt-1">一键完成所有发布流程</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3 mt-1 font-medium">✓</span>
                  <div>
                    <p className="font-medium">完成！</p>
                    <p className="text-gray-600 text-sm mt-1">系统自动处理格式、图片上传等所有步骤</p>
                  </div>
                </li>
              </ol>
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium flex items-center text-indigo-700 mb-2">
                  <FaClock className="mr-2" />
                  节省时间对比
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">传统方式</p>
                    <p className="font-medium">15-30分钟</p>
                  </div>
                  <div className="h-1 flex-grow mx-4 bg-gray-200 rounded-full">
                    <div className="h-1 bg-indigo-600 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">一键发布</p>
                    <p className="font-medium">1分钟</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部区域 */}
      <div className="text-center text-gray-600">
        <p>使用一键发布功能，让您的微信公众号运营更加高效</p>
        <p className="mt-2">© 2023 微信AI助手 - 让创作更简单</p>
      </div>
    </div>
  );
}