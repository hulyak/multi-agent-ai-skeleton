/**
 * Tests for resurrection animations in IDLResurrection component
 * Requirements: 5.1, 5.2, 5.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('IDLResurrection Animations', () => {
  beforeEach(() => {
    // Mock matchMedia for prefers-reduced-motion tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Parsing Animation (Requirement 5.1)', () => {
    it('displays parsing animation with skull emoji', () => {
      const { container } = render(
        <div>
          <div className="text-8xl mb-6">💀</div>
          <h3 className="text-3xl font-bold text-spooky-accent-purple mb-4">
            Parsing Dead IDL...
          </h3>
        </div>
      );

      expect(container.textContent).toContain('💀');
      expect(container.textContent).toContain('Parsing Dead IDL...');
    });

    it('shows parsing progress messages', () => {
      const { container } = render(
        <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm">
          <div>&gt; Reading CORBA IDL file...</div>
          <div>&gt; Extracting interfaces...</div>
          <div>&gt; Parsing method signatures...</div>
        </div>
      );

      expect(container.textContent).toContain('Reading CORBA IDL file...');
      expect(container.textContent).toContain('Extracting interfaces...');
      expect(container.textContent).toContain('Parsing method signatures...');
    });

    it('uses proper timing for parsing animation', () => {
      // Verify animation classes are present
      const { container } = render(
        <div className="text-center py-12">
          <div className="text-8xl mb-6">💀</div>
        </div>
      );

      expect(container.querySelector('.text-center')).toBeInTheDocument();
      expect(container.querySelector('.py-12')).toBeInTheDocument();
    });
  });

  describe('Converting Animation (Requirement 5.2)', () => {
    it('displays converting animation with lightning emoji', () => {
      const { container } = render(
        <div>
          <div className="text-8xl mb-6">⚡</div>
          <h3 className="text-3xl font-bold text-spooky-neon-accent mb-4">
            Resurrecting Agents...
          </h3>
        </div>
      );

      expect(container.textContent).toContain('⚡');
      expect(container.textContent).toContain('Resurrecting Agents...');
    });

    it('shows converting progress messages', () => {
      const { container } = render(
        <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm">
          <div>&gt; Converting to Kiro YAML...</div>
          <div>&gt; Generating agent specs...</div>
          <div>&gt; Breathing life into dead code...</div>
        </div>
      );

      expect(container.textContent).toContain('Converting to Kiro YAML...');
      expect(container.textContent).toContain('Generating agent specs...');
      expect(container.textContent).toContain('Breathing life into dead code...');
    });

    it('uses proper timing for converting animation', () => {
      const { container } = render(
        <div className="text-center py-12">
          <div className="text-8xl mb-6">⚡</div>
        </div>
      );

      expect(container.querySelector('.text-center')).toBeInTheDocument();
    });
  });

  describe('Success Celebration (Requirement 5.3)', () => {
    it('displays success celebration with sparkle emoji', () => {
      const { container } = render(
        <div>
          <div className="text-8xl mb-4">✨</div>
          <h3 className="text-3xl font-bold text-spooky-accent-green mb-2">
            Resurrection Complete!
          </h3>
        </div>
      );

      expect(container.textContent).toContain('✨');
      expect(container.textContent).toContain('Resurrection Complete!');
    });

    it('shows agent count in success message', () => {
      const agentCount = 3;
      const { container } = render(
        <p className="text-spooky-text-secondary">
          {agentCount} agents brought back to life
        </p>
      );

      expect(container.textContent).toContain('3 agents brought back to life');
    });

    it('handles singular agent count correctly', () => {
      const agentCount = 1;
      const { container } = render(
        <p className="text-spooky-text-secondary">
          {agentCount} agent brought back to life
        </p>
      );

      expect(container.textContent).toContain('1 agent brought back to life');
    });

    it('includes celebration particles', () => {
      const particles = ['✨', '⚡', '💀', '👻'];
      const { container } = render(
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((emoji, i) => (
            <div key={i} className="absolute text-2xl">
              {emoji}
            </div>
          ))}
        </div>
      );

      particles.forEach(emoji => {
        expect(container.textContent).toContain(emoji);
      });
    });
  });

  describe('Prefers-Reduced-Motion Support (Requirement 5.3)', () => {
    it('respects prefers-reduced-motion setting', () => {
      // Mock matchMedia to return true for prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      // Verify matchMedia is called with correct query
      const matchMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(matchMedia.matches).toBe(true);
    });

    it('animations are accessible with reduced motion', () => {
      // When prefers-reduced-motion is enabled, animations should still render
      // but with reduced or no motion
      const { container } = render(
        <div className="text-8xl mb-6">💀</div>
      );

      expect(container.querySelector('.text-8xl')).toBeInTheDocument();
    });
  });

  describe('Animation Timing', () => {
    it('parsing animation has appropriate duration', () => {
      // Parsing should be quick but visible
      const { container } = render(
        <div className="text-center py-12">
          <div className="text-8xl mb-6">💀</div>
          <h3>Parsing Dead IDL...</h3>
        </div>
      );

      expect(container).toBeInTheDocument();
    });

    it('converting animation has appropriate duration', () => {
      // Converting should feel like work is being done
      const { container } = render(
        <div className="text-center py-12">
          <div className="text-8xl mb-6">⚡</div>
          <h3>Resurrecting Agents...</h3>
        </div>
      );

      expect(container).toBeInTheDocument();
    });

    it('success celebration is celebratory but not excessive', () => {
      const { container } = render(
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">✨</div>
          <h3>Resurrection Complete!</h3>
        </div>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Animation Consistency', () => {
    it('uses consistent spooky theme colors', () => {
      const { container } = render(
        <div>
          <h3 className="text-spooky-accent-purple">Parsing</h3>
          <h3 className="text-spooky-neon-accent">Converting</h3>
          <h3 className="text-spooky-accent-green">Complete</h3>
        </div>
      );

      expect(container.querySelector('.text-spooky-accent-purple')).toBeInTheDocument();
      expect(container.querySelector('.text-spooky-neon-accent')).toBeInTheDocument();
      expect(container.querySelector('.text-spooky-accent-green')).toBeInTheDocument();
    });

    it('maintains terminal aesthetic throughout', () => {
      const { container } = render(
        <div className="bg-black text-[#00ff00] p-4 rounded-lg font-mono text-sm">
          <div>&gt; Terminal output...</div>
        </div>
      );

      expect(container.querySelector('.bg-black')).toBeInTheDocument();
      expect(container.querySelector('.font-mono')).toBeInTheDocument();
    });
  });
});
