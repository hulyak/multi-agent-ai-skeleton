// Agent Interface and Base Implementation

import {
  MessageObject,
  AgentState,
  AgentStatus,
  MessageType,
} from '../types';

// ============================================================================
// Health Status
// ============================================================================

export interface HealthStatus {
  healthy: boolean;
  status: AgentStatus;
  lastCheck: number;
  uptime: number;
  metrics: {
    currentTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
  };
  errors?: string[];
}

// ============================================================================
// Message Response
// ============================================================================

export interface MessageResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  timestamp: number;
}

// ============================================================================
// Agent Interface
// ============================================================================

export interface Agent {
  // Identity
  id: string;
  name: string;
  capabilities: string[];

  // Lifecycle hooks
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Message handling
  handleMessage(message: MessageObject): Promise<MessageResponse>;
  canHandle(message: MessageObject): boolean;

  // State management
  getState(): AgentState;
  setState(state: Partial<AgentState>): void;

  // Health monitoring
  healthCheck(): Promise<HealthStatus>;
}

// ============================================================================
// Base Agent Abstract Class
// ============================================================================

export abstract class BaseAgent implements Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly capabilities: string[];

  protected state: AgentState;
  protected startTime: number;
  protected processingTimes: number[];

  constructor(id: string, name: string, capabilities: string[], configuration: Record<string, any> = {}) {
    this.id = id;
    this.name = name;
    this.capabilities = capabilities;
    this.startTime = Date.now();
    this.processingTimes = [];

    // Initialize state
    this.state = {
      id,
      status: AgentStatus.INITIALIZING,
      currentTasks: [],
      completedTasks: 0,
      failedTasks: 0,
      averageProcessingTime: 0,
      lastHealthCheck: Date.now(),
      configuration,
    };
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      this.state.status = AgentStatus.INITIALIZING;
      await this.onInitialize();
      this.state.status = AgentStatus.READY;
    } catch (error) {
      this.state.status = AgentStatus.ERROR;
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.state.status = AgentStatus.SHUTDOWN;
      await this.onShutdown();
    } catch (error) {
      this.state.status = AgentStatus.ERROR;
      throw error;
    }
  }

  // Hook methods for subclasses to override
  protected async onInitialize(): Promise<void> {
    // Default implementation - subclasses can override
  }

  protected async onShutdown(): Promise<void> {
    // Default implementation - subclasses can override
  }

  // ============================================================================
  // Message Handling
  // ============================================================================

  async handleMessage(message: MessageObject): Promise<MessageResponse> {
    const startTime = Date.now();

    try {
      // Add task to current tasks
      this.state.currentTasks.push(message.id);
      this.state.status = AgentStatus.BUSY;

      // Process the message
      const result = await this.processMessage(message);

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, true);

      // Remove from current tasks
      this.state.currentTasks = this.state.currentTasks.filter(id => id !== message.id);
      this.state.status = this.state.currentTasks.length > 0 ? AgentStatus.BUSY : AgentStatus.READY;

      return {
        success: true,
        data: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      // Update metrics for failure
      const processingTime = Date.now() - startTime;
      this.updateMetrics(processingTime, false);

      // Remove from current tasks
      this.state.currentTasks = this.state.currentTasks.filter(id => id !== message.id);
      this.state.status = this.state.currentTasks.length > 0 ? AgentStatus.BUSY : AgentStatus.READY;

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      };
    }
  }

  canHandle(message: MessageObject): boolean {
    // Default implementation checks if agent can handle the message type
    return this.getSupportedMessageTypes().includes(message.type);
  }

  // Abstract method that subclasses must implement
  protected abstract processMessage(message: MessageObject): Promise<Record<string, any>>;

  // Abstract method that subclasses must implement to declare supported message types
  protected abstract getSupportedMessageTypes(): MessageType[];

  // ============================================================================
  // State Management
  // ============================================================================

  getState(): AgentState {
    return { ...this.state };
  }

  setState(updates: Partial<AgentState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
  }

  // ============================================================================
  // Health Monitoring
  // ============================================================================

  async healthCheck(): Promise<HealthStatus> {
    this.state.lastHealthCheck = Date.now();

    const healthy = this.state.status !== AgentStatus.ERROR && this.state.status !== AgentStatus.SHUTDOWN;
    const uptime = Date.now() - this.startTime;

    const errors: string[] = [];
    if (this.state.status === AgentStatus.ERROR) {
      errors.push('Agent is in ERROR state');
    }
    if (this.state.status === AgentStatus.SHUTDOWN) {
      errors.push('Agent is SHUTDOWN');
    }

    return {
      healthy,
      status: this.state.status,
      lastCheck: this.state.lastHealthCheck,
      uptime,
      metrics: {
        currentTasks: this.state.currentTasks.length,
        completedTasks: this.state.completedTasks,
        failedTasks: this.state.failedTasks,
        averageProcessingTime: this.state.averageProcessingTime,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private updateMetrics(processingTime: number, success: boolean): void {
    if (success) {
      this.state.completedTasks++;
    } else {
      this.state.failedTasks++;
    }

    // Track processing times (keep last 100 for rolling average)
    this.processingTimes.push(processingTime);
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }

    // Calculate average processing time
    const sum = this.processingTimes.reduce((acc, time) => acc + time, 0);
    this.state.averageProcessingTime = sum / this.processingTimes.length;
  }
}
