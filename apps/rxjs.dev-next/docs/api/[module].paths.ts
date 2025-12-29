import { loadTypeDocJSON, organizeByModules } from '../../tools/api-generator/typedoc-to-markdown.js';
import { generateModuleMarkdown } from '../../tools/api-generator/markdown-generator.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CACHE_PATH = resolve(__dirname, '../../.vitepress/cache/api-docs.json');

export default {
  watch: [CACHE_PATH],

  paths() {
    // Check if TypeDoc JSON exists
    if (!existsSync(CACHE_PATH)) {
      console.warn('TypeDoc JSON not found. Run "npm run api:generate" first.');
      return [];
    }

    try {
      const project = loadTypeDocJSON(CACHE_PATH);
      const modules = organizeByModules(project);

      // Generate paths for each module with content
      const paths = Array.from(modules.keys()).map(module => ({
        params: { module },
        content: generateModuleMarkdown(module, project)
      }));

      return paths;
    } catch (error) {
      console.error('Error loading TypeDoc JSON:', error);
      return [];
    }
  }
};

