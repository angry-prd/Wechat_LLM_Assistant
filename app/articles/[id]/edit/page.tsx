'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

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
    minHeight: '400px',
    resize: 'vertical' as const,
    fontFamily: 'monospace',
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
  statusSelect: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    color: '#374151',
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
  const [activeTab, setActiveTab] = useState('write');

  useEffect(() => {
    // 在实际应用中，这里会从API获取文章详情
    // 这里使用模拟数据
    const fetchArticle = () => {
      const foundArticle = mockArticles.find(a => a.id === params.id);
      if (foundArticle) {
        setArticle(foundArticle);
        setTitle(foundArticle.title);
        setContent(foundArticle.content);
        setStatus(foundArticle.status);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 在实际应用中，这里会调用API更新文章
    console.log('更新文章:', { id: params.id, title, content, status });
    
    // 模拟保存成功后跳转到文章详情页
    alert('文章更新成功！');
    router.push(`/articles/${params.id}`);
  };

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
        <h1 style={styles.title}>编辑文章</h1>
        <Link href={`/articles/${params.id}`} style={styles.backLink}>
          <FaArrowLeft size={14} />
          <span>返回文章详情</span>
        </Link>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
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

        <div style={styles.formGroup}>
          <label htmlFor="status" style={styles.label}>文章状态</label>
          <select
            id="status"
            style={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="草稿">草稿</option>
            <option value="已发布">已发布</option>
          </select>
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
              {renderMarkdown(content)}
            </div>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <Link href={`/articles/${params.id}`} style={{...styles.button, ...styles.cancelButton}}>
            取消
          </Link>
          <button 
            type="submit" 
            style={{...styles.button, ...styles.saveButton}}
          >
            <FaSave size={16} />
            <span>保存更改</span>
          </button>
        </div>
      </form>
    </div>
  );
} 