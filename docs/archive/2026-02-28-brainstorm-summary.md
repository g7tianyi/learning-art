# Brainstorming Session Summary

**Date**: 2026-02-28
**Topic**: Learning Art - Design Review & Commentary System

---

## 1. UI/UX Design References

### Beautiful, Calm Art Websites for Inspiration

**Museum Websites (Minimalist & Elegant):**
- **MoMA**: https://moma.org - Magazine layout, generous whitespace, clean typography
- **National Gallery (London)**: https://nationalgallery.org.uk - Minimalist, subtle interactions
- **National Museum of Asian Art**: https://asia.si.edu - Modern minimal with full-width hero images
- **British Museum**: https://britishmuseum.org - White on black, elegant contrast, smooth animations
- **Mauritshuis**: https://mauritshuis.nl - Dutch Golden Age aesthetic, serif fonts, refined palette

**Design Inspiration Galleries:**
- **Minimal Gallery**: https://minimal.gallery - Curated minimalist design
- **Siiimple**: https://siiimple.com - Hand-picked minimal websites
- **Google Arts & Culture**: https://artsandculture.google.com - Image-focused navigation

### Design Principles to Apply

**Typography:**
- Serif titles: Playfair Display, Source Serif Pro, Merriweather
- Sans-serif body: Inter, Helvetica Neue, SF Pro
- Line spacing: 1.6-1.8 for breathing room

**Color Palette (Wabi-Sabi Inspired):**
- Light mode: Soft whites (#FEFEFE), warm grays (#F5F5F0), earth tones
- Dark mode: Deep charcoal (#1A1A1A), warm blacks (#0D0D0D)
- Accents: Muted ochre, sage green, dusty rose (low saturation, calming)

**Layout:**
- Whitespace: Minimum 60-80px section padding
- Asymmetric but balanced grid (Japanese aesthetic)
- Full-bleed or generous image margins
- Slow transitions (300-400ms), gentle easing

**Interaction:**
- Micro-animations: Fade-ins, gentle parallax, subtle hover states
- Keyboard shortcuts: Vim-style (j/k for next/prev, / for search)
- Smooth scroll, section snapping

---

## 2. Commentary Generation System

### Architecture Decisions

**File-Based Storage (Not SQLite)**
- **Location**: `data/commentary/{category}/{id}-{slug}.md`
- **Format**: Markdown with YAML-style metadata footer
- **Benefits**: Version control friendly, human-readable, easily editable
- **Provenance**: Tracks model, prompt version, generation date, edit status

**6-Dimension Commentary Structure**

1. **Art & Technique**: Visual analysis, composition, materials, influences
2. **Historical Context**: When/where created, political climate, art movements
3. **Social & Cultural Impact**: Reproductions, parodies, shifting meanings
4. **Economics**: Patronage, sales history, market implications
5. **Psychology**: Artist's mental state, viewer response, therapeutic aspects
6. **Philosophy**: Existential themes, aesthetics, enduring questions

**Depth Target**: ~600-800 words total (medium depth)
- Detailed enough to be educational
- Concise enough to avoid overwhelming
- Can be manually expanded by user

### Generation Strategy

**RAG-Enhanced Accuracy**
1. Fetch Wikipedia summary for artwork
2. Fetch museum collection page (if available)
3. Build context bundle with authoritative sources
4. LLM generates commentary following strict template
5. Citations required for factual claims
6. Sources listed at end of each file

**Quality Guardrails**
- No AI-isms ("delve," "realm," "tapestry")
- Specific details over generic observations
- Acknowledge uncertainty when applicable
- Interconnect dimensions (reference across sections)
- Include "Key observation" highlighting non-obvious details

### Files Created

1. **Prompt Template**: `scripts/prompts/commentary-generation-v1.md`
   - Comprehensive guidelines for all 6 dimensions
   - Output format specification
   - Quality checklist
   - Example prompts

2. **Commentary Library**: `scripts/lib/commentary.ts`
   - TypeScript types for Artwork, Commentary, Metadata
   - RAG functions (Wikipedia, museum fetching)
   - LLM integration (placeholder for Claude/Gemini API)
   - File I/O operations
   - Batch generation with rate limiting

3. **CLI Script**: `scripts/generate_commentary.ts`
   - Single artwork: `--id 1`
   - All artworks: `--all`
   - By category: `--category paintings`
   - Force regenerate: `--force`
   - Batch processing: `--batch 10 --delay 2000`

4. **Example Output**: `data/commentary/paintings/0001-starry-night-example.md`
   - Real 6-dimension commentary for "The Starry Night"
   - Demonstrates tone, depth, structure
   - ~1800 words (deeper than target, shows maximum detail)

---

## 3. Key Design Questions Resolved

### User Clarifications

**Q1: What are users memorizing/learning?**
- **A**: Deeper understanding beyond name/artist - all 6 dimensions of context

**Q2: How is commentary generated?**
- **A**: LLM (Claude preferred) with RAG enhancement from Wikipedia/museums

**Q3: Review session UX?**
- **A**: Deferred (to be designed in UI implementation phase)

**Q4: Commentary depth?**
- **A**: Medium (~600-800 words), manually expandable

**Q5: Generation strategy?**
- **A**: Pre-generate for "canonical" works, on-demand for others

**Q6: File naming?**
- **A**: Numeric prefix (`0001-starry-night.md`) for clean DB → file mapping

**Q7: Provenance tracking?**
- **A**: Yes, metadata footer in every file

**Q8: User editable?**
- **A**: Yes, `humanEdited` flag tracks modifications

**Q9: Multi-source synthesis?**
- **A**: RAG + citations required for accuracy

---

## 4. Gaps & Open Questions

### Still To Design

**UI/UX Implementation**
- Review session interaction patterns (Q&A? Free recall? Progressive reveal?)
- Search/filter interface design
- Artwork detail page layout (commentary display, collapsible sections)
- Dark mode toggle, keyboard shortcut overlay
- Mobile responsive breakpoints

**Data Model**
- SQLite schema (artworks, reviews, user_notes, relationships)
- SM-2 algorithm implementation for review scheduling
- Relationship types (influence, movement, theme, period)

**Review Mechanics**
- What specifically to quiz users on?
- Success metrics (what counts as "learned"?)
- Adaptive review based on weak dimensions

**Visual Features**
- Relationship graph visualization ("constellation view")
- Image detail study (zoom, multiple angles for sculptures)
- Comparative study mode (side-by-side)
- Color palette extraction from artworks

**Technical**
- Actual LLM API integration (Claude/Gemini)
- Wikipedia API implementation
- Museum page scraping (MoMA, Met, etc.)
- Image download & quality validation
- Offline-first strategy (progressive download vs. bulk)

---

## 5. Suggested Next Steps

### Phase 1: Data Foundation
1. Define SQLite schema
2. Implement artwork selection script (Gemini API)
3. Implement metadata ingestion (Wikimedia API)
4. Generate initial commentary for 20-30 "greatest hits"

### Phase 2: Commentary System
1. Implement actual LLM API calls (Claude/Gemini)
2. Implement RAG fetching (Wikipedia, museums)
3. Test commentary generation on 5-10 artworks
4. Refine prompt template based on output quality

### Phase 3: UI Foundation
1. Set up Next.js project structure
2. Design component system (Tailwind + shadcn/ui)
3. Implement Home dashboard (minimal version)
4. Implement Artwork detail page (read commentary from file)

### Phase 4: Review System
1. Implement SM-2 algorithm
2. Design review session UX
3. Implement review queue generation
4. Test with personal usage

### Phase 5: Polish
1. Dark mode
2. Keyboard shortcuts
3. Search/filter
4. Relationship visualization
5. Performance optimization

---

## 6. Resources Created

### Documentation
- `CLAUDE.md` - Repository guide (updated with commentary system)
- `BRAINSTORM_SUMMARY.md` - This file
- `scripts/prompts/commentary-generation-v1.md` - LLM prompt template

### Code
- `scripts/lib/commentary.ts` - Commentary generation library
- `scripts/generate_commentary.ts` - CLI script

### Examples
- `data/commentary/paintings/0001-starry-night-example.md` - Sample output

### Design References
- Museum websites listed above
- Design principles documented in this file

---

## 7. Philosophy & Tone

The system embodies:
- **Calm exploration** over gamification
- **Depth over breadth** - 328 works, deeply understood
- **Interconnected knowledge** - dimensions reference each other
- **Provenance & accuracy** - always cite sources
- **Human-editable** - AI assists, user refines
- **Beautiful presentation** - worthy of the art itself

This is a **personal knowledge garden**, not a quiz app. The goal is cultivating genuine appreciation and understanding, not optimizing for test scores.

---

**Status**: Brainstorming phase complete. Ready to begin implementation when ready.
