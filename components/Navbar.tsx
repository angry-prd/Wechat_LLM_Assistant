'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaNewspaper, FaCog, FaWeixin, FaRobot, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

// 内联样式定义
const styles = {
  nav: {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
  },
  flex: {
    display: 'flex',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2563eb',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
  logoIcon: {
    marginRight: '8px',
  },
  logoText: {
    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  desktopMenu: {
    display: 'flex',
    marginLeft: '24px',
    alignItems: 'center',
  },
  mobileMenuHidden: {
    display: 'none',
  },
  navItem: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 12px',
    fontSize: '0.875rem',
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
    padding: '8px 0 12px 0',
  },
  mobileNavItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
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
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<{username: string; phone: string} | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUsername = localStorage.getItem('username');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUsername(parsedUser.username);
      } catch (e) {
        console.error('解析用户数据失败', e);
        localStorage.removeItem('user');
      }
    } else if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  
  // 检查当前路径是否匹配
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  // 切换移动菜单
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    // 标记客户端渲染已完成
    setIsClient(true);
    
    // 在客户端检测窗口大小
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // 初始检测
    checkIfMobile();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', checkIfMobile);
    
    // 检查用户登录状态
    const checkLoginStatus = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('解析用户数据失败', e);
          localStorage.removeItem('user');
        }
      }
    };
    
    checkLoginStatus();
    
    // 清理函数
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    setUser(null);
    setUsername(null);
    router.push('/');
  };

  // 根据登录状态动态生成导航项
  const navItems = [
    { name: '首页', href: '/', icon: <FaHome size={16} style={{ marginRight: '8px' }} /> },
    { name: 'AI助手', href: '/ai-chat', icon: <FaRobot size={16} style={{ marginRight: '8px' }} /> },
    { name: '推文管理', href: '/articles', icon: <FaNewspaper size={16} style={{ marginRight: '8px' }} /> },
  ];
  
  // 只有登录用户才能看到系统配置选项
  if (status === 'authenticated' || (isClient && username)) {
    navItems.push({ name: '系统配置', href: '/settings', icon: <FaCog size={16} style={{ marginRight: '8px' }} /> });
  }

  // 在服务器端渲染时，显示默认的桌面导航
  if (!isClient) {
    return (
      <nav style={styles.nav}>
        <div style={styles.container}>
          <div style={styles.flexBetween}>
            <div style={styles.flex}>
              <div style={styles.logoContainer}>
                <Link href="/" style={styles.logo}>
                  <FaWeixin size={24} style={styles.logoIcon} />
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

  // 客户端渲染，包含响应式导航
  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.flexBetween}>
          <div style={styles.flex}>
            <div style={styles.logoContainer}>
              <Link href="/" style={styles.logo}>
                <FaWeixin size={24} style={styles.logoIcon} />
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
          
          {/* 用户信息和退出按钮 */}
          {username ? (
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '4px 12px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUser size={14} style={{ color: '#4b5563', marginRight: '8px' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 'medium', color: '#374151' }}>{username}</span>
              </div>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 50,
                  width: '150px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <FaSignOutAlt size={14} style={{ marginRight: '8px' }} />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Mobile menu button */}
          {isMobile && (
            <button
              type="button"
              style={styles.mobileMenuButton}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span style={styles.srOnly}>
                打开主菜单
              </span>
              {/* Icon when menu is closed */}
              {!isMobileMenuOpen && (
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
              )}
              {/* Icon when menu is open */}
              {isMobileMenuOpen && (
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

      {/* Mobile menu */}
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
          {username ? (
            <>
              <div
                style={{
                  ...styles.mobileNavItem,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <FaUser size={16} style={{ marginRight: '8px' }} />
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
                <FaSignOutAlt size={16} style={{ marginRight: '8px' }} />
                退出登录
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                ...styles.mobileNavItem,
                ...(pathname === '/login' ? styles.mobileNavItemActive : styles.mobileNavItemInactive),
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaUser size={16} style={{ marginRight: '8px' }} />
              登录
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}