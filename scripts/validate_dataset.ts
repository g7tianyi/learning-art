#!/usr/bin/env tsx

/**
 * Dataset Validation Script
 *
 * Validates the quality and completeness of the artwork dataset.
 * Checks for missing fields, broken URLs, diversity quotas, and data quality issues.
 *
 * Usage:
 *   npx tsx scripts/validate_dataset.ts [--input <path>]
 *
 * Options:
 *   --input <path>    Input JSON file (default: data/artworks-final.json)
 *   --strict          Exit with error code if validation fails
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

interface ArtworkData {
  id: number;
  title: string;
  artist: string;
  year: number | string;
  category: 'painting' | 'sculpture' | 'architecture';
  medium?: string;
  dimensions?: string;
  location?: string;
  region: string;
  period: string;
  movement?: string;
  imageUrl?: string;
  wikiUrl?: string;
  museumUrl?: string;
  scores?: {
    historicalSignificance?: number;
    culturalImpact?: number;
    technicalInnovation?: number;
    pedagogicalValue?: number;
    diversityContribution?: number;
    weighted?: number;
  };
  selectionRationale?: string;
}

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
    byRegion: Record<string, number>;
    byPeriod: Record<string, number>;
    missingFields: Record<string, number>;
    diversity: {
      nonWesternPercent: number;
      regionCount: number;
      periodCount: number;
    };
  };
}

// ============================================================================
// Configuration
// ============================================================================

const INPUT_PATH = process.argv.find(arg => arg.startsWith('--input='))?.split('=')[1]
  || path.join(__dirname, '../data/artworks-final.json');
const STRICT_MODE = process.argv.includes('--strict');

const REQUIRED_FIELDS = ['id', 'title', 'artist', 'year', 'category', 'region', 'period'];
const RECOMMENDED_FIELDS = ['medium', 'dimensions', 'location', 'imageUrl', 'wikiUrl'];

const TARGET_COUNTS = {
  painting: 200,
  sculpture: 64,
  architecture: 64
};

const DIVERSITY_TARGETS = {
  nonWesternMin: 40, // Minimum % of non-Western works
  minRegions: 5, // Minimum number of different regions
  minPeriods: 8  // Minimum number of different periods
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check for missing required fields
 */
function validateRequiredFields(artworks: ArtworkData[]): { errors: string[], missingFields: Record<string, number> } {
  const errors: string[] = [];
  const missingFields: Record<string, number> = {};

  for (const artwork of artworks) {
    for (const field of REQUIRED_FIELDS) {
      if (!(field in artwork) || artwork[field as keyof ArtworkData] === null || artwork[field as keyof ArtworkData] === undefined || artwork[field as keyof ArtworkData] === '') {
        errors.push(`Artwork ${artwork.id} (${artwork.title}): Missing required field '${field}'`);
        missingFields[field] = (missingFields[field] || 0) + 1;
      }
    }
  }

  return { errors, missingFields };
}

/**
 * Check for recommended fields
 */
function validateRecommendedFields(artworks: ArtworkData[]): { warnings: string[], missingFields: Record<string, number> } {
  const warnings: string[] = [];
  const missingFields: Record<string, number> = {};

  for (const artwork of artworks) {
    for (const field of RECOMMENDED_FIELDS) {
      if (!(field in artwork) || artwork[field as keyof ArtworkData] === null || artwork[field as keyof ArtworkData] === undefined || artwork[field as keyof ArtworkData] === '') {
        missingFields[field] = (missingFields[field] || 0) + 1;
      }
    }
  }

  // Only warn if significant percentage missing
  for (const [field, count] of Object.entries(missingFields)) {
    const percent = (count / artworks.length) * 100;
    if (percent > 10) {
      warnings.push(`${count} artworks (${percent.toFixed(1)}%) missing recommended field '${field}'`);
    }
  }

  return { warnings, missingFields };
}

/**
 * Validate category distribution
 */
function validateCategoryDistribution(artworks: ArtworkData[]): { errors: string[], warnings: string[], stats: Record<string, number> } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts: Record<string, number> = {};

  for (const artwork of artworks) {
    counts[artwork.category] = (counts[artwork.category] || 0) + 1;
  }

  // Check against targets
  for (const [category, target] of Object.entries(TARGET_COUNTS)) {
    const actual = counts[category] || 0;
    const diff = Math.abs(actual - target);
    const percent = (diff / target) * 100;

    if (actual < target * 0.9) {
      errors.push(`Category '${category}': Only ${actual}/${target} artworks (${(actual / target * 100).toFixed(1)}%)`);
    } else if (diff > 0) {
      warnings.push(`Category '${category}': ${actual}/${target} artworks (off by ${diff})`);
    }
  }

  return { errors, warnings, stats: counts };
}

/**
 * Validate diversity quotas
 */
function validateDiversity(artworks: ArtworkData[]): { errors: string[], warnings: string[], stats: any } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const regionCounts: Record<string, number> = {};
  const periodCounts: Record<string, number> = {};

  for (const artwork of artworks) {
    regionCounts[artwork.region] = (regionCounts[artwork.region] || 0) + 1;
    periodCounts[artwork.period] = (periodCounts[artwork.period] || 0) + 1;
  }

  // Calculate non-Western percentage
  const westernRegions = ['Western Europe', 'North America'];
  const nonWesternCount = Object.entries(regionCounts)
    .filter(([region]) => !westernRegions.includes(region))
    .reduce((sum, [, count]) => sum + count, 0);

  const nonWesternPercent = (nonWesternCount / artworks.length) * 100;

  if (nonWesternPercent < DIVERSITY_TARGETS.nonWesternMin) {
    errors.push(`Non-Western representation: ${nonWesternPercent.toFixed(1)}% (target: ≥${DIVERSITY_TARGETS.nonWesternMin}%)`);
  }

  // Check region diversity
  const regionCount = Object.keys(regionCounts).length;
  if (regionCount < DIVERSITY_TARGETS.minRegions) {
    warnings.push(`Only ${regionCount} different regions (target: ≥${DIVERSITY_TARGETS.minRegions})`);
  }

  // Check period diversity
  const periodCount = Object.keys(periodCounts).length;
  if (periodCount < DIVERSITY_TARGETS.minPeriods) {
    warnings.push(`Only ${periodCount} different periods (target: ≥${DIVERSITY_TARGETS.minPeriods})`);
  }

  return {
    errors,
    warnings,
    stats: {
      nonWesternPercent,
      regionCount,
      periodCount,
      regionBreakdown: regionCounts,
      periodBreakdown: periodCounts
    }
  };
}

/**
 * Validate URLs (sample check)
 */
async function validateURLs(artworks: ArtworkData[], sampleSize: number = 10): Promise<{ errors: string[], warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Sample random artworks
  const sample = artworks
    .filter(a => a.imageUrl || a.wikiUrl)
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleSize);

  console.log(`  Checking ${sample.length} sample URLs...`);

  for (const artwork of sample) {
    // Check image URL
    if (artwork.imageUrl) {
      try {
        const response = await fetch(artwork.imageUrl, { method: 'HEAD', timeout: 5000 } as any);
        if (!response.ok) {
          errors.push(`Artwork ${artwork.id}: Image URL returns ${response.status}`);
        }
      } catch (err) {
        warnings.push(`Artwork ${artwork.id}: Image URL check failed (${(err as Error).message})`);
      }
    }

    // Check wiki URL
    if (artwork.wikiUrl) {
      try {
        const response = await fetch(artwork.wikiUrl, { method: 'HEAD', timeout: 5000 } as any);
        if (!response.ok) {
          errors.push(`Artwork ${artwork.id}: Wiki URL returns ${response.status}`);
        }
      } catch (err) {
        warnings.push(`Artwork ${artwork.id}: Wiki URL check failed (${(err as Error).message})`);
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { errors, warnings };
}

/**
 * Check for duplicates
 */
function validateDuplicates(artworks: ArtworkData[]): { errors: string[], warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const titleMap = new Map<string, number[]>();
  const artistTitleMap = new Map<string, number[]>();

  for (const artwork of artworks) {
    const titleKey = artwork.title.toLowerCase().trim();
    const artistTitleKey = `${artwork.artist.toLowerCase()}:${titleKey}`;

    if (!titleMap.has(titleKey)) {
      titleMap.set(titleKey, []);
    }
    titleMap.get(titleKey)!.push(artwork.id);

    if (!artistTitleMap.has(artistTitleKey)) {
      artistTitleMap.set(artistTitleKey, []);
    }
    artistTitleMap.get(artistTitleKey)!.push(artwork.id);
  }

  // Check for exact duplicates (same artist + title)
  for (const [key, ids] of artistTitleMap.entries()) {
    if (ids.length > 1) {
      errors.push(`Duplicate artwork: "${key}" appears ${ids.length} times (IDs: ${ids.join(', ')})`);
    }
  }

  // Check for potential duplicates (same title, different artist - might be legitimate)
  for (const [title, ids] of titleMap.entries()) {
    if (ids.length > 1) {
      const artists = ids.map(id => artworks.find(a => a.id === id)?.artist).filter(Boolean);
      const uniqueArtists = new Set(artists);
      if (uniqueArtists.size > 1) {
        warnings.push(`Multiple artworks titled "${title}" by different artists (${Array.from(uniqueArtists).join(', ')})`);
      }
    }
  }

  return { errors, warnings };
}

// ============================================================================
// Main Validation
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('Dataset Validation');
  console.log('='.repeat(80));
  console.log(`Input: ${INPUT_PATH}`);
  console.log(`Strict mode: ${STRICT_MODE ? 'Yes' : 'No'}`);
  console.log('');

  // Load artworks
  const content = await fs.readFile(INPUT_PATH, 'utf-8');
  const data = JSON.parse(content);
  const artworks: ArtworkData[] = data.artworks || [];

  console.log(`[INFO] Loaded ${artworks.length} artworks`);
  console.log('');

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: [],
    stats: {
      total: artworks.length,
      byCategory: {},
      byRegion: {},
      byPeriod: {},
      missingFields: {},
      diversity: {
        nonWesternPercent: 0,
        regionCount: 0,
        periodCount: 0
      }
    }
  };

  // 1. Required fields
  console.log('[1/6] Validating required fields...');
  const requiredCheck = validateRequiredFields(artworks);
  result.errors.push(...requiredCheck.errors);
  Object.assign(result.stats.missingFields, requiredCheck.missingFields);

  // 2. Recommended fields
  console.log('[2/6] Validating recommended fields...');
  const recommendedCheck = validateRecommendedFields(artworks);
  result.warnings.push(...recommendedCheck.warnings);

  // 3. Category distribution
  console.log('[3/6] Validating category distribution...');
  const categoryCheck = validateCategoryDistribution(artworks);
  result.errors.push(...categoryCheck.errors);
  result.warnings.push(...categoryCheck.warnings);
  result.stats.byCategory = categoryCheck.stats;

  // 4. Diversity
  console.log('[4/6] Validating diversity quotas...');
  const diversityCheck = validateDiversity(artworks);
  result.errors.push(...diversityCheck.errors);
  result.warnings.push(...diversityCheck.warnings);
  result.stats.diversity = diversityCheck.stats;
  result.stats.byRegion = diversityCheck.stats.regionBreakdown;
  result.stats.byPeriod = diversityCheck.stats.periodBreakdown;

  // 5. Duplicates
  console.log('[5/6] Checking for duplicates...');
  const duplicateCheck = validateDuplicates(artworks);
  result.errors.push(...duplicateCheck.errors);
  result.warnings.push(...duplicateCheck.warnings);

  // 6. URLs (sample)
  console.log('[6/6] Validating URLs (sample check)...');
  const urlCheck = await validateURLs(artworks, 10);
  result.errors.push(...urlCheck.errors);
  result.warnings.push(...urlCheck.warnings);

  // Determine pass/fail
  result.passed = result.errors.length === 0;

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('Validation Results');
  console.log('='.repeat(80));

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('✅ ALL CHECKS PASSED!');
  } else {
    if (result.errors.length > 0) {
      console.log(`\n❌ ERRORS (${result.errors.length}):`);
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${result.warnings.length}):`);
      result.warnings.forEach(warn => console.log(`  - ${warn}`));
    }
  }

  // Print statistics
  console.log('\n' + '-'.repeat(80));
  console.log('Dataset Statistics');
  console.log('-'.repeat(80));
  console.log(`Total artworks: ${result.stats.total}`);
  console.log(`\nBy category:`);
  Object.entries(result.stats.byCategory).forEach(([cat, count]) => {
    const target = TARGET_COUNTS[cat as keyof typeof TARGET_COUNTS];
    console.log(`  ${cat}: ${count}/${target} (${(count / target * 100).toFixed(1)}%)`);
  });

  console.log(`\nDiversity:`);
  console.log(`  Non-Western works: ${result.stats.diversity.nonWesternPercent.toFixed(1)}% (target: ≥${DIVERSITY_TARGETS.nonWesternMin}%)`);
  console.log(`  Regions represented: ${result.stats.diversity.regionCount}`);
  console.log(`  Periods represented: ${result.stats.diversity.periodCount}`);

  console.log(`\nTop regions:`);
  Object.entries(result.stats.byRegion)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([region, count]) => {
      console.log(`  ${region}: ${count} (${(count / result.stats.total * 100).toFixed(1)}%)`);
    });

  console.log(`\nTop periods:`);
  Object.entries(result.stats.byPeriod)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([period, count]) => {
      console.log(`  ${period}: ${count} (${(count / result.stats.total * 100).toFixed(1)}%)`);
    });

  console.log('\n' + '='.repeat(80));

  if (result.passed) {
    console.log('✅ VALIDATION PASSED');
    process.exit(0);
  } else {
    console.log('❌ VALIDATION FAILED');
    if (STRICT_MODE) {
      process.exit(1);
    } else {
      console.log('(Not exiting with error because --strict was not specified)');
      process.exit(0);
    }
  }
}

// Run
main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
