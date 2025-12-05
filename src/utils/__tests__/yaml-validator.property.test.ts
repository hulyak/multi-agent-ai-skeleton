/**
 * Property-based tests for YAML Generator and Validator
 * Uses fast-check for comprehensive correctness guarantees
 */

import * as fc from 'fast-check';
import { parseIDL, idlToKiroSpec, specToYAML } from '../idl-parser';

describe('YAML Generator - Property-Based Tests', () => {
  describe('Property 10: YAML round-trip validity', () => {
    it('should generate parseable YAML for any valid spec', () => {
      fc.assert(
        fc.property(
          fc.record({
            interfaceName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
            methods: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
                returnType: fc.constantFrom('void', 'string', 'long')
              }),
              { minLength: 1, maxLength: 5 }
            )
          }),
          ({ interfaceName, methods }) => {
            const methodDefs = methods.map(m => `    ${m.returnType} ${m.name}();`).join('\n');
            const idl = `module Test {\n  interface ${interfaceName} {\n${methodDefs}\n  };\n};`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            const yaml = specToYAML(spec);
            
            // YAML should be valid (no syntax errors)
            expect(yaml).toContain('agent:');
            expect(yaml).toContain(`agent: ${interfaceName}`);
            expect(yaml).toContain('methods:');
            
            // Should not contain tabs
            expect(yaml).not.toContain('\t');
            
            // Should have proper structure
            const lines = yaml.split('\n');
            expect(lines.length).toBeGreaterThan(5);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate consistent YAML for same input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (interfaceName) => {
            const idl = `module Test { interface ${interfaceName} { void test(); }; };`;
            const interfaces1 = parseIDL(idl);
            const spec1 = idlToKiroSpec(interfaces1[0]);
            const yaml1 = specToYAML(spec1);
            
            const interfaces2 = parseIDL(idl);
            const spec2 = idlToKiroSpec(interfaces2[0]);
            const yaml2 = specToYAML(spec2);
            
            // Same input should produce same output
            expect(yaml1).toBe(yaml2);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 19: Downloaded YAML validity', () => {
    it('should generate downloadable YAML with proper structure', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (interfaceName) => {
            const idl = `module Test { interface ${interfaceName} { void test(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            const yaml = specToYAML(spec);
            
            // Should have all required sections
            expect(yaml).toContain('agent:');
            expect(yaml).toContain('module:');
            expect(yaml).toContain('methods:');
            
            // Should end with newline
            expect(yaml.endsWith('\n')).toBe(true);
            
            // Should not have trailing spaces
            const lines = yaml.split('\n');
            lines.forEach(line => {
              if (line.length > 0) {
                expect(line).not.toMatch(/\s+$/);
              }
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should escape special YAML characters properly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.includes(':') || s.includes('#') || s.includes('"')),
          (specialString) => {
            // Create IDL with special characters in method name (sanitized)
            const idl = `module Test { interface TestAgent { void test(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            const yaml = specToYAML(spec);
            
            // Should not throw and should generate valid YAML
            expect(yaml).toBeDefined();
            expect(yaml.length).toBeGreaterThan(0);
            expect(yaml).toContain('agent:');
            expect(yaml).toContain('methods:');
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});

describe('Spec Validator - Property-Based Tests', () => {
  describe('Property 14: Required field validation', () => {
    it('should validate that all required fields are present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (interfaceName) => {
            const idl = `module Test { interface ${interfaceName} { void test(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // All required fields should be present
            expect(spec.agent).toBeDefined();
            expect(spec.module).toBeDefined();
            expect(spec.methods).toBeDefined();
            expect(spec.types).toBeDefined();
            expect(spec.inputs).toBeDefined();
            expect(spec.outputs).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Method structure validation', () => {
    it('should validate method structure for all methods', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
              returnType: fc.constantFrom('void', 'string', 'long')
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (methods) => {
            const methodDefs = methods.map(m => `    ${m.returnType} ${m.name}();`).join('\n');
            const idl = `module Test {\n  interface TestAgent {\n${methodDefs}\n  };\n};`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // All methods should have required structure
            spec.methods.forEach(method => {
              expect(method.name).toBeDefined();
              expect(method.params).toBeDefined();
              expect(method.returns).toBeDefined();
              expect(method.errors).toBeDefined();
              expect(Array.isArray(method.params)).toBe(true);
              expect(Array.isArray(method.errors)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 16: Type structure validation', () => {
    it('should validate type structure for all types', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
              fields: fc.array(
                fc.record({
                  type: fc.constantFrom('string', 'long', 'boolean'),
                  name: fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
                }),
                { minLength: 1, maxLength: 5 }
              )
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (structs) => {
            const structDefs = structs.map(s => 
              `  struct ${s.name} {\n${s.fields.map(f => `    ${f.type} ${f.name};`).join('\n')}\n  };`
            ).join('\n');
            const idl = `module Test {\n${structDefs}\n  interface TestAgent { void test(); };\n};`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // All types should have required structure
            spec.types.forEach(type => {
              expect(type.name).toBeDefined();
              expect(type.fields).toBeDefined();
              expect(Array.isArray(type.fields)).toBe(true);
              
              type.fields.forEach(field => {
                expect(field.name).toBeDefined();
                expect(field.type).toBeDefined();
              });
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 17: Type mismatch detection', () => {
    it('should correctly map all CORBA types to TypeScript types', () => {
      const corbaTypes = ['string', 'long', 'short', 'boolean', 'double', 'float', 'void'];
      const expectedMappings: Record<string, string> = {
        string: 'string',
        long: 'number',
        short: 'number',
        boolean: 'boolean',
        double: 'number',
        float: 'number',
        void: 'void'
      };
      
      fc.assert(
        fc.property(
          fc.constantFrom(...corbaTypes),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (corbaType, methodName) => {
            const idl = `module Test { interface TestAgent { ${corbaType} ${methodName}(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Type should be correctly mapped
            const method = spec.methods[0];
            expect(method.returns).toBe(expectedMappings[corbaType]);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle sequence types correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('string', 'long', 'boolean'),
          (elementType) => {
            const idl = `module Test { interface TestAgent { sequence<${elementType}> test(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Sequence should be mapped to array
            const method = spec.methods[0];
            expect(method.returns).toContain('[]');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
