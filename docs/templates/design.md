# Design: [Feature/Component Name]

> **Document ID**: XXXX-[kebab-case-name]
> **Created**: YYYY-MM-DD
> **Author**: [Your Name or "AI-assisted"]
> **Status**: [Draft / Review / Approved / Implemented]
> **Related Requirement**: [Link to requirement doc]

## Context

[Brief background: Why are we building this? What problem does it solve?]

[Link to requirement doc if it exists]

## Goals

[What this design aims to accomplish:]

- Goal 1: [Specific objective]
- Goal 2: [Specific objective]
- Goal 3: [Specific objective]

## Non-Goals

[What this design explicitly does NOT address:]

- Non-goal 1: [Out of scope]
- Non-goal 2: [Out of scope]

## Proposed Solution

[High-level overview of the solution approach]

### Architecture Overview

[Diagram or description of key components and how they interact]

```
[ASCII diagram or description]
```

### Key Components

#### Component 1: [Name]
- **Purpose**: [What it does]
- **Responsibilities**: [What it's responsible for]
- **Dependencies**: [What it depends on]

#### Component 2: [Name]
- **Purpose**: [What it does]
- **Responsibilities**: [What it's responsible for]
- **Dependencies**: [What it depends on]

## Public Interfaces / Contracts

[Explicit API boundaries, function signatures, data contracts]

### API Endpoints (if applicable)

```typescript
// Example:
interface UserService {
  getUser(id: string): Promise<User>
  updateUser(id: string, data: Partial<User>): Promise<User>
}
```

### Data Models

```typescript
// Example:
interface Artwork {
  id: number
  title: string
  artist: string
  year: number
  // ...
}
```

### Backward Compatibility

[How this maintains compatibility with existing systems:]

- [Compatibility note 1]
- [Compatibility note 2]

## Data Model Changes

[If this design modifies the database schema, storage, or data structures]

### Schema Changes

```sql
-- Example:
ALTER TABLE artworks ADD COLUMN commentary_path TEXT;
CREATE INDEX idx_commentary_path ON artworks(commentary_path);
```

### Migration Strategy

1. [Step 1 of migration]
2. [Step 2 of migration]
3. [Rollback procedure if needed]

### Data Migration

- **Existing data**: [How to handle]
- **New data**: [How it will be structured]
- **Rollback**: [How to revert if needed]

## Error Handling and Failure Modes

[How the system handles errors and degrades gracefully]

### Error Scenarios

1. **Scenario**: [What goes wrong]
   - **Detection**: [How we detect it]
   - **Handling**: [What we do]
   - **Recovery**: [How to recover]

2. **Scenario**: [What goes wrong]
   - **Detection**: [How we detect it]
   - **Handling**: [What we do]
   - **Recovery**: [How to recover]

### Failure Modes

- **[Component] fails**: [What happens, how system degrades]
- **[External dependency] fails**: [What happens, how system degrades]

## Observability

[How to monitor, debug, and understand system behavior]

### Logging

- [What events are logged]
- [Log levels and when to use them]
- [Sensitive data redaction]

### Metrics (if applicable)

- [Metric 1]: [What it measures]
- [Metric 2]: [What it measures]

### Debugging

- [How to debug issues]
- [What information is available]
- [Trace IDs or correlation IDs]

## Security Considerations

[Security analysis and measures]

### Data Exposure

- [What data is exposed, to whom]
- [Access controls]
- [Encryption requirements]

### Authentication/Authorization (if applicable)

- [How auth is handled]
- [Permission model]

### Secrets Handling

- [Where secrets are stored]
- [How secrets are accessed]
- [Rotation strategy]

### Input Validation

- [What inputs are validated]
- [Validation rules]
- [Sanitization approach]

## Test Strategy

[How to ensure correctness and prevent regressions]

### Unit Tests

- [What to unit test]
- [Coverage goals]
- [Key test scenarios]

### Integration Tests

- [What to integration test]
- [Test fixtures/mocks]
- [End-to-end scenarios]

### Golden/Regression Tests

- [Golden fixtures if applicable]
- [Regression test approach]

### Manual Testing

- [What requires manual verification]
- [Test scenarios]

## Rollout / Rollback Plan

[How to safely deploy and revert if needed]

### Rollout Strategy

1. [Phase 1]: [What gets deployed first]
2. [Phase 2]: [What gets deployed next]
3. [Full rollout]: [When everything is live]

### Feature Flags (if applicable)

- [Feature flag names]
- [Default states]
- [Rollout percentage]

### Rollback Procedure

1. [Step 1 to rollback]
2. [Step 2 to rollback]
3. [Verification after rollback]

### Success Metrics

[How to measure if rollout is successful:]

- [Metric 1]: [Target value]
- [Metric 2]: [Target value]

## Alternatives Considered

[Other approaches that were considered and why they were rejected]

### Alternative 1: [Name]
- **Description**: [What it is]
- **Pros**: [Advantages]
- **Cons**: [Disadvantages]
- **Rejection reason**: [Why not chosen]

### Alternative 2: [Name]
- **Description**: [What it is]
- **Pros**: [Advantages]
- **Cons**: [Disadvantages]
- **Rejection reason**: [Why not chosen]

## Open Questions

[Unresolved questions that need answers before/during implementation]

- [ ] Question 1: [What needs to be decided]
- [ ] Question 2: [What needs to be decided]

## References

- Related requirement docs: [Links]
- Related design docs: [Links]
- External references: [Links]
- Code references: [Links to existing code patterns]
