# DecisionHub AI - Development Guide

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Code editor (VS Code recommended)
- Terminal/command line

### Initial Setup

1. **Install dependencies and setup**:
   ```bash
   ./scripts/setup.sh
   # or
   bash scripts/setup.sh
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

   This starts:
   - API server on http://localhost:3000
   - Web app on http://localhost:5173

### Project Structure

```
decisionhub-ai/
├── packages/
│   ├── api/          # Backend (Node.js + Express)
│   ├── web/          # Frontend (React + Vite)
│   └── shared/       # Shared types
├── specs/            # YAML specifications
├── docs/             # Documentation
└── scripts/          # Development scripts
```

## Development Workflow

### Working on the API

```bash
cd packages/api

# Start API only
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

**Key API Files**:
- `src/server.ts` - Express server entry point
- `src/routes/` - API route handlers
- `src/controllers/` - Business logic
- `src/services/` - Service layer
- `src/agents/` - Mock AI agents
- `src/data/cars.json` - Mock car database

### Working on the Web App

```bash
cd packages/web

# Start web only
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

**Key Web Files**:
- `src/App.tsx` - Main app component
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/services/api.ts` - API client

### Working on Shared Types

```bash
cd packages/shared

# Build (required after changes)
npm run build

# Type check
npm run type-check
```

**Important**: After changing shared types, rebuild:
```bash
cd packages/shared && npm run build && cd ../..
```

## Testing the Application

### Manual Testing Workflow

1. **Start servers**: `npm run dev`
2. **Open browser**: http://localhost:5173
3. **Test flow**:
   - Home page → Start search
   - Fill search form with criteria
   - Click "Get Recommendations"
   - View AI recommendations
   - Click "View Full Details" on a car
   - Review car details page

### API Testing

Test API endpoints directly:

```bash
# Health check
curl http://localhost:3000/api/health

# Get all cars
curl http://localhost:3000/api/cars

# Get recommendations
curl -X POST http://localhost:3000/api/cars/recommend \
  -H "Content-Type: application/json" \
  -d '{"maxPrice": 50000, "fuelTypes": ["hybrid", "electric"]}'
```

## Common Tasks

### Adding a New Car

1. Edit `packages/api/src/data/cars.json`
2. Add new car object following existing format
3. Restart API server

### Modifying Agent Logic

1. Edit agent files in `packages/api/src/agents/`
2. `CarRecommendationAgent.ts` - Recommendation logic
3. `CarComparisonAgent.ts` - Comparison logic
4. Changes take effect on save (hot reload)

### Adding a New API Endpoint

1. Create route in `packages/api/src/routes/`
2. Add controller in `packages/api/src/controllers/`
3. Add service method in `packages/api/src/services/`
4. Update `routes/index.ts` to mount route

### Adding a New Page

1. Create component in `packages/web/src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `Header.tsx`

### Updating Shared Types

1. Edit types in `packages/shared/src/types/`
2. Rebuild: `cd packages/shared && npm run build`
3. Restart API and Web servers

## Code Style

### TypeScript

- Use TypeScript for all files
- Enable strict mode
- Define interfaces for all data structures
- Avoid `any` types

### Formatting

```bash
# Format all code
npm run format

# Lint all code
npm run lint
```

### Component Structure

```typescript
// React component example
import { useState } from 'react';
import { SomeType } from '@decisionhub/shared';

interface MyComponentProps {
  prop1: string;
  prop2: number;
}

export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  const [state, setState] = useState<SomeType>(...);
  
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 5173 are in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

### TypeScript Errors

```bash
# Type check all packages
npm run type-check

# Rebuild shared package
cd packages/shared && npm run build && cd ../..
```

### Hot Reload Not Working

1. Restart the dev server
2. Clear browser cache
3. Check for syntax errors

## Building for Production

```bash
# Build all packages
npm run build

# Start production API server
cd packages/api && npm start

# Serve production web build
cd packages/web && npm run preview
```

## Environment Variables

### API (.env)
```bash
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Web (Vite)
Create `.env` in `packages/web/`:
```bash
VITE_API_URL=http://localhost:3000/api
```

## Next Steps

1. **Customize mock data**: Add more cars in `cars.json`
2. **Enhance agent logic**: Improve recommendation algorithms
3. **Add features**: Implement comparison view, filters, etc.
4. **Style improvements**: Customize Tailwind theme
5. **Add real AI**: Integrate OpenAI or Anthropic (Phase 2)

## Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## Getting Help

- Check [ARCHITECTURE.md](../ARCHITECTURE.md) for system overview
- Review [README.md](../README.md) for project info
- Look at existing code for patterns
- Use TypeScript types for guidance
