/**
 * LLM Client Library
 *
 * Unified interface for calling LLM APIs (Gemini, Claude)
 * with rate limiting, retry logic, and error handling.
 */

import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent } from 'undici';

dotenv.config();

// Configure proxy for accessing Google API (if needed)
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
if (PROXY_URL) {
  const proxyAgent = new ProxyAgent(PROXY_URL);
  (global as any).dispatcher = proxyAgent;
  console.log(`[LLM] Using proxy: ${PROXY_URL}`);
}

// ============================================================================
// Types
// ============================================================================

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMOptions {
  temperature?: number; // 0-1 (creativity)
  maxTokens?: number; // Max response length
  systemPrompt?: string; // System message
}

// ============================================================================
// Configuration
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_KEY;

if (!GEMINI_API_KEY) {
  console.warn('[WARN] GEMINI_KEY not found in .env file');
}

// Initialize Gemini client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ============================================================================
// Gemini API Client
// ============================================================================

/**
 * Call Gemini API using official SDK
 *
 * @param prompt - User prompt
 * @param options - LLM options (temperature, max tokens, etc.)
 * @returns LLM response
 */
export async function callGemini(
  prompt: string,
  options: LLMOptions = {}
): Promise<LLMResponse> {
  if (!genAI) {
    throw new Error('GEMINI_KEY not configured in .env file');
  }

  const {
    temperature = 0.7,
    maxTokens = 8000,
    systemPrompt
  } = options;

  // Use Gemini Pro (stable model)
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.95,
      topK: 40
    }
  });

  // Build full prompt with system message if provided
  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt}`
    : prompt;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No content in Gemini response');
    }

    return {
      content,
      model: 'gemini-pro',
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  } catch (err) {
    throw new Error(`Gemini API error: ${(err as Error).message}`);
  }
}

// ============================================================================
// Rate Limiting & Retry Logic
// ============================================================================

/**
 * Call LLM with retry logic and rate limiting
 *
 * @param prompt - User prompt
 * @param options - LLM options
 * @param retries - Max number of retries on failure (default: 3)
 * @returns LLM response
 */
export async function callLLMWithRetry(
  prompt: string,
  options: LLMOptions = {},
  retries: number = 3
): Promise<LLMResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await callGemini(prompt, options);
      return response;
    } catch (err) {
      lastError = err as Error;
      console.error(`[LLM] Attempt ${attempt + 1}/${retries} failed:`, (err as Error).message);

      if (attempt < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[LLM] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`LLM call failed after ${retries} attempts: ${lastError?.message}`);
}

/**
 * Rate-limited LLM call (ensures minimum delay between requests)
 *
 * @param prompt - User prompt
 * @param options - LLM options
 * @param minDelay - Minimum delay in ms between calls (default: 1000ms)
 * @returns LLM response
 */
let lastCallTime = 0;

export async function callLLMRateLimited(
  prompt: string,
  options: LLMOptions = {},
  minDelay: number = 1000
): Promise<LLMResponse> {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTime;

  if (timeSinceLastCall < minDelay) {
    const delay = minDelay - timeSinceLastCall;
    console.log(`[LLM] Rate limiting: waiting ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  const response = await callLLMWithRetry(prompt, options);
  lastCallTime = Date.now();

  return response;
}

// ============================================================================
// Structured Output Parsing
// ============================================================================

/**
 * Extract JSON from LLM response
 *
 * Handles markdown code blocks and attempts to parse JSON.
 *
 * @param response - LLM response content
 * @returns Parsed JSON object
 */
export function parseJSON<T = any>(response: string): T {
  // Remove markdown code blocks if present
  let cleaned = response.trim();

  // Remove ```json ... ``` blocks
  const jsonMatch = cleaned.match(/```json\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  } else {
    // Remove generic ``` ... ``` blocks
    const codeMatch = cleaned.match(/```\s*\n?([\s\S]*?)\n?```/);
    if (codeMatch) {
      cleaned = codeMatch[1];
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON from LLM response: ${(err as Error).message}\n\nResponse: ${response.substring(0, 500)}...`);
  }
}

/**
 * Call LLM and expect JSON response
 *
 * @param prompt - User prompt (should request JSON output)
 * @param options - LLM options
 * @returns Parsed JSON object
 */
export async function callLLMForJSON<T = any>(
  prompt: string,
  options: LLMOptions = {}
): Promise<T> {
  const response = await callLLMRateLimited(prompt, options);
  return parseJSON<T>(response.content);
}
