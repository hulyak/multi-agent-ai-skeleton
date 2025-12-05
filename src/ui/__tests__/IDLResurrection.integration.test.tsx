/**
 * Integration tests for IDL Resurrection component
 * Tests complete resurrection flow with real IDL files
 */

import { parseIDL, idlToKiroSpec, specToYAML, resurrectIDL } from '@/utils/idl-parser';
import fs from 'fs';
import path from 'path';

describe('IDL Resurrection Integration Tests', () => {
  // Helper to load IDL files
  const loadIDLFile = (filename: string): string => {
    const filePath = path.join(process.cwd(), 'demo', 'corba-idl', filename);
    return fs.readFileSync(filePath, 'utf-8');
  };

  describe('RouterAgent.idl', () => {
    let idlContent: string;
    let interfaces: ReturnType<typeof parseIDL>;
    let specs: ReturnType<typeof idlToKiroSpec>[];
    let yamlOutputs: string[];

    beforeAll(() => {
      idlContent = loadIDLFile('RouterAgent.idl');
      interfaces = parseIDL(idlContent);
      specs = interfaces.map(idlToKiroSpec);
      yamlOutputs = specs.map(specToYAML);
    });

    it('should successfully parse RouterAgent.idl', () => {
      expect(interfaces).toHaveLength(1);
      expect(interfaces[0].name).toBe('RouterAgent');
      expect(interfaces[0].module).toBe('AgentSystem');
    });

    it('should extract all structs from RouterAgent', () => {
      expect(interfaces[0].structs).toHaveLength(2);
      const structNames = interfaces[0].structs.map(s => s.name);
      expect(structNames).toContain('Message');
      expect(structNames).toContain('AgentMetadata');
    });

    it('should extract all exceptions from RouterAgent', () => {
      expect(interfaces[0].exceptions).toHaveLength(4);
      const exceptionNames = interfaces[0].exceptions.map(e => e.name);
      expect(exceptionNames).toContain('RoutingException');
      expect(exceptionNames).toContain('RegistrationException');
      expect(exceptionNames).toContain('DeregistrationException');
      expect(exceptionNames).toContain('AgentNotFoundException');
    });

    it('should extract all methods from RouterAgent interface', () => {
      expect(interfaces[0].methods).toHaveLength(6);
      const methodNames = interfaces[0].methods.map(m => m.name);
      expect(methodNames).toContain('routeMessage');
      expect(methodNames).toContain('registerAgent');
      expect(methodNames).toContain('deregisterAgent');
      expect(methodNames).toContain('listAgents');
      expect(methodNames).toContain('isAgentAvailable');
      expect(methodNames).toContain('getAgentMetadata');
    });

    it('should convert RouterAgent to valid Kiro spec', () => {
      expect(specs).toHaveLength(1);
      expect(specs[0].agent).toBe('RouterAgent');
      expect(specs[0].module).toBe('AgentSystem');
    });

    it('should preserve method-exception associations for RouterAgent', () => {
      const spec = specs[0];
      const routeMethod = spec.methods.find(m => m.name === 'routeMessage');
      expect(routeMethod).toBeDefined();
      expect(routeMethod?.errors).toContain('RoutingException');
    });

    it('should generate valid YAML for RouterAgent', () => {
      const yaml = yamlOutputs[0];
      expect(yaml).toContain('agent: RouterAgent');
      expect(yaml).toContain('module: AgentSystem');
      expect(yaml).toContain('methods:');
      expect(yaml).toContain('types:');
      expect(yaml).not.toContain('undefined');
      expect(yaml).not.toContain('null');
    });

    it('should map CORBA types correctly in RouterAgent', () => {
      const spec = specs[0];
      const routeMethod = spec.methods.find(m => m.name === 'routeMessage');
      expect(routeMethod?.returns).toBe('string');
      
      const listMethod = spec.methods.find(m => m.name === 'listAgents');
      expect(listMethod?.returns).toBe('AgentMetadata[]');
    });
  });

  describe('SupportAgent.idl', () => {
    let idlContent: string;
    let interfaces: ReturnType<typeof parseIDL>;
    let specs: ReturnType<typeof idlToKiroSpec>[];
    let yamlOutputs: string[];

    beforeAll(() => {
      idlContent = loadIDLFile('SupportAgent.idl');
      interfaces = parseIDL(idlContent);
      specs = interfaces.map(idlToKiroSpec);
      yamlOutputs = specs.map(specToYAML);
    });

    it('should successfully parse SupportAgent.idl', () => {
      expect(interfaces).toHaveLength(1);
      expect(interfaces[0].name).toBe('SupportAgent');
      expect(interfaces[0].module).toBe('SupportSystem');
    });

    it('should extract all structs from SupportAgent', () => {
      expect(interfaces[0].structs).toHaveLength(4);
      const structNames = interfaces[0].structs.map(s => s.name);
      expect(structNames).toContain('CustomerInquiry');
      expect(structNames).toContain('SupportTicket');
      expect(structNames).toContain('FAQEntry');
      expect(structNames).toContain('IntentResult');
    });

    it('should extract all exceptions from SupportAgent', () => {
      expect(interfaces[0].exceptions).toHaveLength(5);
      const exceptionNames = interfaces[0].exceptions.map(e => e.name);
      expect(exceptionNames).toContain('ClassificationException');
      expect(exceptionNames).toContain('SearchException');
      expect(exceptionNames).toContain('TicketCreationException');
      expect(exceptionNames).toContain('EscalationException');
      expect(exceptionNames).toContain('TicketNotFoundException');
    });

    it('should extract all methods from SupportAgent interface', () => {
      expect(interfaces[0].methods).toHaveLength(5);
      const methodNames = interfaces[0].methods.map(m => m.name);
      expect(methodNames).toContain('classifyIntent');
      expect(methodNames).toContain('searchFAQ');
      expect(methodNames).toContain('createTicket');
      expect(methodNames).toContain('escalateTicket');
      expect(methodNames).toContain('getTicketStatus');
    });

    it('should convert SupportAgent to valid Kiro spec', () => {
      expect(specs).toHaveLength(1);
      expect(specs[0].agent).toBe('SupportAgent');
      expect(specs[0].module).toBe('SupportSystem');
    });

    it('should preserve method-exception associations for SupportAgent', () => {
      const spec = specs[0];
      const classifyMethod = spec.methods.find(m => m.name === 'classifyIntent');
      expect(classifyMethod).toBeDefined();
      expect(classifyMethod?.errors).toContain('ClassificationException');
    });

    it('should generate valid YAML for SupportAgent', () => {
      const yaml = yamlOutputs[0];
      expect(yaml).toContain('agent: SupportAgent');
      expect(yaml).toContain('module: SupportSystem');
      expect(yaml).toContain('methods:');
      expect(yaml).toContain('types:');
      expect(yaml).not.toContain('undefined');
      expect(yaml).not.toContain('null');
    });

    it('should handle double type correctly in SupportAgent', () => {
      const spec = specs[0];
      const faqType = spec.types.find(t => t.name === 'FAQEntry');
      expect(faqType).toBeDefined();
      const relevanceField = faqType?.fields.find(f => f.name === 'relevanceScore');
      expect(relevanceField?.type).toBe('number');
    });
  });

  describe('ResearchAgent.idl', () => {
    let idlContent: string;
    let interfaces: ReturnType<typeof parseIDL>;
    let specs: ReturnType<typeof idlToKiroSpec>[];
    let yamlOutputs: string[];

    beforeAll(() => {
      idlContent = loadIDLFile('ResearchAgent.idl');
      interfaces = parseIDL(idlContent);
      specs = interfaces.map(idlToKiroSpec);
      yamlOutputs = specs.map(specToYAML);
    });

    it('should successfully parse ResearchAgent.idl', () => {
      expect(interfaces).toHaveLength(1);
      expect(interfaces[0].name).toBe('ResearchAgent');
      expect(interfaces[0].module).toBe('ResearchSystem');
    });

    it('should extract all structs from ResearchAgent', () => {
      expect(interfaces[0].structs).toHaveLength(4);
      const structNames = interfaces[0].structs.map(s => s.name);
      expect(structNames).toContain('Document');
      expect(structNames).toContain('Citation');
      expect(structNames).toContain('Summary');
      expect(structNames).toContain('SearchQuery');
    });

    it('should extract all exceptions from ResearchAgent', () => {
      expect(interfaces[0].exceptions).toHaveLength(5);
      const exceptionNames = interfaces[0].exceptions.map(e => e.name);
      expect(exceptionNames).toContain('RetrievalException');
      expect(exceptionNames).toContain('SummarizationException');
      expect(exceptionNames).toContain('CitationException');
      expect(exceptionNames).toContain('SearchException');
      expect(exceptionNames).toContain('DocumentNotFoundException');
    });

    it('should extract all methods from ResearchAgent interface', () => {
      expect(interfaces[0].methods).toHaveLength(5);
      const methodNames = interfaces[0].methods.map(m => m.name);
      expect(methodNames).toContain('retrieveDocuments');
      expect(methodNames).toContain('summarizeDocument');
      expect(methodNames).toContain('generateCitations');
      expect(methodNames).toContain('searchInDocument');
      expect(methodNames).toContain('getDocument');
    });

    it('should convert ResearchAgent to valid Kiro spec', () => {
      expect(specs).toHaveLength(1);
      expect(specs[0].agent).toBe('ResearchAgent');
      expect(specs[0].module).toBe('ResearchSystem');
    });

    it('should preserve method-exception associations for ResearchAgent', () => {
      const spec = specs[0];
      const retrieveMethod = spec.methods.find(m => m.name === 'retrieveDocuments');
      expect(retrieveMethod).toBeDefined();
      expect(retrieveMethod?.errors).toContain('RetrievalException');
    });

    it('should generate valid YAML for ResearchAgent', () => {
      const yaml = yamlOutputs[0];
      expect(yaml).toContain('agent: ResearchAgent');
      expect(yaml).toContain('module: ResearchSystem');
      expect(yaml).toContain('methods:');
      expect(yaml).toContain('types:');
      expect(yaml).not.toContain('undefined');
      expect(yaml).not.toContain('null');
    });

    it('should handle sequence types correctly in ResearchAgent', () => {
      const spec = specs[0];
      const retrieveMethod = spec.methods.find(m => m.name === 'retrieveDocuments');
      expect(retrieveMethod?.returns).toBe('Document[]');
      
      const generateMethod = spec.methods.find(m => m.name === 'generateCitations');
      expect(generateMethod?.returns).toBe('Citation[]');
    });
  });

  describe('Complete Resurrection Flow', () => {
    it('should successfully resurrect all three demo IDL files', () => {
      const files = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
      
      files.forEach(filename => {
        const idlContent = loadIDLFile(filename);
        const { specs, yaml } = resurrectIDL(idlContent);
        
        // Verify parsing succeeded
        expect(specs.length).toBeGreaterThan(0);
        
        // Verify conversion succeeded
        expect(specs[0].agent).toBeTruthy();
        
        // Verify YAML generation succeeded
        expect(yaml[0]).toContain('agent:');
        expect(yaml[0].length).toBeGreaterThan(100);
      });
    });

    it('should produce well-structured YAML output for all IDL files', () => {
      const files = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
      
      files.forEach(filename => {
        const idlContent = loadIDLFile(filename);
        const { yaml } = resurrectIDL(idlContent);
        
        // YAML should be valid and complete
        expect(yaml[0]).toContain('agent:');
        expect(yaml[0]).toContain('module:');
        expect(yaml[0]).toContain('methods:');
        expect(yaml[0]).toContain('types:');
        
        // YAML should be properly formatted
        const lines = yaml[0].split('\n');
        expect(lines.length).toBeGreaterThan(10); // Should have substantial content
        
        // Should not have syntax errors
        expect(yaml[0]).not.toContain('undefined');
        expect(yaml[0]).not.toContain('null');
        
        // Should be more readable than IDL (no complex syntax)
        expect(yaml[0]).not.toContain('interface ');
        expect(yaml[0]).not.toContain('raises (');
        expect(yaml[0]).not.toContain('exception ');
      });
    });

    it('should preserve all critical information during resurrection', () => {
      const files = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
      
      files.forEach(filename => {
        const idlContent = loadIDLFile(filename);
        const interfaces = parseIDL(idlContent);
        const { specs } = resurrectIDL(idlContent);
        
        // All interfaces should become agents
        expect(specs.length).toBe(interfaces.length);
        
        // All structs should become types
        const structTypes = specs[0].types.filter(t => 
          interfaces[0].structs.some(s => s.name === t.name)
        );
        expect(structTypes.length).toBe(interfaces[0].structs.length);
        
        // All methods should be preserved
        expect(specs[0].methods.length).toBe(interfaces[0].methods.length);
      });
    });

    it('should generate downloadable YAML for all agents', () => {
      const files = ['RouterAgent.idl', 'SupportAgent.idl', 'ResearchAgent.idl'];
      
      files.forEach(filename => {
        const idlContent = loadIDLFile(filename);
        const { yaml } = resurrectIDL(idlContent);
        
        // YAML should be valid and complete
        expect(yaml[0]).toMatch(/^# Resurrected from CORBA IDL/m);
        expect(yaml[0]).toMatch(/agent: \w+Agent/);
        expect(yaml[0]).toMatch(/methods:/);
        expect(yaml[0]).toMatch(/types:/);
        
        // Should not contain any errors or undefined values
        expect(yaml[0]).not.toContain('undefined');
        expect(yaml[0]).not.toContain('null');
        expect(yaml[0]).not.toContain('ERROR');
      });
    });
  });

  describe('YAML Structure Validation', () => {
    it('should generate properly indented YAML for RouterAgent', () => {
      const idlContent = loadIDLFile('RouterAgent.idl');
      const { yaml } = resurrectIDL(idlContent);
      
      // Check indentation levels
      const lines = yaml[0].split('\n');
      const agentLine = lines.find(l => l.includes('agent: RouterAgent'));
      expect(agentLine).toMatch(/^agent:/); // No leading spaces for top-level
      
      const methodsLine = lines.find(l => l.trim() === 'methods:');
      expect(methodsLine).toMatch(/^methods:/); // Top-level field
    });

    it('should include all required fields in agent spec', () => {
      const idlContent = loadIDLFile('SupportAgent.idl');
      const { yaml } = resurrectIDL(idlContent);
      
      // Required agent fields
      expect(yaml[0]).toContain('agent: SupportAgent');
      expect(yaml[0]).toContain('module: SupportSystem');
      expect(yaml[0]).toContain('methods:');
      
      // Required method fields
      expect(yaml[0]).toMatch(/- name: \w+/);
      expect(yaml[0]).toContain('returns:');
    });

    it('should properly format type definitions', () => {
      const idlContent = loadIDLFile('ResearchAgent.idl');
      const { yaml } = resurrectIDL(idlContent);
      
      // Type section should exist
      expect(yaml[0]).toContain('types:');
      
      // Type fields should be properly formatted
      expect(yaml[0]).toMatch(/- name: \w+/);
      expect(yaml[0]).toMatch(/type: (string|number|boolean|\w+\[\])/);
    });
  });
});
