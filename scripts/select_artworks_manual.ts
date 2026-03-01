#!/usr/bin/env tsx

/**
 * Manual Artwork Selection Script
 *
 * Generates 328 artworks using Gemini API (to be run manually by user)
 * Output: data/artworks-final.json
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent } from 'undici';
import * as dotenv from 'dotenv';

dotenv.config();

// Configure proxy for accessing Google API
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const GEMINI_KEY = process.env.GEMINI_KEY;
const OUTPUT_PATH = path.join(__dirname, '../data/artworks-final.json');
const BATCH_SIZE = 20; // Generate 20 artworks per API call
const TOTAL_TARGET = 328; // 200 paintings + 64 sculptures + 64 architectures
const DELAY_MS = 2000; // 2 seconds between batches

// Category targets
const TARGETS = {
  painting: 200,
  sculpture: 64,
  architecture: 64
};

// ============================================================================
// Prompt Template
// ============================================================================

function buildPrompt(category: string, count: number, existingCount: number): string {
  return `You are an art history expert curator. Generate a list of exactly ${count} canonical ${category}s for an art learning application.

**Selection Criteria:**
- Historical significance (watershed moments, movement-defining works)
- Cultural impact (globally recognized, taught in universities)
- Technical innovation (pioneering techniques, influential methods)
- Geographic diversity (include non-Western works: Islamic, Chinese, Indian, Japanese, African, Latin American)
- Temporal diversity (Ancient to Contemporary)
- Artist diversity (include women artists, underrepresented cultures)

**Quality Standards:**
- Only include works that appear in major art history textbooks
- Prioritize works in major museum collections
- Ensure global representation (aim for 40%+ non-Western)

For EACH ${category}, provide:
- title: Full artwork title
- artist: Artist name (or "Unknown" for ancient works)
- year: Year or range (e.g., 1889 or "c. 1500" or -500 for BCE)
- category: "${category}"
- medium: Material/technique (e.g., "Oil on canvas", "Marble", "Stone and brick")
- location: Current location (museum name and city, or site location for architecture)
- region: Geographic region (e.g., "Western Europe", "East Asia", "Middle East", "South Asia", "Africa", "Latin America", "North America")
- period: Art historical period (e.g., "Ancient", "Medieval", "Renaissance", "Baroque", "Modern", "Contemporary")
- movement: Specific art movement or style (e.g., "Impressionism", "Renaissance", "Gothic", "Mughal", "Edo")
- scores: Rate 0-10 for each dimension:
  - historicalSignificance: Is this a watershed, movement-defining work?
  - culturalImpact: Is it globally recognized and taught?
  - technicalInnovation: Did it pioneer new techniques?
  - pedagogicalValue: Does it teach key concepts effectively?
  - diversityContribution: Is it from underrepresented region/artist? (0 for Western European males, 10 for underrepresented)
- selectionRationale: Why this work was selected (1-2 sentences focusing on its canonical status)

**Important:**
- This is batch ${Math.floor(existingCount / count) + 1} - generate DIFFERENT works from previous batches
- Ensure diversity: mix famous masterpieces with important lesser-known works
- For architecture, include diverse types: temples, mosques, churches, palaces, monuments
- For sculpture, include relief, free-standing, installations from all eras
- Return ONLY valid JSON array, no markdown formatting, no explanations

Example format:
[
  {
    "title": "The Starry Night",
    "artist": "Vincent van Gogh",
    "year": 1889,
    "category": "${category}",
    "medium": "Oil on canvas",
    "location": "Museum of Modern Art, New York",
    "region": "Western Europe",
    "period": "Modern",
    "movement": "Post-Impressionism",
    "scores": {
      "historicalSignificance": 9,
      "culturalImpact": 10,
      "technicalInnovation": 8,
      "pedagogicalValue": 9,
      "diversityContribution": 0
    },
    "selectionRationale": "Iconic Post-Impressionist masterpiece demonstrating expressive brushwork and emotional intensity, widely taught as a key work in the transition to modern art."
  }
]`;
}

// ============================================================================
// Artwork Generation
// ============================================================================

async function generateBatch(
  genAI: GoogleGenerativeAI,
  category: string,
  count: number,
  existingCount: number
): Promise<any[]> {
  console.log(`  Generating ${count} ${category}s (batch ${Math.floor(existingCount / count) + 1})...`);

  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 8000,
      topP: 0.95,
      topK: 40
    }
  });

  const prompt = buildPrompt(category, count, existingCount);
  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text();

  // Clean up markdown code blocks if present
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const artworks = JSON.parse(text);

    if (!Array.isArray(artworks)) {
      throw new Error('Response is not an array');
    }

    console.log(`  ✓ Generated ${artworks.length} ${category}s`);
    return artworks;
  } catch (err) {
    console.error(`  ✗ Failed to parse JSON response`);
    console.error(`  First 500 chars: ${text.substring(0, 500)}`);
    throw err;
  }
}

async function generateCategory(
  genAI: GoogleGenerativeAI,
  category: string,
  target: number
): Promise<any[]> {
  const allArtworks: any[] = [];
  let remaining = target;

  while (remaining > 0) {
    const batchSize = Math.min(BATCH_SIZE, remaining);

    try {
      const batch = await generateBatch(genAI, category, batchSize, allArtworks.length);
      allArtworks.push(...batch);
      remaining -= batch.length;

      console.log(`  Progress: ${allArtworks.length}/${target} ${category}s completed`);

      // Rate limiting
      if (remaining > 0) {
        console.log(`  Waiting ${DELAY_MS}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    } catch (err) {
      console.error(`  ✗ Batch failed:`, (err as Error).message);
      console.error(`  Retrying in ${DELAY_MS * 2}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * 2));
    }
  }

  return allArtworks;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('Artwork Selection - Manual Generation');
  console.log('='.repeat(80));
  console.log(`Target: ${TOTAL_TARGET} artworks (${TARGETS.painting} paintings + ${TARGETS.sculpture} sculptures + ${TARGETS.architecture} architectures)`);
  console.log(`Batch size: ${BATCH_SIZE} artworks per API call`);
  console.log(`Rate limit: ${DELAY_MS}ms between batches`);
  console.log('');

  // Check API key
  if (!GEMINI_KEY) {
    console.error('❌ GEMINI_KEY not found in .env file');
    console.error('Please add your Gemini API key to .env:');
    console.error('  GEMINI_KEY=your-api-key-here');
    process.exit(1);
  }

  // Initialize Gemini with proxy support
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);

  // Note: The SDK will use Node's global fetch which respects proxy via dispatcher
  // Set global dispatcher for proxy
  (global as any).dispatcher = proxyAgent;

  const allArtworks: any[] = [];
  let currentId = 1;

  // Generate each category
  for (const [category, target] of Object.entries(TARGETS)) {
    console.log(`\n[${'='.repeat(70)}]`);
    console.log(`Generating ${target} ${category}s...`);
    console.log(`[${'='.repeat(70)}]\n`);

    const artworks = await generateCategory(genAI, category, target);

    // Add IDs
    artworks.forEach(artwork => {
      artwork.id = currentId++;
    });

    allArtworks.push(...artworks);

    console.log(`\n✓ Completed ${category}s: ${artworks.length} generated\n`);
  }

  // Save to file
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalArtworks: allArtworks.length,
      model: 'gemini-pro',
      version: '1.0'
    },
    artworks: allArtworks
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('Generation Summary');
  console.log('='.repeat(80));
  console.log(`Total artworks: ${allArtworks.length}`);
  console.log(`  Paintings: ${allArtworks.filter(a => a.category === 'painting').length}`);
  console.log(`  Sculptures: ${allArtworks.filter(a => a.category === 'sculpture').length}`);
  console.log(`  Architecture: ${allArtworks.filter(a => a.category === 'architecture').length}`);
  console.log(`\nOutput: ${OUTPUT_PATH}`);
  console.log('\n✅ SUCCESS! Artwork selection complete.');
  console.log('\nNext steps:');
  console.log('  1. Manual review: npx tsx scripts/review_artworks.ts');
  console.log('  2. Wikimedia enrichment: npx tsx scripts/enrich_from_wikimedia.ts');
  console.log('  3. Validation: npx tsx scripts/validate_dataset.ts --strict');
  console.log('='.repeat(80));
}

// Run
main().catch(err => {
  console.error('\n❌ FATAL ERROR:', err);
  process.exit(1);
});
