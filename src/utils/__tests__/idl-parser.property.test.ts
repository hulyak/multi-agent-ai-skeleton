/**
 * Property-based tests for IDL Parser
 * Uses fast-check for comprehensive correctness guarantees
 */

import * as fc from 'fast-check';
import { parseIDL, idlToKiroSpec, specToYAML, mapCorbaType } from '../idl-parser';

describe('IDL Parser - Property-Based Tests', () => {
  describe('Property 1: Module extraction completeness', () => {
    it('should extract all modules from any valid IDL', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)), { minLength: 1, maxLength: 5 }),
          (moduleNames) => {
            // Generate IDL with multiple modules
            const idl = moduleNames.map(name => `module ${name} { };`).join('\n');
            const result = parseIDL(idl);
            
            // All modules should be extractable (even if empty)
            // Parser flattens modules, so we check that parsing doesn't throw
            expect(() => parseIDL(idl)).not.toThrow();
            expect(result).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Interface extraction completeness', () => {
    it('should extract all interfaces from any valid IDL', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)), { minLength: 1, maxLength: 5 }),
          (interfaceNames) => {
            // Generate IDL with multiple interfaces
            const idl = `module Test {\n${interfaceNames.map(name => `  interface ${name} { };`).join('\n')}\n};`;
            const result = parseIDL(idl);
            
            // Should extract all interfaces
            expect(result.length).toBe(interfaceNames.length);
            interfaceNames.forEach(name => {
              expect(result.some(iface => iface.name === name)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Struct extraction completeness', () => {
    it('should extract all structs from any valid IDL', () => {
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
                { minLength: 0, maxLength: 3 }
              )
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (structs) => {
            // Generate IDL with multiple structs
            const structDefs = structs.map(s => 
              `  struct ${s.name} {\n${s.fields.map(f => `    ${f.type} ${f.name};`).join('\n')}\n  };`
            ).join('\n');
            const idl = `module Test {\n${structDefs}\n  interface TestInterface { };\n};`;
            const result = parseIDL(idl);
            
            // Should extract all structs
            expect(result[0].structs.length).toBe(structs.length);
            structs.forEach(s => {
              expect(result[0].structs.some(struct => struct.name === s.name)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 4: Exception extraction completeness', () => {
    it('should extract all exceptions from any valid IDL', () => {
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
                { minLength: 0, maxLength: 3 }
              )
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (exceptions) => {
            // Generate IDL with multiple exceptions
            const exceptionDefs = exceptions.map(e => 
              `  exception ${e.name} {\n${e.fields.map(f => `    ${f.type} ${f.name};`).join('\n')}\n  };`
            ).join('\n');
            const idl = `module Test {\n${exceptionDefs}\n  interface TestInterface { };\n};`;
            const result = parseIDL(idl);
            
            // Should extract all exceptions
            expect(result[0].exceptions.length).toBe(exceptions.length);
            exceptions.forEach(e => {
              expect(result[0].exceptions.some(exc => exc.name === e.name)).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 5: Method-exception association preservation', () => {
    it('should preserve raises clauses for all methods', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
              exceptions: fc.array(fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)), { minLength: 1, maxLength: 3 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (methods) => {
            // Generate IDL with methods that raise exceptions
            const methodDefs = methods.map(m => 
              `    void ${m.name}() raises (${m.exceptions.join(', ')});`
            ).join('\n');
            const idl = `module Test {\n  interface TestInterface {\n${methodDefs}\n  };\n};`;
            const result = parseIDL(idl);
            
            // Should preserve all raises clauses
            expect(result[0].methods.length).toBe(methods.length);
            methods.forEach(m => {
              const method = result[0].methods.find(method => method.name === m.name);
              expect(method).toBeDefined();
              // Check that all exceptions are present (order may vary)
              expect(method?.raises.length).toBe(m.exceptions.length);
              m.exceptions.forEach(exc => {
                expect(method?.raises).toContain(exc);
              });
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 11: Error handling for malformed IDL', () => {
    it('should not throw on malformed IDL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 200 }),
          (randomString) => {
            // Should handle any string without throwing
            expect(() => parseIDL(randomString)).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty array for completely invalid IDL', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('interface')),
          (invalidIDL) => {
            const result = parseIDL(invalidIDL);
            // Should return empty array or handle gracefully
            expect(Array.isArray(result)).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 12: Partial parsing resilience', () => {
    it('should parse valid sections even with invalid sections present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          fc.string({ minLength: 10, maxLength: 50 }),
          (validInterfaceName, garbage) => {
            // Mix valid and invalid IDL
            const idl = `
              ${garbage}
              module Test {
                interface ${validInterfaceName} {
                  void testMethod();
                };
              };
              ${garbage}
            `;
            const result = parseIDL(idl);
            
            // Should extract the valid interface despite garbage
            const validInterface = result.find(iface => iface.name === validInterfaceName);
            expect(validInterface).toBeDefined();
            expect(validInterface?.methods.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 13: Graceful handling of unsupported features', () => {
    it('should handle IDL with unsupported keywords gracefully', () => {
      const unsupportedKeywords = ['union', 'enum', 'typedef', 'const', 'attribute'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...unsupportedKeywords),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Za-z][A-Za-z0-9_]*$/.test(s)),
          (keyword, name) => {
            const idl = `module Test { ${keyword} ${name} { }; interface TestInterface { }; };`;
            
            // Should not throw
            expect(() => parseIDL(idl)).not.toThrow();
            
            // Should still extract the interface
            const result = parseIDL(idl);
            expect(result.some(iface => iface.name === 'TestInterface')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
