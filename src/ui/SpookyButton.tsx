import React from 'react';

export interface SpookyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'cta';
  children: React.ReactNode;
}

/**
 * Spooky themed button with neon glowing borders and hover effects
 * 
 * @example
 * ```tsx
 * <SpookyButton variant="cta" onClick={handleClick}>
 *   Open Demo
 * </SpookyButton>
 * ```
 */
export const SpookyButton: React.FC<SpookyButtonProps> = ({ 
  variant = 'default', 
  children, 
  className = '',
  ...props 
}) => {
  const variantClasses = {
    default: 'spooky-button',
    primary: 'spooky-button-primary',
    cta: 'spooky-button-cta',
  };

  return (
    <button 
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
