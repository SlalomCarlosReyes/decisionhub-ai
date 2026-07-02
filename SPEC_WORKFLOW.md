# Spec-Driven Development Workflow

## Overview

DecisionHub AI uses specifications (specs) as the source of truth for defining categories, features, and decision logic. This document outlines how the spec-driven workflow operates.

## Workflow Diagram

```
┌─────────────────┐
│  Write/Update   │
│   YAML Spec     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate Spec  │ ← GitHub Action (automatic)
│  JSON Schema    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AI Analysis   │ ← AI Agent reviews spec
│   Suggestions   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate Code  │ ← Automated code generation
│   Boilerplate   │   (models, types, routes)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Developer      │ ← Human implements business logic
│  Implementation │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI-Assisted    │ ← AI helps with tests & docs
│  Testing & Docs │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Deploy to     │
│   Production    │
└─────────────────┘
```

## Spec File Structure

### Category Spec Example: Cars

**File**: `specs/categories/cars/models.yml`

```yaml
meta:
  version: "1.0.0"
  category: "cars"
  last_updated: "2026-06-28"
  author: "DecisionHub Team"

category:
  id: "cars"
  name: "Cars"
  description: "Automotive vehicle category for purchase decisions"
  icon: "🚗"
  
attributes:
  - id: "make"
    name: "Make"
    type: "string"
    required: true
    description: "Vehicle manufacturer"
    examples: ["Toyota", "Honda", "Tesla"]
    
  - id: "model"
    name: "Model"
    type: "string"
    required: true
    description: "Specific model name"
    
  - id: "year"
    name: "Year"
    type: "integer"
    required: true
    range: [1900, 2030]
    
  - id: "price"
    name: "Price"
    type: "number"
    required: true
    unit: "USD"
    
  - id: "fuel_type"
    name: "Fuel Type"
    type: "enum"
    options: ["gasoline", "diesel", "electric", "hybrid", "plugin-hybrid"]
    required: true
    
  - id: "body_type"
    name: "Body Type"
    type: "enum"
    options: ["sedan", "suv", "truck", "coupe", "hatchback", "van"]
    
  - id: "drivetrain"
    name: "Drivetrain"
    type: "enum"
    options: ["fwd", "rwd", "awd", "4wd"]
    
  - id: "transmission"
    name: "Transmission"
    type: "enum"
    options: ["manual", "automatic", "cvt", "dual-clutch"]
    
  - id: "features"
    name: "Features"
    type: "array"
    items_type: "string"
    description: "List of vehicle features"

decision_factors:
  - id: "budget"
    name: "Budget"
    weight: 0.3
    description: "User's price range"
    
  - id: "efficiency"
    name: "Fuel Efficiency"
    weight: 0.2
    description: "MPG or electric range"
    
  - id: "space"
    name: "Space Requirements"
    weight: 0.15
    description: "Passenger and cargo capacity"
    
  - id: "performance"
    name: "Performance"
    weight: 0.15
    description: "Horsepower, acceleration"
    
  - id: "reliability"
    name: "Reliability"
    weight: 0.2
    description: "Historical reliability ratings"

ai_prompts:
  recommendation:
    system: |
      You are an automotive expert helping users find the perfect car.
      Consider their budget, needs, and preferences.
      Be objective and explain trade-offs clearly.
    
  comparison:
    system: |
      Compare multiple vehicles across key attributes.
      Highlight strengths and weaknesses of each option.
      Provide data-driven insights.
```

## GitHub Workflow Integration

### Spec Validation Workflow

**File**: `.github/workflows/spec-validation.yml`

```yaml
name: Spec Validation

on:
  push:
    paths:
      - 'specs/**/*.yml'
  pull_request:
    paths:
      - 'specs/**/*.yml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install -g ajv-cli
        
      - name: Validate YAML syntax
        run: |
          find specs -name "*.yml" -o -name "*.yaml" | \
          xargs -I {} sh -c 'yq eval {} > /dev/null || exit 1'
          
      - name: Validate against JSON Schema
        run: |
          ajv validate \
            -s specs/schemas/spec-schema.json \
            -d "specs/categories/**/*.yml"
            
      - name: AI Spec Review
        uses: ./actions/ai-spec-review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Code Generation Workflow

**File**: `.github/workflows/spec-to-code.yml`

```yaml
name: Generate Code from Specs

on:
  workflow_dispatch:
    inputs:
      category:
        description: 'Category to generate code for'
        required: true
  push:
    branches:
      - main
    paths:
      - 'specs/categories/**/*.yml'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm install
        
      - name: Generate TypeScript types
        run: npm run generate:types
        
      - name: Generate API routes
        run: npm run generate:routes
        
      - name: Generate database schema
        run: npm run generate:schema
        
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'Generated code from spec updates'
          title: 'Auto-generated: Code from spec changes'
          body: 'This PR contains auto-generated code based on spec updates.'
          branch: 'auto/spec-code-gen'
```

## Code Generation Examples

### Generated TypeScript Types

From the car spec above, automatically generate:

```typescript
// packages/shared/src/types/categories/cars.ts
export interface CarAttributes {
  make: string;
  model: string;
  year: number;
  price: number;
  fuel_type: FuelType;
  body_type?: BodyType;
  drivetrain?: Drivetrain;
  transmission?: Transmission;
  features?: string[];
}

export enum FuelType {
  Gasoline = 'gasoline',
  Diesel = 'diesel',
  Electric = 'electric',
  Hybrid = 'hybrid',
  PluginHybrid = 'plugin-hybrid',
}

export enum BodyType {
  Sedan = 'sedan',
  SUV = 'suv',
  Truck = 'truck',
  Coupe = 'coupe',
  Hatchback = 'hatchback',
  Van = 'van',
}

// ... more generated types
```

### Generated Prisma Schema

```prisma
// Generated Prisma model
model Car {
  id          String    @id @default(cuid())
  make        String
  model       String
  year        Int
  price       Float
  fuelType    String    @map("fuel_type")
  bodyType    String?   @map("body_type")
  drivetrain  String?
  transmission String?
  features    String[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  @@map("cars")
}
```

### Generated API Route Boilerplate

```typescript
// packages/api/src/routes/cars.ts (boilerplate)
import { FastifyInstance } from 'fastify';
import { CarAttributes } from '@decisionhub/shared/types';

export async function carRoutes(fastify: FastifyInstance) {
  // GET /api/cars
  fastify.get('/cars', async (request, reply) => {
    // TODO: Implement list cars logic
  });
  
  // GET /api/cars/:id
  fastify.get('/cars/:id', async (request, reply) => {
    // TODO: Implement get car by ID logic
  });
  
  // POST /api/cars
  fastify.post('/cars', async (request, reply) => {
    // TODO: Implement create car logic
  });
  
  // AI-powered recommendation endpoint
  fastify.post('/cars/recommend', async (request, reply) => {
    // TODO: Implement AI recommendation logic
  });
}
```

## AI Agent Integration

### Spec Review Agent

When a spec is created or updated, an AI agent:

1. **Validates completeness**: Checks for missing required fields
2. **Suggests improvements**: Recommends additional attributes
3. **Checks consistency**: Ensures naming conventions
4. **Generates examples**: Creates sample data
5. **Reviews prompts**: Improves AI prompt templates

### Code Generation Agent

After validation:

1. **Generates types**: Creates TypeScript interfaces and enums
2. **Creates schemas**: Generates Prisma/database schemas
3. **Scaffolds routes**: Creates API endpoint boilerplate
4. **Writes tests**: Generates basic test cases
5. **Updates docs**: Auto-generates API documentation

## Developer Workflow

### 1. Define New Category

```bash
# Copy template
cp -r specs/categories/_template specs/categories/electronics

# Edit the spec
# specs/categories/electronics/models.yml
```

### 2. Validate Locally

```bash
# Validate YAML syntax and schema
npm run spec:validate specs/categories/electronics/models.yml

# Review with AI
npm run spec:ai-review specs/categories/electronics/models.yml
```

### 3. Generate Code

```bash
# Generate all artifacts
npm run spec:generate electronics

# Or generate specific parts
npm run generate:types electronics
npm run generate:routes electronics
npm run generate:schema electronics
```

### 4. Implement Business Logic

```typescript
// The generated code provides structure
// Developer implements the actual logic

export async function getCarRecommendations(
  criteria: CarSearchCriteria
): Promise<CarRecommendation[]> {
  // Your custom implementation here
  // Use AI agents, database queries, etc.
}
```

### 5. Test & Deploy

```bash
# Run tests
npm test

# Commit and push
git add .
git commit -m "Add electronics category"
git push

# GitHub Actions handles CI/CD
```

## Benefits

✅ **Single Source of Truth**: Spec defines everything  
✅ **Reduced Boilerplate**: Auto-generate repetitive code  
✅ **Type Safety**: Generated types prevent errors  
✅ **Consistency**: All categories follow same patterns  
✅ **Documentation**: Spec serves as documentation  
✅ **AI-Enhanced**: AI helps improve specs and code  
✅ **Fast Iteration**: Change spec, regenerate code  
✅ **Version Control**: Track changes to specs in Git

## Next Steps

1. Create spec schema (`specs/schemas/spec-schema.json`)
2. Build code generation scripts (`scripts/generate-*.js`)
3. Set up GitHub Actions workflows
4. Implement AI review agent
5. Create first category (cars) as reference

---

**Questions?** This workflow is designed to be flexible and can be adjusted based on your specific needs.
