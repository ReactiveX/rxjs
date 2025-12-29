import { Application } from 'typedoc';
import { typedocConfig } from './typedoc.config.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CACHE_DIR = resolve(__dirname, '../.vitepress/cache');
const OUTPUT_FILE = resolve(CACHE_DIR, 'api-docs.json');
const PROJECT_ROOT = resolve(__dirname, '../../../..');

async function generateTypeDocJSON() {
  console.log('Generating TypeDoc JSON...');

  // Ensure cache directory exists
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }

  // Bootstrap TypeDoc application with our config
  const app = await Application.bootstrap({
    ...typedocConfig,
    // Override json path to our output file
    json: OUTPUT_FILE,
    // Log errors but continue
    logLevel: 'Warn',
  });

  // Convert the project (returns a Promise)
  const project = await app.convert();

  if (!project) {
    throw new Error('Failed to convert TypeDoc project. Check the logs above for details.');
  }

  // Validate the project (this is what TypeDoc CLI does)
  app.validate(project);

  // Check for errors after validation
  if (app.logger.hasErrors()) {
    throw new Error('TypeDoc project validation failed. Check the logs above for details.');
  }

  // Generate JSON - this should work now that project is validated
  await app.generateJson(project, OUTPUT_FILE);

  console.log(`TypeDoc JSON generated at: ${OUTPUT_FILE}`);

  // Also write a simplified index for quick lookups
  const index = {
    generated: new Date().toISOString(),
    project: {
      name: project.name,
      version: project.packageVersion,
    },
  };

  await writeFile(
    resolve(CACHE_DIR, 'api-index.json'),
    JSON.stringify(index, null, 2)
  );

  return OUTPUT_FILE;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('generate-typedoc-json.ts')) {
  generateTypeDocJSON()
    .then(() => {
      console.log('TypeDoc JSON generation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error generating TypeDoc JSON:', error);
      process.exit(1);
    });
}

export { generateTypeDocJSON };

