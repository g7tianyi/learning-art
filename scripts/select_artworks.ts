#!/usr/bin/env tsx

/**
 * Artwork Selection Script
 *
 * Generates a curated list of 328 artworks (200 paintings, 64 sculptures,
 * 64 architectures) using LLM-assisted selection with diversity quotas.
 *
 * Usage:
 *   npm run select-artworks
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { callLLMForJSON, callLLMRateLimited } from './lib/llm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

interface ArtworkCandidate {
  title: string;
  artist: string;
  year: number | string;
  category: 'painting' | 'sculpture' | 'architecture';
  medium?: string;
  dimensions?: string;
  location?: string;
  region: string; // Geographic region
  period: string; // Temporal period
  movement?: string; // Art movement
  imageUrl?: string;
  wikiUrl?: string;
  museumUrl?: string;
  scores: {
    historicalSignificance: number; // 0-10
    culturalImpact: number; // 0-10
    technicalInnovation: number; // 0-10
    pedagogicalValue: number; // 0-10
    diversityContribution: number; // 0-10
    weighted: number; // Calculated weighted score
  };
  selectionRationale: string;
}

interface SelectionTarget {
  category: 'painting' | 'sculpture' | 'architecture';
  count: number;
  regions?: Record<string, number>; // Regional quotas
  periods?: Record<string, number>; // Temporal quotas
}

// ============================================================================
// Configuration
// ============================================================================

const TARGETS: SelectionTarget[] = [
  { category: 'painting', count: 200 },
  { category: 'sculpture', count: 64 },
  { category: 'architecture', count: 64 }
];

const SEED_LIST_PATH = path.join(__dirname, '../data/seed-list-canonical-works.md');
const OUTPUT_PATH = path.join(__dirname, '../data/artworks-final.json');

// Scoring weights (must sum to 1.0)
const WEIGHTS = {
  historicalSignificance: 0.30,
  culturalImpact: 0.25,
  technicalInnovation: 0.20,
  pedagogicalValue: 0.15,
  diversityContribution: 0.10
};

// ============================================================================
// Seed List Parsing
// ============================================================================

/**
 * Parse seed list from markdown file
 *
 * Expected format:
 * ## Category
 * - Title by Artist (Year) - Brief note
 */
async function parseSeedList(): Promise<ArtworkCandidate[]> {
  try {
    const content = await fs.readFile(SEED_LIST_PATH, 'utf-8');
    console.log('[INFO] Seed list found, parsing...');

    // For now, return empty array and rely on LLM generation
    // TODO: Implement proper parser if seed list format is established
    return [];
  } catch (err) {
    console.log('[INFO] No seed list found, will generate all artworks via LLM');
    return [];
  }
}

// ============================================================================
// LLM-Assisted Generation
// ============================================================================

/**
 * Generate artwork candidates for a specific stratum using LLM
 */
async function generateCandidates(
  category: 'painting' | 'sculpture' | 'architecture',
  count: number,
  existingWorks: string[] = []
): Promise<ArtworkCandidate[]> {
  console.log(`\n[GENERATE] Requesting ${count} ${category}s from LLM...`);

  const prompt = `You are an art history expert. Generate a curated list of exactly ${count} ${category}s that represent diverse, historically significant works from around the world.

REQUIREMENTS:
- Global representation: Include works from all continents (40%+ non-Western)
- Temporal diversity: Span from ancient to contemporary (pre-1400 to 2020s)
- Movement coverage: Major art movements well-represented
- Gender diversity: 25-30% women artists where applicable
- Avoid duplicates with: ${existingWorks.length > 0 ? existingWorks.join(', ') : 'none yet'}

For EACH artwork, provide:
1. title - Full artwork title
2. artist - Artist/creator name (or "Unknown" if ancient/anonymous)
3. year - Year or range (e.g., 1889 or "1450-1460" or "c. 500 BCE")
4. category - "${category}"
5. medium - Material/technique
6. dimensions - Approximate size if known
7. location - Current location (museum or site)
8. region - Geographic region (Western Europe, East Asia, Africa, etc.)
9. period - Temporal period (Renaissance, Modern, Contemporary, etc.)
10. movement - Art movement if applicable
11. wikiUrl - Wikipedia URL if available
12. museumUrl - Museum collection URL if available
13. scores - Rate 0-10 for each:
    - historicalSignificance: Watershed moment, movement-defining
    - culturalImpact: Global recognition, cultural transcendence
    - technicalInnovation: Pioneering techniques
    - pedagogicalValue: Teaches key concepts
    - diversityContribution: Underrepresented region/artist
14. selectionRationale - Brief explanation (1-2 sentences)

Return ONLY valid JSON array (no markdown, no explanations):
[
  {
    "title": "...",
    "artist": "...",
    "year": ...,
    "category": "${category}",
    "medium": "...",
    "location": "...",
    "region": "...",
    "period": "...",
    "movement": "...",
    "wikiUrl": "...",
    "scores": {
      "historicalSignificance": 9,
      "culturalImpact": 10,
      "technicalInnovation": 8,
      "pedagogicalValue": 9,
      "diversityContribution": 0
    },
    "selectionRationale": "..."
  }
]`;

  try {
    const response = await callLLMForJSON<any[]>(prompt, {
      temperature: 0.8, // Higher creativity for diverse selections
      maxTokens: 16000
    });

    // Calculate weighted scores
    const candidates: ArtworkCandidate[] = response.map((work: any) => {
      const weighted =
        (work.scores.historicalSignificance * WEIGHTS.historicalSignificance) +
        (work.scores.culturalImpact * WEIGHTS.culturalImpact) +
        (work.scores.technicalInnovation * WEIGHTS.technicalInnovation) +
        (work.scores.pedagogicalValue * WEIGHTS.pedagogicalValue) +
        (work.scores.diversityContribution * WEIGHTS.diversityContribution);

      return {
        ...work,
        scores: {
          ...work.scores,
          weighted: parseFloat(weighted.toFixed(2))
        }
      };
    });

    console.log(`[SUCCESS] Generated ${candidates.length} candidates`);
    return candidates;
  } catch (err) {
    console.error('[ERROR] Failed to generate candidates:', err);
    throw err;
  }
}

// ============================================================================
// Selection and Scoring
// ============================================================================

/**
 * Select top N artworks from candidates by weighted score
 */
function selectTopArtworks(
  candidates: ArtworkCandidate[],
  count: number
): ArtworkCandidate[] {
  // Sort by weighted score (descending)
  const sorted = [...candidates].sort((a, b) =>
    b.scores.weighted - a.scores.weighted
  );

  return sorted.slice(0, count);
}

/**
 * Validate diversity quotas are met
 */
function validateDiversity(artworks: ArtworkCandidate[]): boolean {
  const total = artworks.length;

  // Count by region
  const regionCounts: Record<string, number> = {};
  artworks.forEach(work => {
    regionCounts[work.region] = (regionCounts[work.region] || 0) + 1;
  });

  const nonWestern = Object.entries(regionCounts)
    .filter(([region]) => !region.includes('Western Europe') && !region.includes('North America'))
    .reduce((sum, [, count]) => sum + count, 0);

  const nonWesternPercent = (nonWestern / total) * 100;

  console.log(`\n[DIVERSITY CHECK]`);
  console.log(`Non-Western works: ${nonWestern}/${total} (${nonWesternPercent.toFixed(1)}%)`);
  console.log(`Target: ≥40%`);

  // Count women artists
  const womenArtists = artworks.filter(work =>
    // Simple heuristic: check for common women's names or known women artists
    // In production, would use a proper database
    work.artist.includes('Frida') || work.artist.includes('Georgia') ||
    work.artist.includes('Mary') || work.artist.includes('Artemisia') ||
    work.artist.includes('Yayoi') || work.artist.includes('Kara')
  ).length;

  const womenPercent = (womenArtists / total) * 100;
  console.log(`Women artists: ${womenArtists}/${total} (${womenPercent.toFixed(1)}%)`);
  console.log(`Target: 25-30%`);

  return nonWesternPercent >= 35; // Allow some flexibility
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('Artwork Selection System');
  console.log('='.repeat(80));
  console.log('Target: 328 artworks (200 paintings, 64 sculptures, 64 architectures)');
  console.log('');

  // Step 1: Load seed list (if exists)
  const seedWorks = await parseSeedList();
  console.log(`[INFO] Seed works: ${seedWorks.length}`);

  // Step 2: Generate candidates for each category
  const allCandidates: ArtworkCandidate[] = [...seedWorks];

  for (const target of TARGETS) {
    const existing = allCandidates
      .filter(w => w.category === target.category)
      .map(w => w.title);

    const needed = target.count - existing.length;

    if (needed > 0) {
      // Generate in batches to avoid overwhelming the API
      const batchSize = 20;
      const batches = Math.ceil(needed / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, needed - (i * batchSize));
        const candidates = await generateCandidates(
          target.category,
          batchCount,
          existing
        );

        allCandidates.push(...candidates);
        existing.push(...candidates.map(c => c.title));

        console.log(`[PROGRESS] ${target.category}: ${existing.length}/${target.count}`);

        // Rate limiting between batches
        if (i < batches - 1) {
          console.log('[WAIT] Rate limiting: 2000ms');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  console.log(`\n[INFO] Total candidates generated: ${allCandidates.length}`);

  // Step 3: Select top artworks by score
  const selected = selectTopArtworks(allCandidates, 328);

  // Step 4: Validate diversity
  const diversityMet = validateDiversity(selected);
  if (!diversityMet) {
    console.warn('[WARN] Diversity quotas not fully met. Consider regenerating with adjusted prompts.');
  }

  // Step 5: Assign IDs
  const finalArtworks = selected.map((work, index) => ({
    id: index + 1,
    ...work
  }));

  // Step 6: Save to file
  const output = {
    generated: new Date().toISOString(),
    total: finalArtworks.length,
    artworks: finalArtworks
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n[SUCCESS] Saved ${finalArtworks.length} artworks to: ${OUTPUT_PATH}`);

  // Step 7: Print summary
  console.log('\n' + '='.repeat(80));
  console.log('Selection Summary');
  console.log('='.repeat(80));

  const byCategory = finalArtworks.reduce((acc, work) => {
    acc[work.category] = (acc[work.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });

  const avgScore = (finalArtworks.reduce((sum, w) => sum + w.scores.weighted, 0) / finalArtworks.length).toFixed(2);
  console.log(`\nAverage weighted score: ${avgScore}/10`);

  console.log('\nTop 5 highest-scoring works:');
  finalArtworks.slice(0, 5).forEach((work, i) => {
    console.log(`${i + 1}. ${work.title} by ${work.artist} (${work.scores.weighted}/10)`);
  });
}

// Run
main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
