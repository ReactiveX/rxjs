import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { defaultCapabilityRegistry, migrateTestSource } from '../src/migration/index.js';
import { parseDiagnostics } from '../src/migration/diagnostics.js';
import type { MigrationDiagnostic } from '../src/migration/types.js';
import { mechanicalFixtures, type ExpectedDiagnostic, type MechanicalFixture } from './migration/fixtures.js';

describe('migration engine contracts', () => {
  it('covers every mechanical capability, evidence fixture, and argument adapter', () => {
    const fixturesByCapability = new Map(
      mechanicalFixtures.flatMap((fixture) => (fixture.capabilityId ? [[fixture.capabilityId, fixture] as const] : []))
    );
    const fixtureIds = new Set(mechanicalFixtures.map(({ id }) => id));
    const adapters = new Set(mechanicalFixtures.flatMap(({ adapter }) => (adapter ? [adapter] : [])));

    for (const capability of defaultCapabilityRegistry.capabilities) {
      const fixture = fixturesByCapability.get(capability.id);
      expect(fixture, `missing fixture for ${capability.id}`).toBeDefined();
      expect(fixture?.adapter).toBe(capability.argumentAdapter);
      for (const evidenceId of capability.evidence.fixtureIds) expect(fixtureIds.has(evidenceId), evidenceId).toBe(true);
    }
    for (const adapter of new Set(defaultCapabilityRegistry.capabilities.map(({ argumentAdapter }) => argumentAdapter))) {
      expect(adapters.has(adapter), `missing fixture for ${adapter}`).toBe(true);
    }
  });

  for (const fixture of mechanicalFixtures) {
    it(`${fixture.id} preserves exact output, diagnostic identity, parsing, and idempotence`, () => {
      expect(() => runFixture(fixture)).not.toThrow();
    });
  }

  it('refuses removed RxJS 7 thisArg overloads', () => {
    const source = `import { map } from 'rxjs/operators';\nconst result = values.pipe(map(project, context));\n`;
    const result = migrateTestSource(source, { fileName: 'map-this-arg.ts' });

    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(
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

  it('detects output, diagnostic, parse, source-refusal, and idempotence regressions', () => {
    const mapFixture = fixture('operator.map');
    const malformedFixture = fixture('syntax.malformed');

    expect(() => runFixture({ ...mapFixture, expected: `${mapFixture.expected}// drift\n` })).toThrow(/output/);
    expect(() => runFixture(malformedFixture, () => ({ ...migrateTestSource(malformedFixture.input), diagnostics: [] }))).toThrow(
      /diagnostics/
    );
    expect(() =>
      runFixture({ ...mapFixture, expected: 'const = ;\n' }, () => ({ status: 'changed', code: 'const = ;\n', diagnostics: [], imports: [] }))
    ).toThrow(/target-parse/);
    expect(() =>
      runFixture(malformedFixture, () => ({ status: 'changed', code: 'const valid = true;\n', diagnostics: [], imports: [] }))
    ).toThrow(/source-refusal/);

    let calls = 0;
    expect(() =>
      runFixture(mapFixture, (source, options) => {
        calls++;
        const result = migrateTestSource(source, options);
        return calls === 1 ? result : { ...result, status: 'changed', code: `${result.code}// second-pass drift\n` };
      })
    ).toThrow(/idempotence/);
  });
});

type Transform = typeof migrateTestSource;

function fixture(id: string): MechanicalFixture {
  const found = mechanicalFixtures.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing fixture ${id}.`);
  return found;
}

function runFixture(fixture: MechanicalFixture, transform: Transform = migrateTestSource): void {
  const sourceFile = ts.createSourceFile(fixture.fileName, fixture.input, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const sourceMalformed = parseDiagnostics(sourceFile).length > 0;
  const result = transform(fixture.input, { fileName: fixture.fileName });

  if (sourceMalformed && (result.status !== 'refused' || result.code !== fixture.input)) throw new Error('source-refusal');
  if (result.status !== fixture.expectedStatus) throw new Error('status');
  if (result.code !== fixture.expected) throw new Error('output');
  if (JSON.stringify(result.diagnostics.map(projectDiagnostic)) !== JSON.stringify(fixture.expectedDiagnostics)) {
    throw new Error('diagnostics');
  }
  if (result.status !== 'refused') {
    const target = ts.createSourceFile(fixture.fileName, result.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    if (parseDiagnostics(target).length > 0) throw new Error('target-parse');
  }

  const second = transform(result.code, { fileName: fixture.fileName });
  const secondStatus = result.status === 'refused' ? 'refused' : 'unchanged';
  if (
    second.status !== secondStatus ||
    second.code !== result.code ||
    JSON.stringify(second.diagnostics.map(projectDiagnostic)) !== JSON.stringify(result.diagnostics.map(projectDiagnostic))
  ) {
    throw new Error('idempotence');
  }
}

function projectDiagnostic(diagnostic: MigrationDiagnostic): ExpectedDiagnostic {
  return {
    code: diagnostic.code,
    severity: diagnostic.severity,
    disposition: diagnostic.disposition,
    refusalScope: diagnostic.refusalScope,
    classification: diagnostic.classification,
    ...(diagnostic.capabilityId ? { capabilityId: diagnostic.capabilityId } : {}),
    start: diagnostic.span.start.offset,
    end: diagnostic.span.end.offset,
    nextAction: diagnostic.nextAction.code,
  };
}
