import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { defaultMigrationSurfaceCatalog } from '../src/migration/index.js';

const entrypoints = {
  rxjs: '../node_modules/rxjs7/dist/types/index.d.ts',
  'rxjs/operators': '../node_modules/rxjs7/dist/types/operators/index.d.ts',
  'rxjs/ajax': '../node_modules/rxjs7/dist/types/ajax/index.d.ts',
  'rxjs/fetch': '../node_modules/rxjs7/dist/types/fetch/index.d.ts',
  'rxjs/webSocket': '../node_modules/rxjs7/dist/types/webSocket/index.d.ts',
  'rxjs/testing': '../node_modules/rxjs7/dist/types/testing/index.d.ts',
} as const;

describe('complete RxJS 7 migration surface catalog', () => {
  it('covers every named public declaration from every pinned package entrypoint', async () => {
    for (const [entrypoint, path] of Object.entries(entrypoints)) {
      const declarations = await readFile(new URL(path, import.meta.url), 'utf8');
      const expected = parseReexports(declarations);
      const actual = new Set(
        defaultMigrationSurfaceCatalog.surfaces
          .filter(({ importPaths }) => importPaths.includes(entrypoint))
          .map(({ name }) => name)
      );
      expect([...expected].filter((name) => !actual.has(name)), entrypoint).toEqual([]);
    }
  });

  it('covers every public type re-exported through rxjs', async () => {
    const declarations = await readFile(new URL('../node_modules/rxjs7/dist/types/internal/types.d.ts', import.meta.url), 'utf8');
    const expected = parseExportedDeclarations(declarations);
    const actual = new Set(
      defaultMigrationSurfaceCatalog.surfaces
        .filter(({ importPaths }) => importPaths.includes('rxjs'))
        .map(({ name }) => name)
    );
    expect([...expected].filter((name) => !actual.has(name))).toEqual([]);
  });

  it('covers all 114 public operators, including root-only and deprecated aliases, with one explicit disposition', () => {
    const operators = defaultMigrationSurfaceCatalog.surfaces.filter(({ kind }) => kind === 'operator');
    expect(operators).toHaveLength(114);
    expect(new Set(operators.map(({ name }) => name)).size).toBe(114);
    expect(operators.find(({ name }) => name === 'combineAll')?.migration.target).toContain('combineLatestAll');
    expect(operators.find(({ name }) => name === 'partition')?.migration.target).toContain('partition');
    expect(operators.find(({ name }) => name === 'onErrorResumeNextWith')?.importPaths).toEqual(['rxjs']);
    expect(operators.every(({ migration }) => migration.disposition.length > 0)).toBe(true);
  });

  it('keeps full catalog coverage separate from fixture-proved automation', () => {
    expect(defaultMigrationSurfaceCatalog.counts.total).toBeGreaterThan(200);
    expect(defaultMigrationSurfaceCatalog.counts.mechanicallyProved).toBe(10);
    expect(defaultMigrationSurfaceCatalog.lifecyclePolicy).toMatchObject({
      defaultTarget: 'producer-per-direct-subscription',
      defaultConstructor: 'ColdObservable',
    });
  });
});

function parseReexports(contents: string): Set<string> {
  return new Set(
    [...contents.matchAll(/^export \{ ([^}]+) \} from ['"][^'"]+['"];$/gm)].flatMap((match) =>
      match[1]!.split(',').map((part) => {
        const [sourceName, exportedName] = part.trim().split(/\s+as\s+/);
        return exportedName ?? sourceName!;
      })
    )
  );
}

function parseExportedDeclarations(contents: string): Set<string> {
  return new Set(
    [...contents.matchAll(/^export (?:declare )?(?:interface|type|class|const|function|enum) ([A-Za-z_$][\w$]*)/gm)].map(
      (match) => match[1]!
    )
  );
}
