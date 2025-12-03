// Property-Based Tests for Citation Agent
// Feature: multi-agent-skeleton, Property 22: Citation extraction and formatting
// Validates: Requirements 9.4, 9.5

import fc from 'fast-check';
import {
  CitationAgent,
  Citation,
  CitationStyle,
  FormattedCitation
} from '../CitationAgent';
import { Document } from '../RetrievalAgent';
import { MessageObject, MessageType, Priority } from '../../types';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

/**
 * Generate valid documents with citation information
 */
function documentWithCitationArbitrary(): fc.Arbitrary<Document> {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    content: fc.string({ minLength: 50, maxLength: 500 }),
    author: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    source: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
    publishedDate: fc.option(
      fc.date({ min: new Date('2000-01-01'), max: new Date() })
        .map(d => d.toISOString().split('T')[0]),
      { nil: undefined }
    ),
    metadata: fc.record({
      category: fc.constantFrom('AI', 'NLP', 'Computer Vision', 'Robotics', 'Ethics'),
      tags: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
      url: fc.option(
        fc.webUrl(),
        { nil: undefined }
      )
    })
  });
}

/**
 * Generate citation style
 */
function citationStyleArbitrary(): fc.Arbitrary<CitationStyle> {
  return fc.constantFrom(
    CitationStyle.APA,
    CitationStyle.MLA,
    CitationStyle.CHICAGO
  );
}

/**
 * Generate valid message objects for citation agent
 */
function citationMessageArbitrary(): fc.Arbitrary<MessageObject> {
  return fc.record({
    id: fc.uuid(),
    type: fc.constant(MessageType.TASK_REQUEST),
    workflowId: fc.uuid(),
    sourceAgentId: fc.uuid(),
    targetAgentId: fc.constant('citation-agent'),
    payload: fc.record({
      documents: fc.array(documentWithCitationArbitrary(), { minLength: 1, maxLength: 10 }),
      style: fc.option(citationStyleArbitrary(), { nil: undefined })
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

describe('CitationAgent Property Tests', () => {
  // Feature: multi-agent-skeleton, Property 22: Citation extraction and formatting
  describe('Property 22: Citation extraction and formatting', () => {
    it('should extract citations from any document containing citation information', async () => {
      await fc.assert(
        fc.asyncProperty(
          citationMessageArbitrary(),
          async (message) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const response = await agent.handleMessage(message);

            // Verify response structure
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            // Verify citation result fields
            const { citations, formattedCitations, style, totalCitations, validCitations, invalidCitations, extractedAt } = response.data!;

            expect(Array.isArray(citations)).toBe(true);
            expect(Array.isArray(formattedCitations)).toBe(true);
            expect(Object.values(CitationStyle).includes(style)).toBe(true);
            expect(typeof totalCitations).toBe('number');
            expect(typeof validCitations).toBe('number');
            expect(typeof invalidCitations).toBe('number');
            expect(typeof extractedAt).toBe('number');
            expect(extractedAt).toBeGreaterThan(0);

            // Verify citation count matches document count
            expect(citations.length).toBe(message.payload.documents.length);
            expect(totalCitations).toBe(message.payload.documents.length);

            // Verify each citation has required fields
            citations.forEach((citation: Citation) => {
              expect(typeof citation.documentId).toBe('string');
              expect(typeof citation.title).toBe('string');
              expect(citation.title.length).toBeGreaterThan(0);
              expect(typeof citation.metadata).toBe('object');
            });

            // Verify formatted citations match citations
            expect(formattedCitations.length).toBe(citations.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format citations according to standard citation styles (APA, MLA, Chicago)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentWithCitationArbitrary(), { minLength: 1, maxLength: 5 }),
          citationStyleArbitrary(),
          fc.uuid(),
          async (documents, style, workflowId) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'citation-agent',
              payload: { documents, style },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { formattedCitations, style: resultStyle } = response.data!;

            // Verify style matches requested style
            expect(resultStyle).toBe(style);

            // Verify each formatted citation
            formattedCitations.forEach((fc: FormattedCitation) => {
              expect(fc.style).toBe(style);
              expect(typeof fc.formatted).toBe('string');
              expect(fc.formatted.length).toBeGreaterThan(0);
              expect(typeof fc.isValid).toBe('boolean');

              // Verify formatted citation contains the title
              expect(fc.formatted).toContain(fc.citation.title);

              // Verify formatted citation ends with punctuation
              expect(fc.formatted).toMatch(/[.!?]$/);

              // Style-specific checks
              switch (style) {
                case CitationStyle.APA:
                  // APA uses periods to separate elements
                  expect(fc.formatted).toContain('.');
                  // If author exists, should be in citation
                  if (fc.citation.author) {
                    expect(fc.formatted).toContain(fc.citation.author);
                  }
                  // If year exists, should be in parentheses
                  if (fc.citation.publishedDate) {
                    const year = fc.citation.publishedDate.split('-')[0];
                    expect(fc.formatted).toContain(`(${year})`);
                  }
                  break;

                case CitationStyle.MLA:
                  // MLA uses commas to separate elements
                  expect(fc.formatted).toContain(',');
                  // Title should be in quotes
                  expect(fc.formatted).toContain(`"${fc.citation.title}"`);
                  break;

                case CitationStyle.CHICAGO:
                  // Chicago uses periods to separate elements
                  expect(fc.formatted).toContain('.');
                  // Title should be italicized (represented with underscores)
                  expect(fc.formatted).toContain(`_${fc.citation.title}_`);
                  break;
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate citations and identify invalid ones', async () => {
      await fc.assert(
        fc.asyncProperty(
          citationMessageArbitrary(),
          async (message) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { formattedCitations, validCitations, invalidCitations } = response.data!;

            // Count valid and invalid citations
            const actualValid = formattedCitations.filter((fc: FormattedCitation) => fc.isValid).length;
            const actualInvalid = formattedCitations.filter((fc: FormattedCitation) => !fc.isValid).length;

            expect(validCitations).toBe(actualValid);
            expect(invalidCitations).toBe(actualInvalid);
            expect(validCitations + invalidCitations).toBe(formattedCitations.length);

            // Verify validation errors are present for invalid citations
            formattedCitations.forEach((fc: FormattedCitation) => {
              if (!fc.isValid) {
                expect(fc.validationErrors).toBeDefined();
                expect(Array.isArray(fc.validationErrors)).toBe(true);
                expect(fc.validationErrors!.length).toBeGreaterThan(0);
              } else {
                // Valid citations should not have errors or have empty errors
                if (fc.validationErrors) {
                  expect(fc.validationErrors.length).toBe(0);
                }
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle documents with missing optional citation fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              title: fc.string({ minLength: 10, maxLength: 100 }),
              content: fc.string({ minLength: 50, maxLength: 500 }),
              // Omit optional fields
              metadata: fc.constant({})
            }),
            { minLength: 1, maxLength: 5 }
          ),
          citationStyleArbitrary(),
          fc.uuid(),
          async (documents, style, workflowId) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'citation-agent',
              payload: { documents, style },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            // Should still succeed even with missing optional fields
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();

            const { citations, formattedCitations } = response.data!;

            // Should extract citations for all documents
            expect(citations.length).toBe(documents.length);
            expect(formattedCitations.length).toBe(documents.length);

            // Each formatted citation should still contain the title
            formattedCitations.forEach((fc: FormattedCitation, index: number) => {
              expect(fc.formatted).toContain(documents[index].title);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default style when no style is specified', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentWithCitationArbitrary(), { minLength: 1, maxLength: 5 }),
          fc.uuid(),
          async (documents, workflowId) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'citation-agent',
              payload: { documents }, // No style specified
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { style } = response.data!;

            // Should use default style (APA)
            expect(style).toBe(CitationStyle.APA);
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
            targetAgentId: fc.constant('citation-agent'),
            payload: fc.oneof(
              fc.constant({}),
              fc.record({ documents: fc.constant(null) }),
              fc.record({ documents: fc.constant(undefined) }),
              fc.record({ documents: fc.constant([]) }),
              fc.record({ documents: fc.array(fc.record({ notId: fc.string() }), { minLength: 1 }) }),
              fc.record({ notDocuments: fc.array(documentWithCitationArbitrary(), { minLength: 1 }) })
            ),
            metadata: fc.record({
              timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
              priority: fc.constantFrom(Priority.LOW, Priority.NORMAL, Priority.HIGH, Priority.CRITICAL),
              retryCount: fc.integer({ min: 0, max: 3 })
            })
          }),
          async (message) => {
            const agent = new CitationAgent();
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

    it('should support all three citation styles', async () => {
      await fc.assert(
        fc.asyncProperty(
          documentWithCitationArbitrary(),
          fc.uuid(),
          async (document, workflowId) => {
            const agent = new CitationAgent();
            await agent.initialize();

            // Test all three styles
            const styles = [CitationStyle.APA, CitationStyle.MLA, CitationStyle.CHICAGO];

            for (const style of styles) {
              const message: MessageObject = {
                id: `msg-${Date.now()}-${style}`,
                type: MessageType.TASK_REQUEST,
                workflowId,
                sourceAgentId: 'test-agent',
                targetAgentId: 'citation-agent',
                payload: { documents: [document], style },
                metadata: {
                  timestamp: Date.now(),
                  priority: Priority.NORMAL,
                  retryCount: 0
                }
              };

              const response = await agent.handleMessage(message);

              expect(response.success).toBe(true);
              const { formattedCitations, style: resultStyle } = response.data!;

              expect(resultStyle).toBe(style);
              expect(formattedCitations.length).toBe(1);
              expect(formattedCitations[0].style).toBe(style);
              expect(formattedCitations[0].formatted).toContain(document.title);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject invalid citation styles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentWithCitationArbitrary(), { minLength: 1, maxLength: 3 }),
          fc.constantFrom('INVALID', 'UNKNOWN', 'HARVARD', 'IEEE'),
          fc.uuid(),
          async (documents, invalidStyle, workflowId) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'citation-agent',
              payload: { documents, style: invalidStyle },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            // Should fail with error about invalid style
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(response.error).toContain('Invalid citation style');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve document metadata in citations', async () => {
      await fc.assert(
        fc.asyncProperty(
          citationMessageArbitrary(),
          async (message) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const response = await agent.handleMessage(message);

            expect(response.success).toBe(true);
            const { citations } = response.data!;

            // Verify each citation preserves document metadata
            citations.forEach((citation: Citation, index: number) => {
              const originalDoc = message.payload.documents[index];
              
              expect(citation.documentId).toBe(originalDoc.id);
              expect(citation.title).toBe(originalDoc.title);
              expect(citation.author).toBe(originalDoc.author);
              expect(citation.source).toBe(originalDoc.source);
              expect(citation.publishedDate).toBe(originalDoc.publishedDate);
              
              // Metadata should be preserved
              expect(citation.metadata).toBeDefined();
              expect(typeof citation.metadata).toBe('object');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle large batches of documents efficiently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(documentWithCitationArbitrary(), { minLength: 10, maxLength: 20 }),
          citationStyleArbitrary(),
          fc.uuid(),
          async (documents, style, workflowId) => {
            const agent = new CitationAgent();
            await agent.initialize();

            const startTime = Date.now();

            const message: MessageObject = {
              id: `msg-${Date.now()}`,
              type: MessageType.TASK_REQUEST,
              workflowId,
              sourceAgentId: 'test-agent',
              targetAgentId: 'citation-agent',
              payload: { documents, style },
              metadata: {
                timestamp: Date.now(),
                priority: Priority.NORMAL,
                retryCount: 0
              }
            };

            const response = await agent.handleMessage(message);

            const processingTime = Date.now() - startTime;

            expect(response.success).toBe(true);
            const { citations, formattedCitations } = response.data!;

            // Should process all documents
            expect(citations.length).toBe(documents.length);
            expect(formattedCitations.length).toBe(documents.length);

            // Should complete in reasonable time (< 1 second for 20 documents)
            expect(processingTime).toBeLessThan(1000);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
