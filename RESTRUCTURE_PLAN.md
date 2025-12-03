# Restructure Plan for Skeleton Crew Compliance

## Goal
Restructure the monorepo into 3 separate folders to meet Kiroween Skeleton Crew requirements:
- `skeleton/` - The core multi-agent framework (the template)
- `app-support/` - Support Copilot application
- `app-research/` - Research Copilot application

## Current Structure
```
multi-agent-ai-skeleton/
├── src/
│   ├── agents/           # All 6 agents
│   ├── orchestration/    # Core runtime
│   ├── types/            # Shared types
│   ├── ui/               # UI components
│   └── app/              # Next.js with /apps/support and /apps/research
```

## Target Structure
```
multi-agent-ai-skeleton/
├── README.md             # Main overview pointing to 3 folders
├── skeleton/             # THE CORE TEMPLATE
│   ├── src/
│   │   ├── orchestration/  # MessageBus, StateManager, ErrorHandler, etc.
│   │   ├── agents/         # BaseAgent class only
│   │   ├── types/          # Core type definitions
│   │   └── ui/             # Shared UI components (optional)
│   ├── .kiro/
│   │   └── specs/          # Spec template for creating agents
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md           # How to use the skeleton
│
├── app-support/          # APPLICATION 1: Support Copilot
│   ├── src/
│   │   ├── agents/         # IntentDetection, FAQ, Escalation, Citation
│   │   ├── app/            # Next.js pages for support
│   │   └── lib/            # Imports from skeleton
│   ├── .kiro/
│   │   └── specs/          # Support-specific specs
│   ├── package.json        # Depends on ../skeleton or copies it
│   ├── tsconfig.json
│   └── README.md           # Support Copilot docs
│
└── app-research/         # APPLICATION 2: Research Copilot
    ├── src/
    │   ├── agents/         # Retrieval, Summarization, Citation
    │   ├── app/            # Next.js pages for research
    │   └── lib/            # Imports from skeleton
    ├── .kiro/
    │   └── specs/          # Research-specific specs
    ├── package.json        # Depends on ../skeleton or copies it
    ├── tsconfig.json
    └── README.md           # Research Copilot docs
```

## Implementation Strategy

### Phase 1: Create Skeleton Folder
1. Create `skeleton/` directory
2. Copy core orchestration files
3. Copy base Agent class
4. Copy shared types
5. Create skeleton package.json
6. Create skeleton README explaining the framework

### Phase 2: Create app-support/
1. Create `app-support/` directory
2. Set up Next.js structure
3. Copy support-specific agents (Intent, FAQ, Escalation)
4. Copy support page from `/apps/support`
5. Configure to import from skeleton
6. Create app-specific README

### Phase 3: Create app-research/
1. Create `app-research/` directory
2. Set up Next.js structure
3. Copy research-specific agents (Retrieval, Summarization)
4. Copy research page from `/apps/research`
5. Configure to import from skeleton
6. Create app-specific README

### Phase 4: Landing Page Decision
Option A: Keep landing page in root with links to both apps
Option B: Move landing page to skeleton as a demo
Option C: Create separate landing page repo

### Phase 5: Update Documentation
1. Update main README to explain the 3-folder structure
2. Create GETTING_STARTED.md for each app
3. Update TECHNICAL_WRITEUP.md to reflect new structure
4. Ensure each folder can run independently

## File Distribution

### Skeleton (Core Framework)
- `src/orchestration/*` - All orchestration files
- `src/agents/Agent.ts` - Base agent class only
- `src/types/*` - Core type definitions
- Tests for orchestration layer

### app-support/
- `src/agents/IntentDetectionAgent.ts`
- `src/agents/FAQAgent.ts`
- `src/agents/EscalationAgent.ts`
- `src/agents/CitationAgent.ts`
- `src/app/page.tsx` - Support UI
- Tests for support agents

### app-research/
- `src/agents/RetrievalAgent.ts`
- `src/agents/SummarizationAgent.ts`
- `src/agents/CitationAgent.ts` (shared with support)
- `src/orchestration/ResearchWorkflowCoordinator.ts`
- `src/app/page.tsx` - Research UI
- Tests for research agents

## Shared Code Strategy

**Option 1: Copy (Simpler for judges)**
- Each app gets a full copy of skeleton code
- Pros: Completely independent, easy to understand
- Cons: Code duplication

**Option 2: npm workspace (More elegant)**
- Use npm workspaces to share skeleton
- Apps import from `@skeleton/core`
- Pros: No duplication, shows real-world usage
- Cons: Slightly more complex setup

**Recommendation: Option 1 for submission clarity**

## Next Steps
1. Backup current code
2. Create skeleton folder structure
3. Move files systematically
4. Test each app independently
5. Update all documentation
6. Verify both apps run standalone

## Timeline
- Phase 1: 30 minutes
- Phase 2: 30 minutes
- Phase 3: 30 minutes
- Phase 4: 15 minutes
- Phase 5: 30 minutes
- Testing: 30 minutes
**Total: ~3 hours**
