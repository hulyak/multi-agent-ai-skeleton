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
jest.setTimeout(30000);

// ============================================================================
// Test Agent Implementation
// ============================================================================

class TestAgent extends BaseAgent {
  private supportedTypes: MessageType[];

  constructor(
    id: string,
    name: string,
    capabilities: string[],
    supportedTypes: MessageType[] = [MessageType.TASK_REQUEST],
    configuration: Record<string, any> = {}
  ) {
    super(id, name, capabilities, configuration);
    this.supportedTypes = supportedTypes;
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    return { processed: true, messageId: message.id };
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return this.supportedTypes;
  }
}

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

const messageTypeArbitrary = fc.constantFrom(...Object.values(MessageType));

function agentSpecArbitrary(): fc.Arbitrary<{
  id: string;
  name: string;
  capabilities: string[];
  supportedTypes: MessageType[];
}> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    capabilities: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
    supportedTypes: fc.array(messageTypeArbitrary, { minLength: 1, maxLength: 6 })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('AgentOrchestrator Property Tests', () => {
  // Feature: idl-resurrection, Property 1: Agent initialization completeness
  describe('Property 1: Agent initialization completeness', () => {
    it('should fully initialize all agents from valid specs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 1, maxLength: 10 }),
          async (agentSpecs) => {
            const orchestrator = new AgentOrchestrator();

            // Create and register agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize the orchestrator
            await orchestrator.initialize();

            // Verify all agents instantiated
            expect(orchestrator.getAgents().length).toBe(agentSpecs.length);
            expect(orchestrator.getAgentCount()).toBe(agentSpecs.length);

            // Verify all agents are initialized and handlers registered
            for (const spec of agentSpecs) {
              const agent = orchestrator.getAgent(spec.id);
              expect(agent).toBeDefined();
              expect(agent?.id).toBe(spec.id);
              
              // Check agent state is READY
              const state = agent?.getState();
              expect(state?.status).toBe(AgentStatus.READY);

              // Verify handlers registered in message bus
              const messageBus = orchestrator.getMessageBus();
              expect(messageBus.hasHandlers(spec.id)).toBe(true);
            }

            // Verify system-ready event emitted
            expect(orchestrator.isReady()).toBe(true);

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle initialization with no agents', async () => {
      const orchestrator = new AgentOrchestrator();

      // Initialize with no agents
      await orchestrator.initialize();

      // Verify system is ready even with no agents
      expect(orchestrator.isReady()).toBe(true);
      expect(orchestrator.getAgentCount()).toBe(0);

      // Cleanup
      await orchestrator.shutdown();
    });

    it('should emit system-ready event after initialization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 1, maxLength: 5 }),
          async (agentSpecs) => {
            const orchestrator = new AgentOrchestrator();
            let systemReadyEmitted = false;

            // Listen for system-ready event
            orchestrator.once('system-ready', () => {
              systemReadyEmitted = true;
            });

            // Create and register agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize
            await orchestrator.initialize();

            // Verify event was emitted
            expect(systemReadyEmitted).toBe(true);

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not allow double initialization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 1, maxLength: 3 }),
          async (agentSpecs) => {
            const orchestrator = new AgentOrchestrator();

            // Create and register agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // First initialization should succeed
            await orchestrator.initialize();
            expect(orchestrator.isReady()).toBe(true);

            // Second initialization should fail
            await expect(orchestrator.initialize()).rejects.toThrow('already initialized');

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Feature: idl-resurrection, Property 24: Dynamic agent scaling
  describe('Property 24: Dynamic agent scaling', () => {
    it('should support registration and deregistration at runtime', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 2, maxLength: 10 }),
          fc.integer({ min: 0, max: 5 }),
          async (agentSpecs, numToRemove) => {
            // Ensure we don't try to remove more agents than we have
            const actualNumToRemove = Math.min(numToRemove, agentSpecs.length - 1);

            const orchestrator = new AgentOrchestrator();

            // Create and register initial agents
            const agents = agentSpecs.map(spec =>
              new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
            );

            for (const agent of agents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize
            await orchestrator.initialize();
            const initialCount = orchestrator.getAgentCount();
            expect(initialCount).toBe(agentSpecs.length);

            // Deregister some agents
            for (let i = 0; i < actualNumToRemove; i++) {
              await orchestrator.deregisterAgent(agentSpecs[i].id);
            }

            // Verify count decreased
            expect(orchestrator.getAgentCount()).toBe(initialCount - actualNumToRemove);

            // Verify deregistered agents are gone
            for (let i = 0; i < actualNumToRemove; i++) {
              expect(orchestrator.getAgent(agentSpecs[i].id)).toBeUndefined();
            }

            // Verify remaining agents are still there
            for (let i = actualNumToRemove; i < agentSpecs.length; i++) {
              expect(orchestrator.getAgent(agentSpecs[i].id)).toBeDefined();
            }

            // System should still be ready
            expect(orchestrator.isReady()).toBe(true);

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should support adding agents after initialization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(agentSpecArbitrary(), { minLength: 1, maxLength: 5 }),
          fc.array(agentSpecArbitrary(), { minLength: 1, maxLength: 5 }),
          async (initialSpecs, additionalSpecs) => {
            // Ensure no ID conflicts
            const allIds = new Set([...initialSpecs.map(s => s.id), ...additionalSpecs.map(s => s.id)]);
            fc.pre(allIds.size === initialSpecs.length + additionalSpecs.length);

            const orchestrator = new AgentOrchestrator();

            // Register initial agents
            const initialAgents = initialSpecs.map(spec =>
              new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
            );

            for (const agent of initialAgents) {
              orchestrator.registerAgent(agent);
            }

            // Initialize
            await orchestrator.initialize();
            const initialCount = orchestrator.getAgentCount();

            // Add more agents after initialization
            const additionalAgents = additionalSpecs.map(spec =>
              new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
            );

            for (const agent of additionalAgents) {
              orchestrator.registerAgent(agent);
            }

            // Verify count increased
            expect(orchestrator.getAgentCount()).toBe(initialCount + additionalSpecs.length);

            // Verify all agents are present and initialized
            for (const spec of [...initialSpecs, ...additionalSpecs]) {
              const agent = orchestrator.getAgent(spec.id);
              expect(agent).toBeDefined();
              
              // Give a small delay for async initialization
              await new Promise(resolve => setTimeout(resolve, 50));
              
              const state = agent?.getState();
              // Agent should be READY or INITIALIZING (if still initializing)
              expect([AgentStatus.READY, AgentStatus.INITIALIZING]).toContain(state?.status);
            }

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    });

    it('should support up to 10 agents without code refactoring', async () => {
      const orchestrator = new AgentOrchestrator();

      // Create exactly 10 agents
      const agentSpecs = Array.from({ length: 10 }, (_, i) => ({
        id: `agent-${i}`,
        name: `Agent ${i}`,
        capabilities: [`capability-${i}`],
        supportedTypes: [MessageType.TASK_REQUEST]
      }));

      const agents = agentSpecs.map(spec =>
        new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes)
      );

      // Register all 10 agents
      for (const agent of agents) {
        orchestrator.registerAgent(agent);
      }

      // Initialize
      await orchestrator.initialize();

      // Verify all 10 agents are registered and initialized
      expect(orchestrator.getAgentCount()).toBe(10);
      expect(orchestrator.isReady()).toBe(true);

      for (const spec of agentSpecs) {
        const agent = orchestrator.getAgent(spec.id);
        expect(agent).toBeDefined();
        expect(agent?.getState().status).toBe(AgentStatus.READY);
      }

      // Cleanup
      await orchestrator.shutdown();
    });

    it('should prevent duplicate agent registration', async () => {
      await fc.assert(
        fc.asyncProperty(
          agentSpecArbitrary(),
          async (spec) => {
            const orchestrator = new AgentOrchestrator();

            const agent1 = new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes);
            const agent2 = new TestAgent(spec.id, spec.name, spec.capabilities, spec.supportedTypes);

            // First registration should succeed
            orchestrator.registerAgent(agent1);

            // Second registration with same ID should fail
            expect(() => orchestrator.registerAgent(agent2)).toThrow('already registered');

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle deregistration of non-existent agent', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (nonExistentId) => {
            const orchestrator = new AgentOrchestrator();

            // Initialize empty orchestrator
            await orchestrator.initialize();

            // Deregistering non-existent agent should fail
            await expect(orchestrator.deregisterAgent(nonExistentId)).rejects.toThrow('not registered');

            // Cleanup
            await orchestrator.shutdown();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
