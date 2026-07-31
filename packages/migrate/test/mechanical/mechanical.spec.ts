import { describe, expect, it } from 'vitest';
import { migrateTestSource, type MigrationResult } from '../../src/index.js';
import { mechanicalFixtures, type MechanicalFixture } from './fixtures.js';
import { MechanicalFixtureError, runMechanicalFixture, verifyRegistryCoverage } from './runner.js';

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
