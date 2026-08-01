import assert from 'node:assert/strict';
import test from 'node:test';
import { safariCapabilities } from './safari-driver.mjs';

test('desktop Safari capabilities request the native desktop browser', () => {
  assert.deepEqual(safariCapabilities('desktop'), { alwaysMatch: { browserName: 'Safari' } });
});

test('Mobile Safari capabilities require an actual iOS simulator session', () => {
  assert.deepEqual(safariCapabilities('ios'), {
    alwaysMatch: {
      browserName: 'Safari',
      platformName: 'iOS',
      'safari:useSimulator': true,
    },
  });
});

test('unknown Safari targets are rejected', () => {
  assert.throws(() => safariCapabilities('webkit'), /Unknown Safari target/);
});
