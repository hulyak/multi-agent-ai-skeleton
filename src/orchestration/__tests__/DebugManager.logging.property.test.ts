// Feature: idl-resurrection, Property 12: Debug mode comprehensive logging
// Validates: Requirements 5.3

import fc from 'fast-check';
import { DebugManager } from '../DebugManager';
import { MessageObject, MessageType, Priority } from '../../types';

describe('Property 12: Debug mode comprehensive logging', () => {
  it('should log all messages with timestamp, source, target, and routing info when debug mode is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom(...Object.values(MessageType)),
            workflowId: fc.uuid(),
            sourceAgentId: fc.uuid(),
            targetAgentId: fc.option(fc.uuid(), { nil: null }),
            payload: fc.dictionary(fc.string(), fc.anything()),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (messages: MessageObject[]) => {
          // Create debug manager with debug mode enabled
          const debugManager = new DebugManager({ enabled: true });

          // Log all messages
          messages.forEach(message => {
            debugManager.logMessage(message, 'delivered');
          });

          // Get the workflow IDs
          const workflowIds = new Set(messages.map(m => m.workflowId));

          // For each workflow, verify all messages are logged
          for (const workflowId of workflowIds) {
            const logs = debugManager.getMessageLogs(workflowId);
            const expectedMessages = messages.filter(m => m.workflowId === workflowId);

            // Verify count
            expect(logs.length).toBe(expectedMessages.length);

            // Verify each log entry has required fields
            logs.forEach((logEntry, index) => {
              const expectedMessage = expectedMessages[index];

              // Verify message is logged
              expect(logEntry.message).toEqual(expectedMessage);

              // Verify timestamp is present and valid
              expect(logEntry.timestamp).toBeGreaterThan(0);
              expect(typeof logEntry.timestamp).toBe('number');

              // Verify routing info is present
              expect(logEntry.routingInfo).toBeDefined();
              expect(logEntry.routingInfo.sourceAgent).toBe(expectedMessage.sourceAgentId);
              expect(logEntry.routingInfo.targetAgent).toBe(expectedMessage.targetAgentId);
              expect(logEntry.routingInfo.messageType).toBe(expectedMessage.type);

              // Verify delivery status
              expect(logEntry.deliveryStatus).toBe('delivered');
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not log messages when debug mode is disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom(...Object.values(MessageType)),
            workflowId: fc.uuid(),
            sourceAgentId: fc.uuid(),
            targetAgentId: fc.option(fc.uuid(), { nil: null }),
            payload: fc.dictionary(fc.string(), fc.anything()),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (messages: MessageObject[]) => {
          // Create debug manager with debug mode disabled
          const debugManager = new DebugManager({ enabled: false });

          // Try to log all messages
          messages.forEach(message => {
            debugManager.logMessage(message, 'delivered');
          });

          // Verify no messages are logged
          const workflowIds = new Set(messages.map(m => m.workflowId));
          for (const workflowId of workflowIds) {
            const logs = debugManager.getMessageLogs(workflowId);
            expect(logs.length).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should log failed messages with error information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom(...Object.values(MessageType)),
          workflowId: fc.uuid(),
          sourceAgentId: fc.uuid(),
          targetAgentId: fc.option(fc.uuid(), { nil: null }),
          payload: fc.dictionary(fc.string(), fc.anything()),
          metadata: fc.record({
            timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
            priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
            retryCount: fc.integer({ min: 0, max: 3 })
          })
        }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (message: MessageObject, errorMessage: string) => {
          const debugManager = new DebugManager({ enabled: true });

          // Log failed message
          debugManager.logMessage(message, 'failed', errorMessage);

          // Verify error is logged
          const logs = debugManager.getMessageLogs(message.workflowId);
          expect(logs.length).toBe(1);
          expect(logs[0].deliveryStatus).toBe('failed');
          expect(logs[0].error).toBe(errorMessage);
        }
      ),
      { numRuns: 100 }
    );
  });
});
