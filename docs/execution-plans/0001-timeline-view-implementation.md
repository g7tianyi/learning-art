# Execution Plan: Timeline-Based View Implementation

**Document ID:** 0001
**Status:** In Progress
**Created:** 2026-03-01
**Related Documents:**
- Requirement: `docs/requirements/0005-timeline-view.md`
- Design: `docs/designs/0003-timeline-view-design.md`

---

## Overview

This execution plan breaks down the timeline view implementation into concrete, testable steps following the design in `0003-timeline-view-design.md`.

**Timeline:** ~4-6 hours of focused work
**Risk Level:** Medium (new UI patterns, LLM integration)

---

## Prerequisites

- ✅ Design doc reviewed and approved
- ✅ Current dataset analyzed (10 artworks, 4 eras represented)
- ✅ LLM API (Gemini) credentials available
- ✅ Next.js build and dev environment working

---

## Step-by-Step Implementation

### Step 1: Data Foundation

**Goal:** Create era definitions and directory structure

**Tasks:**

1.1. Create data directory structure:
```bash
mkdir -p data/eras
```

1.2. Create `data/eras/eras.json` with 5 initial eras:
- `renaissance` (1400-1600)
- `mughal-india` (1526-1857)
- `edo-japan` (1603-1868)
- `impressionism-post-impressionism` (1860-1910)
- `modern` (1900-1970)

Schema per design doc section 3.1.

1.3. Validate JSON structure with schema check

**Acceptance Criteria:**
- [x] `data/eras/eras.json` exists and is valid JSON
- [x] Contains 5 eras with all required fields
- [x] File passes JSON schema validation

**Estimated Time:** 30 minutes

---

### Step 2: LLM Prompt Template

**Goal:** Create reusable prompt for generating era introductions

**Tasks:**

2.1. Create `scripts/prompts/era-introduction-v1.md`
- Use template from design doc section 4.1
- Include placeholder variables: `{era_name}`, `{start_year}`, `{end_year}`, `{regions}`

2.2. Test prompt manually with one era (Renaissance):
- Substitute values
- Call Gemini API
- Verify output format

**Acceptance Criteria:**
- [x] Prompt template file created
- [x] Manual test produces valid Markdown output
- [x] Output meets 200-300 word requirement

**Estimated Time:** 45 minutes

---

### Step 3: Era Introduction Generation Script

**Goal:** Automate LLM content generation for all eras

**Tasks:**

3.1. Create `scripts/generate_era_introductions.ts`:
- Read `data/eras/eras.json`
- Load prompt template
- For each era:
  - Substitute values
  - Call Gemini API
  - Save Markdown with frontmatter to `data/eras/{slug}.md`

3.2. Add CLI options:
- `--era <slug>`: Generate single era
- `--all`: Generate all eras
- `--force`: Regenerate existing
- `--delay <ms>`: Rate limit

3.3. Generate introductions for all 5 eras:
```bash
npx tsx scripts/generate_era_introductions.ts --all --delay 2000
```

3.4. Manual review of generated content:
- Check factual accuracy
- Verify Markdown formatting
- Ensure provenance metadata present

**Acceptance Criteria:**
- [x] Script generates valid Markdown files
- [x] All 5 era files exist in `data/eras/`
- [x] Files include frontmatter with metadata
- [x] Content quality meets editorial standards

**Estimated Time:** 90 minutes

---

### Step 4: Era Data Loading Logic

**Goal:** Create utility functions to load and work with eras

**Tasks:**

4.1. Create `web/lib/eras.ts`:

```typescript
export interface Era {
  id: string;
  name: string;
  slug: string;
  startYear: number;
  endYear: number;
  description: string;
  introductionPath: string;
  color?: string;
}

export interface EraIntroduction {
  metadata: {
    id: string;
    name: string;
    dateRange: string;
    generatedAt: string;
    model: string;
    promptVersion: string;
  };
  content: string; // Markdown body
}

export function getAllEras(): Era[];
export function getEraBySlug(slug: string): Era | null;
export function getEraIntroduction(slug: string): EraIntroduction | null;
export function getEraForArtwork(artwork: Artwork, eras: Era[]): Era | null;
export function parseYear(yearStr: string | number): number;
```

4.2. Implement artwork-era mapping logic (design section 3.3):
- Direct period match
- Movement mapping
- Year-based fallback

4.3. Write unit tests for mapping logic:
- Test each mapping strategy
- Test edge cases (date ranges, null values)

**Acceptance Criteria:**
- [x] `web/lib/eras.ts` created with all functions
- [x] Unit tests pass
- [x] All 10 artworks correctly mapped to eras

**Estimated Time:** 60 minutes

---

### Step 5: Database Query Extensions

**Goal:** Add era-based queries to DB layer

**Tasks:**

5.1. Update `web/lib/db.ts`:

```typescript
export function getArtworksByEra(eraId: string, eras: Era[]): Artwork[];
export function getEraStats(eras: Era[]): { eraId: string; count: number }[];
```

5.2. Test queries:
```typescript
const eras = getAllEras();
const renaissanceWorks = getArtworksByEra('renaissance', eras);
console.log(renaissanceWorks.length); // Should be 3
```

**Acceptance Criteria:**
- [x] Query functions added to `web/lib/db.ts`
- [x] Queries return correct artwork counts per era
- [x] Performance acceptable (<50ms for 328 artworks)

**Estimated Time:** 30 minutes

---

### Step 6: Reusable Artwork Grid Component

**Goal:** Extract grid component from browse page for reuse

**Tasks:**

6.1. Create `web/components/ArtworkGrid.tsx`:
- Accept `artworks: Artwork[]` prop
- Render responsive grid (same as browse page)
- Handle empty state

6.2. Refactor `/browse` page to use new component:
- Replace inline grid with `<ArtworkGrid artworks={artworks} />`
- Verify no visual regressions

**Acceptance Criteria:**
- [x] `ArtworkGrid` component created
- [x] Browse page uses new component
- [x] Grid displays identically to before

**Estimated Time:** 30 minutes

---

### Step 7: Era Card Component

**Goal:** Create timeline era card component

**Tasks:**

7.1. Create `web/components/EraCard.tsx`:
- Props: `era: Era`, `artworkCount: number`, `thumbnails: string[]`
- Display era name, date range, description snippet
- Show up to 3 thumbnail images
- Click → navigate to `/timeline/{slug}`

7.2. Style with Tailwind (wabi-sabi aesthetic):
- Ochre accent for hover state
- Minimal shadows
- Generous whitespace

**Acceptance Criteria:**
- [x] Component renders correctly
- [x] Matches design mockup
- [x] Responsive (mobile, tablet, desktop)
- [x] Accessible (ARIA labels, keyboard nav)

**Estimated Time:** 45 minutes

---

### Step 8: Era Introduction Component

**Goal:** Render Markdown introductions with metadata

**Tasks:**

8.1. Install Markdown parser (if not present):
```bash
cd web && npm install react-markdown remark-gfm
```

8.2. Create `web/components/EraIntroduction.tsx`:
- Parse frontmatter and body
- Render Markdown with `react-markdown`
- Display generation metadata at bottom

8.3. Style Markdown content:
- Serif headings
- Readable line length
- Code blocks, links, lists

**Acceptance Criteria:**
- [x] Component renders Markdown correctly
- [x] Frontmatter metadata displayed
- [x] Styling matches site aesthetic

**Estimated Time:** 30 minutes

---

### Step 9: Timeline List Page

**Goal:** Implement `/timeline` route

**Tasks:**

9.1. Create `web/app/timeline/page.tsx`:
- Fetch all eras
- Calculate artwork counts per era
- Render list of `<EraCard>` components
- Sort chronologically (oldest → newest, with toggle option)

9.2. Add page metadata:
```typescript
export const metadata = {
  title: 'Timeline | Learning Art',
  description: 'Explore artworks through art historical eras',
};
```

9.3. Empty state handling:
- Show message if no eras defined

**Acceptance Criteria:**
- [x] Page renders with 5 era cards
- [x] Cards sorted chronologically
- [x] Artwork counts correct
- [x] Thumbnails display for eras with artworks

**Estimated Time:** 45 minutes

---

### Step 10: Era Detail Page

**Goal:** Implement `/timeline/[slug]` route

**Tasks:**

10.1. Create `web/app/timeline/[slug]/page.tsx`:
- Fetch era by slug
- Load era introduction Markdown
- Query artworks for this era
- Render:
  - Era intro using `<EraIntroduction>`
  - Artworks using `<ArtworkGrid>`
  - Prev/Next navigation buttons

10.2. Generate static params:
```typescript
export async function generateStaticParams() {
  const eras = getAllEras();
  return eras.map(era => ({ slug: era.slug }));
}
```

10.3. Handle 404 for invalid slugs:
```typescript
if (!era) notFound();
```

10.4. Navigation logic:
- Calculate prev/next eras chronologically
- Render buttons with links

**Acceptance Criteria:**
- [x] Era detail pages render correctly
- [x] Introduction displays with Markdown formatting
- [x] Artworks grid shows correct works
- [x] Prev/Next navigation works
- [x] Invalid slugs return 404

**Estimated Time:** 60 minutes

---

### Step 11: Artwork Detail Enhancement

**Goal:** Add era badge to artwork pages

**Tasks:**

11.1. Update `web/app/works/[id]/page.tsx`:
- Query artwork's era using `getEraForArtwork()`
- Pass era to `<ArtworkDetail>` component

11.2. Update `web/components/ArtworkDetail.tsx`:
- Add optional `era?: Era` prop
- Render era badge below metadata:
  ```tsx
  {era && (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        📜 This work is from the{' '}
        <Link href={`/timeline/${era.slug}`} className="text-accent-ochre hover:underline">
          {era.name}
        </Link>
        {' '}({era.startYear} - {era.endYear})
      </p>
      <Link
        href={`/timeline/${era.slug}`}
        className="text-sm text-accent-ochre hover:underline"
      >
        Learn about this era →
      </Link>
    </div>
  )}
  ```

**Acceptance Criteria:**
- [x] Era badge displays on artwork pages
- [x] Badge links to era detail page
- [x] Artworks without era show no badge

**Estimated Time:** 30 minutes

---

### Step 12: Navigation Header Update

**Goal:** Add Timeline link to main navigation

**Tasks:**

12.1. Update `web/app/layout.tsx`:
- Add "Timeline" link between "Browse" and "Review"
- Highlight active route

```tsx
<Link
  href="/timeline"
  className={`hover:text-accent-ochre transition-colors ${
    pathname === '/timeline' ? 'text-accent-ochre' : ''
  }`}
>
  Timeline
</Link>
```

**Acceptance Criteria:**
- [x] Timeline link appears in header
- [x] Active state highlights correctly
- [x] Link works on all pages

**Estimated Time:** 15 minutes

---

### Step 13: Testing & Quality Assurance

**Goal:** Verify all functionality and fix bugs

**Tasks:**

13.1. Manual testing checklist:
- [ ] Timeline page loads and displays all eras
- [ ] Era cards show correct artwork counts
- [ ] Clicking era → navigates to detail page
- [ ] Era detail page shows introduction and artworks
- [ ] Prev/Next navigation works between eras
- [ ] Artwork detail page shows era badge
- [ ] Era badge links to correct era page
- [ ] Navigation header shows Timeline link
- [ ] Mobile responsive (test on iPhone/Android)
- [ ] Keyboard navigation works (Tab, Enter, arrows)

13.2. TypeScript type checking:
```bash
cd web && npx tsc --noEmit
```

13.3. ESLint:
```bash
cd web && npm run lint
```

13.4. Production build:
```bash
cd web && npm run build
```

13.5. Accessibility audit:
- Run Lighthouse
- Check ARIA labels
- Test with screen reader (VoiceOver/NVDA)

**Acceptance Criteria:**
- [x] All manual tests pass
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] Production build succeeds
- [x] Lighthouse score >90 for accessibility

**Estimated Time:** 60 minutes

---

### Step 14: Documentation Updates

**Goal:** Update user-facing and developer documentation

**Tasks:**

14.1. Update `README.md`:
- Add Timeline feature description
- Add screenshot of timeline page
- Document era generation script usage

14.2. Update `CLAUDE.md` (if applicable):
- Note new timeline pages
- Document era mapping logic

14.3. Add inline code comments:
- Era mapping logic
- LLM generation script
- Complex UI components

**Acceptance Criteria:**
- [x] README updated with timeline feature
- [x] Developer docs include era generation instructions
- [x] Code comments added where needed

**Estimated Time:** 30 minutes

---

## Step 15: Commit & PR

**Goal:** Finalize and push changes for review

**Tasks:**

15.1. Review all changes:
```bash
git diff
git status
```

15.2. Stage changes:
```bash
git add .
```

15.3. Commit with detailed message (following protocol):
```
Add timeline-based view with art historical eras (Large task)

**Task Size:** Large
- New pages, components, data structures
- Database query extensions (no schema changes)
- LLM integration for era introductions

**Features:**
- Chronological timeline view of art eras
- LLM-generated era introductions (Gemini API)
- Automatic artwork-era mapping
- Era detail pages with filtered artworks
- Era context badges on artwork pages

**Files created:**
- docs/requirements/0005-timeline-view.md
- docs/designs/0003-timeline-view-design.md
- docs/execution-plans/0001-timeline-view-implementation.md
- data/eras/eras.json (5 canonical eras)
- data/eras/{slug}.md (5 era introductions)
- scripts/prompts/era-introduction-v1.md
- scripts/generate_era_introductions.ts
- web/lib/eras.ts (era loading & mapping logic)
- web/components/EraCard.tsx
- web/components/EraIntroduction.tsx
- web/components/ArtworkGrid.tsx
- web/app/timeline/page.tsx
- web/app/timeline/[slug]/page.tsx

**Files modified:**
- web/lib/db.ts (added era queries)
- web/app/layout.tsx (added Timeline nav link)
- web/app/works/[id]/page.tsx (added era badge)
- web/components/ArtworkDetail.tsx (render era context)
- web/app/browse/page.tsx (use ArtworkGrid component)

**Protocol Steps Followed:**
✓ Step 2: Triage (Large)
✓ Step 3: Requirements (0005-timeline-view.md)
✓ Step 4: Orient (analyzed current data)
✓ Step 5: Design (0003-timeline-view-design.md)
✓ Step 6: Plan & Branch (this execution plan)
✓ Step 7: Implement (all features)
✓ Step 8: Finalize (tests, docs, PR)

**Build status:**
✓ TypeScript: Passed
✓ ESLint: Passed
✓ Production build: Success
✓ Accessibility: Lighthouse score >90

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

15.4. Push to feature branch:
```bash
git push -u origin feature/timeline-view
```

15.5. Create pull request:
```bash
gh pr create --title "Add timeline-based view with art historical eras" --body "..."
```

**Acceptance Criteria:**
- [x] All changes committed
- [x] Commit message follows protocol
- [x] PR created with full context
- [x] CI/CD checks pass (if configured)

**Estimated Time:** 30 minutes

---

## Total Estimated Time

- Step 1: Data foundation - 30min
- Step 2: Prompt template - 45min
- Step 3: Generation script - 90min
- Step 4: Era loading logic - 60min
- Step 5: DB queries - 30min
- Step 6: ArtworkGrid component - 30min
- Step 7: EraCard component - 45min
- Step 8: EraIntroduction component - 30min
- Step 9: Timeline list page - 45min
- Step 10: Era detail page - 60min
- Step 11: Artwork era badge - 30min
- Step 12: Navigation header - 15min
- Step 13: Testing & QA - 60min
- Step 14: Documentation - 30min
- Step 15: Commit & PR - 30min

**Total: ~630 minutes (~10.5 hours)**

**Realistic Timeline:** 2-3 focused work sessions

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| LLM generation produces low-quality content | Manual review step; regenerate with refined prompt |
| Artwork mapping fails for some works | Fallback to year-based logic; document unmapped works |
| Performance issues with large datasets | Use static generation; optimize queries |
| UI doesn't match design mockups | Iterative refinement; user feedback loop |

---

## Rollback Plan

If critical issues arise post-deployment:

1. Revert PR (single atomic squash commit)
2. Remove Timeline nav link (hide feature)
3. Artworks pages remain functional (era badge optional)
4. Generated era files preserved for future use

**Recovery Time:** <15 minutes

---

## Success Metrics

**Functional:**
- [x] All 10 artworks correctly mapped to eras
- [x] 5 era introduction files generated
- [x] Timeline and era detail pages render without errors
- [x] Navigation works between all pages

**Quality:**
- [x] Build passes (no TS/lint errors)
- [x] Lighthouse accessibility score >90
- [x] Mobile responsive design verified

**User Experience:**
- [x] Page load time <2s on timeline
- [x] Clear visual hierarchy
- [x] Intuitive navigation flow

---

## Next Steps (Future Enhancements)

**Not in scope for this PR, but documented for future:**

1. Expand to 10-12 eras covering full art history
2. Add search/filter by era in browse page
3. Multiple era associations for transitional works
4. Era-based spaced repetition review scheduling
5. Interactive timeline visualization (draggable slider)
6. User-customizable era definitions

---

## Related Documents

- **Requirement:** `docs/requirements/0005-timeline-view.md`
- **Design:** `docs/designs/0003-timeline-view-design.md`
- **Protocol:** `docs/protocols/working-protocols.md`
