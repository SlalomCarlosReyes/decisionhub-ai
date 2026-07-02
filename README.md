# DecisionHub AI - MVP (Capstone)

> Spec-Driven Development Platform with AI Agent Architecture

## 🚀 Overview

DecisionHub AI is an intelligent platform for the Colombian automotive market that uses AI agents to provide personalized vehicle recommendations. The platform features a conversational Spanish interface and supports both real AI (via GitHub Models) and mock AI fallback.

**Current Focus**: Car recommendation system with AI-powered natural language understanding.

## 🏗️ Architecture (MVP)

This project uses a **monorepo structure** with npm workspaces:

- **`packages/api`** - Node.js + Express + TypeScript (RESTful API)
- **`packages/web`** - React + Vite + TypeScript (Frontend SPA)
- **`packages/shared`** - Shared TypeScript types and utilities
- **`specs/`** - YAML specification files for categories
- **`.github/copilot/`** - GitHub Copilot instructions

📖 **[Read Full Architecture Documentation](./ARCHITECTURE.md)**

## ✨ MVP Features

- 🤖 **AI Provider Abstraction** - Support for GitHub Models (real AI) with mock fallback
- 💬 **Conversational Interface** - Natural language queries in Spanish
- 🔍 **Research Agent** - AI-powered query analysis and preference detection
- 🎯 **Lead Decision Agent** - Intelligent explanation of recommendation strategies
- 🚗 **Car Recommendations** - Context-aware vehicle suggestions for Colombian market
- 🇨🇴 **Colombian Localization** - COP currency, Spanish UI, local market focus
- 📊 **Agent Activity Timeline** - Real-time visualization of AI agent workflow
- 🔌 **Provider-Agnostic Design** - Easy to add new AI providers (OpenAI, Anthropic, etc.)
- 💾 **Local Data** - JSON-based car database (no external DB required)
- 🎯 **Type-Safe** - Full TypeScript across all packages

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **AI Providers** | GitHub Models API (Azure OpenAI), Mock AI |
| **Data** | Local JSON files (12 Colombian market vehicles) |
| **Styling** | Tailwind CSS 3.4+ |
| **Package Manager** | npm workspaces |
| **Module System** | ES2020 modules |

## 🤖 AI Integration

DecisionHub AI supports multiple AI providers with automatic fallback:

### GitHub Models (Real AI)
- Access to GPT-4o, Claude Sonnet 4.5, and other models
- Requires GitHub Personal Access Token
- Context-aware understanding of Colombian market
- Real-time natural language processing

### Mock Provider (Fallback)
- Rule-based analysis (always available)
- No API keys required
- Keyword matching and pattern recognition
- Zero cost operation

📖 **[Read AI Provider Guide](./docs/AI_PROVIDER_GUIDE.md)**

### Quick Setup

```bash
# In packages/api/.env
AI_PROVIDER=mock              # or 'github' for real AI
GITHUB_TOKEN=your_token       # Required for GitHub Models
MODEL_ID=gpt-4o              # Or claude-sonnet-4, etc.
```

## 📋 Project Status

```
✅ Monorepo with npm workspaces
✅ API server with Express + TypeScript
✅ React frontend with Vite + Tailwind
✅ Shared types package
✅ AI Provider abstraction (GitHub Models + Mock)
✅ Research Agent (AI-powered)
✅ Lead Decision Agent (AI-powered)
✅ Natural Language Recommendation Agent
✅ Colombian market localization (COP, Spanish)
✅ Conversational UI with Agent Timeline
✅ 12 mock vehicles with Colombian pricing
✅ Complete documentation
⏳ Demo preparation - Pending
```

## 🚦 Getting Started (After Setup)

### Prerequisites

- Node.js 20+
- npm 10+
- Git
- Code editor (VS Code recommended)

### Installation

```bash
# Install all dependencies (monorepo)
npm install

# Start development servers (both API and Web)
npm run dev

# API will run on http://localhost:3000
# Web will run on http://localhost:5173
```

### Project Structure

```bash
# Navigate to specific packages
cd packages/api      # Backend development
cd packages/web      # Frontend development
cd packages/shared   # Shared types/utils
```

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete MVP architecture & future enhancements
- [SPEC_WORKFLOW.md](./SPEC_WORKFLOW.md) - Spec-driven development workflow
- [IMPLEMENTATION_DECISIONS.md](./IMPLEMENTATION_DECISIONS.md) - Technical decisions (updated for MVP)

## 🎯 Development Roadmap

### MVP (Capstone Demo) - 8 Days ✅
- [x] Architecture planning and documentation
- [ ] Monorepo setup with npm workspaces
- [ ] TypeScript configuration
- [ ] Car specifications and mock data
- [ ] Mock AI agent implementation
- [ ] API endpoints (search, recommend, compare)
- [ ] React frontend with car search
- [ ] Demo preparation and testing

### Phase 2: Real AI Integration 🔮
- [ ] OpenAI/Anthropic integration
- [ ] Replace mock agents with LLM calls
- [ ] Streaming responses
- [ ] Conversation memory

### Phase 3: Production Features 🔮
- [ ] PostgreSQL + Prisma
- [ ] User authentication
- [ ] Docker deployment
- [ ] CI/CD with GitHub Actions

### Phase 4: Advanced Features 🔮
- [ ] Vector database for semantic search
- [ ] Multi-category support
- [ ] Automated spec-to-code generation
- [ ] Advanced agent orchestration

See [ARCHITECTURE.md](./ARCHITECTURE.md#future-enhancements-post-mvp) for detailed enhancement plans.

## 🎨 Design Philosophy

### Why Start with Mock Agents?

1. **Predictable Demos** - No API failures during presentations
2. **No API Costs** - Free to develop and test
3. **Fast Iteration** - No network latency
4. **Learning Focus** - Understand agent patterns first
5. **Easy Migration** - Clean interfaces for future LLM integration

### Spec-Driven Development (MVP)

Specs guide development even without automation:
- **Document** domain model and attributes
- **Align** frontend and backend on data structure
- **Guide** mock agent logic and decision factors
- **Enable** future code generation

## 🤝 Contributing

This is a capstone project. Feedback and suggestions welcome!

## 📄 License

[MIT License](./LICENSE)

---

**Status**: 📐 MVP Architecture Complete - Ready to Scaffold  
**Next Step**: Run setup and start implementing core features