/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const Package = require('dgeni').Package;

const basePackage = require('../angular-base-package');
const typeScriptPackage = require('dgeni-packages/typescript');
// prettier-ignore
const { API_SOURCE_PATH, API_TEMPLATES_PATH, MARBLE_IMAGES_PATH, MARBLE_IMAGES_WEB_PATH,
  requireFolder } = require('../config');

// prettier-ignore
module.exports = new Package('angular-api', [basePackage, typeScriptPackage])

  // Register the processors
  .processor(require('./processors/migrateLegacyJSDocTags'))
  .processor(require('./processors/splitDescription'))
  .processor(require('./processors/convertPrivateClassesToInterfaces'))
  .processor(require('./processors/generateApiListDoc'))
  .processor(require('./processors/generateDeprecationsListDoc'))
  .processor(require('./processors/mergeDecoratorDocs'))
  .processor(require('./processors/extractDecoratedClasses'))
  .processor(require('./processors/matchUpDirectiveDecorators'))
  .processor(require('./processors/addMetadataAliases'))
  .processor(require('./processors/computeApiBreadCrumbs'))
  .processor(require('./processors/filterContainedDocs'))
  .processor(require('./processors/processClassLikeMembers'))
  .processor(require('./processors/markBarredODocsAsPrivate'))
  .processor(require('./processors/filterPrivateDocs'))
  .processor(require('./processors/computeSearchTitle'))
  .processor(require('./processors/simplifyMemberAnchors'))
  .processor(require('./processors/computeStability'))
  .processor(require('./processors/markAliases').markAliases)
  .processor(require('./processors/checkOperator'))

  .factory(require('./post-processors/embedMarbleDiagrams'))

  /**
   * These are the API doc types that will be rendered to actual files.
   * This is a super set of the exported docs, since we convert some classes to
   * more Angular specific API types, such as decorators and directives.
   */
  .factory(function API_DOC_TYPES_TO_RENDER(EXPORT_DOC_TYPES) {
    return EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe', 'module', 'deprecation']);
  })

  /**
   * These are the doc types that are API docs, including ones that will be merged into container docs,
   * such as members and overloads.
   */
  .factory(function API_DOC_TYPES(API_DOC_TYPES_TO_RENDER) {
    return API_DOC_TYPES_TO_RENDER.concat(['member', 'function-overload']);
  })

  // Where do we get the source files?
  .config(function (readTypeScriptModules) {
    // API files are typescript
    readTypeScriptModules.basePath = API_SOURCE_PATH;
    readTypeScriptModules.ignoreExportsMatching = [/^[_ɵ]|^VERSION$/];
    readTypeScriptModules.hidePrivateMembers = true;

    // NOTE: This list should be in sync with tools/public_api_guard/BUILD.bazel
    readTypeScriptModules.sourceFiles = [
      'index.ts',
      'operators/index.ts',
      'ajax/index.ts',
      'fetch/index.ts',
      'webSocket/index.ts',
      'testing/index.ts'
    ];
  })

  // Configure jsdoc-style tag parsing
  .config(function (parseTagsProcessor, getInjectables) {
    // Load up all the tag definitions in the tag-defs folder
    parseTagsProcessor.tagDefinitions =
        parseTagsProcessor.tagDefinitions.concat(getInjectables(requireFolder(__dirname, './tag-defs')));
  })

  .config(function (computeStability, splitDescription, EXPORT_DOC_TYPES, API_DOC_TYPES) {
    computeStability.docTypes = EXPORT_DOC_TYPES;
    // Only split the description on the API docs
    splitDescription.docTypes = API_DOC_TYPES;
  })

  .config(function (computePathsProcessor, EXPORT_DOC_TYPES, generateApiListDoc, generateDeprecationListDoc) {
    const API_SEGMENT = 'api';

    generateApiListDoc.outputFolder = API_SEGMENT;
    generateDeprecationListDoc.outputFolder = API_SEGMENT;

    computePathsProcessor.pathTemplates.push({
      docTypes: ['module'],
      getPath: function computeModulePath(doc) {
        doc.moduleFolder = `${API_SEGMENT}/${doc.id.replace(/\/index$/, '')}`;
        return doc.moduleFolder;
      },
      outputPathTemplate: '${moduleFolder}.json'
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: EXPORT_DOC_TYPES.concat(['decorator', 'directive', 'pipe']),
      pathTemplate: '${moduleDoc.moduleFolder}/${name}',
      outputPathTemplate: '${moduleDoc.moduleFolder}/${name}.json',
    });
    computePathsProcessor.pathTemplates.push({
      docTypes: ['const', 'function', 'interface', 'class', 'type-alias'],
      getPath: (doc) => {
        return `${API_SEGMENT}/${doc.id.replace(/^index\//, `index/${doc.docType}/`)}`;
      },
      outputPathTemplate: '${path}.json',
    });
  })

  .config(function (templateFinder) {
    // Where to find the templates for the API doc rendering
    templateFinder.templateFolders.unshift(API_TEMPLATES_PATH);
  })

  .config(function (embedMarbleDiagramsPostProcessor) {
    embedMarbleDiagramsPostProcessor.marbleImagesPath = MARBLE_IMAGES_PATH;
    embedMarbleDiagramsPostProcessor.marbleImagesOutputWebPath = `/${MARBLE_IMAGES_WEB_PATH}`;
  })

  .config(function (convertToJsonProcessor, postProcessHtml, API_DOC_TYPES_TO_RENDER, API_DOC_TYPES, autoLinkCode, embedMarbleDiagramsPostProcessor) {
    convertToJsonProcessor.docTypes = convertToJsonProcessor.docTypes.concat(API_DOC_TYPES_TO_RENDER);
    postProcessHtml.docTypes = convertToJsonProcessor.docTypes.concat(API_DOC_TYPES_TO_RENDER);
    postProcessHtml.plugins.push(embedMarbleDiagramsPostProcessor.process);
    autoLinkCode.docTypes = API_DOC_TYPES;
    autoLinkCode.codeElements = ['code', 'code-example', 'code-pane'];
  });
