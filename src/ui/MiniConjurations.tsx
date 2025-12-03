'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface MiniConjurationsProps {
  className?: string;
}

/**
 * Mini Conjurations - Animated cards showing skeleton capabilities
 * 
 * @example
 * ```tsx
 * <MiniConjurations />
 * ```
 */
export const MiniConjurations: React.FC<MiniConjurationsProps> = ({
  className = ''
}) => {
  return (
    <div className={`mini-conjurations grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {/* Auto-routing spell */}
      <motion.div
        className="conjuration-card bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02, borderColor: '#6a1b9a' }}
      >
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-spooky-accent-purple mb-3">
            ⚡ Auto-Routing Spell
          </h3>
          <p className="text-sm text-spooky-text-secondary mb-4">
            Messages flow intelligently between agents
          </p>
          
          {/* Animated message orbs */}
          <div className="relative h-24 flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-spooky-accent-purple/30 border border-spooky-accent-purple flex items-center justify-center">
                <span className="text-xs">A</span>
              </div>
              <span className="text-xs mt-1">Agent 1</span>
            </div>
            
            {/* Animated orb */}
            <motion.div
              className="absolute left-1/4 w-4 h-4 rounded-full bg-spooky-neon-accent"
              style={{ filter: 'drop-shadow(0 0 8px #abbc04)' }}
              animate={{
                x: [0, 100, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-spooky-accent-green/30 border border-spooky-accent-green flex items-center justify-center">
                <span className="text-xs">B</span>
              </div>
              <span className="text-xs mt-1">Agent 2</span>
            </div>
          </div>
        </div>
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-spooky-accent-purple/5 to-transparent pointer-events-none" />
      </motion.div>
      
      {/* Spec summoner */}
      <motion.div
        className="conjuration-card bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.02, borderColor: '#388e3c' }}
      >
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-spooky-accent-green mb-3">
            📜 Spec Summoner
          </h3>
          <p className="text-sm text-spooky-text-secondary mb-4">
            YAML specs transform into TypeScript code
          </p>
          
          {/* Morphing code animation */}
          <div className="relative h-24 bg-spooky-bg-primary rounded p-3 font-mono text-xs overflow-hidden">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0, 0, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-spooky-accent-green">
                <div>agent:</div>
                <div className="ml-2">name: Router</div>
                <div className="ml-2">type: intent</div>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute top-3 left-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-spooky-neon-accent">
                <div>✨ Transforming...</div>
              </div>
            </motion.div>
            
            <motion.div
              className="absolute top-3 left-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-spooky-accent-purple">
                <div>class RouterAgent</div>
                <div className="ml-2">{'{'} handle() {'{'}</div>
                <div className="ml-4">{'//'} logic</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-spooky-accent-green/5 to-transparent pointer-events-none" />
      </motion.div>
      
      {/* MCP portal */}
      <motion.div
        className="conjuration-card bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.02, borderColor: '#abbc04' }}
      >
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-spooky-neon-accent mb-3">
            🌀 MCP Portal
          </h3>
          <p className="text-sm text-spooky-text-secondary mb-4">
            Connect to external APIs and tools
          </p>
          
          {/* Portal animation */}
          <div className="relative h-24 flex items-center justify-center">
            {/* Rotating portal rings */}
            <motion.div
              className="absolute w-20 h-20 rounded-full border-2 border-spooky-neon-accent/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full border-2 border-spooky-accent-purple/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-12 h-12 rounded-full border-2 border-spooky-accent-green/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Center glow */}
            <motion.div
              className="w-6 h-6 rounded-full bg-spooky-neon-accent"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 10px #abbc04)' }}
            />
            
            {/* API call indicators */}
            <motion.div
              className="absolute top-0 text-xs text-spooky-accent-green"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              API ✓
            </motion.div>
            <motion.div
              className="absolute bottom-0 text-xs text-spooky-accent-purple"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              DB ✓
            </motion.div>
            <motion.div
              className="absolute right-0 text-xs text-spooky-neon-accent"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              Tool ✓
            </motion.div>
          </div>
        </div>
        
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-spooky-neon-accent/5 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
};
