# Document Templates

This directory contains templates for structured documentation in this repository.

## Templates

### requirement.md
Template for requirement documents. Used for Medium and Large tasks.

**Location**: `docs/requirements/XXXX-<name>.md`

**When to use**:
- **Large tasks**: Always required
- **Medium tasks**: Recommended (lightweight version)
- **Small tasks**: Not required

### design.md
Template for design documents. Used for Large tasks and risky Medium tasks.

**Location**: `docs/designs/XXXX-<name>.md`

**When to use**:
- **Large tasks**: Always required
- **Medium tasks**: Optional (only for high-risk changes)
- **Small tasks**: Not required

### execution-plan.md
Template for execution plans. Used for Large tasks.

**Location**: `docs/execution-plans/XXXX-<name>.md`

**When to use**:
- **Large tasks**: Always required
- **Medium tasks**: Not required (use PR description checklist instead)
- **Small tasks**: Not required

## Document Naming Convention

All documents use zero-padded numeric prefixes (minimum 4 digits):

```
XXXX-<kebab-case-name>.md
```

**Increment protocol**:
1. Find the highest existing prefix in the target folder
2. Add 1
3. Zero-pad to 4 digits minimum

**Examples**:
- `0001-user-authentication.md`
- `0042-api-redesign.md`
- `0123-performance-optimization.md`

## Usage

### Creating a New Document

1. **Determine document type** based on task size (see `docs/protocols/working-protocols.md`)

2. **Find the next number**:
   ```bash
   # For requirements
   ls docs/requirements/ | sort | tail -1

   # For designs
   ls docs/designs/ | sort | tail -1

   # For execution plans
   ls docs/execution-plans/ | sort | tail -1
   ```

3. **Copy the template**:
   ```bash
   cp docs/templates/requirement.md docs/requirements/XXXX-my-feature.md
   ```

4. **Fill in the template**:
   - Replace `[placeholders]` with actual content
   - Remove optional sections if not needed
   - Keep structure consistent

5. **Update metadata**:
   - Document ID
   - Created date
   - Author
   - Task size

## Template Customization

These templates are starting points. You can:
- **Add sections** if your task requires additional structure
- **Remove optional sections** marked with "(Optional)" or "(if applicable)"
- **Adapt the level of detail** based on task size (e.g., lightweight for Medium tasks)

**Do not**:
- Remove required sections
- Change the core structure significantly
- Skip metadata headers

## References

- **Working Protocols**: `docs/protocols/working-protocols.md` - Defines when to use each template
- **System Design Principles**: `docs/protocols/system-design-principles.md` - Engineering philosophies to follow
- **CLAUDE.md**: Root-level guidance for AI-assisted development

## Quick Reference

| Task Size | Requirement | Design | Execution Plan |
|-----------|-------------|--------|----------------|
| **Small** | ❌ No       | ❌ No   | ❌ No          |
| **Medium**| ⚠️ Recommended (lightweight) | ⚠️ Optional (if risky) | ❌ No (use PR checklist) |
| **Large** | ✅ Required  | ✅ Required | ✅ Required    |
