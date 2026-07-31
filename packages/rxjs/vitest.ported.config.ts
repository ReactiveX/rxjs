import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const mode = process.env.RXJS_NEXT_TEST_MODE ?? 'cold';
if (mode !== 'cold' && mode !== 'polyfill' && mode !== 'native') {
  throw new Error(`Unknown ported test mode: ${mode}`);
}

const nativeUnavailable = mode === 'native' && typeof globalThis.Observable !== 'function';
const auditOnly = process.env.RXJS_NEXT_AUDIT_ONLY === '1';
const suiteDirectory = mode === 'cold' ? 'cold' : 'platform';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@rxjs/test', replacement: resolve(import.meta.dirname, '../test/src/index.ts') },
      { find: /^rxjs\/(.+)$/, replacement: `${resolve(import.meta.dirname, 'src')}/$1.ts` },
      { find: 'rxjs', replacement: resolve(import.meta.dirname, 'src/index.ts') },
    ],
  },
  test: {
    reporters: ['default'],
    include: nativeUnavailable
      ? ['test/ported/native-unavailable.spec.ts']
      : [`test/ported/${suiteDirectory}/**/*.spec.ts`, ...(mode === 'cold' || auditOnly ? [] : ['test/ported/platform-lifecycle.spec.ts'])],
    setupFiles: ['./test/ported/setup.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
  },
});
