# Orchestration Layer

This directory contains the core orchestration components for the multi-agent system.

## Components

### MessageBus
Handles routing and delivery of messages between agents with retry logic.

**Key Features:**
- Message routing to specific agents or broadcast
- Subscription management for agents
- Retry logic with configurable policies (exponential, linear, fixed backoff)
- Message history tracking
- Delivery metrics

**Usage:**
```typescript
const messageBus = new MessageBus();

// Subscribe an agent
messageBus.subscribe('agent-1', [MessageType.TASK_REQUEST], async (message) => {
  // Handle message
});

// Send a message
await messageBus.route(message);

// Send with retry
const result = await messageBus.sendWithRetry(message, retryPolicy);
```

### WorkflowStateManager
Manages shared state and tasks across workflows.

**Key Features:**
- Workflow CRUD operations
- Task creation and management
- Parent-child task relationships
- State persistence (placeholder for future DynamoDB integration)

**Usage:**
```typescript
const stateManager = new WorkflowStateManager();

// Create a workflow
const workflow = stateManager.createWorkflow('workflow-1');

// Create a task
const taskId = stateManager.createTask('workflow-1', {
  agentId: 'agent-1',
  status: TaskStatus.PENDING,
  input: { query: 'test' },
  retryCount: 0
});

// Update task
stateManager.updateTask('workflow-1', taskId, {
  status: TaskStatus.COMPLETED,
  output: { result: 'success' }
});
```

### ErrorHandler
Comprehensive error handling system with classification, logging, and failure propagation.

**Key Features:**
- Error classification (transient, validation, business logic, system)
- Structured error logging with stack traces and context
- Error log storage and retrieval API
- Failure notification system for dependent agents
- Automatic retry policy determination based on error type

**Usage:**
```typescript
const errorHandler = new ErrorHandler();

// Handle an error
const { logEntry, strategy } = await errorHandler.handleError(
  error,
  {
    workflowId: 'workflow-1',
    taskId: 'task-1',
    agentId: 'agent-1',
    operation: 'processMessage',
    timestamp: Date.now()
  }
);

// Retrieve error logs
const logger = errorHandler.getLogger();
const workflowErrors = logger.getLogsByWorkflow('workflow-1');
const agentErrors = logger.getLogsByAgent('agent-1');

// Register agent dependencies for failure notifications
const notificationSystem = errorHandler.getNotificationSystem();
notificationSystem.registerDependency('source-agent', 'dependent-agent');
notificationSystem.registerNotificationHandler('dependent-agent', async (notification) => {
  console.log(`Agent ${notification.failedAgentId} failed:`, notification.error);
});
```

## Error Classification

The system classifies errors into four categories:

1. **Transient Errors**: Network timeouts, temporary service unavailability
   - Strategy: Retry with exponential backoff (max 3 retries)
   - Examples: API timeouts, database connection failures

2. **Validation Errors**: Invalid input data, malformed messages
   - Strategy: Reject immediately, no retries
   - Examples: Invalid message format, missing required fields

3. **Business Logic Errors**: Agent-specific processing failures
   - Strategy: Retry with linear backoff (max 2 retries)
   - Examples: Intent classification failure, document not found

4. **System Errors**: Critical infrastructure failures
   - Strategy: No retries, notify dependents, escalate
   - Examples: Message bus failure, state store unavailability

### ResourceAllocator
Fair scheduling and resource management for concurrent agents to prevent starvation.

**Key Features:**
- Fair scheduling algorithm for concurrent agents
- Starvation detection and prevention
- Priority-based message queueing
- Resource metrics collection per agent
- Automatic priority boost for starved agents

**Usage:**
```typescript
const resourceAllocator = new ResourceAllocator({
  starvationThresholdMs: 5000,  // Time without processing before considered starved
  fairnessWindow: 100,           // Number of recent messages to consider
  priorityBoostForStarved: 10    // Priority boost for starved agents
});

// Register agents
resourceAllocator.registerAgent('agent-1');
resourceAllocator.registerAgent('agent-2');

// Enqueue messages
resourceAllocator.enqueueMessage('agent-1', message);

// Get next message for an agent (priority-sorted)
const nextMessage = resourceAllocator.dequeueMessage('agent-1');

// Record processing
resourceAllocator.recordProcessing('agent-1', processingTimeMs);

// Detect starvation
const starvedAgents = resourceAllocator.detectStarvation();

// Fair scheduling decision
const decision = resourceAllocator.scheduleNextAgent(['agent-1', 'agent-2']);
console.log(`Schedule ${decision.agentId}: ${decision.reason}`);

// Get metrics
const metrics = resourceAllocator.getAgentMetrics('agent-1');
console.log(`Agent processed ${metrics.messagesProcessed} messages`);
console.log(`Average processing time: ${metrics.averageProcessingTime}ms`);
console.log(`Is starved: ${metrics.isStarved}`);
```

**Fair Scheduling Algorithm:**

The ResourceAllocator uses a multi-factor priority algorithm to ensure fair resource allocation:

1. **Starvation Prevention**: Agents that haven't processed messages for longer than the threshold receive a significant priority boost
2. **Queue Size**: Agents with more queued messages receive slight priority
3. **Time-Based Fairness**: Agents that haven't processed recently get priority
4. **Load Balancing**: Agents that have processed fewer messages than average get priority

This ensures:
- No agent is completely starved of resources
- High-priority messages are still processed first
- Resources are distributed fairly among all active agents
- Performance metrics are collected for monitoring

## Testing

All components have comprehensive property-based tests using fast-check:

- `MessageBus.property.test.ts`: Tests message delivery, retry logic, and routing
- `MessageBus.routing.property.test.ts`: Tests message routing correctness
- `WorkflowStateManager.property.test.ts`: Tests workflow and task management
- `ErrorHandler.property.test.ts`: Tests error logging, retry policies, and failure propagation
- `ResourceAllocator.property.test.ts`: Tests fair resource allocation, starvation prevention, and performance metrics
- `ResourceAllocator.test.ts`: Unit tests for resource allocation functionality

Run tests:
```bash
npm test
```
