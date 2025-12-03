'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Haunted background with moving shadows and fog
 */
export const HauntedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Moving fog layers */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(106, 27, 154, 0.4) 0%, transparent 50%)',
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, rgba(56, 142, 60, 0.4) 0%, transparent 50%)',
        }}
        animate={{
          x: ['10%', '-10%', '10%'],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5
        }}
      />

      {/* Creepy vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-60" />
      
      {/* Flickering shadows */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-64 bg-black/30 blur-3xl"
          style={{
            left: `${i * 25}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5
          }}
        />
      ))}

      {/* Eerie light rays */}
      <motion.div
        className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-spooky-neon-accent/20 to-transparent"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleX: [1, 1.5, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-spooky-accent-purple/20 to-transparent"
        animate={{
          opacity: [0.5, 0.2, 0.5],
          scaleX: [1.5, 1, 1.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      />
    </div>
  );
};
