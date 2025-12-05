# CrewOS: CORBA Reborn

## Inspiration

CORBA was a 1990s distributed computing standard for connecting enterprise systems. Many companies wrote millions of lines of Interface Definition Language (IDL) to define their distributed objects. While CORBA is no longer used for new systems, it persists in mission-critical applications across industries like telecom, aerospace, defense, and finance—where rewriting decades-old systems is too risky and expensive.

The core problem: organizations have decades of interface specifications with no path to modernize them.

For Kiroween, I built a solution: **resurrect legacy CORBA IDL as modern AI agents**. This is a real approach to a real problem. The Halloween theme fit perfectly—bringing dead code back to life as enterprise software architecture.

## What it does

**CrewOS: CORBA Reborn** is a multi-agent orchestration system that automatically converts legacy CORBA IDL files into modern Kiro agent specifications, then brings them to life as working AI agents.

### The Resurrection Process

You drop a 1990s CORBA IDL file into the system—usually 100+ lines of interface definitions. The parser extracts interfaces, methods, structs, and exceptions, then converts everything to concise Kiro YAML, typically around 50 lines. Those specs become live agents in the multi-agent framework.

### The Resurrection Lab

I built an interactive application that demonstrates the resurrection process in real-time. The Resurrection Lab lets you upload CORBA IDL files and watch them transform into modern Kiro specs with animated visual feedback.

The lab includes demo examples from legacy CORBA specs. SupportAgent.idl shows customer support routing with intent classification, FAQ search, and escalation. ResearchAgent.idl demonstrates an academic research assistant with document retrieval, summarization, and citations.

The system runs on CrewOS, a multi-agent orchestration framework with an event-driven message bus, fair resource allocation, comprehensive error handling, real-time performance monitoring, and property-based testing for correctness.

## How I built it

### The Tech Stack

Built with Next.js 15 and React 19, using TypeScript in strict mode. Testing uses Jest with fast-check for property-based testing. Tailwind CSS handles styling with a custom spooky theme. The orchestration layer runs on a custom event-driven message bus.

### The Architecture

CrewOS is a layered system:

**Layer 1: Resurrection Engine** - The IDL Parser extracts structured data from CORBA syntax. The Spec Converter maps IDL to Kiro YAML format. The Type Mapper converts CORBA types to TypeScript equivalents. The Validator ensures generated specs are correct.

**Layer 2: Multi-Agent Orchestration** - MessageBus routes messages between agents with retry logic. WorkflowStateManager tracks workflow and task state. ResourceAllocator prevents starvation with fair scheduling. ErrorHandler classifies and propagates failures gracefully. PerformanceMonitor collects metrics and monitors health.

**Layer 3: Agent Implementations** - BaseAgent provides an abstract class all agents extend. Specialized agents handle intent detection, FAQ, escalation, retrieval, summarization, and citation. Each agent maintains its own state.

**Layer 4: Resurrection Lab (Interactive UI)** - Animated resurrection flow shows parsing → converting → complete. Before/after comparison displays dead IDL vs living YAML. Download functionality exports generated specs. Live demo examples include Router, Support, and Research IDL files.

### The Kiro Workflow

I used Kiro's spec-driven development workflow. Started with requirements—8 user stories with 40 acceptance criteria using EARS patterns. Moved to design, creating 19 correctness properties for property-based testing. Built incrementally with property tests validating each component. Ended up with 100+ property-based tests ensuring correctness across all inputs.

Using Kiro to build a Kiro feature validated the spec-driven approach end-to-end.

## Challenges I ran into

### 1. Parsing CORBA IDL is Harder Than It Looks

CORBA IDL has complex syntax with nested modules, multiple parameter directions (in/out/inout), raises clauses, and sequence types. My first regex-based parser failed on edge cases.

**Solution:** I built a robust parser that strips comments (both // and /* */ styles), handles errors gracefully by skipping malformed sections and continuing to parse, supports all IDL constructs (structs, exceptions, interfaces), and properly associates raises clauses with methods.

### 2. Type Mapping Ambiguity

CORBA's type system doesn't map 1:1 to TypeScript. What do you do with `sequence<sequence<string>>`? How do you handle custom struct types?

**Solution:** I created a comprehensive type mapping strategy. Basic types map directly: `string → string`, `long → number`, `boolean → boolean`. Sequences become arrays: `sequence<T> → T[]`. Custom types get preserved as-is and included in type definitions. Void gets special handling for methods with no return value.

### 3. Property-Based Testing for Parsers

Generating random valid CORBA IDL for property tests is difficult. The syntax is complex and interdependent.

**Solution:** I built smart generators using fast-check with composable arbitraries for modules, interfaces, methods, and structs. Generation is constrained—method names must be valid identifiers, for example. Round-trip properties test the full cycle: parse → convert → YAML → parse → verify equivalence.

### 4. Making It Visually Compelling

A parser needs visual engagement to be memorable.

**Solution:** I leaned into the Halloween theme. Coffin emoji (⚰️) represents dead IDL. Lightning bolt (⚡) shows the resurrection process. Sparkles (✨) mark living agents. Animated state transitions move through parsing → converting → complete. Before/after comparison shows the line count reduction. The whole thing uses a spooky theme with purple/green neon accents.

### 5. Balancing Skeleton vs Resurrection

I built a complete multi-agent orchestration framework (the "skeleton"), but the resurrection feature is what makes it memorable. The challenge was presenting both effectively in a single codebase.

**Solution:** I structured it in three parts. The Skeleton is CrewOS, the multi-agent orchestration framework that provides the foundation. The Resurrection is the CORBA IDL parser and interactive lab—the core feature. The Proof is a live demo with real CORBA specs showing the transformation.

The Resurrection Lab demonstrates the framework's power, provides a compelling narrative (bringing dead code back to life), and shows practical value for organizations that need to modernize legacy systems.

## Accomplishments

### 1. It Actually Works

I can take real CORBA IDL files from the 1990s and generate working Kiro agent specifications. This isn't a toy—it's a real solution for organizations with legacy CORBA systems.

### 2. Property-Based Testing Throughout

I wrote 19 correctness properties and implemented them with fast-check. Every component has property tests running 100+ iterations. This validates the system works across all inputs, not just specific test cases.

### 3. Complete Multi-Agent Framework

CrewOS is production-ready. Fair resource allocation prevents agent starvation. Comprehensive error handling classifies, logs, and propagates failures. Performance monitoring collects metrics. Debug replay helps reproduce issues. Workflow state management tracks progress.

### 4. Spec-Driven Development

I used Kiro's spec workflow to build a Kiro feature. The IDL Resurrection spec includes a requirements document with EARS-compliant acceptance criteria, a design document covering architecture, correctness properties, and testing strategy, and a tasks document with an implementation plan including property test tasks.

This validates that spec-driven development works for real features.

### 5. Accessibility & Polish

I built with accessibility in mind. WCAG AA contrast ratios throughout. Full keyboard navigation. Screen reader support. Respects prefers-reduced-motion. Syntax highlighting for IDL and YAML. Download functionality for generated specs.

## What I learned

### 1. Legacy Modernization is a Real Problem

Organizations in certain industries (telecom, aerospace, defense, finance) still run CORBA systems in production. They can't easily migrate because their IDL files represent decades of domain knowledge and rewriting mission-critical systems is prohibitively risky. The resurrection approach can help these organizations modernize.

### 2. Property-Based Testing Changes How You Design

Writing correctness properties first clarified what the system should do. Properties like "parsing then printing should be identity" caught bugs that unit tests would have missed.

### 3. Parsers Are Tricky

Even with "simple" regex-based parsing, edge cases abound. Comments in weird places, nested structures, whitespace handling—every detail matters. Graceful error handling is essential.

### 4. The Narrative Matters

"Multi-agent framework" is technically accurate but forgettable. "Resurrect dead CORBA as living AI agents" tells a story. For hackathons, narrative matters as much as code.

### 5. Kiro's Spec Workflow Works

Using Kiro to build Kiro features validated the spec-driven approach. Requirements → Design → Tasks → Implementation with property tests at each step caught issues early.


---

## What's next for CrewOS: CORBA Reborn

### Short Term: More IDL Features

Add support for IDL inheritance, unions and enums, constants and typedefs. Better handling of nested modules.

### Medium Term: Code Generation

Generate TypeScript agent stubs from specs. Auto-generate test templates. Create API documentation. Convert IDL to OpenAPI specs.

### Long Term: Universal Legacy Resurrection

Extend beyond CORBA to support WSDL (SOAP web services), Thrift (Apache RPC framework), Protocol Buffers (Google's IDL), GraphQL schemas, and OpenAPI/Swagger specs.

**Vision:** CrewOS becomes the universal translator for legacy distributed systems, converting any interface definition language into modern AI agent specifications.

### Enterprise Features

Batch processing for multiple IDL files. Spec validation against Kiro schema. Conflict detection for naming collisions. Version control integration. CI/CD pipeline integration. Agent deployment automation.

### Community

Open source the resurrection engine. Create a gallery of resurrected agents. Build a marketplace for agent specs. Enable community contributions of IDL parsers.

## The Bigger Picture

CrewOS: CORBA Reborn demonstrates that AI agents aren't just for new systems—they can modernize legacy architectures. Organizations don't have to discard decades of interface specifications. They can resurrect them.

This is Kiro's promise: making it easy to build, test, and deploy multi-agent systems. Whether starting from scratch or resurrecting legacy code, Kiro provides the framework, workflow, and tools to succeed.

---

## Technical Details

- **Lines of Code:** ~8,000 (framework) + ~2,000 (resurrection) + ~3,000 (tests)
- **Property-Based Tests:** 19 correctness properties, 100+ iterations each
- **Agents Implemented:** 6 specialized agents + base agent abstraction
- **Demo Application:** 1 interactive Resurrection Lab with live CORBA transformation
- **IDL Files Supported:** 3 examples (Router, Support, Research)
- **Type Mappings:** 5 CORBA types → TypeScript equivalents
- **UI Components:** 30+ reusable spooky-themed components
- **Accessibility:** WCAG AA compliant, keyboard navigable, screen reader support

## Try It

1. Visit the Resurrection Lab
2. Click "Support Agent" demo example
3. Watch 100+ lines of CORBA IDL become 50 lines of Kiro YAML
4. Download the generated spec and see the transformation in action


## How I Used Kiro

This project was built entirely using Kiro, an AI coding assistant. Instead of traditional coding where you write everything yourself, I used Kiro's structured workflow to plan, design, and implement the entire system.

### Planning First, Coding Second

Most developers jump straight into code. With Kiro, I started by writing a specification—a detailed plan of what the system should do. I wrote 8 user stories describing features from a user's perspective, like "As a developer, I want to upload a CORBA IDL file and get a Kiro spec back." Each story had specific success criteria that defined what "working" means.

This upfront planning forced me to think through edge cases before writing any code. What happens if someone uploads a malformed file? How should the parser handle nested structures? What makes a valid output? By answering these questions in the spec, I knew exactly what to build before I started.

### Guiding the AI with Context

I created guide documents that taught Kiro about my project's patterns and conventions. These guides covered things like project structure, technology choices, coding style, and common mistakes to avoid. Every time I asked Kiro to implement something, it automatically used these guides to stay consistent.

For example, one guide documented that interactive elements need specific accessibility features. When I asked Kiro to build new UI components, it automatically added keyboard navigation and screen reader support without me having to remind it every time. This saved hours of repetitive work and prevented me from forgetting important details.

### Automated Testing for Reliability

Instead of manually testing every feature, I wrote automated tests that verify the system works correctly. I used a technique called property-based testing, which tests general rules rather than specific examples. For instance, instead of testing "parsing this specific file works," I tested "parsing any valid file and converting it back should give you the same result."

This approach caught bugs I never would have found manually. The tests automatically generated hundreds of random inputs and found edge cases I hadn't thought of. When a test failed, it showed me the exact input that broke the system, making bugs easy to fix.

### Building Incrementally

The spec broke the project into 14 major tasks, each with smaller subtasks. I worked through them one at a time: build the parser, add the converter, create the UI, add error handling, and so on. After each task, I ran tests to verify everything still worked before moving forward.

This incremental approach meant I always had working code. There was no "big bang" moment where I hoped everything would work together. Each piece was tested and validated before building the next piece on top of it.

### Learning from Mistakes

I kept a document of problems I encountered and how I solved them. Things like "SVG elements need special handling for click events" or "accessibility features should be built in from the start, not added later." This document became part of the guides that Kiro used, so I never made the same mistake twice.

When I built the second demo application, Kiro automatically avoided all the pitfalls from the first one because those lessons were captured in the guides. This made development faster and more reliable over time.

### Comparing Approaches

Traditional coding is exploratory—you try things, see what works, fix bugs as they appear, and refactor when things get messy. With Kiro's structured approach, you define what "correct" means upfront, implement to meet those criteria, catch bugs through automated tests, and refactor based on clear specifications.

When I hit a bug with animation timing, the difference became clear. Traditionally, I would have googled the error, tried different solutions, and tested manually until something worked. With Kiro, the spec already defined how animations should behave, the tests showed exactly what was broken, and the guides had patterns for fixing it. The structured approach was faster because I had clear targets and constraints.

### Built-In Quality

Because quality requirements like accessibility, error handling, and performance were in the spec from day one, they were built into every component from the start. The resurrection UI has screen reader support, keyboard navigation, and respects user motion preferences—not because I remembered to add them later, but because they were requirements from the beginning.

The parser handles malformed input gracefully, providing helpful error messages instead of crashing—again, because error handling was specified upfront. This "quality by design" approach meant fewer bugs and less rework.

### Documentation as a Byproduct

Instead of writing documentation separately, the specs became the documentation. The requirements document explains what the system does. The design document explains how it works. The task list explains how to build it. The guides explain conventions and lessons learned. Everything is already documented because documentation was part of the development process, not an afterthought.

### The Result

Using Kiro's structured approach, I built a complex multi-agent system with a custom parser, two complete applications, 30+ UI components, and comprehensive testing—all in the hackathon timeframe. The system has 330 passing tests, WCAG AA accessibility compliance, and handles edge cases gracefully. This level of quality and completeness would have been much harder to achieve with traditional coding approaches.
