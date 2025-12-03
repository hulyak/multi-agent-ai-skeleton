# Step-by-Step Restructure Guide

## ⚠️ BEFORE YOU START
```bash
# Create a backup branch
git add .
git commit -m "Pre-restructure backup"
git branch backup-before-restructure
```

## Quick Alternative: Simpler Compliance

**If you're short on time**, consider this simpler approach that may satisfy the requirements:

### Option: Keep Current Structure, Add Clarity

The requirements say "2 separate repo folders for 2 separate applications." You could argue that your current structure already has this:

```
multi-agent-ai-skeleton/
├── src/                    # THE SKELETON (shared framework)
│   ├── orchestration/
│   ├── agents/
│   └── types/
├── app-support/            # APPLICATION 1 (create this)
│   └── (move src/app/apps/support here)
└── app-research/           # APPLICATION 2 (create this)
    └── (move src/app/apps/research here)
```

This is much simpler and might be acceptable. Let me know if you want this approach instead.

---

## Full Restructure (If You Have Time)

### Phase 1: Create Skeleton Folder (30 min)

```bash
# 1. Create skeleton directory structure
mkdir -p skeleton/src/{orchestration,agents,types}
mkdir -p skeleton/.kiro/specs

# 2. Copy orchestration files
cp -r src/orchestration/* skeleton/src/orchestration/
cp -r src/types/* skeleton/src/types/

# 3. Copy ONLY base agent
cp src/agents/Agent.ts skeleton/src/agents/
cp src/agents/index.ts skeleton/src/agents/

# 4. Copy config files
cp package.json skeleton/
cp tsconfig.json skeleton/
cp jest.config.js skeleton/
cp jest.setup.js skeleton/
cp next.config.ts skeleton/
cp tailwind.config.ts skeleton/
cp postcss.config.mjs skeleton/
cp .eslintrc.json skeleton/

# 5. Copy specs
cp -r .kiro/specs/agent-template.md skeleton/.kiro/specs/
```

Now edit `skeleton/package.json`:
```json
{
  "name": "@multi-agent-skeleton/core",
  "version": "1.0.0",
  "description": "Core multi-agent orchestration framework",
  "main": "src/index.ts",
  "scripts": {
    "test": "jest",
    "lint": "eslint src/"
  }
}
```

Create `skeleton/README.md`:
```markdown
# Multi-Agent Skeleton Core

The core framework for building multi-agent AI applications.

## What's Included

- **Message Bus**: Event-driven communication
- **State Manager**: Centralized workflow state
- **Error Handler**: Robust error handling with retry
- **Resource Allocator**: Fair agent scheduling
- **Base Agent**: Abstract class for all agents

## How to Use

1. Copy this skeleton to your project
2. Extend `BaseAgent` to create custom agents
3. Use the orchestration layer to coordinate agents

See `app-support/` and `app-research/` for examples.
```

**Commit:** `git add skeleton/ && git commit -m "Phase 1: Create skeleton folder"`

---

### Phase 2: Create app-support (45 min)

```bash
# 1. Create directory
mkdir -p app-support/src/{agents,app}

# 2. Copy support-specific agents
cp src/agents/IntentDetectionAgent.ts app-support/src/agents/
cp src/agents/FAQAgent.ts app-support/src/agents/
cp src/agents/EscalationAgent.ts app-support/src/agents/
cp src/agents/CitationAgent.ts app-support/src/agents/

# 3. Copy support-specific tests
mkdir -p app-support/src/agents/__tests__
cp src/agents/__tests__/IntentDetectionAgent.property.test.ts app-support/src/agents/__tests__/
cp src/agents/__tests__/FAQAgent.property.test.ts app-support/src/agents/__tests__/
cp src/agents/__tests__/EscalationAgent.property.test.ts app-support/src/agents/__tests__/
cp src/agents/__tests__/CitationAgent.property.test.ts app-support/src/agents/__tests__/

# 4. Copy the skeleton framework into app
cp -r skeleton/src/orchestration app-support/src/
cp -r skeleton/src/types app-support/src/
cp skeleton/src/agents/Agent.ts app-support/src/agents/

# 5. Copy support page
cp -r src/app/apps/support/* app-support/src/app/

# 6. Copy UI components
cp -r src/ui app-support/src/

# 7. Copy config files
cp package.json app-support/
cp tsconfig.json app-support/
cp next.config.ts app-support/
cp tailwind.config.ts app-support/
cp postcss.config.mjs app-support/
cp .eslintrc.json app-support/
cp jest.config.js app-support/
cp jest.setup.js app-support/

# 8. Create app structure
mkdir -p app-support/src/app
cp src/app/layout.tsx app-support/src/app/
cp src/app/globals.css app-support/src/app/
```

Edit `app-support/package.json`:
```json
{
  "name": "support-copilot",
  "version": "1.0.0",
  "description": "AI-powered support copilot built on multi-agent skeleton",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "test": "jest"
  }
}
```

Create `app-support/README.md`:
```markdown
# Support Copilot

AI-powered customer support automation using the multi-agent skeleton.

## Features

- Intent detection
- FAQ matching
- Escalation routing
- Citation tracking

## Agents

- **IntentDetectionAgent**: Classifies user queries
- **FAQAgent**: Matches questions to knowledge base
- **EscalationAgent**: Routes complex queries to humans
- **CitationAgent**: Tracks information sources

## Running

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3001
```

**Commit:** `git add app-support/ && git commit -m "Phase 2: Create app-support"`

---

### Phase 3: Create app-research (45 min)

```bash
# 1. Create directory
mkdir -p app-research/src/{agents,app,orchestration}

# 2. Copy research-specific agents
cp src/agents/RetrievalAgent.ts app-research/src/agents/
cp src/agents/SummarizationAgent.ts app-research/src/agents/
cp src/agents/CitationAgent.ts app-research/src/agents/

# 3. Copy research-specific tests
mkdir -p app-research/src/agents/__tests__
cp src/agents/__tests__/RetrievalAgent.property.test.ts app-research/src/agents/__tests__/
cp src/agents/__tests__/SummarizationAgent.property.test.ts app-research/src/agents/__tests__/
cp src/agents/__tests__/CitationAgent.property.test.ts app-research/src/agents/__tests__/

# 4. Copy research coordinator
cp src/orchestration/ResearchWorkflowCoordinator.ts app-research/src/orchestration/
cp src/orchestration/__tests__/ResearchWorkflowCoordinator.property.test.ts app-research/src/orchestration/__tests__/

# 5. Copy the skeleton framework
cp -r skeleton/src/orchestration/* app-research/src/orchestration/
cp -r skeleton/src/types app-research/src/
cp skeleton/src/agents/Agent.ts app-research/src/agents/

# 6. Copy research page
cp -r src/app/apps/research/* app-research/src/app/

# 7. Copy UI components
cp -r src/ui app-research/src/

# 8. Copy config files
cp package.json app-research/
cp tsconfig.json app-research/
cp next.config.ts app-research/
cp tailwind.config.ts app-research/
cp postcss.config.mjs app-research/
cp .eslintrc.json app-research/
cp jest.config.js app-research/
cp jest.setup.js app-research/

# 9. Create app structure
mkdir -p app-research/src/app
cp src/app/layout.tsx app-research/src/app/
cp src/app/globals.css app-research/src/app/
```

Edit `app-research/package.json`:
```json
{
  "name": "research-copilot",
  "version": "1.0.0",
  "description": "AI-powered research assistant built on multi-agent skeleton",
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "test": "jest"
  }
}
```

Create `app-research/README.md`:
```markdown
# Research Copilot

AI-powered research assistant using the multi-agent skeleton.

## Features

- Document retrieval
- Content summarization
- Citation generation
- Research workflow coordination

## Agents

- **RetrievalAgent**: Searches document repositories
- **SummarizationAgent**: Condenses long documents
- **CitationAgent**: Generates proper citations
- **ResearchWorkflowCoordinator**: Orchestrates research tasks

## Running

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3002
```

**Commit:** `git add app-research/ && git commit -m "Phase 3: Create app-research"`

---

### Phase 4: Update Root README (15 min)

Create new root `README.md`:

```markdown
# Multi-Agent AI Skeleton - Kiroween 2024

> Skeleton Crew Category: A versatile multi-agent framework with two distinct applications

## 📁 Repository Structure

This repository contains:

1. **`skeleton/`** - The core multi-agent orchestration framework
2. **`app-support/`** - Support Copilot application
3. **`app-research/`** - Research Copilot application

## 🦴 The Skeleton

The `skeleton/` folder contains the reusable framework:

- Event-driven message bus
- Centralized state management
- Error handling with retry logic
- Resource allocation
- Base agent class

[View Skeleton Documentation](./skeleton/README.md)

## 💀 Application 1: Support Copilot

Customer support automation with intelligent routing.

**Location:** `app-support/`
**Port:** 3001
**Agents:** Intent Detection, FAQ, Escalation, Citation

```bash
cd app-support
npm install
npm run dev
```

[View Support Copilot Documentation](./app-support/README.md)

## 👻 Application 2: Research Copilot

Research workflow automation with document retrieval.

**Location:** `app-research/`
**Port:** 3002
**Agents:** Retrieval, Summarization, Citation, Coordinator

```bash
cd app-research
npm install
npm run dev
```

[View Research Copilot Documentation](./app-research/README.md)

## 🎃 Versatility Demonstrated

Both applications use the same skeleton but serve completely different purposes:

| Feature | Support Copilot | Research Copilot |
|---------|----------------|------------------|
| **Purpose** | Customer support | Research assistance |
| **Input** | User questions | Research queries |
| **Output** | Support responses | Summarized findings |
| **Agents** | Intent, FAQ, Escalation | Retrieval, Summarization |
| **Workflow** | Query → Route → Respond | Query → Retrieve → Summarize |

## 🚀 Quick Start

```bash
# Run both applications
cd app-support && npm install && npm run dev &
cd app-research && npm install && npm run dev &
```

## 📚 Documentation

- [Technical Writeup](./TECHNICAL_WRITEUP.md)
- [Skeleton Documentation](./skeleton/README.md)
- [Support Copilot Docs](./app-support/README.md)
- [Research Copilot Docs](./app-research/README.md)

## 🎨 Built for Kiroween 2024

Category: Skeleton Crew
Theme: Spooky multi-agent orchestration
```

**Commit:** `git add README.md && git commit -m "Phase 4: Update root README"`

---

### Phase 5: Test Each App (30 min)

```bash
# Test skeleton
cd skeleton
npm install
npm test

# Test support app
cd ../app-support
npm install
npm run build
npm run dev  # Check http://localhost:3001

# Test research app
cd ../app-research
npm install
npm run build
npm run dev  # Check http://localhost:3002
```

---

### Phase 6: Clean Up Old Structure (Optional)

Once everything works:

```bash
# Remove old src/ directory
rm -rf src/

# Remove old app structure
# Keep the landing page if you want it in root
```

---

## Final Structure

```
multi-agent-ai-skeleton/
├── README.md                    # Overview of all 3 folders
├── TECHNICAL_WRITEUP.md
├── skeleton/                    # THE FRAMEWORK
│   ├── src/
│   │   ├── orchestration/
│   │   ├── agents/Agent.ts
│   │   └── types/
│   ├── package.json
│   └── README.md
├── app-support/                 # APPLICATION 1
│   ├── src/
│   │   ├── agents/              # Intent, FAQ, Escalation, Citation
│   │   ├── orchestration/       # Copy of skeleton
│   │   ├── types/               # Copy of skeleton
│   │   └── app/                 # Next.js pages
│   ├── package.json
│   └── README.md
└── app-research/                # APPLICATION 2
    ├── src/
    │   ├── agents/              # Retrieval, Summarization, Citation
    │   ├── orchestration/       # Copy of skeleton
    │   ├── types/               # Copy of skeleton
    │   └── app/                 # Next.js pages
    ├── package.json
    └── README.md
```

## Troubleshooting

### Import Errors
If you get import errors, update the paths in each file from `@/` to relative paths.

### Port Conflicts
Each app runs on a different port:
- Support: 3001
- Research: 3002

### Missing Dependencies
Run `npm install` in each folder separately.

## Time Estimate

- Phase 1: 30 minutes
- Phase 2: 45 minutes
- Phase 3: 45 minutes
- Phase 4: 15 minutes
- Phase 5: 30 minutes
- Phase 6: 15 minutes

**Total: ~3 hours**

Good luck! 🎃
