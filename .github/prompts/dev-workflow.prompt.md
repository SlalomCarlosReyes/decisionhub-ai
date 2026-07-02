# DecisionHub AI Development Workflow

## Overview

This prompt orchestrates the complete Spec-Driven Development workflow for DecisionHub AI using five specialized development agents. Use this workflow when implementing new features or making significant changes to the codebase.

**Purpose**: Guide GitHub Copilot through the systematic development process from requirement validation to code review and merge.

**When to Use**: 
- Implementing new features (FR-X.Y.Z)
- Making architectural changes
- Adding significant functionality
- Any work that requires spec validation and multi-stage review

**When NOT to Use**:
- Bug fixes (use Developer + QA + Reviewer directly)
- Simple typo fixes
- Documentation-only changes
- Trivial updates

---

## Agent Roles

### 1. Product Agent
**File**: `.github/agents/product-agent.md`  
**Role**: Validates requirements, manages scope, ensures spec compliance  
**Outputs**: Requirement analysis, acceptance criteria, scope decisions

### 2. Architect Agent
**File**: `.github/agents/architect-agent.md`  
**Role**: Designs technical solutions, maintains architecture integrity  
**Outputs**: Technical design, architecture decisions, implementation tasks

### 3. Developer Agent
**File**: `.github/agents/developer-agent.md`  
**Role**: Implements features exactly as specified  
**Outputs**: Working code, updated task status, implementation summary

### 4. QA Agent
**File**: `.github/agents/qa-agent.md`  
**Role**: Tests features against acceptance criteria  
**Outputs**: Test reports, bug reports, QA verdict

### 5. Reviewer Agent
**File**: `.github/agents/reviewer-agent.md`  
**Role**: Final code quality check before merge  
**Outputs**: Code review report, merge decision

---

## Complete Workflow

### Phase 1: Requirement Validation (Product Agent)

**Trigger**: User provides a feature request or change proposal

**Product Agent Actions**:
1. Read `.github/agents/product-agent.md` for role and responsibilities
2. Read `specs/product-vision.md` to understand MVP vision and scope
3. Read `specs/requirements.md` to review existing requirements
4. Analyze the user's request:
   - Is it within MVP scope?
   - Does it align with product vision?
   - Is it clearly defined?
   - Are there existing requirements to update?
5. Produce output:
   - If **in scope**: Requirement analysis with FR-X.Y.Z ID and acceptance criteria
   - If **needs clarification**: Questions for user
   - If **out of scope**: Explanation and recommendation for Phase 2+

**Output Format**:
```markdown
## Requirement Analysis: {Feature Name}

**Status**: ✅ Approved | ⚠️ Needs Clarification | ❌ Out of Scope

**Requirement ID**: FR-X.Y.Z

**User Story**: As a [user], I want [feature] so that [benefit]

**Acceptance Criteria**:
- AC-1: GIVEN [precondition] WHEN [action] THEN [result]
- AC-2: [...]
- AC-3: [...]

**Scope Assessment**:
- [Why this fits or doesn't fit MVP scope]

**Product Decision**: [Approve / Request Clarification / Defer to Phase 2]
```

**Proceed If**: Product Agent approves (✅) and user confirms

---

### Phase 2: Technical Design (Architect Agent)

**Trigger**: Product Agent approved requirement

**Architect Agent Actions**:
1. Read `.github/agents/architect-agent.md` for role and responsibilities
2. Read approved requirement (FR-X.Y.Z) from Phase 1
3. Read `specs/design.md` to understand current architecture
4. Read `specs/agent-workflow.md` if AI-related change
5. Review existing codebase for similar patterns
6. Design technical solution:
   - Components to create/modify
   - API contracts
   - Data models
   - Integration points
   - Error handling
   - Performance considerations
7. Document design decisions with rationale
8. Break down into implementation tasks
9. Assess complexity and demo-readiness

**Output Format**:
```markdown
## Technical Design: {Feature Name}

**Requirement**: FR-X.Y.Z

**Design Overview**: [One paragraph summary]

**Components Affected**:
- 🔧 Modified: [file] - [what changes]
- ➕ New: [file] - [what it does]

**Architecture Diagram**: [ASCII or description]

**Detailed Design**:
- Frontend Changes: [components, props, state]
- Backend Changes: [endpoints, services, agents]
- Data Model Changes: [types, validation]

**Technology Choices**: [libraries, patterns, rationale]

**Implementation Tasks**:
1. TASK-{CAT}{NUM}-A: [subtask] (Xh)
2. TASK-{CAT}{NUM}-B: [subtask] (Xh)
Total Effort: Xh

**Design Decisions**: [Document key decisions with rationale]

**Risk Assessment**: [Complexity, demo concerns, risks]
```

**Proceed If**: Architect Agent completes design and user approves

---

### Phase 3: Implementation (Developer Agent)

**Trigger**: Architect Agent completed technical design

**Developer Agent Actions**:
1. Read `.github/agents/developer-agent.md` for role and responsibilities
2. Read technical design from Phase 2
3. Read acceptance criteria from Phase 1
4. Read `specs/design.md` for architecture context
5. Read files to be modified (understand existing code)
6. Implement feature:
   - Follow technical design exactly
   - Use TypeScript strict mode
   - ES modules only
   - Handle errors properly
   - Add comments for complex logic
   - Follow existing patterns
7. Test locally:
   - Run `npm run dev`
   - Verify all acceptance criteria
   - Test happy path, error cases, edge cases
   - Check TypeScript compilation
   - Verify mobile responsiveness (if UI)
8. Update `specs/tasks.md` to mark task complete
9. Document implementation

**Output Format**:
```markdown
## Implementation: TASK-{CAT}{NUM} - {Task Title}

**Requirement**: FR-X.Y.Z
**Design**: [Reference to Phase 2 design]

**Files Changed**:
- ✅ Created: [file] - [purpose]
- ✅ Modified: [file] - [changes]
- ✅ Updated: specs/tasks.md

**Implementation Details**: [How you implemented the design]

**Key Code Segments**: [Critical code with comments]

**Testing Performed**:
- [x] Feature works in dev
- [x] All acceptance criteria met
- [x] No TypeScript errors
- [x] Edge cases tested

**Acceptance Criteria Validation**:
- [x] AC-1: [How verified]
- [x] AC-2: [How verified]

**Ready For**: QA Agent testing
```

**Proceed To**: Phase 4 (QA Testing)

---

### Phase 4: Quality Assurance (QA Agent)

**Trigger**: Developer Agent completed implementation

**QA Agent Actions**:
1. Read `.github/agents/qa-agent.md` for role and responsibilities
2. Read acceptance criteria from Phase 1
3. Read technical design from Phase 2
4. Read implementation summary from Phase 3
5. Review `specs/requirements.md` for testing requirements
6. Set up test environment (`npm run dev`)
7. Execute comprehensive testing:
   - **Functional**: All acceptance criteria, happy path, error handling
   - **Integration**: Works with existing features, API contracts match
   - **Regression**: Existing features still work
   - **Non-functional**: Performance, usability, mobile responsiveness
   - **Demo readiness**: Reliable, presentable
8. Document all test results
9. Create bug reports if issues found
10. Provide QA verdict

**Output Format**:
```markdown
## Test Report: TASK-{CAT}{NUM} - {Task Title}

**Requirement**: FR-X.Y.Z
**Test Date**: YYYY-MM-DD
**Test Result**: ✅ PASS | ❌ FAIL | ⚠️ CONDITIONAL PASS

**Summary**:
- Tests Executed: X
- Tests Passed: X
- Tests Failed: X
- Critical Issues: X

**Acceptance Criteria Validation**:
#### AC-1: [Criterion]
**Status**: ✅ PASS | ❌ FAIL
**Test Steps**: [...]
**Expected**: [...]
**Actual**: [...]

[Repeat for all AC]

**Functional Test Cases**: [Test scenarios with results]

**Integration Testing**: [Integration scenarios]

**Regression Testing**: [Existing features verification]

**Non-Functional Testing**: [Performance, usability, mobile]

**Issues Found**: [Bug reports if any]

**QA Verdict**: ✅ APPROVE | ❌ REQUEST CHANGES | ⚠️ APPROVE WITH NOTES
```

**If ✅ PASS**: Proceed to Phase 5 (Code Review)  
**If ❌ FAIL**: Return to Phase 3 (Developer fixes bugs, QA retests)  
**If ⚠️ CONDITIONAL**: Proceed with noted issues tracked for future

---

### Phase 5: Code Review (Reviewer Agent)

**Trigger**: QA Agent passed testing

**Reviewer Agent Actions**:
1. Read `.github/agents/reviewer-agent.md` for role and responsibilities
2. Read all previous phase outputs:
   - Phase 1: Requirement and acceptance criteria
   - Phase 2: Technical design
   - Phase 3: Implementation summary
   - Phase 4: QA test report
3. Read `specs/design.md` for architecture standards
4. Review all changed files systematically
5. Check against all quality criteria:
   - **Spec Compliance**: Meets requirements exactly
   - **Code Quality**: Readable, maintainable, follows patterns
   - **Type Safety**: Strict TypeScript, no `any`
   - **Error Handling**: Proper try-catch, validation
   - **Module System**: ES modules, proper imports
   - **Performance**: Meets NFR-2.1 (< 2s)
   - **Security**: Input validation, no vulnerabilities
   - **Testing**: QA coverage adequate
   - **Integration**: Works with existing code
   - **Demo Ready**: Reliable for presentation
   - **Architecture**: Follows design, not over-engineered
6. Document findings with severity classification
7. Provide specific fix examples for issues
8. Make merge decision

**Output Format**:
```markdown
## Code Review: TASK-{CAT}{NUM} - {Task Title}

**Requirement**: FR-X.Y.Z
**Review Date**: YYYY-MM-DD
**Review Result**: ✅ APPROVED | ❌ REQUEST CHANGES | ⚠️ APPROVED WITH NOTES

**Executive Summary**:
- Critical Issues: X
- Major Issues: X
- Minor Issues: X

**Spec Compliance**: ✅ | ⚠️ | ❌
**Code Quality**: ✅ | ⚠️ | ❌
**Type Safety**: ✅ | ⚠️ | ❌
**Error Handling**: ✅ | ⚠️ | ❌
**Testing**: ✅ | ⚠️ | ❌
**Integration**: ✅ | ⚠️ | ❌
**Demo Ready**: ✅ | ⚠️ | ❌
**Architecture**: ✅ | ⚠️ | ❌

**Issues & Recommendations**:
#### REVIEW-{NUM}: {Issue}
**Severity**: 🔴 Critical | 🟠 Major | 🟡 Minor | 💡 Suggestion
**File**: [file:line]
**Problem**: [what's wrong]
**Required Fix**: [how to fix with code example]

**Code Highlights**: [Things done well]

**Final Verdict**: ✅ APPROVED | ❌ REQUEST CHANGES | ⚠️ APPROVED WITH NOTES
```

**If ✅ APPROVED**: Proceed to Phase 6 (Merge)  
**If ❌ REQUEST CHANGES**: Return to Phase 3 (Developer fixes, then QA retests, then re-review)  
**If ⚠️ APPROVED WITH NOTES**: Proceed to Phase 6, track minor issues for future

---

### Phase 6: Merge & Completion

**Trigger**: Reviewer Agent approved

**Final Actions**:
1. Update `specs/tasks.md`:
   - Change status from ✅ Completed to ✅ Merged
   - Add implementation notes
   - Record actual effort
   - Note any follow-up items
2. Update `specs/requirements.md` if new requirement was added
3. Update `specs/design.md` with any new architecture decisions
4. Create summary for user

**Output Format**:
```markdown
## ✅ Feature Complete: {Feature Name}

**Requirement**: FR-X.Y.Z - {Title}
**Task**: TASK-{CAT}{NUM}
**Status**: ✅ Merged

### Summary
[Brief summary of what was implemented]

### Phase Results

**Phase 1 - Product**: ✅ Requirement validated and approved
**Phase 2 - Architect**: ✅ Technical design completed  
  - Design Effort: Xh
  - Complexity: Low | Medium | High
  
**Phase 3 - Developer**: ✅ Implementation completed  
  - Files Changed: X created, Y modified
  - Implementation Effort: Xh (estimated: Yh)
  
**Phase 4 - QA**: ✅ Testing passed  
  - Tests Executed: X
  - Tests Passed: X/X
  - Issues Found: 0
  
**Phase 5 - Reviewer**: ✅ Code review approved  
  - Critical Issues: 0
  - Major Issues: 0
  - Minor Issues: X (tracked for future)

### Total Effort
**Estimated**: Xh  
**Actual**: Yh  
**Variance**: +/-Zh

### Files Changed
- [file1] - [purpose]
- [file2] - [purpose]

### Testing Highlights
- All acceptance criteria met ✅
- No regressions found ✅
- Performance excellent (< 2s) ✅
- Demo-ready ✅

### Known Issues / Follow-up
- [Minor issue 1] - Priority: Low, Effort: Xh
- [Enhancement 1] - Phase 2 candidate

### Demo Notes
[How to demonstrate this feature in capstone presentation]

### Next Steps
[Any remaining work or recommendations]
```

**Workflow Complete** ✅

---

## Workflow Variations

### Fast Track (for simple changes)

**When to use**: Bug fixes, typo corrections, simple updates

**Simplified Process**:
1. **Skip Product Agent** - No new requirements
2. **Skip Architect Agent** - No design changes
3. **Developer Agent** - Implement fix
4. **QA Agent** - Test the fix
5. **Reviewer Agent** - Quick code review
6. **Merge** - Update task status

### Iterative Refinement (for changes needed)

**When QA Fails or Reviewer Requests Changes**:

```
Developer implements → QA tests → ❌ Fails
                        ↓
                    Developer fixes → QA retests → ✅ Pass → Reviewer → Merge
```

**When Reviewer Requests Changes**:

```
Developer implements → QA tests → ✅ Pass → Reviewer → ❌ Request Changes
                                              ↓
                                          Developer fixes → QA retests → Reviewer → ✅ Approve → Merge
```

---

## Quality Gates

### Gate 1: Product Approval
- ❌ Out of scope → Stop
- ⚠️ Needs clarification → Get clarification → Retry
- ✅ Approved → Proceed to Architect

### Gate 2: Architect Design
- ⚠️ High complexity → User confirms → Proceed or defer
- ✅ Design complete → Proceed to Developer

### Gate 3: Developer Implementation
- ❌ Doesn't compile → Fix → Retry
- ❌ Doesn't meet AC → Fix → Retry
- ✅ Implemented and tested → Proceed to QA

### Gate 4: QA Testing
- ❌ Critical bugs → Developer fixes → QA retests
- ⚠️ Minor issues → Document → Proceed to Reviewer
- ✅ All tests pass → Proceed to Reviewer

### Gate 5: Code Review
- ❌ Critical/major issues → Developer fixes → QA retests → Reviewer re-reviews
- ⚠️ Minor issues → Document for future → Approve
- ✅ Approved → Merge

---

## Example Usage

### Example 1: New Feature Request

**User Request**: "Add a fuel efficiency filter to the car search"

**Phase 1 - Product Agent**:
```markdown
## Requirement Analysis: Fuel Efficiency Filter

**Status**: ✅ Approved
**Requirement ID**: FR-1.3.4

**User Story**: As a Colombian car buyer, I want to filter vehicles by fuel efficiency so that I can find economical vehicles for daily commuting.

**Acceptance Criteria**:
- AC-1: GIVEN user selects fuel efficiency range (km/L) WHEN search is performed THEN only vehicles meeting efficiency criteria are returned
- AC-2: System displays fuel efficiency rating for each vehicle
- AC-3: Efficiency filter works independently and combined with other filters

**Scope Assessment**: ✅ In MVP scope - enhances search capability, aligns with Colombian user needs (fuel cost important), low complexity

**Product Decision**: ✅ Approve - Simple filter following existing patterns
```

**Phase 2 - Architect Agent**:
```markdown
## Technical Design: Fuel Efficiency Filter

**Design Overview**: Add fuelEfficiency field to Car type, add min/max efficiency inputs to search UI, add filtering logic to CarRecommendationAgent.

**Components Affected**:
- 🔧 Modified: packages/shared/src/types/car.ts - Add fuelEfficiency: number
- 🔧 Modified: packages/api/data/mockVehicles.json - Add efficiency data
- 🔧 Modified: packages/web/src/pages/CarSearchPage.tsx - Add efficiency inputs
- 🔧 Modified: packages/api/src/agents/CarRecommendationAgent.ts - Add efficiency filter

**Implementation Tasks**:
1. TASK-FEAT009-A: Add fuelEfficiency to Car type (0.5h)
2. TASK-FEAT009-B: Update mock data with efficiency values (1h)
3. TASK-FEAT009-C: Add UI inputs for efficiency range (1h)
4. TASK-FEAT009-D: Add filtering logic in agent (0.5h)

**Total Effort**: 3h
**Complexity**: Low
```

**Phase 3 - Developer Agent**:
```markdown
## Implementation: TASK-FEAT009 - Fuel Efficiency Filter

**Files Changed**:
- ✅ Modified: packages/shared/src/types/car.ts (+1 line)
- ✅ Modified: packages/api/data/mockVehicles.json (+12 lines)
- ✅ Modified: packages/web/src/pages/CarSearchPage.tsx (+40 lines)
- ✅ Modified: packages/api/src/agents/CarRecommendationAgent.ts (+8 lines)

**Testing Performed**:
- [x] Efficiency filter works independently ✅
- [x] Combines with price/year filters ✅
- [x] Validation prevents min > max ✅
- [x] All 12 vehicles have efficiency data ✅

**Ready For**: QA Agent testing
```

**Phase 4 - QA Agent**:
```markdown
## Test Report: TASK-FEAT009 - Fuel Efficiency Filter

**Test Result**: ✅ PASS

**Summary**: All 15 tests passed, no issues found

**Acceptance Criteria Validation**:
- [x] AC-1: Efficiency filtering works ✅
- [x] AC-2: Efficiency displayed on cards ✅
- [x] AC-3: Works with other filters ✅

**QA Verdict**: ✅ APPROVE FOR MERGE
```

**Phase 5 - Reviewer Agent**:
```markdown
## Code Review: TASK-FEAT009 - Fuel Efficiency Filter

**Review Result**: ✅ APPROVED

**Executive Summary**: Clean implementation, follows existing patterns, all requirements met.

**Issues**: 0 critical, 0 major, 1 minor (add km/L unit label)

**Final Verdict**: ✅ APPROVED
```

**Phase 6 - Merge**:
```markdown
## ✅ Feature Complete: Fuel Efficiency Filter

**Requirement**: FR-1.3.4
**Status**: ✅ Merged

**Total Effort**: 3h (estimated: 3h) ✅

Feature successfully implemented and merged!
```

---

## Best Practices

### Do's ✅

1. **Follow Sequence** - Don't skip phases (except fast track)
2. **Read Agent Files** - Each phase, load the agent .md file first
3. **Document Everything** - Each agent produces written output
4. **Be Systematic** - Don't rush through phases
5. **Trust the Process** - Spec-Driven Development prevents issues
6. **Iterate When Needed** - QA/Review failures are normal, fix and retry
7. **Track Follow-ups** - Document minor issues for future work
8. **Think Demo** - Keep capstone presentation in mind

### Don'ts ❌

1. **Don't Skip Product** - Every feature needs scope validation
2. **Don't Skip Design** - Architect prevents implementation issues
3. **Don't Skip Testing** - QA catches bugs before review
4. **Don't Skip Review** - Final quality gate before merge
5. **Don't Add Unspecified Features** - Stick to approved specs
6. **Don't Over-Engineer** - Keep it simple for MVP
7. **Don't Ignore Warnings** - ⚠️ issues can become blockers
8. **Don't Rush** - Quality over speed for capstone

---

## Success Metrics

A feature is **successfully delivered** when:

- ✅ Product Agent approved (in scope, clear requirements)
- ✅ Architect Agent designed (clear technical approach)
- ✅ Developer Agent implemented (working code, tested locally)
- ✅ QA Agent passed (all tests passed, no critical bugs)
- ✅ Reviewer Agent approved (code quality meets standards)
- ✅ Merged and documented (specs updated, task marked complete)

---

## Troubleshooting

### Issue: Product Agent says "Out of Scope"
**Solution**: 
- Understand why (MVP constraint, timeline, complexity)
- Options: Simplify feature, defer to Phase 2, or drop

### Issue: Architect Agent raises High Complexity warning
**Solution**:
- Review the design carefully
- Consider simpler alternatives
- Confirm timeline allows for effort
- If too complex, return to Product Agent for rescoping

### Issue: Developer Agent can't meet Acceptance Criteria
**Solution**:
- Review technical design - is it feasible?
- May need to return to Architect Agent for redesign
- Or return to Product Agent to adjust AC

### Issue: QA Agent finds Critical Bugs
**Solution**:
- Developer Agent fixes bugs
- QA Agent retests (regression tests too)
- Once pass, proceed to Reviewer Agent

### Issue: Reviewer Agent requests changes
**Solution**:
- Developer Agent fixes code quality issues
- QA Agent retests if functional changes
- Reviewer Agent re-reviews
- Iterate until approved

---

## Workflow Prompt Template

When invoking this workflow, use:

```
I want to implement: [Feature description]

Please follow the DecisionHub AI Development Workflow:

1. Load .github/prompts/dev-workflow.prompt.md
2. Execute Phase 1 (Product Agent) - Validate requirement
3. [Wait for approval]
4. Execute Phase 2 (Architect Agent) - Design solution
5. [Wait for approval]
6. Execute Phase 3 (Developer Agent) - Implement
7. Execute Phase 4 (QA Agent) - Test
8. Execute Phase 5 (Reviewer Agent) - Code review
9. Execute Phase 6 - Merge and document

Use the five agent files in .github/agents/ for each phase.
```

---

## Related Documentation

- **Product Agent**: `.github/agents/product-agent.md`
- **Architect Agent**: `.github/agents/architect-agent.md`
- **Developer Agent**: `.github/agents/developer-agent.md`
- **QA Agent**: `.github/agents/qa-agent.md`
- **Reviewer Agent**: `.github/agents/reviewer-agent.md`
- **SDD Methodology**: `docs/spec-driven-development.md`
- **Product Vision**: `specs/product-vision.md`
- **Requirements**: `specs/requirements.md`
- **Design Specs**: `specs/design.md`
- **Task Tracking**: `specs/tasks.md`

---

**Remember**: This workflow ensures quality, maintainability, and demo-readiness for DecisionHub AI. Follow it systematically for best results!
