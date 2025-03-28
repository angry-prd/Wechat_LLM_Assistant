import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登录才能访问的路径
const protectedPaths = [
  '/settings',
  '/settings/wechat',
  '/settings/api-keys',
  '/settings/model-config',
  '/ai-chat',
  '/ai-generator',
  '/articles',
  '/editor',
  '/preview',
  '/publish'
];

// 需要保存原始路径的API端点
const protectedApiEndpoints = [
  '/api/chat',
  '/api/chat/history',
  '/api/articles',
  '/api/user-config',
  '/api/chat-models',
  '/api/generate',
  '/api/publish'
];

// 中间件函数
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  // 检查是否是受保护的API端点
  const isProtectedApi = protectedApiEndpoints.some(apiEndpoint => 
    path.startsWith(apiEndpoint)
  );
  
  if (isProtectedPath || isProtectedApi) {
    // 检查是否有各种认证令牌
    const sessionToken = request.cookies.get('session_token')?.value;
    const userToken = request.cookies.get('user_token')?.value;
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;
    
    // 如果所有认证令牌都不存在，重定向到登录页面
    if (!sessionToken && !userToken && !nextAuthToken) {
      // 对于API请求，返回401状态码
      if (isProtectedApi) {
        return NextResponse.json(
          { success: false, message: '未登录' },
          { status: 401 }
        );
      }
      
      // 对于页面请求，重定向到登录页面
      const url = new URL('/login', request.url);
      // 保存原始路径以便登录后重定向回来
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
     * - /ai-chat
     * - /ai-generator
     * - /articles
     * - /editor
     * - /preview
     * - /publish
     * 以及所有受保护的API端点
     */
    '/settings/:path*',
    '/ai-chat/:path*',
    '/ai-generator/:path*',
    '/articles/:path*',
    '/editor/:path*',
    '/preview/:path*',
    '/publish/:path*',
    '/api/chat/:path*',
    '/api/chat-models/:path*',
    '/api/articles/:path*',
    '/api/user-config/:path*',
    '/api/generate/:path*',
    '/api/publish/:path*'
  ],
};