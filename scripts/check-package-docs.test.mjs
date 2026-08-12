import assert from 'node:assert/strict';
import test from 'node:test';
import { auditPackageDocs } from './check-package-docs.mjs';

function validInput() {
  return {
    documents: new Map([
      ['README.md', '[RxJS](packages/rxjs/README.md)'],
      ['packages/rxjs/README.md', '[API](docs/API.md)'],
      ['packages/rxjs/docs/API.md', '# API'],
    ]),
    existingPaths: new Set(['packages/rxjs', 'packages/rxjs/README.md', 'packages/rxjs/docs', 'packages/rxjs/docs/API.md']),
    manifests: {
      'packages/rxjs/package.json': { files: ['dist', 'README.md', 'MIGRATION.md', 'CONTRIBUTING.md', 'docs'] },
      'packages/observable-polyfill/package.json': { files: ['dist', 'README.md'] },
      'packages/test/package.json': { files: ['dist', 'README.md'] },
      'packages/migrate/package.json': { files: ['dist', 'README.md', 'docs', 'skill'] },
    },
  };
}

test('accepts package-owned published documentation with valid local links', () => {
  assert.deepEqual(auditPackageDocs(validInput()), []);
});

test('rejects missing publication paths, broken links, and documentation-site coupling', () => {
  const input = validInput();
  input.manifests['packages/rxjs/package.json'].files = ['dist', 'MIGRATION.md', 'CONTRIBUTING.md', 'docs'];
  input.documents.set('README.md', '[Missing](packages/rxjs/NOPE.md) and https://rxjs.dev');

  const errors = auditPackageDocs(input);
  assert.equal(errors.length, 3);
  assert.match(errors.join('\n'), /must publish package documentation path README\.md/);
  assert.match(errors.join('\n'), /documentation-site workstream/);
  assert.match(errors.join('\n'), /missing local link/);
});

test('rejects package documentation links that escape their package container', () => {
  const input = validInput();
  input.documents.set('packages/rxjs/README.md', '[Migration tool](../migrate/README.md)');
  input.existingPaths.add('packages/migrate/README.md');

  assert.deepEqual(auditPackageDocs(input), [
    'packages/rxjs/README.md has a local link outside its package container: ../migrate/README.md.',
  ]);
});
