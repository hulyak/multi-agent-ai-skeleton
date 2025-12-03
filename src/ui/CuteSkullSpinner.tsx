'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CuteSkullSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Cute spinning skull loader with glowing eye sockets
 */
export const CuteSkullSpinner: React.FC<CuteSkullSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        {/* Skull shape */}
        <ellipse
          cx="50"
          cy="45"
          rx="30"
          ry="35"
          fill="currentColor"
          className="text-spooky-text-primary"
        />
        
        {/* Jaw */}
        <path
          d="M 30 65 Q 50 75, 70 65"
          fill="currentColor"
          className="text-spooky-text-primary"
        />
        
        {/* Eye sockets with glow animation */}
        <motion.ellipse
          cx="38"
          cy="40"
          rx="6"
          ry="8"
          fill="currentColor"
          className="text-spooky-neon-accent"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.ellipse
          cx="62"
          cy="40"
          rx="6"
          ry="8"
          fill="currentColor"
          className="text-spooky-neon-accent"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.75
          }}
        />
        
        {/* Nose */}
        <path
          d="M 45 50 L 50 55 L 55 50 Z"
          fill="currentColor"
          className="text-spooky-bg-primary"
        />
        
        {/* Teeth */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={35 + i * 8}
            y="68"
            width="5"
            height="6"
            fill="currentColor"
            className="text-spooky-bg-primary"
          />
        ))}
      </motion.svg>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(circle, rgba(212,225,87,0.4) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};
