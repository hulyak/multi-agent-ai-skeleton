# Landing Page Design Document

## Overview

The landing page serves as the entry point for the Multi-Agent AI Skeleton project, targeting developers and Kiroween judges. It showcases the skeleton's architecture, provides access to two demo applications (Support Copilot and Research Copilot), and demonstrates the use of Kiro features (specs, steering, hooks, MCP) to comply with Skeleton Crew rules.

The page will be built using Next.js 15 with React 19, styled with Tailwind CSS, and feature a subtle spooky dark theme that maintains professional developer aesthetics.

## Architecture

### Component Structure

```
src/app/page.tsx (Landing Page)
├── HeroSection
│   ├── Headline
│   └── CTAButtons (Support Demo, Research Demo)
├── RuntimeSection
│   ├── Description
│   └── ArchitectureDiagram
├── ComparisonSection
│   ├── SectionTitle
│   └── ComparisonTable
└── KiroFeaturesSection
    ├── SectionTitle
    ├── FeatureList
    └── DirectoryLink
```

### Routing

- `/` - Landing page (main entry point)
- `/support` - Support Copilot demo (existing)
- `/research` - Research Copilot demo (existing)

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **TypeScript**: 5.3

## Components and Interfaces

### Page Component

The main landing page will be a server component that renders all sections statically.

```typescript
// src/app/page.tsx
export default function Home() {
  return (
    <main className="landing-page">
      <HeroSection />
      <RuntimeSection />
      <ComparisonSection />
      <KiroFeaturesSection />
    </main>
  );
}
```

### HeroSection Component

```typescript
interface HeroSectionProps {
  // No props needed - static content
}

// Renders headline and two CTA buttons
// Links to /support and /research routes
```

### RuntimeSection Component

```typescript
interface RuntimeSectionProps {
  // No props needed - static content
}

// Renders explanation of message bus and shared state
// Includes SVG or Mermaid diagram showing architecture
```

### ComparisonSection Component

```typescript
interface ComparisonSectionProps {
  // No props needed - static content
}

interface AppComparison {
  name: string;
  route: string;
  folder: string;
  purpose: string;
  features: string[];
  agents: string[];
}

// Renders comparison table between Support and Research apps
```

### KiroFeaturesSection Component

```typescript
interface KiroFeaturesSectionProps {
  // No props needed - static content
}

interface KiroFeature {
  name: string;
  description: string;
  usage: string;
}

// Lists specs, steering, hooks, MCP with descriptions
// Links to /.kiro directory
```

## Data Models

### Application Comparison Data

```typescript
const applications: AppComparison[] = [
  {
    name: "Support Copilot",
    route: "/support",
    folder: "/src/app/support",
    purpose: "Customer support automation with intelligent routing and escalation",
    features: [
      "Intent detection",
      "FAQ matching",
      "Escalation handling",
      "Citation tracking"
    ],
    agents: ["IntentDetectionAgent", "FAQAgent", "EscalationAgent", "CitationAgent"]
  },
  {
    name: "Research Copilot",
    route: "/research",
    folder: "/src/app/research",
    purpose: "Research workflow automation with retrieval and summarization",
    features: [
      "Document retrieval",
      "Content summarization",
      "Citation management",
      "Workflow coordination"
    ],
    agents: ["RetrievalAgent", "SummarizationAgent", "CitationAgent", "ResearchWorkflowCoordinator"]
  }
];
```

### Kiro Features Data

```typescript
const kiroFeatures: KiroFeature[] = [
  {
    name: "Specs",
    description: "Formal requirements and design documents",
    usage: "Used to define agent behaviors, orchestration logic, and system architecture"
  },
  {
    name: "Steering",
    description: "Context and instructions for AI agents",
    usage: "Guides agent decision-making and ensures consistent behavior"
  },
  {
    name: "Hooks",
    description: "Event-driven automation triggers",
    usage: "Automates testing, validation, and workflow coordination"
  },
  {
    name: "MCP",
    description: "Model Context Protocol integration",
    usage: "Enables external tool integration and extended capabilities"
  }
];
```

## Styling and Theme

### Spooky Dark Theme

The theme uses a dark base with subtle Halloween-inspired accents while maintaining professional aesthetics.

#### Color Palette

```css
/* Base Colors */
--bg-primary: #0a0a0f;        /* Deep dark blue-black */
--bg-secondary: #1a1a2e;      /* Dark navy */
--bg-tertiary: #16213e;       /* Slightly lighter navy */

/* Accent Colors (Halloween-inspired) */
--accent-orange: #ff6b35;     /* Pumpkin orange */
--accent-purple: #8b5cf6;     /* Mystic purple */
--accent-green: #10b981;      /* Eerie green */

/* Text Colors */
--text-primary: #f8f9fa;      /* Off-white */
--text-secondary: #cbd5e1;    /* Light gray */
--text-muted: #94a3b8;        /* Muted gray */

/* Border Colors */
--border-subtle: #2d3748;     /* Subtle dark border */
--border-accent: #4a5568;     /* Slightly visible border */
```

#### Typography

- **Headings**: Bold, large, with subtle glow effect on hover
- **Body**: Clean, readable sans-serif
- **Code**: Monospace with syntax highlighting

#### Visual Effects

- Subtle box shadows with colored glows
- Smooth transitions on hover states
- Minimal animations (fade-in on scroll)
- Gradient backgrounds with dark tones

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Stack sections vertically on mobile
- Side-by-side comparison on desktop

## Architecture Diagram

The RuntimeSection will include a simple diagram showing:

```
┌─────────────────────────────────────────┐
│         Message Bus (Central Hub)       │
│  - Event routing                        │
│  - Agent communication                  │
│  - Pub/sub messaging                    │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌──▼────┐ ┌──▼────┐
│Agent 1│ │Agent 2│ │Agent N│
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └─────────┼─────────┘
              │
┌─────────────▼───────────────────────────┐
│      Shared State (Centralized)         │
│  - Workflow state                       │
│  - Agent context                        │
│  - Conversation history                 │
└─────────────────────────────────────────┘
```

This will be implemented as an SVG or using CSS for a clean, developer-friendly visualization.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, most requirements for this landing page are specific examples of UI elements that should be present rather than universal properties that hold across all inputs. This is typical for a static landing page where we're verifying the presence of specific content rather than testing behavior across varying inputs.

The testable requirements are primarily examples that verify:
- Specific sections exist with specific content
- Specific buttons and links are present with correct labels
- Navigation works correctly to specific routes
- Specific Kiro features are listed

Since this is a static landing page with fixed content, we don't have universal properties in the traditional property-based testing sense. Instead, we have a set of concrete examples that verify the page structure and content.

### Example-Based Tests

Rather than universal properties, we will implement example-based unit tests that verify:

**Example 1: Hero section structure**
The landing page should render a hero section containing a headline about the Multi-Agent AI Skeleton and two CTA buttons with the labels "Open Demo: Support Copilot" and "Open Demo: Research Copilot"
**Validates: Requirements 1.1, 1.2**

**Example 2: Support demo navigation**
When the "Open Demo: Support Copilot" button is clicked, the application should navigate to the /support route
**Validates: Requirements 1.3**

**Example 3: Research demo navigation**
When the "Open Demo: Research Copilot" button is clicked, the application should navigate to the /research route
**Validates: Requirements 1.4**

**Example 4: Runtime section presence**
The landing page should render a runtime section that includes descriptions of the message bus and shared state, along with an architecture diagram
**Validates: Requirements 2.1, 2.2, 2.3**

**Example 5: Comparison section structure**
The landing page should render a section titled "Two apps, one skeleton" containing a comparison table with information about Support Copilot and Research Copilot, including their purposes, features, and folder locations
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Example 6: Kiro features section**
The landing page should render a section titled "Powered by Kiro" that lists all four Kiro features (specs, steering, hooks, MCP) with descriptions and includes a link to the /.kiro directory
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

**Example 7: Dark theme application**
The landing page should apply a dark color scheme as the base theme
**Validates: Requirements 5.1**

**Example 8: No marketing elements**
The landing page should not contain any marketing waitlist forms
**Validates: Requirements 6.1**

**Example 9: Demo and resource links**
The landing page should provide direct links to both demo applications and technical resources
**Validates: Requirements 6.3**

## Error Handling

### Navigation Errors

- If navigation to /support or /research fails, the application should handle the error gracefully
- Invalid routes should be handled by Next.js's built-in 404 page

### Rendering Errors

- If any section fails to render, it should not crash the entire page
- Use React error boundaries if needed for complex components

### Missing Data

- All content is static and hardcoded, so missing data scenarios are not applicable
- If future dynamic content is added, implement fallback UI

## Testing Strategy

### Unit Testing

Since this is a static landing page with fixed content, we will use unit tests to verify the presence and behavior of UI elements. We will use React Testing Library with Jest.

**Test Coverage:**

1. **Hero Section Tests**
   - Verify hero section renders with correct headline
   - Verify both CTA buttons are present with correct labels
   - Verify button click handlers trigger navigation

2. **Runtime Section Tests**
   - Verify runtime section renders
   - Verify message bus and shared state descriptions are present
   - Verify architecture diagram is rendered

3. **Comparison Section Tests**
   - Verify section title is correct
   - Verify comparison table renders with both applications
   - Verify application details (purpose, features, folders) are displayed

4. **Kiro Features Section Tests**
   - Verify section title is correct
   - Verify all four Kiro features are listed
   - Verify descriptions are present for each feature
   - Verify link to /.kiro directory exists

5. **Theme Tests**
   - Verify dark theme classes are applied
   - Verify no marketing/waitlist forms are present

6. **Navigation Tests**
   - Verify links to /support and /research work correctly
   - Verify link to /.kiro directory is correct

### Property-Based Testing

Property-based testing is not applicable for this feature because:
- The landing page has fixed, static content
- There are no universal properties that should hold across varying inputs
- All requirements are specific examples of UI elements that should be present

If future enhancements add dynamic content or user-generated data, property-based testing could be introduced at that time.

### Integration Testing

- Test that the landing page integrates correctly with Next.js routing
- Verify that navigation to /support and /research pages works end-to-end
- Test that the page renders correctly in different viewport sizes (responsive design)

### Testing Framework

- **Unit Tests**: Jest + React Testing Library
- **Test Location**: `src/app/__tests__/page.test.tsx`
- **Test Execution**: Run with `npm test`

## Implementation Notes

### Component Organization

Components can be implemented inline in `src/app/page.tsx` or extracted to separate files in `src/ui/` if they become complex. For a landing page, inline implementation is acceptable.

### Styling Approach

Use Tailwind CSS utility classes for styling. Define custom colors in `tailwind.config.ts` for the spooky theme palette.

### Accessibility

- Ensure all interactive elements (buttons, links) are keyboard accessible
- Use semantic HTML elements (nav, section, main)
- Provide appropriate ARIA labels where needed
- Maintain sufficient color contrast for readability

### Performance

- Landing page should be statically generated at build time (SSG)
- Optimize images if any are added
- Minimize JavaScript bundle size by keeping components simple

### Future Enhancements

- Add animations on scroll (fade-in effects)
- Add interactive diagram with hover states
- Add code snippets showing example usage
- Add testimonials or case studies section
