'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaMobileAlt, FaWeixin, FaSun, FaMoon } from 'react-icons/fa';
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
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    borderRadius: '6px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  previewColumn: {
    flex: '1',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    borderRadius: '6px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
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
    justifyContent: 'space-between',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
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
  const [error, setError] = useState<string | null>(null);
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

  // 获取当前登录用户信息
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr);
        } catch (e) {
          console.error('解析用户数据失败:', e);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    setIsMounted(true);
    
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取当前用户ID
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
          setError('未登录或无法获取用户信息');
          setLoading(false);
          return;
        }
        
        // 文章ID
        const articleId = params.id as string;
        if (!articleId) {
          setError('无效的文章ID');
          setLoading(false);
          return;
        }
        
        console.log('开始获取文章数据, ID:', articleId);
        
        // 从API获取文章数据
        const timestamp = new Date().getTime();
        const url = `/api/articles?id=${articleId}&userId=${currentUser.id}&t=${timestamp}`;
        
        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`获取文章数据失败 (${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '获取文章数据失败');
        }
        
        if (!data.article) {
          throw new Error('文章不存在或已被删除');
        }
        
        console.log('成功获取文章数据:', data.article.title);
        
        // 设置文章数据
        const foundArticle = data.article;
        setArticle(foundArticle);
        setTitle(foundArticle.title || '');
        setContent(foundArticle.content || '');
        setStatus(foundArticle.status || '草稿');
        
        // 初始化发布数据
        setPublishData(prev => ({
          ...prev,
          title: foundArticle.title || '',
          author: foundArticle.author || ''
        }));
      } catch (err) {
        console.error('获取文章数据错误:', err);
        setError(err instanceof Error ? err.message : '加载文章数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent, newStatus?: string) => {
    e.preventDefault();
    
    try {
      // 获取当前用户
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setToast({
          visible: true,
          message: '未登录或无法获取用户信息，无法保存推文',
          type: 'error'
        });
        return;
      }
      
      // 验证标题和内容
      if (!content.trim()) {
        setToast({
          visible: true,
          message: '文章内容不能为空',
          type: 'error'
        });
        return;
      }
      
      if (!title.trim()) {
        setToast({
          visible: true,
          message: '文章标题不能为空',
          type: 'error'
        });
        return;
      }
      
      // 显示加载状态
      setToast({
        visible: true,
        message: '正在保存推文...',
        type: 'info'
      });
      
      // 构建更新后的文章数据
      const updateData = {
        id: params.id as string,
        title,
        content,
        status: newStatus || status,
        userId: currentUser.id
      };
      
      console.log('更新文章:', updateData);
      
      // 调用API更新文章
      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `更新文章失败 (${response.status})`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || '更新文章失败');
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
    } catch (error) {
      console.error('更新文章错误:', error);
      setToast({
        visible: true,
        message: error instanceof Error ? error.message : '更新文章失败',
        type: 'error'
      });
    }
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

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>加载中...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={styles.container}>
        <p>{error || '文章不存在或已被删除'}</p>
        <Link href="/articles" style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章列表</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 max-w-screen pb-16 items-center">
      {/* 顶部标题容器 */}
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 w-full max-w-6xl">
        <h1 className="text-xl font-bold text-gray-800">推文编辑</h1>
        <Link href="/articles" className="text-blue-600 hover:text-blue-800 text-base font-medium">
          返回推文列表
        </Link>
      </header>
      
      {/* Toast提示组件 */}
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
      
      {/* 主体内容区域 */}
      <main className="flex flex-1 overflow-auto max-w-6xl w-full">
        {/* 左侧预览区 */}
        <div className="flex justify-center items-center overflow-auto pl-4 w-1/2">
          <PhonePreview
            title={title}
            content={content}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        </div>

        {/* 右侧编辑区 */}
        <div className="flex flex-col flex-1 overflow-auto">
          <div className="flex items-center p-3 border-b bg-gray-100 border-gray-200">
            <span className="font-bold text-base">Markdown 编辑器</span>
          </div>

          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入推文标题..."
              className="w-full p-2 border border-gray-300 rounded text-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="flex-1 overflow-auto">
            <MarkdownEditor 
              value={content} 
              onChange={(newContent) => {
                setContent(newContent);
              }}
              darkMode={darkMode}
            />
          </div>

          <div className="p-3 flex justify-end gap-3 bg-gray-50 border-t border-gray-200 sticky bottom-0 w-full">
            <Link 
              href="/articles" 
              className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:text-blue-500"
            >
              取消
            </Link>
            <button 
              type="button" 
              className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-800 hover:border-blue-400 hover:text-blue-500"
              onClick={(e) => handleSubmit(e, '草稿')}
            >
              保存为草稿
            </button>
            <button 
              type="button" 
              className="px-4 py-2 rounded bg-blue-500 text-white flex items-center gap-2 hover:bg-blue-600"
              onClick={() => setIsModalOpen(true)}
            >
              <FaSave size={16} />
              <span>发布推文</span>
            </button>
          </div>
        </div>
      </main>
      
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