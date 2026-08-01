import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  agentHarnesses,
  codexSafetyScenario,
  representativeAgentScenarios,
  requiredArtifactKinds,
  requiredBehaviorCategories,
  requiredOutcomeGateIds,
} from './scenario-catalog.js';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));

describe('P0.M5 representative scenario catalog', () => {
  it('defines the bounded application/library qualification set and expected outcomes', () => {
    expect(representativeAgentScenarios.map(({ id }) => id)).toEqual([
      'app-cold-strong',
      'app-platform-strong',
      'library-mixed-strong',
      'library-weak-unsupported',
    ]);
    expect(representativeAgentScenarios.map(({ expectedOutcome }) => expectedOutcome)).toEqual([
      'completed',
      'completed',
      'completed',
      'safe-stop',
    ]);
    expect(new Set(representativeAgentScenarios.map(({ id }) => id)).size).toBe(representativeAgentScenarios.length);
  });

  it('pins every checked-in seed tree and dependency lock to its actual bytes', async () => {
    for (const scenario of representativeAgentScenarios) {
      const seedRoot = join(packageRoot, scenario.repository.fixtureRoot);
      expect(await treeDigest(seedRoot)).toBe(scenario.repository.treeSha256);
      expect(await fileDigest(join(seedRoot, scenario.repository.lockPath))).toBe(scenario.repository.lockSha256);
      expect(await fileDigest(join(seedRoot, scenario.repository.descriptorPath))).toBe(scenario.repository.descriptorSha256);

      const packageJson = JSON.parse(await readFile(join(seedRoot, 'package.json'), 'utf8')) as {
        dependencies?: { rxjs?: string };
      };
      const descriptor = JSON.parse(await readFile(join(seedRoot, scenario.repository.descriptorPath), 'utf8')) as {
        frozen?: boolean;
        dependencies?: { rxjs?: { specifier?: string; resolution?: string } };
      };
      const lock = await readFile(join(seedRoot, scenario.repository.lockPath), 'utf8');
      expect(packageJson.dependencies?.rxjs).toBe('7.8.1');
      expect(descriptor).toMatchObject({
        frozen: true,
        dependencies: { rxjs: { specifier: '7.8.1', resolution: 'npm:rxjs@7.8.1' } },
      });
      expect(lock).toContain("lockfileVersion: '9.0'");
      expect(lock).toMatch(/rxjs:\n\s+specifier: 7\.8\.1\n\s+version: 7\.8\.1/);
      expect(scenario.repository).toMatchObject({
        sourceRxjsVersion: '7.8.1',
        sourceRevision: 'npm:rxjs@7.8.1',
        frozenInstall: true,
      });
    }
  });

  it('covers layouts, TypeScript profiles, frameworks, coverage levels, and target contracts', () => {
    expect(values('repository', 'kind')).toEqual(new Set(['application', 'library']));
    expect(values('testFramework', 'id')).toEqual(new Set(['vitest', 'mocha', 'jest']));
    expect(values('coverage')).toEqual(new Set(['strong', 'weak']));
    expect(values('targetContract')).toEqual(new Set(['cold-preserving', 'platform-intentional', 'mixed', 'unsupported']));
    expect(values('typescript', 'moduleResolution')).toEqual(new Set(['NodeNext', 'Bundler', 'Node16', 'Node10']));
    expect(representativeAgentScenarios.every(({ testFramework }) => testFramework.policy === 'preserve')).toBe(true);
  });

  it('gives every required behavior category a passing case and a negative or refusal control', () => {
    const behavior = representativeAgentScenarios.flatMap((scenario) => scenario.behavior);
    expect(new Set(behavior.map(({ category }) => category))).toEqual(new Set(requiredBehaviorCategories));

    for (const category of requiredBehaviorCategories) {
      const cases = behavior.filter((item) => item.category === category);
      expect(cases, category).toHaveLength(1);
      expect(cases[0]?.positive.evidenceId, category).toBeTruthy();
      expect(cases[0]?.positive.claim, category).toBeTruthy();
      expect(['negative', 'refusal'], category).toContain(cases[0]?.control.kind);
      expect(cases[0]?.control.diagnosticId, category).toBeTruthy();
      expect(cases[0]?.control.expectation, category).toBeTruthy();
    }
  });

  it('requires baseline, outcome, warning, decision, artifact, and protected-test evidence', async () => {
    for (const scenario of representativeAgentScenarios) {
      expect(scenario.baselineCommands).toContain('pnpm test');
      expect(scenario.requiredGateIds).toEqual(requiredOutcomeGateIds);
      expect(scenario.requiredArtifacts).toEqual(requiredArtifactKinds);
      expect(scenario.protectedTestIds.length).toBeGreaterThan(0);
      expect(new Set(Object.keys(scenario.expectedDecisionStatuses))).toEqual(new Set(scenario.decisionPointIds));

      const diagnosticIds = scenario.behavior.map(({ control }) => control.diagnosticId);
      expect(new Set(scenario.expectedDiagnosticIds)).toEqual(new Set(diagnosticIds));
      const behaviorDecisionIds = scenario.behavior.flatMap(({ control }) => (control.decisionPointId ? [control.decisionPointId] : []));
      expect(behaviorDecisionIds.every((id) => scenario.decisionPointIds.includes(id))).toBe(true);

      const seedSource = await readTreeSource(join(packageRoot, scenario.repository.fixtureRoot));
      for (const protectedTestId of scenario.protectedTestIds) {
        expect(seedSource, `${scenario.id}:${protectedTestId}`).toContain(protectedTestId);
      }
    }
  });

  it('pins the required developer decision status for every scenario', () => {
    expect(
      Object.fromEntries(representativeAgentScenarios.map(({ id, expectedDecisionStatuses }) => [id, expectedDecisionStatuses]))
    ).toEqual({
      'app-cold-strong': {
        'decision:cold-lifecycle': 'approved',
      },
      'app-platform-strong': {
        'decision:platform-sharing': 'approved',
        'decision:subject-late-observer': 'approved',
        'decision:repeat-restart': 'approved',
      },
      'library-mixed-strong': {
        'decision:legacy-interop': 'approved',
        'decision:mixed-unsupported-segment': 'approved',
      },
      'library-weak-unsupported': {
        'decision:scheduler-policy': 'unresolved',
        'decision:unsupported-blocker': 'approved',
        'decision:characterization-scope': 'approved',
      },
    });

    for (const scenario of representativeAgentScenarios.filter(({ expectedOutcome }) => expectedOutcome === 'completed')) {
      expect(new Set(Object.values(scenario.expectedDecisionStatuses))).toEqual(new Set(['approved']));
    }
  });

  it('makes weak coverage characterize first and end at a disclosed safe stop', () => {
    const weak = representativeAgentScenarios.find(({ id }) => id === 'library-weak-unsupported');
    expect(weak).toMatchObject({ coverage: 'weak', targetContract: 'unsupported', expectedOutcome: 'safe-stop' });
    expect(weak?.decisionPointIds).toContain('decision:characterization-scope');
    expect(weak?.expectedDecisionStatuses).toEqual({
      'decision:scheduler-policy': 'unresolved',
      'decision:unsupported-blocker': 'approved',
      'decision:characterization-scope': 'approved',
    });
    expect(weak?.expectedDiagnosticIds).toContain('control:coverage-safety-claim');
    expect(weak?.requiredGateIds).toContain('characterizations-before-migration');
  });

  it('runs every representative scenario through the approved Codex-only qualification lane', () => {
    expect(agentHarnesses).toEqual(['codex', 'claude', 'cursor']);
    expect(representativeAgentScenarios.every(({ qualificationHarnesses }) => qualificationHarnesses.length === 1)).toBe(true);
    expect(representativeAgentScenarios.every(({ qualificationHarnesses }) => qualificationHarnesses[0] === 'codex')).toBe(true);
  });

  it('holds the required Codex safety gates and developer decisions for the weak scenario', () => {
    const scenario = representativeAgentScenarios.find(({ id }) => id === codexSafetyScenario.scenarioId);
    expect(codexSafetyScenario.harness).toBe('codex');
    expect(codexSafetyScenario.expectedOutcome).toBe('safe-stop');
    expect(codexSafetyScenario.invariantGateIds.every((id) => scenario?.requiredGateIds.includes(id))).toBe(true);
    expect(codexSafetyScenario.invariantDecisionPointIds.every((id) => scenario?.decisionPointIds.includes(id))).toBe(true);
    expect(codexSafetyScenario.forbiddenOutcomes).toEqual(
      expect.arrayContaining(['automatic lifecycle selection', 'suppressed required diagnostic', 'weakened or deleted protected test'])
    );
  });
});

function values(first: 'coverage' | 'targetContract'): Set<string>;
function values(first: 'repository', second: 'kind'): Set<string>;
function values(first: 'testFramework', second: 'id'): Set<string>;
function values(first: 'typescript', second: 'moduleResolution'): Set<string>;
function values(first: 'coverage' | 'targetContract' | 'repository' | 'testFramework' | 'typescript', second?: string): Set<string> {
  return new Set(
    representativeAgentScenarios.map((scenario) => {
      const value = scenario[first];
      return second ? String((value as unknown as Record<string, unknown>)[second]) : String(value);
    })
  );
}

async function treeDigest(root: string): Promise<string> {
  const digest = createHash('sha256');
  for (const path of await files(root)) {
    digest.update(relative(root, path));
    digest.update('\0');
    digest.update(await readFile(path));
    digest.update('\0');
  }
  return digest.digest('hex');
}

async function fileDigest(path: string): Promise<string> {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
}

async function readTreeSource(root: string): Promise<string> {
  return (await Promise.all((await files(root)).map((path) => readFile(path, 'utf8')))).join('\n');
}

async function files(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    })
  );
  return paths.flat().sort((left, right) => left.localeCompare(right));
}
