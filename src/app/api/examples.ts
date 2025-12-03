// Example usage of the API Gateway endpoints
// This file demonstrates how to interact with the API routes

import { MessageType, Priority } from '@/types';

/**
 * Example 1: Send a message to an agent
 */
export async function sendMessageExample() {
  const response = await fetch('/api/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: MessageType.TASK_REQUEST,
      workflowId: 'user-query-001',
      sourceAgentId: 'ui',
      targetAgentId: 'intent-detection-agent',
      payload: {
        query: 'What are your business hours?'
      },
      priority: Priority.NORMAL
    })
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Message sent successfully:', data.messageId);
  } else {
    console.error('Failed to send message:', data.error);
  }
  
  return data;
}

/**
 * Example 2: Get workflow state
 */
export async function getWorkflowStateExample(workflowId: string) {
  const response = await fetch(`/api/state/${workflowId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Workflow state:', data.workflow);
    console.log('Status:', data.workflow.status);
    console.log('Tasks:', data.workflow.tasks.length);
  } else {
    console.error('Failed to get workflow state:', data.error);
  }
  
  return data;
}

/**
 * Example 3: Get agent health and logs
 */
export async function getAgentHealthExample(agentId: string) {
  const response = await fetch(`/api/agent/${agentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Agent:', data.agent.name);
    console.log('Status:', data.agent.state.status);
    console.log('Completed tasks:', data.agent.state.completedTasks);
    console.log('Failed tasks:', data.agent.state.failedTasks);
    console.log('Error logs:', data.agent.logs.length);
  } else {
    console.error('Failed to get agent health:', data.error);
  }
  
  return data;
}

/**
 * Example 4: Send a high-priority message
 */
export async function sendHighPriorityMessage() {
  const response = await fetch('/api/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: MessageType.TASK_REQUEST,
      workflowId: 'urgent-query-001',
      sourceAgentId: 'ui',
      targetAgentId: 'escalation-agent',
      payload: {
        query: 'System is down!',
        urgency: 'critical'
      },
      priority: Priority.CRITICAL
    })
  });

  return await response.json();
}

/**
 * Example 5: Broadcast a health check to all agents
 */
export async function broadcastHealthCheck() {
  const response = await fetch('/api/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: MessageType.HEALTH_CHECK,
      workflowId: 'system-health-check',
      sourceAgentId: 'monitoring',
      targetAgentId: null, // null means broadcast to all agents
      payload: {}
    })
  });

  return await response.json();
}

/**
 * Example 6: Poll workflow status until completion
 */
export async function pollWorkflowUntilComplete(
  workflowId: string,
  maxAttempts: number = 10,
  intervalMs: number = 1000
): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/state/${workflowId}`);
    const data = await response.json();
    
    if (data.success) {
      const status = data.workflow.status;
      
      if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
        return data.workflow;
      }
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Workflow ${workflowId} did not complete within ${maxAttempts} attempts`);
}

/**
 * Example 7: Monitor agent health periodically
 */
export function monitorAgentHealth(
  agentId: string,
  onHealthUpdate: (health: any) => void,
  intervalMs: number = 5000
): () => void {
  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(`/api/agent/${agentId}`);
      const data = await response.json();
      
      if (data.success) {
        onHealthUpdate(data.agent);
      }
    } catch (error) {
      console.error('Error monitoring agent health:', error);
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Example 8: Send a task delegation message
 */
export async function delegateTask() {
  const response = await fetch('/api/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: MessageType.TASK_DELEGATION,
      workflowId: 'research-workflow-001',
      sourceAgentId: 'research-coordinator',
      targetAgentId: 'retrieval-agent',
      payload: {
        topic: 'artificial intelligence',
        maxDocuments: 10
      },
      priority: Priority.HIGH
    })
  });

  return await response.json();
}

/**
 * Example 9: Handle API errors gracefully
 */
export async function sendMessageWithErrorHandling(messageData: any) {
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const data = await response.json();
    
    if (!data.success) {
      // Handle different error types
      if (response.status === 400) {
        console.error('Validation error:', data.error);
        if (data.details) {
          console.error('Details:', data.details);
        }
      } else if (response.status === 503) {
        console.error('Service unavailable:', data.error);
        // Maybe retry after a delay
      } else {
        console.error('Unexpected error:', data.error);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}

/**
 * Example 10: Complete workflow - send message and monitor completion
 */
export async function executeWorkflow(query: string) {
  // 1. Create workflow ID
  const workflowId = `workflow-${Date.now()}`;
  
  // 2. Send initial message
  const sendResult = await fetch('/api/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: MessageType.TASK_REQUEST,
      workflowId,
      sourceAgentId: 'ui',
      targetAgentId: 'intent-detection-agent',
      payload: { query }
    })
  });
  
  const sendData = await sendResult.json();
  
  if (!sendData.success) {
    throw new Error(`Failed to send message: ${sendData.error}`);
  }
  
  // 3. Poll for completion
  const workflow = await pollWorkflowUntilComplete(workflowId);
  
  // 4. Return final result
  return {
    workflowId,
    status: workflow.status,
    result: workflow.sharedData
  };
}
