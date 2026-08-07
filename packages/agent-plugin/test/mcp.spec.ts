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
    expect(result.lifecyclePolicy).toMatchObject({
      defaultTarget: 'producer-per-direct-subscription',
      defaultConstructor: 'ColdObservable',
    });
    expect(result.coverage.counts).toMatchObject({ operators: 114, mechanicallyProved: 10 });
    expect(result.coverage.surfaces.some(({ id }) => id === 'operator.combine-all')).toBe(true);
    expect(result.coverage.surfaces.some(({ name }) => name === 'bindCallback')).toBe(true);
  });

  it('uses the behavior-preserving cold lifecycle when no mode is supplied', () => {
    const result = analyzeMigration({ files: [{ path: 'test/example.spec.ts', source }] });
    expect(result.files[0]).toMatchObject({
      path: 'test/example.spec.ts',
      lifecycle: 'cold',
      testSchedulerVariables: ['scheduler'],
      importedOperators: ['map'],
      status: 'changed',
      lifecycleRecommendation: {
        target: 'producer-per-direct-subscription',
        constructor: 'ColdObservable',
      },
    });
    expect(result.files[0]).not.toHaveProperty('candidateSource');
    expect(result.files[0]?.diagnostics).toEqual([]);
  });

  it('previews a cold migration and is idempotent', () => {
    const first = previewMigration({ files: [{ path: 'test/example.spec.ts', source }], mode: 'cold' });
    expect(first.files[0]?.status).toBe('changed');
    expect(first.files[0]?.candidateSource).toContain('from "@rxjs/test"');
    expect(first.files[0]?.candidateSource).toContain('source[map]');
    expect(first.files[0]?.candidateSource).toContain('from "rxjs/map"');

    const second = previewMigration({
      files: [{ path: 'test/example.spec.ts', source: first.files[0]!.candidateSource }],
      mode: 'cold',
    });
    expect(second.files[0]?.status).toBe('unchanged');
    expect(second.files[0]?.candidateSource).toBe(first.files[0]?.candidateSource);
  });

  it('uses platform methods only after explicit platform promotion', () => {
    const platformSource = `
import { concatMap, map, switchAll } from 'rxjs/operators';
const result = source.pipe(map(project), concatMap(load), switchAll());
`;
    const result = previewMigration({ files: [{ path: 'src/platform.ts', source: platformSource }], mode: 'platform' });
    expect(result.files[0]?.candidateSource).toContain('source.map(project).flatMap(load).switchMap(inner => inner)');
    expect(result.files[0]?.imports).toEqual([]);
  });

  it('reports explicit sharing and a one-subscriber platform candidate without promoting it automatically', () => {
    const sharedSource = `
import { share } from 'rxjs/operators';
const shared = source.pipe(share());
shared.subscribe(handleValue);
`;
    const result = analyzeMigration({ files: [{ path: 'src/shared.ts', source: sharedSource }] });
    expect(result.files[0]).toMatchObject({
      lifecycle: 'cold',
      sharingIndicators: ['share'],
      subscriberTopology: {
        classification: 'single-subscriber-candidate',
        directSubscribeCalls: 1,
        requiresRepositoryProof: true,
      },
      lifecycleRecommendation: {
        target: 'producer-per-direct-subscription',
        constructor: 'ColdObservable',
      },
    });
    expect(result.files[0]?.lifecycleRecommendation.platformCandidateReasons).toHaveLength(2);
    expect(result.files[0]?.mechanicalGaps).toEqual(['share']);
    expect(result.files[0]?.unsupportedConstructs).toEqual([]);
    expect(result.files[0]?.importedSurfaces[0]).toMatchObject({
      surfaceId: 'operator.share',
      migration: { lifecycle: 'platform-promotion-candidate' },
    });
  });

  it('reports deep, namespace, default, and unknown public imports instead of silently omitting them', () => {
    const importSource = `
import legacyDefault from 'rxjs';
import { notInRxjs782 } from 'rxjs';
import * as operators from 'rxjs/operators';
import { operate } from 'rxjs/internal/util/lift';
void legacyDefault;
void notInRxjs782;
void operators;
void operate;
`;
    const result = analyzeMigration({ files: [{ path: 'src/imports.ts', source: importSource }] });
    expect(result.files[0]?.importFindings.map(({ code }) => code)).toEqual([
      'default-import',
      'unknown-public-surface',
      'namespace-import',
      'deep-import',
    ]);
    expect(result.files[0]?.reviewFlags).toEqual(
      expect.arrayContaining(['default-import', 'unknown-public-surface', 'namespace-import', 'deep-import'])
    );
    expect(result.files[0]?.unsupportedConstructs).toEqual([
      'rxjs:default',
      'rxjs:notInRxjs782',
      'rxjs/internal/util/lift:*',
    ]);
  });

  it('validates schema separately from readiness', () => {
    const invalid = validateMigrationContract({ schemaVersion: 1 });
    expect(invalid).toMatchObject({ valid: false, readiness: null });
    expect(invalid.issues.length).toBeGreaterThan(0);

    const valid = validateMigrationContract(validManifest());
    expect(valid).toMatchObject({ valid: true, issues: [], readiness: { state: 'ready', findings: [] } });

    const incomplete = validateMigrationContract({
      ...validManifest(),
      units: [
        {
          ...validManifest().units[0],
          lifecycle: 'unresolved',
          approval: { status: 'pending' },
        },
      ],
      blockers: [
        {
          owner: 'maintainer',
          reason: 'Lifecycle is unresolved.',
          unitIds: ['pipeline-1'],
          evidence: ['Characterization test is pending.'],
          accepted: false,
        },
      ],
    });
    expect(incomplete).toMatchObject({ valid: true, issues: [], readiness: { state: 'incomplete' } });
    expect(incomplete.readiness?.findings.length).toBeGreaterThan(0);
  });

  it('accepts every exact batch boundary and measures UTF-8 bytes', () => {
    const fileBoundary = previewMigration({ files: [{ path: 'src/file.ts', source: ' '.repeat(MAX_FILE_BYTES) }] });
    expect(fileBoundary.files[0]).toMatchObject({ path: 'src/file.ts', status: 'unchanged' });

    const totalBoundary = previewMigration({
      files: Array.from({ length: MAX_TOTAL_BYTES / MAX_FILE_BYTES }, (_, index) => ({
        path: `src/${index}.ts`,
        source: ' '.repeat(MAX_FILE_BYTES),
      })),
    });
    expect(totalBoundary.files).toHaveLength(MAX_TOTAL_BYTES / MAX_FILE_BYTES);

    const countBoundary = analyzeMigration({
      files: Array.from({ length: MAX_FILES }, (_, index) => ({ path: `src/${index}.ts`, source: '' })),
    });
    expect(countBoundary.files).toHaveLength(MAX_FILES);

    expectRefusal(
      () => previewMigration({ files: [{ path: 'src/multibyte.ts', source: '😀'.repeat(MAX_FILE_BYTES / 2 + 1) }] }),
      'file-too-large'
    );
  });

  it('rejects a complete invalid batch before analyzing any earlier file', () => {
    const malformed = "import { map } from 'rxjs/operators'; const value = source.pipe(map(;";
    expectRefusal(
      () =>
        analyzeMigration({
          files: [
            { path: 'src/would-produce-diagnostics.ts', source: malformed },
            { path: '../escape.ts', source: '' },
          ],
        }),
      'invalid-path'
    );
  });

  it.each([
    ['absolute path', { files: [{ path: '/tmp/file.ts', source: '' }] }, 'invalid-path'],
    ['parent traversal', { files: [{ path: '../file.ts', source: '' }] }, 'invalid-path'],
    ['embedded parent traversal', { files: [{ path: 'src/../file.ts', source: '' }] }, 'invalid-path'],
    ['dot segment', { files: [{ path: './file.ts', source: '' }] }, 'invalid-path'],
    ['empty segment', { files: [{ path: 'src//file.ts', source: '' }] }, 'invalid-path'],
    ['Windows absolute path', { files: [{ path: 'C:\\src\\file.ts', source: '' }] }, 'invalid-path'],
    ['control character', { files: [{ path: 'src/file\0.ts', source: '' }] }, 'invalid-path'],
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
    [
      'normalized duplicate path',
      {
        files: [
          { path: 'src/file.ts', source: '' },
          { path: 'src\\file.ts', source: '' },
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
    expectRefusal(() => previewMigration(input), code as InputRefusal['refusal']['code']);
  });
});

function expectRefusal(operation: () => unknown, code: InputRefusal['refusal']['code']): void {
  expect(operation).toThrowError(InputRefusal);
  try {
    operation();
  } catch (error) {
    expect((error as InputRefusal).refusal).toMatchObject({
      code,
      limits: { maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, maxTotalBytes: MAX_TOTAL_BYTES },
    });
  }
}

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
    capabilityRegistryVersion: '1.1.0',
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
