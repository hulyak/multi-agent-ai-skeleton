# Design Document

## Overview

The IDL Resurrection System is a parser and converter that transforms legacy CORBA IDL (Interface Definition Language) files into modern Kiro agent specifications. The system demonstrates the concept of "resurrecting" dead 1990s distributed computing technology by converting verbose CORBA interface definitions into concise, modern YAML specifications that can power live AI agents in the Kiro framework.

The system consists of three main components:
1. **IDL Parser**: Extracts structured data from CORBA IDL syntax
2. **Spec Converter**: Transforms parsed IDL into Kiro YAML format
3. **Resurrection UI**: Provides visual demonstration of the conversion process

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Resurrection UI                          │
│  (React Component with Animation States)                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ IDL Content
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Resurrection Engine                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ IDL Parser   │→ │  Converter   │→ │ YAML         │     │
│  │              │  │              │  │ Generator    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                 │
                 │ Kiro YAML Specs
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Output Display                           │
│  - Syntax Highlighted YAML                                  │
│  - Download Options                                         │
│  - Agent List                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User uploads IDL file or selects demo
2. IDL Parser extracts interfaces, methods, structs, exceptions
3. Converter maps IDL types to TypeScript equivalents
4. Converter generates Kiro spec objects
5. YAML Generator formats specs as YAML strings
6. UI displays results with animations
7. User can download generated specs

## Components and Interfaces

### IDL Parser

**Purpose**: Parse CORBA IDL syntax and extract structured interface definitions

**Interface**:
```typescript
interface IDLParser {
  parseIDL(idlContent: string): IDLInterface[];
}

interface IDLInterface {
  name: string;
  module: string;
  methods: IDLMethod[];
  structs: IDLStruct[];
  exceptions: IDLException[];
}

interface IDLMethod {
  name: string;
  returnType: string;
  parameters: IDLParameter[];
  raises: string[];
}

interface IDLParameter {
  direction: 'in' | 'out' | 'inout';
  name: string;
  type: string;
}

interface IDLStruct {
  name: string;
  fields: { name: string; type: string }[];
}

interface IDLException {
  name: string;
  fields: { name: string; type: string }[];
}
```

**Responsibilities**:
- Remove comments from IDL content
- Extract module declarations
- Parse interface blocks
- Extract method signatures with parameters and return types
- Parse struct definitions
- Parse exception definitions
- Associate raises clauses with methods

### Spec Converter

**Purpose**: Transform parsed IDL interfaces into Kiro specification format

**Interface**:
```typescript
interface SpecConverter {
  idlToKiroSpec(idlInterface: IDLInterface): KiroSpec;
  mapCorbaType(corbaType: string): string;
}

interface KiroSpec {
  agent: string;
  module: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  methods: {
    name: string;
    params: { name: string; type: string }[];
    returns: string;
    errors: string[];
  }[];
  types: {
    name: string;
    fields: { name: string; type: string }[];
  }[];
}
```

**Responsibilities**:
- Map interface names to agent names
- Categorize parameters as inputs/outputs based on direction
- Convert method signatures to Kiro method format
- Map CORBA types to TypeScript equivalents
- Include struct definitions as type definitions
- Preserve exception information in error arrays

### YAML Generator

**Purpose**: Format Kiro specs as valid YAML strings

**Interface**:
```typescript
interface YAMLGenerator {
  specToYAML(spec: KiroSpec): string;
}
```

**Responsibilities**:
- Generate properly indented YAML
- Include comments with module information
- Format arrays and nested objects correctly
- Ensure valid YAML syntax

### Resurrection UI

**Purpose**: Provide visual demonstration of IDL resurrection process

**Interface**:
```typescript
interface ResurrectionUI {
  state: ResurrectionState;
  handleFileUpload(file: File): void;
  loadDemoIDL(filename: string): void;
  downloadSpec(spec: string, filename: string): void;
}

interface ResurrectionState {
  status: 'idle' | 'parsing' | 'converting' | 'complete';
  idlContent: string;
  yamlSpecs: string[];
  agentNames: string[];
}
```

**Responsibilities**:
- Handle file uploads
- Load demo IDL files
- Animate resurrection process
- Display before/after comparison
- Provide download functionality
- Show list of resurrected agents

## Data Models

### Type Mapping

CORBA types map to TypeScript types as follows:

| CORBA Type | TypeScript Type |
|------------|----------------|
| string     | string         |
| long       | number         |
| short      | number         |
| double     | number         |
| float      | number         |
| boolean    | boolean        |
| sequence<T>| T[]            |
| void       | void           |

### IDL Syntax Patterns

The parser recognizes these IDL patterns:

1. **Module Declaration**: `module ModuleName { ... }`
2. **Interface Declaration**: `interface InterfaceName { ... }`
3. **Method Signature**: `returnType methodName(in Type param) raises (Exception);`
4. **Struct Definition**: `struct StructName { Type field; ... };`
5. **Exception Definition**: `exception ExceptionName { Type field; ... };`
6. **Comments**: `// line comment` and `/* block comment */`

### Kiro Spec Structure

Generated Kiro specs follow this structure:

```yaml
# Resurrected from CORBA IDL
# Module: ModuleName

agent: AgentName
module: ModuleName

inputs:
  - name: inputType
    type: TypeName

outputs:
  - name: outputType
    type: TypeName

methods:
  - name: methodName
    params:
      - name: paramName
        type: ParamType
    returns: ReturnType
    errors:
      - ExceptionName

types:
  - name: StructName
    fields:
      - name: fieldName
        type: FieldType
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Module extraction completeness

*For any* valid IDL content containing module declarations, parsing the content should extract all module names present in the IDL.
**Validates: Requirements 1.1**

### Property 2: Interface extraction completeness

*For any* valid IDL interface definition, parsing should extract the interface name, all method signatures, all parameters with their types, and all return types.
**Validates: Requirements 1.2**

### Property 3: Struct extraction completeness

*For any* valid IDL struct definition, parsing should extract the struct name and all field definitions with their types.
**Validates: Requirements 1.3**

### Property 4: Exception extraction completeness

*For any* valid IDL exception definition, parsing should extract the exception name and all field definitions with their types.
**Validates: Requirements 1.4**

### Property 5: Method-exception association preservation

*For any* IDL method with a raises clause, parsing should correctly associate all listed exception names with that method.
**Validates: Requirements 1.5**

### Property 6: Agent name mapping consistency

*For any* parsed IDL interface, converting to a Kiro spec should produce an agent name that exactly matches the interface name.
**Validates: Requirements 2.1**

### Property 7: Parameter direction categorization

*For any* IDL method with parameters, converting to Kiro spec should categorize all 'in' and 'inout' parameters as inputs, and all 'out', 'inout', and non-void return types as outputs.
**Validates: Requirements 2.2**

### Property 8: Method conversion completeness

*For any* IDL method, converting to Kiro spec should produce a method definition containing the parameter list, return type, and all exceptions from the raises clause.
**Validates: Requirements 2.3**

### Property 9: Struct preservation in conversion

*For any* IDL interface containing struct definitions, converting to Kiro spec should include all structs in the type definitions section.
**Validates: Requirements 2.4**

### Property 10: YAML round-trip validity

*For any* Kiro spec, converting to YAML and then parsing the YAML back should produce an equivalent spec structure.
**Validates: Requirements 2.5**

### Property 11: Error handling for malformed IDL

*For any* IDL content with syntax errors, parsing should return an error result rather than throwing an exception or crashing.
**Validates: Requirements 3.1**

### Property 12: Partial parsing resilience

*For any* IDL content containing both valid and malformed interface definitions, parsing should successfully extract all valid interfaces while skipping malformed ones.
**Validates: Requirements 3.2**

### Property 13: Graceful handling of unsupported features

*For any* IDL content containing unsupported features mixed with supported features, parsing should successfully extract all supported features.
**Validates: Requirements 3.4**

### Property 14: Required field validation

*For any* Kiro spec missing required fields (agent, module, or methods), validation should fail and report all missing required fields.
**Validates: Requirements 4.1, 4.4**

### Property 15: Method structure validation

*For any* Kiro spec with method definitions, validation should verify each method has a name, params array, and returns field, reporting any violations.
**Validates: Requirements 4.2**

### Property 16: Type structure validation

*For any* Kiro spec with type definitions, validation should verify each type has a name and fields array, reporting any violations.
**Validates: Requirements 4.3**

### Property 17: Type mismatch detection

*For any* Kiro spec with fields of incorrect types, validation should detect and report all type mismatches with descriptions.
**Validates: Requirements 4.5**

### Property 18: Download filename generation

*For any* agent name, generating a download filename should produce a string ending with '.yaml' and containing the agent name.
**Validates: Requirements 6.2**

### Property 19: Downloaded YAML validity

*For any* generated Kiro YAML string, the content should be parseable by standard YAML parsers without errors.
**Validates: Requirements 6.5**

## Error Handling

### Error Categories

1. **Parse Errors**: Malformed IDL syntax, incomplete definitions
2. **Validation Errors**: Missing required fields, invalid types
3. **Conversion Errors**: Unsupported IDL features, type mapping failures
4. **File Errors**: Invalid file format, read failures

### Error Handling Strategy

**Parse Errors**:
- Return structured error objects with line numbers and descriptions
- Continue parsing when possible (skip malformed sections)
- Never throw exceptions that crash the application

**Validation Errors**:
- Collect all validation errors before returning
- Provide clear descriptions of what's wrong and where
- Include suggestions for fixes when possible

**Conversion Errors**:
- Log warnings for unsupported features
- Use fallback type mappings when exact mapping unavailable
- Document which features were skipped

**File Errors**:
- Display user-friendly error messages in UI
- Suggest valid file formats
- Provide example files for reference

### Error Response Format

```typescript
interface ResurrectionError {
  type: 'parse' | 'validation' | 'conversion' | 'file';
  message: string;
  location?: { line: number; column: number };
  suggestions?: string[];
}

interface ResurrectionResult {
  success: boolean;
  specs: KiroSpec[];
  yaml: string[];
  errors: ResurrectionError[];
  warnings: string[];
}
```

## Testing Strategy

### Property-Based Testing

We will use **fast-check** for property-based testing with a minimum of 100 iterations per test.

Each property-based test will:
- Generate random IDL content or Kiro specs
- Execute the parsing/conversion/validation logic
- Verify the correctness property holds
- Be tagged with the format: `**Feature: idl-resurrection, Property {number}: {property_text}**`

**Key Property Tests**:

1. **Parsing Properties** (Properties 1-5, 11-13):
   - Generate random valid IDL with various combinations of modules, interfaces, structs, exceptions
   - Generate malformed IDL to test error handling
   - Verify extraction completeness and error resilience

2. **Conversion Properties** (Properties 6-10):
   - Generate random parsed IDL interfaces
   - Verify correct mapping to Kiro specs
   - Test YAML round-trip (generate spec → YAML → parse → verify equivalence)

3. **Validation Properties** (Properties 14-17):
   - Generate random Kiro specs with missing or invalid fields
   - Verify validation catches all errors
   - Verify error messages are descriptive

4. **Output Properties** (Properties 18-19):
   - Generate random agent names
   - Verify filename generation
   - Verify YAML validity

**Generators**:

```typescript
// Generate random IDL modules
const arbModule = fc.record({
  name: fc.string({ minLength: 1 }),
  interfaces: fc.array(arbInterface),
  structs: fc.array(arbStruct),
  exceptions: fc.array(arbException)
});

// Generate random IDL interfaces
const arbInterface = fc.record({
  name: fc.string({ minLength: 1 }),
  methods: fc.array(arbMethod)
});

// Generate random IDL methods
const arbMethod = fc.record({
  name: fc.string({ minLength: 1 }),
  returnType: fc.oneof(fc.constant('void'), arbType),
  parameters: fc.array(arbParameter),
  raises: fc.array(fc.string())
});

// Generate random parameters
const arbParameter = fc.record({
  direction: fc.constantFrom('in', 'out', 'inout'),
  name: fc.string({ minLength: 1 }),
  type: arbType
});

// Generate random CORBA types
const arbType = fc.oneof(
  fc.constant('string'),
  fc.constant('long'),
  fc.constant('boolean'),
  fc.constant('double'),
  fc.string({ minLength: 1 }) // custom types
);
```

### Unit Testing

Unit tests will cover specific examples and edge cases:

1. **Type Mapping Examples** (Requirements 8.1-8.5):
   - Test each CORBA type maps to correct TypeScript type
   - Test sequence types map to arrays
   - Test custom types are preserved

2. **Edge Cases**:
   - Empty IDL content (Requirement 3.3)
   - Nested modules (Requirement 3.5)
   - Three example IDL files exist (Requirement 7.1)
   - Download button triggers file generation (Requirement 6.1)

3. **Integration Tests**:
   - Load demo IDL files and verify complete resurrection
   - Test with actual RouterAgent.idl, SupportAgent.idl, ResearchAgent.idl
   - Verify generated YAML matches expected structure

### Test Organization

```
src/utils/__tests__/
  ├── idl-parser.property.test.ts      # Properties 1-5, 11-13
  ├── spec-converter.property.test.ts  # Properties 6-10
  ├── spec-validator.property.test.ts  # Properties 14-17
  ├── yaml-generator.property.test.ts  # Properties 18-19
  ├── idl-parser.test.ts              # Unit tests for edge cases
  └── type-mapping.test.ts            # Unit tests for Requirements 8.1-8.5
```

## Performance Considerations

### Parsing Performance

- IDL files are typically small (< 1000 lines)
- Regex-based parsing is sufficient for this scale
- No need for complex AST generation

### UI Responsiveness

- Use setTimeout to break parsing into chunks
- Animate state transitions to provide feedback
- Keep UI responsive during processing

### Memory Usage

- Process one IDL file at a time
- Clear previous results when loading new file
- No persistent storage of large data structures

## Security Considerations

### Input Validation

- Sanitize IDL content before parsing
- Limit file size to prevent DoS
- Validate file extensions

### XSS Prevention

- Escape all user-provided content in UI
- Use React's built-in XSS protection
- Don't use dangerouslySetInnerHTML with user content

### Download Safety

- Generate downloads client-side only
- No server-side file storage
- Use blob URLs that expire after download

## Future Enhancements

1. **Advanced IDL Features**:
   - Support for IDL inheritance
   - Support for IDL unions and enums
   - Support for IDL constants and typedefs

2. **Code Generation**:
   - Generate TypeScript agent stubs from specs
   - Generate test templates
   - Generate documentation

3. **Batch Processing**:
   - Upload multiple IDL files at once
   - Generate combined spec packages
   - Export as zip archive

4. **Spec Validation**:
   - Validate against Kiro schema
   - Check for naming conflicts
   - Suggest improvements

5. **IDE Integration**:
   - VS Code extension for IDL resurrection
   - Syntax highlighting for IDL
   - Auto-completion for Kiro specs
