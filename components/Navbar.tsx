'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaNewspaper, FaCog, FaWeixin, FaRobot, FaBars, FaTimes } from 'react-icons/fa';

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
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // 检测屏幕宽度
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 如果在客户端渲染前，不显示导航栏
  if (!isClient) return null;

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { name: '首页', path: '/', icon: FaHome },
    { name: 'AI聊天', path: '/ai-chat', icon: FaRobot },
    { name: '推文管理', path: '/articles', icon: FaNewspaper },
    { name: '系统设置', path: '/settings', icon: FaCog },
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
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  style={{
                    ...styles.navItem,
                    ...(isActive(link.path) ? styles.navItemActive : styles.navItemInactive),
                  }}
                >
                  <span className="mr-2">
                    <link.icon />
                  </span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="flex items-center">
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
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                style={{
                  ...styles.mobileNavItem,
                  ...(isActive(link.path) ? styles.mobileNavItemActive : styles.mobileNavItemInactive),
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">
                  <link.icon />
                </span>
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}