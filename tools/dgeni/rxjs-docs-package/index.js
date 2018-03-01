const { resolve } = require('canonical-path');
const { readdirSync } = require('fs');
const Package = require('dgeni').Package;
const jsdoc = require('dgeni-packages/jsdoc');
const nunjucks = require('dgeni-packages/nunjucks');
const typescript = require('dgeni-packages/typescript');
const links = require('../links-package');

const PROJECT_PATH = resolve(__dirname, '../../../');
const DOC_GEN_PATH = resolve(PROJECT_PATH, 'tools/dgeni');

module.exports = new Package('rxjs-docs-package', [
  jsdoc,
  nunjucks,
  typescript,
  links
])

.processor(require('./processors/filterContainedDocs'))


// Where the docs come from
.config(function(readFilesProcessor, readTypeScriptModules) {
  readFilesProcessor.basePath = PROJECT_PATH;
  readFilesProcessor.sourceFiles = [
    'docs/**/*.md'
  ];
  readTypeScriptModules.basePath = resolve(PROJECT_PATH, 'src');
  readTypeScriptModules.sourceFiles = [
    'ajax/**/*.ts',
    'operators/**/*.ts',
    'testing/**/*.ts',
    'websocket/**/*.ts',
    // 'index.ts',
  ];
})


// Additional tag definitions
.config(function(parseTagsProcessor) {
  parseTagsProcessor.tagDefinitions.push({ name: 'internal' });
  parseTagsProcessor.tagDefinitions.push({ name: 'example', aliases: ['examples'], multi: true, docProperty: 'examples' });
  parseTagsProcessor.tagDefinitions.push({ name: 'owner' });
  parseTagsProcessor.tagDefinitions.push({ name: 'static' });
  // Replace the Catharsis type parsing, as it doesn't understand TypeScript type annotations (i.e. `foo(x: SomeType)`), with a simpler dummy transform
  const typeTags = parseTagsProcessor.tagDefinitions.filter(tagDef => ['param', 'returns', 'type', 'private', 'property', 'protected', 'public'].indexOf(tagDef.name) !== -1);
  typeTags.forEach(typeTag => typeTag.transforms[0] = require('./jsdoc-transforms/dummyTypeTransform'));
})

.config(function(computePathsProcessor, EXPORT_DOC_TYPES) {
  computePathsProcessor.pathTemplates.push({
    docTypes: ['module'],
    pathTemplate: '${id}',
    outputPathTemplate: '${path}/index.html',
  });
  computePathsProcessor.pathTemplates.push({
    docTypes: EXPORT_DOC_TYPES,
    pathTemplate: '${moduleDoc.path}/${name}.html',
    outputPathTemplate: '${path}',
  });
})

.config(function(getLinkInfo) {
  getLinkInfo.relativeLinks = true;
})

// Configure the rendering engine
.config(function(renderDocsProcessor, templateFinder, templateEngine, getInjectables) {

  // Where to find the templates for the doc rendering
  templateFinder.templateFolders = [resolve(DOC_GEN_PATH, 'templates/api')];

  // Standard patterns for matching docs to templates
  templateFinder.templatePatterns = [
    '${ doc.template }',
    '${ doc.id }.${ doc.docType }.template.html', '${ doc.id }.template.html', '${ doc.docType }.template.html',
    '${ doc.id }.${ doc.docType }.template.js', '${ doc.id }.template.js', '${ doc.docType }.template.js',
    '${ doc.id }.${ doc.docType }.template.json', '${ doc.id }.template.json', '${ doc.docType }.template.json',
    'common.template.html'
  ];

  // Nunjucks and Angular conflict in their template bindings so change Nunjucks
  templateEngine.config.tags = {variableStart: '{$', variableEnd: '$}'};

  templateEngine.filters = templateEngine.filters.concat(getInjectables(requireFolder(__dirname, './rendering')));

  // helpers are made available to the nunjucks templates
  renderDocsProcessor.helpers.relativePath = (from, to) => path.relative(from, to);
})


// Where the generated docs go
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder = resolve(PROJECT_PATH, 'dist/docs');
});


// Helper functions

function requireFolder(dirname, folderPath) {
  const absolutePath = resolve(dirname, folderPath);
  return readdirSync(absolutePath)
    .filter(p => !/[._]spec\.js$/.test(p))  // ignore spec files
    .map(p => require(resolve(absolutePath, p)));
}

