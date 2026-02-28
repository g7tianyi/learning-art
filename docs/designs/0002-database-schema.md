# Design: SQLite Database Schema

> **Document ID**: 0002-database-schema
> **Created**: 2026-02-28
> **Author**: AI-assisted
> **Status**: Draft
> **Related Requirement**: `docs/requirements/0000-raw-requests.md`

## Context

The Learning Art application requires a local SQLite database to store artwork metadata, review history, and scheduling data for the spaced repetition system. This database must support:
- 328 artworks (200 paintings, 64 sculptures, 64 architectures)
- Metadata for each artwork (title, artist, year, medium, dimensions, location)
- Review history and SM-2 algorithm data for spaced repetition
- Fast queries for Browse and Review modes

This design defines the complete database schema, migration strategy, and query patterns.

## Goals

- Define minimal, normalized schema supporting all requirements
- Support fast queries for Browse (filters, search, sort)
- Support SM-2 spaced repetition algorithm
- Enable easy backup and portability (SQLite local file)
- Maintain referential integrity
- Support future extensions (tags, custom collections)

## Non-Goals

- Multi-user support or authentication
- Cloud synchronization or distributed database
- Full-text search engine (client-side search sufficient for 328 works)
- Real-time collaboration features
- Complex analytics or reporting

## Proposed Solution

### Architecture Overview

```
┌─────────────────────┐
│   Application       │
│   (Node.js/Next.js) │
└──────────┬──────────┘
           │
           │ SQL queries
           ▼
┌─────────────────────┐
│   SQLite Database   │
│   (local file)      │
├─────────────────────┤
│ - artworks          │
│ - reviews           │
│ - review_schedule   │
│ - migrations        │
└─────────────────────┘
```

### Key Design Decisions

1. **File-based commentary**: Commentary is NOT stored in the database. It lives in `data/commentary/{category}/{id}-{slug}.md` files. The database only stores the path.

2. **Denormalized artist names**: No separate `artists` table. Since we have only 328 artworks and artist names are simple strings, we denormalize for query simplicity.

3. **Separate review_schedule table**: Decouples "what to review" from "historical reviews". This allows efficient daily queue queries.

4. **JSON fields for metadata**: Flexible metadata (sources, tags) stored as JSON to avoid over-normalization for rare fields.

## Data Model Changes

### Schema Defin

ition

#### Table: `artworks`

Stores core artwork metadata.

```sql
CREATE TABLE artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER, -- or TEXT for ranges like "1889-1890"
  category TEXT NOT NULL CHECK(category IN ('painting', 'sculpture', 'architecture')),
  medium TEXT,
  dimensions TEXT, -- e.g., "73.7 cm × 92.1 cm"
  location TEXT, -- Current location (museum, site)
  region TEXT, -- Geographic region (for stratification)
  period TEXT, -- Temporal period (for stratification)
  movement TEXT, -- Art movement

  -- Image and sources
  image_path TEXT, -- Local path to downloaded image
  image_url TEXT, -- Original source URL
  wiki_url TEXT,
  museum_url TEXT,

  -- Commentary reference
  commentary_path TEXT, -- Path to commentary markdown file

  -- Selection metadata
  selection_score REAL, -- Weighted score from selection criteria
  selection_rationale TEXT, -- Why this work was included

  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_artist ON artworks(artist);
CREATE INDEX idx_artworks_movement ON artworks(movement);
CREATE INDEX idx_artworks_period ON artworks(period);
CREATE INDEX idx_artworks_region ON artworks(region);
```

#### Table: `reviews`

Stores historical review records for SM-2 algorithm.

```sql
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- SM-2 data
  quality INTEGER NOT NULL CHECK(quality BETWEEN 0 AND 5), -- 0-5 (SM-2 standard)
  easiness_factor REAL NOT NULL, -- EF value after this review
  interval_days INTEGER NOT NULL, -- Next review interval in days
  repetition_count INTEGER NOT NULL, -- Number of successful reviews

  -- User notes (optional)
  notes TEXT,

  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

CREATE INDEX idx_reviews_artwork ON reviews(artwork_id);
CREATE INDEX idx_reviews_date ON reviews(reviewed_at);
```

#### Table: `review_schedule`

Stores the current review schedule (next review date for each artwork).

```sql
CREATE TABLE review_schedule (
  artwork_id INTEGER PRIMARY KEY REFERENCES artworks(id) ON DELETE CASCADE,
  next_review_date TEXT NOT NULL, -- ISO 8601 date
  easiness_factor REAL NOT NULL DEFAULT 2.5, -- SM-2 initial EF
  interval_days INTEGER NOT NULL DEFAULT 1, -- Current interval
  repetition_count INTEGER NOT NULL DEFAULT 0, -- Times reviewed successfully
  last_reviewed_at TEXT, -- Last review timestamp

  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

CREATE INDEX idx_schedule_next_review ON review_schedule(next_review_date);
```

#### Table: `migrations`

Tracks applied migrations (standard pattern).

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
```

### Migration Strategy

**Phase 1: Initial schema creation**
1. Create `migrations` table
2. Run migration `001_initial_schema.sql` (creates all tables)
3. Record migration in `migrations` table

**Phase 2: Data loading**
1. Artworks are inserted via `scripts/load_artworks.ts` (reads from `data/artworks-final.json`)
2. Initial review schedule created with default values

**Phase 3: Future migrations**
- Migrations stored in `migrations/` directory
- Migration script `scripts/db_migrate.ts` applies pending migrations
- Each migration file prefixed with version number (e.g., `002_add_tags.sql`)

### Rollback Procedure

- SQLite has no built-in rollback for schema changes
- Rollback strategy: backup database before migration, restore from backup if needed
- Backup created automatically by migration script: `{db_name}.backup-{timestamp}.db`

## Public Interfaces / Contracts

### Data Access Layer

```typescript
// scripts/lib/db.ts

export interface ArtworkRecord {
  id: number;
  title: string;
  artist: string;
  year: number | string;
  category: 'painting' | 'sculpture' | 'architecture';
  medium?: string;
  dimensions?: string;
  location?: string;
  region?: string;
  period?: string;
  movement?: string;
  imagePath?: string;
  imageUrl?: string;
  wikiUrl?: string;
  museumUrl?: string;
  commentaryPath?: string;
  selectionScore?: number;
  selectionRationale?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRecord {
  id: number;
  artworkId: number;
  reviewedAt: string;
  quality: number; // 0-5
  easinessFactor: number;
  intervalDays: number;
  repetitionCount: number;
  notes?: string;
}

export interface ReviewScheduleRecord {
  artworkId: number;
  nextReviewDate: string;
  easinessFactor: number;
  intervalDays: number;
  repetitionCount: number;
  lastReviewedAt?: string;
}

// Database connection
export function getDb(): Database;

// Artwork queries
export function getAllArtworks(filters?: ArtworkFilters): Promise<ArtworkRecord[]>;
export function getArtworkById(id: number): Promise<ArtworkRecord | null>;
export function insertArtwork(artwork: Omit<ArtworkRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<number>;
export function updateArtwork(id: number, updates: Partial<ArtworkRecord>): Promise<void>;

// Review queries
export function getReviewHistory(artworkId: number): Promise<ReviewRecord[]>;
export function insertReview(review: Omit<ReviewRecord, 'id'>): Promise<number>;

// Review schedule queries
export function getTodayReviewQueue(limit?: number): Promise<ArtworkRecord[]>;
export function updateReviewSchedule(artworkId: number, schedule: Partial<ReviewScheduleRecord>): Promise<void>;
export function initializeReviewSchedule(artworkId: number): Promise<void>;
```

### Backward Compatibility

N/A - This is the initial schema for a greenfield project.

## Error Handling and Failure Modes

### Error Scenarios

1. **Scenario**: Database file is locked (concurrent access)
   - **Detection**: `SQLITE_BUSY` error
   - **Handling**: Retry with exponential backoff (max 3 attempts)
   - **Recovery**: Fail gracefully, log error, return user-friendly message

2. **Scenario**: Foreign key constraint violation
   - **Detection**: `SQLITE_CONSTRAINT` error
   - **Handling**: Log error with details, return specific error message
   - **Recovery**: User corrects input or data issue

3. **Scenario**: Database file corrupted
   - **Detection**: `SQLITE_CORRUPT` error on connection
   - **Handling**: Alert user, attempt to restore from latest backup
   - **Recovery**: Restore backup, notify user of data loss risk

4. **Scenario**: Disk full
   - **Detection**: `SQLITE_FULL` error
   - **Handling**: Log error, notify user to free disk space
   - **Recovery**: User frees space, retry operation

### Failure Modes

- **Database file deleted**: Application creates new empty database (data loss)
- **Migration fails mid-execution**: Restore from backup, retry migration
- **Backup restoration fails**: Manual recovery required, documentation provided

## Observability

### Logging

- All SQL queries logged at DEBUG level (development only)
- Errors logged at ERROR level with query details (redact sensitive data)
- Slow queries (>100ms) logged at WARN level
- Migration execution logged at INFO level

### Metrics

- Query execution time (percentiles: p50, p95, p99)
- Database file size
- Number of artworks, reviews, scheduled items
- Migration execution count and success rate

### Debugging

- SQL query logging can be enabled via environment variable `DEBUG_SQL=true`
- Database file can be inspected with SQLite CLI: `sqlite3 data/artworks.db`
- Backup files preserved for 30 days for forensic analysis

## Security Considerations

### Data Exposure

- Database file is local-only (no network exposure)
- No user authentication (single-user app)
- No sensitive personal data stored
- API keys for external services (Gemini, etc.) stored in `.env`, NOT in database

### Input Validation

- All user inputs sanitized before SQL queries (use parameterized queries)
- Enum fields (category) validated at application layer before database insertion
- Year field accepts both integers and text ranges, validated by regex

### Secrets Handling

- No secrets stored in database
- API keys in `.env` file (excluded from git via `.gitignore`)

## Test Strategy

### Unit Tests

- Test database connection establishment
- Test CRUD operations for each table
- Test foreign key constraints
- Test indexes improve query performance
- Coverage goal: 90%+ for db.ts module

### Integration Tests

- Test migration execution (create temp database, run migrations, verify schema)
- Test full artwork insertion + commentary generation + review workflow
- Test review schedule queries with various dates

### Golden/Regression Tests

- Fixture: `test/fixtures/artworks-sample.json` (10 sample artworks)
- Load fixtures, run queries, verify results match expected output

### Manual Testing

- Verify database file can be backed up and restored
- Verify database can be inspected with SQLite CLI
- Test performance with full 328 artworks loaded

## Rollout / Rollback Plan

### Rollout Strategy

1. **Phase 1**: Create initial schema, run migrations
2. **Phase 2**: Load seed artworks (manual curated list, ~100 works)
3. **Phase 3**: Load full artwork set (328 works)
4. **Verification**: Run test queries, verify data integrity

### Rollback Procedure

1. Stop application
2. Delete `data/artworks.db`
3. Restore from `data/artworks.db.backup-{timestamp}`
4. Restart application

### Success Metrics

- All 328 artworks loaded without errors
- Browse queries return results in <50ms
- Review queue queries return results in <20ms
- No foreign key violations in production

## Alternatives Considered

### Alternative 1: PostgreSQL

- **Description**: Use PostgreSQL instead of SQLite
- **Pros**: More robust, better concurrency, full-text search
- **Cons**: Requires separate server process, overkill for 328 records, violates "local-only" requirement
- **Rejection reason**: SQLite is sufficient for local-first, single-user app with small dataset

### Alternative 2: JSON Files

- **Description**: Store all data in JSON files (no database)
- **Pros**: Simple, human-readable, easy to edit
- **Cons**: No indexing (slow queries), no referential integrity, hard to query (filters, sorts)
- **Rejection reason**: Browse and Review modes require fast, complex queries

### Alternative 3: Separate Artists Table

- **Description**: Normalize artists into separate table with foreign keys
- **Pros**: Cleaner relational model, supports artist-level queries
- **Cons**: Adds complexity, minor benefit for 328 artworks, most artists appear 1-3 times
- **Rejection reason**: Denormalization acceptable for small, stable dataset

## Open Questions

- [ ] Should we add a `tags` table for user-defined categorization?
- [ ] Should we track time spent reviewing each artwork?
- [ ] Should we add a `favorites` or `bookmarks` feature?
- [ ] Should we support exporting data to CSV/JSON for backup?

## References

- Related requirement docs: `docs/requirements/0000-raw-requests.md`
- SQLite documentation: https://www.sqlite.org/docs.html
- SM-2 algorithm: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
- Better SQLite3 (Node.js library): https://github.com/WiseLibs/better-sqlite3
