# Agent Template

This template provides a standardized structure for creating new agents in the Multi-Agent AI Skeleton project.

## Agent Structure

Every agent should follow this structure:

### 1. Agent Class
- Extends `BaseAgent`
- Implements `processMessage()` and `getSupportedMessageTypes()`
- Defines specific capabilities

### 2. Configuration
- Agent-specific configuration interface
- Default configuration values

### 3. Message Handling
- Clear message type support
- Error handling
- Response formatting

### 4. Testing
- Property-based tests using fast-check
- Unit tests for edge cases

## Template Variables

When creating a new agent, replace these placeholders:

- `{{AGENT_NAME}}` - PascalCase name (e.g., `RouterAgent`)
- `{{AGENT_ID}}` - kebab-case id (e.g., `router-agent`)
- `{{AGENT_DESCRIPTION}}` - Brief description
- `{{MESSAGE_TYPES}}` - Supported message types (e.g., `MessageType.QUERY`)
- `{{CAPABILITIES}}` - List of capabilities (e.g., `['routing', 'classification']`)

## Example Agent Template

```typescript
// src/agents/{{AGENT_NAME}}.ts

import { BaseAgent, MessageResponse } from './Agent';
import { MessageObject, MessageType, AgentStatus } from '../types';

// ============================================================================
// Configuration
// ============================================================================

export interface {{AGENT_NAME}}Config {
  // Agent-specific configuration
  enabled: boolean;
  maxRetries: number;
  timeout: number;
  // Add custom config fields
}

const DEFAULT_CONFIG: {{AGENT_NAME}}Config = {
  enabled: true,
  maxRetries: 3,
  timeout: 5000,
};

// ============================================================================
// {{AGENT_NAME}} Implementation
// ============================================================================

/**
 * {{AGENT_DESCRIPTION}}
 * 
 * Capabilities:
 * {{CAPABILITIES}}
 */
export class {{AGENT_NAME}} extends BaseAgent {
  private config: {{AGENT_NAME}}Config;

  constructor(config: Partial<{{AGENT_NAME}}Config> = {}) {
    super(
      '{{AGENT_ID}}',
      '{{AGENT_NAME}}',
      {{CAPABILITIES}},
      config
    );
    
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Lifecycle Hooks
  // ============================================================================

  protected async onInitialize(): Promise<void> {
    // Initialize agent-specific resources
    console.log(`[{{AGENT_NAME}}] Initializing...`);
    
    if (!this.config.enabled) {
      throw new Error('{{AGENT_NAME}} is disabled in configuration');
    }
    
    // Add initialization logic here
  }

  protected async onShutdown(): Promise<void> {
    // Cleanup agent-specific resources
    console.log(`[{{AGENT_NAME}}] Shutting down...`);
    
    // Add cleanup logic here
  }

  // ============================================================================
  // Message Handling
  // ============================================================================

  protected getSupportedMessageTypes(): MessageType[] {
    return [
      {{MESSAGE_TYPES}}
    ];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    console.log(`[{{AGENT_NAME}}] Processing message:`, message.id);

    // Validate message
    if (!message.content) {
      throw new Error('Message content is required');
    }

    try {
      // Main processing logic
      const result = await this.executeAgentLogic(message);
      
      return {
        agentId: this.id,
        agentName: this.name,
        messageId: message.id,
        result,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`[{{AGENT_NAME}}] Error processing message:`, error);
      throw error;
    }
  }

  // ============================================================================
  // Agent-Specific Logic
  // ============================================================================

  private async executeAgentLogic(message: MessageObject): Promise<any> {
    // Implement your agent's core logic here
    
    // Example structure:
    // 1. Extract relevant data from message
    const content = message.content;
    
    // 2. Perform agent-specific processing
    // TODO: Add your logic here
    
    // 3. Return results
    return {
      processed: true,
      content,
      // Add your result fields
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async validateInput(input: any): Promise<boolean> {
    // Add validation logic
    return true;
  }

  private formatResponse(data: any): any {
    // Add response formatting logic
    return data;
  }
}
```

## Property-Based Test Template

```typescript
// src/agents/__tests__/{{AGENT_NAME}}.property.test.ts

import { describe, it, expect, beforeEach } from '@jest/globals';
import * as fc from 'fast-check';
import { {{AGENT_NAME}} } from '../{{AGENT_NAME}}';
import { MessageObject, MessageType, AgentStatus } from '../../types';

describe('{{AGENT_NAME}} - Property-Based Tests', () => {
  let agent: {{AGENT_NAME}};

  beforeEach(async () => {
    agent = new {{AGENT_NAME}}();
    await agent.initialize();
  });

  /**
   * Property 1: Agent always returns a response
   * For any valid message, the agent should return a MessageResponse
   */
  it('should always return a response for valid messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom(...agent['getSupportedMessageTypes']()),
          content: fc.string({ minLength: 1 }),
          timestamp: fc.integer({ min: 0 }),
          sender: fc.string({ minLength: 1 }),
        }),
        async (messageData) => {
          const message: MessageObject = {
            ...messageData,
            metadata: {},
          };

          const response = await agent.handleMessage(message);

          expect(response).toBeDefined();
          expect(response).toHaveProperty('success');
          expect(response).toHaveProperty('timestamp');
          expect(typeof response.success).toBe('boolean');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Successful processing updates metrics
   * When a message is processed successfully, completed tasks should increase
   */
  it('should update metrics on successful processing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          type: fc.constantFrom(...agent['getSupportedMessageTypes']()),
          content: fc.string({ minLength: 1 }),
          timestamp: fc.integer({ min: 0 }),
          sender: fc.string({ minLength: 1 }),
        }),
        async (messageData) => {
          const message: MessageObject = {
            ...messageData,
            metadata: {},
          };

          const stateBefore = agent.getState();
          const response = await agent.handleMessage(message);

          if (response.success) {
            const stateAfter = agent.getState();
            expect(stateAfter.completedTasks).toBeGreaterThan(stateBefore.completedTasks);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Agent maintains valid state
   * Agent state should always be valid after any operation
   */
  it('should maintain valid state after operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            type: fc.constantFrom(...agent['getSupportedMessageTypes']()),
            content: fc.string({ minLength: 1 }),
            timestamp: fc.integer({ min: 0 }),
            sender: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (messages) => {
          for (const messageData of messages) {
            const message: MessageObject = {
              ...messageData,
              metadata: {},
            };

            await agent.handleMessage(message);

            const state = agent.getState();
            expect(state.completedTasks).toBeGreaterThanOrEqual(0);
            expect(state.failedTasks).toBeGreaterThanOrEqual(0);
            expect(state.averageProcessingTime).toBeGreaterThanOrEqual(0);
            expect(state.currentTasks).toBeInstanceOf(Array);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
```

## Usage

### Creating a New Agent

1. **Copy the template** and replace all `{{PLACEHOLDERS}}`
2. **Implement `executeAgentLogic()`** with your agent's core functionality
3. **Add helper methods** as needed
4. **Create property-based tests** using the test template
5. **Export from `index.ts`**

### Example: Creating a SentimentAgent

```typescript
export class SentimentAgent extends BaseAgent {
  constructor(config: Partial<SentimentAgentConfig> = {}) {
    super(
      'sentiment-agent',
      'SentimentAgent',
      ['sentiment-analysis', 'emotion-detection'],
      config
    );
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [MessageType.QUERY, MessageType.RESPONSE];
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    const sentiment = await this.analyzeSentiment(message.content);
    
    return {
      sentiment,
      confidence: sentiment.confidence,
      emotions: sentiment.emotions,
    };
  }

  private async analyzeSentiment(text: string): Promise<any> {
    // Sentiment analysis logic
    return { score: 0.8, label: 'positive', confidence: 0.9 };
  }
}
```

## Best Practices

1. **Keep agents focused** - Each agent should have a single, clear responsibility
2. **Use configuration** - Make agents configurable for different use cases
3. **Handle errors gracefully** - Always catch and log errors
4. **Update metrics** - Let the base class track performance
5. **Write properties** - Use property-based tests for correctness
6. **Document capabilities** - Clearly list what the agent can do

## Agent Checklist

When creating a new agent, ensure:

- [ ] Extends `BaseAgent`
- [ ] Implements `processMessage()`
- [ ] Implements `getSupportedMessageTypes()`
- [ ] Has configuration interface
- [ ] Has default configuration
- [ ] Includes initialization logic
- [ ] Includes cleanup logic
- [ ] Has error handling
- [ ] Has property-based tests
- [ ] Exported from `index.ts`
- [ ] Documented in README.md
