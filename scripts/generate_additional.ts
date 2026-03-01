#!/usr/bin/env tsx

/**
 * Generate Additional Artworks (Avoiding Duplicates)
 *
 * Generates missing artworks to reach targets, with deduplication awareness
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent } from 'undici';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure proxy
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
(global as any).dispatcher = proxyAgent;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../data/artworks-deduped.json');
const OUTPUT_PATH = path.join(__dirname, '../data/artworks-complete.json');
const BATCH_SIZE = 25; // Slightly larger batches
const DELAY_MS = 2000;

interface Artwork {
  id: number;
  title: string;
  artist: string;
  year: number | string;
  category: string;
  medium?: string;
  location?: string;
  region: string;
  period: string;
  movement?: string;
  scores?: any;
  selectionRationale?: string;
}

// ============================================================================
// Enhanced Prompt with Existing Artworks Context
// ============================================================================

function buildEnhancedPrompt(
  category: string,
  count: number,
  existingArtworks: Artwork[]
): string {
  // Get existing works in this category
  const existing = existingArtworks
    .filter(a => a.category === category)
    .map(a => `"${a.title}" by ${a.artist} (${a.year})`)
    .slice(0, 50); // Show first 50 to avoid token limits

  const existingOther = existingArtworks
    .filter(a => a.category !== category)
    .map(a => `"${a.title}" by ${a.artist}`)
    .slice(0, 30); // Show sample from other categories

  return `You are an art history expert curator. Generate exactly ${count} UNIQUE ${category}s that are NOT already in our collection.

**CRITICAL: DO NOT INCLUDE THESE WORKS (already in collection):**

${category}s already selected (DO NOT REPEAT):
${existing.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Other artworks already selected (for context):
${existingOther.map((w, i) => `${i + 1}. ${w}`).join('\n')}

**Selection Criteria (ranked):**
1. Historical significance (watershed moments, movement-defining)
2. Cultural impact (globally recognized, taught in universities)
3. Technical innovation (pioneering techniques)
4. Geographic diversity (MUST include non-Western: Islamic, Chinese, Indian, Japanese, African, Latin American)
5. Temporal diversity (Ancient to Contemporary)
6. Artist diversity (include women artists, underrepresented cultures)

**Quality Standards:**
- Only canonical works from major art history textbooks
- Works in major museum collections or UNESCO sites
- Global representation (aim for 40%+ non-Western across full dataset)

**Diversity Requirements for this batch:**
- At least 40% should be non-Western works
- Include at least 20% women artists (for paintings/sculpture)
- Cover at least 5 different art historical periods
- No single artist should appear more than once

For EACH ${category}, provide:
- title: Full artwork title (check it's NOT in the exclusion list above!)
- artist: Artist name (or "Unknown" for ancient works)
- year: Year or range (e.g., 1889 or "c. 1500" or -500 for BCE)
- category: "${category}"
- medium: Material/technique
- location: Current location (museum/site)
- region: Geographic region (Western Europe, East Asia, Middle East, South Asia, Africa, Latin America, North America, Oceania)
- period: Art historical period (Ancient, Medieval, Renaissance, Baroque, Neoclassicism, Romanticism, Realism, Impressionism, Modern, Contemporary)
- movement: Specific movement or style
- scores: Rate 0-10 for:
  - historicalSignificance
  - culturalImpact
  - technicalInnovation
  - pedagogicalValue
  - diversityContribution (0 for Western European males, 10 for underrepresented)
- selectionRationale: Why this work is canonical (1-2 sentences)

**IMPORTANT:**
- Triple-check that NONE of your selections appear in the exclusion list above
- Prioritize lesser-known canonical works to ensure uniqueness
- For architecture: temples, mosques, churches, palaces, monuments, modern buildings
- For sculpture: relief, free-standing, installations from all eras
- Return ONLY valid JSON array, no markdown, no explanations

Example format:
[
  {
    "title": "The Night Watch",
    "artist": "Rembrandt van Rijn",
    "year": 1642,
    "category": "${category}",
    "medium": "Oil on canvas",
    "location": "Rijksmuseum, Amsterdam",
    "region": "Western Europe",
    "period": "Baroque",
    "movement": "Dutch Golden Age",
    "scores": {
      "historicalSignificance": 9,
      "culturalImpact": 9,
      "technicalInnovation": 8,
      "pedagogicalValue": 9,
      "diversityContribution": 0
    },
    "selectionRationale": "Revolutionary group portrait showcasing dramatic use of light and shadow, defining work of the Dutch Golden Age taught in all art history surveys."
  }
]`;
}

// ============================================================================
// Generation with Deduplication Check
// ============================================================================

async function generateBatch(
  genAI: GoogleGenerativeAI,
  category: string,
  count: number,
  existingArtworks: Artwork[]
): Promise<Artwork[]> {
  console.log(`  Generating ${count} ${category}s (avoiding ${existingArtworks.length} existing works)...`);

  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.9, // Higher temperature for more variety
      maxOutputTokens: 8000,
      topP: 0.95,
      topK: 64
    }
  });

  const prompt = buildEnhancedPrompt(category, count, existingArtworks);
  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text();

  // Clean up markdown
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const artworks = JSON.parse(text) as Artwork[];

    if (!Array.isArray(artworks)) {
      throw new Error('Response is not an array');
    }

    // Local deduplication check
    const existingKeys = new Set(
      existingArtworks.map(a =>
        `${a.artist.toLowerCase().trim()}:${a.title.toLowerCase().trim()}`
      )
    );

    const uniqueNew = artworks.filter(artwork => {
      const key = `${artwork.artist.toLowerCase().trim()}:${artwork.title.toLowerCase().trim()}`;
      if (existingKeys.has(key)) {
        console.log(`    ⚠️  Skipping duplicate: "${artwork.title}" by ${artwork.artist}`);
        return false;
      }
      existingKeys.add(key); // Add to set for within-batch dedup
      return true;
    });

    console.log(`  ✓ Generated ${uniqueNew.length}/${artworks.length} unique ${category}s`);
    return uniqueNew;
  } catch (err) {
    console.error(`  ✗ Failed to parse JSON response`);
    console.error(`  First 500 chars: ${text.substring(0, 500)}`);
    throw err;
  }
}

async function generateCategory(
  genAI: GoogleGenerativeAI,
  category: string,
  target: number,
  existing: Artwork[]
): Promise<Artwork[]> {
  const newArtworks: Artwork[] = [];
  let attempts = 0;
  const maxAttempts = Math.ceil(target / BATCH_SIZE) + 3; // Allow some retries

  console.log(`\nGenerating ${target} ${category}s...`);
  console.log(`Existing ${category}s: ${existing.length}`);
  console.log(`Target new: ${target}`);
  console.log('');

  while (newArtworks.length < target && attempts < maxAttempts) {
    attempts++;
    const remaining = target - newArtworks.length;
    const batchSize = Math.min(BATCH_SIZE, remaining + 5); // Request a few extra

    try {
      const batch = await generateBatch(
        genAI,
        category,
        batchSize,
        [...existing, ...newArtworks] // Include both existing and newly generated
      );

      // Add what we need
      const toAdd = batch.slice(0, remaining);
      newArtworks.push(...toAdd);

      console.log(`  Progress: ${newArtworks.length}/${target} ${category}s completed`);

      if (newArtworks.length < target) {
        console.log(`  Waiting ${DELAY_MS}ms before next batch...\n`);
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    } catch (err) {
      console.error(`  ✗ Batch failed:`, (err as Error).message);
      console.error(`  Retrying in ${DELAY_MS * 2}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * 2));
    }
  }

  if (newArtworks.length < target) {
    console.warn(`  ⚠️  Only generated ${newArtworks.length}/${target} - may need manual curation`);
  }

  return newArtworks;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('Generate Additional Artworks (Smart Deduplication)');
  console.log('='.repeat(80));
  console.log('');

  // Load existing deduplicated artworks
  const content = await fs.readFile(INPUT_PATH, 'utf-8');
  const data = JSON.parse(content);
  const existing = data.artworks as Artwork[];

  console.log(`[INFO] Loaded ${existing.length} existing unique artworks`);
  console.log('');

  const byCat = {
    painting: existing.filter(a => a.category === 'painting'),
    sculpture: existing.filter(a => a.category === 'sculpture'),
    architecture: existing.filter(a => a.category === 'architecture')
  };

  console.log('Current counts:');
  console.log(`  Paintings: ${byCat.painting.length}/200`);
  console.log(`  Sculptures: ${byCat.sculpture.length}/64`);
  console.log(`  Architecture: ${byCat.architecture.length}/64`);
  console.log('');

  const gaps = {
    painting: Math.max(0, 200 - byCat.painting.length),
    sculpture: Math.max(0, 64 - byCat.sculpture.length),
    architecture: Math.max(0, 64 - byCat.architecture.length)
  };

  const totalNeeded = gaps.painting + gaps.sculpture + gaps.architecture;
  console.log(`Total needed: ${totalNeeded} artworks`);
  console.log(`  Paintings: ${gaps.painting}`);
  console.log(`  Sculptures: ${gaps.sculpture}`);
  console.log(`  Architecture: ${gaps.architecture}`);
  console.log('');

  if (totalNeeded === 0) {
    console.log('✓ No additional artworks needed!');
    return;
  }

  // Check API key
  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    console.error('❌ GEMINI_KEY not found in .env file');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const allNew: Artwork[] = [];

  // Generate each category
  for (const [category, gap] of Object.entries(gaps)) {
    if (gap === 0) continue;

    console.log('='.repeat(80));
    const existingInCat = byCat[category as keyof typeof byCat];
    const newWorks = await generateCategory(genAI, category, gap, existing);
    allNew.push(...newWorks);
    console.log(`✓ Completed ${category}s: ${newWorks.length} new works generated`);
  }

  // Combine with existing
  const allArtworks = [...existing, ...allNew];

  // Re-assign sequential IDs
  allArtworks.forEach((artwork, index) => {
    artwork.id = index + 1;
  });

  // Save
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalArtworks: allArtworks.length,
      model: 'gemini-pro',
      version: '2.0',
      originalCount: existing.length,
      additionalGenerated: allNew.length
    },
    artworks: allArtworks
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  // Final summary
  const finalCounts = {
    painting: allArtworks.filter(a => a.category === 'painting').length,
    sculpture: allArtworks.filter(a => a.category === 'sculpture').length,
    architecture: allArtworks.filter(a => a.category === 'architecture').length
  };

  console.log('\n' + '='.repeat(80));
  console.log('Generation Complete!');
  console.log('='.repeat(80));
  console.log(`Total artworks: ${allArtworks.length}`);
  console.log(`  Paintings: ${finalCounts.painting}/200 ${finalCounts.painting >= 200 ? '✓' : '⚠️'}`);
  console.log(`  Sculptures: ${finalCounts.sculpture}/64 ${finalCounts.sculpture >= 64 ? '✓' : '⚠️'}`);
  console.log(`  Architecture: ${finalCounts.architecture}/64 ${finalCounts.architecture >= 64 ? '✓' : '⚠️'}`);
  console.log('');
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Validate: npx tsx scripts/validate_dataset.ts --input data/artworks-complete.json');
  console.log('  2. Enrich with Wikimedia: npx tsx scripts/enrich_from_wikimedia.ts --input data/artworks-complete.json');
  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err);
  process.exit(1);
});
