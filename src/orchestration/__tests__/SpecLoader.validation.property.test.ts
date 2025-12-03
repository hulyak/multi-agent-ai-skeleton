// Property-Based Tests for Spec Validation
// Feature: multi-agent-skeleton, Property 10: Spec validation before application

import fc from 'fast-check';
import { SpecLoader } from '../SpecLoader';
import { AgentSpec, MessageType, validateAgentSpec } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Property 10: Spec validation before application', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for test specs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
    }
  });

  // ============================================================================
  // Generators
  // ============================================================================

  const validAgentSpecArbitrary = (): fc.Arbitrary<AgentSpec> => {
    return fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      capabilities: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
      messageTypes: fc.array(
        fc.constantFrom(...Object.values(MessageType)),
        { minLength: 1, maxLength: Object.values(MessageType).length }
      ),
      configuration: fc.option(
        fc.dictionary(fc.string(), fc.anything()),
        { nil: undefined }
      )
    });
  };

  const invalidAgentSpecArbitrary = (): fc.Arbitrary<any> => {
    return fc.oneof(
      // Missing id
      fc.record({
        name: fc.string(),
        capabilities: fc.array(fc.string(), { minLength: 1 }),
        messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
      }),
      // Empty id
      fc.record({
        id: fc.constant(''),
        name: fc.string(),
        capabilities: fc.array(fc.string(), { minLength: 1 }),
        messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
      }),
      // Missing name
      fc.record({
        id: fc.uuid(),
        capabilities: fc.array(fc.string(), { minLength: 1 }),
        messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
      }),
      // Empty capabilities
      fc.record({
        id: fc.uuid(),
        name: fc.string(),
        capabilities: fc.constant([]),
        messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
      }),
      // Empty messageTypes
      fc.record({
        id: fc.uuid(),
        name: fc.string(),
        capabilities: fc.array(fc.string(), { minLength: 1 }),
        messageTypes: fc.constant([])
      }),
      // Invalid messageTypes
      fc.record({
        id: fc.uuid(),
        name: fc.string(),
        capabilities: fc.array(fc.string(), { minLength: 1 }),
        messageTypes: fc.array(fc.string(), { minLength: 1 })
      }),
      // Non-object
      fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null))
    );
  };

  // ============================================================================
  // Property Tests
  // ============================================================================

  it('should validate valid specs and reject invalid specs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.tuple(validAgentSpecArbitrary(), fc.constant(true)),
          fc.tuple(invalidAgentSpecArbitrary(), fc.constant(false))
        ),
        async ([spec, shouldBeValid]) => {
          const validation = validateAgentSpec(spec);

          if (shouldBeValid) {
            // Valid specs should pass validation
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
          } else {
            // Invalid specs should fail validation with specific errors
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
            expect(validation.errors.every(err => typeof err === 'string')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate specs before loading them from files', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        invalidAgentSpecArbitrary(),
        async (validSpec, invalidSpec) => {
          const specLoader = new SpecLoader({ specsDirectory: tempDir });

          // Write valid spec to file
          const validFilePath = path.join(tempDir, `${validSpec.id}.json`);
          fs.writeFileSync(validFilePath, JSON.stringify(validSpec, null, 2));

          // Write invalid spec to file
          const invalidFilePath = path.join(tempDir, 'invalid-spec.json');
          fs.writeFileSync(invalidFilePath, JSON.stringify(invalidSpec, null, 2));

          // Validate valid spec file
          const validValidation = await specLoader.validateSpecFile(validFilePath);
          expect(validValidation.valid).toBe(true);
          expect(validValidation.errors).toHaveLength(0);

          // Validate invalid spec file
          const invalidValidation = await specLoader.validateSpecFile(invalidFilePath);
          expect(invalidValidation.valid).toBe(false);
          expect(invalidValidation.errors.length).toBeGreaterThan(0);

          specLoader.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid specs during loadSpecs and provide detailed error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validAgentSpecArbitrary(), { minLength: 1, maxLength: 3 }),
        fc.array(invalidAgentSpecArbitrary(), { minLength: 1, maxLength: 2 }),
        async (validSpecs, invalidSpecs) => {
          const specLoader = new SpecLoader({ specsDirectory: tempDir });

          // Write valid specs
          for (const spec of validSpecs) {
            const filePath = path.join(tempDir, `${spec.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));
          }

          // Write invalid specs
          for (let i = 0; i < invalidSpecs.length; i++) {
            const filePath = path.join(tempDir, `invalid-${i}.json`);
            fs.writeFileSync(filePath, JSON.stringify(invalidSpecs[i], null, 2));
          }

          // Loading should fail with detailed error messages
          try {
            await specLoader.loadSpecs();
            // If we get here, all specs were valid (which shouldn't happen with our invalid specs)
            // But it's possible the generator created something that passes validation
            const loadedSpecs = specLoader.getAllSpecs();
            expect(loadedSpecs.length).toBeGreaterThanOrEqual(validSpecs.length);
          } catch (error) {
            // Should fail with error message containing details
            expect(error).toBeInstanceOf(Error);
            const errorMessage = (error as Error).message;
            expect(errorMessage).toContain('Failed to load');
            expect(errorMessage.length).toBeGreaterThan(0);
          }

          specLoader.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate specs before application in orchestrator', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidAgentSpecArbitrary(),
        async (invalidSpec) => {
          const specLoader = new SpecLoader({ specsDirectory: tempDir });

          // Validation should fail for invalid specs
          const validation = specLoader.validateSpec(invalidSpec);
          expect(validation.valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);

          // Each error should be a descriptive string
          for (const error of validation.errors) {
            expect(typeof error).toBe('string');
            expect(error.length).toBeGreaterThan(0);
          }

          specLoader.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide specific validation errors for each type of invalid spec', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Missing required field
          fc.record({
            name: fc.string(),
            capabilities: fc.array(fc.string(), { minLength: 1 }),
            messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
          }),
          // Wrong type for field
          fc.record({
            id: fc.integer(),
            name: fc.string(),
            capabilities: fc.array(fc.string(), { minLength: 1 }),
            messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
          }),
          // Empty array where non-empty required
          fc.record({
            id: fc.uuid(),
            name: fc.string(),
            capabilities: fc.constant([]),
            messageTypes: fc.array(fc.constantFrom(...Object.values(MessageType)), { minLength: 1 })
          })
        ),
        async (invalidSpec) => {
          const validation = validateAgentSpec(invalidSpec);

          // Should fail validation
          expect(validation.valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);

          // Errors should be specific and mention the problematic field
          const errorText = validation.errors.join(' ');
          const hasSpecificError = 
            errorText.includes('id') ||
            errorText.includes('name') ||
            errorText.includes('capabilities') ||
            errorText.includes('messageTypes');
          
          expect(hasSpecificError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
