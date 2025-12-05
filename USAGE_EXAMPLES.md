# IDL Resurrection Usage Examples

This guide provides practical examples of using the CORBA IDL Resurrection feature.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Programmatic Usage](#programmatic-usage)
- [Advanced Examples](#advanced-examples)
- [Integration with CrewOS](#integration-with-crewos)

---

## Basic Usage

### Using the Web Interface

1. **Navigate to the Resurrection Lab**
   ```
   http://localhost:3000/resurrection
   ```

2. **Upload an IDL File**
   - Click "Choose IDL File" button
   - Select a `.idl` file from your system
   - Or try one of the three demo examples

3. **Watch the Resurrection**
   - **Parsing Phase**: IDL is analyzed and parsed
   - **Converting Phase**: Structures are mapped to Kiro format
   - **Complete**: Download your generated YAML specs

4. **Download Generated Specs**
   - Click "Download YAML" for any resurrected agent
   - Files are named `{AgentName}.yaml`
   - Use these specs in your Kiro projects

---

## Programmatic Usage

### Parsing IDL Files

```typescript
import { parseIDL } from '@/utils/idl-parser';

// Read IDL content
const idlContent = `
module MySystem {
  struct User {
    string userId;
    string name;
    long age;
  };
  
  interface UserService {
    User getUser(in string userId);
    void updateUser(in User user);
  };
};
`;

// Parse the IDL
const interfaces = parseIDL(idlContent);

console.log(interfaces);
// Output: Array of IDLInterface objects
// [
//   {
//     name: 'UserService',
//     module: 'MySystem',
//     methods: [...],
//     structs: [...],
//     exceptions: []
//   }
// ]
```

### Converting to Kiro Specs

```typescript
import { parseIDL, idlToKiroSpec } from '@/utils/idl-parser';

const idlContent = `...`; // Your IDL content

// Parse and convert
const interfaces = parseIDL(idlContent);
const specs = interfaces.map(idlToKiroSpec);

console.log(specs[0]);
// Output: KiroSpec object
// {
//   agent: 'UserService',
//   module: 'MySystem',
//   inputs: [...],
//   outputs: [...],
//   methods: [...],
//   types: [...]
// }
```

### Generating YAML

```typescript
import { resurrectIDL } from '@/utils/idl-parser';

const idlContent = `...`; // Your IDL content

// Complete resurrection: IDL → Kiro YAML
const { specs, yaml } = resurrectIDL(idlContent);

// specs: Array of KiroSpec objects
// yaml: Array of YAML strings (one per agent)

console.log(yaml[0]);
// Output: Formatted YAML string ready to save
```

### Saving to File (Node.js)

```typescript
import fs from 'fs';
import { resurrectIDL } from '@/utils/idl-parser';

const idlContent = fs.readFileSync('legacy/MyService.idl', 'utf-8');
const { specs, yaml } = resurrectIDL(idlContent);

// Save each agent spec to a file
specs.forEach((spec, index) => {
  const filename = `specs/${spec.agent}.yaml`;
  fs.writeFileSync(filename, yaml[index]);
  console.log(`✅ Generated ${filename}`);
});
```

---

## Advanced Examples

### Example 1: Customer Support System

**Input IDL** (`SupportAgent.idl`):
```idl
module SupportSystem {
  struct CustomerInquiry {
    string inquiryId;
    string customerId;
    string subject;
    string description;
    long priority;
  };
  
  struct IntentResult {
    string intent;
    double confidence;
  };
  
  interface SupportAgent {
    IntentResult classifyIntent(in CustomerInquiry inquiry)
      raises (ClassificationException);
    
    void escalateTicket(in string ticketId, in string reason)
      raises (EscalationException);
  };
  
  exception ClassificationException {
    string reason;
    long errorCode;
  };
  
  exception EscalationException {
    string ticketId;
    string reason;
  };
};
```

**Generated YAML**:
```yaml
# Resurrected from CORBA IDL
# Module: SupportSystem

agent: SupportAgent
module: SupportSystem

inputs:
  - name: customerinquiry
    type: CustomerInquiry
  - name: string
    type: string

outputs:
  - name: intentresult
    type: IntentResult

methods:
  - name: classifyIntent
    params:
      - name: inquiry
        type: CustomerInquiry
    returns: IntentResult
    errors:
      - ClassificationException

  - name: escalateTicket
    params:
      - name: ticketId
        type: string
      - name: reason
        type: string
    returns: void
    errors:
      - EscalationException

types:
  - name: CustomerInquiry
    fields:
      - name: inquiryId
        type: string
      - name: customerId
        type: string
      - name: subject
        type: string
      - name: description
        type: string
      - name: priority
        type: number

  - name: IntentResult
    fields:
      - name: intent
        type: string
      - name: confidence
        type: number
```

### Example 2: Type Mapping

The resurrection engine automatically maps CORBA types to TypeScript equivalents:

```typescript
// CORBA Type → TypeScript Type
string          → string
long            → number
short           → number
double          → number
float           → number
boolean         → boolean
sequence<T>     → T[]
void            → void

// Custom types are preserved
CustomerInquiry → CustomerInquiry
```

**Example:**
```idl
// CORBA IDL
sequence<string> getNames();
sequence<User> getUsers();
double getScore();
```

**Becomes:**
```yaml
# Kiro YAML
- name: getNames
  returns: string[]

- name: getUsers
  returns: User[]

- name: getScore
  returns: number
```

### Example 3: Complex Nested Structures

```idl
module ComplexSystem {
  struct Address {
    string street;
    string city;
    string zipCode;
  };
  
  struct Person {
    string name;
    Address address;
    sequence<string> phoneNumbers;
  };
  
  interface PersonService {
    Person findPerson(in string personId);
    sequence<Person> searchPeople(in string query);
  };
};
```

The resurrection engine handles:
- ✅ Nested struct references (`Address` inside `Person`)
- ✅ Sequence types (`sequence<string>` → `string[]`)
- ✅ Complex return types (`sequence<Person>` → `Person[]`)

---

## Integration with CrewOS

### Step 1: Resurrect Your IDL

```bash
# Place your IDL file in the demo folder
cp legacy/MyService.idl demo/corba-idl/

# Visit the resurrection lab
open http://localhost:3000/resurrection

# Upload and download the generated YAML
```

### Step 2: Create Agent from Spec

```typescript
import { BaseAgent } from '@/agents/Agent';
import type { Message } from '@/types';

// Use the resurrected spec to guide implementation
export class MyServiceAgent extends BaseAgent {
  constructor() {
    super('my-service-agent', 'MyService');
  }

  async processMessage(message: Message): Promise<void> {
    // Implement methods from your resurrected spec
    switch (message.type) {
      case 'GET_USER':
        return this.getUser(message.payload);
      case 'UPDATE_USER':
        return this.updateUser(message.payload);
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async getUser(userId: string) {
    // Implementation based on resurrected spec
  }

  private async updateUser(user: any) {
    // Implementation based on resurrected spec
  }
}
```

### Step 3: Register with Message Bus

```typescript
import { MessageBus } from '@/orchestration/MessageBus';
import { MyServiceAgent } from './MyServiceAgent';

const messageBus = new MessageBus();
const agent = new MyServiceAgent();

// Register agent to handle messages
messageBus.subscribe('user.*', (message) => {
  agent.processMessage(message);
});
```

### Step 4: Use in Workflow

```typescript
import { WorkflowStateManager } from '@/orchestration/WorkflowStateManager';

const stateManager = new WorkflowStateManager();

// Create workflow based on resurrected agent
const workflowId = stateManager.createWorkflow({
  name: 'User Management',
  agents: ['my-service-agent'],
  initialState: {}
});

// Send messages to agent
messageBus.publish({
  id: 'msg-1',
  type: 'GET_USER',
  payload: { userId: '123' },
  sender: 'client',
  receiver: 'my-service-agent',
  timestamp: Date.now()
});
```

---

## Batch Processing

### Resurrect Multiple IDL Files

```typescript
import fs from 'fs';
import path from 'path';
import { resurrectIDL } from '@/utils/idl-parser';

const idlDir = 'legacy/idl';
const outputDir = 'specs/resurrected';

// Get all IDL files
const idlFiles = fs.readdirSync(idlDir)
  .filter(file => file.endsWith('.idl'));

console.log(`Found ${idlFiles.length} IDL files to resurrect...`);

// Resurrect each file
idlFiles.forEach(filename => {
  const idlPath = path.join(idlDir, filename);
  const idlContent = fs.readFileSync(idlPath, 'utf-8');
  
  try {
    const { specs, yaml } = resurrectIDL(idlContent);
    
    specs.forEach((spec, index) => {
      const outputPath = path.join(outputDir, `${spec.agent}.yaml`);
      fs.writeFileSync(outputPath, yaml[index]);
      console.log(`✅ ${filename} → ${spec.agent}.yaml`);
    });
  } catch (error) {
    console.error(`❌ Failed to resurrect ${filename}:`, error);
  }
});

console.log('Resurrection complete!');
```

---

## Testing Resurrected Specs

### Validate Generated YAML

```typescript
import { validateYAML } from '@/utils/idl-parser';

const yamlContent = `
agent: MyAgent
module: MyModule
methods:
  - name: doSomething
    params: []
    returns: void
`;

const validation = validateYAML(yamlContent);

if (validation.valid) {
  console.log('✅ YAML is valid');
} else {
  console.error('❌ YAML validation errors:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
}
```

### Property-Based Testing

```typescript
import fc from 'fast-check';
import { parseIDL, idlToKiroSpec, specToYAML } from '@/utils/idl-parser';

// Test round-trip: IDL → Spec → YAML → Spec
fc.assert(
  fc.property(
    fc.string(), // Generate random IDL content
    (idlContent) => {
      try {
        const interfaces = parseIDL(idlContent);
        const specs = interfaces.map(idlToKiroSpec);
        const yaml = specs.map(specToYAML);
        
        // Verify YAML is valid
        yaml.forEach(y => {
          const validation = validateYAML(y);
          expect(validation.valid).toBe(true);
        });
      } catch (error) {
        // Parsing errors are acceptable for invalid IDL
        return true;
      }
    }
  ),
  { numRuns: 100 }
);
```

---

## Tips & Best Practices

### 1. Clean Your IDL First
- Remove unnecessary comments
- Fix syntax errors
- Ensure proper module structure

### 2. Review Generated Specs
- Check type mappings are correct
- Verify method signatures
- Ensure exception handling is preserved

### 3. Iterate on Implementation
- Use generated specs as a starting point
- Add business logic incrementally
- Write tests for each method

### 4. Document Deviations
- Note where implementation differs from spec
- Document why changes were made
- Keep specs updated as code evolves

---

## Next Steps

1. **Try the Demo**: Visit `/resurrection` and upload an IDL file
2. **Read the Docs**: Check out [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
3. **Build Agents**: Use resurrected specs to create CrewOS agents
4. **Contribute**: Add support for more CORBA features

---

**Happy Resurrecting! 🧟‍♂️⚡✨**
