import { describe, expect, it } from 'vitest';
import { migrateTestSource as migrateFromLegacyPackage } from '../../migrate/src/index.js';
import { migrateTestSource } from '../src/migration/index.js';
import { mechanicalFixtures } from './migration/fixtures.js';

describe('migration engine transfer', () => {
  for (const fixture of mechanicalFixtures) {
    it(`${fixture.id} preserves candidate output and diagnostic identity`, () => {
      const options = { fileName: fixture.fileName };
      const legacy = migrateFromLegacyPackage(fixture.input, options);
      const transferred = migrateTestSource(fixture.input, options);
      expect(transferred).toEqual(legacy);
      expect(transferred.status).toBe(fixture.expectedStatus);
      expect(transferred.code).toBe(fixture.expected);

      if (transferred.status !== 'refused') {
        const secondPass = migrateTestSource(transferred.code, options);
        expect(secondPass.status).toBe('unchanged');
        expect(secondPass.code).toBe(transferred.code);
      }
    });
  }
});
