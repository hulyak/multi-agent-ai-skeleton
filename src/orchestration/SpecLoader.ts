// Spec Loader - Loads and validates agent specifications from Kiro spec files

import * as fs from 'fs';
import * as path from 'path';
import { AgentSpec, validateAgentSpec, ValidationResult } from '../types';
import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';

// ============================================================================
// Spec Loader Configuration
// ============================================================================

export interface SpecLoaderConfig {
  specsDirectory: string;
  watchForChanges?: boolean;
  autoRegenerate?: boolean;
}

// ============================================================================
// Spec Change Event
// ============================================================================

export interface SpecChangeEvent {
  type: 'added' | 'modified' | 'deleted';
  specId: string;
  spec?: AgentSpec;
  timestamp: number;
}

// ============================================================================
// Spec Loader
// ============================================================================

export class SpecLoader extends EventEmitter {
  private config: SpecLoaderConfig;
  private loadedSpecs: Map<string, AgentSpec> = new Map();
  private watcher: chokidar.FSWatcher | null = null;
  private isWatching: boolean = false;

  constructor(config: SpecLoaderConfig) {
    super();
    this.config = {
      watchForChanges: false,
      autoRegenerate: false,
      ...config
    };
  }

  // ============================================================================
  // Spec Loading
  // ============================================================================

  /**
   * Load all agent specifications from the specs directory
   */
  async loadSpecs(): Promise<AgentSpec[]> {
    const specsDir = this.config.specsDirectory;

    // Check if directory exists
    if (!fs.existsSync(specsDir)) {
      throw new Error(`Specs directory does not exist: ${specsDir}`);
    }

    const specs: AgentSpec[] = [];
    const errors: string[] = [];

    // Read all JSON files in the directory
    const files = fs.readdirSync(specsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(specsDir, file);
      
      try {
        const spec = await this.loadSpecFile(filePath);
        specs.push(spec);
        this.loadedSpecs.set(spec.id, spec);
      } catch (error) {
        const errorMessage = `Failed to load spec from ${file}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMessage);
        
        // Emit error event if watching is enabled
        if (this.config.watchForChanges) {
          this.emit('spec-error', {
            filename: file,
            error: errorMessage,
            timestamp: Date.now()
          });
        }
      }
    }

    // If there were errors and we're not in watch mode, throw
    if (errors.length > 0 && !this.config.watchForChanges) {
      throw new Error(`Failed to load some specs:\n${errors.join('\n')}`);
    }

    // Start watching for changes if configured
    if (this.config.watchForChanges && !this.isWatching) {
      this.startWatching();
    }

    return specs;
  }

  /**
   * Load a single spec file
   */
  async loadSpecFile(filePath: string): Promise<AgentSpec> {
    // Read file
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse JSON
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Invalid JSON in spec file: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Validate spec
    const validation = validateAgentSpec(parsedContent);
    if (!validation.valid) {
      throw new Error(`Invalid agent specification:\n${validation.errors.join('\n')}`);
    }

    return parsedContent as AgentSpec;
  }

  /**
   * Get a loaded spec by ID
   */
  getSpec(specId: string): AgentSpec | undefined {
    return this.loadedSpecs.get(specId);
  }

  /**
   * Get all loaded specs
   */
  getAllSpecs(): AgentSpec[] {
    return Array.from(this.loadedSpecs.values());
  }

  // ============================================================================
  // Spec Validation
  // ============================================================================

  /**
   * Validate a spec object
   */
  validateSpec(spec: any): ValidationResult {
    return validateAgentSpec(spec);
  }

  /**
   * Validate a spec file without loading it
   */
  async validateSpecFile(filePath: string): Promise<ValidationResult> {
    try {
      await this.loadSpecFile(filePath);
      return { valid: true, errors: [] };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  // ============================================================================
  // File Watching
  // ============================================================================

  /**
   * Start watching for spec file changes using chokidar
   */
  private startWatching(): void {
    if (this.isWatching) {
      return;
    }

    const specsDir = this.config.specsDirectory;

    // Use chokidar for reliable cross-platform file watching
    this.watcher = chokidar.watch(path.join(specsDir, '*.json'), {
      persistent: true,
      ignoreInitial: true, // Don't emit events for existing files
      awaitWriteFinish: {
        stabilityThreshold: 50, // Wait for file writes to finish
        pollInterval: 10
      }
    });

    // Handle file additions
    this.watcher.on('add', async (filePath: string) => {
      const filename = path.basename(filePath);
      await this.handleFileAdded(filePath, filename);
    });

    // Handle file modifications
    this.watcher.on('change', async (filePath: string) => {
      const filename = path.basename(filePath);
      await this.handleFileModified(filePath, filename);
    });

    // Handle file deletions
    this.watcher.on('unlink', async (filePath: string) => {
      const filename = path.basename(filePath);
      await this.handleFileDeleted(filePath, filename);
    });

    // Handle watcher errors
    this.watcher.on('error', (error: unknown) => {
      this.emit('watcher-error', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    });

    this.isWatching = true;
  }

  /**
   * Handle file addition
   */
  private async handleFileAdded(filePath: string, filename: string): Promise<void> {
    try {
      const spec = await this.loadSpecFile(filePath);
      this.loadedSpecs.set(spec.id, spec);

      const changeEvent: SpecChangeEvent = {
        type: 'added',
        specId: spec.id,
        spec,
        timestamp: Date.now()
      };

      this.emit('spec-changed', changeEvent);

      if (this.config.autoRegenerate) {
        this.emit('regenerate-required', changeEvent);
      }
    } catch (error) {
      this.emit('spec-error', {
        filename,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle file modification
   */
  private async handleFileModified(filePath: string, filename: string): Promise<void> {
    try {
      const spec = await this.loadSpecFile(filePath);
      this.loadedSpecs.set(spec.id, spec);

      const changeEvent: SpecChangeEvent = {
        type: 'modified',
        specId: spec.id,
        spec,
        timestamp: Date.now()
      };

      this.emit('spec-changed', changeEvent);

      if (this.config.autoRegenerate) {
        this.emit('regenerate-required', changeEvent);
      }
    } catch (error) {
      this.emit('spec-error', {
        filename,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle file deletion
   */
  private async handleFileDeleted(_filePath: string, filename: string): Promise<void> {
    // Find the spec that was deleted
    const deletedSpec = Array.from(this.loadedSpecs.values()).find(
      spec => this.getSpecFileName(spec) === filename
    );

    if (deletedSpec) {
      this.loadedSpecs.delete(deletedSpec.id);

      const changeEvent: SpecChangeEvent = {
        type: 'deleted',
        specId: deletedSpec.id,
        timestamp: Date.now()
      };

      this.emit('spec-changed', changeEvent);

      if (this.config.autoRegenerate) {
        this.emit('regenerate-required', changeEvent);
      }
    }
  }

  /**
   * Stop watching for spec file changes
   */
  async stopWatching(): Promise<void> {
    if (!this.isWatching) {
      return;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    this.isWatching = false;
  }

  /**
   * Get the filename for a spec
   */
  private getSpecFileName(spec: AgentSpec): string {
    return `${spec.id}.json`;
  }

  // ============================================================================
  // Code Generation
  // ============================================================================

  /**
   * Generate agent scaffolding code from a spec
   */
  generateAgentCode(spec: AgentSpec): string {
    const className = this.toPascalCase(spec.name);
    const messageTypesImport = spec.messageTypes.join(', ');

    return `// ${spec.name} - Auto-generated from spec
import { BaseAgent, MessageResponse } from './Agent';
import { MessageObject, MessageType } from '../types';

export class ${className} extends BaseAgent {
  constructor() {
    super(
      '${spec.id}',
      '${spec.name}',
      ${JSON.stringify(spec.capabilities, null, 6)},
      ${JSON.stringify(spec.configuration || {}, null, 6)}
    );
  }

  protected async processMessage(message: MessageObject): Promise<Record<string, any>> {
    // TODO: Implement message processing logic
    switch (message.type) {
${spec.messageTypes.map(type => `      case MessageType.${type}:
        return this.handle${this.toPascalCase(type)}(message);`).join('\n')}
      default:
        throw new Error(\`Unsupported message type: \${message.type}\`);
    }
  }

  protected getSupportedMessageTypes(): MessageType[] {
    return [${messageTypesImport}];
  }

${spec.messageTypes.map(type => `  private async handle${this.toPascalCase(type)}(message: MessageObject): Promise<Record<string, any>> {
    // TODO: Implement ${type} handling
    return { success: true };
  }`).join('\n\n')}
}
`;
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopWatching();
    this.loadedSpecs.clear();
    this.removeAllListeners();
  }
}
