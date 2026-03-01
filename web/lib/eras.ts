/**
 * Era Data Loading and Mapping Logic
 *
 * Functions for working with art historical eras, including loading era
 * definitions, parsing introductions, and mapping artworks to eras.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Artwork } from './db';

// ============================================================================
// Types
// ============================================================================

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
  content: string; // Markdown body (without frontmatter)
}

interface ErasConfig {
  eras: Era[];
}

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = path.join(process.cwd(), '../data');
const ERAS_JSON_PATH = path.join(DATA_DIR, 'eras/eras.json');

// ============================================================================
// Era Loading Functions
// ============================================================================

/**
 * Get all eras from eras.json
 */
export function getAllEras(): Era[] {
  if (!fs.existsSync(ERAS_JSON_PATH)) {
    console.error(`[ERAS] eras.json not found at ${ERAS_JSON_PATH}`);
    return [];
  }

  try {
    const rawData = fs.readFileSync(ERAS_JSON_PATH, 'utf-8');
    const config: ErasConfig = JSON.parse(rawData);
    return config.eras.sort((a, b) => a.startYear - b.startYear);
  } catch (err) {
    console.error('[ERAS] Failed to load eras.json:', err);
    return [];
  }
}

/**
 * Get a single era by slug
 */
export function getEraBySlug(slug: string): Era | null {
  const eras = getAllEras();
  return eras.find(era => era.slug === slug) || null;
}

/**
 * Get era introduction content from Markdown file
 */
export function getEraIntroduction(slug: string): EraIntroduction | null {
  const filePath = path.join(DATA_DIR, 'eras', `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    console.error(`[ERAS] Introduction file not found: ${filePath}`);
    return null;
  }

  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter
    const frontmatterMatch = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
      console.error(`[ERAS] Invalid frontmatter in ${slug}.md`);
      return null;
    }

    const frontmatterText = frontmatterMatch[1];
    const content = frontmatterMatch[2].trim();

    // Parse frontmatter fields
    const metadata: any = {};
    frontmatterText.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*"?(.+?)"?$/);
      if (match) {
        metadata[match[1]] = match[2].replace(/^"|"$/g, '');
      }
    });

    return {
      metadata: {
        id: metadata.id || slug,
        name: metadata.name || '',
        dateRange: metadata.dateRange || '',
        generatedAt: metadata.generatedAt || '',
        model: metadata.model || '',
        promptVersion: metadata.promptVersion || ''
      },
      content
    };
  } catch (err) {
    console.error(`[ERAS] Failed to load introduction for ${slug}:`, err);
    return null;
  }
}

// ============================================================================
// Artwork-Era Mapping Logic
// ============================================================================

/**
 * Parse year from artwork year field (handles ranges like "1495-1498")
 */
export function parseYear(yearStr: string | number): number {
  if (typeof yearStr === 'number') return yearStr;

  // Extract first year from ranges like "1495-1498" or "1503-1519"
  const match = yearStr.match(/^(-?\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Get the era for a given artwork based on period, movement, and year
 */
export function getEraForArtwork(artwork: Artwork, eras: Era[]): Era | null {
  // Strategy 1: Direct period match
  if (artwork.period) {
    const periodLower = artwork.period.toLowerCase().replace(/\s+/g, '-');
    const periodMatch = eras.find(era =>
      era.id === periodLower || era.slug === periodLower
    );
    if (periodMatch) return periodMatch;
  }

  // Strategy 2: Movement-to-era mapping
  if (artwork.movement) {
    const movementEraMap: Record<string, string> = {
      'renaissance': 'renaissance',
      'mughal-architecture': 'mughal-india',
      'ukiyo-e': 'edo-japan',
      'post-impressionism': 'impressionism-post-impressionism',
      'impressionism': 'impressionism-post-impressionism',
      'cubism': 'modern',
      'surrealism': 'modern',
      'realism': 'impressionism-post-impressionism',
      'organic-architecture': 'modern',
      'abstract-expressionism': 'modern',
      'fauvism': 'modern',
      'expressionism': 'modern',
      'dadaism': 'modern',
      'constructivism': 'modern'
    };

    const movementKey = artwork.movement.toLowerCase().replace(/\s+/g, '-');
    const mappedEraId = movementEraMap[movementKey];
    if (mappedEraId) {
      const movementMatch = eras.find(era => era.id === mappedEraId);
      if (movementMatch) return movementMatch;
    }
  }

  // Strategy 3: Year-based fallback
  const year = parseYear(artwork.year);
  if (year > 0) {
    const yearMatch = eras.find(era => year >= era.startYear && year < era.endYear);
    if (yearMatch) return yearMatch;
  }

  return null;
}

/**
 * Get artworks for a specific era
 */
export function getArtworksByEra(artworks: Artwork[], eraId: string, eras: Era[]): Artwork[] {
  const era = eras.find(e => e.id === eraId);
  if (!era) return [];

  return artworks.filter(artwork => {
    const artworkEra = getEraForArtwork(artwork, eras);
    return artworkEra?.id === eraId;
  });
}

/**
 * Get artwork count statistics for all eras
 */
export function getEraStats(artworks: Artwork[], eras: Era[]): { eraId: string; count: number }[] {
  return eras.map(era => ({
    eraId: era.id,
    count: getArtworksByEra(artworks, era.id, eras).length
  }));
}

/**
 * Get previous and next eras (chronologically)
 */
export function getAdjacentEras(currentSlug: string, eras: Era[]): {
  prev: Era | null;
  next: Era | null;
} {
  const sortedEras = eras.sort((a, b) => a.startYear - b.startYear);
  const currentIndex = sortedEras.findIndex(era => era.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? sortedEras[currentIndex - 1] : null,
    next: currentIndex < sortedEras.length - 1 ? sortedEras[currentIndex + 1] : null
  };
}
