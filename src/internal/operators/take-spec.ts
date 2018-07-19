import { of } from 'rxjs/internal/create/of';
import { take } from 'rxjs/internal/operators/take';
import { expect } from 'chai';

describe('take', () => {
  it('should take a few and complete', () => {
    const results: any[] = [];

    of(1, 2, 3, 4).pipe(
      take(3),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should complete immediately for take(0)', () => {
    const results: any[] = [];

    of(1, 2, 3, 4).pipe(
      take(0),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal(['done']);
  })
});
