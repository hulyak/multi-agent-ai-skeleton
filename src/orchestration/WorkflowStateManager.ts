import {
  WorkflowState,
  WorkflowStatus,
  Task,
  TaskStatus,
  validateWorkflowState,
  validateTask
} from '../types';

// ============================================================================
// Workflow State Manager
// ============================================================================

export class WorkflowStateManager {
  private workflows: Map<string, WorkflowState> = new Map();

  /**
   * Create a new workflow with initial state
   */
  createWorkflow(workflowId: string, initialState?: Partial<WorkflowState>): WorkflowState {
    if (!workflowId || workflowId.trim() === '') {
      throw new Error('Workflow ID must be a non-empty string');
    }

    if (this.workflows.has(workflowId)) {
      throw new Error(`Workflow with ID ${workflowId} already exists`);
    }

    const now = Date.now();
    const workflow: WorkflowState = {
      id: workflowId,
      status: initialState?.status || WorkflowStatus.PENDING,
      tasks: new Map(),
      sharedData: initialState?.sharedData || {},
      metadata: initialState?.metadata || {
        createdAt: now,
        updatedAt: now,
        initiatorId: initialState?.metadata?.initiatorId || 'system'
      }
    };

    // Validate the workflow state
    const validation = validateWorkflowState(workflow);
    if (!validation.valid) {
      throw new Error(`Invalid workflow state: ${validation.errors.join(', ')}`);
    }

    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowState {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }

    return workflow;
  }

  /**
   * Update a workflow with partial updates
   */
  updateWorkflow(workflowId: string, updates: Partial<WorkflowState>): WorkflowState {
    const workflow = this.getWorkflow(workflowId);

    // Apply updates
    if (updates.status !== undefined) {
      workflow.status = updates.status;
    }

    if (updates.sharedData !== undefined) {
      workflow.sharedData = { ...workflow.sharedData, ...updates.sharedData };
    }

    // Update metadata timestamp
    workflow.metadata.updatedAt = Date.now();

    // Validate updated workflow
    const validation = validateWorkflowState(workflow);
    if (!validation.valid) {
      throw new Error(`Invalid workflow state after update: ${validation.errors.join(', ')}`);
    }

    return workflow;
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(workflowId: string): void {
    if (!this.workflows.has(workflowId)) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }

    this.workflows.delete(workflowId);
  }

  /**
   * Create a new task in a workflow
   */
  createTask(workflowId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'childTaskIds'>): string {
    const workflow = this.getWorkflow(workflowId);

    // Generate task ID
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const task: Task = {
      id: taskId,
      agentId: taskData.agentId,
      status: taskData.status || TaskStatus.PENDING,
      input: taskData.input,
      output: taskData.output,
      error: taskData.error,
      retryCount: taskData.retryCount || 0,
      parentTaskId: taskData.parentTaskId,
      childTaskIds: [],
      createdAt: Date.now(),
      completedAt: taskData.completedAt
    };

    // Validate task
    const validation = validateTask(task);
    if (!validation.valid) {
      throw new Error(`Invalid task: ${validation.errors.join(', ')}`);
    }

    // Add task to workflow
    workflow.tasks.set(taskId, task);

    // If this task has a parent, add it to parent's childTaskIds
    if (task.parentTaskId) {
      const parentTask = workflow.tasks.get(task.parentTaskId);
      if (parentTask) {
        parentTask.childTaskIds.push(taskId);
      }
    }

    // Update workflow metadata
    workflow.metadata.updatedAt = Date.now();

    return taskId;
  }

  /**
   * Update a task in a workflow
   */
  updateTask(workflowId: string, taskId: string, updates: Partial<Task>): Task {
    const workflow = this.getWorkflow(workflowId);
    const task = workflow.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found in workflow ${workflowId}`);
    }

    // Apply updates
    if (updates.status !== undefined) {
      task.status = updates.status;
    }

    if (updates.output !== undefined) {
      task.output = updates.output;
    }

    if (updates.error !== undefined) {
      task.error = updates.error;
    }

    if (updates.retryCount !== undefined) {
      task.retryCount = updates.retryCount;
    }

    if (updates.completedAt !== undefined) {
      task.completedAt = updates.completedAt;
    }

    // Validate updated task
    const validation = validateTask(task);
    if (!validation.valid) {
      throw new Error(`Invalid task after update: ${validation.errors.join(', ')}`);
    }

    // Update workflow metadata
    workflow.metadata.updatedAt = Date.now();

    return task;
  }

  /**
   * Get a task from a workflow
   */
  getTask(workflowId: string, taskId: string): Task {
    const workflow = this.getWorkflow(workflowId);
    const task = workflow.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found in workflow ${workflowId}`);
    }

    return task;
  }

  /**
   * Get all tasks for a workflow
   */
  getAllTasks(workflowId: string): Task[] {
    const workflow = this.getWorkflow(workflowId);
    return Array.from(workflow.tasks.values());
  }

  /**
   * Get child tasks of a parent task
   */
  getChildTasks(workflowId: string, parentTaskId: string): Task[] {
    const workflow = this.getWorkflow(workflowId);
    const parentTask = workflow.tasks.get(parentTaskId);

    if (!parentTask) {
      throw new Error(`Parent task with ID ${parentTaskId} not found in workflow ${workflowId}`);
    }

    return parentTask.childTaskIds
      .map(childId => workflow.tasks.get(childId))
      .filter((task): task is Task => task !== undefined);
  }

  /**
   * Check if a workflow exists
   */
  hasWorkflow(workflowId: string): boolean {
    return this.workflows.has(workflowId);
  }

  /**
   * Get all workflow IDs
   */
  getAllWorkflowIds(): string[] {
    return Array.from(this.workflows.keys());
  }

  /**
   * Clear all workflows (useful for testing)
   */
  clear(): void {
    this.workflows.clear();
  }

  /**
   * Persist workflow state (placeholder for future implementation)
   */
  async persist(workflowId: string): Promise<void> {
    const workflow = this.getWorkflow(workflowId);
    // TODO: Implement persistence to DynamoDB or other storage
    console.log(`Persisting workflow ${workflowId}`, workflow);
  }

  /**
   * Restore workflow state (placeholder for future implementation)
   */
  async restore(_workflowId: string): Promise<WorkflowState> {
    // TODO: Implement restoration from DynamoDB or other storage
    throw new Error('Restore not yet implemented');
  }
}
