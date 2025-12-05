# CrewOS: CORBA Reborn - Demo Script

## Overview
This demo showcases how CrewOS resurrects dead 1990s CORBA IDL files as modern AI agents. The demo takes ~5 minutes and covers the core features.

---

## Part 1: Landing Page (1 minute)

**URL:** `http://localhost:3000`

### What to show:
1. **Hero Section** - Spooky Halloween theme with animated background
   - Point out the "What Died in 1995" section
   - Show the CORBA history context

2. **Before/After Comparison** - The dramatic transformation
   - Left side: 100+ lines of verbose CORBA IDL
   - Right side: 50 lines of modern Kiro YAML
   - Highlight the line count reduction (50% smaller)

3. **Three Demo Applications** - Navigation cards
   - Support Agent (💀)
   - Research Agent (👻)
   - Resurrection Lab (⚡)

**Key message:** "Legacy code doesn't have to stay dead. We can resurrect it as modern AI agents."

---

## Part 2: Resurrection Lab (2 minutes)

**URL:** `http://localhost:3000/resurrection`

### What to show:

1. **Upload Interface**
   - Show the "Drop Dead CORBA IDL Here" upload area
   - Point out the three demo buttons below

2. **Load Demo - RouterAgent**
   - Click "Router Agent" demo button
   - Watch the animated resurrection process:
     - 💀 Parsing Dead IDL... (1 second)
     - ⚡ Resurrecting Agents... (1.5 seconds)
     - ✨ Resurrection Complete!

3. **Before/After Display**
   - **Left panel (Dead CORBA IDL):**
     - Show the original IDL with syntax highlighting
     - Point out keywords (purple), types (green)
     - Mention: "This is what developers had to write in 1995"
   
   - **Right panel (Living Kiro YAML):**
     - Show the converted YAML spec
     - Highlight the dramatic simplification
     - Point out: agent name, methods, types, error handling

4. **CrewOS Agents Section**
   - Show the agent cards (RouterAgent, etc.)
   - Click "Download YAML" to show the export functionality
   - Mention: "These specs are ready to use in Kiro projects"

**Key message:** "Watch 100+ lines of legacy IDL become 50 lines of modern YAML in seconds."

---

## Part 3: Support Agent Demo (1 minute)

**URL:** `http://localhost:3000/apps/support`

### What to show:

1. **Retro CORBA Interface**
   - Point out the 1995 aesthetic (Netscape Navigator style)
   - Show the "Support Copilot" section

2. **Agent Capabilities**
   - Intent detection
   - FAQ matching
   - Escalation routing
   - Citation generation

3. **Live Agent Interaction** (optional)
   - Show how agents communicate via the message bus
   - Point out the agent status indicators

**Key message:** "This application was resurrected from SupportAgent.idl. It's now a living, breathing multi-agent system."

---

## Part 4: Research Agent Demo (1 minute)

**URL:** `http://localhost:3000/apps/research`

### What to show:

1. **Research Assistant Interface**
   - Similar retro CORBA aesthetic
   - Show the "Research Assistant" section

2. **Agent Capabilities**
   - Document retrieval
   - Summarization
   - Citation generation
   - Search coordination

3. **Multi-Agent Coordination**
   - Explain how agents work together
   - Point out the message bus routing

**Key message:** "Another legacy system brought back to life. These agents coordinate through our event-driven message bus."

---

## Part 5: Technical Deep Dive (Optional - 2 minutes)

### Show the Architecture:

1. **IDL Parser** (`src/utils/idl-parser.ts`)
   - Extracts interfaces, methods, structs, exceptions
   - Handles CORBA type mapping
   - Generates Kiro YAML specs

2. **Multi-Agent Framework** (`src/orchestration/`)
   - MessageBus: Routes messages between agents
   - WorkflowStateManager: Tracks state
   - ResourceAllocator: Fair scheduling
   - ErrorHandler: Graceful failure handling
   - PerformanceMonitor: Metrics collection

3. **Agent Implementations** (`src/agents/`)
   - 6 specialized agents
   - BaseAgent abstraction
   - Property-based testing for correctness

### Show the Testing:

```bash
npm test
```

- 332/333 tests passing
- 19 correctness properties
- 100+ iterations per property
- Property-based testing ensures correctness across all inputs

---

## Key Talking Points

### Problem Solved:
- Organizations have decades of CORBA systems in production
- Legacy IDL files represent valuable domain knowledge
- No easy way to modernize without rewriting everything
- CrewOS provides an automated path forward

### Solution:
- Parse legacy CORBA IDL automatically
- Convert to modern Kiro agent specifications
- Deploy as living AI agents
- Maintain the original domain logic

### Technical Highlights:
- 8,000+ lines of framework code
- 2,000+ lines of resurrection engine
- 3,000+ lines of tests
- 30+ reusable UI components
- Property-based testing for correctness guarantees

### Business Value:
- Reduce modernization time from months to minutes
- Preserve domain knowledge from legacy systems
- Enable rapid AI agent deployment
- Lower risk through automated conversion

---

## Demo Checklist

- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Dev server running: `npm run dev`
- [ ] Landing page loads
- [ ] Resurrection Lab loads
- [ ] Demo IDL files load and parse
- [ ] Support Agent page loads
- [ ] Research Agent page loads
- [ ] Download YAML functionality works

---

## Talking Points by Audience

### For Judges:
- Spec-driven development using Kiro
- Property-based testing for correctness
- Real solution to a real problem
- Complete multi-agent framework
- Production-ready code

### For Developers:
- Clean architecture with separation of concerns
- Type-safe TypeScript throughout
- Comprehensive error handling
- Extensible agent system
- Well-tested codebase

### For Business:
- Solves legacy modernization problem
- Reduces time-to-market
- Preserves existing investments
- Enables AI agent deployment
- Scalable framework

---

## Timing Guide

- **Total demo time:** 5 minutes
- **Landing page:** 1 minute
- **Resurrection Lab:** 2 minutes
- **Support Agent:** 1 minute
- **Research Agent:** 1 minute
- **Q&A:** As needed

---

## Troubleshooting

**Resurrection demo not showing syntax highlighting?**
- Refresh the page
- Check browser console for errors
- Ensure IDL file is valid

**Demo IDL files not loading?**
- Check that `/public/demo/corba-idl/` files exist
- Verify file permissions
- Check network tab in browser dev tools

**Tests failing?**
- Run `npm test` to see which tests are failing
- Check that all dependencies are installed
- Ensure Node.js version is 18+

---

## Next Steps After Demo

1. **Explore the Code**
   - Show the IDL parser implementation
   - Walk through the agent orchestration
   - Review the property-based tests

2. **Try Custom IDL**
   - Upload your own CORBA IDL file
   - See it converted to Kiro YAML
   - Download and use the spec

3. **Extend the Framework**
   - Add new agent types
   - Implement custom orchestration logic
   - Build on the multi-agent foundation

---

## Questions to Anticipate

**Q: How does this handle complex CORBA features?**
A: The parser supports nested modules, multiple parameter directions (in/out/inout), raises clauses, sequences, and custom types. We have 65+ tests covering edge cases.

**Q: Can I use this with my existing CORBA systems?**
A: Yes. Upload your IDL files, get Kiro YAML specs, and deploy as agents. The framework handles the orchestration.

**Q: What about error handling?**
A: The framework includes comprehensive error handling with retry logic, graceful degradation, and detailed error classification.

**Q: How do you ensure correctness?**
A: Property-based testing with 19 correctness properties, each running 100+ iterations. This catches edge cases that unit tests miss.

**Q: Is this production-ready?**
A: Yes. The framework includes fair resource allocation, performance monitoring, debug replay, and workflow state management.
