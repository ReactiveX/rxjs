import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { expect } from 'chai';
import { of } from 'rxjs/internal/create/of';

describe('mergeMap', () => {
  it('should work in the basic use case', () => {
    const results: any[] = [];

    of(1, 2, 3).pipe(
      mergeMap((n, i) => of([n, i]))
    )
    .subscribe({
      next(value) { results.push(value) },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      [1, 0],
      [2, 1],
      [3, 2],
      'done',
    ]);
  });

  it('should send errors in the projection function to the subscriber', () => {
    const results: any[] = [];
    let error: Error;

    of(1, 2, 3).pipe(
      mergeMap((n, i) => {
        if (n === 2) {
          throw new Error('bad');
        }
        return of([n, i]);
      })
    )
    .subscribe({
      next(value) { results.push(value) },
      error(err) { error = err; },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      [1, 0]
    ]);
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('bad');
  });

  it('should handle early unsubscribe', () => {
    const results: any[] = [];

    of(1, 2, 3).pipe(
      mergeMap(n => of(n))
    )
    .subscribe({
      next(value, subscription) {
        results.push(value);
        if (value === 2) subscription.unsubscribe();
      },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      1,
      2,
    ]);
  });
});
