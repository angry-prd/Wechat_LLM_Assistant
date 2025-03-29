'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBold, FaItalic, FaListUl, FaListOl, FaLink, FaImage, FaCode, 
  FaQuoteLeft, FaHeading, FaUnderline, FaStrikethrough, FaTable,
  FaPalette, FaUndoAlt, FaRedoAlt, FaEraser, FaSave, FaEye, FaEyeSlash,
  FaRegSmile, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaFileDownload, FaCog
} from 'react-icons/fa';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, darkMode = false }) => {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 内联样式
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      width: '100%',
      flex: 1,
      overflow: 'hidden',
      borderRadius: darkMode ? '0' : '4px',
      border: darkMode ? 'none' : '1px solid #e8e8e8',
      background: darkMode ? '#1a1a1a' : '#fff',
    },
    toolbar: {
      display: 'flex',
      padding: '8px',
      borderBottom: `1px solid ${darkMode ? '#444' : '#e5e7eb'}`,
      backgroundColor: darkMode ? '#2c2c2c' : '#f9fafb',
      flexWrap: 'wrap' as const,
    },
    toolGroup: {
      display: 'flex',
      marginRight: '8px',
      borderRight: `1px solid ${darkMode ? '#444' : '#e5e7eb'}`,
      paddingRight: '8px',
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
      color: darkMode ? '#bbb' : '#4b5563',
      cursor: 'pointer',
      transition: 'background-color 0.2s, color 0.2s',
      position: 'relative' as const,
    },
    toolButtonHover: {
      backgroundColor: darkMode ? '#444' : '#e5e7eb',
      color: darkMode ? '#fff' : '#2563eb',
    },
    activeButton: {
      backgroundColor: darkMode ? '#3a5785' : '#dbeafe',
      color: darkMode ? '#fff' : '#2563eb',
    },
    tooltip: {
      position: 'absolute' as const,
      bottom: '-24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      whiteSpace: 'nowrap' as const,
      pointerEvents: 'none' as const,
      opacity: 0,
      transition: 'opacity 0.2s',
      zIndex: 10,
    },
    editorContainer: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
    },
    editor: {
      flex: 1,
      padding: '16px',
      fontSize: '15px',
      fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
      resize: 'none' as const,
      border: 'none',
      outline: 'none',
      lineHeight: '1.6',
      overflowY: 'auto' as const,
      backgroundColor: darkMode ? '#222' : '#ffffff',
      color: darkMode ? '#e0e0e0' : '#333333',
    },
    preview: {
      flex: 1,
      padding: '16px',
      fontSize: '15px',
      overflowY: 'auto' as const,
      backgroundColor: darkMode ? '#222' : '#ffffff',
      display: 'none',
      fontFamily: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif',
      color: darkMode ? '#e0e0e0' : '#333333',
      lineHeight: '1.75',
    },
    showPreview: {
      display: 'block',
    },
    statusBar: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 12px',
      backgroundColor: darkMode ? '#2c2c2c' : '#f9fafb',
      borderTop: `1px solid ${darkMode ? '#444' : '#e5e7eb'}`,
      fontSize: '12px',
      color: darkMode ? '#aaa' : '#6b7280',
    },
    charCounter: {
      display: 'flex',
      alignItems: 'center',
    },
    settings: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    settingButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
      borderRadius: '4px',
      color: '#6b7280',
      fontSize: '12px',
      transition: 'color 0.2s',
    },
    markdownStyles: {
      h1: {
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '20px 0 16px 0',
        paddingBottom: '10px',
        borderBottom: '1px solid #f0f0f0',
      },
      h2: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: '18px 0 14px 0',
        paddingBottom: '8px',
        borderBottom: '1px solid #f0f0f0',
      },
      h3: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '16px 0 12px 0',
      },
      p: {
        marginBottom: '16px',
        lineHeight: '1.75',
      },
      ul: {
        marginBottom: '16px',
        paddingLeft: '20px',
      },
      ol: {
        marginBottom: '16px',
        paddingLeft: '20px',
      },
      li: {
        marginBottom: '6px',
      },
      blockquote: {
        borderLeft: '4px solid #ddd',
        paddingLeft: '16px',
        color: '#666',
        fontStyle: 'italic',
        margin: '16px 0',
      },
      code: {
        backgroundColor: '#f5f5f5',
        fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
        padding: '2px 4px',
        borderRadius: '3px',
        fontSize: '0.9em',
      },
      pre: {
        backgroundColor: '#f5f5f5',
        padding: '12px',
        borderRadius: '4px',
        overflowX: 'auto' as const,
        marginBottom: '16px',
      },
      a: {
        color: '#1890ff',
        textDecoration: 'none',
      },
      img: {
        maxWidth: '100%',
        marginBottom: '16px',
      },
      table: {
        borderCollapse: 'collapse' as const,
        width: '100%',
        marginBottom: '16px',
      },
      th: {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left' as const,
        backgroundColor: '#f5f5f5',
      },
      td: {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left' as const,
      },
    },
  };

  // 工具栏按钮配置
  const toolbarConfig = [
    {
      group: '格式',
      buttons: [
        { icon: <FaBold />, action: 'bold', tooltip: '粗体 (Ctrl+B)' },
        { icon: <FaItalic />, action: 'italic', tooltip: '斜体 (Ctrl+I)' },
        { icon: <FaUnderline />, action: 'underline', tooltip: '下划线' },
        { icon: <FaStrikethrough />, action: 'strikethrough', tooltip: '删除线' },
      ]
    },
    {
      group: '标题',
      buttons: [
        { icon: <FaHeading />, action: 'h1', tooltip: '一级标题 (Ctrl+1)' },
        { icon: <FaHeading size={14} />, action: 'h2', tooltip: '二级标题 (Ctrl+2)' },
        { icon: <FaHeading size={12} />, action: 'h3', tooltip: '三级标题 (Ctrl+3)' },
      ]
    },
    {
      group: '列表',
      buttons: [
        { icon: <FaListUl />, action: 'ul', tooltip: '无序列表 (Ctrl+U)' },
        { icon: <FaListOl />, action: 'ol', tooltip: '有序列表 (Ctrl+O)' },
      ]
    },
    {
      group: '内容',
      buttons: [
        { icon: <FaLink />, action: 'link', tooltip: '链接 (Ctrl+L)' },
        { icon: <FaImage />, action: 'image', tooltip: '图片 (Ctrl+G)' },
        { icon: <FaCode />, action: 'code', tooltip: '代码 (Ctrl+K)' },
        { icon: <FaQuoteLeft />, action: 'quote', tooltip: '引用 (Ctrl+Q)' },
        { icon: <FaTable />, action: 'table', tooltip: '表格' },
      ]
    },
    {
      group: '排版',
      buttons: [
        { icon: <FaAlignLeft />, action: 'alignLeft', tooltip: '左对齐' },
        { icon: <FaAlignCenter />, action: 'alignCenter', tooltip: '居中' },
        { icon: <FaAlignRight />, action: 'alignRight', tooltip: '右对齐' },
      ]
    },
    {
      group: '工具',
      buttons: [
        { icon: <FaPalette />, action: 'color', tooltip: '文字颜色' },
        { icon: <FaRegSmile />, action: 'emoji', tooltip: '表情' },
        { icon: <FaUndoAlt />, action: 'undo', tooltip: '撤销 (Ctrl+Z)' },
        { icon: <FaRedoAlt />, action: 'redo', tooltip: '重做 (Ctrl+Y)' },
        { icon: <FaEraser />, action: 'clear', tooltip: '清空' },
        { icon: <FaFileDownload />, action: 'download', tooltip: '下载' },
      ]
    },
    {
      group: '视图',
      buttons: [
        { 
          icon: isPreview ? <FaEyeSlash /> : <FaEye />, 
          action: 'preview', 
          tooltip: isPreview ? '编辑模式' : '预览模式',
          active: isPreview
        },
      ]
    },
  ];

  // 渲染Markdown预览
  useEffect(() => {
    if (isPreview && previewRef.current) {
      // 此处可以使用更强大的Markdown渲染库，比如marked, markdown-it等
      // 这里仅做简单的演示替换
      const processedContent = value
        // 处理标题
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        // 处理粗体
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // 处理斜体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 处理链接
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        // 处理图片
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        // 处理列表
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        .replace(/<\/li>\n<li>/g, '</li><li>')
        .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
        // 处理引用
        .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
        // 处理代码
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // 处理段落
        .replace(/^(?!<[hou].*>|<li>|<blockquote>)(.*?)$/gm, '<p>$1</p>');

      previewRef.current.innerHTML = processedContent;
    }
  }, [value, isPreview]);

  // 同步滚动
  const syncScroll = (source: 'editor' | 'preview', scrollTop: number) => {
    if (!scrollSyncEnabled) return;
    
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (!editor || !preview) return;
    
    if (source === 'editor') {
      const editorScrollRatio = scrollTop / (editor.scrollHeight - editor.clientHeight);
      const previewScrollTop = editorScrollRatio * (preview.scrollHeight - preview.clientHeight);
      preview.scrollTop = previewScrollTop;
    } else {
      const previewScrollRatio = scrollTop / (preview.scrollHeight - preview.clientHeight);
      const editorScrollTop = previewScrollRatio * (editor.scrollHeight - editor.clientHeight);
      editor.scrollTop = editorScrollTop;
    }
  };

  // 处理工具栏按钮点击
  const handleToolClick = (action: string) => {
    if (action === 'preview') {
      setIsPreview(!isPreview);
      return;
    }
    
    if (isPreview) return; // 预览模式下不处理编辑操作
    
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';

    switch (action) {
      case 'bold':
        newText = `**${selectedText || '粗体文字'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || '斜体文字'}*`;
        break;
      case 'underline':
        newText = `<u>${selectedText || '下划线文字'}</u>`;
        break;
      case 'strikethrough':
        newText = `~~${selectedText || '删除线文字'}~~`;
        break;
      case 'h1':
        newText = `\n# ${selectedText || '一级标题'}\n`;
        break;
      case 'h2':
        newText = `\n## ${selectedText || '二级标题'}\n`;
        break;
      case 'h3':
        newText = `\n### ${selectedText || '三级标题'}\n`;
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
      case 'table':
        newText = `\n| 标题1 | 标题2 | 标题3 |\n| ----- | ----- | ----- |\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n`;
        break;
      case 'alignLeft':
        newText = `<div style="text-align: left;">${selectedText || '左对齐文本'}</div>`;
        break;
      case 'alignCenter':
        newText = `<div style="text-align: center;">${selectedText || '居中文本'}</div>`;
        break;
      case 'alignRight':
        newText = `<div style="text-align: right;">${selectedText || '右对齐文本'}</div>`;
        break;
      case 'color':
        newText = `<span style="color: #ff0000;">${selectedText || '彩色文字'}</span>`;
        break;
      case 'emoji':
        newText = `😊`;
        break;
      case 'undo':
        document.execCommand('undo');
        return;
      case 'redo':
        document.execCommand('redo');
        return;
      case 'clear':
        if (window.confirm('确定要清空编辑器内容吗？此操作不可撤销。')) {
          onChange('');
        }
        return;
      case 'download':
        downloadMarkdown();
        return;
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

  // 下载Markdown文件
  const downloadMarkdown = () => {
    if (!value.trim()) {
      alert('编辑器内容为空，无法下载');
      return;
    }
    
    try {
      const blob = new Blob([value], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markdown-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载文件失败:', error);
      alert('下载文件失败');
    }
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
  
  // 处理编辑器滚动
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    syncScroll('editor', textarea.scrollTop);
  };
  
  // 处理预览区域滚动
  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const div = e.target as HTMLDivElement;
    syncScroll('preview', div.scrollTop);
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        {toolbarConfig.map((group, groupIndex) => (
          <div key={groupIndex} style={styles.toolGroup}>
            {group.buttons.map((button, buttonIndex) => (
        <button 
                key={buttonIndex}
                style={{
                  ...styles.toolButton, 
                  ...(button.active ? styles.activeButton : {})
                }}
                onClick={() => handleToolClick(button.action)}
                title={button.tooltip}
                type="button"
        >
                {button.icon}
        </button>
            ))}
          </div>
        ))}
      </div>
      
      <div style={styles.editorContainer}>
      <textarea
          ref={editorRef}
        id="markdown-editor"
          style={{
            ...styles.editor,
            display: isPreview ? 'none' : 'block'
          }}
        value={value}
        onChange={handleEditorChange}
        onSelect={handleEditorSelect}
          onScroll={handleEditorScroll}
        placeholder="在这里输入Markdown内容..."
      />
        
        <div 
          ref={previewRef}
          style={{
            ...styles.preview,
            ...styles.markdownStyles,
            ...(isPreview ? styles.showPreview : {})
          }}
          onScroll={handlePreviewScroll}
        ></div>
      </div>
      
      <div style={styles.statusBar}>
        <div style={styles.charCounter}>
          {value.length} 字符 | {value.split(/\s+/).filter(Boolean).length} 单词
        </div>
        <div style={styles.settings}>
          <button 
            style={styles.settingButton}
            onClick={() => setScrollSyncEnabled(!scrollSyncEnabled)}
            title={scrollSyncEnabled ? '禁用滚动同步' : '启用滚动同步'}
            type="button"
          >
            {scrollSyncEnabled ? '滚动同步: 开' : '滚动同步: 关'}
          </button>
          <button 
            style={styles.settingButton}
            onClick={() => {}} // 可以添加更多设置选项
            title="编辑器设置"
            type="button"
          >
            <FaCog size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor; 