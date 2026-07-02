# DecisionHub AI - Demo Script

This script helps you present the DecisionHub AI MVP for your capstone demo.

---

## 🎯 Demo Objectives

1. Demonstrate **spec-driven development** approach
2. Show **AI agent architecture** (mock implementation)
3. Highlight **full-stack TypeScript** with monorepo
4. Present **working application** with intelligent recommendations
5. Explain **extensibility** for future enhancements

**Demo Time**: 10-15 minutes

---

## 📋 Pre-Demo Checklist

- [ ] Start both servers (`npm run dev`)
- [ ] Verify API is running (http://localhost:3000/api/health)
- [ ] Verify Web app is running (http://localhost:5173)
- [ ] Browser tabs ready:
  - Web app
  - Code editor with key files open
  - ARCHITECTURE.md
- [ ] Clear browser history/cache for clean demo

---

## 🎬 Demo Script

### 1. Introduction (1-2 minutes)

**Say:**

> "I'm presenting DecisionHub AI, a spec-driven development platform that uses AI agents to help users make informed decisions. For the MVP, I've focused on car recommendations to demonstrate the architecture."

**Show**: Home page (http://localhost:5173)

**Highlight**:
- Clean, professional interface
- Clear value proposition
- "How It Works" section

**Key Point**: This is an MVP demonstrating architecture, not a production app.

---

### 2. The Spec-Driven Approach (2-3 minutes)

**Say:**

> "The project follows spec-driven development. Let me show you the specifications that guide everything."

**Show**: `specs/categories/cars/models.yml`

**Navigate through**:
```yaml
# Point out:
- attributes (make, model, price, fuel_type, etc.)
- decision_factors (with weights!)
- ai_agent_guidance
```

**Say:**

> "These specs define the car domain. Notice the decision factors with weights - these guide how the AI agents score vehicles. The beauty is that TypeScript types mirror this structure, creating a single source of truth."

**Show**: `packages/shared/src/types/car.ts`

**Say:**

> "See how the TypeScript types match the spec? In the future, these could be automatically generated."

**Key Point**: Specs document intent, types enforce structure, agents use weights.

---

### 3. Live Application Demo (3-4 minutes)

**Say:**

> "Let me show you the application in action."

**Navigate**: Home → Search Cars

**Fill out search form**:
- Budget: $50,000
- Fuel Types: Check "Electric" and "Hybrid"
- Body Types: Check "SUV"
- Minimum Year: 2023

**Click**: "Get Recommendations"

**Wait for results** (Should be fast!)

**Say:**

> "The AI agent analyzed my criteria and returned ranked recommendations. Let's look at the top match."

**Point out for first recommendation**:
- Match score (percentage)
- Reasoning paragraph
- Pros and cons
- Matched features
- Quick specs

**Say:**

> "Notice how the agent provides reasoning for each recommendation. This transparency helps users understand why a car is suggested."

**Click**: "View Full Details" on top car

**Show**: Car details page with all specs and features

**Key Point**: AI provides explanations, not just results.

---

### 4. The AI Agent Architecture (3-4 minutes)

**Say:**

> "Now let me show you the AI agent architecture - the core innovation of this project."

**Show**: `packages/api/src/agents/base/BaseAgent.ts`

**Say:**

> "This is the base agent class. All agents extend this and implement the execute method. This interface allows us to easily swap mock logic with real AI later."

**Show**: `packages/api/src/agents/CarRecommendationAgent.ts`

**Navigate to key methods**:
```typescript
// Show execute() method
// Show calculateScore() - point out decision factor weights
// Show generateReasoning() - mock AI output
```

**Say:**

> "Right now, this agent uses deterministic, rule-based logic. It filters cars, scores them based on criteria, and generates reasoning. But because of the clean interface, we can replace this entire implementation with a real LLM call without changing any other code."

**Show example** (scroll to commented section or explain):
```typescript
// Future: Just swap the implementation
async execute(input) {
  const llmResponse = await this.callOpenAI(input);
  return this.parseResponse(llmResponse);
}
```

**Say:**

> "The agent orchestrator coordinates multiple agents. For complex queries, we could chain agents together - one for search, one for comparison, one for final recommendation."

**Key Point**: Architecture supports easy migration from mock → real AI.

---

### 5. Architecture Overview (2-3 minutes)

**Show**: ARCHITECTURE.md (or use diagram if you created one)

**Say:**

> "Let me explain the overall architecture. It's a monorepo with three packages:"

**Point out**:
1. **packages/api** - Node.js + Express + TypeScript
   - RESTful API
   - Mock AI agents
   - Local JSON data
   
2. **packages/web** - React + Vite + TypeScript
   - Modern SPA
   - Tailwind CSS
   - Clean component structure
   
3. **packages/shared** - Shared types
   - Type safety across packages
   - Single source of truth

**Say:**

> "Everything is TypeScript for type safety. The monorepo structure allows easy code sharing and ensures frontend and backend stay in sync."

**Show** (optional): `package.json` workspace configuration

**Key Point**: Clean architecture, clear separation, type-safe communication.

---

### 6. Technical Decisions (1-2 minutes)

**Say:**

> "For the MVP, I made intentional simplifications:"

**Deferred Features** (show quickly):
- No database → Local JSON (easy to migrate to Prisma/PostgreSQL)
- No real AI → Mock agents (clean interface for OpenAI/Anthropic)
- No auth → Focus on core (JWT/Auth0 ready)
- No deployment → Local dev (Docker/Vercel ready)

**Say:**

> "These decisions let me focus on demonstrating the architecture and patterns. Each deferred feature has a clear upgrade path documented."

**Show** (if time): Future Enhancements section in ARCHITECTURE.md

**Key Point**: MVP focuses on architecture, not production features.

---

### 7. Code Quality & Extensibility (1 minute)

**Say:**

> "The codebase demonstrates best practices:"

**Highlight**:
- ✅ Full TypeScript coverage
- ✅ ESLint + Prettier configured
- ✅ Clear separation of concerns
- ✅ Error handling middleware
- ✅ Type-safe API responses
- ✅ Reusable React components
- ✅ Responsive design with Tailwind

**Say:**

> "And it's designed for extensibility. Adding a new category - like electronics or real estate - follows the same pattern. Just create specs, define types, implement agents."

**Key Point**: Production-quality code structure, ready to scale.

---

### 8. Conclusion & Future Vision (1 minute)

**Say:**

> "To summarize what I've built:"

1. **Spec-driven platform** with YAML specs as source of truth
2. **AI agent architecture** with clean interfaces for real LLM integration
3. **Full-stack TypeScript** monorepo with type safety
4. **Working MVP** that demonstrates intelligent car recommendations
5. **Clear roadmap** for production features

**Future phases**:
- Phase 2: Integrate real AI (OpenAI/Anthropic)
- Phase 3: Add database, auth, deployment
- Phase 4: Multi-category support, advanced agent orchestration
- Phase 5: Spec-to-code automation

**Say:**

> "This MVP proves the architecture works while keeping complexity manageable. The foundation is solid for building a production-grade, multi-category decision support platform."

---

## 💡 Handling Questions

### "Why not use real AI?"

> "For the MVP, mock agents let me focus on architecture without API costs or rate limits. The agent interface is designed specifically to make swapping to real AI trivial - it's literally changing the execute() implementation."

### "How do you ensure recommendations are good?"

> "The agents use weighted decision factors defined in the specs. Budget is 30%, efficiency 20%, etc. For real AI, we'd include these weights in the prompt or use them to rank LLM-generated recommendations."

### "Can this handle other categories?"

> "Absolutely! The architecture is category-agnostic. To add electronics: create specs/categories/electronics/, define types, implement agents. The API and web app structure stays the same."

### "How does this scale?"

> "The monorepo structure supports independent scaling. API can be containerized and deployed to multiple instances. Web app is a static SPA that can be CDN-deployed. Agents can be extracted to a separate service."

### "What about performance?"

> "Currently, it's blazing fast because everything is in memory. With a database, we'd add caching (Redis), pagination, and indexes. The architecture supports these optimizations without major changes."

### "Why TypeScript everywhere?"

> "Type safety prevents entire classes of bugs. Shared types ensure frontend and backend contracts stay synchronized. It's essential for maintainable monorepo development."

---

## 🎯 Key Messages to Emphasize

1. **Spec-Driven** - Specs guide everything, enabling future automation
2. **Extensible** - Clean interfaces for easy enhancement (mock → real AI, JSON → DB)
3. **Type-Safe** - Full TypeScript for reliability
4. **Agent Architecture** - Modular, orchestratable AI agents
5. **Production-Ready Foundation** - MVP architecture supports all future features

---

## 📸 Optional: Screenshot Talking Points

If showing screenshots instead of live demo:

1. **Home Page** - Professional, clear value proposition
2. **Search Form** - Comprehensive criteria input
3. **Results Page** - Ranked recommendations with reasoning
4. **Car Details** - Complete specs and features
5. **Code**: Agent architecture
6. **Code**: Spec files
7. **Architecture diagram**: System overview

---

## 🚀 Demo Success Criteria

✅ Demonstrated working full-stack application  
✅ Explained spec-driven development approach  
✅ Showed AI agent architecture and extensibility  
✅ Highlighted type-safe TypeScript design  
✅ Communicated clear future enhancement path  
✅ Answered questions confidently  

---

**Good luck with your demo! 🎉**
