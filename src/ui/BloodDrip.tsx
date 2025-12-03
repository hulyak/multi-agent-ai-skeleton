'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface BloodDripProps {
  count?: number;
}

/**
 * Blood dripping effect at the top of the screen
 */
export const BloodDrip: React.FC<BloodDripProps> = ({ count = 8 }) => {
  const drips = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i / count) * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2
  }));

  return (
    <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-30 overflow-hidden">
      {drips.map((drip) => (
        <motion.div
          key={drip.id}
          className="absolute"
          style={{ left: `${drip.x}%` }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: [0, 100, 100],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: drip.duration,
            repeat: Infinity,
            delay: drip.delay,
            ease: 'easeIn'
          }}
        >
          <svg width="20" height="120" viewBox="0 0 20 120">
            {/* Drip shape */}
            <defs>
              <linearGradient id={`blood-gradient-${drip.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(139, 0, 0, 0.9)" />
                <stop offset="100%" stopColor="rgba(139, 0, 0, 0.6)" />
              </linearGradient>
            </defs>
            
            <motion.path
              d="M10 0 L10 80 Q10 90, 10 95 Q10 100, 15 100 Q10 105, 10 110 Q10 105, 5 100 Q10 100, 10 95 Q10 90, 10 80 Z"
              fill={`url(#blood-gradient-${drip.id})`}
              animate={{
                d: [
                  "M10 0 L10 80 Q10 90, 10 95 Q10 100, 15 100 Q10 105, 10 110 Q10 105, 5 100 Q10 100, 10 95 Q10 90, 10 80 Z",
                  "M10 0 L10 85 Q10 92, 10 96 Q10 100, 14 100 Q10 104, 10 108 Q10 104, 6 100 Q10 100, 10 96 Q10 92, 10 85 Z",
                  "M10 0 L10 80 Q10 90, 10 95 Q10 100, 15 100 Q10 105, 10 110 Q10 105, 5 100 Q10 100, 10 95 Q10 90, 10 80 Z"
                ]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Drip highlight */}
            <motion.ellipse
              cx="8"
              cy="20"
              rx="2"
              ry="4"
              fill="rgba(255, 255, 255, 0.2)"
              animate={{
                cy: [20, 90],
                opacity: [0.3, 0]
              }}
              transition={{
                duration: drip.duration,
                repeat: Infinity,
                delay: drip.delay,
                ease: 'easeIn'
              }}
            />
          </svg>
        </motion.div>
      ))}
      
      {/* Blood pool at top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-red-900/80 to-transparent" />
    </div>
  );
};
