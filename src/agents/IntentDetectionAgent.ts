// Intent Detection Agent
// Classifies user queries and routes them to appropriate handlers

import { BaseAgent } from './Agent';
import { MessageObject, MessageType } from '../types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum IntentType {
  FAQ = 'FAQ',
  ESCALATION = 'ESCALATION',
  UNKNOWN = 'UNKNOWN'
}

export interface Intent {
  type: IntentType;
  confidence: number;
  entities: Entity[];
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export interface IntentClassificationResult {
  intent: Intent;
  query: string;
  routedTo: string;
}

// ============================================================================
// LLM Interface (Mock for now, can be replaced with Amazon Bedrock)
// ============================================================================

export interface LLMProvider {
  classifyIntent(query: string): Promise<Intent>;
  extractEntities(query: string): Promise<Entity[]>;
}

/**
 * Mock LLM Provider for testing and development
 * In production, this would be replaced with Amazon Bedrock integration
 */
export class MockLLMProvider implements LLMProvider {
  async classifyIntent(query: string): Promise<Intent> {
    const lowerQuery = query.toLowerCase();
    
    // Simple keyword-based classification
    const faqKeywords = [
      'hours', 'location', 'price', 'cost', 'how much',
      'when', 'where', 'what is', 'how do', 'can i', 'do you',
      'available', 'open', 'closed', 'contact', 'phone', 'email'
    ];
    
    const escalationKeywords = [
      'complaint', 'issue', 'problem', 'broken', 'not working',
      'urgent', 'emergency', 'help', 'support', 'manager',
      'refund', 'cancel', 'dispute', 'error', 'bug'
    ];
    
    // Check for FAQ patterns
    const hasFaqKeyword = faqKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasEscalationKeyword = escalationKeywords.some(keyword => lowerQuery.includes(keyword));
    
    let intentType: IntentType;
    let confidence: number;
    
    if (hasEscalationKeyword) {
      intentType = IntentType.ESCALATION;
      confidence = 0.85;
    } else if (hasFaqKeyword) {
      intentType = IntentType.FAQ;
      confidence = 0.9;
    } else {
      intentType = IntentType.UNKNOWN;
      confidence = 0.5;
    }
    
    return {
      type: intentType,
      confidence,
      entities: []
    };
  }
  
  async extractEntities(query: string): Promise<Entity[]> {
    const entities: Entity[] = [];
    
    // Simple entity extraction (in production, use NER from LLM)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    
    const emails = query.match(emailRegex);
    if (emails) {
      emails.forEach(email => {
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.95
        });
      });
    }
    
    const phones = query.match(phoneRegex);
    if (phones) {
      phones.forEach(phone => {
        entities.push({
          type: 'phone',
          value: phone,
          confidence: 0.9
        });
      });
    }
    
    return entities;
  }
}

// ============================================================================
// Intent Detection Agent
// ============================================================================

export class IntentDetectionAgent extends BaseAgent {
  private llmProvider: LLMProvider;
  private faqAgentId: string;
  private escalationAgentId: string;
  
  constructor(
    id: string = 'intent-detection-agent',
    llmProvider?: LLMProvider,
    faqAgentId: string = 'faq-agent',
    escalationAgentId: string = 'escalation-agent'
  ) {
    super(
      id,
      'Intent Detection Agent',
      ['intent-classification', 'entity-extraction', 'query-routing'],
      {
        faqAgentId,
        escalationAgentId
      }
    );
    
    this.llmProvider = llmProvider || new MockLLMProvider();
    this.faqAgentId = faqAgentId;
    this.escalationAgentId = escalationAgentId;
  }
  
  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.TASK_REQUEST];
  }
  
  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const { query } = message.payload;
    
    if (!query || typeof query !== 'string') {
      throw new Error('Message payload must contain a "query" string field');
    }
    
    // Classify intent
    const intent = await this.classifyIntent(query);
    
    // Extract entities
    const entities = await this.extractEntities(query);
    intent.entities = entities;
    
    // Route to appropriate handler
    const routedTo = await this.routeToHandler(intent, query, message);
    
    return {
      intent,
      query,
      routedTo,
      timestamp: Date.now()
    };
  }
  
  /**
   * Classify the intent of a user query
   */
  async classifyIntent(query: string): Promise<Intent> {
    return await this.llmProvider.classifyIntent(query);
  }
  
  /**
   * Extract entities from a user query
   */
  async extractEntities(query: string): Promise<Entity[]> {
    return await this.llmProvider.extractEntities(query);
  }
  
  /**
   * Route query to appropriate handler agent based on intent
   */
  async routeToHandler(
    intent: Intent,
    query: string,
    originalMessage: MessageObject
  ): Promise<string> {
    let targetAgentId: string;
    
    switch (intent.type) {
      case IntentType.FAQ:
        targetAgentId = this.faqAgentId;
        break;
      case IntentType.ESCALATION:
        targetAgentId = this.escalationAgentId;
        break;
      case IntentType.UNKNOWN:
        // Default to FAQ for unknown intents
        targetAgentId = this.faqAgentId;
        break;
      default:
        targetAgentId = this.faqAgentId;
    }
    
    // In a real system, we would create and send a delegation message through the message bus
    // For now, we just return the target agent ID to indicate where the query should be routed
    
    return targetAgentId;
  }
}
