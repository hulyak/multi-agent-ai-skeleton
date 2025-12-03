'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface GhostlyPoofProps {
  onComplete?: () => void;
}

/**
 * Ghostly "poof" animation for action confirmations
 */
export const GhostlyPoof: React.FC<GhostlyPoofProps> = ({ onComplete }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    distance: 40 + Math.random() * 20
  }));

  return (
    <div className="relative w-24 h-24">
      {/* Central ghost */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-4xl"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
      >
        👻
      </motion.div>
      
      {/* Particle burst */}
      {particles.map((particle) => {
        const x = Math.cos((particle.angle * Math.PI) / 180) * particle.distance;
        const y = Math.sin((particle.angle * Math.PI) / 180) * particle.distance;
        
        return (
          <motion.div
            key={particle.id}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-spooky-neon-accent"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ 
              x, 
              y, 
              opacity: 0,
              scale: 0
            }}
            transition={{ 
              duration: 0.6, 
              ease: 'easeOut',
              delay: particle.id * 0.02
            }}
          />
        );
      })}
      
      {/* Expanding ring */}
      <motion.div
        className="absolute inset-0 border-2 border-spooky-neon-accent rounded-full"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: 'radial-gradient(circle, rgba(212,225,87,0.6) 0%, transparent 70%)',
        }}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
};
