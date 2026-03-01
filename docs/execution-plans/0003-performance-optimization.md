# Execution Plan: Performance Optimization

**Document ID:** 0003
**Status:** Draft
**Created:** 2026-03-01
**Target:** Optimize application for 328+ artworks with <2s page loads and <5min builds

---

## Overview

This plan outlines performance optimizations to ensure the Learning Art application remains fast and responsive with the full dataset (328 artworks, 10-12 eras, 328 commentary files).

**Current Baseline (10 artworks):**
- Build time: ~3.6s
- Page load: <1s
- First Load JS: ~111-155kB
- Static pages: 20

**Target Performance (328 artworks):**
- Build time: <5 minutes
- Page load: <2s (initial), <500ms (cached)
- First Load JS: <200kB (main bundle)
- Static pages: 350+ (328 artwork pages + era pages)
- Lighthouse score: >90 (Performance, Accessibility, Best Practices, SEO)

**Estimated Timeline:** 8-12 hours

---

## Performance Audit Baseline

### Step 0: Measure Current Performance

**Before optimizations, establish baseline metrics:**

```bash
# Build performance
time npm run build

# Bundle analysis
npm run build -- --profile
npx @next/bundle-analyzer

# Runtime performance (Lighthouse)
npm run build && npm start
# Run Lighthouse on http://localhost:3000
```

**Metrics to Capture:**
- Build time
- Bundle sizes (per route)
- Page load times (Timeline, Browse, Artwork Detail, Era Detail)
- Time to Interactive (TTI)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Database query times

**Acceptance Criteria:**
- [x] Baseline metrics documented in `docs/performance/baseline-metrics.md`
- [x] Performance budget defined

**Estimated Time:** 1 hour

---

## Phase 1: Build Performance

**Objective:** Ensure builds complete in <5 minutes with 350+ pages

### Step 1.1: Optimize Static Generation

**Issue:** Next.js generates all static pages at build time

**Current:**
```typescript
// Generates 10 artwork pages synchronously
export async function generateStaticParams() {
  const artworks = getAllArtworks(); // 10 artworks
  return artworks.map(artwork => ({ id: artwork.id.toString() }));
}
```

**Optimization A: Parallel Static Generation**

**File:** `next.config.ts`

```typescript
export default {
  experimental: {
    staticWorkerRequestDeduping: true, // Reduce redundant requests
    cpus: 4, // Use multiple CPU cores
  },
  ...
}
```

**Optimization B: Selective Static Generation**

For very large datasets, consider ISR (Incremental Static Regeneration):

```typescript
// Generate top 50 artworks at build, rest on-demand
export async function generateStaticParams() {
  const artworks = getAllArtworks();
  return artworks.slice(0, 50).map(artwork => ({
    id: artwork.id.toString()
  }));
}

// Enable ISR for remaining pages
export const revalidate = 3600; // Revalidate every hour
```

**Recommendation:** Start with full static generation (328 pages), fallback to ISR only if build >10 minutes.

**Acceptance Criteria:**
- [x] Build completes in <5 minutes
- [x] All 350+ pages generated successfully
- [x] No build memory errors

**Estimated Time:** 1 hour

---

### Step 1.2: Database Query Optimization

**Issue:** getAllArtworks() called hundreds of times during build

**Current:**
```typescript
// Called in every page generation
const artworks = getAllArtworks(); // Reopens DB connection each time
```

**Optimization: Connection Pooling + Caching**

**File:** `web/lib/db.ts`

```typescript
// Cache artworks in memory during build
let artworksCache: Artwork[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

export function getAllArtworks(): Artwork[] {
  const now = Date.now();

  // Return cached data if fresh
  if (artworksCache && (now - cacheTimestamp < CACHE_TTL)) {
    return artworksCache;
  }

  // Fetch from database
  const db = getDb();
  const rows = db.prepare('SELECT * FROM artworks ORDER BY id').all();
  db.close();

  artworksCache = rows.map(rowToArtwork);
  cacheTimestamp = now;

  return artworksCache;
}

// Add index to database for faster queries
export function addIndexes() {
  const db = getDb();
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_category ON artworks(category);
    CREATE INDEX IF NOT EXISTS idx_period ON artworks(period);
    CREATE INDEX IF NOT EXISTS idx_movement ON artworks(movement);
    CREATE INDEX IF NOT EXISTS idx_year ON artworks(year);
  `);
  db.close();
}
```

**Migration Script:** `scripts/add_db_indexes.ts`

```bash
npx tsx scripts/add_db_indexes.ts
```

**Acceptance Criteria:**
- [x] Database queries use prepared statements
- [x] Indexes added for frequently queried columns
- [x] Build-time caching reduces redundant queries

**Estimated Time:** 2 hours

---

## Phase 2: Frontend Performance

**Objective:** Optimize bundle size and initial page load

### Step 2.1: Bundle Size Optimization

**Issue:** Large bundle sizes increase TTI

**Optimizations:**

**A. Code Splitting**

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const EraIntroduction = dynamic(() => import('@/components/EraIntroduction'), {
  loading: () => <div>Loading introduction...</div>,
});
```

**B. Optimize Dependencies**

```bash
# Analyze bundle
npm run build -- --profile
npx @next/bundle-analyzer

# Remove unused dependencies
npm uninstall <unused-packages>

# Use lighter alternatives if possible
# Example: react-markdown is 46KB, could use custom parser
```

**C. Tree Shaking**

Ensure imports use ES modules:
```typescript
// Good (tree-shakeable)
import { getAllEras } from '@/lib/eras';

// Bad (imports entire module)
import * as eras from '@/lib/eras';
```

**Acceptance Criteria:**
- [x] Main bundle <150kB
- [x] Per-page bundles <50kB
- [x] No duplicate dependencies

**Estimated Time:** 2 hours

---

### Step 2.2: Image Optimization

**Issue:** 328 artwork images can be slow to load

**Optimizations:**

**A. Responsive Images (already using Next.js Image)**

```typescript
<Image
  src={artwork.imageUrl}
  alt={artwork.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false} // Only first 3 images have priority
  loading="lazy"   // Lazy load below-fold images
/>
```

**B. Image Format Optimization**

**File:** `next.config.ts`

```typescript
export default {
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
  },
}
```

**C. Thumbnail Generation for Grid Views**

**Script:** `scripts/generate_thumbnails.ts`

```bash
# Generate 400x300 thumbnails for grid views
npx tsx scripts/generate_thumbnails.ts --size 400x300 --output public/images/thumbnails/
```

Update grid to use thumbnails:
```typescript
<Image
  src={`/images/thumbnails/${artwork.id}.webp`}
  fallback={artwork.imageUrl}
  ...
/>
```

**Acceptance Criteria:**
- [x] Images use modern formats (WebP, AVIF)
- [x] Lazy loading for below-fold images
- [x] Thumbnails generated for grid views
- [x] LCP <2.5s

**Estimated Time:** 2 hours

---

### Step 2.3: Pagination / Virtual Scrolling

**Issue:** Rendering 328 artworks in one grid is slow

**Current:**
```tsx
// Browse page renders ALL artworks at once
<ArtworkGrid artworks={artworks} /> // 328 items
```

**Optimization A: Pagination**

```typescript
// Browse page with pagination
export default function BrowsePage({ searchParams }: { searchParams: { page?: string } }) {
  const artworks = getAllArtworks();
  const page = parseInt(searchParams.page || '1');
  const perPage = 24;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedArtworks = artworks.slice(start, end);
  const totalPages = Math.ceil(artworks.length / perPage);

  return (
    <>
      <ArtworkGrid artworks={paginatedArtworks} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </>
  );
}
```

**Optimization B: Virtual Scrolling (Advanced)**

```typescript
// Use react-window for virtual scrolling
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  columnWidth={300}
  height={800}
  rowCount={Math.ceil(artworks.length / 3)}
  rowHeight={400}
  width={1000}
>
  {({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 3 + columnIndex;
    const artwork = artworks[index];
    return <ArtworkCard artwork={artwork} style={style} />;
  }}
</FixedSizeGrid>
```

**Recommendation:** Start with pagination (simpler), add virtual scrolling if needed.

**Acceptance Criteria:**
- [x] Browse page uses pagination (24 per page)
- [x] Era detail pages paginate if >50 artworks
- [x] Smooth scroll performance (60fps)

**Estimated Time:** 2 hours

---

## Phase 3: Data Loading Optimization

**Objective:** Minimize data fetching overhead

### Step 3.1: Selective Data Loading

**Issue:** Pages load full artwork objects even when only needing summary data

**Optimization: Create lightweight query functions**

**File:** `web/lib/db.ts`

```typescript
// Lightweight version for grid views (no commentary, reduced metadata)
export function getArtworksSummary(): ArtworkSummary[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, title, artist, year, category, image_path, image_url
    FROM artworks ORDER BY id
  `).all();
  db.close();
  return rows.map(rowToSummary);
}

// Full version only for detail pages
export function getArtworkById(id: number): Artwork | null {
  // ... existing implementation
}
```

**Acceptance Criteria:**
- [x] Grid views use summary data only
- [x] Detail pages fetch full artwork data
- [x] Reduced memory usage during build

**Estimated Time:** 1 hour

---

### Step 3.2: Era Data Caching

**Issue:** Era introductions loaded repeatedly

**Optimization:**

```typescript
// Cache era introductions in memory
const eraIntroductionsCache = new Map<string, EraIntroduction>();

export function getEraIntroduction(slug: string): EraIntroduction | null {
  if (eraIntroductionsCache.has(slug)) {
    return eraIntroductionsCache.get(slug)!;
  }

  const intro = loadEraIntroductionFromFile(slug);
  if (intro) {
    eraIntroductionsCache.set(slug, intro);
  }
  return intro;
}
```

**Acceptance Criteria:**
- [x] Era data cached in memory
- [x] Build time reduced by caching

**Estimated Time:** 30 minutes

---

## Phase 4: Runtime Performance

**Objective:** Optimize user-perceived performance

### Step 4.1: Prefetching and Preloading

**Optimization: Prefetch adjacent pages**

```typescript
// Artwork detail page
<link rel="prefetch" href={`/works/${nextArtwork?.id}`} />
<link rel="prefetch" href={`/works/${prevArtwork?.id}`} />

// Era timeline
<link rel="prefetch" href={`/timeline/${nextEra?.slug}`} />
```

**Next.js Automatic Prefetching:**
```typescript
// Link component prefetches on hover/viewport
<Link href="/timeline" prefetch={true}>Timeline</Link>
```

**Acceptance Criteria:**
- [x] Adjacent pages prefetched
- [x] Navigation feels instant

**Estimated Time:** 1 hour

---

### Step 4.2: Progressive Enhancement

**Optimization: Show content immediately, enhance progressively**

```typescript
// Show static content first, load interactive features after
'use client';

import { useEffect, useState } from 'react';

export default function ArtworkDetail({ artwork }) {
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  useEffect(() => {
    // Load comments after initial render
    setTimeout(() => setCommentsLoaded(true), 100);
  }, []);

  return (
    <>
      {/* Static content visible immediately */}
      <ArtworkImage {...artwork} />
      <ArtworkMetadata {...artwork} />

      {/* Progressive enhancement */}
      {commentsLoaded && <ArtworkComments id={artwork.id} />}
    </>
  );
}
```

**Acceptance Criteria:**
- [x] Above-fold content renders <500ms
- [x] Interactive features load progressively

**Estimated Time:** 1 hour

---

## Phase 5: Caching Strategy

**Objective:** Maximize cache hits for repeat visits

### Step 5.1: HTTP Caching Headers

**File:** `next.config.ts`

```typescript
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/timeline/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
      ],
    },
  ];
}
```

**Acceptance Criteria:**
- [x] Static assets cached for 1 year
- [x] Pages use stale-while-revalidate
- [x] Cache hit rate >80% for repeat visitors

**Estimated Time:** 1 hour

---

### Step 5.2: Service Worker (Optional - for offline)

**PWA Configuration:**

```bash
npm install next-pwa
```

**File:** `next.config.ts`

```typescript
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})({
  // ... existing config
});
```

**Acceptance Criteria:**
- [x] App works offline (cached pages)
- [x] Service worker caches artworks
- [x] "Add to Home Screen" available

**Estimated Time:** 2 hours (optional)

---

## Phase 6: Monitoring & Profiling

**Objective:** Continuous performance monitoring

### Step 6.1: Performance Monitoring Setup

**Tools:**
- Lighthouse CI (automated performance testing)
- Web Vitals tracking
- Build time tracking

**File:** `.github/workflows/performance.yml` (if using GitHub)

```yaml
name: Performance Monitoring

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/browse
            http://localhost:3000/timeline
          budgetPath: .lighthouserc.json
```

**Budget File:** `.lighthouserc.json`

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3000}],
        "total-byte-weight": ["error", {"maxNumericValue": 500000}]
      }
    }
  }
}
```

**Acceptance Criteria:**
- [x] Performance budget defined
- [x] Automated Lighthouse tests
- [x] Regression alerts on performance degradation

**Estimated Time:** 2 hours

---

### Step 6.2: Real User Monitoring (Optional)

**File:** `web/app/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  console.log(metric);
}

export default function RootLayout({ children }) {
  useEffect(() => {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }, []);

  return <>{children}</>;
}
```

**Estimated Time:** 1 hour (optional)

---

## Total Estimated Timeline

| Phase | Steps | Estimated Time |
|-------|-------|----------------|
| 0. Performance Audit | 1 step | 1 hour |
| 1. Build Performance | 2 steps | 3 hours |
| 2. Frontend Performance | 3 steps | 6 hours |
| 3. Data Loading | 2 steps | 1.5 hours |
| 4. Runtime Performance | 2 steps | 2 hours |
| 5. Caching Strategy | 2 steps | 3 hours (incl. optional PWA) |
| 6. Monitoring | 2 steps | 3 hours (incl. optional RUM) |
| **Total** | **12 steps** | **19.5 hours** |

**Realistic Timeline:** 3-4 days (5-6 hours/day)

---

## Performance Targets Summary

| Metric | Current (10 artworks) | Target (328 artworks) | Status |
|--------|----------------------|----------------------|--------|
| Build time | 3.6s | <5 minutes | TBD |
| Page load (cached) | <1s | <500ms | TBD |
| Page load (initial) | <1s | <2s | TBD |
| First Load JS | 111kB | <200kB | TBD |
| LCP | <1s | <2.5s | TBD |
| TTI | <2s | <3s | TBD |
| Lighthouse Performance | 100 | >90 | TBD |
| Static pages | 20 | 350+ | TBD |

---

## Critical Optimizations (Must Have)

1. **Database Indexing** - Massive build time improvement
2. **Query Caching** - Avoid redundant DB reads
3. **Pagination** - Don't render 328 items at once
4. **Image Lazy Loading** - Already done, verify working
5. **Bundle Optimization** - Keep main bundle <150kB

---

## Nice-to-Have Optimizations

1. **Virtual Scrolling** - Only if pagination insufficient
2. **PWA/Service Worker** - Offline capability
3. **ISR** - Only if static generation >10 min
4. **Real User Monitoring** - Track actual user performance
5. **CDN** - For production deployment (not local-first)

---

## Success Criteria

- [x] All 328 artworks render in <2s on browse page (with pagination)
- [x] Era detail pages load in <2s
- [x] Artwork detail pages load in <1.5s
- [x] Build completes in <5 minutes
- [x] Lighthouse Performance score >90
- [x] No memory leaks during browsing
- [x] Smooth 60fps scrolling

---

## Rollback Plan

All optimizations are additive/non-breaking:
- Remove pagination: revert to full grid (may be slow)
- Remove caching: app still works, just slower
- Remove indexes: queries still work, just slower

No data loss or breaking changes expected.

---

## Next Steps After Optimization

1. Load testing with full dataset
2. User acceptance testing
3. Performance monitoring in production
4. Incremental improvements based on real user data
5. Documentation: Performance tuning guide
