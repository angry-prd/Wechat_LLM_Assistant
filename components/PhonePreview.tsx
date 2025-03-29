import React, { useEffect, useRef } from 'react';
import { FaSun, FaMoon, FaWeixin, FaShareAlt, FaEllipsisH, FaThumbsUp, FaComment } from 'react-icons/fa';

interface PhonePreviewProps {
  title: string;
  content: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({ 
  title, 
  content, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 使用useEffect渲染Markdown内容
  useEffect(() => {
    if (contentRef.current) {
      // 这里可以整合更强大的Markdown解析器
      const processedContent = processMarkdown(content);
      contentRef.current.innerHTML = processedContent;
    }
  }, [content, darkMode]);

  // 简单的Markdown处理函数
  const processMarkdown = (markdown: string) => {
    if (!markdown) return '<p class="empty-content">暂无内容</p>';

    let html = markdown
      // 处理标题
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
      .replace(/^##### (.*?)$/gm, '<h5>$1</h5>')
      .replace(/^###### (.*?)$/gm, '<h6>$1</h6>')
      
      // 处理粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      
      // 处理链接和图片
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
      
      // 处理代码块和行内代码
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // 处理引用
      .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
      
      // 处理水平线
      .replace(/^\s*---\s*$/gm, '<hr>')
      
      // 处理有序列表和无序列表
      .replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      
      // 简单处理段落
      .replace(/^(?!<[hbpcoli])(.*?)$/gm, '<p>$1</p>');

    // 合并相邻的li标签成ul或ol
    html = html.replace(/<li>[\s\S]*?<\/li>/g, (match) => {
      if (match.startsWith('<li>1.') || match.match(/^<li>\d+\./)) {
        return '<ol>' + match + '</ol>';
      } else {
        return '<ul>' + match + '</ul>';
      }
    });

    // 清理空行
    html = html.replace(/<p><\/p>/g, '');

    return html;
  };

  // 获取当前日期作为文章发布日期
  const formattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 内容样式
  const contentStyles = {
    h1: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: '24px 0 16px 0',
      color: darkMode ? '#fff' : '#1a1a1a',
      lineHeight: '1.4',
    },
    h2: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '20px 0 14px 0',
      color: darkMode ? '#fff' : '#1a1a1a',
      lineHeight: '1.4',
    },
    h3: {
      fontSize: '16px',
      fontWeight: 'bold',
      margin: '18px 0 12px 0',
      color: darkMode ? '#fff' : '#1a1a1a',
      lineHeight: '1.4',
    },
    p: {
      margin: '0 0 16px 0',
      lineHeight: '1.75',
      fontSize: '15px',
      color: darkMode ? '#ddd' : '#3f3f3f',
    },
    ul: {
      marginBottom: '16px',
      paddingLeft: '20px',
      listStyleType: 'disc',
    },
    ol: {
      marginBottom: '16px',
      paddingLeft: '20px',
    },
    li: {
      margin: '8px 0',
      color: darkMode ? '#ddd' : '#3f3f3f',
    },
    blockquote: {
      borderLeft: `4px solid ${darkMode ? '#444' : '#e0e0e0'}`,
      padding: '10px 16px',
      backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9',
      margin: '16px 0',
      color: darkMode ? '#bbb' : '#666',
      borderRadius: '0 4px 4px 0',
    },
    code: {
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
      padding: '3px 6px',
      borderRadius: '3px',
      fontSize: '13px',
      color: darkMode ? '#e0e0e0' : '#333',
    },
    pre: {
      backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
      padding: '12px 16px',
      borderRadius: '4px',
      overflowX: 'auto' as const,
      margin: '16px 0',
      fontSize: '13px',
    },
    a: {
      color: darkMode ? '#4da3ff' : '#1890ff',
      textDecoration: 'none',
    },
    img: {
      maxWidth: '100%',
      height: 'auto',
      margin: '16px 0',
      borderRadius: '4px',
    },
    strong: {
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#1a1a1a',
    },
    em: {
      fontStyle: 'italic',
    },
    hr: {
      border: 'none',
      borderTop: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`,
      margin: '20px 0',
    },
  };

  return (
    <div style={{
      width: '280px',
      height: '100%',
      maxHeight: '700px',
      borderRadius: '30px',
      border: '8px solid #333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: darkMode ? '#1f1f1f' : '#fff',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
      position: 'relative' as const,
    }}>
      <button
        style={{
          position: 'absolute' as const,
          right: '16px',
          top: '16px',
          backgroundColor: darkMode ? '#444' : '#e0e0e0',
          color: darkMode ? '#fff' : '#333',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
        }}
        onClick={onToggleDarkMode}
        title={darkMode ? '切换到明亮模式' : '切换到暗黑模式'}
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
      
      <div style={{
        height: '50px',
        backgroundColor: darkMode ? '#2c2c2c' : '#f7f7f7',
        borderBottom: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 12px',
        position: 'relative' as const,
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: darkMode ? '#fff' : '#333',
        }}>微信公众号</div>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            backgroundColor: darkMode ? '#444' : '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
          }}>
            <FaWeixin size={18} color={darkMode ? '#bbb' : '#07C160'} />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: darkMode ? '#e0e0e0' : '#333',
              marginBottom: '2px',
            }}>微信公众平台</div>
            <div style={{
              fontSize: '10px',
              color: darkMode ? '#999' : '#999',
            }}>{formattedDate()}</div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}>
          <FaEllipsisH size={14} style={{
            color: darkMode ? '#999' : '#8c8c8c',
            cursor: 'pointer',
          }} />
        </div>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px 16px',
        color: darkMode ? '#e0e0e0' : '#333',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          fontFamily: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif',
          lineHeight: '1.75',
          fontSize: '15px',
        }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: darkMode ? '#fff' : '#333',
            lineHeight: '1.4',
          }}>{title || '请输入标题'}</h1>
          <div 
            ref={contentRef}
            style={{
              fontFamily: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif',
              lineHeight: '1.75',
              fontSize: '15px',
            }}
          >
            {!content && (
              <p style={{
                textAlign: 'center' as const,
                padding: '40px 0',
                color: darkMode ? '#666' : '#999',
                fontSize: '14px',
                fontStyle: 'italic' as const,
              }}>暂无内容，请在编辑区添加内容</p>
            )}
          </div>
        </div>
      </div>
      
      <div style={{
        borderTop: `1px solid ${darkMode ? '#333' : '#f0f0f0'}`,
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div></div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: darkMode ? '#999' : '#8c8c8c',
            fontSize: '13px',
          }}>
            <FaComment size={14} />
            <span>评论</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: darkMode ? '#999' : '#8c8c8c',
            fontSize: '13px',
          }}>
            <FaThumbsUp size={14} />
            <span>点赞</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview; 