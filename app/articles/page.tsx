'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isLoggedIn, saveRedirectUrl } from '@/lib/auth';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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
    gap: '8px',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'medium',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
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
    padding: '12px 16px',
    textAlign: 'left' as const,
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 'medium',
    color: '#374151',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'medium',
  },
  draftBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  publishedBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    marginRight: '8px',
    color: '#6b7280',
    transition: 'background-color 0.3s, color 0.3s',
  },
  viewButton: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 0',
    color: '#6b7280',
  },
  searchContainer: {
    marginBottom: '16px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  filterButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#4b5563',
    fontSize: '0.875rem',
    cursor: 'pointer',
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
  },
  activePageButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    borderColor: '#2563eb',
  },
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('default'); // 默认用户ID
  
  // 检查用户是否已登录
  useEffect(() => {
    if (!isLoggedIn()) {
      // 保存当前URL并重定向到登录页面
      saveRedirectUrl('/articles');
      router.push('/login');
    }
  }, [router]);
  
  // 获取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 从API获取文章
        const response = await fetch(`/api/articles?userId=${userId}`);
        
        let apiArticles: Article[] = [];
        if (response.ok) {
          apiArticles = await response.json();
        } else {
          console.error('获取API文章列表失败');
        }
        
        // 从localStorage获取保存的草稿文章
        let localArticles: Article[] = [];
        
        // 获取所有localStorage中的文章草稿
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('article_draft_')) {
            try {
              const articleData = localStorage.getItem(key);
              if (articleData) {
                const article = JSON.parse(articleData);
                localArticles.push(article);
              }
            } catch (e) {
              console.error('解析本地文章失败:', e);
            }
          }
        }
        
        // 检查是否有新创建的文章内容
        const newArticleContent = localStorage.getItem('newArticleContent');
        const newArticleTitle = localStorage.getItem('newArticleTitle') || '新文章草稿';
        
        if (newArticleContent) {
          // 创建新的草稿文章
          const newDraftId = `draft_${Date.now()}`;
          const newDraft: Article = {
            id: newDraftId,
            title: newArticleTitle,
            content: newArticleContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // 保存到localStorage并添加到本地文章列表
          localStorage.setItem(`article_draft_${newDraftId}`, JSON.stringify(newDraft));
          localStorage.removeItem('newArticleContent');
          localStorage.removeItem('newArticleTitle');
          
          localArticles.push(newDraft);
        }
        
        // 合并API和本地文章
        const allArticles = [...apiArticles, ...localArticles];
        
        // 转换为显示格式
        const displayArticles: DisplayArticle[] = allArticles.map(article => ({
          id: article.id,
          title: article.title || '无标题',
          summary: article.content?.length > 100 
            ? article.content.replace(/[#*`]/g, '').substring(0, 100) + '...' 
            : (article.content || '').replace(/[#*`]/g, ''),
          createdAt: new Date(article.createdAt || new Date()).toLocaleDateString('zh-CN'),
          status: '草稿' // 默认状态，实际应用中应该从数据中获取
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
  }, [userId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  
  const itemsPerPage = 5;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 过滤和搜索文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // 分页
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // 删除文章
  const handleDeleteArticle = (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      setArticles(articles.filter(article => article.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>推文管理</h1>
        <Link href="/articles/create" style={styles.createButton}>
          <FaPlus size={16} />
          <span>新建推文</span>
        </Link>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="搜索文章..."
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

      {currentArticles.length > 0 ? (
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
                  <td style={styles.td}>{article.title}</td>
                  <td style={styles.td}>{article.summary}</td>
                  <td style={styles.td}>{article.createdAt}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      ...(article.status === '草稿' ? styles.draftBadge : styles.publishedBadge)
                    }}>
                      {article.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {article.status === '已发布' && (
                      <Link 
                        href={`/articles/${article.id}`} 
                        style={{...styles.actionButton, ...styles.viewButton}}
                        title="查看详情"
                      >
                        <FaEye size={16} />
                      </Link>
                    )}
                    {article.status === '草稿' && (
                      <>
                        <Link 
                          href={`/articles/${article.id}/edit`} 
                          style={{...styles.actionButton, ...styles.editButton}}
                          title="编辑推文"
                        >
                          <FaEdit size={16} />
                        </Link>
                        <button 
                          style={{...styles.actionButton, ...styles.deleteButton}}
                          onClick={() => handleDeleteArticle(article.id)}
                          title="删除推文"
                        >
                          <FaTrash size={16} />
                        </button>
                      </>
                    )}
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
      ) : (
        <div style={styles.emptyState}>
          <p>没有找到符合条件的文章</p>
        </div>
      )}
    </div>
  );
}