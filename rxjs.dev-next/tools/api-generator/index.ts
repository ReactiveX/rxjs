import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import sidebar from '../../docs/api/typedoc-sidebar.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the absolute path of the pages directory relative to this file
const pagesDir = resolve(__dirname, 'pages');
const docsDir = resolve(__dirname, '../../docs/api');

// Recursively copy all files from pagesDir to docsDir
execSync(`cp -R ${pagesDir}/. ${docsDir}/`);

const newSidebar = [{ text: 'API Explorer', link: '/api#explorer' }, ...sidebar];

writeFileSync(
  resolve(docsDir, 'typedoc-sidebar.json'),
  JSON.stringify(newSidebar, null, 2),
);
