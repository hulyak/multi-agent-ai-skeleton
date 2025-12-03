'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CrawlingSpiderProps {
  startX?: number;
  startY?: number;
  delay?: number;
}

/**
 * Animated spider that crawls across the screen
 */
export const CrawlingSpider: React.FC<CrawlingSpiderProps> = ({
  startX = 0,
  startY = 0,
  delay = 0
}) => {
  return (
    <motion.div
      className="fixed pointer-events-none z-40"
      initial={{ x: `${startX}vw`, y: `${startY}vh`, opacity: 0 }}
      animate={{
        x: [`${startX}vw`, `${100 - startX}vw`, `${startX}vw`],
        y: [`${startY}vh`, `${(startY + 30) % 100}vh`, `${startY}vh`],
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: 'linear'
      }}
    >
      <svg width="40" height="40" viewBox="0 0 100 100">
        {/* Spider body */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="15"
          ry="20"
          fill="#1a1a1a"
          stroke="rgba(171, 188, 4, 0.6)"
          strokeWidth="2"
          animate={{
            ry: [20, 18, 20],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        
        {/* Spider head */}
        <circle
          cx="50"
          cy="30"
          r="10"
          fill="#1a1a1a"
          stroke="rgba(171, 188, 4, 0.6)"
          strokeWidth="2"
        />

        {/* Eyes */}
        <circle cx="45" cy="28" r="2" fill="rgba(255, 0, 0, 0.8)" />
        <circle cx="55" cy="28" r="2" fill="rgba(255, 0, 0, 0.8)" />
        <circle cx="43" cy="32" r="1.5" fill="rgba(255, 0, 0, 0.6)" />
        <circle cx="57" cy="32" r="1.5" fill="rgba(255, 0, 0, 0.6)" />

        {/* Legs - Left side */}
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`left-${i}`}
            d={`M ${35 - i * 2} ${45 + i * 5} Q ${15 - i * 3} ${40 + i * 8} ${10 - i * 2} ${50 + i * 10}`}
            stroke="rgba(171, 188, 4, 0.8)"
            strokeWidth="2"
            fill="none"
            animate={{
              d: [
                `M ${35 - i * 2} ${45 + i * 5} Q ${15 - i * 3} ${40 + i * 8} ${10 - i * 2} ${50 + i * 10}`,
                `M ${35 - i * 2} ${45 + i * 5} Q ${15 - i * 3} ${45 + i * 8} ${10 - i * 2} ${55 + i * 10}`,
                `M ${35 - i * 2} ${45 + i * 5} Q ${15 - i * 3} ${40 + i * 8} ${10 - i * 2} ${50 + i * 10}`,
              ]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Legs - Right side */}
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`right-${i}`}
            d={`M ${65 + i * 2} ${45 + i * 5} Q ${85 + i * 3} ${40 + i * 8} ${90 + i * 2} ${50 + i * 10}`}
            stroke="rgba(171, 188, 4, 0.8)"
            strokeWidth="2"
            fill="none"
            animate={{
              d: [
                `M ${65 + i * 2} ${45 + i * 5} Q ${85 + i * 3} ${40 + i * 8} ${90 + i * 2} ${50 + i * 10}`,
                `M ${65 + i * 2} ${45 + i * 5} Q ${85 + i * 3} ${45 + i * 8} ${90 + i * 2} ${55 + i * 10}`,
                `M ${65 + i * 2} ${45 + i * 5} Q ${85 + i * 3} ${40 + i * 8} ${90 + i * 2} ${50 + i * 10}`,
              ]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Web thread */}
        <motion.line
          x1="50"
          y1="20"
          x2="50"
          y2="0"
          stroke="rgba(171, 188, 4, 0.3)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
};
