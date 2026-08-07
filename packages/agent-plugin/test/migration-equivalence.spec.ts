import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { migrateTestSource as migrateFromLegacyPackage } from '../../migrate/src/index.js';
import { defaultCapabilityRegistry, migrateTestSource } from '../src/migration/index.js';
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

  it('refuses removed RxJS 7 thisArg overloads in both engine copies', () => {
    const source = `import { map } from 'rxjs/operators';\nconst result = values.pipe(map(project, context));\n`;
    const legacy = migrateFromLegacyPackage(source, { fileName: 'map-this-arg.ts' });
    const transferred = migrateTestSource(source, { fileName: 'map-this-arg.ts' });

    expect(transferred).toEqual(legacy);
    expect(transferred).toMatchObject({ status: 'refused', code: source });
    expect(transferred.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unsupported-overload',
        disposition: 'refused',
        capabilityId: 'operator.map',
      })
    );
  });

  it('lists every versioned registry capability in the generated reference', async () => {
    const markdown = await readFile(new URL('../skills/migrate-rxjs-7-to-9/references/migration-capabilities.md', import.meta.url), 'utf8');
    const listed = [...markdown.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]);
    expect(listed).toEqual(defaultCapabilityRegistry.capabilities.map(({ id }) => id));
  });

  it('records platform-method candidates without changing the cold default', () => {
    expect(defaultCapabilityRegistry.capabilities.find(({ legacyName }) => legacyName === 'map')?.target).toBe('platform-method');
    expect(defaultCapabilityRegistry.capabilities.find(({ legacyName }) => legacyName === 'filter')?.target).toBe('platform-method');
    expect(defaultCapabilityRegistry.capabilities.find(({ legacyName }) => legacyName === 'concatMap')?.platformMethod).toBe('flatMap');
    expect(defaultCapabilityRegistry.capabilities.find(({ legacyName }) => legacyName === 'takeUntil')?.target).toBe('exact-symbol');
  });
});
