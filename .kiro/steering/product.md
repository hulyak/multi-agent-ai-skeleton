# Product Overview

Multi-Agent AI Skeleton Template - A modular, extensible foundation for building multi-agent AI orchestration systems.

## Core Purpose

Provides a production-ready framework for coordinating multiple AI agents through event-driven message-passing architecture. Enables building complex AI workflows with robust error handling, fair resource allocation, and comprehensive testing.

## Key Features

- Event-driven message-passing between agents
- Modular agent system with base abstractions
- Workflow state management and task coordination
- Comprehensive error handling with retry mechanisms
- Fair resource allocation and starvation prevention
- Property-based testing for correctness guarantees
- Spec-driven development workflow

## Demo Applications

1. **Customer Support Bot**: Query classification, FAQ matching, and escalation routing
2. **Research Assistant**: Document retrieval, summarization, and citation generation

## Architecture Philosophy

- Agents are independent, stateful components that communicate via messages
- Orchestration layer handles routing, state, errors, and resource allocation
- Type-safe interfaces throughout with strict TypeScript
- Testing emphasizes property-based tests for correctness over unit tests
