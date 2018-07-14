import { of, interval } from 'rxjs';
import { skipUntil, take } from 'rxjs/operators';
import { expect } from 'chai';

describe('skipUntil', () => {
  // NOTE(benlesh): this test is brittle until we have TestScheduler all redone.
  it('should skipUntil a notifier notifies and then start emitting values', (done: MochaDone) => {
    const results: any[] = [];

    interval(10).pipe(
      skipUntil(interval(55)),
      take(3),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() {
        results.push('done');
        expect(results).to.deep.equal([5, 6, 7, 'done']);
        done();
      }
    });

  });

  it('should provide all values if the notification happens synchronously', () => {
    const results: any[] = [];

    of(1, 2, 3, 4, 5, 6).pipe(
      skipUntil(of('blam')),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 3, 4, 5, 6, 'done']);
  });
});
