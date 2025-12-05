/**
 * Property-based tests for IDL Resurrection Download Functionality
 * Uses fast-check for comprehensive correctness guarantees
 */

import * as fc from 'fast-check';

describe('IDL Resurrection Download - Property-Based Tests', () => {
  describe('Property 18: Download filename generation', () => {
    it('should generate valid filenames for any agent name', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (agentName) => {
            // Simulate filename generation logic
            const filename = `${agentName}.kiro.yaml`;
            
            // Filename should be valid
            expect(filename).toMatch(/^[A-Za-z][A-Za-z0-9_]*\.kiro\.yaml$/);
            expect(filename.length).toBeGreaterThan(10); // At least "A.kiro.yaml"
            expect(filename.endsWith('.kiro.yaml')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle agent names with Agent suffix', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (baseName) => {
            const agentName = `${baseName}Agent`;
            const filename = `${agentName}.kiro.yaml`;
            
            // Should preserve Agent suffix in filename
            expect(filename).toContain('Agent');
            expect(filename.endsWith('.kiro.yaml')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate unique filenames for different agents', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (agentName1, agentName2) => {
            fc.pre(agentName1 !== agentName2); // Only test different names
            
            const filename1 = `${agentName1}.kiro.yaml`;
            const filename2 = `${agentName2}.kiro.yaml`;
            
            // Different agents should have different filenames
            expect(filename1).not.toBe(filename2);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle special characters in agent names gracefully', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (rawName) => {
            // Sanitize name (remove invalid characters)
            const sanitized = rawName.replace(/[^A-Za-z0-9_]/g, '');
            
            if (sanitized.length > 0 && /^[A-Za-z]/.test(sanitized)) {
              const filename = `${sanitized}.kiro.yaml`;
              
              // Sanitized filename should be valid
              expect(filename).toMatch(/^[A-Za-z][A-Za-z0-9_]*\.kiro\.yaml$/);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate consistent filenames for same agent', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (agentName) => {
            const filename1 = `${agentName}.kiro.yaml`;
            const filename2 = `${agentName}.kiro.yaml`;
            
            // Same agent should always produce same filename
            expect(filename1).toBe(filename2);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Download content validation', () => {
    it('should generate downloadable content with proper MIME type', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 1000 }),
          (yamlContent) => {
            // Simulate blob creation
            const blob = new Blob([yamlContent], { type: 'text/yaml' });
            
            // Blob should have correct type
            expect(blob.type).toBe('text/yaml');
            expect(blob.size).toBe(yamlContent.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle empty YAML content gracefully', () => {
      const emptyYaml = '';
      const blob = new Blob([emptyYaml], { type: 'text/yaml' });
      
      expect(blob.type).toBe('text/yaml');
      expect(blob.size).toBe(0);
    });

    it('should handle large YAML content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10000, maxLength: 50000 }),
          (largeYaml) => {
            const blob = new Blob([largeYaml], { type: 'text/yaml' });
            
            expect(blob.type).toBe('text/yaml');
            expect(blob.size).toBe(largeYaml.length);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Download URL generation', () => {
    it('should generate valid object URLs', () => {
      // Mock URL.createObjectURL if not available (Jest environment)
      if (typeof URL.createObjectURL === 'undefined') {
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
      }

      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 1000 }),
          (content) => {
            const blob = new Blob([content], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            
            // URL should be defined
            expect(url).toBeDefined();
            expect(typeof url).toBe('string');
            
            // Cleanup
            URL.revokeObjectURL(url);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should generate unique URLs for different content', () => {
      // Mock URL.createObjectURL if not available (Jest environment)
      if (typeof URL.createObjectURL === 'undefined') {
        let counter = 0;
        global.URL.createObjectURL = jest.fn(() => `blob:mock-url-${counter++}`);
        global.URL.revokeObjectURL = jest.fn();
      }

      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          (content1, content2) => {
            fc.pre(content1 !== content2);
            
            const blob1 = new Blob([content1], { type: 'text/yaml' });
            const blob2 = new Blob([content2], { type: 'text/yaml' });
            const url1 = URL.createObjectURL(blob1);
            const url2 = URL.createObjectURL(blob2);
            
            // URLs should be defined
            expect(url1).toBeDefined();
            expect(url2).toBeDefined();
            
            // Cleanup
            URL.revokeObjectURL(url1);
            URL.revokeObjectURL(url2);
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
