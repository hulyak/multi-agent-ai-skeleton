'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Animated skeleton hand that follows the cursor
 */
export const SkeletonCursor: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none z-[9999] mix-blend-screen"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <svg
            width="60"
            height="80"
            viewBox="0 0 60 80"
            className="drop-shadow-[0_0_10px_rgba(171,188,4,0.8)]"
            style={{
              transform: `translate(-30px, -10px) ${isClicking ? 'scale(0.9)' : 'scale(1)'}`,
              transition: 'transform 0.1s'
            }}
          >
            {/* Palm */}
            <motion.path
              d="M20 30 L20 60 L40 60 L40 30 Z"
              fill="rgba(171, 188, 4, 0.6)"
              stroke="rgba(171, 188, 4, 1)"
              strokeWidth="1.5"
              animate={{
                d: isClicking
                  ? "M20 30 L20 55 L40 55 L40 30 Z"
                  : "M20 30 L20 60 L40 60 L40 30 Z"
              }}
            />

            {/* Thumb */}
            <motion.path
              d="M20 40 L10 35 L10 50 L20 50 Z"
              fill="rgba(171, 188, 4, 0.6)"
              stroke="rgba(171, 188, 4, 1)"
              strokeWidth="1.5"
              animate={{
                d: isClicking
                  ? "M20 40 L12 38 L12 48 L20 48 Z"
                  : "M20 40 L10 35 L10 50 L20 50 Z"
              }}
            />

            {/* Index Finger */}
            <motion.path
              d="M22 30 L22 10 L28 10 L28 30 Z"
              fill="rgba(171, 188, 4, 0.6)"
              stroke="rgba(171, 188, 4, 1)"
              strokeWidth="1.5"
              animate={{
                d: isClicking
                  ? "M22 30 L22 15 L28 15 L28 30 Z"
                  : "M22 30 L22 10 L28 10 L28 30 Z"
              }}
            />

            {/* Middle Finger */}
            <motion.path
              d="M29 30 L29 5 L35 5 L35 30 Z"
              fill="rgba(171, 188, 4, 0.6)"
              stroke="rgba(171, 188, 4, 1)"
              strokeWidth="1.5"
              animate={{
                d: isClicking
                  ? "M29 30 L29 12 L35 12 L35 30 Z"
                  : "M29 30 L29 5 L35 5 L35 30 Z"
              }}
            />

            {/* Ring Finger */}
            <motion.path
              d="M36 30 L36 8 L42 8 L42 30 Z"
              fill="rgba(171, 188, 4, 0.6)"
              stroke="rgba(171, 188, 4, 1)"
              strokeWidth="1.5"
              animate={{
                d: isClicking
                  ? "M36 30 L36 14 L42 14 L42 30 Z"
                  : "M36 30 L36 8 L42 8 L42 30 Z"
              }}
            />

            {/* Pinky */}
            <motion.path
              d="M43 30 L43 12 L48 12 L48 30 Z"
              fill="rgba(171, 188, 4, 0.6)"
              stroke="rgba(171, 188, 4, 1)"
              strokeWidth="1.5"
              animate={{
                d: isClicking
                  ? "M43 30 L43 18 L48 18 L48 30 Z"
                  : "M43 30 L43 12 L48 12 L48 30 Z"
              }}
            />

            {/* Wrist bones */}
            <circle cx="25" cy="65" r="2" fill="rgba(171, 188, 4, 0.8)" />
            <circle cx="30" cy="66" r="2" fill="rgba(171, 188, 4, 0.8)" />
            <circle cx="35" cy="65" r="2" fill="rgba(171, 188, 4, 0.8)" />

            {/* Finger joints */}
            <circle cx="25" cy="20" r="1.5" fill="rgba(171, 188, 4, 1)" />
            <circle cx="32" cy="17" r="1.5" fill="rgba(171, 188, 4, 1)" />
            <circle cx="39" cy="19" r="1.5" fill="rgba(171, 188, 4, 1)" />
            <circle cx="45.5" cy="21" r="1.5" fill="rgba(171, 188, 4, 1)" />
          </svg>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(171,188,4,0.4) 0%, transparent 70%)',
            }}
            animate={{
              scale: isClicking ? 1.5 : 1,
              opacity: isClicking ? 0.8 : 0.4,
            }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
