# 💀 Anatomical Skeleton Visualization

## Overview

A realistic, anatomically-inspired skeleton diagram that visualizes the multi-agent system as an actual human skeleton with agents positioned on different bones.

## Features

### Anatomical Structure
- **Skull** - Router Agent (the brain)
- **Cervical Spine** - Intent Agent (the neck)
- **Thoracic/Ribcage** - FAQ Agent (the heart)
- **Lumbar Spine** - Retrieval Agent (the spine)
- **Pelvis** - Summarization Agent (the pelvis)
- **Femur** - Citation Agent (the foundation)

### Visual Elements
- Realistic bone structure with ribcage, spine, and limbs
- Glowing agent nodes positioned on bones
- Pulsing rings for hovered agents
- Energy flow lines between connected agents
- Anatomical labels for each agent
- Hover tooltips with descriptions

### Interactions
- **Hover**: Shows tooltip and dims other agents
- **Click**: Can trigger navigation or actions
- **Animations**: 
  - Staggered appearance
  - Pulse effects on hover
  - Energy flow visualization
  - Glow filters

## Design Philosophy

The skeleton represents the **backbone** of your multi-agent system:

1. **Skull (Router)** - The brain that directs everything
2. **Neck (Intent)** - Connects input to understanding
3. **Heart (FAQ)** - Pumps knowledge through the system
4. **Spine (Retrieval)** - Supports the entire structure
5. **Pelvis (Summarization)** - Structures and condenses
6. **Legs (Citation)** - The foundation that everything stands on

## Technical Implementation

### SVG Structure
```tsx
<svg viewBox="0 0 400 600">
  {/* Skull with eye sockets */}
  <ellipse cx="200" cy="60" rx="35" ry="40" />
  
  {/* Cervical spine (neck) */}
  <line x1="200" y1="100" x2="200" y2="130" />
  
  {/* Ribcage with individual ribs */}
  <path d="M 200 150 Q 160 160, 160 180..." />
  
  {/* Lumbar spine */}
  <line x1="200" y1="250" x2="200" y2="320" />
  
  {/* Pelvis */}
  <ellipse cx="200" cy="350" rx="50" ry="30" />
  
  {/* Femur bones */}
  <line x1="175" y1="380" x2="165" y2="480" />
</svg>
```

### Agent Positioning
```typescript
const positions = {
  skull: { x: 200, y: 60 },
  cervical: { x: 200, y: 120 },
  thoracic: { x: 200, y: 190 },
  lumbar: { x: 200, y: 290 },
  pelvis: { x: 200, y: 350 },
  femur: { x: 200, y: 430 }
};
```

### Animations
- **Framer Motion** for smooth transitions
- **SVG filters** for glow effects
- **Pulsing rings** for active states
- **Energy flow** lines between agents

## Usage

```tsx
import { AnatomicalSkeleton } from '@/ui';

<AnatomicalSkeleton 
  onAgentClick={(agentId) => {
    console.log('Clicked:', agentId);
    // Navigate or show details
  }}
/>
```

## Styling

### Colors
- **Bones**: Purple (#6a1b9a) with glow
- **Active Agents**: Neon yellow-green (#abbc04)
- **Inactive Agents**: Purple (#6a1b9a)
- **Energy Flow**: Neon yellow-green (#abbc04)

### Effects
- Gaussian blur for glow
- Opacity transitions
- Scale animations
- Stroke dash animations for energy flow

## Accessibility

- ARIA labels for each agent
- Keyboard navigation support
- Screen reader descriptions
- Role attributes
- Tab index for focus

## Comparison: Abstract vs Anatomical

### Abstract Network (SkeletonNetwork.tsx)
- 6 nodes in network pattern
- Abstract connections
- Good for: Technical diagrams

### Anatomical Skeleton (AnatomicalSkeleton.tsx)
- Realistic skeleton structure
- Agents on bones
- Good for: Visual metaphor, Halloween theme

## Integration

The anatomical skeleton is now used on the landing page:

```tsx
// src/app/page.tsx
<section className="spooky-section">
  <h2>The Skeleton Network</h2>
  <AnatomicalSkeleton />
</section>
```

## Future Enhancements

- [ ] Add arms for additional agents
- [ ] Animate breathing motion
- [ ] Add skull jaw movement
- [ ] Show blood flow (message flow)
- [ ] Add muscle tissue overlay
- [ ] Interactive bone highlighting
- [ ] X-ray effect toggle

## Perfect For

- 🎃 Halloween/Kiroween themes
- 💀 Medical/anatomical metaphors
- 🦴 "Skeleton" framework visualization
- 👻 Spooky tech presentations
- 🏴‍☠️ Pirate/skeleton crew themes

Your multi-agent system now has a **real skeleton**! 💀✨
