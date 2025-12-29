#!/usr/bin/env node

/**
 * API Generator Orchestrator
 *
 * This script orchestrates the TypeDoc generation process:
 * 1. Run TypeDoc to generate JSON
 * 2. Cache the JSON for VitePress paths loaders
 * 3. VitePress will use paths loaders to generate pages at build time
 */

import { generateTypeDocJSON } from './generate-typedoc-json.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdir } from 'fs';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mkdirAsync = promisify(mkdir);

async function main() {
  console.log('Starting API documentation generation...\n');

  // Ensure cache directory exists
  const cacheDir = resolve(__dirname, '../.vitepress/cache');
  if (!existsSync(cacheDir)) {
    await mkdirAsync(cacheDir, { recursive: true });
  }

  try {
    // Generate TypeDoc JSON
    await generateTypeDocJSON();

    console.log('\n✅ API documentation generation complete!');
    console.log('   TypeDoc JSON is cached and ready for VitePress.');
    console.log('   Run "npm run dev" or "npm run build" to generate pages.\n');
  } catch (error) {
    console.error('\n❌ Error generating API documentation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as generateAPI };

