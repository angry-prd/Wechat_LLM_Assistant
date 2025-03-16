'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaWeixin } from 'react-icons/fa';

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
    fontSize: '2.25rem',
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
  articleContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  articleHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  articleTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '12px',
  },
  articleMeta: {
    display: 'flex',
    gap: '16px',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  articleContent: {
    lineHeight: '1.8',
    color: '#374151',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 'medium',
    marginLeft: '12px',
  },
  draftBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  publishedBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 'medium',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    textDecoration: 'none',
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
  },
  publishButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
  },
  heading1: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginTop: '32px',
    marginBottom: '16px',
    color: '#111827',
  },
  heading2: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '24px',
    marginBottom: '12px',
    color: '#1f2937',
  },
  paragraph: {
    marginBottom: '16px',
  },
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      
      setArticle(foundArticle || null);
      setLoading(false);
    };

    fetchArticle();
  }, [params.id]);

  // 简单的Markdown渲染函数
  const renderMarkdown = (content: string) => {
    if (!content) return null;

    // 将Markdown内容按行分割
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // 处理标题
      if (line.startsWith('# ')) {
        return <h1 key={index} style={styles.heading1}>{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} style={styles.heading2}>{line.substring(3)}</h2>;
      }
      
      // 处理空行
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // 默认作为段落处理
      return <p key={index} style={styles.paragraph}>{line}</p>;
    });
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
      <div style={styles.header}>
        <Link href="/articles" style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章列表</span>
        </Link>
      </div>

      <div style={styles.articleContainer}>
        <div style={styles.articleHeader}>
          <h1 style={styles.articleTitle}>
            {article.title}
            <span style={{
              ...styles.statusBadge,
              ...(article.status === '草稿' ? styles.draftBadge : styles.publishedBadge)
            }}>
              {article.status}
            </span>
          </h1>
          <div style={styles.articleMeta}>
            <span>作者: {article.author}</span>
            <span>创建时间: {article.createdAt}</span>
          </div>
        </div>

        <div style={styles.articleContent}>
          {renderMarkdown(article.content)}
        </div>

        <div style={styles.actionContainer}>
          {article.status === '草稿' ? (
            <>
              <Link 
                href={`/articles/${article.id}/edit`} 
                style={{...styles.actionButton, ...styles.editButton}}
              >
                <FaEdit size={16} />
                <span>编辑文章</span>
              </Link>
              <button 
                style={{...styles.actionButton, ...styles.publishButton}}
                onClick={() => router.push(`/articles/${article.id}/edit`)}
              >
                <FaWeixin size={16} />
                <span>发布到公众号</span>
              </button>
            </>
          ) : (
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              已发布的推文不可编辑
            </div>
          )}
        </div>
      </div>
    </div>
  );
}