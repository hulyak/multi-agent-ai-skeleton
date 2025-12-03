'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ConsoleMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'error' | 'warning' | 'debug';
  from: string;
  to?: string;
  content: string;
  data?: Record<string, any>;
}

export interface AgentConsoleProps {
  messages: ConsoleMessage[];
  onClear?: () => void;
  autoScroll?: boolean;
  className?: string;
}

/**
 * Agent Console component for displaying real-time message logs
 * Shows timeline of JSON-like messages between agents with filtering
 * 
 * @example
 * ```tsx
 * <AgentConsole 
 *   messages={messages}
 *   onClear={handleClear}
 *   autoScroll
 * />
 * ```
 */
export const AgentConsole: React.FC<AgentConsoleProps> = ({ 
  messages,
  onClear,
  autoScroll = true,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'debug'>('all');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);
  
  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.type === filter;
  });
  
  const toggleExpand = (id: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const getTypeColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 border-red-500/30';
      case 'warning':
        return 'text-yellow-400 border-yellow-500/30';
      case 'debug':
        return 'text-blue-400 border-blue-500/30';
      default:
        return 'text-spooky-accent-green border-spooky-accent-green/30';
    }
  };
  
  const getTypeIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'debug':
        return '🔍';
      default:
        return '✓';
    }
  };
  
  return (
    <div className={`agent-console bg-spooky-bg-secondary border border-spooky-border-subtle rounded-lg ${className}`}>
      {/* Header */}
      <div className="console-header flex items-center justify-between p-4 border-b border-spooky-border-subtle">
        <h3 className="text-lg font-bold text-spooky-text-primary font-mono">
          Agent Console
        </h3>
        
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-spooky-bg-tertiary text-spooky-text-primary text-sm px-3 py-1 rounded border border-spooky-border-subtle focus:border-spooky-neon-accent focus:outline-none font-mono"
            aria-label="Filter console messages"
          >
            <option value="all">All</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="debug">Debug</option>
          </select>
          
          {/* Clear Button */}
          {onClear && (
            <button
              onClick={onClear}
              className="text-sm px-3 py-1 bg-spooky-bg-tertiary text-spooky-text-secondary hover:text-spooky-neon-accent border border-spooky-border-subtle rounded transition-colors font-mono"
              aria-label="Clear console"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="console-messages h-96 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-spooky-text-muted py-12">
            <p>No messages to display</p>
            {filter !== 'all' && (
              <p className="text-xs mt-2">Try changing the filter</p>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedMessages.has(msg.id);
            const typeColor = getTypeColor(msg.type);
            const typeIcon = getTypeIcon(msg.type);
            
            return (
              <div
                key={msg.id}
                className={`console-message border-l-2 ${typeColor} pl-3 py-2 hover:bg-spooky-bg-tertiary/30 transition-colors`}
              >
                {/* Message Header */}
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="w-full text-left"
                  aria-expanded={isExpanded}
                  aria-label={`Toggle message details for ${msg.from}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs opacity-70 min-w-[60px]">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="text-xs">{typeIcon}</span>
                    <span className={`text-xs font-bold ${typeColor.split(' ')[0]}`}>
                      [{msg.type.toUpperCase()}]
                    </span>
                    <span className="text-spooky-text-primary">
                      {msg.from}
                      {msg.to && (
                        <>
                          <span className="text-spooky-text-muted mx-1">→</span>
                          <span className="text-spooky-accent-purple">{msg.to}</span>
                        </>
                      )}
                    </span>
                    <span className="ml-auto text-spooky-text-muted">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  {/* Message Content (collapsed) */}
                  {!isExpanded && (
                    <div className="text-spooky-text-secondary mt-1 truncate">
                      {msg.content}
                    </div>
                  )}
                </button>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    <div className="text-spooky-text-secondary">
                      {msg.content}
                    </div>
                    
                    {msg.data && (
                      <div className="bg-spooky-bg-primary p-2 rounded border border-spooky-border-subtle overflow-x-auto">
                        <pre className="text-xs text-spooky-accent-green">
                          {JSON.stringify(msg.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={consoleEndRef} />
      </div>
      
      {/* Footer */}
      <div className="console-footer p-2 border-t border-spooky-border-subtle text-xs text-spooky-text-muted text-center font-mono">
        {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
        {filter !== 'all' && ` (filtered: ${filter})`}
      </div>
    </div>
  );
};
