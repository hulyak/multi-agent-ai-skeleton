import React from 'react';

export interface SpookyWorkflowLineProps {
  active?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Spooky themed workflow connection line with glow effect
 * 
 * @example
 * ```tsx
 * <SpookyWorkflowLine active orientation="horizontal" />
 * ```
 */
export const SpookyWorkflowLine: React.FC<SpookyWorkflowLineProps> = ({ 
  active = false,
  className = '',
  orientation = 'horizontal'
}) => {
  const orientationClass = orientation === 'vertical' ? 'w-0.5 h-full' : 'w-full h-0.5';
  
  return (
    <div 
      className={`spooky-workflow-line ${active ? 'active' : ''} ${orientationClass} ${className}`}
      role="presentation"
    />
  );
};
