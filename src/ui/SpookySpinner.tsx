import React from 'react';

export interface SpookySpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Spooky themed loading spinner with skull shape
 * 
 * @example
 * ```tsx
 * <SpookySpinner size="lg" />
 * ```
 */
export const SpookySpinner: React.FC<SpookySpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`spooky-spinner ${sizeClasses[size]} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
