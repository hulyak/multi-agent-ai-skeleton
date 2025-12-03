'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FlyingBatsProps {
  frequency?: number; // How often bats appear (in seconds)
}

/**
 * Easter egg: Occasional flying bats across the screen
 */
export const FlyingBats: React.FC<FlyingBatsProps> = ({
  frequency = 30 // Default: every 30 seconds
}) => {
  const [bats, setBats] = useState<Array<{ id: number; startY: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to spawn a bat
      if (Math.random() < 0.7) {
        const newBat = {
          id: Date.now(),
          startY: Math.random() * 60 + 10 // Random Y position between 10-70%
        };
        setBats(prev => [...prev, newBat]);
        
        // Remove bat after animation completes
        setTimeout(() => {
          setBats(prev => prev.filter(b => b.id !== newBat.id));
        }, 5000);
      }
    }, frequency * 1000);

    return () => clearInterval(interval);
  }, [frequency]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {bats.map((bat) => (
          <motion.div
            key={bat.id}
            className="absolute text-4xl"
            style={{ top: `${bat.startY}%` }}
            initial={{ x: '-10%', opacity: 0 }}
            animate={{ 
              x: '110%', 
              opacity: [0, 1, 1, 0],
              y: [0, -20, -10, -30, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 5,
              ease: 'linear',
              y: {
                duration: 1,
                repeat: 4,
                ease: 'easeInOut'
              }
            }}
          >
            <motion.span
              animate={{
                scaleX: [1, 1.2, 1, 1.2, 1],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              🦇
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
