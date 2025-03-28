'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/');
  const [originalPath, setOriginalPath] = useState('');
  
  // 获取重定向URL
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    } else {
      // 尝试从localStorage获取之前保存的URL
      const savedRedirectUrl = localStorage.getItem('redirectUrl');
      if (savedRedirectUrl) {
        setRedirectUrl(savedRedirectUrl);
        localStorage.removeItem('redirectUrl'); // 使用后清除
      } else {
        // 默认跳转首页
        setRedirectUrl('/');
      }
    }
    
    // 保存当前路径作为原始路径
    const path = window.location.pathname;
    if (path !== '/login') {
      setOriginalPath(path);
      localStorage.setItem('originalPath', path);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: formData.phone, password: formData.password })
      });

      const result = await response.json();

      if (response.ok) {
        // 保存用户信息和令牌到本地存储
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          
          // 确保session_token也被保存到cookie中
          // 这里从response.headers中获取Set-Cookie并手动设置cookie
          if(result.sessionToken) {
            document.cookie = `session_token=${result.sessionToken}; path=/; max-age=2592000`; // 30天有效期
            // 同时保存到本地存储以便JavaScript访问
            localStorage.setItem('session_token', result.sessionToken);
          }
          
          // 设置用户令牌cookie
          document.cookie = `user_token=${result.user.id}; path=/; max-age=2592000`; // 30天有效期
          
          // 触发storage事件，通知其他组件（如导航栏）用户已登录
          // 这是一个技巧，因为同一页面的localStorage变化不会触发storage事件
          // 我们通过修改一个临时键然后立即删除来触发事件
          localStorage.setItem('login_status_change', Date.now().toString());
          
          // 创建并分发自定义事件，确保导航栏能立即感知到登录状态变化
          const loginEvent = new Event('login-status-changed');
          window.dispatchEvent(loginEvent);
          
          console.log('登录成功：', result.user.username);
          
          // 短暂延迟以确保状态更新
          setTimeout(() => {
            localStorage.removeItem('login_status_change');
          }, 100);
        }
        
        // 显示成功提示
        setToast({
          visible: true,
          message: '登录成功！',
          type: 'success'
        });
        
        // 短暂延迟后再跳转，确保登录状态更新
        setTimeout(() => {
          // 检查是否是从首页"开始使用"按钮跳转过来的
          const fromHomePage = redirectUrl === '/ai-chat';
          
          // 如果是从首页的"开始使用"按钮来的，直接跳转到AI聊天页面
          if (fromHomePage) {
            router.push('/ai-chat');
          } else {
            // 优先使用originalPath，其次是redirectUrl
            let targetPath = originalPath;
            if (!targetPath || targetPath === '/login') {
              targetPath = redirectUrl;
            }
            
            // 确保跳转到有效路径
            if (targetPath) {
              // 使用router.push代替直接设置window.location以保持React状态
              router.push(targetPath);
            } else {
              // 默认跳转到首页
              router.push('/');
            }
          }
          
          // 清除相关状态
          setIsLoading(false);
          localStorage.removeItem('originalPath');
        }, 300); // 延迟300ms确保状态更新
      }
      if (!response.ok) {
        setToast({
          visible: true,
          message: result.error || '登录失败，请重试',
          type: 'error'
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      setToast({
        visible: true,
        message: '登录请求失败，请检查网络连接',
        type: 'error'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type as 'error' | 'success' | 'info'}
          onClose={() => setToast({ ...toast, visible: false })}
        />
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">登录您的账号</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              注册新账号
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                pattern="[0-9]{11}"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                placeholder="请输入11位手机号码"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out shadow-sm hover:shadow`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </>
              ) : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}