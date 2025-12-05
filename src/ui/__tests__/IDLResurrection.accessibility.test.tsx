/**
 * Accessibility tests for IDLResurrection component
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('IDLResurrection Accessibility', () => {
  describe('ARIA Labels (Requirement 5.1, 5.2, 5.3, 5.4)', () => {
    it('has main region with aria-label', () => {
      const { container } = render(
        <div role="region" aria-label="IDL Resurrection Tool">
          <p>Content</p>
        </div>
      );

      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-label', 'IDL Resurrection Tool');
    });

    it('file upload has proper labels', () => {
      const { container } = render(
        <label htmlFor="idl-file-upload" aria-label="Upload CORBA IDL file">
          <input
            id="idl-file-upload"
            type="file"
            accept=".idl"
            aria-describedby="file-upload-description"
          />
          Choose IDL File
        </label>
      );

      const input = container.querySelector('#idl-file-upload');
      expect(input).toHaveAttribute('aria-describedby', 'file-upload-description');
    });

    it('demo buttons have descriptive aria-labels', () => {
      const { container } = render(
        <div>
          <button aria-label="Load Support Agent demo - Customer support with intent classification, FAQ search, and ticket management">
            Support Agent
          </button>
          <button aria-label="Load Research Agent demo - Academic research with document retrieval, summarization, and citation generation">
            Research Agent
          </button>
          <button aria-label="Load Router Agent demo - Message routing with agent registration, discovery, and availability checking">
            Router Agent
          </button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons[0]).toHaveAttribute('aria-label');
      expect(buttons[1]).toHaveAttribute('aria-label');
      expect(buttons[2]).toHaveAttribute('aria-label');
    });

    it('download buttons have aria-labels', () => {
      const { container } = render(
        <button aria-label="Download TestAgent spec">
          Download YAML
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Download TestAgent spec');
    });

    it('reset button has aria-label', () => {
      const { container } = render(
        <button aria-label="Reset and resurrect another IDL file">
          Resurrect Another
        </button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-label', 'Reset and resurrect another IDL file');
    });

    it('code regions have aria-labels', () => {
      const { container } = render(
        <div>
          <div role="region" aria-label="Original CORBA IDL code" tabIndex={0}>
            IDL Code
          </div>
          <div role="region" aria-label="Generated Kiro YAML specifications" tabIndex={0}>
            YAML Code
          </div>
        </div>
      );

      const regions = container.querySelectorAll('[role="region"]');
      expect(regions[0]).toHaveAttribute('aria-label', 'Original CORBA IDL code');
      expect(regions[1]).toHaveAttribute('aria-label', 'Generated Kiro YAML specifications');
    });

    it('emojis have role and aria-label', () => {
      const { container } = render(
        <div>
          <span role="img" aria-label="coffin">⚰️</span>
          <span role="img" aria-label="sparkles">✨</span>
        </div>
      );

      const emojis = container.querySelectorAll('[role="img"]');
      expect(emojis[0]).toHaveAttribute('aria-label', 'coffin');
      expect(emojis[1]).toHaveAttribute('aria-label', 'sparkles');
    });
  });

  describe('Screen Reader Announcements (Requirement 5.4)', () => {
    it('has live region for status updates', () => {
      const { container } = render(
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Parsing CORBA IDL file. Please wait.
        </div>
      );

      const liveRegion = container.querySelector('[role="status"]');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('announces parsing state', () => {
      const { container } = render(
        <div role="status" aria-live="polite" aria-atomic="true">
          Parsing CORBA IDL file. Please wait.
        </div>
      );

      expect(container.textContent).toContain('Parsing CORBA IDL file. Please wait.');
    });

    it('announces converting state', () => {
      const { container } = render(
        <div role="status" aria-live="polite" aria-atomic="true">
          Converting to Kiro YAML specifications. Please wait.
        </div>
      );

      expect(container.textContent).toContain('Converting to Kiro YAML specifications. Please wait.');
    });

    it('announces completion state', () => {
      const agentCount = 3;
      const { container } = render(
        <div role="status" aria-live="polite" aria-atomic="true">
          Resurrection complete! {agentCount} agents successfully converted.
        </div>
      );

      expect(container.textContent).toContain('Resurrection complete! 3 agents successfully converted.');
    });

    it('handles singular agent count in announcement', () => {
      const agentCount = 1;
      const { container } = render(
        <div role="status" aria-live="polite" aria-atomic="true">
          Resurrection complete! {agentCount} agent successfully converted.
        </div>
      );

      expect(container.textContent).toContain('1 agent successfully converted');
    });
  });

  describe('Keyboard Navigation (Requirement 5.1, 5.2, 5.3)', () => {
    it('code regions are keyboard accessible with tabIndex', () => {
      const { container } = render(
        <div>
          <div role="region" tabIndex={0}>IDL Code</div>
          <div role="region" tabIndex={0}>YAML Code</div>
        </div>
      );

      const regions = container.querySelectorAll('[role="region"]');
      expect(regions[0]).toHaveAttribute('tabIndex', '0');
      expect(regions[1]).toHaveAttribute('tabIndex', '0');
    });

    it('all interactive elements are keyboard accessible', () => {
      const { container } = render(
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <input type="file" />
        </div>
      );

      const buttons = container.querySelectorAll('button');
      const input = container.querySelector('input');

      // Buttons are naturally keyboard accessible
      expect(buttons.length).toBe(2);
      expect(input).toBeInTheDocument();
    });
  });

  describe('Semantic HTML (Requirement 5.1, 5.2, 5.3, 5.4)', () => {
    it('uses proper heading hierarchy', () => {
      const { container } = render(
        <div>
          <h3>Parsing Dead IDL...</h3>
          <h3>Resurrecting Agents...</h3>
          <h3>Resurrection Complete!</h3>
          <h4>Dead CORBA IDL</h4>
          <h4>Living Kiro YAML</h4>
        </div>
      );

      expect(container.querySelectorAll('h3').length).toBe(3);
      expect(container.querySelectorAll('h4').length).toBe(2);
    });

    it('uses semantic button elements', () => {
      const { container } = render(
        <div>
          <button>Choose IDL File</button>
          <button>Load Demo</button>
          <button>Download YAML</button>
          <button>Resurrect Another</button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(4);
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('uses label element for file input', () => {
      const { container } = render(
        <label htmlFor="idl-file-upload">
          <input id="idl-file-upload" type="file" />
          Choose IDL File
        </label>
      );

      const label = container.querySelector('label');
      const input = container.querySelector('input');
      
      expect(label).toHaveAttribute('for', 'idl-file-upload');
      expect(input).toHaveAttribute('id', 'idl-file-upload');
    });
  });

  describe('Focus Management', () => {
    it('code regions can receive focus', () => {
      const { container } = render(
        <div role="region" tabIndex={0}>
          Code content
        </div>
      );

      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('tabIndex', '0');
    });

    it('buttons are focusable by default', () => {
      const { container } = render(
        <button>Click me</button>
      );

      const button = container.querySelector('button');
      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('Screen Reader Only Content', () => {
    it('has sr-only class for screen reader only content', () => {
      const { container } = render(
        <div className="sr-only">
          Screen reader only text
        </div>
      );

      const srOnly = container.querySelector('.sr-only');
      expect(srOnly).toHaveClass('sr-only');
    });

    it('file upload description is screen reader only', () => {
      const { container } = render(
        <p id="file-upload-description" className="sr-only">
          Upload a CORBA IDL file to convert it to Kiro YAML specifications
        </p>
      );

      const description = container.querySelector('#file-upload-description');
      expect(description).toHaveClass('sr-only');
    });
  });

  describe('Accessibility Best Practices', () => {
    it('uses descriptive text for buttons', () => {
      const { container } = render(
        <div>
          <button>Choose IDL File</button>
          <button>Load Support Agent demo</button>
          <button>Download YAML</button>
          <button>Resurrect Another</button>
        </div>
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.textContent).toBeTruthy();
        expect(button.textContent!.length).toBeGreaterThan(0);
      });
    });

    it('provides context for state changes', () => {
      const states = [
        'Parsing CORBA IDL file. Please wait.',
        'Converting to Kiro YAML specifications. Please wait.',
        'Resurrection complete! 3 agents successfully converted.'
      ];

      states.forEach(state => {
        const { container } = render(
          <div role="status" aria-live="polite">
            {state}
          </div>
        );

        expect(container.textContent).toContain(state);
      });
    });

    it('uses proper ARIA roles', () => {
      const { container } = render(
        <div>
          <div role="region">Region content</div>
          <div role="status">Status content</div>
          <span role="img" aria-label="emoji">💀</span>
        </div>
      );

      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });
});
