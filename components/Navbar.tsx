'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaNewspaper, FaCog, FaWeixin, FaRobot } from 'react-icons/fa';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
    
    // 清理函数
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const navItems = [
    { name: '首页', href: '/', icon: <FaHome size={16} style={{ marginRight: '8px' }} /> },
    { name: 'AI助手', href: '/ai-chat', icon: <FaRobot size={16} style={{ marginRight: '8px' }} /> },
    { name: '推文管理', href: '/articles', icon: <FaNewspaper size={16} style={{ marginRight: '8px' }} /> },
    { name: '系统配置', href: '/settings', icon: <FaCog size={16} style={{ marginRight: '8px' }} /> },
  ];

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
          
          {/* Mobile menu button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
        </div>
      )}
    </nav>
  );
} 