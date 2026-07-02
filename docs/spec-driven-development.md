# Spec-Driven Development Guide

## Overview

This document explains the **Spec-Driven Development (SDD)** methodology used in DecisionHub AI. Specifications are the **single source of truth** for all features, changes, and architecture decisions. Code implements specifications; specifications do not document code.

---

## What is Spec-Driven Development?

### Definition

**Spec-Driven Development** is a software development methodology where:

1. **Specifications are written first**, before any code
2. **Specifications define behavior**, not implementation details
3. **Code implements specifications**, validated against acceptance criteria
4. **Specifications evolve** as requirements change
5. **Specifications enable collaboration** between stakeholders and developers

### Core Principle

> **"If it's not in the spec, it doesn't exist. If it exists, it must be in the spec."**

This ensures:
- Clear communication between team members
- Reduced ambiguity and misunderstandings
- Better planning and estimation
- Easier onboarding for new team members
- Living documentation that stays current

---

## The Specification Kit

DecisionHub AI uses a **Spec Kit** consisting of five core documents:

### 1. Product Vision (`specs/product-vision.md`)

**Purpose**: Define the "why" and "what" at a high level

**Contents**:
- Vision statement
- Problem being solved
- Target users
- Solution overview
- MVP scope
- Success metrics
- Future vision
- Risks and mitigations

**When to Update**:
- Product strategy changes
- New market insights
- Pivot or scope changes
- Major milestone completions

**Owner**: Product Manager / Project Lead

---

### 2. Requirements (`specs/requirements.md`)

**Purpose**: Define functional and non-functional requirements

**Contents**:
- Functional requirements (FR-XXX)
- Non-functional requirements (NFR-XXX)
- Data requirements
- Integration requirements
- Acceptance criteria
- Traceability matrix

**When to Update**:
- New feature requests
- Requirement clarifications
- Performance targets change
- Compliance requirements added

**Owner**: Product Manager + Tech Lead

---

### 3. Design (`specs/design.md`)

**Purpose**: Define technical architecture and design decisions

**Contents**:
- System architecture diagrams
- Component specifications
- Data flow diagrams
- API contracts
- Database schemas
- Technology choices and rationale
- Design patterns used

**When to Update**:
- Architecture changes
- New components added
- Technology stack changes
- Design patterns introduced
- Performance optimizations

**Owner**: Tech Lead / Architect

---

### 4. Agent Workflow (`specs/agent-workflow.md`)

**Purpose**: Define multi-agent AI system behavior

**Contents**:
- Agent specifications
- Workflow diagrams
- AI prompt designs
- Agent communication protocols
- Error handling strategies
- Performance characteristics

**When to Update**:
- New agents added
- Agent logic changes
- Workflow modifications
- AI provider changes
- Performance optimizations

**Owner**: AI Engineer / Tech Lead

---

### 5. Tasks (`specs/tasks.md`)

**Purpose**: Break down work into implementable tasks

**Contents**:
- Task breakdown by category
- Task dependencies
- Effort estimates
- Acceptance criteria per task
- Status tracking (✅ ⏳ 📋)
- Risk assessment

**When to Update**:
- New features planned
- Task completed
- Effort re-estimated
- Dependencies discovered
- Risks identified

**Owner**: Development Team

---

## The SDD Workflow

### Step 1: Identify Need

A change is needed because:
- New feature request from stakeholder
- Bug discovered in existing functionality
- Performance issue identified
- Technical debt needs addressing
- Architecture improvement opportunity

**Action**: Create a change proposal (can be informal discussion or formal document)

---

### Step 2: Update Specifications

**Before writing any code**, update the relevant specification(s):

#### For New Features:
1. Update `product-vision.md` if it affects product direction
2. Add functional requirements to `requirements.md` with:
   - Requirement ID (e.g., FR-1.5.4)
   - Description
   - Acceptance criteria
   - Priority and effort estimate
3. Update `design.md` with:
   - New components or modifications
   - API changes
   - Data model changes
   - Architecture diagrams
4. If AI agents involved, update `agent-workflow.md`
5. Add tasks to `tasks.md` with:
   - Task breakdown
   - Dependencies
   - Effort estimates

#### For Bug Fixes:
1. Update `requirements.md` to clarify expected behavior
2. Update `design.md` if design assumptions were wrong
3. Add task to `tasks.md` for the fix

#### For Performance Improvements:
1. Update `requirements.md` with new performance targets
2. Update `design.md` with optimization approach
3. Add tasks to `tasks.md`

**Review**: Specs should be reviewed and approved before implementation begins

---

### Step 3: Implement

Now, and only now, write code:

1. **Read the specifications** thoroughly
2. **Follow the design** as specified
3. **Implement acceptance criteria** exactly
4. **Write tests** that validate acceptance criteria
5. **Document code** with inline comments as needed
6. **Commit frequently** with clear messages referencing spec sections

**Example commit message**:
```
feat: Add streaming AI responses (FR-1.2.5)

- Implement Server-Sent Events for AI provider
- Update Research Agent to support streaming
- Add progressive UI updates in AgentTimeline
- Addresses FR-1.2.5 from requirements.md

Closes #42
```

---

### Step 4: Validate

Before marking a task complete:

1. **Review acceptance criteria** from specs
2. **Run all tests** (unit, integration, E2E)
3. **Check for errors** with linting and type checking
4. **Test manually** in development environment
5. **Verify performance** meets non-functional requirements
6. **Update task status** in `tasks.md` to ✅ Completed

---

### Step 5: Update Specs (Post-Implementation)

After implementation, ensure specs reflect reality:

1. **Mark requirements as implemented** (✅ Implemented)
2. **Update design diagrams** if implementation revealed new details
3. **Add lessons learned** to relevant specs
4. **Update traceability matrix** in `requirements.md`
5. **Document any deviations** from original spec with rationale

---

### Step 6: Review & Iterate

1. **Code review** validates implementation matches specs
2. **Spec review** ensures specs are current and accurate
3. **Iterate** if discrepancies found
4. **Update docs** (`README.md`, guides) if needed

---

## SDD Best Practices

### 1. Specs Are Living Documents

✅ **Do**: Update specs as you learn and evolve  
❌ **Don't**: Let specs become outdated "documentation"

**Example**: If you discover a better algorithm during implementation, update the `design.md` spec to reflect the new approach, then implement it.

---

### 2. Write Testable Acceptance Criteria

✅ **Good**:
```
FR-1.2.3: Budget Extraction
- GIVEN a query "bajo 200 millones"
- WHEN parser extracts budget
- THEN max budget = 200,000,000 COP
- AND min budget = undefined
```

❌ **Bad**:
```
FR-1.2.3: Budget Extraction
- Parse budget from query
```

---

### 3. Use Clear, Unique Identifiers

**Format**: `{Type}-{Section}.{Subsection}.{Number}`

**Examples**:
- `FR-1.2.3` = Functional Requirement, section 1.2, item 3
- `NFR-2.1.1` = Non-Functional Requirement, section 2.1, item 1
- `TASK-B007` = Task, Backend category, number 7

**Benefits**:
- Easy to reference in code comments
- Traceability in commits
- Clear communication

---

### 4. Separate "What" from "How"

**Requirements** (`requirements.md`): Define **what** the system should do  
**Design** (`design.md`): Define **how** the system will do it

**Example**:

✅ **Requirement** (What):
```
FR-1.2.2: Preference Detection
The system shall detect user preferences from natural language queries
with confidence scores >= 0.7.
```

✅ **Design** (How):
```
Implementation uses keyword dictionaries for Spanish/English with
pattern matching. AI provider can override with more accurate detection.
Confidence calculated based on keyword matches and context.
```

---

### 5. Include Rationale for Decisions

Always explain **why** a decision was made:

**Example from `design.md`**:
```markdown
### 12.3 Provider Abstraction vs Direct Integration

**Decision**: Provider abstraction layer

**Rationale**:
- Easy to add new AI providers
- Graceful fallback to mock
- Testing without API costs
- Reduced vendor lock-in
- Future flexibility
```

This helps future developers understand the context and avoids "why did they do it this way?" questions.

---

### 6. Use Visual Diagrams

A diagram is worth a thousand words:

✅ **Do**: Include architecture diagrams, data flow diagrams, sequence diagrams  
✅ **Do**: Use ASCII art for simple diagrams (stays in version control)  
✅ **Do**: Use Mermaid for complex diagrams (renders in GitHub)

**Example**:
```
User → Frontend → API → Agent → AI Provider
                         ↓
                    Database
```

---

### 7. Version Your Specs

Track spec changes just like code:

- **Version number** at top of each spec (e.g., "Version: 1.0")
- **Last updated date**
- **Status** indicator (✅ Implemented, 🚧 In Progress, 📋 Planned)
- **Git commit history** for detailed change tracking

---

### 8. Link Specs Together

Create a web of knowledge:

**Example**:
```markdown
See also:
- [Product Vision](./product-vision.md) for MVP scope
- [Design Spec](./design.md) for implementation details
- [Task TASK-B009](./tasks.md#task-b009) for related work
```

---

## Common Antipatterns to Avoid

### ❌ Antipattern 1: Coding First, Specs Later

**Problem**: Code is written, then "documented" in specs  
**Result**: Specs become outdated quickly, don't drive development  
**Solution**: Always write or update specs before coding

---

### ❌ Antipattern 2: Over-Specification

**Problem**: Specs include low-level implementation details  
**Result**: Specs become brittle, require constant updates  
**Solution**: Focus on "what" and "why", not every line of code

**Example**:

❌ **Too Detailed**:
```
The parseQuery function shall use a for loop to iterate through
keywords array and use indexOf to match against the query string...
```

✅ **Right Level**:
```
The parseQuery function shall match keywords against the query
using case-insensitive pattern matching.
```

---

### ❌ Antipattern 3: Stale Specs

**Problem**: Specs exist but are never updated  
**Result**: Team ignores specs, makes decisions ad-hoc  
**Solution**: Make spec updates part of your definition of done

**Checklist**:
- [ ] Code written
- [ ] Tests passing
- [ ] Specs updated
- [ ] Code reviewed
- [ ] Merged to main

---

### ❌ Antipattern 4: Specs Without Acceptance Criteria

**Problem**: Requirements are vague, no clear completion definition  
**Result**: Endless back-and-forth, missed requirements  
**Solution**: Every requirement needs testable acceptance criteria

---

### ❌ Antipattern 5: No Traceability

**Problem**: Can't connect requirements → design → code → tests  
**Result**: Don't know if all requirements are implemented  
**Solution**: Use requirement IDs throughout codebase

**Example in code**:
```typescript
/**
 * Extract budget from natural language query
 * Implements FR-1.2.3: Budget Extraction
 */
function extractBudget(query: string): Budget {
  // Implementation...
}
```

---

## SDD for Different Roles

### For Product Managers

**Your Responsibilities**:
- Maintain `product-vision.md`
- Define requirements in `requirements.md`
- Prioritize features and tasks
- Validate acceptance criteria
- Review implemented features against specs

**Your Workflow**:
1. Gather user feedback and market insights
2. Update product vision as strategy evolves
3. Write new functional requirements
4. Work with tech lead on non-functional requirements
5. Review and approve implementation

---

### For Tech Leads / Architects

**Your Responsibilities**:
- Maintain `design.md`
- Define system architecture
- Choose technologies
- Review technical feasibility of requirements
- Mentor team on design patterns

**Your Workflow**:
1. Review functional requirements from PM
2. Design technical solution
3. Update design spec with architecture
4. Break down into tasks
5. Review implementation for adherence to design

---

### For Developers

**Your Responsibilities**:
- Implement tasks from `tasks.md`
- Follow designs from `design.md`
- Meet acceptance criteria from `requirements.md`
- Update specs when discovering better approaches
- Write tests that validate specs

**Your Workflow**:
1. Pick task from `tasks.md`
2. Read related specs (requirements, design, workflow)
3. Implement feature following spec
4. Write tests for acceptance criteria
5. Update specs with any learnings
6. Mark task complete

---

### For AI Engineers

**Your Responsibilities**:
- Maintain `agent-workflow.md`
- Design agent interactions
- Optimize AI prompts
- Integrate AI providers
- Monitor AI performance

**Your Workflow**:
1. Design agent workflow
2. Document in `agent-workflow.md`
3. Implement agents following spec
4. Test with different AI providers
5. Update spec with prompt improvements

---

## SDD Tools & Templates

### Requirement Template

```markdown
#### FR-{Section}.{Number}: {Title}
**Status**: 📋 Planned | 🚧 In Progress | ✅ Implemented

**Description**: {What the system should do}

**Acceptance Criteria**:
- [ ] {Testable criterion 1}
- [ ] {Testable criterion 2}
- [ ] {Testable criterion 3}

**Implementation**:
- Component: {Where it lives}
- Files: {List of files}
- Dependencies: {Other FRs or tasks}

**Tests**:
- Unit: {Test file}
- Integration: {Test file}
```

---

### Task Template

```markdown
#### TASK-{Category}{Number}: {Title}
**Status**: ✅ Completed | 🚧 In Progress | 📋 Planned | ⏳ Deferred

**Priority**: Critical | High | Medium | Low  
**Effort**: {Hours}

**Description**: {What needs to be done}

**Acceptance Criteria**:
- [ ] {Criterion 1}
- [ ] {Criterion 2}

**Files Created/Modified**:
- `path/to/file.ts`

**Dependencies**:
- TASK-XXX must be completed first

**Risks**:
- {Potential issue and mitigation}
```

---

### Design Decision Template

```markdown
### {Decision Number}: {Decision Title}

**Decision**: {What was decided}

**Rationale**:
- {Reason 1}
- {Reason 2}
- {Reason 3}

**Alternatives Considered**:
- **Option A**: {Description and why rejected}
- **Option B**: {Description and why rejected}

**Consequences**:
- **Positive**: {Benefits}
- **Negative**: {Trade-offs}

**Revisit Date**: {When to re-evaluate}
```

---

## Example: Adding a New Feature (Streaming AI)

### Step 1: Requirement Specification

Update `requirements.md`:

```markdown
#### FR-1.2.6: Streaming AI Responses
**Status**: 📋 Planned

**Description**: System shall stream AI responses in real-time using Server-Sent Events

**Acceptance Criteria**:
- [ ] Research Agent streams analysis tokens as generated
- [ ] Frontend receives incremental updates
- [ ] Agent Timeline updates progressively
- [ ] Fallback to non-streaming if client doesn't support
- [ ] Max latency to first token: < 500ms

**Non-Functional Requirements**:
- NFR-2.1.3: Streaming maintains p95 < 2s for full response
- NFR-2.2.4: Graceful degradation if streaming fails
```

---

### Step 2: Design Specification

Update `design.md`:

```markdown
### 3.3 Streaming AI Architecture

**Components**:
1. **StreamingAIProvider** interface extends AIProvider
2. **SSE Controller** handles Server-Sent Events
3. **StreamingResearchAgent** extends ResearchAgent
4. **ProgressiveUIComponent** handles incremental updates

**Data Flow**:
```
AI Provider → Streaming Response
     ↓
SSE Controller → Chunks
     ↓
Frontend EventSource → Progressive Update
     ↓
UI Component → Real-time Display
```

**Error Handling**:
- Timeout: Fall back to regular request after 10s
- Connection Loss: Retry with exponential backoff
- Parse Error: Display partial result, log error
```

---

### Step 3: Agent Workflow Update

Update `agent-workflow.md`:

```markdown
### 2.5 Streaming Research Agent

**Purpose**: Stream AI analysis in real-time

**Workflow**:
1. Initiate streaming request to AI provider
2. Emit `analysis.start` event
3. For each token received:
   - Parse partial JSON
   - Emit `analysis.progress` event
   - Update agent activity
4. On completion:
   - Emit `analysis.complete` event
   - Return full result

**Events**:
- `analysis.start`: {timestamp}
- `analysis.progress`: {partialResult, percentage}
- `analysis.complete`: {fullResult, duration}
```

---

### Step 4: Task Breakdown

Update `tasks.md`:

```markdown
#### TASK-FEAT007: Streaming AI Responses
**Status**: 📋 Planned
**Priority**: Medium
**Effort**: 16 hours

**Subtasks**:
1. TASK-FEAT007-A: StreamingAIProvider interface (2h)
2. TASK-FEAT007-B: SSE Controller (4h)
3. TASK-FEAT007-C: StreamingResearchAgent (4h)
4. TASK-FEAT007-D: Frontend EventSource handler (3h)
5. TASK-FEAT007-E: Progressive UI components (3h)

**Dependencies**:
- TASK-B009 (AI Provider Abstraction) must be complete

**Files to Create/Modify**:
- `packages/api/src/services/ai/streaming.ts` (new)
- `packages/api/src/controllers/sseController.ts` (new)
- `packages/api/src/agents/StreamingResearchAgent.ts` (new)
- `packages/web/src/hooks/useStreamingResponse.ts` (new)
- `packages/web/src/components/cars/AIAnalysisPanel.tsx` (modify)
```

---

### Step 5: Implementation

Now implement following the specs:

```typescript
/**
 * Streaming AI Provider Interface
 * Implements FR-1.2.6: Streaming AI Responses
 * See design.md Section 3.3 for architecture
 */
export interface StreamingAIProvider extends AIProvider {
  streamChat(
    messages: AIMessage[],
    onToken: (token: string) => void,
    options?: ChatOptions
  ): Promise<AIResponse>;
}
```

---

### Step 6: Validation & Update

After implementation:

1. Update `requirements.md`:
   ```markdown
   #### FR-1.2.6: Streaming AI Responses
   **Status**: ✅ Implemented
   ```

2. Update `tasks.md`:
   ```markdown
   #### TASK-FEAT007: Streaming AI Responses
   **Status**: ✅ Completed
   **Actual Effort**: 14 hours (2h under estimate)
   ```

3. Add to `design.md`:
   ```markdown
   **Lessons Learned**:
   - EventSource reconnection needs explicit handling
   - Partial JSON parsing requires state machine
   - UI updates should be throttled to avoid jank
   ```

---

## Maintaining Specifications

### Weekly Spec Review

Schedule a weekly review:

1. **Check Status**: Are statuses current? (✅ 🚧 📋)
2. **Review Changes**: What changed this week?
3. **Update Estimates**: Were effort estimates accurate?
4. **Identify Gaps**: Any functionality without specs?
5. **Plan Next Week**: What specs need updating?

---

### Quarterly Spec Audit

Every quarter, do a deep audit:

1. **Completeness**: Is everything documented?
2. **Accuracy**: Do specs match implementation?
3. **Organization**: Are specs easy to navigate?
4. **Consistency**: Are naming and formats consistent?
5. **Obsolescence**: Can any specs be archived?

---

### Version Control

Track spec changes in Git:

```bash
# Good commit message
git commit -m "spec: Add streaming AI requirements (FR-1.2.6)"

# Tag major spec versions
git tag -a specs-v2.0 -m "Specs for Phase 2"
```

---

## Measuring SDD Success

### Quantitative Metrics

- **Spec Coverage**: % of features with documented requirements
- **Spec Accuracy**: % of specs that match implementation
- **Rework Rate**: How often do specs need to change during implementation?
- **Review Efficiency**: Time spent in code review (should decrease)
- **Onboarding Time**: Time for new devs to become productive

**Target**: >90% coverage, >95% accuracy, <10% rework

---

### Qualitative Metrics

- **Team Alignment**: Does team have shared understanding?
- **Stakeholder Confidence**: Do stakeholders trust the process?
- **Developer Satisfaction**: Do devs find specs helpful?
- **Maintenance Ease**: How easy is it to modify existing features?
- **Knowledge Retention**: Is tribal knowledge documented?

---

## Conclusion

**Spec-Driven Development** transforms specifications from passive documentation into active drivers of development. By following the SDD methodology:

✅ **Requirements are clear** before work begins  
✅ **Design decisions are documented** with rationale  
✅ **Implementation follows a plan** rather than ad-hoc decisions  
✅ **Validation is straightforward** against acceptance criteria  
✅ **Knowledge is preserved** for future team members  
✅ **Changes are controlled** and traceable

Remember the core principle:

> **Specs are not documentation of code. Code is implementation of specs.**

When practiced consistently, SDD leads to:
- Higher code quality
- Fewer bugs and rework
- Better team collaboration
- Faster onboarding
- More predictable delivery
- Living documentation

---

## Further Reading

### Internal Documents

- [Product Vision](../specs/product-vision.md) - Current MVP vision
- [Requirements](../specs/requirements.md) - All requirements
- [Design](../specs/design.md) - Technical architecture
- [Agent Workflow](../specs/agent-workflow.md) - AI agent system
- [Tasks](../specs/tasks.md) - Task breakdown

### External Resources

- [Specification by Example](https://www.amazon.com/Specification-Example-Successful-Deliver-Software/dp/1617290084) - Book by Gojko Adzic
- [Behavior-Driven Development](https://cucumber.io/docs/bdd/) - Related methodology
- [RFC Process](https://www.ietf.org/standards/rfcs/) - How internet standards are specified
- [ADR](https://adr.github.io/) - Architecture Decision Records

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-29  
**Status**: ✅ Complete  
**Maintained By**: Development Team

---

## Quick Reference Card

### The SDD Cycle

```
1. IDENTIFY → Need for change
2. SPECIFY → Update relevant specs
3. REVIEW → Get approval
4. IMPLEMENT → Write code following specs
5. VALIDATE → Test against acceptance criteria
6. UPDATE → Mark complete, add learnings
7. ITERATE → Improve based on feedback
```

### Key Documents

| Spec | Purpose | Owner |
|------|---------|-------|
| product-vision.md | Why & what | PM |
| requirements.md | Detailed requirements | PM + Tech Lead |
| design.md | How (architecture) | Tech Lead |
| agent-workflow.md | AI agent system | AI Engineer |
| tasks.md | Work breakdown | Dev Team |

### Remember

- ✅ Specs first, code second
- ✅ Testable acceptance criteria
- ✅ Document rationale
- ✅ Keep specs current
- ✅ Link specs to code

### Common Mistakes

- ❌ Coding before specifying
- ❌ Specs that are too detailed
- ❌ Letting specs become stale
- ❌ No acceptance criteria
- ❌ No traceability
