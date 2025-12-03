# Common Issues and Solutions

This steering document captures recurring problems encountered during development and their solutions. Use this to avoid repeating the same mistakes.

## UI/UX Issues

### SVG Interactivity Problems
**Problem:** Interactive SVG elements (like skeleton bones) not responding to clicks
**Root Cause:** SVG elements don't have pointer-events by default in some contexts
**Solution:**
```tsx
<circle
  style={{ pointerEvents: 'all' }}  // Critical!
  className="cursor-pointer"
  onClick={handleClick}
/>
```
**Prevention:** Always add `pointerEvents: 'all'` to interactive SVG elements

### Accessibility Oversights
**Problem:** Color contrast ratios below WCAG AA standards, missing ARIA labels
**Root Cause:** Focusing on visual design without accessibility testing
**Solution:**
- Use WebAIM contrast checker for all color combinations
- Add ARIA labels to all interactive elements
- Test with keyboard navigation
- Respect `prefers-reduced-motion`
**Prevention:** Run accessibility audit after every UI change

## Code Organization

### Import Path Inconsistency
**Problem:** Mix of relative imports (`../../`) and path aliases (`@/`)
**Root Cause:** Not establishing import conventions early
**Solution:** Always use path alias:
```typescript
// ✅ Correct
import { Agent } from '@/agents'
import { MessageBus } from '@/orchestration'

// ❌ Avoid
import { Agent } from '../../agents'
```
**Prevention:** Set up ESLint rule to enforce path aliases

### File Truncation in Large Files
**Problem:** Reading large files gets truncated, missing critical code
**Root Cause:** Default file reading limits
**Solution:**
- Use `start_line` and `end_line` parameters
- Read files in chunks
- Use grepSearch to locate specific code first
**Prevention:** For files >500 lines, always use targeted reading

## Testing

### Property Test Coverage Gaps
**Problem:** Missing property-based tests for new agents
**Root Cause:** Forgetting to write tests during rapid development
**Solution:**
- Write property test immediately after implementing agent
- Use fast-check with 100+ iterations
- Tag tests with design doc property numbers
**Prevention:** Hook reminds to write tests on agent file save

### Test Failures Due to Mocking
**Problem:** Tests pass with mocks but fail in production
**Root Cause:** Over-reliance on mocking instead of testing real behavior
**Solution:**
- Minimize mocking
- Test with real data generators
- Use property-based testing for comprehensive coverage
**Prevention:** Code review checklist includes "minimal mocking"

## Architecture

### Agent Count Mismatch
**Problem:** Displaying 6 agents in UI but only 4 implemented
**Root Cause:** UI built before all agents were implemented
**Solution:**
- Keep UI agent list in sync with actual implementations
- Use dynamic agent discovery instead of hardcoding
**Prevention:** Generate UI from actual agent registry

### Monorepo vs Separate Repos
**Problem:** Kiroween Skeleton Crew requires "2 separate repo folders"
**Root Cause:** Building as monorepo without considering submission requirements
**Solution:**
- Restructure into skeleton/, app-1/, app-2/
- Each folder is self-contained with own package.json
- See RESTRUCTURE_GUIDE.md for details
**Prevention:** Read submission requirements before starting architecture

## Development Workflow

### Repeated Manual Testing
**Problem:** Running tests manually after every change
**Root Cause:** Not using automated workflows
**Solution:**
- Set up test-on-save hook
- Use getDiagnostics instead of bash commands
- Automate lint checks before commits
**Prevention:** Hooks automate repetitive tasks

### Spec-Code Drift
**Problem:** Specs and implementation getting out of sync
**Root Cause:** Updating code without updating specs
**Solution:**
- Hook triggers reminder when specs change
- Link each implementation to specific spec requirement
- Regular spec review sessions
**Prevention:** Spec validation hook catches drift early

### Build Failures Before Commits
**Problem:** Committing code that doesn't build
**Root Cause:** Not running build check before committing
**Solution:**
- Run `npm run build` before every commit
- Set up pre-commit hook
- Use TypeScript strict mode to catch errors early
**Prevention:** Build check hook reminds after changes

## Performance

### Slow Development Iteration
**Problem:** Waiting for full builds during development
**Root Cause:** Not using dev mode efficiently
**Solution:**
- Use `npm run dev` for hot reload
- Run targeted tests instead of full suite
- Use getDiagnostics for quick error checking
**Prevention:** Hooks optimize for fast feedback loops

## Documentation

### Incomplete README
**Problem:** README doesn't explain 2-app structure clearly
**Root Cause:** Writing README after building, not during
**Solution:**
- Update README as architecture evolves
- Include clear "2 Applications" section
- Add setup instructions for each app
**Prevention:** Documentation hook reminds on major changes

## Lessons Learned

1. **Read submission requirements first** - Avoid architectural rework
2. **Accessibility from day one** - Harder to retrofit later
3. **Automate repetitive tasks** - Hooks save significant time
4. **Property-based testing** - Catches edge cases unit tests miss
5. **Steering docs prevent repetition** - This document exists because we repeated mistakes
6. **Use Kiro tools efficiently** - getDiagnostics > bash commands
7. **Keep specs and code in sync** - Drift causes confusion
8. **Test interactivity thoroughly** - SVG click handlers need special attention

## How to Use This Document

When Kiro encounters a problem:
1. Check if it's listed here
2. Apply the documented solution
3. If it's a new problem, add it to this document
4. Update relevant hooks to prevent recurrence

This document grows with the project, capturing institutional knowledge and preventing repeated mistakes.
