'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// 模拟文章数据
const mockArticles = [
  {
    id: '1',
    title: '如何提高公众号阅读量',
    summary: '本文介绍了提高微信公众号阅读量的10个有效方法...',
    createdAt: '2025-03-10',
    status: '草稿'
  },
  {
    id: '2',
    title: '微信公众号运营技巧分享',
    summary: '分享几个实用的微信公众号运营技巧，帮助你快速增粉...',
    createdAt: '2025-03-12',
    status: '已发布'
  },
  {
    id: '3',
    title: '内容创作的5个黄金法则',
    summary: '优质内容是吸引读者的关键，本文分享内容创作的5个黄金法则...',
    createdAt: '2025-03-14',
    status: '草稿'
  }
];

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
  const [articles, setArticles] = useState(mockArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  
  const itemsPerPage = 5;

  useEffect(() => {
    setIsClient(true);
    // 从localStorage获取保存的文章
    if (typeof window !== 'undefined') {
      const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
      if (savedArticles.length > 0) {
        setArticles([...mockArticles, ...savedArticles]);
      }
    }
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