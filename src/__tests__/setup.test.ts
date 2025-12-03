/**
 * Basic test to verify Jest and fast-check setup
 */
import fc from 'fast-check';

describe('Testing Framework Setup', () => {
  it('should run basic Jest tests', () => {
    expect(true).toBe(true);
  });

  it('should run fast-check property tests', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });

  it('should support TypeScript strict mode', () => {
    const value: string = 'test';
    expect(typeof value).toBe('string');
  });
});
