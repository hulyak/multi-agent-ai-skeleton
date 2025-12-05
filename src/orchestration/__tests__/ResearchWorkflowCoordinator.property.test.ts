// Property-Based Tests for Research Workflow Coordinator
// Feature: idl-resurrection, Property 18: Research workflow sequential execution
// Feature: idl-resurrection, Property 19: Research report formatting
// Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5

import fc from 'fast-check';
import { ResearchWorkflowCoordinator } from '../ResearchWorkflowCoordinator';
import { CitationStyle } from '../../agents/CitationAgent';

// ============================================================================
// Generators (Arbitraries)
// ============================================================================

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
 * Generate citation styles
 */
function citationStyleArbitrary(): fc.Arbitrary<CitationStyle> {
  return fc.constantFrom(
    CitationStyle.APA,
    CitationStyle.MLA,
    CitationStyle.CHICAGO
  );
}

// ============================================================================
// Property Tests
// ============================================================================

describe('ResearchWorkflowCoordinator Property Tests', () => {
  // Feature: idl-resurrection, Property 18: Research workflow sequential execution
  describe('Property 18: Research workflow sequential execution', () => {
    it('should trigger agents in sequence: Retrieval → Summarization → Citation', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          async (topic) => {
            // Create coordinator
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            // Execute research workflow
            const report = await coordinator.executeResearchWorkflow(topic);

            // Verify report structure
            expect(report).toBeDefined();
            expect(report.topic).toBe(topic);
            expect(Array.isArray(report.documents)).toBe(true);
            expect(Array.isArray(report.summaries)).toBe(true);
            expect(Array.isArray(report.citations)).toBe(true);
            expect(typeof report.formattedReport).toBe('string');
            expect(report.metadata).toBeDefined();

            // Verify metadata
            expect(report.metadata.workflowId).toBeDefined();
            expect(typeof report.metadata.workflowId).toBe('string');
            expect(report.metadata.startedAt).toBeGreaterThan(0);
            expect(report.metadata.completedAt).toBeGreaterThan(0);
            expect(report.metadata.completedAt).toBeGreaterThanOrEqual(report.metadata.startedAt);
            expect(typeof report.metadata.totalDocuments).toBe('number');
            expect(report.metadata.totalDocuments).toBe(report.documents.length);

            // Verify sequential execution results
            // 1. Retrieval should have produced documents
            expect(report.documents.length).toBeGreaterThanOrEqual(0);

            // 2. If documents were retrieved, summaries should exist
            if (report.documents.length > 0) {
              expect(report.summaries.length).toBe(report.documents.length);
              
              // Each document should have a corresponding summary
              report.documents.forEach(doc => {
                const summary = report.summaries.find(s => s.documentId === doc.id);
                expect(summary).toBeDefined();
                expect(summary!.summary).toBeDefined();
                expect(typeof summary!.summary).toBe('string');
                expect(summary!.summary.length).toBeGreaterThan(0);
              });
            }

            // 3. If documents were retrieved, citations should exist
            if (report.documents.length > 0) {
              expect(report.citations.length).toBe(report.documents.length);
              
              // Each document should have a corresponding citation
              report.documents.forEach(doc => {
                const citation = report.citations.find(c => c.citation.documentId === doc.id);
                expect(citation).toBeDefined();
                expect(citation!.formatted).toBeDefined();
                expect(typeof citation!.formatted).toBe('string');
                expect(citation!.formatted.length).toBeGreaterThan(0);
              });
            }

            // 4. Verify workflow state was updated
            const stateManager = coordinator.getStateManager();
            const workflow = stateManager.getWorkflow(report.metadata.workflowId);
            
            expect(workflow).toBeDefined();
            expect(workflow.status).toBe('COMPLETED');
            expect(workflow.sharedData.retrievedDocuments).toBeDefined();
            
            if (report.documents.length > 0) {
              expect(workflow.sharedData.summaries).toBeDefined();
              expect(workflow.sharedData.citations).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should execute agents in correct order and aggregate outputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          fc.integer({ min: 1, max: 5 }),
          async (topic, maxDocuments) => {
            // Create coordinator with custom config
            const coordinator = new ResearchWorkflowCoordinator(undefined, {
              maxDocuments
            });
            await coordinator.initialize();

            // Execute workflow
            const report = await coordinator.executeResearchWorkflow(topic);

            // Verify documents don't exceed max
            expect(report.documents.length).toBeLessThanOrEqual(maxDocuments);

            // Verify aggregation: summaries and citations match documents
            expect(report.summaries.length).toBe(report.documents.length);
            expect(report.citations.length).toBe(report.documents.length);

            // Verify each document has both summary and citation
            report.documents.forEach(doc => {
              const hasSummary = report.summaries.some(s => s.documentId === doc.id);
              const hasCitation = report.citations.some(c => c.citation.documentId === doc.id);
              
              expect(hasSummary).toBe(true);
              expect(hasCitation).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty results gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'xyzabc123nonsense',
            'qwertyzxcvb',
            'asdfghjkl'
          ),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Should complete successfully even with no results
            expect(report).toBeDefined();
            expect(report.topic).toBe(topic);
            expect(report.documents.length).toBe(0);
            expect(report.summaries.length).toBe(0);
            expect(report.citations.length).toBe(0);
            expect(typeof report.formattedReport).toBe('string');
            expect(report.formattedReport.length).toBeGreaterThan(0);

            // Workflow should be marked as completed
            const workflow = coordinator.getStateManager().getWorkflow(report.metadata.workflowId);
            expect(workflow.status).toBe('COMPLETED');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should respect configuration parameters', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 100, max: 500 }),
          citationStyleArbitrary(),
          async (topic, maxDocuments, summaryTargetLength, citationStyle) => {
            const coordinator = new ResearchWorkflowCoordinator(undefined, {
              maxDocuments,
              summaryTargetLength,
              citationStyle
            });
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Verify config was respected
            expect(report.documents.length).toBeLessThanOrEqual(maxDocuments);
            expect(report.metadata.citationStyle).toBe(citationStyle);

            // Verify summaries respect target length (with tolerance)
            if (report.summaries.length > 0) {
              report.summaries.forEach(summary => {
                // Summaries should be reasonably close to target length
                // Allow for some flexibility since exact length may not be achievable
                expect(summary.summaryLength).toBeLessThanOrEqual(summaryTargetLength * 1.5);
              });
            }

            // Verify citations use correct style
            if (report.citations.length > 0) {
              report.citations.forEach(citation => {
                expect(citation.style).toBe(citationStyle);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should store intermediate results in workflow state', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Get workflow state
            const workflow = coordinator.getStateManager().getWorkflow(report.metadata.workflowId);

            // Verify all intermediate results are stored
            expect(workflow.sharedData.retrievedDocuments).toBeDefined();
            expect(Array.isArray(workflow.sharedData.retrievedDocuments)).toBe(true);
            expect(workflow.sharedData.retrievedDocuments.length).toBe(report.documents.length);

            if (report.documents.length > 0) {
              expect(workflow.sharedData.summaries).toBeDefined();
              expect(Array.isArray(workflow.sharedData.summaries)).toBe(true);
              expect(workflow.sharedData.summaries.length).toBe(report.summaries.length);

              expect(workflow.sharedData.citations).toBeDefined();
              expect(Array.isArray(workflow.sharedData.citations)).toBe(true);
              expect(workflow.sharedData.citations.length).toBe(report.citations.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: idl-resurrection, Property 19: Research report formatting
  describe('Property 19: Research report formatting', () => {
    it('should format report in rich-text with citation links', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Verify formatted report exists and is non-empty
            expect(report.formattedReport).toBeDefined();
            expect(typeof report.formattedReport).toBe('string');
            expect(report.formattedReport.length).toBeGreaterThan(0);

            // Verify report contains title
            expect(report.formattedReport).toContain('Research Report');
            expect(report.formattedReport).toContain(topic);

            // Verify report has sections
            expect(report.formattedReport).toContain('Executive Summary');
            expect(report.formattedReport).toContain('References');
            expect(report.formattedReport).toContain('Report Metadata');

            // If documents exist, verify they appear in the report
            if (report.documents.length > 0) {
              expect(report.formattedReport).toContain('Document Summaries');
              
              // Each document title should appear
              report.documents.forEach(doc => {
                expect(report.formattedReport).toContain(doc.title);
              });

              // Each summary should appear
              report.summaries.forEach(summary => {
                expect(report.formattedReport).toContain(summary.summary);
              });

              // Each citation should appear
              report.citations.forEach(citation => {
                expect(report.formattedReport).toContain(citation.formatted);
              });
            }

            // Verify metadata appears in report
            expect(report.formattedReport).toContain(`**Total Documents:** ${report.documents.length}`);
            expect(report.formattedReport).toContain(`**Citation Style:** ${report.metadata.citationStyle}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all required sections in formatted report', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            const formattedReport = report.formattedReport;

            // Required sections
            const requiredSections = [
              '# Research Report',
              '## Executive Summary',
              '## References',
              '## Report Metadata'
            ];

            requiredSections.forEach(section => {
              expect(formattedReport).toContain(section);
            });

            // If documents exist, should have Document Summaries section
            if (report.documents.length > 0) {
              expect(formattedReport).toContain('## Document Summaries');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format citations with proper numbering', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            if (report.citations.length > 0) {
              // Verify citations are numbered in References section
              const referencesSection = report.formattedReport.split('## References')[1];
              expect(referencesSection).toBeDefined();

              // Each citation should have a number
              report.citations.forEach((citation, index) => {
                const citationNumber = `[${index + 1}]`;
                expect(referencesSection).toContain(citationNumber);
                expect(referencesSection).toContain(citation.formatted);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include metadata with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Extract metadata section
            const metadataSection = report.formattedReport.split('## Report Metadata')[1];
            expect(metadataSection).toBeDefined();

            // Verify required metadata fields
            expect(metadataSection).toContain(`**Topic:** ${topic}`);
            expect(metadataSection).toContain(`**Total Documents:** ${report.documents.length}`);
            expect(metadataSection).toContain(`**Citation Style:** ${report.metadata.citationStyle}`);
            expect(metadataSection).toContain('**Generated:**');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format report consistently across different citation styles', async () => {
      await fc.assert(
        fc.asyncProperty(
          researchTopicArbitrary(),
          citationStyleArbitrary(),
          async (topic, citationStyle) => {
            const coordinator = new ResearchWorkflowCoordinator(undefined, {
              citationStyle
            });
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Report should have consistent structure regardless of citation style
            expect(report.formattedReport).toContain('# Research Report');
            expect(report.formattedReport).toContain('## Executive Summary');
            expect(report.formattedReport).toContain('## References');
            expect(report.formattedReport).toContain('## Report Metadata');

            // Citation style should be reflected in metadata
            expect(report.formattedReport).toContain(`**Citation Style:** ${citationStyle}`);

            // If citations exist, they should be formatted according to the style
            if (report.citations.length > 0) {
              report.citations.forEach(citation => {
                expect(citation.style).toBe(citationStyle);
                // Citation should appear in the report
                expect(report.formattedReport).toContain(citation.formatted);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty results with appropriate messaging', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('xyzabc123nonsense', 'qwertyzxcvb'),
          async (topic) => {
            const coordinator = new ResearchWorkflowCoordinator();
            await coordinator.initialize();

            const report = await coordinator.executeResearchWorkflow(topic);

            // Should have a formatted report even with no results
            expect(report.formattedReport).toBeDefined();
            expect(report.formattedReport.length).toBeGreaterThan(0);

            // Should contain appropriate messaging for no results
            expect(report.formattedReport).toContain('No documents were found');
            
            // Should still have title and basic structure
            expect(report.formattedReport).toContain('# Research Report');
            expect(report.formattedReport).toContain(topic);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
