# UI Directory

This directory contains reusable UI components for the Multi-Agent Skeleton project.

## 🎃 Spooky Theme Components

A complete Halloween-themed UI system with dark aesthetics, neon glows, and spooky animations.

**📖 [Read the Complete Spooky Theme Guide](./SPOOKY_THEME_GUIDE.md)**

### Theme Components:
- **SpookyButton** - Neon glowing buttons with pulse animations
- **SpookyCard** - Cards with bone texture and glow effects
- **SpookyIcon** - Skull, bones, and lantern icons for agents
- **SpookySpinner** - Loading spinner with neon glow
- **SpookyWorkflowLine** - Glowing connection lines for workflows
- **SpookyFloatingBones** - Decorative floating bone fragments
- **SpookyTable** - Tables with hover effects

## 🤖 Multi-Agent UI Components

Specialized components for building multi-agent system interfaces.

**📖 [Read the Multi-Agent UI Summary](../MULTI_AGENT_UI_SUMMARY.md)**

### Multi-Agent Components:
- **ArchitectureDiagram** - Animated system architecture visualization
- **AgentConsole** - Real-time message log with filtering
- **AgentStatusSidebar** - Agent list with status indicators
- **NeonPulseButton** - Enhanced CTA button with glow effects
- **WorkflowAnimation** - Animated workflow step visualization

### Quick Start:

```tsx
import { 
  SpookyButton, 
  SpookyCard, 
  SpookyIcon,
  ArchitectureDiagram,
  AgentConsole,
  AgentStatusSidebar,
  NeonPulseButton,
  WorkflowAnimation
} from '@/ui';

export default function MyPage() {
  return (
    <div className="spooky-theme">
      {/* Architecture Overview */}
      <section className="spooky-section">
        <ArchitectureDiagram animated />
      </section>
      
      {/* Agent Dashboard */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <AgentStatusSidebar agents={agents} />
        </div>
        <div className="col-span-6">
          <SpookyCard fog>
            <SpookyIcon type="skull" active size="lg" />
            <h2>Agent Status</h2>
            <NeonPulseButton variant="purple">
              Launch Agent
            </NeonPulseButton>
          </SpookyCard>
        </div>
        <div className="col-span-3">
          <AgentConsole messages={messages} />
        </div>
      </div>
      
      {/* Workflow */}
      <section className="spooky-section">
        <WorkflowAnimation steps={workflowSteps} />
      </section>
    </div>
  );
}
```

## 🎨 Theme Features:
- 🎨 Dark mode with bone textures and ribcage watermarks
- ✨ Neon glowing borders (purple/green) with pulse animations
- 🔥 Flickering flame effects on hover
- 💀 Stylized skeleton icons for agents
- 🏮 Spooky lantern icons for active status
- 🦴 Floating bone fragment animations
- 📝 Gothic typography for headers
- ♿ Fully accessible with keyboard navigation

## 🎭 Demo Pages

- **`/spooky-demo`** - Showcase of all spooky theme components
- **`/multi-agent-demo`** - Interactive multi-agent system demonstration

## 📚 Documentation

- **[SPOOKY_THEME_GUIDE.md](./SPOOKY_THEME_GUIDE.md)** - Complete theme documentation
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Component cheat sheet
- **[INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)** - Real-world examples
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration instructions
- **[MULTI_AGENT_UI_SUMMARY.md](../MULTI_AGENT_UI_SUMMARY.md)** - Multi-agent components guide

## 🚀 Getting Started

1. **Import components:**
```tsx
import { SpookyButton, AgentConsole } from '@/ui';
```

2. **Apply theme:**
```tsx
<div className="spooky-theme">
  {/* Your content */}
</div>
```

3. **Use components:**
```tsx
<SpookyButton variant="cta">Click Me</SpookyButton>
<AgentConsole messages={messages} />
```

## 📦 All Available Components

### Theme Components (7)
- SpookyButton
- SpookyCard
- SpookyIcon
- SpookySpinner
- SpookyWorkflowLine
- SpookyFloatingBones
- SpookyTable

### Multi-Agent Components (5)
- ArchitectureDiagram
- AgentConsole
- AgentStatusSidebar
- NeonPulseButton
- WorkflowAnimation

### Utilities
- theme-tokens.ts - Programmatic theme access
- spookyTheme - Color palette and design tokens
- Helper functions (getColorWithOpacity, createGradient, etc.)

## 🎃 Kiroween Ready!

All components are production-ready and optimized for the Multi-Agent Skeleton project. Happy building! 👻💀🤖
