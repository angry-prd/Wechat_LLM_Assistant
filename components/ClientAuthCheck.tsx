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

  useEffect(() => {
    // 检查用户是否已登录（同时检查多种登录方式）
    const checkAuth = () => {
      // 检查自定义登录系统
      const customLoggedIn = isLoggedIn();
      
      // 检查NextAuth
      const nextAuthLoggedIn = status === 'authenticated' && session !== null;
      
      // 检查session_token
      const hasSessionToken = localStorage.getItem('session_token') !== null;
      
      // 用户是否已授权（满足任一条件）
      const isUserAuthorized = customLoggedIn || nextAuthLoggedIn || hasSessionToken;
      
      return isUserAuthorized;
    };

    const performAuthCheck = () => {
      setIsChecking(true);
      
      // 等待NextAuth状态加载完成
      if (status === 'loading') return;
      
      const authResult = checkAuth();
      setIsAuthorized(authResult);
      
      // 如果未授权，保存当前URL并重定向到登录页面
      if (!authResult) {
        const currentPath = window.location.pathname;
        // 保存当前URL到localStorage以便登录后重定向
        localStorage.setItem('redirectUrl', currentPath);
        
        // 构建重定向URL，包含当前路径作为重定向参数
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
        router.replace(loginUrl);
      }
      
      setIsChecking(false);
    };

    performAuthCheck();
  }, [status, session, router, redirectTo]);

  // 只有当确认已授权后才显示子组件
  if (isAuthorized === true) {
    return <>{children}</>;
  }
  
  // 否则显示fallback（通常是加载状态）
  return <>{fallback}</>;
} 