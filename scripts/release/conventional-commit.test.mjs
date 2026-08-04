import assert from 'node:assert/strict';
import test from 'node:test';
import { validateConventionalTitle } from './conventional-commit.mjs';

test('accepts the repository Conventional Commit title forms', () => {
  assert.deepEqual(validateConventionalTitle('fix: repair teardown'), {
    breaking: false,
    description: 'repair teardown',
    type: 'fix',
  });
  assert.deepEqual(validateConventionalTitle('feat(observable)!: change lifecycle'), {
    breaking: true,
    description: 'change lifecycle',
    type: 'feat',
  });
});

test('rejects unsupported or empty titles', () => {
  for (const title of ['', 'Update release', 'feature: wrong type', 'fix:']) {
    assert.throws(() => validateConventionalTitle(title), /not a supported Conventional Commit/);
  }
});
