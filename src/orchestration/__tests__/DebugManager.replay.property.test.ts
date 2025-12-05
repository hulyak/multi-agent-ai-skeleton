// Feature: idl-resurrection, Property 13: Message sequence replay
// Validates: Requirements 5.4

import fc from 'fast-check';
import { DebugManager } from '../DebugManager';
import { MessageBus } from '../MessageBus';
import { WorkflowStateManager } from '../WorkflowStateManager';
import { Agent } from '../../agents/Agent';
import { 
  MessageObject, 
  MessageType, 
  Priority, 
  AgentStatus,
  WorkflowStatus,
  MessageResponse
} from '../../types';

// Mock agent for testing
class MockAgent implements Agent {
  id: string;
  name: string;
  capabilities: string[];
  private messagesReceived: MessageObject[] = [];

  constructor(id: string) {
    this.id = id;
    this.name = `MockAgent-${id}`;
    this.capabilities = ['test'];
  }

  async initialize(): Promise<void> {
    // No-op
  }

  async shutdown(): Promise<void> {
    // No-op
  }

  async handleMessage(message: MessageObject): Promise<MessageResponse> {
    this.messagesReceived.push(message);
    return { success: true };
  }

  canHandle(_message: MessageObject): boolean {
    return true;
  }

  getState() {
    return {
      id: this.id,
      status: AgentStatus.READY,
      currentTasks: [],
      completedTasks: this.messagesReceived.length,
      failedTasks: 0,
      averageProcessingTime: 0,
      lastHealthCheck: Date.now(),
      configuration: {}
    };
  }

  setState(_state: any): void {
    // No-op
  }

  async healthCheck() {
    return { healthy: true, timestamp: Date.now() };
  }

  getMessagesReceived(): MessageObject[] {
    return this.messagesReceived;
  }
}

describe('Property 13: Message sequence replay', () => {
  it('should replay message sequences and produce equivalent workflow state transitions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // workflowId
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom(...Object.values(MessageType)),
            sourceAgentId: fc.constantFrom('agent-1', 'agent-2', 'agent-3'),
            targetAgentId: fc.constantFrom('agent-1', 'agent-2', 'agent-3'),
            payload: fc.dictionary(fc.string(), fc.string()),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(...Object.values(Priority)),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (workflowId: string, messageTemplates: any[]) => {
          // Create debug manager with debug mode enabled
          const debugManager = new DebugManager({ enabled: true });
          
          // Create message bus and workflow state manager
          const messageBus = new MessageBus();
          const workflowStateManager = new WorkflowStateManager();
          
          // Create mock agents
          const agents = new Map<string, Agent>();
          const agent1 = new MockAgent('agent-1');
          const agent2 = new MockAgent('agent-2');
          const agent3 = new MockAgent('agent-3');
          agents.set('agent-1', agent1);
          agents.set('agent-2', agent2);
          agents.set('agent-3', agent3);
          
          // Subscribe agents to message bus
          agents.forEach(agent => {
            messageBus.subscribe(
              agent.id,
              Object.values(MessageType),
              async (msg) => await agent.handleMessage(msg)
            );
          });
          
          // Create workflow
          workflowStateManager.createWorkflow(workflowId);
          
          // Create messages with the workflow ID
          const messages: MessageObject[] = messageTemplates.map(template => ({
            ...template,
            workflowId
          }));
          
          // Log all messages as they would be in a real scenario
          messages.forEach(message => {
            debugManager.logMessage(message, 'delivered');
          });
          
          // Capture initial workflow state
          debugManager.captureWorkflowState(workflowStateManager.getWorkflow(workflowId));
          
          // Replay the message sequence
          const replayResult = await debugManager.replayMessageSequence(
            workflowId,
            messageBus,
            workflowStateManager,
            agents
          );
          
          // Verify replay was successful
          expect(replayResult.success).toBe(true);
          expect(replayResult.messagesReplayed).toBe(messages.length);
          expect(replayResult.errors.length).toBe(0);
          
          // Verify final workflow state exists
          expect(replayResult.finalWorkflowState).toBeDefined();
          expect(replayResult.finalWorkflowState?.status).toBe(WorkflowStatus.PENDING);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle replay failures gracefully and report errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // workflowId
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom(...Object.values(MessageType)),
            sourceAgentId: fc.constantFrom('agent-1', 'agent-2'),
            targetAgentId: fc.constantFrom('agent-1', 'agent-2', 'nonexistent-agent'),
            payload: fc.dictionary(fc.string(), fc.string()),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(...Object.values(Priority)),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (workflowId: string, messageTemplates: any[]) => {
          const debugManager = new DebugManager({ enabled: true });
          const messageBus = new MessageBus();
          const workflowStateManager = new WorkflowStateManager();
          
          // Create only 2 agents, so messages to 'nonexistent-agent' will fail
          const agents = new Map<string, Agent>();
          const agent1 = new MockAgent('agent-1');
          const agent2 = new MockAgent('agent-2');
          agents.set('agent-1', agent1);
          agents.set('agent-2', agent2);
          
          // Subscribe agents
          agents.forEach(agent => {
            messageBus.subscribe(
              agent.id,
              Object.values(MessageType),
              async (msg) => await agent.handleMessage(msg)
            );
          });
          
          // Create workflow
          workflowStateManager.createWorkflow(workflowId);
          
          // Create messages
          const messages: MessageObject[] = messageTemplates.map(template => ({
            ...template,
            workflowId
          }));
          
          // Log messages
          messages.forEach(message => {
            debugManager.logMessage(message, 'delivered');
          });
          
          // Replay the sequence
          const replayResult = await debugManager.replayMessageSequence(
            workflowId,
            messageBus,
            workflowStateManager,
            agents
          );
          
          // Count expected failures (messages to nonexistent-agent)
          const expectedFailures = messages.filter(m => m.targetAgentId === 'nonexistent-agent').length;
          
          // Verify replay result
          expect(replayResult.messagesReplayed).toBeLessThanOrEqual(messages.length);
          
          // If there were messages to nonexistent agents, we should have errors
          if (expectedFailures > 0) {
            expect(replayResult.errors.length).toBeGreaterThan(0);
            expect(replayResult.success).toBe(false);
          }
          
          // Verify error structure
          replayResult.errors.forEach(error => {
            expect(error.messageId).toBeDefined();
            expect(error.error).toBeDefined();
            expect(typeof error.error).toBe('string');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create a new replay workflow with replayed messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // workflowId
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom(...Object.values(MessageType)),
            sourceAgentId: fc.constantFrom('agent-1'),
            targetAgentId: fc.constantFrom('agent-1'),
            payload: fc.dictionary(fc.string(), fc.string()),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(...Object.values(Priority)),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (workflowId: string, messageTemplates: any[]) => {
          const debugManager = new DebugManager({ enabled: true });
          const messageBus = new MessageBus();
          const workflowStateManager = new WorkflowStateManager();
          
          const agents = new Map<string, Agent>();
          const agent1 = new MockAgent('agent-1');
          agents.set('agent-1', agent1);
          
          messageBus.subscribe(
            agent1.id,
            Object.values(MessageType),
            async (msg) => await agent1.handleMessage(msg)
          );
          
          // Create original workflow
          workflowStateManager.createWorkflow(workflowId);
          
          const messages: MessageObject[] = messageTemplates.map(template => ({
            ...template,
            workflowId
          }));
          
          messages.forEach(message => {
            debugManager.logMessage(message, 'delivered');
          });
          
          // Replay
          const replayResult = await debugManager.replayMessageSequence(
            workflowId,
            messageBus,
            workflowStateManager,
            agents
          );
          
          // Verify a new workflow was created for replay
          expect(replayResult.finalWorkflowState).toBeDefined();
          expect(replayResult.finalWorkflowState?.id).not.toBe(workflowId);
          expect(replayResult.finalWorkflowState?.id).toContain('replay');
          
          // Verify the replay workflow exists in the manager
          const replayWorkflowId = replayResult.finalWorkflowState?.id;
          if (replayWorkflowId) {
            expect(workflowStateManager.hasWorkflow(replayWorkflowId)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
