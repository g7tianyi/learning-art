/**
 * Generate Era Introductions using LLM
 *
 * Reads era definitions from data/eras/eras.json and generates
 * Markdown introduction files for each era using the Gemini API.
 *
 * Usage:
 *   npx tsx scripts/generate_era_introductions.ts --all
 *   npx tsx scripts/generate_era_introductions.ts --era renaissance
 *   npx tsx scripts/generate_era_introductions.ts --era modern --force
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { callLLMRateLimited } from './lib/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Types
// ============================================================================

interface Era {
  id: string;
  name: string;
  slug: string;
  startYear: number;
  endYear: number;
  description: string;
  introductionPath: string;
  color?: string;
}

interface ErasConfig {
  eras: Era[];
}

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = path.join(__dirname, '../data');
const ERAS_JSON_PATH = path.join(DATA_DIR, 'eras/eras.json');
const PROMPT_TEMPLATE_PATH = path.join(__dirname, 'prompts/era-introduction-v1.md');

// CLI Arguments
const args = process.argv.slice(2);
const flags = {
  all: args.includes('--all'),
  era: args.includes('--era') ? args[args.indexOf('--era') + 1] : null,
  force: args.includes('--force'),
  delay: args.includes('--delay') ? parseInt(args[args.indexOf('--delay') + 1]) : 2000
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load eras from JSON file
 */
function loadEras(): Era[] {
  if (!fs.existsSync(ERAS_JSON_PATH)) {
    throw new Error(`Eras JSON file not found: ${ERAS_JSON_PATH}`);
  }

  const rawData = fs.readFileSync(ERAS_JSON_PATH, 'utf-8');
  const config: ErasConfig = JSON.parse(rawData);

  return config.eras;
}

/**
 * Load prompt template
 */
function loadPromptTemplate(): string {
  if (!fs.existsSync(PROMPT_TEMPLATE_PATH)) {
    throw new Error(`Prompt template not found: ${PROMPT_TEMPLATE_PATH}`);
  }

  return fs.readFileSync(PROMPT_TEMPLATE_PATH, 'utf-8');
}

/**
 * Substitute placeholders in prompt template
 */
function buildPrompt(era: Era, template: string): string {
  // Map era IDs to geographic regions
  const regionMap: Record<string, string> = {
    'renaissance': 'Italy, Northern Europe',
    'mughal-india': 'South Asia (primarily modern-day India, Pakistan, Bangladesh)',
    'edo-japan': 'Japan (Tokugawa shogunate)',
    'impressionism-post-impressionism': 'France, Western Europe',
    'modern': 'Global (Europe, Americas, Asia)'
  };

  const regions = regionMap[era.id] || 'Global';

  return template
    .replace(/\{era_name\}/g, era.name)
    .replace(/\{era_id\}/g, era.id)
    .replace(/\{start_year\}/g, era.startYear.toString())
    .replace(/\{end_year\}/g, era.endYear.toString())
    .replace(/\{regions\}/g, regions);
}

/**
 * Generate introduction for a single era
 */
async function generateEraIntroduction(
  era: Era,
  template: string,
  force: boolean = false
): Promise<void> {
  const outputPath = path.join(DATA_DIR, 'eras', `${era.slug}.md`);

  // Check if file already exists
  if (fs.existsSync(outputPath) && !force) {
    console.log(`[SKIP] ${era.slug}: Introduction already exists (use --force to regenerate)`);
    return;
  }

  console.log(`[GENERATE] ${era.slug}: ${era.name} (${era.startYear}-${era.endYear})`);

  // Build prompt
  const prompt = buildPrompt(era, template);

  try {
    // Call LLM
    const response = await callLLMRateLimited(prompt, {
      temperature: 0.7,
      maxTokens: 2000
    }, flags.delay);

    // Extract content
    let content = response.content.trim();

    // Ensure content starts with frontmatter
    if (!content.startsWith('---')) {
      // Add frontmatter if missing
      const now = new Date().toISOString();
      const frontmatter = `---
id: ${era.id}
name: ${era.name}
dateRange: "${era.startYear} - ${era.endYear}"
generatedAt: "${now}"
model: "${response.model}"
promptVersion: "era-introduction-v1"
---

`;
      content = frontmatter + content;
    }

    // Write to file
    fs.writeFileSync(outputPath, content, 'utf-8');

    console.log(`[SUCCESS] ${era.slug}: Generated ${response.usage?.outputTokens || '?'} tokens`);
    console.log(`  → ${outputPath}`);

  } catch (err) {
    console.error(`[ERROR] ${era.slug}: ${(err as Error).message}`);
    throw err;
  }
}

/**
 * Validate generated content
 */
function validateContent(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`[VALIDATE] File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Check frontmatter
  if (!content.startsWith('---')) {
    console.error(`[VALIDATE] Missing frontmatter: ${filePath}`);
    return false;
  }

  // Check minimum length (200 words ≈ 1000 chars)
  if (content.length < 800) {
    console.error(`[VALIDATE] Content too short (${content.length} chars): ${filePath}`);
    return false;
  }

  // Check required sections
  const requiredSections = [
    '## Historical Context',
    '## Defining Characteristics',
    '## Major Artists',
    '## Cultural Impact'
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      console.error(`[VALIDATE] Missing section "${section}": ${filePath}`);
      return false;
    }
  }

  console.log(`[VALIDATE] ✓ ${filePath}`);
  return true;
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Era Introductions Generator');
  console.log('='.repeat(60));
  console.log('');

  // Validate arguments
  if (!flags.all && !flags.era) {
    console.error('Error: Must specify --all or --era <slug>');
    console.error('');
    console.error('Usage:');
    console.error('  npx tsx scripts/generate_era_introductions.ts --all');
    console.error('  npx tsx scripts/generate_era_introductions.ts --era renaissance');
    console.error('  npx tsx scripts/generate_era_introductions.ts --all --force --delay 3000');
    process.exit(1);
  }

  // Load eras
  console.log('Loading eras...');
  const eras = loadEras();
  console.log(`Found ${eras.length} eras`);
  console.log('');

  // Load prompt template
  console.log('Loading prompt template...');
  const template = loadPromptTemplate();
  console.log(`Template loaded (${template.length} chars)`);
  console.log('');

  // Determine which eras to generate
  let targetEras: Era[] = [];

  if (flags.all) {
    targetEras = eras;
  } else if (flags.era) {
    const era = eras.find(e => e.slug === flags.era);
    if (!era) {
      console.error(`Error: Era "${flags.era}" not found in eras.json`);
      console.error(`Available eras: ${eras.map(e => e.slug).join(', ')}`);
      process.exit(1);
    }
    targetEras = [era];
  }

  console.log(`Generating ${targetEras.length} era introduction(s)...`);
  console.log('');

  // Generate introductions
  let successCount = 0;
  let failureCount = 0;

  for (const era of targetEras) {
    try {
      await generateEraIntroduction(era, template, flags.force);
      successCount++;
    } catch (err) {
      failureCount++;
      console.error(`Failed to generate ${era.slug}: ${(err as Error).message}`);
    }

    // Add delay between eras (except for last one)
    if (era !== targetEras[targetEras.length - 1]) {
      console.log('');
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Generation Complete');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount}/${targetEras.length}`);
  console.log(`Failures: ${failureCount}`);

  // Validate all generated files
  if (successCount > 0) {
    console.log('');
    console.log('Validating generated files...');
    for (const era of targetEras) {
      const filePath = path.join(DATA_DIR, 'eras', `${era.slug}.md`);
      validateContent(filePath);
    }
  }

  console.log('');
  console.log('Done!');

  if (failureCount > 0) {
    process.exit(1);
  }
}

// Run main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
