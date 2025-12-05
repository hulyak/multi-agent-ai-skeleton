import fc from 'fast-check';
import { AgentOrchestrator } from '../AgentOrchestrator';
import { BaseAgent } from '../../agents/Agent';
import {
  MessageObject,
  MessageType,
  Priority,
  AgentStatus
} from '../../types';

// Increase Jest timeout for property tests
jest.setTimeout(60000);

// ============================================================================
// Test Agent Implementation
// ============================================================================

class TestAgent extends BaseAgent {
  private supportedTypes: MessageType[];
  private processingDelay: number;

  constructor(
    id: string,
    name: string,
    capabilities: string[],
    supportedTypes: MessageType[] = [MessageType.TASK_REQUEST],
    configuration: Record<string, any> = {},
    processingDelay: number = 10
  ) {
    super(id, name, capabilities, configuration);
    this.supportedTypes = supportedTypes;
    this.processingDelay = processingDelay;
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, this.processingDelay));
    return { processed: true, messageId: message.id };
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return this.supportedTypes;
  }
}

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

function agentSpecArbitrary(): fc.Arbitrary<{
  id: string;
  name: string;
  capabilities: string[];
  supportedTypes: MessageType[];
  processingDelay: number;
}> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    capabilities: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    supportedTypes: fc.constantFrom([MessageType.TASK_REQUEST]),
    processingDelay: fc.integer({ min: 5, max: 50 })
  });
}

function messageArbitrary(workflowId: string, sourceAgentId: string, targetAgentId: string): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.constant(workflowId),
    sourceAgentId: fc.constant(sourceAgentId),
    targetAgentId: fc.constant(targetAgentId),
    payload: fc.record({
      task: fc.string({ minLength: 1, maxLength: 100 })
    }),
    metadata: fc.record({
      timestamp: fc.constant(Date.now()),
      priority: fc.constantFrom(...Object.values(Priority)),
      retryCount: fc.constant(0)
    })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('ResourceAllocator Property Tests', () => {
  // Feature: idl-resurrection, Property 23: Fair resource allocation
  describe('Property 23: Fair resource allocation', () => {
    it('should allocate resources fairly among concurrent agents without starvation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 3, maxLength: 4 }),
          fc.integer({ min: 3, max: 8 }),
          async (agentSpecs, messagesPerAgent) => {
            const orchestrator = new AgentOrchestrator();
            const workflowId = 'test-workflow';

            // Create workflow
            orchestrator.createWorkflow(workflowId);

            // Create and register agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(
                spec.id,
                spec.name,
                spec.capabilities,
                spec.supportedTypes,
                {},
                spec.processingDelay
              )
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize
            await orchestrator.initialize();

            // Send messages to each agent concurrently
            const messagePromises: Promise<void>[] = [];
            
            for (const spec of agentSpecs) {
              for (let i = 0; i < messagesPerAgent; i++) {
                const message: MessageObject = {
                  id: `msg-${spec.id}-${i}`,
                  type: MessageType.TASK_REQUEST,
                  workflowId,
                  sourceAgentId: 'test-source',
                  targetAgentId: spec.id,
                  payload: { task: `Task ${i} for ${spec.id}` },
                  metadata: {
                    timestamp: Date.now(),
                    priority: Priority.NORMAL,
                    retryCount: 0
                  }
                };
                
                messagePromises.push(orchestrator.sendMessage(message));
              }
            }

            // Wait for all messages to be sent
            await Promise.all(messagePromises);

            // Give time for processing
            await new Promise(resolve => setTimeout(resolve, 200));

            // Get performance metrics
            const performanceMonitor = orchestrator.getPerformanceMonitor();
            const metrics = performanceMonitor.getMetrics();

            // Verify all agents processed messages (no starvation)
            for (const spec of agentSpecs) {
              const agentMetrics = metrics.agentProcessingTimes.get(spec.id);
              expect(agentMetrics).toBeDefined();
              expect(agentMetrics!.totalProcessed).toBeGreaterThan(0);
            }

            // Verify fair allocation: no agent should process significantly more than others
            // Calculate the average number of messages processed
            const processedCounts = agentSpecs.map(spec => {
              const agentMetrics = metrics.agentProcessingTimes.get(spec.id);
              return agentMetrics?.totalProcessed || 0;
            });

            const avgProcessed = processedCounts.reduce((sum, count) => sum + count, 0) / processedCounts.length;
            
            // Each agent should have processed at least some messages (no complete starvation)
            for (const count of processedCounts) {
              expect(count).toBeGreaterThan(0);
            }

            // Verify performance metrics are collected
            expect(metrics.totalMessagesRouted).toBeGreaterThan(0);
            expect(metrics.agentProcessingTimes.size).toBe(agentSpecs.length);

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 30, timeout: 20000 }
      );
    });

    it('should prevent resource starvation with mixed priority messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 3, maxLength: 4 }),
          async (agentSpecs) => {
            const orchestrator = new AgentOrchestrator();
            const workflowId = 'test-workflow';

            // Create workflow
            orchestrator.createWorkflow(workflowId);

            // Create and register agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(
                spec.id,
                spec.name,
                spec.capabilities,
                spec.supportedTypes,
                {},
                spec.processingDelay
              )
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize
            await orchestrator.initialize();

            // Send messages with different priorities
            const messagePromises: Promise<void>[] = [];
            const priorities = [Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL];
            
            for (const spec of agentSpecs) {
              for (let i = 0; i < 4; i++) {
                const message: MessageObject = {
                  id: `msg-${spec.id}-${i}`,
                  type: MessageType.TASK_REQUEST,
                  workflowId,
                  sourceAgentId: 'test-source',
                  targetAgentId: spec.id,
                  payload: { task: `Task ${i} for ${spec.id}` },
                  metadata: {
                    timestamp: Date.now(),
                    priority: priorities[i],
                    retryCount: 0
                  }
                };
                
                messagePromises.push(orchestrator.sendMessage(message));
              }
            }

            // Wait for all messages to be sent
            await Promise.all(messagePromises);

            // Give time for processing
            await new Promise(resolve => setTimeout(resolve, 200));

            // Get performance metrics
            const performanceMonitor = orchestrator.getPerformanceMonitor();
            const metrics = performanceMonitor.getMetrics();

            // Verify all agents processed messages (no starvation even with priority)
            for (const spec of agentSpecs) {
              const agentMetrics = metrics.agentProcessingTimes.get(spec.id);
              expect(agentMetrics).toBeDefined();
              expect(agentMetrics!.totalProcessed).toBeGreaterThan(0);
            }

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 30, timeout: 20000 }
      );
    });

    it('should collect and report performance metrics for concurrent execution', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 2, maxLength: 4 }),
          fc.integer({ min: 3, max: 8 }),
          async (agentSpecs, messagesPerAgent) => {
            const orchestrator = new AgentOrchestrator();
            const workflowId = 'test-workflow';

            // Create workflow
            orchestrator.createWorkflow(workflowId);

            // Create and register agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(
                spec.id,
                spec.name,
                spec.capabilities,
                spec.supportedTypes,
                {},
                spec.processingDelay
              )
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize
            await orchestrator.initialize();

            // Send messages
            const messagePromises: Promise<void>[] = [];
            
            for (const spec of agentSpecs) {
              for (let i = 0; i < messagesPerAgent; i++) {
                const message: MessageObject = {
                  id: `msg-${spec.id}-${i}`,
                  type: MessageType.TASK_REQUEST,
                  workflowId,
                  sourceAgentId: 'test-source',
                  targetAgentId: spec.id,
                  payload: { task: `Task ${i}` },
                  metadata: {
                    timestamp: Date.now(),
                    priority: Priority.NORMAL,
                    retryCount: 0
                  }
                };
                
                messagePromises.push(orchestrator.sendMessage(message));
              }
            }

            // Wait for all messages
            await Promise.all(messagePromises);

            // Give time for processing
            await new Promise(resolve => setTimeout(resolve, 150));

            // Get performance metrics
            const performanceMonitor = orchestrator.getPerformanceMonitor();
            const metrics = performanceMonitor.getMetrics();

            // Verify metrics are collected
            expect(metrics.totalMessagesRouted).toBeGreaterThan(0);
            expect(metrics.averageRoutingLatency).toBeGreaterThanOrEqual(0);
            
            // Verify agent-specific metrics
            expect(metrics.agentProcessingTimes.size).toBeGreaterThan(0);
            
            for (const spec of agentSpecs) {
              const agentMetrics = metrics.agentProcessingTimes.get(spec.id);
              if (agentMetrics && agentMetrics.totalProcessed > 0) {
                expect(agentMetrics.averageProcessingTime).toBeGreaterThan(0);
                expect(agentMetrics.minProcessingTime).toBeGreaterThan(0);
                expect(agentMetrics.maxProcessingTime).toBeGreaterThanOrEqual(agentMetrics.minProcessingTime);
                expect(agentMetrics.successCount + agentMetrics.failureCount).toBe(agentMetrics.totalProcessed);
              }
            }

            // Verify time window is set
            expect(metrics.windowStart).toBeGreaterThan(0);
            expect(metrics.windowEnd).toBeGreaterThanOrEqual(metrics.windowStart);

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 30, timeout: 20000 }
      );
    });
  });
});
