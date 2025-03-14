'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

// 内联样式
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4b5563',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.3s',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'medium',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    minHeight: '150px',
    resize: 'vertical' as const,
  },
  editor: {
    width: '100%',
    minHeight: '400px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    marginBottom: '20px',
    padding: '12px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 'medium',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
  },
  saveAsDraftButton: {
    backgroundColor: 'white',
    color: '#4b5563',
    border: '1px solid #d1d5db',
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    textDecoration: 'none',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '16px',
  },
  tab: {
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s',
  },
  activeTab: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
  },
  previewContainer: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
    minHeight: '400px',
  },
  previewTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  previewContent: {
    lineHeight: '1.6',
  },
};

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('write');

  const handleSubmit = (e: React.FormEvent, status: string) => {
    e.preventDefault();
    
    // 在实际应用中，这里会调用API保存文章
    console.log('保存文章:', { title, content, status });
    
    // 模拟保存成功后跳转到文章列表页
    alert('文章保存成功！');
    router.push('/articles');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>创建新文章</h1>
        <Link href="/articles" style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章列表</span>
        </Link>
      </div>

      <form style={styles.form} onSubmit={(e) => handleSubmit(e, '草稿')}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>文章标题</label>
          <input
            type="text"
            id="title"
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题"
            required
          />
        </div>

        <div style={styles.tabContainer}>
          <div 
            style={{
              ...styles.tab,
              ...(activeTab === 'write' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('write')}
          >
            编写
          </div>
          <div 
            style={{
              ...styles.tab,
              ...(activeTab === 'preview' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('preview')}
          >
            预览
          </div>
        </div>

        {activeTab === 'write' ? (
          <div style={styles.formGroup}>
            <label htmlFor="content" style={styles.label}>文章内容 (支持Markdown格式)</label>
            <textarea
              id="content"
              style={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入文章内容，支持Markdown格式"
              required
            />
          </div>
        ) : (
          <div style={styles.previewContainer}>
            {title && <h2 style={styles.previewTitle}>{title}</h2>}
            <div style={styles.previewContent}>
              {/* 在实际应用中，这里会使用Markdown渲染库 */}
              {content ? content : <em>暂无内容预览</em>}
            </div>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <Link href="/articles" style={{...styles.button, ...styles.cancelButton}}>
            取消
          </Link>
          <button 
            type="button" 
            style={{...styles.button, ...styles.saveAsDraftButton}}
            onClick={(e) => handleSubmit(e, '草稿')}
          >
            保存为草稿
          </button>
          <button 
            type="submit" 
            style={{...styles.button, ...styles.saveButton}}
            onClick={(e) => handleSubmit(e, '已发布')}
          >
            <FaSave size={16} />
            <span>发布文章</span>
          </button>
        </div>
      </form>
    </div>
  );
} 