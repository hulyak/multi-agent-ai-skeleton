'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Graveyard scene with tombstones and crosses
 */
export const GraveyardScene: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 pointer-events-none z-10">
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-spooky-bg-tertiary to-transparent" />
      
      {/* Tombstones */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around items-end px-8">
        {/* Tombstone 1 */}
        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80">
            <path
              d="M10 80 L10 30 Q10 10, 30 10 Q50 10, 50 30 L50 80 Z"
              fill="rgba(42, 42, 42, 0.9)"
              stroke="rgba(171, 188, 4, 0.3)"
              strokeWidth="2"
            />
            <text x="30" y="45" textAnchor="middle" fill="rgba(171, 188, 4, 0.6)" fontSize="12" fontFamily="serif">
              RIP
            </text>
            <line x1="20" y1="55" x2="40" y2="55" stroke="rgba(171, 188, 4, 0.4)" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* Cross 1 */}
        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <svg width="50" height="90" viewBox="0 0 50 90">
            <rect x="22" y="10" width="6" height="70" fill="rgba(42, 42, 42, 0.9)" stroke="rgba(171, 188, 4, 0.3)" strokeWidth="2" />
            <rect x="10" y="25" width="30" height="6" fill="rgba(42, 42, 42, 0.9)" stroke="rgba(171, 188, 4, 0.3)" strokeWidth="2" />
          </svg>
        </motion.div>

        {/* Tombstone 2 */}
        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <svg width="70" height="90" viewBox="0 0 70 90">
            <path
              d="M15 90 L15 25 L35 10 L55 25 L55 90 Z"
              fill="rgba(42, 42, 42, 0.9)"
              stroke="rgba(171, 188, 4, 0.3)"
              strokeWidth="2"
            />
            <circle cx="35" cy="45" r="8" fill="none" stroke="rgba(171, 188, 4, 0.5)" strokeWidth="2" />
            <line x1="35" y1="37" x2="35" y2="53" stroke="rgba(171, 188, 4, 0.5)" strokeWidth="2" />
            <line x1="27" y1="45" x2="43" y2="45" stroke="rgba(171, 188, 4, 0.5)" strokeWidth="2" />
          </svg>
        </motion.div>

        {/* Cross 2 */}
        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <svg width="45" height="85" viewBox="0 0 45 85">
            <rect x="20" y="8" width="5" height="65" fill="rgba(42, 42, 42, 0.9)" stroke="rgba(171, 188, 4, 0.3)" strokeWidth="2" />
            <rect x="8" y="22" width="29" height="5" fill="rgba(42, 42, 42, 0.9)" stroke="rgba(171, 188, 4, 0.3)" strokeWidth="2" />
          </svg>
        </motion.div>

        {/* Tombstone 3 */}
        <motion.div
          className="relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <svg width="65" height="85" viewBox="0 0 65 85">
            <rect x="10" y="20" width="45" height="65" rx="5" fill="rgba(42, 42, 42, 0.9)" stroke="rgba(171, 188, 4, 0.3)" strokeWidth="2" />
            <circle cx="32.5" cy="10" r="10" fill="rgba(42, 42, 42, 0.9)" stroke="rgba(171, 188, 4, 0.3)" strokeWidth="2" />
            <text x="32.5" y="50" textAnchor="middle" fill="rgba(171, 188, 4, 0.6)" fontSize="10" fontFamily="serif">
              REST
            </text>
            <text x="32.5" y="62" textAnchor="middle" fill="rgba(171, 188, 4, 0.6)" fontSize="10" fontFamily="serif">
              IN
            </text>
            <text x="32.5" y="74" textAnchor="middle" fill="rgba(171, 188, 4, 0.6)" fontSize="10" fontFamily="serif">
              PEACE
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Grass/weeds */}
      <div className="absolute bottom-0 left-0 right-0 h-8">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-1 bg-gradient-to-t from-spooky-accent-green/40 to-transparent"
            style={{
              left: `${i * 5}%`,
              height: `${Math.random() * 20 + 10}px`,
            }}
            animate={{
              scaleY: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  );
};
