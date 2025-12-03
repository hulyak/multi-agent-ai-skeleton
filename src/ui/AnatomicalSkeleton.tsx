'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface SkeletonAgent {
  id: string;
  name: string;
  description: string;
  bone: 'skull' | 'cervical' | 'thoracic' | 'lumbar' | 'pelvis' | 'femur';
}

export interface AnatomicalSkeletonProps {
  onAgentClick?: (agentId: string) => void;
  className?: string;
}

const agents: SkeletonAgent[] = [
  {
    id: 'router-details',
    name: 'Intent Detection',
    description: 'The brain - analyzes queries to determine intent and route appropriately',
    bone: 'skull'
  },
  {
    id: 'faq-details',
    name: 'FAQ Agent',
    description: 'The heart - matches questions with knowledge base answers',
    bone: 'cervical'
  },
  {
    id: 'escalation-details',
    name: 'Escalation Agent',
    description: 'The spine - determines when human intervention is needed',
    bone: 'thoracic'
  },
  {
    id: 'retrieval-details',
    name: 'Retrieval Agent',
    description: 'The core - searches and retrieves relevant documents',
    bone: 'lumbar'
  },
  {
    id: 'summarization-details',
    name: 'Summarization Agent',
    description: 'The pelvis - condenses information into digestible summaries',
    bone: 'pelvis'
  },
  {
    id: 'citation-details',
    name: 'Citation Agent',
    description: 'The foundation - tracks sources and maintains attribution',
    bone: 'femur'
  }
];

/**
 * Anatomical Skeleton visualization with agents positioned on bones
 * 
 * @example
 * ```tsx
 * <AnatomicalSkeleton onAgentClick={handleClick} />
 * ```
 */
export const AnatomicalSkeleton: React.FC<AnatomicalSkeletonProps> = ({
  onAgentClick,
  className = ''
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  
  return (
    <div className={`anatomical-skeleton relative ${className}`}>
      <svg
        viewBox="0 0 400 600"
        className="w-full h-auto max-w-md mx-auto"
        role="img"
        aria-label="Anatomical skeleton diagram showing agent positions"
      >
        <defs>
          {/* Glow filters */}
          <filter id="bone-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="agent-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Skeleton Structure */}
        <g className="skeleton-bones" stroke="#6a1b9a" strokeWidth="2" fill="none" opacity="0.6">
          
          {/* Skull */}
          <g className="skull">
            <ellipse cx="200" cy="60" rx="35" ry="40" filter="url(#bone-glow)" />
            <path d="M 175 80 Q 200 95, 225 80" />
            <circle cx="185" cy="55" r="5" fill="#abbc04" opacity="0.8" />
            <circle cx="215" cy="55" r="5" fill="#abbc04" opacity="0.8" />
            <path d="M 190 70 L 210 70" strokeWidth="1" />
          </g>
          
          {/* Cervical Spine (Neck) */}
          <g className="cervical">
            <line x1="200" y1="100" x2="200" y2="130" strokeWidth="3" filter="url(#bone-glow)" />
            <circle cx="200" cy="110" r="4" fill="#6a1b9a" />
            <circle cx="200" cy="120" r="4" fill="#6a1b9a" />
          </g>
          
          {/* Ribcage */}
          <g className="ribcage thoracic">
            {/* Spine through ribcage */}
            <line x1="200" y1="130" x2="200" y2="250" strokeWidth="4" filter="url(#bone-glow)" />
            
            {/* Ribs - Left side */}
            <path d="M 200 150 Q 160 160, 160 180 Q 160 190, 180 195" />
            <path d="M 200 170 Q 150 180, 150 200 Q 150 210, 175 215" />
            <path d="M 200 190 Q 155 200, 155 220 Q 155 230, 180 235" />
            <path d="M 200 210 Q 160 220, 165 235 Q 165 240, 185 245" />
            
            {/* Ribs - Right side */}
            <path d="M 200 150 Q 240 160, 240 180 Q 240 190, 220 195" />
            <path d="M 200 170 Q 250 180, 250 200 Q 250 210, 225 215" />
            <path d="M 200 190 Q 245 200, 245 220 Q 245 230, 220 235" />
            <path d="M 200 210 Q 240 220, 235 235 Q 235 240, 215 245" />
            
            {/* Sternum */}
            <line x1="200" y1="140" x2="200" y2="240" strokeWidth="2" opacity="0.8" />
          </g>
          
          {/* Lumbar Spine */}
          <g className="lumbar">
            <line x1="200" y1="250" x2="200" y2="320" strokeWidth="4" filter="url(#bone-glow)" />
            <circle cx="200" cy="270" r="5" fill="#6a1b9a" />
            <circle cx="200" cy="290" r="5" fill="#6a1b9a" />
            <circle cx="200" cy="310" r="5" fill="#6a1b9a" />
          </g>
          
          {/* Pelvis */}
          <g className="pelvis">
            <ellipse cx="200" cy="350" rx="50" ry="30" filter="url(#bone-glow)" />
            <path d="M 160 340 Q 150 360, 160 380" />
            <path d="M 240 340 Q 250 360, 240 380" />
          </g>
          
          {/* Femur bones */}
          <g className="femur">
            <line x1="175" y1="380" x2="165" y2="480" strokeWidth="4" filter="url(#bone-glow)" />
            <line x1="225" y1="380" x2="235" y2="480" strokeWidth="4" filter="url(#bone-glow)" />
            <circle cx="175" cy="380" r="8" fill="#6a1b9a" opacity="0.5" />
            <circle cx="225" cy="380" r="8" fill="#6a1b9a" opacity="0.5" />
          </g>
        </g>
        
        {/* Agent Nodes on Bones */}
        {agents.map((agent, index) => {
          const isHovered = hoveredAgent === agent.id;
          const isDimmed = hoveredAgent && !isHovered;
          
          // Position based on bone
          const positions: Record<string, { x: number; y: number }> = {
            skull: { x: 200, y: 60 },
            cervical: { x: 200, y: 120 },
            thoracic: { x: 200, y: 190 },
            lumbar: { x: 200, y: 290 },
            pelvis: { x: 200, y: 350 },
            femur: { x: 200, y: 430 }
          };
          
          const pos = positions[agent.bone];
          
          return (
            <g key={agent.id}>
              {/* Pulsing ring for hovered agent */}
              {isHovered && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="15"
                  fill="none"
                  stroke="#abbc04"
                  strokeWidth="2"
                  initial={{ r: 15, opacity: 0.8 }}
                  animate={{ r: 25, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* Agent node */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 12 : 10}
                fill={isHovered ? '#abbc04' : '#6a1b9a'}
                opacity={isDimmed ? 0.3 : 1}
                filter="url(#agent-glow)"
                className="cursor-pointer"
                style={{ pointerEvents: 'all' }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                onClick={() => {
                  const element = document.getElementById(agent.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                  onAgentClick?.(agent.id);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: isDimmed ? 0.3 : 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
                role="button"
                aria-label={`${agent.name}: ${agent.description}`}
                tabIndex={0}
              />
              
              {/* Agent label */}
              <motion.text
                x={pos.x + 35}
                y={pos.y + 5}
                fill={isHovered ? '#abbc04' : '#cbd5e1'}
                fontSize="12"
                fontWeight="bold"
                opacity={isDimmed ? 0.3 : 0.9}
                className="cursor-pointer"
                style={{ pointerEvents: 'all' }}
                onClick={() => {
                  const element = document.getElementById(agent.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                  onAgentClick?.(agent.id);
                }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: isDimmed ? 0.3 : 0.9 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {agent.name}
              </motion.text>
              
              {/* Energy flow lines when hovered */}
              {isHovered && index < agents.length - 1 && (
                <motion.line
                  x1={pos.x}
                  y1={pos.y}
                  x2={positions[agents[index + 1].bone].x}
                  y2={positions[agents[index + 1].bone].y}
                  stroke="#abbc04"
                  strokeWidth="2"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <animate
                    attributeName="stroke-dasharray"
                    values="0 100;100 0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </motion.line>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip */}
      {hoveredAgent && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-spooky-bg-tertiary border-2 border-spooky-neon-accent rounded-lg p-4 shadow-2xl max-w-xs">
            <h4 className="text-lg font-bold text-spooky-neon-accent mb-2">
              {agents.find(a => a.id === hoveredAgent)?.name}
            </h4>
            <p className="text-sm text-spooky-text-secondary">
              {agents.find(a => a.id === hoveredAgent)?.description}
            </p>
            <p className="text-xs text-spooky-text-muted mt-2">
              Click to learn more
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
