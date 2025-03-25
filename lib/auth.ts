// 用户认证工具库

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
  // 清除会话Cookie
  document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}