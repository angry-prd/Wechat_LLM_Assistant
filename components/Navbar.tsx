'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaNewspaper, FaCog, FaWeixin, FaRobot, FaUser, FaSignOutAlt, FaSignInAlt, FaBars, FaTimes } from 'react-icons/fa';
import { signIn, signOut, useSession } from 'next-auth/react';
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
  
  // 将useSession()替换为本地状态管理
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 检查localStorage中是否有用户信息
    const checkUserState = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setSession({ user });
          setStatus('authenticated');
          setUsername(user.username);
          setIsUserLoggedIn(true);
        } catch (e) {
          console.error('无法解析用户数据', e);
          setSession(null);
          setStatus('unauthenticated');
          setUsername(null);
          setIsUserLoggedIn(false);
        }
      } else {
        setSession(null);
        setStatus('unauthenticated');
        setUsername(null);
        setIsUserLoggedIn(false);
      }
    };
    
    checkUserState();
    
    // 检测屏幕宽度
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', checkUserState);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', checkUserState);
    };
  }, []);

  // 模拟登出功能
  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    setSession(null);
    setStatus('unauthenticated');
    setUsername(null);
    setIsUserLoggedIn(false);
    setShowUserMenu(false);
    router.push('/');
  };

  // 模拟登录功能
  const handleSignIn = () => {
    localStorage.setItem('redirectUrl', pathname);
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 如果在客户端渲染前，不显示导航栏
  if (!isClient) return null;

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { name: '首页', path: '/' },
    { name: 'AI聊天', path: '/ai-chat' },
    { name: '文章管理', path: '/articles' },
    { name: '设置', path: '/settings' },
  ];

  return (
    <nav style={styles.nav} className="navbar">
      <div style={styles.container}>
        <div style={styles.flexBetween}>
          <div style={styles.flex}>
            <div style={styles.logoContainer}>
              <Link href="/" style={styles.logo}>
                <span style={styles.logoIcon}>
                  <FaWeixin size={24} />
                </span>
                <span style={styles.logoText}>微信AI助手</span>
              </Link>
            </div>
            
            {/* 桌面导航菜单 */}
            <div
              style={{
                ...styles.desktopMenu,
                display: isClient && !isMobile ? 'flex' : 'none',
              }}
            >
              <Link
                href="/"
                style={{
                  ...styles.navItem,
                  ...(isActive('/') ? styles.navItemActive : styles.navItemInactive),
                }}
              >
                <span className="mr-2">
                  <FaHome />
                </span>
                首页
              </Link>
              <Link
                href="/ai-chat"
                style={{
                  ...styles.navItem,
                  ...(isActive('/ai-chat')
                    ? styles.navItemActive
                    : styles.navItemInactive),
                }}
              >
                <span className="mr-2">
                  <FaRobot />
                </span>
                AI聊天
              </Link>
              <Link
                href="/editor"
                style={{
                  ...styles.navItem,
                  ...(isActive('/editor')
                    ? styles.navItemActive
                    : styles.navItemInactive),
                }}
              >
                <span className="mr-2">
                  <FaNewspaper />
                </span>
                编辑器
              </Link>
              <Link
                href="/publish"
                style={{
                  ...styles.navItem,
                  ...(isActive('/publish')
                    ? styles.navItemActive
                    : styles.navItemInactive),
                }}
              >
                <span className="mr-2">
                  <FaWeixin />
                </span>
                发布
              </Link>
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="flex items-center">
            {isClient && !isUserLoggedIn ? (
              <Link href="/login" style={styles.loginButton}>
                <span className="mr-2">
                  <FaSignInAlt />
                </span>
                登录
              </Link>
            ) : status !== 'loading' ? (
              <div className="relative">
                <button
                  style={styles.userButton}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="mr-2">
                    <FaUser />
                  </span>
                  {username || '用户'}
                </button>

                {showUserMenu && (
                  <div style={styles.userMenu}>
                    <Link
                      href="/settings"
                      className="flex items-center w-full py-3 px-4 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-2">
                        <FaCog />
                      </span>
                      设置
                    </Link>
                    <button 
                      style={styles.logoutButton}
                      onClick={handleSignOut}
                    >
                      <span className="mr-2">
                        <FaSignOutAlt />
                      </span>
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {isClient && isMobile && (
              <button
                style={styles.mobileMenuButton}
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
              >
                {isMobileMenuOpen ? (
                  <span>
                    <FaTimes size={24} />
                  </span>
                ) : (
                  <span>
                    <FaBars size={24} />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isClient && isMobile && isMobileMenuOpen && (
          <div style={styles.mobileMenu}>
            <Link
              href="/"
              style={{
                ...styles.mobileNavItem,
                ...(isActive('/') ? styles.mobileNavItemActive : styles.mobileNavItemInactive),
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">
                <FaHome />
              </span>
              首页
            </Link>
            <Link
              href="/ai-chat"
              style={{
                ...styles.mobileNavItem,
                ...(isActive('/ai-chat')
                  ? styles.mobileNavItemActive
                  : styles.mobileNavItemInactive),
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">
                <FaRobot />
              </span>
              AI聊天
            </Link>
            <Link
              href="/editor"
              style={{
                ...styles.mobileNavItem,
                ...(isActive('/editor')
                  ? styles.mobileNavItemActive
                  : styles.mobileNavItemInactive),
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">
                <FaNewspaper />
              </span>
              编辑器
            </Link>
            <Link
              href="/publish"
              style={{
                ...styles.mobileNavItem,
                ...(isActive('/publish')
                  ? styles.mobileNavItemActive
                  : styles.mobileNavItemInactive),
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="mr-3">
                <FaWeixin />
              </span>
              发布
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}