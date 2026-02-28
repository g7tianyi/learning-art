#!/usr/bin/env tsx

/**
 * Artwork Selection - Test Script
 *
 * Generates a small test set (10 artworks) to verify the system works
 * before running the full 328-artwork generation.
 *
 * Usage:
 *   npx tsx scripts/select_artworks_test.ts
 */

import { callLLMForJSON } from './lib/llm';

async function testSelection() {
  console.log('='.repeat(80));
  console.log('Artwork Selection - Test Run');
  console.log('='.repeat(80));
  console.log('Generating 10 sample artworks to verify system...\n');

  const prompt = `You are an art history expert. Generate a curated list of exactly 10 paintings that represent diverse, historically significant works from around the world.

For EACH artwork, provide:
- title: Full artwork title
- artist: Artist name
- year: Year or range (e.g., 1889 or "c. 1500")
- category: "painting"
- medium: Material/technique (e.g., "Oil on canvas")
- location: Current location (museum name)
- region: Geographic region (e.g., "Western Europe", "East Asia")
- period: Temporal period (e.g., "Renaissance", "Modern")
- movement: Art movement (e.g., "Impressionism", "Baroque")
- scores: Rate 0-10 for each dimension:
  - historicalSignificance: Watershed moment, movement-defining
  - culturalImpact: Global recognition
  - technicalInnovation: Pioneering techniques
  - pedagogicalValue: Teaches key concepts
  - diversityContribution: Underrepresented region/artist (0 for Western European males)
- selectionRationale: Why this work was selected (1-2 sentences)

Return ONLY valid JSON array (no markdown):
[
  {
    "title": "The Starry Night",
    "artist": "Vincent van Gogh",
    "year": 1889,
    "category": "painting",
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
    "selectionRationale": "Iconic Post-Impressionist masterpiece demonstrating expressive brushwork and emotional intensity."
  }
]`;

  try {
    const artworks = await callLLMForJSON<any[]>(prompt, {
      temperature: 0.8,
      maxTokens: 8000
    });

    console.log(`✓ Successfully generated ${artworks.length} artworks\n`);

    // Calculate weighted scores
    const weights = {
      historicalSignificance: 0.30,
      culturalImpact: 0.25,
      technicalInnovation: 0.20,
      pedagogicalValue: 0.15,
      diversityContribution: 0.10
    };

    artworks.forEach((work, i) => {
      const weighted =
        (work.scores.historicalSignificance * weights.historicalSignificance) +
        (work.scores.culturalImpact * weights.culturalImpact) +
        (work.scores.technicalInnovation * weights.technicalInnovation) +
        (work.scores.pedagogicalValue * weights.pedagogicalValue) +
        (work.scores.diversityContribution * weights.diversityContribution);

      console.log(`${i + 1}. ${work.title} by ${work.artist} (${work.year})`);
      console.log(`   Score: ${weighted.toFixed(2)}/10 | Region: ${work.region} | Movement: ${work.movement}`);
      console.log(`   ${work.selectionRationale}\n`);
    });

    console.log('='.repeat(80));
    console.log('✓ Test successful! System is working correctly.');
    console.log('\nTo generate the full 328 artworks, run:');
    console.log('  npm run select-artworks');
    console.log('\nNote: Full generation will take ~30-40 minutes due to rate limiting.');
    console.log('='.repeat(80));

  } catch (err) {
    console.error('✗ Test failed:', err);
    console.error('\nPlease check:');
    console.error('  1. GEMINI_KEY is set in .env file');
    console.error('  2. API key is valid');
    console.error('  3. Internet connection is working');
    process.exit(1);
  }
}

testSelection();
