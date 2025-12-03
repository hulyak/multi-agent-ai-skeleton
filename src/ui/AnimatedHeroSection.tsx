'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface AnimatedHeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/**
 * Animated hero section with flickering candlelight glow, floating ghosts, and skull particles
 */
export const AnimatedHeroSection: React.FC<AnimatedHeroSectionProps> = ({
  title,
  subtitle,
  children
}) => {
  // Generate floating skull particles
  const skullParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Floating skull particles */}
      <div className="absolute inset-0 pointer-events-none">
        {skullParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut'
            }}
          >
            💀
          </motion.div>
        ))}
      </div>

      {/* Drifting ghost shapes */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ghost-${i}`}
          className="absolute w-32 h-40 opacity-10"
          style={{
            left: `${i * 30}%`,
            top: `${20 + i * 20}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2
          }}
        >
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <path
              d="M50 10 C30 10, 20 25, 20 45 L20 100 L30 95 L35 100 L40 95 L45 100 L50 95 L55 100 L60 95 L65 100 L70 95 L80 100 L80 45 C80 25, 70 10, 50 10 Z"
              fill="currentColor"
              className="text-spooky-neon-accent"
            />
          </svg>
        </motion.div>
      ))}

      {/* Parallax floating bones */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`bone-${i}`}
          className="absolute text-4xl opacity-20"
          style={{
            left: `${i * 20}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            x: [0, 200, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'linear',
            delay: i
          }}
        >
          🦴
        </motion.div>
      ))}

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        {/* Title with flickering candlelight glow */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-gothic mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.span
            className="inline-block bg-gradient-to-r from-spooky-accent-purple via-spooky-neon-accent to-spooky-accent-green bg-clip-text text-transparent"
            animate={{
              textShadow: [
                '0 0 20px rgba(212, 225, 87, 0.5), 0 0 40px rgba(156, 77, 204, 0.3)',
                '0 0 30px rgba(212, 225, 87, 0.8), 0 0 60px rgba(156, 77, 204, 0.5)',
                '0 0 20px rgba(212, 225, 87, 0.5), 0 0 40px rgba(156, 77, 204, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {title}
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="text-xl md:text-2xl text-spooky-text-secondary mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Children content */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
};
