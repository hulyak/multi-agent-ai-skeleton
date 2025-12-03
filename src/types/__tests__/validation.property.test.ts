// Feature: multi-agent-skeleton, Property 2: Invalid specification rejection
// **Validates: Requirements 1.5**

import fc from 'fast-check';
import {
  MessageType,
  Priority,
  WorkflowStatus,
  TaskStatus,
  AgentStatus,
  BackoffStrategy,
  ErrorType,
  validateMessageObject,
  validateTask,
  validateWorkflowState,
  validateAgentState,
  validateRetryPolicy,
  Task,
} from '../index';

// ============================================================================
// Arbitraries (Generators) for Valid Data
// ============================================================================

const validMessageMetadataArb = fc.record({
  timestamp: fc.integer({ min: 0, max: Date.now() + 86400000 }),
  priority: fc.constantFrom(...Object.values(Priority)),
  retryCount: fc.integer({ min: 0, max: 10 }),
  parentMessageId: fc.option(fc.uuid(), { nil: undefined }),
});

const validMessageObjectArb = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom(...Object.values(MessageType)),
  workflowId: fc.uuid(),
  sourceAgentId: fc.uuid(),
  targetAgentId: fc.option(fc.uuid(), { nil: null }),
  payload: fc.dictionary(fc.string(), fc.anything()),
  metadata: validMessageMetadataArb,
});

const validTaskArb = fc.record({
  id: fc.uuid(),
  agentId: fc.uuid(),
  status: fc.constantFrom(...Object.values(TaskStatus)),
  input: fc.dictionary(fc.string(), fc.anything()),
  output: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
  error: fc.constant(undefined), // Errors are hard to generate, keep undefined for valid cases
  retryCount: fc.integer({ min: 0, max: 10 }),
  parentTaskId: fc.option(fc.uuid(), { nil: undefined }),
  childTaskIds: fc.array(fc.uuid(), { maxLength: 5 }),
  createdAt: fc.integer({ min: 1, max: Date.now() + 86400000 }),
  completedAt: fc.option(fc.integer({ min: 1, max: Date.now() + 86400000 }), { nil: undefined }),
});

const validWorkflowMetadataArb = fc.record({
  createdAt: fc.integer({ min: 1, max: Date.now() }),
  updatedAt: fc.integer({ min: 1, max: Date.now() + 86400000 }),
  initiatorId: fc.uuid(),
});

const validWorkflowStateArb = fc.record({
  id: fc.uuid(),
  status: fc.constantFrom(...Object.values(WorkflowStatus)),
  tasks: fc.constant(new Map<string, Task>()),
  sharedData: fc.dictionary(fc.string(), fc.anything()),
  metadata: validWorkflowMetadataArb,
});

const validAgentStateArb = fc.record({
  id: fc.uuid(),
  status: fc.constantFrom(...Object.values(AgentStatus)),
  currentTasks: fc.array(fc.uuid(), { maxLength: 10 }),
  completedTasks: fc.integer({ min: 0, max: 1000 }),
  failedTasks: fc.integer({ min: 0, max: 100 }),
  averageProcessingTime: fc.float({ min: 0, max: 10000 }),
  lastHealthCheck: fc.integer({ min: 0, max: Date.now() + 86400000 }),
  configuration: fc.dictionary(fc.string(), fc.anything()),
});

const validRetryPolicyArb = fc.record({
  maxRetries: fc.integer({ min: 0, max: 10 }),
  backoffStrategy: fc.constantFrom(...Object.values(BackoffStrategy)),
  retryableErrors: fc.array(fc.constantFrom(...Object.values(ErrorType)), { minLength: 1, maxLength: 4 }),
  timeout: fc.integer({ min: 1, max: 60000 }),
});

// ============================================================================
// Arbitraries for Invalid Data
// ============================================================================

// Generate invalid MessageObject by corrupting required fields
const invalidMessageObjectArb = fc.oneof(
  // Missing id
  validMessageObjectArb.map(obj => ({ ...obj, id: undefined })),
  // Invalid type
  validMessageObjectArb.map(obj => ({ ...obj, type: 'INVALID_TYPE' })),
  // Missing workflowId
  validMessageObjectArb.map(obj => ({ ...obj, workflowId: '' })),
  // Missing sourceAgentId
  validMessageObjectArb.map(obj => ({ ...obj, sourceAgentId: null })),
  // Invalid targetAgentId (number instead of string/null)
  validMessageObjectArb.map(obj => ({ ...obj, targetAgentId: 123 })),
  // Missing payload
  validMessageObjectArb.map(obj => ({ ...obj, payload: null })),
  // Invalid metadata
  validMessageObjectArb.map(obj => ({ ...obj, metadata: { invalid: true } })),
);

// Generate invalid Task by corrupting required fields
const invalidTaskArb = fc.oneof(
  // Missing id
  validTaskArb.map(obj => ({ ...obj, id: '' })),
  // Invalid status
  validTaskArb.map(obj => ({ ...obj, status: 'INVALID_STATUS' })),
  // Missing agentId
  validTaskArb.map(obj => ({ ...obj, agentId: undefined })),
  // Invalid input
  validTaskArb.map(obj => ({ ...obj, input: null })),
  // Negative retryCount
  validTaskArb.map(obj => ({ ...obj, retryCount: -1 })),
  // Invalid childTaskIds
  validTaskArb.map(obj => ({ ...obj, childTaskIds: 'not-an-array' })),
  // Invalid createdAt
  validTaskArb.map(obj => ({ ...obj, createdAt: -1 })),
);

// Generate invalid WorkflowState by corrupting required fields
const invalidWorkflowStateArb = fc.oneof(
  // Missing id
  validWorkflowStateArb.map(obj => ({ ...obj, id: null })),
  // Invalid status
  validWorkflowStateArb.map(obj => ({ ...obj, status: 'UNKNOWN' })),
  // Invalid tasks (not a Map)
  validWorkflowStateArb.map(obj => ({ ...obj, tasks: {} })),
  // Missing sharedData
  validWorkflowStateArb.map(obj => ({ ...obj, sharedData: null })),
  // Invalid metadata
  validWorkflowStateArb.map(obj => ({ ...obj, metadata: { incomplete: true } })),
);

// Generate invalid AgentState by corrupting required fields
const invalidAgentStateArb = fc.oneof(
  // Missing id
  validAgentStateArb.map(obj => ({ ...obj, id: undefined })),
  // Invalid status
  validAgentStateArb.map(obj => ({ ...obj, status: 'NOT_A_STATUS' })),
  // Invalid currentTasks
  validAgentStateArb.map(obj => ({ ...obj, currentTasks: 'not-an-array' })),
  // Negative completedTasks
  validAgentStateArb.map(obj => ({ ...obj, completedTasks: -5 })),
  // Negative failedTasks
  validAgentStateArb.map(obj => ({ ...obj, failedTasks: -1 })),
  // Negative averageProcessingTime
  validAgentStateArb.map(obj => ({ ...obj, averageProcessingTime: -100 })),
  // Missing configuration
  validAgentStateArb.map(obj => ({ ...obj, configuration: undefined })),
);

// Generate invalid RetryPolicy by corrupting required fields
const invalidRetryPolicyArb = fc.oneof(
  // Negative maxRetries
  validRetryPolicyArb.map(obj => ({ ...obj, maxRetries: -1 })),
  // Invalid backoffStrategy
  validRetryPolicyArb.map(obj => ({ ...obj, backoffStrategy: 'INVALID' })),
  // Invalid retryableErrors
  validRetryPolicyArb.map(obj => ({ ...obj, retryableErrors: ['NOT_AN_ERROR_TYPE'] })),
  // Invalid timeout
  validRetryPolicyArb.map(obj => ({ ...obj, timeout: 0 })),
  // Missing retryableErrors
  validRetryPolicyArb.map(obj => ({ ...obj, retryableErrors: undefined })),
);

// ============================================================================
// Property Tests
// ============================================================================

describe('Property 2: Invalid specification rejection', () => {
  describe('MessageObject validation', () => {
    it('should accept all valid MessageObject specifications', () => {
      fc.assert(
        fc.property(validMessageObjectArb, (messageObj) => {
          const result = validateMessageObject(messageObj);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid MessageObject specifications with detailed errors', () => {
      fc.assert(
        fc.property(invalidMessageObjectArb, (invalidObj) => {
          const result = validateMessageObject(invalidObj);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          // Ensure error messages are descriptive
          result.errors.forEach(error => {
            expect(typeof error).toBe('string');
            expect(error.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Task validation', () => {
    it('should accept all valid Task specifications', () => {
      fc.assert(
        fc.property(validTaskArb, (task) => {
          const result = validateTask(task);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid Task specifications with detailed errors', () => {
      fc.assert(
        fc.property(invalidTaskArb, (invalidTask) => {
          const result = validateTask(invalidTask);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          result.errors.forEach(error => {
            expect(typeof error).toBe('string');
            expect(error.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('WorkflowState validation', () => {
    it('should accept all valid WorkflowState specifications', () => {
      fc.assert(
        fc.property(validWorkflowStateArb, (workflowState) => {
          const result = validateWorkflowState(workflowState);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid WorkflowState specifications with detailed errors', () => {
      fc.assert(
        fc.property(invalidWorkflowStateArb, (invalidState) => {
          const result = validateWorkflowState(invalidState);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          result.errors.forEach(error => {
            expect(typeof error).toBe('string');
            expect(error.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('AgentState validation', () => {
    it('should accept all valid AgentState specifications', () => {
      fc.assert(
        fc.property(validAgentStateArb, (agentState) => {
          const result = validateAgentState(agentState);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid AgentState specifications with detailed errors', () => {
      fc.assert(
        fc.property(invalidAgentStateArb, (invalidState) => {
          const result = validateAgentState(invalidState);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          result.errors.forEach(error => {
            expect(typeof error).toBe('string');
            expect(error.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('RetryPolicy validation', () => {
    it('should accept all valid RetryPolicy specifications', () => {
      fc.assert(
        fc.property(validRetryPolicyArb, (retryPolicy) => {
          const result = validateRetryPolicy(retryPolicy);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid RetryPolicy specifications with detailed errors', () => {
      fc.assert(
        fc.property(invalidRetryPolicyArb, (invalidPolicy) => {
          const result = validateRetryPolicy(invalidPolicy);
          expect(result.valid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          result.errors.forEach(error => {
            expect(typeof error).toBe('string');
            expect(error.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
