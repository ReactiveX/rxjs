import { describe, expect, it } from 'vitest';
import {
  InputRefusal,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  analyzeMigration,
  migrationCapabilities,
  previewMigration,
  validateMigrationContract,
} from '../src/mcp/service.js';

const source = `
import { map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

const scheduler = new TestScheduler(() => {});
scheduler.run(({ cold, expectObservable }) => {
  const source = cold('-a-|');
  expectObservable(source.pipe(map((value) => value))).toBe('-a-|');
});
`;

describe('migration MCP service', () => {
  it('returns versioned capabilities and hard limits', () => {
    const result = migrationCapabilities();
    expect(result.engineVersion).toBe('9.0.0-beta.1');
    expect(result.sourceVersion).toBe('7.8.2');
    expect(result.targetVersion).toBe('9.0.0-beta.1');
    expect(result.limits).toEqual({ maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES });
    expect(result.capabilities.some(({ legacyName }) => legacyName === 'map')).toBe(true);
  });

  it('analyzes lifecycle flags and structured diagnostics without returning a candidate', () => {
    const result = analyzeMigration({ files: [{ path: 'test/example.spec.ts', source }] });
    expect(result.files[0]).toMatchObject({
      path: 'test/example.spec.ts',
      lifecycle: 'unselected',
      testSchedulerVariables: ['scheduler'],
      importedOperators: ['map'],
      status: 'refused',
    });
    expect(result.files[0]).not.toHaveProperty('candidateSource');
    expect(result.files[0]?.diagnostics[0]?.code).toBe('lifecycle-review');
  });

  it('previews a cold migration and is idempotent', () => {
    const first = previewMigration({ files: [{ path: 'test/example.spec.ts', source }], mode: 'cold' });
    expect(first.files[0]?.status).toBe('changed');
    expect(first.files[0]?.candidateSource).toContain('from "@rxjs/test"');
    expect(first.files[0]?.candidateSource).toContain('source[map]');

    const second = previewMigration({
      files: [{ path: 'test/example.spec.ts', source: first.files[0]!.candidateSource }],
      mode: 'cold',
    });
    expect(second.files[0]?.status).toBe('unchanged');
    expect(second.files[0]?.candidateSource).toBe(first.files[0]?.candidateSource);
  });

  it('validates schema separately from readiness', () => {
    const invalid = validateMigrationContract({ schemaVersion: 1 });
    expect(invalid).toMatchObject({ valid: false, readiness: null });
    expect(invalid.issues.length).toBeGreaterThan(0);

    const valid = validateMigrationContract(validManifest());
    expect(valid).toMatchObject({ valid: true, issues: [], readiness: { state: 'ready', findings: [] } });
  });

  it.each([
    ['absolute path', { files: [{ path: '/tmp/file.ts', source: '' }] }, 'invalid-path'],
    ['parent traversal', { files: [{ path: '../file.ts', source: '' }] }, 'invalid-path'],
    [
      'duplicate path',
      {
        files: [
          { path: 'src/file.ts', source: '' },
          { path: 'src/file.ts', source: '' },
        ],
      },
      'duplicate-path',
    ],
    ['file limit', { files: [{ path: 'src/file.ts', source: 'x'.repeat(MAX_FILE_BYTES + 1) }] }, 'file-too-large'],
    [
      'total limit',
      {
        files: Array.from({ length: 5 }, (_, index) => ({ path: `src/${index}.ts`, source: 'x'.repeat(450 * 1024) })),
      },
      'batch-too-large',
    ],
    [
      'file count',
      { files: Array.from({ length: MAX_FILES + 1 }, (_, index) => ({ path: `src/${index}.ts`, source: '' })) },
      'invalid-input',
    ],
  ])('refuses %s before producing partial output', (_name, input, code) => {
    expect(() => previewMigration(input)).toThrowError(InputRefusal);
    try {
      previewMigration(input);
    } catch (error) {
      expect((error as InputRefusal).refusal.code).toBe(code);
      expect((error as InputRefusal).refusal.limits.maxFiles).toBe(MAX_FILES);
    }
  });
});

function validManifest() {
  const span = {
    file: 'src/example.ts',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 1, line: 1, column: 2 },
  };
  const verification = {
    id: 'tests',
    command: 'pnpm test',
    environment: { node: '22.13.0' },
    status: 'passed',
    exitCode: 0,
    summary: 'Passed.',
  };
  return {
    schemaVersion: 1,
    engineVersion: '9.0.0-beta.1',
    capabilityRegistryVersion: '1.0.0',
    skillDigest: '0'.repeat(64),
    sourceRxjsVersion: '7.8.2',
    targetRxjsVersion: '9.0.0-beta.1',
    baseline: [verification],
    units: [
      {
        id: 'pipeline-1',
        sourceLocations: [span],
        lifecycle: 'platform-shared',
        evidenceClassification: 'portable',
        claims: ['Emits one mapped value.'],
        approval: {
          status: 'approved',
          approvedBy: 'maintainer',
          approvedAt: '2026-08-07T00:00:00.000Z',
          rationale: 'The platform-shared lifecycle is intentional.',
        },
      },
    ],
    diagnostics: [],
    intentionalDivergences: [],
    verification: [verification],
    blockers: [],
  };
}
