# GitHub Copilot Instructions for DecisionHub AI

## Project Context

DecisionHub AI is a spec-driven development platform with AI agent architecture. This MVP demonstrates intelligent car recommendations using mock AI agents.

## Architecture Overview

**Monorepo Structure**:
- `packages/api` - Node.js + Express + TypeScript backend
- `packages/web` - React + Vite + TypeScript frontend  
- `packages/shared` - Shared TypeScript types and utilities

**Key Principles**:
1. Spec-driven: YAML specs in `specs/` directory guide development
2. Type-safe: Full TypeScript coverage with strict mode
3. Agent-based: AI logic in `packages/api/src/agents/`
4. Extensible: Clean interfaces for swapping mock → real AI

## Code Style Guidelines

### TypeScript
- Use strict mode, avoid `any` types
- Define interfaces for all data structures
- Import shared types from `@decisionhub/shared`
- Use async/await, not callbacks or raw promises

### React Components
```typescript
// Preferred structure
import { useState } from 'react';
import { TypeName } from '@decisionhub/shared';

interface ComponentProps {
  prop: string;
}

export default function Component({ prop }: ComponentProps) {
  // hooks
  // handlers
  // return JSX
}
```

### API Endpoints
```typescript
// Standard pattern
export async function handlerName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Logic
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    next(error);
  }
}
```

### Agent Pattern
```typescript
// All agents extend BaseAgent
export class NewAgent extends BaseAgent {
  name = 'NewAgent';
  description = 'What this agent does';
  
  async execute(input: InputType): Promise<OutputType> {
    this.log('Executing...');
    // Agent logic
    return result;
  }
}
```

## Important Patterns

### Import Shared Types
```typescript
import { Car, CarSearchCriteria, ApiResponse } from '@decisionhub/shared';
```

### API Responses
Always use standard format:
```typescript
{
  success: boolean,
  data?: T,
  error?: { code: string, message: string },
  timestamp: string
}
```

### Error Handling
Use error handler middleware, not try-catch in routes:
```typescript
// Good
export async function handler(req, res, next) {
  try {
    // logic
  } catch (error) {
    next(error); // Let middleware handle it
  }
}
```

### Styling
Use Tailwind utility classes, leverage custom classes from `index.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card`
- `.input`

## MVP Constraints

**Currently NOT Implemented** (suggest alternatives if requested):
- No database (use local JSON in `packages/api/src/data/`)
- No real AI (agents in `packages/api/src/agents/` are mock)
- No authentication (all endpoints public)
- No external services (everything local)

**When adding features**, maintain MVP simplicity:
- Keep data in JSON files
- Keep agent logic rule-based (no LLM calls)
- No new external dependencies if possible

## File Conventions

### Naming
- Components: PascalCase (e.g., `SearchForm.tsx`)
- Utilities: camelCase (e.g., `validators.ts`)
- Types: PascalCase (e.g., `Car`, `CarSearchCriteria`)
- Files: Match the primary export name

### Structure
- One component per file
- Export default for components
- Export named for utilities/types
- Colocate related files

## When Helping

### Adding New Features
1. Check if type exists in `@decisionhub/shared`
2. If adding car attributes, update `specs/categories/cars/models.yml`
3. If modifying scoring, respect decision factor weights
4. Keep API and Web changes synchronized

### Debugging
1. Check TypeScript errors first (`npm run type-check`)
2. Verify shared package is built (`cd packages/shared && npm run build`)
3. Check API logs in terminal
4. Check browser console for frontend errors

### Suggesting Improvements
- Prefer simple solutions (MVP mindset)
- Maintain existing patterns
- Don't suggest real AI integration (deferred to Phase 2)
- Don't suggest database (deferred to Phase 2)

## Example Tasks

### Add New Car Attribute
1. Update `specs/categories/cars/models.yml`
2. Add to `packages/shared/src/types/car.ts`
3. Rebuild shared: `cd packages/shared && npm run build`
4. Update `packages/api/src/data/cars.json`
5. Update agent logic if needed for scoring

### Add New API Endpoint
1. Create route in `packages/api/src/routes/`
2. Create controller in `packages/api/src/controllers/`
3. Add service method in `packages/api/src/services/`
4. Register route in `packages/api/src/routes/index.ts`
5. Add API client method in `packages/web/src/services/api.ts`

### Add New Page
1. Create component in `packages/web/src/pages/`
2. Add route in `packages/web/src/App.tsx`
3. Add navigation in `packages/web/src/components/layout/Header.tsx`

## Common Gotchas

- ❌ Don't import from `packages/X` directly - use workspace names (`@decisionhub/shared`)
- ❌ Don't forget to rebuild shared after type changes
- ❌ Don't add external APIs without discussing MVP scope
- ❌ Don't skip error handling in async functions
- ✅ DO use shared types for consistency
- ✅ DO follow existing patterns
- ✅ DO keep it simple (MVP!)

## Resources

- Specs: `specs/categories/cars/`
- Architecture: `ARCHITECTURE.md`
- Development: `docs/DEVELOPMENT.md`
- Types: `packages/shared/src/types/`

---

**Remember**: This is an MVP focused on demonstrating architecture and patterns, not production features. Keep suggestions aligned with this goal.
