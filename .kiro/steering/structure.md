# Project Structure

## Directory Organization

```
src/
├── agents/          # Agent implementations
├── orchestration/   # Core orchestration framework
├── types/          # TypeScript type definitions
├── api/            # API documentation
├── ui/             # Reusable UI components
└── app/            # Next.js App Router (pages & API routes)
```

## Key Directories

### `src/agents/`
- All agent implementations extend `BaseAgent` abstract class
- Each agent handles specific message types and maintains state
- Agents: IntentDetection, FAQ, Escalation, Retrieval, Summarization, Citation
- Tests: `__tests__/*.property.test.ts` for each agent

### `src/orchestration/`
Core framework components:
- **MessageBus**: Message routing, delivery, retry logic
- **WorkflowStateManager**: Workflow and task state management
- **ErrorHandler**: Error classification, logging, failure propagation
- **ResourceAllocator**: Fair scheduling, starvation prevention
- **AgentOrchestrator**: High-level agent coordination
- **PerformanceMonitor**: Metrics collection and monitoring
- **DebugManager**: Debug logging and replay capabilities
- **SpecLoader**: Dynamic spec loading with file watching

### `src/types/`
Centralized type definitions:
- Message types, workflow types, agent types
- Error types, retry policies
- Domain-specific types (Intent, FAQEntry, Citation, Document)

### `src/ui/`
Reusable React components with Tailwind styling:
- Spooky-themed components (SpookyCard, SpookyButton, SpookyIcon, etc.)
- Workflow visualizations (WorkflowAnimation, ArchitectureDiagram)
- Agent monitoring (AgentConsole, AgentStatusSidebar)
- Theme tokens exported from `theme-tokens.ts`

### `src/app/`
Next.js App Router structure:
- **Pages**: `/`, `/multi-agent-demo`, `/support`, `/research`, `/spooky-demo`
- **API Routes**: `/api/message`, `/api/agent/[agentId]`, `/api/state/[workflowId]`, `/api/metrics`
- `layout.tsx`: Root layout with global styles
- `globals.css`: Global CSS and Tailwind directives

## File Naming Conventions

- Components: PascalCase (e.g., `AgentConsole.tsx`)
- Utilities/Classes: PascalCase (e.g., `MessageBus.ts`)
- Types: PascalCase in `index.ts`
- Tests: `*.test.ts` or `*.property.test.ts`
- Config files: lowercase with extensions (e.g., `jest.config.js`)

## Import Patterns

- Use path alias: `import { Agent } from '@/agents'`
- Barrel exports via `index.ts` in each directory
- Prefer named exports over default exports

## Testing Structure

- Tests colocated in `__tests__/` subdirectories
- Property-based tests for orchestration and agent logic
- Test naming: `ComponentName.property.test.ts` or `ComponentName.test.ts`
