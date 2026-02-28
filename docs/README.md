# Documentation Index

This directory contains all requirements, designs, and execution plans for the Learning Art project.

**Last Updated**: 2026-02-28

---

## Quick Navigation

### 📋 Requirements Documents

Requirements define **what** we're building and **why**.

- **[0000-raw-requests.md](requirements/0000-raw-requests.md)** - Original project vision
- **[0001-commentary-system.md](requirements/0001-commentary-system.md)** - Multi-dimensional LLM commentary generation
- **[0002-web-ui.md](requirements/0002-web-ui.md)** - Beautiful, calm web interface design
- **[0003-artwork-selection.md](requirements/0003-artwork-selection.md)** - Global, balanced artwork selection criteria

### 🏗️ Design Documents

Design docs define **how** we'll build it (architecture, algorithms, interfaces).

- **[0001-artwork-selection-criteria.md](designs/0001-artwork-selection-criteria.md)** - Scoring methodology, stratification rules, selection process

### 📐 Execution Plans

Execution plans define **step-by-step implementation** for large tasks (none yet).

- _(No execution plans created yet)_

### 📜 Protocols

Core working methodologies and design principles.

- **[working-protocols.md](protocols/working-protocols.md)** - Mandatory workflow for all AI-assisted development
- **[system-design-principles.md](protocols/system-design-principles.md)** - UNIX, KISS, SOLID, FP principles

---

## Document Relationships

```
┌─────────────────────────────────────────────────────────────┐
│ Protocols (How We Work)                                     │
│ - working-protocols.md                                      │
│ - system-design-principles.md                               │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ Requirements (What We Build)                                │
│ 0000-raw-requests.md                                        │
│   ↓                                                          │
│ 0001-commentary-system.md ──→ 6-dimension LLM essays        │
│ 0002-web-ui.md            ──→ Beautiful, calm interface     │
│ 0003-artwork-selection.md ──→ 328 artworks (balanced)       │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ Designs (How We Build)                                      │
│ 0001-artwork-selection-criteria.md ──→ Scoring, quotas      │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ Execution Plans (Implementation Steps)                      │
│ (To be created for Large tasks)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Naming Convention

All documents follow the **numeric prefix convention**:

- **Format**: `XXXX-kebab-case-name.md`
- **Numbering**: Zero-padded, minimum 4 digits (e.g., `0001`, `0042`)
- **Increment**: Find highest existing number, add 1

### Examples
- ✅ `0001-commentary-system.md`
- ✅ `0042-review-scheduling-algorithm.md`
- ❌ `commentary-system.md` (missing numeric prefix)
- ❌ `1-commentary-system.md` (not zero-padded)

---

## Current Status (2026-02-28)

### Completed
- ✅ Core protocols defined
- ✅ Initial requirements documented (3 requirement docs)
- ✅ Artwork selection design completed
- ✅ Commentary system architecture designed
- ✅ Web UI specifications written

### In Progress
- 🔄 Artwork selection (seed list created, LLM generation pending)
- 🔄 Commentary prompt refinement

### Not Started
- ⏳ SQLite schema design
- ⏳ Review system (SM-2 algorithm)
- ⏳ Web UI implementation
- ⏳ LLM API integration

---

## How to Use These Docs

### For New Contributors (Future Claude Instances)

1. **Start here**: Read `CLAUDE.md` in repository root
2. **Understand protocols**: Read `protocols/working-protocols.md`
3. **Review requirements**: Scan all `requirements/XXXX-*.md` files
4. **Check designs**: Review `designs/XXXX-*.md` for architectural decisions
5. **Follow workflow**: Implement following the canonical 8-step process

### For Current Development

1. **Before starting work**: Check if requirement/design doc exists
2. **Small tasks**: Skip directly to implementation
3. **Medium tasks**: Create lightweight requirement doc, then implement
4. **Large tasks**: Full protocol (requirement → design → execution plan → implement)

### For Documentation Updates

- **Adding new requirement**: Find highest `XXXX` in `requirements/`, increment by 1
- **Adding new design**: Find highest `XXXX` in `designs/`, increment by 1
- **Linking docs**: Use relative paths (e.g., `../requirements/0001-commentary-system.md`)

---

## Key Concepts

### Commentary System
- **6 dimensions**: Art & Technique, Historical Context, Social Impact, Economics, Psychology, Philosophy
- **File-based storage**: `data/commentary/{category}/{id}-{slug}.md`
- **RAG-enhanced**: Fetches Wikipedia + museum sources before LLM generation
- **Provenance tracking**: Every file includes metadata footer

### Artwork Selection
- **328 total**: 200 paintings, 64 sculptures, 64 architectures
- **Global diversity**: 40%+ non-Western, 25-30% women artists
- **Scoring**: 5 weighted dimensions (Historical, Cultural, Technical, Pedagogical, Diversity)
- **Transparent**: Documented rationale for every selection

### Web UI
- **Aesthetic**: Wabi-sabi minimalism (calm, elegant, art-first)
- **Tech stack**: Next.js, React, Tailwind, shadcn/ui
- **Pages**: Home, Browse, Artwork Detail, Review Mode
- **Interactions**: Keyboard shortcuts, dark mode, smooth animations

---

## External Resources

- **Repository guide**: `../CLAUDE.md`
- **Seed artwork list**: `../data/seed-list-canonical-works.md`
- **Gap analysis**: `../data/selection-gap-analysis.md`
- **Example commentary**: `../data/commentary/paintings/0001-starry-night-example.md`
- **Prompt template**: `../scripts/prompts/commentary-generation-v1.md`
