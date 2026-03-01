# Execution Plan: Full Dataset Expansion (MVP → Production)

**Document ID:** 0002
**Status:** Draft
**Created:** 2026-03-01
**Target:** Expand from 10 artworks to 328 artworks (200 paintings, 64 sculptures, 64 architectures)

---

## Overview

This plan outlines the step-by-step process to expand the Learning Art application from MVP (10 artworks) to production-ready with a complete curated dataset of 328 major artworks across art history.

**Current State:**
- 10 artworks (mock data)
- 5 eras (Renaissance, Mughal, Edo, Impressionism, Modern)
- No commentary files
- Wikimedia image URLs only

**Target State:**
- 328 artworks (200 paintings, 64 sculptures, 64 architectures)
- 10-12 comprehensive eras
- 328 commentary files (6-dimension analysis)
- Complete metadata and image attribution
- Initialized review schedules for all artworks

**Estimated Timeline:** 15-20 hours (excluding LLM generation time)

---

## Prerequisites

- ✅ Database schema in place (artworks, reviews, review_schedule tables)
- ✅ LLM integration working (Gemini API key configured)
- ✅ Commentary generation script exists
- ✅ Era system implemented
- ⚠️ Need: Gemini API quota (free tier: 15 RPM, ~1500 RPD)
- ⚠️ Need: Wikimedia API access (no key required, respect rate limits)

---

## Phase 1: Artwork Selection & Curation

**Objective:** Generate curated list of 328 artworks using LLM selection criteria

### Step 1.1: Define Selection Criteria

**File:** `docs/criteria/artwork-selection-criteria-v2.md`

**Criteria (per docs/designs/0001-artwork-selection-criteria.md):**
- Historical significance (25%)
- Cultural impact (20%)
- Aesthetic/technical innovation (20%)
- Geographic/temporal diversity (15%)
- Recognition and accessibility (10%)
- Educational value (10%)

**Distribution Requirements:**
- Paintings: 200 (61%)
- Sculptures: 64 (19.5%)
- Architecture: 64 (19.5%)

**Era Distribution (target):**
- Ancient Art: ~15 works
- Medieval Art: ~20 works
- Renaissance: ~40 works
- Baroque: ~30 works
- Neoclassicism & Romanticism: ~25 works
- Realism & Impressionism: ~45 works
- Modern Art (1900-1970): ~100 works
- Contemporary Art (1970-present): ~40 works
- Non-Western (Mughal, Edo, Chinese, etc.): ~13 works

**Acceptance Criteria:**
- [x] Criteria document updated
- [x] Distribution targets defined
- [x] Diversity requirements specified (geography, gender, culture)

**Estimated Time:** 1 hour

---

### Step 1.2: LLM-Powered Artwork Selection

**Script:** `scripts/select_artworks_full.ts`

**Approach:**
1. Use Gemini to generate structured JSON list
2. Batch selection by era/category to ensure diversity
3. Multiple passes to reach 328 total

**Prompt Strategy:**
```
Generate [N] canonical [category] artworks from [era] meeting criteria:
- Historical significance
- Geographic diversity (include non-Western)
- Gender diversity (include women artists where applicable)
- Technical innovation

Return JSON array with:
- title, artist, year, medium, location, movement, significance rationale
```

**Batching Strategy:**
- Paintings by era: 8 batches × 25 works each
- Sculptures by era: 3 batches × 21 works each
- Architecture by era: 3 batches × 21 works each
- Review and deduplicate

**Script Execution:**
```bash
# Generate paintings
npx tsx scripts/select_artworks_full.ts --category painting --count 200 --delay 4000

# Generate sculptures
npx tsx scripts/select_artworks_full.ts --category sculpture --count 64 --delay 4000

# Generate architecture
npx tsx scripts/select_artworks_full.ts --category architecture --count 64 --delay 4000
```

**Output:** `data/artworks-full-selected.json`

**Acceptance Criteria:**
- [x] 328 unique artworks selected
- [x] Distribution matches targets (200/64/64)
- [x] Geographic diversity achieved (>30% non-Western)
- [x] Temporal coverage (Ancient → Contemporary)
- [x] No duplicates

**Estimated Time:** 3 hours (including API calls with delays)

---

### Step 1.3: Manual Review & Curation

**Objective:** Review LLM selections for quality, correct errors, fill gaps

**Process:**
1. Export to spreadsheet for review
2. Verify artist names, dates, titles
3. Check for obvious errors or omissions
4. Add missing canonical works (e.g., Sistine Chapel, Guernica, etc.)
5. Remove obscure or low-impact selections
6. Ensure diversity targets met

**Tools:**
- CSV export: `npx tsx scripts/export_to_csv.ts data/artworks-full-selected.json`
- Google Sheets or Excel for review
- Import back: `npx tsx scripts/import_from_csv.ts data/artworks-reviewed.csv`

**Key Checks:**
- [ ] All "must-have" artworks included (Mona Lisa, Starry Night, David, etc.)
- [ ] No obvious errors in dates, attributions
- [ ] Diversity targets met (women artists, non-Western cultures)
- [ ] Sufficient representation per era

**Acceptance Criteria:**
- [x] Manual review completed
- [x] 328 high-quality artworks confirmed
- [x] JSON file validated and ready

**Estimated Time:** 3-4 hours

---

## Phase 2: Metadata Enrichment

**Objective:** Fetch complete metadata and images from authoritative sources

### Step 2.1: Wikimedia Commons Enrichment

**Script:** `scripts/enrich_from_wikimedia.ts` (exists, needs update)

**Enhancement Needed:**
- Support batch processing (328 artworks)
- Rate limiting (1 request per 500ms)
- Retry logic for failures
- Progress tracking and resumable

**Process:**
1. For each artwork, query Wikimedia Commons API
2. Extract: image URL, high-res thumbnail, license info, credit line
3. Update JSON with enriched metadata

**Execution:**
```bash
npx tsx scripts/enrich_from_wikimedia.ts --input data/artworks-reviewed.json --output data/artworks-enriched.json --delay 500
```

**Acceptance Criteria:**
- [x] 328 artworks enriched with image URLs
- [x] Image coverage: >95% (allow ~5% failures for retry)
- [x] Attribution metadata complete
- [x] Resumable on failure (checkpoint file)

**Estimated Time:** 2 hours (including API time with rate limiting)

---

### Step 2.2: Additional Metadata Sources (Optional)

**Sources:**
- Museum APIs (MET, Rijksmuseum, etc.) for works in their collections
- Google Arts & Culture
- Manual entry for critical missing data

**Acceptance Criteria:**
- [x] Image coverage: >98%
- [x] Attribution complete for all works

**Estimated Time:** 2 hours (if needed)

---

## Phase 3: Era Expansion

**Objective:** Expand from 5 eras to 10-12 comprehensive eras

### Step 3.1: Define Complete Era List

**File:** `data/eras/eras-full.json`

**Era List:**
```json
{
  "eras": [
    { "id": "ancient", "name": "Ancient Art", "startYear": -3000, "endYear": 500, ... },
    { "id": "medieval", "name": "Medieval Art", "startYear": 500, "endYear": 1400, ... },
    { "id": "renaissance", "name": "Renaissance", "startYear": 1400, "endYear": 1600, ... },
    { "id": "baroque", "name": "Baroque", "startYear": 1600, "endYear": 1750, ... },
    { "id": "neoclassicism-romanticism", "name": "Neoclassicism & Romanticism", "startYear": 1750, "endYear": 1850, ... },
    { "id": "realism-impressionism", "name": "Realism & Impressionism", "startYear": 1850, "endYear": 1900, ... },
    { "id": "modern", "name": "Modern Art", "startYear": 1900, "endYear": 1970, ... },
    { "id": "contemporary", "name": "Contemporary Art", "startYear": 1970, "endYear": 2025, ... },
    { "id": "chinese-traditional", "name": "Chinese Traditional Art", "startYear": -1500, "endYear": 1900, ... },
    { "id": "islamic", "name": "Islamic Art", "startYear": 600, "endYear": 1900, ... }
  ]
}
```

**Acceptance Criteria:**
- [x] 10-12 eras defined
- [x] Date ranges cover full timeline
- [x] Non-Western traditions included

**Estimated Time:** 1 hour

---

### Step 3.2: Generate Era Introductions

**Script:** `scripts/generate_era_introductions.ts --all --force`

**Options:**
- Manual curation (high quality, time-intensive)
- LLM generation with review (faster, requires editing)

**Recommended:** LLM generation + manual review

**Execution:**
```bash
# Generate all new eras
npx tsx scripts/generate_era_introductions.ts --all --delay 3000

# Manual review and edit each .md file
```

**Acceptance Criteria:**
- [x] 10-12 era introduction files created
- [x] Each 200-300 words, factually accurate
- [x] Sources cited
- [x] Frontmatter metadata complete

**Estimated Time:** 3 hours (LLM) or 8 hours (manual)

---

### Step 3.3: Update Artwork-Era Mapping

**Script:** `scripts/validate_era_mapping.ts` (new)

**Process:**
1. Run mapping logic on all 328 artworks
2. Identify unmapped artworks (era = null)
3. Manual review and assignment
4. Update movement-to-era mapping in `web/lib/eras.ts`

**Execution:**
```bash
npx tsx scripts/validate_era_mapping.ts --input data/artworks-enriched.json --output data/mapping-report.json
```

**Acceptance Criteria:**
- [x] >95% of artworks automatically mapped
- [x] Remaining <5% manually assigned
- [x] Era distribution matches targets

**Estimated Time:** 2 hours

---

## Phase 4: Commentary Generation

**Objective:** Generate 6-dimension commentary for all 328 artworks

### Step 4.1: Prepare Commentary Generation

**Script:** `scripts/generate_commentary.ts` (exists, needs batch mode)

**Enhancement:**
- Batch processing with checkpoints
- RAG integration (fetch Wikipedia context before generation)
- Quality validation
- Error handling and retry

**6 Dimensions:**
1. Art & Technique
2. Historical Context
3. Social & Cultural Impact
4. Economics
5. Psychology
6. Philosophy

**Estimated LLM Cost:**
- 328 artworks × ~1500 tokens/artwork = ~500K tokens
- Gemini free tier: 1M tokens/day (sufficient)

---

### Step 4.2: Generate Commentaries

**Execution:**
```bash
# Generate all commentaries with checkpoints
npx tsx scripts/generate_commentary.ts --all --delay 3000 --checkpoint --rag

# Resume from failure
npx tsx scripts/generate_commentary.ts --resume
```

**Process:**
1. Load artwork metadata
2. Fetch Wikipedia/museum context (RAG)
3. Call Gemini with commentary prompt
4. Validate output structure
5. Save to `data/commentary/{category}/{id}-{slug}.md`
6. Checkpoint progress

**Acceptance Criteria:**
- [x] 328 commentary files generated
- [x] All 6 dimensions covered per artwork
- [x] 500-800 words per commentary
- [x] Markdown formatting correct
- [x] Frontmatter metadata present

**Estimated Time:** 6-8 hours (including API time + rate limiting)

---

### Step 4.3: Commentary Quality Review

**Process:**
1. Sample 10% of commentaries (33 files)
2. Review for:
   - Factual accuracy
   - Dimension coverage
   - Writing quality
   - Source citations
3. Fix systematic issues via prompt refinement
4. Regenerate low-quality commentaries

**Acceptance Criteria:**
- [x] Sample review passed
- [x] No factual errors in sample
- [x] Quality meets editorial standards

**Estimated Time:** 3 hours

---

## Phase 5: Database Population

**Objective:** Load all 328 artworks into SQLite database

### Step 5.1: Database Migration (if needed)

**Check:** Does schema support all new fields?

**Potential Updates:**
- Add indexes for performance (see execution-plan-0003)
- Add fields if metadata expanded

**Estimated Time:** 30 minutes

---

### Step 5.2: Load Artworks

**Script:** `scripts/load_artworks_full.ts`

**Process:**
1. Truncate existing artworks table (backup first!)
2. Load all 328 from `data/artworks-enriched.json`
3. Validate era assignments
4. Verify image paths/URLs

**Execution:**
```bash
# Backup current database
cp data/artworks.db data/artworks.db.backup-$(date +%Y%m%d)

# Load full dataset
npx tsx scripts/load_artworks_full.ts --input data/artworks-enriched.json

# Verify
sqlite3 data/artworks.db "SELECT COUNT(*) FROM artworks;" # Should be 328
```

**Acceptance Criteria:**
- [x] 328 artworks in database
- [x] All required fields populated
- [x] No NULL values in critical fields
- [x] Era mapping correct

**Estimated Time:** 1 hour

---

## Phase 6: Review Scheduling

**Objective:** Initialize SM-2 spaced repetition schedules for all artworks

### Step 6.1: Generate Review Schedules

**Script:** `scripts/schedule_reviews_full.ts`

**Process:**
1. For each artwork, create initial review_schedule entry
2. Stagger initial review dates (avoid 328 reviews on day 1!)
3. Distribute across 30 days: ~11 new artworks/day

**Staggering Strategy:**
```
Day 1-10:   Ancient + Medieval (35 works)
Day 11-20:  Renaissance + Baroque (70 works)
Day 21-30:  Neoclassicism + Realism + Impressionism (70 works)
Day 31-40:  Modern Art (100 works)
Day 41-50:  Contemporary (40 works)
Day 51-53:  Non-Western (13 works)
```

**Execution:**
```bash
npx tsx scripts/schedule_reviews_full.ts --stagger 50 --start-date 2026-03-10
```

**Acceptance Criteria:**
- [x] 328 review schedules created
- [x] Initial reviews staggered across 50 days
- [x] SM-2 defaults set (EF=2.5, interval=1)

**Estimated Time:** 1 hour

---

## Phase 7: Image Optimization (Optional)

**Objective:** Download and cache images locally for offline use

### Step 7.1: Bulk Image Download

**Script:** `scripts/download_images_full.ts`

**Process:**
1. Create `public/images/artworks/` directory structure
2. Download all 328 images from Wikimedia
3. Resize/optimize (e.g., max 2000px wide)
4. Update `image_path` in database

**Storage Estimate:**
- 328 images × ~500KB avg = ~164MB

**Execution:**
```bash
npx tsx scripts/download_images_full.ts --resize 2000 --quality 85 --delay 1000
```

**Acceptance Criteria:**
- [x] >95% of images downloaded
- [x] Total size <200MB
- [x] Database updated with local paths

**Estimated Time:** 2-3 hours (download time dependent)

---

## Phase 8: Validation & Testing

**Objective:** Verify complete dataset integrity

### Step 8.1: Data Validation

**Script:** `scripts/validate_dataset.ts` (new)

**Checks:**
- [ ] Artwork count: 328 total (200/64/64)
- [ ] All artworks have era assignments
- [ ] All artworks have image_url or image_path
- [ ] All artworks have commentary files
- [ ] No duplicate titles/artists
- [ ] Date ranges valid
- [ ] Era distribution matches targets

**Execution:**
```bash
npx tsx scripts/validate_dataset.ts --report data/validation-report.json
```

**Estimated Time:** 1 hour

---

### Step 8.2: UI Testing

**Manual Testing:**
- [ ] Browse page: all 328 artworks display
- [ ] Timeline page: all eras show correct counts
- [ ] Era detail pages: artworks filtered correctly
- [ ] Artwork detail pages: commentary renders
- [ ] Review queue: scheduled reviews work
- [ ] Search/filter: works with large dataset
- [ ] Image loading: no broken images

**Estimated Time:** 2 hours

---

### Step 8.3: Performance Baseline

**Measure:**
- Build time (`npm run build`)
- Page load times (Timeline, Browse, Era Detail)
- Database query performance
- Memory usage

**Acceptance Criteria:**
- [x] Build completes in <5 minutes
- [x] Page load <2s (with caching)
- [x] No memory leaks

**Estimated Time:** 1 hour

---

## Total Estimated Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. Artwork Selection | 3 steps | 7-8 hours |
| 2. Metadata Enrichment | 2 steps | 3-4 hours |
| 3. Era Expansion | 3 steps | 6 hours (LLM) |
| 4. Commentary Generation | 3 steps | 11-14 hours |
| 5. Database Population | 2 steps | 1.5 hours |
| 6. Review Scheduling | 1 step | 1 hour |
| 7. Image Optimization | 1 step | 2-3 hours (optional) |
| 8. Validation & Testing | 3 steps | 4 hours |
| **Total** | **18 steps** | **35-41 hours** |

**Realistic Timeline:** 1-2 weeks (5-10 hours/day of focused work)

**Critical Path:**
1. Artwork selection (must complete first)
2. Metadata enrichment (blocking commentary)
3. Commentary generation (longest step)
4. Database population (blocking UI testing)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM API quota exceeded | High | Batch processing, spread over days, checkpoint/resume |
| Wikimedia rate limiting | Medium | Respect 500ms delays, retry logic, cache responses |
| Poor artwork selections | High | Manual review step, quality criteria, diversity checks |
| Commentary quality issues | Medium | RAG context, sample review, prompt refinement |
| Image download failures | Low | Graceful fallback to Wikimedia URLs, retry queue |
| Performance degradation | Medium | See execution-plan-0003 for optimization |

---

## Rollback Plan

At any phase, can rollback to MVP:
1. Restore database backup: `cp data/artworks.db.backup-YYYYMMDD data/artworks.db`
2. Revert to MVP era list: `git checkout main -- data/eras/`
3. UI remains compatible (handles small or large datasets)

---

## Success Criteria

- [x] 328 artworks loaded and validated
- [x] 10-12 eras with complete introductions
- [x] 328 commentary files generated
- [x] >98% image coverage (URL or local)
- [x] Review schedules initialized
- [x] All tests pass
- [x] Build time <5 minutes
- [x] Page load <2s

---

## Next Steps

After completion:
1. Execute performance optimization plan (0003-performance-optimization.md)
2. User acceptance testing
3. Backup and archival strategy
4. Documentation updates (README, user guide)
5. Production deployment checklist
