#!/usr/bin/env tsx

/**
 * Simple Gemini API test script
 */

import { callGemini } from './lib/llm';

async function test() {
  console.log('Testing Gemini API connection...\n');

  try {
    const response = await callGemini('Say "Hello, the API is working!" in exactly those words.', {
      temperature: 0.1,
      maxTokens: 50
    });

    console.log('✅ SUCCESS!');
    console.log('Response:', response.content);
    console.log('Model:', response.model);
    console.log('Usage:', response.usage);
  } catch (err) {
    console.error('❌ FAILED!');
    console.error('Error:', (err as Error).message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

test();
