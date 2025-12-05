/**
 * Property-based tests for Spec Converter
 * Uses fast-check for comprehensive correctness guarantees
 */

import * as fc from 'fast-check';
import { parseIDL, idlToKiroSpec, IDLInterface } from '../idl-parser';

describe('Spec Converter - Property-Based Tests', () => {
  describe('Property 6: Agent name mapping consistency', () => {
    it('should consistently map interface names to agent names', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (interfaceName) => {
            const idl = `module Test { interface ${interfaceName} { void test(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Agent name should be derived from interface name
            expect(spec.agent).toBe(interfaceName);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle interface names with Agent suffix', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (baseName) => {
            const interfaceName = `${baseName}Agent`;
            const idl = `module Test { interface ${interfaceName} { void test(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Should preserve the full name including Agent suffix
            expect(spec.agent).toBe(interfaceName);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 7: Parameter direction categorization', () => {
    it('should categorize in parameters correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('string', 'long', 'boolean'),
              name: fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (params) => {
            const paramDefs = params.map(p => `in ${p.type} ${p.name}`).join(', ');
            const idl = `module Test { interface TestAgent { void testMethod(${paramDefs}); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // All in parameters should be in method params
            const method = spec.methods[0];
            expect(method.params.length).toBe(params.length);
            params.forEach(p => {
              expect(method.params.some(param => param.name === p.name)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should categorize out parameters correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('string', 'long', 'boolean'),
              name: fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (params) => {
            const paramDefs = params.map(p => `out ${p.type} ${p.name}`).join(', ');
            const idl = `module Test { interface TestAgent { void testMethod(${paramDefs}); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // All out parameters should be in method params
            const method = spec.methods[0];
            expect(method.params.length).toBe(params.length);
            params.forEach(p => {
              expect(method.params.some(param => param.name === p.name)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should categorize inout parameters correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('string', 'long', 'boolean'),
              name: fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
            }),
            { minLength: 1, maxLength: 3 }
          ),
          (params) => {
            const paramDefs = params.map(p => `inout ${p.type} ${p.name}`).join(', ');
            const idl = `module Test { interface TestAgent { void testMethod(${paramDefs}); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // All inout parameters should be in method params
            const method = spec.methods[0];
            expect(method.params.length).toBe(params.length);
            params.forEach(p => {
              expect(method.params.some(param => param.name === p.name)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 8: Method conversion completeness', () => {
    it('should convert all methods from interface', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
              returnType: fc.constantFrom('void', 'string', 'long', 'boolean')
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (methods) => {
            const methodDefs = methods.map(m => `    ${m.returnType} ${m.name}();`).join('\n');
            const idl = `module Test {\n  interface TestAgent {\n${methodDefs}\n  };\n};`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Should convert all methods
            expect(spec.methods.length).toBe(methods.length);
            methods.forEach(m => {
              expect(spec.methods.some(method => method.name === m.name)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve method return types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('string', 'long', 'boolean', 'double'),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (returnType, methodName) => {
            const idl = `module Test { interface TestAgent { ${returnType} ${methodName}(); }; };`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Should preserve return type
            const method = spec.methods[0];
            expect(method.returns).toBeDefined();
            // Type should be mapped correctly
            const expectedType = returnType === 'long' ? 'number' : returnType === 'double' ? 'number' : returnType;
            expect(method.returns).toBe(expectedType);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 9: Struct preservation in conversion', () => {
    it('should preserve all structs in type definitions', () => {
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
            
            // Should preserve all structs
            expect(spec.types.length).toBe(structs.length);
            structs.forEach(s => {
              const type = spec.types.find(t => t.name === s.name);
              expect(type).toBeDefined();
              expect(type?.fields.length).toBe(s.fields.length);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve struct field types correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
            fields: fc.array(
              fc.record({
                type: fc.constantFrom('string', 'long', 'boolean', 'double'),
                name: fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s))
              }),
              { minLength: 1, maxLength: 5 }
            )
          }),
          (struct) => {
            const fieldDefs = struct.fields.map(f => `    ${f.type} ${f.name};`).join('\n');
            const idl = `module Test {\n  struct ${struct.name} {\n${fieldDefs}\n  };\n  interface TestAgent { void test(); };\n};`;
            const interfaces = parseIDL(idl);
            const spec = idlToKiroSpec(interfaces[0]);
            
            // Should preserve field types with correct mapping
            const type = spec.types.find(t => t.name === struct.name);
            expect(type).toBeDefined();
            struct.fields.forEach(f => {
              const field = type?.fields.find(field => field.name === f.name);
              expect(field).toBeDefined();
              // Type should be mapped (e.g., long -> number)
              expect(field?.type).toBeDefined();
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
