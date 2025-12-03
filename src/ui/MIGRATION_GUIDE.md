# Spooky Theme Migration Guide

Step-by-step guide to migrate existing pages to the spooky theme.

## Quick Migration (5 minutes)

### Step 1: Add Theme Wrapper
```tsx
// Before
export default function MyPage() {
  return (
    <div>
      {/* content */}
    </div>
  );
}

// After
export default function MyPage() {
  return (
    <div className="spooky-theme">
      {/* content */}
    </div>
  );
}
```

### Step 2: Replace Standard Components
```tsx
// Before
<button onClick={handleClick}>Click Me</button>

// After
import { SpookyButton } from '@/ui';
<SpookyButton variant="cta" onClick={handleClick}>
  Click Me
</SpookyButton>
```

### Step 3: Add Ambient Effects (Optional)
```tsx
import { SpookyFloatingBones } from '@/ui';

export default function MyPage() {
  return (
    <div className="spooky-theme">
      <SpookyFloatingBones count={3} />
      {/* content */}
    </div>
  );
}
```

## Detailed Migration

### Migrating Buttons

**Standard Button → SpookyButton**
```tsx
// Before
<button 
  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
  onClick={handleClick}
>
  Action
</button>

// After
import { SpookyButton } from '@/ui';

<SpookyButton variant="primary" onClick={handleClick}>
  Action
</SpookyButton>
```

**Link Button → SpookyButton with Link**
```tsx
// Before
<Link href="/page">
  <button className="...">Go to Page</button>
</Link>

// After
import Link from 'next/link';
import { SpookyButton } from '@/ui';

<Link href="/page">
  <SpookyButton variant="cta">Go to Page</SpookyButton>
</Link>
```

### Migrating Cards

**Standard Card → SpookyCard**
```tsx
// Before
<div className="bg-white border rounded-lg p-6 shadow">
  <h3>Title</h3>
  <p>Content</p>
</div>

// After
import { SpookyCard } from '@/ui';

<SpookyCard fog>
  <h3>Title</h3>
  <p>Content</p>
</SpookyCard>
```

### Migrating Icons

**Standard Icon → SpookyIcon**
```tsx
// Before
<svg className="w-6 h-6">
  {/* icon paths */}
</svg>

// After
import { SpookyIcon } from '@/ui';

<SpookyIcon type="skull" active size="md" />
```

### Migrating Loading States

**Standard Spinner → SpookySpinner**
```tsx
// Before
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />

// After
import { SpookySpinner } from '@/ui';

<SpookySpinner size="md" />
```

### Migrating Tables

**Standard Table → SpookyTable**
```tsx
// Before
<table className="w-full">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>

// After
import { SpookyTable } from '@/ui';

<SpookyTable 
  headers={['Header 1', 'Header 2']}
  rows={[
    ['Data 1', 'Data 2']
  ]}
/>
```

## Page-by-Page Migration Examples

### Landing Page Migration

**Before:**
```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome</h1>
        <button className="bg-blue-600 text-white px-8 py-4 rounded">
          Get Started
        </button>
      </section>
    </main>
  );
}
```

**After:**
```tsx
import { SpookyButton, SpookyFloatingBones } from '@/ui';

export default function Home() {
  return (
    <main className="spooky-theme min-h-screen">
      <SpookyFloatingBones count={3} />
      <section className="spooky-section text-center">
        <h1 className="mb-6">Welcome</h1>
        <SpookyButton variant="cta">
          Get Started
        </SpookyButton>
      </section>
    </main>
  );
}
```

### Dashboard Migration

**Before:**
```tsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3>Agent 1</h3>
          <p>Status: Active</p>
        </div>
        {/* more cards */}
      </div>
    </div>
  );
}
```

**After:**
```tsx
import { SpookyCard, SpookyIcon } from '@/ui';

export default function Dashboard() {
  return (
    <div className="spooky-theme min-h-screen">
      <div className="spooky-section">
        <div className="grid grid-cols-3 gap-6">
          <SpookyCard fog>
            <div className="flex items-center gap-3 mb-4">
              <SpookyIcon type="skull" active size="lg" />
              <h3>Agent 1</h3>
            </div>
            <p>Status: Active</p>
          </SpookyCard>
          {/* more cards */}
        </div>
      </div>
    </div>
  );
}
```

### Chat Interface Migration

**Before:**
```tsx
export default function Chat() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-gray-100 rounded p-6 mb-4">
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white p-4 rounded">
                {msg.content}
              </div>
            ))}
          </div>
        </div>
        <input 
          type="text" 
          className="w-full border rounded px-4 py-2"
        />
      </div>
    </div>
  );
}
```

**After:**
```tsx
import { SpookyCard, SpookyIcon, SpookySpinner } from '@/ui';

export default function Chat() {
  return (
    <div className="spooky-theme min-h-screen">
      <div className="max-w-4xl mx-auto">
        <section className="spooky-section">
          <SpookyCard fog>
            <div className="space-y-4 mb-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className="bg-spooky-bg-tertiary p-4 rounded flex items-start gap-2"
                >
                  <SpookyIcon type="skull" size="sm" />
                  <p>{msg.content}</p>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-3">
                  <SpookySpinner size="sm" />
                  <p>Thinking...</p>
                </div>
              )}
            </div>
            <input 
              type="text" 
              className="w-full bg-spooky-bg-tertiary text-spooky-text-primary px-4 py-3 rounded border border-spooky-border-subtle focus:border-spooky-neon-accent focus:outline-none"
            />
          </SpookyCard>
        </section>
      </div>
    </div>
  );
}
```

## Color Migration

### Text Colors
```tsx
// Before → After
text-gray-900 → text-spooky-text-primary
text-gray-600 → text-spooky-text-secondary
text-gray-400 → text-spooky-text-muted
```

### Background Colors
```tsx
// Before → After
bg-white → bg-spooky-bg-primary
bg-gray-100 → bg-spooky-bg-secondary
bg-gray-200 → bg-spooky-bg-tertiary
```

### Accent Colors
```tsx
// Before → After
text-blue-600 → text-spooky-accent-purple
text-green-600 → text-spooky-accent-green
text-orange-600 → text-spooky-accent-orange
```

### Border Colors
```tsx
// Before → After
border-gray-300 → border-spooky-border-subtle
border-gray-400 → border-spooky-border-accent
```

## Layout Migration

### Container
```tsx
// Before
<div className="max-w-7xl mx-auto px-4 py-8">

// After
<div className="max-w-7xl mx-auto">
  <section className="spooky-section">
```

### Grid Layouts
```tsx
// Before
<div className="grid grid-cols-3 gap-6">

// After (same, but inside spooky-theme)
<div className="spooky-theme">
  <div className="grid grid-cols-3 gap-6">
```

## Common Patterns

### Hero Section
```tsx
// Before
<section className="py-20 text-center bg-gradient-to-r from-blue-600 to-purple-600">
  <h1 className="text-5xl font-bold text-white mb-6">Title</h1>
  <button className="bg-white text-blue-600 px-8 py-4 rounded">CTA</button>
</section>

// After
<section className="spooky-section text-center">
  <h1 className="mb-6">Title</h1>
  <SpookyButton variant="cta">CTA</SpookyButton>
</section>
```

### Feature Grid
```tsx
// Before
<div className="grid grid-cols-3 gap-6">
  {features.map(feature => (
    <div key={feature.id} className="bg-white p-6 rounded shadow">
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  ))}
</div>

// After
<div className="grid grid-cols-3 gap-6">
  {features.map(feature => (
    <SpookyCard key={feature.id} fog>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </SpookyCard>
  ))}
</div>
```

### Navigation
```tsx
// Before
<nav className="bg-white border-b">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <a href="/">Logo</a>
      <div className="flex gap-4">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </div>
  </div>
</nav>

// After
<nav className="spooky-theme border-b border-spooky-border-subtle">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <a href="/" className="flex items-center gap-2">
        <SpookyIcon type="skull" size="sm" />
        <span>Logo</span>
      </a>
      <div className="flex gap-4">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </div>
  </div>
</nav>
```

## Troubleshooting

### Issue: Colors not applying
**Solution:** Ensure `spooky-theme` class is on a parent element
```tsx
// ❌ Wrong
<div>
  <SpookyButton>Click</SpookyButton>
</div>

// ✅ Correct
<div className="spooky-theme">
  <SpookyButton>Click</SpookyButton>
</div>
```

### Issue: Animations not working
**Solution:** Check that globals.css is imported
```tsx
// app/layout.tsx
import './globals.css'; // Must be imported
```

### Issue: Icons not showing
**Solution:** Verify import path
```tsx
// ❌ Wrong
import { SpookyIcon } from '@/components/SpookyIcon';

// ✅ Correct
import { SpookyIcon } from '@/ui';
```

### Issue: TypeScript errors
**Solution:** Ensure types are imported
```tsx
import { SpookyButton } from '@/ui';
import type { SpookyButtonProps } from '@/ui';
```

## Gradual Migration Strategy

### Phase 1: Landing Page Only
1. Apply theme to landing page
2. Test thoroughly
3. Get user feedback

### Phase 2: Key Pages
1. Migrate dashboard
2. Migrate main features
3. Test navigation flow

### Phase 3: Full Migration
1. Migrate remaining pages
2. Update all components
3. Final testing

### Phase 4: Optimization
1. Remove unused styles
2. Optimize animations
3. Performance testing

## Rollback Plan

If you need to rollback:

1. **Remove theme wrapper:**
```tsx
// Change this
<div className="spooky-theme">

// To this
<div>
```

2. **Revert component imports:**
```tsx
// Change this
import { SpookyButton } from '@/ui';

// To this
<button className="...">
```

3. **Restore original colors:**
```tsx
// Change this
className="text-spooky-text-primary"

// To this
className="text-gray-900"
```

## Testing Checklist

After migration, verify:

- [ ] All pages render correctly
- [ ] Buttons are clickable
- [ ] Navigation works
- [ ] Forms are functional
- [ ] Responsive design intact
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] No console errors
- [ ] Performance acceptable

## Support

For migration issues:
1. Check [SPOOKY_THEME_GUIDE.md](./SPOOKY_THEME_GUIDE.md)
2. Review [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)
3. Inspect browser console for errors
4. Test with minimal example first
