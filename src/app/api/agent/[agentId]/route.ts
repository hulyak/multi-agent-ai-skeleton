// GET /api/agent/[agentId] - Retrieve agent health and logs

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
  { params }: { params: { agentId: string } }
) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const orch = getOrchestrator();
  
  // Start tracking request
  if (orch.isReady()) {
    orch.getPerformanceMonitor().startRequest(requestId, '/api/agent');
  }
  
  try {
    const { agentId } = params;

    // Validate agentId
    if (!agentId || agentId.trim() === '') {
      if (orch.isReady()) {
        orch.getPerformanceMonitor().endRequest(requestId, false, 'Agent ID is required');
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required'
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

    // Get agent
    const agent = orch.getAgent(agentId);

    if (!agent) {
      if (orch.isReady()) {
        orch.getPerformanceMonitor().endRequest(requestId, false, 'Agent not found');
      }
      return NextResponse.json(
        {
          success: false,
          error: `Agent with ID ${agentId} not found`
        },
        { status: 404 }
      );
    }

    // Get agent state
    const agentState = agent.getState();

    // Perform health check
    const healthStatus = await agent.healthCheck();

    // Get error logs for this agent
    const errorHandler = orch.getErrorHandler();
    const errorLogs = errorHandler.getLogger().getLogsByAgent(agentId);

    // Format error logs for response
    const formattedLogs = errorLogs.map(log => ({
      timestamp: log.timestamp,
      errorType: log.errorType,
      message: log.error.message,
      stack: log.error.stack,
      context: log.context,
      retryStrategy: log.retryStrategy
    }));

    // End request tracking
    orch.getPerformanceMonitor().endRequest(requestId, true);

    return NextResponse.json(
      {
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          capabilities: agent.capabilities,
          state: agentState,
          health: healthStatus,
          logs: formattedLogs
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/agent/[agentId]:', error);

    // End request tracking with error
    if (orch.isReady()) {
      orch.getPerformanceMonitor().endRequest(
        requestId,
        false,
        error instanceof Error ? error.message : 'Internal server error'
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
