// @ts-check
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '../../');
const TYPEDOC_TSCONFIG = resolve(__dirname, 'tsconfig.typedoc.json');

const packages = [
  ['rxjs', 'packages/rxjs'],
  ['@rxjs/observable-polyfill', 'packages/observable-polyfill'],
  ['@rxjs/test', 'packages/test'],
  ['@rxjs/migrate', 'packages/migrate'],
];

function findTypesTarget(value) {
  if (typeof value === 'string') {
    return value.endsWith('.d.ts') ? value : undefined;
  }
  if (value && typeof value === 'object') {
    if (typeof value.types === 'string') {
      return value.types;
    }
    for (const nested of Object.values(value)) {
      const target = findTypesTarget(nested);
      if (target) {
        return target;
      }
    }
  }
}

const entryPoints = packages.flatMap(([name, packagePath]) => {
  const packageRoot = resolve(PROJECT_ROOT, packagePath);
  const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'));

  return Object.entries(packageJson.exports ?? {}).flatMap(([subpath, value]) => {
    if (subpath === './package.json') {
      return [];
    }
    const typesTarget = findTypesTarget(value);
    if (!typesTarget) {
      return [];
    }
    const sourceTarget = typesTarget.replace(/^\.\/dist\/esm\//, './src/').replace(/\.d\.ts$/, '.ts');
    return [resolve(packageRoot, sourceTarget)];
  });
});

export default {
  name: 'API',
  entryPoints,
  entryPointStrategy: 'resolve',
  tsconfig: TYPEDOC_TSCONFIG,
  // The complete TypeScript program is checked separately. TypeDoc creates
  // per-entry-point programs that cannot resolve every workspace subpath.
  skipErrorChecking: true,
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
  excludeExternals: true,
  gitRevision: 'master',
  hostedBaseUrl: 'https://github.com/ReactiveX/rxjs/blob/master/',
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
