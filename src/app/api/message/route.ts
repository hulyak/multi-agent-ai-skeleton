// POST /api/message - Send messages to agents

import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/orchestration/AgentOrchestrator';
import {
  MessageObject,
  MessageType,
  Priority,
  validateMessageObject
} from '@/types';

// Global orchestrator instance (in production, this would be managed differently)
let orchestrator: AgentOrchestrator | null = null;

function getOrchestrator(): AgentOrchestrator {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const orch = getOrchestrator();
  
  // Start tracking request
  if (orch.isReady()) {
    orch.getPerformanceMonitor().startRequest(requestId, '/api/message');
  }
  
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.workflowId || !body.sourceAgentId || !body.payload) {
      if (orch.isReady()) {
        orch.getPerformanceMonitor().endRequest(requestId, false, 'Missing required fields');
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: type, workflowId, sourceAgentId, payload'
        },
        { status: 400 }
      );
    }

    // Validate message type
    if (!Object.values(MessageType).includes(body.type)) {
      if (orch.isReady()) {
        orch.getPerformanceMonitor().endRequest(requestId, false, 'Invalid message type');
      }
      return NextResponse.json(
        {
          success: false,
          error: `Invalid message type. Must be one of: ${Object.values(MessageType).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Create message object
    const message: MessageObject = {
      id: body.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: body.type,
      workflowId: body.workflowId,
      sourceAgentId: body.sourceAgentId,
      targetAgentId: body.targetAgentId || null,
      payload: body.payload,
      metadata: {
        timestamp: Date.now(),
        priority: body.priority || Priority.NORMAL,
        retryCount: body.retryCount || 0,
        parentMessageId: body.parentMessageId
      }
    };

    // Validate message object
    const validation = validateMessageObject(message);
    if (!validation.valid) {
      if (orch.isReady()) {
        orch.getPerformanceMonitor().endRequest(requestId, false, 'Invalid message object');
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid message object',
          details: validation.errors
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

    // Send message
    await orch.sendMessage(message);

    // End request tracking
    orch.getPerformanceMonitor().endRequest(requestId, true);

    return NextResponse.json(
      {
        success: true,
        messageId: message.id,
        message: 'Message sent successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in POST /api/message:', error);
    
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
