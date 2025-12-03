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
  
  // Extract structs
  const structs: IDLStruct[] = [];
  const structRegex = /struct\s+(\w+)\s*\{([^}]+)\}/g;
  let structMatch;
  while ((structMatch = structRegex.exec(cleaned)) !== null) {
    const structName = structMatch[1];
    const structBody = structMatch[2];
    const fields = structBody
      .split(';')
      .map(f => f.trim())
      .filter(f => f)
      .map(f => {
        const parts = f.trim().split(/\s+/);
        return { type: parts[0], name: parts[1] };
      });
    structs.push({ name: structName, fields });
  }
  
  // Extract exceptions
  const exceptions: IDLException[] = [];
  const exceptionRegex = /exception\s+(\w+)\s*\{([^}]+)\}/g;
  let exceptionMatch;
  while ((exceptionMatch = exceptionRegex.exec(cleaned)) !== null) {
    const exceptionName = exceptionMatch[1];
    const exceptionBody = exceptionMatch[2];
    const fields = exceptionBody
      .split(';')
      .map(f => f.trim())
      .filter(f => f)
      .map(f => {
        const parts = f.trim().split(/\s+/);
        return { type: parts[0], name: parts[1] };
      });
    exceptions.push({ name: exceptionName, fields });
  }
  
  // Extract interfaces
  const interfaceRegex = /interface\s+(\w+)\s*\{([^}]+)\}/g;
  let interfaceMatch;
  while ((interfaceMatch = interfaceRegex.exec(cleaned)) !== null) {
    const interfaceName = interfaceMatch[1];
    const interfaceBody = interfaceMatch[2];
    
    // Parse methods
    const methods: IDLMethod[] = [];
    const methodRegex = /(\w+)\s+(\w+)\s*\(([^)]*)\)(?:\s*raises\s*\(([^)]+)\))?/g;
    let methodMatch;
    while ((methodMatch = methodRegex.exec(interfaceBody)) !== null) {
      const returnType = methodMatch[1];
      const methodName = methodMatch[2];
      const paramsStr = methodMatch[3];
      const raisesStr = methodMatch[4];
      
      // Parse parameters
      const parameters: IDLParameter[] = [];
      if (paramsStr.trim()) {
        const paramParts = paramsStr.split(',');
        for (const param of paramParts) {
          const parts = param.trim().split(/\s+/);
          if (parts.length >= 3) {
            parameters.push({
              direction: parts[0] as 'in' | 'out' | 'inout',
              type: parts[1],
              name: parts[2]
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
 * Convert IDL interface to Kiro YAML spec
 */
export function idlToKiroSpec(idlInterface: IDLInterface): KiroSpec {
  // Collect all input/output types from methods
  const inputs = new Set<string>();
  const outputs = new Set<string>();
  
  idlInterface.methods.forEach(method => {
    method.parameters.forEach(param => {
      if (param.direction === 'in' || param.direction === 'inout') {
        inputs.add(param.type);
      }
      if (param.direction === 'out' || param.direction === 'inout') {
        outputs.add(param.type);
      }
    });
    if (method.returnType !== 'void') {
      outputs.add(method.returnType);
    }
  });
  
  return {
    agent: idlInterface.name,
    module: idlInterface.module,
    inputs: Array.from(inputs).map(type => ({ name: type.toLowerCase(), type })),
    outputs: Array.from(outputs).map(type => ({ name: type.toLowerCase(), type })),
    methods: idlInterface.methods.map(method => ({
      name: method.name,
      params: method.parameters.map(p => ({ name: p.name, type: p.type })),
      returns: method.returnType,
      errors: method.raises
    })),
    types: idlInterface.structs.map(struct => ({
      name: struct.name,
      fields: struct.fields
    }))
  };
}

/**
 * Convert Kiro spec to YAML string
 */
export function specToYAML(spec: KiroSpec): string {
  let yaml = `# Resurrected from CORBA IDL\n`;
  yaml += `# Module: ${spec.module}\n\n`;
  yaml += `agent: ${spec.agent}\n`;
  yaml += `module: ${spec.module}\n\n`;
  
  if (spec.inputs.length > 0) {
    yaml += `inputs:\n`;
    spec.inputs.forEach(input => {
      yaml += `  - name: ${input.name}\n`;
      yaml += `    type: ${input.type}\n`;
    });
    yaml += `\n`;
  }
  
  if (spec.outputs.length > 0) {
    yaml += `outputs:\n`;
    spec.outputs.forEach(output => {
      yaml += `  - name: ${output.name}\n`;
      yaml += `    type: ${output.type}\n`;
    });
    yaml += `\n`;
  }
  
  yaml += `methods:\n`;
  spec.methods.forEach(method => {
    yaml += `  - name: ${method.name}\n`;
    yaml += `    params:\n`;
    method.params.forEach(param => {
      yaml += `      - name: ${param.name}\n`;
      yaml += `        type: ${param.type}\n`;
    });
    yaml += `    returns: ${method.returns}\n`;
    if (method.errors.length > 0) {
      yaml += `    errors:\n`;
      method.errors.forEach(error => {
        yaml += `      - ${error}\n`;
      });
    }
  });
  
  if (spec.types.length > 0) {
    yaml += `\ntypes:\n`;
    spec.types.forEach(type => {
      yaml += `  - name: ${type.name}\n`;
      yaml += `    fields:\n`;
      type.fields.forEach(field => {
        yaml += `      - name: ${field.name}\n`;
        yaml += `        type: ${field.type}\n`;
      });
    });
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
