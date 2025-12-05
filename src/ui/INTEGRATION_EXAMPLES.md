# Spooky Theme Integration Examples

Real-world examples of integrating the spooky theme into CrewOS: CORBA Reborn pages.

## Example 1: Landing Page with Spooky Theme

```tsx
// src/app/page.tsx
import { 
  SpookyButton, 
  SpookyCard, 
  SpookyFloatingBones,
  SpookyTable 
} from '@/ui';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="spooky-theme">
      <SpookyFloatingBones count={3} />
      
      {/* Hero Section */}
      <section className="spooky-section text-center">
        <h1 className="mb-6">Multi-Agent AI Skeleton</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          A versatile skeleton for building multi-agent AI applications
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/support">
            <SpookyButton variant="cta">
              Open Demo: Support Copilot
            </SpookyButton>
          </Link>
          <Link href="/research">
            <SpookyButton variant="cta">
              Open Demo: Research Copilot
            </SpookyButton>
          </Link>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="spooky-section">
        <h2 className="text-center mb-8">Two apps, one skeleton</h2>
        <SpookyCard fog>
          <SpookyTable 
            headers={['Feature', 'Support Copilot', 'Research Copilot']}
            rows={[
              ['Purpose', 'Customer support automation', 'Research workflow'],
              ['Route', '/support', '/research'],
              ['Agents', '4 specialized agents', '4 specialized agents']
            ]}
          />
        </SpookyCard>
      </section>
    </main>
  );
}
```

## Example 2: Agent Dashboard

```tsx
// src/app/agents/page.tsx
import { 
  SpookyCard, 
  SpookyIcon, 
  SpookyWorkflowLine,
  SpookyButton,
  SpookySpinner 
} from '@/ui';
import { useState } from 'react';

export default function AgentDashboard() {
  const [loading, setLoading] = useState(false);
  
  const agents = [
    { id: 1, name: 'Intent Agent', active: true },
    { id: 2, name: 'FAQ Agent', active: true },
    { id: 3, name: 'Escalation Agent', active: false },
  ];

  return (
    <div className="spooky-theme min-h-screen">
      <div className="max-w-6xl mx-auto">
        <section className="spooky-section">
          <h1 className="text-center mb-12">Agent Dashboard</h1>
          
          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {agents.map(agent => (
              <SpookyCard key={agent.id} fog>
                <div className="flex items-center gap-3 mb-4">
                  <SpookyIcon 
                    type="skull" 
                    active={agent.active} 
                    size="lg" 
                  />
                  <h3>{agent.name}</h3>
                </div>
                <p className="mb-4">
                  Status: {agent.active ? (
                    <span className="text-spooky-accent-green">Active</span>
                  ) : (
                    <span className="text-spooky-text-muted">Inactive</span>
                  )}
                </p>
                <SpookyButton variant="primary">
                  View Details
                </SpookyButton>
              </SpookyCard>
            ))}
          </div>

          {/* Workflow Visualization */}
          <SpookyCard fog>
            <h2 className="mb-6">Message Flow</h2>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <SpookyIcon type="skull" active size="lg" />
                <p className="mt-2">User Input</p>
              </div>
              <SpookyWorkflowLine active orientation="horizontal" />
              <div className="text-center">
                <SpookyIcon type="skull" active size="lg" />
                <p className="mt-2">Intent Agent</p>
              </div>
              <SpookyWorkflowLine active orientation="horizontal" />
              <div className="text-center">
                <SpookyIcon type="skull" active size="lg" />
                <p className="mt-2">Response</p>
              </div>
            </div>
          </SpookyCard>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <SpookySpinner size="md" />
              <p>Processing request...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
```

## Example 3: Support Copilot with Spooky Theme

```tsx
// src/app/support/page.tsx
'use client';

import { useState } from 'react';
import { 
  SpookyCard, 
  SpookyButton, 
  SpookyIcon,
  SpookySpinner 
} from '@/ui';

export default function SupportCopilot() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // API call here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Response from support agent' 
    }]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="spooky-theme min-h-screen">
      <div className="max-w-4xl mx-auto">
        <section className="spooky-section">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <SpookyIcon type="lantern" active size="lg" />
            <h1>Support Copilot</h1>
          </div>

          {/* Chat Container */}
          <SpookyCard fog className="mb-6">
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="text-center text-spooky-text-muted py-12">
                  <SpookyIcon type="skull" size="lg" className="mx-auto mb-4" />
                  <p>Start a conversation with the support agent</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`mb-4 p-4 rounded ${
                      msg.role === 'user' 
                        ? 'bg-spooky-bg-tertiary ml-12' 
                        : 'bg-spooky-bg-primary mr-12'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <SpookyIcon 
                        type={msg.role === 'user' ? 'bones' : 'skull'} 
                        size="sm"
                        active={msg.role === 'assistant'}
                      />
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-center gap-3 p-4">
                  <SpookySpinner size="sm" />
                  <p className="text-spooky-text-muted">Agent is thinking...</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-spooky-bg-tertiary text-spooky-text-primary px-4 py-3 rounded border border-spooky-border-subtle focus:border-spooky-neon-accent focus:outline-none"
              />
              <SpookyButton 
                variant="primary" 
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                Send
              </SpookyButton>
            </div>
          </SpookyCard>

          {/* Agent Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Intent', 'FAQ', 'Escalation', 'Citation'].map(agent => (
              <SpookyCard key={agent}>
                <div className="flex items-center gap-2">
                  <SpookyIcon type="lantern" active size="sm" />
                  <span className="text-sm">{agent}</span>
                </div>
              </SpookyCard>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

## Example 4: Mixing Spooky with Standard Components

```tsx
// src/app/hybrid/page.tsx
import { SpookyCard, SpookyButton, spookyTheme } from '@/ui';

export default function HybridPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Standard header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Application
          </h1>
        </div>
      </header>

      {/* Spooky section */}
      <section className="spooky-theme py-12">
        <div className="max-w-4xl mx-auto">
          <SpookyCard fog>
            <h2 className="mb-4">Special Halloween Feature</h2>
            <p className="mb-6">
              This section uses the spooky theme while the rest of the page
              maintains standard styling.
            </p>
            <SpookyButton variant="cta">
              Try Spooky Feature
            </SpookyButton>
          </SpookyCard>
        </div>
      </section>

      {/* Standard footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-gray-600">© 2024 My Application</p>
        </div>
      </footer>
    </div>
  );
}
```

## Example 5: Using Theme Tokens Programmatically

```tsx
// src/components/CustomComponent.tsx
import { spookyTheme, getColorWithOpacity, createGradient } from '@/ui';

export function CustomComponent() {
  const cardStyle = {
    backgroundColor: spookyTheme.colors.background.secondary,
    border: `1px solid ${spookyTheme.colors.border.subtle}`,
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: spookyTheme.shadows.card,
  };

  const gradientStyle = {
    background: createGradient(['accent.purple', 'accent.green']),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div style={cardStyle}>
      <h2 style={gradientStyle}>
        Gradient Text
      </h2>
      <p style={{ color: spookyTheme.colors.text.secondary }}>
        Using theme tokens programmatically
      </p>
    </div>
  );
}
```

## Example 6: Conditional Spooky Theme

```tsx
// src/app/conditional/page.tsx
'use client';

import { useState } from 'react';
import { SpookyButton, SpookyCard } from '@/ui';

export default function ConditionalTheme() {
  const [spookyMode, setSpookyMode] = useState(false);

  return (
    <div className={spookyMode ? 'spooky-theme min-h-screen' : 'min-h-screen bg-white'}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <button
            onClick={() => setSpookyMode(!spookyMode)}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Toggle Spooky Mode: {spookyMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {spookyMode ? (
          <SpookyCard fog>
            <h1>Spooky Mode Activated! 👻</h1>
            <p className="my-4">
              The spooky theme is now active with all its Halloween glory.
            </p>
            <SpookyButton variant="cta">
              Spooky Action
            </SpookyButton>
          </SpookyCard>
        ) : (
          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Normal Mode
            </h1>
            <p className="my-4 text-gray-600">
              Standard styling without spooky effects.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded">
              Normal Action
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Tips for Integration

### 1. Gradual Adoption
Start by applying the theme to one page, then expand:
```tsx
// Start with landing page only
<main className="spooky-theme">
  {/* Only this page is spooky */}
</main>
```

### 2. Component-Level Theming
Apply theme to specific sections:
```tsx
<div className="standard-page">
  <section className="spooky-theme">
    {/* Only this section is spooky */}
  </section>
</div>
```

### 3. Performance Optimization
Lazy load spooky components:
```tsx
import dynamic from 'next/dynamic';

const SpookyFloatingBones = dynamic(
  () => import('@/ui').then(mod => mod.SpookyFloatingBones),
  { ssr: false }
);
```

### 4. Accessibility Testing
Always test with keyboard and screen readers:
```tsx
// Good: Proper focus management
<SpookyButton onClick={handleClick}>
  Action
</SpookyButton>

// Good: Semantic HTML
<nav className="spooky-theme">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>
```

### 5. Mobile Considerations
Reduce animations on mobile:
```tsx
import { prefersReducedMotion } from '@/ui';

export function MobileOptimized() {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <div className="spooky-theme">
      {!reducedMotion && <SpookyFloatingBones count={2} />}
      {/* Rest of content */}
    </div>
  );
}
```
