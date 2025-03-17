
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaMobileAlt, FaWeixin } from 'react-icons/fa';
import Toast from '../../../../components/Toast';
import MarkdownEditor from '../../../../components/MarkdownEditor';
import PhonePreview from '../../../../components/PhonePreview';

// 模拟文章数据
const mockArticles = [
  {
    id: '1',
    title: '如何提高公众号阅读量',
    content: `# 如何提高公众号阅读量

微信公众号是现在非常流行的内容分发渠道，但是如何提高阅读量一直是运营者关心的问题。以下是10个有效方法：

## 1. 高质量的内容

内容为王，这是永恒不变的真理。只有持续输出高质量的内容，才能吸引读者的关注和分享。

## 2. 找准定位

明确你的目标受众是谁，针对他们的需求和兴趣点来创作内容。

## 3. 标题党适度

一个好的标题能够吸引读者点击，但过度标题党会失去读者信任。

## 4. 排版美观

使用适当的字体、颜色和图片，让文章看起来更加专业和美观。

## 5. 互动引导

在文章末尾引导读者点赞、评论和分享，增加互动率。`,
    createdAt: '2025-03-10',
    status: '草稿',
    author: '张三'
  },
  {
    id: '2',
    title: '微信公众号运营技巧分享',
    content: `# 微信公众号运营技巧分享

运营一个成功的微信公众号需要掌握一些关键技巧。以下是我的经验分享：

## 1. 内容规划

提前规划内容日历，保持稳定的更新频率。

## 2. 用户画像

了解你的粉丝是谁，他们关心什么，喜欢什么样的内容。

## 3. 数据分析

定期分析阅读量、点赞数、评论数等数据，调整内容策略。

## 4. 社群运营

建立读者社群，增强粉丝黏性和互动。

## 5. 跨平台引流

利用其他社交平台引流到公众号，扩大影响力。`,
    createdAt: '2025-03-12',
    status: '已发布',
    author: '李四'
  },
  {
    id: '3',
    title: '内容创作的5个黄金法则',
    content: `# 内容创作的5个黄金法则

优质内容是吸引读者的关键，以下是内容创作的5个黄金法则：

## 1. 价值优先

确保你的内容能为读者提供实际价值，解决他们的问题或满足他们的需求。

## 2. 原创为主

原创内容更能体现个人观点和价值，也更容易获得读者认可。

## 3. 结构清晰

良好的文章结构能让读者更容易理解和记忆你的内容。

## 4. 语言简洁

避免冗长的句子和复杂的词汇，用简洁明了的语言表达观点。

## 5. 持续学习

关注行业动态，不断学习新知识，保持内容的新鲜度和前沿性。`,
    createdAt: '2025-03-14',
    status: '草稿',
    author: '王五'
  }
];

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
    height: 'calc(100vh - 80px)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
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
    height: 'calc(100% - 60px)',
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
    overflow: 'hidden',
  },
  formGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
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
  statusSelect: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    color: '#374151',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
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
    marginBottom: '12px',
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
    height: 'calc(100% - 30px)',
    overflow: 'hidden',
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

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as const });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    
    // 在实际应用中，这里会从API获取文章详情
    // 这里使用模拟数据和localStorage中保存的文章
    const fetchArticle = () => {
      // 先查找模拟数据
      let foundArticle = mockArticles.find(a => a.id === params.id);
      
      // 如果模拟数据中没有找到，则从localStorage中查找
      if (!foundArticle && typeof window !== 'undefined') {
        const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
        foundArticle = savedArticles.find((a: any) => a.id === params.id);
      }
      
      if (foundArticle) {
        setArticle(foundArticle);
        setTitle(foundArticle.title);
        setContent(foundArticle.content || '');
        setStatus(foundArticle.status);
        
        // 初始化发布数据
        setPublishData(prev => ({
          ...prev,
          title: foundArticle.title,
          author: foundArticle.author || ''
        }));
      }
      setLoading(false);
    };

    fetchArticle();
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent, newStatus?: string) => {
    e.preventDefault();
    
    // 构建更新后的文章数据
    const updatedArticle = {
      id: params.id as string,
      title,
      content,
      status: newStatus || status,
      summary: content.substring(0, 100) + '...',
      createdAt: article.createdAt || new Date().toISOString().split('T')[0],
      author: publishData.author,
      isOriginal: publishData.isOriginal,
      allowReward: publishData.allowReward,
      allowComment: publishData.allowComment,
      isPaid: publishData.isPaid,
      collection: publishData.collection
    };
    
    // 在实际应用中，这里会调用API更新文章
    console.log('更新文章:', updatedArticle);
    
    // 更新localStorage中的文章数据
    if (typeof window !== 'undefined') {
      const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
      const updatedArticles = savedArticles.map((a: any) => 
        a.id === params.id ? { ...a, ...updatedArticle } : a
      );
      localStorage.setItem('articles', JSON.stringify(updatedArticles));
    }
    
    // 显示保存成功的Toast提示
    setToast({
      visible: true,
      message: newStatus === '已发布' ? '推文已成功发布！' : '推文更新成功！',
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

  if (loading) {
    return (
      <div style={styles.container}>
        <p>加载中...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={styles.container}>
        <p>文章不存在或已被删除</p>
        <Link href="/articles" style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章列表</span>
        </Link>
      </div>
    );
  }

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
        <h1 style={styles.title}>编辑推文</h1>
        <Link href="/articles" style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章列表</span>
        </Link>
      </div>

      <form style={{ height: '100%' }} onSubmit={handleSubmit}>
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