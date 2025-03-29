'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaNewspaper, FaCog, FaWeixin, FaRobot, FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { isLoggedIn } from '@/lib/auth';

// 内联样式定义
const styles = {
  nav: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    height: 'var(--navbar-height)',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
  logoIcon: {
    marginRight: '12px',
  },
  logoText: {
    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  desktopMenu: {
    display: 'flex',
    marginLeft: '32px',
    alignItems: 'center',
  },
  mobileMenuHidden: {
    display: 'none',
  },
  navItem: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 20px',
    height: '64px',
    fontSize: '1rem',
    fontWeight: 'medium',
    transition: 'all 0.3s',
    textDecoration: 'none',
  },
  navItemActive: {
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
  },
  navItemInactive: {
    color: '#6b7280',
    borderBottom: '2px solid transparent',
  },
  mobileMenuButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '4px',
    color: '#9ca3af',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  mobileMenu: {
    padding: '12px 0 16px 0',
  },
  mobileNavItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    fontSize: '1rem',
    fontWeight: 'medium',
    textDecoration: 'none',
  },
  mobileNavItemActive: {
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #2563eb',
  },
  mobileNavItemInactive: {
    color: '#6b7280',
    borderLeft: '4px solid transparent',
  },
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    borderWidth: '0',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'medium', 
    color: '#4b5563',
    textDecoration: 'none',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  userButton: {
    display: 'flex', 
    alignItems: 'center', 
    padding: '8px 16px', 
    backgroundColor: '#f3f4f6', 
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  userMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 50,
    width: '180px',
    overflow: 'hidden'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 18px',
    fontSize: '0.95rem',
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // 检查登录状态和获取用户信息
  const checkLoginStatus = () => {
    if (typeof window === 'undefined') return;
    
    try {
      // 检查自定义认证系统和next-auth认证系统
      const customLoggedIn = isLoggedIn();
      const nextAuthLoggedIn = status === 'authenticated' && session !== null;
      const storedUser = localStorage.getItem('user');
      const sessionToken = localStorage.getItem('session_token');
      
      // 严格检查登录状态 - 增加对cookie和sessionToken的检查
      const userIsLoggedIn = (customLoggedIn || nextAuthLoggedIn || !!sessionToken) && !!storedUser;
      
      // 立即更新状态
      setIsUserLoggedIn(userIsLoggedIn);
      
      // 只有在用户已登录的情况下设置用户名
      if (userIsLoggedIn && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUsername(parsedUser.username);
          console.log('用户已登录:', parsedUser.username);
        } catch (e) {
          console.error('解析用户数据失败', e);
          localStorage.removeItem('user');
          setUsername(null);
        }
      } else {
        // 未登录或没有用户数据，清除状态
        setUsername(null);
      }
    } catch (e) {
      console.error('检查登录状态失败', e);
      localStorage.removeItem('user');
      setUsername(null);
      setIsUserLoggedIn(false);
    }
  };

  // 初始化客户端状态和监听窗口大小
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // 登录状态监听
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 首次加载立即检查
    checkLoginStatus();
    
    // 监听存储变化
    const handleStorageChange = (e: StorageEvent) => {
      // 只在相关键值变化时触发检查
      if (e.key === 'user' || e.key === 'session_token' || e.key === 'login_status_change') {
        console.log('存储变化检测到:', e.key);
        checkLoginStatus();
      }
    };
    
    // 创建自定义事件监听器 - 用于即时通知登录状态变化
    const handleCustomLoginEvent = () => {
      console.log('检测到登录状态变化事件');
      checkLoginStatus();
    };

    // 页面可见性变化时也检查登录状态
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkLoginStatus();
      }
    };
    
    // 注册事件监听器
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login-status-changed', handleCustomLoginEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 定期检查登录状态，但间隔较长以减少资源消耗
    const intervalId = setInterval(checkLoginStatus, 10000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login-status-changed', handleCustomLoginEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [status, session]);
  
  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    setUsername(null);
    setIsUserLoggedIn(false);
    setShowUserMenu(false);
    router.push('/');
  };

  // 处理登录按钮点击
  const handleLoginClick = () => {
    localStorage.setItem('redirectUrl', pathname);
    router.push('/login');
  };

  // 根据登录状态动态生成导航项
  const navItems = [
    { name: '首页', href: '/', icon: <FaHome size={18} style={{ marginRight: '10px' }} /> },
    { name: 'AI助手', href: '/ai-chat', icon: <FaRobot size={18} style={{ marginRight: '10px' }} /> },
    { name: '推文管理', href: '/articles', icon: <FaNewspaper size={18} style={{ marginRight: '10px' }} /> },
  ];
  
  // 只有登录用户才能看到系统配置选项
  if (isUserLoggedIn) {
    navItems.push({ name: '系统配置', href: '/settings', icon: <FaCog size={18} style={{ marginRight: '10px' }} /> });
  }

  // 服务器端渲染默认导航
  if (!isClient) {
    return (
      <nav style={styles.nav} className="navbar">
        <div style={styles.container}>
          <div style={styles.flexBetween}>
            <div style={styles.flex}>
              <div style={styles.logoContainer}>
                <Link href="/" style={styles.logo}>
                  <FaWeixin size={28} style={styles.logoIcon} />
                  <span style={styles.logoText}>微信AI助手</span>
                </Link>
              </div>
              <div style={styles.desktopMenu}>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      ...styles.navItem,
                      ...(pathname === item.href ? styles.navItemActive : styles.navItemInactive),
                    }}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // 客户端渲染，响应式导航
  return (
    <nav style={styles.nav} className="navbar">
      <div style={styles.container}>
        <div style={styles.flexBetween}>
          <div style={styles.flex}>
            <div style={styles.logoContainer}>
              <Link href="/" style={styles.logo}>
                <FaWeixin size={28} style={styles.logoIcon} />
                <span style={styles.logoText}>微信AI助手</span>
              </Link>
            </div>
            <div style={{
              ...styles.desktopMenu,
              ...(isMobile ? styles.mobileMenuHidden : {})
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...styles.navItem,
                    ...(pathname === item.href ? styles.navItemActive : styles.navItemInactive),
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* 用户信息和登录状态 */}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            {isUserLoggedIn && username ? (
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div 
                  style={styles.userButton}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FaUser size={16} style={{ color: '#4b5563', marginRight: '10px' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 'medium', color: '#374151' }}>{username}</span>
                </div>
                
                {showUserMenu && (
                  <div style={styles.userMenu}>
                    <button
                      onClick={handleLogout}
                      style={styles.logoutButton}
                    >
                      <FaSignOutAlt size={16} style={{ marginRight: '10px' }} />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                style={styles.loginButton}
              >
                <FaSignInAlt size={16} style={{ marginRight: '10px' }} />
                登录
              </Link>
            )}
          </div>
          
          {/* 移动端菜单按钮 */}
          {isMobile && (
            <button
              type="button"
              style={{...styles.mobileMenuButton, marginLeft: '16px'}}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span style={styles.srOnly}>
                打开主菜单
              </span>
              {!isMobileMenuOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...styles.mobileNavItem,
                ...(pathname === item.href ? styles.mobileNavItemActive : styles.mobileNavItemInactive),
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {/* 移动端用户信息 */}
          {isUserLoggedIn && username ? (
            <>
              <div
                style={{
                  ...styles.mobileNavItem,
                  backgroundColor: '#f3f4f6',
                  margin: '8px 12px',
                  borderRadius: '6px',
                  padding: '12px 16px',
                }}
              >
                <FaUser size={18} style={{ marginRight: '12px' }} />
                {username}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  ...styles.mobileNavItem,
                  backgroundColor: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#dc2626',
                }}
              >
                <FaSignOutAlt size={18} style={{ marginRight: '12px' }} />
                退出登录
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                ...styles.mobileNavItem,
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                margin: '8px 12px',
                borderRadius: '6px',
                padding: '12px 16px',
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaSignInAlt size={18} style={{ marginRight: '12px' }} />
              登录
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}