import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import fc from 'fast-check';
import { verifyRegistryIntegrity } from './install-pinned-npm.mjs';

test('accepts only the checked SHA-512 bytes', () => {
  fc.assert(
    fc.property(fc.uint8Array({ maxLength: 4096 }), (value) => {
      const bytes = Buffer.from(value);
      const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
      assert.equal(verifyRegistryIntegrity(bytes, integrity), integrity);
      assert.throws(() => verifyRegistryIntegrity(Buffer.concat([bytes, Buffer.of(0)]), integrity), /integrity mismatch/);
    }),
    { numRuns: 100 }
  );
});
