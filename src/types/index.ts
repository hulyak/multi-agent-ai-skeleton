// Core Type Definitions for Multi-Agent AI Skeleton

// ============================================================================
// Enums
// ============================================================================

export enum MessageType {
  TASK_REQUEST = 'TASK_REQUEST',
  TASK_RESPONSE = 'TASK_RESPONSE',
  TASK_DELEGATION = 'TASK_DELEGATION',
  STATE_UPDATE = 'STATE_UPDATE',
  ERROR = 'ERROR',
  HEALTH_CHECK = 'HEALTH_CHECK'
}

export enum Priority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING'
}

export enum AgentStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  SHUTDOWN = 'SHUTDOWN'
}

export enum BackoffStrategy {
  FIXED = 'FIXED',
  EXPONENTIAL = 'EXPONENTIAL',
  LINEAR = 'LINEAR'
}

// ============================================================================
// Core Interfaces
// ============================================================================

export interface MessageMetadata {
  timestamp: number;
  priority: Priority;
  retryCount: number;
  parentMessageId?: string;
}

export interface MessageObject {
  id: string;
  type: MessageType;
  workflowId: string;
  sourceAgentId: string;
  targetAgentId: string | null; // null for broadcast
  payload: Record<string, any>;
  metadata: MessageMetadata;
}

export interface Task {
  id: string;
  agentId: string;
  status: TaskStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: Error;
  retryCount: number;
  parentTaskId?: string;
  childTaskIds: string[];
  createdAt: number;
  completedAt?: number;
}

export interface WorkflowMetadata {
  createdAt: number;
  updatedAt: number;
  initiatorId: string;
}

export interface WorkflowState {
  id: string;
  status: WorkflowStatus;
  tasks: Map<string, Task>;
  sharedData: Record<string, any>;
  metadata: WorkflowMetadata;
}

export interface AgentState {
  id: string;
  status: AgentStatus;
  currentTasks: string[];
  completedTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  lastHealthCheck: number;
  configuration: Record<string, any>;
}

export enum ErrorType {
  TRANSIENT = 'TRANSIENT',
  VALIDATION = 'VALIDATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  SYSTEM = 'SYSTEM'
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: ErrorType[];
  timeout: number;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isMessageType(value: any): value is MessageType {
  return Object.values(MessageType).includes(value);
}

export function isPriority(value: any): value is Priority {
  return Object.values(Priority).includes(value);
}

export function isWorkflowStatus(value: any): value is WorkflowStatus {
  return Object.values(WorkflowStatus).includes(value);
}

export function isTaskStatus(value: any): value is TaskStatus {
  return Object.values(TaskStatus).includes(value);
}

export function isAgentStatus(value: any): value is AgentStatus {
  return Object.values(AgentStatus).includes(value);
}

export function isBackoffStrategy(value: any): value is BackoffStrategy {
  return Object.values(BackoffStrategy).includes(value);
}

export function isErrorType(value: any): value is ErrorType {
  return Object.values(ErrorType).includes(value);
}

export function isMessageMetadata(value: any): value is MessageMetadata {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.timestamp === 'number' &&
    isPriority(value.priority) &&
    typeof value.retryCount === 'number' &&
    (value.parentMessageId === undefined || typeof value.parentMessageId === 'string')
  );
}

export function isMessageObject(value: any): value is MessageObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    isMessageType(value.type) &&
    typeof value.workflowId === 'string' &&
    typeof value.sourceAgentId === 'string' &&
    (value.targetAgentId === null || typeof value.targetAgentId === 'string') &&
    typeof value.payload === 'object' &&
    value.payload !== null &&
    isMessageMetadata(value.metadata)
  );
}

export function isTask(value: any): value is Task {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.agentId === 'string' &&
    isTaskStatus(value.status) &&
    typeof value.input === 'object' &&
    value.input !== null &&
    (value.output === undefined || (typeof value.output === 'object' && value.output !== null)) &&
    (value.error === undefined || value.error instanceof Error) &&
    typeof value.retryCount === 'number' &&
    (value.parentTaskId === undefined || typeof value.parentTaskId === 'string') &&
    Array.isArray(value.childTaskIds) &&
    value.childTaskIds.every((id: any) => typeof id === 'string') &&
    typeof value.createdAt === 'number' &&
    (value.completedAt === undefined || typeof value.completedAt === 'number')
  );
}

export function isWorkflowMetadata(value: any): value is WorkflowMetadata {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    typeof value.initiatorId === 'string'
  );
}

export function isWorkflowState(value: any): value is WorkflowState {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    isWorkflowStatus(value.status) &&
    value.tasks instanceof Map &&
    typeof value.sharedData === 'object' &&
    value.sharedData !== null &&
    isWorkflowMetadata(value.metadata)
  );
}

export function isAgentState(value: any): value is AgentState {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    isAgentStatus(value.status) &&
    Array.isArray(value.currentTasks) &&
    value.currentTasks.every((id: any) => typeof id === 'string') &&
    typeof value.completedTasks === 'number' &&
    typeof value.failedTasks === 'number' &&
    typeof value.averageProcessingTime === 'number' &&
    typeof value.lastHealthCheck === 'number' &&
    typeof value.configuration === 'object' &&
    value.configuration !== null
  );
}

export function isRetryPolicy(value: any): value is RetryPolicy {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.maxRetries === 'number' &&
    isBackoffStrategy(value.backoffStrategy) &&
    Array.isArray(value.retryableErrors) &&
    value.retryableErrors.every((err: any) => isErrorType(err)) &&
    typeof value.timeout === 'number'
  );
}

// ============================================================================
// Validation Functions
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMessageObject(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('MessageObject must be an object');
    return { valid: false, errors };
  }

  if (!value.id || typeof value.id !== 'string') {
    errors.push('MessageObject.id must be a non-empty string');
  }

  if (!isMessageType(value.type)) {
    errors.push(`MessageObject.type must be one of: ${Object.values(MessageType).join(', ')}`);
  }

  if (!value.workflowId || typeof value.workflowId !== 'string') {
    errors.push('MessageObject.workflowId must be a non-empty string');
  }

  if (!value.sourceAgentId || typeof value.sourceAgentId !== 'string') {
    errors.push('MessageObject.sourceAgentId must be a non-empty string');
  }

  if (value.targetAgentId !== null && typeof value.targetAgentId !== 'string') {
    errors.push('MessageObject.targetAgentId must be a string or null');
  }

  if (!value.payload || typeof value.payload !== 'object') {
    errors.push('MessageObject.payload must be an object');
  }

  if (!isMessageMetadata(value.metadata)) {
    errors.push('MessageObject.metadata is invalid');
  }

  return { valid: errors.length === 0, errors };
}

export function validateTask(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('Task must be an object');
    return { valid: false, errors };
  }

  if (!value.id || typeof value.id !== 'string') {
    errors.push('Task.id must be a non-empty string');
  }

  if (!value.agentId || typeof value.agentId !== 'string') {
    errors.push('Task.agentId must be a non-empty string');
  }

  if (!isTaskStatus(value.status)) {
    errors.push(`Task.status must be one of: ${Object.values(TaskStatus).join(', ')}`);
  }

  if (!value.input || typeof value.input !== 'object') {
    errors.push('Task.input must be an object');
  }

  if (typeof value.retryCount !== 'number' || value.retryCount < 0) {
    errors.push('Task.retryCount must be a non-negative number');
  }

  if (!Array.isArray(value.childTaskIds)) {
    errors.push('Task.childTaskIds must be an array');
  }

  if (typeof value.createdAt !== 'number' || value.createdAt <= 0) {
    errors.push('Task.createdAt must be a positive number');
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkflowState(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('WorkflowState must be an object');
    return { valid: false, errors };
  }

  if (!value.id || typeof value.id !== 'string') {
    errors.push('WorkflowState.id must be a non-empty string');
  }

  if (!isWorkflowStatus(value.status)) {
    errors.push(`WorkflowState.status must be one of: ${Object.values(WorkflowStatus).join(', ')}`);
  }

  if (!(value.tasks instanceof Map)) {
    errors.push('WorkflowState.tasks must be a Map');
  }

  if (!value.sharedData || typeof value.sharedData !== 'object') {
    errors.push('WorkflowState.sharedData must be an object');
  }

  if (!isWorkflowMetadata(value.metadata)) {
    errors.push('WorkflowState.metadata is invalid');
  }

  return { valid: errors.length === 0, errors };
}

export function validateAgentState(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('AgentState must be an object');
    return { valid: false, errors };
  }

  if (!value.id || typeof value.id !== 'string') {
    errors.push('AgentState.id must be a non-empty string');
  }

  if (!isAgentStatus(value.status)) {
    errors.push(`AgentState.status must be one of: ${Object.values(AgentStatus).join(', ')}`);
  }

  if (!Array.isArray(value.currentTasks)) {
    errors.push('AgentState.currentTasks must be an array');
  }

  if (typeof value.completedTasks !== 'number' || value.completedTasks < 0) {
    errors.push('AgentState.completedTasks must be a non-negative number');
  }

  if (typeof value.failedTasks !== 'number' || value.failedTasks < 0) {
    errors.push('AgentState.failedTasks must be a non-negative number');
  }

  if (typeof value.averageProcessingTime !== 'number' || value.averageProcessingTime < 0) {
    errors.push('AgentState.averageProcessingTime must be a non-negative number');
  }

  if (typeof value.lastHealthCheck !== 'number') {
    errors.push('AgentState.lastHealthCheck must be a number');
  }

  if (!value.configuration || typeof value.configuration !== 'object') {
    errors.push('AgentState.configuration must be an object');
  }

  return { valid: errors.length === 0, errors };
}

export function validateRetryPolicy(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('RetryPolicy must be an object');
    return { valid: false, errors };
  }

  if (typeof value.maxRetries !== 'number' || value.maxRetries < 0) {
    errors.push('RetryPolicy.maxRetries must be a non-negative number');
  }

  if (!isBackoffStrategy(value.backoffStrategy)) {
    errors.push(`RetryPolicy.backoffStrategy must be one of: ${Object.values(BackoffStrategy).join(', ')}`);
  }

  if (!Array.isArray(value.retryableErrors)) {
    errors.push('RetryPolicy.retryableErrors must be an array');
  } else if (!value.retryableErrors.every((err: any) => isErrorType(err))) {
    errors.push('RetryPolicy.retryableErrors must contain only valid ErrorType values');
  }

  if (typeof value.timeout !== 'number' || value.timeout <= 0) {
    errors.push('RetryPolicy.timeout must be a positive number');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Agent Specification Types
// ============================================================================

export interface AgentSpec {
  id: string;
  name: string;
  capabilities: string[];
  messageTypes: MessageType[];
  configuration?: Record<string, any>;
}

export function isAgentSpec(value: any): value is AgentSpec {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.capabilities) &&
    value.capabilities.every((cap: any) => typeof cap === 'string') &&
    Array.isArray(value.messageTypes) &&
    value.messageTypes.every((type: any) => isMessageType(type)) &&
    (value.configuration === undefined || (typeof value.configuration === 'object' && value.configuration !== null))
  );
}

export function validateAgentSpec(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('AgentSpec must be an object');
    return { valid: false, errors };
  }

  if (!value.id || typeof value.id !== 'string') {
    errors.push('AgentSpec.id must be a non-empty string');
  }

  if (!value.name || typeof value.name !== 'string') {
    errors.push('AgentSpec.name must be a non-empty string');
  }

  if (!Array.isArray(value.capabilities)) {
    errors.push('AgentSpec.capabilities must be an array');
  } else if (!value.capabilities.every((cap: any) => typeof cap === 'string')) {
    errors.push('AgentSpec.capabilities must contain only strings');
  } else if (value.capabilities.length === 0) {
    errors.push('AgentSpec.capabilities must contain at least one capability');
  }

  if (!Array.isArray(value.messageTypes)) {
    errors.push('AgentSpec.messageTypes must be an array');
  } else if (!value.messageTypes.every((type: any) => isMessageType(type))) {
    errors.push('AgentSpec.messageTypes must contain only valid MessageType values');
  } else if (value.messageTypes.length === 0) {
    errors.push('AgentSpec.messageTypes must contain at least one message type');
  }

  if (value.configuration !== undefined && (typeof value.configuration !== 'object' || value.configuration === null)) {
    errors.push('AgentSpec.configuration must be an object if provided');
  }

  return { valid: errors.length === 0, errors };
}
