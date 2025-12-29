import type { TypeDocOptions } from 'typedoc';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, '../../../..');
const RXJS_PACKAGE = resolve(PROJECT_ROOT, 'packages/rxjs');
const RXJS_SRC = resolve(RXJS_PACKAGE, 'src');
const RXJS_TSCONFIG = resolve(RXJS_PACKAGE, 'tsconfig.json');
const TYPEDOC_TSCONFIG = resolve(__dirname, 'tsconfig.typedoc.json');

export const typedocConfig: Partial<TypeDocOptions> = {
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
  excludePrivate: true,
  excludeProtected: false,
  excludeInternal: true,
  excludeExternals: false, // Need to include externals to resolve @rxjs/observable
  readme: 'none',
  gitRevision: 'main',
  // Filter out internal exports (matching old Dgeni config: /^[_ɵ]|^VERSION$/)
  excludeTags: ['@internal'],
  // Don't include source file paths in output
  includeVersion: false,
  // TypeDoc-specific options
  sort: ['source-order'],
  categorizeByGroup: false,
  // Log level - only show warnings and errors, not info
  logLevel: 'Warn',
  // JSON output path (will be overridden in generate script)
  json: resolve(__dirname, '../.vitepress/cache/api-docs.json'),
};

