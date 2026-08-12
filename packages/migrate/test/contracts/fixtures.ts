export const acceptedMigrationFixtureIds = [
  'cold-symbol-pipeline',
  'platform-shared-pipeline',
  'hot-subject-state',
  'unsupported-scheduler-interop',
] as const;

export type AcceptedMigrationFixtureId = (typeof acceptedMigrationFixtureIds)[number];

export interface AcceptedMigrationFixture {
  readonly schemaVersion: 1;
  readonly id: AcceptedMigrationFixtureId;
  readonly sourceEvidence: string;
  readonly targetContract: 'cold-preserving' | 'platform-shared' | 'subject-hot' | 'safe-stop';
  readonly lifecycle: string;
  readonly cancellation: 'AbortSignal' | 'subject-owned' | 'unresolved';
  readonly ledgerIds: readonly string[];
  readonly catalogIds: readonly string[];
  readonly decisions: readonly string[];
  readonly expectedOutcome: 'migrated' | 'safe-stop';
  readonly targetSource?: string;
  readonly negativeControl: string;
}

export const acceptedMigrationFixtures: readonly AcceptedMigrationFixture[] = [
  {
    schemaVersion: 1,
    id: 'cold-symbol-pipeline',
    sourceEvidence: 'test/agent/fixtures/app-cold-strong/seed/src/request.ts',
    targetContract: 'cold-preserving',
    lifecycle: 'One producer per direct subscription; exact Symbol results retain ColdObservable construction.',
    cancellation: 'AbortSignal',
    ledgerIds: ['value:ColdObservable', 'operator:map'],
    catalogIds: ['imports:pipeable-functions', 'imports:platform-constructors', 'types:subscription'],
    decisions: ['D-037', 'D-039', 'D-049', 'D-050'],
    expectedOutcome: 'migrated',
    targetSource: [
      "import 'rxjs';",
      "import { ColdObservable } from 'rxjs/cold-observable';",
      "import { map } from 'rxjs/map';",
      'export function request(log: string[]): Observable<number> {',
      '  return new ColdObservable<number>((subscriber) => {',
      "    log.push('start');",
      '    subscriber.next(21);',
      "    subscriber.addTeardown(() => log.push('stop'));",
      '  })[map]((value) => value * 2);',
      '}',
    ].join('\n'),
    negativeControl: 'Replacing ColdObservable with a platform Observable would collapse the reviewed producer-per-subscription contract.',
  },
  {
    schemaVersion: 1,
    id: 'platform-shared-pipeline',
    sourceEvidence: 'test/agent/fixtures/app-platform-strong/seed/src/live-feed.ts',
    targetContract: 'platform-shared',
    lifecycle: 'Concurrent observers share one active producer; final cancellation tears it down and a later observer restarts it.',
    cancellation: 'AbortSignal',
    ledgerIds: ['operator:share'],
    catalogIds: ['imports:pipeable-functions', 'types:subscription'],
    decisions: ['D-013', 'D-035', 'D-039', 'D-049'],
    expectedOutcome: 'migrated',
    targetSource: [
      "import 'rxjs';",
      "import { share } from 'rxjs/share';",
      'export function liveFeed(log: string[]): Observable<number> {',
      '  return new Observable<number>((subscriber) => {',
      "    log.push('start');",
      '    subscriber.next(1);',
      "    subscriber.addTeardown(() => log.push('stop'));",
      '  })[share]();',
      '}',
    ].join('\n'),
    negativeControl: 'Rewriting this source to ColdObservable or tearing down before the final observer leaves changes accepted sharing semantics.',
  },
  {
    schemaVersion: 1,
    id: 'hot-subject-state',
    sourceEvidence: 'test/agent/fixtures/app-platform-strong/seed/src/live-feed.ts',
    targetContract: 'subject-hot',
    lifecycle: 'Behavior and replay factories retain observer-local state while the Subject instance remains the single hot producer.',
    cancellation: 'subject-owned',
    ledgerIds: ['value:BehaviorSubject', 'value:ReplaySubject'],
    catalogIds: ['aliases:subject-constructors'],
    decisions: ['D-035', 'D-036', 'D-050'],
    expectedOutcome: 'migrated',
    targetSource: [
      "import { behaviorSubject } from 'rxjs/behavior-subject';",
      "import { replaySubject } from 'rxjs/replay-subject';",
      "export const status = behaviorSubject('idle');",
      'export const recent = replaySubject<number>({ size: 2 });',
    ].join('\n'),
    negativeControl: 'Calling observer-local replay cold or preserving the RxJS 7 constructors would misstate the accepted Subject contract.',
  },
  {
    schemaVersion: 1,
    id: 'unsupported-scheduler-interop',
    sourceEvidence: 'test/agent/fixtures/library-weak-unsupported/seed/src/index.ts',
    targetContract: 'safe-stop',
    lifecycle: 'Unresolved because scheduler ordering, replay/ref-count behavior, and legacy input interop require characterization.',
    cancellation: 'unresolved',
    ledgerIds: [],
    catalogIds: [
      'schedulers:runtime-values',
      'schedulers:arguments',
      'interop:observable-symbol',
      'interop:arbitrary-subscribables',
      'aliases:multicasting',
    ],
    decisions: ['D-012', 'D-033', 'D-039', 'D-049'],
    expectedOutcome: 'safe-stop',
    negativeControl: 'Dropping scheduler arguments, inventing an interop adapter, or selecting a replay/ref-count lifecycle would be an unsafe migration.',
  },
];
