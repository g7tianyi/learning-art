#!/usr/bin/env tsx

/**
 * Generate Commentary Script
 *
 * Usage:
 *   # Generate for single artwork
 *   npx tsx scripts/generate_commentary.ts --id 1
 *
 *   # Generate for all artworks
 *   npx tsx scripts/generate_commentary.ts --all
 *
 *   # Generate for specific category
 *   npx tsx scripts/generate_commentary.ts --category paintings
 *
 *   # Force regenerate existing
 *   npx tsx scripts/generate_commentary.ts --all --force
 *
 *   # Batch generate with progress
 *   npx tsx scripts/generate_commentary.ts --batch 10 --delay 2000
 */

import { generateCommentary, batchGenerateCommentaries, hasCommentary, type Artwork } from './lib/commentary';

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CLIArgs {
  id?: number;
  all?: boolean;
  category?: 'painting' | 'sculpture' | 'architecture';
  force?: boolean;
  batch?: number;
  delay?: number;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    switch (arg) {
      case '--id':
        args.id = parseInt(process.argv[++i], 10);
        break;
      case '--all':
        args.all = true;
        break;
      case '--category':
        args.category = process.argv[++i] as any;
        break;
      case '--force':
        args.force = true;
        break;
      case '--batch':
        args.batch = parseInt(process.argv[++i], 10);
        break;
      case '--delay':
        args.delay = parseInt(process.argv[++i], 10);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Commentary Generation Script

Usage:
  npx tsx scripts/generate_commentary.ts [options]

Options:
  --id <number>          Generate for specific artwork ID
  --all                  Generate for all artworks
  --category <type>      Generate for category (painting/sculpture/architecture)
  --force                Regenerate even if commentary exists
  --batch <number>       Process in batches (useful for rate limiting)
  --delay <ms>           Delay between requests (default: 1000ms)
  --help, -h             Show this help message

Examples:
  # Single artwork
  npx tsx scripts/generate_commentary.ts --id 1

  # All paintings
  npx tsx scripts/generate_commentary.ts --category painting

  # All artworks with 2 second delay
  npx tsx scripts/generate_commentary.ts --all --delay 2000

  # Force regenerate all
  npx tsx scripts/generate_commentary.ts --all --force
`);
}

// ============================================================================
// Mock Data (TODO: Replace with actual DB queries)
// ============================================================================

async function getArtwork(id: number): Promise<Artwork | null> {
  // TODO: Query from SQLite
  // SELECT * FROM artworks WHERE id = ?

  // Mock data for demonstration
  const mockArtworks: Record<number, Artwork> = {
    1: {
      id: 1,
      title: 'The Starry Night',
      artist: 'Vincent van Gogh',
      year: 1889,
      medium: 'Oil on canvas',
      dimensions: '73.7 cm × 92.1 cm',
      location: 'Museum of Modern Art, New York',
      category: 'painting',
      wikiUrl: 'https://en.wikipedia.org/wiki/The_Starry_Night',
      museumUrl: 'https://www.moma.org/collection/works/79802'
    }
  };

  return mockArtworks[id] || null;
}

async function getAllArtworks(category?: string): Promise<Artwork[]> {
  // TODO: Query from SQLite
  // SELECT * FROM artworks WHERE category = ? OR ? IS NULL

  // Mock data
  return [
    {
      id: 1,
      title: 'The Starry Night',
      artist: 'Vincent van Gogh',
      year: 1889,
      medium: 'Oil on canvas',
      category: 'painting'
    }
  ];
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = parseArgs();

  console.log('='.repeat(80));
  console.log('Commentary Generation');
  console.log('='.repeat(80));

  // Single artwork
  if (args.id) {
    const artwork = await getArtwork(args.id);

    if (!artwork) {
      console.error(`[ERROR] Artwork with ID ${args.id} not found`);
      process.exit(1);
    }

    const filePath = await generateCommentary(artwork, args.force);
    console.log(`\n[SUCCESS] Commentary generated: ${filePath}`);
    return;
  }

  // All artworks or category
  if (args.all || args.category) {
    const artworks = await getAllArtworks(args.category);

    console.log(`[INFO] Found ${artworks.length} artworks`);

    // Filter out artworks that already have commentary (unless --force)
    let toProcess = artworks;
    if (!args.force) {
      const withoutCommentary: Artwork[] = [];
      for (const artwork of artworks) {
        const exists = await hasCommentary(artwork);
        if (!exists) {
          withoutCommentary.push(artwork);
        }
      }
      toProcess = withoutCommentary;
      console.log(`[INFO] ${toProcess.length} need commentary generation`);
    }

    if (toProcess.length === 0) {
      console.log('[INFO] No artworks to process. Use --force to regenerate.');
      return;
    }

    // Batch processing
    const batchSize = args.batch || toProcess.length;
    const delay = args.delay || 1000;

    for (let i = 0; i < toProcess.length; i += batchSize) {
      const batch = toProcess.slice(i, i + batchSize);
      console.log(`\n[BATCH] Processing ${i + 1}-${i + batch.length} of ${toProcess.length}`);

      await batchGenerateCommentaries(batch, {
        force: args.force,
        rateLimit: delay,
        onProgress: (current, total) => {
          const percentage = Math.round((current / total) * 100);
          console.log(`[PROGRESS] ${current}/${total} (${percentage}%)`);
        }
      });
    }

    console.log(`\n[SUCCESS] Generated commentary for ${toProcess.length} artworks`);
    return;
  }

  // No valid arguments
  console.error('[ERROR] Please specify --id, --all, or --category');
  console.log('Use --help for usage information');
  process.exit(1);
}

// Run
main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
