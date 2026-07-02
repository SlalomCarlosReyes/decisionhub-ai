# Car Category Specifications

This directory contains YAML specifications for the car category in DecisionHub AI.

## Files

### models.yml
Defines the car data model including:
- Core attributes (make, model, year, price, etc.)
- Fuel types and body types
- Technical specifications
- Decision factors and their weights
- AI agent guidance

### features.yml
Defines car features organized by category:
- Safety features
- Infotainment & connectivity
- Comfort & convenience
- Electric vehicle specific features
- Feature importance levels

## Purpose

These specifications serve as:

1. **Documentation** - Clear definition of the car domain model
2. **Development Guide** - TypeScript types mirror this structure
3. **AI Agent Context** - Agents use decision factors for scoring
4. **Future Automation** - Ready for automatic code generation

## Spec-Driven Development

### Current (MVP)
- Developer manually creates TypeScript types based on spec
- Agent logic follows decision factor weights
- Specs document the "contract" between frontend and backend

### Future Enhancement
- Automated type generation from YAML specs
- JSON schema validation
- Automatic API route generation
- Database schema generation

## Adding New Attributes

To add a new car attribute:

1. Add to `models.yml` under `attributes`
2. Update TypeScript type in `packages/shared/src/types/car.ts`
3. Update mock data in `packages/api/src/data/cars.json`
4. Update agent logic if attribute affects scoring

## Adding New Categories

To add a new category (e.g., electronics):

1. Create `specs/categories/electronics/`
2. Copy structure from `cars/` directory
3. Define category-specific attributes
4. Create corresponding TypeScript types
5. Implement category-specific agents

The architecture is designed to support multiple categories with minimal changes to core code.
