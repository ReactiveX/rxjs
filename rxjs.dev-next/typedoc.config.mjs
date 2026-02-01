// @ts-check
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '../');
const RXJS_SRC = resolve(PROJECT_ROOT, 'src');

const TYPEDOC_TSCONFIG = resolve(__dirname, 'tsconfig.typedoc.json');

export default {
  name: 'API',
  entryPoints: [
    resolve(RXJS_SRC, 'index.ts'),
    resolve(RXJS_SRC, 'operators/index.ts'),
    resolve(RXJS_SRC, 'ajax/index.ts'),
    resolve(RXJS_SRC, 'fetch/index.ts'),
    resolve(RXJS_SRC, 'webSocket/index.ts'),
    resolve(RXJS_SRC, 'testing/index.ts'),
  ],
  entryPointStrategy: 'resolve',
  tsconfig: TYPEDOC_TSCONFIG,
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.spec.ts',
    '**/*.test.ts',
  ],
  readme: 'none',
  navigation: {
    includeGroups: false,
  },
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  excludeExternals: false, // Need to include externals to resolve @rxjs/observable
  gitRevision: 'master',
  // Don't include source file paths in output
  // TypeDoc-specific options
  categorizeByGroup: false,
  // Log level - only show warnings and errors, not info
  logLevel: 'Warn',
  // JSON output path (will be overridden in generate script)
  plugin: [
    'typedoc-plugin-markdown', // @ts-ignore
    'typedoc-vitepress-theme',
    './tools/api-generator/typedoc-plugin-rxjs.mjs'
  ],
  hidePageHeader: true,
  hideBreadcrumbs: false,
  hidePageTitle: false,
  expandObjects: true,
  expandParameters: true,
  useCodeBlocks: true,
  jsDocCompatibility: true,
  includeHierarchySummary: false,
  parametersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  sidebar: {
    petty: true,
  },
  tableColumnSettings: {
    hideDefaults: false,
    hideInherited: false,
    hideModifiers: true,
    hideOverrides: false,
    hideSources: true,
    hideValues: false,
    leftAlignHeaders: false
  },
  typeAliasPropertiesFormat: 'table',
  enumMembersFormat: 'table',
  propertyMembersFormat: 'table',
  typeDeclarationFormat: 'table',

  emit: 'both',
  out: './docs/api',
  docsRoot: './docs'
};

