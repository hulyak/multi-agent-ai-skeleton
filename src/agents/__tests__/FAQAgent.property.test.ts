// Property-Based Tests for FAQ Agent
// Feature: idl-resurrection, Property 15: FAQ pattern matching and response
// Validates: Requirements 6.4

import fc from 'fast-check';
import {
  FAQAgent,
  FAQEntry,
  FAQKnowledgeBase
} from '../FAQAgent';
import { MessageObject, MessageType, Priority } from '../../types';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

/**
 * Generate valid FAQ entries
 */
function faqEntryArbitrary(): fc.Arbitrary<FAQEntry> {
  return fc.record({
    id: fc.uuid(),
    question: fc.constantFrom(
      'What are your business hours?',
      'Where is your location?',
      'How much does it cost?',
      'How do I contact support?',
      'What is your refund policy?',
      'Do you offer discounts?',
      'What payment methods do you accept?',
      'How do I reset my password?'
    ),
    answer: fc.string({ minLength: 10, maxLength: 200 }),
    keywords: fc.array(fc.string({ minLength: 3, maxLength: 15 }), { minLength: 1, maxLength: 10 }),
    category: fc.constantFrom('general', 'pricing', 'support', 'billing', 'account')
  });
}

/**
 * Generate FAQ queries that should match patterns
 */
function faqQueryArbitrary(): fc.Arbitrary<string> {
  return fc.constantFrom(
    // Business hours queries
    'What are your business hours?',
    'When are you open?',
    'What time do you close?',
    'Are you open on weekends?',
    
    // Location queries
    'Where is your location?',
    'Where is your office?',
    'How do I find you?',
    'What is your address?',
    
    // Pricing queries
    'How much does it cost?',
    'What is the price?',
    'How expensive is it?',
    'What are your pricing plans?',
    
    // Support queries
    'How do I contact support?',
    'How can I reach you?',
    'What is your phone number?',
    'How do I get help?',
    
    // Refund queries
    'What is your refund policy?',
    'Can I get a refund?',
    'Do you have a money back guarantee?',
    
    // Discount queries
    'Do you offer discounts?',
    'Are there any sales?',
    'Can I get a coupon?',
    
    // Payment queries
    'What payment methods do you accept?',
    'Can I pay with PayPal?',
    'Do you accept credit cards?',
    
    // Password queries
    'How do I reset my password?',
    'I forgot my password',
    'How do I login?'
  );
}

/**
 * Generate valid message objects for FAQ agent
 */
function faqMessageArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.constant('faq-agent'),
    payload: fc.record({
      query: faqQueryArbitrary()
    }),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
      retryCount: fc.integer({ min: 0, max: 3 })
    })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('FAQAgent Property Tests', () => {
  // Feature: idl-resurrection, Property 15: FAQ pattern matching and response
  describe('Property 15: FAQ pattern matching and response', () => {
    it('should generate and return a response for any query that matches FAQ patterns', async () => {
      await fc.assert(
        fc.asyncProperty(
          faqMessageArbitrary(),
          async (message) => {
            // Create agent with default knowledge base
            const agent = new FAQAgent();
            await agent.initialize();

            // Process message
            const response = await agent.handleMessage(message);

            // Verify response structure
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Verify FAQ response fields
            const { answer, sources, confidence, query } = response.data!;
            
            expect(typeof answer).toBe('string');
            expect(answer.length).toBeGreaterThan(0);
            
            expect(Array.isArray(sources)).toBe(true);
            
            expect(typeof confidence).toBe('number');
            expect(confidence).toBeGreaterThanOrEqual(0);
            expect(confidence).toBeLessThanOrEqual(1);
            
            expect(query).toBe(message.payload.query);

            // For queries that match FAQ patterns, we should get relevant sources
            // The default knowledge base has entries for common queries
            const lowerQuery = query.toLowerCase();
            const hasCommonKeyword = [
              'hours', 'location', 'cost', 'price', 'support', 'contact',
              'refund', 'discount', 'payment', 'password'
            ].some(keyword => lowerQuery.includes(keyword));

            if (hasCommonKeyword) {
              // Should find at least one matching entry
              expect(sources.length).toBeGreaterThan(0);
              expect(confidence).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return consistent results for the same query', async () => {
      await fc.assert(
        fc.asyncProperty(
          faqQueryArbitrary(),
          fc.uuid(),
          async (query, workflowId) => {
            const agent = new FAQAgent();
            await agent.initialize();

            // Create two identical messages
            const message1: MessageObject = {
              id: `msg-1-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'faq-agent',
              payload: { query },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const message2: MessageObject = {
              ...message1,
              id: `msg-2-${Date.now()}`
            };

            // Process both messages
            const response1 = await agent.handleMessage(message1);
            const response2 = await agent.handleMessage(message2);

            // Verify both succeeded
            expect(response1.success).toBe(true);
            expect(response2.success).toBe(true);

            // Verify responses are consistent
            expect(response1.data!.answer).toBe(response2.data!.answer);
            expect(response1.data!.confidence).toBe(response2.data!.confidence);
            expect(response1.data!.sources.length).toBe(response2.data!.sources.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle queries with no matches gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 50 }).filter(s => {
            // Filter out strings that might match common FAQ keywords
            const lower = s.toLowerCase();
            return ![
              'hours', 'location', 'cost', 'price', 'support', 'contact',
              'refund', 'discount', 'payment', 'password', 'open', 'where',
              'when', 'how', 'what', 'help'
            ].some(keyword => lower.includes(keyword));
          }),
          fc.uuid(),
          async (query, workflowId) => {
            const agent = new FAQAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'faq-agent',
              payload: { query },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            // Should still succeed with a fallback response
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(typeof response.data!.answer).toBe('string');
            expect(response.data!.answer.length).toBeGreaterThan(0);
            
            // Confidence should be 0 for no matches
            if (response.data!.sources.length === 0) {
              expect(response.data!.confidence).toBe(0);
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
            targetAgentId: fc.constant('faq-agent'),
            payload: fc.oneof(
              fc.constant({}),
              fc.record({ query: fc.constant(null) }),
              fc.record({ query: fc.constant(undefined) }),
              fc.record({ query: fc.integer() }),
              fc.record({ notQuery: fc.string() })
            ),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          async (message) => {
            const agent = new FAQAgent();
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

    it('should support custom knowledge bases', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(faqEntryArbitrary(), { minLength: 1, maxLength: 10 }),
          fc.uuid(),
          async (entries, workflowId) => {
            // Create custom knowledge base
            const kb = new FAQKnowledgeBase(entries);
            const agent = new FAQAgent('custom-faq-agent', kb);
            await agent.initialize();

            // Pick a random entry and query with one of its keywords
            const randomEntry = entries[Math.floor(Math.random() * entries.length)];
            const keyword = randomEntry.keywords[0];

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'custom-faq-agent',
              payload: { query: keyword },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            // Should succeed
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Should find at least one source (the entry we queried for)
            expect(response.data!.sources.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
