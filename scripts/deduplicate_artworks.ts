#!/usr/bin/env tsx

/**
 * Deduplicate Artworks Script
 *
 * Removes duplicate artworks (same artist + title) and reports statistics
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../data/artworks-final.json');
const OUTPUT_PATH = path.join(__dirname, '../data/artworks-deduped.json');

async function main() {
  console.log('='.repeat(80));
  console.log('Artwork Deduplication');
  console.log('='.repeat(80));
  console.log(`Input: ${INPUT_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log('');

  // Load data
  const content = await fs.readFile(INPUT_PATH, 'utf-8');
  const data = JSON.parse(content);
  const artworks = data.artworks || [];

  console.log(`[INFO] Loaded ${artworks.length} artworks\n`);

  // Deduplicate by artist + title
  const seen = new Map<string, any>();
  const duplicates: any[] = [];

  for (const artwork of artworks) {
    const key = `${artwork.artist.toLowerCase().trim()}:${artwork.title.toLowerCase().trim()}`;

    if (seen.has(key)) {
      duplicates.push({
        key,
        existing: seen.get(key),
        duplicate: artwork
      });
    } else {
      seen.set(key, artwork);
    }
  }

  const unique = Array.from(seen.values());

  // Re-assign sequential IDs
  unique.forEach((artwork, index) => {
    artwork.id = index + 1;
  });

  // Statistics
  const byCat = {
    painting: unique.filter(a => a.category === 'painting').length,
    sculpture: unique.filter(a => a.category === 'sculpture').length,
    architecture: unique.filter(a => a.category === 'architecture').length,
    other: unique.filter(a => !['painting', 'sculpture', 'architecture'].includes(a.category)).length
  };

  console.log('='.repeat(80));
  console.log('Deduplication Results');
  console.log('='.repeat(80));
  console.log(`Original artworks: ${artworks.length}`);
  console.log(`Duplicates removed: ${duplicates.length}`);
  console.log(`Unique artworks: ${unique.length}`);
  console.log('');
  console.log('By category:');
  console.log(`  Paintings: ${byCat.painting}`);
  console.log(`  Sculptures: ${byCat.sculpture}`);
  console.log(`  Architecture: ${byCat.architecture}`);
  if (byCat.other > 0) {
    console.log(`  Other: ${byCat.other}`);
  }
  console.log('');

  if (duplicates.length > 0) {
    console.log('Sample duplicates (first 10):');
    duplicates.slice(0, 10).forEach(dup => {
      console.log(`  - ${dup.key} (IDs: ${dup.existing.id}, ${dup.duplicate.id})`);
    });
    console.log('');
  }

  // Save deduplicated data
  const output = {
    ...data,
    metadata: {
      ...data.metadata,
      deduplicated: new Date().toISOString(),
      originalCount: artworks.length,
      duplicatesRemoved: duplicates.length,
      uniqueCount: unique.length
    },
    artworks: unique
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✓ Saved deduplicated artworks to: ${OUTPUT_PATH}`);
  console.log('');

  // Gap analysis
  const gaps = {
    painting: 200 - byCat.painting,
    sculpture: 64 - byCat.sculpture,
    architecture: 64 - byCat.architecture
  };

  console.log('Gap Analysis (vs. targets):');
  console.log(`  Paintings: ${gaps.painting > 0 ? `Need ${gaps.painting} more` : `${Math.abs(gaps.painting)} extra`}`);
  console.log(`  Sculptures: ${gaps.sculpture > 0 ? `Need ${gaps.sculpture} more` : `${Math.abs(gaps.sculpture)} extra`}`);
  console.log(`  Architecture: ${gaps.architecture > 0 ? `Need ${gaps.architecture} more` : `${Math.abs(gaps.architecture)} extra`}`);
  console.log('');

  if (gaps.painting > 0) {
    console.log('⚠️  Need to generate more paintings to reach target of 200');
    console.log(`   Run: npx tsx scripts/generate_additional.ts --category painting --count ${gaps.painting}`);
  }

  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
