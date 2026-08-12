import assert from 'node:assert/strict';
import test from 'node:test';
import { auditPackedPackage } from './prerelease-adoption-lib.mjs';

const budgets = { packageTarballBytes: { rxjs: 250_000 } };
const validFiles = [
  'README.md',
  'MIGRATION.md',
  'CONTRIBUTING.md',
  'docs/API.md',
  'docs/RELEASE_GATES.md',
  'docs/PRERELEASE_APPROVAL.md',
  'dist/esm/index.js',
  'dist/esm/index.d.ts',
  'package.json',
].map((path) => ({ path }));

test('accepts a documented ESM-only package within its tarball budget', () => {
  assert.deepEqual(auditPackedPackage({ name: 'rxjs', files: validFiles, size: 200_000 }, budgets), []);
});

test('rejects missing docs, source specs, duplicate dialects, and budget regressions', () => {
  const errors = auditPackedPackage(
    {
      name: 'rxjs',
      files: validFiles
        .filter(({ path }) => path !== 'docs/API.md')
        .concat({ path: 'src/index.ts' }, { path: 'test/index.spec.ts' }, { path: 'dist/commonjs/index.js' }),
      size: 250_001,
    },
    budgets
  );
  assert.equal(errors.length, 5);
  assert.match(errors.join('\n'), /missing docs\/API\.md/);
  assert.match(errors.join('\n'), /source\/test file/);
  assert.match(errors.join('\n'), /duplicate dialect/);
  assert.match(errors.join('\n'), /tarball is 250001 bytes/);
});
