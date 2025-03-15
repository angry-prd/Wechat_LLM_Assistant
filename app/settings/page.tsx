'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaKey, FaLink, FaWeixin, FaRobot, FaInfoCircle } from 'react-icons/fa';

// 内联样式
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 16px',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 'medium',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    fontWeight: 'medium',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  message: {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #86efac',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
  },
  infoBox: {
    marginTop: '24px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    padding: '16px',
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#4b5563',
    marginBottom: '8px',
  },
  infoItem: {
    marginBottom: '12px',
  },
  infoItemTitle: {
    fontWeight: 'bold',
  },
};

export default function Settings() {
  const [config, setConfig] = useState({
    // OpenAI配置
    openaiApiKey: '',
    openaiApiUrl: 'https://api.openai.com/v1',
    openaiModel: 'gpt-3.5-turbo',
    
    // 微信公众号配置
    wechatAppId: '',
    wechatAppSecret: '',
    wechatToken: '',
    wechatEncodingAESKey: '',
    
    // 其他配置
    defaultArticleAuthor: '管理员',
    defaultArticleCopyright: '© 2025 微信AI助手',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [userId] = useState('demo_user'); // 这里应该使用实际的用户ID
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchConfig();
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user-config/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsConnected(response.ok);
    } catch (error) {
      console.error('后端连接失败:', error);
      setIsConnected(false);
    }
  };

  const fetchConfig = async () => {
    try {
      // 尝试从后端获取配置
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user-config/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setConfig({
            openaiApiKey: data.openaiApiKey || '',
            openaiApiUrl: data.openaiApiUrl || 'https://api.openai.com/v1',
            openaiModel: data.openaiModel || 'gpt-3.5-turbo',
            wechatAppId: data.wechatAppId || '',
            wechatAppSecret: data.wechatAppSecret || '',
            wechatToken: data.wechatToken || '',
            wechatEncodingAESKey: data.wechatEncodingAESKey || '',
            defaultArticleAuthor: data.defaultArticleAuthor || '管理员',
            defaultArticleCopyright: data.defaultArticleCopyright || '© 2025 微信AI助手',
          });
          console.log('从后端获取配置成功');
          return;
        }
      } catch (error) {
        console.error('从后端获取配置失败:', error);
      }
      
      // 如果后端获取失败，尝试从localStorage获取
      const configStr = localStorage.getItem('userConfig');
      if (configStr) {
        try {
          const localConfig = JSON.parse(configStr);
          setConfig(prev => ({
            ...prev,
            ...localConfig
          }));
          console.log('从localStorage获取配置成功');
        } catch (error) {
          console.error('解析localStorage配置失败:', error);
        }
      }
    } catch (error) {
      console.error('获取配置失败:', error);
      setMessage('获取配置失败');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // 保存到localStorage
      localStorage.setItem('userConfig', JSON.stringify(config));
      
      // 尝试保存到后端
      if (isConnected) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/user-config/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          });

          if (response.ok) {
            setMessage('配置保存成功！已同步到服务器');
            setMessageType('success');
          } else {
            throw new Error('保存到服务器失败');
          }
        } catch (error) {
          console.error('保存到服务器失败:', error);
          setMessage('配置已保存到本地，但同步到服务器失败');
          setMessageType('error');
        }
      } else {
        setMessage('配置已保存到本地（未连接到服务器）');
        setMessageType('success');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      setMessage('保存配置失败，请重试');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>系统配置</h1>

      <form onSubmit={handleSubmit}>
        {message && (
          <div style={{
            ...styles.message,
            ...(messageType === 'success' ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </div>
        )}

        {!isConnected && (
          <div style={{
            ...styles.message,
            backgroundColor: '#fff8e6',
            color: '#854d0e',
            border: '1px solid #fef3c7',
            marginBottom: '16px',
          }}>
            <FaInfoCircle style={{ marginRight: '8px' }} />
            未连接到后端服务器，配置将只保存在本地浏览器中
          </div>
        )}

        {/* OpenAI配置 */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <FaRobot size={18} />
            <span>OpenAI配置</span>
          </h2>
          
          <div style={styles.formGroup}>
            <label htmlFor="openaiApiKey" style={styles.label}>
              API密钥
            </label>
            <input
              type="password"
              id="openaiApiKey"
              name="openaiApiKey"
              value={config.openaiApiKey}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入OpenAI API密钥"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="openaiApiUrl" style={styles.label}>
              API地址
            </label>
            <input
              type="text"
              id="openaiApiUrl"
              name="openaiApiUrl"
              value={config.openaiApiUrl}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入OpenAI API地址"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="openaiModel" style={styles.label}>
              模型
            </label>
            <select
              id="openaiModel"
              name="openaiModel"
              value={config.openaiModel}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
        </div>

        {/* 微信公众号配置 */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <FaWeixin size={18} />
            <span>微信公众号配置</span>
          </h2>
          
          <div style={styles.formGroup}>
            <label htmlFor="wechatAppId" style={styles.label}>
              AppID
            </label>
            <input
              type="text"
              id="wechatAppId"
              name="wechatAppId"
              value={config.wechatAppId}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入微信公众号AppID"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="wechatAppSecret" style={styles.label}>
              AppSecret
            </label>
            <input
              type="password"
              id="wechatAppSecret"
              name="wechatAppSecret"
              value={config.wechatAppSecret}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入微信公众号AppSecret"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="wechatToken" style={styles.label}>
              Token
            </label>
            <input
              type="text"
              id="wechatToken"
              name="wechatToken"
              value={config.wechatToken}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入微信公众号Token"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="wechatEncodingAESKey" style={styles.label}>
              EncodingAESKey
            </label>
            <input
              type="text"
              id="wechatEncodingAESKey"
              name="wechatEncodingAESKey"
              value={config.wechatEncodingAESKey}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入微信公众号EncodingAESKey"
            />
          </div>
        </div>

        {/* 其他配置 */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <FaKey size={18} />
            <span>其他配置</span>
          </h2>
          
          <div style={styles.formGroup}>
            <label htmlFor="defaultArticleAuthor" style={styles.label}>
              默认文章作者
            </label>
            <input
              type="text"
              id="defaultArticleAuthor"
              name="defaultArticleAuthor"
              value={config.defaultArticleAuthor}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入默认文章作者"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="defaultArticleCopyright" style={styles.label}>
              默认版权信息
            </label>
            <input
              type="text"
              id="defaultArticleCopyright"
              name="defaultArticleCopyright"
              value={config.defaultArticleCopyright}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="请输入默认版权信息"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...styles.button,
            ...(isLoading ? styles.buttonDisabled : {})
          }}
        >
          <FaSave size={16} />
          <span>{isLoading ? '保存中...' : '保存配置'}</span>
        </button>
      </form>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>
          <FaInfoCircle size={16} />
          <span>配置说明</span>
        </h3>
        
        <div style={styles.infoItem}>
          <p style={{...styles.infoText, ...styles.infoItemTitle}}>OpenAI配置</p>
          <p style={styles.infoText}>
            <strong>API密钥：</strong>从OpenAI官网获取的API密钥，用于调用AI服务。
          </p>
          <p style={styles.infoText}>
            <strong>API地址：</strong>OpenAI API的接口地址，默认为 https://api.openai.com/v1。
          </p>
          <p style={styles.infoText}>
            <strong>模型：</strong>选择要使用的OpenAI模型，不同模型有不同的能力和价格。
          </p>
        </div>
        
        <div style={styles.infoItem}>
          <p style={{...styles.infoText, ...styles.infoItemTitle}}>微信公众号配置</p>
          <p style={styles.infoText}>
            <strong>AppID：</strong>从微信公众平台获取的AppID，用于发布文章。
          </p>
          <p style={styles.infoText}>
            <strong>AppSecret：</strong>从微信公众平台获取的AppSecret，用于发布文章。
          </p>
          <p style={styles.infoText}>
            <strong>Token：</strong>微信公众平台配置的Token，用于验证请求。
          </p>
          <p style={styles.infoText}>
            <strong>EncodingAESKey：</strong>微信公众平台配置的消息加解密密钥。
          </p>
        </div>
      </div>
    </div>
  );
} 