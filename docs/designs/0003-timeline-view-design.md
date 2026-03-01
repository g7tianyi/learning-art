# Design: Timeline-Based View with Art Eras

**Document ID:** 0003
**Status:** Draft
**Created:** 2026-03-01
**Related Requirement:** 0005-timeline-view.md

---

## Overview

This design document specifies the implementation of a chronological timeline view for browsing artworks by historical era. The system provides:

1. Canonical era definitions covering art history from antiquity to present
2. LLM-generated introductions for each era
3. Automatic artwork-era mapping based on existing metadata
4. Timeline UI with era cards and detail views

**Design Principles:**
- **File-based over database:** Consistent with commentary pattern (data/eras/)
- **Leverage existing data:** Use period/movement/year fields, no schema changes
- **Simple over complex:** Card-based layout, not interactive timeline visualization
- **Provenance-first:** All LLM content includes generation metadata

---

## Architecture

### 1. Data Layer

#### 1.1 Era Definitions (JSON)

**File:** `data/eras/eras.json`

```json
{
  "eras": [
    {
      "id": "ancient",
      "name": "Ancient Art",
      "slug": "ancient",
      "startYear": -3000,
      "endYear": 500,
      "description": "Art from ancient civilizations",
      "introductionPath": "data/eras/ancient.md",
      "color": "#8B4513"
    },
    {
      "id": "medieval",
      "name": "Medieval Art",
      "slug": "medieval",
      "startYear": 500,
      "endYear": 1400,
      "description": "European art from the fall of Rome to the Renaissance",
      "introductionPath": "data/eras/medieval.md",
      "color": "#4B0082"
    },
    ...
  ]
}
```

**Schema:**
- `id`: Unique identifier (string)
- `name`: Display name (string)
- `slug`: URL-safe identifier (string)
- `startYear`: Era start year, BCE as negative (number)
- `endYear`: Era end year (number)
- `description`: One-line summary (string)
- `introductionPath`: Path to Markdown introduction file (string)
- `color`: Hex color for UI theming (string, optional)

#### 1.2 Era Introductions (Markdown)

**Location:** `data/eras/{slug}.md`

**Structure:**
```markdown
---
id: renaissance
name: Renaissance
dateRange: "1400 - 1600"
generatedAt: "2026-03-01T10:30:00Z"
model: "gemini-1.5-pro"
promptVersion: "era-introduction-v1"
---

# Renaissance (1400 - 1600)

## Historical Context

[LLM-generated introduction, 200-300 words]

## Defining Characteristics

- [Key features of the era]
- [Artistic innovations]

## Major Artists & Works

- Leonardo da Vinci (1452-1519)
- Michelangelo (1475-1564)
- Raphael (1483-1520)

## Cultural Impact

[Influence on subsequent periods]

## Sources

- https://en.wikipedia.org/wiki/Renaissance
- [Museum citations]
```

#### 1.3 Artwork-Era Mapping Logic

**Mapping Strategy:**

1. **Primary:** Match `period` field directly to era names
   - "Renaissance" → `renaissance` era
   - "Modern" → `modern` era
   - "Mughal" → `other-traditions` era (non-European)

2. **Secondary:** Match `movement` field to era ranges
   - "Cubism" (1900s) → `modern` era
   - "Ukiyo-e" (17th-19th c.) → `edo-japan` era

3. **Fallback:** Calculate from `year` field
   - 1495 → falls in `renaissance` era (1400-1600)
   - 1889 → falls in `impressionism-post-impressionism` era (1850-1900)

**Implementation:**

```typescript
function getEraForArtwork(artwork: Artwork, eras: Era[]): Era | null {
  // 1. Direct period match
  const periodMatch = eras.find(era =>
    era.id === artwork.period?.toLowerCase().replace(/\s+/g, '-')
  );
  if (periodMatch) return periodMatch;

  // 2. Movement match (predefined mapping)
  const movementEraMap = {
    'cubism': 'modern',
    'surrealism': 'modern',
    'ukiyo-e': 'edo-japan',
    'mughal-architecture': 'mughal-india',
    'renaissance': 'renaissance',
    'post-impressionism': 'impressionism-post-impressionism',
    ...
  };
  const movementKey = artwork.movement?.toLowerCase().replace(/\s+/g, '-');
  const movementMatch = movementKey && eras.find(era => era.id === movementEraMap[movementKey]);
  if (movementMatch) return movementMatch;

  // 3. Year-based fallback
  const year = parseYear(artwork.year); // Handle ranges like "1495-1498"
  const yearMatch = eras.find(era => year >= era.startYear && year < era.endYear);
  return yearMatch || null;
}

function parseYear(yearStr: string | number): number {
  if (typeof yearStr === 'number') return yearStr;
  // Extract first year from ranges like "1495-1498" or "1503-1519"
  const match = yearStr.match(/^(-?\d+)/);
  return match ? parseInt(match[1]) : 0;
}
```

### 2. Canonical Era List

Based on art history conventions and current dataset:

| ID | Name | Years | Artworks in Dataset |
|----|------|-------|---------------------|
| `renaissance` | Renaissance | 1400 - 1600 | 3 (Mona Lisa, David, Last Supper) |
| `mughal-india` | Mughal India | 1526 - 1857 | 1 (Taj Mahal) |
| `edo-japan` | Edo Period Japan | 1603 - 1868 | 1 (Great Wave) |
| `impressionism-post-impressionism` | Impressionism & Post-Impressionism | 1860 - 1910 | 1 (Starry Night) |
| `modern` | Modern Art | 1900 - 1970 | 4 (Guernica, Persistence, Thinker, Fallingwater) |

**Additional eras (for future expansion):**
- `ancient` (Ancient Art, -3000 - 500)
- `medieval` (Medieval, 500 - 1400)
- `baroque` (Baroque, 1600 - 1750)
- `neoclassicism-romanticism` (Neoclassicism & Romanticism, 1750 - 1850)
- `contemporary` (Contemporary Art, 1970 - Present)

**Note on Non-European Traditions:**
- Mughal India, Edo Japan, and other cultural traditions get dedicated eras
- This respects global art history while maintaining chronological structure

### 3. UI/UX Design

#### 3.1 Timeline Page (`/timeline`)

**Layout:**

```
┌─────────────────────────────────────────┐
│  Timeline: Explore Art Through History │
│  [breadcrumb: Home > Timeline]          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Renaissance (1400 - 1600)              │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ img  │ │ img  │ │ img  │  3 works   │
│  └──────┘ └──────┘ └──────┘            │
│  European rebirth of classical...       │
│  [View Era Details →]                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Mughal India (1526 - 1857)             │
│  ┌──────┐                               │
│  │ img  │                    1 work     │
│  └──────┘                               │
│  Islamic art and architecture...        │
│  [View Era Details →]                   │
└─────────────────────────────────────────┘

... [more eras chronologically]
```

**Features:**
- Eras sorted chronologically (oldest first, or newest first based on toggle)
- Each era card shows:
  - Era name and date range
  - Up to 3 representative thumbnail images
  - Artwork count
  - Short description (first 100 chars of introduction)
  - Click anywhere on card → era detail view
- Keyboard navigation: Arrow keys to scroll between eras
- Empty state: "No artworks from this era in collection" (for future eras)

#### 3.2 Era Detail Page (`/timeline/[slug]`)

**Layout:**

```
┌─────────────────────────────────────────┐
│  Renaissance (1400 - 1600)              │
│  [← Back to Timeline]  [← Prev] [Next →]│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ## Historical Context                  │
│  [LLM-generated introduction]           │
│                                         │
│  ## Defining Characteristics            │
│  - Perspective and realism              │
│  - Humanism and individualism           │
│                                         │
│  ## Major Artists & Works               │
│  - Leonardo da Vinci...                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Artworks from this Era (3)             │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  Mona  │ │ David  │ │ Last   │      │
│  │  Lisa  │ │        │ │ Supper │      │
│  └────────┘ └────────┘ └────────┘      │
│  [Same grid layout as /browse]          │
└─────────────────────────────────────────┘
```

**Features:**
- Full introduction rendered from Markdown
- Grid of all artworks from this era (reuse `/browse` grid component)
- Navigation: Prev/Next buttons to adjacent eras (chronologically)
- Breadcrumb: Home > Timeline > [Era Name]

#### 3.3 Artwork Detail Enhancement

**Addition to `/works/[id]` page:**

```
┌─────────────────────────────────────────┐
│  Mona Lisa                              │
│  Leonardo da Vinci, 1503-1519           │
│                                         │
│  📜 This work is from the Renaissance   │
│     (1400 - 1600)                       │
│     [Learn about this era →]            │
└─────────────────────────────────────────┘
```

**Implementation:**
- Add era badge below artwork metadata
- Link to `/timeline/{era-slug}`
- Only show if artwork has associated era

#### 3.4 Navigation Header Update

Add "Timeline" link between "Browse" and "Review":

```
[Home]  [Browse]  [Timeline]  [Review]
```

### 4. LLM Integration

#### 4.1 Prompt Template

**File:** `scripts/prompts/era-introduction-v1.md`

```markdown
# Prompt: Art Era Introduction Generator

Generate a comprehensive introduction for the following art historical era:

**Era:** {era_name}
**Time Period:** {start_year} - {end_year}
**Geographic Scope:** {regions}

## Requirements

1. **Length:** 200-300 words total
2. **Structure:**
   - Historical Context (50-75 words)
   - Defining Characteristics (75-100 words)
   - Major Artists & Works (50-75 words)
   - Cultural Impact (25-50 words)

3. **Tone:** Educational, accessible, engaging
4. **Accuracy:** Use factual art historical information
5. **Citations:** Reference specific artworks, artists, dates

## Output Format

Return a Markdown document with the following structure:

```markdown
# {Era Name} ({Years})

## Historical Context

[Geographic and temporal scope, political/social context]

## Defining Characteristics

- [Key visual features]
- [Technical innovations]
- [Philosophical/cultural themes]

## Major Artists & Works

- Artist Name (dates): Notable works
- ...

## Cultural Impact

[Influence on subsequent movements, lasting legacy]
```

## Example Context for RAG

Use the following Wikipedia articles for factual grounding:
- https://en.wikipedia.org/wiki/{era_wikipedia_slug}
- [Museum collection pages]

## Constraints

- NO anachronisms or modern interpretations applied retroactively
- NO vague language ("some believe", "it is said")
- NO unsourced claims
- YES specific dates, names, places
- YES objective art historical facts
```

#### 4.2 Generation Script

**File:** `scripts/generate_era_introductions.ts`

**Process:**
1. Read `data/eras/eras.json`
2. For each era:
   - Load prompt template
   - Substitute era-specific values
   - Optional: Fetch Wikipedia content for RAG context
   - Call LLM API (Gemini)
   - Validate output format
   - Save to `data/eras/{slug}.md` with metadata frontmatter
3. Log generation results (success/failure, token usage)

**CLI Options:**
- `--era <slug>`: Generate single era
- `--all`: Generate all eras
- `--force`: Regenerate existing introductions
- `--delay <ms>`: Rate limit between API calls

### 5. Database/Storage

**NO DATABASE CHANGES REQUIRED.**

All data stored in flat files:
- `data/eras/eras.json` - Era definitions
- `data/eras/{slug}.md` - Era introductions
- Existing artworks table (no schema changes)

**Query functions (web/lib/db.ts):**

```typescript
// NEW: Get artworks by era
export function getArtworksByEra(eraId: string, eras: Era[]): Artwork[] {
  const artworks = getAllArtworks();
  const era = eras.find(e => e.id === eraId);
  if (!era) return [];

  return artworks.filter(artwork => {
    const artworkEra = getEraForArtwork(artwork, eras);
    return artworkEra?.id === eraId;
  });
}

// NEW: Get era statistics
export function getEraStats(eras: Era[]): { eraId: string; count: number }[] {
  const artworks = getAllArtworks();

  return eras.map(era => ({
    eraId: era.id,
    count: artworks.filter(a => getEraForArtwork(a, eras)?.id === era.id).length
  }));
}
```

### 6. Component Structure

**New Components:**

```
web/
├── app/
│   ├── timeline/
│   │   ├── page.tsx              # Timeline list view
│   │   └── [slug]/
│   │       └── page.tsx          # Era detail view
│   └── works/[id]/
│       └── page.tsx              # (Modified: add era badge)
├── components/
│   ├── EraCard.tsx               # Era card for timeline list
│   ├── EraIntroduction.tsx       # Renders Markdown introduction
│   └── ArtworkGrid.tsx           # (Extracted from browse page, reusable)
└── lib/
    ├── eras.ts                   # Era data loading/mapping logic
    └── db.ts                     # (Modified: add era query functions)
```

---

## Implementation Notes

### Phased Rollout

**Phase 1 (MVP):**
- 5 eras matching current dataset
- Static era definitions (manual curation)
- LLM-generated introductions
- Basic timeline + detail pages

**Phase 2 (Future):**
- Expand to 10-12 eras covering full art history
- Multiple era associations for transitional works
- Search/filter by era
- Era-based review scheduling

### Edge Cases

**1. Artworks with ambiguous dates**
- Example: "1495-1498" → Use start year (1495)

**2. Artworks spanning multiple eras**
- Example: Late Renaissance/Early Baroque
- Solution: Allow multiple era associations (array in mapping logic)

**3. Non-Western art traditions**
- Mughal, Edo, etc. get dedicated eras
- Avoid Euro centric bias in era naming

**4. Missing period/movement data**
- Fallback to year-based mapping
- Document unmapped artworks for manual review

### Testing Strategy

**Unit Tests:**
- `getEraForArtwork()` mapping logic
- `parseYear()` date extraction
- Era JSON schema validation

**Integration Tests:**
- Timeline page renders all eras
- Era detail page queries correct artworks
- Navigation between eras works

**E2E Tests:**
- User can browse timeline and click era
- Artwork detail page shows correct era badge
- Empty eras display appropriate message

---

## Security & Privacy

- **No user data:** All content generated server-side
- **LLM output validation:** Schema checks, profanity filters
- **Rate limiting:** Respect Gemini API quotas (15 RPM)
- **Content provenance:** All generated text includes metadata

---

## Performance Considerations

- **Static generation:** Pre-generate all timeline pages at build time
- **Incremental updates:** Only regenerate changed eras
- **Client-side filtering:** If >20 eras, add JavaScript filtering
- **Image optimization:** Use Next.js Image component for era thumbnails

---

## Accessibility

- **Semantic HTML:** `<section>`, `<article>`, `<time>` tags
- **ARIA labels:** "Navigate to [Era Name]", "Previous era", "Next era"
- **Keyboard navigation:** Tab through era cards, arrow keys for prev/next
- **Screen reader friendly:** Era date ranges announced clearly

---

## Monitoring & Metrics

**Track:**
- LLM generation success rate
- Era page views (most/least popular eras)
- Artwork-era mapping coverage (% of artworks with eras)
- User navigation patterns (timeline → era → artwork flows)

---

## Open Questions for User Feedback

1. **Era granularity:** Should Impressionism and Post-Impressionism be separate eras?
2. **Sorting:** Timeline default to ancient→modern or modern→ancient?
3. **Empty eras:** Show eras with zero artworks or hide them?

---

## Related Documents

- **Requirement:** `docs/requirements/0005-timeline-view.md`
- **Schema:** `docs/designs/0002-database-schema.md`
- **Commentary System:** `docs/requirements/0001-commentary-system.md` (similar LLM pattern)
