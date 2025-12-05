/**
 * Tests for enhanced YAML generator with validation
 * Requirements: 2.5, 6.5
 */

import { specToYAML, validateYAML, KiroSpec } from '../idl-parser';

describe('YAML Generator Enhancements', () => {
  describe('specToYAML formatting', () => {
    it('generates properly indented YAML', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [{ name: 'input1', type: 'string' }],
        outputs: [{ name: 'output1', type: 'number' }],
        methods: [
          {
            name: 'testMethod',
            params: [{ name: 'param1', type: 'string' }],
            returns: 'number',
            errors: []
          }
        ],
        types: []
      };

      const yaml = specToYAML(spec);

      // Check for proper indentation (2 spaces)
      expect(yaml).toContain('inputs:\n  - name:');
      expect(yaml).toContain('outputs:\n  - name:');
      expect(yaml).toContain('methods:\n  - name:');
      expect(yaml).toContain('    params:\n      - name:');
    });

    it('escapes special YAML characters', () => {
      const spec: KiroSpec = {
        agent: 'Agent:With:Colons',
        module: 'Module#With#Hash',
        inputs: [],
        outputs: [],
        methods: [
          {
            name: 'method*with*stars',
            params: [],
            returns: 'void',
            errors: []
          }
        ],
        types: []
      };

      const yaml = specToYAML(spec);

      // Special characters should be escaped/quoted
      expect(yaml).toContain('"Agent:With:Colons"');
      expect(yaml).toContain('"Module#With#Hash"');
      expect(yaml).toContain('"method*with*stars"');
    });

    it('handles empty params with empty array notation', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [],
        outputs: [],
        methods: [
          {
            name: 'noParamsMethod',
            params: [],
            returns: 'void',
            errors: []
          }
        ],
        types: []
      };

      const yaml = specToYAML(spec);

      expect(yaml).toContain('params: []');
    });

    it('handles empty fields with empty array notation', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [],
        outputs: [],
        methods: [],
        types: [
          {
            name: 'EmptyStruct',
            fields: []
          }
        ]
      };

      const yaml = specToYAML(spec);

      expect(yaml).toContain('fields: []');
    });

    it('includes proper spacing between methods', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [],
        outputs: [],
        methods: [
          {
            name: 'method1',
            params: [],
            returns: 'void',
            errors: []
          },
          {
            name: 'method2',
            params: [],
            returns: 'void',
            errors: []
          }
        ],
        types: []
      };

      const yaml = specToYAML(spec);

      // Should have blank line between methods
      expect(yaml).toMatch(/method1[\s\S]*?\n\n[\s]*- name: method2/);
    });

    it('includes proper spacing between types', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [],
        outputs: [],
        methods: [],
        types: [
          {
            name: 'Type1',
            fields: [{ name: 'field1', type: 'string' }]
          },
          {
            name: 'Type2',
            fields: [{ name: 'field2', type: 'number' }]
          }
        ]
      };

      const yaml = specToYAML(spec);

      // Should have blank line between types
      expect(yaml).toMatch(/Type1[\s\S]*?\n\n[\s]*- name: Type2/);
    });

    it('ends with single newline', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [],
        outputs: [],
        methods: [],
        types: []
      };

      const yaml = specToYAML(spec);

      expect(yaml.endsWith('\n')).toBe(true);
      expect(yaml.endsWith('\n\n')).toBe(false);
    });
  });

  describe('validateYAML', () => {
    it('validates correct YAML structure', () => {
      const validYAML = `# Comment
agent: TestAgent
module: TestModule

methods:
  - name: testMethod
    params: []
    returns: void
`;

      const result = validateYAML(validYAML);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required fields', () => {
      const invalidYAML = `# Comment
module: TestModule

methods:
  - name: testMethod
`;

      const result = validateYAML(invalidYAML);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: agent');
    });

    it('detects invalid indentation', () => {
      const invalidYAML = `agent: TestAgent
module: TestModule
methods:
 - name: testMethod
   params: []
`;

      const result = validateYAML(invalidYAML);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid indentation'))).toBe(true);
    });

    it('detects tabs in YAML', () => {
      const invalidYAML = `agent: TestAgent
module: TestModule
methods:
\t- name: testMethod
`;

      const result = validateYAML(invalidYAML);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Tabs not allowed'))).toBe(true);
    });

    it('detects missing space after colon', () => {
      const invalidYAML = `agent:TestAgent
module: TestModule
methods:
  - name: testMethod
`;

      const result = validateYAML(invalidYAML);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing space after colon'))).toBe(true);
    });

    it('allows comments and empty lines', () => {
      const validYAML = `# This is a comment
agent: TestAgent

# Another comment
module: TestModule

methods:
  - name: testMethod
    params: []
    returns: void
`;

      const result = validateYAML(validYAML);

      expect(result.valid).toBe(true);
    });
  });

  describe('Integration: specToYAML with validation', () => {
    it('generates valid YAML that passes validation', () => {
      const spec: KiroSpec = {
        agent: 'RouterAgent',
        module: 'AgentSystem',
        inputs: [
          { name: 'message', type: 'Message' },
          { name: 'string', type: 'string' }
        ],
        outputs: [
          { name: 'string', type: 'string' },
          { name: 'boolean', type: 'boolean' }
        ],
        methods: [
          {
            name: 'routeMessage',
            params: [{ name: 'msg', type: 'Message' }],
            returns: 'string',
            errors: ['RoutingException']
          },
          {
            name: 'isAgentAvailable',
            params: [{ name: 'agentId', type: 'string' }],
            returns: 'boolean',
            errors: []
          }
        ],
        types: [
          {
            name: 'Message',
            fields: [
              { name: 'messageId', type: 'string' },
              { name: 'payload', type: 'string' }
            ]
          }
        ]
      };

      const yaml = specToYAML(spec);
      const validation = validateYAML(yaml);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('generates YAML with all required sections', () => {
      const spec: KiroSpec = {
        agent: 'TestAgent',
        module: 'TestModule',
        inputs: [{ name: 'input', type: 'string' }],
        outputs: [{ name: 'output', type: 'number' }],
        methods: [
          {
            name: 'testMethod',
            params: [{ name: 'param', type: 'string' }],
            returns: 'number',
            errors: ['TestError']
          }
        ],
        types: [
          {
            name: 'TestType',
            fields: [{ name: 'field', type: 'string' }]
          }
        ]
      };

      const yaml = specToYAML(spec);

      // Check all sections are present
      expect(yaml).toContain('agent: TestAgent');
      expect(yaml).toContain('module: TestModule');
      expect(yaml).toContain('inputs:');
      expect(yaml).toContain('outputs:');
      expect(yaml).toContain('methods:');
      expect(yaml).toContain('types:');
      expect(yaml).toContain('errors:');
      expect(yaml).toContain('- TestError');
    });
  });
});
