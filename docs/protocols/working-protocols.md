# Working Protocols

This document defines the standardized working protocols for AI-assisted coding in this repository. The intent is to make AI output predictable, reviewable, and easy to integrate—favoring UNIX-style simplicity, KISS, explicit contracts, and minimal configuration.

Core operating principles:
- Small, composable steps; no “mega changes.”
- Explicit inputs/outputs; deterministic artifacts (docs, diffs, commits).
- Prefer conventions over knobs; follow repo patterns unless explicitly instructed otherwise.
- Make state visible: branch, commits, docs, and PR are the canonical history.

---

## 1. Workflow Overview (Canonical)

1) Sync from Main (check out, pull, resolve conflicts)  
2) Triage Task Size (effort)  
3) Understand Requirements  
4) Orient (project context, conventions, current status, design principles)  
5) Design (write design documents)  
6) Plan & Branch (execution plan + feature branch)  
7) Implement (code, test, commit per step)  
8) Finalize (docs, push, PR)

Notes:
- The numbering above is canonical. If a step is skipped due to task size rules, it must be explicitly stated in the PR description (“Skipped Design doc due to Small task policy.”).
- “Implement” is iterative: implement → test → commit, repeated per atomic sub-step.

---

## 2. Task Size Triage (Step 2)

Classification is based on impact, risk, and boundary changes.

Small task:
- Typos, comment/doc consistency, trivial config tweaks, formatting, low-risk refactors with zero behavior change.
- No interface/API changes, no cross-module behavior change.

Medium task:
- Extending an existing component, adding error handling, modest new behavior within existing boundaries.
- No changes to system boundaries (public APIs, core interfaces, module responsibilities, persistence schema, external contracts).

Large task:
- New component/module, significant new functionality, refactoring across boundaries, changes to public interfaces/APIs, data model changes, performance/security-sensitive changes, or multi-team dependencies.

Default rule: if uncertain between Medium and Large, classify as Large.

---

## 3. Required Steps by Task Size

Small tasks (required steps): 2 / 7 / 8  
- Triage Task Size
- Implement
- Finalize

Medium tasks (required steps): 2 / 3 / 4 / 6 (branch only, no execution plan doc) / 7 / 8  
- Triage Task Size
- Understand Requirements (lightweight)
- Orient
- Plan & Branch (feature branch only)
- Implement
- Finalize

Large tasks (required steps): 2 / 3 / 4 / 5 / 6 / 7 / 8  
- Full protocol

---

## 4. Document Naming and Storage Conventions

All generated documents use an auto-increment, zero-padded numeric prefix (minimum 4 digits). Example: `0007-foo-bar.md`.

Paths:
- Requirement docs: `docs/requirements/XXXX-<name>.md`
- Design docs: `docs/designs/XXXX-<name>.md`
- Execution plan docs: `docs/execution-plans/XXXX-<name>.md`

Name rules:
- `<name>` is kebab-case, concise, stable, and task-specific.
- The numeric prefix is monotonically increasing within each folder (recommended).
- If the repo has an index file or existing numbering convention, follow it.

Increment protocol:
- Determine the highest existing prefix in the target folder.
- New doc prefix = highest + 1 (zero-padded).
- If concurrent work risks conflicts, reserve a number by creating the doc early.

---

## 5. Step-by-Step Protocol Details

### Step 1) Sync from Main
Goal: start from a clean, up-to-date baseline.

Minimum actions:
- Checkout main, pull latest.
- Resolve conflicts locally if any (do not proceed with a dirty/conflicted base).

Expected evidence:
- A clean working tree before branching.
- If conflicts occurred, note briefly in PR description.

---

### Step 2) Triage Task Size
Goal: classify the work as Small/Medium/Large and derive mandatory steps.

Output:
- Task size label: Small / Medium / Large.
- A short justification (1–3 bullets).
- Confirm whether boundaries change (APIs/interfaces/data schema).

Recording:
- Medium/Large: include classification in requirement or design doc (or PR description at minimum).
- Small: include in PR description.

---

### Step 3) Understand Requirements
Goal: produce a stable interpretation of what “done” means.

Rule 3.1: If a requirement doc already exists
- Read it.
- Extract and restate:
  - Final objective
  - Acceptance criteria
  - Constraints (non-goals, performance/security, compatibility, allowed dependencies)

Rule 3.2: If requirements come from dialogue or command-line input
- Large tasks:
  - Write a requirement doc in `docs/requirements/` using the template at:
    - `docs/templates/requirement.md` (or repo-equivalent if different)
  - Get user confirmation before continuing beyond requirements.
- Medium tasks:
  - Write a lightweight requirement doc using the same template (a few paragraphs per section is enough).
  - Confirmation is recommended if requirements are ambiguous or risky; otherwise proceed.
- Small tasks:
  - No requirement doc.
  - Commit message and PR description are the official record.

Minimum requirement doc content:
- Objective: what is being achieved.
- Acceptance criteria: testable outcomes.
- Constraints: what must not change (APIs, compatibility, performance budgets, security posture).
- Non-goals: explicitly excluded scope.

---

### Step 4) Orient
Goal: align with repo conventions and current reality before designing/coding.

Orientation checklist:
- Locate the relevant code owners/modules and existing patterns.
- Identify existing conventions:
  - naming, folder structure, error handling patterns, logging/metrics, dependency injection, test structure
- Identify system boundaries:
  - public APIs, interfaces, data contracts, persistence schema, external integrations
- Identify current state:
  - existing TODOs, partial implementations, feature flags, known defects
- Identify constraints:
  - backwards compatibility, performance budgets, security rules, build/lint/test requirements

Output:
- Medium/Large: short “Orientation Notes” section in requirement/design doc, or a PR note for Medium if doc is minimal.
- Large: must be captured in design doc.

---

### Step 5) Design (Large tasks only; optional for Medium when risk is high)
Goal: decide "what we will build" before building it.

Deliverable:
- Design doc in `docs/designs/XXXX-<name>.md`

Design doc must include:
- Problem statement (link to requirement doc if exists)
- Proposed solution (high-level)
- Public interfaces/contracts (explicit; include backward-compat notes)
- Data model changes (if any) with migration strategy
- Error handling and failure modes
- Observability (logs/metrics/traces where applicable)
- Security considerations (data exposure, authz/authn, secrets handling)
- Test strategy (unit/integration/e2e, fixtures, golden tests)
- Rollout/rollback plan (flags, safe deploy, compatibility)

UNIX/KISS enforcement:
- Prefer extending existing components over inventing new layers.
- Prefer composition over deep inheritance and entangled abstractions.
- Explicitly list what you are NOT building.

---

### Step 6) Plan & Branch
Goal: define execution steps and isolate work on a feature branch.

Medium tasks:
- Create feature branch.
- No execution plan doc required.
- Provide a short checklist in PR description (or in the branch’s first commit message) if helpful.

Large tasks:
- Create feature branch.
- Write an execution plan doc in:
  - `docs/execution-plans/XXXX-<name>.md`

Execution plan doc must include:
- Ordered steps (atomic, reviewable)
- Risk points + mitigation
- Verification per step (tests, commands, checks)
- Rollback points (what to revert if step fails)

Branch naming convention (recommended):
- `feature/<short-name>` or `fix/<short-name>` or follow repo convention.

---

### Step 7) Implement
Goal: implement in small, reviewable increments with tests.

Implementation rules:
- One logical change per commit (atomic commits).
- Each commit includes:
  - code changes
  - necessary tests
  - updates to docs/comments if needed
- Keep diffs small; avoid “drive-by refactors” unless explicitly needed.

Testing rules:
- At minimum, run the repo’s standard checks relevant to the touched area.
- Add or update tests whenever behavior changes.
- For bug fixes: reproduce → failing test → fix → passing test (preferred).

Error handling rules (Medium/Large):
- Follow existing patterns for errors and retries.
- Prefer explicit error propagation and typed errors (language-dependent).
- Avoid hidden global state; keep functions as pure as practical.

---

### Step 8) Finalize
Goal: produce a clean PR with clear evidence and artifacts.

Finalize checklist:
- Ensure docs are updated (requirements/design/plan as required by size policy).
- Ensure all tests and linters pass.
- Push branch.
- Open PR with:
  - Problem summary
  - Task size classification + justification
  - Steps followed (explicitly mention skipped steps, if any)
  - Key design decisions (especially for Medium/Large)
  - Test evidence (commands run, CI links if available)
  - Risk assessment + rollback plan (Medium/Large)
  - Links to requirement/design/plan docs (if present)

PR hygiene:
- Keep PR scope tight.
- Avoid mixing unrelated changes.
- Ensure commit history is understandable (squash/merge policy follows repo convention).

---

## 6. Templates and Content Standards

Requirement template source:
- `docs/templates/requirement.md` (or repo-equivalent)

Design and execution plan templates (recommended minimal structure):
- Design doc:
  - Context
  - Goals / Non-goals
  - Proposed Solution
  - Interfaces / Contracts
  - Failure Modes
  - Observability
  - Security
  - Test Plan
  - Rollout / Rollback
- Execution plan:
  - Step list with verification
  - Risks
  - Rollback points

Writing style:
- Prefer crisp bullets, explicit constraints, and testable criteria.
- Avoid speculative prose. If uncertain, mark as assumption and verify.
- Keep docs short but complete; link to code and references.

---

## 7. Enforcement Rules (How This Protocol Stays Real)

Hard requirements:
- Outputs must be reviewable: docs, diffs, commits, and PR descriptions are the canonical artifacts.
- No boundary changes without Large-task protocol (design + execution plan).
- No schema-less “freeform” outputs for tool-like steps; use structured sections and checklists.

Soft requirements (strongly recommended):
- For Medium tasks with any ambiguity, create a lightweight requirement doc.
- For Medium tasks with non-trivial risk, write a short design doc even if not required.

Auditability:
- Every Medium/Large task must have a traceable chain:
  - requirement/design/plan docs (as required)
  - commits
  - PR description mapping back to acceptance criteria

---

## 8. Quick Decision Table

Small:
- Required: 2 / 7 / 8
- Record: commit + PR

Medium:
- Required: 2 / 3 / 4 / 6 (branch only) / 7 / 8
- Record: lightweight requirement doc recommended; PR must be explicit

Large:
- Required: 2 / 3 / 4 / 5 / 6 / 7 / 8
- Record: requirement + design + execution plan docs, plus PR references

---

## 9. Summary

This protocol standardizes AI-assisted work into deterministic, UNIX-like units: clear docs, explicit contracts, small commits, and predictable PRs. It keeps the system simple, boundaries stable, and change reviewable—so the AI accelerates engineering without eroding maintainability.