import React from 'react';

export interface SpookyCardProps {
  children: React.ReactNode;
  className?: string;
  fog?: boolean;
}

/**
 * Spooky themed card with bone texture and glow effects
 * 
 * @example
 * ```tsx
 * <SpookyCard fog>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </SpookyCard>
 * ```
 */
export const SpookyCard: React.FC<SpookyCardProps> = ({ 
  children, 
  className = '',
  fog = false 
}) => {
  return (
    <div className={`spooky-card ${fog ? 'spooky-fog' : ''} ${className}`}>
      {children}
    </div>
  );
};
