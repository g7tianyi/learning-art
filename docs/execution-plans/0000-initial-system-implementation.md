# Execution Plan: Initial System Implementation

> **Document ID**: 0000-initial-system-implementation
> **Created**: 2026-02-28
> **Author**: AI-assisted
> **Status**: In Progress
> **Related Requirements**: `docs/requirements/0000-0003`
> **Related Designs**: `docs/designs/0001-0002`
> **Feature Branch**: `feature/initial-implementation`

## Overview

This execution plan covers the initial implementation of the Learning Art system, implementing all four core requirements:
- Req 0000: Overall system setup and structure
- Req 0001: Multi-dimensional commentary system
- Req 0002: Beautiful, calm web UI
- Req 0003: Artwork selection system

The approach is incremental: database → artwork selection → commentary → web UI → spaced repetition.

## Prerequisites

- [x] All requirement documents reviewed
- [x] Design documents created (database schema, artwork selection criteria)
- [x] Working protocols understood
- [x] System design principles understood
- [ ] API keys obtained (Gemini API, optionally Claude API)
- [ ] Development environment set up (Node.js 18+, git)

## Execution Steps

### Step 1: Project Initialization & Dependencies

**Objective**: Set up the project structure, package.json, and install all required dependencies

**Actions**:
1. Initialize root package.json for scripts
2. Install TypeScript, tsx, better-sqlite3, dotenv
3. Set up TypeScript configuration
4. Create directory structure
5. Initialize Next.js app in `web/` directory

**Files to create**:
- `package.json` - Root package definition
- `tsconfig.json` - TypeScript configuration
- `web/` - Next.js application directory

**Verification**:
```bash
npm install
npx tsx --version
node -e "console.log('Setup complete')"
```

**Success criteria**:
- [ ] Dependencies installed successfully
- [ ] TypeScript compiles without errors
- [ ] tsx can execute TypeScript files
- [ ] Directory structure matches conventions

**Estimated time**: 30 minutes

**Risk level**: Low

---

### Step 2: Database Schema & Migration System

**Objective**: Implement SQLite database schema and migration system

**Actions**:
1. Create migration system (`scripts/lib/migrate.ts`)
2. Create initial migration (`migrations/001_initial_schema.sql`)
3. Create database access layer (`scripts/lib/db.ts`)
4. Run initial migration to create tables
5. Write unit tests for database layer

**Files to create**:
- `scripts/lib/migrate.ts` - Migration runner
- `scripts/lib/db.ts` - Database access layer with typed queries
- `migrations/001_initial_schema.sql` - Initial schema
- `scripts/migrate.ts` - CLI migration script

**Verification**:
```bash
npx tsx scripts/migrate.ts
sqlite3 data/artworks.db ".schema"
npx tsx scripts/lib/db.test.ts
```

**Success criteria**:
- [ ] Database file created at `data/artworks.db`
- [ ] All tables created correctly (artworks, reviews, review_schedule, migrations)
- [ ] Indexes created
- [ ] Database access layer functions work
- [ ] Migration tracking table populated

**Estimated time**: 90 minutes

**Risk level**: Medium (database setup is critical)

---

### Step 3: Artwork Selection System - Seed List

**Objective**: Create manual seed list of ~100 canonical artworks

**Actions**:
1. Create seed list file (`data/seed-list-canonical-works.md`)
2. Document ~100 indisputable masterworks across all categories
3. Include metadata: title, artist, year, category, brief rationale
4. Organize by category (paintings/sculptures/architecture)

**Files to create**:
- `data/seed-list-canonical-works.md` - Manual curated seed list

**Verification**:
```bash
# Manual review of seed list
cat data/seed-list-canonical-works.md
```

**Success criteria**:
- [ ] At least 100 artworks documented
- [ ] Covers all three categories (paintings, sculptures, architecture)
- [ ] Geographic and temporal diversity evident
- [ ] Each entry has title, artist, year, brief rationale

**Estimated time**: 2 hours (research-intensive)

**Risk level**: Low (manual curation)

---

### Step 4: Artwork Selection System - LLM-Assisted Generation

**Objective**: Implement Gemini API integration for generating candidate artwork lists

**Actions**:
1. Create LLM selection library (`scripts/lib/artwork_selection.ts`)
2. Implement Gemini API wrapper with structured prompts
3. Create CLI script for artwork generation (`scripts/select_artworks.ts`)
4. Generate candidate lists for each stratum (region × period × category)
5. Score and rank candidates using weighted formula
6. Apply stratification quotas
7. Export final 328 artworks to `data/artworks-final.json`

**Files to create**:
- `scripts/lib/artwork_selection.ts` - Selection logic and scoring
- `scripts/lib/llm.ts` - Gemini API wrapper
- `scripts/select_artworks.ts` - CLI for artwork selection
- `data/artworks-final.json` - Final selected 328 artworks

**Verification**:
```bash
npx tsx scripts/select_artworks.ts --generate-candidates
npx tsx scripts/select_artworks.ts --score-and-rank
npx tsx scripts/select_artworks.ts --export
cat data/artworks-final.json | jq 'length'  # Should output 328
```

**Success criteria**:
- [ ] Gemini API integration works
- [ ] Candidate generation produces diverse artwork lists
- [ ] Scoring formula correctly weights dimensions
- [ ] Stratification meets geographic/temporal/gender quotas
- [ ] Final JSON contains exactly 328 artworks with complete metadata

**Estimated time**: 4 hours

**Risk level**: High (LLM API, complex selection logic, quota balancing)

---

### Step 5: Load Artworks into Database

**Objective**: Populate database with selected 328 artworks

**Actions**:
1. Create artwork loader script (`scripts/load_artworks.ts`)
2. Parse `data/artworks-final.json`
3. Insert artworks into database
4. Initialize review schedule for each artwork
5. Verify data integrity

**Files to create**:
- `scripts/load_artworks.ts` - Load artworks from JSON to database

**Verification**:
```bash
npx tsx scripts/load_artworks.ts
sqlite3 data/artworks.db "SELECT COUNT(*) FROM artworks;"  # Should output 328
sqlite3 data/artworks.db "SELECT COUNT(*) FROM review_schedule;"  # Should output 328
```

**Success criteria**:
- [ ] All 328 artworks loaded successfully
- [ ] No foreign key violations
- [ ] Review schedule initialized for all artworks
- [ ] Database queries work (filters, search)

**Estimated time**: 60 minutes

**Risk level**: Low

---

### Step 6: Image Download Pipeline

**Objective**: Download and store artwork images locally

**Actions**:
1. Create image download script (`scripts/download_images.ts`)
2. Fetch images from Wikimedia Commons or museum URLs
3. Store in `data/images/{category}/{id}-{slug}.jpg`
4. Update database with local image paths
5. Handle rate limiting and errors gracefully

**Files to create**:
- `scripts/download_images.ts` - Image download with retry logic
- `data/images/` - Image storage directory

**Verification**:
```bash
npx tsx scripts/download_images.ts
ls data/images/*/ | wc -l  # Should show 328 images
sqlite3 data/artworks.db "SELECT COUNT(*) FROM artworks WHERE image_path IS NOT NULL;"
```

**Success criteria**:
- [ ] All 328 images downloaded successfully
- [ ] Images stored in correct directory structure
- [ ] Database updated with image paths
- [ ] Image file sizes reasonable (optimized)

**Estimated time**: 90 minutes (includes rate limiting delays)

**Risk level**: Medium (external API dependencies, network failures)

---

### Step 7: Commentary System - Complete LLM Integration

**Objective**: Finish implementing commentary generation with RAG

**Actions**:
1. Implement Wikipedia API fetching in `scripts/lib/commentary.ts`
2. Implement museum page fetching (web scraping or API)
3. Complete LLM API integration (Gemini or Claude)
4. Load prompt template from `scripts/prompts/commentary-generation-v1.md`
5. Test commentary generation for single artwork
6. Add validation for 6 dimensions, sources, quality checks

**Files to modify**:
- `scripts/lib/commentary.ts` - Complete TODOs for RAG and LLM
- `scripts/generate_commentary.ts` - Already exists, verify CLI works

**Verification**:
```bash
npx tsx scripts/generate_commentary.ts --id 1
cat data/commentary/paintings/0001-*.md  # Verify commentary generated
```

**Success criteria**:
- [ ] Wikipedia API fetching works
- [ ] LLM API generates commentary with all 6 dimensions
- [ ] Commentary includes sources and metadata footer
- [ ] Validation checks pass (structure, quality)
- [ ] File written to correct path

**Estimated time**: 3 hours

**Risk level**: High (LLM API, RAG complexity, quality validation)

---

### Step 8: Commentary System - Batch Generation

**Objective**: Generate commentary for canonical ~50 artworks

**Actions**:
1. Select top 50 artworks by selection score
2. Run batch commentary generation with rate limiting
3. Review generated commentary quality
4. Manually edit/improve 2-3 examples
5. Set `humanEdited` flag for edited files

**Files modified**:
- `data/commentary/{category}/*.md` - Generated commentary files

**Verification**:
```bash
npx tsx scripts/generate_commentary.ts --batch 50 --delay 2000
ls data/commentary/*/*.md | wc -l  # Should show ~50 files
```

**Success criteria**:
- [ ] 50 commentary files generated
- [ ] All files have 6 dimensions
- [ ] Quality spot-check passes (no AI-isms, specific details)
- [ ] Metadata footers correct
- [ ] Human edits flagged appropriately

**Estimated time**: 2-3 hours (includes LLM API delays and manual review)

**Risk level**: Medium (LLM quality variance)

---

### Step 9: SM-2 Spaced Repetition Algorithm

**Objective**: Implement SM-2 algorithm for review scheduling

**Actions**:
1. Create SM-2 library (`scripts/lib/sm2.ts`)
2. Implement SM-2 calculation functions
3. Create review update function (updates schedule after review)
4. Create daily queue query function
5. Write unit tests for SM-2 calculations

**Files to create**:
- `scripts/lib/sm2.ts` - SM-2 algorithm implementation
- `scripts/lib/sm2.test.ts` - Unit tests

**Verification**:
```bash
npx tsx scripts/lib/sm2.test.ts
node -e "import('./scripts/lib/sm2.js').then(m => console.log(m.calculateSM2(3, 2.5, 1, 0)))"
```

**Success criteria**:
- [ ] SM-2 calculation function works correctly
- [ ] Review schedule updates correctly after review
- [ ] Daily queue query returns correct artworks (next_review_date <= today)
- [ ] Unit tests pass

**Estimated time**: 90 minutes

**Risk level**: Medium (algorithm correctness critical)

---

### Step 10: Web UI - Project Setup

**Objective**: Initialize Next.js 14 app with App Router

**Actions**:
1. Initialize Next.js app in `web/` directory
2. Install dependencies (React 18, Tailwind CSS, shadcn/ui)
3. Configure Tailwind with custom theme (wabi-sabi aesthetic)
4. Set up typography (Playfair Display, Inter)
5. Configure dark mode support
6. Create root layout with header/footer

**Files to create**:
- `web/app/layout.tsx` - Root layout
- `web/tailwind.config.ts` - Tailwind configuration
- `web/styles/globals.css` - Global styles

**Verification**:
```bash
cd web && npm run dev
# Open http://localhost:3000, verify layout renders
```

**Success criteria**:
- [ ] Next.js dev server runs
- [ ] Root layout renders with header/footer
- [ ] Dark mode toggle works
- [ ] Typography loads correctly (serif titles, sans body)
- [ ] Tailwind styles apply

**Estimated time**: 60 minutes

**Risk level**: Low

---

### Step 11: Web UI - Home Dashboard

**Objective**: Implement home dashboard page

**Actions**:
1. Create home page (`web/app/page.tsx`)
2. Query today's review queue from database
3. Display review queue (5-10 works)
4. Show progress overview (works studied, total progress)
5. Show featured artwork of the day
6. Add quick links to Browse, Review

**Files to create**:
- `web/app/page.tsx` - Home dashboard
- `web/lib/db.ts` - Database queries for Next.js (SSR)
- `web/components/ArtworkCard.tsx` - Reusable artwork card component

**Verification**:
```bash
cd web && npm run dev
# Navigate to http://localhost:3000, verify dashboard renders
```

**Success criteria**:
- [ ] Home page renders with review queue
- [ ] Progress stats display correctly
- [ ] Featured artwork rotates daily
- [ ] Links to Browse and Review work
- [ ] Responsive design (mobile/desktop)

**Estimated time**: 2 hours

**Risk level**: Medium (database integration with Next.js)

---

### Step 12: Web UI - Browse Library

**Objective**: Implement browse page with filters, search, sort

**Actions**:
1. Create browse page (`web/app/browse/page.tsx`)
2. Implement client-side search (title, artist, year)
3. Add filter panel (category, period, region, movement, artist)
4. Add sort options (chronological, alphabetical, recently studied)
5. Implement grid/list view toggle
6. Add keyboard shortcuts (j/k navigation, f for filters)

**Files to create**:
- `web/app/browse/page.tsx` - Browse library page
- `web/components/SearchBar.tsx` - Search input component
- `web/components/FilterPanel.tsx` - Filters component
- `web/lib/search.ts` - Client-side search logic

**Verification**:
```bash
cd web && npm run dev
# Navigate to /browse, test search, filters, sort
```

**Success criteria**:
- [ ] All 328 artworks display in grid
- [ ] Search filters results instantly (<100ms)
- [ ] Filters work (multiple filter combinations)
- [ ] Sort options work
- [ ] Grid/list toggle works
- [ ] Keyboard shortcuts work (j/k, f)

**Estimated time**: 3 hours

**Risk level**: Medium (client-side search performance, filter logic)

---

### Step 13: Web UI - Artwork Detail Page

**Objective**: Implement artwork detail page with commentary

**Actions**:
1. Create artwork detail page (`web/app/works/[id]/page.tsx`)
2. Query artwork metadata from database
3. Read and parse commentary markdown file
4. Display large artwork image (zoomable)
5. Display metadata (title, artist, year, medium, dimensions, location)
6. Render 6-dimension commentary (collapsible sections)
7. Display sources with clickable links
8. Add navigation (previous/next artwork)
9. Add keyboard shortcuts (j/k, z for zoom, 1-6 for dimensions)

**Files to create**:
- `web/app/works/[id]/page.tsx` - Artwork detail page
- `web/components/ArtworkImage.tsx` - Zoomable image component
- `web/components/CommentarySection.tsx` - Collapsible commentary dimension
- `web/lib/commentary.ts` - Read and parse commentary markdown

**Verification**:
```bash
cd web && npm run dev
# Navigate to /works/1, verify detail page renders
```

**Success criteria**:
- [ ] Artwork image displays (high quality, responsive)
- [ ] Metadata displays correctly
- [ ] Commentary renders with all 6 dimensions
- [ ] Collapsible sections work
- [ ] Sources render as clickable links
- [ ] Previous/next navigation works
- [ ] Keyboard shortcuts work (j/k, z, 1-6, space)
- [ ] Markdown formatting preserved

**Estimated time**: 3 hours

**Risk level**: Medium (markdown parsing, image zoom, keyboard shortcuts)

---

### Step 14: Web UI - Review Mode

**Objective**: Implement review mode with SM-2 integration

**Actions**:
1. Create review page (`web/app/review/page.tsx`)
2. Query today's review queue from database
3. Display artwork image + metadata
4. Progressive reveal of commentary dimensions
5. Add self-assessment buttons (Easy / Medium / Hard)
6. Update review schedule in database using SM-2 algorithm
7. Show queue progress indicator
8. Add keyboard shortcuts (1/2/3 for difficulty, space for reveal)

**Files to create**:
- `web/app/review/page.tsx` - Review mode page
- `web/components/ReviewCard.tsx` - Review interface component
- `web/lib/review.ts` - Review submission logic

**Verification**:
```bash
cd web && npm run dev
# Navigate to /review, complete a review, verify schedule updates
sqlite3 ../data/artworks.db "SELECT * FROM reviews ORDER BY reviewed_at DESC LIMIT 1;"
```

**Success criteria**:
- [ ] Review queue loads from database
- [ ] Artwork displays with progressive reveal
- [ ] Difficulty buttons update SM-2 schedule
- [ ] Review recorded in database (reviews table)
- [ ] Review schedule updated (review_schedule table)
- [ ] Queue progress indicator updates
- [ ] Keyboard shortcuts work (1/2/3, space)

**Estimated time**: 3 hours

**Risk level**: High (SM-2 integration, database mutations)

---

### Step 15: Web UI - Keyboard Shortcuts Overlay

**Objective**: Implement global keyboard shortcuts and help overlay

**Actions**:
1. Create keyboard shortcuts hook (`web/hooks/useKeyboardShortcuts.ts`)
2. Implement global shortcuts (/, Esc, ?, d)
3. Create shortcuts overlay modal (`web/components/KeyboardShortcuts.tsx`)
4. Display context-aware shortcuts (page-specific)
5. Add close button and ESC to dismiss

**Files to create**:
- `web/hooks/useKeyboardShortcuts.ts` - Keyboard event handling
- `web/components/KeyboardShortcuts.tsx` - Shortcuts overlay modal

**Verification**:
```bash
cd web && npm run dev
# Press '?' to open shortcuts overlay
```

**Success criteria**:
- [ ] Global shortcuts work on all pages (/, ?, d)
- [ ] Shortcuts overlay displays when '?' pressed
- [ ] Page-specific shortcuts shown
- [ ] Overlay dismisses with ESC or close button
- [ ] Dark mode toggle (d) works

**Estimated time**: 90 minutes

**Risk level**: Low

---

### Step 16: Web UI - Polish & Accessibility

**Objective**: Apply wabi-sabi aesthetic, ensure accessibility

**Actions**:
1. Refine color palette (light/dark mode)
2. Adjust typography scale and line spacing
3. Add generous whitespace and padding
4. Implement slow, gentle transitions (300-400ms)
5. Add micro-animations (fade-ins, hover states)
6. Ensure WCAG AA contrast ratios
7. Add semantic HTML and ARIA labels
8. Add focus indicators for keyboard navigation
9. Test with screen reader
10. Add reduced motion support

**Files to modify**:
- `web/tailwind.config.ts` - Color palette, spacing, typography
- `web/styles/globals.css` - Animations, transitions
- All component files - Accessibility improvements

**Verification**:
```bash
cd web && npm run build
npx lighthouse http://localhost:3000 --view
# Check Lighthouse accessibility score (target: 90+)
```

**Success criteria**:
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Semantic HTML used
- [ ] Reduced motion respected
- [ ] Lighthouse accessibility score ≥90
- [ ] Visual aesthetic matches wabi-sabi principles

**Estimated time**: 3 hours

**Risk level**: Low

---

### Step 17: Documentation & Examples

**Objective**: Update documentation and create example data

**Actions**:
1. Update README.md with setup instructions
2. Document common commands
3. Create example commentary file (Starry Night)
4. Document artwork selection methodology
5. Update CLAUDE.md if needed

**Files to modify**:
- `README.md` - Project overview, setup, commands
- `data/commentary/paintings/0001-starry-night-example.md` - Example commentary

**Verification**:
```bash
cat README.md
cat data/commentary/paintings/0001-starry-night-example.md
```

**Success criteria**:
- [ ] README.md complete with setup instructions
- [ ] Common commands documented
- [ ] Example commentary file created
- [ ] Links to docs directory

**Estimated time**: 60 minutes

**Risk level**: Low

---

### Step 18: Final Integration & Testing

**Objective**: Ensure all components work together, end-to-end testing

**Actions**:
1. Run full test suite (if tests exist)
2. Manual end-to-end testing:
   - Generate artwork selection
   - Load artworks into database
   - Generate commentary for 5 artworks
   - Download images for those artworks
   - Browse artworks in web UI
   - View artwork detail pages
   - Complete a review session
   - Verify SM-2 schedule updates
3. Test all keyboard shortcuts
4. Test dark mode toggle
5. Test responsive design (mobile/tablet/desktop)
6. Verify all acceptance criteria from requirement docs

**Verification**:
```bash
# Run linter
cd web && npm run lint

# Run type check
cd web && npx tsc --noEmit

# Run build
cd web && npm run build

# Manual testing checklist (see below)
```

**Success criteria**:
- [ ] All linting passes
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] All manual test scenarios pass
- [ ] All acceptance criteria met
- [ ] No regressions

**Estimated time**: 2 hours

**Risk level**: Low

---

## Risk Analysis

### High-Risk Areas

#### Risk 1: LLM API Rate Limiting / Quality
- **Impact**: Commentary generation fails or produces low-quality output
- **Probability**: Medium
- **Mitigation**: Implement retry logic, rate limiting, output validation
- **Contingency**: Use fallback model (Gemini → Claude or vice versa), manually review and edit output
- **Affected steps**: Step 4, Step 7, Step 8

#### Risk 2: Artwork Selection Quotas Not Met
- **Impact**: Final artwork list doesn't meet diversity/temporal/geographic targets
- **Probability**: Medium
- **Mitigation**: Iterative refinement of LLM prompts, manual adjustments, clear validation
- **Contingency**: Manual curation to fill gaps, accept slight deviation from strict quotas
- **Affected steps**: Step 4

#### Risk 3: Image Download Failures
- **Impact**: Some artworks lack images
- **Probability**: Medium
- **Mitigation**: Robust error handling, retry logic, fallback to alternative sources
- **Contingency**: Use placeholder images, manually source missing images
- **Affected steps**: Step 6

### Medium-Risk Areas

#### Risk 4: Database Schema Changes Required
- **Impact**: Need to modify schema mid-implementation
- **Probability**: Low-Medium
- **Mitigation**: Thorough design review before implementation, migration system supports changes
- **Contingency**: Write new migration, backup database before applying
- **Affected steps**: Step 2

#### Risk 5: Next.js SSR / Client-Side Data Fetching
- **Impact**: Performance issues, hydration errors
- **Probability**: Low-Medium
- **Mitigation**: Follow Next.js best practices, test SSR vs CSR carefully
- **Contingency**: Adjust rendering strategy (SSR → CSR or vice versa)
- **Affected steps**: Step 11, Step 12, Step 13

## Rollback Points

### After Step 2 (Database Setup)
**Rollback procedure**:
1. Delete `data/artworks.db`
2. Delete `migrations/` directory
3. `git checkout HEAD -- scripts/lib/migrate.ts scripts/lib/db.ts`

### After Step 6 (Artworks Loaded)
**Rollback procedure**:
1. Delete `data/artworks.db`
2. Delete `data/images/`
3. Delete `data/artworks-final.json`
4. `git checkout HEAD -- scripts/lib/artwork_selection.ts scripts/select_artworks.ts`

### After Step 10 (Web UI Setup)
**Rollback procedure**:
1. Delete `web/` directory
2. `git checkout HEAD -- .`

### Full Rollback (Anytime)
**Procedure**:
1. `git checkout main`
2. `git branch -D feature/initial-implementation`
3. Delete `data/` directory contents (preserve directory structure)
4. `npm clean-install` (reset node_modules)

## Dependencies Between Steps

```
Step 1 (Project Init)
  └─> Step 2 (Database) ─┬─> Step 5 (Load Artworks) ─┬─> Step 11 (Web UI Home)
                         │                            ├─> Step 12 (Web UI Browse)
Step 3 (Seed List) ──────┤                            ├─> Step 13 (Web UI Detail)
                         │                            └─> Step 14 (Web UI Review)
                         │
                         └─> Step 4 (Artwork Selection)

Step 6 (Image Download) ─────────────────────────────> Step 13 (Artwork Detail)

Step 7 (Commentary LLM) ──┬──> Step 8 (Batch Generation) ──> Step 13 (Artwork Detail)
                          │
                          └──> Step 13 (Artwork Detail)

Step 9 (SM-2 Algorithm) ──────────────────────────────> Step 14 (Web UI Review)

Step 10 (Web UI Setup) ──────────────────────────────> All Web UI Steps (11-16)

Step 15 (Keyboard Shortcuts) ─────────────────────────> Step 16 (Polish)

Step 17 (Documentation) ──────────────────────────────> Step 18 (Final Testing)
```

**Critical path**: 1 → 2 → 4 → 5 → 10 → 11-14 → 18

**Parallelizable**:
- Step 3 (Seed List) can be done before/during Step 2
- Step 6 (Image Download) can be done after Step 5, parallel to Step 7
- Step 7 (Commentary) and Step 9 (SM-2) can be done in parallel

## Testing Strategy

### Unit Tests
- Step 2: Database access layer functions
- Step 4: Artwork selection scoring formulas
- Step 9: SM-2 algorithm calculations
- Coverage expectation: 80%+ for critical business logic

### Integration Tests
- Step 5: Load artworks from JSON → database
- Step 7: Commentary generation end-to-end
- Step 14: Review submission → SM-2 update → database

### End-to-End Tests
Manual testing checklist (Step 18):
- [ ] Generate 10 candidate artworks via LLM
- [ ] Load artworks into database
- [ ] Download images for 5 artworks
- [ ] Generate commentary for 5 artworks
- [ ] Browse library, use filters and search
- [ ] View artwork detail page, verify commentary renders
- [ ] Complete review session (5 artworks)
- [ ] Verify review schedule updated correctly
- [ ] Test all keyboard shortcuts
- [ ] Toggle dark mode

### Regression Testing
N/A - Greenfield project, no existing features to regress

## Performance Considerations

**Expected impact**:
- Database queries: <50ms for Browse, <20ms for Review queue
- Image loading: Optimized (Next.js Image component)
- Commentary generation: 10-30 seconds per artwork (LLM latency)
- Client-side search: <100ms for 328 artworks

**Measurement**:
- Use `console.time()` for database queries
- Lighthouse performance score (target: ≥90)
- Network tab for image loading

**Acceptable range**:
- Browse page load: <2 seconds
- Detail page load: <1.5 seconds
- Review queue load: <1 second

## Documentation Updates

- [x] Create design doc for database schema
- [x] Create execution plan (this document)
- [ ] Update README.md with setup instructions
- [ ] Update CLAUDE.md if workflow changes
- [ ] Create example commentary file
- [ ] Document API keys setup in .env.example

## Success Criteria

- [ ] All execution steps completed
- [ ] All acceptance criteria from all requirement docs met
- [ ] Exactly 328 artworks in database
- [ ] Commentary generated for at least 50 artworks
- [ ] Web UI renders all 4 pages (Home, Browse, Detail, Review)
- [ ] SM-2 algorithm correctly updates review schedule
- [ ] Dark mode works
- [ ] Keyboard shortcuts work
- [ ] All tests pass (or N/A if no tests written yet)
- [ ] No TypeScript errors
- [ ] Lighthouse scores: Performance ≥90, Accessibility ≥90
- [ ] Documentation complete

## Timeline

**Estimated total time**: ~35-40 hours

**Breakdown**:
- Project setup & database: ~4 hours
- Artwork selection: ~6 hours
- Commentary system: ~6 hours
- Web UI: ~14 hours
- Polish, testing, docs: ~6 hours
- Buffer for issues: ~4-6 hours

**Target completion**: Depends on work schedule (e.g., 1 week full-time, 2-3 weeks part-time)

## Notes

- LLM API calls will be the slowest part (rate limiting, latency)
- Artwork selection may require iteration to meet quotas
- Web UI polish is ongoing (can iterate after initial implementation)
- Commentary quality may need manual review and editing

## Completion Checklist

- [ ] All execution steps completed
- [ ] All verification criteria met
- [ ] All tests passing (or N/A)
- [ ] Code reviewed (self-review with working protocols)
- [ ] Documentation updated
- [ ] PR created and linked
- [ ] Changes committed to feature branch

## Post-Execution Review

**Actual completion date**: _TBD_

**Actual time spent**: _TBD_

**Issues encountered**: _TBD_

**Lessons learned**: _TBD_

**Follow-up tasks**: _TBD_
