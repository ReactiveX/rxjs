import { describe, expect, it } from 'vitest';
import { ColdObservable } from '../../../rxjs/src/cold-observable.js';
import { buffer } from '../../../rxjs/src/buffer.js';
import { map } from '../../../rxjs/src/map.js';
import { mergeMap } from '../../../rxjs/src/merge-map.js';
import { collectRxjs7Sync, loadPinnedRxjs7, rxjs7Version } from './evidence.js';
import { mechanicalFixtures } from './fixtures.js';

describe('representative mechanical behavior claims', () => {
  const rxjs7 = loadPinnedRxjs7();

  it(`keeps the mapped value claim from pinned RxJS ${rxjs7Version}`, () => {
    requireClaim('map-values');
    const sourceClaim = collectRxjs7Sync(rxjs7.runtime.of(1, 2, 3).pipe(rxjs7.operators.map((value) => value + 1)));
    const targetClaim = collectSync(fromValues(1, 2, 3)[map]((value) => value + 1));
    expect(targetClaim).toEqual(sourceClaim);
  });

  it(`keeps the count-buffer value and remainder claim from pinned RxJS ${rxjs7Version}`, () => {
    requireClaim('buffer-count-values');
    const sourceClaim = collectRxjs7Sync(rxjs7.runtime.of(1, 2, 3).pipe(rxjs7.operators.bufferCount(2)));
    const targetClaim = collectSync(
      fromValues(1, 2, 3)[buffer]({ maxSize: 2, startEvery: 2, emitRemainingOnError: false })
    );
    expect(targetClaim).toEqual(sourceClaim);
  });

  it(`keeps concat-map ordering for synchronous inner work from pinned RxJS ${rxjs7Version}`, () => {
    requireClaim('concat-map-values');
    const sourceClaim = collectRxjs7Sync(
      rxjs7.runtime.of(1, 2).pipe(rxjs7.operators.concatMap((value) => rxjs7.runtime.of(value, value * 10)))
    );
    const targetClaim = collectSync(
      fromValues(1, 2)[mergeMap]((value) => fromValues(value, value * 10), { concurrent: 1 })
    );
    expect(targetClaim).toEqual(sourceClaim);
  });

  it('detects behavior drift in the negative control', () => {
    const sourceClaim = collectRxjs7Sync(rxjs7.runtime.of(1, 2, 3).pipe(rxjs7.operators.map((value) => value + 1)));
    const deliberatelyDriftedTarget = collectSync(fromValues(1, 2, 3)[map]((value) => value + 2));
    expect(deliberatelyDriftedTarget).not.toEqual(sourceClaim);
  });
});

function requireClaim(claim: NonNullable<(typeof mechanicalFixtures)[number]['behaviorClaim']>): void {
  expect(mechanicalFixtures.some(({ behaviorClaim }) => behaviorClaim === claim)).toBe(true);
}

function fromValues<T>(...values: readonly T[]): ColdObservable<T> {
  return new ColdObservable((subscriber) => {
    for (const value of values) subscriber.next(value);
    subscriber.complete();
  });
}

function collectSync<T>(source: Observable<T>): T[] {
  const values: T[] = [];
  let failure: unknown;
  source.subscribe({
    next: (value) => values.push(value),
    error: (error) => {
      failure = error;
    },
  });
  if (failure !== undefined) throw failure;
  return values;
}
