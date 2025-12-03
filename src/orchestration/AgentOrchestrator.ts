// Agent Orchestrator - Central coordination component for multi-agent system

import { Agent } from '../agents/Agent';
import { MessageBus, MessageHandler } from './MessageBus';
import { WorkflowStateManager } from './WorkflowStateManager';
import { ErrorHandler, ErrorContext } from './ErrorHandler';
import { SpecLoader, SpecLoaderConfig } from './SpecLoader';
import { PerformanceMonitor } from './PerformanceMonitor';
import { DebugManager, DebugConfig } from './DebugManager';
import { ResourceAllocator, ResourceAllocationConfig } from './ResourceAllocator';
import {
  MessageObject,
  WorkflowState,
  AgentStatus,
  MessageType,
  Priority,
  ErrorType,
  RetryPolicy,
  BackoffStrategy,
  AgentSpec
} from '../types';
import { EventEmitter } from 'events';

// ============================================================================
// Agent Orchestrator
// ============================================================================

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private messageBus: MessageBus;
  private workflowStateManager: WorkflowStateManager;
  private errorHandler: ErrorHandler;
  private specLoader?: SpecLoader;
  private performanceMonitor: PerformanceMonitor;
  private debugManager: DebugManager;
  private resourceAllocator: ResourceAllocator;
  private isInitialized: boolean = false;

  constructor(
    specLoaderConfig?: SpecLoaderConfig,
    debugConfig?: Partial<DebugConfig>,
    resourceConfig?: Partial<ResourceAllocationConfig>
  ) {
    super();
    this.messageBus = new MessageBus();
    this.workflowStateManager = new WorkflowStateManager();
    this.errorHandler = new ErrorHandler();
    this.performanceMonitor = new PerformanceMonitor();
    this.debugManager = new DebugManager(debugConfig);
    this.resourceAllocator = new ResourceAllocator(resourceConfig);
    
    if (specLoaderConfig) {
      this.specLoader = new SpecLoader(specLoaderConfig);
      this.setupSpecLoaderListeners();
    }
  }

  // ============================================================================
  // Lifecycle Management
  // ============================================================================

  /**
   * Initialize the orchestrator and all registered agents
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('AgentOrchestrator is already initialized');
    }

    try {
      // Initialize all agents
      const initPromises = Array.from(this.agents.values()).map(async (agent) => {
        try {
          await agent.initialize();
          
          // Register message handler for this agent
          const handler: MessageHandler = async (message: MessageObject) => {
            await this.handleAgentMessage(agent, message);
          };
          
          // Subscribe agent to all message types it can handle
          const supportedTypes = this.getSupportedMessageTypes(agent);
          this.messageBus.subscribe(agent.id, supportedTypes, handler);
        } catch (error) {
          throw new Error(`Failed to initialize agent ${agent.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

      await Promise.all(initPromises);

      this.isInitialized = true;

      // Emit system-ready event
      this.emit('system-ready');
    } catch (error) {
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Shutdown the orchestrator and all agents
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // Shutdown all agents
    const shutdownPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.shutdown();
        this.messageBus.unsubscribe(agent.id);
      } catch (error) {
        console.error(`Error shutting down agent ${agent.id}:`, error);
      }
    });

    await Promise.all(shutdownPromises);

    this.isInitialized = false;
    this.emit('system-shutdown');
  }

  /**
   * Check if the orchestrator is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // ============================================================================
  // Agent Registration
  // ============================================================================

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} is already registered`);
    }

    this.agents.set(agent.id, agent);
    
    // Register with resource allocator
    this.resourceAllocator.registerAgent(agent.id);

    // If system is already initialized, initialize this agent immediately
    if (this.isInitialized) {
      this.initializeAgent(agent).catch(error => {
        console.error(`Failed to initialize agent ${agent.id}:`, error);
      });
    }
  }

  /**
   * Deregister an agent from the orchestrator
   */
  async deregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} is not registered`);
    }

    // Shutdown the agent
    try {
      await agent.shutdown();
    } catch (error) {
      console.error(`Error shutting down agent ${agentId}:`, error);
    }

    // Unsubscribe from message bus
    this.messageBus.unsubscribe(agentId);
    
    // Deregister from resource allocator
    this.resourceAllocator.deregisterAgent(agentId);

    // Remove from agents map
    this.agents.delete(agentId);
  }

  /**
   * Get an agent by ID
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get count of registered agents
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  // ============================================================================
  // Spec Loading
  // ============================================================================

  /**
   * Load agent specifications from spec files
   */
  async loadSpecs(specs?: AgentSpec[]): Promise<AgentSpec[]> {
    if (specs) {
      // Validate all specs before loading
      for (const spec of specs) {
        const validation = this.validateSpec(spec);
        if (!validation.valid) {
          throw new Error(`Invalid agent specification for ${spec.id}:\n${validation.errors.join('\n')}`);
        }
      }
      return specs;
    }

    if (!this.specLoader) {
      throw new Error('SpecLoader not configured. Provide specs directly or configure SpecLoader.');
    }

    return await this.specLoader.loadSpecs();
  }

  /**
   * Validate an agent specification
   */
  validateSpec(spec: any): { valid: boolean; errors: string[] } {
    if (this.specLoader) {
      return this.specLoader.validateSpec(spec);
    }
    
    // Fallback validation
    const errors: string[] = [];
    if (!spec || typeof spec !== 'object') {
      errors.push('Spec must be an object');
    }
    if (!spec.id || typeof spec.id !== 'string') {
      errors.push('Spec must have a valid id');
    }
    if (!spec.name || typeof spec.name !== 'string') {
      errors.push('Spec must have a valid name');
    }
    if (!Array.isArray(spec.capabilities) || spec.capabilities.length === 0) {
      errors.push('Spec must have at least one capability');
    }
    if (!Array.isArray(spec.messageTypes) || spec.messageTypes.length === 0) {
      errors.push('Spec must have at least one message type');
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Get the spec loader
   */
  getSpecLoader(): SpecLoader | undefined {
    return this.specLoader;
  }

  /**
   * Generate agent code from a spec
   */
  generateAgentCode(spec: AgentSpec): string {
    if (!this.specLoader) {
      throw new Error('SpecLoader not configured');
    }
    return this.specLoader.generateAgentCode(spec);
  }

  // ============================================================================
  // Message Routing
  // ============================================================================

  /**
   * Send a message through the message bus
   */
  async sendMessage(message: MessageObject): Promise<void> {
    const startTime = Date.now();
    
    // Log message if debug mode is enabled
    this.debugManager.logMessage(message, 'pending');
    
    try {
      await this.messageBus.route(message);
      
      // Log successful delivery
      this.debugManager.logMessage(message, 'delivered');
      
      // Record routing latency
      const endTime = Date.now();
      this.performanceMonitor.recordRoutingLatency(
        message.id,
        message.sourceAgentId,
        message.targetAgentId,
        startTime,
        endTime
      );
    } catch (error) {
      // Log failed delivery
      this.debugManager.logMessage(
        message,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
      
      const context: ErrorContext = {
        workflowId: message.workflowId,
        agentId: message.sourceAgentId,
        operation: 'sendMessage',
        timestamp: Date.now(),
        additionalData: { messageId: message.id, messageType: message.type }
      };

      await this.errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );

      throw error;
    }
  }

  /**
   * Send a message with retry logic
   */
  async sendMessageWithRetry(
    message: MessageObject,
    retryPolicy?: RetryPolicy
  ): Promise<void> {
    const policy = retryPolicy || this.getDefaultRetryPolicy();
    
    const result = await this.messageBus.sendWithRetry(message, policy);

    if (!result.success) {
      throw result.error || new Error('Message delivery failed after retries');
    }
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcastMessage(message: MessageObject): Promise<void> {
    // Set targetAgentId to null for broadcast
    const broadcastMessage: MessageObject = {
      ...message,
      targetAgentId: null
    };

    await this.sendMessage(broadcastMessage);
  }

  // ============================================================================
  // Workflow State Management
  // ============================================================================

  /**
   * Get workflow state
   */
  getWorkflowState(workflowId: string): WorkflowState {
    return this.workflowStateManager.getWorkflow(workflowId);
  }

  /**
   * Update workflow state
   */
  updateWorkflowState(workflowId: string, updates: Partial<WorkflowState>): void {
    this.workflowStateManager.updateWorkflow(workflowId, updates);
    
    // Capture workflow state snapshot if debug mode is enabled
    const updatedState = this.workflowStateManager.getWorkflow(workflowId);
    this.debugManager.captureWorkflowState(updatedState);
  }

  /**
   * Create a new workflow
   */
  createWorkflow(workflowId: string, initialState?: Partial<WorkflowState>): WorkflowState {
    const workflow = this.workflowStateManager.createWorkflow(workflowId, initialState);
    
    // Capture initial workflow state snapshot if debug mode is enabled
    this.debugManager.captureWorkflowState(workflow);
    
    return workflow;
  }

  /**
   * Get the workflow state manager
   */
  getWorkflowStateManager(): WorkflowStateManager {
    return this.workflowStateManager;
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  /**
   * Handle an agent error
   */
  async handleAgentError(agentId: string, error: Error, context: ErrorContext): Promise<void> {
    const { logEntry, strategy } = await this.errorHandler.handleError(error, context);

    // If this is a critical error, mark agent as ERROR
    if (logEntry.errorType === ErrorType.SYSTEM) {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.setState({ status: AgentStatus.ERROR });
      }
    }

    // Emit error event
    this.emit('agent-error', { agentId, error, logEntry, strategy });
  }

  /**
   * Retry a failed task
   */
  async retryTask(_taskId: string): Promise<void> {
    // This is a placeholder for task retry logic
    // In a full implementation, this would:
    // 1. Get the task from workflow state
    // 2. Create a new message to retry the task
    // 3. Send the message with retry policy
    throw new Error('retryTask not yet implemented');
  }

  /**
   * Get the error handler
   */
  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  /**
   * Get the message bus
   */
  getMessageBus(): MessageBus {
    return this.messageBus;
  }

  /**
   * Get the performance monitor
   */
  getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor;
  }

  /**
   * Get the debug manager
   */
  getDebugManager(): DebugManager {
    return this.debugManager;
  }

  /**
   * Get the resource allocator
   */
  getResourceAllocator(): ResourceAllocator {
    return this.resourceAllocator;
  }

  /**
   * Enable debug mode
   */
  enableDebugMode(): void {
    this.debugManager.enable();
  }

  /**
   * Disable debug mode
   */
  disableDebugMode(): void {
    this.debugManager.disable();
  }

  /**
   * Replay message sequence for a workflow
   */
  async replayWorkflow(workflowId: string): Promise<any> {
    return await this.debugManager.replayMessageSequence(
      workflowId,
      this.messageBus,
      this.workflowStateManager,
      this.agents
    );
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Initialize a single agent
   */
  private async initializeAgent(agent: Agent): Promise<void> {
    await agent.initialize();
    
    const handler: MessageHandler = async (message: MessageObject) => {
      await this.handleAgentMessage(agent, message);
    };
    
    const supportedTypes = this.getSupportedMessageTypes(agent);
    this.messageBus.subscribe(agent.id, supportedTypes, handler);
  }

  /**
   * Handle a message for a specific agent
   */
  private async handleAgentMessage(agent: Agent, message: MessageObject): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;
    
    // Capture agent state before processing
    this.debugManager.captureAgentState(agent);
    
    try {
      const response = await agent.handleMessage(message);
      success = response.success;
      
      if (!response.success && response.error) {
        errorMessage = response.error;
        
        const context: ErrorContext = {
          workflowId: message.workflowId,
          agentId: agent.id,
          operation: 'handleMessage',
          timestamp: Date.now(),
          additionalData: { messageId: message.id, messageType: message.type }
        };

        await this.handleAgentError(
          agent.id,
          new Error(response.error),
          context
        );
      }
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      
      const context: ErrorContext = {
        workflowId: message.workflowId,
        agentId: agent.id,
        operation: 'handleMessage',
        timestamp: Date.now(),
        additionalData: { messageId: message.id, messageType: message.type }
      };

      await this.handleAgentError(
        agent.id,
        error instanceof Error ? error : new Error(String(error)),
        context
      );
    } finally {
      // Capture agent state after processing
      this.debugManager.captureAgentState(agent);
      
      // Record agent processing time
      const endTime = Date.now();
      this.performanceMonitor.recordAgentProcessing(
        agent.id,
        message.id,
        startTime,
        endTime,
        success,
        errorMessage
      );
    }
  }

  /**
   * Get supported message types for an agent
   */
  private getSupportedMessageTypes(agent: Agent): MessageType[] {
    // Try all message types and see which ones the agent can handle
    const supportedTypes: MessageType[] = [];
    
    for (const messageType of Object.values(MessageType)) {
      const testMessage: MessageObject = {
        id: 'test',
        type: messageType,
        workflowId: 'test',
        sourceAgentId: 'test',
        targetAgentId: agent.id,
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      if (agent.canHandle(testMessage)) {
        supportedTypes.push(messageType);
      }
    }

    return supportedTypes;
  }

  /**
   * Get default retry policy
   */
  private getDefaultRetryPolicy(): RetryPolicy {
    return {
      maxRetries: 3,
      backoffStrategy: BackoffStrategy.EXPONENTIAL,
      retryableErrors: [ErrorType.TRANSIENT],
      timeout: 5000
    };
  }

  /**
   * Setup spec loader event listeners
   */
  private setupSpecLoaderListeners(): void {
    if (!this.specLoader) {
      return;
    }

    this.specLoader.on('spec-changed', (event) => {
      this.emit('spec-changed', event);
    });

    this.specLoader.on('regenerate-required', (event) => {
      this.emit('regenerate-required', event);
    });

    this.specLoader.on('spec-error', (error) => {
      this.emit('spec-error', error);
    });
  }
}
