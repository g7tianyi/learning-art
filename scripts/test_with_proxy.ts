#!/usr/bin/env tsx

/**
 * Test Gemini API with proxy
 */

import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent } from 'undici';

dotenv.config();

// Configure proxy
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
(global as any).dispatcher = proxyAgent;

async function test() {
  console.log('Testing Gemini API with proxy (http://127.0.0.1:7890)...\n');

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_KEY not found in .env');
    process.exit(1);
  }

  console.log(`API Key: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent('Say "Hello, the API is working!" in exactly those words.');
    const response = result.response;
    const text = response.text();

    console.log('\n✅ SUCCESS!');
    console.log('Response:', text);
    console.log('\nUsage:', response.usageMetadata);
  } catch (err: any) {
    console.error('\n❌ FAILED!');
    console.error('Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

test();
