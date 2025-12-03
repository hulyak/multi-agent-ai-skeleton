import {
  MessageObject,
  MessageType,
  RetryPolicy,
  BackoffStrategy,
  ErrorType,
  isMessageObject,
  validateMessageObject
} from '../types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface MessageHandler {
  (message: MessageObject): Promise<void>;
}

export interface Subscription {
  agentId: string;
  messageTypes: MessageType[];
  handler: MessageHandler;
}

export interface DeliveryMetrics {
  totalMessages: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  retriedMessages: number;
  averageDeliveryTime: number;
}

export interface DeliveryResult {
  success: boolean;
  attempts: number;
  error?: Error;
}

// ============================================================================
// Retry Logic
// ============================================================================

export class RetryManager {
  /**
   * Calculate backoff delay based on strategy and attempt number
   */
  calculateBackoff(
    strategy: BackoffStrategy,
    attemptNumber: number,
    baseDelay: number = 1000
  ): number {
    switch (strategy) {
      case BackoffStrategy.FIXED:
        return baseDelay;
      
      case BackoffStrategy.LINEAR:
        return baseDelay * attemptNumber;
      
      case BackoffStrategy.EXPONENTIAL:
        return baseDelay * Math.pow(2, attemptNumber - 1);
      
      default:
        return baseDelay;
    }
  }

  /**
   * Determine if an error is retryable based on policy
   */
  isRetryableError(error: Error, policy: RetryPolicy): boolean {
    // For now, we'll classify errors based on their message
    // In a real system, you'd have more sophisticated error classification
    const errorMessage = error.message.toLowerCase();
    
    // Classify the error type based on message content
    let errorType: ErrorType;
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      errorType = ErrorType.VALIDATION;
    } else if (errorMessage.includes('business') || errorMessage.includes('logic')) {
      errorType = ErrorType.BUSINESS_LOGIC;
    } else if (errorMessage.includes('system') || errorMessage.includes('critical')) {
      errorType = ErrorType.SYSTEM;
    } else {
      // Default to TRANSIENT for timeout, network, simulated, or unknown errors
      errorType = ErrorType.TRANSIENT;
    }
    
    // Check if this error type is retryable according to the policy
    return policy.retryableErrors.includes(errorType);
  }

  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    policy: RetryPolicy,
    onRetry?: (attempt: number, error: Error) => void,
    baseDelay: number = 1000
  ): Promise<{ result?: T; success: boolean; attempts: number; error?: Error }> {
    let lastError: Error | undefined;
    let attempts = 0;

    while (attempts <= policy.maxRetries) {
      attempts++;
      
      try {
        const result = await Promise.race([
          operation(),
          this.timeout(policy.timeout)
        ]);
        
        return { result, success: true, attempts };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if we should retry
        const shouldRetry = 
          attempts <= policy.maxRetries && 
          this.isRetryableError(lastError, policy);
        
        if (!shouldRetry) {
          break;
        }
        
        // Calculate backoff and wait
        if (attempts <= policy.maxRetries) {
          const delay = this.calculateBackoff(policy.backoffStrategy, attempts, baseDelay);
          onRetry?.(attempts, lastError);
          await this.sleep(delay);
        }
      }
    }

    return { success: false, attempts, error: lastError };
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Message Bus
// ============================================================================

export class MessageBus {
  private subscriptions: Map<string, Subscription> = new Map();
  private messageHistory: Map<string, MessageObject[]> = new Map();
  private retryManager: RetryManager = new RetryManager();
  private metrics: DeliveryMetrics = {
    totalMessages: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    retriedMessages: 0,
    averageDeliveryTime: 0
  };
  private deliveryTimes: number[] = [];

  /**
   * Subscribe an agent to receive specific message types
   */
  subscribe(agentId: string, messageTypes: MessageType[], handler: MessageHandler): void {
    if (!agentId || agentId.trim() === '') {
      throw new Error('Agent ID must be a non-empty string');
    }

    if (!Array.isArray(messageTypes) || messageTypes.length === 0) {
      throw new Error('Message types must be a non-empty array');
    }

    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    this.subscriptions.set(agentId, {
      agentId,
      messageTypes,
      handler
    });
  }

  /**
   * Unsubscribe an agent from receiving messages
   */
  unsubscribe(agentId: string): void {
    this.subscriptions.delete(agentId);
  }

  /**
   * Check if an agent has registered handlers
   */
  hasHandlers(agentId: string): boolean {
    return this.subscriptions.has(agentId);
  }

  /**
   * Route a message to the appropriate agent(s)
   */
  async route(message: MessageObject): Promise<void> {
    // Validate message
    const validation = validateMessageObject(message);
    if (!validation.valid) {
      throw new Error(`Invalid message: ${validation.errors.join(', ')}`);
    }

    const startTime = Date.now();

    // Add to message history
    this.addToHistory(message);

    if (message.targetAgentId === null) {
      // Broadcast to all subscribed agents
      await this.broadcast(message);
    } else {
      // Route to specific agent
      await this.routeToAgent(message, message.targetAgentId);
    }

    this.recordDeliveryTime(Date.now() - startTime);
  }

  /**
   * Send a message with retry logic
   */
  async sendWithRetry(
    message: MessageObject,
    retryPolicy: RetryPolicy,
    baseDelay: number = 1000
  ): Promise<DeliveryResult> {
    const result = await this.retryManager.executeWithRetry(
      async () => {
        this.metrics.totalMessages++;
        try {
          await this.route(message);
          this.metrics.successfulDeliveries++;
        } catch (error) {
          this.metrics.failedDeliveries++;
          throw error;
        }
      },
      retryPolicy,
      (attempt, error) => {
        // Update retry count in message metadata
        message.metadata.retryCount = attempt;
        this.metrics.retriedMessages++;
        
        // Log retry attempt
        console.log(
          `Retry attempt ${attempt} for message ${message.id}: ${error.message}`
        );
      },
      baseDelay
    );

    return {
      success: result.success,
      attempts: result.attempts,
      error: result.error
    };
  }

  /**
   * Get message history for a workflow
   */
  getMessageHistory(workflowId: string): MessageObject[] {
    return this.messageHistory.get(workflowId) || [];
  }

  /**
   * Get delivery metrics
   */
  getDeliveryMetrics(): DeliveryMetrics {
    return { ...this.metrics };
  }

  /**
   * Clear message history (useful for testing)
   */
  clearHistory(): void {
    this.messageHistory.clear();
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      totalMessages: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      retriedMessages: 0,
      averageDeliveryTime: 0
    };
    this.deliveryTimes = [];
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async routeToAgent(message: MessageObject, targetAgentId: string): Promise<void> {
    const subscription = this.subscriptions.get(targetAgentId);

    if (!subscription) {
      throw new Error(`No subscription found for agent: ${targetAgentId}`);
    }

    // Check if agent is subscribed to this message type
    if (!subscription.messageTypes.includes(message.type)) {
      throw new Error(
        `Agent ${targetAgentId} is not subscribed to message type: ${message.type}`
      );
    }

    // Deliver message to agent's handler
    await subscription.handler(message);
  }

  private async broadcast(message: MessageObject): Promise<void> {
    const deliveryPromises: Promise<void>[] = [];

    for (const subscription of this.subscriptions.values()) {
      // Only send to agents subscribed to this message type
      if (subscription.messageTypes.includes(message.type)) {
        deliveryPromises.push(
          subscription.handler(message).catch(error => {
            console.error(
              `Failed to deliver broadcast message to ${subscription.agentId}:`,
              error
            );
            throw error;
          })
        );
      }
    }

    if (deliveryPromises.length === 0) {
      throw new Error(`No agents subscribed to message type: ${message.type}`);
    }

    await Promise.all(deliveryPromises);
  }

  private addToHistory(message: MessageObject): void {
    const history = this.messageHistory.get(message.workflowId) || [];
    history.push(message);
    this.messageHistory.set(message.workflowId, history);
  }

  private recordDeliveryTime(time: number): void {
    this.deliveryTimes.push(time);
    
    // Calculate average
    const sum = this.deliveryTimes.reduce((acc, t) => acc + t, 0);
    this.metrics.averageDeliveryTime = sum / this.deliveryTimes.length;
  }
}
