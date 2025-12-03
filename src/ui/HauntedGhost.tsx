'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface HauntedGhostProps {
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated floating ghost with eerie movements
 */
export const HauntedGhost: React.FC<HauntedGhostProps> = ({
  delay = 0,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-20',
    lg: 'w-20 h-24'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
    >
      {/* Ghost body */}
      <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_15px_rgba(171,188,4,0.6)]">
        {/* Main ghost shape */}
        <motion.path
          d="M50 10 C30 10, 20 25, 20 45 L20 100 L30 95 L35 100 L40 95 L45 100 L50 95 L55 100 L60 95 L65 100 L70 95 L80 100 L80 45 C80 25, 70 10, 50 10 Z"
          fill="rgba(171, 188, 4, 0.3)"
          stroke="rgba(171, 188, 4, 0.8)"
          strokeWidth="2"
          animate={{
            d: [
              "M50 10 C30 10, 20 25, 20 45 L20 100 L30 95 L35 100 L40 95 L45 100 L50 95 L55 100 L60 95 L65 100 L70 95 L80 100 L80 45 C80 25, 70 10, 50 10 Z",
              "M50 10 C30 10, 20 25, 20 45 L20 100 L30 100 L35 95 L40 100 L45 95 L50 100 L55 95 L60 100 L65 95 L70 100 L80 95 L80 45 C80 25, 70 10, 50 10 Z",
              "M50 10 C30 10, 20 25, 20 45 L20 100 L30 95 L35 100 L40 95 L45 100 L50 95 L55 100 L60 95 L65 100 L70 95 L80 100 L80 45 C80 25, 70 10, 50 10 Z"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        
        {/* Eyes */}
        <motion.circle
          cx="38"
          cy="40"
          r="5"
          fill="#0a0a0a"
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
        <motion.circle
          cx="62"
          cy="40"
          r="5"
          fill="#0a0a0a"
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
        
        {/* Mouth */}
        <motion.ellipse
          cx="50"
          cy="60"
          rx="8"
          ry="12"
          fill="#0a0a0a"
          animate={{
            ry: [12, 8, 12],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </svg>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(circle, rgba(171,188,4,0.4) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};
