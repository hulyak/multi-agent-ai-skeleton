# API Gateway Documentation

This directory contains documentation for the API Gateway layer that provides HTTP endpoints for interacting with the multi-agent orchestration system.

## Available Endpoints

### POST /api/message

Send a message to agents in the orchestration system.

**Request Body:**
```json
{
  "type": "TASK_REQUEST",
  "workflowId": "workflow-123",
  "sourceAgentId": "user-interface",
  "targetAgentId": "intent-detection-agent",
  "payload": {
    "query": "What are your business hours?"
  },
  "priority": 1,
  "retryCount": 0
}
```

**Response (Success):**
```json
{
  "success": true,
  "messageId": "msg-1234567890-abc123",
  "message": "Message sent successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required fields: type, workflowId, sourceAgentId, payload"
}
```

**Status Codes:**
- `200`: Message sent successfully
- `400`: Invalid request (missing fields, invalid message type, validation errors)
- `503`: Orchestrator not initialized
- `500`: Internal server error

**Message Types:**
- `TASK_REQUEST`: Request an agent to perform a task
- `TASK_RESPONSE`: Response from an agent after completing a task
- `TASK_DELEGATION`: Delegate a subtask to another agent
- `STATE_UPDATE`: Update workflow state
- `ERROR`: Error notification
- `HEALTH_CHECK`: Health check request

**Priority Levels:**
- `0`: LOW
- `1`: NORMAL
- `2`: HIGH
- `3`: CRITICAL

---

### GET /api/state/:workflowId

Retrieve the current state of a workflow.

**URL Parameters:**
- `workflowId` (required): The unique identifier of the workflow

**Response (Success):**
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-123",
    "status": "IN_PROGRESS",
    "tasks": [
      {
        "id": "task-1",
        "agentId": "intent-detection-agent",
        "status": "COMPLETED",
        "input": { "query": "What are your business hours?" },
        "output": { "intent": "FAQ", "confidence": 0.95 },
        "retryCount": 0,
        "childTaskIds": ["task-2"],
        "createdAt": 1638360000000,
        "completedAt": 1638360001000
      }
    ],
    "sharedData": {
      "userQuery": "What are your business hours?",
      "detectedIntent": "FAQ"
    },
    "metadata": {
      "createdAt": 1638360000000,
      "updatedAt": 1638360001000,
      "initiatorId": "user-interface"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Workflow with ID workflow-123 not found"
}
```

**Status Codes:**
- `200`: Workflow state retrieved successfully
- `400`: Invalid request (missing or empty workflow ID)
- `404`: Workflow not found
- `503`: Orchestrator not initialized
- `500`: Internal server error

**Workflow Status Values:**
- `PENDING`: Workflow created but not started
- `IN_PROGRESS`: Workflow is currently executing
- `COMPLETED`: Workflow completed successfully
- `FAILED`: Workflow failed
- `CANCELLED`: Workflow was cancelled

**Task Status Values:**
- `PENDING`: Task created but not started
- `IN_PROGRESS`: Task is currently executing
- `COMPLETED`: Task completed successfully
- `FAILED`: Task failed
- `RETRYING`: Task is being retried after failure

---

### GET /api/agent/:agentId

Retrieve health status and logs for a specific agent.

**URL Parameters:**
- `agentId` (required): The unique identifier of the agent

**Response (Success):**
```json
{
  "success": true,
  "agent": {
    "id": "intent-detection-agent",
    "name": "Intent Detection Agent",
    "capabilities": ["intent-classification", "entity-extraction"],
    "state": {
      "id": "intent-detection-agent",
      "status": "READY",
      "currentTasks": [],
      "completedTasks": 42,
      "failedTasks": 2,
      "averageProcessingTime": 850,
      "lastHealthCheck": 1638360000000,
      "configuration": {
        "model": "claude-3-sonnet",
        "temperature": 0.7
      }
    },
    "health": {
      "status": "healthy",
      "lastCheck": 1638360000000,
      "uptime": 3600000
    },
    "logs": [
      {
        "timestamp": 1638359000000,
        "errorType": "TRANSIENT",
        "message": "Temporary API timeout",
        "stack": "Error: Temporary API timeout\n    at ...",
        "context": {
          "workflowId": "workflow-123",
          "agentId": "intent-detection-agent",
          "operation": "classifyIntent",
          "timestamp": 1638359000000
        },
        "retryStrategy": {
          "shouldRetry": true,
          "maxRetries": 3
        }
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Agent with ID intent-detection-agent not found"
}
```

**Status Codes:**
- `200`: Agent information retrieved successfully
- `400`: Invalid request (missing or empty agent ID)
- `404`: Agent not found
- `503`: Orchestrator not initialized
- `500`: Internal server error

**Agent Status Values:**
- `INITIALIZING`: Agent is being initialized
- `READY`: Agent is ready to process tasks
- `BUSY`: Agent is currently processing tasks
- `ERROR`: Agent encountered an error
- `SHUTDOWN`: Agent has been shut down

**Error Types:**
- `TRANSIENT`: Temporary errors (network timeouts, service unavailability)
- `VALIDATION`: Invalid input data or malformed messages
- `BUSINESS_LOGIC`: Agent-specific processing failures
- `SYSTEM`: Critical infrastructure failures

---

## Usage Examples

### Example 1: Send a User Query to Intent Detection Agent

```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TASK_REQUEST",
    "workflowId": "user-query-001",
    "sourceAgentId": "ui",
    "targetAgentId": "intent-detection-agent",
    "payload": {
      "query": "How do I reset my password?"
    }
  }'
```

### Example 2: Check Workflow Status

```bash
curl http://localhost:3000/api/state/user-query-001
```

### Example 3: Check Agent Health

```bash
curl http://localhost:3000/api/agent/intent-detection-agent
```

### Example 4: Broadcast Message to All Agents

```bash
curl -X POST http://localhost:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{
    "type": "HEALTH_CHECK",
    "workflowId": "system-health-check",
    "sourceAgentId": "monitoring",
    "targetAgentId": null,
    "payload": {}
  }'
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": ["Additional error details if available"]
}
```

Common error scenarios:

1. **Orchestrator Not Initialized (503)**
   - The orchestrator must be initialized before accepting requests
   - Initialize the orchestrator by calling `orchestrator.initialize()`

2. **Validation Errors (400)**
   - Missing required fields
   - Invalid enum values (message type, priority, etc.)
   - Malformed request body

3. **Not Found Errors (404)**
   - Workflow ID doesn't exist
   - Agent ID doesn't exist

4. **Internal Server Errors (500)**
   - Unexpected errors during processing
   - Check server logs for details

---

## Integration with Orchestrator

The API routes use a singleton orchestrator instance. In a production environment, you would:

1. Initialize the orchestrator on application startup
2. Register all agents
3. Set up proper lifecycle management
4. Implement proper error handling and monitoring

Example initialization:

```typescript
import { AgentOrchestrator } from '@/orchestration/AgentOrchestrator';
import { IntentDetectionAgent } from '@/agents/IntentDetectionAgent';
import { FAQAgent } from '@/agents/FAQAgent';

// Create orchestrator
const orchestrator = new AgentOrchestrator();

// Register agents
orchestrator.registerAgent(new IntentDetectionAgent());
orchestrator.registerAgent(new FAQAgent());

// Initialize
await orchestrator.initialize();

// Now the API endpoints can accept requests
```

---

## Testing

To test the API endpoints:

1. Start the Next.js development server:
   ```bash
   npm run dev
   ```

2. Use curl, Postman, or any HTTP client to send requests

3. Check the response status codes and body

4. Monitor the console for orchestrator logs

---

## Security Considerations

In a production environment, you should:

1. Add authentication and authorization
2. Validate and sanitize all inputs
3. Implement rate limiting
4. Add request logging and monitoring
5. Use HTTPS for all communications
6. Implement proper CORS policies
7. Add API versioning

---

## Performance Considerations

- Message routing should complete within 100ms
- Workflow state retrieval should be fast (in-memory)
- Agent health checks should be cached
- Consider implementing pagination for large result sets
- Monitor API response times and set up alerts

---

## Future Enhancements

Potential improvements to the API Gateway:

1. WebSocket support for real-time updates
2. Batch message sending
3. Workflow creation endpoint
4. Agent registration/deregistration endpoints
5. Metrics and analytics endpoints
6. Admin endpoints for system management
7. GraphQL API as an alternative to REST
