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

