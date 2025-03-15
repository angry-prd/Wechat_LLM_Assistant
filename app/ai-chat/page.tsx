'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPaperPlane, FaCopy, FaFileAlt, FaRobot, FaUser, FaSpinner, FaRedo } from 'react-icons/fa';

// 配置类型定义
interface UserConfig {
  openaiApiKey: string;
  openaiApiUrl: string;
  openaiModel: string;
  wechatAppId: string;
  wechatAppSecret: string;
  wechatToken: string;
  wechatEncodingAESKey: string;
  defaultArticleAuthor: string;
  defaultArticleCopyright: string;
}

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string; // 添加唯一ID
}

// 内联样式
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px',
    height: 'calc(100vh - 80px)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    height: 'calc(100% - 120px)',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '16px',
    position: 'relative' as const,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  assistantMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    position: 'relative' as const,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  assistantBubble: {
    backgroundColor: 'white',
    color: '#111827',
    borderBottomLeftRadius: '4px',
    border: '1px solid #e5e7eb',
  },
  messageIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    marginRight: '8px',
    marginTop: '4px',
  },
  userIcon: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  assistantIcon: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: '16px',
  },
  textareaContainer: {
    position: 'relative' as const,
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    paddingRight: '48px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    resize: 'none' as const,
    minHeight: '80px',
    maxHeight: '200px',
    outline: 'none',
  },
  sendButton: {
    position: 'absolute' as const,
    right: '12px',
    bottom: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  markdownContent: {
    fontFamily: 'monospace',
  },
  loadingSpinner: {
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  messageActions: {
    position: 'absolute' as const,
    right: '8px',
    top: '8px',
    display: 'flex',
    gap: '8px',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  messageActionsVisible: {
    opacity: 1,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  actionButtonHover: {
    backgroundColor: '#e5e7eb',
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    opacity: 0,
    transition: 'opacity 0.2s',
    marginBottom: '4px',
  },
  tooltipVisible: {
    opacity: 1,
  },
};

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是AI助手，可以帮你撰写微信公众号文章。请告诉我你想写什么主题的文章，或者需要什么帮助？',
      timestamp: new Date(),
      id: 'welcome-message',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 加载用户配置
  useEffect(() => {
    const configStr = localStorage.getItem('userConfig');
    if (configStr) {
      try {
        const config = JSON.parse(configStr);
        setUserConfig(config);
        console.log('已加载用户配置:', config);
      } catch (error) {
        console.error('解析用户配置失败:', error);
      }
    }
  }, []);

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      id: generateId(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let aiResponse = '';
      
      // 检查是否有API配置
      if (userConfig && userConfig.openaiApiKey && userConfig.openaiApiKey !== 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        // 使用真实的OpenAI API
        console.log('使用OpenAI API获取回复...');
        
        const response = await fetch(`${userConfig.openaiApiUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userConfig.openaiApiKey}`
          },
          body: JSON.stringify({
            model: userConfig.openaiModel || 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: '你是一个专业的微信公众号内容创作助手，擅长撰写高质量的文章。请用Markdown格式回复，以便于后续编辑和排版。'
              },
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              { role: 'user', content: input }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });
        
        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        aiResponse = data.choices[0].message.content;
      } else {
        // 使用模拟数据
        console.log('使用模拟数据获取回复...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟网络延迟
        
        // 根据用户输入生成不同的回复
        if (input.toLowerCase().includes('文章') || input.toLowerCase().includes('写一篇')) {
          if (input.toLowerCase().includes('微信运营')) {
            aiResponse = `# 微信公众号运营的10个实用技巧

微信公众号已经成为企业和个人展示自我、传播内容的重要平台。如何做好公众号运营，提高粉丝活跃度和文章阅读量？以下是10个实用技巧：

## 1. 明确定位，找准受众

在开始运营公众号前，明确你的目标受众是谁，他们关注什么内容，有什么需求。定位精准才能吸引精准粉丝。

## 2. 内容为王，保持高质量

无论平台如何变化，高质量的内容永远是吸引读者的核心。确保你的文章有价值、有深度、有洞见。

## 3. 保持更新频率稳定

制定内容日历，保持稳定的更新频率，让粉丝形成阅读习惯。每周更新2-3次是比较理想的频率。

## 4. 标题党适度，吸引点击

一个好的标题能大幅提高文章的打开率，但过度标题党会失去读者信任，需要把握好度。

## 5. 排版美观，提升体验

使用微信编辑器的排版功能，加入适当的图片、表情、分割线等元素，让文章更加美观易读。`;
          } else if (input.toLowerCase().includes('ai') || input.toLowerCase().includes('人工智能')) {
            aiResponse = `# 人工智能如何改变我们的生活与工作

人工智能(AI)正以前所未有的速度融入我们的日常生活和工作环境。从智能手机助手到自动驾驶汽车，AI技术正在重塑我们与世界互动的方式。

## AI在日常生活中的应用

### 智能家居
智能音箱、智能灯光、智能恒温器等设备通过AI算法学习用户习惯，提供个性化的家居体验。

### 个人助手
Siri、Alexa和Google Assistant等虚拟助手可以帮助我们设置提醒、回答问题、控制设备，甚至讲笑话。

### 健康监测
AI驱动的健康应用和可穿戴设备可以追踪我们的健康状况，提供个性化的健康建议。

## AI在工作场所的变革

### 自动化重复任务
AI可以自动化数据输入、日程安排等重复性任务，让员工专注于更有创造性的工作。

### 数据分析与决策支持
AI系统可以分析海量数据，提取有价值的见解，辅助企业做出更明智的决策。

### 客户服务
聊天机器人和虚拟助手可以24/7提供客户支持，回答常见问题，提高客户满意度。`;
          } else {
            aiResponse = `# ${input.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim()}指南

## 引言
${input.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim()}是当今社会中一个重要的话题。本文将深入探讨其核心要素、发展趋势以及实践建议。

## 核心要素
1. **理解基础概念** - 掌握${input.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim()}的基本原理和关键术语
2. **分析当前趋势** - 了解行业最新发展和创新方向
3. **实践方法论** - 系统化的实施策略和步骤

## 发展趋势
随着技术的不断进步和社会需求的变化，${input.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim()}呈现出以下趋势：

- 数字化转型加速
- 用户体验至上
- 可持续发展理念融入
- 全球化与本地化并重

## 实践建议
要在${input.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim()}领域取得成功，可以考虑以下建议：

1. 持续学习，跟进行业动态
2. 建立专业网络，促进交流合作
3. 实践验证，从实际应用中总结经验
4. 创新思维，寻找差异化竞争优势

## 结语
${input.replace(/[写一篇关于|写一篇|文章|的]/g, '').trim()}是一个充满机遇与挑战的领域。通过深入理解其核心要素，把握发展趋势，并采取有效的实践策略，我们能够在这一领域中获得成功。`;
          }
        } else if (input.toLowerCase().includes('你好') || input.toLowerCase().includes('hi') || input.toLowerCase().includes('hello')) {
          aiResponse = '你好！我是AI助手，很高兴为你服务。我可以帮你撰写微信公众号文章、提供内容创作建议、优化文章结构等。请告诉我你需要什么样的帮助？';
        } else if (input.toLowerCase().includes('帮助') || input.toLowerCase().includes('help')) {
          aiResponse = `我可以帮助你完成以下任务：

1. 撰写微信公众号文章
2. 提供内容创作建议
3. 优化文章结构和标题
4. 生成文章大纲
5. 改写和润色文章

请直接告诉我你的需求，例如"写一篇关于微信运营的文章"或"帮我优化这篇文章的标题"。`;
        } else {
          aiResponse = `我理解你想了解关于"${input.trim()}"的内容。我可以帮你撰写一篇相关的文章，你希望从哪些角度来探讨这个话题？或者你可以直接要求我写一篇完整的文章，例如"写一篇关于${input.trim()}的文章"。`;
        }
      }

      // 添加AI回复
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        id: generateId(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('获取AI回复失败:', error);
      // 添加错误消息
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，获取回复时出现了错误，请稍后再试。如果您使用的是OpenAI API，请检查API密钥是否正确。',
        timestamp: new Date(),
        id: generateId(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 复制消息内容
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => alert('已复制到剪贴板！'))
      .catch(err => console.error('复制失败:', err));
  };

  // 重新生成回复
  const handleRegenerateMessage = (messageId: string) => {
    // 找到要重新生成的消息的索引
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // 找到前一条用户消息
    let userMessageIndex = -1;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMessageIndex = i;
        break;
      }
    }
    if (userMessageIndex === -1) return;

    // 设置输入框内容为用户消息
    setInput(messages[userMessageIndex].content);
    
    // 删除从用户消息之后的所有消息
    setMessages(messages.slice(0, userMessageIndex + 1));
    
    // 自动发送消息
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // 创建新文章
  const handleCreateArticle = (content: string) => {
    if (content) {
      // 将消息内容存储到localStorage
      localStorage.setItem('newArticleContent', content);
      
      // 提取标题（如果有）
      let title = '';
      const lines = content.split('\n');
      if (lines.length > 0 && lines[0].startsWith('# ')) {
        title = lines[0].substring(2).trim();
      }
      localStorage.setItem('newArticleTitle', title);
      
      // 跳转到创建文章页面
      router.push('/articles/create');
    }
  };

  // 渲染消息内容（简单处理Markdown）
  const renderMessageContent = (content: string) => {
    // 简单处理Markdown格式
    const formattedContent = content
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>AI助手</h1>
        <p style={styles.subtitle}>与AI对话，生成微信公众号文章内容</p>
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              style={{
                ...styles.messageRow,
                ...(message.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow),
              }}
              onMouseEnter={() => setHoveredMessage(message.id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {message.role === 'assistant' && (
                <div style={{...styles.messageIcon, ...styles.assistantIcon}}>
                  <FaRobot size={14} />
                </div>
              )}
              <div 
                style={{
                  ...styles.messageBubble,
                  ...(message.role === 'user' ? styles.userBubble : styles.assistantBubble),
                  ...(message.role === 'assistant' ? styles.markdownContent : {}),
                }}
              >
                {message.role === 'assistant' 
                  ? renderMessageContent(message.content)
                  : message.content
                }
                
                {/* 消息操作按钮 - 仅对AI回复显示 */}
                {message.role === 'assistant' && (
                  <div style={{
                    ...styles.messageActions,
                    ...(hoveredMessage === message.id ? styles.messageActionsVisible : {})
                  }}>
                    <button
                      style={{
                        ...styles.actionButton,
                        ...(hoveredAction === `copy-${message.id}` ? styles.actionButtonHover : {}),
                      }}
                      onClick={() => handleCopyMessage(message.content)}
                      onMouseEnter={() => setHoveredAction(`copy-${message.id}`)}
                      onMouseLeave={() => setHoveredAction(null)}
                    >
                      <FaCopy size={12} />
                      <div 
                        style={{
                          ...styles.tooltip,
                          ...(hoveredAction === `copy-${message.id}` ? styles.tooltipVisible : {}),
                        }}
                      >
                        复制内容
                      </div>
                    </button>
                    
                    <button
                      style={{
                        ...styles.actionButton,
                        ...(hoveredAction === `regenerate-${message.id}` ? styles.actionButtonHover : {}),
                      }}
                      onClick={() => handleRegenerateMessage(message.id)}
                      onMouseEnter={() => setHoveredAction(`regenerate-${message.id}`)}
                      onMouseLeave={() => setHoveredAction(null)}
                    >
                      <FaRedo size={12} />
                      <div 
                        style={{
                          ...styles.tooltip,
                          ...(hoveredAction === `regenerate-${message.id}` ? styles.tooltipVisible : {}),
                        }}
                      >
                        重新生成
                      </div>
                    </button>
                    
                    <button
                      style={{
                        ...styles.actionButton,
                        ...(hoveredAction === `create-${message.id}` ? styles.actionButtonHover : {}),
                      }}
                      onClick={() => handleCreateArticle(message.content)}
                      onMouseEnter={() => setHoveredAction(`create-${message.id}`)}
                      onMouseLeave={() => setHoveredAction(null)}
                    >
                      <FaFileAlt size={12} />
                      <div 
                        style={{
                          ...styles.tooltip,
                          ...(hoveredAction === `create-${message.id}` ? styles.tooltipVisible : {}),
                        }}
                      >
                        创建文章
                      </div>
                    </button>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div style={{...styles.messageIcon, ...styles.userIcon}}>
                  <FaUser size={14} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{...styles.messageRow, ...styles.assistantMessageRow}}>
              <div style={{...styles.messageIcon, ...styles.assistantIcon}}>
                <FaRobot size={14} />
              </div>
              <div style={{...styles.messageBubble, ...styles.assistantBubble}}>
                <FaSpinner size={16} style={styles.loadingSpinner} /> 正在思考...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputContainer}>
          <div style={styles.textareaContainer}>
            <textarea
              style={styles.textarea}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题或要求，例如：写一篇关于微信运营的文章..."
              disabled={isLoading}
            />
            <button
              style={{
                ...styles.sendButton,
                ...(isLoading || !input.trim() ? styles.disabledButton : {}),
              }}
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 