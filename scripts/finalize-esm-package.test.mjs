import assert from 'node:assert/strict';
import test from 'node:test';
import { finalizeEsmManifest } from './finalize-esm-package.mjs';

function manifest() {
  return {
    name: 'example',
    main: './dist/commonjs/index.js',
    types: './dist/commonjs/index.d.ts',
    tshy: { dialects: ['esm'] },
    exports: {
      './package.json': './package.json',
      '.': {
        import: {
          types: './dist/esm/index.d.ts',
          default: './dist/esm/index.js',
        },
      },
    },
  };
}

test('publishes one ESM target for import, require, browser, and webpack resolution', () => {
  const finalized = finalizeEsmManifest(manifest(), { browserConditions: true });

  assert.equal('main' in finalized, false);
  assert.equal('types' in finalized, false);
  assert.deepEqual(finalized.exports['.'], {
    browser: finalized.exports['.'].import,
    webpack: finalized.exports['.'].import,
    import: {
      types: './dist/esm/index.d.ts',
      default: './dist/esm/index.js',
    },
    require: finalized.exports['.'].import,
  });
});

test('rejects generated non-ESM and target-specific dialects', () => {
  const wrongDialect = manifest();
  wrongDialect.tshy.dialects = ['esm', 'commonjs'];
  assert.throws(() => finalizeEsmManifest(wrongDialect), /must configure tshy\.dialects/);

  const extraDialect = manifest();
  extraDialect.tshy.esmDialects = ['browser'];
  assert.throws(() => finalizeEsmManifest(extraDialect), /must not generate target-specific/);

  const wrongTarget = manifest();
  wrongTarget.exports['.'].import.default = './dist/commonjs/index.js';
  assert.throws(() => finalizeEsmManifest(wrongTarget), /non-ESM target/);
});
