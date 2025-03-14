'use client';

import React, { useState } from 'react';
import { FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaCode, FaQuoteLeft, FaHeading } from 'react-icons/fa';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  
  // 内联样式
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      overflow: 'hidden',
    },
    toolbar: {
      display: 'flex',
      padding: '8px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    },
    toolButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      marginRight: '4px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4b5563',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    toolButtonHover: {
      backgroundColor: '#e5e7eb',
    },
    editor: {
      flex: 1,
      padding: '12px',
      fontSize: '14px',
      fontFamily: 'monospace',
      resize: 'none' as const,
      border: 'none',
      outline: 'none',
      lineHeight: '1.6',
      overflowY: 'auto' as const,
    },
  };

  // 处理工具栏按钮点击
  const handleToolClick = (type: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';

    switch (type) {
      case 'bold':
        newText = `**${selectedText || '粗体文字'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || '斜体文字'}*`;
        break;
      case 'heading':
        newText = `\n## ${selectedText || '标题'}\n`;
        break;
      case 'link':
        newText = `[${selectedText || '链接文字'}](https://example.com)`;
        break;
      case 'image':
        newText = `![${selectedText || '图片描述'}](https://example.com/image.jpg)`;
        break;
      case 'code':
        newText = selectedText.includes('\n') 
          ? `\n\`\`\`\n${selectedText || '代码块'}\n\`\`\`\n` 
          : `\`${selectedText || '代码'}\``;
        break;
      case 'quote':
        newText = `\n> ${selectedText || '引用文字'}\n`;
        break;
      case 'ul':
        newText = selectedText
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : `\n- 列表项\n- 列表项\n- 列表项\n`;
        break;
      case 'ol':
        newText = selectedText
          ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
          : `\n1. 列表项\n2. 列表项\n3. 列表项\n`;
        break;
      default:
        newText = selectedText;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // 处理编辑器内容变化
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);
  };

  // 处理编辑器选择变化
  const handleEditorSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    setSelectionStart(textarea.selectionStart);
    setSelectionEnd(textarea.selectionEnd);
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('bold')}
          title="粗体"
        >
          <FaBold />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('italic')}
          title="斜体"
        >
          <FaItalic />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('heading')}
          title="标题"
        >
          <FaHeading />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('link')}
          title="链接"
        >
          <FaLink />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('image')}
          title="图片"
        >
          <FaImage />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('code')}
          title="代码"
        >
          <FaCode />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('quote')}
          title="引用"
        >
          <FaQuoteLeft />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('ul')}
          title="无序列表"
        >
          <FaListUl />
        </button>
        <button 
          style={styles.toolButton} 
          onClick={() => handleToolClick('ol')}
          title="有序列表"
        >
          <FaListOl />
        </button>
      </div>
      <textarea
        id="markdown-editor"
        style={styles.editor}
        value={value}
        onChange={handleEditorChange}
        onSelect={handleEditorSelect}
        placeholder="在这里输入Markdown内容..."
      />
    </div>
  );
};

export default MarkdownEditor; 