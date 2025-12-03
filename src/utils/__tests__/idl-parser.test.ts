import { parseIDL, idlToKiroSpec, resurrectIDL } from '../idl-parser';

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
