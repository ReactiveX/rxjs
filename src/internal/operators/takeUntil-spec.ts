import { of, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { expect } from 'chai';

describe('takeUntil', () => {
  // NOTE(benlesh): this test is brittle until we have TestScheduler all redone.
  it('should takeUntil a notifier notifies and complete', (done: MochaDone) => {
    const results: any[] = [];

    interval(10).pipe(
      takeUntil(interval(105)),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() {
        results.push('done');
        expect(results).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'done']);
        done();
      }
    });

  });

  it('should result in synchronous completion if notification happens synchronously', () => {
    const results: any[] = [];

    of(1, 2, 3, 4, 5, 6).pipe(
      takeUntil(of('blam')),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal(['done']);
  });
});
