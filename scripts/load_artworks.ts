#!/usr/bin/env tsx

/**
 * Artwork Loader Script
 *
 * Loads artworks from JSON file into SQLite database and
 * initializes review schedule for each artwork.
 *
 * Usage:
 *   npm run load-artworks
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  getDb,
  insertArtwork,
  initializeReviewSchedule,
  getArtworkCounts,
  closeDb
} from './lib/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTWORKS_JSON_PATH = path.join(__dirname, '../data/artworks-final.json');
const MOCK_DATA_PATH = path.join(__dirname, '../data/artworks-mock.json');

// ============================================================================
// Mock Data Generation
// ============================================================================

/**
 * Generate mock artworks for testing (when artworks-final.json doesn't exist)
 */
function generateMockArtworks() {
  return {
    generated: new Date().toISOString(),
    total: 10,
    artworks: [
      {
        id: 1,
        title: 'The Starry Night',
        artist: 'Vincent van Gogh',
        year: 1889,
        category: 'painting',
        medium: 'Oil on canvas',
        dimensions: '73.7 cm × 92.1 cm',
        location: 'Museum of Modern Art, New York',
        region: 'Western Europe',
        period: 'Modern',
        movement: 'Post-Impressionism',
        wikiUrl: 'https://en.wikipedia.org/wiki/The_Starry_Night',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
        scores: {
          historicalSignificance: 9,
          culturalImpact: 10,
          technicalInnovation: 8,
          pedagogicalValue: 9,
          diversityContribution: 0,
          weighted: 8.65
        },
        selectionRationale: 'Iconic Post-Impressionist masterpiece demonstrating expressive brushwork and emotional intensity.'
      },
      {
        id: 2,
        title: 'Mona Lisa',
        artist: 'Leonardo da Vinci',
        year: '1503-1519',
        category: 'painting',
        medium: 'Oil on poplar panel',
        dimensions: '77 cm × 53 cm',
        location: 'Louvre Museum, Paris',
        region: 'Western Europe',
        period: 'Renaissance',
        movement: 'Renaissance',
        wikiUrl: 'https://en.wikipedia.org/wiki/Mona_Lisa',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
        scores: {
          historicalSignificance: 10,
          culturalImpact: 10,
          technicalInnovation: 9,
          pedagogicalValue: 10,
          diversityContribution: 0,
          weighted: 9.55
        },
        selectionRationale: 'Most famous painting in the world, exemplifying Renaissance techniques and enigmatic expression.'
      },
      {
        id: 3,
        title: 'The Great Wave off Kanagawa',
        artist: 'Katsushika Hokusai',
        year: '1830-1833',
        category: 'painting',
        medium: 'Woodblock print',
        dimensions: '25.7 cm × 37.8 cm',
        location: 'Multiple collections worldwide',
        region: 'East Asia',
        period: 'Edo Period',
        movement: 'Ukiyo-e',
        wikiUrl: 'https://en.wikipedia.org/wiki/The_Great_Wave_off_Kanagawa',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg',
        scores: {
          historicalSignificance: 9,
          culturalImpact: 10,
          technicalInnovation: 8,
          pedagogicalValue: 9,
          diversityContribution: 8,
          weighted: 8.95
        },
        selectionRationale: 'Iconic Japanese woodblock print representing the pinnacle of ukiyo-e art.'
      },
      {
        id: 4,
        title: 'Guernica',
        artist: 'Pablo Picasso',
        year: 1937,
        category: 'painting',
        medium: 'Oil on canvas',
        dimensions: '349 cm × 776 cm',
        location: 'Museo Reina Sofía, Madrid',
        region: 'Western Europe',
        period: 'Modern',
        movement: 'Cubism',
        wikiUrl: 'https://en.wikipedia.org/wiki/Guernica_(Picasso)',
        scores: {
          historicalSignificance: 10,
          culturalImpact: 10,
          technicalInnovation: 9,
          pedagogicalValue: 10,
          diversityContribution: 0,
          weighted: 9.55
        },
        selectionRationale: 'Powerful anti-war statement combining Cubist techniques with profound emotional impact.'
      },
      {
        id: 5,
        title: 'The Thinker',
        artist: 'Auguste Rodin',
        year: 1904,
        category: 'sculpture',
        medium: 'Bronze',
        dimensions: '186 cm height',
        location: 'Musée Rodin, Paris (and multiple casts worldwide)',
        region: 'Western Europe',
        period: 'Modern',
        movement: 'Realism',
        wikiUrl: 'https://en.wikipedia.org/wiki/The_Thinker',
        scores: {
          historicalSignificance: 9,
          culturalImpact: 10,
          technicalInnovation: 8,
          pedagogicalValue: 9,
          diversityContribution: 0,
          weighted: 8.95
        },
        selectionRationale: 'Iconic sculpture representing human contemplation and philosophical thought.'
      },
      {
        id: 6,
        title: 'David',
        artist: 'Michelangelo',
        year: '1501-1504',
        category: 'sculpture',
        medium: 'Marble',
        dimensions: '517 cm height',
        location: 'Galleria dell\'Accademia, Florence',
        region: 'Western Europe',
        period: 'Renaissance',
        movement: 'Renaissance',
        wikiUrl: 'https://en.wikipedia.org/wiki/David_(Michelangelo)',
        scores: {
          historicalSignificance: 10,
          culturalImpact: 10,
          technicalInnovation: 10,
          pedagogicalValue: 10,
          diversityContribution: 0,
          weighted: 10.0
        },
        selectionRationale: 'Masterpiece of Renaissance sculpture, epitome of human form and technical excellence.'
      },
      {
        id: 7,
        title: 'Taj Mahal',
        artist: 'Ustad Ahmad Lahori (attributed)',
        year: '1632-1653',
        category: 'architecture',
        medium: 'White marble',
        location: 'Agra, India',
        region: 'South Asia',
        period: 'Mughal',
        movement: 'Mughal architecture',
        wikiUrl: 'https://en.wikipedia.org/wiki/Taj_Mahal',
        scores: {
          historicalSignificance: 10,
          culturalImpact: 10,
          technicalInnovation: 9,
          pedagogicalValue: 10,
          diversityContribution: 9,
          weighted: 9.75
        },
        selectionRationale: 'Iconic monument combining Persian, Islamic, and Indian architectural elements.'
      },
      {
        id: 8,
        title: 'Fallingwater',
        artist: 'Frank Lloyd Wright',
        year: 1939,
        category: 'architecture',
        location: 'Mill Run, Pennsylvania, USA',
        region: 'North America',
        period: 'Modern',
        movement: 'Organic architecture',
        wikiUrl: 'https://en.wikipedia.org/wiki/Fallingwater',
        scores: {
          historicalSignificance: 9,
          culturalImpact: 9,
          technicalInnovation: 10,
          pedagogicalValue: 10,
          diversityContribution: 0,
          weighted: 9.25
        },
        selectionRationale: 'Revolutionary integration of architecture with natural environment.'
      },
      {
        id: 9,
        title: 'The Persistence of Memory',
        artist: 'Salvador Dalí',
        year: 1931,
        category: 'painting',
        medium: 'Oil on canvas',
        dimensions: '24 cm × 33 cm',
        location: 'Museum of Modern Art, New York',
        region: 'Western Europe',
        period: 'Modern',
        movement: 'Surrealism',
        wikiUrl: 'https://en.wikipedia.org/wiki/The_Persistence_of_Memory',
        scores: {
          historicalSignificance: 9,
          culturalImpact: 10,
          technicalInnovation: 9,
          pedagogicalValue: 9,
          diversityContribution: 0,
          weighted: 9.15
        },
        selectionRationale: 'Defining Surrealist work exploring time, memory, and dream logic.'
      },
      {
        id: 10,
        title: 'The Last Supper',
        artist: 'Leonardo da Vinci',
        year: '1495-1498',
        category: 'painting',
        medium: 'Tempera on gesso',
        dimensions: '460 cm × 880 cm',
        location: 'Santa Maria delle Grazie, Milan',
        region: 'Western Europe',
        period: 'Renaissance',
        movement: 'Renaissance',
        wikiUrl: 'https://en.wikipedia.org/wiki/The_Last_Supper_(Leonardo)',
        scores: {
          historicalSignificance: 10,
          culturalImpact: 10,
          technicalInnovation: 10,
          pedagogicalValue: 10,
          diversityContribution: 0,
          weighted: 10.0
        },
        selectionRationale: 'Revolutionary composition demonstrating linear perspective and psychological depth.'
      }
    ]
  };
}

// ============================================================================
// Main Loader Function
// ============================================================================

async function loadArtworks() {
  console.log('='.repeat(80));
  console.log('Artwork Loader');
  console.log('='.repeat(80));
  console.log('');

  // Check if artworks file exists
  let artworksData;
  let sourceFile;

  try {
    const content = await fs.readFile(ARTWORKS_JSON_PATH, 'utf-8');
    artworksData = JSON.parse(content);
    sourceFile = ARTWORKS_JSON_PATH;
    console.log(`[INFO] Loading from: ${ARTWORKS_JSON_PATH}`);
  } catch (err) {
    console.log(`[INFO] ${ARTWORKS_JSON_PATH} not found`);
    console.log('[INFO] Using mock data for testing');

    artworksData = generateMockArtworks();
    sourceFile = 'mock data';

    // Save mock data for reference
    await fs.writeFile(MOCK_DATA_PATH, JSON.stringify(artworksData, null, 2), 'utf-8');
    console.log(`[INFO] Saved mock data to: ${MOCK_DATA_PATH}`);
  }

  const artworks = artworksData.artworks;
  console.log(`[INFO] Found ${artworks.length} artworks to load`);
  console.log('');

  // Connect to database
  const db = getDb();

  try {
    let loaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const artwork of artworks) {
      try {
        // Insert artwork (using the provided ID)
        const artworkId = insertArtwork({
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          category: artwork.category,
          medium: artwork.medium,
          dimensions: artwork.dimensions,
          location: artwork.location,
          region: artwork.region,
          period: artwork.period,
          movement: artwork.movement,
          imagePath: null, // Will be set by image download script
          imageUrl: artwork.imageUrl,
          wikiUrl: artwork.wikiUrl,
          museumUrl: artwork.museumUrl,
          selectionScore: artwork.scores?.weighted,
          selectionRationale: artwork.selectionRationale
        });

        // Initialize review schedule
        initializeReviewSchedule(artworkId);

        loaded++;
        console.log(`[${loaded}/${artworks.length}] Loaded: ${artwork.title} by ${artwork.artist}`);
      } catch (err: any) {
        if (err.message?.includes('UNIQUE')) {
          skipped++;
          console.log(`[SKIP] Already exists: ${artwork.title}`);
        } else {
          failed++;
          console.error(`[ERROR] Failed to load ${artwork.title}:`, err.message);
        }
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('Loading Summary');
    console.log('='.repeat(80));
    console.log(`Source: ${sourceFile}`);
    console.log(`Loaded: ${loaded}`);
    console.log(`Skipped: ${skipped} (already in database)`);
    console.log(`Failed: ${failed}`);
    console.log('');

    // Show database stats
    const counts = getArtworkCounts();
    console.log('Database Contents:');
    console.log(`  Total artworks: ${counts.total}`);
    console.log(`  Paintings: ${counts.paintings}`);
    console.log(`  Sculptures: ${counts.sculptures}`);
    console.log(`  Architecture: ${counts.architecture}`);
    console.log('');

    if (loaded > 0) {
      console.log('[SUCCESS] Artworks loaded successfully');
      console.log('');
      console.log('Next steps:');
      console.log('  1. Run the web UI: cd web && npm run dev');
      console.log('  2. Visit: http://localhost:3000');
    }
  } finally {
    closeDb();
  }
}

// Run
loadArtworks().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
