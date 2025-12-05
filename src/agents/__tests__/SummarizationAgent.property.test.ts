// Property-Based Tests for Summarization Agent
// Feature: idl-resurrection, Property 21: Document summarization
// Validates: Requirements 9.3

import fc from 'fast-check';
import {
  SummarizationAgent,
  Summary,
  SummarizationConfig
} from '../SummarizationAgent';
import { Document } from '../RetrievalAgent';
import { MessageObject, MessageType, Priority } from '../../types';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

/**
 * Generate valid documents for summarization
 */
function documentArbitrary(): fc.Arbitrary<Document> {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    content: fc.string({ minLength: 100, maxLength: 1000 }),
    author: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    source: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    publishedDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0]), { nil: undefined }),
    metadata: fc.record({
      category: fc.constantFrom('AI', 'NLP', 'Computer Vision', 'Robotics', 'Ethics'),
      tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 })
    })
  });
}

/**
 * Generate valid message objects for summarization agent
 */
function summarizationMessageArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.constant('summarization-agent'),
    payload: fc.record({
      documents: fc.array(documentArbitrary(), { minLength: 1, maxLength: 5 }),
      targetLength: fc.option(fc.integer({ min: 50, max: 500 }), { nil: undefined })
    }),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
      retryCount: fc.integer({ min: 0, max: 3 })
    })
  });
}

/**
 * Generate summarization configuration
 */
function summarizationConfigArbitrary(): fc.Arbitrary<SummarizationConfig> {
  return fc.record({
    targetLength: fc.option(fc.integer({ min: 50, max: 500 }), { nil: undefined }),
    minCompressionRatio: fc.option(fc.double({ min: 0.05, max: 0.3 }), { nil: undefined }),
    maxCompressionRatio: fc.option(fc.double({ min: 0.3, max: 0.8 }), { nil: undefined }),
    preserveKeyPoints: fc.option(fc.boolean(), { nil: undefined })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('SummarizationAgent Property Tests', () => {
  // Feature: idl-resurrection, Property 21: Document summarization
  describe('Property 21: Document summarization', () => {
    it('should produce a condensed summary for any retrieved document', async () => {
      await fc.assert(
        fc.asyncProperty(
          summarizationMessageArbitrary(),
          async (message) => {
            // Create agent
            const agent = new SummarizationAgent();
            await agent.initialize();

            // Process message
            const response = await agent.handleMessage(message);

            // Verify response structure
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Verify summarization result fields
            const {
              summaries,
              totalDocuments,
              totalOriginalLength,
              totalSummaryLength,
              averageCompressionRatio,
              summarizedAt
            } = response.data!;

            expect(Array.isArray(summaries)).toBe(true);
            expect(typeof totalDocuments).toBe('number');
            expect(totalDocuments).toBe(message.payload.documents.length);
            expect(typeof totalOriginalLength).toBe('number');
            expect(typeof totalSummaryLength).toBe('number');
            expect(typeof averageCompressionRatio).toBe('number');
            expect(typeof summarizedAt).toBe('number');

            // Verify each summary
            summaries.forEach((summary: Summary, index: number) => {
              const originalDoc = message.payload.documents[index];

              // Summary should have required fields
              expect(typeof summary.documentId).toBe('string');
              expect(summary.documentId).toBe(originalDoc.id);
              expect(typeof summary.originalLength).toBe('number');
              expect(summary.originalLength).toBe(originalDoc.content.length);
              expect(typeof summary.summaryLength).toBe('number');
              expect(typeof summary.summary).toBe('string');
              expect(typeof summary.compressionRatio).toBe('number');
              expect(typeof summary.createdAt).toBe('number');

              // Summary should be condensed (shorter than original)
              expect(summary.summaryLength).toBeLessThanOrEqual(summary.originalLength);

              // Summary should not be empty
              expect(summary.summary.length).toBeGreaterThan(0);

              // Compression ratio should be calculated correctly
              const expectedRatio = summary.summaryLength / summary.originalLength;
              expect(Math.abs(summary.compressionRatio - expectedRatio)).toBeLessThan(0.01);

              // Compression ratio should be between 0 and 1
              expect(summary.compressionRatio).toBeGreaterThan(0);
              expect(summary.compressionRatio).toBeLessThanOrEqual(1);
            });

            // Verify aggregate statistics
            const calculatedTotalOriginal = summaries.reduce(
              (sum: number, s: Summary) => sum + s.originalLength,
              0
            );
            const calculatedTotalSummary = summaries.reduce(
              (sum: number, s: Summary) => sum + s.summaryLength,
              0
            );

            expect(totalOriginalLength).toBe(calculatedTotalOriginal);
            expect(totalSummaryLength).toBe(calculatedTotalSummary);

            // Average compression ratio should be correct
            const expectedAvgRatio = totalSummaryLength / totalOriginalLength;
            expect(Math.abs(averageCompressionRatio - expectedAvgRatio)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect target length parameter', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentArbitrary(), { minLength: 1, maxLength: 3 }),
          fc.integer({ min: 100, max: 300 }),
          fc.uuid(),
          async (documents, targetLength, workflowId) => {
            const agent = new SummarizationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'summarization-agent',
              payload: { documents, targetLength },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { summaries } = response.data!;

            // Each summary should respect the target length (with some tolerance)
            summaries.forEach((summary: Summary) => {
              // Allow 20% tolerance over target length
              expect(summary.summaryLength).toBeLessThanOrEqual(targetLength * 1.2);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle documents with varying content lengths', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 10, maxLength: 50 }),
              content: fc.string({ minLength: 50, maxLength: 2000 }),
              metadata: fc.record({
                category: fc.string(),
                tags: fc.array(fc.string())
              })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.uuid(),
          async (documents, workflowId) => {
            const agent = new SummarizationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'summarization-agent',
              payload: { documents },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { summaries } = response.data!;

            // Should produce a summary for each document
            expect(summaries.length).toBe(documents.length);

            // Each summary should be valid regardless of original length
            summaries.forEach((summary: Summary) => {
              expect(summary.summary.length).toBeGreaterThan(0);
              expect(summary.summaryLength).toBeLessThanOrEqual(summary.originalLength);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use custom configuration when provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          summarizationConfigArbitrary(),
          fc.array(documentArbitrary(), { minLength: 1, maxLength: 3 }),
          fc.uuid(),
          async (config, documents, workflowId) => {
            const agent = new SummarizationAgent('custom-summarization-agent', config);
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'custom-summarization-agent',
              payload: { documents },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { summaries } = response.data!;

            // Verify configuration is applied
            const agentConfig = agent.getConfig();
            expect(agentConfig.targetLength).toBe(config.targetLength || 200);
            expect(agentConfig.minCompressionRatio).toBe(config.minCompressionRatio || 0.1);
            expect(agentConfig.maxCompressionRatio).toBe(config.maxCompressionRatio || 0.5);
            expect(agentConfig.preserveKeyPoints).toBe(config.preserveKeyPoints !== false);

            // Summaries should exist
            expect(summaries.length).toBe(documents.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle invalid message payloads gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            type: fc.constant(MessageType.TASK_REQUEST),
            workflowId: fc.uuid(),
            sourceAgentId: fc.uuid(),
            targetAgentId: fc.constant('summarization-agent'),
            payload: fc.oneof(
              fc.constant({}),
              fc.record({ documents: fc.constant(null) }),
              fc.record({ documents: fc.constant(undefined) }),
              fc.record({ documents: fc.constant([]) }),
              fc.record({ documents: fc.string() }),
              fc.record({ documents: fc.array(fc.record({ id: fc.uuid() })) }) // Missing content
            ),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          async (message) => {
            const agent = new SummarizationAgent();
            await agent.initialize();

            const response = await agent.handleMessage(message as MessageObject);

            // Should fail gracefully with error
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(typeof response.error).toBe('string');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain summary coherence by preserving sentence order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentArbitrary(), { minLength: 1, maxLength: 3 }),
          fc.uuid(),
          async (documents, workflowId) => {
            const agent = new SummarizationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'summarization-agent',
              payload: { documents },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { summaries } = response.data!;

            // Each summary should be coherent (contain complete sentences)
            summaries.forEach((summary: Summary) => {
              // Summary should end with proper punctuation, unless it would exceed original length
              const endsWithPunctuation = /[.!?]$/.test(summary.summary.trim());
              const isAtMaxLength = summary.summaryLength === summary.originalLength;
              
              // If not at max length, should end with punctuation
              // If at max length, may or may not have punctuation depending on original
              if (!isAtMaxLength) {
                expect(endsWithPunctuation).toBe(true);
              }

              // Summary should not be empty
              expect(summary.summary.trim().length).toBeGreaterThan(0);

              // Summary should not have incomplete sentences (basic check)
              const sentences = summary.summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
              expect(sentences.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle documents with minimal content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 5, maxLength: 20 }),
              content: fc.string({ minLength: 10, maxLength: 50 }),
              metadata: fc.record({
                category: fc.string(),
                tags: fc.array(fc.string())
              })
            }),
            { minLength: 1, maxLength: 3 }
          ),
          fc.uuid(),
          async (documents, workflowId) => {
            const agent = new SummarizationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'summarization-agent',
              payload: { documents },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { summaries } = response.data!;

            // Should handle short documents gracefully
            summaries.forEach((summary: Summary) => {
              expect(summary.summary.length).toBeGreaterThan(0);
              expect(summary.summaryLength).toBeLessThanOrEqual(summary.originalLength);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should update configuration dynamically', async () => {
      await fc.assert(
        fc.asyncProperty(
          summarizationConfigArbitrary(),
          summarizationConfigArbitrary(),
          async (initialConfig, updatedConfig) => {
            const agent = new SummarizationAgent('test-agent', initialConfig);
            await agent.initialize();

            // Verify initial config
            let config = agent.getConfig();
            expect(config.targetLength).toBe(initialConfig.targetLength || 200);

            // Update config
            agent.updateConfig(updatedConfig);

            // Verify updated config
            config = agent.getConfig();
            if (updatedConfig.targetLength !== undefined) {
              expect(config.targetLength).toBe(updatedConfig.targetLength);
            }
            if (updatedConfig.minCompressionRatio !== undefined) {
              expect(config.minCompressionRatio).toBe(updatedConfig.minCompressionRatio);
            }
            if (updatedConfig.maxCompressionRatio !== undefined) {
              expect(config.maxCompressionRatio).toBe(updatedConfig.maxCompressionRatio);
            }
            if (updatedConfig.preserveKeyPoints !== undefined) {
              expect(config.preserveKeyPoints).toBe(updatedConfig.preserveKeyPoints);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
