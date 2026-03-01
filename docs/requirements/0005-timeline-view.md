# Requirement: Timeline-Based View with Art Eras

**Document ID:** 0005
**Status:** Draft
**Created:** 2026-03-01
**Task Size:** Large

---

## Problem Statement

The current artwork browsing experience is a flat grid view with category filters. Users cannot:
- Understand artworks in historical/chronological context
- Learn about art movements and their evolution over time
- See relationships between works from the same era
- Navigate artworks through a timeline interface

A timeline-based view would provide:
- Chronological visualization of artworks spanning centuries
- Era/period introductions (Renaissance, Baroque, Modern, etc.)
- Historical context for understanding art evolution
- Interactive navigation by time period

---

## Requirements

### Functional Requirements

**FR1: Era Data Model**
- Define canonical art eras/periods with date ranges
- Store era metadata: name, time range, key characteristics, major artists
- Associate artworks with eras (via period/movement fields or new mapping)
- Support overlapping eras (movements can span multiple periods)

**FR2: Timeline Page**
- New route: `/timeline`
- Chronological visualization showing all eras from ancient to contemporary
- Each era displayed as a card/section with:
  - Era name and date range
  - Brief introduction (200-300 words)
  - Count of artworks in collection from this era
  - Representative thumbnail images

**FR3: Era Detail View**
- Click era → expand to show detailed introduction
- Historical context, key characteristics, major artists/works
- Grid of all artworks from this era in the collection
- Navigate between eras (previous/next)

**FR4: Era Introductions (LLM-Generated)**
- Generate introduction text for each era using LLM (Gemini/Claude)
- Content structure:
  - Historical timeframe and geographic scope
  - Defining characteristics and innovations
  - Major artists and representative works
  - Cultural/social/political context
  - Influence on subsequent movements
- Store as Markdown files in `data/eras/`
- Include metadata: generation date, model, prompt version

**FR5: Artwork-Era Associations**
- Map artworks to eras based on existing `period` or `movement` fields
- Support artworks spanning multiple eras (e.g., transitional works)
- Fallback: calculate era from `year` field if period/movement missing

**FR6: Navigation Integration**
- Add "Timeline" link to main navigation header
- Show era context on artwork detail pages ("This work is from the [Era]")
- Link from artwork to its era detail view

### Non-Functional Requirements

**NFR1: Performance**
- Timeline page loads in <2s (minimal data)
- Era detail view loads in <1s (query artworks by era)
- No pagination needed (total dataset is ~328 works)

**NFR2: Data Quality**
- Era definitions aligned with authoritative art history sources
- Introduction text factually accurate (use RAG with Wikipedia/museum sources)
- Clear provenance for all LLM-generated content

**NFR3: UX**
- Responsive timeline visualization (desktop + mobile)
- Clear visual hierarchy (ancient → contemporary flow)
- Keyboard navigation support (arrow keys to navigate eras)

---

## Out of Scope

- Interactive timeline visualization (e.g., draggable slider, zoom)
- User-defined custom eras or filters
- Artwork comparison tools across eras
- Quiz/learning modes for eras
- Animations or complex transitions between eras

---

## Success Criteria

1. Users can browse artworks by historical era via `/timeline` page
2. Each era has a high-quality introduction (200-300 words)
3. Artworks correctly associated with eras based on period/movement/year
4. Era detail views show all relevant artworks from collection
5. Navigation between eras is intuitive (prev/next buttons, clickable cards)
6. Generated content includes provenance metadata

---

## Data Model

### Proposed Era Schema

Two options:

**Option A: File-Based (Simpler)**
- Eras defined in `data/eras/eras.json` as canonical list
- Introductions as Markdown files in `data/eras/{era-slug}.md`
- Artwork-era mapping via queries on existing `period`/`movement` fields

**Option B: Database Table (More Robust)**
- New `eras` table: `id`, `name`, `start_year`, `end_year`, `slug`, `description`, `introduction_path`
- New `artwork_era` junction table: `artwork_id`, `era_id`
- Supports many-to-many relationships

**Recommendation:** Option A for MVP (simpler, aligns with file-based commentary pattern)

### Canonical Eras (Draft List)

1. **Ancient Art** (~30,000 BCE - 500 CE)
2. **Medieval Art** (500 - 1400)
3. **Renaissance** (1400 - 1600)
4. **Baroque** (1600 - 1750)
5. **Neoclassicism & Romanticism** (1750 - 1850)
6. **Realism & Impressionism** (1850 - 1900)
7. **Modern Art** (1900 - 1970)
   - Cubism, Surrealism, Abstract Expressionism, etc.
8. **Contemporary Art** (1970 - Present)
   - Postmodernism, Conceptual Art, Digital Art, etc.

(Exact list to be refined in design phase)

---

## Technical Constraints

- **LLM Integration:** Use existing Gemini API (free tier) for era introductions
- **Prompt Template:** Create `scripts/prompts/era-introduction-v1.md`
- **Storage:** Markdown files in `data/eras/` (consistent with commentary pattern)
- **UI:** Next.js pages with static generation where possible
- **Data:** Leverage existing `period`, `movement`, `year` fields

---

## Dependencies

- Database schema: `scripts/migrate.ts` (existing artworks table)
- Existing artwork metadata: `period`, `movement`, `year` fields
- LLM integration: `scripts/lib/llm.ts`
- Web UI: Next.js App Router pages

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Inconsistent era naming in artwork data | High | Normalize period/movement fields; define mapping rules |
| LLM-generated content quality varies | Medium | Use RAG + strict prompt template; manual review of output |
| Artworks missing period/movement metadata | Medium | Calculate era from `year` field as fallback |
| Scope creep (complex timeline visualizations) | Low | Stick to simple card-based layout for MVP |

---

## Implementation Approach

### Phase 1: Data Foundation
1. Define canonical era list with date ranges
2. Create era JSON schema
3. Write LLM prompt template for era introductions
4. Generate introduction content for all eras

### Phase 2: Artwork-Era Mapping
1. Analyze existing `period`/`movement` values across all artworks
2. Create mapping logic: period/movement → era
3. Add helper query functions to get artworks by era

### Phase 3: UI Implementation
1. Create `/timeline` page with era cards
2. Create `/timeline/[slug]` page for era detail
3. Add era context to artwork detail pages
4. Update navigation header with Timeline link

### Phase 4: Testing & Refinement
1. Verify all artworks mapped to correct eras
2. Review LLM-generated content quality
3. Test navigation and UX flows
4. Performance optimization

---

## Related Documents

- Database schema: `scripts/lib/db.ts`
- LLM integration: `scripts/lib/llm.ts`
- Commentary generation (similar pattern): `scripts/generate_commentary.ts`
- Seed artwork data: `data/artworks-mock.json`

---

## Open Questions

1. **Era granularity:** Should we use coarse eras (8-10 total) or fine-grained periods (20+)?
   - **Recommendation:** Coarse for MVP, can refine later

2. **Artwork with multiple eras:** How to handle transitional works (e.g., Post-Impressionism)?
   - **Recommendation:** Allow multiple era associations, show in both

3. **Architecture/Sculpture eras:** Different from painting eras (e.g., Gothic, Brutalism)?
   - **Recommendation:** Use unified eras, but mention category-specific notes in introductions

4. **Sorting within era:** By year, or by movement, or alphabetical?
   - **Recommendation:** Chronological (by year) within each era
