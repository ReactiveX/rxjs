const { resolve } = require('path');
const { readdirSync } = require('fs');

const PROJECT_ROOT = resolve(__dirname, '../../../..');
const AIO_PATH = resolve(PROJECT_ROOT, 'apps/rxjs.dev');
const TEMPLATES_PATH = resolve(AIO_PATH, 'tools/transforms/templates');
const API_TEMPLATES_PATH = resolve(TEMPLATES_PATH, 'api');
const CONTENTS_PATH = resolve(AIO_PATH, 'content');
const SRC_PATH = resolve(AIO_PATH, 'src');
const OUTPUT_PATH = resolve(SRC_PATH, 'generated');
const DOCS_OUTPUT_PATH = resolve(OUTPUT_PATH, 'docs');
const API_SOURCE_PATH = resolve(PROJECT_ROOT, 'packages/rxjs/src');
const MARBLE_IMAGES_PATH = resolve(SRC_PATH, 'assets/images/marble-diagrams');
const MARBLE_IMAGES_WEB_PATH = 'assets/images/marble-diagrams';
const DECISION_TREE_PATH = resolve(CONTENTS_PATH, 'operator-decision-tree.yml');

function requireFolder(dirname, folderPath) {
  const absolutePath = resolve(dirname, folderPath);
  return readdirSync(absolutePath)
    .filter((p) => !/[._]spec\.js$/.test(p)) // ignore spec files
    .map((p) => require(resolve(absolutePath, p)));
}

module.exports = {
  PROJECT_ROOT,
  AIO_PATH,
  TEMPLATES_PATH,
  API_TEMPLATES_PATH,
  CONTENTS_PATH,
  SRC_PATH,
  OUTPUT_PATH,
  DOCS_OUTPUT_PATH,
  API_SOURCE_PATH,
  MARBLE_IMAGES_PATH,
  MARBLE_IMAGES_WEB_PATH,
  DECISION_TREE_PATH,
  requireFolder,
};
