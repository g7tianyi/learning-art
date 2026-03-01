#!/usr/bin/env tsx

/**
 * Wikimedia Enrichment Script
 *
 * Enriches artwork data with metadata and images from Wikimedia Commons.
 * Searches for each artwork by title/artist, fetches high-quality images,
 * and validates/enriches metadata.
 *
 * Usage:
 *   npx tsx scripts/enrich_from_wikimedia.ts [options]
 *
 * Options:
 *   --input <path>     Input JSON file (default: data/artworks-final.json)
 *   --output <path>    Output JSON file (default: overwrites input)
 *   --download         Download images locally to web/public/images/artworks/
 *   --delay <ms>       Delay between API calls (default: 1000ms)
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
  scores?: any;
  selectionRationale?: string;
  // Enriched fields
  wikimediaMetadata?: {
    pageId?: number;
    title?: string;
    imageUrl?: string;
    thumbUrl?: string;
    width?: number;
    height?: number;
    author?: string;
    license?: string;
    description?: string;
    extractedDate?: string;
  };
}

interface WikimediaImageInfo {
  url: string;
  thumbUrl?: string;
  width: number;
  height: number;
  descriptionUrl: string;
  author?: string;
  license?: string;
  description?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';
const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const RATE_LIMIT_DELAY = parseInt(process.argv.find(arg => arg.startsWith('--delay='))?.split('=')[1] || '1000');
const DOWNLOAD_IMAGES = process.argv.includes('--download');

const INPUT_PATH = process.argv.find(arg => arg.startsWith('--input='))?.split('=')[1]
  || path.join(__dirname, '../data/artworks-final.json');
const OUTPUT_PATH = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1]
  || INPUT_PATH;

const IMAGES_DIR = path.join(__dirname, '../web/public/images/artworks');

// ============================================================================
// Wikimedia Commons API
// ============================================================================

/**
 * Search Wikimedia Commons for images matching a query
 */
async function searchWikimediaCommons(query: string, limit: number = 5): Promise<any[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srnamespace: '6', // File namespace
    srlimit: limit.toString(),
    srprop: 'size|wordcount|timestamp|snippet'
  });

  const url = `${WIKIMEDIA_API_URL}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.status}`);
  }

  const data: any = await response.json();
  return data.query?.search || [];
}

/**
 * Get image info from Wikimedia Commons
 */
async function getImageInfo(filename: string): Promise<WikimediaImageInfo | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: filename,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata|mime',
    iiurlwidth: '1280' // Get a reasonable thumb size
  });

  const url = `${WIKIMEDIA_API_URL}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.status}`);
  }

  const data: any = await response.json();
  const pages = data.query?.pages || {};
  const page = Object.values(pages)[0] as any;

  if (!page || page.missing) {
    return null;
  }

  const imageInfo = page.imageinfo?.[0];
  if (!imageInfo) {
    return null;
  }

  const metadata = imageInfo.extmetadata || {};

  return {
    url: imageInfo.url,
    thumbUrl: imageInfo.thumburl,
    width: imageInfo.width,
    height: imageInfo.height,
    descriptionUrl: imageInfo.descriptionurl,
    author: metadata.Artist?.value,
    license: metadata.License?.value || metadata.LicenseShortName?.value,
    description: metadata.ImageDescription?.value
  };
}

/**
 * Search Wikipedia for artwork page
 */
async function searchWikipedia(title: string, artist: string): Promise<string | null> {
  const queries = [
    `${title} ${artist}`,
    title,
    `${title} painting`,
    `${title} artwork`
  ];

  for (const query of queries) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: query,
      srlimit: '3'
    });

    const url = `${WIKIPEDIA_API_URL}?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      continue;
    }

    const data: any = await response.json();
    const results = data.query?.search || [];

    if (results.length > 0) {
      const pageTitle = results[0].title.replace(/ /g, '_');
      return `https://en.wikipedia.org/wiki/${pageTitle}`;
    }
  }

  return null;
}

// ============================================================================
// Enrichment Logic
// ============================================================================

/**
 * Find best matching image on Wikimedia Commons
 */
async function findBestImage(artwork: ArtworkData): Promise<WikimediaImageInfo | null> {
  console.log(`  [SEARCH] Searching Wikimedia Commons...`);

  // Build search queries (most specific to least specific)
  const queries = [
    `${artwork.title} ${artwork.artist}`,
    artwork.title,
    `${artwork.title} ${artwork.category}`
  ];

  for (const query of queries) {
    const results = await searchWikimediaCommons(query, 5);

    for (const result of results) {
      const filename = result.title; // e.g., "File:Starry_Night.jpg"
      const imageInfo = await getImageInfo(filename);

      if (imageInfo && imageInfo.width >= 800) { // Minimum quality threshold
        console.log(`  [FOUND] ${filename} (${imageInfo.width}x${imageInfo.height})`);
        return imageInfo;
      }
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`  [NOT FOUND] No suitable image found on Wikimedia Commons`);
  return null;
}

/**
 * Enrich a single artwork with Wikimedia data
 */
async function enrichArtwork(artwork: ArtworkData): Promise<ArtworkData> {
  console.log(`\n[${artwork.id}] ${artwork.title} by ${artwork.artist}`);

  const enriched = { ...artwork };

  try {
    // 1. Search for Wikipedia article if not present
    if (!artwork.wikiUrl) {
      console.log(`  [WIKI] Searching Wikipedia...`);
      const wikiUrl = await searchWikipedia(artwork.title, artwork.artist);
      if (wikiUrl) {
        enriched.wikiUrl = wikiUrl;
        console.log(`  [WIKI] Found: ${wikiUrl}`);
      } else {
        console.log(`  [WIKI] No Wikipedia article found`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 2. Find best image on Wikimedia Commons if not present or low quality
    if (!artwork.imageUrl || artwork.imageUrl.includes('placeholder')) {
      const imageInfo = await findBestImage(artwork);

      if (imageInfo) {
        enriched.imageUrl = imageInfo.thumbUrl || imageInfo.url;
        enriched.wikimediaMetadata = {
          imageUrl: imageInfo.url,
          thumbUrl: imageInfo.thumbUrl,
          width: imageInfo.width,
          height: imageInfo.height,
          author: imageInfo.author,
          license: imageInfo.license,
          description: imageInfo.description
        };

        console.log(`  [IMAGE] Updated image URL`);
      }
    } else {
      console.log(`  [IMAGE] Already has image URL, skipping search`);
    }

    console.log(`  [SUCCESS] Enrichment complete`);
  } catch (err) {
    console.error(`  [ERROR] Enrichment failed:`, (err as Error).message);
  }

  return enriched;
}

/**
 * Download image to local storage
 */
async function downloadImage(artwork: ArtworkData, imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `${artwork.id}-${artwork.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);

    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.writeFile(filepath, Buffer.from(buffer));

    console.log(`  [DOWNLOAD] Saved to ${filename}`);
    return `/images/artworks/${filename}`;
  } catch (err) {
    console.error(`  [DOWNLOAD] Failed:`, (err as Error).message);
    return null;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('Wikimedia Enrichment Script');
  console.log('='.repeat(80));
  console.log(`Input: ${INPUT_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log(`Rate limit: ${RATE_LIMIT_DELAY}ms between artworks`);
  console.log(`Download images: ${DOWNLOAD_IMAGES ? 'Yes' : 'No'}`);
  console.log('');

  // Load artworks
  const content = await fs.readFile(INPUT_PATH, 'utf-8');
  const data = JSON.parse(content);
  const artworks: ArtworkData[] = data.artworks || [];

  console.log(`[INFO] Loaded ${artworks.length} artworks`);
  console.log('');

  // Enrich each artwork
  const enrichedArtworks: ArtworkData[] = [];
  let enrichedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < artworks.length; i++) {
    const artwork = artworks[i];

    try {
      const enriched = await enrichArtwork(artwork);

      // Download image if requested
      if (DOWNLOAD_IMAGES && enriched.imageUrl) {
        const localPath = await downloadImage(enriched, enriched.imageUrl);
        if (localPath) {
          // Note: imagePath will be set during database load
          // Just record that we have a local copy
        }
      }

      enrichedArtworks.push(enriched);
      enrichedCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to enrich artwork ${artwork.id}:`, err);
      enrichedArtworks.push(artwork); // Keep original
      failedCount++;
    }

    // Rate limiting
    if (i < artworks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    // Progress indicator
    const percent = ((i + 1) / artworks.length * 100).toFixed(1);
    console.log(`\n[PROGRESS] ${i + 1}/${artworks.length} (${percent}%)`);
  }

  // Save enriched data
  const output = {
    ...data,
    artworks: enrichedArtworks,
    enriched: new Date().toISOString(),
    enrichmentStats: {
      total: artworks.length,
      enriched: enrichedCount,
      failed: failedCount
    }
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(80));
  console.log('Enrichment Summary');
  console.log('='.repeat(80));
  console.log(`Total artworks: ${artworks.length}`);
  console.log(`Successfully enriched: ${enrichedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Output saved to: ${OUTPUT_PATH}`);
  console.log('');
  console.log('[SUCCESS] Enrichment complete');
}

// Run
main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
