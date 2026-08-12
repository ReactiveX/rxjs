export const agentHarnesses = ['codex', 'claude', 'cursor'] as const;
export type AgentHarness = (typeof agentHarnesses)[number];

export const requiredBehaviorCategories = [
  'cold-observable',
  'platform-sharing-ref-counting',
  'subjects',
  'cancellation',
  'teardown-order',
  'scheduling-timing',
  'errors',
  'input-conversion',
  'repeated-subscriptions',
  'unsupported-apis',
  'missing-coverage',
  'mixed-pipelines',
] as const;
export type RequiredBehaviorCategory = (typeof requiredBehaviorCategories)[number];

export const requiredArtifactKinds = ['conversation', 'contract-manifest', 'patch', 'command-results', 'final-report'] as const;

export const requiredOutcomeGateIds = [
  'baseline-before-changes',
  'protected-tests-intact',
  'characterizations-before-migration',
  'compilation',
  'build',
  'tests',
  'contract-manifest',
  'diagnostics-reviewed',
  'no-weakened-tests',
  'final-report',
] as const;

export interface BehaviorExpectation {
  readonly category: RequiredBehaviorCategory;
  readonly positive: {
    readonly evidenceId: string;
    readonly claim: string;
  };
  readonly control: {
    readonly kind: 'negative' | 'refusal';
    readonly diagnosticId: string;
    readonly expectation: string;
    readonly decisionPointId?: string;
  };
}

export interface AgentScenario {
  readonly id: string;
  readonly repository: {
    readonly kind: 'application' | 'library';
    readonly fixtureRoot: string;
    readonly treeSha256: string;
    readonly descriptorPath: 'fixture-lock.json';
    readonly descriptorSha256: string;
    readonly lockPath: string;
    readonly lockSha256: string;
    readonly sourceRxjsVersion: '7.8.1';
    readonly sourceRevision: 'npm:rxjs@7.8.1';
    readonly frozenInstall: true;
  };
  readonly typescript: {
    readonly module: string;
    readonly moduleResolution: string;
    readonly strict: boolean;
  };
  readonly testFramework: {
    readonly id: 'vitest' | 'mocha' | 'jest';
    readonly policy: 'preserve';
  };
  readonly coverage: 'strong' | 'weak';
  readonly targetContract: 'cold-preserving' | 'platform-intentional' | 'mixed' | 'unsupported';
  readonly qualificationHarnesses: readonly AgentHarness[];
  readonly baselineCommands: readonly string[];
  readonly protectedTestIds: readonly string[];
  readonly decisionPointIds: readonly string[];
  readonly expectedDecisionStatuses: Readonly<Record<string, 'approved' | 'unresolved'>>;
  readonly expectedDiagnosticIds: readonly string[];
  readonly behavior: readonly BehaviorExpectation[];
  readonly requiredGateIds: typeof requiredOutcomeGateIds;
  readonly requiredArtifacts: typeof requiredArtifactKinds;
  readonly expectedOutcome: 'completed' | 'safe-stop';
}

const scenarioRoot = 'test/agent/fixtures';

/**
 * The four bounded P0.M5 repositories. Their seed bytes are immutable inputs:
 * update the pins only when a deliberate fixture review changes those bytes.
 */
export const representativeAgentScenarios: readonly AgentScenario[] = [
  {
    id: 'app-cold-strong',
    repository: {
      kind: 'application',
      fixtureRoot: `${scenarioRoot}/app-cold-strong/seed`,
      treeSha256: 'a7564614ff08fbaa76cbc3740224ccf4f145a9f76540fb80ffdd9eaaf62daeb0',
      descriptorPath: 'fixture-lock.json',
      descriptorSha256: '9380adbe1cba40b9db2c9db19c60e6e5c4cc843475823299ae10d86db5d12dcb',
      lockPath: 'pnpm-lock.yaml',
      lockSha256: '69332dbccd6a2cfa97fbe4800f70d40f33682e106cc1d0e2e74276eab1bd51fb',
      sourceRxjsVersion: '7.8.1',
      sourceRevision: 'npm:rxjs@7.8.1',
      frozenInstall: true,
    },
    typescript: { module: 'NodeNext', moduleResolution: 'NodeNext', strict: true },
    testFramework: { id: 'vitest', policy: 'preserve' },
    coverage: 'strong',
    targetContract: 'cold-preserving',
    qualificationHarnesses: ['codex'],
    baselineCommands: ['pnpm test', 'pnpm build'],
    protectedTestIds: ['PT-COLD-INDEPENDENT', 'PT-COLD-CANCELLATION', 'PT-COLD-TEARDOWN'],
    decisionPointIds: ['decision:cold-lifecycle'],
    expectedDecisionStatuses: { 'decision:cold-lifecycle': 'approved' },
    expectedDiagnosticIds: ['control:cold-sharing-drift', 'control:cancellation-ownership', 'control:teardown-order-drift'],
    behavior: [
      {
        category: 'cold-observable',
        positive: { evidenceId: 'PT-COLD-INDEPENDENT', claim: 'Direct subscriptions keep independent producers and Symbol results.' },
        control: {
          kind: 'negative',
          diagnosticId: 'control:cold-sharing-drift',
          expectation: 'Sharing a producer fails the behavior gate.',
          decisionPointId: 'decision:cold-lifecycle',
        },
      },
      {
        category: 'cancellation',
        positive: { evidenceId: 'PT-COLD-CANCELLATION', claim: 'Cancellation closes upstream work through explicit signal ownership.' },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:cancellation-ownership',
          expectation: 'Captured subscriptions are not rewritten until signal ownership is proved.',
        },
      },
      {
        category: 'teardown-order',
        positive: { evidenceId: 'PT-COLD-TEARDOWN', claim: 'Order-sensitive teardown remains characterized.' },
        control: {
          kind: 'negative',
          diagnosticId: 'control:teardown-order-drift',
          expectation: 'Reordered or deleted teardown expectations fail qualification.',
        },
      },
    ],
    requiredGateIds: requiredOutcomeGateIds,
    requiredArtifacts: requiredArtifactKinds,
    expectedOutcome: 'completed',
  },
  {
    id: 'app-platform-strong',
    repository: {
      kind: 'application',
      fixtureRoot: `${scenarioRoot}/app-platform-strong/seed`,
      treeSha256: '303bb786d24ec3f6498692881b7e36d29ab38658f47471c06d73362743e6597a',
      descriptorPath: 'fixture-lock.json',
      descriptorSha256: '9380adbe1cba40b9db2c9db19c60e6e5c4cc843475823299ae10d86db5d12dcb',
      lockPath: 'pnpm-lock.yaml',
      lockSha256: '9ee6ba4f94a3249d97caec0847081a56223fbd02ebe84a0a2bf8a2ee5a7bb73d',
      sourceRxjsVersion: '7.8.1',
      sourceRevision: 'npm:rxjs@7.8.1',
      frozenInstall: true,
    },
    typescript: { module: 'ESNext', moduleResolution: 'Bundler', strict: true },
    testFramework: { id: 'mocha', policy: 'preserve' },
    coverage: 'strong',
    targetContract: 'platform-intentional',
    qualificationHarnesses: ['codex'],
    baselineCommands: ['pnpm test', 'pnpm build'],
    protectedTestIds: ['PT-PLATFORM-SHARING', 'PT-PLATFORM-SUBJECT', 'PT-PLATFORM-REPEAT'],
    decisionPointIds: ['decision:platform-sharing', 'decision:subject-late-observer', 'decision:repeat-restart'],
    expectedDecisionStatuses: {
      'decision:platform-sharing': 'approved',
      'decision:subject-late-observer': 'approved',
      'decision:repeat-restart': 'approved',
    },
    expectedDiagnosticIds: ['control:platform-cold-choice', 'control:subject-replay-gap', 'control:repeat-cache-choice'],
    behavior: [
      {
        category: 'platform-sharing-ref-counting',
        positive: {
          evidenceId: 'PT-PLATFORM-SHARING',
          claim: 'Activation, late join, individual/final abort, restart, and shared state are proved.',
        },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:platform-cold-choice',
          expectation: 'The agent cannot choose platform sharing from syntax alone.',
          decisionPointId: 'decision:platform-sharing',
        },
      },
      {
        category: 'subjects',
        positive: {
          evidenceId: 'PT-PLATFORM-SUBJECT',
          claim: 'Hot, current/replayed, terminal, read-only, and late-observer behavior is reviewed.',
        },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:subject-replay-gap',
          expectation: 'Uncovered replay or late-observer behavior blocks completion.',
          decisionPointId: 'decision:subject-late-observer',
        },
      },
      {
        category: 'repeated-subscriptions',
        positive: {
          evidenceId: 'PT-PLATFORM-REPEAT',
          claim: 'Refresh, cache invalidation, producer multiplicity, and restart are explicit.',
        },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:repeat-cache-choice',
          expectation: 'Ambiguous retry or cache behavior requires a developer decision.',
          decisionPointId: 'decision:repeat-restart',
        },
      },
    ],
    requiredGateIds: requiredOutcomeGateIds,
    requiredArtifacts: requiredArtifactKinds,
    expectedOutcome: 'completed',
  },
  {
    id: 'library-mixed-strong',
    repository: {
      kind: 'library',
      fixtureRoot: `${scenarioRoot}/library-mixed-strong/seed`,
      treeSha256: '7219f99821988b6861d3aad819a6809b0ae2824caca6757bb9625757844f5b08',
      descriptorPath: 'fixture-lock.json',
      descriptorSha256: '9380adbe1cba40b9db2c9db19c60e6e5c4cc843475823299ae10d86db5d12dcb',
      lockPath: 'pnpm-lock.yaml',
      lockSha256: 'a771ace3c45c01ec73b3db4f06823b09a191fa8f1f8461a77678b7ec683ae149',
      sourceRxjsVersion: '7.8.1',
      sourceRevision: 'npm:rxjs@7.8.1',
      frozenInstall: true,
    },
    typescript: { module: 'Node16', moduleResolution: 'Node16', strict: true },
    testFramework: { id: 'jest', policy: 'preserve' },
    coverage: 'strong',
    targetContract: 'mixed',
    qualificationHarnesses: ['codex'],
    baselineCommands: ['pnpm test', 'pnpm build'],
    protectedTestIds: ['PT-MIXED-ERROR', 'PT-MIXED-INPUT', 'PT-MIXED-PIPELINE'],
    decisionPointIds: ['decision:legacy-interop', 'decision:mixed-unsupported-segment'],
    expectedDecisionStatuses: {
      'decision:legacy-interop': 'approved',
      'decision:mixed-unsupported-segment': 'approved',
    },
    expectedDiagnosticIds: ['control:error-swallowed', 'control:legacy-interop', 'control:mixed-segment-dropped'],
    behavior: [
      {
        category: 'errors',
        positive: {
          evidenceId: 'PT-MIXED-ERROR',
          claim: 'Observer, late/unhandled, selector, and terminal errors retain their declared behavior.',
        },
        control: {
          kind: 'negative',
          diagnosticId: 'control:error-swallowed',
          expectation: 'Swallowed or reclassified errors fail protected behavior.',
        },
      },
      {
        category: 'input-conversion',
        positive: { evidenceId: 'PT-MIXED-INPUT', claim: 'Iterable, async iterable, and Promise inputs use supported conversion.' },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:legacy-interop',
          expectation: 'Custom subscribables and legacy interop are retained with a visible refusal.',
          decisionPointId: 'decision:legacy-interop',
        },
      },
      {
        category: 'mixed-pipelines',
        positive: { evidenceId: 'PT-MIXED-PIPELINE', claim: 'Supported segments can migrate around a retained unsupported operator.' },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:mixed-segment-dropped',
          expectation: 'Dropping or silently replacing an unsupported segment fails qualification.',
          decisionPointId: 'decision:mixed-unsupported-segment',
        },
      },
    ],
    requiredGateIds: requiredOutcomeGateIds,
    requiredArtifacts: requiredArtifactKinds,
    expectedOutcome: 'completed',
  },
  {
    id: 'library-weak-unsupported',
    repository: {
      kind: 'library',
      fixtureRoot: `${scenarioRoot}/library-weak-unsupported/seed`,
      treeSha256: '0715da65bec0b8d516b289c8cc3af8f028324836d941cd1ebcc84d5bd31902e7',
      descriptorPath: 'fixture-lock.json',
      descriptorSha256: '9380adbe1cba40b9db2c9db19c60e6e5c4cc843475823299ae10d86db5d12dcb',
      lockPath: 'pnpm-lock.yaml',
      lockSha256: '69332dbccd6a2cfa97fbe4800f70d40f33682e106cc1d0e2e74276eab1bd51fb',
      sourceRxjsVersion: '7.8.1',
      sourceRevision: 'npm:rxjs@7.8.1',
      frozenInstall: true,
    },
    typescript: { module: 'CommonJS', moduleResolution: 'Node10', strict: false },
    testFramework: { id: 'vitest', policy: 'preserve' },
    coverage: 'weak',
    targetContract: 'unsupported',
    qualificationHarnesses: ['codex'],
    baselineCommands: ['pnpm test', 'pnpm build'],
    protectedTestIds: ['PT-WEAK-EXPORTS'],
    decisionPointIds: ['decision:scheduler-policy', 'decision:unsupported-blocker', 'decision:characterization-scope'],
    expectedDecisionStatuses: {
      'decision:scheduler-policy': 'unresolved',
      'decision:unsupported-blocker': 'approved',
      'decision:characterization-scope': 'approved',
    },
    expectedDiagnosticIds: ['control:scheduler-unsupported', 'control:compatibility-invented', 'control:coverage-safety-claim'],
    behavior: [
      {
        category: 'scheduling-timing',
        positive: {
          evidenceId: 'evidence:scheduler-characterization',
          claim: 'Host timing, ordering, and virtual-time evidence are requested before migration.',
        },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:scheduler-unsupported',
          expectation: 'Unsupported scheduler forms remain unchanged and visible.',
          decisionPointId: 'decision:scheduler-policy',
        },
      },
      {
        category: 'unsupported-apis',
        positive: {
          evidenceId: 'evidence:unsupported-retained',
          claim: 'Unsupported APIs retain source evidence and explicit diagnostics.',
        },
        control: {
          kind: 'negative',
          diagnosticId: 'control:compatibility-invented',
          expectation: 'An invented compatibility layer fails the product-boundary gate.',
          decisionPointId: 'decision:unsupported-blocker',
        },
      },
      {
        category: 'missing-coverage',
        positive: { evidenceId: 'PT-WEAK-EXPORTS', claim: 'The shallow baseline triggers focused characterization recommendations.' },
        control: {
          kind: 'refusal',
          diagnosticId: 'control:coverage-safety-claim',
          expectation: 'The workflow cannot claim safety before characterization tests pass on RxJS 7.',
          decisionPointId: 'decision:characterization-scope',
        },
      },
    ],
    requiredGateIds: requiredOutcomeGateIds,
    requiredArtifacts: requiredArtifactKinds,
    expectedOutcome: 'safe-stop',
  },
] as const;

export const codexSafetyScenario = {
  id: 'codex-weak-unsupported-safety',
  scenarioId: 'library-weak-unsupported',
  harness: 'codex' as const,
  invariantGateIds: [
    'baseline-before-changes',
    'protected-tests-intact',
    'characterizations-before-migration',
    'contract-manifest',
    'diagnostics-reviewed',
    'no-weakened-tests',
  ] as const,
  invariantDecisionPointIds: ['decision:scheduler-policy', 'decision:unsupported-blocker', 'decision:characterization-scope'] as const,
  forbiddenOutcomes: [
    'automatic lifecycle selection',
    'suppressed required diagnostic',
    'weakened or deleted protected test',
    'invented compatibility layer',
    'completion claim after an unaccepted blocker',
  ] as const,
  expectedOutcome: 'safe-stop' as const,
};
