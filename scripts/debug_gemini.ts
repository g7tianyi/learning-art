#!/usr/bin/env tsx

/**
 * Detailed Gemini API diagnostic script
 */

import * as dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const GEMINI_KEY = process.env.GEMINI_KEY;

async function diagnose() {
  console.log('='.repeat(80));
  console.log('Gemini API Diagnostic');
  console.log('='.repeat(80));

  // 1. Check API key
  console.log('\n[1] API Key Check:');
  if (!GEMINI_KEY) {
    console.log('  ❌ GEMINI_KEY not found in .env');
    return;
  }
  console.log(`  ✓ API key found (length: ${GEMINI_KEY.length})`);
  console.log(`  ✓ First 10 chars: ${GEMINI_KEY.substring(0, 10)}...`);

  // 2. Try listing models (simpler endpoint)
  console.log('\n[2] Testing list models endpoint:');
  const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_KEY}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    console.log(`  URL: ${listUrl.replace(GEMINI_KEY, '***KEY***')}`);
    console.log('  Sending request...');

    const response = await fetch(listUrl, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log(`  Response status: ${response.status}`);
    console.log(`  Response headers:`, Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log(`  Response body (first 500 chars):\n${text.substring(0, 500)}`);

    if (response.ok) {
      console.log('  ✓ API connection successful!');
      const data = JSON.parse(text);
      console.log(`\n[3] Available models (${data.models?.length || 0}):`);
      data.models?.slice(0, 5).forEach((m: any) => {
        console.log(`    - ${m.name}`);
      });
    } else {
      console.log(`  ❌ API returned error ${response.status}`);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('  ❌ Request timed out after 10 seconds');
      console.log('  This suggests network connectivity issues or firewall blocking');
    } else {
      console.log(`  ❌ Error: ${err.message}`);
      console.log(`  Full error:`, err);
    }
  }

  console.log('\n' + '='.repeat(80));
}

diagnose();
