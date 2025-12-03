// Debug Manager - Comprehensive debugging utilities for multi-agent system

import { MessageObject, WorkflowState, AgentState } from '../types';
import { Agent } from '../agents/Agent';
import { MessageBus } from './MessageBus';
import { WorkflowStateManager } from './WorkflowStateManager';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface DebugConfig {
  enabled: boolean;
  logMessages: boolean;
  logRouting: boolean;
  logAgentState: boolean;
  logWorkflowState: boolean;
}

export interface MessageLogEntry {
  message: MessageObject;
  timestamp: number;
  routingInfo: {
    sourceAgent: string;
    targetAgent: string | null;
    messageType: string;
  };
  deliveryStatus: 'pending' | 'delivered' | 'failed';
  error?: string;
}

export interface AgentStateSnapshot {
  agentId: string;
  state: AgentState;
  timestamp: number;
}

export interface WorkflowStateSnapshot {
  workflowId: string;
  state: WorkflowState;
  timestamp: number;
}

export interface ReplayResult {
  success: boolean;
  messagesReplayed: number;
  errors: Array<{ messageId: string; error: string }>;
  finalWorkflowState?: WorkflowState;
}

// ============================================================================
// Debug Manager
// ============================================================================

export class DebugManager {
  private config: DebugConfig;
  private messageLogs: Map<string, MessageLogEntry[]> = new Map();
  private agentStateSnapshots: Map<string, AgentStateSnapshot[]> = new Map();
  private workflowStateSnapshots: Map<string, WorkflowStateSnapshot[]> = new Map();

  constructor(config?: Partial<DebugConfig>) {
    this.config = {
      enabled: config?.enabled ?? false,
      logMessages: config?.logMessages ?? true,
      logRouting: config?.logRouting ?? true,
      logAgentState: config?.logAgentState ?? true,
      logWorkflowState: config?.logWorkflowState ?? true
    };
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Enable debug mode
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable debug mode
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Check if debug mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update debug configuration
   */
  updateConfig(updates: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current debug configuration
   */
  getConfig(): DebugConfig {
    return { ...this.config };
  }

  // ============================================================================
  // Message Logging
  // ============================================================================

  /**
   * Log a message with routing information
   */
  logMessage(
    message: MessageObject,
    deliveryStatus: 'pending' | 'delivered' | 'failed' = 'pending',
    error?: string
  ): void {
    if (!this.config.enabled || !this.config.logMessages) {
      return;
    }

    const logEntry: MessageLogEntry = {
      message,
      timestamp: Date.now(),
      routingInfo: {
        sourceAgent: message.sourceAgentId,
        targetAgent: message.targetAgentId,
        messageType: message.type
      },
      deliveryStatus,
      error
    };

    // Store by workflow ID
    const logs = this.messageLogs.get(message.workflowId) || [];
    logs.push(logEntry);
    this.messageLogs.set(message.workflowId, logs);

    // Console log if routing logging is enabled
    if (this.config.logRouting) {
      this.consoleLogMessage(logEntry);
    }
  }

  /**
   * Get message logs for a workflow
   */
  getMessageLogs(workflowId: string): MessageLogEntry[] {
    return this.messageLogs.get(workflowId) || [];
  }

  /**
   * Get all message logs
   */
  getAllMessageLogs(): Map<string, MessageLogEntry[]> {
    return new Map(this.messageLogs);
  }

  /**
   * Clear message logs for a workflow
   */
  clearMessageLogs(workflowId?: string): void {
    if (workflowId) {
      this.messageLogs.delete(workflowId);
    } else {
      this.messageLogs.clear();
    }
  }

  // ============================================================================
  // Agent State Inspection
  // ============================================================================

  /**
   * Capture agent state snapshot
   */
  captureAgentState(agent: Agent): void {
    if (!this.config.enabled || !this.config.logAgentState) {
      return;
    }

    const snapshot: AgentStateSnapshot = {
      agentId: agent.id,
      state: agent.getState(),
      timestamp: Date.now()
    };

    const snapshots = this.agentStateSnapshots.get(agent.id) || [];
    snapshots.push(snapshot);
    this.agentStateSnapshots.set(agent.id, snapshots);
  }

  /**
   * Get agent state snapshots
   */
  getAgentStateSnapshots(agentId: string): AgentStateSnapshot[] {
    return this.agentStateSnapshots.get(agentId) || [];
  }

  /**
   * Get latest agent state snapshot
   */
  getLatestAgentState(agentId: string): AgentStateSnapshot | undefined {
    const snapshots = this.agentStateSnapshots.get(agentId);
    return snapshots && snapshots.length > 0 ? snapshots[snapshots.length - 1] : undefined;
  }

  /**
   * Get all agent state snapshots
   */
  getAllAgentStateSnapshots(): Map<string, AgentStateSnapshot[]> {
    return new Map(this.agentStateSnapshots);
  }

  /**
   * Clear agent state snapshots
   */
  clearAgentStateSnapshots(agentId?: string): void {
    if (agentId) {
      this.agentStateSnapshots.delete(agentId);
    } else {
      this.agentStateSnapshots.clear();
    }
  }

  // ============================================================================
  // Workflow State Inspection
  // ============================================================================

  /**
   * Capture workflow state snapshot
   */
  captureWorkflowState(workflowState: WorkflowState): void {
    if (!this.config.enabled || !this.config.logWorkflowState) {
      return;
    }

    const snapshot: WorkflowStateSnapshot = {
      workflowId: workflowState.id,
      state: workflowState,
      timestamp: Date.now()
    };

    const snapshots = this.workflowStateSnapshots.get(workflowState.id) || [];
    snapshots.push(snapshot);
    this.workflowStateSnapshots.set(workflowState.id, snapshots);
  }

  /**
   * Get workflow state snapshots
   */
  getWorkflowStateSnapshots(workflowId: string): WorkflowStateSnapshot[] {
    return this.workflowStateSnapshots.get(workflowId) || [];
  }

  /**
   * Get latest workflow state snapshot
   */
  getLatestWorkflowState(workflowId: string): WorkflowStateSnapshot | undefined {
    const snapshots = this.workflowStateSnapshots.get(workflowId);
    return snapshots && snapshots.length > 0 ? snapshots[snapshots.length - 1] : undefined;
  }

  /**
   * Get all workflow state snapshots
   */
  getAllWorkflowStateSnapshots(): Map<string, WorkflowStateSnapshot[]> {
    return new Map(this.workflowStateSnapshots);
  }

  /**
   * Clear workflow state snapshots
   */
  clearWorkflowStateSnapshots(workflowId?: string): void {
    if (workflowId) {
      this.workflowStateSnapshots.delete(workflowId);
    } else {
      this.workflowStateSnapshots.clear();
    }
  }

  // ============================================================================
  // Message Sequence Replay
  // ============================================================================

  /**
   * Replay a sequence of messages
   */
  async replayMessageSequence(
    workflowId: string,
    messageBus: MessageBus,
    workflowStateManager: WorkflowStateManager,
    agents: Map<string, Agent>
  ): Promise<ReplayResult> {
    const messageLogs = this.getMessageLogs(workflowId);
    
    if (messageLogs.length === 0) {
      return {
        success: false,
        messagesReplayed: 0,
        errors: [{ messageId: 'none', error: 'No messages to replay' }]
      };
    }

    // Create a new workflow for replay
    const replayWorkflowId = `${workflowId}-replay-${Date.now()}`;
    
    // Get the initial workflow state if available
    const initialSnapshot = this.workflowStateSnapshots.get(workflowId)?.[0];
    const initialState = initialSnapshot?.state;
    
    // Create workflow with initial state
    if (initialState) {
      workflowStateManager.createWorkflow(replayWorkflowId, {
        status: initialState.status,
        sharedData: { ...initialState.sharedData },
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          initiatorId: 'replay-system'
        }
      });
    } else {
      workflowStateManager.createWorkflow(replayWorkflowId);
    }

    const errors: Array<{ messageId: string; error: string }> = [];
    let messagesReplayed = 0;

    // Replay messages in sequence
    for (const logEntry of messageLogs) {
      try {
        // Create a new message with the replay workflow ID
        const replayMessage: MessageObject = {
          ...logEntry.message,
          workflowId: replayWorkflowId,
          id: `${logEntry.message.id}-replay`,
          metadata: {
            ...logEntry.message.metadata,
            timestamp: Date.now(),
            retryCount: 0
          }
        };

        // Route the message
        await messageBus.route(replayMessage);
        messagesReplayed++;
      } catch (error) {
        errors.push({
          messageId: logEntry.message.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Get final workflow state
    let finalWorkflowState: WorkflowState | undefined;
    try {
      finalWorkflowState = workflowStateManager.getWorkflow(replayWorkflowId);
    } catch (error) {
      // Workflow might not exist if replay failed early
    }

    return {
      success: errors.length === 0,
      messagesReplayed,
      errors,
      finalWorkflowState
    };
  }

  // ============================================================================
  // Inspection Tools
  // ============================================================================

  /**
   * Get comprehensive debug report for a workflow
   */
  getDebugReport(workflowId: string): {
    messageLogs: MessageLogEntry[];
    workflowSnapshots: WorkflowStateSnapshot[];
    agentSnapshots: Map<string, AgentStateSnapshot[]>;
  } {
    const messageLogs = this.getMessageLogs(workflowId);
    const workflowSnapshots = this.getWorkflowStateSnapshots(workflowId);
    
    // Get agent snapshots for agents involved in this workflow
    const agentIds = new Set<string>();
    messageLogs.forEach(log => {
      agentIds.add(log.message.sourceAgentId);
      if (log.message.targetAgentId) {
        agentIds.add(log.message.targetAgentId);
      }
    });

    const agentSnapshots = new Map<string, AgentStateSnapshot[]>();
    agentIds.forEach(agentId => {
      const snapshots = this.getAgentStateSnapshots(agentId);
      if (snapshots.length > 0) {
        agentSnapshots.set(agentId, snapshots);
      }
    });

    return {
      messageLogs,
      workflowSnapshots,
      agentSnapshots
    };
  }

  /**
   * Export debug data as JSON
   */
  exportDebugData(workflowId?: string): string {
    if (workflowId) {
      const report = this.getDebugReport(workflowId);
      return JSON.stringify(report, this.jsonReplacer, 2);
    }

    // Export all debug data
    const allData = {
      messageLogs: Array.from(this.messageLogs.entries()),
      agentStateSnapshots: Array.from(this.agentStateSnapshots.entries()),
      workflowStateSnapshots: Array.from(this.workflowStateSnapshots.entries())
    };

    return JSON.stringify(allData, this.jsonReplacer, 2);
  }

  /**
   * Clear all debug data
   */
  clearAll(): void {
    this.messageLogs.clear();
    this.agentStateSnapshots.clear();
    this.workflowStateSnapshots.clear();
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Console log a message entry
   */
  private consoleLogMessage(logEntry: MessageLogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toISOString();
    const status = logEntry.deliveryStatus.toUpperCase();
    const source = logEntry.routingInfo.sourceAgent;
    const target = logEntry.routingInfo.targetAgent || 'BROADCAST';
    const type = logEntry.routingInfo.messageType;
    const messageId = logEntry.message.id;

    console.log(
      `[DEBUG ${timestamp}] [${status}] Message ${messageId}: ${source} -> ${target} (${type})`
    );

    if (logEntry.error) {
      console.log(`  Error: ${logEntry.error}`);
    }
  }

  /**
   * JSON replacer to handle Map objects
   */
  private jsonReplacer(_key: string, value: any): any {
    if (value instanceof Map) {
      return {
        __type: 'Map',
        entries: Array.from(value.entries())
      };
    }
    if (value instanceof Error) {
      return {
        __type: 'Error',
        message: value.message,
        stack: value.stack
      };
    }
    return value;
  }
}
