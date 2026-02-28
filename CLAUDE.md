# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Learning Art** is a local-first web application for memorizing major artworks and developing high-dimensional commentary across art, history, social context, economics, psychology, and philosophy. The system is automation-first, with dataset selection, crawling, metadata normalization, relationship inference, review scheduling, and UI rendering all generated from scripts backed by SQLite.

Target dataset: 200 paintings, 64 sculptures, 64 architectures (328 total).

## Tech Stack

- **Runtime**: Node.js
- **Database**: SQLite (local-only)
- **Frontend**: Next.js + React + Tailwind CSS + shadcn/ui-style components
- **API Integration**: Gemini API for artwork selection, Wikimedia Commons for images/metadata
- **Review System**: SM-2 spaced repetition algorithm (5-10 works/day default)

## Critical Protocol: Mandatory Workflow

This repository enforces a **strict, documented workflow** for all AI-assisted development. You MUST follow the protocol defined in `docs/protocols/working-protocols.md`.

### Task Size Classification

Before starting ANY work, classify the task:

- **Small**: Typos, docs, trivial config, formatting, zero-risk refactors (no interface changes)
  - Required steps: 2 (Triage) / 7 (Implement) / 8 (Finalize)
  - Record: Commit message + PR description

- **Medium**: Extending existing components, adding error handling, new behavior within existing boundaries
  - Required steps: 2 / 3 / 4 / 6 (branch only) / 7 / 8
  - Record: Lightweight requirement doc recommended, explicit PR

- **Large**: New components, significant functionality, boundary changes (APIs/interfaces/data schema), multi-module refactors
  - Required steps: Full protocol (2 / 3 / 4 / 5 / 6 / 7 / 8)
  - Record: Requirement + Design + Execution plan docs

**Default rule**: If uncertain between Medium and Large, classify as Large.

### Document Naming Convention

All generated documents use zero-padded numeric prefixes (minimum 4 digits):

- Requirements: `docs/requirements/XXXX-<kebab-case-name>.md`
- Designs: `docs/designs/XXXX-<kebab-case-name>.md`
- Execution plans: `docs/execution-plans/XXXX-<kebab-case-name>.md`

**Increment protocol**: Find highest existing prefix in target folder, add 1, zero-pad.

### Canonical Workflow Steps

1. **Sync from Main**: Checkout main, pull latest, ensure clean working tree
2. **Triage Task Size**: Classify Small/Medium/Large with justification
3. **Understand Requirements**: Read existing docs or create new requirement doc (Medium/Large)
4. **Orient**: Identify conventions, boundaries, constraints, current state
5. **Design**: Write design doc in `docs/designs/` (Large only, optional for risky Medium)
6. **Plan & Branch**: Create feature branch; write execution plan for Large tasks
7. **Implement**: Atomic commits, tests per change, follow repo patterns
8. **Finalize**: Update docs, pass tests/linters, push, open PR with full context

### PR Requirements

All PRs must include:
- Task size classification + justification
- Steps followed (explicitly mention skipped steps)
- Key design decisions (Medium/Large)
- Test evidence
- Risk assessment + rollback plan (Medium/Large)
- Links to requirement/design/plan docs (if present)

## System Design Principles

The codebase follows strict engineering philosophies defined in `docs/protocols/system-design-principles.md`:

- **UNIX Philosophy**: Small, composable tools; single-purpose modules; text-based I/O
- **KISS**: Simplest solution first; avoid premature abstraction
- **SOLID**: Stable boundaries; minimal coupling; dependency inversion for AI/external services
- **Stateless/FP Bias**: Explicit inputs/outputs; minimize hidden state; pure functions preferred
- **Convention Over Configuration**: Standardized defaults; golden path over knobs

### AI Integration Rules

When building LLM-powered features (artwork selection, commentary generation):

1. Wrap AI calls in typed contracts (JSON schemas, explicit interfaces)
2. One AI capability = one tool with single responsibility
3. Validate outputs against schemas; never trust raw LLM output
4. Include provenance (model version, prompt version, trace IDs)
5. Prefer boring pipelines over "agentic autonomy"
6. Test with golden fixtures and regression tests

## Architecture Guidelines

### Module Organization

- **Scripts** (`scripts/`): Automation for ingestion, normalization, LLM selection, scheduling
- **Web UI** (`web/`): Next.js app with pages for Home, Browse, Work Detail, Review Mode
- **Database**: SQLite schema with tables for artworks, metadata, reviews, relationships

### Data Pipeline Pattern

1. **Selection**: LLM (Gemini) generates curated list of 328 artworks
2. **Ingestion**: Scripts fetch metadata from Wikimedia/public APIs
3. **Normalization**: Standardize author, date, medium, dimensions, provenance
4. **Commentary Generation**: LLM (Claude) generates 6-dimension analysis (Art & Technique, Historical Context, Social Impact, Economics, Psychology, Philosophy)
5. **Storage**: SQLite with image paths, metadata, credit lines; Markdown files for commentary
6. **Scheduling**: SM-2 algorithm generates daily review queue
7. **UI Rendering**: Next.js reads SQLite, displays works with search/filter/shortcuts

### Commentary System

**File-based commentary** (not in database) stored as Markdown:
- **Location**: `data/commentary/{category}/{id}-{slug}.md`
- **Format**: 6 dimensions with sources, metadata footer (generation date, model, prompt version)
- **Generation**: RAG-enhanced (fetches Wikipedia + museum sources before LLM synthesis)
- **Provenance**: Every file includes generation metadata and can be manually edited

**Prompt template**: `scripts/prompts/commentary-generation-v1.md` defines the structure and quality guidelines.

**Example output**: See `data/commentary/paintings/0001-starry-night-example.md` for reference.

### Key Constraints

- **Local-only**: No cloud deployment, no auth, no multi-user
- **No paid APIs**: Use Gemini (free tier), Wikimedia Commons, public endpoints only
- **Rate limiting**: Cache API calls by URL; respect rate limits
- **Reproducibility**: Scripts must be deterministic; transparent scoring for artwork selection
- **Attribution**: Every image must have author, credit line, source URL

## Code Style

- **TypeScript**: Prefer explicit types over `any`; use interfaces for contracts
- **Error Handling**: Follow existing patterns; explicit error propagation; typed errors
- **Commits**: One logical change per commit; include tests and doc updates
- **Testing**: Add/update tests whenever behavior changes; reproduce bugs with failing tests first
- **UI**: Modern, fancy, responsive; dark mode; keyboard shortcuts; fast search

## Common Commands

### Development Workflow

```bash
# Install dependencies (web app)
cd web && npm install

# Run Next.js dev server
cd web && npm run dev

# Run build
cd web && npm run build

# Run linter
cd web && npm run lint

# Run type checking
cd web && tsc --noEmit
```

### Data Pipeline Scripts

```bash
# Run artwork selection (Gemini API)
npx tsx scripts/llm_select.ts

# Ingest metadata from Wikimedia
npx tsx scripts/enrich_authoritative.ts

# Normalize artwork JSON
npx tsx scripts/normalize_artworks_json.ts

# Generate commentary for single artwork
npx tsx scripts/generate_commentary.ts --id 1

# Generate commentary for all artworks
npx tsx scripts/generate_commentary.ts --all --delay 2000

# Generate commentary for category
npx tsx scripts/generate_commentary.ts --category paintings

# Force regenerate existing commentary
npx tsx scripts/generate_commentary.ts --all --force

# Generate review schedule
npx tsx scripts/schedule_reviews.ts

# Run database migration
npx tsx scripts/db_migrate.ts
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/<short-name>

# Stage and commit
git add <files>
git commit -m "Brief description

Detailed explanation if needed."

# Push and create PR
git push -u origin feature/<short-name>
gh pr create --title "Title" --body "Description"
```

## Important Notes

- **Always check `docs/protocols/working-protocols.md`** before starting work
- **Never skip protocol steps** for the classified task size
- **Document skipped steps** explicitly in PR description with justification
- **No boundary changes** (APIs, schemas, interfaces) without Large-task protocol
- **Keep PRs tight**: Avoid mixing unrelated changes; atomic scope per PR
- **Commit hygiene**: Atomic commits with tests; avoid "drive-by refactors"

## References

### Protocol Documents
- Working protocols: `docs/protocols/working-protocols.md`
- System design principles: `docs/protocols/system-design-principles.md`

### Requirements
- Initial requirements: `docs/requirements/0000-raw-requests.md`
- Commentary system: `docs/requirements/0001-commentary-system.md`
- Web UI design: `docs/requirements/0002-web-ui.md`
- Artwork selection: `docs/requirements/0003-artwork-selection.md`

### Design Documents
- Artwork selection criteria: `docs/designs/0001-artwork-selection-criteria.md`

### Data & Examples
- Seed list (canonical works): `data/seed-list-canonical-works.md`
- Selection gap analysis: `data/selection-gap-analysis.md`
- Example commentary: `data/commentary/paintings/0001-starry-night-example.md`
- Commentary prompt template: `scripts/prompts/commentary-generation-v1.md`
