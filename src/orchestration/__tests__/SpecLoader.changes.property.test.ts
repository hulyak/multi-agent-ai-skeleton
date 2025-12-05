// Property-Based Tests for Spec Change Detection
// Feature: idl-resurrection, Property 9: Spec change detection and regeneration

import fc from 'fast-check';
import { SpecLoader, SpecChangeEvent } from '../SpecLoader';
import { AgentSpec, MessageType } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Property 9: Spec change detection and regeneration', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for test specs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-test-'));
  });

  afterEach(async () => {
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

  // ============================================================================
  // Property Tests
  // ============================================================================

  it('should detect when spec files are added', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        async (spec) => {
          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true
          });

          // Load initial specs (empty directory)
          await specLoader.loadSpecs();

          // Set up event listener before adding file
          const changeEvents: SpecChangeEvent[] = [];
          specLoader.on('spec-changed', (event: SpecChangeEvent) => {
            changeEvents.push(event);
          });

          // Give watcher time to initialize
          await new Promise(resolve => setTimeout(resolve, 200));

          // Add a new spec file
          const filePath = path.join(tempDir, `${spec.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));

          // Wait for file watcher to detect change (chokidar is more reliable)
          await new Promise(resolve => setTimeout(resolve, 200));

          // Should have detected the addition
          expect(changeEvents.length).toBeGreaterThan(0);
          const addEvent = changeEvents.find(e => e.type === 'added' && e.specId === spec.id);
          expect(addEvent).toBeDefined();
          if (addEvent) {
            expect(addEvent.spec).toBeDefined();
            expect(addEvent.spec?.id).toBe(spec.id);
          }

          await specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000);

  it('should detect when spec files are modified', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (originalSpec, newName) => {
          // Skip if the new name is the same as the original
          fc.pre(newName !== originalSpec.name);

          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true
          });

          // Write initial spec
          const filePath = path.join(tempDir, `${originalSpec.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(originalSpec, null, 2));

          // Load specs
          await specLoader.loadSpecs();

          // Set up event listener
          const changeEvents: SpecChangeEvent[] = [];
          specLoader.on('spec-changed', (event: SpecChangeEvent) => {
            changeEvents.push(event);
          });

          // Give watcher time to initialize
          await new Promise(resolve => setTimeout(resolve, 200));

          // Modify the spec
          const modifiedSpec = { ...originalSpec, name: newName };
          fs.writeFileSync(filePath, JSON.stringify(modifiedSpec, null, 2));

          // Wait for file watcher to detect change
          await new Promise(resolve => setTimeout(resolve, 200));

          // Should have detected the modification
          expect(changeEvents.length).toBeGreaterThan(0);
          const modifyEvent = changeEvents.find(e => e.type === 'modified' && e.specId === originalSpec.id);
          expect(modifyEvent).toBeDefined();
          if (modifyEvent) {
            expect(modifyEvent.spec).toBeDefined();
            expect(modifyEvent.spec?.name).toBe(newName);
          }

          await specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000);

  it('should detect when spec files are deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        async (spec) => {
          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true
          });

          // Write initial spec
          const filePath = path.join(tempDir, `${spec.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));

          // Load specs
          await specLoader.loadSpecs();

          // Set up event listener
          const changeEvents: SpecChangeEvent[] = [];
          specLoader.on('spec-changed', (event: SpecChangeEvent) => {
            changeEvents.push(event);
          });

          // Give watcher time to initialize
          await new Promise(resolve => setTimeout(resolve, 200));

          // Delete the spec file
          fs.unlinkSync(filePath);

          // Wait for file watcher to detect change
          await new Promise(resolve => setTimeout(resolve, 200));

          // Should have detected the deletion
          expect(changeEvents.length).toBeGreaterThan(0);
          const deleteEvent = changeEvents.find(e => e.type === 'deleted' && e.specId === spec.id);
          expect(deleteEvent).toBeDefined();

          await specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000);

  it('should emit regenerate-required events when autoRegenerate is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        async (spec) => {
          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true,
            autoRegenerate: true
          });

          // Load initial specs (empty directory)
          await specLoader.loadSpecs();

          // Set up event listeners
          const regenerateEvents: SpecChangeEvent[] = [];
          specLoader.on('regenerate-required', (event: SpecChangeEvent) => {
            regenerateEvents.push(event);
          });

          // Give watcher time to initialize
          await new Promise(resolve => setTimeout(resolve, 200));

          // Add a new spec file
          const filePath = path.join(tempDir, `${spec.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));

          // Wait for file watcher to detect change
          await new Promise(resolve => setTimeout(resolve, 200));

          // Should have emitted regenerate-required event
          expect(regenerateEvents.length).toBeGreaterThan(0);
          const regenEvent = regenerateEvents.find(e => e.specId === spec.id);
          expect(regenEvent).toBeDefined();

          await specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000);

  it('should generate updated code artifacts when specs change', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (originalSpec, newName) => {
          // Skip if the new name is the same as the original
          fc.pre(newName !== originalSpec.name);

          const specLoader = new SpecLoader({
            specsDirectory: tempDir
          });

          // Generate code for original spec
          const originalCode = specLoader.generateAgentCode(originalSpec);
          expect(originalCode).toContain(originalSpec.name);

          // Generate code for modified spec
          const modifiedSpec = { ...originalSpec, name: newName };
          const modifiedCode = specLoader.generateAgentCode(modifiedSpec);
          expect(modifiedCode).toContain(newName);

          // Code should be different
          expect(originalCode).not.toBe(modifiedCode);

          // Both should be valid TypeScript-like code
          expect(originalCode).toContain('class');
          expect(originalCode).toContain('extends BaseAgent');
          expect(modifiedCode).toContain('class');
          expect(modifiedCode).toContain('extends BaseAgent');

          await specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000);

  it('should update loaded specs when files change', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
        async (originalSpec, newCapabilities) => {
          // Skip if capabilities are the same
          fc.pre(JSON.stringify(newCapabilities) !== JSON.stringify(originalSpec.capabilities));

          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true
          });

          // Write initial spec
          const filePath = path.join(tempDir, `${originalSpec.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(originalSpec, null, 2));

          // Load specs
          await specLoader.loadSpecs();

          // Verify original spec is loaded
          const loadedOriginal = specLoader.getSpec(originalSpec.id);
          expect(loadedOriginal).toBeDefined();
          expect(loadedOriginal?.capabilities).toEqual(originalSpec.capabilities);

          // Give watcher time to initialize
          await new Promise(resolve => setTimeout(resolve, 200));

          // Modify the spec
          const modifiedSpec = { ...originalSpec, capabilities: newCapabilities };
          fs.writeFileSync(filePath, JSON.stringify(modifiedSpec, null, 2));

          // Wait for file watcher to detect change
          await new Promise(resolve => setTimeout(resolve, 200));

          // Verify modified spec is now loaded
          const loadedModified = specLoader.getSpec(originalSpec.id);
          expect(loadedModified).toBeDefined();
          expect(loadedModified?.capabilities).toEqual(newCapabilities);

          await specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should handle multiple concurrent spec changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validAgentSpecArbitrary(), { minLength: 2, maxLength: 5 }),
        async (specs) => {
          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true
          });

          // Load initial specs (empty directory)
          await specLoader.loadSpecs();

          // Set up event listener
          const changeEvents: SpecChangeEvent[] = [];
          specLoader.on('spec-changed', (event: SpecChangeEvent) => {
            changeEvents.push(event);
          });

          // Add multiple spec files concurrently
          for (const spec of specs) {
            const filePath = path.join(tempDir, `${spec.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));
          }

          // Wait for file watcher to detect all changes
          await new Promise(resolve => setTimeout(resolve, 200));

          // Should have detected all additions
          expect(changeEvents.length).toBeGreaterThanOrEqual(specs.length);
          
          // Each spec should have a corresponding event
          for (const spec of specs) {
            const event = changeEvents.find(e => e.specId === spec.id);
            expect(event).toBeDefined();
          }

          specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 15000);

  it('should emit spec-error events for invalid spec changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        validAgentSpecArbitrary(),
        async (validSpec) => {
          const specLoader = new SpecLoader({
            specsDirectory: tempDir,
            watchForChanges: true
          });

          // Load initial specs (empty directory)
          await specLoader.loadSpecs();

          // Set up event listeners
          const errorEvents: any[] = [];
          specLoader.on('spec-error', (event: any) => {
            errorEvents.push(event);
          });

          // Write an invalid spec file (missing required fields)
          const invalidSpec = { id: validSpec.id }; // Missing name, capabilities, messageTypes
          const filePath = path.join(tempDir, `${validSpec.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(invalidSpec, null, 2));

          // Wait for file watcher to detect change
          await new Promise(resolve => setTimeout(resolve, 100));

          // Should have emitted spec-error event
          expect(errorEvents.length).toBeGreaterThan(0);
          const errorEvent = errorEvents[0];
          expect(errorEvent.error).toBeDefined();
          expect(typeof errorEvent.error).toBe('string');

          specLoader.cleanup();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000);
});
