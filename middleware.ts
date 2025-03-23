import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登录才能访问的路径
const protectedPaths = [
  '/settings',
  '/settings/wechat',
];

// 中间件函数
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  if (isProtectedPath) {
    // 检查是否有会话令牌
    const sessionToken = request.cookies.get('session_token')?.value;
    
    // 如果没有会话令牌，重定向到登录页面
    if (!sessionToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有需要保护的路径:
     * - /settings
     * - /settings/wechat
     */
    '/settings/:path*',
  ],
};