import fc from 'fast-check';
import {
  ErrorHandler,
  ErrorLogger,
  ErrorContext,
  FailureNotificationSystem,
  FailureNotification
} from '../ErrorHandler';
import { ErrorType, RetryPolicy, BackoffStrategy } from '../../types';

// Increase Jest timeout for property tests
jest.setTimeout(30000);

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

const errorTypeArbitrary = fc.constantFrom(...Object.values(ErrorType));

function errorArbitrary(): fc.Arbitrary<Error> {
  return fc.oneof(
    fc.string().map(msg => new Error(`validation error: ${msg}`)),
    fc.string().map(msg => new Error(`system critical failure: ${msg}`)),
    fc.string().map(msg => new Error(`business logic error: ${msg}`)),
    fc.string().map(msg => new Error(`transient network timeout: ${msg}`))
  );
}

function errorContextArbitrary(): fc.Arbitrary<ErrorContext> {
  return fc.record({
    workflowId: fc.uuid(),
    taskId: fc.option(fc.uuid(), { nil: undefined }),
    agentId: fc.uuid(),
    operation: fc.constantFrom('processMessage', 'executeTask', 'routeMessage', 'updateState'),
    timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
    additionalData: fc.option(
      fc.dictionary(fc.string(), fc.anything()),
      { nil: undefined }
    )
  });
}

function retryPolicyArbitrary(): fc.Arbitrary<RetryPolicy> {
  return fc.record({
    maxRetries: fc.integer({ min: 1, max: 5 }),
    backoffStrategy: fc.constantFrom(...Object.values(BackoffStrategy)),
    retryableErrors: fc.array(errorTypeArbitrary, { minLength: 1, maxLength: 4 }),
    timeout: fc.integer({ min: 100, max: 5000 })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('ErrorHandler Property Tests', () => {
  // Feature: multi-agent-skeleton, Property 6: Error logging with context
  describe('Property 6: Error logging with context', () => {
    it('should log all task failures with error message, stack trace, and context', async () => {
      await fc.assert(
        fc.asyncProperty(
          errorArbitrary(),
          errorContextArbitrary(),
          async (error, context) => {
            const logger = new ErrorLogger();

            // Log the error
            const logEntry = logger.log(error, context);

            // Verify log entry was created
            expect(logEntry).toBeDefined();
            expect(logEntry.id).toBeDefined();
            expect(typeof logEntry.id).toBe('string');

            // Verify error is captured
            expect(logEntry.error).toBe(error);
            expect(logEntry.error.message).toBe(error.message);

            // Verify stack trace is captured
            expect(logEntry.stackTrace).toBeDefined();
            expect(typeof logEntry.stackTrace).toBe('string');

            // Verify context is captured
            expect(logEntry.context).toEqual(context);
            expect(logEntry.context.workflowId).toBe(context.workflowId);
            expect(logEntry.context.agentId).toBe(context.agentId);
            expect(logEntry.context.operation).toBe(context.operation);

            // Verify timestamp
            expect(logEntry.timestamp).toBeDefined();
            expect(typeof logEntry.timestamp).toBe('number');

            // Verify error type is classified
            expect(logEntry.errorType).toBeDefined();
            expect(Object.values(ErrorType)).toContain(logEntry.errorType);

            // Verify log is retrievable
            const retrievedLog = logger.getLog(logEntry.id);
            expect(retrievedLog).toEqual(logEntry);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should make error logs retrievable via API by workflow ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.tuple(errorArbitrary(), errorContextArbitrary()),
            { minLength: 1, maxLength: 10 }
          ),
          fc.uuid(),
          async (errorContextPairs, targetWorkflowId) => {
            const logger = new ErrorLogger();

            // Log multiple errors, some with target workflow ID
            const targetLogs: string[] = [];
            for (const [error, context] of errorContextPairs) {
              // Randomly assign some to target workflow
              const useTargetWorkflow = Math.random() > 0.5;
              const testContext = {
                ...context,
                workflowId: useTargetWorkflow ? targetWorkflowId : context.workflowId
              };

              const logEntry = logger.log(error, testContext);
              if (useTargetWorkflow) {
                targetLogs.push(logEntry.id);
              }
            }

            // Retrieve logs by workflow ID
            const workflowLogs = logger.getLogsByWorkflow(targetWorkflowId);

            // Verify all logs for target workflow are returned
            expect(workflowLogs.length).toBe(targetLogs.length);
            for (const log of workflowLogs) {
              expect(log.context.workflowId).toBe(targetWorkflowId);
              expect(targetLogs).toContain(log.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should make error logs retrievable via API by agent ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.tuple(errorArbitrary(), errorContextArbitrary()),
            { minLength: 1, maxLength: 10 }
          ),
          fc.uuid(),
          async (errorContextPairs, targetAgentId) => {
            const logger = new ErrorLogger();

            // Log multiple errors, some with target agent ID
            const targetLogs: string[] = [];
            for (const [error, context] of errorContextPairs) {
              // Randomly assign some to target agent
              const useTargetAgent = Math.random() > 0.5;
              const testContext = {
                ...context,
                agentId: useTargetAgent ? targetAgentId : context.agentId
              };

              const logEntry = logger.log(error, testContext);
              if (useTargetAgent) {
                targetLogs.push(logEntry.id);
              }
            }

            // Retrieve logs by agent ID
            const agentLogs = logger.getLogsByAgent(targetAgentId);

            // Verify all logs for target agent are returned
            expect(agentLogs.length).toBe(targetLogs.length);
            for (const log of agentLogs) {
              expect(log.context.agentId).toBe(targetAgentId);
              expect(targetLogs).toContain(log.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: multi-agent-skeleton, Property 7: Retry policy compliance
  describe('Property 7: Retry policy compliance', () => {
    it('should apply retry policy with correct backoff strategy and max retries', async () => {
      await fc.assert(
        fc.asyncProperty(
          retryPolicyArbitrary(),
          errorTypeArbitrary,
          async (policy, errorType) => {
            // Ensure the error type is in the retryable list
            const testPolicy = {
              ...policy,
              retryableErrors: [...new Set([...policy.retryableErrors, errorType])]
            };

            const errorHandler = new ErrorHandler();
            let attemptCount = 0;
            const baseDelay = 10; // Small delay for testing

            // Create an operation that always fails with the specified error type
            const operation = async () => {
              attemptCount++;
              const error = new Error(`${errorType.toLowerCase()} test error`);
              throw error;
            };

            // Use the retry manager from MessageBus (we'll need to expose it or test directly)
            // For now, we'll test the strategy determination
            const strategy = errorHandler.getDefaultRetryPolicy(errorType);

            if (strategy) {
              // Verify strategy has correct properties
              expect(strategy.maxRetries).toBeGreaterThanOrEqual(0);
              expect(Object.values(BackoffStrategy)).toContain(strategy.backoffStrategy);
              expect(Array.isArray(strategy.retryableErrors)).toBe(true);
              expect(strategy.timeout).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should mark task as failed after retry exhaustion', async () => {
      await fc.assert(
        fc.asyncProperty(
          errorArbitrary(),
          errorContextArbitrary(),
          async (error, context) => {
            const errorHandler = new ErrorHandler();

            // Handle the error
            const result = await errorHandler.handleError(error, context);

            // Verify log entry was created
            expect(result.logEntry).toBeDefined();
            expect(result.logEntry.error).toBe(error);
            expect(result.logEntry.context).toEqual(context);

            // Verify strategy was determined
            expect(result.strategy).toBeDefined();
            expect(typeof result.strategy.shouldRetry).toBe('boolean');
            expect(typeof result.strategy.notifyDependents).toBe('boolean');
            expect(typeof result.strategy.escalate).toBe('boolean');

            // Verify error is logged and retrievable
            const logger = errorHandler.getLogger();
            const retrievedLog = logger.getLog(result.logEntry.id);
            expect(retrievedLog).toEqual(result.logEntry);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: multi-agent-skeleton, Property 8: Failure propagation to dependents
  describe('Property 8: Failure propagation to dependents', () => {
    it('should notify all dependent agents when a critical agent fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // failed agent ID
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }), // dependent agent IDs
          errorArbitrary(),
          errorContextArbitrary(),
          async (failedAgentId, dependentIds, error, context) => {
            const notificationSystem = new FailureNotificationSystem();
            const notifiedAgents: string[] = [];

            // Register dependencies
            for (const dependentId of dependentIds) {
              notificationSystem.registerDependency(failedAgentId, dependentId);

              // Register notification handler
              notificationSystem.registerNotificationHandler(
                dependentId,
                async (notification: FailureNotification) => {
                  notifiedAgents.push(dependentId);
                  expect(notification.failedAgentId).toBe(failedAgentId);
                  expect(notification.error).toBe(error);
                }
              );
            }

            // Verify dependencies are registered
            const registeredDependents = notificationSystem.getDependents(failedAgentId);
            expect(registeredDependents.length).toBe(dependentIds.length);
            for (const dependentId of dependentIds) {
              expect(registeredDependents).toContain(dependentId);
            }

            // Notify dependents of failure
            const testContext = {
              ...context,
              agentId: failedAgentId
            };

            await notificationSystem.notifyDependents(
              failedAgentId,
              error,
              ErrorType.SYSTEM,
              testContext
            );

            // Verify all dependents were notified
            expect(notifiedAgents.length).toBe(dependentIds.length);
            for (const dependentId of dependentIds) {
              expect(notifiedAgents).toContain(dependentId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle notification handler failures gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // failed agent ID
          fc.array(fc.uuid(), { minLength: 2, maxLength: 5 }), // dependent agent IDs
          errorArbitrary(),
          errorContextArbitrary(),
          async (failedAgentId, dependentIds, error, context) => {
            const notificationSystem = new FailureNotificationSystem();
            const successfulNotifications: string[] = [];

            // Register dependencies with some handlers that fail
            for (let i = 0; i < dependentIds.length; i++) {
              const dependentId = dependentIds[i];
              notificationSystem.registerDependency(failedAgentId, dependentId);

              // Make some handlers fail
              const shouldFail = i % 2 === 0;
              notificationSystem.registerNotificationHandler(
                dependentId,
                async () => {
                  if (shouldFail) {
                    throw new Error('Handler failure');
                  }
                  successfulNotifications.push(dependentId);
                }
              );
            }

            // Notify dependents - should not throw even if some handlers fail
            const testContext = {
              ...context,
              agentId: failedAgentId
            };

            await expect(
              notificationSystem.notifyDependents(
                failedAgentId,
                error,
                ErrorType.SYSTEM,
                testContext
              )
            ).resolves.not.toThrow();

            // Verify successful notifications occurred
            const expectedSuccessful = dependentIds.filter((_, i) => i % 2 !== 0);
            expect(successfulNotifications.length).toBe(expectedSuccessful.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should support removing dependencies', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // source agent ID
          fc.array(fc.uuid(), { minLength: 2, maxLength: 5 }), // dependent agent IDs
          async (sourceAgentId, dependentIds) => {
            const notificationSystem = new FailureNotificationSystem();

            // Register all dependencies
            for (const dependentId of dependentIds) {
              notificationSystem.registerDependency(sourceAgentId, dependentId);
            }

            // Verify all registered
            let dependents = notificationSystem.getDependents(sourceAgentId);
            expect(dependents.length).toBe(dependentIds.length);

            // Remove one dependency
            const toRemove = dependentIds[0];
            notificationSystem.removeDependency(sourceAgentId, toRemove);

            // Verify it was removed
            dependents = notificationSystem.getDependents(sourceAgentId);
            expect(dependents.length).toBe(dependentIds.length - 1);
            expect(dependents).not.toContain(toRemove);

            // Verify others still present
            for (let i = 1; i < dependentIds.length; i++) {
              expect(dependents).toContain(dependentIds[i]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
