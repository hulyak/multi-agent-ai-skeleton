// Demo script to showcase SpecLoader functionality
// This is not a test file, just a demonstration

import { SpecLoader } from './SpecLoader';
import * as path from 'path';

async function demonstrateSpecLoader() {
  console.log('=== SpecLoader Demonstration ===\n');

  // Create a SpecLoader instance
  const specsDir = path.join(process.cwd(), '.kiro/specs/agents');
  const specLoader = new SpecLoader({
    specsDirectory: specsDir,
    watchForChanges: false
  });

  try {
    // 1. Load all specs
    console.log('1. Loading agent specifications...');
    const specs = await specLoader.loadSpecs();
    console.log(`   ✓ Loaded ${specs.length} spec(s)\n`);

    // 2. Display loaded specs
    for (const spec of specs) {
      console.log(`   Agent: ${spec.name} (${spec.id})`);
      console.log(`   Capabilities: ${spec.capabilities.join(', ')}`);
      console.log(`   Message Types: ${spec.messageTypes.join(', ')}`);
      console.log('');
    }

    // 3. Generate code for each spec
    console.log('2. Generating agent code...\n');
    for (const spec of specs) {
      console.log(`   Generating code for ${spec.name}...`);
      const code = specLoader.generateAgentCode(spec);
      console.log(`   ✓ Generated ${code.split('\n').length} lines of code\n`);
      
      // Show a snippet of the generated code
      const lines = code.split('\n');
      console.log('   Code snippet:');
      console.log('   ' + lines.slice(0, 10).join('\n   '));
      console.log('   ...\n');
    }

    // 4. Validate a spec
    console.log('3. Validating specifications...');
    for (const spec of specs) {
      const validation = specLoader.validateSpec(spec);
      console.log(`   ${spec.name}: ${validation.valid ? '✓ Valid' : '✗ Invalid'}`);
      if (!validation.valid) {
        validation.errors.forEach(err => console.log(`     - ${err}`));
      }
    }
    console.log('');

    // 5. Test invalid spec validation
    console.log('4. Testing invalid spec validation...');
    const invalidSpec = {
      id: 'invalid-agent',
      // Missing required fields: name, capabilities, messageTypes
    };
    const invalidValidation = specLoader.validateSpec(invalidSpec);
    console.log(`   Invalid spec validation: ${invalidValidation.valid ? '✓ Valid' : '✗ Invalid (as expected)'}`);
    if (!invalidValidation.valid) {
      console.log('   Validation errors:');
      invalidValidation.errors.forEach(err => console.log(`     - ${err}`));
    }
    console.log('');

    console.log('=== Demonstration Complete ===');

  } catch (error) {
    console.error('Error during demonstration:', error);
  } finally {
    await specLoader.cleanup();
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  demonstrateSpecLoader().catch(console.error);
}

export { demonstrateSpecLoader };
