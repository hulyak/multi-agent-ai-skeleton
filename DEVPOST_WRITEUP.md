# CrewOS: CORBA Reborn

## Inspiration

Remember CORBA? That 1990s distributed computing standard that promised to connect every system in the enterprise? Thousands of companies wrote millions of lines of Interface Definition Language (IDL) to define their distributed objects. Then the web happened, and CORBA became a cautionary tale - a technological graveyard of verbose XML-like specifications gathering dust in legacy codebases.

But what if that "dead" code could live again?

For Kiroween, we asked: **What if we could resurrect legacy CORBA IDL as modern AI agents?** Not just as a gimmick, but as a real solution to a real problem - organizations sitting on decades of carefully-designed interface specifications with no way to modernize them.

The Halloween theme was perfect: bringing the dead back to life. But instead of zombies, we're resurrecting enterprise software architecture.

## What it does

**CrewOS: CORBA Reborn** is a multi-agent orchestration system that automatically converts legacy CORBA IDL files into modern Kiro agent specifications, then brings them to life as working AI agents.

### The Resurrection Process

1. **Upload Dead IDL** - Drop a 1990s CORBA IDL file (100+ lines of verbose interface definitions)
2. **Parse & Convert** - Our parser extracts interfaces, methods, structs, and exceptions
3. **Generate Living Specs** - Converts to concise Kiro YAML (50 lines of modern simplicity)
4. **Spawn Agents** - The specs become live agents in our multi-agent framework

### Two Resurrected Applications

We demonstrate the power of resurrection with two complete applications built from resurrected CORBA specs:

**1. Customer Support System** (from SupportAgent.idl)
- Intent classification agent
- FAQ search agent  
- Ticket creation agent
- Escalation routing agent

**2. Research Assistant** (from ResearchAgent.idl)
- Document retrieval agent
- Summarization agent
- Citation generation agent
- Search coordination agent

Both applications run on our **CrewOS** multi-agent orchestration framework, featuring:
- Event-driven message bus
- Fair resource allocation
- Comprehensive error handling
- Real-time performance monitoring
- Property-based testing for correctness

## How we built it

### The Tech Stack

- **Framework:** Next.js 15 with React 19
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + fast-check for property-based testing
- **Styling:** Tailwind CSS with custom spooky theme
- **Orchestration:** Custom event-driven message bus

### The Architecture

We built CrewOS as a layered system:

**Layer 1: Resurrection Engine**
- IDL Parser: Extracts structured data from CORBA syntax
- Spec Converter: Maps IDL to Kiro YAML format
- Type Mapper: Converts CORBA types to TypeScript equivalents
- Validator: Ensures generated specs are correct

**Layer 2: Multi-Agent Orchestration**
- MessageBus: Routes messages between agents with retry logic
- WorkflowStateManager: Tracks workflow and task state
- ResourceAllocator: Prevents starvation with fair scheduling
- ErrorHandler: Classifies and propagates failures gracefully
- PerformanceMonitor: Collects metrics and monitors health

**Layer 3: Agent Implementations**
- BaseAgent: Abstract class all agents extend
- Specialized Agents: Intent detection, FAQ, escalation, retrieval, summarization, citation
- State Management: Each agent maintains its own state

**Layer 4: Resurrection UI**
- Animated resurrection flow (parsing → converting → complete)
- Before/after comparison (dead IDL vs living YAML)
- Download functionality for generated specs
- Three demo examples (Router, Support, Research)

### The Kiro Workflow

We used Kiro's spec-driven development workflow to build this:

1. **Requirements Phase** - Defined 8 user stories with 40 acceptance criteria using EARS patterns
2. **Design Phase** - Created 19 correctness properties for property-based testing
3. **Implementation Phase** - Built incrementally with property tests validating each component
4. **Testing Phase** - 100+ property-based tests ensure correctness across all inputs

This meta-approach (using Kiro to build a Kiro feature) demonstrates the power of spec-driven development.

## Challenges we ran into

### 1. Parsing CORBA IDL is Harder Than It Looks

CORBA IDL has complex syntax with nested modules, multiple parameter directions (in/out/inout), raises clauses, and sequence types. Our first regex-based parser failed on edge cases.

**Solution:** We built a robust parser with:
- Comment stripping (both // and /* */ styles)
- Graceful error handling (skip malformed sections, continue parsing)
- Support for all IDL constructs (structs, exceptions, interfaces)
- Proper association of raises clauses with methods

### 2. Type Mapping Ambiguity

CORBA's type system doesn't map 1:1 to TypeScript. What do you do with `sequence<sequence<string>>`? How do you handle custom struct types?

**Solution:** We created a comprehensive type mapping strategy:
- Basic types: `string → string`, `long → number`, `boolean → boolean`
- Sequences: `sequence<T> → T[]`
- Custom types: Preserve as-is and include in type definitions
- Void: Special handling for methods with no return value

### 3. Property-Based Testing for Parsers

How do you generate random valid CORBA IDL for property tests? The syntax is complex and interdependent.

**Solution:** We built smart generators using fast-check:
- Composable arbitraries for modules, interfaces, methods, structs
- Constrained generation (e.g., method names must be valid identifiers)
- Round-trip properties (parse → convert → YAML → parse → verify equivalence)

### 4. Making It Visually Compelling

A parser is inherently boring. How do you make it exciting for judges?

**Solution:** We leaned into the Halloween theme:
- Coffin emoji (⚰️) for dead IDL
- Lightning bolt (⚡) for resurrection process
- Sparkles (✨) for living agents
- Animated state transitions (parsing → converting → complete)
- Before/after comparison showing line count reduction
- Spooky theme with purple/green neon accents

### 5. The "Two Repos" Requirement Forced the Pivot

The Kiroween Skeleton Crew challenge requires **two separate repository folders**. Our original plan was to build a multi-agent skeleton template, but we hit a problem: **it wasn't substantial enough to justify splitting into two repos**.

A skeleton template is inherently monolithic - the orchestration framework, agents, and UI all belong together. Artificially splitting it would feel forced and make the codebase harder to understand.

**Solution:** We pivoted to the resurrection concept, which naturally splits into two repos:
- **Repo 1: CrewOS Framework** - The multi-agent orchestration skeleton (MessageBus, agents, orchestration)
- **Repo 2: CORBA Resurrection** - The IDL parser and resurrection UI (a distinct feature that uses the framework)

This pivot wasn't just about meeting requirements - it made the project better. The resurrection feature:
- Demonstrates the framework's power (you can build real features on it)
- Provides a compelling narrative (bringing dead code to life)
- Shows practical value (organizations can modernize legacy systems)
- Fits the Halloween theme perfectly

### 6. Balancing Skeleton vs Resurrection

We built a complete multi-agent orchestration framework (the "skeleton"), but the resurrection feature is what makes it memorable. How do we present both?

**Solution:** We positioned it as:
- **The Skeleton:** CrewOS multi-agent framework (the foundation)
- **The Resurrection:** CORBA IDL parser (the killer feature)
- **The Proof:** Two working applications built from resurrected specs

## Accomplishments that we're proud of

### 1. It Actually Works

We can take real CORBA IDL files from the 1990s and generate working Kiro agent specifications. This isn't a toy - it's a real solution for organizations with legacy CORBA systems.

### 2. Property-Based Testing Throughout

We wrote 19 correctness properties and implemented them with fast-check. Every component has property tests running 100+ iterations. This gives us confidence that the system works across all inputs, not just our test cases.

### 3. Complete Multi-Agent Framework

CrewOS isn't just a demo - it's a production-ready orchestration framework with:
- Fair resource allocation (no agent starvation)
- Comprehensive error handling (classify, log, propagate)
- Performance monitoring (metrics collection)
- Debug replay (reproduce issues)
- Workflow state management (track progress)

### 4. Spec-Driven Development

We used Kiro's spec workflow to build a Kiro feature. The IDL Resurrection spec includes:
- Requirements document (EARS-compliant acceptance criteria)
- Design document (architecture, correctness properties, testing strategy)
- Tasks document (implementation plan with property test tasks)

This meta-approach validates that spec-driven development works for real features.

### 5. Accessibility & Polish

We didn't just build it - we polished it:
- WCAG AA contrast ratios
- Keyboard navigation
- Screen reader support
- Respects prefers-reduced-motion
- Syntax highlighting for IDL and YAML
- Download functionality for generated specs

## What we learned

### 1. Legacy Modernization is a Real Problem

While researching CORBA, we discovered that many organizations still have CORBA systems in production. They can't easily migrate because their IDL files represent decades of domain knowledge. Our resurrection approach could genuinely help these organizations.

### 2. Property-Based Testing Changes How You Design

Writing correctness properties first forced us to think clearly about what the system should do. Properties like "parsing then printing should be identity" caught bugs that unit tests would have missed.

### 3. Parsers Are Tricky

Even with "simple" regex-based parsing, edge cases abound. Comments in weird places, nested structures, whitespace handling - every detail matters. Graceful error handling is essential.

### 4. The Narrative Matters

"Multi-agent skeleton template" is technically accurate but boring. "Resurrect dead CORBA as living AI agents" tells a story. For hackathons, the narrative is as important as the code.

### 5. Kiro's Spec Workflow Actually Works

Using Kiro to build Kiro features validated the spec-driven approach. Requirements → Design → Tasks → Implementation with property tests at each step gave us confidence and caught issues early.

## What's next for CrewOS: CORBA Reborn

### Short Term: More IDL Features

- Support for IDL inheritance
- Support for unions and enums  
- Support for constants and typedefs
- Better handling of nested modules

### Medium Term: Code Generation

- Generate TypeScript agent stubs from specs
- Generate test templates automatically
- Generate API documentation
- Generate OpenAPI specs from IDL

### Long Term: Universal Legacy Resurrection

Why stop at CORBA? We could resurrect:
- WSDL (SOAP web services)
- Thrift (Apache RPC framework)
- Protocol Buffers (Google's IDL)
- GraphQL schemas
- OpenAPI/Swagger specs

**Vision:** CrewOS becomes the universal translator for legacy distributed systems, converting any interface definition language into modern AI agent specifications.

### Enterprise Features

- Batch processing (upload multiple IDL files)
- Spec validation against Kiro schema
- Conflict detection (naming collisions)
- Version control integration
- CI/CD pipeline integration
- Agent deployment automation

### Community

- Open source the resurrection engine
- Create a gallery of resurrected agents
- Build a marketplace for agent specs
- Enable community contributions of IDL parsers

## The Bigger Picture

CrewOS: CORBA Reborn demonstrates that AI agents aren't just for new systems - they can breathe new life into legacy architectures. Organizations don't have to throw away decades of carefully-designed interfaces. They can resurrect them.

This is the promise of Kiro: making it easy to build, test, and deploy multi-agent systems. Whether you're starting from scratch or resurrecting legacy code, Kiro provides the framework, the workflow, and the tools to succeed.

**From the graveyard of enterprise software, we bring forth the future of AI agents.** 🧟‍♂️⚡✨

---

## Technical Details

- **Lines of Code:** ~8,000 (framework) + ~2,000 (resurrection) + ~3,000 (tests)
- **Property-Based Tests:** 19 correctness properties, 100+ iterations each
- **Agents Implemented:** 6 specialized agents + base agent abstraction
- **Demo Applications:** 2 complete applications (Support, Research)
- **IDL Files Supported:** 3 examples (Router, Support, Research)
- **Type Mappings:** 5 CORBA types → TypeScript equivalents
- **UI Components:** 30+ reusable spooky-themed components
- **Accessibility:** WCAG AA compliant, keyboard navigable, screen reader support

## Try It

1. Visit the resurrection lab
2. Click "Support Agent" demo
3. Watch 100+ lines of CORBA IDL become 50 lines of Kiro YAML
4. See the resurrected agents in action in the Support application

**The dead code walks again.** 🧟‍♂️
