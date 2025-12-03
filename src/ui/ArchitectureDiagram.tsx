import React from 'react';

export interface ArchitectureDiagramProps {
  animated?: boolean;
  className?: string;
}

/**
 * Animated architecture diagram showing multi-agent system flow
 * User UI → Orchestrator → Agents → External Tools (MCP)
 * 
 * @example
 * ```tsx
 * <ArchitectureDiagram animated />
 * ```
 */
export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ 
  animated = true,
  className = '' 
}) => {
  return (
    <div className={`architecture-diagram-container ${className}`}>
      <svg 
        viewBox="0 0 800 400" 
        className="w-full h-auto"
        role="img"
        aria-label="Multi-agent system architecture diagram"
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6a1b9a" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#388e3c" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#abbc04" />
          </marker>
        </defs>
        
        {/* User UI Box */}
        <g>
          <rect
            x="50"
            y="180"
            width="100"
            height="60"
            rx="8"
            fill="#1a1a2e"
            stroke="url(#purpleGradient)"
            strokeWidth="2"
            filter={animated ? "url(#glow)" : undefined}
          />
          <text x="100" y="205" textAnchor="middle" fill="#f8f9fa" fontSize="14" fontWeight="bold">
            User UI
          </text>
          <text x="100" y="225" textAnchor="middle" fill="#cbd5e1" fontSize="11">
            Interface
          </text>
        </g>
        
        {/* Arrow 1: User UI → Orchestrator */}
        <g>
          <line
            x1="150"
            y1="210"
            x2="230"
            y2="210"
            stroke="#abbc04"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className={animated ? "animate-pulse" : ""}
          />
          {animated && (
            <circle r="4" fill="#abbc04" className="animate-pulse">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path="M 150 210 L 230 210"
              />
            </circle>
          )}
        </g>
        
        {/* Orchestrator Box */}
        <g>
          <rect
            x="230"
            y="170"
            width="140"
            height="80"
            rx="8"
            fill="#1a1a2e"
            stroke="url(#purpleGradient)"
            strokeWidth="3"
            filter={animated ? "url(#glow)" : undefined}
          />
          <text x="300" y="200" textAnchor="middle" fill="#f8f9fa" fontSize="16" fontWeight="bold">
            Orchestrator
          </text>
          <text x="300" y="220" textAnchor="middle" fill="#cbd5e1" fontSize="10">
            Message Bus
          </text>
          <text x="300" y="235" textAnchor="middle" fill="#cbd5e1" fontSize="10">
            Shared State
          </text>
        </g>
        
        {/* Arrow 2: Orchestrator → Agents */}
        <g>
          <line
            x1="370"
            y1="210"
            x2="430"
            y2="210"
            stroke="#abbc04"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className={animated ? "animate-pulse" : ""}
          />
          {animated && (
            <circle r="4" fill="#abbc04" className="animate-pulse">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin="0.5s"
                path="M 370 210 L 430 210"
              />
            </circle>
          )}
        </g>
        
        {/* Agent A */}
        <g>
          <rect
            x="430"
            y="80"
            width="100"
            height="60"
            rx="8"
            fill="#1a1a2e"
            stroke="url(#greenGradient)"
            strokeWidth="2"
            filter={animated ? "url(#glow)" : undefined}
          />
          <text x="480" y="105" textAnchor="middle" fill="#f8f9fa" fontSize="14" fontWeight="bold">
            Agent A
          </text>
          <text x="480" y="125" textAnchor="middle" fill="#cbd5e1" fontSize="10">
            Intent
          </text>
        </g>
        
        {/* Agent B */}
        <g>
          <rect
            x="430"
            y="170"
            width="100"
            height="60"
            rx="8"
            fill="#1a1a2e"
            stroke="url(#greenGradient)"
            strokeWidth="2"
            filter={animated ? "url(#glow)" : undefined}
          />
          <text x="480" y="195" textAnchor="middle" fill="#f8f9fa" fontSize="14" fontWeight="bold">
            Agent B
          </text>
          <text x="480" y="215" textAnchor="middle" fill="#cbd5e1" fontSize="10">
            Processing
          </text>
        </g>
        
        {/* Agent C */}
        <g>
          <rect
            x="430"
            y="260"
            width="100"
            height="60"
            rx="8"
            fill="#1a1a2e"
            stroke="url(#greenGradient)"
            strokeWidth="2"
            filter={animated ? "url(#glow)" : undefined}
          />
          <text x="480" y="285" textAnchor="middle" fill="#f8f9fa" fontSize="14" fontWeight="bold">
            Agent C
          </text>
          <text x="480" y="305" textAnchor="middle" fill="#cbd5e1" fontSize="10">
            Response
          </text>
        </g>
        
        {/* Connecting lines from Orchestrator to Agents */}
        <line x1="370" y1="210" x2="430" y2="110" stroke="#6a1b9a" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
        <line x1="370" y1="210" x2="430" y2="290" stroke="#6a1b9a" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
        
        {/* Arrow 3: Agents → MCP */}
        <g>
          <line
            x1="530"
            y1="200"
            x2="600"
            y2="200"
            stroke="#abbc04"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
            className={animated ? "animate-pulse" : ""}
          />
          {animated && (
            <circle r="4" fill="#abbc04" className="animate-pulse">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin="1s"
                path="M 530 200 L 600 200"
              />
            </circle>
          )}
        </g>
        
        {/* MCP External Tools */}
        <g>
          <rect
            x="600"
            y="170"
            width="150"
            height="80"
            rx="8"
            fill="#1a1a2e"
            stroke="url(#greenGradient)"
            strokeWidth="2"
            filter={animated ? "url(#glow)" : undefined}
          />
          <text x="675" y="200" textAnchor="middle" fill="#f8f9fa" fontSize="14" fontWeight="bold">
            External Tools
          </text>
          <text x="675" y="220" textAnchor="middle" fill="#cbd5e1" fontSize="10">
            MCP Integration
          </text>
          <text x="675" y="235" textAnchor="middle" fill="#cbd5e1" fontSize="9">
            APIs • Databases • Services
          </text>
        </g>
        
        {/* Labels */}
        <text x="190" y="195" textAnchor="middle" fill="#abbc04" fontSize="10" fontWeight="bold">
          Request
        </text>
        <text x="400" y="195" textAnchor="middle" fill="#abbc04" fontSize="10" fontWeight="bold">
          Route
        </text>
        <text x="565" y="185" textAnchor="middle" fill="#abbc04" fontSize="10" fontWeight="bold">
          Execute
        </text>
      </svg>
    </div>
  );
};
