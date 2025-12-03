# 🎃 Multi-Agent AI Skeleton

> Resurrecting the lost art of multi-agent systems with modern AI orchestration

[![Built for Kiroween 2024](https://img.shields.io/badge/Kiroween-2024-purple?style=for-the-badge&logo=ghost)](https://kiro.ai)
[![Resurrection](https://img.shields.io/badge/Category-Resurrection-orange?style=for-the-badge)](https://kiro.ai)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

A production-ready, modular foundation for building multi-agent AI orchestration systems. Features event-driven architecture, comprehensive testing, and a delightfully spooky Halloween-themed UI.

---

## 💀 The Resurrection Story

**Dead Technology:** Multi-agent systems from the 1990s-2000s - complex, brittle, and abandoned for simpler monolithic approaches.

**Brought Back to Life:** Modern AI orchestration with:
- Event-driven message passing (replacing rigid RPC)
- Shared state management (replacing distributed databases)
- Property-based testing (replacing fragile unit tests)
- TypeScript strict mode (replacing loose contracts)
- Real-time monitoring (replacing blind execution)

**Solving Tomorrow's Problems:** As AI systems grow more complex, we need coordinated agents that can:
- Specialize in specific tasks
- Communicate asynchronously
- Recover from failures gracefully
- Scale independently
- Maintain context across workflows

---

## ✨ Features

### 🦴 Core Skeleton Runtime
- **Event-Driven Architecture**: Message bus with pub/sub pattern
- **Shared State Management**: Centralized workflow and agent state
- **Error Handling**: Robust retry mechanisms and failure recovery
- **Resource Allocation**: Fair scheduling and starvation prevention
- **Performance Monitoring**: Real-time metrics and bottleneck detection
- **Debug Tools**: Event replay and troubleshooting capabilities

### 🎨 Spooky UI Components
- **Animated Hero Section**: Flickering candlelight glow, floating skulls, drifting ghosts
- **Neon Pulse Buttons**: Glowing buttons with skeletal finger pointers
- **Cute Skull Spinner**: Adorable loading animation with glowing eyes
- **Flying Bats**: Easter egg animations across the screen
- **Interactive Skeleton Network**: Blinking skull nodes with pulsing connections
- **Agent Status Badges**: Floating ghost wisps with color transitions
- **Haunted Background**: Moving fog, flickering shadows, eerie atmosphere

### 🤖 Demo Applications
1. **Support Copilot** (`/apps/support`) - AI-powered helpdesk with intelligent routing
2. **Research Copilot** (`/apps/research`) - Document retrieval and summarization assistant

### ♿ Accessibility First
- WCAG AA compliant color contrast (4.5:1+ ratios)
- Respects `prefers-reduced-motion` preferences
- Full keyboard navigation support
- Screen reader friendly with proper ARIA labels

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd multi-agent-ai-skeleton

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the magic! ✨

---

## 📁 Project Structure

```
multi-agent-ai-skeleton/
├── .kiro/
│   ├── specs/              # Spec-driven development
│   │   ├── multi-agent-skeleton/
│   │   └── landing-page/
│   └── steering/           # Steering files for consistency
│       ├── product.md
│       ├── structure.md
│       └── tech.md
├── src/
│   ├── agents/             # Agent implementations
│   │   ├── Agent.ts        # Base agent class
│   │   ├── IntentDetectionAgent.ts
│   │   ├── FAQAgent.ts
│   │   ├── EscalationAgent.ts
│   │   ├── RetrievalAgent.ts
│   │   ├── SummarizationAgent.ts
│   │   └── CitationAgent.ts
│   ├── orchestration/      # Core skeleton runtime
│   │   ├── MessageBus.ts
│   │   ├── WorkflowStateManager.ts
│   │   ├── ErrorHandler.ts
│   │   ├── ResourceAllocator.ts
│   │   ├── AgentOrchestrator.ts
│   │   ├── PerformanceMonitor.ts
│   │   ├── DebugManager.ts
│   │   └── SpecLoader.ts
│   ├── types/              # TypeScript type definitions
│   ├── ui/                 # Reusable UI components
│   │   ├── AnimatedHeroSection.tsx
│   │   ├── NeonPulseButton.tsx
│   │   ├── CuteSkullSpinner.tsx
│   │   ├── FlyingBats.tsx
│   │   ├── SkeletonNetwork.tsx
│   │   └── ... (20+ components)
│   └── app/                # Next.js App Router
│       ├── page.tsx        # Landing page
│       ├── apps/
│       │   ├── support/    # Support Copilot
│       │   └── research/   # Research Copilot
│       └── multi-agent-demo/
├── package.json
└── README.md
```

---

## 🎯 Use Cases

### 1. Support Copilot
**Route**: `/apps/support`

Multi-agent helpdesk system featuring:
- Intent detection and query classification
- FAQ matching from knowledge base
- Intelligent escalation handling
- Citation tracking for responses

**Agents**: IntentDetection → FAQ → ResponseGen → Citation

### 2. Research Copilot
**Route**: `/apps/research`

Research assistant with:
- Document retrieval from repositories
- Relevance scoring and ranking
- Content summarization
- Citation management

**Agents**: Retrieval → Ranking → Summarization → Citation

### 3. Multi-Agent Dashboard
**Route**: `/multi-agent-demo`

Interactive demonstration featuring:
- Three-panel layout (agents, details, console)
- Real-time workflow visualization
- Agent status monitoring
- Live console logging

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
| **Linting** | ESLint with Next.js config |

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Property-Based Testing
This project uses **fast-check** for property-based testing to ensure correctness across a wide range of inputs.

Example test locations:
- `src/orchestration/__tests__/*.property.test.ts`
- `src/agents/__tests__/*.property.test.ts`
- `src/types/__tests__/*.property.test.ts`

---

## 🎨 UI Components

### Core Components

#### Animated Hero Section
```tsx
import { AnimatedHeroSection } from '@/ui';

<AnimatedHeroSection
  title="Your Title"
  subtitle="Your subtitle"
>
  <YourCTAButtons />
</AnimatedHeroSection>
```

#### Neon Pulse Button
```tsx
import { NeonPulseButton } from '@/ui';

<NeonPulseButton 
  variant="purple" 
  size="lg"
  onClick={handleClick}
>
  Click Me
</NeonPulseButton>
```

#### Cute Skull Spinner
```tsx
import { CuteSkullSpinner } from '@/ui';

{isLoading && <CuteSkullSpinner size="md" />}
```

### Full Component List
See [MOTION_DESIGN_COMPONENTS.md](MOTION_DESIGN_COMPONENTS.md) for complete documentation.

---

## 🎃 Spooky Theme

### Color Palette (WCAG AA Compliant)

| Color | Hex | Usage | Contrast |
|-------|-----|-------|----------|
| Pure Black | `#0a0a0a` | Primary background | - |
| Dark Gray | `#1a1a1a` | Secondary background | - |
| White | `#ffffff` | Primary text | 21:1 ✅ |
| Light Gray | `#e0e0e0` | Secondary text | 15.3:1 ✅ |
| Purple | `#9c4dcc` | Accent | 5.2:1 ✅ |
| Green | `#66bb6a` | Accent | 4.9:1 ✅ |
| Orange | `#ff8c42` | Accent | 4.8:1 ✅ |
| Neon | `#d4e157` | Accent | 12.1:1 ✅ |

### Animations
- **Fast** (< 300ms): Button clicks, hover effects
- **Medium** (300ms - 1s): Transitions, fade effects
- **Slow** (1s - 3s): Glow pulses, breathing effects
- **Background** (> 3s): Floating particles, drifting ghosts

---

## 📚 Documentation

- **[MOTION_DESIGN_COMPONENTS.md](MOTION_DESIGN_COMPONENTS.md)** - Complete UI component guide
- **[ACCESSIBILITY_IMPROVEMENTS.md](ACCESSIBILITY_IMPROVEMENTS.md)** - Accessibility details
- **[KIROWEEN_PROJECT_COMPLETE.md](KIROWEEN_PROJECT_COMPLETE.md)** - Project overview
- **[FINAL_KIROWEEN_SUMMARY.md](FINAL_KIROWEEN_SUMMARY.md)** - Complete feature summary

### Component Documentation
- [UI Components](src/ui/README.md)
- [Agents](src/agents/README.md)
- [Orchestration](src/orchestration/README.md)
- [API](src/api/README.md)

---

## 🏗️ Architecture

### Message Bus Pattern
```
User Input → Intent Agent → FAQ Agent → Response Agent → Citation Agent → Output
                ↓              ↓            ↓              ↓
            Message Bus ← → Shared State ← → Error Handler
```

### Agent Lifecycle
1. **Initialize**: Agent registers with message bus
2. **Subscribe**: Agent subscribes to relevant topics
3. **Process**: Agent receives and processes messages
4. **Publish**: Agent publishes results to message bus
5. **Update**: Agent updates shared state

### State Management
- Centralized workflow state
- Agent context tracking
- Conversation history
- Task coordination
- State persistence

---

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

---

## 🎯 Kiro Features

### Specs
Formal requirements and design documents guide implementation:
- Requirements with EARS-compliant acceptance criteria
- Design documents with correctness properties
- Task lists with property-based test tasks

### Steering
Context and instructions ensure consistency:
- Product overview and features
- Directory structure and conventions
- Technology stack and commands

### Hooks
Event-driven automation triggers:
- Test execution on file save
- Type generation on spec changes
- Validation hooks

### MCP
Model Context Protocol integration:
- External tool access
- Extended agent capabilities
- API integrations

---

## 🤝 Contributing

This is a Kiroween 2024 submission for the Resurrection category. Feel free to fork and adapt for your own multi-agent projects!

### Development Workflow
1. Create feature specs in `.kiro/specs/`
2. Write requirements with acceptance criteria
3. Design with correctness properties
4. Implement with property-based tests
5. Iterate and refine

---

## 📝 License

MIT License - feel free to use this skeleton for your own projects!

---

## 🎊 Acknowledgments

- **Kiro AI** - For the amazing development platform
- **Kiroween 2024** - For the spooky inspiration
- **Next.js Team** - For the excellent framework
- **Framer Motion** - For smooth animations

---

## 🦇 Easter Eggs

- Flying bats appear every 25 seconds
- Skeleton hand cursor throughout the site
- Floating skull particles on hero section
- Crawling spiders on various pages
- Flickering candlelight effects

---

## 📞 Links

- **Live Demo**: [Your deployment URL]
- **Documentation**: See docs folder
- **Issues**: [Your issues URL]
- **Kiro AI**: [https://kiro.ai](https://kiro.ai)

---

<div align="center">

**Built with 💀 for Kiroween 2024**

*Resurrection Category*

🎃 👻 💀 🦇 🕷️ 🕸️

</div>
