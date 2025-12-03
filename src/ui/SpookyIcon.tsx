import React from 'react';

export interface SpookyIconProps {
  type: 'skull' | 'bones' | 'lantern';
  active?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Spooky themed icons for agents and status indicators
 * 
 * @example
 * ```tsx
 * <SpookyIcon type="skull" active size="md" />
 * <SpookyIcon type="lantern" active />
 * ```
 */
export const SpookyIcon: React.FC<SpookyIconProps> = ({ 
  type, 
  active = false, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const baseClass = `spooky-icon-${type} ${active ? 'spooky-icon-active' : ''} ${sizeClasses[size]} ${className}`;

  if (type === 'skull') {
    return (
      <svg 
        className={baseClass}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2C7.58 2 4 5.58 4 10c0 2.5 1.5 5 3 6.5v3.5c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3.5c1.5-1.5 3-4 3-6.5 0-4.42-3.58-8-8-8z" 
          fill="currentColor"
          opacity="0.8"
        />
        <circle cx="9" cy="10" r="1.5" fill="#abbc04" />
        <circle cx="15" cy="10" r="1.5" fill="#abbc04" />
        <path 
          d="M12 14c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z" 
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (type === 'bones') {
    return (
      <svg 
        className={baseClass}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M4 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm16 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM4 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm16 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" 
          fill="currentColor"
          opacity="0.8"
        />
        <path 
          d="M5 6l14 12M19 6L5 18" 
          stroke="currentColor" 
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>
    );
  }

  if (type === 'lantern') {
    return (
      <svg 
        className={baseClass}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2v2M8 6h8l1 2v8l-1 2H8l-1-2V8l1-2z" 
          stroke="currentColor" 
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />
        <circle 
          cx="12" 
          cy="12" 
          r="3" 
          fill="#abbc04"
          opacity={active ? '0.8' : '0.3'}
        />
        <path 
          d="M12 20v2" 
          stroke="currentColor" 
          strokeWidth="2"
        />
      </svg>
    );
  }

  return null;
};
