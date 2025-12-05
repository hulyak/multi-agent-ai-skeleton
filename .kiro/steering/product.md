# Product Overview

**CrewOS: CORBA Reborn** - A multi-agent orchestration framework that resurrects dead 1990s CORBA IDL files as modern AI agents.

## Core Purpose

Brings legacy CORBA Interface Definition Language (IDL) files back to life by parsing them and converting them into modern Kiro agent specifications. Demonstrates the power of transforming verbose 1990s distributed computing interfaces into concise, modern YAML specs that can power living AI agent systems.

## Key Features

### 🧟 CORBA Resurrection Engine
- **IDL Parser**: Extracts interfaces, methods, structs, and exceptions from CORBA syntax
- **Spec Converter**: Maps IDL to Kiro YAML format with TypeScript type equivalents
- **Type Mapper**: Converts CORBA types (string, long, sequence) to modern types
- **Validator**: Ensures generated specs are correct and complete
- **Download**: Export generated Kiro specs for use in projects

### 🦴 CrewOS Multi-Agent Framework
- Event-driven message-passing between agents
- Modular agent system with base abstractions
- Workflow state management and task coordination
- Comprehensive error handling with retry mechanisms
- Fair resource allocation and starvation prevention
- Property-based testing for correctness guarantees
- Spec-driven development workflow

### 🎨 Spooky Halloween UI
- **Resurrection Lab** (`/resurrection`) - Interactive IDL → YAML converter
- **Animated Transitions**: Parsing → Converting → Complete with visual feedback
- **Before/After Comparison**: See the dramatic line count reduction
- **Three Demo Examples**: RouterAgent, SupportAgent, ResearchAgent
- **Download Functionality**: Export generated specs as YAML files
- **30+ Halloween-themed components**: Ghosts, bats, spiders, skeletons, blood drips, etc.

## Demo Applications

1. **Customer Support Bot** (`/apps/support`): Resurrected from `SupportAgent.idl` - Query classification, FAQ matching, and escalation routing
2. **Research Assistant** (`/apps/research`): Resurrected from `ResearchAgent.idl` - Document retrieval, summarization, and citation generation
3. **IDL Resurrection Lab** (`/resurrection`): Interactive CORBA → Kiro converter with live preview

## Architecture Philosophy

- Agents are independent, stateful components that communicate via messages
- Orchestration layer handles routing, state, errors, and resource allocation
- Type-safe interfaces throughout with strict TypeScript
- Testing emphasizes property-based tests for correctness over unit tests
- Legacy interfaces can be resurrected and modernized automatically
- Spec-driven development enables rapid iteration and validation
