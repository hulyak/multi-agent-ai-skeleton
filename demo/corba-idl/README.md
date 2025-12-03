# CORBA IDL Demo - Multi-Agent System Interfaces

This directory contains CORBA IDL (Interface Definition Language) specifications for the multi-agent system, demonstrating how these agent architectures could have been implemented in the mid-1990s using distributed object technology.

## What is CORBA IDL?

CORBA (Common Object Request Broker Architecture) was a standard for distributed computing that allowed objects to communicate across different languages and platforms. IDL was used to define interfaces in a language-neutral way.

## Files

### RouterAgent.idl
Defines the message routing and orchestration interface:
- Message routing between agents
- Workflow state management
- Agent registration and discovery
- Error handling and retry logic

### SupportAgent.idl
Defines the customer support system interface:
- Intent classification
- FAQ search
- Ticket creation and escalation
- Exception handling

### ResearchAgent.idl
Defines the research assistant interface:
- Document retrieval
- Summarization
- Citation generation
- Search functionality

## Historical Context

In 1995, building a multi-agent system would have required:
- CORBA ORB (Object Request Broker) for communication
- IDL compiler to generate language-specific stubs
- Naming service for agent discovery
- Transaction service for workflow coordination
- Event service for asynchronous messaging

## Modern Equivalent

Our current implementation uses:
- TypeScript interfaces instead of IDL
- Event-driven message bus instead of CORBA ORB
- In-process communication instead of distributed objects
- Promise-based async instead of synchronous RPC
- JSON messages instead of binary protocols

## Why This Matters

This demonstrates that the core concepts of multi-agent systems (message passing, state management, error handling) are timeless. The implementation technology changes, but the architectural patterns remain relevant.

## Compiling (Historical)

In 1995, you would compile these with:
```bash
idl2cpp RouterAgent.idl      # Generate C++ stubs
idl2java SupportAgent.idl    # Generate Java stubs
idl2ada ResearchAgent.idl    # Generate Ada stubs
```

Today, we just use TypeScript and get type safety without code generation!
