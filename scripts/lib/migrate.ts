/**
 * Database Migration System
 *
 * Manages SQLite schema migrations with automatic backup and rollback support.
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

export interface Migration {
  version: string;
  description: string;
  sql: string;
  filename: string;
}

export interface MigrationRecord {
  id: number;
  version: string;
  appliedAt: string;
  description: string | null;
}

// ============================================================================
// Configuration
// ============================================================================

const DB_PATH = path.join(__dirname, '../../data/artworks.db');
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

// ============================================================================
// Database Connection
// ============================================================================

/**
 * Get database connection (create if doesn't exist)
 */
export function getDb(): Database.Database {
  // Ensure data directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  return db;
}

/**
 * Close database connection
 */
export function closeDb(db: Database.Database): void {
  db.close();
}

// ============================================================================
// Migration Discovery
// ============================================================================

/**
 * Load all migration files from migrations directory
 */
export function loadMigrations(): Migration[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Lexicographic sort (001_*.sql, 002_*.sql, etc.)

  const migrations: Migration[] = [];

  for (const filename of files) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Extract version from filename (e.g., "001" from "001_initial_schema.sql")
    const versionMatch = filename.match(/^(\d+)_/);
    if (!versionMatch) {
      console.warn(`[WARN] Skipping invalid migration filename: ${filename}`);
      continue;
    }

    const version = versionMatch[1];

    // Extract description from SQL comments
    const descMatch = sql.match(/--\s*Description:\s*(.+)/i);
    const description = descMatch ? descMatch[1].trim() : filename;

    migrations.push({
      version,
      description,
      sql,
      filename
    });
  }

  return migrations;
}

// ============================================================================
// Migration Tracking
// ============================================================================

/**
 * Ensure migrations table exists
 */
function ensureMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    )
  `);
}

/**
 * Get list of applied migrations
 */
export function getAppliedMigrations(db: Database.Database): MigrationRecord[] {
  ensureMigrationsTable(db);

  const stmt = db.prepare(`
    SELECT id, version, applied_at as appliedAt, description
    FROM migrations
    ORDER BY version
  `);

  return stmt.all() as MigrationRecord[];
}

/**
 * Record a migration as applied
 */
function recordMigration(db: Database.Database, migration: Migration): void {
  const stmt = db.prepare(`
    INSERT INTO migrations (version, description)
    VALUES (?, ?)
  `);

  stmt.run(migration.version, migration.description);
}

// ============================================================================
// Backup
// ============================================================================

/**
 * Create backup of database before migration
 */
export function createBackup(): string | null {
  if (!fs.existsSync(DB_PATH)) {
    return null; // No database to backup yet
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${DB_PATH}.backup-${timestamp}`;

  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`[BACKUP] Created: ${backupPath}`);

  return backupPath;
}

/**
 * Restore database from backup
 */
export function restoreBackup(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  fs.copyFileSync(backupPath, DB_PATH);
  console.log(`[RESTORE] Restored from: ${backupPath}`);
}

// ============================================================================
// Migration Execution
// ============================================================================

/**
 * Apply a single migration
 */
function applyMigration(db: Database.Database, migration: Migration): void {
  console.log(`[MIGRATE] Applying ${migration.version}: ${migration.description}`);

  try {
    // Execute migration SQL
    db.exec(migration.sql);

    // Record migration
    recordMigration(db, migration);

    console.log(`[SUCCESS] Applied ${migration.version}`);
  } catch (err) {
    console.error(`[ERROR] Failed to apply ${migration.version}:`, err);
    throw err;
  }
}

/**
 * Run all pending migrations
 */
export function runMigrations(options: { dryRun?: boolean } = {}): void {
  const { dryRun = false } = options;

  console.log('='.repeat(80));
  console.log('Database Migration');
  console.log('='.repeat(80));
  console.log(`Database: ${DB_PATH}`);
  console.log(`Migrations: ${MIGRATIONS_DIR}`);
  console.log('');

  // Load all migrations
  const allMigrations = loadMigrations();
  console.log(`[INFO] Found ${allMigrations.length} migration files`);

  if (allMigrations.length === 0) {
    console.log('[WARN] No migrations to apply');
    return;
  }

  // Connect to database
  const db = getDb();

  try {
    // Get applied migrations
    const appliedMigrations = getAppliedMigrations(db);
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));
    console.log(`[INFO] ${appliedMigrations.length} migrations already applied`);

    // Find pending migrations
    const pendingMigrations = allMigrations.filter(m => !appliedVersions.has(m.version));

    if (pendingMigrations.length === 0) {
      console.log('[INFO] No pending migrations');
      return;
    }

    console.log(`[INFO] ${pendingMigrations.length} pending migrations`);
    console.log('');

    if (dryRun) {
      console.log('[DRY RUN] Would apply:');
      pendingMigrations.forEach(m => {
        console.log(`  - ${m.version}: ${m.description}`);
      });
      return;
    }

    // Create backup before migrating
    createBackup();

    // Apply each pending migration
    for (const migration of pendingMigrations) {
      applyMigration(db, migration);
    }

    console.log('');
    console.log('[SUCCESS] All migrations applied successfully');
  } catch (err) {
    console.error('[FATAL] Migration failed:', err);
    throw err;
  } finally {
    closeDb(db);
  }
}

/**
 * Get migration status (applied vs pending)
 */
export function getMigrationStatus(): {
  applied: MigrationRecord[];
  pending: Migration[];
} {
  const db = getDb();

  try {
    const allMigrations = loadMigrations();
    const appliedMigrations = getAppliedMigrations(db);
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));

    const pending = allMigrations.filter(m => !appliedVersions.has(m.version));

    return {
      applied: appliedMigrations,
      pending
    };
  } finally {
    closeDb(db);
  }
}
