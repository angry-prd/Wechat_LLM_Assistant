'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isLoggedIn, saveRedirectUrl } from '@/lib/auth';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// 创建一个样式对象，包含CSS动画
const animations = {
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  '@keyframes scaleIn': {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 }
  }
};

// 将动画添加到页面
const addAnimationsToPage = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
};

// 文章类型定义
interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// 用于显示的文章数据
interface DisplayArticle {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  status: string;
}

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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '6px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '0.95rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  th: {
    padding: '14px 18px',
    textAlign: 'left' as const,
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.95rem',
  },
  td: {
    padding: '14px 18px',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  titleColumn: {
    fontWeight: '500',
    color: '#111827',
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  summaryColumn: {
    color: '#6b7280',
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  dateColumn: {
    color: '#6b7280',
    whiteSpace: 'nowrap' as const,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
  },
  draftBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  publishedBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-start',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    color: '#6b7280',
    transition: 'background-color 0.2s, color 0.2s, transform 0.1s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    border: 'none',
    cursor: 'pointer',
  },
  viewButton: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    '&:hover': {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
    },
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    '&:hover': {
      backgroundColor: '#e5e7eb',
      color: '#1f2937',
    },
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    '&:hover': {
      backgroundColor: '#fecaca',
      color: '#991b1b',
    },
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 20px',
    color: '#6b7280',
    backgroundColor: 'white',
    borderRadius: '8px',
    margin: '16px 0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: '1rem',
    marginBottom: '16px',
    maxWidth: '600px',
    margin: '0 auto 24px',
    lineHeight: '1.6',
    textAlign: 'center' as const,
    color: '#4b5563',
    padding: '0 20px',
  },
  searchContainer: {
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'border-color 0.3s',
    '&:focus': {
      borderColor: '#2563eb',
      outline: 'none',
    },
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  filterButton: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#4b5563',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    borderColor: '#2563eb',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  pageButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  activePageButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    borderColor: '#2563eb',
  },
  loadingMessage: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#6b7280',
  },
  errorMessage: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  emptyStateCreateButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '8px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    fontSize: '1.1rem',
    marginTop: '12px',
    border: 'none',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#1d4ed8',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 15px rgba(37, 99, 235, 0.4)',
    },
  },
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('default'); // 默认用户ID
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  
  // 删除确认弹窗状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  
  // 添加按钮悬停样式变量
  const cancelButtonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const deleteButtonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
    transition: 'all 0.2s',
  };

  // 添加按钮悬停状态
  const [cancelButtonHovered, setCancelButtonHovered] = useState(false);
  const [deleteButtonHovered, setDeleteButtonHovered] = useState(false);
  
  // 检查用户是否已登录
  useEffect(() => {
    if (!isLoggedIn()) {
      // 保存当前URL并重定向到登录页面
      saveRedirectUrl('/articles');
      router.push('/login');
    }
  }, [router]);
  
  // 修改获取当前用户信息的函数，提供更可靠的用户身份识别
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      // 首先尝试从localStorage获取
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.id) {
            console.log('从localStorage获取到用户信息:', userData.id);
            return userData;
          }
        } catch (e) {
          console.error('解析localStorage中的用户数据失败:', e);
        }
      }
      
      // 如果localStorage没有，尝试从sessionStorage获取
      const sessionUserStr = sessionStorage.getItem('user');
      if (sessionUserStr) {
        try {
          const sessionUser = JSON.parse(sessionUserStr);
          if (sessionUser && sessionUser.id) {
            console.log('从sessionStorage获取到用户信息:', sessionUser.id);
            return sessionUser;
          }
        } catch (e) {
          console.error('解析sessionStorage中的用户数据失败:', e);
        }
      }
      
      // 再尝试从cookie获取token
      const getTokenFromCookie = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token' || name === 'session_token' || name === 'user_token') {
            return value;
          }
        }
        return null;
      };
      
      const token = getTokenFromCookie();
      if (token) {
        console.log('从cookie中获取到token');
        // 这里只返回token，没有用户ID，但至少表明用户已登录
        return { token };
      }
    }
    
    console.warn('无法获取用户信息');
    return null;
  };

  // 获取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 获取当前用户ID
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
          console.warn('无法获取当前用户信息');
          setError('用户未登录，无法获取文章列表');
          setIsLoading(false);
          return;
        }
        
        console.log('开始获取文章列表, 用户ID:', currentUser.id);
        
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const url = `/api/articles?t=${timestamp}&userId=${currentUser.id}`;
        
        // 从API获取文章
        const response = await fetch(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          credentials: 'include' // 确保发送cookies
        });
        
        if (!response.ok) {
          throw new Error(`获取文章列表失败 (${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '获取文章列表失败');
        }
        
        console.log(`成功获取${data.articles.length}篇文章`);
        
        // 转换为显示格式
        const displayArticles: DisplayArticle[] = data.articles.map((article: Article) => ({
          id: article.id,
          title: article.title || '无标题',
          summary: article.content?.length > 100 
            ? article.content.replace(/[#*`]/g, '').substring(0, 100) + '...' 
            : (article.content || '').replace(/[#*`]/g, ''),
          createdAt: new Date(article.createdAt || new Date()).toLocaleDateString('zh-CN'),
          status: article.status || '草稿'
        }));
        
        setArticles(displayArticles);
      } catch (err) {
        console.error('获取文章失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  useEffect(() => {
    setIsClient(true);
    
    // 添加动画样式到页面
    addAnimationsToPage();
  }, []);

  // 过滤和搜索文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // 分页
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // 修改删除文章的处理函数，分为两步：打开确认框和执行删除
  const confirmDelete = (id: string) => {
    setArticleToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  // 修改执行文章删除的函数
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    try {
      // 获取当前用户ID
      const currentUser = getCurrentUser();
      
      // 优化用户检查逻辑
      let userId = null;
      let authToken = null;
      
      if (currentUser) {
        userId = currentUser.id;
        // 如果有token属性就使用，否则从localStorage获取
        authToken = currentUser.token || localStorage.getItem('token') || '';
      }
      
      console.log('准备删除文章, ID:', articleToDelete, '用户状态:', !!userId);
      
      // 构建请求参数，确保包含用户ID
      const url = new URL(`/api/articles`, window.location.origin);
      url.searchParams.append('id', articleToDelete);
      if (userId) {
        url.searchParams.append('userId', userId);
      }
      
      // 添加时间戳防止缓存
      url.searchParams.append('t', Date.now().toString());
      
      // 调用API删除文章
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include' // 确保发送cookies
      });
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('删除文章响应错误:', response.status, errorData);
        throw new Error(errorData.message || `删除文章失败 (${response.status})`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '删除文章失败');
      }
      
      console.log('文章删除成功');
      
      // 从UI中移除文章
      setArticles(articles.filter(article => article.id !== articleToDelete));
      
      // 关闭确认框
      setDeleteConfirmOpen(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error('删除文章失败:', error);
      
      // 使用自定义提示框而不是alert
      setError(error instanceof Error ? error.message : '删除文章失败，请稍后再试');
      setTimeout(() => setError(null), 3000); // 3秒后自动清除错误提示
      
      // 出错时也关闭确认框
      setDeleteConfirmOpen(false);
      setArticleToDelete(null);
    }
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setArticleToDelete(null);
  };

  // 区分真正的空列表和搜索无结果
  const hasArticles = articles.length > 0;
  const hasFilteredArticles = currentArticles.length > 0;
  const isSearching = searchTerm.trim() !== '' || statusFilter !== 'all';

  return (
    <div style={styles.container}>
      {/* 删除确认对话框 */}
      {deleteConfirmOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '28px',
            maxWidth: '400px',
            width: '100%',
            animation: 'scaleIn 0.2s ease-out',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
              }}>
                <FaTrash size={18} color="#b91c1c" />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
              }}>
                确定要删除这篇文章吗？
              </h3>
            </div>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              fontSize: '0.95rem',
              marginLeft: '56px',
            }}>
              删除后将无法恢复，请确认您的操作。
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button
                onClick={cancelDelete}
                onMouseEnter={() => setCancelButtonHovered(true)}
                onMouseLeave={() => setCancelButtonHovered(false)}
                style={{
                  ...cancelButtonStyle,
                  ...(cancelButtonHovered ? {
                    backgroundColor: '#e5e7eb',
                    transform: 'translateY(-1px)',
                  } : {})
                }}
              >
                取消
              </button>
              <button
                onClick={handleDeleteArticle}
                onMouseEnter={() => setDeleteButtonHovered(true)}
                onMouseLeave={() => setDeleteButtonHovered(false)}
                style={{
                  ...deleteButtonStyle,
                  ...(deleteButtonHovered ? {
                    backgroundColor: '#dc2626',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)',
                  } : {})
                }}
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.header}>
        <h1 style={styles.title}>推文管理</h1>
        {(hasArticles || isLoading) && (
          <Link href="/articles/create" style={styles.createButton}>
            <FaPlus size={16} />
            <span>新建推文</span>
          </Link>
        )}
      </div>

      {hasArticles && (
        <>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="搜索文章标题或内容..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
    
          <div style={styles.filterContainer}>
            <button 
              style={{
                ...styles.filterButton,
                ...(statusFilter === 'all' ? styles.activeFilterButton : {})
              }}
              onClick={() => setStatusFilter('all')}
            >
              全部
            </button>
            <button 
              style={{
                ...styles.filterButton,
                ...(statusFilter === '草稿' ? styles.activeFilterButton : {})
              }}
              onClick={() => setStatusFilter('草稿')}
            >
              草稿
            </button>
            <button 
              style={{
                ...styles.filterButton,
                ...(statusFilter === '已发布' ? styles.activeFilterButton : {})
              }}
              onClick={() => setStatusFilter('已发布')}
            >
              已发布
            </button>
          </div>
        </>
      )}

      {isLoading ? (
        <div style={styles.loadingMessage}>
          <p>正在加载文章列表...</p>
        </div>
      ) : error ? (
        <div style={styles.errorMessage}>
          <p>{error}</p>
        </div>
      ) : !hasArticles ? (
        // 完全没有文章的空状态
        <div style={{
          ...styles.emptyState,
          padding: '60px 20px',
        }}>
          <img 
            src="/images/empty-articles.svg" 
            alt="暂无推文" 
            style={{
              width: '130px',
              height: '130px',
              marginBottom: '24px',
              opacity: 0.9
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            暂无推文
          </h2>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto 32px',
            padding: '16px 20px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <p style={{
              color: '#4b5563',
              fontSize: '1rem',
              lineHeight: '1.6',
              textAlign: 'center',
              margin: 0,
            }}>
              开始创建您的第一篇推文，利用AI助手快速生成高质量内容，或者使用Markdown编辑器自由创作。
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/articles/create" style={{
              ...styles.emptyStateCreateButton,
              display: 'inline-flex',
              fontSize: '1.15rem',
              padding: '16px 36px',
            }}>
              <FaPlus size={22} />
              <span>创建第一篇推文</span>
            </Link>
          </div>
        </div>
      ) : !hasFilteredArticles && isSearching ? (
        // 有文章但搜索/过滤无结果的状态
        <div style={{...styles.emptyState, padding: '32px 0'}}>
          <img 
            src="/images/no-results.svg" 
            alt="没有找到结果" 
            style={{
              width: '100px',
              height: '100px',
              marginBottom: '16px',
              opacity: 0.7
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '500',
            color: '#4b5563',
            marginBottom: '8px'
          }}>
            没有找到符合条件的推文
          </h3>
          <p style={{
            color: '#6b7280', 
            marginBottom: '16px', 
            fontSize: '0.95rem',
          }}>
            请尝试调整搜索条件或者选择不同的状态筛选
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            清除筛选条件
          </button>
        </div>
      ) : (
        // 显示文章列表
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>标题</th>
                <th style={styles.th}>摘要</th>
                <th style={styles.th}>创建日期</th>
                <th style={styles.th}>状态</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {currentArticles.map((article) => (
                <tr key={article.id}>
                  <td style={{...styles.td, ...styles.titleColumn}}>{article.title}</td>
                  <td style={{...styles.td, ...styles.summaryColumn}}>{article.summary}</td>
                  <td style={{...styles.td, ...styles.dateColumn}}>{article.createdAt}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(article.status === '草稿' ? styles.draftBadge : styles.publishedBadge)
                    }}>
                      {article.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      {article.status === '已发布' && (
                        <Link 
                          href={`/articles/${article.id}`} 
                          style={{...styles.actionButton, ...styles.viewButton}}
                          title="查看详情"
                        >
                          <FaEye size={18} />
                        </Link>
                      )}
                      <Link 
                        href={`/articles/${article.id}/edit`} 
                        style={{...styles.actionButton, ...styles.editButton}}
                        title="编辑推文"
                      >
                        <FaEdit size={18} />
                      </Link>
                      <button 
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        onClick={() => confirmDelete(article.id)}
                        title="删除推文"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === index + 1 ? styles.activePageButton : {})
                  }}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}