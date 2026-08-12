import type {
  ArgumentAdapter,
  DiagnosticDisposition,
  DiagnosticNextActionCode,
  DiagnosticSeverity,
  MigrationDiagnosticCode,
  RefusalScope,
} from '../../src/index.js';

export interface ExpectedDiagnostic {
  readonly code: MigrationDiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly disposition: DiagnosticDisposition;
  readonly refusalScope: RefusalScope;
  readonly classification:
    | 'portable'
    | 'harness-rewrite'
    | 'compatibility-only'
    | 'intentional-divergence'
    | 'unsupported-or-obsolete';
  readonly capabilityId?: string;
  readonly start: number;
  readonly end: number;
  readonly nextAction: DiagnosticNextActionCode;
}

export interface MechanicalFixture {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly capabilityId?: string;
  readonly adapter?: ArgumentAdapter;
  readonly category: 'operator' | 'refusal';
  readonly fileName: string;
  readonly input: string;
  readonly expected: string;
  readonly expectedStatus: 'unchanged' | 'changed' | 'refused';
  readonly expectedDiagnostics: readonly ExpectedDiagnostic[];
  readonly exactOutput: true;
  readonly behaviorClaim?: 'map-values' | 'buffer-count-values' | 'concat-map-values';
}

export const mechanicalFixtures: readonly MechanicalFixture[] = [
  {
    schemaVersion: 1,
    id: 'operator.filter',
    capabilityId: 'operator.filter',
    adapter: 'identity',
    category: 'operator',
    fileName: 'operator.filter.ts',
    input: "import { filter } from 'rxjs/operators';\nconst result = source.pipe(filter(value => value > 1));\n",
    expected: 'import { filter } from "rxjs/filter";\nconst result = source[filter](value => value > 1);\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'operator.map',
    capabilityId: 'operator.map',
    adapter: 'identity',
    category: 'operator',
    fileName: 'operator.map.ts',
    input: "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value => value + 1));\n",
    expected: 'import { map } from "rxjs/map";\nconst result = source[map](value => value + 1);\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
    behaviorClaim: 'map-values',
  },
  {
    schemaVersion: 1,
    id: 'operator.take-until',
    capabilityId: 'operator.take-until',
    adapter: 'identity',
    category: 'operator',
    fileName: 'operator.take-until.ts',
    input: "import { takeUntil } from 'rxjs/operators';\nconst result = source.pipe(takeUntil(notifier));\n",
    expected: 'import { takeUntil } from "rxjs/take-until";\nconst result = source[takeUntil](notifier);\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'operator.buffer-count',
    capabilityId: 'operator.buffer-count',
    adapter: 'buffer-count',
    category: 'operator',
    fileName: 'operator.buffer-count.ts',
    input: "import { bufferCount } from 'rxjs/operators';\nconst result = source.pipe(bufferCount(2));\n",
    expected:
      'import { buffer } from "rxjs/buffer";\nconst result = source[buffer]({ maxSize: 2, startEvery: 2, emitRemainingOnError: false });\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
    behaviorClaim: 'buffer-count-values',
  },
  {
    schemaVersion: 1,
    id: 'operator.concat-map',
    capabilityId: 'operator.concat-map',
    adapter: 'concat-map',
    category: 'operator',
    fileName: 'operator.concat-map.ts',
    input: "import { concatMap } from 'rxjs/operators';\nconst result = source.pipe(concatMap(value => inner(value)));\n",
    expected:
      'import { mergeMap } from "rxjs/merge-map";\nconst result = source[mergeMap](value => inner(value), { concurrent: 1 });\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
    behaviorClaim: 'concat-map-values',
  },
  {
    schemaVersion: 1,
    id: 'operator.concat-all',
    capabilityId: 'operator.concat-all',
    adapter: 'concat-all',
    category: 'operator',
    fileName: 'operator.concat-all.ts',
    input: "import { concatAll } from 'rxjs/operators';\nconst result = source.pipe(concatAll());\n",
    expected:
      'import { mergeMap } from "rxjs/merge-map";\nconst result = source[mergeMap](inner => inner, { concurrent: 1 });\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'operator.switch-all',
    capabilityId: 'operator.switch-all',
    adapter: 'switch-all',
    category: 'operator',
    fileName: 'operator.switch-all.ts',
    input: "import { switchAll } from 'rxjs/operators';\nconst result = source.pipe(switchAll());\n",
    expected: 'import { switchMap } from "rxjs/switch-map";\nconst result = source[switchMap](inner => inner);\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'operator.debounce-time',
    capabilityId: 'operator.debounce-time',
    adapter: 'first-argument',
    category: 'operator',
    fileName: 'operator.debounce-time.ts',
    input: "import { debounceTime } from 'rxjs/operators';\nconst result = source.pipe(debounceTime(5));\n",
    expected: 'import { debounce } from "rxjs/debounce";\nconst result = source[debounce](5);\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'operator.audit',
    capabilityId: 'operator.audit',
    adapter: 'audit',
    category: 'operator',
    fileName: 'operator.audit.ts',
    input: "import { audit } from 'rxjs/operators';\nconst result = source.pipe(audit(value => duration(value)));\n",
    expected:
      'import { throttle } from "rxjs/throttle";\nconst result = source[throttle](value => duration(value), { leading: false, trailing: true, restartOnTrailing: false });\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'operator.audit-time',
    capabilityId: 'operator.audit-time',
    adapter: 'audit-time',
    category: 'operator',
    fileName: 'operator.audit-time.ts',
    input: "import { auditTime } from 'rxjs/operators';\nconst result = source.pipe(auditTime(5));\n",
    expected:
      'import { throttle } from "rxjs/throttle";\nconst result = source[throttle](5, { leading: false, trailing: true, restartOnTrailing: false });\n',
    expectedStatus: 'changed',
    expectedDiagnostics: [],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'syntax.malformed',
    category: 'refusal',
    fileName: 'syntax.malformed.ts',
    input: "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value =>));\n",
    expected: "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value =>));\n",
    expectedStatus: 'refused',
    expectedDiagnostics: [
      {
        code: 'malformed-source',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'file',
        classification: 'harness-rewrite',
        start: 77,
        end: 78,
        nextAction: 'fix-input',
      },
    ],
    exactOutput: true,
  },
  {
    schemaVersion: 1,
    id: 'pipeline.unsupported-atomic',
    category: 'refusal',
    fileName: 'pipeline.unsupported-atomic.ts',
    input:
      "import { map, shareReplay } from 'rxjs/operators';\nconst result = source.pipe(map(value => value), shareReplay(1));\n",
    expected:
      "import { map, shareReplay } from 'rxjs/operators';\nconst result = source.pipe(map(value => value), shareReplay(1));\n",
    expectedStatus: 'refused',
    expectedDiagnostics: [
      {
        code: 'unsafe-binding',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'transform',
        classification: 'harness-rewrite',
        capabilityId: 'operator.map',
        start: 78,
        end: 81,
        nextAction: 'review-source',
      },
      {
        code: 'missing-capability',
        severity: 'error',
        disposition: 'refused',
        refusalScope: 'transform',
        classification: 'unsupported-or-obsolete',
        start: 99,
        end: 113,
        nextAction: 'update-engine',
      },
    ],
    exactOutput: true,
  },
];
