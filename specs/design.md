# Design Specification - DecisionHub AI MVP

## Document Overview

**Purpose**: Technical design documentation for DecisionHub AI MVP  
**Version**: 1.0  
**Status**: ✅ Implemented  
**Last Updated**: 2026-06-29

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│            React 18 + Vite + Tailwind CSS                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ CarSearchPage│  │ AIAnalysis   │  │ Agent        │     │
│  │              │  │ Panel        │  │ Timeline     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Recommendation List Component               │    │
│  │     (Vehicle Cards with COP Pricing)                │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ HTTP/JSON (fetch API)
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                      API LAYER                                │
│               Express + TypeScript                            │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Routes & Controllers                       │ │
│  │  /api/cars/recommend/nl  |  /api/cars/search           │ │
│  └───────────────────┬────────────────────────────────────┘ │
│                      │                                        │
│  ┌───────────────────▼────────────────────────────────────┐ │
│  │                 AGENT LAYER                             │ │
│  │                                                          │ │
│  │  ┌─────────────────────────────────────────────┐       │ │
│  │  │  Natural Language Recommendation Agent      │       │ │
│  │  │         (Orchestrator)                      │       │ │
│  │  └──────────────────┬──────────────────────────┘       │ │
│  │                     │                                   │ │
│  │       ┌─────────────┼─────────────┐                    │ │
│  │       │             │             │                    │ │
│  │  ┌────▼────┐  ┌────▼────┐  ┌────▼─────┐              │ │
│  │  │Research │  │Criteria │  │Recomm.   │              │ │
│  │  │ Agent   │  │ Agent   │  │Agent     │              │ │
│  │  └────┬────┘  └─────────┘  └──────────┘              │ │
│  │       │                                                │ │
│  │  ┌────▼────┐                                           │ │
│  │  │Decision │  (Optional, when real AI)                │ │
│  │  │ Agent   │                                           │ │
│  │  └─────────┘                                           │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │              AI PROVIDER LAYER                          │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────┐            │ │
│  │  │      AIProviderFactory                  │            │ │
│  │  │   (Configuration-driven selection)      │            │ │
│  │  └────────────────┬───────────────────────┘            │ │
│  │                   │                                     │ │
│  │      ┌────────────┴────────────┐                       │ │
│  │      │                         │                       │ │
│  │  ┌───▼──────────┐      ┌──────▼─────┐                 │ │
│  │  │   GitHub     │      │    Mock    │                 │ │
│  │  │   Models     │      │  Provider  │                 │ │
│  │  │  (Real AI)   │      │  (Fallback)│                 │ │
│  │  └──────────────┘      └────────────┘                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              SERVICE LAYER                             │  │
│  │  NLP Service  |  Car Service  |  AI Service            │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      │                                       │
│  ┌───────────────────▼───────────────────────────────────┐  │
│  │                DATA LAYER                              │  │
│  │         cars.json (12 vehicles)                        │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Monorepo Structure

```
decisionhub-ai/
├── packages/
│   ├── shared/              # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   └── car.ts   # All TypeScript interfaces
│   │   │   └── utils/
│   │   │       └── currency.ts  # COP formatting utils
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   ├── agents/      # AI agent implementations
│   │   │   ├── services/    # Business logic
│   │   │   ├── routes/      # Express routes
│   │   │   ├── controllers/ # Request handlers
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── data/        # Mock data (cars.json)
│   │   │   └── server.ts    # Entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                 # Frontend React app
│       ├── src/
│       │   ├── pages/       # Page components
│       │   ├── components/  # Reusable components
│       │   ├── services/    # API client
│       │   ├── hooks/       # Custom React hooks
│       │   └── main.tsx     # Entry point
│       ├── package.json
│       └── tsconfig.json
│
├── specs/                   # Specification documents
│   ├── product-vision.md
│   ├── requirements.md
│   ├── design.md (this file)
│   ├── agent-workflow.md
│   └── tasks.md
│
├── docs/                    # Additional documentation
├── package.json             # Root workspace config
└── tsconfig.json            # Root TypeScript config
```

**Module System**: ES2020 modules (`type: "module"` in package.json)

---

## 2. Technology Stack

### 2.1 Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Express** | 4.x | Web framework |
| **tsx** | Latest | TypeScript execution for dev |
| **cors** | Latest | Cross-origin resource sharing |
| **dotenv** | Latest | Environment variable management |

**Module System**: ES2020 with dynamic imports  
**TypeScript Config**: Strict mode, ES2020 target

### 2.2 Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool and dev server |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **React Router** | 6.x | Client-side routing |

**Build Tool**: Vite with hot module replacement  
**CSS Framework**: Tailwind CSS with custom configuration

### 2.3 Shared Package

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TypeScript** | 5.x | Type definitions |

**Purpose**: Share types and utilities between API and Web packages  
**Build**: No build step (TS transpiled by consuming packages)

---

## 3. Component Design

### 3.1 Frontend Components

#### 3.1.1 CarSearchPage Component

**Location**: `packages/web/src/pages/CarSearchPage.tsx`

**Purpose**: Main conversational search interface

**Props**: None (page component)

**State**:
```typescript
{
  query: string;                      // User's natural language query
  isLoading: boolean;                 // Loading state during API call
  recommendations: AIRecommendationResponse | null;
  error: string | null;               // Error message if any
  showFilters: boolean;               // Toggle traditional filters
}
```

**Key Methods**:
- `handleNaturalLanguageSearch()`: Submit query to API
- `handleExampleClick(query)`: Populate textarea with example
- `handleFilterChange()`: Update traditional filter state

**Layout**:
```
┌─────────────────────────────────────────┐
│          Hero Section                    │
│  "Encuentra tu vehículo ideal..."       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Natural Language Textarea          │
│  (Large, multi-line input)              │
│  [Buscar] button                        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Example Queries                 │
│  [Example 1] [Example 2] [Example 3]    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│    Collapsible Traditional Filters      │
│  (Price, Body Type, Fuel Type)          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         AI Analysis Panel               │
│  (Shows after query submission)         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Agent Timeline                  │
│  (Shows AI agent activity)              │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Recommendation List                │
│  (Vehicle cards in grid)                │
└─────────────────────────────────────────┘
```

#### 3.1.2 AIAnalysisPanel Component

**Location**: `packages/web/src/components/cars/AIAnalysisPanel.tsx`

**Purpose**: Visualize AI's understanding of user query

**Props**:
```typescript
{
  analysis: AIAnalysis;
}
```

**Display Sections**:
1. **Category Badge**: Shows "Vehículos" category
2. **Budget Display**: Max budget in COP with formatting
3. **Detected Preferences**: Pills with confidence indicators
4. **Decision Criteria**: Progress bars with weights

**Styling**:
- Blue-purple gradient background
- Rounded corners with shadow
- Responsive grid layout

#### 3.1.3 AgentTimeline Component

**Location**: `packages/web/src/components/cars/AgentTimeline.tsx`

**Purpose**: Real-time visualization of AI agent workflow

**Props**:
```typescript
{
  activities: AgentActivity[];
}
```

**Activity States**:
- **Pendiente**: Gray color, dash icon
- **Procesando**: Blue color, spinning icon, animated
- **Completado**: Green color, checkmark icon

**Layout**:
- Vertical timeline with connecting lines
- Agent name and description
- Status badge
- Progress bar at bottom

#### 3.1.4 RecommendationList Component

**Location**: `packages/web/src/components/cars/RecommendationList.tsx`

**Purpose**: Display recommended vehicles in card format

**Props**:
```typescript
{
  recommendations: CarRecommendation[];
}
```

**Card Structure**:
```
┌────────────────────────────────────┐
│  [Top Match Badge]                 │  (gradient border)
│  Make Model (Year)                 │
│  COP $XXX.XXX.XXX                  │
│  ─────────────────────────────     │
│  Score: 85/100 [Progress Bar]     │
│  Pasajeros: 5 | HP: 190           │
│  Consumo: 30 MPG                   │
│  ─────────────────────────────     │
│  Fortalezas:                       │
│  • Pro 1                           │
│  • Pro 2                           │
│  ─────────────────────────────     │
│  Consideraciones:                  │
│  • Con 1                           │
│  • Con 2                           │
└────────────────────────────────────┘
```

**Responsive Grid**: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

### 3.2 Backend Components

#### 3.2.1 Agent Architecture

**Base Class**: `BaseAgent`

**Location**: `packages/api/src/agents/base/BaseAgent.ts`

**Interface**:
```typescript
abstract class BaseAgent {
  abstract name: string;
  abstract description: string;
  abstract execute(input: AgentInput): Promise<AgentOutput>;
  
  protected log(message: string): void;
  protected logError(message: string, error: Error): void;
  protected measureExecutionTime<T>(fn: () => Promise<T>): Promise<{result: T, executionTime: number}>;
}
```

**Implemented Agents**:

1. **NaturalLanguageRecommendationAgent**
   - **Purpose**: Orchestrator agent
   - **Input**: `NaturalLanguageRequest`
   - **Output**: `AIRecommendationResponse`
   - **Dependencies**: ResearchAgent, CarRecommendationAgent, LeadDecisionAgent
   - **Responsibilities**:
     - Coordinate multi-agent workflow
     - Track agent activity for timeline
     - Return comprehensive response

2. **ResearchAgent**
   - **Purpose**: AI-powered query analysis
   - **Input**: `NaturalLanguageRequest`
   - **Output**: `ResearchResult` (insights, filters, preferences, criteria)
   - **AI Provider**: Uses GitHub Models or Mock
   - **Fallback**: Keyword-based analysis

3. **LeadDecisionAgent**
   - **Purpose**: Explain decision strategy
   - **Input**: `{query, topRecommendations}`
   - **Output**: `DecisionExplanation` (strategy, reasoning, factors, confidence)
   - **AI Provider**: Uses GitHub Models or Mock
   - **Optional**: Only runs when real AI available

4. **CarRecommendationAgent**
   - **Purpose**: Score and rank vehicles
   - **Input**: `CarSearchCriteria`
   - **Output**: `CarRecommendation[]`
   - **Algorithm**: Weighted scoring with multiple factors
   - **No AI**: Uses deterministic logic

#### 3.2.2 AI Provider Design

**Interface**: `AIProvider`

```typescript
interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  chat(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIResponse>;
}
```

**Implementations**:

1. **GitHubModelsProvider**
   - **Endpoint**: `https://models.inference.ai.azure.com/chat/completions`
   - **Authentication**: Bearer token (GitHub PAT)
   - **Models**: GPT-4o, Claude Sonnet, etc.
   - **Format**: Azure OpenAI compatible
   - **Availability Check**: Test API call on initialization

2. **MockAIProvider**
   - **Algorithm**: Rule-based pattern matching
   - **Always Available**: No API calls
   - **Responses**: Pre-structured JSON
   - **Colombian Context**: Built-in market knowledge

**Factory**: `AIProviderFactory`
- **Initialization**: Async, called on server startup
- **Selection Logic**:
  1. Try GitHub Models if `AI_PROVIDER=github` and token present
  2. Test availability with `isAvailable()`
  3. Fall back to Mock if unavailable or error
- **Singleton**: Single provider instance per server instance

#### 3.2.3 Service Layer

**NaturalLanguageParser Service**

**Location**: `packages/api/src/services/nlpService.ts`

**Purpose**: Parse natural language queries (Spanish/English)

**Key Methods**:
```typescript
class NaturalLanguageParser {
  static parseQuery(query: string, currency: Currency): AIAnalysis;
  
  private static extractBudget(query: string): {min?, max?, currency};
  private static extractPreferences(query: string): DetectedPreference[];
  private static generateDecisionCriteria(preferences): DecisionCriteria[];
  private static buildSearchCriteria(budget, preferences): CarSearchCriteria;
}
```

**Keyword Dictionaries**:
- Safety: "segur", "safety", "protec", "airbag"
- Reliability: "confiable", "reliable", "dependable"
- Comfort: "cómodo", "comfort", "espacio", "space"
- Efficiency: "económic", "eficien", "combustible"
- Family: "familiar", "family", "niños", "kids"

**Car Service**

**Location**: `packages/api/src/services/carService.ts`

**Purpose**: Vehicle data operations

**Key Methods**:
```typescript
class CarService {
  static async getAllCars(): Promise<Car[]>;
  static async getCarById(id: string): Promise<Car | undefined>;
  static async searchCars(criteria: CarSearchCriteria): Promise<Car[]>;
  static async compareCars(ids: string[]): Promise<CarComparison>;
}
```

**Data Source**: `packages/api/src/data/cars.json`

---

## 4. Data Flow

### 4.1 Natural Language Recommendation Flow

```
1. User enters query in Spanish
   └─> "Necesito un SUV seguro para mi familia, presupuesto 200 millones"

2. Frontend submits to API
   └─> POST /api/cars/recommend/nl
       Body: {query: "...", currency: "COP"}

3. NaturalLanguageRecommendationAgent receives request
   └─> Starts agent activity tracking

4. ResearchAgent analyzes query
   ├─> Try AI provider (GitHub Models)
   │   ├─> System prompt: "You are a Research Agent for Colombian market..."
   │   ├─> User prompt: query
   │   ├─> Response: JSON with insights, preferences, criteria
   │   └─> Parse JSON or fall back
   └─> Fallback: Keyword-based analysis
       ├─> Extract budget: "200 millones" → 200,000,000 COP
       ├─> Detect preferences: "seguro" → Safety (0.95), "familia" → Family (0.9)
       └─> Generate criteria: Safety (35%), Comfort (25%), Reliability (20%), etc.

5. Criteria Agent (implicit in ResearchAgent)
   └─> Normalize weights, generate decision criteria

6. CarRecommendationAgent scores vehicles
   ├─> Filter by budget: price <= 200M COP
   ├─> Filter by body type: SUV
   ├─> Score each vehicle:
   │   ├─> Price fit: 100% if within budget
   │   ├─> Feature match: count matched features
   │   ├─> Fuel economy: normalize MPG
   │   ├─> Age: prefer newer vehicles
   │   └─> Weighted sum with decision criteria
   ├─> Sort by score
   └─> Return top 5 recommendations

7. LeadDecisionAgent explains strategy (if real AI)
   ├─> Try AI provider
   │   ├─> System prompt: "Explain decision strategy..."
   │   ├─> User prompt: query + top recommendations
   │   └─> Response: JSON with strategy, reasoning, factors
   └─> Fallback: Generic explanation

8. NaturalLanguageRecommendationAgent returns response
   └─> {
         analysis: {...},
         recommendations: [...],
         agentActivity: [...],
         processingTimeMs: 245
       }

9. Frontend receives response
   ├─> Update AIAnalysisPanel with preferences
   ├─> Update AgentTimeline with activities
   └─> Update RecommendationList with vehicles

10. User sees results
    ├─> AI understanding displayed
    ├─> Agent workflow transparent
    └─> Top recommendations with reasoning
```

### 4.2 AI Provider Selection Flow

```
Server Startup
  │
  ├─> AIProviderFactory.initialize()
  │     │
  │     ├─> Read environment variables
  │     │   ├─> AI_PROVIDER (default: "mock")
  │     │   ├─> GITHUB_TOKEN (optional)
  │     │   └─> MODEL_ID (default: "gpt-4o")
  │     │
  │     ├─> If AI_PROVIDER === "github" && GITHUB_TOKEN exists
  │     │   ├─> Create GitHubModelsProvider(token, modelId)
  │     │   ├─> Call isAvailable()
  │     │   │   ├─> Make test API call
  │     │   │   ├─> If success → return true
  │     │   │   └─> If error → return false
  │     │   ├─> If available
  │     │   │   └─> Use GitHub Models ✅
  │     │   └─> If not available
  │     │       └─> Fall back to Mock ⬇️
  │     │
  │     └─> Default or fallback
  │         └─> Create MockAIProvider() ✅
  │
  └─> Log: "AI Provider: Real AI" or "AI Provider: Mock AI"

During Request
  │
  ├─> Agent needs AI
  │     │
  │     ├─> provider = AIProviderFactory.getProvider()
  │     │
  │     ├─> Try provider.chat(messages, options)
  │     │   ├─> If success → use response
  │     │   └─> If error → fall back to agent's fallback logic
  │     │
  │     └─> Parse response or use fallback result
  │
  └─> Return agent output
```

---

## 5. Database Design (MVP: JSON Files)

### 5.1 Current Implementation

**File**: `packages/api/src/data/cars.json`

**Structure**:
```json
{
  "cars": [
    {
      "id": "car-001",
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "price": 145000000,
      "fuelType": "hybrid",
      "bodyType": "sedan",
      "drivetrain": "fwd",
      "transmission": "automatic",
      "mpg": {
        "city": 51,
        "highway": 53,
        "combined": 52
      },
      "features": ["Apple CarPlay", "Adaptive Cruise Control", ...],
      "description": "Reliable midsize hybrid sedan...",
      "specifications": {
        "horsepower": 208,
        "torque": 163,
        "seating": 5,
        "cargoSpace": 15
      }
    },
    ...
  ]
}
```

**Total Vehicles**: 12  
**Price Range**: 85M - 340M COP  
**Body Types**: Sedan, SUV, Truck, Hatchback  
**Fuel Types**: Gasoline, Hybrid, Electric

### 5.2 Future Database Design (PostgreSQL)

**Tables** (deferred):
- `vehicles`: Core vehicle data
- `features`: Feature catalog
- `vehicle_features`: Many-to-many relationship
- `users`: User accounts (future)
- `searches`: Saved searches (future)
- `favorites`: Bookmarked vehicles (future)

**Migration Path**:
1. Keep service layer interface identical
2. Replace JSON loading with database queries
3. No changes to agents or controllers
4. Add caching layer (Redis)

---

## 6. API Design

### 6.1 RESTful Endpoints

**Base URL**: `http://localhost:3000/api`

#### 6.1.1 Natural Language Recommendation

```
POST /cars/recommend/nl
Content-Type: application/json

Request Body:
{
  "query": string (required, max 1000 chars),
  "currency": "COP" | "USD" | "EUR" (optional, default: "COP")
}

Response (200 OK):
{
  "success": true,
  "data": {
    "analysis": AIAnalysis,
    "recommendations": CarRecommendation[],
    "agentActivity": AgentActivity[],
    "processingTimeMs": number
  },
  "timestamp": string (ISO 8601)
}

Error Response (4xx/5xx):
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any (optional)
  },
  "timestamp": string
}
```

#### 6.1.2 Car Search

```
POST /cars/search
Content-Type: application/json

Request Body:
{
  "criteria": CarSearchCriteria
}

Response (200 OK):
{
  "success": true,
  "data": {
    "cars": Car[],
    "count": number
  }
}
```

#### 6.1.3 Get All Cars

```
GET /cars

Response (200 OK):
{
  "success": true,
  "data": {
    "cars": Car[],
    "count": number
  }
}
```

#### 6.1.4 Get Car by ID

```
GET /cars/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "car": Car
  }
}

Error Response (404):
{
  "success": false,
  "error": {
    "code": "CAR_NOT_FOUND",
    "message": "Car with ID 'xyz' not found"
  }
}
```

#### 6.1.5 Health Check

```
GET /health

Response (200 OK):
{
  "status": "healthy",
  "timestamp": string,
  "aiProvider": string ("Real AI" | "Mock AI"),
  "version": string
}
```

### 6.2 Error Handling

**Error Codes**:
- `VALIDATION_ERROR`: Invalid request data
- `CAR_NOT_FOUND`: Vehicle not found by ID
- `AI_PROVIDER_ERROR`: AI provider failure (falls back gracefully)
- `INTERNAL_SERVER_ERROR`: Unexpected server error

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2026-06-29T..."
}
```

---

## 7. Security Design

### 7.1 API Key Management

- **Storage**: Environment variables only
- **Access**: Backend only, never exposed to frontend
- **Rotation**: Easy to update via env vars
- **Fallback**: Application works without keys (mock mode)

### 7.2 Input Validation

- **Query Length**: Max 1000 characters
- **Type Validation**: TypeScript types enforced
- **Sanitization**: No SQL injection risk (JSON data)
- **CORS**: Restricted to known origins

### 7.3 CORS Configuration

```typescript
{
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
```

---

## 8. Performance Design

### 8.1 Optimization Strategies

**Frontend**:
- Vite code splitting (automatic)
- React lazy loading for components
- Memoization for expensive computations
- Debounced search input (future)

**Backend**:
- In-memory vehicle data (fast access)
- Efficient filtering algorithms
- Async/await for I/O operations
- Provider fallback prevents blocking

**AI Provider**:
- Mock provider for development (zero latency)
- GitHub Models for production (1-2s latency)
- Timeout handling (10s max)
- Graceful degradation

### 8.2 Caching Strategy (Future)

- **Vehicle Data**: Cache in Redis (TTL: 1 hour)
- **AI Responses**: Cache similar queries (TTL: 24 hours)
- **Static Assets**: CDN (future)

---

## 9. Deployment Design

### 9.1 Development Environment

**Requirements**:
- Node.js 20+
- npm 10+

**Setup**:
```bash
npm install
npm run dev
```

**Ports**:
- API: `http://localhost:3000`
- Web: `http://localhost:5173` (Vite default)

### 9.2 Production Environment (Future)

**Backend**:
- Docker container
- Kubernetes deployment
- Horizontal scaling
- Load balancer
- Health check endpoint

**Frontend**:
- Static build (`npm run build`)
- CDN distribution
- Environment-specific configs

**Environment Variables**:
```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://decisionhub.ai
AI_PROVIDER=github
GITHUB_TOKEN=***
MODEL_ID=gpt-4o
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## 10. Testing Strategy

### 10.1 Unit Tests (Future)

**Tools**: Jest, Testing Library

**Coverage Targets**:
- Utility functions: 100%
- Services: 90%
- Agents: 80%
- Components: 80%

**Test Files**:
- `*.test.ts` for TypeScript
- `*.test.tsx` for React components

### 10.2 Integration Tests (Future)

**Tools**: Supertest (API), Testing Library (React)

**Scenarios**:
- API endpoint responses
- Agent workflows
- Error handling
- Provider fallback

### 10.3 E2E Tests (Future)

**Tools**: Playwright or Cypress

**Scenarios**:
- Complete user journey
- Natural language search
- Recommendation display
- Mobile responsiveness

---

## 11. Monitoring & Observability (Future)

### 11.1 Logging

**Current**: Console.log with timestamps  
**Future**: Winston or Pino with log levels

**Log Levels**:
- ERROR: System errors
- WARN: Degraded functionality
- INFO: Important events
- DEBUG: Detailed execution flow

### 11.2 Metrics

**Future Metrics**:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (% of requests)
- AI provider usage (requests, costs)
- Cache hit rate

**Tools**: Prometheus + Grafana

### 11.3 Error Tracking

**Future**: Sentry or similar  
**Scope**: Frontend and backend errors

---

## 12. Design Decisions & Rationale

### 12.1 Monorepo vs Multi-repo

**Decision**: Monorepo with npm workspaces

**Rationale**:
- Shared types between frontend/backend
- Synchronized versioning
- Single dependency installation
- Easier for MVP development
- Natural fit for TypeScript

### 12.2 ES Modules vs CommonJS

**Decision**: ES Modules (ES2020)

**Rationale**:
- Modern JavaScript standard
- Better tree-shaking
- Native dynamic imports
- Vite requires ES modules
- Future-proof

### 12.3 Provider Abstraction vs Direct Integration

**Decision**: Provider abstraction layer

**Rationale**:
- Easy to add new AI providers
- Graceful fallback to mock
- Testing without API costs
- Reduced vendor lock-in
- Future flexibility

### 12.4 Agent Architecture vs Monolithic Service

**Decision**: Multi-agent architecture

**Rationale**:
- Clear separation of concerns
- Parallel agent development
- Composable and testable
- Reflects AI assistant paradigm
- Transparent to users (timeline)

### 12.5 JSON Files vs Database

**Decision**: JSON files for MVP

**Rationale**:
- Zero infrastructure for demo
- Fast development iteration
- No migration needed initially
- Service layer abstracts data source
- Easy to migrate later

---

## 13. Design Patterns

### 13.1 Factory Pattern

**Usage**: AIProviderFactory

**Benefits**:
- Encapsulates provider creation logic
- Configuration-driven selection
- Easy to add new providers
- Single responsibility

### 13.2 Strategy Pattern

**Usage**: AI Provider implementations

**Benefits**:
- Interchangeable algorithms
- Runtime provider selection
- Open/closed principle

### 13.3 Template Method Pattern

**Usage**: BaseAgent abstract class

**Benefits**:
- Common agent behavior
- Consistent logging
- Execution time measurement
- Easy to extend

### 13.4 Observer Pattern (Implicit)

**Usage**: Agent activity tracking

**Benefits**:
- Decoupled activity logging
- Real-time updates possible
- Timeline visualization

---

## 14. Accessibility Design

### 14.1 Current Status

**Implemented**:
- Semantic HTML elements
- Keyboard navigation support
- Sufficient color contrast (Tailwind defaults)
- Responsive text sizing

**Needed** (future):
- ARIA labels for interactive elements
- Screen reader testing
- Focus indicators
- Alt text for images
- Skip navigation links

### 14.2 Spanish Language Support

**Implementation**:
- All UI text in Spanish
- COP currency formatting (es-CO locale)
- Spanish example queries
- Spanish error messages
- Colombian market terminology

---

## 15. Future Design Considerations

### 15.1 Real-time Features

**Streaming AI Responses**:
- Server-Sent Events (SSE) or WebSockets
- Progressive recommendation display
- Live agent activity updates

### 15.2 Multi-tenancy

**User Accounts**:
- PostgreSQL with row-level security
- JWT authentication
- User-specific preferences
- Saved searches and favorites

### 15.3 Microservices

**Potential Split**:
- AI Service (dedicated scaling)
- Vehicle Service (database queries)
- User Service (authentication)
- API Gateway (routing)

---

**Document Status**: ✅ Complete - Reflects Current MVP Implementation  
**Next Update**: After architecture changes or new features  
**Maintained By**: Development Team
