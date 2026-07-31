import {
  defaultCapabilityRegistry,
  migrateTestSource,
  parseDiagnostics,
  type MigrationDiagnostic,
  type MigrationResult,
  type ProjectMigrationOptions,
} from '../../src/index.js';
import ts from 'typescript';
import type { ExpectedDiagnostic, MechanicalFixture } from './fixtures.js';

export type MechanicalTransform = (source: string, options?: ProjectMigrationOptions) => MigrationResult;

export class MechanicalFixtureError extends Error {
  constructor(
    readonly fixtureId: string,
    readonly gate: 'registry' | 'source-refusal' | 'status' | 'output' | 'diagnostics' | 'target-parse' | 'idempotence',
    message: string
  ) {
    super(`${fixtureId} [${gate}]: ${message}`);
    this.name = 'MechanicalFixtureError';
  }
}

export function verifyRegistryCoverage(fixtures: readonly MechanicalFixture[]): void {
  const fixtureIds = new Set(fixtures.map(({ id }) => id));
  const capabilityFixtures = new Map<string, MechanicalFixture>();
  for (const fixture of fixtures) {
    if (fixture.capabilityId) capabilityFixtures.set(fixture.capabilityId, fixture);
  }
  const adapters = new Set(fixtures.flatMap(({ adapter }) => (adapter ? [adapter] : [])));

  for (const capability of defaultCapabilityRegistry.capabilities) {
    const fixture = capabilityFixtures.get(capability.id);
    if (!fixture) throw new MechanicalFixtureError(capability.id, 'registry', 'No mechanical fixture covers this capability.');
    if (fixture.adapter !== capability.argumentAdapter) {
      throw new MechanicalFixtureError(
        fixture.id,
        'registry',
        `Fixture adapter ${String(fixture.adapter)} does not match ${capability.argumentAdapter}.`
      );
    }
    for (const evidenceId of capability.evidence.fixtureIds) {
      if (!fixtureIds.has(evidenceId)) {
        throw new MechanicalFixtureError(capability.id, 'registry', `Evidence fixture ${evidenceId} does not exist.`);
      }
    }
  }

  for (const adapter of new Set(defaultCapabilityRegistry.capabilities.map(({ argumentAdapter }) => argumentAdapter))) {
    if (!adapters.has(adapter)) {
      throw new MechanicalFixtureError(`adapter.${adapter}`, 'registry', 'No checked-in fixture exercises this adapter.');
    }
  }
}

export function runMechanicalFixture(fixture: MechanicalFixture, transform: MechanicalTransform = migrateTestSource): MigrationResult {
  const sourceFile = ts.createSourceFile(fixture.fileName, fixture.input, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const sourceSyntaxDiagnostics = parseDiagnostics(sourceFile);
  const result = transform(fixture.input, { fileName: fixture.fileName });

  if (sourceSyntaxDiagnostics.length > 0 && (result.status !== 'refused' || result.code !== fixture.input)) {
    throw new MechanicalFixtureError(fixture.id, 'source-refusal', 'Malformed source was reported as a successful transform.');
  }
  if (result.status !== fixture.expectedStatus) {
    throw new MechanicalFixtureError(fixture.id, 'status', `Expected ${fixture.expectedStatus}, received ${result.status}.`);
  }
  if (fixture.exactOutput && result.code !== fixture.expected) {
    throw new MechanicalFixtureError(fixture.id, 'output', 'Transformed bytes differ from the checked-in expected output.');
  }

  const actualDiagnostics = result.diagnostics.map(projectDiagnostic);
  if (JSON.stringify(actualDiagnostics) !== JSON.stringify(fixture.expectedDiagnostics)) {
    throw new MechanicalFixtureError(fixture.id, 'diagnostics', 'Structured diagnostics differ from checked-in metadata.');
  }

  if (result.status !== 'refused') {
    const targetFile = ts.createSourceFile(fixture.fileName, result.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    if (parseDiagnostics(targetFile).length > 0) {
      throw new MechanicalFixtureError(fixture.id, 'target-parse', 'Transformed output does not parse as TypeScript.');
    }
  }

  const second = transform(result.code, { fileName: fixture.fileName });
  const expectedSecondStatus = result.status === 'refused' ? 'refused' : 'unchanged';
  if (
    second.code !== result.code ||
    second.status !== expectedSecondStatus ||
    JSON.stringify(second.diagnostics.map(projectDiagnostic)) !== JSON.stringify(actualDiagnostics)
  ) {
    throw new MechanicalFixtureError(
      fixture.id,
      'idempotence',
      'A second transform changed the output bytes, result state, or structured diagnostics.'
    );
  }
  return result;
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
