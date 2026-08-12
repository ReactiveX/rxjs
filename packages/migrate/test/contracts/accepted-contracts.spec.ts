import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { behaviorSubject } from '../../../rxjs/src/behavior-subject.js';
import { ColdObservable } from '../../../rxjs/src/cold-observable.js';
import { map } from '../../../rxjs/src/map.js';
import { replaySubject } from '../../../rxjs/src/replay-subject.js';
import { share } from '../../../rxjs/src/share.js';
import { rxjsNextTypePaths } from '../mechanical/evidence.js';
import { formatTypecheckDiagnostics, typecheckEvidence } from '../mechanical/typecheck.js';
import { acceptedMigrationFixtureIds, acceptedMigrationFixtures } from './fixtures.js';

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));

describe('P4.4 accepted migration fixtures', () => {
  it('pins one fixture for each accepted lifecycle outcome and its negative control', async () => {
    expect(acceptedMigrationFixtures.map(({ id }) => id)).toEqual(acceptedMigrationFixtureIds);
    expect(new Set(acceptedMigrationFixtures.map(({ targetContract }) => targetContract))).toEqual(
      new Set(['cold-preserving', 'platform-shared', 'subject-hot', 'safe-stop'])
    );

    for (const fixture of acceptedMigrationFixtures) {
      expect(fixture.schemaVersion).toBe(1);
      expect(fixture.sourceEvidence).toBeTruthy();
      expect(fixture.lifecycle).toBeTruthy();
      expect(fixture.decisions.length).toBeGreaterThan(0);
      expect(fixture.catalogIds.length).toBeGreaterThan(0);
      expect(fixture.negativeControl).toBeTruthy();
      expect(Boolean(fixture.targetSource)).toBe(fixture.expectedOutcome === 'migrated');
      await expect(readFile(`${repositoryRoot}/packages/migrate/${fixture.sourceEvidence}`, 'utf8')).resolves.toBeTruthy();
    }
  });

  it('links accepted targets to completed ledger rows and safe stops to the unsupported catalog', async () => {
    const ledger = JSON.parse(
      await readFile(`${repositoryRoot}/packages/rxjs/test/ported/migration-evidence-ledger.generated.json`, 'utf8')
    ) as { entries: Array<{ id: string; evidence: { status: string } }> };
    const catalog = JSON.parse(
      await readFile(`${repositoryRoot}/packages/rxjs/test/ported/unsupported-surface-catalog.json`, 'utf8')
    ) as { categories: Record<string, Array<{ id: string; disposition: string }>> };
    const ledgerById = new Map(ledger.entries.map((entry) => [entry.id, entry]));
    const catalogById = new Map(Object.values(catalog.categories).flat().map((entry) => [entry.id, entry]));

    for (const fixture of acceptedMigrationFixtures) {
      for (const ledgerId of fixture.ledgerIds) {
        expect(ledgerById.get(ledgerId)?.evidence.status, `${fixture.id}:${ledgerId}`).not.toBe('uncovered');
      }
      for (const catalogId of fixture.catalogIds) {
        expect(catalogById.has(catalogId), `${fixture.id}:${catalogId}`).toBe(true);
      }
    }

    const safeStop = acceptedMigrationFixtures.find(({ expectedOutcome }) => expectedOutcome === 'safe-stop');
    expect(safeStop).toBeDefined();
    expect(safeStop?.ledgerIds).toEqual([]);
    expect(safeStop?.catalogIds.map((id) => catalogById.get(id)?.disposition)).toEqual([
      'replace',
      'manual-review',
      'unsupported',
      'manual-review',
      'manual-review',
    ]);
  });

  for (const fixture of acceptedMigrationFixtures.filter(({ expectedOutcome }) => expectedOutcome === 'migrated')) {
    it(`${fixture.id} compiles against current public RxJS Next declarations`, () => {
      const diagnostics = typecheckEvidence({
        fileName: `accepted-${fixture.id}.ts`,
        source: fixture.targetSource!,
        paths: rxjsNextTypePaths(),
      });
      expect(formatTypecheckDiagnostics(diagnostics)).toBe('');
    });
  }

  it('keeps the cold fixture producer-per-subscription with exact Symbol construction and signal cancellation', () => {
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

  it('keeps the platform fixture shared until final cancellation and restartable afterward', () => {
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

  it('detects a cold/platform lifecycle swap in the negative control', () => {
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

  it('keeps behavior and replay state observer-local without making the Subjects cold', () => {
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
