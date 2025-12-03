# Spooky Theme Quick Reference

## 🎨 Color Palette

```tsx
// Backgrounds
bg-spooky-bg-primary      // #0b0c0d - Dark black
bg-spooky-bg-secondary    // #1a1a2e - Dark navy
bg-spooky-bg-tertiary     // #16213e - Lighter navy

// Accents
text-spooky-accent-orange // #ff6b35 - Pumpkin orange
text-spooky-accent-purple // #6a1b9a - Deep purple
text-spooky-accent-green  // #388e3c - Ghostly green
text-spooky-neon-accent   // #abbc04 - Neon yellow-green

// Text
text-spooky-text-primary   // #f8f9fa - Off-white
text-spooky-text-secondary // #cbd5e1 - Light gray
text-spooky-text-muted     // #94a3b8 - Muted gray

// Borders
border-spooky-border-subtle // #2d3748
border-spooky-border-accent // #4a5568
```

## 🧩 Components Cheat Sheet

### SpookyButton
```tsx
<SpookyButton variant="cta" onClick={fn}>Click Me</SpookyButton>
// Variants: 'default' | 'primary' | 'cta'
```

### SpookyCard
```tsx
<SpookyCard fog>Content</SpookyCard>
// Props: fog (boolean), className
```

### SpookyIcon
```tsx
<SpookyIcon type="skull" active size="lg" />
// Types: 'skull' | 'bones' | 'lantern'
// Sizes: 'sm' | 'md' | 'lg'
```

### SpookySpinner
```tsx
<SpookySpinner size="md" />
// Sizes: 'sm' | 'md' | 'lg'
```

### SpookyWorkflowLine
```tsx
<SpookyWorkflowLine active orientation="horizontal" />
// Orientation: 'horizontal' | 'vertical'
```

### SpookyFloatingBones
```tsx
<SpookyFloatingBones count={3} />
// Decorative ambient effect
```

### SpookyTable
```tsx
<SpookyTable 
  headers={['Col1', 'Col2']}
  rows={[['A', 'B'], ['C', 'D']]}
/>
```

## 🎭 Utility Classes

```tsx
// Glow effects
className="spooky-glow-purple"
className="spooky-glow-green"
className="spooky-glow-neon"

// Fog overlay
className="spooky-fog"

// Section spacing
className="spooky-section"

// Typography
className="font-gothic"  // Headers
className="font-sans"    // Body
```

## 🚀 Quick Setup

### 1. Apply Theme Globally
```tsx
// app/layout.tsx
<body className="spooky-theme">
  {children}
</body>
```

### 2. Apply Theme Per Page
```tsx
// app/page.tsx
<main className="spooky-theme">
  {/* content */}
</main>
```

### 3. Import Components
```tsx
import { SpookyButton, SpookyCard } from '@/ui';
```

## 📋 Common Patterns

### Agent Card
```tsx
<SpookyCard fog>
  <div className="flex items-center gap-3 mb-4">
    <SpookyIcon type="skull" active size="lg" />
    <h3>Agent Name</h3>
  </div>
  <p>Agent description</p>
  <SpookyButton variant="primary">Action</SpookyButton>
</SpookyCard>
```

### Workflow Diagram
```tsx
<div className="flex items-center gap-4">
  <SpookyIcon type="skull" active />
  <SpookyWorkflowLine active orientation="horizontal" />
  <SpookyIcon type="skull" active />
</div>
```

### Loading State
```tsx
<div className="flex items-center gap-3">
  <SpookySpinner size="md" />
  <p>Loading...</p>
</div>
```

### Hero Section
```tsx
<section className="spooky-section text-center">
  <h1>Title</h1>
  <p className="text-xl">Description</p>
  <SpookyButton variant="cta">Get Started</SpookyButton>
</section>
```

## ♿ Accessibility

- All components keyboard accessible
- Focus states visible with neon accents
- ARIA labels included
- High contrast text
- Semantic HTML

## 🎯 Best Practices

✅ **DO:**
- Use `spooky-theme` wrapper
- Apply fog effect sparingly
- Limit floating bones (3-5)
- Use Gothic font for headers only
- Test keyboard navigation

❌ **DON'T:**
- Overuse animations
- Nest multiple fog effects
- Use Gothic font for body text
- Ignore color contrast
- Block with animations

## 🔗 Resources

- [Full Theme Guide](./SPOOKY_THEME_GUIDE.md)
- [Demo Page](/spooky-demo)
- [Component Source](./index.ts)
