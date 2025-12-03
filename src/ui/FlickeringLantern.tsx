'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface FlickeringLanternProps {
  className?: string;
}

/**
 * Animated flickering lantern icon
 */
export const FlickeringLantern: React.FC<FlickeringLanternProps> = ({
  className = ''
}) => {
  return (
    <div className={`inline-block relative ${className}`}>
      <motion.svg
        width="40"
        height="60"
        viewBox="0 0 40 60"
        className="w-full h-full"
      >
        {/* Lantern body */}
        <path
          d="M 15 10 L 15 15 Q 10 20, 10 30 L 10 45 Q 10 50, 15 50 L 25 50 Q 30 50, 30 45 L 30 30 Q 30 20, 25 15 L 25 10 Z"
          fill="currentColor"
          className="text-spooky-accent-orange"
          opacity="0.8"
        />
        
        {/* Lantern top */}
        <rect x="12" y="5" width="16" height="5" rx="2" fill="currentColor" className="text-spooky-text-muted" />
        
        {/* Lantern bottom */}
        <rect x="12" y="50" width="16" height="3" rx="1" fill="currentColor" className="text-spooky-text-muted" />
        
        {/* Handle */}
        <path
          d="M 15 5 Q 20 0, 25 5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-spooky-text-muted"
        />
        
        {/* Flame with flicker animation */}
        <motion.g
          animate={{
            y: [0, -2, 0, -1, 0],
            opacity: [0.8, 1, 0.9, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <ellipse
            cx="20"
            cy="30"
            rx="4"
            ry="8"
            fill="currentColor"
            className="text-spooky-neon-accent"
          />
          <ellipse
            cx="20"
            cy="28"
            rx="2"
            ry="4"
            fill="currentColor"
            className="text-yellow-200"
          />
        </motion.g>
        
        {/* Glow effect */}
        <motion.ellipse
          cx="20"
          cy="30"
          rx="8"
          ry="12"
          fill="currentColor"
          className="text-spooky-neon-accent"
          opacity="0.3"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.svg>
      
      {/* Light rays */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(circle, rgba(212,225,87,0.3) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};
