'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface AgentNode {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  sectionId: string;
}

export interface SkeletonNetworkProps {
  onNodeClick?: (sectionId: string) => void;
  className?: string;
}

const agents: AgentNode[] = [
  {
    id: 'router',
    name: 'Router Agent',
    description: 'Directs messages to appropriate handlers based on intent classification',
    x: 50,
    y: 20,
    sectionId: 'router-details'
  },
  {
    id: 'faq',
    name: 'FAQ Agent',
    description: 'Matches questions against knowledge base and provides instant answers',
    x: 20,
    y: 50,
    sectionId: 'faq-details'
  },
  {
    id: 'escalation',
    name: 'Escalation Agent',
    description: 'Handles complex queries requiring human intervention',
    x: 80,
    y: 50,
    sectionId: 'escalation-details'
  },
  {
    id: 'retrieval',
    name: 'Retrieval Agent',
    description: 'Finds and retrieves relevant documents from knowledge sources',
    x: 30,
    y: 80,
    sectionId: 'retrieval-details'
  },
  {
    id: 'summarization',
    name: 'Summarization Agent',
    description: 'Condenses information into concise, actionable summaries',
    x: 70,
    y: 80,
    sectionId: 'summarization-details'
  },
  {
    id: 'citation',
    name: 'Citation Agent',
    description: 'Tracks and manages source citations for all responses',
    x: 50,
    y: 95,
    sectionId: 'citation-details'
  }
];

const connections = [
  ['router', 'faq'],
  ['router', 'escalation'],
  ['router', 'retrieval'],
  ['faq', 'citation'],
  ['escalation', 'citation'],
  ['retrieval', 'summarization'],
  ['summarization', 'citation']
];

/**
 * Interactive Skeleton Network diagram with glowing bone joints
 * 
 * @example
 * ```tsx
 * <SkeletonNetwork onNodeClick={handleNodeClick} />
 * ```
 */
export const SkeletonNetwork: React.FC<SkeletonNetworkProps> = ({
  onNodeClick,
  className = ''
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  const getNodePosition = (nodeId: string) => {
    const node = agents.find(a => a.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };
  
  const handleNodeClick = (sectionId: string) => {
    if (onNodeClick) {
      onNodeClick(sectionId);
    } else {
      // Smooth scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  return (
    <div className={`skeleton-network relative w-full ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-auto"
        style={{ minHeight: '400px' }}
        role="img"
        aria-label="Interactive skeleton network diagram showing agent connections"
      >
        <defs>
          {/* Glow filters */}
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection Lines */}
        <g className="connections">
          {connections.map(([from, to], index) => {
            const fromPos = getNodePosition(from);
            const toPos = getNodePosition(to);
            const isConnected = hoveredNode === from || hoveredNode === to;
            const isDimmed = hoveredNode && !isConnected;
            
            return (
              <motion.line
                key={`${from}-${to}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isConnected ? '#abbc04' : '#6a1b9a'}
                strokeWidth={isConnected ? '0.4' : '0.2'}
                opacity={isDimmed ? 0.2 : 0.6}
                filter="url(#line-glow)"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: isDimmed ? 0.2 : 0.6
                }}
                transition={{ 
                  duration: 1.5,
                  delay: index * 0.1,
                  opacity: { duration: 0.3 }
                }}
              >
                {isConnected && (
                  <animate
                    attributeName="stroke-dasharray"
                    values="0 100;100 0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </motion.line>
            );
          })}
        </g>
        
        {/* Agent Nodes */}
        <g className="nodes">
          {agents.map((agent, index) => {
            const isHovered = hoveredNode === agent.id;
            const isDimmed = hoveredNode && !isHovered;
            
            return (
              <g key={agent.id}>
                {/* Outer glow ring */}
                {isHovered && (
                  <motion.circle
                    cx={agent.x}
                    cy={agent.y}
                    r="4"
                    fill="none"
                    stroke="#abbc04"
                    strokeWidth="0.3"
                    opacity="0.6"
                    initial={{ r: 2, opacity: 0 }}
                    animate={{ r: 4, opacity: 0.6 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  />
                )}
                
                {/* Main node */}
                <motion.circle
                  cx={agent.x}
                  cy={agent.y}
                  r={isHovered ? '2.5' : '2'}
                  fill={isHovered ? '#abbc04' : '#6a1b9a'}
                  opacity={isDimmed ? 0.3 : 1}
                  filter="url(#node-glow)"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(agent.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(agent.sectionId)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: isDimmed ? 0.3 : 1,
                    r: isHovered ? 2.5 : 2
                  }}
                  transition={{ 
                    delay: index * 0.15,
                    scale: { duration: 0.5 },
                    opacity: { duration: 0.3 },
                    r: { duration: 0.2 }
                  }}
                  whileHover={{ scale: 1.2 }}
                  role="button"
                  aria-label={`${agent.name}: ${agent.description}`}
                  tabIndex={0}
                />
                
                {/* Pulse animation for hovered node */}
                {isHovered && (
                  <motion.circle
                    cx={agent.x}
                    cy={agent.y}
                    r="2"
                    fill="none"
                    stroke="#abbc04"
                    strokeWidth="0.2"
                    initial={{ r: 2, opacity: 0.8 }}
                    animate={{ r: 5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoveredNode && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 z-50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-spooky-bg-tertiary border-2 border-spooky-neon-accent rounded-lg p-4 shadow-2xl max-w-xs">
            <h4 className="text-lg font-bold text-spooky-neon-accent mb-2">
              {agents.find(a => a.id === hoveredNode)?.name}
            </h4>
            <p className="text-sm text-spooky-text-secondary">
              {agents.find(a => a.id === hoveredNode)?.description}
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
