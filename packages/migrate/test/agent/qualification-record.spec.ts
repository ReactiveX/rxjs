import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { representativeAgentScenarios } from './scenario-catalog.js';
import {
  gradeQualificationRecords,
  type QualificationArtifact,
  type QualificationHostExpectation,
  type QualificationRecord,
} from './qualification-record.js';

const skillIdentity = { version: '8.0.0-alpha.14', digest: 'a'.repeat(64) } as const;
const engineVersion = '8.0.0-alpha.14';
const authority = { allowedTools: ['exec', 'read'], network: 'disabled', writeScopes: ['src', 'test'] } as const;
const hosts = [
  {
    harness: 'codex',
    harnessVersion: '0.146.0-alpha.3.1',
    model: 'gpt-5.6',
    modelConfiguration: { reasoning: 'high' },
    authority,
  },
  {
    harness: 'claude',
    harnessVersion: '2.1.119',
    model: 'claude-opus-4.1',
    modelConfiguration: { effort: 'high' },
    authority,
  },
  {
    harness: 'cursor',
    harnessVersion: '3.13.10',
    model: 'composer-2',
    modelConfiguration: { mode: 'agent' },
    authority,
  },
] as const satisfies readonly QualificationHostExpectation[];

let artifactRoot: string;
let records: readonly QualificationRecord[];

describe('captured P0.M5 qualification records', () => {
  beforeAll(async () => {
    artifactRoot = await mkdtemp(join(tmpdir(), 'rxjs-migrate-qualification-'));
    records = await captureQualificationMatrix(artifactRoot);
  });

  afterAll(async () => {
    await rm(artifactRoot, { recursive: true, force: true });
  });

  it('validates the complete catalog matrix and recomputes every artifact digest', async () => {
    const report = await gradeQualificationRecords(records, options());

    expect(records).toHaveLength(8);
    expect(report).toEqual({ schemaVersion: 1, status: 'passed', findings: [] });
  });

  it('fails a captured artifact with the wrong digest', async () => {
    const record = records[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      artifacts: record.artifacts.map((artifact, index) => (index === 0 ? { ...artifact, sha256: '0'.repeat(64) } : artifact)),
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.status).toBe('failed');
    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'artifact-digest-mismatch', runId: record.runId }));
  });

  it('fails when a recorded artifact is missing from disk', async () => {
    const record = records[0]!;
    const mutated = replaceRecord(records, record.runId, {
      ...record,
      artifacts: record.artifacts.map((artifact, index) =>
        index === 0 ? { ...artifact, path: `${record.runId}/missing-artifact.txt` } : artifact
      ),
    });

    const report = await gradeQualificationRecords(mutated, options());

    expect(report.findings).toContainEqual(expect.objectContaining({ code: 'artifact-missing', runId: record.runId }));
  });

  it('rejects a run outside the scenario catalog matrix', async () => {
    const source = records.find(({ scenarioId, host }) => scenarioId === 'app-platform-strong' && host.harness === 'codex')!;
    const claude = hosts.find(({ harness }) => harness === 'claude')!;
    const unexpected: QualificationRecord = {
      ...source,
      runId: 'app-platform-strong--claude-unexpected',
      host: {
        harness: claude.harness,
        harnessVersion: claude.harnessVersion,
        model: claude.model,
        modelConfiguration: claude.modelConfiguration,
      },
    };

    const report = await gradeQualificationRecords([...records, unexpected], options());

    expect(report.findings).toContainEqual(
      expect.objectContaining({ code: 'unexpected-matrix-run', runId: 'app-platform-strong--claude-unexpected' })
    );
  });

  it('detects cross-harness safety-gate and developer-decision parity drift', async () => {
    const cursor = records.find(({ scenarioId, host }) => scenarioId === 'library-weak-unsupported' && host.harness === 'cursor')!;
    const mutated = replaceRecord(records, cursor.runId, {
      ...cursor,
      gateVector: cursor.gateVector.map((gate) => (gate.id === 'baseline-before-changes' ? { ...gate, status: 'failed' as const } : gate)),
      decisionVector: cursor.decisionVector.map((decision) =>
        decision.id === 'decision:scheduler-policy' ? { ...decision, status: 'approved' as const } : decision
      ),
    });

    const report = await gradeQualificationRecords(mutated, options());
    const codes = report.findings.map(({ code }) => code);

    expect(codes).toContain('cross-harness-gate-drift');
    expect(codes).toContain('cross-harness-decision-drift');
  });
});

function options() {
  return { artifactRoot, expectedSkillIdentity: skillIdentity, expectedEngineVersion: engineVersion, hosts } as const;
}

async function captureQualificationMatrix(root: string): Promise<readonly QualificationRecord[]> {
  const captured: QualificationRecord[] = [];
  for (const scenario of representativeAgentScenarios) {
    for (const harness of scenario.qualificationHarnesses) {
      const host = hosts.find((candidate) => candidate.harness === harness);
      if (!host) throw new Error(`Missing host expectation for ${harness}.`);
      const runId = `${scenario.id}--${harness}`;
      const runRoot = join(root, runId);
      await mkdir(runRoot, { recursive: true });
      const artifacts: QualificationArtifact[] = [];
      for (const kind of scenario.requiredArtifacts) {
        const path = `${runId}/${kind}.txt`;
        const content = `${scenario.id}\n${harness}\n${kind}\n`;
        await writeFile(join(root, path), content);
        artifacts.push({ kind, path, sha256: createHash('sha256').update(content).digest('hex') });
      }
      captured.push({
        schemaVersion: 1,
        runId,
        scenarioId: scenario.id,
        host: {
          harness: host.harness,
          harnessVersion: host.harnessVersion,
          model: host.model,
          modelConfiguration: host.modelConfiguration,
        },
        sourceIdentity: {
          revision: scenario.repository.sourceRevision,
          seedTreeSha256: scenario.repository.treeSha256,
          lockPath: scenario.repository.lockPath,
          lockSha256: scenario.repository.lockSha256,
        },
        skillIdentity,
        engineIdentity: { version: engineVersion },
        authority,
        artifacts,
        gateVector: scenario.requiredGateIds.map((id) => ({ id, status: 'passed' })),
        decisionVector: scenario.decisionPointIds.map((id) => ({ id, status: 'requested' })),
        conclusion: scenario.expectedOutcome,
      });
    }
  }
  return captured;
}

function replaceRecord(
  source: readonly QualificationRecord[],
  runId: string,
  replacement: QualificationRecord
): readonly QualificationRecord[] {
  return source.map((record) => (record.runId === runId ? replacement : record));
}
