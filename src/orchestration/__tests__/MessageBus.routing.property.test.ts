import fc from 'fast-check';
import { MessageBus } from '../MessageBus';
import {
  MessageObject,
  MessageType,
  Priority,
  WorkflowState,
  WorkflowStatus
} from '../../types';

// Increase Jest timeout for property tests
jest.setTimeout(30000);

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

const messageTypeArbitrary = fc.constantFrom(...Object.values(MessageType));
const priorityArbitrary = fc.constantFrom(...Object.values(Priority));

function messageObjectArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: messageTypeArbitrary,
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.uuid(), // Always set for routing tests
    payload: fc.dictionary(fc.string(), fc.anything()),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: priorityArbitrary,
      retryCount: fc.integer({ min: 0, max: 3 }),
      parentMessageId: fc.option(fc.uuid(), { nil: undefined })
    })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('MessageBus Routing Property Tests', () => {
  // Feature: idl-resurrection, Property 3: Message delivery and processing
  describe('Property 3: Message delivery and processing', () => {
    it('should route valid messages to target agent and invoke handler', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          async (message) => {
            const messageBus = new MessageBus();
            let handlerCalled = false;
            let receivedMessage: MessageObject | null = null;

            // Subscribe target agent
            messageBus.subscribe(
              message.targetAgentId!,
              [message.type],
              async (msg) => {
                handlerCalled = true;
                receivedMessage = msg;
              }
            );

            // Route message
            await messageBus.route(message);

            // Verify handler was called with correct message
            expect(handlerCalled).toBe(true);
            expect(receivedMessage).toEqual(message);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should add routed messages to workflow history', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          async (message) => {
            const messageBus = new MessageBus();

            // Subscribe target agent
            messageBus.subscribe(
              message.targetAgentId!,
              [message.type],
              async () => {
                // Handler does nothing
              }
            );

            // Route message
            await messageBus.route(message);

            // Verify message is in history
            const history = messageBus.getMessageHistory(message.workflowId);
            expect(history).toContainEqual(message);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fail routing when target agent is not subscribed', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          async (message) => {
            const messageBus = new MessageBus();

            // Don't subscribe any agent
            // Attempt to route should fail
            await expect(messageBus.route(message)).rejects.toThrow(
              `No subscription found for agent: ${message.targetAgentId}`
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fail routing when agent is not subscribed to message type', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          fc.constantFrom(...Object.values(MessageType)),
          async (message, differentType) => {
            // Only test when types are different
            fc.pre(message.type !== differentType);

            const messageBus = new MessageBus();

            // Subscribe agent to different message type
            messageBus.subscribe(
              message.targetAgentId!,
              [differentType],
              async () => {
                // Handler
              }
            );

            // Attempt to route should fail
            await expect(messageBus.route(message)).rejects.toThrow(
              `Agent ${message.targetAgentId} is not subscribed to message type: ${message.type}`
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should broadcast messages to all subscribed agents when targetAgentId is null', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          fc.integer({ min: 2, max: 5 }),
          async (message, agentCount) => {
            const messageBus = new MessageBus();
            const handlerCalls: string[] = [];

            // Create multiple agents subscribed to the message type
            const agentIds: string[] = [];
            for (let i = 0; i < agentCount; i++) {
              const agentId = `agent-${i}`;
              agentIds.push(agentId);
              messageBus.subscribe(
                agentId,
                [message.type],
                async () => {
                  handlerCalls.push(agentId);
                }
              );
            }

            // Broadcast message (targetAgentId = null)
            const broadcastMessage = {
              ...message,
              targetAgentId: null
            };

            await messageBus.route(broadcastMessage);

            // Verify all agents received the message
            expect(handlerCalls.length).toBe(agentCount);
            expect(handlerCalls.sort()).toEqual(agentIds.sort());
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should update workflow state when agent processes message', async () => {
      await fc.assert(
        fc.asyncProperty(
          messageObjectArbitrary(),
          fc.string(),
          async (message, outputData) => {
            const messageBus = new MessageBus();
            const workflowState: Partial<WorkflowState> = {
              id: message.workflowId,
              status: WorkflowStatus.IN_PROGRESS,
              sharedData: {}
            };

            // Subscribe agent that updates workflow state
            messageBus.subscribe(
              message.targetAgentId!,
              [message.type],
              async (msg) => {
                // Simulate agent processing and updating state
                workflowState.sharedData![msg.id] = outputData;
              }
            );

            // Route message
            await messageBus.route(message);

            // Verify workflow state was updated
            expect(workflowState.sharedData![message.id]).toBe(outputData);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple messages in sequence for same workflow', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(messageObjectArbitrary(), { minLength: 2, maxLength: 5 }),
          async (messages) => {
            // Ensure all messages have same workflowId
            const workflowId = messages[0].workflowId;
            const normalizedMessages = messages.map(msg => ({
              ...msg,
              workflowId
            }));

            const messageBus = new MessageBus();
            const processedMessages: string[] = [];

            // Subscribe agents for all unique agent-type combinations
            const subscribed = new Set<string>();
            for (const msg of normalizedMessages) {
              const key = `${msg.targetAgentId}-${msg.type}`;
              if (!subscribed.has(key)) {
                messageBus.subscribe(
                  msg.targetAgentId!,
                  [msg.type],
                  async (m) => {
                    processedMessages.push(m.id);
                  }
                );
                subscribed.add(key);
              }
            }

            // Route all messages
            for (const msg of normalizedMessages) {
              await messageBus.route(msg);
            }

            // Verify all messages were processed
            expect(processedMessages.length).toBe(normalizedMessages.length);

            // Verify all messages are in workflow history
            const history = messageBus.getMessageHistory(workflowId);
            expect(history.length).toBe(normalizedMessages.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
