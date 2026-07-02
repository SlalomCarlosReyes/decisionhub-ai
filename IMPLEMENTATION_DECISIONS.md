# MVP Implementation Decisions

## Overview

This document outlines the **simplified decisions for the MVP**. Most complex choices have been deferred to focus on demonstrating core concepts.

---

## ✅ MVP Decisions (Fixed)

These decisions are made for the MVP to keep it simple:

### Core Architecture
- ✅ **Monorepo Tool**: npm workspaces (built-in, simple)
- ✅ **Package Manager**: npm (default, no additional setup)
- ✅ **Backend Framework**: Express.js (straightforward, widely known)
- ✅ **Frontend Framework**: React 18 + Vite (fast, modern)
- ✅ **Language**: TypeScript (type safety across all packages)
- ✅ **Data Storage**: Local JSON files (no database setup)
- ✅ **AI Implementation**: Mock agents with deterministic logic

### Deferred for Future
- ⏳ **Database**: None (deferred to Phase 2)
- ⏳ **ORM**: None (deferred to Phase 2)
- ⏳ **Authentication**: None (deferred to Phase 3)
- ⏳ **LLM Provider**: None (deferred to Phase 2)
- ⏳ **AI Framework**: None / Custom (deferred to Phase 4)
- ⏳ **Deployment**: Local only (deferred to Phase 3)
- ⏳ **CI/CD**: None (deferred to Phase 3)
- ⏳ **Docker**: None (deferred to Phase 3)
- ⏳ **Testing Framework**: Minimal (deferred to Phase 5)

---

## 🤔 Optional MVP Decisions

These are the only decisions you need to make for the MVP:

### 1. Styling Approach
**Question**: How should we style the frontend?

**Options**:
- [ ] **Tailwind CSS** - Utility-first, fast prototyping (Recommended)
- [ ] **Plain CSS/SCSS** - Full control, more manual work
- [ ] **CSS Modules** - Scoped styles, no dependencies
- [ ] **Styled Components** - CSS-in-JS, component-scoped

**Recommendation**: **Tailwind CSS** (fastest for MVP, great defaults)

---

### 2. HTTP Client (Frontend)
**Question**: How should the frontend call the API?

**Options**:
- [ ] **Native fetch API** - Built-in, no dependencies (Recommended)
- [ ] **axios** - More features, interceptors, better errors
- [ ] **TanStack Query** - Caching, background updates (overkill for MVP)

**Recommendation**: **Native fetch** (simplest) or **axios** (if you want nicer error handling)

---

### 3. Validation Approach
**Question**: How to validate API requests?

**Options**:
- [ ] **Manual validation** - Simple checks in controllers (Recommended for MVP)
- [ ] **Zod** - TypeScript-first schema validation
- [ ] **Joi** - Mature, feature-rich validation
- [ ] **express-validator** - Express-specific middleware

**Recommendation**: **Manual validation** for MVP (add Zod later if needed)

---

### 4. CORS Configuration
**Question**: How strict should CORS be?

**Options**:
- [ ] **Allow all origins** - `cors()` with no config (Easy for MVP)
- [ ] **Specific origin** - Only allow frontend URL (More secure)

**Recommendation**: **Allow all** for MVP (restrict in production)

---

### 5. Error Handling
**Question**: How detailed should API errors be?

**Options**:
- [ ] **Simple** - Just status codes and generic messages
- [ ] **Detailed** - Include error types, validation details (Recommended)

**Recommendation**: **Detailed** (helps debugging during development)

---

### 6. Code Quality Tools
**Question**: Set up linting and formatting?

**Options**:
- [ ] **ESLint + Prettier** - Recommended for consistency
- [ ] **ESLint only** - Just linting
- [ ] **None** - Skip for MVP speed

**Recommendation**: **ESLint + Prettier** (takes 5 minutes, saves time later)

---

### 7. Routing Strategy
**Question**: How to organize routes?

**Options**:
- [ ] **Nested routers** - Separate router files (Recommended)
- [ ] **Single file** - All routes in one place (OK for MVP)

**Recommendation**: **Nested routers** (better organization, easy to maintain)

---

### 8. Component Organization
**Question**: How to structure React components?

**Options**:
- [ ] **Feature-based** - Group by domain (cars/, common/, layout/)
- [ ] **Type-based** - Group by type (buttons/, forms/, pages/)
- [ ] **Flat** - All components in one folder

**Recommendation**: **Feature-based** (scales better, clearer intent)

---

### 9. State Management
**Question**: How to manage React state?

**Options**:
- [ ] **useState/useEffect** - Built-in hooks (Recommended for MVP)
- [ ] **Context API** - For global state if needed
- [ ] **Zustand** - Lightweight external library

**Recommendation**: **useState/useEffect** (sufficient for MVP)

---

### 10. Environment Variables
**Question**: How to handle configuration?

**Options**:
- [ ] **.env files** - Standard approach (Recommended)
- [ ] **Config objects** - Hardcoded for MVP
- [ ] **dotenv** - npm package for .env loading

**Recommendation**: **.env files** with dotenv (standard practice)

---

## 📝 Quick Decision Template

Fill this in for your MVP:

```yaml
mvp_decisions:
  # Core (fixed for MVP)
  monorepo: "npm workspaces"
  backend: "express"
  frontend: "react + vite"
  language: "typescript"
  data: "json files"
  ai: "mock agents"
  
  # Optional (your choices)
  styling: "tailwind"           # tailwind, plain-css, css-modules, styled-components
  http_client: "fetch"          # fetch or axios
  validation: "manual"          # manual, zod, joi, express-validator
  cors: "allow-all"             # allow-all or specific-origin
  errors: "detailed"            # simple or detailed
  quality_tools: "eslint+prettier"  # eslint+prettier, eslint, or none
  routing: "nested"             # nested or single-file
  components: "feature-based"   # feature-based, type-based, or flat
  state: "hooks"                # hooks, context, or zustand
  env: "dotenv"                 # dotenv or config-objects
```

---

## 🚀 Default Configuration

If you want to move fast, use these defaults:

```javascript
{
  styling: "tailwind",
  http_client: "fetch",
  validation: "manual",
  cors: "allow-all",
  errors: "detailed",
  quality_tools: "eslint+prettier",
  routing: "nested",
  components: "feature-based",
  state: "hooks",
  env: "dotenv"
}
```

---

## 🔮 Future Decision Points

These decisions matter later but not for MVP:

### Phase 2: Real AI
- Which LLM provider? (OpenAI, Anthropic, Azure OpenAI)
- Streaming or batch responses?
- How to handle rate limits?
- Cost tracking strategy?

### Phase 3: Database
- PostgreSQL, MongoDB, or other?
- Prisma, TypeORM, or Drizzle?
- Migration strategy?
- Seed data approach?

### Phase 3: Authentication
- JWT, OAuth2, or session-based?
- Auth provider (Auth0, Supabase, Clerk)?
- Password hashing algorithm?
- Session management?

### Phase 3: Deployment
- Cloud platform (Vercel, Railway, AWS)?
- Container strategy (Docker)?
- Environment management?
- Secrets management?

### Phase 5: Testing
- Unit testing framework (Vitest, Jest)?
- E2E testing (Playwright, Cypress)?
- Component testing (Testing Library)?
- Coverage requirements?

---

## Why These Decisions Don't Matter Yet

For the MVP:
- **No users** → No auth needed
- **Local only** → No deployment complexity
- **Mock AI** → No LLM provider needed
- **JSON data** → No database decisions
- **Demo focused** → Simple is better

Make decisions when you need them, not before!

---

## Next Steps

1. ✅ Review default configuration above
2. ✅ Adjust optional decisions if you have preferences
3. ✅ Proceed with scaffolding using these choices
4. ✅ Start implementing MVP features
5. ✅ Defer complex decisions to future phases

**Ready?** Let's scaffold the project with these simplified decisions!
