// GET /api/metrics - Retrieve performance metrics

import { NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/orchestration/AgentOrchestrator';

// Global orchestrator instance (in production, this would be managed differently)
let orchestrator: AgentOrchestrator | null = null;

function getOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
  }
  return orchestrator;
}

export async function GET() {
  try {
    // Get orchestrator
    const orch = getOrchestrator();

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

    // Get performance monitor
    const performanceMonitor = orch.getPerformanceMonitor();

    // Get metrics
    const metrics = performanceMonitor.getMetrics();

    // Convert Map to object for JSON serialization
    const agentProcessingTimes: Record<string, any> = {};
    metrics.agentProcessingTimes.forEach((value, key) => {
      agentProcessingTimes[key] = value;
    });

    return NextResponse.json(
      {
        success: true,
        metrics: {
          ...metrics,
          agentProcessingTimes
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in GET /api/metrics:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
