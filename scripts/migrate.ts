#!/usr/bin/env tsx

/**
 * Database Migration CLI
 *
 * Usage:
 *   # Apply all pending migrations
 *   npm run migrate
 *
 *   # Dry run (show what would be applied)
 *   npm run migrate -- --dry-run
 *
 *   # Show migration status
 *   npm run migrate -- --status
 */

import { runMigrations, getMigrationStatus } from './lib/migrate';

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface CLIArgs {
  dryRun?: boolean;
  status?: boolean;
  help?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    switch (arg) {
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--status':
        args.status = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Database Migration CLI

Usage:
  npm run migrate [options]

Options:
  --dry-run       Show what migrations would be applied (don't execute)
  --status        Show migration status (applied vs pending)
  --help, -h      Show this help message

Examples:
  # Apply all pending migrations
  npm run migrate

  # Dry run
  npm run migrate -- --dry-run

  # Check status
  npm run migrate -- --status
`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    return;
  }

  if (args.status) {
    const { applied, pending } = getMigrationStatus();

    console.log('='.repeat(80));
    console.log('Migration Status');
    console.log('='.repeat(80));
    console.log('');

    console.log(`Applied Migrations (${applied.length}):`);
    if (applied.length === 0) {
      console.log('  (none)');
    } else {
      applied.forEach(m => {
        console.log(`  ✓ ${m.version}: ${m.description || '(no description)'} [${m.appliedAt}]`);
      });
    }

    console.log('');
    console.log(`Pending Migrations (${pending.length}):`);
    if (pending.length === 0) {
      console.log('  (none)');
    } else {
      pending.forEach(m => {
        console.log(`  - ${m.version}: ${m.description}`);
      });
    }

    return;
  }

  // Default: run migrations
  runMigrations({ dryRun: args.dryRun });
}

// Run
main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
