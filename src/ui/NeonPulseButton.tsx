import React from 'react';
import { motion } from 'framer-motion';

export interface NeonPulseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'purple' | 'green' | 'neon' | 'orange';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Neon pulse button with glowing effect and scale animation on hover
 * 
 * @example
 * ```tsx
 * <NeonPulseButton variant="purple" onClick={handleClick}>
 *   Click Me
 * </NeonPulseButton>
 * ```
 */
export const NeonPulseButton: React.FC<NeonPulseButtonProps> = ({ 
  children,
  variant = 'purple',
  size = 'md',
  className = '',
  disabled,
  ...props 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const variantClasses = {
    purple: 'border-spooky-accent-purple text-spooky-accent-purple hover:bg-spooky-accent-purple hover:text-white shadow-[0_0_15px_rgba(156,77,204,0.5)] hover:shadow-[0_0_30px_rgba(156,77,204,0.8)]',
    green: 'border-spooky-accent-green text-spooky-accent-green hover:bg-spooky-accent-green hover:text-white shadow-[0_0_15px_rgba(102,187,106,0.5)] hover:shadow-[0_0_30px_rgba(102,187,106,0.8)]',
    neon: 'border-spooky-neon-accent text-spooky-neon-accent hover:bg-spooky-neon-accent hover:text-spooky-bg-primary shadow-[0_0_15px_rgba(212,225,87,0.5)] hover:shadow-[0_0_30px_rgba(212,225,87,0.8)]',
    orange: 'border-spooky-accent-orange text-spooky-accent-orange hover:bg-spooky-accent-orange hover:text-white shadow-[0_0_15px_rgba(255,140,66,0.5)] hover:shadow-[0_0_30px_rgba(255,140,66,0.8)]',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <div className="relative inline-block">
      {/* Skeletal finger pointer */}
      {!disabled && isHovered && (
        <motion.div
          className="absolute -left-12 top-1/2 -translate-y-1/2 text-3xl"
          initial={{ x: -10, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            rotate: [0, -5, 5, -5, 0],
          }}
          transition={{
            rotate: {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 1
            }
          }}
        >
          👉
        </motion.div>
      )}
      
      <motion.button
        className={`
          neon-pulse-button
          relative
          font-semibold
          border-2
          rounded-lg
          transition-all
          duration-300
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${variantClasses[variant as keyof typeof variantClasses]}
          ${sizeClasses[size]}
          ${disabled ? '' : 'animate-pulse-glow'}
          ${className}
        `}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isHovered && !disabled ? {
          x: [0, -2, 2, -2, 0],
        } : {}}
        transition={{
          x: {
            duration: 0.3,
            repeat: isHovered ? Infinity : 0,
            repeatDelay: 0.5
          }
        }}
        {...props}
      >
        {/* Glow effect layer */}
        {!disabled && (
          <span 
            className="absolute inset-0 rounded-lg blur-md opacity-50 -z-10"
            aria-hidden="true"
          />
        )}
        
        {/* Content */}
        <span className="relative z-10">
          {children}
        </span>
      </motion.button>
    </div>
  );
};
