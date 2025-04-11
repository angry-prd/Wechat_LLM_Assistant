import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 定义需要权限的路径列表（需要登录才能访问）
const protectedPaths = [
  '/ai-generator',
  '/ai-chat',
  '/editor',
  '/publish',
  '/history',
  '/settings',
  '/articles',
];

// 定义需要权限的API路径列表
const protectedApiPaths = [
  '/api/ai-chat',
  '/api/ai-generate',
  '/api/chat',
  '/api/chat/history',
  '/api/generate',
  '/api/history',
  '/api/settings',
  '/api/articles',
  '/api/chat-models',
  '/api/user-config',
  '/api/publish',
];

// 介绍页面列表，这些页面不需要登录即可访问
const introPages = [
  '/ai-chat/landing',
  '/editor/landing',
  '/publish/landing',
];

// 公共页面，不需要权限也可以访问
const publicPages = [
  '/',
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  // 获取路径
  const path = request.nextUrl.pathname;
  
  // 对于静态资源和favicon，直接放行
  if (
    path.startsWith('/_next/') ||
    path.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // 检查是否是公共页面或介绍页面，直接放行
  if (
    publicPages.some(p => path === p) || 
    introPages.some(introPath => path.startsWith(introPath))
  ) {
    return NextResponse.next();
  }
  
  // 检查是否是受保护的API路径
  const isProtectedApiPath = protectedApiPaths.some(apiPath => 
    path.startsWith(apiPath)
  );
  
  // 检查是否是受保护的页面路径
  const isProtectedPagePath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  // 如果是受保护的路径，检查登录状态
  if (isProtectedApiPath || isProtectedPagePath) {
    // 检查所有可能的认证令牌
    const authToken = request.cookies.get('authToken')?.value;
    const sessionToken = request.cookies.get('session_token')?.value;
    const userToken = request.cookies.get('user_token')?.value;
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;
    
    // 如果未登录并尝试访问受保护的路径
    if (!authToken && !sessionToken && !userToken && !nextAuthToken) {
      // 如果是API路径，返回401未授权
      if (isProtectedApiPath) {
        return NextResponse.json({ 
          success: false, 
          error: '请先登录', 
          code: 'AUTH_REQUIRED' 
        }, { status: 401 });
      }
      
      // 如果是页面路径，立即重定向到登录页面并添加重定向参数
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', path);
      
      // 添加调试日志（在生产环境可注释掉）
      console.log(`用户未授权，重定向到: ${redirectUrl.toString()} 来自 ${path}`);
      
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // 对于其他情况，继续处理请求
  return NextResponse.next();
}

// 配置中间件应该运行的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了静态文件
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 