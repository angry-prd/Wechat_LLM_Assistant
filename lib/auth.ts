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

// 登出用户
export function logoutUser() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  // 可以在这里添加其他登出逻辑，如清除会话Cookie等
}