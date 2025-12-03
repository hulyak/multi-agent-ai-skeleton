import { ErrorType, RetryPolicy, BackoffStrategy } from '../types';

// ============================================================================
// Error Context and Logging
// ============================================================================

export interface ErrorContext {
  workflowId: string;
  taskId?: string;
  agentId: string;
  operation: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

export interface ErrorLogEntry {
  id: string;
  error: Error;
  errorType: ErrorType;
  context: ErrorContext;
  stackTrace: string;
  timestamp: number;
}

// ============================================================================
// Error Classification
// ============================================================================

export class ErrorClassifier {
  /**
   * Classify an error into one of the four error categories
   */
  classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('malformed') ||
      message.includes('missing required') ||
      name.includes('validation')
    ) {
      return ErrorType.VALIDATION;
    }

    // System errors
    if (
      message.includes('system') ||
      message.includes('critical') ||
      message.includes('infrastructure') ||
      message.includes('message bus') ||
      message.includes('state store') ||
      name.includes('system')
    ) {
      return ErrorType.SYSTEM;
    }

    // Business logic errors
    if (
      message.includes('business') ||
      message.includes('logic') ||
      message.includes('not found') ||
      message.includes('classification') ||
      message.includes('processing') ||
      name.includes('business')
    ) {
      return ErrorType.BUSINESS_LOGIC;
    }

    // Default to transient for network, timeout, and unknown errors
    return ErrorType.TRANSIENT;
  }
}

// ============================================================================
// Error Logger
// ============================================================================

export class ErrorLogger {
  private logs: Map<string, ErrorLogEntry> = new Map();
  private classifier: ErrorClassifier = new ErrorClassifier();

  /**
   * Log an error with context
   */
  log(error: Error, context: ErrorContext): ErrorLogEntry {
    const logId = `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const entry: ErrorLogEntry = {
      id: logId,
      error,
      errorType: this.classifier.classifyError(error),
      context,
      stackTrace: error.stack || 'No stack trace available',
      timestamp: Date.now()
    };

    this.logs.set(logId, entry);

    // Also log to console for debugging
    console.error(
      `[${entry.errorType}] Error in ${context.operation} (Agent: ${context.agentId}, Workflow: ${context.workflowId}):`,
      error.message
    );

    return entry;
  }

  /**
   * Get all error logs
   */
  getAllLogs(): ErrorLogEntry[] {
    return Array.from(this.logs.values());
  }

  /**
   * Get error logs for a specific workflow
   */
  getLogsByWorkflow(workflowId: string): ErrorLogEntry[] {
    return Array.from(this.logs.values()).filter(
      entry => entry.context.workflowId === workflowId
    );
  }

  /**
   * Get error logs for a specific agent
   */
  getLogsByAgent(agentId: string): ErrorLogEntry[] {
    return Array.from(this.logs.values()).filter(
      entry => entry.context.agentId === agentId
    );
  }

  /**
   * Get error logs by type
   */
  getLogsByType(errorType: ErrorType): ErrorLogEntry[] {
    return Array.from(this.logs.values()).filter(
      entry => entry.errorType === errorType
    );
  }

  /**
   * Get a specific error log by ID
   */
  getLog(logId: string): ErrorLogEntry | undefined {
    return this.logs.get(logId);
  }

  /**
   * Clear all logs (useful for testing)
   */
  clearLogs(): void {
    this.logs.clear();
  }

  /**
   * Get error count by type
   */
  getErrorCountByType(): Record<ErrorType, number> {
    const counts: Record<ErrorType, number> = {
      [ErrorType.TRANSIENT]: 0,
      [ErrorType.VALIDATION]: 0,
      [ErrorType.BUSINESS_LOGIC]: 0,
      [ErrorType.SYSTEM]: 0
    };

    for (const entry of this.logs.values()) {
      counts[entry.errorType]++;
    }

    return counts;
  }
}

// ============================================================================
// Failure Notification System
// ============================================================================

export interface FailureNotification {
  failedAgentId: string;
  error: Error;
  errorType: ErrorType;
  context: ErrorContext;
  timestamp: number;
}

export type FailureNotificationHandler = (notification: FailureNotification) => Promise<void>;

export class FailureNotificationSystem {
  private dependencies: Map<string, Set<string>> = new Map();
  private notificationHandlers: Map<string, FailureNotificationHandler> = new Map();

  /**
   * Register a dependency relationship (dependentAgent depends on sourceAgent)
   */
  registerDependency(sourceAgentId: string, dependentAgentId: string): void {
    if (!this.dependencies.has(sourceAgentId)) {
      this.dependencies.set(sourceAgentId, new Set());
    }
    this.dependencies.get(sourceAgentId)!.add(dependentAgentId);
  }

  /**
   * Remove a dependency relationship
   */
  removeDependency(sourceAgentId: string, dependentAgentId: string): void {
    const dependents = this.dependencies.get(sourceAgentId);
    if (dependents) {
      dependents.delete(dependentAgentId);
    }
  }

  /**
   * Get all agents that depend on a given agent
   */
  getDependents(agentId: string): string[] {
    return Array.from(this.dependencies.get(agentId) || []);
  }

  /**
   * Register a notification handler for an agent
   */
  registerNotificationHandler(agentId: string, handler: FailureNotificationHandler): void {
    this.notificationHandlers.set(agentId, handler);
  }

  /**
   * Notify dependent agents of a failure
   */
  async notifyDependents(
    failedAgentId: string,
    error: Error,
    errorType: ErrorType,
    context: ErrorContext
  ): Promise<void> {
    const dependents = this.getDependents(failedAgentId);

    const notification: FailureNotification = {
      failedAgentId,
      error,
      errorType,
      context,
      timestamp: Date.now()
    };

    const notificationPromises = dependents.map(async (dependentId) => {
      const handler = this.notificationHandlers.get(dependentId);
      if (handler) {
        try {
          await handler(notification);
        } catch (handlerError) {
          console.error(
            `Failed to notify dependent agent ${dependentId} of failure in ${failedAgentId}:`,
            handlerError
          );
        }
      }
    });

    await Promise.all(notificationPromises);
  }

  /**
   * Clear all dependencies (useful for testing)
   */
  clearDependencies(): void {
    this.dependencies.clear();
  }

  /**
   * Clear all notification handlers (useful for testing)
   */
  clearHandlers(): void {
    this.notificationHandlers.clear();
  }
}

// ============================================================================
// Integrated Error Handler
// ============================================================================

export interface ErrorHandlingStrategy {
  shouldRetry: boolean;
  retryPolicy?: RetryPolicy;
  notifyDependents: boolean;
  escalate: boolean;
}

export class ErrorHandler {
  private logger: ErrorLogger;
  private notificationSystem: FailureNotificationSystem;

  constructor() {
    this.logger = new ErrorLogger();
    // Classifier instantiated but not used in current implementation
    new ErrorClassifier();
    this.notificationSystem = new FailureNotificationSystem();
  }

  /**
   * Get the error logger
   */
  getLogger(): ErrorLogger {
    return this.logger;
  }

  /**
   * Get the notification system
   */
  getNotificationSystem(): FailureNotificationSystem {
    return this.notificationSystem;
  }

  /**
   * Handle an error with appropriate strategy
   */
  async handleError(
    error: Error,
    context: ErrorContext
  ): Promise<{ logEntry: ErrorLogEntry; strategy: ErrorHandlingStrategy }> {
    // Log the error
    const logEntry = this.logger.log(error, context);

    // Determine handling strategy based on error type
    const strategy = this.determineStrategy(logEntry.errorType);

    // Notify dependent agents if needed
    if (strategy.notifyDependents) {
      await this.notificationSystem.notifyDependents(
        context.agentId,
        error,
        logEntry.errorType,
        context
      );
    }

    return { logEntry, strategy };
  }

  /**
   * Determine error handling strategy based on error type
   */
  private determineStrategy(errorType: ErrorType): ErrorHandlingStrategy {
    switch (errorType) {
      case ErrorType.TRANSIENT:
        return {
          shouldRetry: true,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: BackoffStrategy.EXPONENTIAL,
            retryableErrors: [ErrorType.TRANSIENT],
            timeout: 5000
          },
          notifyDependents: false,
          escalate: false
        };

      case ErrorType.VALIDATION:
        return {
          shouldRetry: false,
          notifyDependents: false,
          escalate: false
        };

      case ErrorType.BUSINESS_LOGIC:
        return {
          shouldRetry: true,
          retryPolicy: {
            maxRetries: 2,
            backoffStrategy: BackoffStrategy.LINEAR,
            retryableErrors: [ErrorType.BUSINESS_LOGIC],
            timeout: 3000
          },
          notifyDependents: false,
          escalate: false
        };

      case ErrorType.SYSTEM:
        return {
          shouldRetry: false,
          notifyDependents: true,
          escalate: true
        };

      default:
        return {
          shouldRetry: false,
          notifyDependents: false,
          escalate: false
        };
    }
  }

  /**
   * Get default retry policy for an error type
   */
  getDefaultRetryPolicy(errorType: ErrorType): RetryPolicy | undefined {
    const strategy = this.determineStrategy(errorType);
    return strategy.retryPolicy;
  }
}
