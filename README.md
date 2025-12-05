# 🧟‍♂️ CrewOS: CORBA Reborn

> Resurrecting dead 1990s CORBA IDL as living AI agents

[![Built for Kiroween 2025](https://img.shields.io/badge/Kiroween-2025-purple?style=for-the-badge&logo=ghost)](https://kiro.ai)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**CrewOS** is a multi-agent orchestration framework that brings dead CORBA IDL files back to life as modern AI agents. Upload legacy interface definitions from the 1990s and watch them transform into concise Kiro specifications ready to power living agent systems.

---

## 💀 The Resurrection Story

**The Graveyard:** Organizations in telecom, aerospace, defense, and finance still run CORBA systems in production. These mission-critical applications can't be easily rewritten—the risk is too high, the cost too great. Their CORBA IDL files represent decades of domain knowledge, but they're trapped in 1990s technology with no clear path to modernization.

**The Resurrection:** CrewOS parses CORBA IDL files and converts them into modern Kiro agent specifications:
- **100+ lines of verbose IDL** → **50 lines of concise YAML**
- **1990s distributed objects** → **Modern AI agents**
- **Rigid RPC calls** → **Event-driven message passing**

**The Magic:** Watch the transformation happen in real-time with our spooky resurrection UI:
1. ⚰️ Upload dead CORBA IDL
2. ⚡ Parse and convert to Kiro specs
3. ✨ Spawn living AI agents

---

## ✨ Features

### 🧟 CORBA Resurrection Engine
- **IDL Parser**: Extracts interfaces, methods, structs, and exceptions from CORBA syntax
- **Spec Converter**: Maps IDL to Kiro YAML format with TypeScript type equivalents
- **Type Mapper**: Converts CORBA types (string, long, sequence) to modern types
- **Validator**: Ensures generated specs are correct and complete
- **Download**: Export generated Kiro specs for use in your projects

### 🦴 CrewOS Multi-Agent Framework
- **Event-Driven Architecture**: Message bus with pub/sub pattern
- **Workflow State Management**: Centralized state tracking across agents
- **Error Handling**: Robust retry mechanisms and failure recovery
- **Resource Allocation**: Fair scheduling prevents agent starvation
- **Performance Monitoring**: Real-time metrics and bottleneck detection
- **Debug Tools**: Event replay and troubleshooting capabilities

### 🤖 Two Resurrected Applications

**1. Customer Support System** (`/apps/support`)
- Resurrected from `SupportAgent.idl`
- Intent classification → FAQ search → Ticket creation → Escalation
- Agents: IntentDetection, FAQ, Escalation

**2. Research Assistant** (`/apps/research`)
- Resurrected from `ResearchAgent.idl`
- Document retrieval → Summarization → Citation generation
- Agents: Retrieval, Summarization, Citation

### 🎨 Spooky Halloween UI
- **Resurrection Lab** (`/resurrection`) - Interactive IDL → YAML converter
- **Animated Transitions**: Parsing → Converting → Complete with visual feedback
- **Before/After Comparison**: See the dramatic line count reduction
- **Three Demo Examples**: RouterAgent, SupportAgent, ResearchAgent
- **Download Functionality**: Export generated specs as YAML files

### ♿ Accessibility First
- WCAG AA compliant (4.5:1+ contrast ratios)
- Respects `prefers-reduced-motion`
- Full keyboard navigation
- Screen reader friendly with ARIA labels

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd crewos-corba-reborn

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, then visit:
- **`/resurrection`** - Try the CORBA Resurrection Lab
- **`/apps/support`** - See the resurrected Support system
- **`/apps/research`** - See the resurrected Research assistant

---

## 📁 Project Structure

```
crewos-corba-reborn/
├── .kiro/
│   ├── specs/                    # Spec-driven development
│   │   ├── idl-resurrection/     # Resurrection feature spec
│   │   └── landing-page/         # Landing page spec
│   └── steering/                 # Development guidelines
├── demo/
│   └── corba-idl/               # Example IDL files
│       ├── RouterAgent.idl
│       ├── SupportAgent.idl
│       └── ResearchAgent.idl
├── src/
│   ├── utils/
│   │   └── idl-parser.ts        # CORBA IDL parser & converter
│   ├── agents/                  # Agent implementations
│   │   ├── Agent.ts             # Base agent class
│   │   ├── IntentDetectionAgent.ts
│   │   ├── FAQAgent.ts
│   │   ├── EscalationAgent.ts
│   │   ├── RetrievalAgent.ts
│   │   ├── SummarizationAgent.ts
│   │   └── CitationAgent.ts
│   ├── orchestration/           # CrewOS framework
│   │   ├── MessageBus.ts
│   │   ├── WorkflowStateManager.ts
│   │   ├── ErrorHandler.ts
│   │   ├── ResourceAllocator.ts
│   │   ├── AgentOrchestrator.ts
│   │   ├── PerformanceMonitor.ts
│   │   └── DebugManager.ts
│   ├── ui/                      # Reusable UI components
│   │   ├── IDLResurrection.tsx  # Resurrection UI
│   │   ├── AnimatedHeroSection.tsx
│   │   ├── SkeletonNetwork.tsx
│   │   └── ... (30+ components)
│   └── app/                     # Next.js App Router
│       ├── page.tsx             # Landing page
│       ├── resurrection/        # Resurrection Lab
│       ├── apps/
│       │   ├── support/         # Support Copilot
│       │   └── research/        # Research Copilot
│       └── multi-agent-demo/    # Framework demo
└── package.json
```

---

## 🧟 How CORBA Resurrection Works

### 1. Upload Dead IDL
Drop a CORBA IDL file from the 1990s:

```idl
// CORBA IDL - SupportAgent.idl (circa 1995)
module SupportSystem {
  struct CustomerInquiry {
    string inquiryId;
    string customerId;
    string subject;
    string description;
    long priority;
  };
  
  interface SupportAgent {
    IntentResult classifyIntent(in CustomerInquiry inquiry)
      raises (ClassificationException);
    
    sequence<FAQEntry> searchFAQ(in string query, in long maxResults)
      raises (SearchException);
  };
};
```

### 2. Parse & Convert
Our resurrection engine:
- Extracts module, interfaces, methods, structs, exceptions
- Maps CORBA types to TypeScript equivalents
- Categorizes parameters as inputs/outputs
- Generates Kiro YAML specifications

### 3. Living Kiro YAML
Get concise, modern agent specs:

```yaml
# Resurrected from CORBA IDL
# Module: SupportSystem

agent: SupportAgent
module: SupportSystem

inputs:
  - name: customerinquiry
    type: CustomerInquiry
  - name: string
    type: string

methods:
  - name: classifyIntent
    params:
      - name: inquiry
        type: CustomerInquiry
    returns: IntentResult
    errors:
      - ClassificationException
      
  - name: searchFAQ
    params:
      - name: query
        type: string
      - name: maxResults
        type: long
    returns: sequence<FAQEntry>
    errors:
      - SearchException

types:
  - name: CustomerInquiry
    fields:
      - name: inquiryId
        type: string
      - name: customerId
        type: string
      - name: subject
        type: string
      - name: description
        type: string
      - name: priority
        type: long
```

### 4. Spawn Agents
Use the generated specs to create working agents in the CrewOS framework!

---

## 🎯 Use Cases

### Legacy Modernization
Organizations with CORBA systems can:
- Extract interface definitions from legacy code
- Generate modern agent specifications
- Gradually migrate to AI-powered systems
- Preserve decades of domain knowledge

### Rapid Prototyping
Developers can:
- Start with well-defined interfaces
- Generate agent skeletons automatically
- Focus on implementation, not boilerplate
- Iterate quickly with spec-driven development

### Educational
Students can:
- Learn about distributed systems evolution
- Compare 1990s vs modern architectures
- Understand interface design principles
- See real-world legacy code transformation

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5.3+ (strict mode) |
| **Styling** | Tailwind CSS 3.4+ |
| **Animations** | Framer Motion |
| **Testing** | Jest 29 + fast-check (PBT) |
| **Parsing** | Regex-based IDL parser |

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Property-Based Testing
We use **fast-check** for property-based testing with 100+ iterations per test:

**Resurrection Engine Tests:**
- Module extraction completeness
- Interface parsing accuracy
- Type mapping correctness
- YAML round-trip validity
- Error handling resilience

**Framework Tests:**
- Message routing properties
- State management invariants
- Resource allocation fairness
- Error propagation correctness

Test locations:
- `src/utils/__tests__/idl-parser.property.test.ts`
- `src/orchestration/__tests__/*.property.test.ts`
- `src/agents/__tests__/*.property.test.ts`

---

## 🎨 Resurrection UI

### Interactive Demo
Visit `/resurrection` to try the resurrection lab:

1. **Upload IDL** - Choose a file or select a demo
2. **Watch Animation** - See parsing → converting → complete
3. **Compare Results** - Before/after side-by-side view
4. **Download Specs** - Export generated YAML files

### Visual Feedback
- ⚰️ **Idle**: Upload area with coffin emoji
- 💀 **Parsing**: Spinning skull with terminal output
- ⚡ **Converting**: Lightning bolt with progress
- ✨ **Complete**: Success celebration with agent list

### Demo Examples
- **RouterAgent.idl** - Message routing system
- **SupportAgent.idl** - Customer support system
- **ResearchAgent.idl** - Research assistant system

---

## 🏗️ Architecture

### Two-Repo Structure

**Repo 1: CrewOS Framework** (This repo)
- Multi-agent orchestration skeleton
- Message bus, state management, error handling
- Base agent abstractions
- Testing infrastructure

**Repo 2: CORBA Resurrection** (Conceptual split)
- IDL parser and converter
- Resurrection UI
- Type mapping logic
- Spec validation

This split demonstrates that the resurrection feature is a distinct capability built on top of the framework.

### Message Bus Pattern
```
User Input → Agent 1 → Agent 2 → Agent 3 → Output
                ↓         ↓         ↓
            Message Bus ← → Shared State
```

### Resurrection Pipeline
```
IDL File → Parser → Converter → Validator → YAML Spec → Agent
```

---

## 🔧 Development

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```


## 🎯 Kiro Spec-Driven Development

This project was built using Kiro's spec workflow:

### 1. Requirements Phase
- Defined user stories with EARS-compliant acceptance criteria
- Identified 8 requirements with 40 acceptance criteria
- Covered parsing, conversion, validation, UI, and downloads

### 2. Design Phase
- Created architecture with component interfaces
- Defined 19 correctness properties for testing
- Planned error handling and validation strategies

### 3. Implementation Phase
- Built incrementally with property tests
- Validated each component against properties
- Iterated based on test feedback

See `.kiro/specs/idl-resurrection/` for the complete spec.


## 📝 License

MIT License - feel free to resurrect your own legacy code!

## 🦇 Easter Eggs

- Flying bats appear every 25 seconds
- Skeleton hand cursor throughout the site
- Floating skull particles on hero section
- Crawling spiders on various pages
- Flickering candlelight effects
- Hidden CORBA jokes in console logs
---

<div align="center">

**Built with 💀 for Kiroween 2025**

*Skeleton Crew Category*

⚰️ → ⚡ → ✨

**From the graveyard of enterprise software, we bring forth the future of AI agents.**

🎃 👻 💀 🦇 🕷️ 🕸️

</div>
