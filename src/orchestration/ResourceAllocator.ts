// Resource Allocator - Fair scheduling and resource management for concurrent agents

import { Agent } from '../agents/Agent';
import { MessageObject, Priority } from '../types';

// ============================================================================
// Interfaces
// ============================================================================

export interface ResourceMetrics {
  agentId: string;
  messagesProcessed: number;
  lastProcessedTime: number;
  averageProcessingTime: number;
  queueSize: number;
  isStarved: boolean;
}

export interface SchedulingDecision {
  agentId: string;
  priority: number;
  reason: string;
}

export interface ResourceAllocationConfig {
  starvationThresholdMs: number; // Time without processing before considered starved
  fairnessWindow: number; // Number of recent messages to consider for fairness
  priorityBoostForStarved: number; // Priority boost for starved agents
}

// ============================================================================
// Resource Allocator
// ============================================================================

export class ResourceAllocator {
  private agentMetrics: Map<string, ResourceMetrics> = new Map();
  private messageQueues: Map<string, MessageObject[]> = new Map();
  private config: ResourceAllocationConfig;

  constructor(config?: Partial<ResourceAllocationConfig>) {
    this.config = {
      starvationThresholdMs: config?.starvationThresholdMs ?? 5000,
      fairnessWindow: config?.fairnessWindow ?? 100,
      priorityBoostForStarved: config?.priorityBoostForStarved ?? 10
    };
  }

  /**
   * Register an agent for resource allocation
   */
  registerAgent(agentId: string): void {
    if (!this.agentMetrics.has(agentId)) {
      this.agentMetrics.set(agentId, {
        agentId,
        messagesProcessed: 0,
        lastProcessedTime: Date.now(),
        averageProcessingTime: 0,
        queueSize: 0,
        isStarved: false
      });
      this.messageQueues.set(agentId, []);
    }
  }

  /**
   * Deregister an agent from resource allocation
   */
  deregisterAgent(agentId: string): void {
    this.agentMetrics.delete(agentId);
    this.messageQueues.delete(agentId);
  }

  /**
   * Enqueue a message for an agent
   */
  enqueueMessage(agentId: string, message: MessageObject): void {
    const queue = this.messageQueues.get(agentId);
    if (!queue) {
      throw new Error(`Agent ${agentId} not registered with ResourceAllocator`);
    }

    queue.push(message);
    
    // Update queue size metric
    const metrics = this.agentMetrics.get(agentId);
    if (metrics) {
      metrics.queueSize = queue.length;
    }
  }

  /**
   * Dequeue the next message for an agent using fair scheduling
   */
  dequeueMessage(agentId: string): MessageObject | undefined {
    const queue = this.messageQueues.get(agentId);
    if (!queue || queue.length === 0) {
      return undefined;
    }

    // Sort queue by priority and fairness considerations
    queue.sort((a, b) => {
      // Higher priority messages first
      if (a.metadata.priority !== b.metadata.priority) {
        return b.metadata.priority - a.metadata.priority;
      }
      // Then by timestamp (FIFO for same priority)
      return a.metadata.timestamp - b.metadata.timestamp;
    });

    const message = queue.shift();
    
    // Update queue size metric
    const metrics = this.agentMetrics.get(agentId);
    if (metrics) {
      metrics.queueSize = queue.length;
    }

    return message;
  }

  /**
   * Record that an agent processed a message
   */
  recordProcessing(agentId: string, processingTime: number): void {
    const metrics = this.agentMetrics.get(agentId);
    if (!metrics) {
      return;
    }

    metrics.messagesProcessed++;
    metrics.lastProcessedTime = Date.now();
    
    // Update average processing time (exponential moving average)
    if (metrics.averageProcessingTime === 0) {
      metrics.averageProcessingTime = processingTime;
    } else {
      metrics.averageProcessingTime = 
        0.7 * metrics.averageProcessingTime + 0.3 * processingTime;
    }

    // Check if agent is no longer starved
    metrics.isStarved = false;
  }

  /**
   * Detect and mark starved agents
   */
  detectStarvation(): string[] {
    const now = Date.now();
    const starvedAgents: string[] = [];

    for (const [agentId, metrics] of this.agentMetrics.entries()) {
      const timeSinceLastProcessing = now - metrics.lastProcessedTime;
      const hasQueuedMessages = metrics.queueSize > 0;

      // Agent is starved if it has messages but hasn't processed any recently
      if (hasQueuedMessages && timeSinceLastProcessing > this.config.starvationThresholdMs) {
        metrics.isStarved = true;
        starvedAgents.push(agentId);
      }
    }

    return starvedAgents;
  }

  /**
   * Get the next agent to schedule based on fair scheduling algorithm
   */
  scheduleNextAgent(availableAgents: string[]): SchedulingDecision | null {
    if (availableAgents.length === 0) {
      return null;
    }

    // Detect starvation first
    this.detectStarvation();

    // Calculate priority for each agent
    const agentPriorities: Array<{ agentId: string; priority: number; reason: string }> = [];

    for (const agentId of availableAgents) {
      const metrics = this.agentMetrics.get(agentId);
      if (!metrics || metrics.queueSize === 0) {
        continue;
      }

      let priority = 0;
      let reason = '';

      // Boost priority for starved agents
      if (metrics.isStarved) {
        priority += this.config.priorityBoostForStarved;
        reason = 'starved agent';
      }

      // Consider queue size (agents with more messages get slight priority)
      priority += Math.min(metrics.queueSize / 10, 5);

      // Consider how long since last processing (fairness)
      const timeSinceLastProcessing = Date.now() - metrics.lastProcessedTime;
      priority += Math.min(timeSinceLastProcessing / 1000, 5);

      // Inverse priority based on messages processed (give less-processed agents priority)
      const avgProcessed = this.getAverageMessagesProcessed();
      if (avgProcessed > 0 && metrics.messagesProcessed < avgProcessed) {
        priority += 3;
        reason = reason || 'below average processing';
      }

      if (!reason) {
        reason = 'fair scheduling';
      }

      agentPriorities.push({ agentId, priority, reason });
    }

    if (agentPriorities.length === 0) {
      return null;
    }

    // Sort by priority (highest first)
    agentPriorities.sort((a, b) => b.priority - a.priority);

    return agentPriorities[0];
  }

  /**
   * Get resource metrics for an agent
   */
  getAgentMetrics(agentId: string): ResourceMetrics | undefined {
    return this.agentMetrics.get(agentId);
  }

  /**
   * Get all resource metrics
   */
  getAllMetrics(): Map<string, ResourceMetrics> {
    return new Map(this.agentMetrics);
  }

  /**
   * Get queue size for an agent
   */
  getQueueSize(agentId: string): number {
    return this.messageQueues.get(agentId)?.length ?? 0;
  }

  /**
   * Check if any agents are starved
   */
  hasStarvedAgents(): boolean {
    for (const metrics of this.agentMetrics.values()) {
      if (metrics.isStarved) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get list of starved agents
   */
  getStarvedAgents(): string[] {
    const starved: string[] = [];
    for (const [agentId, metrics] of this.agentMetrics.entries()) {
      if (metrics.isStarved) {
        starved.push(agentId);
      }
    }
    return starved;
  }

  /**
   * Reset metrics for all agents
   */
  reset(): void {
    for (const metrics of this.agentMetrics.values()) {
      metrics.messagesProcessed = 0;
      metrics.lastProcessedTime = Date.now();
      metrics.averageProcessingTime = 0;
      metrics.queueSize = 0;
      metrics.isStarved = false;
    }
    
    for (const queue of this.messageQueues.values()) {
      queue.length = 0;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getAverageMessagesProcessed(): number {
    if (this.agentMetrics.size === 0) {
      return 0;
    }

    let total = 0;
    for (const metrics of this.agentMetrics.values()) {
      total += metrics.messagesProcessed;
    }

    return total / this.agentMetrics.size;
  }
}
