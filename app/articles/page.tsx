'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// 文章类型定义
interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
    padding: '48px 20px',
    color: '#6b7280',
    backgroundColor: 'white',
    borderRadius: '8px',
    margin: '16px 0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      const displayArticles: DisplayArticle[] = data.articles.map((article: Article) => ({
        id: article.id,
        title: article.title,
        summary: article.content.substring(0, 100) + '...',
        createdAt: new Date(article.createdAt).toLocaleDateString(),
        status: '草稿'
      }));
      setArticles(displayArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteArticle = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/articles/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      setArticles(articles.filter(article => article.id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>推文管理</h1>
        <Link href="/editor" style={styles.createButton}>
          <FaPlus />
          <span>新建推文</span>
        </Link>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div>加载中...</div>
        </div>
      ) : articles.length === 0 ? (
        <div style={styles.emptyState}>
          <div>暂无推文</div>
          <Link href="/editor" style={styles.createButton}>
            <FaPlus />
            <span>创建第一篇推文</span>
          </Link>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>标题</th>
              <th style={styles.th}>摘要</th>
              <th style={styles.th}>创建时间</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td style={{ ...styles.td, ...styles.titleColumn }}>{article.title}</td>
                <td style={{ ...styles.td, ...styles.summaryColumn }}>{article.summary}</td>
                <td style={{ ...styles.td, ...styles.dateColumn }}>{article.createdAt}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...styles.draftBadge }}>
                    {article.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      style={{ ...styles.actionButton, ...styles.viewButton }}
                      onClick={() => router.push(`/preview/${article.id}`)}
                    >
                      <FaEye />
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onClick={() => router.push(`/editor/${article.id}`)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onClick={() => confirmDelete(article.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">确认删除</h3>
            <p className="mb-6">确定要删除这篇文章吗？此操作无法撤销。</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={cancelDelete}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteArticle}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}