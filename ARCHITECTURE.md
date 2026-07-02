# DecisionHub AI - MVP Architecture (Capstone)

## Overview
DecisionHub AI is a spec-driven development platform powered by AI agents. This MVP architecture focuses on demonstrating core concepts with a simplified tech stack, while maintaining extensibility for future enhancements.

**MVP Goal**: Demonstrate spec-driven development with mock AI agents for car recommendations.

## Repository Structure (Monorepo - MVP)

```
decisionhub-ai/
├── .github/                           # GitHub Copilot integration
│   └── copilot/
│       └── instructions.md           # GitHub Copilot guidance
│
├── packages/                          # Monorepo packages (npm workspaces)
│   ├── api/                          # Backend API (Node.js + Express)
│   │   ├── src/
│   │   │   ├── routes/               # API routes
│   │   │   │   ├── index.ts          # Route aggregator
│   │   │   │   ├── cars.ts           # Car endpoints
│   │   │   │   └── health.ts         # Health check
│   │   │   ├── controllers/          # Business logic
│   │   │   │   └── carController.ts
│   │   │   ├── services/             # Core services
│   │   │   │   └── carService.ts
│   │   │   ├── agents/               # AI agent logic (MVP: mock)
│   │   │   │   ├── base/
│   │   │   │   │   ├── AgentInterface.ts    # Agent contract
│   │   │   │   │   └── BaseAgent.ts         # Base implementation
│   │   │   │   ├── CarRecommendationAgent.ts # Mock AI logic
│   │   │   │   ├── CarComparisonAgent.ts     # Mock comparison
│   │   │   │   └── AgentOrchestrator.ts      # Coordinates agents
│   │   │   ├── data/                 # Local mock data
│   │   │   │   ├── cars.json         # Car database (JSON)
│   │   │   │   └── mockData.ts       # TypeScript mock helpers
│   │   │   ├── middleware/           # Express middleware
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── cors.ts
│   │   │   ├── types/                # API-specific types
│   │   │   ├── utils/                # Utilities
│   │   │   └── server.ts             # Entry point
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── web/                          # React frontend (Vite)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/           # React components
│   │   │   │   ├── common/           # Reusable components
│   │   │   │   ├── cars/             # Car-specific components
│   │   │   │   └── layout/           # Layout components
│   │   │   ├── pages/                # Page components
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── CarSearchPage.tsx
│   │   │   │   └── CarDetailsPage.tsx
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   └── useCars.ts
│   │   │   ├── services/             # API client
│   │   │   │   └── api.ts
│   │   │   ├── utils/                # Utility functions
│   │   │   ├── types/                # Frontend-specific types
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── shared/                       # Shared code between packages
│       ├── src/
│       │   ├── types/                # Shared TypeScript types
│       │   │   ├── car.ts            # Car interfaces
│       │   │   ├── agent.ts          # Agent interfaces
│       │   │   └── api.ts            # API contracts
│       │   ├── constants/            # Shared constants
│       │   │   └── categories.ts
│       │   ├── utils/                # Shared utilities
│       │   │   └── validators.ts
│       │   └── index.ts              # Public exports
│       ├── package.json
│       └── tsconfig.json
│
├── specs/                            # Specification files
│   ├── categories/                   # Category-specific specs
│   │   └── cars/                     # Car category specs
│   │       ├── models.yml            # Car model specifications
│   │       └── features.yml          # Feature definitions
│   └── README.md                     # Spec documentation
│
├── docs/                             # Documentation
│   ├── DEMO.md                       # Demo script for capstone
│   ├── ARCHITECTURE.md               # This file
│   └── DEVELOPMENT.md                # Development guide
│
├── scripts/                          # Development scripts
│   ├── dev.sh                        # Start all dev servers
│   └── setup.sh                      # Initial setup
│
├── .gitignore
├── .npmrc                            # npm configuration
├── package.json                      # Root package.json (workspaces)
├── tsconfig.json                     # Root TypeScript config
├── README.md
└── LICENSE
```

## MVP Design Principles

### 1. **Simplicity First**
- Start with essentials, add complexity as needed
- Mock data and deterministic logic for MVP
- Easy-to-understand codebase for demonstration

### 2. **Monorepo Structure**
- Uses **npm workspaces** for dependency management
- Shared code in `packages/shared` to avoid duplication
- Three core packages: api, web, shared

### 3. **Spec-Driven Foundation**
- Specifications in `specs/` directory document the domain
- YAML-based specs for human readability
- Specs guide development but don't auto-generate code (yet)
- Demonstrates the concept for capstone presentation

### 4. **Mock AI Agents (MVP)**
- AI agent logic lives in `packages/api/src/agents`
- Deterministic, rule-based logic for predictable demos
- Agent interface designed for easy replacement with real AI
- Mock responses demonstrate agent orchestration patterns

### 5. **Extensibility by Design**
- Clean interfaces allow swapping mock → real implementations
- Agent abstraction supports future LLM integration
- Data layer ready to migrate from JSON → database
- Category-agnostic base architecture

### 6. **Separation of Concerns**
- API: RESTful backend with Express
- Web: React SPA with Vite
- Shared: Common types and interfaces
- Agents: Isolated AI logic (currently mock)

## MVP Technology Stack

### Backend (packages/api)
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Data Storage**: Local JSON files (mock data)
- **API Style**: RESTful
- **Validation**: Zod or manual validation

### Frontend (packages/web)
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS (or plain CSS)
- **Routing**: React Router v6
- **HTTP Client**: fetch API or axios

### Shared (packages/shared)
- **Language**: TypeScript
- **Purpose**: Shared types, interfaces, constants
- **Exports**: Common utilities and type definitions

### AI Agents (MVP - Mock Implementation)
- **Location**: `packages/api/src/agents`
- **Approach**: Deterministic rule-based logic
- **Pattern**: Agent interface with mock implementations
- **Orchestration**: Simple coordinator for multi-agent flows

### Development Tools
- **Package Manager**: npm (with workspaces)
- **TypeScript**: Type checking across all packages
- **Hot Reload**: Vite for frontend, nodemon for backend
- **Linting**: ESLint (optional)
- **Code Formatting**: Prettier (optional)

### No Database (MVP)
- Car data stored in `packages/api/src/data/cars.json`
- TypeScript helpers for data access
- Simulates async operations with promises
- Easy to migrate to real database later

### No External Services (MVP)
- No OpenAI, Anthropic, or other LLM APIs
- No authentication/authorization
- No cloud deployment (run locally)
- No containerization (Docker deferred)

## MVP Workflow Examples

### User Interaction Flow (Car Search)
1. User opens React app in browser
2. User enters search criteria (budget, type, features)
3. Frontend sends POST request to `/api/cars/search`
4. API Controller receives request
5. Controller delegates to CarService
6. CarService calls CarRecommendationAgent (mock)
7. Agent applies rule-based logic to JSON data
8. Agent returns ranked recommendations
9. Response flows back through API to frontend
10. React displays results with explanations

### Spec-Driven Development Flow (MVP)
1. Developer reviews spec in `specs/categories/cars/models.yml`
2. Spec defines car attributes and decision factors
3. Developer manually creates matching TypeScript types in `shared/`
4. Developer implements services following spec structure
5. Spec serves as documentation and contract
6. (Future: automate type/code generation)

### Mock Agent Workflow
1. User requests car recommendation
2. AgentOrchestrator receives request
3. Orchestrator selects CarRecommendationAgent
4. Agent applies deterministic rules:
   - Filter by budget range
   - Score by feature match
   - Rank by weighted criteria
5. Agent returns structured response with reasoning
6. Response matches format of future real AI agents

## MVP Development Phases

### Phase 1: Foundation Setup (Day 1-2)
- ✅ Set up monorepo with npm workspaces
- ✅ Configure TypeScript for all packages
- ✅ Create package scaffolds (api, web, shared)
- ✅ Set up basic Express server
- ✅ Set up basic Vite + React app
- ✅ Create development scripts

### Phase 2: Core Data & Types (Day 2-3)
- Create car specifications in `specs/categories/cars/`
- Define shared TypeScript types in `packages/shared`
- Create mock car data JSON file
- Implement data access layer (read from JSON)
- Set up API routes structure

### Phase 3: Mock AI Agents (Day 3-4)
- Define agent interfaces (BaseAgent, AgentInterface)
- Implement CarRecommendationAgent with rule-based logic
- Implement CarComparisonAgent
- Create AgentOrchestrator for coordination
- Add agent reasoning/explanation generation

### Phase 4: API Development (Day 4-5)
- Implement car search endpoint
- Implement car recommendation endpoint
- Implement car comparison endpoint
- Add error handling middleware
- Add CORS support

### Phase 5: Frontend Development (Day 5-7)
- Create car search form
- Display recommendation results
- Show car comparisons
- Add basic styling (Tailwind CSS)
- Implement routing between pages
- Connect to API endpoints

### Phase 6: Polish & Demo Prep (Day 7-8)
- Add loading states and error handling
- Create demo script in docs/DEMO.md
- Add README with setup instructions
- Test complete user flows
- Prepare presentation materials
- Document architecture decisions

## Agent Architecture (MVP)

### Mock Agent Design

```typescript
// Agent interface for extensibility
interface Agent {
  name: string;
  description: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}

// Base agent with common functionality
abstract class BaseAgent implements Agent {
  abstract name: string;
  abstract description: string;
  
  abstract execute(input: AgentInput): Promise<AgentOutput>;
  
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }
}

// Mock recommendation agent
class CarRecommendationAgent extends BaseAgent {
  name = "CarRecommendationAgent";
  description = "Recommends cars based on user criteria";
  
  async execute(input: CarSearchCriteria): Promise<CarRecommendation[]> {
    // Mock logic: rule-based filtering and scoring
    const cars = await loadCarsFromJSON();
    const filtered = this.filterByCriteria(cars, input);
    const scored = this.scoreByPreferences(filtered, input);
    const ranked = this.rankResults(scored);
    
    return ranked.map(car => ({
      car,
      score: car.matchScore,
      reasoning: this.generateReasoning(car, input)
    }));
  }
  
  // Mock reasoning (structured response)
  private generateReasoning(car: Car, criteria: CarSearchCriteria): string {
    return `This ${car.make} ${car.model} matches your budget of $${criteria.maxBudget} 
            and has ${criteria.requiredFeatures.length} of your required features.`;
  }
}
```

### Easy Migration to Real AI

The mock agent design allows seamless migration:

```typescript
// Future: Replace mock logic with real LLM call
class CarRecommendationAgent extends BaseAgent {
  async execute(input: CarSearchCriteria): Promise<CarRecommendation[]> {
    // Simply swap implementation
    const llmResponse = await this.callLLM(input);
    return this.parseResponse(llmResponse);
  }
  
  private async callLLM(input: CarSearchCriteria): Promise<string> {
    // OpenAI, Anthropic, or other LLM API call
    return await openai.chat.completions.create({...});
  }
}
```

## Future Enhancements (Post-MVP)

These features are deferred for the MVP but designed into the architecture:

### 🔮 Phase 2: Real AI Integration
**Status**: Deferred  
**Effort**: Medium  
**Implementation**:
- [ ] Integrate OpenAI GPT-4 or Anthropic Claude
- [ ] Replace mock agent logic with LLM API calls
- [ ] Add prompt engineering for car recommendations
- [ ] Implement streaming responses for real-time feedback
- [ ] Add conversation memory for multi-turn interactions

**Changes Required**:
- Add environment variables for API keys
- Install LLM SDK (openai, @anthropic-ai/sdk)
- Update agent execute() methods
- Add error handling for API failures
- Add cost tracking and rate limiting

---

### 🗄️ Phase 2: Database Integration
**Status**: Deferred  
**Effort**: Medium  
**Implementation**:
- [ ] Set up PostgreSQL database
- [ ] Integrate Prisma ORM
- [ ] Migrate from JSON to database tables
- [ ] Add data validation and constraints
- [ ] Implement database migrations

**Changes Required**:
- Add Prisma to packages/api
- Create Prisma schema from specs
- Update data access layer in services
- Add database connection management
- Update Docker setup (if needed)

---

### 🔐 Phase 3: Authentication & Authorization
**Status**: Deferred  
**Effort**: High  
**Implementation**:
- [ ] Add user authentication (JWT or OAuth2)
- [ ] Implement user registration and login
- [ ] Add user preferences storage
- [ ] Implement saved searches/favorites
- [ ] Add role-based access control (RBAC)

**Changes Required**:
- Add auth middleware to API
- Create user models and routes
- Add protected endpoints
- Update frontend with login/signup
- Add session management

---

### 🚀 Phase 3: CI/CD & Deployment
**Status**: Deferred  
**Effort**: Medium  
**Implementation**:
- [ ] Create GitHub Actions workflows
  - [ ] CI: Automated testing and linting
  - [ ] CD: Automated deployment
  - [ ] Spec validation on PR
- [ ] Set up Docker containers
- [ ] Deploy to cloud platform (Vercel, Railway, AWS)
- [ ] Set up environment management
- [ ] Add monitoring and logging

**Changes Required**:
- Create `.github/workflows/` files
- Add Dockerfiles for api and web
- Set up deployment configurations
- Add production environment variables
- Set up logging service (optional)

---

### 🏗️ Phase 4: Advanced Architecture
**Status**: Deferred  
**Effort**: High  
**Implementation**:
- [ ] Separate ai-engine into its own package
- [ ] Add LangChain for advanced agent orchestration
- [ ] Implement vector database for semantic search (Pinecone, Weaviate)
- [ ] Add RAG (Retrieval Augmented Generation) for car specs
- [ ] Implement multi-agent collaboration patterns
- [ ] Add agent memory and context management

**Changes Required**:
- Create packages/ai-engine
- Migrate agents from api to ai-engine
- Add LangChain dependencies
- Set up vector database
- Implement embedding generation
- Update orchestration layer

---

### 🔄 Phase 4: Automated Spec-to-Code
**Status**: Deferred  
**Effort**: High  
**Implementation**:
- [ ] Create JSON schema for specs
- [ ] Build code generation scripts
  - [ ] Generate TypeScript types from specs
  - [ ] Generate Prisma schema from specs
  - [ ] Generate API routes from specs
- [ ] Add GitHub workflow for auto-generation
- [ ] Implement spec validation pipeline

**Changes Required**:
- Create specs/schemas/spec-schema.json
- Build code generators in scripts/
- Add validation workflow
- Add auto-PR creation for generated code
- Document spec-to-code workflow

---

### 📦 Phase 5: Additional Features
**Status**: Deferred  
**Effort**: Variable  
**Implementation**:
- [ ] Add more categories (electronics, real estate, etc.)
- [ ] Implement comparison view (side-by-side)
- [ ] Add data visualization (charts, graphs)
- [ ] Implement collaborative features (share recommendations)
- [ ] Add export functionality (PDF reports)
- [ ] Implement A/B testing for agent logic
- [ ] Add analytics and user behavior tracking
- [ ] Create mobile-responsive design
- [ ] Add internationalization (i18n)
- [ ] Implement real-time notifications (WebSockets)

**Changes Required**: Varies by feature

---

### 🧪 Phase 5: Testing & Quality
**Status**: Deferred  
**Effort**: Medium  
**Implementation**:
- [ ] Add unit tests (Vitest or Jest)
- [ ] Add integration tests for API
- [ ] Add E2E tests (Playwright or Cypress)
- [ ] Add component tests (Testing Library)
- [ ] Set up test coverage reporting
- [ ] Add performance testing
- [ ] Implement load testing

**Changes Required**:
- Add testing libraries
- Create test files
- Set up test runners in CI
- Add coverage thresholds
- Document testing practices

---

## Migration Strategy

When implementing future enhancements:

### 1. **AI Integration** (Easiest to add)
```typescript
// Step 1: Add API key to .env
OPENAI_API_KEY=sk-...

// Step 2: Install SDK
npm install openai

// Step 3: Update one agent at a time
// Keep interface the same, swap implementation
```

### 2. **Database Migration** (Medium complexity)
```typescript
// Step 1: Set up Prisma
npm install @prisma/client prisma

// Step 2: Create schema
// prisma/schema.prisma

// Step 3: Migrate data service layer
// Replace loadCarsFromJSON() with prisma.car.findMany()
```

### 3. **Authentication** (Higher complexity)
```typescript
// Step 1: Choose auth solution (JWT, Auth0, etc.)
// Step 2: Add middleware to protect routes
// Step 3: Update frontend with auth context
// Step 4: Add user-specific data
```

## Benefits of MVP Approach

✅ **Fast to Build**: Core functionality in ~8 days  
✅ **Easy to Demo**: Predictable, reliable responses  
✅ **Low Cost**: No API fees, no hosting costs  
✅ **Local Development**: No external dependencies  
✅ **Clear Upgrades**: Each enhancement is well-defined  
✅ **Learning Focused**: Understand fundamentals before complexity  
✅ **Extensible**: Clean architecture supports all future features  
✅ **Risk-Free**: No secrets, no auth, no database to secure

## What Makes This Spec-Driven?

Even without automation, the specs drive development:

1. **Specs Document Intent**: YAML files clearly define car attributes
2. **Specs Guide Types**: TypeScript types mirror spec structure
3. **Specs Inform Agents**: Agent logic follows spec decision factors
4. **Specs Enable Future**: Structure ready for code generation
5. **Specs as Contract**: Frontend and backend align on data shape

**Future**: Specs will automatically generate types, schemas, and boilerplate.  
**MVP**: Specs provide structure, clarity, and documentation.

---

**Ready to implement?** This simplified architecture is perfect for a capstone MVP while maintaining the foundation for future growth!
