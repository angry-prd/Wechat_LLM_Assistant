import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

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
  // 手机预览样式
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      position: 'relative' as const,
      alignItems: 'center',
      justifyContent: 'center',
    },
    phoneFrame: {
      width: '375px', // 标准iPhone宽度
      height: '80%',
      maxHeight: '700px',
      borderRadius: '36px',
      border: '10px solid #333',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: darkMode ? '#1f1f1f' : '#fff',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
      position: 'relative' as const,
    },
    phoneHeader: {
      height: '60px',
      backgroundColor: darkMode ? '#2c2c2c' : '#f7f7f7',
      borderBottom: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      position: 'relative' as const,
    },
    phoneTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: darkMode ? '#fff' : '#333',
    },
    phoneContent: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '16px',
      color: darkMode ? '#e0e0e0' : '#333',
    },
    wechatArticle: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      lineHeight: '1.75',
      fontSize: '15px',
    },
    wechatTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: darkMode ? '#fff' : '#333',
    },
    themeToggle: {
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
    },
    codeBlock: {
      fontSize: '13px',
      borderRadius: '4px',
      margin: '16px 0',
      backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
      padding: '12px',
      overflowX: 'auto' as const,
      fontFamily: 'monospace',
    },
    paragraph: {
      marginBottom: '16px',
    },
    heading1: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginTop: '24px',
      marginBottom: '16px',
      color: darkMode ? '#fff' : '#333',
    },
    heading2: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginTop: '20px',
      marginBottom: '12px',
      color: darkMode ? '#fff' : '#333',
    },
    heading3: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '16px',
      marginBottom: '8px',
      color: darkMode ? '#fff' : '#333',
    },
    list: {
      marginBottom: '16px',
      paddingLeft: '20px',
    },
    listItem: {
      marginBottom: '8px',
    },
    blockquote: {
      borderLeft: `4px solid ${darkMode ? '#444' : '#e0e0e0'}`,
      paddingLeft: '16px',
      marginLeft: '0',
      marginRight: '0',
      marginTop: '16px',
      marginBottom: '16px',
      fontStyle: 'italic',
      color: darkMode ? '#aaa' : '#666',
    },
    link: {
      color: darkMode ? '#4da3ff' : '#0066cc',
      textDecoration: 'none',
    },
    code: {
      backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
      padding: '2px 4px',
      borderRadius: '3px',
      fontFamily: 'monospace',
      fontSize: '0.9em',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
  };

  // 简单的Markdown渲染函数
  const renderMarkdown = (content: string) => {
    if (!content) return <em>暂无内容</em>;

    // 将Markdown内容按行分割
    const lines = content.split('\n');
    
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';
    let listItems: string[] = [];
    let inList = false;
    let listType = '';

    lines.forEach((line, index) => {
      // 处理代码块
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // 结束代码块
          elements.push(
            <pre key={`code-${index}`} style={styles.codeBlock}>
              <code>{codeContent}</code>
            </pre>
          );
          inCodeBlock = false;
          codeContent = '';
          codeLanguage = '';
        } else {
          // 开始代码块
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }

      // 处理列表
      if (line.match(/^[\s]*[-*+][\s]+/) || line.match(/^[\s]*\d+\.[\s]+/)) {
        const isOrderedList = !!line.match(/^[\s]*\d+\.[\s]+/);
        const newListType = isOrderedList ? 'ol' : 'ul';
        
        if (!inList || listType !== newListType) {
          // 如果之前有列表，先添加到元素中
          if (inList && listItems.length > 0) {
            const ListTag = listType === 'ol' ? 'ol' : 'ul';
            elements.push(
              <ListTag key={`list-${index}`} style={styles.list}>
                {listItems.map((item, i) => (
                  <li key={i} style={styles.listItem}>{item}</li>
                ))}
              </ListTag>
            );
            listItems = [];
          }
          
          inList = true;
          listType = newListType;
        }
        
        // 提取列表项内容
        const content = line.replace(/^[\s]*[-*+\d.][\s]+/, '');
        listItems.push(content);
        return;
      } else if (inList && line.trim() === '') {
        // 空行结束列表
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={`list-${index}`} style={styles.list}>
            {listItems.map((item, i) => (
              <li key={i} style={styles.listItem}>{item}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
        listType = '';
        return;
      } else if (inList) {
        // 不是列表项且不是空行，结束列表
        const ListTag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag key={`list-${index}`} style={styles.list}>
            {listItems.map((item, i) => (
              <li key={i} style={styles.listItem}>{item}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        inList = false;
        listType = '';
      }

      // 处理标题
      if (line.startsWith('# ')) {
        elements.push(<h1 key={index} style={styles.heading1}>{line.substring(2)}</h1>);
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={index} style={styles.heading2}>{line.substring(3)}</h2>);
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={index} style={styles.heading3}>{line.substring(4)}</h3>);
        return;
      }

      // 处理引用
      if (line.startsWith('> ')) {
        elements.push(<blockquote key={index} style={styles.blockquote}>{line.substring(2)}</blockquote>);
        return;
      }
      
      // 处理空行
      if (line.trim() === '') {
        elements.push(<br key={index} />);
        return;
      }
      
      // 处理粗体和斜体
      let content = line;
      
      // 使用自定义渲染而不是dangerouslySetInnerHTML
      // 解析行内元素
      const renderInlineElements = (text: string) => {
        let result: (string | JSX.Element)[] = [text];
        
        // 处理粗体
        result = result.flatMap(item => {
          if (typeof item !== 'string') return [item];
          return item.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const content = part.slice(2, -2);
              return <strong key={`strong-${i}`} style={styles.strong}>{content}</strong>;
            }
            return part;
          });
        });
        
        // 处理斜体
        result = result.flatMap(item => {
          if (typeof item !== 'string') return [item];
          return item.split(/(\*.*?\*)/g).map((part, i) => {
            if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
              const content = part.slice(1, -1);
              return <em key={`em-${i}`} style={styles.em}>{content}</em>;
            }
            return part;
          });
        });
        
        // 处理行内代码
        result = result.flatMap(item => {
          if (typeof item !== 'string') return [item];
          return item.split(/(`.*?`)/g).map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              const content = part.slice(1, -1);
              return <code key={`code-${i}`} style={styles.code}>{content}</code>;
            }
            return part;
          });
        });
        
        // 处理链接
        result = result.flatMap(item => {
          if (typeof item !== 'string') return [item];
          const parts: (string | JSX.Element)[] = [];
          let lastIndex = 0;
          const linkRegex = /\[(.*?)\]\((.*?)\)/g;
          let match;
          
          while ((match = linkRegex.exec(item)) !== null) {
            if (match.index > lastIndex) {
              parts.push(item.substring(lastIndex, match.index));
            }
            
            const [fullMatch, text, url] = match;
            parts.push(
              <a 
                key={`link-${match.index}`} 
                href={url} 
                style={styles.link}
                target="_blank" 
                rel="noopener noreferrer"
              >
                {text}
              </a>
            );
            
            lastIndex = match.index + fullMatch.length;
          }
          
          if (lastIndex < item.length) {
            parts.push(item.substring(lastIndex));
          }
          
          return parts;
        });
        
        return result;
      };
      
      // 默认作为段落处理
      elements.push(
        <p key={index} style={styles.paragraph}>
          {renderInlineElements(content)}
        </p>
      );
    });

    // 如果结束时还有未处理的列表
    if (inList && listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag key={`list-end`} style={styles.list}>
          {listItems.map((item, i) => (
            <li key={i} style={styles.listItem}>{item}</li>
          ))}
        </ListTag>
      );
    }

    return elements;
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.themeToggle} 
        onClick={onToggleDarkMode}
        title={darkMode ? "切换到浅色模式" : "切换到深色模式"}
      >
        {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
      </button>
      <div style={styles.phoneFrame}>
        <div style={styles.phoneHeader}>
          <div style={styles.phoneTitle}>微信公众号预览</div>
        </div>
        <div style={styles.phoneContent}>
          <div style={styles.wechatArticle}>
            {title && <h1 style={styles.wechatTitle}>{title}</h1>}
            {renderMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview; 