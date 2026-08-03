import assert from 'node:assert/strict';
import test from 'node:test';
import { npmRegistryVersionUrl } from './release-config.mjs';

test('builds npm registry version URLs for scoped and unscoped packages', () => {
  assert.equal(npmRegistryVersionUrl('rxjs', '9.0.0-beta.0'), 'https://registry.npmjs.org/rxjs/9.0.0-beta.0');
  assert.equal(
    npmRegistryVersionUrl('@rxjs/observable-polyfill', '9.0.0-beta.0'),
    'https://registry.npmjs.org/@rxjs%2Fobservable-polyfill/9.0.0-beta.0'
  );
});
