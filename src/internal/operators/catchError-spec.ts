import { of } from 'rxjs/internal/create/of';
import { map } from 'rxjs/internal/operators/map';
import { catchError } from 'rxjs/internal/operators/catchError';
import { expect } from 'chai';

describe('catchError', () => {
  it('should catch an error and switch to a new observable', () => {
    const results: any[] = [];

    of(1, 2, 3, 4).pipe(
      map(x => {
        if (x === 3) throw new Error('bad');
        return x;
      }),
      catchError(err => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('bad');
        return of(42);
      }),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 42, 'done']);
  });
});
