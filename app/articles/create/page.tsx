'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaMobileAlt } from 'react-icons/fa';
import MarkdownEditor from '../../../components/MarkdownEditor';
import PhonePreview from '../../../components/PhonePreview';

// 内联样式
const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 16px',
    height: 'calc(100vh - 100px)',
    display: 'flex',
    flexDirection: 'column' as const,
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
  contentContainer: {
    display: 'flex',
    flex: 1,
    gap: '24px',
    height: 'calc(100% - 80px)',
  },
  editorColumn: {
    flex: '3',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  previewColumn: {
    flex: '2',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  formGroup: {
    marginBottom: '16px',
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
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
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    color: '#4b5563',
    fontSize: '0.875rem',
  },
  previewIcon: {
    color: '#2563eb',
  },
};

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // 确保组件挂载后才渲染预览，避免服务器端渲染问题
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

      <form style={{ height: '100%' }} onSubmit={(e) => handleSubmit(e, '草稿')}>
        <div style={styles.contentContainer}>
          {/* 左侧编辑区域 */}
          <div style={styles.editorColumn}>
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
            
            <div style={{ flex: 1 }}>
              <MarkdownEditor 
                value={content} 
                onChange={setContent} 
              />
            </div>

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
          </div>

          {/* 右侧预览区域 */}
          <div style={styles.previewColumn}>
            <div style={styles.previewHeader}>
              <FaMobileAlt size={16} style={styles.previewIcon} />
              <span>微信公众号预览</span>
            </div>
            <div style={{ flex: 1 }}>
              {isMounted && (
                <PhonePreview 
                  title={title} 
                  content={content} 
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(!darkMode)}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 