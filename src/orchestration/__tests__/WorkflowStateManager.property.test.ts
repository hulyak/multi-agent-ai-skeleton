import fc from 'fast-check';
import { WorkflowStateManager } from '../WorkflowStateManager';
import {
  WorkflowStatus,
  TaskStatus,
  Task
} from '../../types';

// Increase Jest timeout for property tests
jest.setTimeout(30000);

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

const workflowStatusArbitrary = fc.constantFrom(...Object.values(WorkflowStatus));
const taskStatusArbitrary = fc.constantFrom(...Object.values(TaskStatus));

function taskDataArbitrary(): fc.Arbitrary<Omit<Task, 'id' | 'createdAt' | 'childTaskIds'>> {
  return fc.record({
    agentId: fc.uuid(),
    status: taskStatusArbitrary,
    input: fc.dictionary(fc.string(), fc.anything()),
    output: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
    error: fc.option(fc.constant(new Error('Test error')), { nil: undefined }),
    retryCount: fc.integer({ min: 0, max: 3 }),
    parentTaskId: fc.option(fc.uuid(), { nil: undefined }),
    completedAt: fc.option(fc.integer({ min: Date.now() - 86400000, max: Date.now() }), { nil: undefined })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('WorkflowStateManager Property Tests', () => {
  // Feature: multi-agent-skeleton, Property 4: Task delegation creates child tasks
  describe('Property 4: Task delegation creates child tasks', () => {
    it('should create child task with parent-child relationship when agent delegates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          taskDataArbitrary(), // parent task data
          taskDataArbitrary(), // child task data
          async (workflowId, parentTaskData, childTaskData) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow
            manager.createWorkflow(workflowId, {
              status: WorkflowStatus.IN_PROGRESS,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create parent task (without parentTaskId)
            const parentTaskDataWithoutParent = {
              ...parentTaskData,
              parentTaskId: undefined
            };
            const parentTaskId = manager.createTask(workflowId, parentTaskDataWithoutParent);

            // Create child task with parent reference
            const childTaskDataWithParent = {
              ...childTaskData,
              parentTaskId: parentTaskId
            };
            const childTaskId = manager.createTask(workflowId, childTaskDataWithParent);

            // Verify parent-child relationship
            const parentTask = manager.getTask(workflowId, parentTaskId);
            const childTask = manager.getTask(workflowId, childTaskId);

            // Property: Child task should have parentTaskId set
            expect(childTask.parentTaskId).toBe(parentTaskId);

            // Property: Parent task should have child in childTaskIds
            expect(parentTask.childTaskIds).toContain(childTaskId);

            // Property: Child task should be retrievable via getChildTasks
            const childTasks = manager.getChildTasks(workflowId, parentTaskId);
            expect(childTasks).toHaveLength(1);
            expect(childTasks[0].id).toBe(childTaskId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should support multiple child tasks for a single parent', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          taskDataArbitrary(), // parent task data
          fc.array(taskDataArbitrary(), { minLength: 1, maxLength: 5 }), // multiple child tasks
          async (workflowId, parentTaskData, childTasksData) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow
            manager.createWorkflow(workflowId, {
              status: WorkflowStatus.IN_PROGRESS,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create parent task
            const parentTaskDataWithoutParent = {
              ...parentTaskData,
              parentTaskId: undefined
            };
            const parentTaskId = manager.createTask(workflowId, parentTaskDataWithoutParent);

            // Create multiple child tasks
            const childTaskIds: string[] = [];
            for (const childTaskData of childTasksData) {
              const childTaskDataWithParent = {
                ...childTaskData,
                parentTaskId: parentTaskId
              };
              const childTaskId = manager.createTask(workflowId, childTaskDataWithParent);
              childTaskIds.push(childTaskId);
            }

            // Verify all children are linked to parent
            const parentTask = manager.getTask(workflowId, parentTaskId);
            expect(parentTask.childTaskIds).toHaveLength(childTaskIds.length);
            
            for (const childTaskId of childTaskIds) {
              expect(parentTask.childTaskIds).toContain(childTaskId);
              
              const childTask = manager.getTask(workflowId, childTaskId);
              expect(childTask.parentTaskId).toBe(parentTaskId);
            }

            // Verify getChildTasks returns all children
            const childTasks = manager.getChildTasks(workflowId, parentTaskId);
            expect(childTasks).toHaveLength(childTaskIds.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should support nested task delegation (grandparent-parent-child)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          taskDataArbitrary(), // grandparent task
          taskDataArbitrary(), // parent task
          taskDataArbitrary(), // child task
          async (workflowId, grandparentData, parentData, childData) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow
            manager.createWorkflow(workflowId, {
              status: WorkflowStatus.IN_PROGRESS,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create grandparent task
            const grandparentTaskId = manager.createTask(workflowId, {
              ...grandparentData,
              parentTaskId: undefined
            });

            // Create parent task as child of grandparent
            const parentTaskId = manager.createTask(workflowId, {
              ...parentData,
              parentTaskId: grandparentTaskId
            });

            // Create child task as child of parent
            const childTaskId = manager.createTask(workflowId, {
              ...childData,
              parentTaskId: parentTaskId
            });

            // Verify three-level hierarchy
            const grandparentTask = manager.getTask(workflowId, grandparentTaskId);
            const parentTask = manager.getTask(workflowId, parentTaskId);
            const childTask = manager.getTask(workflowId, childTaskId);

            // Grandparent has parent as child
            expect(grandparentTask.childTaskIds).toContain(parentTaskId);
            expect(grandparentTask.parentTaskId).toBeUndefined();

            // Parent has both parent and child references
            expect(parentTask.parentTaskId).toBe(grandparentTaskId);
            expect(parentTask.childTaskIds).toContain(childTaskId);

            // Child has parent reference
            expect(childTask.parentTaskId).toBe(parentTaskId);
            expect(childTask.childTaskIds).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: multi-agent-skeleton, Property 11: Workflow and agent state API availability
  describe('Property 11: Workflow and agent state API availability', () => {
    it('should provide API to retrieve current workflow state snapshots', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          workflowStatusArbitrary,
          fc.dictionary(fc.string(), fc.anything()), // sharedData
          fc.array(taskDataArbitrary(), { minLength: 0, maxLength: 5 }), // tasks
          async (workflowId, status, sharedData, tasksData) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow with initial state
            manager.createWorkflow(workflowId, {
              status,
              sharedData,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create tasks
            const taskIds: string[] = [];
            for (const taskData of tasksData) {
              const taskId = manager.createTask(workflowId, {
                ...taskData,
                parentTaskId: undefined
              });
              taskIds.push(taskId);
            }

            // Property: API should return current workflow state
            const retrievedWorkflow = manager.getWorkflow(workflowId);
            expect(retrievedWorkflow).toBeDefined();
            expect(retrievedWorkflow.id).toBe(workflowId);
            expect(retrievedWorkflow.status).toBe(status);
            expect(retrievedWorkflow.sharedData).toEqual(sharedData);

            // Property: Workflow should contain all created tasks
            expect(retrievedWorkflow.tasks.size).toBe(taskIds.length);
            for (const taskId of taskIds) {
              expect(retrievedWorkflow.tasks.has(taskId)).toBe(true);
            }

            // Property: hasWorkflow should return true for existing workflow
            expect(manager.hasWorkflow(workflowId)).toBe(true);

            // Property: getAllWorkflowIds should include this workflow
            const allIds = manager.getAllWorkflowIds();
            expect(allIds).toContain(workflowId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide API to retrieve individual tasks from workflow', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          fc.array(taskDataArbitrary(), { minLength: 1, maxLength: 5 }), // tasks
          async (workflowId, tasksData) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow
            manager.createWorkflow(workflowId, {
              status: WorkflowStatus.IN_PROGRESS,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create tasks
            const taskIds: string[] = [];
            for (const taskData of tasksData) {
              const taskId = manager.createTask(workflowId, {
                ...taskData,
                parentTaskId: undefined
              });
              taskIds.push(taskId);
            }

            // Property: Each task should be retrievable via getTask
            for (let i = 0; i < taskIds.length; i++) {
              const taskId = taskIds[i];
              const task = manager.getTask(workflowId, taskId);
              
              expect(task).toBeDefined();
              expect(task.id).toBe(taskId);
              expect(task.agentId).toBe(tasksData[i].agentId);
              expect(task.status).toBe(tasksData[i].status);
            }

            // Property: getAllTasks should return all tasks
            const allTasks = manager.getAllTasks(workflowId);
            expect(allTasks).toHaveLength(taskIds.length);
            
            const retrievedTaskIds = allTasks.map(t => t.id);
            for (const taskId of taskIds) {
              expect(retrievedTaskIds).toContain(taskId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide API to update workflow state', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          workflowStatusArbitrary, // initial status
          workflowStatusArbitrary, // updated status
          fc.dictionary(fc.string(), fc.anything()), // initial sharedData
          fc.dictionary(fc.string(), fc.anything()), // updated sharedData
          async (workflowId, initialStatus, updatedStatus, initialSharedData, updatedSharedData) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow with initial state
            manager.createWorkflow(workflowId, {
              status: initialStatus,
              sharedData: initialSharedData,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Property: updateWorkflow should modify workflow state
            const updatedWorkflow = manager.updateWorkflow(workflowId, {
              status: updatedStatus,
              sharedData: updatedSharedData
            });

            expect(updatedWorkflow.status).toBe(updatedStatus);
            
            // Shared data should be merged
            for (const key in updatedSharedData) {
              expect(updatedWorkflow.sharedData[key]).toEqual(updatedSharedData[key]);
            }

            // Property: Changes should be reflected in subsequent getWorkflow calls
            const retrievedWorkflow = manager.getWorkflow(workflowId);
            expect(retrievedWorkflow.status).toBe(updatedStatus);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide API to update task state', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          taskDataArbitrary(), // initial task data
          taskStatusArbitrary, // updated status
          fc.dictionary(fc.string(), fc.anything()), // updated output
          async (workflowId, initialTaskData, updatedStatus, updatedOutput) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow
            manager.createWorkflow(workflowId, {
              status: WorkflowStatus.IN_PROGRESS,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create task
            const taskId = manager.createTask(workflowId, {
              ...initialTaskData,
              parentTaskId: undefined
            });

            // Property: updateTask should modify task state
            const updatedTask = manager.updateTask(workflowId, taskId, {
              status: updatedStatus,
              output: updatedOutput
            });

            expect(updatedTask.status).toBe(updatedStatus);
            expect(updatedTask.output).toEqual(updatedOutput);

            // Property: Changes should be reflected in subsequent getTask calls
            const retrievedTask = manager.getTask(workflowId, taskId);
            expect(retrievedTask.status).toBe(updatedStatus);
            expect(retrievedTask.output).toEqual(updatedOutput);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error when accessing non-existent workflow', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // non-existent workflowId
          async (workflowId) => {
            const manager = new WorkflowStateManager();
            
            // Property: Accessing non-existent workflow should throw error
            expect(() => manager.getWorkflow(workflowId)).toThrow();
            
            // Property: hasWorkflow should return false
            expect(manager.hasWorkflow(workflowId)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error when accessing non-existent task', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // workflowId
          fc.uuid(), // non-existent taskId
          async (workflowId, taskId) => {
            const manager = new WorkflowStateManager();
            
            // Create workflow
            manager.createWorkflow(workflowId, {
              status: WorkflowStatus.IN_PROGRESS,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Property: Accessing non-existent task should throw error
            expect(() => manager.getTask(workflowId, taskId)).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
