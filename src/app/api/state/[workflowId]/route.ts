// GET /api/state/[workflowId] - Retrieve workflow state

import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/orchestration/AgentOrchestrator';

// Global orchestrator instance (in production, this would be managed differently)
let orchestrator: AgentOrchestrator | null = null;

function getOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
  }
  return orchestrator;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const orch = getOrchestrator();
  
  // Start tracking request
  if (orch.isReady()) {
    orch.getPerformanceMonitor().startRequest(requestId, '/api/state');
  }
  
  try {
    const { workflowId } = params;

    // Validate workflowId
    if (!workflowId || workflowId.trim() === '') {
      if (orch.isReady()) {
        orch.getPerformanceMonitor().endRequest(requestId, false, 'Workflow ID is required');
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow ID is required'
        },
        { status: 400 }
      );
    }

    // Check if orchestrator is initialized
    if (!orch.isReady()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Orchestrator is not initialized. Please initialize the system first.'
        },
        { status: 503 }
      );
    }

    // Get workflow state
    const workflowState = orch.getWorkflowState(workflowId);

    // Convert Map to array for JSON serialization
    const tasksArray = Array.from(workflowState.tasks.entries()).map(([id, task]) => ({
      id,
      ...task,
      // Convert Error to serializable format if present
      error: task.error ? {
        message: task.error.message,
        stack: task.error.stack
      } : undefined
    }));

    // End request tracking
    orch.getPerformanceMonitor().endRequest(requestId, true);

    return NextResponse.json(
      {
        success: true,
        workflow: {
          id: workflowState.id,
          status: workflowState.status,
          tasks: tasksArray,
          sharedData: workflowState.sharedData,
          metadata: workflowState.metadata
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/state/[workflowId]:', error);

    // End request tracking with error
    if (orch.isReady()) {
      orch.getPerformanceMonitor().endRequest(
        requestId,
        false,
        error instanceof Error ? error.message : 'Internal server error'
      );
    }

    // Check if it's a "not found" error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
