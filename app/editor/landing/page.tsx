'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCode, FaEye, FaImage, FaTable, FaListUl, FaQuoteLeft, FaHeading } from 'react-icons/fa';
import Image from 'next/image';

export default function MarkdownEditorLandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 返回首页按钮 */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <FaArrowLeft className="mr-2" />
          返回首页
        </Link>
      </div>

      {/* 标题区域 */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <FaCode size={36} className="text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{
          background: 'linear-gradient(to right, #10b981, #059669)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Markdown编辑器
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          专业的Markdown编辑工具，让您的微信公众号文章排版更加美观、专业
        </p>
      </div>

      {/* 主要特点 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <FaCode className="text-green-600" size={20} />
          </div>
          <h3 className="text-xl font-semibold mb-3">简洁高效</h3>
          <p className="text-gray-600">
            使用简单的Markdown语法，快速创建格式丰富的文章，无需复杂的排版操作
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <FaEye className="text-green-600" size={20} />
          </div>
          <h3 className="text-xl font-semibold mb-3">实时预览</h3>
          <p className="text-gray-600">
            边写边看效果，所见即所得的编辑体验，让您的创作过程更加流畅
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <FaImage className="text-green-600" size={20} />
          </div>
          <h3 className="text-xl font-semibold mb-3">多媒体支持</h3>
          <p className="text-gray-600">
            轻松插入图片、表格、代码块等多种元素，丰富文章内容，提升阅读体验
          </p>
        </div>
      </div>

      {/* 功能展示 */}
      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">强大的编辑功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaCode className="text-green-600 mr-2" />
              丰富的语法支持
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>标题、列表、引用、粗体、斜体等基础格式</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>代码块支持语法高亮，适合技术内容创作</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>表格创建与编辑，轻松展示结构化数据</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>任务列表，帮助读者清晰了解步骤和进度</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaEye className="text-green-600 mr-2" />
              微信风格预览
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>模拟微信公众号文章样式，所见即所得</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>手机端预览，确保在移动设备上的显示效果</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>自动适配微信公众号的排版规则和限制</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-4 h-4 bg-green-100 rounded-full mr-2 mt-1"></span>
                <span>支持自定义样式，打造个性化的文章风格</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 使用技巧 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Markdown编辑技巧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-3">基础语法速查</h3>
            <div className="bg-gray-50 p-4 rounded font-mono text-sm">
              <p className="mb-2"><span className="text-green-600"># </span>一级标题</p>
              <p className="mb-2"><span className="text-green-600">## </span>二级标题</p>
              <p className="mb-2"><span className="text-green-600">**</span>粗体文本<span className="text-green-600">**</span></p>
              <p className="mb-2"><span className="text-green-600">*</span>斜体文本<span className="text-green-600">*</span></p>
              <p className="mb-2"><span className="text-green-600">[</span>链接文本<span className="text-green-600">](</span>https://example.com<span className="text-green-600">)</span></p>
              <p className="mb-0"><span className="text-green-600">![</span>图片描述<span className="text-green-600">](</span>图片URL<span className="text-green-600">)</span></p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold mb-3">排版建议</h3>
            <ul className="space-y-2 text-gray-700">
              <li>使用适当的标题层级，保持文章结构清晰</li>
              <li>段落之间留出空行，增强可读性</li>
              <li>重要内容使用粗体或引用块突出显示</li>
              <li>适当使用分割线，区分不同内容板块</li>
              <li>图片添加合适的描述文本，提升SEO效果</li>
              <li>表格内容保持简洁，避免过于复杂的嵌套</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 示例展示 */}
      <div className="bg-white p-8 rounded-xl shadow-md mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Markdown效果展示</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Markdown源码</h3>
            <pre className="font-mono text-sm p-4 bg-gray-800 text-white rounded overflow-x-auto">
              <code>
# 文章标题

## 二级标题

这是一段**粗体**和*斜体*混合的文本。

{'>'} 这是一个引用块，可以用来突出重要内容。

- 无序列表项1
- 无序列表项2
- 无序列表项3

1. 有序列表项1
2. 有序列表项2
3. 有序列表项3

![图片描述](图片URL)

| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |
              </code>
            </pre>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">渲染效果</h3>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h1 className="text-2xl font-bold mb-2">文章标题</h1>
              <h2 className="text-xl font-semibold mb-2">二级标题</h2>
              <p className="mb-3">这是一段<strong>粗体</strong>和<em>斜体</em>混合的文本。</p>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
                这是一个引用块，可以用来突出重要内容。
              </blockquote>
              <ul className="list-disc pl-5 mb-3">
                <li>无序列表项1</li>
                <li>无序列表项2</li>
                <li>无序列表项3</li>
              </ul>
              <ol className="list-decimal pl-5 mb-3">
                <li>有序列表项1</li>
                <li>有序列表项2</li>
                <li>有序列表项3</li>
              </ol>
              <div className="mb-3 text-center text-gray-500">[图片展示区域]</div>
              <table className="w-full border-collapse mb-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">表头1</th>
                    <th className="border border-gray-300 p-2">表头2</th>
                    <th className="border border-gray-300 p-2">表头3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2">内容1</td>
                    <td className="border border-gray-300 p-2">内容2</td>
                    <td className="border border-gray-300 p-2">内容3</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2">内容4</td>
                    <td className="border border-gray-300 p-2">内容5</td>
                    <td className="border border-gray-300 p-2">内容6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 底部区域 */}
      <div className="text-center text-gray-600">
        <p>开始使用Markdown编辑器，让您的微信公众号文章更加专业</p>
        <p className="mt-2">© 2023 微信AI助手 - 让创作更简单</p>
      </div>
    </div>
  );
}