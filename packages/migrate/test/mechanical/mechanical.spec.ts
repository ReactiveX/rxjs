import { describe, expect, it } from 'vitest';
import { migrateTestSource, type MigrationResult } from '../../src/index.js';
import {
  rxjs7TypePaths,
  rxjsNextTypePaths,
  sourceTypeEvidence,
  targetTypeEvidence,
} from './evidence.js';
import { mechanicalFixtures, type MechanicalFixture } from './fixtures.js';
import { MechanicalFixtureError, runMechanicalFixture, verifyRegistryCoverage } from './runner.js';
import { formatTypecheckDiagnostics, typecheckEvidence } from './typecheck.js';

describe('mechanical migration fixtures', () => {
  it('covers every exposed capability ID and argument adapter', () => {
    expect(() => verifyRegistryCoverage(mechanicalFixtures)).not.toThrow();
  });

  for (const fixture of mechanicalFixtures) {
    it(`${fixture.id} matches its checked-in contract`, () => {
      expect(() => runMechanicalFixture(fixture)).not.toThrow();
    });
  }
});

describe('mechanical fixture type evidence', () => {
  for (const operatorFixture of mechanicalFixtures.filter(({ category }) => category === 'operator')) {
    it(`${operatorFixture.id} compiles against pinned RxJS 7 source types`, () => {
      expectTypecheck(
        `${operatorFixture.id}.source.ts`,
        sourceTypeEvidence(operatorFixture),
        rxjs7TypePaths()
      );
    });

    it(`${operatorFixture.id} output compiles against current RxJS Next types`, () => {
      const result = migrateTestSource(operatorFixture.input, { fileName: operatorFixture.fileName });
      expect(result.status).toBe('changed');
      expectTypecheck(
        `${operatorFixture.id}.target.ts`,
        targetTypeEvidence(operatorFixture, result.code),
        rxjsNextTypePaths()
      );
    });
  }

  it('detects a target type regression in the negative control', () => {
    const diagnostics = typecheckEvidence({
      fileName: 'negative.target-type-regression.ts',
      source: [
        "import { ColdObservable } from 'rxjs/cold-observable';",
        "import { map } from 'rxjs/map';",
        'declare const source: ColdObservable<number>;',
        "const result: Observable<number> = source[map](value => value.toFixed());",
      ].join('\n'),
      paths: rxjsNextTypePaths(),
    });
    expect(diagnostics.some(({ code }) => code === 2322)).toBe(true);
  });
});

describe('mechanical fixture negative controls', () => {
  const mapFixture = fixture('operator.map');
  const malformedFixture = fixture('syntax.malformed');

  it('detects output drift', () => {
    expectGate({ ...mapFixture, expected: `${mapFixture.expected}// drift\n` }, 'output');
  });

  it('detects a missing diagnostic', () => {
    expectGate(malformedFixture, 'diagnostics', (source, options) => {
      const result = migrateTestSource(source, options);
      return { ...result, diagnostics: [] };
    });
  });

  it('detects non-idempotent output', () => {
    let calls = 0;
    expectGate(mapFixture, 'idempotence', (source, options) => {
      calls++;
      const result = migrateTestSource(source, options);
      return calls === 1 ? result : { ...result, status: 'changed', code: `${result.code}// second-pass drift\n` };
    });
  });

  it('detects malformed target output', () => {
    const malformedTarget = 'const = ;\n';
    expectGate({ ...mapFixture, expected: malformedTarget }, 'target-parse', () => result(malformedTarget));
  });

  it('detects unsupported syntax falsely reported as successful', () => {
    expectGate(malformedFixture, 'source-refusal', () => result('const valid = true;\n'));
  });
});

function fixture(id: string): MechanicalFixture {
  const found = mechanicalFixtures.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing test fixture ${id}.`);
  return found;
}

function expectGate(fixture: MechanicalFixture, gate: MechanicalFixtureError['gate'], transform = migrateTestSource): void {
  try {
    runMechanicalFixture(fixture, transform);
    throw new Error(`Expected ${gate} gate to fail.`);
  } catch (error) {
    expect(error).toBeInstanceOf(MechanicalFixtureError);
    expect((error as MechanicalFixtureError).gate).toBe(gate);
  }
}

function result(code: string): MigrationResult {
  return { status: 'changed', code, diagnostics: [], imports: [] };
}

function expectTypecheck(fileName: string, source: string, paths: Record<string, string[]>): void {
  const diagnostics = typecheckEvidence({ fileName, source, paths });
  expect(formatTypecheckDiagnostics(diagnostics)).toBe('');
}
