// Property-Based Tests for Escalation Agent
// Feature: multi-agent-skeleton, Property 16: Escalation routing
// Validates: Requirements 6.5

import fc from 'fast-check';
import {
  EscalationAgent,
  EscalationContext,
  EscalationQueue
} from '../EscalationAgent';
import { MessageObject, MessageType, Priority } from '../../types';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

/**
 * Generate escalation context
 */
function escalationContextArbitrary(): fc.Arbitrary<EscalationContext> {
  return fc.record({
    userId: fc.option(fc.uuid(), { nil: undefined }),
    sessionId: fc.option(fc.uuid(), { nil: undefined }),
    previousAttempts: fc.option(fc.integer({ min: 0, max: 5 }), { nil: undefined }),
    relatedTickets: fc.option(fc.array(fc.uuid(), { maxLength: 3 }), { nil: undefined }),
    metadata: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined })
  });
}

/**
 * Generate queries that require human intervention
 */
function escalationQueryArbitrary(): fc.Arbitrary<string> {
  return fc.constantFrom(
    // Complaints
    'I have a complaint about your service',
    'This is unacceptable, I want to speak to a manager',
    'I am very disappointed with your product',
    
    // Issues and problems
    'I have a serious issue with my account',
    'There is a critical problem with the system',
    'The application is completely broken',
    
    // Urgent requests
    'This is urgent, I need help immediately',
    'Emergency: I cannot access my account',
    'Critical bug causing data loss',
    
    // Complex technical issues
    'The API integration is not working and I need custom configuration',
    'I need help with a complex database migration issue',
    'There is a security vulnerability that needs immediate attention',
    
    // Refund and billing disputes
    'I want a refund for this terrible service',
    'There is an error in my billing and I was overcharged',
    'I need to dispute a charge on my account',
    
    // Escalation requests
    'I need to speak with a supervisor',
    'Can you escalate this to your manager?',
    'This issue requires human intervention'
  );
}

/**
 * Generate valid message objects for escalation agent
 */
function escalationMessageArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.constant('escalation-agent'),
    payload: fc.record({
      query: escalationQueryArbitrary(),
      context: fc.option(escalationContextArbitrary(), { nil: undefined })
    }),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
      retryCount: fc.integer({ min: 0, max: 3 })
    })
  });
}

/**
 * Generate any query (including non-escalation queries)
 */
function anyQueryArbitrary(): fc.Arbitrary<string> {
  return fc.oneof(
    escalationQueryArbitrary(),
    fc.constantFrom(
      'What are your business hours?',
      'Where is your location?',
      'How much does it cost?',
      'Thank you for your help',
      'I love your product'
    )
  );
}

// ============================================================================
// Property Tests
// ============================================================================

describe('EscalationAgent Property Tests', () => {
  // Feature: multi-agent-skeleton, Property 16: Escalation routing
  describe('Property 16: Escalation routing', () => {
    it('should route any query requiring human intervention to the escalation queue', async () => {
      await fc.assert(
        fc.asyncProperty(
          escalationMessageArbitrary(),
          async (message) => {
            // Create agent with fresh queue
            const queue = new EscalationQueue();
            const agent = new EscalationAgent('escalation-agent', queue);
            await agent.initialize();

            // Process message
            const response = await agent.handleMessage(message);

            // Verify response structure
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Verify escalation result fields
            const { ticket, queuePosition, estimatedWaitTime } = response.data!;
            
            // Ticket should be created
            expect(ticket).toBeDefined();
            expect(typeof ticket.id).toBe('string');
            expect(ticket.id.startsWith('ESC-')).toBe(true);
            expect(ticket.query).toBe(message.payload.query);
            expect(ticket.status).toBe('pending');
            expect(typeof ticket.createdAt).toBe('number');
            
            // Complexity should be evaluated
            expect(ticket.complexity).toBeDefined();
            expect(typeof ticket.complexity.score).toBe('number');
            expect(ticket.complexity.score).toBeGreaterThanOrEqual(0);
            expect(ticket.complexity.score).toBeLessThanOrEqual(1);
            expect(Array.isArray(ticket.complexity.factors)).toBe(true);
            expect(ticket.complexity.factors.length).toBeGreaterThan(0);
            
            // Priority should be assigned
            expect(['low', 'medium', 'high', 'urgent']).toContain(ticket.priority);
            
            // Queue position should be valid
            expect(typeof queuePosition).toBe('number');
            expect(queuePosition).toBeGreaterThan(0);
            
            // Estimated wait time should be defined
            expect(typeof estimatedWaitTime).toBe('number');
            expect(estimatedWaitTime).toBeGreaterThanOrEqual(0);
            
            // Ticket should be in the queue
            const queuedTicket = queue.getTicket(ticket.id);
            expect(queuedTicket).toBeDefined();
            expect(queuedTicket!.id).toBe(ticket.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain queue ordering by priority and creation time', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(escalationMessageArbitrary(), { minLength: 3, maxLength: 10 }),
          async (messages) => {
            // Create agent with shared queue
            const queue = new EscalationQueue();
            const agent = new EscalationAgent('escalation-agent', queue);
            await agent.initialize();

            // Process all messages
            const tickets = [];
            for (const message of messages) {
              const response = await agent.handleMessage(message);
              expect(response.success).toBe(true);
              tickets.push(response.data!.ticket);
            }

            // Get all tickets from queue
            const queuedTickets = queue.getAllTickets();
            expect(queuedTickets.length).toBe(tickets.length);

            // Verify queue is sorted by priority (urgent > high > medium > low)
            // and then by creation time
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            
            for (let i = 0; i < queuedTickets.length - 1; i++) {
              const current = queuedTickets[i];
              const next = queuedTickets[i + 1];
              
              const currentPriorityValue = priorityOrder[current.priority];
              const nextPriorityValue = priorityOrder[next.priority];
              
              if (currentPriorityValue === nextPriorityValue) {
                // Same priority, should be ordered by creation time
                expect(current.createdAt).toBeLessThanOrEqual(next.createdAt);
              } else {
                // Different priority, higher priority should come first
                expect(currentPriorityValue).toBeLessThan(nextPriorityValue);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should evaluate complexity consistently for the same query', async () => {
      await fc.assert(
        fc.asyncProperty(
          anyQueryArbitrary(),
          fc.uuid(),
          async (query, workflowId) => {
            const agent = new EscalationAgent();
            await agent.initialize();

            // Create two identical messages
            const message1: MessageObject = {
              id: `msg-1-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'escalation-agent',
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

            // Process both messages with separate queues
            const queue1 = new EscalationQueue();
            const agent1 = new EscalationAgent('agent-1', queue1);
            await agent1.initialize();
            
            const queue2 = new EscalationQueue();
            const agent2 = new EscalationAgent('agent-2', queue2);
            await agent2.initialize();

            const response1 = await agent1.handleMessage(message1);
            const response2 = await agent2.handleMessage(message2);

            // Verify both succeeded
            expect(response1.success).toBe(true);
            expect(response2.success).toBe(true);

            // Verify complexity scores are consistent
            const complexity1 = response1.data!.ticket.complexity;
            const complexity2 = response2.data!.ticket.complexity;
            
            expect(complexity1.score).toBe(complexity2.score);
            expect(complexity1.requiresEscalation).toBe(complexity2.requiresEscalation);
            expect(complexity1.factors.length).toBe(complexity2.factors.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should assign higher priority to more complex queries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (workflowId) => {
            const agent = new EscalationAgent();
            await agent.initialize();

            // Create a simple query
            const simpleMessage: MessageObject = {
              id: `msg-simple-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'escalation-agent',
              payload: { query: 'I have a question' },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            // Create a complex urgent query
            const complexMessage: MessageObject = {
              id: `msg-complex-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'escalation-agent',
              payload: {
                query: 'URGENT CRITICAL EMERGENCY: The API is completely broken and not working, causing major security issues and data loss. This is unacceptable and I need immediate help from a manager!'
              },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const simpleResponse = await agent.handleMessage(simpleMessage);
            const complexResponse = await agent.handleMessage(complexMessage);

            expect(simpleResponse.success).toBe(true);
            expect(complexResponse.success).toBe(true);

            const simpleComplexity = simpleResponse.data!.ticket.complexity.score;
            const complexComplexity = complexResponse.data!.ticket.complexity.score;

            // Complex query should have higher complexity score
            expect(complexComplexity).toBeGreaterThan(simpleComplexity);

            // Priority mapping
            const priorityOrder: Record<string, number> = { low: 0, medium: 1, high: 2, urgent: 3 };
            const simplePriorityValue = priorityOrder[simpleResponse.data!.ticket.priority];
            const complexPriorityValue = priorityOrder[complexResponse.data!.ticket.priority];

            // Complex query should have higher or equal priority
            expect(complexPriorityValue).toBeGreaterThanOrEqual(simplePriorityValue);
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
            targetAgentId: fc.constant('escalation-agent'),
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
            const agent = new EscalationAgent();
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

    it('should preserve escalation context in tickets', async () => {
      await fc.assert(
        fc.asyncProperty(
          escalationQueryArbitrary(),
          escalationContextArbitrary(),
          fc.uuid(),
          async (query, context, workflowId) => {
            const agent = new EscalationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'escalation-agent',
              payload: { query, context },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            
            const ticket = response.data!.ticket;
            
            // Context should be preserved
            expect(ticket.context).toBeDefined();
            
            if (context.userId) {
              expect(ticket.context.userId).toBe(context.userId);
            }
            
            if (context.sessionId) {
              expect(ticket.context.sessionId).toBe(context.sessionId);
            }
            
            if (context.previousAttempts !== undefined) {
              expect(ticket.context.previousAttempts).toBe(context.previousAttempts);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate unique ticket IDs for all tickets', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(escalationMessageArbitrary(), { minLength: 5, maxLength: 20 }),
          async (messages) => {
            const queue = new EscalationQueue();
            const agent = new EscalationAgent('escalation-agent', queue);
            await agent.initialize();

            const ticketIds = new Set<string>();

            // Process all messages
            for (const message of messages) {
              const response = await agent.handleMessage(message);
              expect(response.success).toBe(true);
              
              const ticketId = response.data!.ticket.id;
              
              // Ticket ID should be unique
              expect(ticketIds.has(ticketId)).toBe(false);
              ticketIds.add(ticketId);
            }

            // All ticket IDs should be unique
            expect(ticketIds.size).toBe(messages.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should calculate estimated wait time based on queue position', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(escalationMessageArbitrary(), { minLength: 1, maxLength: 10 }),
          async (messages) => {
            const queue = new EscalationQueue();
            const agent = new EscalationAgent('escalation-agent', queue);
            await agent.initialize();

            // Process all messages and track wait times
            for (let i = 0; i < messages.length; i++) {
              const response = await agent.handleMessage(messages[i]);
              expect(response.success).toBe(true);
              
              const { queuePosition, estimatedWaitTime } = response.data!;
              
              // Wait time should be based on position (5 minutes per ticket ahead)
              const expectedWaitTime = (queuePosition - 1) * 5 * 60 * 1000;
              expect(estimatedWaitTime).toBe(expectedWaitTime);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
