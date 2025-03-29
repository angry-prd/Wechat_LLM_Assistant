// 用户认证工具库
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// 添加next-auth配置
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // 调用登录API
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password
            })
          });
          
          const data = await response.json();
          if (data.success && data.user) {
            return {
              id: data.user.id,
              name: data.user.username,
              email: data.user.email
            };
          }
          return null;
        } catch (error) {
          console.error('认证失败:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};

// 从localStorage获取当前登录用户信息
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('解析用户数据失败:', error);
    return null;
  }
}

// 检查用户是否已登录
export function isLoggedIn() {
  return !!getCurrentUser();
}

// 获取当前用户ID，如果未登录则返回默认ID
export function getCurrentUserId() {
  const user = getCurrentUser();
  return user?.id || 'default';
}

// 保存当前URL以便登录后重定向
export function saveRedirectUrl(url: string) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('redirectUrl', url);
}

// 获取保存的重定向URL
export function getRedirectUrl() {
  if (typeof window === 'undefined') return '/';
  
  return localStorage.getItem('redirectUrl') || '/';
}

// 登出用户
export function logoutUser() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  // 清除所有相关Cookie
  document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}