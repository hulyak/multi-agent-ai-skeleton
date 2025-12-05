# CrewOS: CORBA Reborn

## Inspiration

CORBA was a 1990s distributed computing standard for connecting enterprise systems. Thousands of companies wrote millions of lines of Interface Definition Language (IDL) to define their distributed objects. When the web emerged, CORBA became obsolete—verbose specifications now gathering dust in legacy codebases.

The core problem: organizations have decades of interface specifications with no path to modernize them.

For Kiroween, I built a solution: **resurrect legacy CORBA IDL as modern AI agents**. This is a real approach to a real problem. The Halloween theme fit perfectly—bringing dead code back to life as enterprise software architecture.

## What it does

**CrewOS: CORBA Reborn** is a multi-agent orchestration system that automatically converts legacy CORBA IDL files into modern Kiro agent specifications, then brings them to life as working AI agents.

### The Resurrection Process

1. **Upload Dead IDL** - Drop a 1990s CORBA IDL file (100+ lines of interface definitions)
2. **Parse & Convert** - The parser extracts interfaces, methods, structs, and exceptions
3. **Generate Living Specs** - Converts to concise Kiro YAML (50 lines)
4. **Spawn Agents** - The specs become live agents in the multi-agent framework

### Two Resurrected Applications

I built two complete applications from resurrected CORBA specs:

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

Both run on **CrewOS**, a multi-agent orchestration framework with:
- Event-driven message bus
- Fair resource allocation
- Comprehensive error handling
- Real-time performance monitoring
- Property-based testing for correctness

## How I built it

### The Tech Stack

- **Framework:** Next.js 15 with React 19
- **Language:** TypeScript (strict mode)
- **Testing:** Jest + fast-check for property-based testing
- **Styling:** Tailwind CSS with custom spooky theme
- **Orchestration:** Custom event-driven message bus

### The Architecture

CrewOS is a layered system:

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

I used Kiro's spec-driven development workflow:

1. **Requirements Phase** - Defined 8 user stories with 40 acceptance criteria using EARS patterns
2. **Design Phase** - Created 19 correctness properties for property-based testing
3. **Implementation Phase** - Built incrementally with property tests validating each component
4. **Testing Phase** - 100+ property-based tests ensure correctness across all inputs

Using Kiro to build a Kiro feature validated the spec-driven approach end-to-end.

## Challenges I ran into

### 1. Parsing CORBA IDL is Harder Than It Looks

CORBA IDL has complex syntax with nested modules, multiple parameter directions (in/out/inout), raises clauses, and sequence types. My first regex-based parser failed on edge cases.

**Solution:** I built a robust parser with:
- Comment stripping (both // and /* */ styles)
- Graceful error handling (skip malformed sections, continue parsing)
- Support for all IDL constructs (structs, exceptions, interfaces)
- Proper association of raises clauses with methods

### 2. Type Mapping Ambiguity

CORBA's type system doesn't map 1:1 to TypeScript. What do you do with `sequence<sequence<string>>`? How do you handle custom struct types?

**Solution:** I created a comprehensive type mapping strategy:
- Basic types: `string → string`, `long → number`, `boolean → boolean`
- Sequences: `sequence<T> → T[]`
- Custom types: Preserve as-is and include in type definitions
- Void: Special handling for methods with no return value

### 3. Property-Based Testing for Parsers

Generating random valid CORBA IDL for property tests is difficult. The syntax is complex and interdependent.

**Solution:** I built smart generators using fast-check:
- Composable arbitraries for modules, interfaces, methods, structs
- Constrained generation (e.g., method names must be valid identifiers)
- Round-trip properties (parse → convert → YAML → parse → verify equivalence)

### 4. Making It Visually Compelling

A parser needs visual engagement to be memorable.

**Solution:** I leaned into the Halloween theme:
- Coffin emoji (⚰️) for dead IDL
- Lightning bolt (⚡) for resurrection process
- Sparkles (✨) for living agents
- Animated state transitions (parsing → converting → complete)
- Before/after comparison showing line count reduction
- Spooky theme with purple/green neon accents

### 5. Balancing Skeleton vs Resurrection

I built a complete multi-agent orchestration framework (the "skeleton"), but the resurrection feature is what makes it memorable. The challenge was presenting both effectively in a single codebase.

**Solution:** I structured it as:
- **The Skeleton:** CrewOS multi-agent framework (the foundation)
- **The Resurrection:** CORBA IDL parser (the core feature)
- **The Proof:** Two working applications built from resurrected specs

The resurrection feature demonstrates the framework's power, provides a compelling narrative (bringing dead code to life), and shows practical value (organizations can modernize legacy systems).

## Accomplishments

### 1. It Actually Works

I can take real CORBA IDL files from the 1990s and generate working Kiro agent specifications. This isn't a toy—it's a real solution for organizations with legacy CORBA systems.

### 2. Property-Based Testing Throughout

I wrote 19 correctness properties and implemented them with fast-check. Every component has property tests running 100+ iterations. This validates the system works across all inputs, not just specific test cases.

### 3. Complete Multi-Agent Framework

CrewOS is production-ready with:
- Fair resource allocation (no agent starvation)
- Comprehensive error handling (classify, log, propagate)
- Performance monitoring (metrics collection)
- Debug replay (reproduce issues)
- Workflow state management (track progress)

### 4. Spec-Driven Development

I used Kiro's spec workflow to build a Kiro feature. The IDL Resurrection spec includes:
- Requirements document (EARS-compliant acceptance criteria)
- Design document (architecture, correctness properties, testing strategy)
- Tasks document (implementation plan with property test tasks)

This validates that spec-driven development works for real features.

### 5. Accessibility & Polish

I built with accessibility in mind:
- WCAG AA contrast ratios
- Keyboard navigation
- Screen reader support
- Respects prefers-reduced-motion
- Syntax highlighting for IDL and YAML
- Download functionality for generated specs

## What I learned

### 1. Legacy Modernization is a Real Problem

Many organizations still run CORBA systems in production. They can't easily migrate because their IDL files represent decades of domain knowledge. The resurrection approach can help these organizations modernize.

### 2. Property-Based Testing Changes How You Design

Writing correctness properties first clarified what the system should do. Properties like "parsing then printing should be identity" caught bugs that unit tests would have missed.

### 3. Parsers Are Tricky

Even with "simple" regex-based parsing, edge cases abound. Comments in weird places, nested structures, whitespace handling—every detail matters. Graceful error handling is essential.

### 4. The Narrative Matters

"Multi-agent framework" is technically accurate but forgettable. "Resurrect dead CORBA as living AI agents" tells a story. For hackathons, narrative matters as much as code.

### 5. Kiro's Spec Workflow Works

Using Kiro to build Kiro features validated the spec-driven approach. Requirements → Design → Tasks → Implementation with property tests at each step caught issues early.

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

I could extend this beyond CORBA to support:
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
- Create a gallery of CrewOS agents
- Build a marketplace for agent specs
- Enable community contributions of IDL parsers

## The Bigger Picture

CrewOS: CORBA Reborn demonstrates that AI agents aren't just for new systems—they can modernize legacy architectures. Organizations don't have to discard decades of interface specifications. They can resurrect them.

This is Kiro's promise: making it easy to build, test, and deploy multi-agent systems. Whether starting from scratch or resurrecting legacy code, Kiro provides the framework, workflow, and tools to succeed.

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
4. See the CrewOS agents in action in the Support application
