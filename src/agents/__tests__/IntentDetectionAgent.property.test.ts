// Property-Based Tests for Intent Detection Agent
// Feature: idl-resurrection, Property 14: Intent classification and routing
// Validates: Requirements 6.2, 6.3

import fc from 'fast-check';
import {
  IntentDetectionAgent,
  IntentType,
  Intent,
  MockLLMProvider
} from '../IntentDetectionAgent';
import { MessageObject, MessageType, Priority } from '../../types';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

/**
 * Generate valid user queries
 */
function userQueryArbitrary(): fc.Arbitrary<string> {
  return fc.oneof(
    // FAQ queries
    fc.constantFrom(
      'What are your business hours?',
      'Where is your location?',
      'How much does it cost?',
      'When are you open?',
      'What is your phone number?',
      'Can I get a refund?',
      'Do you offer discounts?',
      'How do I contact support?'
    ),
    // Escalation queries
    fc.constantFrom(
      'I have a complaint about my order',
      'This is urgent, I need help now',
      'The product is broken',
      'I want to speak to a manager',
      'This is not working at all',
      'I need a refund immediately',
      'There is an error in my account',
      'I have a serious problem'
    ),
    // Unknown/ambiguous queries
    fc.constantFrom(
      'Hello',
      'Thanks',
      'Okay',
      'I see',
      'Interesting'
    )
  );
}

/**
 * Generate valid message objects for intent detection
 */
function intentDetectionMessageArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.constant('intent-detection-agent'),
    payload: fc.record({
      query: userQueryArbitrary()
    }),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: fc.constantFrom(...Object.values(Priority)),
      retryCount: fc.integer({ min: 0, max: 3 })
    })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('IntentDetectionAgent Property Tests', () => {
  // Feature: idl-resurrection, Property 14: Intent classification and routing
  describe('Property 14: Intent classification and routing', () => {
    it('should classify intent and route to appropriate handler for any user query', async () => {
      await fc.assert(
        fc.asyncProperty(
          intentDetectionMessageArbitrary(),
          async (message) => {
            // Create agent
            const agent = new IntentDetectionAgent();
            await agent.initialize();
            
            // Process message
            const response = await agent.handleMessage(message);
            
            // Verify response structure
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            
            // Verify intent classification
            const { intent, query, routedTo } = response.data!;
            expect(intent).toBeDefined();
            expect(intent.type).toBeDefined();
            expect(Object.values(IntentType)).toContain(intent.type);
            expect(typeof intent.confidence).toBe('number');
            expect(intent.confidence).toBeGreaterThanOrEqual(0);
            expect(intent.confidence).toBeLessThanOrEqual(1);
            
            // Verify query is preserved
            expect(query).toBe(message.payload.query);
            
            // Verify routing decision
            expect(routedTo).toBeDefined();
            expect(typeof routedTo).toBe('string');
            
            // Verify routing logic: FAQ intent -> faq-agent, ESCALATION -> escalation-agent
            if (intent.type === IntentType.FAQ) {
              expect(routedTo).toBe('faq-agent');
            } else if (intent.type === IntentType.ESCALATION) {
              expect(routedTo).toBe('escalation-agent');
            } else if (intent.type === IntentType.UNKNOWN) {
              // Unknown intents default to FAQ agent
              expect(routedTo).toBe('faq-agent');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should extract entities from queries when present', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            query: fc.oneof(
              fc.constant('My email is test@example.com'),
              fc.constant('Call me at 555-123-4567'),
              fc.constant('Contact john.doe@company.org or 555-987-6543'),
              fc.constant('No entities here')
            ),
            workflowId: fc.uuid(),
            sourceAgentId: fc.uuid()
          }),
          async ({ query, workflowId, sourceAgentId }) => {
            const agent = new IntentDetectionAgent();
            await agent.initialize();
            
            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId,
              targetAgentId: 'intent-detection-agent',
              payload: { query },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };
            
            const response = await agent.handleMessage(message);
            
            expect(response.success).toBe(true);
            const { intent } = response.data!;
            
            // Verify entities array exists
            expect(Array.isArray(intent.entities)).toBe(true);
            
            // If query contains email or phone, entities should be extracted
            if (query.includes('@')) {
              const emailEntities = intent.entities.filter(e => e.type === 'email');
              expect(emailEntities.length).toBeGreaterThan(0);
            }
            
            if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(query)) {
              const phoneEntities = intent.entities.filter(e => e.type === 'phone');
              expect(phoneEntities.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('should handle invalid message payloads gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            type: fc.constant(MessageType.TASK_REQUEST),
            workflowId: fc.uuid(),
            sourceAgentId: fc.uuid(),
            targetAgentId: fc.constant('intent-detection-agent'),
            payload: fc.oneof(
              fc.constant({}),
              fc.record({ query: fc.constant(null) }),
              fc.record({ query: fc.constant(undefined) }),
              fc.record({ query: fc.integer() }),
              fc.record({ notQuery: fc.string() })
            ),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(...Object.values(Priority)),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          async (message) => {
            const agent = new IntentDetectionAgent();
            await agent.initialize();
            
            const response = await agent.handleMessage(message as MessageObject);
            
            // Should fail gracefully with error
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(typeof response.error).toBe('string');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
