// Escalation Agent
// Routes complex queries requiring human intervention to escalation queue

import { BaseAgent } from './Agent';
import { MessageObject, MessageType } from '../types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ComplexityScore {
  score: number; // 0-1, where 1 is most complex
  factors: ComplexityFactor[];
  requiresEscalation: boolean;
}

export interface ComplexityFactor {
  name: string;
  weight: number;
  description: string;
}

export interface EscalationTicket {
  id: string;
  query: string;
  context: EscalationContext;
  complexity: ComplexityScore;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  createdAt: number;
  assignedTo?: string;
  resolvedAt?: number;
}

export interface EscalationContext {
  userId?: string;
  sessionId?: string;
  previousAttempts?: number;
  relatedTickets?: string[];
  metadata?: Record<string, any>;
}

export interface EscalationResult {
  ticket: EscalationTicket;
  queuePosition: number;
  estimatedWaitTime?: number;
}

// ============================================================================
// Escalation Queue
// ============================================================================

export class EscalationQueue {
  private queue: EscalationTicket[];
  private ticketCounter: number;

  constructor() {
    this.queue = [];
    this.ticketCounter = 0;
  }

  /**
   * Add a ticket to the escalation queue
   */
  enqueue(ticket: EscalationTicket): number {
    this.queue.push(ticket);
    
    // Sort by priority (urgent > high > medium > low) and then by creation time
    this.queue.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return a.createdAt - b.createdAt;
    });
    
    // Return position in queue (1-indexed)
    return this.queue.findIndex(t => t.id === ticket.id) + 1;
  }

  /**
   * Get the next ticket from the queue
   */
  dequeue(): EscalationTicket | undefined {
    return this.queue.shift();
  }

  /**
   * Get a ticket by ID
   */
  getTicket(ticketId: string): EscalationTicket | undefined {
    return this.queue.find(t => t.id === ticketId);
  }

  /**
   * Get all tickets
   */
  getAllTickets(): EscalationTicket[] {
    return [...this.queue];
  }

  /**
   * Get queue position for a ticket
   */
  getPosition(ticketId: string): number {
    const index = this.queue.findIndex(t => t.id === ticketId);
    return index === -1 ? -1 : index + 1;
  }

  /**
   * Get queue length
   */
  getLength(): number {
    return this.queue.length;
  }

  /**
   * Update ticket status
   */
  updateTicketStatus(
    ticketId: string,
    status: EscalationTicket['status'],
    assignedTo?: string
  ): boolean {
    const ticket = this.queue.find(t => t.id === ticketId);
    
    if (!ticket) {
      return false;
    }
    
    ticket.status = status;
    
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }
    
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = Date.now();
    }
    
    return true;
  }

  /**
   * Remove a ticket from the queue
   */
  removeTicket(ticketId: string): boolean {
    const index = this.queue.findIndex(t => t.id === ticketId);
    
    if (index === -1) {
      return false;
    }
    
    this.queue.splice(index, 1);
    return true;
  }

  /**
   * Generate a unique ticket ID
   */
  generateTicketId(): string {
    this.ticketCounter++;
    return `ESC-${Date.now()}-${this.ticketCounter.toString().padStart(4, '0')}`;
  }
}

// ============================================================================
// Escalation Agent
// ============================================================================

export class EscalationAgent extends BaseAgent {
  private escalationQueue: EscalationQueue;
  private complexityThreshold: number;

  constructor(
    id: string = 'escalation-agent',
    escalationQueue?: EscalationQueue,
    complexityThreshold: number = 0.7
  ) {
    super(
      id,
      'Escalation Agent',
      ['escalation-routing', 'complexity-evaluation', 'ticket-management'],
      { complexityThreshold }
    );

    this.escalationQueue = escalationQueue || new EscalationQueue();
    this.complexityThreshold = complexityThreshold;
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.TASK_REQUEST];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const { query, context } = message.payload;

    if (!query || typeof query !== 'string') {
      throw new Error('Message payload must contain a "query" string field');
    }

    // Evaluate complexity
    const complexity = await this.evaluateComplexity(query);

    // Create escalation ticket
    const ticket = await this.createEscalationTicket(
      query,
      context || {},
      complexity
    );

    // Add to queue
    const queuePosition = this.escalationQueue.enqueue(ticket);

    // Calculate estimated wait time (simplified: 5 minutes per ticket ahead)
    const estimatedWaitTime = (queuePosition - 1) * 5 * 60 * 1000;

    return {
      ticket,
      queuePosition,
      estimatedWaitTime,
      timestamp: Date.now()
    };
  }

  /**
   * Evaluate the complexity of a query
   */
  async evaluateComplexity(query: string): Promise<ComplexityScore> {
    const factors: ComplexityFactor[] = [];
    let totalScore = 0;

    // Factor 1: Query length (longer queries tend to be more complex)
    const lengthScore = Math.min(query.length / 500, 1) * 0.2;
    factors.push({
      name: 'length',
      weight: lengthScore,
      description: 'Query length indicates complexity'
    });
    totalScore += lengthScore;

    // Factor 2: Technical terms (presence of technical jargon)
    const technicalTerms = [
      'api', 'integration', 'database', 'error', 'bug', 'crash',
      'security', 'authentication', 'authorization', 'encryption',
      'performance', 'latency', 'timeout', 'configuration'
    ];
    const technicalTermCount = technicalTerms.filter(term =>
      query.toLowerCase().includes(term)
    ).length;
    const technicalScore = Math.min(technicalTermCount / 5, 1) * 0.3;
    factors.push({
      name: 'technical_terms',
      weight: technicalScore,
      description: 'Presence of technical terminology'
    });
    totalScore += technicalScore;

    // Factor 3: Urgency indicators
    const urgencyTerms = [
      'urgent', 'emergency', 'critical', 'asap', 'immediately',
      'broken', 'down', 'not working', 'can\'t access', 'blocked'
    ];
    const urgencyTermCount = urgencyTerms.filter(term =>
      query.toLowerCase().includes(term)
    ).length;
    const urgencyScore = Math.min(urgencyTermCount / 3, 1) * 0.25;
    factors.push({
      name: 'urgency',
      weight: urgencyScore,
      description: 'Urgency indicators in query'
    });
    totalScore += urgencyScore;

    // Factor 4: Multiple questions (indicates complexity)
    const questionMarks = (query.match(/\?/g) || []).length;
    const multiQuestionScore = Math.min(questionMarks / 3, 1) * 0.15;
    factors.push({
      name: 'multiple_questions',
      weight: multiQuestionScore,
      description: 'Multiple questions indicate complexity'
    });
    totalScore += multiQuestionScore;

    // Factor 5: Negative sentiment (complaints, issues)
    const negativeTerms = [
      'complaint', 'issue', 'problem', 'disappointed', 'frustrated',
      'angry', 'unacceptable', 'terrible', 'worst', 'horrible'
    ];
    const negativeTermCount = negativeTerms.filter(term =>
      query.toLowerCase().includes(term)
    ).length;
    const sentimentScore = Math.min(negativeTermCount / 3, 1) * 0.1;
    factors.push({
      name: 'negative_sentiment',
      weight: sentimentScore,
      description: 'Negative sentiment indicators'
    });
    totalScore += sentimentScore;

    // Normalize score to 0-1 range
    const normalizedScore = Math.min(totalScore, 1);

    return {
      score: normalizedScore,
      factors,
      requiresEscalation: normalizedScore >= this.complexityThreshold
    };
  }

  /**
   * Create an escalation ticket
   */
  async createEscalationTicket(
    query: string,
    context: EscalationContext,
    complexity: ComplexityScore
  ): Promise<EscalationTicket> {
    const ticketId = this.escalationQueue.generateTicketId();

    // Determine priority based on complexity score
    let priority: EscalationTicket['priority'];
    if (complexity.score >= 0.9) {
      priority = 'urgent';
    } else if (complexity.score >= 0.8) {
      priority = 'high';
    } else if (complexity.score >= 0.6) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    const ticket: EscalationTicket = {
      id: ticketId,
      query,
      context,
      complexity,
      priority,
      status: 'pending',
      createdAt: Date.now()
    };

    return ticket;
  }

  /**
   * Get the escalation queue (for testing and monitoring)
   */
  getEscalationQueue(): EscalationQueue {
    return this.escalationQueue;
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<EscalationTicket | undefined> {
    return this.escalationQueue.getTicket(ticketId);
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: EscalationTicket['status'],
    assignedTo?: string
  ): Promise<boolean> {
    return this.escalationQueue.updateTicketStatus(ticketId, status, assignedTo);
  }
}
