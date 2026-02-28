# Learning Art - Web Application

Next.js-based web interface for the Learning Art system.

## Overview

This is the frontend web application for Learning Art, built with Next.js 15, React 19, and Tailwind CSS. It provides a beautiful, accessible interface for browsing artworks, reviewing with spaced repetition, and reading multi-dimensional commentary.

## Features

- **Server-Side Rendering**: Fast initial page loads with Next.js App Router
- **Static Generation**: Artwork detail pages pre-rendered at build time
- **Responsive Design**: Mobile-first layout that works on all screen sizes
- **Dark Mode**: Elegant dark theme enabled by default
- **Keyboard Navigation**: Comprehensive shortcuts for power users
- **Accessibility**: WCAG 2.1 AA compliant with skip links and ARIA labels
- **Wabi-Sabi Aesthetic**: Minimalist design with natural colors and calm transitions

## Tech Stack

- **Framework**: Next.js 15.5+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4+
- **Database**: better-sqlite3 (for server-side data fetching)
- **Fonts**: Playfair Display (serif) + Inter (sans-serif)
- **Build**: TypeScript 5.3+

## Getting Started

### Prerequisites

- Node.js 18 or later
- Database set up (see root README)

### Installation

```bash
# From the web directory
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with header/footer
│   ├── page.tsx           # Home page (dashboard)
│   ├── globals.css        # Global styles
│   ├── browse/            # Browse collection page
│   ├── review/            # Review mode page
│   └── works/[id]/        # Artwork detail pages (dynamic)
├── components/            # React components
│   ├── HelpOverlay.tsx   # Keyboard shortcuts help
│   ├── ClientLayout.tsx  # Client-side layout wrapper
│   └── ArtworkDetail.tsx # Artwork detail view
├── lib/                  # Utility functions
│   ├── db.ts            # Database access layer
│   └── hooks/           # React hooks
│       └── useKeyboardShortcuts.ts
└── public/              # Static assets
```

## Pages

### Home (`/`)

**Purpose**: Dashboard showing progress stats and today's review queue

**Features**:
- Total artworks, reviewed count, due today stats
- Preview of next 3 artworks to review
- Call-to-action to start reviewing or explore collection
- Getting started instructions if database is empty

**Rendering**: Server-rendered (dynamic)

### Browse (`/browse`)

**Purpose**: Explore the complete artwork collection

**Features**:
- Responsive grid layout (1/2/3 columns)
- Image optimization with Next.js Image
- Category icons for missing images
- Click to view artwork details

**Rendering**: Static (prerendered)

### Artwork Detail (`/works/[id]`)

**Purpose**: View artwork with full metadata and commentary

**Features**:
- Large image display with aspect ratio preservation
- Complete metadata (artist, year, medium, dimensions, location, movement)
- Links to Wikipedia and museum pages
- Previous/next navigation buttons
- Keyboard shortcuts (← →) for navigation
- Commentary placeholder (future: 6-dimension analysis)

**Rendering**: Static Site Generation (SSG) with `generateStaticParams`

### Review Mode (`/review`)

**Purpose**: Study artworks due for review today

**Features**:
- Stats dashboard (total/reviewed/due)
- Review queue sorted by due date
- Thumbnails and metadata for each artwork
- SM-2 algorithm explanation
- Empty state when all caught up

**Rendering**: Server-rendered (dynamic)

## Components

### HelpOverlay

**File**: `components/HelpOverlay.tsx`

Keyboard shortcuts reference modal.

**Usage**:
- Press `?` to open
- Press `Esc` to close
- Click outside to dismiss

**Features**:
- Categorized shortcuts (General, Navigation, Artwork View, Lists)
- Keyboard key visualization
- Backdrop blur effect
- Responsive layout

### ClientLayout

**File**: `components/ClientLayout.tsx`

Wraps the app with global keyboard shortcuts and help overlay.

**Purpose**: Enables client-side features while keeping root layout as server component for metadata export.

### ArtworkDetail

**File**: `components/ArtworkDetail.tsx`

Client component for artwork detail pages with keyboard navigation.

**Props**:
- `artwork: Artwork` - The artwork to display
- `prevArtwork: Artwork | null` - Previous artwork (for navigation)
- `nextArtwork: Artwork | null` - Next artwork (for navigation)

**Features**:
- Arrow key navigation
- Responsive image display
- Metadata formatting
- External link handling

## Keyboard Shortcuts

### Global Navigation

- `g` + `h` - Go to Home
- `g` + `b` - Go to Browse
- `g` + `r` - Go to Review
- `Esc` - Go back in history

### Artwork View

- `←` - Previous artwork
- `→` - Next artwork
- `j` - Scroll down
- `k` - Scroll up

### Help

- `?` - Show keyboard shortcuts overlay
- `Esc` (in overlay) - Close overlay

## Database Access

The web app uses a synchronous SQLite client (`better-sqlite3`) for server-side data fetching.

### Functions (lib/db.ts)

```typescript
// Get all artworks
const artworks = getAllArtworks();

// Get artwork by ID
const artwork = getArtworkById(1);

// Get artworks by category
const paintings = getArtworksByCategory('painting');

// Get today's review queue
const queue = getTodayReviewQueue(10); // limit: 10

// Get progress stats
const stats = getProgressStats();
// Returns: { totalArtworks, reviewed, dueToday }
```

## Styling

### Tailwind Configuration

Custom color palette (wabi-sabi):
- **Ochre**: `#D4A574` (primary accent)
- **Sage**: `#A8B5A1` (secondary accent)
- **Rose**: `#C9A9A6` (tertiary accent)

Fonts:
- **Serif**: Playfair Display (headings, titles)
- **Sans**: Inter (body text)

### Custom Classes

Defined in `app/globals.css`:

```css
.transition-gentle  /* 500ms ease-out transitions */
.transition-smooth  /* 300ms ease-in-out transitions */
.focus-ring        /* Accessible focus indicator */
.card              /* Card style with border */
.card-interactive  /* Card with hover effects */
.btn-primary       /* Primary button style */
.btn-secondary     /* Secondary button style */
.section-padding   /* Generous page padding */
```

### Accessibility Features

- **Skip Links**: Tab to "Skip to main content" button
- **ARIA Landmarks**: `banner`, `navigation`, `main`, `contentinfo`
- **ARIA Labels**: Descriptive labels on all interactive elements
- **Focus Indicators**: Visible focus ring on keyboard navigation
- **Reduced Motion**: Respects `prefers-reduced-motion` user preference
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Keyboard Navigation**: Full app navigable without mouse

### Dark Mode

Dark mode is enabled by default. The `html` tag has the `dark` class applied in the root layout.

Toggle dark mode (future enhancement):
```typescript
// Add this to toggle dark mode
document.documentElement.classList.toggle('dark');
```

## Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## Environment Variables

No environment variables needed for the web app. All configuration is in Next.js config files.

## Performance

### Image Optimization

Next.js Image component automatically:
- Serves images in modern formats (WebP, AVIF)
- Generates responsive image sizes
- Lazy loads images below the fold
- Provides blur-up placeholders (when configured)

### Static Generation

Artwork detail pages are pre-rendered at build time using `generateStaticParams`, resulting in instant page loads.

### Code Splitting

Next.js automatically splits code by route, loading only what's needed for each page.

## Future Enhancements

- [ ] Dark/light mode toggle
- [ ] Advanced filters (by artist, period, movement)
- [ ] Search functionality
- [ ] Rating interface for artworks during review
- [ ] Commentary display from Markdown files
- [ ] Image zoom/pan on detail pages
- [ ] Export review progress as JSON/CSV
- [ ] Artwork comparison view (side-by-side)

## Troubleshooting

### Build Errors

**Issue**: `duration-400` class does not exist
**Fix**: Use standard Tailwind durations (duration-300, duration-500, etc.)

**Issue**: `border-border` class does not exist
**Fix**: Use specific colors (border-gray-200, border-gray-800, etc.)

### Database Connection

**Issue**: Cannot find database
**Fix**: Ensure database exists at `../data/artworks.db` relative to web directory

**Issue**: Database locked
**Fix**: Close all database connections. Check for lingering processes accessing the database.

### Next.js Warnings

**Issue**: Multiple lockfiles detected
**Fix**: Remove either root `package-lock.json` or `web/package-lock.json` (recommendation: keep web/package-lock.json)

## License

MIT
