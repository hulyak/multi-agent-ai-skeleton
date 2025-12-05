# Spooky UI Theme Guide

A comprehensive guide to using the spooky Halloween-themed UI components in CrewOS: CORBA Reborn.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Theme Tokens](#theme-tokens)
4. [Components](#components)
5. [Usage Examples](#usage-examples)
6. [Accessibility](#accessibility)
7. [Customization](#customization)

## Overview

The Spooky UI Theme provides a dark, Halloween-inspired aesthetic with:
- Neon glowing borders and effects
- Subtle bone textures and ribcage watermarks
- Gothic typography for headers
- Floating bone animations
- Flickering candlelight effects
- Ghostly green and purple gradients

All components are built with React and styled using TailwindCSS, ensuring consistency and reusability.

## Installation

The theme is already configured in your project. To use it:

1. **Import components** from `src/ui`:
```tsx
import { SpookyButton, SpookyCard, SpookyIcon } from '@/ui';
```

2. **Apply the theme wrapper** to your page or app:
```tsx
<div className="spooky-theme">
  {/* Your content */}
</div>
```

## Theme Tokens

### Colors

```css
--bg-primary: #0b0c0d        /* Dark black base */
--bg-secondary: #1a1a2e      /* Dark navy */
--bg-tertiary: #16213e       /* Lighter navy */
--accent-orange: #ff6b35     /* Pumpkin orange */
--accent-purple: #6a1b9a     /* Deep purple */
--accent-green: #388e3c      /* Ghostly green */
--neon-accent: #abbc04       /* Neon yellow-green */
--text-primary: #f8f9fa      /* Off-white */
--text-secondary: #cbd5e1    /* Light gray */
--text-muted: #94a3b8        /* Muted gray */
--border-subtle: #2d3748     /* Subtle border */
--border-accent: #4a5568     /* Visible border */
```

### Tailwind Classes

Access colors via Tailwind:
```tsx
<div className="bg-spooky-bg-primary text-spooky-text-primary">
  <h1 className="text-spooky-neon-accent">Spooky Title</h1>
</div>
```

### Typography

- **Headers**: Gothic font (Cinzel) with distressed texture
- **Body**: Clean sans-serif for readability

```tsx
<h1 className="font-gothic">Gothic Header</h1>
<p className="font-sans">Readable body text</p>
```

## Components

### SpookyButton

Neon glowing button with pulse animation and hover effects.

**Props:**
- `variant`: 'default' | 'primary' | 'cta'
- `children`: Button content
- Standard button props (onClick, disabled, etc.)

**Example:**
```tsx
<SpookyButton variant="cta" onClick={handleClick}>
  Open Demo
</SpookyButton>
```

**Variants:**
- `default`: Basic spooky button
- `primary`: Pulsing glow animation
- `cta`: Enhanced with cursor effect and flame glow

### SpookyCard

Card with bone texture background and glow effects.

**Props:**
- `children`: Card content
- `fog`: boolean - Add foggy overlay effect
- `className`: Additional classes

**Example:**
```tsx
<SpookyCard fog>
  <h3>Agent Status</h3>
  <p>All systems operational</p>
</SpookyCard>
```

### SpookyIcon

Stylized icons for agents and status indicators.

**Props:**
- `type`: 'skull' | 'bones' | 'lantern'
- `active`: boolean - Glow animation when active
- `size`: 'sm' | 'md' | 'lg'
- `className`: Additional classes

**Example:**
```tsx
<SpookyIcon type="skull" active size="md" />
<SpookyIcon type="lantern" active />
```

**Icon Types:**
- `skull`: Minimal skeleton skull for agents
- `bones`: Crossed bones icon
- `lantern`: Spooky lantern for active status

### SpookySpinner

Loading spinner with neon glow.

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `className`: Additional classes

**Example:**
```tsx
<SpookySpinner size="lg" />
```

### SpookyWorkflowLine

Glowing connection line for workflow diagrams.

**Props:**
- `active`: boolean - Flickering animation when active
- `orientation`: 'horizontal' | 'vertical'
- `className`: Additional classes

**Example:**
```tsx
<SpookyWorkflowLine active orientation="horizontal" />
```

### SpookyFloatingBones

Decorative floating bone fragments.

**Props:**
- `count`: number - Number of bones (default: 3)
- `className`: Additional classes

**Example:**
```tsx
<SpookyFloatingBones count={5} />
```

### SpookyTable

Table with hover effects and spooky styling.

**Props:**
- `headers`: string[] - Column headers
- `rows`: React.ReactNode[][] - Table data
- `className`: Additional classes

**Example:**
```tsx
<SpookyTable 
  headers={['Feature', 'Support', 'Research']}
  rows={[
    ['Purpose', 'Customer support', 'Research workflow'],
    ['Agents', '4 agents', '4 agents']
  ]}
/>
```

## Usage Examples

### Global Theme Application

Apply to entire app in `layout.tsx`:

```tsx
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="spooky-theme">
        {children}
      </body>
    </html>
  );
}
```

### Per-Page Application

Apply to specific pages:

```tsx
export default function LandingPage() {
  return (
    <main className="spooky-theme">
      <SpookyFloatingBones count={3} />
      
      <section className="spooky-section">
        <h1>Multi-Agent AI Skeleton</h1>
        <SpookyButton variant="cta">
          Open Demo
        </SpookyButton>
      </section>
    </main>
  );
}
```

### Agent Dashboard Example

```tsx
import { SpookyCard, SpookyIcon, SpookyWorkflowLine } from '@/ui';

export default function AgentDashboard() {
  return (
    <div className="spooky-theme">
      <div className="grid grid-cols-3 gap-4">
        <SpookyCard fog>
          <SpookyIcon type="skull" active size="lg" />
          <h3>Intent Agent</h3>
          <p>Status: Active</p>
        </SpookyCard>
        
        <SpookyWorkflowLine active />
        
        <SpookyCard fog>
          <SpookyIcon type="skull" active size="lg" />
          <h3>FAQ Agent</h3>
          <p>Status: Active</p>
        </SpookyCard>
      </div>
    </div>
  );
}
```

### Loading State Example

```tsx
import { SpookySpinner } from '@/ui';

export default function LoadingState() {
  return (
    <div className="spooky-theme flex items-center justify-center min-h-screen">
      <SpookySpinner size="lg" />
      <p className="ml-4">Summoning agents...</p>
    </div>
  );
}
```

## Accessibility

All components follow accessibility best practices:

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states use visible outlines with neon accent colors
- Tab order follows logical flow

### Screen Readers
- Semantic HTML elements used throughout
- ARIA labels provided where needed
- Loading spinners include `role="status"` and hidden text

### Color Contrast
- Text colors meet WCAA AA standards
- Neon accents used sparingly for highlights only
- Body text uses high-contrast colors

### Reduced Motion
Add this to respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .spooky-button,
  .spooky-workflow-line,
  .spooky-float-bone {
    animation: none !important;
  }
}
```

## Customization

### Adjusting Colors

Modify colors in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      spooky: {
        'accent-purple': '#your-color',
        // ... other colors
      }
    }
  }
}
```

### Custom Animations

Add new animations in `tailwind.config.ts`:

```typescript
animation: {
  'your-animation': 'your-animation 2s ease-in-out infinite',
},
keyframes: {
  'your-animation': {
    '0%, 100%': { /* styles */ },
    '50%': { /* styles */ },
  },
}
```

### Extending Components

Create custom variants:

```tsx
import { SpookyButton } from '@/ui';

export function CustomSpookyButton(props) {
  return (
    <SpookyButton 
      {...props}
      className="custom-class additional-styles"
    />
  );
}
```

### Theme Utilities

Use utility classes for quick styling:

```tsx
<div className="spooky-glow-purple">Purple glow</div>
<div className="spooky-glow-green">Green glow</div>
<div className="spooky-glow-neon">Neon glow</div>
<div className="spooky-fog">Foggy overlay</div>
```

## Best Practices

1. **Use sparingly**: Spooky effects should enhance, not overwhelm
2. **Maintain readability**: Always prioritize content clarity
3. **Test accessibility**: Verify keyboard navigation and screen readers
4. **Performance**: Limit floating bones and animations on mobile
5. **Consistency**: Use theme components throughout for unified look

## Troubleshooting

### Animations not working
- Ensure `globals.css` is imported in your layout
- Check that Tailwind config includes animation utilities

### Colors not applying
- Verify Tailwind content paths include your files
- Rebuild Tailwind: `npm run build`

### Icons not showing
- Check SVG viewBox and dimensions
- Ensure `currentColor` is used for fill/stroke

## Support

For issues or questions about the spooky theme:
1. Check this guide first
2. Review component source in `src/ui/`
3. Inspect browser console for errors
4. Test with minimal example to isolate issue
