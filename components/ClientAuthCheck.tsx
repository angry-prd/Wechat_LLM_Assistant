'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { isLoggedIn } from '@/lib/auth';
import { Spinner } from '@/components/Spinner';

interface ClientAuthCheckProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * 客户端权限验证组件
 * 用于在客户端渲染前检查用户是否已登录
 * 如果未登录，将立即重定向到登录页面
 */
export default function ClientAuthCheck({ 
  children, 
  redirectTo = '/login', 
  fallback = <div className="min-h-screen flex items-center justify-center">
    <Spinner />
  </div> 
}: ClientAuthCheckProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  // 设置最大检查时间
  const maxCheckTime = 2000; // 2秒

  useEffect(() => {
    let checkTimeout: NodeJS.Timeout | null = null;
    
    // 立即进行基本身份验证检查（不等待NextAuth）
    const performImmediateCheck = () => {
      try {
        console.log('执行立即身份验证检查');
        
        // 检查自定义登录系统
        const customLoggedIn = isLoggedIn();
        
        // 检查session_token
        const hasSessionToken = localStorage.getItem('session_token') !== null;
        
        // 如果任何一个直接检查通过
        if (customLoggedIn || hasSessionToken) {
          console.log('本地验证成功，用户已登录');
          setIsAuthorized(true);
          setIsChecking(false);
          return true;
        }
        
        // 如果都不通过，并且NextAuth还在加载，设置超时等待NextAuth
        if (status === 'loading') {
          console.log('本地验证失败，等待NextAuth验证结果');
          return false;
        }
        
        // 如果NextAuth已完成加载，检查其结果
        if (status === 'authenticated' && session) {
          console.log('NextAuth验证成功，用户已登录');
          setIsAuthorized(true);
          setIsChecking(false);
          return true;
        }
        
        // 所有验证都失败，用户未登录
        console.log('所有验证方式均失败，用户未登录');
        redirectToLogin();
        return false;
      } catch (error) {
        console.error('权限检查出错:', error);
        redirectToLogin();
        return false;
      }
    };
    
    // 立即执行一次初始检查
    const initialCheckResult = performImmediateCheck();
    
    // 如果初始检查未通过，设置超时
    if (!initialCheckResult && status === 'loading') {
      console.log(`设置${maxCheckTime}毫秒超时，等待NextAuth`);
      
      checkTimeout = setTimeout(() => {
        console.log('NextAuth验证超时，当作未授权处理');
        redirectToLogin();
      }, maxCheckTime);
    }
    
    // 清理函数
    return () => {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [status, session, router, redirectTo]);
  
  // 重定向到登录页面
  const redirectToLogin = () => {
    setIsAuthorized(false);
    setIsChecking(false);
    
    const currentPath = window.location.pathname;
    // 保存当前URL到localStorage以便登录后重定向
    localStorage.setItem('redirectUrl', currentPath);
    
    // 构建重定向URL，包含当前路径作为重定向参数
    const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
    console.log('未授权，立即重定向到:', loginUrl);
    
    // 使用window.location直接跳转，确保完全刷新页面
    window.location.href = loginUrl;
  };

  // 如果已完成授权检查且已授权，显示子内容
  if (isAuthorized === true) {
    return <>{children}</>;
  }
  
  // 如果已检查完成且未授权，直接返回null（此时已经重定向了）
  if (isAuthorized === false && !isChecking) {
    return null;
  }
  
  // 正在检查中，显示加载状态
  return <>{fallback}</>;
} 