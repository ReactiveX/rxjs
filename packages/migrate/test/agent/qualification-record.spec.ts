import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import type { QualificationHostExpectation, QualificationRecord } from './qualification-record.js';
import { gradeQualificationRecords } from './qualification-record.js';

const artifactRoot = fileURLToPath(new URL('./qualification-runs/2026-08-01', import.meta.url));
const scenarioIds = ['app-cold-strong', 'app-platform-strong', 'library-mixed-strong', 'library-weak-unsupported'] as const;
const skillIdentity = {
  version: '8.0.0-alpha.14',
  digest: '2b5c6b52bc8060df40c48443cfb5ebb0d55da5687bb74806daf95ac4912594fa',
} as const;
const engineVersion = '8.0.0-alpha.14';
const authority = {
  allowedTools: ['read', 'write', 'exec', 'install'],
  network: 'disabled',
  writeScopes: ['src', 'test', 'package.json', 'pnpm-lock.yaml', 'migration-contract.json', 'MIGRATION_REPORT.md', '.qualification/results'],
} as const;
const safeStopAuthority = {
  allowedTools: ['read', 'write', 'exec'],
  network: 'disabled',
  writeScopes: [
    'src',
    'test',
    'package.json',
    'pnpm-lock.yaml',
    'migration-contract.json',
    'MIGRATION_REPORT.md',
    '.qualification/results',
    'dist',
  ],
} as const;
const hosts = [
  ...scenarioIds.map((scenarioId) => ({
    scenarioId,
    harness: 'codex',
    harnessVersion: '0.146.0-alpha.3.1',
    model: 'gpt-5.6-sol',
    modelConfiguration: { reasoning: 'medium' },
    authority: scenarioId === 'library-weak-unsupported' ? safeStopAuthority : authority,
  })),
] as const satisfies readonly QualificationHostExpectation[];

let records: readonly QualificationRecord[];

describe('captured P0.M5 qualification records', () => {
  beforeAll(async () => {
    records = await Promise.all(
      scenarioIds.map(async (scenarioId) =>
        JSON.parse(await readFile(new URL(`./qualification-runs/2026-08-01/${scenarioId}/record.json`, import.meta.url), 'utf8'))
      )
    );
  });

  it('validates the complete committed Codex matrix and recomputes every artifact digest', async () => {
    const report = await gradeQualificationRecords(records, options());

    expect(records).toHaveLength(4);
    expect(report).toEqual({ schemaVersion: 1, status: 'passed', findings: [] });
  });

  it('fails a captured artifact with the wrong digest', async () => {
    const record = records[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      artifacts: record.artifacts.map((artifact, index) => (index === 0 ? { ...artifact, sha256: '0'.repeat(64) } : artifact)),
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'artifact-digest-mismatch', runId: record.runId }));
  });

  it('fails when a recorded artifact is missing from disk', async () => {
    const record = records[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      artifacts: record.artifacts.map((artifact, index) =>
        index === 0 ? { ...artifact, path: `${record.scenarioId}/missing-artifact.txt` } : artifact
      ),
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'artifact-missing', runId: record.runId }));
  });

  it('rejects a semantically failing embedded agent evaluation', async () => {
    const record = records.find(({ scenarioId }) => scenarioId === 'app-cold-strong')!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      evaluation: {
        ...record.evaluation,
        compilation: [
          {
            ...record.evaluation.compilation[0]!,
            status: 'failed',
            exitCode: 2,
            summary: 'The generated target does not compile.',
          },
        ],
      },
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: 'evaluation-failed', runId: record.runId, message: expect.stringContaining('compilation') })
    );
  });

  it('rejects an embedded evaluation for a different scenario', async () => {
    const record = records[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      evaluation: { ...record.evaluation, scenarioId: 'different-scenario' },
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'evaluation-mismatch', runId: record.runId }));
  });

  it('rejects a run outside the Codex-only scenario matrix', async () => {
    const source = records.find(({ scenarioId }) => scenarioId === 'app-platform-strong')!;
    const unexpected: QualificationRecord = {
      ...source,
      runId: 'app-platform-strong--claude-unexpected',
      host: { ...source.host, harness: 'claude' },
    };

    const report = await gradeQualificationRecords([...records, unexpected], options());

    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: 'unexpected-matrix-run', runId: 'app-platform-strong--claude-unexpected' })
    );
  });

  it('rejects a decision status that differs from the scenario expectation', async () => {
    const record = records.find(({ scenarioId }) => scenarioId === 'app-platform-strong')!;
    const decision = record.decisionVector[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      decisionVector: [{ ...decision, status: 'unresolved' }, ...record.decisionVector.slice(1)],
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(
      expect.objectContaining({
        code: 'decision-status-mismatch',
        runId: record.runId,
        message: expect.stringContaining('expected approved'),
      })
    );
  });

  it('rejects an embedded authority policy that drifts from its host record', async () => {
    const record = records[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      evaluation: {
        ...record.evaluation,
        observedAuthority: {
          ...record.evaluation.observedAuthority,
          policy: { ...record.evaluation.observedAuthority.policy, writeScopes: ['src'] },
        },
      },
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: 'evaluation-authority-mismatch', runId: record.runId })
    );
  });
});

function options() {
  return { artifactRoot, expectedSkillIdentity: skillIdentity, expectedEngineVersion: engineVersion, hosts } as const;
}

function replaceRecord(
  source: readonly QualificationRecord[],
  runId: string,
  replacement: QualificationRecord
): readonly QualificationRecord[] {
  return source.map((record) => (record.runId === runId ? replacement : record));
}
