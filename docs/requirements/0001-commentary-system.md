# Requirements: Multi-Dimensional Commentary System

**Status**: Draft
**Date**: 2026-02-28
**Related Design**: `docs/designs/0001-artwork-selection-criteria.md`

---

## Objective

Build an LLM-powered commentary generation system that produces **6-dimension analytical essays** for each artwork in the collection. Commentary must be accurate, educational, interconnected across dimensions, and stored as human-editable Markdown files with full provenance tracking.

**Target**: Generate high-quality commentary for 328 artworks (200 paintings, 64 sculptures, 64 architectures).

---

## Acceptance Criteria

### AC1: Commentary Structure & Content

- ✅ Each commentary contains **exactly 6 dimensions**:
  1. **Art & Technique**: Visual analysis, composition, materials, formal elements, influences
  2. **Historical Context**: Creation circumstances, political/social climate, art movements, contemporary reception
  3. **Social & Cultural Impact**: Reproductions, parodies, cultural symbolism, meaning shifts over time
  4. **Economics**: Patronage context, sales history, market value, art market implications
  5. **Psychology**: Artist's mental state, psychological themes, viewer emotional response, therapeutic aspects
  6. **Philosophy**: Existential themes, aesthetics, ethical questions, enduring philosophical inquiries

- ✅ **Depth target**: 600-800 words total per commentary (medium depth)
  - Detailed enough to be educational
  - Concise enough to avoid overwhelming
  - Can be manually expanded by user later

- ✅ **Quality standards**:
  - No AI-isms or clichés ("delve," "realm," "tapestry," "testament to")
  - Specific, illuminating details over generic observations
  - Dimensions reference each other (interconnected knowledge)
  - Each dimension includes at least 1-2 paragraphs (except Economics if data unavailable)
  - "Key observation" section highlights non-obvious technical or compositional details

### AC2: File-Based Storage

- ✅ **Storage location**: `data/commentary/{category}/{id}-{slug}.md`
  - Categories: `paintings/`, `sculptures/`, `architecture/`
  - Numeric ID matches artwork database ID (4-digit zero-padded)
  - Slug is kebab-case artwork title

- ✅ **Format**: Markdown with YAML-style metadata footer
  - Header: Title, artist, medium, dimensions, location
  - 6 dimension sections with markdown formatting
  - Sources section with citations and URLs
  - Metadata footer: generation date, model, prompt version, edit status

- ✅ **Benefits realized**:
  - Version control friendly (git diff works)
  - Human-readable and easily editable
  - No database locking for edits
  - Simple file-based backup

### AC3: RAG-Enhanced Accuracy

- ✅ **Source fetching** (before LLM generation):
  - Wikipedia summary via Wikipedia REST API
  - Museum collection page (MoMA, Met, National Gallery, etc.) via web scraping or API
  - Artist biographical notes (if available)

- ✅ **Context bundling**:
  - Artwork metadata (title, artist, year, medium, dimensions, location)
  - Fetched source materials concatenated
  - Passed to LLM with structured prompt template

- ✅ **Citation requirements**:
  - Minimum 3 authoritative sources per commentary
  - Sources listed at end with URLs where possible
  - Factual claims must be sourced or marked as interpretation

### AC4: Provenance Tracking

- ✅ **Metadata footer** in every file:
  ```markdown
  ---
  _Generated: YYYY-MM-DD_
  _Model: {model_name}_
  _Prompt Version: {version}_
  _Human Edited: Yes/No_
  ```

- ✅ **Version control**:
  - Prompt template versioned (e.g., `v1.0`, `v1.1`)
  - Model name and version tracked
  - Human edits flagged (preserves original vs. modified distinction)

### AC5: Generation Pipeline

- ✅ **CLI script** (`scripts/generate_commentary.ts`):
  - Single artwork: `--id 1`
  - All artworks: `--all`
  - By category: `--category paintings`
  - Force regenerate: `--force`
  - Batch with rate limiting: `--batch 10 --delay 2000`

- ✅ **Batch processing**:
  - Rate limiting between API calls (default 1000ms, configurable)
  - Progress tracking (`10/328 (3%)`)
  - Error handling (continue on failure, log errors)
  - Skip existing files unless `--force` flag

- ✅ **Generation strategy**:
  - Pre-generate for "greatest hits" (~50 canonical works)
  - On-demand for remaining works
  - Regeneration supported for prompt template updates

### AC6: Quality Assurance

- ✅ **Validation checklist** (automated):
  - All 6 dimensions present
  - Minimum word count per dimension (except Economics)
  - "Key observation" section exists
  - At least 3 sources cited
  - No AI-isms detected (regex pattern matching)
  - Metadata footer present and valid

- ✅ **Manual review workflow**:
  - User can manually edit any commentary file
  - `humanEdited` flag set to `Yes` on edit
  - Original generation metadata preserved

---

## Constraints

### Technical Constraints

- **LLM API**: Use Claude (Anthropic API) or Gemini (Google API)
  - Prefer Claude Sonnet 4.5 for quality
  - Fallback to Gemini 1.5 Pro if cost/rate-limiting concerns
  - No OpenAI (avoiding paid dependencies where possible)

- **Rate limiting**:
  - Respect API rate limits (default 1 req/sec)
  - Configurable delay between requests
  - Batch processing in chunks to avoid timeouts

- **File system**:
  - Markdown files must be valid UTF-8
  - Cross-platform paths (use `path.join()`, not hardcoded slashes)
  - Atomic writes (temp file → rename) to avoid corruption

### Data Constraints

- **Source reliability**:
  - Prioritize primary sources (museum collection pages, artist letters)
  - Wikipedia as supplementary, not sole source
  - Flag LLM-generated claims as "synthetic commentary" if no source available

- **Accuracy over speed**:
  - RAG fetching may slow generation (acceptable trade-off)
  - Manual review encouraged for high-profile works
  - Regeneration supported when better sources found

### UX Constraints

- **User control**:
  - User can edit any commentary file directly
  - Edits persist across regenerations (do not overwrite edited files)
  - User can force regenerate if desired

- **Discoverability**:
  - File naming convention must be consistent (ID + slug)
  - Directory structure mirrors artwork categories
  - Example commentary provided for reference

---

## Non-Goals

### Out of Scope

- ❌ **Real-time commentary generation**: Pre-generate in batch, not on-demand in UI
- ❌ **Multi-language support**: English only (for now)
- ❌ **User-uploaded artworks**: Fixed dataset of 328 works only
- ❌ **Collaborative editing**: Single-user system, no conflict resolution needed
- ❌ **Commentary versioning**: No git-like history within the app (rely on git for version control)
- ❌ **AI-generated images**: Text commentary only, no image generation

### Explicitly Not Required

- Database storage for commentary (files are canonical)
- Full-text search within commentary (can be added later)
- Commentary rating/feedback system
- Automatic quality scoring (manual review sufficient)

---

## Technical Architecture

### Component Overview

1. **Prompt Template**: `scripts/prompts/commentary-generation-v1.md`
   - Defines structure, tone, quality guidelines
   - Versioned for reproducibility
   - Includes dimension-specific instructions

2. **Commentary Library**: `scripts/lib/commentary.ts`
   - TypeScript types: `Artwork`, `Commentary`, `CommentaryMetadata`
   - RAG functions: `fetchWikipediaSummary()`, `fetchMuseumDescription()`
   - LLM integration: `callLLM()` (with API abstraction)
   - File I/O: `writeCommentaryFile()`, `readCommentaryFile()`
   - Batch processing: `batchGenerateCommentaries()`

3. **CLI Script**: `scripts/generate_commentary.ts`
   - Argument parsing (--id, --all, --category, --force, --batch, --delay)
   - Progress reporting
   - Error handling and logging

4. **Data Files**: `data/commentary/{category}/{id}-{slug}.md`
   - Markdown format
   - Metadata footer
   - Human-editable

### Data Flow

```
1. User runs: npx tsx scripts/generate_commentary.ts --id 1
2. Script loads artwork metadata from SQLite
3. Library fetches Wikipedia + museum sources (RAG)
4. Library builds context bundle
5. Library calls LLM API with prompt template + context
6. Library validates output (6 dimensions, sources, quality)
7. Library writes Markdown file with metadata footer
8. Script reports success/failure
```

---

## Success Metrics

### Quality Metrics

- **Accuracy**: 95%+ factual claims verifiable from cited sources
- **Completeness**: 100% of commentaries have all 6 dimensions
- **Depth**: Average 600-800 words per commentary
- **User satisfaction**: User manually edits <10% of generated commentaries (indicates high quality)

### Technical Metrics

- **Generation success rate**: 98%+ (allow for API failures)
- **Processing time**: <2 minutes per commentary (including rate limiting)
- **Batch completion**: 328 commentaries in <12 hours (with rate limiting)

### Usability Metrics

- **File discoverability**: User can locate any commentary file in <30 seconds
- **Edit workflow**: User can edit commentary and verify `humanEdited` flag updated
- **Regeneration**: User can force regenerate any commentary without data loss

---

## Open Questions

1. **LLM provider preference**: Claude (higher quality) vs. Gemini (free tier, lower cost)?
2. **Fallback strategy**: If primary LLM fails, retry with different model or fail gracefully?
3. **Commentary updates**: How to handle when new sources become available? Manual trigger only, or periodic refresh?
4. **User annotations**: Should users be able to add notes alongside generated commentary, or only edit in-place?
5. **Multi-version support**: Keep original + edited versions, or single canonical version?

**Decision needed before full implementation.**

---

## Example File Structure

```
data/
└── commentary/
    ├── paintings/
    │   ├── 0001-starry-night.md
    │   ├── 0002-mona-lisa.md
    │   └── 0200-nighthawks.md
    ├── sculptures/
    │   ├── 0201-david-michelangelo.md
    │   └── 0264-the-thinker.md
    └── architecture/
        ├── 0265-taj-mahal.md
        └── 0328-guggenheim-bilbao.md
```

---

## Dependencies

### External APIs
- Wikipedia REST API: `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`
- Anthropic Claude API (if chosen): `https://api.anthropic.com/v1/messages`
- Google Gemini API (if chosen): `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

### Libraries
- `tsx`: TypeScript execution
- `node:fs/promises`: File I/O
- `node:path`: Cross-platform paths
- HTTP client (fetch, axios, or node-fetch) for API calls

### Configuration
- API keys stored in `.env` file (not committed)
- Rate limiting configurable via CLI args or config file
- Model selection configurable (Claude vs. Gemini)

---

## References

- Brainstorm summary: `BRAINSTORM_SUMMARY.md`
- Example commentary: `data/commentary/paintings/0001-starry-night-example.md`
- Prompt template: `scripts/prompts/commentary-generation-v1.md`
- System design principles: `docs/protocols/system-design-principles.md`
