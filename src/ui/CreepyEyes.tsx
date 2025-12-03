'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export interface CreepyEyesProps {
  count?: number;
}

/**
 * Creepy eyes that follow the cursor and blink
 */
export const CreepyEyes: React.FC<CreepyEyesProps> = ({ count = 5 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyes] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {eyes.map((eye) => (
        <EyePair
          key={eye.id}
          x={eye.x}
          y={eye.y}
          mousePos={mousePos}
          delay={eye.delay}
        />
      ))}
    </div>
  );
};

interface EyePairProps {
  x: number;
  y: number;
  mousePos: { x: number; y: number };
  delay: number;
}

const EyePair: React.FC<EyePairProps> = ({ x, y, mousePos, delay }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  const calculatePupilPosition = (eyeX: number, eyeY: number) => {
    const angle = Math.atan2(mousePos.y - eyeY, mousePos.x - eyeX);
    const distance = Math.min(3, Math.hypot(mousePos.x - eyeX, mousePos.y - eyeY) / 100);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  const leftPupil = calculatePupilPosition(x, y);
  const rightPupil = calculatePupilPosition(x + 30, y);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0.8, 0] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        times: [0, 0.1, 0.9, 1]
      }}
    >
      <div className="flex gap-3">
        {/* Left Eye */}
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-spooky-neon-accent rounded-full opacity-20 blur-md" />
          <div className="absolute inset-1 bg-white rounded-full">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scaleY: isBlinking ? 0.1 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="w-3 h-3 bg-red-600 rounded-full"
                animate={{
                  x: leftPupil.x,
                  y: leftPupil.y,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-1" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Eye */}
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-spooky-neon-accent rounded-full opacity-20 blur-md" />
          <div className="absolute inset-1 bg-white rounded-full">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scaleY: isBlinking ? 0.1 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="w-3 h-3 bg-red-600 rounded-full"
                animate={{
                  x: rightPupil.x,
                  y: rightPupil.y,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-1" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
