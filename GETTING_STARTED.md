# 🚗 DecisionHub AI - Setup & Run Guide

## ✅ Project Successfully Scaffolded!

Your MVP monorepo is ready with:
- ✅ Root configuration (package.json, tsconfig, ESLint, Prettier)
- ✅ packages/shared with TypeScript types
- ✅ packages/api with Express backend and mock AI agents
- ✅ packages/web with React + Vite frontend
- ✅ specs/ with YAML specifications
- ✅ Complete documentation and demo script
- ✅ 12 sample cars in mock database

## 🚀 Quick Start (First Time)

### 1. Run Setup
```bash
bash scripts/setup.sh
```

This will:
- Install all dependencies
- Build the shared package
- Create .env file for API
- Verify everything is ready

### 2. Start Development Servers
```bash
npm run dev
```

This starts:
- **API**: http://localhost:3000
- **Web**: http://localhost:5173

### 3. Open Your Browser
Navigate to: **http://localhost:5173**

You should see the DecisionHub AI home page!

## 📖 What to Try

### Test the Application
1. Click "Get Started" or "Search Cars"
2. Set your criteria:
   - Budget: $50,000
   - Fuel Types: Electric, Hybrid
   - Body Type: SUV
3. Click "Get Recommendations"
4. View AI-powered recommendations with reasoning
5. Click "View Full Details" on any car

### Test the API Directly
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

## 📂 Project Structure

```
decisionhub-ai/
├── packages/
│   ├── api/          # Backend (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── agents/    # 🤖 Mock AI agents
│   │   │   ├── data/      # 📊 Mock car database (JSON)
│   │   │   ├── routes/    # 🛣️  API routes
│   │   │   └── server.ts  # 🚀 Entry point
│   │   └── package.json
│   │
│   ├── web/          # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── pages/     # 📄 Page components
│   │   │   ├── components/# 🧩 Reusable components
│   │   │   └── services/  # 🔌 API client
│   │   └── package.json
│   │
│   └── shared/       # Shared TypeScript types
│       └── src/types/
│
├── specs/            # 📝 YAML specifications
│   └── categories/cars/
│
├── docs/             # 📚 Documentation
│   ├── DEMO.md            # Demo script
│   └── DEVELOPMENT.md     # Dev guide
│
└── scripts/          # 🛠️  Helper scripts
```

## 🎯 Key Files to Explore

### Backend
- `packages/api/src/agents/CarRecommendationAgent.ts` - Mock AI logic
- `packages/api/src/data/cars.json` - Sample car data (12 cars)
- `packages/api/src/routes/cars.ts` - API endpoints

### Frontend
- `packages/web/src/pages/CarSearchPage.tsx` - Main search interface
- `packages/web/src/components/cars/SearchForm.tsx` - Search form
- `packages/web/src/services/api.ts` - API client

### Shared
- `packages/shared/src/types/car.ts` - Car type definitions
- `packages/shared/src/types/agent.ts` - Agent interfaces

### Specs
- `specs/categories/cars/models.yml` - Car category specification
- `specs/categories/cars/features.yml` - Feature definitions

## 🔧 Common Commands

```bash
# Start both servers
npm run dev

# Start API only
npm run dev:api

# Start Web only
npm run dev:web

# Build all packages
npm run build

# Type check all packages
npm run type-check

# Lint all packages
npm run lint

# Format all code
npm run format
```

## 🎓 Next Steps

### Immediate (Learn the Code)
1. ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
2. ✅ Read [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Development workflow
3. ✅ Explore the code - Follow the patterns
4. ✅ Test the application - Try different search criteria

### Short Term (Customize)
1. Add more cars to `packages/api/src/data/cars.json`
2. Modify agent logic in `CarRecommendationAgent.ts`
3. Customize Tailwind theme in `packages/web/tailwind.config.js`
4. Add new features or filters

### Medium Term (Enhance)
1. Implement car comparison view
2. Add more detailed filtering options
3. Improve agent scoring algorithms
4. Add data visualization (charts/graphs)

### Future (Production Features)
1. **Phase 2**: Integrate real AI (OpenAI/Anthropic)
2. **Phase 3**: Add PostgreSQL + Prisma
3. **Phase 3**: Implement authentication
4. **Phase 3**: Deploy to cloud (Vercel + Railway)
5. **Phase 4**: Add more categories (electronics, real estate)

See [ARCHITECTURE.md](./ARCHITECTURE.md#future-enhancements-post-mvp) for complete roadmap.

## 🎬 Demo Preparation

When you're ready to present:
1. Read [docs/DEMO.md](./docs/DEMO.md) - Complete demo script
2. Practice the demo flow
3. Prepare to show:
   - Working application
   - Spec files
   - Agent architecture
   - TypeScript types

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Find and kill process on port 5173
lsof -i :5173
kill -9 <PID>
```

### Module Not Found
```bash
# Rebuild shared package
cd packages/shared
npm run build
cd ../..

# Restart dev servers
npm run dev
```

### TypeScript Errors
```bash
# Type check to see all errors
npm run type-check

# Common fix: Rebuild shared
cd packages/shared && npm run build && cd ../..
```

### Dependencies Issues
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture (MVP + future)
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guide
- **[docs/DEMO.md](./docs/DEMO.md)** - Demo script
- **[specs/categories/cars/README.md](./specs/categories/cars/README.md)** - Spec documentation

## 💡 Tips

- **Use TypeScript types** - They guide you and prevent errors
- **Check the specs** - They define the domain model
- **Follow existing patterns** - Consistency is key
- **Keep it simple** - This is an MVP, don't over-engineer
- **Test frequently** - Run the app after changes

## 🤝 GitHub Copilot

GitHub Copilot is configured for this project:
- Instructions: `.github/copilot/instructions.md`
- Copilot knows the architecture, patterns, and constraints
- Ask it for help with new features or debugging

## 🎉 You're Ready!

Everything is set up and ready to go. Start the servers and begin exploring:

```bash
npm run dev
```

Then open: **http://localhost:5173**

**Happy coding! 🚀**

---

## 📞 Quick Reference

| What | Command | URL |
|------|---------|-----|
| Setup | `bash scripts/setup.sh` | - |
| Start Servers | `npm run dev` | - |
| API | Running automatically | http://localhost:3000 |
| Web App | Running automatically | http://localhost:5173 |
| Health Check | `curl localhost:3000/api/health` | - |
| Type Check | `npm run type-check` | - |
| Lint | `npm run lint` | - |
| Format | `npm run format` | - |
| Build | `npm run build` | - |

---

**Next**: Run `bash scripts/setup.sh` to get started! 🎯
