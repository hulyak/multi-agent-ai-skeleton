'use client';

import React, { useState } from 'react';
import { SpookyIcon } from './SpookyIcon';

export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'error' | 'success';
  description: string;
  lastAction?: string;
  lastUpdate?: Date;
}

export interface AgentStatusSidebarProps {
  agents: AgentStatus[];
  selectedAgentId?: string;
  onAgentSelect?: (agentId: string) => void;
  className?: string;
}

/**
 * Agent Status Sidebar showing list of agents with status indicators
 * 
 * @example
 * ```tsx
 * <AgentStatusSidebar 
 *   agents={agents}
 *   selectedAgentId={selectedId}
 *   onAgentSelect={handleSelect}
 * />
 * ```
 */
export const AgentStatusSidebar: React.FC<AgentStatusSidebarProps> = ({ 
  agents,
  selectedAgentId,
  onAgentSelect,
  className = ''
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  
  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return 'text-spooky-accent-purple border-spooky-accent-purple';
      case 'error':
        return 'text-red-400 border-red-500';
      case 'success':
        return 'text-spooky-accent-green border-spooky-accent-green';
      default:
        return 'text-spooky-text-muted border-spooky-border-subtle';
    }
  };
  
  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return '⚡';
      case 'error':
        return '❌';
      case 'success':
        return '✓';
      default:
        return '○';
    }
  };
  
  const getStatusLabel = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'error':
        return 'Error';
      case 'success':
        return 'Success';
      default:
        return 'Idle';
    }
  };
  
  return (
    <aside 
      className={`agent-status-sidebar bg-spooky-bg-secondary border-r border-spooky-border-subtle ${className}`}
      aria-label="Agent status list"
    >
      {/* Header */}
      <div className="sidebar-header p-4 border-b border-spooky-border-subtle">
        <h2 className="text-lg font-bold text-spooky-text-primary flex items-center gap-2">
          <SpookyIcon type="skull" size="sm" />
          Agents
        </h2>
        <p className="text-xs text-spooky-text-muted mt-1">
          {agents.filter(a => a.status === 'running').length} active
        </p>
      </div>
      
      {/* Agent List */}
      <nav className="agent-list p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const isHovered = hoveredAgent === agent.id;
          const statusColor = getStatusColor(agent.status);
          const statusIcon = getStatusIcon(agent.status);
          const statusLabel = getStatusLabel(agent.status);
          
          return (
            <div key={agent.id} className="relative">
              <button
                onClick={() => onAgentSelect?.(agent.id)}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all
                  ${isSelected 
                    ? 'bg-spooky-bg-tertiary border-spooky-neon-accent shadow-lg' 
                    : 'bg-spooky-bg-primary border-spooky-border-subtle hover:border-spooky-border-accent'
                  }
                `}
                aria-label={`Select ${agent.name} agent`}
                aria-current={isSelected ? 'true' : undefined}
              >
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SpookyIcon 
                      type="skull" 
                      active={agent.status === 'running'}
                      size="sm"
                    />
                    <span className="font-semibold text-spooky-text-primary text-sm">
                      {agent.name}
                    </span>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`flex items-center gap-1 text-xs ${statusColor.split(' ')[0]}`}>
                    <span>{statusIcon}</span>
                    <span className="font-mono">{statusLabel}</span>
                  </div>
                </div>
                
                {/* Last Action */}
                {agent.lastAction && (
                  <div className="text-xs text-spooky-text-muted truncate">
                    {agent.lastAction}
                  </div>
                )}
                
                {/* Last Update */}
                {agent.lastUpdate && (
                  <div className="text-xs text-spooky-text-muted mt-1">
                    {agent.lastUpdate.toLocaleTimeString()}
                  </div>
                )}
                
                {/* Status Pulse Animation */}
                {agent.status === 'running' && (
                  <div className="absolute top-2 right-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spooky-accent-purple opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-spooky-accent-purple"></span>
                    </span>
                  </div>
                )}
              </button>
              
              {/* Tooltip on Hover */}
              {isHovered && (
                <div 
                  className="absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-spooky-bg-tertiary border border-spooky-border-accent rounded-lg shadow-xl"
                  role="tooltip"
                >
                  <h3 className="font-bold text-spooky-text-primary mb-2">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-spooky-text-secondary">
                    {agent.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-spooky-border-subtle">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={statusColor.split(' ')[0]}>
                        {statusIcon} {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="sidebar-footer p-4 border-t border-spooky-border-subtle">
        <div className="text-xs text-spooky-text-muted space-y-1">
          <div className="flex items-center justify-between">
            <span>Total Agents:</span>
            <span className="font-mono text-spooky-text-primary">{agents.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active:</span>
            <span className="font-mono text-spooky-accent-purple">
              {agents.filter(a => a.status === 'running').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Errors:</span>
            <span className="font-mono text-red-400">
              {agents.filter(a => a.status === 'error').length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
