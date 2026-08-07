import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import '../../observable-polyfill/src/index.js';
import { behaviorSubject } from '../../rxjs/src/behavior-subject.js';
import { ColdObservable } from '../../rxjs/src/cold-observable.js';
import { map } from '../../rxjs/src/map.js';
import { replaySubject } from '../../rxjs/src/replay-subject.js';
import { share } from '../../rxjs/src/share.js';

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));

const acceptedContracts = [
  {
    id: 'cold-symbol-pipeline',
    target: 'cold-preserving',
    ledgerIds: ['value:ColdObservable', 'operator:map'],
    catalogIds: ['imports:pipeable-functions', 'imports:platform-constructors', 'types:subscription'],
    outcome: 'migrated',
    negativeControl: 'A platform Observable would collapse producer-per-subscription behavior.',
  },
  {
    id: 'platform-shared-pipeline',
    target: 'platform-shared',
    ledgerIds: ['operator:share'],
    catalogIds: ['imports:pipeable-functions', 'types:subscription'],
    outcome: 'migrated',
    negativeControl: 'ColdObservable would duplicate intentionally shared producer work.',
  },
  {
    id: 'hot-subject-state',
    target: 'subject-hot',
    ledgerIds: ['value:BehaviorSubject', 'value:ReplaySubject'],
    catalogIds: ['aliases:subject-constructors'],
    outcome: 'migrated',
    negativeControl: 'Calling observer-local replay cold would misstate Subject ownership.',
  },
  {
    id: 'unsupported-scheduler-interop',
    target: 'safe-stop',
    ledgerIds: [],
    catalogIds: [
      'schedulers:runtime-values',
      'schedulers:arguments',
      'interop:observable-symbol',
      'interop:arbitrary-subscribables',
      'aliases:multicasting',
    ],
    outcome: 'safe-stop',
    negativeControl: 'Dropping schedulers or inventing an interop adapter would be unsafe.',
  },
] as const;

describe('accepted migration lifecycle contracts', () => {
  it('pins cold, platform-shared, hot Subject, and safe-stop outcomes with negative controls', () => {
    expect(acceptedContracts.map(({ id }) => id)).toEqual([
      'cold-symbol-pipeline',
      'platform-shared-pipeline',
      'hot-subject-state',
      'unsupported-scheduler-interop',
    ]);
    expect(new Set(acceptedContracts.map(({ target }) => target))).toEqual(
      new Set(['cold-preserving', 'platform-shared', 'subject-hot', 'safe-stop'])
    );
    for (const contract of acceptedContracts) expect(contract.negativeControl).toBeTruthy();
  });

  it('links migrated outcomes to evidence and safe stops to every unsupported category', async () => {
    const ledger = JSON.parse(
      await readFile(`${repositoryRoot}packages/rxjs/test/ported/migration-evidence-ledger.generated.json`, 'utf8')
    ) as { entries: Array<{ id: string; evidence: { status: string } }> };
    const catalog = JSON.parse(
      await readFile(`${repositoryRoot}packages/rxjs/test/ported/unsupported-surface-catalog.json`, 'utf8')
    ) as { categories: Record<string, Array<{ id: string; disposition: string }>> };
    const ledgerById = new Map(ledger.entries.map((entry) => [entry.id, entry]));
    const catalogById = new Map(Object.values(catalog.categories).flat().map((entry) => [entry.id, entry]));

    for (const contract of acceptedContracts) {
      for (const ledgerId of contract.ledgerIds) {
        expect(ledgerById.get(ledgerId)?.evidence.status, `${contract.id}:${ledgerId}`).not.toBe('uncovered');
      }
      for (const catalogId of contract.catalogIds) expect(catalogById.has(catalogId), `${contract.id}:${catalogId}`).toBe(true);
    }
    const safeStop = acceptedContracts.find(({ outcome }) => outcome === 'safe-stop')!;
    expect(safeStop.catalogIds.map((id) => catalogById.get(id)?.disposition)).toEqual([
      'replace',
      'manual-review',
      'unsupported',
      'manual-review',
      'manual-review',
    ]);
  });

  it('keeps a cold target producer-per-subscription with exact Symbol construction and signal cancellation', () => {
    const log: string[] = [];
    const values: number[] = [];
    const request = new ColdObservable<number>((subscriber) => {
      log.push('start');
      subscriber.next(21);
      subscriber.addTeardown(() => log.push('stop'));
    })[map]((value) => value * 2);
    const first = new AbortController();
    const second = new AbortController();

    request.subscribe((value) => values.push(value), { signal: first.signal });
    request.subscribe((value) => values.push(value), { signal: second.signal });
    expect(request).toBeInstanceOf(ColdObservable);
    expect(log).toEqual(['start', 'start']);
    expect(values).toEqual([42, 42]);
    first.abort();
    second.abort();
    expect(log).toEqual(['start', 'start', 'stop', 'stop']);
  });

  it('keeps a platform target shared until final cancellation and restartable afterward', () => {
    const log: string[] = [];
    const feed = new Observable<number>((subscriber) => {
      log.push('start');
      subscriber.next(1);
      subscriber.addTeardown(() => log.push('stop'));
    })[share]();
    const first = new AbortController();
    const second = new AbortController();
    const restarted = new AbortController();

    feed.subscribe(null, { signal: first.signal });
    feed.subscribe(null, { signal: second.signal });
    expect(log).toEqual(['start']);
    first.abort();
    expect(log).toEqual(['start']);
    second.abort();
    expect(log).toEqual(['start', 'stop']);
    feed.subscribe(null, { signal: restarted.signal });
    restarted.abort();
    expect(log).toEqual(['start', 'stop', 'start', 'stop']);
  });

  it('detects a cold/platform lifecycle swap in its negative control', () => {
    const platformLog: string[] = [];
    const platform = new Observable<void>((subscriber) => {
      platformLog.push('start');
      subscriber.addTeardown(() => platformLog.push('stop'));
    });
    const coldLog: string[] = [];
    const cold = new ColdObservable<void>((subscriber) => {
      coldLog.push('start');
      subscriber.addTeardown(() => coldLog.push('stop'));
    });
    const controllers = Array.from({ length: 4 }, () => new AbortController());

    platform.subscribe(null, { signal: controllers[0]!.signal });
    platform.subscribe(null, { signal: controllers[1]!.signal });
    cold.subscribe(null, { signal: controllers[2]!.signal });
    cold.subscribe(null, { signal: controllers[3]!.signal });
    expect(platformLog).toEqual(['start']);
    expect(coldLog).toEqual(['start', 'start']);
    controllers.forEach((controller) => controller.abort());
    expect(platformLog).toEqual(['start', 'stop']);
    expect(coldLog).toEqual(['start', 'start', 'stop', 'stop']);
  });

  it('keeps behavior and replay state observer-local without making Subjects cold', () => {
    const status = behaviorSubject('idle');
    const firstStatus: string[] = [];
    const lateStatus: string[] = [];
    status.subscribe((value) => firstStatus.push(value));
    status.next('ready');
    status.subscribe((value) => lateStatus.push(value));

    const recent = replaySubject<number>({ size: 2 });
    recent.next(1);
    recent.next(2);
    recent.next(3);
    recent.complete();
    const replayed: number[] = [];
    recent.subscribe((value) => replayed.push(value));

    expect(firstStatus).toEqual(['idle', 'ready']);
    expect(lateStatus).toEqual(['ready']);
    expect(replayed).toEqual([2, 3]);
  });
});
