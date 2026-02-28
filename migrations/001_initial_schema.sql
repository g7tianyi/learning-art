-- Migration: 001_initial_schema
-- Description: Create initial database schema for artworks, reviews, and review schedule
-- Created: 2026-02-28

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================================================
-- Table: artworks
-- Stores core artwork metadata
-- ============================================================================

CREATE TABLE artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year TEXT, -- Can be integer year or range like "1889-1890"
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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_artist ON artworks(artist);
CREATE INDEX idx_artworks_movement ON artworks(movement);
CREATE INDEX idx_artworks_period ON artworks(period);
CREATE INDEX idx_artworks_region ON artworks(region);

-- ============================================================================
-- Table: reviews
-- Stores historical review records for SM-2 algorithm
-- ============================================================================

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- SM-2 data
  quality INTEGER NOT NULL CHECK(quality BETWEEN 0 AND 5), -- 0-5 (SM-2 standard)
  easiness_factor REAL NOT NULL, -- EF value after this review
  interval_days INTEGER NOT NULL, -- Next review interval in days
  repetition_count INTEGER NOT NULL, -- Number of successful reviews

  -- User notes (optional)
  notes TEXT,

  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_artwork ON reviews(artwork_id);
CREATE INDEX idx_reviews_date ON reviews(reviewed_at);

-- ============================================================================
-- Table: review_schedule
-- Stores the current review schedule (next review date for each artwork)
-- ============================================================================

CREATE TABLE review_schedule (
  artwork_id INTEGER PRIMARY KEY,
  next_review_date TEXT NOT NULL, -- ISO 8601 date
  easiness_factor REAL NOT NULL DEFAULT 2.5, -- SM-2 initial EF
  interval_days INTEGER NOT NULL DEFAULT 1, -- Current interval
  repetition_count INTEGER NOT NULL DEFAULT 0, -- Times reviewed successfully
  last_reviewed_at TEXT, -- Last review timestamp

  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX idx_schedule_next_review ON review_schedule(next_review_date);

-- ============================================================================
-- Table: migrations
-- Tracks applied migrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
