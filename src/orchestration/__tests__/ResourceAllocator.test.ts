// Unit tests for ResourceAllocator

import { ResourceAllocator } from '../ResourceAllocator';
import { MessageObject, MessageType, Priority } from '../../types';

describe('ResourceAllocator', () => {
  let allocator: ResourceAllocator;

  beforeEach(() => {
    allocator = new ResourceAllocator();
  });

  describe('Agent Registration', () => {
    it('should register an agent', () => {
      allocator.registerAgent('agent-1');
      const metrics = allocator.getAgentMetrics('agent-1');
      
      expect(metrics).toBeDefined();
      expect(metrics?.agentId).toBe('agent-1');
      expect(metrics?.messagesProcessed).toBe(0);
      expect(metrics?.queueSize).toBe(0);
      expect(metrics?.isStarved).toBe(false);
    });

    it('should deregister an agent', () => {
      allocator.registerAgent('agent-1');
      allocator.deregisterAgent('agent-1');
      
      const metrics = allocator.getAgentMetrics('agent-1');
      expect(metrics).toBeUndefined();
    });
  });

  describe('Message Queueing', () => {
    it('should enqueue and dequeue messages', () => {
      allocator.registerAgent('agent-1');
      
      const message: MessageObject = {
        id: 'msg-1',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      allocator.enqueueMessage('agent-1', message);
      expect(allocator.getQueueSize('agent-1')).toBe(1);

      const dequeued = allocator.dequeueMessage('agent-1');
      expect(dequeued).toBeDefined();
      expect(dequeued?.id).toBe('msg-1');
      expect(allocator.getQueueSize('agent-1')).toBe(0);
    });

    it('should prioritize high priority messages', () => {
      allocator.registerAgent('agent-1');
      
      const lowPriorityMsg: MessageObject = {
        id: 'msg-low',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.LOW,
          retryCount: 0
        }
      };

      const highPriorityMsg: MessageObject = {
        id: 'msg-high',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now() + 1,
          priority: Priority.HIGH,
          retryCount: 0
        }
      };

      // Enqueue low priority first, then high priority
      allocator.enqueueMessage('agent-1', lowPriorityMsg);
      allocator.enqueueMessage('agent-1', highPriorityMsg);

      // High priority should be dequeued first
      const first = allocator.dequeueMessage('agent-1');
      expect(first?.id).toBe('msg-high');

      const second = allocator.dequeueMessage('agent-1');
      expect(second?.id).toBe('msg-low');
    });
  });

  describe('Processing Tracking', () => {
    it('should record processing metrics', () => {
      allocator.registerAgent('agent-1');
      
      allocator.recordProcessing('agent-1', 100);
      
      const metrics = allocator.getAgentMetrics('agent-1');
      expect(metrics?.messagesProcessed).toBe(1);
      expect(metrics?.averageProcessingTime).toBe(100);
      expect(metrics?.isStarved).toBe(false);
    });

    it('should update average processing time', () => {
      allocator.registerAgent('agent-1');
      
      allocator.recordProcessing('agent-1', 100);
      allocator.recordProcessing('agent-1', 200);
      
      const metrics = allocator.getAgentMetrics('agent-1');
      expect(metrics?.messagesProcessed).toBe(2);
      // Exponential moving average: 0.7 * 100 + 0.3 * 200 = 130
      expect(metrics?.averageProcessingTime).toBe(130);
    });
  });

  describe('Starvation Detection', () => {
    it('should detect starved agents', async () => {
      allocator = new ResourceAllocator({ starvationThresholdMs: 100 });
      allocator.registerAgent('agent-1');
      
      const message: MessageObject = {
        id: 'msg-1',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      allocator.enqueueMessage('agent-1', message);
      
      // Wait for starvation threshold
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const starved = allocator.detectStarvation();
      expect(starved).toContain('agent-1');
      expect(allocator.hasStarvedAgents()).toBe(true);
    });

    it('should not detect starvation for agents without queued messages', async () => {
      allocator = new ResourceAllocator({ starvationThresholdMs: 100 });
      allocator.registerAgent('agent-1');
      
      // Wait longer than threshold but no messages queued
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const starved = allocator.detectStarvation();
      expect(starved).not.toContain('agent-1');
      expect(allocator.hasStarvedAgents()).toBe(false);
    });

    it('should clear starvation flag after processing', async () => {
      allocator = new ResourceAllocator({ starvationThresholdMs: 100 });
      allocator.registerAgent('agent-1');
      
      const message: MessageObject = {
        id: 'msg-1',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      allocator.enqueueMessage('agent-1', message);
      
      // Wait for starvation
      await new Promise(resolve => setTimeout(resolve, 150));
      allocator.detectStarvation();
      expect(allocator.hasStarvedAgents()).toBe(true);
      
      // Process message
      allocator.recordProcessing('agent-1', 50);
      expect(allocator.hasStarvedAgents()).toBe(false);
    });
  });

  describe('Fair Scheduling', () => {
    it('should schedule next agent based on fairness', () => {
      allocator.registerAgent('agent-1');
      allocator.registerAgent('agent-2');
      
      const message1: MessageObject = {
        id: 'msg-1',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      const message2: MessageObject = {
        id: 'msg-2',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-2',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      allocator.enqueueMessage('agent-1', message1);
      allocator.enqueueMessage('agent-2', message2);
      
      const decision = allocator.scheduleNextAgent(['agent-1', 'agent-2']);
      expect(decision).toBeDefined();
      expect(['agent-1', 'agent-2']).toContain(decision?.agentId);
    });

    it('should prioritize starved agents', async () => {
      allocator = new ResourceAllocator({ 
        starvationThresholdMs: 100,
        priorityBoostForStarved: 10
      });
      
      allocator.registerAgent('agent-1');
      allocator.registerAgent('agent-2');
      
      const message1: MessageObject = {
        id: 'msg-1',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-1',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      const message2: MessageObject = {
        id: 'msg-2',
        type: MessageType.TASK_REQUEST,
        workflowId: 'workflow-1',
        sourceAgentId: 'source',
        targetAgentId: 'agent-2',
        payload: {},
        metadata: {
          timestamp: Date.now(),
          priority: Priority.NORMAL,
          retryCount: 0
        }
      };

      allocator.enqueueMessage('agent-1', message1);
      allocator.enqueueMessage('agent-2', message2);
      
      // Process agent-2 to make agent-1 starved
      allocator.recordProcessing('agent-2', 50);
      
      // Wait for starvation threshold
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const decision = allocator.scheduleNextAgent(['agent-1', 'agent-2']);
      expect(decision?.agentId).toBe('agent-1');
      expect(decision?.reason).toContain('starved');
    });
  });

  describe('Metrics', () => {
    it('should return all metrics', () => {
      allocator.registerAgent('agent-1');
      allocator.registerAgent('agent-2');
      
      const allMetrics = allocator.getAllMetrics();
      expect(allMetrics.size).toBe(2);
      expect(allMetrics.has('agent-1')).toBe(true);
      expect(allMetrics.has('agent-2')).toBe(true);
    });

    it('should reset metrics', () => {
      allocator.registerAgent('agent-1');
      
      allocator.recordProcessing('agent-1', 100);
      expect(allocator.getAgentMetrics('agent-1')?.messagesProcessed).toBe(1);
      
      allocator.reset();
      expect(allocator.getAgentMetrics('agent-1')?.messagesProcessed).toBe(0);
    });
  });
});
