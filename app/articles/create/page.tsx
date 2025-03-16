'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaMobileAlt } from 'react-icons/fa';
import Toast from '../../../components/Toast';
import MarkdownEditor from '../../../components/MarkdownEditor';
import PhonePreview from '../../../components/PhonePreview';

// 内联样式
const styles = {
  modal: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 50,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '600px',
    width: '100%',
    padding: '24px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: '16px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 16px',
    height: 'calc(100vh - 80px)', // 稍微增加可用高度
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px', // 减少顶部边距，给预览区域留更多空间
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
    height: 'calc(100% - 60px)', // 调整内容区域高度
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
    overflow: 'hidden', // 防止溢出
  },
  formGroupStyle: {
    marginBottom: '12px', // 减少表单组间距
  },
  label: {
    display: 'block',
    marginBottom: '6px', // 减少标签下方间距
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
    marginTop: '12px', // 减少按钮上方间距
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
    marginBottom: '12px', // 减少预览标题下方间距
    color: '#4b5563',
    fontSize: '0.875rem',
  },
  previewIcon: {
    color: '#2563eb',
  },
  previewContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100% - 30px)', // 调整预览容器高度
    overflow: 'hidden', // 防止溢出
  },
  notification: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationText: {
    fontSize: '0.875rem',
  },
  notificationClose: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#166534',
    cursor: 'pointer',
    fontSize: '1.25rem',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as const });
  
  // 推文发布相关状态
  const [publishData, setPublishData] = useState({
    title: '',
    author: '',
    isOriginal: true,
    allowReward: true,
    allowComment: true,
    isPaid: false,
    collection: '',
  });

  // 确保组件挂载后才渲染预览，避免服务器端渲染问题
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // 从localStorage读取AI生成的内容
    if (typeof window !== 'undefined') {
      const savedContent = localStorage.getItem('newArticleContent');
      const savedTitle = localStorage.getItem('newArticleTitle');
      
      if (savedContent) {
        setContent(savedContent);
        setShowNotification(true);
        
        // 清除localStorage中的内容，避免重复加载
        localStorage.removeItem('newArticleContent');
      }
      
      if (savedTitle) {
        setTitle(savedTitle);
        localStorage.removeItem('newArticleTitle');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent, status: string) => {
    e.preventDefault();
    
    // 构建文章数据
    const articleData = {
      title: title || publishData.title || '未命名推文',
      content,
      status,
      author: publishData.author,
      isOriginal: publishData.isOriginal,
      allowReward: publishData.allowReward,
      allowComment: publishData.allowComment,
      isPaid: publishData.isPaid,
      collection: publishData.collection,
      summary: content.substring(0, 100) + '...',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    // 在实际应用中，这里会调用API保存文章
    console.log('保存推文:', articleData);
    
    // 将文章数据保存到localStorage，以便在文章列表页面显示
    const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
    const newArticle = {
      id: Date.now().toString(),
      title: articleData.title,
      summary: articleData.summary,
      createdAt: articleData.createdAt,
      status: articleData.status
    };
    savedArticles.push(newArticle);
    localStorage.setItem('articles', JSON.stringify(savedArticles));
    
    // 显示保存成功的Toast提示
    setToast({
      visible: true,
      message: '推文保存成功！',
      type: 'success'
    });
    
    // 延迟跳转到文章列表页
    setTimeout(() => {
      router.push('/articles');
    }, 1500);
  };
  
  // 处理模态窗口中的输入变化
  const handlePublishDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setPublishData({
      ...publishData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // 处理发布推文
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e, '已发布');
    setIsModalOpen(false);
  };

  return (
    <div style={styles.container}>
      {/* Toast提示组件 */}
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      <div style={styles.header}>
        <h1 style={styles.title}>创建新推文</h1>
        <Link href="/articles" style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章列表</span>
        </Link>
      </div>

      {showNotification && (
        <div style={styles.notification}>
          <span style={styles.notificationText}>已从AI助手导入文章内容</span>
          <button 
            style={styles.notificationClose}
            onClick={() => setShowNotification(false)}
          >
            ×
          </button>
        </div>
      )}

      <form style={{ height: showNotification ? 'calc(100% - 50px)' : '100%' }} onSubmit={(e) => handleSubmit(e, '草稿')}>
        <div style={styles.contentContainer}>
          {/* 左侧编辑区域 */}
          <div style={styles.editorColumn}>

            
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
                type="button" 
                style={{...styles.button, ...styles.saveButton}}
                onClick={() => setIsModalOpen(true)}
              >
                <FaSave size={16} />
                <span>发布推文</span>
              </button>
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div style={styles.previewColumn}>
            <div style={styles.previewHeader}>
              <FaMobileAlt size={16} style={styles.previewIcon} />
              <span>微信公众号预览</span>
            </div>
            <div style={styles.previewContainer}>
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
      
      {/* 发布推文模态窗口 */}
      {isModalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>发布推文</h2>
              <button 
                style={styles.modalCloseButton}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
          </div>
          
          <form onSubmit={handlePublish}>
            <div style={styles.formGroup}>
              <label htmlFor="title" style={styles.label}>推文标题</label>
              <input
                type="text"
                id="title"
                name="title"
                style={styles.input}
                value={publishData.title}
                onChange={handlePublishDataChange}
                placeholder="请输入推文标题"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="author" style={styles.label}>作者</label>
              <input
                type="text"
                id="author"
                name="author"
                style={styles.input}
                value={publishData.author}
                onChange={handlePublishDataChange}
                placeholder="请输入作者名称"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label htmlFor="collection" style={styles.label}>所属合集</label>
              <input
                type="text"
                id="collection"
                name="collection"
                style={styles.input}
                value={publishData.collection}
                onChange={handlePublishDataChange}
                placeholder="请输入合集名称（可选）"
              />
            </div>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isOriginal"
                name="isOriginal"
                style={styles.checkbox}
                checked={publishData.isOriginal}
                onChange={handlePublishDataChange}
              />
              <label htmlFor="isOriginal">原创声明</label>
            </div>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="allowReward"
                name="allowReward"
                style={styles.checkbox}
                checked={publishData.allowReward}
                onChange={handlePublishDataChange}
              />
              <label htmlFor="allowReward">允许赞赏</label>
            </div>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="allowComment"
                name="allowComment"
                style={styles.checkbox}
                checked={publishData.allowComment}
                onChange={handlePublishDataChange}
              />
              <label htmlFor="allowComment">允许留言</label>
            </div>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                style={styles.checkbox}
                checked={publishData.isPaid}
                onChange={handlePublishDataChange}
              />
              <label htmlFor="isPaid">付费阅读</label>
            </div>
            
            <div style={styles.buttonContainer}>
              <button 
                type="button" 
                style={{...styles.button, ...styles.cancelButton}}
                onClick={() => setIsModalOpen(false)}
              >
                取消
              </button>
              <button 
                type="submit" 
                style={{...styles.button, ...styles.saveButton}}
              >
                <FaSave size={16} />
                <span>确认发布</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}