/**
 * CORBA IDL Parser - Resurrects dead IDL into living Kiro specs
 * Parses CORBA IDL files and converts them to Kiro YAML format
 */

export interface IDLInterface {
  name: string;
  module: string;
  methods: IDLMethod[];
  structs: IDLStruct[];
  exceptions: IDLException[];
}

export interface IDLMethod {
  name: string;
  returnType: string;
  parameters: IDLParameter[];
  raises: string[];
}

export interface IDLParameter {
  direction: 'in' | 'out' | 'inout';
  name: string;
  type: string;
}

export interface IDLStruct {
  name: string;
  fields: { name: string; type: string }[];
}

export interface IDLException {
  name: string;
  fields: { name: string; type: string }[];
}

export interface KiroSpec {
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

/**
 * Parse CORBA IDL file content
 */
export function parseIDL(idlContent: string): IDLInterface[] {
  const interfaces: IDLInterface[] = [];
  
  // Remove comments
  const cleaned = idlContent
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Extract module name
  const moduleMatch = cleaned.match(/module\s+(\w+)\s*\{/);
  const moduleName = moduleMatch ? moduleMatch[1] : 'Unknown';
  
  // Extract structs - deduplicate by name
  const structMap = new Map<string, IDLStruct>();
  const structRegex = /struct\s+(\w+)\s*\{([^}]+)\}/g;
  let structMatch;
  while ((structMatch = structRegex.exec(cleaned)) !== null) {
    const structName = structMatch[1];
    const structBody = structMatch[2];
    const fields = structBody
      .split(';')
      .map(f => f.trim())
      .filter(f => f && f.length > 0)
      .map(f => {
        const parts = f.trim().split(/\s+/);
        if (parts.length >= 2) {
          return { type: parts[0], name: parts[1] };
        }
        return null;
      })
      .filter((f): f is { type: string; name: string } => f !== null);
    structMap.set(structName, { name: structName, fields });
  }
  const structs = Array.from(structMap.values());
  
  // Extract exceptions - deduplicate by name
  const exceptionMap = new Map<string, IDLException>();
  const exceptionRegex = /exception\s+(\w+)\s*\{([^}]+)\}/g;
  let exceptionMatch;
  while ((exceptionMatch = exceptionRegex.exec(cleaned)) !== null) {
    const exceptionName = exceptionMatch[1];
    const exceptionBody = exceptionMatch[2];
    const fields = exceptionBody
      .split(';')
      .map(f => f.trim())
      .filter(f => f && f.length > 0)
      .map(f => {
        const parts = f.trim().split(/\s+/);
        if (parts.length >= 2) {
          return { type: parts[0], name: parts[1] };
        }
        return null;
      })
      .filter((f): f is { type: string; name: string } => f !== null);
    exceptionMap.set(exceptionName, { name: exceptionName, fields });
  }
  const exceptions = Array.from(exceptionMap.values());
  
  // Extract interfaces
  const interfaceRegex = /interface\s+(\w+)\s*\{([^}]+)\}/g;
  let interfaceMatch;
  while ((interfaceMatch = interfaceRegex.exec(cleaned)) !== null) {
    const interfaceName = interfaceMatch[1];
    const interfaceBody = interfaceMatch[2];
    
    // Parse methods
    const methods: IDLMethod[] = [];
    // Updated regex to handle complex types including sequence<T>
    const methodRegex = /([\w<>]+)\s+(\w+)\s*\(([^)]*)\)(?:\s*raises\s*\(([^)]+)\))?/g;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(interfaceBody)) !== null) {
      const returnType = methodMatch[1];
      const methodName = methodMatch[2];
      const paramsStr = methodMatch[3];
      const raisesStr = methodMatch[4];
      
      // Parse parameters - handle complex types like sequence<T>
      const parameters: IDLParameter[] = [];
      if (paramsStr.trim()) {
        // Split by comma, but be careful with angle brackets
        const paramParts: string[] = [];
        let current = '';
        let depth = 0;
        
        for (let i = 0; i < paramsStr.length; i++) {
          const char = paramsStr[i];
          if (char === '<') depth++;
          if (char === '>') depth--;
          if (char === ',' && depth === 0) {
            paramParts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        if (current.trim()) {
          paramParts.push(current.trim());
        }
        
        for (const param of paramParts) {
          // Match: direction type name
          // Handle types with angle brackets like sequence<double>
          const paramMatch = param.trim().match(/^(in|out|inout)\s+([\w<>]+)\s+(\w+)$/);
          if (paramMatch) {
            parameters.push({
              direction: paramMatch[1] as 'in' | 'out' | 'inout',
              type: paramMatch[2],
              name: paramMatch[3]
            });
          }
        }
      }
      
      // Parse raises
      const raises: string[] = [];
      if (raisesStr) {
        raises.push(...raisesStr.split(',').map(r => r.trim()));
      }
      
      methods.push({
        name: methodName,
        returnType,
        parameters,
        raises
      });
    }
    
    interfaces.push({
      name: interfaceName,
      module: moduleName,
      methods,
      structs,
      exceptions
    });
  }
  
  return interfaces;
}

/**
 * Map CORBA types to TypeScript types
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export function mapCorbaType(corbaType: string): string {
  // Handle sequence types (e.g., "sequence<string>" -> "string[]")
  const sequenceMatch = corbaType.match(/sequence<(.+)>/);
  if (sequenceMatch) {
    const innerType = mapCorbaType(sequenceMatch[1].trim());
    return `${innerType}[]`;
  }
  
  // Map primitive CORBA types to TypeScript types
  const typeMap: Record<string, string> = {
    // Requirement 8.1: string -> string
    'string': 'string',
    
    // Requirement 8.2: long -> number
    'long': 'number',
    'short': 'number',
    'unsigned long': 'number',
    'unsigned short': 'number',
    'long long': 'number',
    'unsigned long long': 'number',
    
    // Requirement 8.3: boolean -> boolean
    'boolean': 'boolean',
    
    // Requirement 8.5: double -> number
    'double': 'number',
    'float': 'number',
    
    // Additional common types
    'void': 'void',
    'char': 'string',
    'wchar': 'string',
    'octet': 'number',
    'any': 'any',
  };
  
  // Return mapped type or original type (for custom types like structs)
  return typeMap[corbaType.toLowerCase()] || corbaType;
}

/**
 * Convert IDL interface to Kiro YAML spec
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
export function idlToKiroSpec(idlInterface: IDLInterface): KiroSpec {
  // Collect all input/output types from methods
  const inputs = new Set<string>();
  const outputs = new Set<string>();
  
  // Requirement 2.2: Categorize parameters by direction
  idlInterface.methods.forEach(method => {
    method.parameters.forEach(param => {
      const mappedType = mapCorbaType(param.type);
      if (param.direction === 'in' || param.direction === 'inout') {
        inputs.add(mappedType);
      }
      if (param.direction === 'out' || param.direction === 'inout') {
        outputs.add(mappedType);
      }
    });
    // Add return types to outputs (except void)
    if (method.returnType !== 'void') {
      const mappedReturnType = mapCorbaType(method.returnType);
      outputs.add(mappedReturnType);
    }
  });
  
  // Requirement 2.1: Agent name matches interface name
  // Requirement 2.3: Preserve all method components
  // Requirement 2.4: Include struct definitions
  return {
    agent: idlInterface.name,
    module: idlInterface.module,
    inputs: Array.from(inputs).map(type => ({ 
      name: type.toLowerCase().replace('[]', 'Array'), 
      type 
    })),
    outputs: Array.from(outputs).map(type => ({ 
      name: type.toLowerCase().replace('[]', 'Array'), 
      type 
    })),
    methods: idlInterface.methods.map(method => ({
      name: method.name,
      params: method.parameters.map(p => ({ 
        name: p.name, 
        type: mapCorbaType(p.type) 
      })),
      returns: mapCorbaType(method.returnType),
      errors: method.raises
    })),
    types: idlInterface.structs.map(struct => ({
      name: struct.name,
      fields: struct.fields.map(field => ({
        name: field.name,
        type: mapCorbaType(field.type)
      }))
    }))
  };
}

/**
 * Escape special YAML characters in strings
 * Requirements: 2.5
 */
function escapeYAMLString(str: string): string {
  // Check if string needs quoting (contains special chars or starts with special chars)
  const needsQuoting = /[:#\[\]{}|>*&!%@`]|^\s|^\d/.test(str);
  
  if (needsQuoting) {
    // Escape quotes and wrap in quotes
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  
  return str;
}

/**
 * Validate YAML structure after generation
 * Requirements: 2.5, 6.5
 */
export function validateYAML(yamlString: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for basic YAML syntax issues
  const lines = yamlString.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }
    
    // Check indentation (must be multiples of 2)
    const indent = line.search(/\S/);
    if (indent % 2 !== 0) {
      errors.push(`Line ${i + 1}: Invalid indentation (must be multiples of 2 spaces)`);
    }
    
    // Check for tabs (YAML doesn't allow tabs for indentation)
    if (line.includes('\t')) {
      errors.push(`Line ${i + 1}: Tabs not allowed in YAML (use spaces)`);
    }
    
    // Check for proper key-value format
    if (line.includes(':') && !line.trim().startsWith('-')) {
      const colonIndex = line.indexOf(':');
      const afterColon = line.substring(colonIndex + 1).trim();
      
      // If there's content after colon, ensure proper spacing
      if (afterColon && line[colonIndex + 1] !== ' ') {
        errors.push(`Line ${i + 1}: Missing space after colon`);
      }
    }
  }
  
  // Check for required top-level keys
  if (!yamlString.includes('agent:')) {
    errors.push('Missing required field: agent');
  }
  if (!yamlString.includes('module:')) {
    errors.push('Missing required field: module');
  }
  if (!yamlString.includes('methods:')) {
    errors.push('Missing required field: methods');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert Kiro spec to YAML string with improved formatting and validation
 * Requirements: 2.5, 6.5
 */
export function specToYAML(spec: KiroSpec): string {
  const lines: string[] = [];
  
  // Header comments
  lines.push('# Resurrected from CORBA IDL');
  lines.push(`# Module: ${spec.module}`);
  lines.push('');
  
  // Top-level fields with proper escaping
  lines.push(`agent: ${escapeYAMLString(spec.agent)}`);
  lines.push(`module: ${escapeYAMLString(spec.module)}`);
  lines.push('');
  
  // Inputs section (optional)
  if (spec.inputs.length > 0) {
    lines.push('inputs:');
    spec.inputs.forEach(input => {
      lines.push(`  - name: ${escapeYAMLString(input.name)}`);
      lines.push(`    type: ${escapeYAMLString(input.type)}`);
    });
    lines.push('');
  }
  
  // Outputs section (optional)
  if (spec.outputs.length > 0) {
    lines.push('outputs:');
    spec.outputs.forEach(output => {
      lines.push(`  - name: ${escapeYAMLString(output.name)}`);
      lines.push(`    type: ${escapeYAMLString(output.type)}`);
    });
    lines.push('');
  }
  
  // Methods section (required)
  lines.push('methods:');
  spec.methods.forEach((method, methodIndex) => {
    lines.push(`  - name: ${escapeYAMLString(method.name)}`);
    
    // Parameters
    if (method.params.length > 0) {
      lines.push('    params:');
      method.params.forEach(param => {
        lines.push(`      - name: ${escapeYAMLString(param.name)}`);
        lines.push(`        type: ${escapeYAMLString(param.type)}`);
      });
    } else {
      lines.push('    params: []');
    }
    
    // Return type
    lines.push(`    returns: ${escapeYAMLString(method.returns)}`);
    
    // Errors (optional)
    if (method.errors.length > 0) {
      lines.push('    errors:');
      method.errors.forEach(error => {
        lines.push(`      - ${escapeYAMLString(error)}`);
      });
    }
    
    // Add blank line between methods (except after last method)
    if (methodIndex < spec.methods.length - 1) {
      lines.push('');
    }
  });
  
  // Types section (optional)
  if (spec.types.length > 0) {
    lines.push('');
    lines.push('types:');
    spec.types.forEach((type, typeIndex) => {
      lines.push(`  - name: ${escapeYAMLString(type.name)}`);
      
      if (type.fields.length > 0) {
        lines.push('    fields:');
        type.fields.forEach(field => {
          lines.push(`      - name: ${escapeYAMLString(field.name)}`);
          lines.push(`        type: ${escapeYAMLString(field.type)}`);
        });
      } else {
        lines.push('    fields: []');
      }
      
      // Add blank line between types (except after last type)
      if (typeIndex < spec.types.length - 1) {
        lines.push('');
      }
    });
  }
  
  // Join lines and ensure single trailing newline
  const yaml = lines.join('\n') + '\n';
  
  // Validate the generated YAML
  const validation = validateYAML(yaml);
  if (!validation.valid) {
    console.warn('Generated YAML has validation warnings:', validation.errors);
  }
  
  return yaml;
}

/**
 * Main resurrection function: IDL → Kiro YAML
 */
export function resurrectIDL(idlContent: string): { specs: KiroSpec[]; yaml: string[] } {
  const interfaces = parseIDL(idlContent);
  const specs = interfaces.map(idlToKiroSpec);
  const yaml = specs.map(specToYAML);
  
  return { specs, yaml };
}
