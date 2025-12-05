import { parseIDL, idlToKiroSpec, resurrectIDL, mapCorbaType } from '../idl-parser';

describe('IDL Parser', () => {
  const sampleIDL = `
module SupportSystem {
  struct CustomerInquiry {
    string inquiryId;
    string customerId;
    long priority;
  };
  
  interface SupportAgent {
    IntentResult classifyIntent(in CustomerInquiry inquiry);
    void escalateTicket(in string ticketId);
  };
};
`;

  test('parses IDL module', () => {
    const interfaces = parseIDL(sampleIDL);
    expect(interfaces.length).toBeGreaterThan(0);
    expect(interfaces[0].module).toBe('SupportSystem');
  });

  test('parses IDL interface', () => {
    const interfaces = parseIDL(sampleIDL);
    expect(interfaces[0].name).toBe('SupportAgent');
    expect(interfaces[0].methods.length).toBe(2);
  });

  test('converts to Kiro spec', () => {
    const interfaces = parseIDL(sampleIDL);
    const spec = idlToKiroSpec(interfaces[0]);
    expect(spec.agent).toBe('SupportAgent');
    expect(spec.methods.length).toBe(2);
  });

  test('full resurrection', () => {
    const { specs, yaml } = resurrectIDL(sampleIDL);
    expect(specs.length).toBeGreaterThan(0);
    expect(yaml.length).toBeGreaterThan(0);
    expect(yaml[0]).toContain('agent: SupportAgent');
  });
});

describe('IDL Parser - Edge Cases', () => {
  // Requirements 3.3: Empty or whitespace-only content
  describe('Empty and whitespace-only content', () => {
    test('handles empty string without throwing', () => {
      expect(() => parseIDL('')).not.toThrow();
      const result = parseIDL('');
      expect(result).toEqual([]);
    });

    test('handles whitespace-only content without throwing', () => {
      expect(() => parseIDL('   \n\t  \n  ')).not.toThrow();
      const result = parseIDL('   \n\t  \n  ');
      expect(result).toEqual([]);
    });

    test('handles content with only comments', () => {
      const commentsOnly = `
        // This is a comment
        /* This is a block comment */
        // Another comment
      `;
      expect(() => parseIDL(commentsOnly)).not.toThrow();
      const result = parseIDL(commentsOnly);
      expect(result).toEqual([]);
    });

    test('handles newlines and tabs', () => {
      const whitespaceVariations = '\n\n\n\t\t\t   \r\n   ';
      expect(() => parseIDL(whitespaceVariations)).not.toThrow();
      const result = parseIDL(whitespaceVariations);
      expect(result).toEqual([]);
    });
  });

  // Requirements 3.5: Nested module definitions
  describe('Nested module definitions', () => {
    test('handles single-level nested modules', () => {
      const nestedIDL = `
module OuterModule {
  module InnerModule {
    interface TestAgent {
      void testMethod(in string param);
    };
  };
};
`;
      // Current implementation extracts the first module name
      const result = parseIDL(nestedIDL);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].module).toBe('OuterModule');
      expect(result[0].name).toBe('TestAgent');
    });

    test('handles deeply nested modules', () => {
      const deeplyNestedIDL = `
module Level1 {
  module Level2 {
    module Level3 {
      interface DeepAgent {
        void deepMethod(in string param);
      };
    };
  };
};
`;
      const result = parseIDL(deeplyNestedIDL);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].module).toBe('Level1');
      expect(result[0].name).toBe('DeepAgent');
    });

    test('handles multiple nested modules with interfaces', () => {
      const multiNestedIDL = `
module Outer {
  module Inner1 {
    interface Agent1 {
      void method1(in string param);
    };
  };
  
  module Inner2 {
    interface Agent2 {
      void method2(in long param);
    };
  };
};
`;
      const result = parseIDL(multiNestedIDL);
      expect(result.length).toBeGreaterThan(0);
      // Should extract both interfaces
      expect(result.some(i => i.name === 'Agent1')).toBe(true);
      expect(result.some(i => i.name === 'Agent2')).toBe(true);
    });

    test('handles nested modules with structs and exceptions', () => {
      const nestedWithTypesIDL = `
module Outer {
  module Inner {
    struct NestedStruct {
      string field1;
      long field2;
    };
    
    exception NestedError {
      string message;
    };
    
    interface NestedAgent {
      void nestedMethod(in NestedStruct data) raises (NestedError);
    };
  };
};
`;
      const result = parseIDL(nestedWithTypesIDL);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('NestedAgent');
      expect(result[0].structs.length).toBeGreaterThan(0);
      expect(result[0].exceptions.length).toBeGreaterThan(0);
      expect(result[0].methods[0].raises).toContain('NestedError');
    });
  });

  describe('Additional edge cases', () => {
    test('handles interface with no methods', () => {
      const emptyInterfaceIDL = `
module TestModule {
  interface EmptyAgent {
  };
};
`;
      const result = parseIDL(emptyInterfaceIDL);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('EmptyAgent');
      expect(result[0].methods).toEqual([]);
    });

    test('handles method with no parameters', () => {
      const noParamsIDL = `
module TestModule {
  interface TestAgent {
    void noParams();
  };
};
`;
      const result = parseIDL(noParamsIDL);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].methods[0].name).toBe('noParams');
      expect(result[0].methods[0].parameters).toEqual([]);
    });

    test('handles struct with no fields', () => {
      const emptyStructIDL = `
module TestModule {
  struct EmptyStruct {
  };
  
  interface TestAgent {
    void test(in string param);
  };
};
`;
      const result = parseIDL(emptyStructIDL);
      expect(result.length).toBeGreaterThan(0);
      // Empty struct should be parsed but have no fields
      const emptyStruct = result[0].structs.find(s => s.name === 'EmptyStruct');
      expect(emptyStruct).toBeDefined();
      expect(emptyStruct?.fields).toEqual([]);
    });

    test('handles exception with no fields', () => {
      const emptyExceptionIDL = `
module TestModule {
  exception EmptyException {
  };
  
  interface TestAgent {
    void test(in string param) raises (EmptyException);
  };
};
`;
      const result = parseIDL(emptyExceptionIDL);
      expect(result.length).toBeGreaterThan(0);
      const emptyException = result[0].exceptions.find(e => e.name === 'EmptyException');
      expect(emptyException).toBeDefined();
      expect(emptyException?.fields).toEqual([]);
    });

    test('handles IDL without module declaration', () => {
      const noModuleIDL = `
interface StandaloneAgent {
  void standaloneMethod(in string param);
};
`;
      const result = parseIDL(noModuleIDL);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('StandaloneAgent');
      expect(result[0].module).toBe('Unknown');
    });
  });
});

// Requirements 8.1, 8.2, 8.3, 8.4, 8.5: Type mapping tests
describe('CORBA to TypeScript Type Mapping', () => {
  // Requirement 8.1: string → string mapping
  describe('String type mapping', () => {
    test('maps CORBA string to TypeScript string', () => {
      expect(mapCorbaType('string')).toBe('string');
    });

    test('maps CORBA char to TypeScript string', () => {
      expect(mapCorbaType('char')).toBe('string');
    });

    test('maps CORBA wchar to TypeScript string', () => {
      expect(mapCorbaType('wchar')).toBe('string');
    });

    test('preserves case for string type', () => {
      expect(mapCorbaType('String')).toBe('string');
      expect(mapCorbaType('STRING')).toBe('string');
    });
  });

  // Requirement 8.2: long → number mapping
  describe('Long type mapping', () => {
    test('maps CORBA long to TypeScript number', () => {
      expect(mapCorbaType('long')).toBe('number');
    });

    test('maps CORBA short to TypeScript number', () => {
      expect(mapCorbaType('short')).toBe('number');
    });

    test('maps CORBA unsigned long to TypeScript number', () => {
      expect(mapCorbaType('unsigned long')).toBe('number');
    });

    test('maps CORBA unsigned short to TypeScript number', () => {
      expect(mapCorbaType('unsigned short')).toBe('number');
    });

    test('maps CORBA long long to TypeScript number', () => {
      expect(mapCorbaType('long long')).toBe('number');
    });

    test('maps CORBA unsigned long long to TypeScript number', () => {
      expect(mapCorbaType('unsigned long long')).toBe('number');
    });

    test('maps CORBA octet to TypeScript number', () => {
      expect(mapCorbaType('octet')).toBe('number');
    });

    test('preserves case for long type', () => {
      expect(mapCorbaType('Long')).toBe('number');
      expect(mapCorbaType('LONG')).toBe('number');
    });
  });

  // Requirement 8.3: boolean → boolean mapping
  describe('Boolean type mapping', () => {
    test('maps CORBA boolean to TypeScript boolean', () => {
      expect(mapCorbaType('boolean')).toBe('boolean');
    });

    test('preserves case for boolean type', () => {
      expect(mapCorbaType('Boolean')).toBe('boolean');
      expect(mapCorbaType('BOOLEAN')).toBe('boolean');
    });
  });

  // Requirement 8.4: sequence → array mapping
  describe('Sequence type mapping', () => {
    test('maps CORBA sequence<string> to TypeScript string[]', () => {
      expect(mapCorbaType('sequence<string>')).toBe('string[]');
    });

    test('maps CORBA sequence<long> to TypeScript number[]', () => {
      expect(mapCorbaType('sequence<long>')).toBe('number[]');
    });

    test('maps CORBA sequence<boolean> to TypeScript boolean[]', () => {
      expect(mapCorbaType('sequence<boolean>')).toBe('boolean[]');
    });

    test('maps CORBA sequence<double> to TypeScript number[]', () => {
      expect(mapCorbaType('sequence<double>')).toBe('number[]');
    });

    test('maps nested sequences correctly', () => {
      expect(mapCorbaType('sequence<sequence<string>>')).toBe('string[][]');
    });

    test('maps sequence of custom types', () => {
      expect(mapCorbaType('sequence<CustomStruct>')).toBe('CustomStruct[]');
    });

    test('handles sequences with spaces', () => {
      expect(mapCorbaType('sequence< string >')).toBe('string[]');
      expect(mapCorbaType('sequence< long >')).toBe('number[]');
    });
  });

  // Requirement 8.5: double → number mapping
  describe('Double type mapping', () => {
    test('maps CORBA double to TypeScript number', () => {
      expect(mapCorbaType('double')).toBe('number');
    });

    test('maps CORBA float to TypeScript number', () => {
      expect(mapCorbaType('float')).toBe('number');
    });

    test('preserves case for double type', () => {
      expect(mapCorbaType('Double')).toBe('number');
      expect(mapCorbaType('DOUBLE')).toBe('number');
    });

    test('preserves case for float type', () => {
      expect(mapCorbaType('Float')).toBe('number');
      expect(mapCorbaType('FLOAT')).toBe('number');
    });
  });

  // Additional type mapping tests
  describe('Additional type mappings', () => {
    test('maps void to void', () => {
      expect(mapCorbaType('void')).toBe('void');
    });

    test('maps any to any', () => {
      expect(mapCorbaType('any')).toBe('any');
    });

    test('preserves custom type names', () => {
      expect(mapCorbaType('CustomStruct')).toBe('CustomStruct');
      expect(mapCorbaType('MyException')).toBe('MyException');
      expect(mapCorbaType('UserDefinedType')).toBe('UserDefinedType');
    });
  });

  // Integration test: Type mapping in full conversion
  describe('Type mapping in IDL conversion', () => {
    test('applies type mapping to method parameters', () => {
      const idl = `
module TestModule {
  interface TestAgent {
    void testMethod(in string str, in long num, in boolean flag);
  };
};
`;
      const interfaces = parseIDL(idl);
      const spec = idlToKiroSpec(interfaces[0]);
      
      expect(spec.methods[0].params[0].type).toBe('string');
      expect(spec.methods[0].params[1].type).toBe('number');
      expect(spec.methods[0].params[2].type).toBe('boolean');
    });

    test('applies type mapping to return types', () => {
      const idl = `
module TestModule {
  interface TestAgent {
    string getString();
    long getNumber();
    boolean getFlag();
    double getDouble();
  };
};
`;
      const interfaces = parseIDL(idl);
      const spec = idlToKiroSpec(interfaces[0]);
      
      expect(spec.methods[0].returns).toBe('string');
      expect(spec.methods[1].returns).toBe('number');
      expect(spec.methods[2].returns).toBe('boolean');
      expect(spec.methods[3].returns).toBe('number');
    });

    test('applies type mapping to struct fields', () => {
      const idl = `
module TestModule {
  struct TestStruct {
    string name;
    long age;
    boolean active;
    double score;
    sequence<string> tags;
  };
  
  interface TestAgent {
    void test(in TestStruct data);
  };
};
`;
      const interfaces = parseIDL(idl);
      const spec = idlToKiroSpec(interfaces[0]);
      
      expect(spec.types[0].fields[0].type).toBe('string');
      expect(spec.types[0].fields[1].type).toBe('number');
      expect(spec.types[0].fields[2].type).toBe('boolean');
      expect(spec.types[0].fields[3].type).toBe('number');
      expect(spec.types[0].fields[4].type).toBe('string[]');
    });

    test('applies type mapping to inputs and outputs', () => {
      const idl = `
module TestModule {
  interface TestAgent {
    long processData(in string input, in sequence<long> numbers);
  };
};
`;
      const interfaces = parseIDL(idl);
      const spec = idlToKiroSpec(interfaces[0]);
      
      // Check inputs contain mapped types
      expect(spec.inputs.some(i => i.type === 'string')).toBe(true);
      expect(spec.inputs.some(i => i.type === 'number[]')).toBe(true);
      
      // Check outputs contain mapped return type
      expect(spec.outputs.some(o => o.type === 'number')).toBe(true);
    });

    test('handles complex type mapping scenario', () => {
      const idl = `
module ComplexModule {
  struct DataPoint {
    double value;
    long timestamp;
    sequence<string> labels;
  };
  
  interface AnalyticsAgent {
    sequence<DataPoint> analyzeData(in sequence<double> values, in boolean normalize);
  };
};
`;
      const interfaces = parseIDL(idl);
      expect(interfaces.length).toBeGreaterThan(0);
      
      const spec = idlToKiroSpec(interfaces[0]);
      
      // Check struct field types are mapped
      expect(spec.types.length).toBeGreaterThan(0);
      expect(spec.types[0].fields[0].type).toBe('number'); // double -> number
      expect(spec.types[0].fields[1].type).toBe('number'); // long -> number
      expect(spec.types[0].fields[2].type).toBe('string[]'); // sequence<string> -> string[]
      
      // Check method exists and has parameters
      expect(spec.methods.length).toBeGreaterThan(0);
      expect(spec.methods[0].params.length).toBe(2);
      
      // Check method parameter types are mapped
      expect(spec.methods[0].params[0].type).toBe('number[]'); // sequence<double> -> number[]
      expect(spec.methods[0].params[1].type).toBe('boolean');
      
      // Check return type is mapped
      expect(spec.methods[0].returns).toBe('DataPoint[]'); // sequence<DataPoint> -> DataPoint[]
    });
  });
});

// Requirements 7.1: Demo examples existence
describe('Demo Examples', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');

  test('at least three demo IDL files exist', () => {
    const demoDir = path.join(process.cwd(), 'demo', 'corba-idl');
    
    // Check if directory exists
    expect(fs.existsSync(demoDir)).toBe(true);
    
    // Get all .idl files in the directory
    const files = fs.readdirSync(demoDir).filter((file: string) => file.endsWith('.idl'));
    
    // Verify at least three examples exist
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  test('demo files are accessible and contain valid IDL', () => {
    const demoDir = path.join(process.cwd(), 'demo', 'corba-idl');
    const expectedFiles = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
    
    expectedFiles.forEach(filename => {
      const filePath = path.join(demoDir, filename);
      
      // Verify file exists
      expect(fs.existsSync(filePath)).toBe(true);
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Verify content is not empty
      expect(content.length).toBeGreaterThan(0);
      
      // Verify content contains IDL keywords
      expect(content).toMatch(/module\s+\w+/);
      expect(content).toMatch(/interface\s+\w+/);
    });
  });

  test('demo files can be parsed successfully', () => {
    const demoDir = path.join(process.cwd(), 'demo', 'corba-idl');
    const expectedFiles = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
    
    expectedFiles.forEach(filename => {
      const filePath = path.join(demoDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse the IDL
      const interfaces = parseIDL(content);
      
      // Verify parsing succeeded
      expect(interfaces.length).toBeGreaterThan(0);
      
      // Verify each interface has required properties
      interfaces.forEach(iface => {
        expect(iface.name).toBeDefined();
        expect(iface.module).toBeDefined();
        expect(Array.isArray(iface.methods)).toBe(true);
      });
    });
  });

  test('demo files can be converted to Kiro specs', () => {
    const demoDir = path.join(process.cwd(), 'demo', 'corba-idl');
    const expectedFiles = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
    
    expectedFiles.forEach(filename => {
      const filePath = path.join(demoDir, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Full resurrection
      const { specs, yaml } = resurrectIDL(content);
      
      // Verify conversion succeeded
      expect(specs.length).toBeGreaterThan(0);
      expect(yaml.length).toBeGreaterThan(0);
      
      // Verify YAML contains expected structure
      yaml.forEach(yamlContent => {
        expect(yamlContent).toContain('agent:');
        expect(yamlContent).toContain('module:');
        expect(yamlContent).toContain('methods:');
      });
    });
  });
});
