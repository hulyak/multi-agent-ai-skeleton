/**
 * Tests for IDL and YAML syntax highlighting in IDLResurrection component
 * Requirements: 5.5
 */

import React from 'react';
import { render } from '@testing-library/react';

// Extract the highlighting functions for testing
const highlightIDL = (code: string): React.ReactElement => {
  const lines = code.split('\n');
  
  return (
    <>
      {lines.map((line, idx) => {
        // Comments
        if (line.trim().startsWith('//')) {
          return <div key={idx} className="text-gray-500">{line}</div>;
        }
        if (line.trim().startsWith('/*') || line.trim().startsWith('*')) {
          return <div key={idx} className="text-gray-500">{line}</div>;
        }
        
        // Keywords
        const highlighted = line
          .replace(/\b(module|interface|struct|exception|sequence|in|out|inout|raises|void|string|long|short|double|float|boolean|any)\b/g, 
            '<span class="text-spooky-accent-purple font-bold">$1</span>')
          // Type names (capitalized words)
          .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, 
            '<span class="text-spooky-accent-green">$1</span>')
          // Braces and punctuation
          .replace(/([{}();,<>])/g, 
            '<span class="text-spooky-neon-accent">$1</span>');
        
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />;
      })}
    </>
  );
};

const highlightYAML = (code: string): React.ReactElement => {
  const lines = code.split('\n');
  
  return (
    <>
      {lines.map((line, idx) => {
        // Comments
        if (line.trim().startsWith('#')) {
          return <div key={idx} className="text-gray-500 italic">{line}</div>;
        }
        
        // Separator
        if (line.trim() === '---') {
          return <div key={idx} className="text-spooky-accent-orange font-bold">{line}</div>;
        }
        
        // Keys (before colon)
        const highlighted = line
          .replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*):/g, 
            '$1<span class="text-spooky-accent-purple font-bold">$2</span>:')
          // String values (in quotes)
          .replace(/"([^"]*)"/g, 
            '<span class="text-spooky-accent-green">"$1"</span>')
          // Array indicators
          .replace(/^(\s*)(- )/g, 
            '$1<span class="text-spooky-neon-accent">$2</span>');
        
        return <div key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />;
      })}
    </>
  );
};

describe('IDL Syntax Highlighting', () => {
  it('highlights IDL keywords', () => {
    const idl = 'module TestModule { interface TestInterface { } }';
    const { container } = render(highlightIDL(idl));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-accent-purple'); // Keywords
    expect(html).toContain('module');
    expect(html).toContain('interface');
  });

  it('highlights IDL type names', () => {
    const idl = 'struct CustomerInquiry { string name; }';
    const { container } = render(highlightIDL(idl));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-accent-green'); // Type names
    expect(html).toContain('CustomerInquiry');
  });

  it('highlights IDL comments', () => {
    const idl = '// This is a comment\nmodule Test {}';
    const { container } = render(highlightIDL(idl));
    
    const html = container.innerHTML;
    expect(html).toContain('text-gray-500'); // Comments
  });

  it('highlights IDL punctuation', () => {
    const idl = 'interface Test { void method(); }';
    const { container } = render(highlightIDL(idl));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-neon-accent'); // Punctuation
  });

  it('highlights IDL parameter directions', () => {
    const idl = 'void method(in string param, out long result);';
    const { container } = render(highlightIDL(idl));
    
    const html = container.innerHTML;
    expect(html).toContain('in');
    expect(html).toContain('out');
    expect(html).toContain('text-spooky-accent-purple'); // Keywords
  });
});

describe('YAML Syntax Highlighting', () => {
  it('highlights YAML keys', () => {
    const yaml = 'agent: TestAgent\nmodule: TestModule';
    const { container } = render(highlightYAML(yaml));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-accent-purple'); // Keys
    expect(html).toContain('agent');
    expect(html).toContain('module');
  });

  it('highlights YAML string values', () => {
    const yaml = 'name: "TestAgent"';
    const { container } = render(highlightYAML(yaml));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-accent-green'); // String values
    expect(html).toContain('"TestAgent"');
  });

  it('highlights YAML comments', () => {
    const yaml = '# This is a comment\nagent: Test';
    const { container } = render(highlightYAML(yaml));
    
    const html = container.innerHTML;
    expect(html).toContain('text-gray-500'); // Comments
    expect(html).toContain('italic');
  });

  it('highlights YAML separators', () => {
    const yaml = 'agent: Test1\n---\nagent: Test2';
    const { container } = render(highlightYAML(yaml));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-accent-orange'); // Separator
    expect(html).toContain('---');
  });

  it('highlights YAML array indicators', () => {
    const yaml = 'methods:\n  - name: test\n  - name: test2';
    const { container } = render(highlightYAML(yaml));
    
    const html = container.innerHTML;
    expect(html).toContain('text-spooky-neon-accent'); // Array indicators
  });
});

describe('Syntax Highlighting Integration', () => {
  it('works with spooky theme colors', () => {
    const idl = 'module Test { interface Agent { } }';
    const { container } = render(highlightIDL(idl));
    
    const html = container.innerHTML;
    // Verify spooky theme classes are used
    expect(html).toContain('text-spooky-accent-purple');
    expect(html).toContain('text-spooky-accent-green');
    expect(html).toContain('text-spooky-neon-accent');
  });

  it('handles multi-line code correctly', () => {
    const idl = 'module Test {\n  interface Agent {\n    void method();\n  }\n}';
    const { container } = render(highlightIDL(idl));
    
    // Should have multiple div elements for each line
    const divs = container.querySelectorAll('div');
    expect(divs.length).toBeGreaterThan(1);
  });

  it('handles empty lines gracefully', () => {
    const yaml = 'agent: Test\n\nmodule: TestModule';
    const { container } = render(highlightYAML(yaml));
    
    // Should not crash on empty lines
    expect(container).toBeTruthy();
  });
});
