'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaMobileAlt } from 'react-icons/fa';
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

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // 确保组件挂载后才渲染预览，避免服务器端渲染问题
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
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

      <form style={{ height: '100%' }} onSubmit={handleSubmit}>
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
            
            <div style={{ flex: 1 }}>
              <MarkdownEditor 
                value={content} 
                onChange={setContent} 
              />
            </div>

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