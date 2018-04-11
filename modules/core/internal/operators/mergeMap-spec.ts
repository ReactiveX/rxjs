import { mergeMap } from './mergeMap';
import { expect } from 'chai';
import { of } from '../create/of';

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
});
