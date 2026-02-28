/**
 * Database Access Layer
 *
 * Provides typed queries and CRUD operations for the Learning Art database.
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

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

export interface ArtworkFilters {
  category?: 'painting' | 'sculpture' | 'architecture';
  artist?: string;
  movement?: string;
  period?: string;
  region?: string;
  search?: string; // Search in title, artist
}

// ============================================================================
// Database Connection
// ============================================================================

const DB_PATH = path.join(__dirname, '../../data/artworks.db');

let dbInstance: Database.Database | null = null;

/**
 * Get database connection (singleton)
 */
export function getDb(): Database.Database {
  if (!dbInstance) {
    // Ensure data directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('foreign_keys = ON');
  }

  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert database row to ArtworkRecord (snake_case → camelCase)
 */
function rowToArtwork(row: any): ArtworkRecord {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    year: row.year,
    category: row.category,
    medium: row.medium,
    dimensions: row.dimensions,
    location: row.location,
    region: row.region,
    period: row.period,
    movement: row.movement,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    wikiUrl: row.wiki_url,
    museumUrl: row.museum_url,
    commentaryPath: row.commentary_path,
    selectionScore: row.selection_score,
    selectionRationale: row.selection_rationale,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Convert database row to ReviewRecord (snake_case → camelCase)
 */
function rowToReview(row: any): ReviewRecord {
  return {
    id: row.id,
    artworkId: row.artwork_id,
    reviewedAt: row.reviewed_at,
    quality: row.quality,
    easinessFactor: row.easiness_factor,
    intervalDays: row.interval_days,
    repetitionCount: row.repetition_count,
    notes: row.notes
  };
}

/**
 * Convert database row to ReviewScheduleRecord (snake_case → camelCase)
 */
function rowToSchedule(row: any): ReviewScheduleRecord {
  return {
    artworkId: row.artwork_id,
    nextReviewDate: row.next_review_date,
    easinessFactor: row.easiness_factor,
    intervalDays: row.interval_days,
    repetitionCount: row.repetition_count,
    lastReviewedAt: row.last_reviewed_at
  };
}

// ============================================================================
// Artwork Queries
// ============================================================================

/**
 * Get all artworks with optional filters
 */
export function getAllArtworks(filters?: ArtworkFilters): ArtworkRecord[] {
  const db = getDb();

  let sql = 'SELECT * FROM artworks WHERE 1=1';
  const params: any[] = [];

  if (filters) {
    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.artist) {
      sql += ' AND artist = ?';
      params.push(filters.artist);
    }

    if (filters.movement) {
      sql += ' AND movement = ?';
      params.push(filters.movement);
    }

    if (filters.period) {
      sql += ' AND period = ?';
      params.push(filters.period);
    }

    if (filters.region) {
      sql += ' AND region = ?';
      params.push(filters.region);
    }

    if (filters.search) {
      sql += ' AND (title LIKE ? OR artist LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern);
    }
  }

  sql += ' ORDER BY id';

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);

  return rows.map(rowToArtwork);
}

/**
 * Get artwork by ID
 */
export function getArtworkById(id: number): ArtworkRecord | null {
  const db = getDb();

  const stmt = db.prepare('SELECT * FROM artworks WHERE id = ?');
  const row = stmt.get(id);

  return row ? rowToArtwork(row) : null;
}

/**
 * Insert new artwork
 */
export function insertArtwork(
  artwork: Omit<ArtworkRecord, 'id' | 'createdAt' | 'updatedAt'>
): number {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO artworks (
      title, artist, year, category, medium, dimensions, location,
      region, period, movement,
      image_path, image_url, wiki_url, museum_url, commentary_path,
      selection_score, selection_rationale
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    artwork.title,
    artwork.artist,
    artwork.year,
    artwork.category,
    artwork.medium || null,
    artwork.dimensions || null,
    artwork.location || null,
    artwork.region || null,
    artwork.period || null,
    artwork.movement || null,
    artwork.imagePath || null,
    artwork.imageUrl || null,
    artwork.wikiUrl || null,
    artwork.museumUrl || null,
    artwork.commentaryPath || null,
    artwork.selectionScore || null,
    artwork.selectionRationale || null
  );

  return result.lastInsertRowid as number;
}

/**
 * Update artwork
 */
export function updateArtwork(
  id: number,
  updates: Partial<Omit<ArtworkRecord, 'id' | 'createdAt' | 'updatedAt'>>
): void {
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  // Build dynamic UPDATE query based on provided fields
  const fieldMap: Record<string, string> = {
    title: 'title',
    artist: 'artist',
    year: 'year',
    category: 'category',
    medium: 'medium',
    dimensions: 'dimensions',
    location: 'location',
    region: 'region',
    period: 'period',
    movement: 'movement',
    imagePath: 'image_path',
    imageUrl: 'image_url',
    wikiUrl: 'wiki_url',
    museumUrl: 'museum_url',
    commentaryPath: 'commentary_path',
    selectionScore: 'selection_score',
    selectionRationale: 'selection_rationale'
  };

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (key in updates) {
      fields.push(`${dbField} = ?`);
      params.push((updates as any)[key]);
    }
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  // Always update updated_at
  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const sql = `UPDATE artworks SET ${fields.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...params);
}

/**
 * Delete artwork (cascade deletes reviews and schedule)
 */
export function deleteArtwork(id: number): void {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM artworks WHERE id = ?');
  stmt.run(id);
}

// ============================================================================
// Review Queries
// ============================================================================

/**
 * Get review history for an artwork
 */
export function getReviewHistory(artworkId: number): ReviewRecord[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT * FROM reviews
    WHERE artwork_id = ?
    ORDER BY reviewed_at DESC
  `);

  const rows = stmt.all(artworkId);
  return rows.map(rowToReview);
}

/**
 * Insert new review
 */
export function insertReview(
  review: Omit<ReviewRecord, 'id'>
): number {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO reviews (
      artwork_id, quality, easiness_factor, interval_days, repetition_count, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    review.artworkId,
    review.quality,
    review.easinessFactor,
    review.intervalDays,
    review.repetitionCount,
    review.notes || null
  );

  return result.lastInsertRowid as number;
}

// ============================================================================
// Review Schedule Queries
// ============================================================================

/**
 * Get today's review queue (artworks due for review)
 */
export function getTodayReviewQueue(limit: number = 10): ArtworkRecord[] {
  const db = getDb();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const stmt = db.prepare(`
    SELECT a.*
    FROM artworks a
    INNER JOIN review_schedule rs ON a.id = rs.artwork_id
    WHERE rs.next_review_date <= ?
    ORDER BY rs.next_review_date ASC
    LIMIT ?
  `);

  const rows = stmt.all(today, limit);
  return rows.map(rowToArtwork);
}

/**
 * Initialize review schedule for an artwork
 */
export function initializeReviewSchedule(artworkId: number): void {
  const db = getDb();

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const stmt = db.prepare(`
    INSERT INTO review_schedule (
      artwork_id, next_review_date, easiness_factor, interval_days, repetition_count
    ) VALUES (?, ?, 2.5, 1, 0)
  `);

  stmt.run(artworkId, today);
}

/**
 * Update review schedule for an artwork
 */
export function updateReviewSchedule(
  artworkId: number,
  schedule: Partial<ReviewScheduleRecord>
): void {
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  const fieldMap: Record<string, string> = {
    nextReviewDate: 'next_review_date',
    easinessFactor: 'easiness_factor',
    intervalDays: 'interval_days',
    repetitionCount: 'repetition_count',
    lastReviewedAt: 'last_reviewed_at'
  };

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (key in schedule) {
      fields.push(`${dbField} = ?`);
      params.push((schedule as any)[key]);
    }
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  params.push(artworkId);

  const sql = `UPDATE review_schedule SET ${fields.join(', ')} WHERE artwork_id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...params);
}

/**
 * Get review schedule for an artwork
 */
export function getReviewSchedule(artworkId: number): ReviewScheduleRecord | null {
  const db = getDb();

  const stmt = db.prepare('SELECT * FROM review_schedule WHERE artwork_id = ?');
  const row = stmt.get(artworkId);

  return row ? rowToSchedule(row) : null;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get artwork counts by category
 */
export function getArtworkCounts(): {
  total: number;
  paintings: number;
  sculptures: number;
  architecture: number;
} {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN category = 'painting' THEN 1 ELSE 0 END) as paintings,
      SUM(CASE WHEN category = 'sculpture' THEN 1 ELSE 0 END) as sculptures,
      SUM(CASE WHEN category = 'architecture' THEN 1 ELSE 0 END) as architecture
    FROM artworks
  `);

  const result = stmt.get() as any;

  return {
    total: result.total,
    paintings: result.paintings,
    sculptures: result.sculptures,
    architecture: result.architecture
  };
}

/**
 * Get progress statistics
 */
export function getProgressStats(): {
  totalArtworks: number;
  reviewed: number;
  dueToday: number;
  upcomingReviews: number;
} {
  const db = getDb();

  const today = new Date().toISOString().split('T')[0];

  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM artworks');
  const reviewedStmt = db.prepare('SELECT COUNT(DISTINCT artwork_id) as count FROM reviews');
  const dueTodayStmt = db.prepare('SELECT COUNT(*) as count FROM review_schedule WHERE next_review_date <= ?');
  const upcomingStmt = db.prepare('SELECT COUNT(*) as count FROM review_schedule WHERE next_review_date > ?');

  const total = (totalStmt.get() as any).count;
  const reviewed = (reviewedStmt.get() as any).count;
  const dueToday = (dueTodayStmt.get(today) as any).count;
  const upcoming = (upcomingStmt.get(today) as any).count;

  return {
    totalArtworks: total,
    reviewed,
    dueToday,
    upcomingReviews: upcoming
  };
}
