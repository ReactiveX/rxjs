import { createHash } from 'node:crypto';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { z } from 'zod';
import {
  agentHarnesses,
  crossHarnessSafetyScenario,
  representativeAgentScenarios,
  requiredArtifactKinds,
  requiredOutcomeGateIds,
  type AgentHarness,
  type AgentScenario,
} from './scenario-catalog.js';

export const qualificationRecordSchemaVersion = 1 as const;
export const qualificationReportSchemaVersion = 1 as const;
export const qualificationGateStatuses = ['passed', 'failed'] as const;
export type QualificationGateStatus = (typeof qualificationGateStatuses)[number];
export const qualificationDecisionStatuses = ['requested', 'approved', 'declined', 'unresolved'] as const;
export type QualificationDecisionStatus = (typeof qualificationDecisionStatuses)[number];
export const qualificationNetworkPolicies = ['disabled', 'restricted', 'enabled'] as const;
export type QualificationNetworkPolicy = (typeof qualificationNetworkPolicies)[number];

export interface QualificationHostIdentity {
  readonly harness: AgentHarness;
  readonly harnessVersion: string;
  readonly model: string;
  readonly modelConfiguration: Readonly<Record<string, string>>;
}

export interface QualificationAuthority {
  readonly allowedTools: readonly string[];
  readonly network: QualificationNetworkPolicy;
  readonly writeScopes: readonly string[];
}

export interface QualificationArtifact {
  readonly kind: (typeof requiredArtifactKinds)[number];
  readonly path: string;
  readonly sha256: string;
}

export interface QualificationRecord {
  readonly schemaVersion: typeof qualificationRecordSchemaVersion;
  readonly runId: string;
  readonly scenarioId: string;
  readonly host: QualificationHostIdentity;
  readonly sourceIdentity: {
    readonly revision: string;
    readonly seedTreeSha256: string;
    readonly lockPath: string;
    readonly lockSha256: string;
  };
  readonly skillIdentity: {
    readonly version: string;
    readonly digest: string;
  };
  readonly engineIdentity: {
    readonly version: string;
  };
  readonly authority: QualificationAuthority;
  readonly artifacts: readonly QualificationArtifact[];
  readonly gateVector: readonly {
    readonly id: (typeof requiredOutcomeGateIds)[number];
    readonly status: QualificationGateStatus;
  }[];
  readonly decisionVector: readonly {
    readonly id: string;
    readonly status: QualificationDecisionStatus;
  }[];
  readonly conclusion: 'completed' | 'safe-stop';
}

export interface QualificationHostExpectation extends QualificationHostIdentity {
  readonly authority: QualificationAuthority;
}

export interface QualificationGradeOptions {
  readonly artifactRoot: string;
  readonly expectedSkillIdentity: QualificationRecord['skillIdentity'];
  readonly expectedEngineVersion: string;
  readonly hosts: readonly QualificationHostExpectation[];
}

export const qualificationFindingCodes = [
  'unexpected-matrix-run',
  'missing-matrix-run',
  'duplicate-matrix-run',
  'host-identity-mismatch',
  'source-identity-mismatch',
  'skill-identity-mismatch',
  'engine-identity-mismatch',
  'authority-mismatch',
  'artifact-kind-missing',
  'artifact-kind-duplicate',
  'artifact-path-unsafe',
  'artifact-missing',
  'artifact-digest-mismatch',
  'gate-vector-mismatch',
  'gate-failed',
  'decision-vector-mismatch',
  'conclusion-mismatch',
  'cross-harness-gate-drift',
  'cross-harness-decision-drift',
] as const;
export type QualificationFindingCode = (typeof qualificationFindingCodes)[number];

export interface QualificationFinding {
  readonly code: QualificationFindingCode;
  readonly message: string;
  readonly runId?: string;
  readonly scenarioId?: string;
}

export interface QualificationReport {
  readonly schemaVersion: typeof qualificationReportSchemaVersion;
  readonly status: 'passed' | 'failed';
  readonly findings: readonly QualificationFinding[];
}

const nonEmptyString = z.string().min(1);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const relativePath = nonEmptyString.refine(
  (value) => !value.startsWith('/') && !/^[A-Za-z]:[\\/]/.test(value) && !value.split(/[\\/]/).includes('..'),
  { message: 'Expected a relative path without parent traversal.' }
);

export const qualificationRecordSchema: z.ZodType<QualificationRecord> = z
  .object({
    schemaVersion: z.literal(qualificationRecordSchemaVersion),
    runId: nonEmptyString,
    scenarioId: nonEmptyString,
    host: z
      .object({
        harness: z.enum(agentHarnesses),
        harnessVersion: nonEmptyString,
        model: nonEmptyString,
        modelConfiguration: z.record(z.string()),
      })
      .strict(),
    sourceIdentity: z.object({ revision: nonEmptyString, seedTreeSha256: sha256, lockPath: relativePath, lockSha256: sha256 }).strict(),
    skillIdentity: z.object({ version: nonEmptyString, digest: sha256 }).strict(),
    engineIdentity: z.object({ version: nonEmptyString }).strict(),
    authority: z
      .object({
        allowedTools: z.array(nonEmptyString).readonly(),
        network: z.enum(qualificationNetworkPolicies),
        writeScopes: z.array(relativePath).readonly(),
      })
      .strict(),
    artifacts: z.array(z.object({ kind: z.enum(requiredArtifactKinds), path: relativePath, sha256 }).strict()).readonly(),
    gateVector: z.array(z.object({ id: z.enum(requiredOutcomeGateIds), status: z.enum(qualificationGateStatuses) }).strict()).readonly(),
    decisionVector: z.array(z.object({ id: nonEmptyString, status: z.enum(qualificationDecisionStatuses) }).strict()).readonly(),
    conclusion: z.enum(['completed', 'safe-stop']),
  })
  .strict();

export function parseQualificationRecord(input: unknown): QualificationRecord {
  return qualificationRecordSchema.parse(input);
}

export async function gradeQualificationRecords(
  inputs: readonly unknown[],
  options: QualificationGradeOptions
): Promise<QualificationReport> {
  const records = inputs.map(parseQualificationRecord);
  const findings: QualificationFinding[] = [];
  const scenarios = new Map(representativeAgentScenarios.map((scenario) => [scenario.id, scenario]));
  const hosts = new Map(options.hosts.map((host) => [host.harness, host]));
  const matrix = expectedMatrix();
  const observedMatrix = new Map<string, QualificationRecord[]>();

  for (const record of records) {
    const scenario = scenarios.get(record.scenarioId);
    const key = matrixKey(record.scenarioId, record.host.harness);
    const matrixRecords = observedMatrix.get(key) ?? [];
    matrixRecords.push(record);
    observedMatrix.set(key, matrixRecords);

    if (!scenario || !matrix.has(key)) {
      addFinding(findings, record, 'unexpected-matrix-run', `Run is not part of the declared qualification matrix.`);
      continue;
    }

    compareHost(record, hosts.get(record.host.harness), findings);
    compareSource(record, scenario, findings);
    compareIdentity(record, options, findings);
    compareAuthority(record, hosts.get(record.host.harness), findings);
    await verifyArtifacts(record, scenario, options.artifactRoot, findings);
    compareVectors(record, scenario, findings);
  }

  for (const key of matrix) {
    const matrixRecords = observedMatrix.get(key) ?? [];
    const [scenarioId, harness] = key.split('\0');
    if (matrixRecords.length === 0) {
      findings.push({ code: 'missing-matrix-run', scenarioId, message: `Missing ${harness} qualification run.` });
    }
    if (matrixRecords.length > 1) {
      findings.push({ code: 'duplicate-matrix-run', scenarioId, message: `Multiple ${harness} qualification runs were supplied.` });
    }
  }

  compareCrossHarnessParity(records, findings);
  return { schemaVersion: qualificationReportSchemaVersion, status: findings.length === 0 ? 'passed' : 'failed', findings };
}

function expectedMatrix(): Set<string> {
  const matrix = new Set<string>();
  for (const scenario of representativeAgentScenarios) {
    for (const harness of scenario.qualificationHarnesses) matrix.add(matrixKey(scenario.id, harness));
  }
  return matrix;
}

function matrixKey(scenarioId: string, harness: AgentHarness): string {
  return `${scenarioId}\0${harness}`;
}

function compareHost(
  record: QualificationRecord,
  expected: QualificationHostExpectation | undefined,
  findings: QualificationFinding[]
): void {
  if (
    !expected ||
    record.host.harnessVersion !== expected.harnessVersion ||
    record.host.model !== expected.model ||
    !sameRecord(record.host.modelConfiguration, expected.modelConfiguration)
  ) {
    addFinding(
      findings,
      record,
      'host-identity-mismatch',
      `Harness version, model, or model configuration differs from the qualification plan.`
    );
  }
}

function compareSource(record: QualificationRecord, scenario: AgentScenario, findings: QualificationFinding[]): void {
  if (
    record.sourceIdentity.revision !== scenario.repository.sourceRevision ||
    record.sourceIdentity.seedTreeSha256 !== scenario.repository.treeSha256 ||
    record.sourceIdentity.lockPath !== scenario.repository.lockPath ||
    record.sourceIdentity.lockSha256 !== scenario.repository.lockSha256
  ) {
    addFinding(
      findings,
      record,
      'source-identity-mismatch',
      `Scenario seed revision, tree digest, or dependency lock does not match the catalog.`
    );
  }
}

function compareIdentity(record: QualificationRecord, options: QualificationGradeOptions, findings: QualificationFinding[]): void {
  if (
    record.skillIdentity.version !== options.expectedSkillIdentity.version ||
    record.skillIdentity.digest !== options.expectedSkillIdentity.digest
  ) {
    addFinding(findings, record, 'skill-identity-mismatch', `Canonical Skill version or digest differs from the qualification plan.`);
  }
  if (record.engineIdentity.version !== options.expectedEngineVersion) {
    addFinding(findings, record, 'engine-identity-mismatch', `Migration engine version differs from the qualification plan.`);
  }
}

function compareAuthority(
  record: QualificationRecord,
  expected: QualificationHostExpectation | undefined,
  findings: QualificationFinding[]
): void {
  if (
    !expected ||
    record.authority.network !== expected.authority.network ||
    !sameSet(record.authority.allowedTools, expected.authority.allowedTools) ||
    !sameSet(record.authority.writeScopes, expected.authority.writeScopes)
  ) {
    addFinding(
      findings,
      record,
      'authority-mismatch',
      `Allowed tools, network policy, or write scope differs from the qualification plan.`
    );
  }
}

async function verifyArtifacts(
  record: QualificationRecord,
  scenario: AgentScenario,
  artifactRoot: string,
  findings: QualificationFinding[]
): Promise<void> {
  const byKind = new Map<QualificationArtifact['kind'], QualificationArtifact[]>();
  for (const artifact of record.artifacts) {
    const artifacts = byKind.get(artifact.kind) ?? [];
    artifacts.push(artifact);
    byKind.set(artifact.kind, artifacts);
  }

  for (const kind of scenario.requiredArtifacts) {
    const artifacts = byKind.get(kind) ?? [];
    if (artifacts.length === 0) addFinding(findings, record, 'artifact-kind-missing', `Required ${kind} artifact is not recorded.`);
    if (artifacts.length > 1) addFinding(findings, record, 'artifact-kind-duplicate', `Multiple ${kind} artifacts are recorded.`);
  }

  const canonicalRoot = await realpath(artifactRoot);
  for (const artifact of record.artifacts) {
    const artifactPath = resolve(canonicalRoot, artifact.path);
    if (!isContained(canonicalRoot, artifactPath)) {
      addFinding(findings, record, 'artifact-path-unsafe', `Artifact ${artifact.kind} escapes the artifact root.`);
      continue;
    }
    try {
      const metadata = await lstat(artifactPath);
      if (!metadata.isFile() || metadata.isSymbolicLink()) {
        addFinding(findings, record, 'artifact-path-unsafe', `Artifact ${artifact.kind} is not a regular, non-symlink file.`);
        continue;
      }
      const canonicalArtifact = await realpath(artifactPath);
      if (!isContained(canonicalRoot, canonicalArtifact)) {
        addFinding(findings, record, 'artifact-path-unsafe', `Artifact ${artifact.kind} resolves outside the artifact root.`);
        continue;
      }
      const actual = createHash('sha256')
        .update(await readFile(canonicalArtifact))
        .digest('hex');
      if (actual !== artifact.sha256) {
        addFinding(findings, record, 'artifact-digest-mismatch', `Artifact ${artifact.kind} does not match its recorded SHA-256 digest.`);
      }
    } catch (error) {
      if (isMissingFileError(error)) {
        addFinding(findings, record, 'artifact-missing', `Artifact ${artifact.kind} does not exist at ${artifact.path}.`);
        continue;
      }
      throw error;
    }
  }
}

function compareVectors(record: QualificationRecord, scenario: AgentScenario, findings: QualificationFinding[]): void {
  const gates = new Map(record.gateVector.map((gate) => [gate.id, gate.status]));
  if (gates.size !== record.gateVector.length || !sameSet(gates.keys(), scenario.requiredGateIds)) {
    addFinding(findings, record, 'gate-vector-mismatch', `Gate vector does not contain each catalog gate exactly once.`);
  }
  for (const [id, status] of gates) {
    if (status !== 'passed') addFinding(findings, record, 'gate-failed', `Required gate ${id} is ${status}.`);
  }

  const decisions = new Map(record.decisionVector.map((decision) => [decision.id, decision.status]));
  if (decisions.size !== record.decisionVector.length || !sameSet(decisions.keys(), scenario.decisionPointIds)) {
    addFinding(findings, record, 'decision-vector-mismatch', `Decision vector does not contain each catalog decision exactly once.`);
  }
  if (record.conclusion !== scenario.expectedOutcome) {
    addFinding(findings, record, 'conclusion-mismatch', `Run conclusion does not match the catalog expectation.`);
  }
}

function compareCrossHarnessParity(records: readonly QualificationRecord[], findings: QualificationFinding[]): void {
  const parityRecords = records.filter(({ scenarioId }) => scenarioId === crossHarnessSafetyScenario.scenarioId);
  if (parityRecords.length === 0) return;
  const reference = parityRecords.find(({ host }) => host.harness === crossHarnessSafetyScenario.harnesses[0]);
  if (!reference) return;

  const referenceGates = new Map(reference.gateVector.map(({ id, status }) => [id, status]));
  const referenceDecisions = new Map(reference.decisionVector.map(({ id, status }) => [id, status]));
  for (const record of parityRecords) {
    if (record === reference) continue;
    for (const id of crossHarnessSafetyScenario.invariantGateIds) {
      if (record.gateVector.find((gate) => gate.id === id)?.status !== referenceGates.get(id)) {
        addFinding(findings, record, 'cross-harness-gate-drift', `Invariant gate ${id} differs across harnesses.`);
      }
    }
    for (const id of crossHarnessSafetyScenario.invariantDecisionPointIds) {
      if (record.decisionVector.find((decision) => decision.id === id)?.status !== referenceDecisions.get(id)) {
        addFinding(findings, record, 'cross-harness-decision-drift', `Invariant decision ${id} differs across harnesses.`);
      }
    }
  }
}

function addFinding(findings: QualificationFinding[], record: QualificationRecord, code: QualificationFindingCode, message: string): void {
  findings.push({ code, runId: record.runId, scenarioId: record.scenarioId, message });
}

function sameSet(left: Iterable<string>, right: Iterable<string>): boolean {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  if (leftSet.size !== rightSet.size) return false;
  for (const value of leftSet) if (!rightSet.has(value)) return false;
  return true;
}

function sameRecord(left: Readonly<Record<string, string>>, right: Readonly<Record<string, string>>): boolean {
  const leftEntries = Object.entries(left).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  const rightEntries = Object.entries(right).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
  return JSON.stringify(leftEntries) === JSON.stringify(rightEntries);
}

function isContained(root: string, path: string): boolean {
  const relation = relative(root, path);
  return relation === '' || (!relation.startsWith('..') && !relation.startsWith('/'));
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
