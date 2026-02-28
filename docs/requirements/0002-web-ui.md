# Requirements: Web UI - Beautiful, Calm Art Exploration

**Status**: Draft
**Date**: 2026-02-28
**Related Requirements**: `0000-raw-requests.md`, `0001-commentary-system.md`

---

## Objective

Build a **local-first web application** with a beautiful, calm, minimalist design that creates an environment worthy of the art itself. The UI should evoke tranquility, encourage deep engagement, and make art exploration feel like visiting a serene museum rather than using a productivity app.

**Target audience**: Personal use (expandable to others in future).

---

## Acceptance Criteria

### AC1: Design Aesthetic - Wabi-Sabi Minimalism

The design must embody **wabi-sabi** principles: simplicity, imperfection, natural materials, calm, and quiet beauty.

**Typography**:
- ✅ **Serif fonts for titles**: Playfair Display, Source Serif Pro, or Merriweather
  - Conveys elegance, timelessness, artistic sophistication
- ✅ **Sans-serif for body text**: Inter, Helvetica Neue, or SF Pro
  - Ensures readability, modern feel
- ✅ **Line spacing**: 1.6-1.8 for body text
  - Creates breathing room, reduces visual density

**Color Palette**:
- ✅ **Light mode**:
  - Background: Soft whites (#FEFEFE), warm grays (#F5F5F0)
  - Text: Deep charcoal (#2C2C2C)
  - Accents: Muted ochre (#D4A574), sage green (#A8B5A1), dusty rose (#C9A9A6)

- ✅ **Dark mode**:
  - Background: Deep charcoal (#1A1A1A), warm blacks (#0D0D0D)
  - Text: Soft whites (#E8E8E8)
  - Accents: Same muted tones with adjusted brightness

- ✅ **Color characteristics**:
  - Low saturation (calming, not jarring)
  - Earth tones (natural, grounded)
  - High contrast for accessibility (WCAG AA minimum)

**Layout**:
- ✅ **Generous whitespace**: Minimum 60-80px padding on sections
- ✅ **Asymmetric but balanced grid**: Inspired by Japanese aesthetics (not rigid symmetry)
- ✅ **Image presentation**:
  - Full-bleed hero images OR generous margins (never cramped)
  - Artwork images are the visual hero (UI elements recede)
- ✅ **Responsive**: Mobile-first design, adapts gracefully to tablet/desktop

**Animation & Interaction**:
- ✅ **Slow, gentle transitions**: 300-400ms duration
- ✅ **Easing functions**: Ease-out, ease-in-out (no linear or harsh snapping)
- ✅ **Micro-animations**:
  - Fade-ins on page load
  - Subtle parallax on scroll
  - Hover states with gentle scale/opacity changes
- ✅ **Smooth scrolling**: Native smooth scroll, snap-to-section behavior

### AC2: Core Pages & Navigation

**Required Pages**:

1. **Home Dashboard**
   - ✅ Today's review queue (5-10 works)
   - ✅ Progress overview (works studied, total progress %)
   - ✅ Featured artwork of the day (random or curated)
   - ✅ Quick links: Browse, Review, Stats

2. **Browse Library**
   - ✅ Grid/list view toggle
   - ✅ Filters: Category (paintings/sculptures/architecture), Period, Region, Movement, Artist
   - ✅ Search: Fast, client-side search on title, artist, year
   - ✅ Sort: Chronological, alphabetical, recently studied

3. **Artwork Detail Page**
   - ✅ Large, high-quality image (zoomable)
   - ✅ Artwork metadata (title, artist, year, medium, dimensions, location)
   - ✅ 6-dimension commentary (collapsible sections)
   - ✅ Sources (clickable links)
   - ✅ Navigation: Previous/next artwork (keyboard shortcuts)
   - ✅ Actions: Mark as studied, add to review queue

4. **Review Mode**
   - ✅ Spaced repetition interface (SM-2 algorithm)
   - ✅ Shows artwork image + metadata
   - ✅ Progressive reveal of commentary dimensions
   - ✅ Self-assessment: Easy / Medium / Hard buttons
   - ✅ Queue progress indicator

**Navigation**:
- ✅ **Top navigation bar**: Logo, Browse, Review, Stats, Settings
- ✅ **Sticky header**: Remains accessible on scroll
- ✅ **Breadcrumbs**: On detail pages (Home > Paintings > Starry Night)
- ✅ **Footer**: Minimalist, credits, version info

### AC3: Keyboard Shortcuts (Vim-Inspired)

Power users should navigate entirely via keyboard.

- ✅ **Global**:
  - `/` - Focus search
  - `Esc` - Close modals, clear search
  - `?` - Show keyboard shortcuts overlay
  - `d` - Toggle dark mode

- ✅ **Browse**:
  - `j` / `k` - Next/previous artwork in list
  - `Enter` - Open selected artwork detail
  - `f` - Toggle filters panel

- ✅ **Detail Page**:
  - `j` / `k` - Next/previous artwork
  - `z` - Zoom/fullscreen image
  - `1-6` - Jump to commentary dimension (1=Art, 2=History, etc.)
  - `Space` - Expand/collapse all dimensions

- ✅ **Review Mode**:
  - `1` / `2` / `3` - Rate difficulty (Easy/Medium/Hard)
  - `Space` - Reveal next dimension
  - `j` / `k` - Next/previous work in queue

- ✅ **Keyboard shortcut overlay**:
  - Modal triggered by `?` key
  - Lists all available shortcuts
  - Context-aware (shows page-specific shortcuts)

### AC4: Performance & Responsiveness

- ✅ **Fast initial load**: <2 seconds on localhost
- ✅ **Instant navigation**: Client-side routing (Next.js App Router)
- ✅ **Image optimization**:
  - Next.js Image component (automatic optimization)
  - Lazy loading (images load as scrolled into view)
  - Responsive images (srcset for different screen sizes)

- ✅ **Search performance**:
  - Client-side search (no server round-trip)
  - Debounced input (300ms delay)
  - Results update in <100ms

- ✅ **Smooth scrolling**: 60fps animations, no jank

### AC5: Accessibility

- ✅ **Semantic HTML**: Proper heading hierarchy, landmarks, ARIA labels
- ✅ **Color contrast**: WCAG AA minimum (4.5:1 for text, 3:1 for UI elements)
- ✅ **Focus indicators**: Visible focus ring on all interactive elements
- ✅ **Screen reader support**: Alt text for images, descriptive link text
- ✅ **Keyboard navigation**: All functionality accessible via keyboard
- ✅ **Reduced motion**: Respect `prefers-reduced-motion` media query

### AC6: Dark Mode

- ✅ **Toggle mechanism**: Button in header + `d` keyboard shortcut
- ✅ **Persistence**: User preference saved to localStorage
- ✅ **System preference**: Respects OS dark mode setting on first visit
- ✅ **Smooth transition**: 300ms ease-in-out on mode switch
- ✅ **Image handling**: No image color inversion (preserve artwork colors)

---

## Constraints

### Technical Constraints

- **Stack**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components (customized to match aesthetic)
- **Database**: SQLite (local, no server needed)
- **Deployment**: Local-only (no cloud hosting, no auth)

### Design Constraints

- **Reference sites** (for inspiration, not copying):
  - MoMA: https://moma.org
  - National Gallery: https://nationalgallery.org.uk
  - British Museum: https://britishmuseum.org
  - Mauritshuis: https://mauritshuis.nl
  - Minimal Gallery: https://minimal.gallery

- **Design philosophy**:
  - **Calm over stimulation**: No gamification, badges, or distracting animations
  - **Art-first**: UI recedes, artwork is hero
  - **Timeless aesthetics**: Avoid trendy design fads
  - **Accessible elegance**: Beautiful but usable

### UX Constraints

- **Single-user**: No collaboration, sharing, or multi-device sync
- **Local-only**: No external dependencies after initial setup
- **Personal tool**: Optimize for daily personal use, not broad audiences

---

## Non-Goals

### Out of Scope

- ❌ **Social features**: No commenting, sharing, likes, follows
- ❌ **Mobile app**: Web-only (responsive design for mobile browsers)
- ❌ **Cloud sync**: No cross-device synchronization
- ❌ **User accounts**: Single-user, no authentication
- ❌ **Analytics**: No tracking, no telemetry
- ❌ **Offline mode**: Assumes local server running (Next.js dev server)
- ❌ **Custom collections**: Fixed dataset of 328 works (no user uploads)

### Explicitly Not Required

- Gamification (points, levels, achievements)
- Social proof (most-viewed, trending)
- Comments or annotations (user edits commentary files directly)
- Export/import functionality (rely on file system)

---

## Technical Architecture

### Component Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout (header, footer)
│   ├── page.tsx            # Home dashboard
│   ├── browse/
│   │   └── page.tsx        # Browse library
│   ├── works/
│   │   └── [id]/
│   │       └── page.tsx    # Artwork detail
│   └── review/
│       └── page.tsx        # Review mode
├── components/
│   ├── ui/                 # shadcn/ui components (customized)
│   ├── ArtworkCard.tsx     # Grid/list item
│   ├── ArtworkImage.tsx    # Optimized image display
│   ├── CommentarySection.tsx # Collapsible dimension
│   ├── SearchBar.tsx       # Fast client-side search
│   ├── FilterPanel.tsx     # Category/period/region filters
│   ├── KeyboardShortcuts.tsx # Modal overlay
│   └── ThemeToggle.tsx     # Dark mode toggle
├── lib/
│   ├── db.ts               # SQLite queries
│   ├── commentary.ts       # Read commentary files
│   └── sm2.ts              # Spaced repetition algorithm
└── styles/
    └── globals.css         # Tailwind config, custom styles
```

### Data Flow (Artwork Detail Page)

```
1. User navigates to /works/1
2. Page component fetches artwork metadata from SQLite
3. Reads commentary file: data/commentary/paintings/0001-starry-night.md
4. Parses markdown (metadata, dimensions, sources)
5. Renders image + metadata + collapsible commentary sections
6. Keyboard shortcuts listener active
7. User presses 'j' → Navigate to /works/2
```

---

## Design Specifications

### Specific Measurements

**Spacing Scale** (Tailwind):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 80px

**Typography Scale**:
- xs: 12px / 1.4
- sm: 14px / 1.5
- base: 16px / 1.6
- lg: 18px / 1.7
- xl: 20px / 1.7
- 2xl: 24px / 1.4
- 3xl: 30px / 1.3
- 4xl: 36px / 1.2
- 5xl: 48px / 1.1

**Breakpoints**:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Component Specs

**Artwork Card (Browse)**:
- Image: 16:9 aspect ratio, 320px wide on mobile, 400px on desktop
- Hover state: Subtle scale (1.02), shadow increase
- Title: Serif, 18px, 2 lines max (ellipsis)
- Artist: Sans-serif, 14px, muted color

**Commentary Section**:
- Collapsible (accordion-style)
- Header: Dimension name, chevron icon
- Body: Serif body text, 16px, 1.7 line-height
- Padding: 24px vertical, 32px horizontal
- Border: Subtle, 1px, muted color

**Search Bar**:
- Sticky at top of Browse page
- Icon: Magnifying glass (left)
- Clear button (right, only when text present)
- Placeholder: "Search by title, artist, or year..."
- Focus state: Border color shift, subtle shadow

---

## Success Metrics

### Design Quality

- **Visual consistency**: 100% of pages follow design system (colors, typography, spacing)
- **Accessibility**: Lighthouse accessibility score ≥90
- **Performance**: Lighthouse performance score ≥90
- **User delight**: Subjective, but aim for "feels like visiting a museum"

### Usability

- **Keyboard navigation**: 100% of actions accessible via keyboard
- **Search speed**: Results in <100ms after typing stops
- **Navigation**: Any page reachable in ≤3 clicks
- **Error states**: Graceful handling (no blank pages, helpful messages)

### Technical

- **Build size**: <500KB JS bundle (gzipped)
- **Image optimization**: All images served as WebP with fallback
- **Code quality**: 0 TypeScript errors, ESLint warnings resolved

---

## Open Questions

1. **Image zoom implementation**: Lightbox modal vs. fullscreen overlay vs. in-place zoom?
2. **Commentary editing**: Should UI offer edit button, or expect users to edit files directly?
3. **Review mode UX**: Free-form recall prompts? Multiple choice? Self-assessment only?
4. **Stats page**: What metrics to show? (Total studied, time spent, review streak, dimension mastery?)
5. **Offline support**: Add service worker for true offline mode, or assume local server always running?

**Decision needed before UI implementation.**

---

## Visual Mockup Reference

**Design inspiration** (not exact replication):
- **Home**: Minimal dashboard like MoMA's landing (hero image + quick actions)
- **Browse**: Grid layout like National Gallery (generous spacing, large images)
- **Detail**: Full-bleed image at top, commentary below (Mauritshuis style)
- **Review**: Centered card layout, clean focus (custom design)

**Mood board**:
- Wabi-sabi aesthetics (imperfect, natural, calm)
- Japanese minimalism (asymmetry, negative space)
- Museum gallery feel (white walls, focused lighting)
- Modern web design (fast, responsive, accessible)

---

## Dependencies

### UI Libraries
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS 3+
- shadcn/ui (Radix UI primitives)
- Framer Motion (optional, for complex animations)

### Fonts
- Playfair Display (Google Fonts)
- Inter (Google Fonts)

### Icons
- Lucide Icons (consistent, minimal)

### Markdown
- `react-markdown` or `next-mdx-remote` for commentary rendering
- `remark-gfm` for GitHub-flavored markdown support

---

## References

- Brainstorm summary: `BRAINSTORM_SUMMARY.md` (Section 1: UI/UX Design)
- System design principles: `docs/protocols/system-design-principles.md`
- Initial requirements: `docs/requirements/0000-raw-requests.md`
