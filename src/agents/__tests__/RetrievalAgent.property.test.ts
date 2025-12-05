// Property-Based Tests for Retrieval Agent
// Feature: idl-resurrection, Property 20: Document retrieval and state persistence
// Validates: Requirements 9.1, 9.2

import fc from 'fast-check';
import {
  RetrievalAgent,
  Document,
  DocumentIndex
} from '../RetrievalAgent';
import { MessageObject, MessageType, Priority } from '../../types';
import { WorkflowStateManager } from '../../orchestration/WorkflowStateManager';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

/**
 * Generate valid documents
 */
function documentArbitrary(): fc.Arbitrary<Document> {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    content: fc.string({ minLength: 50, maxLength: 500 }),
    author: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    source: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    publishedDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0]), { nil: undefined }),
    metadata: fc.record({
      category: fc.constantFrom('AI', 'NLP', 'Computer Vision', 'Robotics', 'Ethics', 'Cloud Computing', 'Quantum Computing'),
      tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 })
    })
  });
}

/**
 * Generate research topics
 */
function researchTopicArbitrary(): fc.Arbitrary<string> {
  return fc.constantFrom(
    'machine learning',
    'deep learning',
    'natural language processing',
    'computer vision',
    'reinforcement learning',
    'artificial intelligence',
    'neural networks',
    'transformers',
    'robotics',
    'AI ethics',
    'cloud computing',
    'quantum computing'
  );
}

/**
 * Generate valid message objects for retrieval agent
 */
function retrievalMessageArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.constant('retrieval-agent'),
    payload: fc.record({
      topic: researchTopicArbitrary(),
      maxResults: fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined })
    }),
    metadata: fc.record({
      timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
      priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
      retryCount: fc.integer({ min: 0, max: 3 })
    })
  });
}

// ============================================================================
// Property Tests
// ============================================================================

describe('RetrievalAgent Property Tests', () => {
  // Feature: idl-resurrection, Property 20: Document retrieval and state persistence
  describe('Property 20: Document retrieval and state persistence', () => {
    it('should search indexed documents and return relevant documents for any research topic', async () => {
      await fc.assert(
        fc.asyncProperty(
          retrievalMessageArbitrary(),
          async (message) => {
            // Create agent with default document index
            const agent = new RetrievalAgent();
            await agent.initialize();

            // Process message
            const response = await agent.handleMessage(message);

            // Verify response structure
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Verify retrieval result fields
            const { documents, query, totalResults, retrievedAt, sections } = response.data!;
            
            expect(Array.isArray(documents)).toBe(true);
            expect(typeof query).toBe('string');
            expect(query).toBe(message.payload.topic);
            expect(typeof totalResults).toBe('number');
            expect(totalResults).toBe(documents.length);
            expect(typeof retrievedAt).toBe('number');
            expect(retrievedAt).toBeGreaterThan(0);
            expect(Array.isArray(sections)).toBe(true);

            // Verify each document has required fields
            documents.forEach((doc: Document) => {
              expect(typeof doc.id).toBe('string');
              expect(typeof doc.title).toBe('string');
              expect(typeof doc.content).toBe('string');
              expect(typeof doc.metadata).toBe('object');
              
              // Documents should have relevance scores
              if (documents.length > 0) {
                expect(typeof doc.relevanceScore).toBe('number');
                expect(doc.relevanceScore).toBeGreaterThan(0);
              }
            });

            // Verify sections match documents
            expect(sections.length).toBe(documents.length);
            sections.forEach((section: any) => {
              expect(typeof section.documentId).toBe('string');
              expect(typeof section.sectionTitle).toBe('string');
              expect(typeof section.content).toBe('string');
              expect(typeof section.startIndex).toBe('number');
              expect(typeof section.endIndex).toBe('number');
              
              // Section should reference a document in the results
              const doc = documents.find((d: Document) => d.id === section.documentId);
              expect(doc).toBeDefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should store retrieved documents in workflow state', async () => {
      await fc.assert(
        fc.asyncProperty(
          retrievalMessageArbitrary(),
          async (message) => {
            // Create workflow state manager
            const stateManager = new WorkflowStateManager();
            stateManager.createWorkflow(message.workflowId, {
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                initiatorId: 'test-agent'
              }
            });

            // Create agent
            const agent = new RetrievalAgent();
            await agent.initialize();

            // Process message
            const response = await agent.handleMessage(message);

            // Verify response succeeded
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Store documents in workflow state (simulating what orchestrator would do)
            const { documents } = response.data!;
            stateManager.updateWorkflow(message.workflowId, {
              sharedData: {
                retrievedDocuments: documents
              }
            });

            // Verify documents are persisted in workflow state
            const workflow = stateManager.getWorkflow(message.workflowId);
            expect(workflow.sharedData.retrievedDocuments).toBeDefined();
            expect(Array.isArray(workflow.sharedData.retrievedDocuments)).toBe(true);
            expect(workflow.sharedData.retrievedDocuments.length).toBe(documents.length);

            // Verify each document is correctly stored
            workflow.sharedData.retrievedDocuments.forEach((doc: Document, index: number) => {
              expect(doc.id).toBe(documents[index].id);
              expect(doc.title).toBe(documents[index].title);
              expect(doc.content).toBe(documents[index].content);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return documents ranked by relevance', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          fc.uuid(),
          async (topic, workflowId) => {
            const agent = new RetrievalAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'retrieval-agent',
              payload: { topic },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { documents } = response.data!;

            // If there are multiple documents, verify they are ranked
            if (documents.length > 1) {
              for (let i = 0; i < documents.length - 1; i++) {
                const currentScore = documents[i].relevanceScore || 0;
                const nextScore = documents[i + 1].relevanceScore || 0;
                
                // Documents should be in descending order of relevance
                expect(currentScore).toBeGreaterThanOrEqual(nextScore);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect maxResults parameter', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          fc.integer({ min: 1, max: 5 }),
          fc.uuid(),
          async (topic, maxResults, workflowId) => {
            const agent = new RetrievalAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'retrieval-agent',
              payload: { topic, maxResults },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { documents } = response.data!;

            // Should not exceed maxResults
            expect(documents.length).toBeLessThanOrEqual(maxResults);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle topics with no matching documents gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'xyzabc123nonsense',
            'qwertyzxcvb',
            'asdfghjkl',
            'zzzzzzzzzz'
          ),
          fc.uuid(),
          async (topic, workflowId) => {
            const agent = new RetrievalAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'retrieval-agent',
              payload: { topic },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            // Should still succeed even with no results
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            
            const { documents, totalResults } = response.data!;
            expect(Array.isArray(documents)).toBe(true);
            expect(totalResults).toBe(0);
            expect(documents.length).toBe(0);
          }
        ),
        { numRuns: 50 }
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
            targetAgentId: fc.constant('retrieval-agent'),
            payload: fc.oneof(
              fc.constant({}),
              fc.record({ topic: fc.constant(null) }),
              fc.record({ topic: fc.constant(undefined) }),
              fc.record({ topic: fc.integer() }),
              fc.record({ notTopic: fc.string() })
            ),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          async (message) => {
            const agent = new RetrievalAgent();
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

    it('should support custom document indexes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentArbitrary(), { minLength: 1, maxLength: 10 }),
          fc.uuid(),
          async (documents, workflowId) => {
            // Create custom document index
            const index = new DocumentIndex(documents);
            const agent = new RetrievalAgent('custom-retrieval-agent', index);
            await agent.initialize();

            // Pick a random document and query with a word from its content
            const randomDoc = documents[Math.floor(Math.random() * documents.length)];
            const words = randomDoc.content.split(/\s+/).filter(w => w.length > 3 && /^[a-zA-Z]+$/.test(w));
            
            // If no valid words, try to extract from title
            let queryWord: string | undefined;
            if (words.length > 0) {
              queryWord = words[Math.floor(Math.random() * words.length)];
            } else {
              // Try to extract alphanumeric words from title
              const titleWords = randomDoc.title.split(/\s+/).filter(w => w.length > 3 && /^[a-zA-Z]+$/.test(w));
              if (titleWords.length > 0) {
                queryWord = titleWords[0];
              } else if (randomDoc.metadata.tags && randomDoc.metadata.tags.length > 0) {
                // Try tags
                const validTags = randomDoc.metadata.tags.filter((t: string) => t.trim().length > 3 && /^[a-zA-Z\s]+$/.test(t));
                if (validTags.length > 0) {
                  queryWord = validTags[0];
                }
              }
            }
            
            // Skip this test case if we can't find a valid query word
            if (!queryWord) {
              return;
            }

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'custom-retrieval-agent',
              payload: { topic: queryWord },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            // Should succeed
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            const { documents: results } = response.data!;
            
            // Should find at least one document (the one we queried for)
            expect(results.length).toBeGreaterThan(0);
            
            // The document we queried should be in the results
            const foundDoc = results.find((d: Document) => d.id === randomDoc.id);
            expect(foundDoc).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should extract relevant sections from all retrieved documents', async () => {
      await fc.assert(
        fc.asyncProperty(
          retrievalMessageArbitrary(),
          async (message) => {
            const agent = new RetrievalAgent();
            await agent.initialize();

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { documents, sections } = response.data!;

            // Every document should have a corresponding section
            expect(sections.length).toBe(documents.length);

            // Verify each section
            sections.forEach((section: any) => {
              expect(typeof section.documentId).toBe('string');
              expect(typeof section.sectionTitle).toBe('string');
              expect(typeof section.content).toBe('string');
              expect(section.content.length).toBeGreaterThan(0);
              expect(typeof section.startIndex).toBe('number');
              expect(typeof section.endIndex).toBe('number');
              expect(section.endIndex).toBeGreaterThan(section.startIndex);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
