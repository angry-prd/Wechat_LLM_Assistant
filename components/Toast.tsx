'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  visible: boolean;
}

const Toast = ({ message, type = 'success', duration = 3000, onClose, visible }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  // 根据类型设置不同的样式
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          borderColor: '#86efac',
          color: '#065f46'
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          borderColor: '#fca5a5',
          color: '#b91c1c'
        };
      case 'info':
        return {
          backgroundColor: '#eff6ff',
          borderColor: '#93c5fd',
          color: '#1e40af'
        };
      default:
        return {
          backgroundColor: '#d1fae5',
          borderColor: '#86efac',
          color: '#065f46'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const styles = {
    toast: {
      position: 'fixed' as const,
      bottom: '20px',
      left: '50%',
      transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
      padding: '12px 16px',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s, transform 0.3s',
      pointerEvents: isVisible ? 'auto' : 'none',
      ...typeStyles
    },
    message: {
      fontSize: '0.875rem',
      marginRight: '12px'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      padding: '0'
    }
  };

  if (!isVisible && !visible) return null;

  return (
    <div style={styles.toast as React.CSSProperties}>
      <span style={styles.message}>{message}</span>
      <button 
        style={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;