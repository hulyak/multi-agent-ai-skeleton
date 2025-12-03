import fc from 'fast-check';
import { MessageBus, RetryManager } from '../MessageBus';
import {
  MessageObject,
  MessageType,
  Priority,
  RetryPolicy,
  BackoffStrategy,
  ErrorType
} from '../../types';

// Increase Jest timeout for property tests
jest.setTimeout(30000);

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

const messageTypeArbitrary = fc.constantFrom(...Object.values(MessageType));
const priorityArbitrary = fc.constantFrom(...Object.values(Priority));
const backoffStrategyArbitrary = fc.constantFrom(...Object.values(BackoffStrategy));
const errorTypeArbitrary = fc.constantFrom(...Object.values(ErrorType));

function messageObjectArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: messageTypeArbitrary,
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.option(fc.uuid(), { nil: null }),
    payload: fc.dictionary(fc.string(), fc.anything()),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: priorityArbitrary,
      retryCount: fc.integer({ min: 0, max: 3 }),
      parentMessageId: fc.option(fc.uuid(), { nil: undefined })
    })
  });
}

function retryPolicyArbitrary(): fc.Arbitrary<RetryPolicy> {
  return fc.record({
    maxRetries: fc.integer({ min: 1, max: 3 }),
    backoffStrategy: backoffStrategyArbitrary,
    retryableErrors: fc.array(errorTypeArbitrary, { minLength: 1, maxLength: 4 }),
    timeout: fc.integer({ min: 100, max: 1000 })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('MessageBus Property Tests', () => {
  // Feature: multi-agent-skeleton, Property 5: Message delivery retry exhaustion
  describe('Property 5: Message delivery retry exhaustion', () => {
    it('should retry delivery exactly maxRetries times before logging failure', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          retryPolicyArbitrary(),
          async (message, policy) => {
            const messageBus = new MessageBus();
            let attemptCount = 0;
            const targetAgent = 'test-agent';

            // Ensure policy includes TRANSIENT errors for our simulated failure
            const testPolicy = {
              ...policy,
              retryableErrors: [...new Set([...policy.retryableErrors, ErrorType.TRANSIENT])]
            };

            // Subscribe an agent that always fails
            messageBus.subscribe(
              targetAgent,
              [message.type],
              async () => {
                attemptCount++;
                throw new Error('Simulated transient failure');
              }
            );

            // Ensure target agent is set (not broadcast)
            const testMessage = {
              ...message,
              targetAgentId: targetAgent
            };

            // Send with retry (use small base delay for testing)
            const result = await messageBus.sendWithRetry(testMessage, testPolicy, 10);

            // Verify retry exhaustion
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(attemptCount).toBe(testPolicy.maxRetries + 1); // Initial attempt + retries
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should succeed on first attempt if handler succeeds', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          retryPolicyArbitrary(),
          async (message, policy) => {
            const messageBus = new MessageBus();
            let attemptCount = 0;
            const targetAgent = 'test-agent';

            // Ensure policy includes TRANSIENT errors
            const testPolicy = {
              ...policy,
              retryableErrors: [...new Set([...policy.retryableErrors, ErrorType.TRANSIENT])]
            };

            // Subscribe an agent that always succeeds
            messageBus.subscribe(
              targetAgent,
              [message.type],
              async () => {
                attemptCount++;
                // Success - no error thrown
              }
            );

            // Ensure target agent is set (not broadcast)
            const testMessage = {
              ...message,
              targetAgentId: targetAgent
            };

            // Send with retry (use small base delay for testing)
            const result = await messageBus.sendWithRetry(testMessage, testPolicy, 10);

            // Verify success on first attempt
            expect(result.success).toBe(true);
            expect(result.attempts).toBe(1);
            expect(attemptCount).toBe(1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should succeed after some retries if handler eventually succeeds', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          retryPolicyArbitrary(),
          fc.integer({ min: 1, max: 3 }),
          async (message, policy, failuresBeforeSuccess) => {
            // Only test if we have enough retries
            fc.pre(policy.maxRetries >= failuresBeforeSuccess);

            const messageBus = new MessageBus();
            let attemptCount = 0;
            const targetAgent = 'test-agent';

            // Ensure policy includes TRANSIENT errors for our simulated failure
            const testPolicy = {
              ...policy,
              retryableErrors: [...new Set([...policy.retryableErrors, ErrorType.TRANSIENT])]
            };

            // Subscribe an agent that fails N times then succeeds
            messageBus.subscribe(
              targetAgent,
              [message.type],
              async () => {
                attemptCount++;
                if (attemptCount <= failuresBeforeSuccess) {
                  throw new Error('Simulated transient failure');
                }
                // Success after N failures
              }
            );

            // Ensure target agent is set (not broadcast)
            const testMessage = {
              ...message,
              targetAgentId: targetAgent
            };

            // Send with retry (use small base delay for testing)
            const result = await messageBus.sendWithRetry(testMessage, testPolicy, 10);

            // Verify eventual success
            expect(result.success).toBe(true);
            expect(result.attempts).toBe(failuresBeforeSuccess + 1);
            expect(attemptCount).toBe(failuresBeforeSuccess + 1);
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    });
  });

  // Additional tests for backoff strategies
  describe('Backoff Strategy Tests', () => {
    it('should apply correct backoff delays for each strategy', () => {
      fc.assert(
        fc.property(
          backoffStrategyArbitrary,
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 100, max: 2000 }),
          (strategy, attemptNumber, baseDelay) => {
            const retryManager = new RetryManager();
            const delay = retryManager.calculateBackoff(strategy, attemptNumber, baseDelay);

            switch (strategy) {
              case BackoffStrategy.FIXED:
                expect(delay).toBe(baseDelay);
                break;
              case BackoffStrategy.LINEAR:
                expect(delay).toBe(baseDelay * attemptNumber);
                break;
              case BackoffStrategy.EXPONENTIAL:
                expect(delay).toBe(baseDelay * Math.pow(2, attemptNumber - 1));
                break;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
