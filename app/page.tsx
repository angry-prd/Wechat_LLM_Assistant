'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPen, FaRobot, FaWeixin } from 'react-icons/fa';

// 内联样式定义
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 16px',
  },
  header: {
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#6b7280',
    maxWidth: '800px',
    margin: '0 auto',
    marginBottom: '32px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '48px',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#2563eb',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    border: '1px solid #e5e7eb',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  featureCardHovered: {
    transform: 'scale(1.05)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 16px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: '50%',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  featureLink: {
    display: 'block',
    textAlign: 'center' as const,
    color: '#2563eb',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  banner: {
    backgroundColor: '#f0f9ff',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center' as const,
  },
  bannerTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  bannerText: {
    fontSize: '1.25rem',
    color: '#6b7280',
    maxWidth: '800px',
    margin: '0 auto',
  },
};

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const features = [
    {
      id: 1,
      title: 'AI文章生成',
      description: '利用AI大模型，快速生成高质量的文章内容',
      icon: <FaRobot size={24} color="#2563eb" />,
      link: '/ai-generator'
    },
    {
      id: 2,
      title: 'Markdown编辑',
      description: '使用Markdown编辑器，轻松美化文章排版',
      icon: <FaPen size={24} color="#10b981" />,
      link: '/editor'
    },
    {
      id: 3,
      title: '一键发布',
      description: '直接发布到微信公众号，省去繁琐的复制粘贴',
      icon: <FaWeixin size={24} color="#4f46e5" />,
      link: '/publish'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>欢迎使用微信公众号AI助手</h1>
        <p style={styles.subtitle}>
          一个集成了AI大模型和Markdown编辑器的微信公众号推文助手
        </p>
        <div style={styles.buttonContainer}>
          <Link href="/ai-generator" style={styles.primaryButton}>
            开始使用
          </Link>
        </div>
      </div>

      <div style={styles.featureGrid}>
        {features.map((feature) => (
          <Link 
            href={feature.link} 
            key={feature.id}
            style={{ textDecoration: 'none' }}
          >
            <div 
              style={{
                ...styles.featureCard,
                ...(isClient && hoveredCard === feature.id ? styles.featureCardHovered : {})
              }}
              onMouseEnter={() => isClient && setHoveredCard(feature.id)}
              onMouseLeave={() => isClient && setHoveredCard(null)}
            >
              <div style={styles.featureIcon}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>
                {feature.description}
              </p>
              <span style={styles.featureLink}>了解更多</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={styles.banner}>
        <h2 style={styles.bannerTitle}>提升您的公众号内容质量</h2>
        <p style={styles.bannerText}>
          使用我们的AI助手，轻松创建高质量的微信公众号文章
        </p>
      </div>
    </div>
  );
} 