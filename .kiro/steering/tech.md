# Technology Stack

## Core Technologies

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.3+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.4+
- **Testing**: Jest 29 + fast-check (property-based testing)
- **Linting**: ESLint with Next.js config

## TypeScript Configuration

Strict mode enabled with additional checks:
- `noUnusedLocals`, `noUnusedParameters`
- `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `forceConsistentCasingInFileNames`
- Path alias: `@/*` maps to `./src/*`

## Testing Strategy

- **Primary**: Property-based tests using fast-check for correctness guarantees
- **Secondary**: Unit tests for specific edge cases
- Test files: `__tests__/*.test.ts` or `__tests__/*.property.test.ts`
- Coverage excludes: `*.d.ts`, `*.stories.*`, `__tests__/`

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Building
npm run build            # Production build
npm start                # Start production server

# Testing
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
```

## Styling Conventions

- Tailwind utility classes preferred over custom CSS
- Custom theme tokens in `tailwind.config.ts`
- Spooky theme with custom colors, animations, and keyframes
- UI components in `src/ui/` with theme tokens exported from `theme-tokens.ts`

## Dependencies

- **Runtime**: next, react, react-dom
- **Dev**: TypeScript, Jest, fast-check, ESLint, Tailwind, ts-jest
- **Testing**: @testing-library/react, @testing-library/jest-dom
- **Utilities**: chokidar (file watching for SpecLoader)
