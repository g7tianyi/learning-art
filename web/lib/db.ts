/**
 * Database Access Layer for Web App
 *
 * Provides functions to query artworks and review data from SQLite.
 */

import Database from 'better-sqlite3';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface Artwork {
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
  selectionScore?: number;
  selectionRationale?: string;
}

export interface ReviewSchedule {
  artworkId: number;
  nextReviewDate: string;
  easinessFactor: number;
  intervalDays: number;
  repetitionCount: number;
  lastReviewedAt?: string;
}

// ============================================================================
// Database Connection
// ============================================================================

const DB_PATH = path.join(process.cwd(), '../data/artworks.db');

function getDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  return db;
}

// ============================================================================
// Artwork Queries
// ============================================================================

export function getAllArtworks(): Artwork[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM artworks ORDER BY id').all();
  db.close();

  return rows.map((row: any) => ({
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
    selectionScore: row.selection_score,
    selectionRationale: row.selection_rationale
  }));
}

export function getArtworkById(id: number): Artwork | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM artworks WHERE id = ?').get(id);
  db.close();

  if (!row) return null;

  return {
    id: (row as any).id,
    title: (row as any).title,
    artist: (row as any).artist,
    year: (row as any).year,
    category: (row as any).category,
    medium: (row as any).medium,
    dimensions: (row as any).dimensions,
    location: (row as any).location,
    region: (row as any).region,
    period: (row as any).period,
    movement: (row as any).movement,
    imagePath: (row as any).image_path,
    imageUrl: (row as any).image_url,
    wikiUrl: (row as any).wiki_url,
    museumUrl: (row as any).museum_url,
    selectionScore: (row as any).selection_score,
    selectionRationale: (row as any).selection_rationale
  };
}

export function getArtworksByCategory(category: string): Artwork[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM artworks WHERE category = ? ORDER BY id').all(category);
  db.close();

  return rows.map((row: any) => ({
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
    selectionScore: row.selection_score,
    selectionRationale: row.selection_rationale
  }));
}

// ============================================================================
// Review Queries
// ============================================================================

export function getTodayReviewQueue(limit: number = 10): Artwork[] {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT a.*
    FROM artworks a
    INNER JOIN review_schedule rs ON a.id = rs.artwork_id
    WHERE rs.next_review_date <= ?
    ORDER BY rs.next_review_date ASC
    LIMIT ?
  `).all(today, limit);

  db.close();

  return rows.map((row: any) => ({
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
    selectionScore: row.selection_score,
    selectionRationale: row.selection_rationale
  }));
}

export function getProgressStats() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const total = db.prepare('SELECT COUNT(*) as count FROM artworks').get() as any;
  const reviewed = db.prepare('SELECT COUNT(DISTINCT artwork_id) as count FROM reviews').get() as any;
  const dueToday = db.prepare('SELECT COUNT(*) as count FROM review_schedule WHERE next_review_date <= ?').get(today) as any;

  db.close();

  return {
    totalArtworks: total.count,
    reviewed: reviewed.count,
    dueToday: dueToday.count
  };
}
