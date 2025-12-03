'use client';

import React from 'react';
import { SpookyIcon } from './SpookyIcon';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export interface WorkflowAnimationProps {
  steps: WorkflowStep[];
  className?: string;
}

/**
 * Workflow Animation component showing animated arrows connecting agents
 * 
 * @example
 * ```tsx
 * <WorkflowAnimation 
 *   steps={[
 *     { id: '1', name: 'Intent Agent', status: 'complete' },
 *     { id: '2', name: 'FAQ Agent', status: 'active' },
 *     { id: '3', name: 'Response', status: 'pending' }
 *   ]}
 * />
 * ```
 */
export const WorkflowAnimation: React.FC<WorkflowAnimationProps> = ({ 
  steps,
  className = ''
}) => {
  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'active':
        return 'border-spooky-accent-purple bg-spooky-accent-purple/10';
      case 'complete':
        return 'border-spooky-accent-green bg-spooky-accent-green/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-spooky-border-subtle bg-spooky-bg-tertiary';
    }
  };
  
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'active':
        return 'skull';
      case 'complete':
        return 'lantern';
      case 'error':
        return 'bones';
      default:
        return 'skull';
    }
  };
  
  return (
    <div className={`workflow-animation ${className}`}>
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Node */}
            <div className="flex flex-col items-center min-w-[120px]">
              {/* Icon Container */}
              <div 
                className={`
                  relative
                  w-16 h-16
                  rounded-lg
                  border-2
                  flex items-center justify-center
                  transition-all duration-300
                  ${getStatusColor(step.status)}
                  ${step.status === 'active' ? 'animate-pulse-glow' : ''}
                `}
              >
                <SpookyIcon 
                  type={getStatusIcon(step.status) as any}
                  active={step.status === 'active' || step.status === 'complete'}
                  size="lg"
                />
                
                {/* Pulse Ring for Active */}
                {step.status === 'active' && (
                  <span className="absolute inset-0 rounded-lg">
                    <span className="animate-ping absolute inset-0 rounded-lg border-2 border-spooky-accent-purple opacity-75"></span>
                  </span>
                )}
                
                {/* Checkmark for Complete */}
                {step.status === 'complete' && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-spooky-accent-green rounded-full flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
                
                {/* Error Badge */}
                {step.status === 'error' && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                    !
                  </span>
                )}
              </div>
              
              {/* Step Name */}
              <div className="mt-3 text-center">
                <p className="text-sm font-semibold text-spooky-text-primary">
                  {step.name}
                </p>
                <p className="text-xs text-spooky-text-muted capitalize mt-1">
                  {step.status}
                </p>
              </div>
            </div>
            
            {/* Animated Arrow (if not last step) */}
            {index < steps.length - 1 && (
              <div className="flex-1 min-w-[60px] relative h-16 flex items-center">
                <svg 
                  className="w-full h-8" 
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  {/* Arrow Line */}
                  <line
                    x1="0"
                    y1="20"
                    x2="90"
                    y2="20"
                    stroke={
                      step.status === 'complete' 
                        ? '#388e3c' 
                        : step.status === 'active'
                        ? '#6a1b9a'
                        : '#4a5568'
                    }
                    strokeWidth="2"
                    className={step.status === 'active' ? 'animate-pulse' : ''}
                  />
                  
                  {/* Arrow Head */}
                  <polygon
                    points="90,15 100,20 90,25"
                    fill={
                      step.status === 'complete' 
                        ? '#388e3c' 
                        : step.status === 'active'
                        ? '#6a1b9a'
                        : '#4a5568'
                    }
                  />
                  
                  {/* Animated Pulse Dot */}
                  {(step.status === 'active' || step.status === 'complete') && (
                    <circle
                      r="3"
                      fill="#abbc04"
                      className="animate-pulse"
                    >
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path="M 0 20 L 90 20"
                      />
                    </circle>
                  )}
                </svg>
                
                {/* Glow Effect for Active */}
                {step.status === 'active' && (
                  <div 
                    className="absolute inset-0 blur-sm opacity-50"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(106, 27, 154, 0.5), transparent)'
                    }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
